begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

set local role service_role;
insert into public.firebase_migration_runs(id,source_watermark,manifest_hash,tool_version,dry_run,state)
values('test-run','fixture-watermark',repeat('a',64),'test',false,'running');
insert into public.firebase_identity_provisioning(firebase_uid,supabase_user_id,provider,provider_uid,verified_email_hash,state)
values('opaque-fixture-uid','71000000-0000-4000-8000-000000000007','email','71000000-0000-4000-8000-000000000007',repeat('9',64),'planned');
select is((select verified_email_hash from public.firebase_identity_provisioning where firebase_uid='opaque-fixture-uid'),
  repeat('9',64),'identity provisioning checkpoints contain only the verified email hash');
select is(public.reserve_firebase_migration_record('test-run',1,'legacy_nota',repeat('b',64),repeat('c',64),'{}'),
  'reserved','operator reserves one immutable source record');
select lives_ok($$ select public.complete_firebase_migration_record('legacy_nota',repeat('b',64)) $$,
  'operator finalizes the record');
select is(public.reserve_firebase_migration_record('test-run',2,'legacy_nota',repeat('b',64),repeat('c',64),'{}'),
  'already_applied','same source record is idempotent across resume');
select throws_ok($$ select public.reserve_firebase_migration_record('test-run',2,'legacy_nota',repeat('b',64),repeat('d',64),'{}') $$,
  '23505',null,'changed source hash fails closed');
select lives_ok($$ select public.append_firebase_migration_audit('test-run','{"phase":"import","status":"started"}') $$,
  'allowlisted redacted audit event appends');
select throws_ok($$ select public.append_firebase_migration_audit('test-run','{"email":"secret@example.test"}') $$,
  '22023',null,'PII-shaped unallowlisted audit field is rejected');
select throws_ok($$ update public.firebase_migration_audit set event='{}' where run_id='test-run' $$,
  '42501',null,'audit rows cannot be changed even by the operator role');
select lives_ok($$ select public.append_firebase_migration_audit('test-run','{"phase":"import","status":"checkpoint","checkpoint":2}') $$,
  'a second audit event extends the chain');
select is((select previous_hash from public.firebase_migration_audit where run_id='test-run' and sequence=2),
  (select event_hash from public.firebase_migration_audit where run_id='test-run' and sequence=1),
  'audit events form an explicit immutable hash chain');

reset role;set local role authenticated;
select throws_ok($$ select public.reserve_firebase_migration_record('test-run',3,'legacy_nota',repeat('e',64),repeat('f',64),'{}') $$,
  '42501',null,'browser role cannot reserve migration work');
select throws_ok($$ select * from public.firebase_migration_audit $$,
  '42501',null,'browser role cannot read restricted audit evidence');
select throws_ok($$ select public.reconcile_firebase_migration() $$,
  '42501',null,'browser role cannot invoke operator reconciliation');
select throws_ok($$ select * from public.firebase_identity_provisioning $$,
  '42501',null,'browser roles cannot inspect restricted identity provisioning checkpoints');
reset role;set local role anon;
select throws_ok($$ select * from public.legacy_firebase_notas $$,
  '42501',null,'anonymous role cannot read quarantined legacy notas');

select * from finish();
rollback;
