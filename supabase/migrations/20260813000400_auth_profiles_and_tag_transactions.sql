begin;

-- Native Supabase accounts do not have a Firebase UID. Migrated accounts keep
-- their immutable mapping; new accounts leave this column null.
alter table public.private_profiles
  alter column firebase_uid drop not null;

create or replace function public.provision_user_profile(
  p_user_tag text,
  p_display_name text default '',
  p_photo_url text default ''
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  actor_email text;
  existing_profile public.profiles;
begin
  if actor is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_user_tag !~ '^[a-zA-Z0-9_]{3,30}$' then
    raise exception 'invalid user tag' using errcode = '22023';
  end if;

  select * into existing_profile
  from public.profiles
  where user_id = actor
  for update;

  if found then
    update public.profiles
      set photo_url = coalesce(p_photo_url, ''), updated_at = now()
      where user_id = actor
      returning * into existing_profile;

    insert into public.user_tags (user_tag, user_id)
      values (existing_profile.user_tag, actor)
      on conflict (user_tag) do update set user_id = excluded.user_id
      where public.user_tags.user_id = excluded.user_id;
    return existing_profile;
  end if;

  select email into actor_email from auth.users where id = actor;
  if not found then
    raise exception 'authenticated account not found' using errcode = 'P0002';
  end if;

  insert into public.private_profiles (user_id, email, display_name)
    values (actor, actor_email, nullif(p_display_name, ''))
    on conflict (user_id) do update set
      email = excluded.email,
      display_name = coalesce(excluded.display_name, public.private_profiles.display_name),
      updated_at = now();

  insert into public.profiles (user_id, user_tag, photo_url)
    values (actor, p_user_tag, coalesce(p_photo_url, ''))
    returning * into existing_profile;

  insert into public.user_tags (user_tag, user_id)
    values (p_user_tag, actor);

  return existing_profile;
end;
$$;

create or replace function public.rename_user_tag(
  p_user_tag text,
  p_photo_url text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  current_profile public.profiles;
begin
  if actor is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_user_tag !~ '^[a-zA-Z0-9_]{3,30}$' then
    raise exception 'invalid user tag' using errcode = '22023';
  end if;

  select * into current_profile
  from public.profiles
  where user_id = actor
  for update;
  if not found then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;

  if current_profile.user_tag = p_user_tag then
    update public.profiles
      set photo_url = coalesce(p_photo_url, photo_url), updated_at = now()
      where user_id = actor
      returning * into current_profile;
    return current_profile;
  end if;

  -- The FK from user_tags to profiles requires this order. All three writes
  -- remain atomic and invisible until commit, so the old public URL cannot
  -- disappear without the new reservation and profile becoming visible.
  delete from public.user_tags
    where user_tag = current_profile.user_tag and user_id = actor;
  update public.profiles
    set user_tag = p_user_tag,
        photo_url = coalesce(p_photo_url, photo_url),
        updated_at = now()
    where user_id = actor
    returning * into current_profile;
  insert into public.user_tags (user_tag, user_id)
    values (p_user_tag, actor);

  return current_profile;
end;
$$;

revoke all on function public.provision_user_profile(text, text, text) from public;
revoke all on function public.rename_user_tag(text, text) from public;
grant execute on function public.provision_user_profile(text, text, text) to authenticated;
grant execute on function public.rename_user_tag(text, text) to authenticated;

-- Browser writes must cross the collision-safe functions above. RLS still
-- governs reads, while service-role migration jobs retain their bypass.
revoke insert, update, delete on public.profiles, public.user_tags, public.private_profiles
  from anon, authenticated;
grant select on public.public_profiles to anon, authenticated;

commit;
