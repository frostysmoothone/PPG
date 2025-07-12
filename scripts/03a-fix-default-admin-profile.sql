/* ------------------------------------------------------------------
   Ensure the default admin profile exists and carries the username
   'admin'.  Idempotent – you can run it many times safely.
------------------------------------------------------------------- */
insert into public.profiles (id, username, role)
select
  au.id,
  'admin',
  coalesce(p.role, 'admin')
from auth.users au
left join public.profiles p on p.id = au.id
where au.email = 'admin@transferglobal.com'
on conflict (id) do update
  set username = excluded.username,
      role     = 'admin';
