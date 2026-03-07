-- ============================================================
-- Migration: Avatar from Google OAuth (picture field)
-- Google sends profile image in raw_user_meta_data->>'picture'
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username  text;
  final_username text;
  display        text;
  avatar         text;
  suffix         int := 0;
begin
  display := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  -- Avatar: Google uses "picture", some providers use "avatar_url"
  avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture'
  );

  base_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'preferred_username', split_part(new.email, '@', 1)),
    '[^a-z0-9_]', '_', 'g'
  ));
  base_username := substring(base_username, 1, 25);
  final_username := base_username;

  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || '_' || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    substring(display, 1, 50),
    avatar
  );

  return new;
end;
$$;
