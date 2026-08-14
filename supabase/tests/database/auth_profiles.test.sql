begin;

create extension if not exists pgtap with schema extensions;
select plan(23);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('41000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'owner-auth@example.test', '', now(), '{}', '{}', now(), now()),
  ('42000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'other-auth@example.test', '', now(), '{}', '{}', now(), now()),
  ('43000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'new-before-cutover@example.test', '', now(), '{}', '{}', now(), now());

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select throws_ok(
  $$ select public.provision_user_profile('Anon_Tag', 'Anon', '') $$,
  '42501', null, 'anonymous users cannot provision profiles'
);
select is(public.verify_auth_rollout('supabase-v1', 'auth-c4-local-test'), false,
  'the public rollout verifier is false before restricted reconciliation activation');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '43000000-0000-0000-0000-000000000003', true);
select set_config('request.jwt.claims', '{"sub":"43000000-0000-0000-0000-000000000003","role":"authenticated"}', true);
select throws_ok(
  $$ select public.provision_user_profile('Before_Cutover', 'Premature', '') $$,
  '42501', null, 'new-account tag auto-provision is disabled before reconciliation'
);
select is((select count(*) from public.profiles where user_id = '43000000-0000-0000-0000-000000000003'), 0::bigint,
  'a denied pre-cutover provision leaves no partial profile or tag');

reset role;
update public.auth_rollout_state set
  version = 'supabase-v1',
  reconciliation_marker = 'auth-c4-local-test',
  reconciled_percent = 100,
  identity_mismatches = 0,
  enabled_at = now()
where singleton;
select is(public.verify_auth_rollout('supabase-v1', 'auth-c4-local-test'), true,
  'the exact reconciled database marker activates the rollout verifier');

set local role authenticated;
select set_config('request.jwt.claim.sub', '41000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claims', '{"sub":"41000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select lives_ok(
  $$ select public.provision_user_profile('Owner_Tag_2', 'Owner', 'owner.png') $$,
  'an authenticated account can atomically provision private/public/tag rows'
);
select is((select email from public.private_profiles), 'owner-auth@example.test',
  'an owner reads their private profile');
select is((select user_tag from public.public_profiles where user_id = '41000000-0000-0000-0000-000000000001'), 'Owner_Tag_2',
  'the public profile is allowlisted and resolvable');
select is((select user_id from public.user_tags where user_tag = 'Owner_Tag_2'),
  '41000000-0000-0000-0000-000000000001'::uuid, 'the public tag reservation resolves to its owner');
select throws_ok(
  $$ insert into public.profiles (user_id, user_tag) values
     ('41000000-0000-0000-0000-000000000001', 'Bypass_Tag') $$,
  '42501', null, 'direct browser profile writes are denied'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '42000000-0000-0000-0000-000000000002', true);
select set_config('request.jwt.claims', '{"sub":"42000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
select lives_ok(
  $$ select public.provision_user_profile('Other_Tag_2', 'Other', '') $$,
  'a second account can provision a distinct tag'
);
select is((select count(*) from public.private_profiles), 1::bigint,
  'another authenticated account sees only its own private row');
select throws_ok(
  $$ select public.rename_user_tag('Owner_Tag_2', null) $$,
  '23505', null, 'tag collisions fail atomically'
);
select is((select user_tag from public.profiles where user_id = '42000000-0000-0000-0000-000000000002'), 'Other_Tag_2',
  'a collision leaves the caller profile unchanged');
select is((select user_id from public.user_tags where user_tag = 'Other_Tag_2'),
  '42000000-0000-0000-0000-000000000002'::uuid, 'a collision leaves the old reservation unchanged');
select lives_ok(
  $$ select public.rename_user_tag('Renamed_Tag', 'other-next.png') $$,
  'an owner can atomically rename their tag'
);
select is((select count(*) from public.user_tags where user_tag = 'Other_Tag_2'), 0::bigint,
  'a successful rename removes the old reservation');
select is((select user_id from public.user_tags where user_tag = 'Renamed_Tag'),
  '42000000-0000-0000-0000-000000000002'::uuid, 'a successful rename creates the new reservation');
select lives_ok(
  $$ select public.rename_user_tag('Renamed_Tag', 'same-tag.png') $$,
  'same-tag profile updates preserve the reservation'
);
select is((select count(*) from public.user_tags where user_tag = 'Renamed_Tag'), 1::bigint,
  'same-tag updates retain exactly one reservation');

reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select is((select count(*) from public.public_profiles where user_id in (
  '41000000-0000-0000-0000-000000000001', '42000000-0000-0000-0000-000000000002'
)), 2::bigint,
  'anonymous callers can enumerate only the allowlisted public profile projection');
select is((select user_id from public.public_profiles where user_tag = 'Renamed_Tag'),
  '42000000-0000-0000-0000-000000000002'::uuid,
  'anonymous stable-tag lookup resolves its public owner');
select throws_ok(
  $$ select count(*) from public.private_profiles $$,
  '42501', null, 'anonymous callers cannot read private profiles');

select * from finish();
rollback;
