-- Restricted, resumable operator state for the Firebase backfill. Product
-- roles receive no access and task-008 rollout flags remain untouched.
begin;

create table public.legacy_firebase_notas (
  id text primary key,
  legacy_owner_uid text not null,
  payload jsonb not null,
  source_hash text not null check (source_hash ~ '^[0-9a-f]{64}$'),
  imported_at timestamptz not null default now()
);

create table public.firebase_migration_runs (
  id text primary key,
  source_watermark text not null,
  manifest_hash text not null check (manifest_hash ~ '^[0-9a-f]{64}$'),
  tool_version text not null,
  dry_run boolean not null default false,
  state text not null check (state in ('running','completed','failed','rolled-back')),
  checkpoint_sequence bigint not null default 0 check (checkpoint_sequence >= 0),
  counters jsonb not null default '{}'::jsonb check (jsonb_typeof(counters) = 'object'),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.firebase_identity_provisioning (
  firebase_uid text primary key,
  supabase_user_id uuid not null unique,
  provider text not null check (provider in ('email','google')),
  provider_uid text not null,
  verified_email_hash text not null check (verified_email_hash ~ '^[0-9a-f]{64}$'),
  state text not null check (state in ('planned','provisioned','linked')),
  created_at timestamptz not null default now(),
  unique(provider,provider_uid)
);

create table public.firebase_migration_journal (
  entity_kind text not null check (entity_kind in (
    'identity','legacy_nota','publication','publication_edge','nota_vote',
    'nota_viewer','metric_bucket','comment','comment_vote','newsletter'
  )),
  source_key_hash text not null check (source_key_hash ~ '^[0-9a-f]{64}$'),
  source_hash text not null check (source_hash ~ '^[0-9a-f]{64}$'),
  first_run_id text not null references public.firebase_migration_runs(id) on delete restrict,
  sequence bigint not null check (sequence > 0),
  target_key jsonb not null check (jsonb_typeof(target_key) = 'object'),
  state text not null check (state in ('applying','applied','failed','rolled-back')),
  attempt_count integer not null default 1 check (attempt_count > 0),
  error_class text check (error_class in ('transient','conflict','permanent')),
  applied_at timestamptz,
  primary key (entity_kind, source_key_hash),
  unique (first_run_id, sequence)
);

create table public.firebase_migration_audit (
  run_id text not null references public.firebase_migration_runs(id) on delete restrict,
  sequence bigint not null,
  previous_hash text,
  event jsonb not null check (jsonb_typeof(event) = 'object'),
  event_hash text not null check (event_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  primary key (run_id, sequence),
  unique (event_hash)
);

alter table public.legacy_firebase_notas enable row level security;
alter table public.firebase_migration_runs enable row level security;
alter table public.firebase_identity_provisioning enable row level security;
alter table public.firebase_migration_journal enable row level security;
alter table public.firebase_migration_audit enable row level security;

revoke all on public.legacy_firebase_notas, public.firebase_migration_runs, public.firebase_identity_provisioning,
  public.firebase_migration_journal, public.firebase_migration_audit from public, anon, authenticated;
grant select, insert, update, delete on public.legacy_firebase_notas to service_role;
grant select, insert, update on public.firebase_migration_runs to service_role;
grant select, insert, update on public.firebase_identity_provisioning to service_role;
grant select on public.firebase_migration_journal, public.firebase_migration_audit to service_role;
grant select, insert, update, delete on public.identity_map, public.private_profiles,
  public.profiles, public.user_tags, public.published_notas, public.published_nota_edges,
  public.nota_votes, public.nota_viewers, public.nota_view_aggregates,
  public.comments, public.comment_votes, public.newsletter_subscriptions to service_role;

create or replace function public.reserve_firebase_migration_record(
  p_run_id text, p_sequence bigint, p_entity_kind text,
  p_source_key_hash text, p_source_hash text, p_target_key jsonb
) returns text
language plpgsql security definer set search_path = '' as $$
declare existing public.firebase_migration_journal;
begin
  if not exists(select 1 from public.firebase_migration_runs r where r.id=p_run_id and r.state='running' and not r.dry_run) then
    raise exception 'migration run is not writable' using errcode='55000';
  end if;
  select * into existing from public.firebase_migration_journal j
    where j.entity_kind=p_entity_kind and j.source_key_hash=p_source_key_hash for update;
  if found then
    if existing.source_hash is distinct from p_source_hash then
      raise exception 'immutable migration source changed' using errcode='23505';
    end if;
    if existing.state='applied' then return 'already_applied'; end if;
    update public.firebase_migration_journal set attempt_count=attempt_count+1,
      first_run_id=p_run_id,sequence=p_sequence,state='applying',error_class=null
      where entity_kind=p_entity_kind and source_key_hash=p_source_key_hash;
    return 'resume';
  end if;
  insert into public.firebase_migration_journal(
    entity_kind,source_key_hash,source_hash,first_run_id,sequence,target_key,state
  ) values(p_entity_kind,p_source_key_hash,p_source_hash,p_run_id,p_sequence,p_target_key,'applying');
  return 'reserved';
end;
$$;

create or replace function public.complete_firebase_migration_record(
  p_entity_kind text,p_source_key_hash text
) returns void language plpgsql security definer set search_path='' as $$
begin
  update public.firebase_migration_journal set state='applied',applied_at=now(),error_class=null
    where entity_kind=p_entity_kind and source_key_hash=p_source_key_hash and state='applying';
  if not found then raise exception 'migration journal record is not applying' using errcode='55000'; end if;
end;
$$;

create or replace function public.fail_firebase_migration_record(
  p_entity_kind text,p_source_key_hash text,p_error_class text
) returns void language plpgsql security definer set search_path='' as $$
begin
  if p_error_class not in ('transient','conflict','permanent') then
    raise exception 'invalid migration error class' using errcode='22023';
  end if;
  update public.firebase_migration_journal set state='failed',error_class=p_error_class
    where entity_kind=p_entity_kind and source_key_hash=p_source_key_hash;
end;
$$;

create or replace function public.append_firebase_migration_audit(p_run_id text,p_event jsonb)
returns text language plpgsql security definer set search_path='' as $$
declare next_sequence bigint; prior text; result text; allowed text[] := array[
  'phase','kind','keyHash','status','attempt','errorClass','elapsedMs','count','checkpoint'
];
begin
  perform 1 from public.firebase_migration_runs where id=p_run_id for update;
  if not found then
    raise exception 'migration run not found' using errcode='P0002';
  end if;
  if exists(select 1 from jsonb_object_keys(p_event) key where not (key=any(allowed))) then
    raise exception 'audit event contains a disallowed field' using errcode='22023';
  end if;
  select coalesce(max(sequence),0)+1 into next_sequence from public.firebase_migration_audit where run_id=p_run_id;
  select event_hash into prior from public.firebase_migration_audit where run_id=p_run_id order by sequence desc limit 1 for update;
  result:=encode(extensions.digest(coalesce(prior,'')||p_run_id||next_sequence::text||p_event::text,'sha256'),'hex');
  insert into public.firebase_migration_audit(run_id,sequence,previous_hash,event,event_hash)
    values(p_run_id,next_sequence,prior,p_event,result);
  return result;
end;
$$;

create or replace function public.reconcile_firebase_migration()
returns jsonb language sql stable security definer set search_path='' as $$
  with grouped as (
    select entity_kind,count(*)::bigint as row_count,
      encode(extensions.digest(string_agg(source_hash,'' order by source_key_hash),'sha256'),'hex') as multiset_hash
    from public.firebase_migration_journal where state='applied' group by entity_kind
  ), publication_mismatches as (
    select count(*)::bigint as value
    from public.firebase_migration_journal j
    join public.published_notas n on n.id=j.target_key->>'id'
    where j.entity_kind='publication' and j.state='applied' and (
      n.view_count::text is distinct from j.target_key->'expectedCounts'->>'view_count' or
      n.unique_viewers::text is distinct from j.target_key->'expectedCounts'->>'unique_viewers' or
      n.like_count::text is distinct from j.target_key->'expectedCounts'->>'like_count' or
      n.dislike_count::text is distinct from j.target_key->'expectedCounts'->>'dislike_count' or
      n.comment_count::text is distinct from j.target_key->'expectedCounts'->>'comment_count' or
      n.clone_count::text is distinct from j.target_key->'expectedCounts'->>'clone_count'
    )
  ), comment_mismatches as (
    select count(*)::bigint as value
    from public.firebase_migration_journal j
    join public.comments c on c.id=j.target_key->>'id'
    where j.entity_kind='comment' and j.state='applied' and (
      c.like_count::text is distinct from j.target_key->'expectedCounts'->>'like_count' or
      c.dislike_count::text is distinct from j.target_key->'expectedCounts'->>'dislike_count' or
      c.reply_count::text is distinct from j.target_key->'expectedCounts'->>'reply_count'
    )
  ), integrity as (
    select
      (select count(*) from public.published_notas n left join public.identity_map i on i.supabase_user_id=n.author_id where i.supabase_user_id is null)
      +(select count(*) from public.comments c left join public.identity_map i on i.supabase_user_id=c.author_id where i.supabase_user_id is null)
      +(select count(*) from public.comments c left join public.published_notas n on n.id=c.nota_id where n.id is null)
      +(select count(*) from public.comments c left join public.comments p on p.id=c.parent_id where c.parent_id is not null and (p.id is null or p.nota_id<>c.nota_id))
      +(select count(*) from public.published_nota_edges e left join public.published_notas p on p.id=e.parent_id left join public.published_notas c on c.id=e.child_id where p.id is null or c.id is null or c.parent_id<>p.id)
      +(select count(*) from public.firebase_identity_provisioning p left join public.identity_map i on i.firebase_uid=p.firebase_uid and i.supabase_user_id=p.supabase_user_id where p.state<>'linked' or i.firebase_uid is null)
      as orphan_count,
      (select count(*) from public.published_notas n where n.is_public and not exists(select 1 from public.public_published_notas p where p.id=n.id))
      +(select count(*) from public.profiles p where not exists(select 1 from public.public_profiles v where v.user_id=p.user_id and v.user_tag=p.user_tag))
      as public_url_mismatches
  ), target_integrity as (
    select
      (select count(*) from public.firebase_migration_journal j where j.state='applied' and (
        j.entity_kind='identity' and not exists(select 1 from public.identity_map t where t.firebase_uid=j.target_key->>'firebaseUid') or
        j.entity_kind='legacy_nota' and not exists(select 1 from public.legacy_firebase_notas t where t.id=j.target_key->>'id') or
        j.entity_kind='publication' and not exists(select 1 from public.published_notas t where t.id=j.target_key->>'id') or
        j.entity_kind='publication_edge' and not exists(select 1 from public.published_nota_edges t where t.parent_id=j.target_key->>'parentId' and t.child_id=j.target_key->>'childId') or
        j.entity_kind='nota_vote' and not exists(select 1 from public.nota_votes t where t.nota_id=j.target_key->>'notaId' and t.user_id=(j.target_key->>'userId')::uuid) or
        j.entity_kind='nota_viewer' and not exists(select 1 from public.nota_viewers t where t.nota_id=j.target_key->>'notaId' and t.user_id=(j.target_key->>'userId')::uuid) or
        j.entity_kind='metric_bucket' and not exists(select 1 from public.nota_view_aggregates t where t.nota_id=j.target_key->>'notaId' and t.bucket_kind=j.target_key->>'bucketKind' and t.bucket_key=j.target_key->>'bucketKey') or
        j.entity_kind='comment' and not exists(select 1 from public.comments t where t.id=j.target_key->>'id') or
        j.entity_kind='comment_vote' and not exists(select 1 from public.comment_votes t where t.comment_id=j.target_key->>'commentId' and t.user_id=(j.target_key->>'userId')::uuid) or
        j.entity_kind='newsletter' and not exists(select 1 from public.newsletter_subscriptions t where t.user_id=(j.target_key->>'userId')::uuid)
      )) as missing_target_rows,
      (select count(*) from public.identity_map t where not exists(select 1 from public.firebase_migration_journal j where j.state='applied' and j.entity_kind='identity' and j.target_key->>'firebaseUid'=t.firebase_uid))
      +(select count(*) from public.legacy_firebase_notas t where not exists(select 1 from public.firebase_migration_journal j where j.state='applied' and j.entity_kind='legacy_nota' and j.target_key->>'id'=t.id))
      +(select count(*) from public.published_notas t where not exists(select 1 from public.firebase_migration_journal j where j.state='applied' and j.entity_kind='publication' and j.target_key->>'id'=t.id))
      +(select count(*) from public.published_nota_edges t where not exists(select 1 from public.firebase_migration_journal j where j.state='applied' and j.entity_kind='publication_edge' and j.target_key->>'parentId'=t.parent_id and j.target_key->>'childId'=t.child_id))
      +(select count(*) from public.nota_votes t where not exists(select 1 from public.firebase_migration_journal j where j.state='applied' and j.entity_kind='nota_vote' and j.target_key->>'notaId'=t.nota_id and j.target_key->>'userId'=t.user_id::text))
      +(select count(*) from public.nota_viewers t where not exists(select 1 from public.firebase_migration_journal j where j.state='applied' and j.entity_kind='nota_viewer' and j.target_key->>'notaId'=t.nota_id and j.target_key->>'userId'=t.user_id::text))
      +(select count(*) from public.nota_view_aggregates t where not exists(select 1 from public.firebase_migration_journal j where j.state='applied' and j.entity_kind='metric_bucket' and j.target_key->>'notaId'=t.nota_id and j.target_key->>'bucketKind'=t.bucket_kind and j.target_key->>'bucketKey'=t.bucket_key))
      +(select count(*) from public.comments t where not exists(select 1 from public.firebase_migration_journal j where j.state='applied' and j.entity_kind='comment' and j.target_key->>'id'=t.id))
      +(select count(*) from public.comment_votes t where not exists(select 1 from public.firebase_migration_journal j where j.state='applied' and j.entity_kind='comment_vote' and j.target_key->>'commentId'=t.comment_id and j.target_key->>'userId'=t.user_id::text))
      +(select count(*) from public.newsletter_subscriptions t where not exists(select 1 from public.firebase_migration_journal j where j.state='applied' and j.entity_kind='newsletter' and j.target_key->>'userId'=t.user_id::text))
      as unexplained_target_rows
  )
  select jsonb_build_object(
    'entities',coalesce((select jsonb_object_agg(entity_kind,jsonb_build_object('count',row_count,'hash',multiset_hash)) from grouped),'{}'::jsonb),
    'publicationCounterMismatches',(select value from publication_mismatches),
    'commentCounterMismatches',(select value from comment_mismatches),
    'orphanCount',(select orphan_count from integrity),
    'publicUrlMismatches',(select public_url_mismatches from integrity),
    'missingTargetRows',(select missing_target_rows from target_integrity),
    'unexplainedTargetRows',(select unexplained_target_rows from target_integrity),
    'cutoverDisabled',
      (select version='firebase-v1' from public.auth_rollout_state where singleton)
      and (select version='firebase-v1' from public.publishing_rollout_state where singleton)
      and (select version='firebase-v1' from public.community_rollout_state where singleton)
  );
$$;

create or replace function public.mark_firebase_migration_rolled_back(p_run_id text)
returns void language plpgsql security definer set search_path='' as $$
begin
  -- Stable identity translations are deliberately retained. They remain inert
  -- behind Firebase rollout gates and let the same manifest resume exactly.
  update public.firebase_migration_journal set state='rolled-back'
    where first_run_id=p_run_id and entity_kind<>'identity' and state in ('applying','applied','failed');
  update public.firebase_migration_runs set state='rolled-back',completed_at=now()
    where id=p_run_id;
  if not found then raise exception 'migration run not found' using errcode='P0002'; end if;
end;
$$;

create or replace function public.prevent_firebase_migration_audit_mutation()
returns trigger language plpgsql set search_path='' as $$
begin raise exception 'firebase migration audit is immutable' using errcode='55000'; end;
$$;
create trigger firebase_migration_audit_immutable before update or delete on public.firebase_migration_audit
for each row execute function public.prevent_firebase_migration_audit_mutation();

revoke all on function public.reserve_firebase_migration_record(text,bigint,text,text,text,jsonb),
  public.complete_firebase_migration_record(text,text),public.fail_firebase_migration_record(text,text,text),
  public.append_firebase_migration_audit(text,jsonb),public.reconcile_firebase_migration(),
  public.mark_firebase_migration_rolled_back(text),
  public.prevent_firebase_migration_audit_mutation() from public,anon,authenticated;
grant execute on function public.reserve_firebase_migration_record(text,bigint,text,text,text,jsonb),
  public.complete_firebase_migration_record(text,text),public.fail_firebase_migration_record(text,text,text),
  public.append_firebase_migration_audit(text,jsonb),public.reconcile_firebase_migration() to service_role;
grant execute on function public.mark_firebase_migration_rolled_back(text) to service_role;

commit;
