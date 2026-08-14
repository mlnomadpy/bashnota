-- Provider-neutral publishing boundary. Browser callers receive only an
-- allowlisted projection; ownership and all statistics deltas are derived by
-- Postgres, never accepted from the request payload.
begin;

alter table public.published_notas alter column legacy_author_uid drop not null;
alter table public.nota_view_events drop constraint nota_view_events_referrer_format;
alter table public.nota_view_events add constraint nota_view_events_referrer_format
  check (referrer_key is null or referrer_key ~ '^[a-zA-Z0-9.-]{1,253}$');

create table public.publishing_rollout_state (
  singleton boolean primary key default true check (singleton),
  version text not null default 'firebase-v1',
  reconciliation_marker text,
  firebase_count bigint not null default 0,
  supabase_count bigint not null default 0,
  identity_mismatches bigint not null default 0,
  link_mismatches bigint not null default 0,
  metric_mismatches bigint not null default 0,
  enabled_at timestamptz
);
insert into public.publishing_rollout_state (singleton) values (true);
alter table public.publishing_rollout_state enable row level security;
revoke all on public.publishing_rollout_state from anon, authenticated;

create or replace function public.verify_publishing_rollout(p_version text, p_marker text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.publishing_rollout_state s
    where s.singleton and s.version = p_version
      and s.reconciliation_marker = p_marker and s.enabled_at is not null
      and s.firebase_count = s.supabase_count
      and s.identity_mismatches = 0 and s.link_mismatches = 0
      and s.metric_mismatches = 0
  );
$$;
revoke all on function public.verify_publishing_rollout(text, text) from public;
grant execute on function public.verify_publishing_rollout(text, text) to anon, authenticated;

create or replace function public.query_publications(
  p_id text default null,
  p_author_id uuid default null,
  p_author_tag text default null,
  p_owner_only boolean default false,
  p_limit integer default 20,
  p_before_published_at timestamptz default null,
  p_before_id text default null
) returns table (
  id text, title text, content jsonb, author_name text, author_tag text,
  is_sub_page boolean, parent_id text, published_sub_pages text[],
  published_nota_citations jsonb, tags text[], published_at timestamptz,
  updated_at timestamptz, view_count bigint, unique_viewers bigint,
  like_count bigint, dislike_count bigint, clone_count bigint,
  comment_count bigint, last_viewed_at timestamptz
) language sql stable security definer set search_path = '' as $$
  select n.id, n.title, n.content, n.author_name, p.user_tag,
    n.is_sub_page, n.parent_id,
    coalesce((select array_agg(e.child_id order by e.ordinal)
      from public.published_nota_edges e where e.parent_id = n.id), '{}'::text[]),
    n.published_nota_citations, n.tags, n.published_at, n.updated_at,
    n.view_count, n.unique_viewers, n.like_count, n.dislike_count,
    n.clone_count, n.comment_count, n.last_viewed_at
  from public.published_notas n
  left join public.profiles p on p.user_id = n.author_id
  where (p_owner_only and auth.uid() is not null and n.author_id = auth.uid()
      or not p_owner_only and n.is_public)
    and (p_id is null or n.id = p_id)
    and (p_author_id is null or n.author_id = p_author_id)
    and (p_author_tag is null or lower(p.user_tag) = lower(p_author_tag))
    and (p_owner_only or p_id is not null or not n.is_sub_page)
    and (p_before_published_at is null
      or (n.published_at, n.id) < (p_before_published_at, coalesce(p_before_id, '')))
  order by n.published_at desc, n.id desc
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;
revoke all on function public.query_publications(text,uuid,text,boolean,integer,timestamptz,text) from public;
grant execute on function public.query_publications(text,uuid,text,boolean,integer,timestamptz,text) to anon, authenticated;

create or replace function public.publish_nota(
  p_id text, p_title text, p_content jsonb, p_author_name text,
  p_is_sub_page boolean default false, p_parent_id text default null,
  p_citations jsonb default '[]'::jsonb, p_tags text[] default '{}'::text[],
  p_child_ids text[] default '{}'::text[]
) returns setof public.public_published_notas
language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); legacy_uid text; child_id text; child_ordinal integer;
begin
  if actor is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_id is null or p_id = '' or p_title is null or p_title = '' then
    raise exception 'id and title are required' using errcode = '22023';
  end if;
  if jsonb_typeof(coalesce(p_citations, '[]'::jsonb)) <> 'array' then
    raise exception 'citations must be an ordered JSON array' using errcode = '22023';
  end if;
  if p_is_sub_page <> (p_parent_id is not null) then
    raise exception 'subpage and parent must agree' using errcode = '22023';
  end if;
  if p_parent_id is not null and not exists (
    select 1 from public.published_notas where id = p_parent_id and author_id = actor
  ) then raise exception 'canonical parent not found' using errcode = '42501'; end if;

  select firebase_uid into legacy_uid from public.identity_map where supabase_user_id = actor;
  insert into public.published_notas (
    id, author_id, legacy_author_uid, title, content, author_name, is_public,
    is_sub_page, parent_id, published_nota_citations, tags, published_at, updated_at
  ) values (
    p_id, actor, legacy_uid, p_title, p_content, coalesce(p_author_name, ''), true,
    p_is_sub_page, p_parent_id, coalesce(p_citations, '[]'), coalesce(p_tags, '{}'), now(), now()
  ) on conflict (id) do update set
    title = excluded.title, content = excluded.content, author_name = excluded.author_name,
    is_public = true, is_sub_page = excluded.is_sub_page, parent_id = excluded.parent_id,
    published_nota_citations = excluded.published_nota_citations,
    tags = excluded.tags, updated_at = now()
  where public.published_notas.author_id = actor;
  if not found then raise exception 'publication owner is immutable' using errcode = '42501'; end if;

  delete from public.published_nota_edges where parent_id = p_id;
  for child_id, child_ordinal in
    select value, (ordinality - 1)::integer from unnest(coalesce(p_child_ids, '{}'))
      with ordinality as children(value, ordinality)
  loop
    insert into public.published_nota_edges(parent_id, child_id, ordinal)
      values (p_id, child_id, child_ordinal);
  end loop;
  return query select p.* from public.public_published_notas p where p.id = p_id;
end;
$$;
revoke all on function public.publish_nota(text,text,jsonb,text,boolean,text,jsonb,text[],text[]) from public;
grant execute on function public.publish_nota(text,text,jsonb,text,boolean,text,jsonb,text[],text[]) to authenticated;

create or replace function public.unpublish_nota(p_id text)
returns void language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid();
begin
  if actor is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if not exists (select 1 from public.published_notas where id = p_id and author_id = actor)
    then raise exception 'publication not found' using errcode = 'P0002'; end if;
  with recursive descendants(id) as (
    -- UNION deduplicates defensively if corrupt legacy hierarchy contains a
    -- cycle; unpublish must terminate and fail neither open nor partially.
    select p_id union
    select e.child_id from public.published_nota_edges e join descendants d on e.parent_id = d.id
  ) delete from public.published_notas n using descendants d
    where n.id = d.id and n.author_id = actor;
end;
$$;
revoke all on function public.unpublish_nota(text) from public;
grant execute on function public.unpublish_nota(text) to authenticated;

-- Publishing mutations must cross the identity-deriving RPC boundary.
revoke insert, update, delete on public.published_notas from authenticated;
revoke insert, update, delete on public.published_nota_edges from authenticated;
-- Edge writes retain their existing owner RLS + canonical-contract trigger for
-- compatibility with the task-002 editor. publish_nota remains the preferred
-- atomic replacement boundary.
grant insert, delete on public.published_nota_edges to authenticated;

create or replace function public.record_nota_view(p_nota_id text, p_referrer_key text default null)
returns table (view_count bigint, unique_viewers bigint)
language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); was_new_viewer boolean := false;
  viewed_at timestamptz := statement_timestamp();
begin
  if p_referrer_key is not null and p_referrer_key !~ '^[a-zA-Z0-9.-]{1,253}$' then
    raise exception 'invalid referrer key' using errcode = '22023';
  end if;
  perform 1 from public.published_notas where id = p_nota_id and is_public for update;
  if not found then raise exception 'published nota not found' using errcode = 'P0002'; end if;
  if actor is not null then
    insert into public.nota_viewers(nota_id,user_id,first_viewed_at)
      values(p_nota_id,actor,viewed_at) on conflict do nothing;
    was_new_viewer := found;
  end if;
  insert into public.nota_view_events(nota_id,viewer_id,occurred_at,referrer_key)
    values(p_nota_id,actor,viewed_at,p_referrer_key);
  insert into public.nota_view_aggregates(nota_id,bucket_kind,bucket_key,view_count)
    values
      (p_nota_id,'daily',to_char(viewed_at at time zone 'UTC','YYYY-MM-DD'),1),
      (p_nota_id,'weekly',to_char(viewed_at at time zone 'UTC','IYYY-IW'),1),
      (p_nota_id,'monthly',to_char(viewed_at at time zone 'UTC','YYYY-MM'),1)
    on conflict(nota_id,bucket_kind,bucket_key) do update
      set view_count = public.nota_view_aggregates.view_count + 1;
  if p_referrer_key is not null then
    insert into public.nota_view_aggregates values(p_nota_id,'referrer',p_referrer_key,1)
      on conflict(nota_id,bucket_kind,bucket_key) do update
        set view_count = public.nota_view_aggregates.view_count + 1;
  end if;
  update public.published_notas n set view_count=n.view_count+1,
    unique_viewers=n.unique_viewers+(case when was_new_viewer then 1 else 0 end),
    last_viewed_at=viewed_at where n.id=p_nota_id
    returning n.view_count,n.unique_viewers into view_count,unique_viewers;
  return next;
end;
$$;
revoke all on function public.record_nota_view(text,text) from public;
grant execute on function public.record_nota_view(text,text) to anon, authenticated;

commit;
