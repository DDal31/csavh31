-- Function to disable trigger
create or replace function disable_handle_new_user_trigger() 
returns void as $$
begin
  alter table auth.users disable trigger on_auth_user_created;
end;
$$ language plpgsql security definer;

-- Function to enable trigger
create or replace function enable_handle_new_user_trigger() 
returns void as $$
begin
  alter table auth.users enable trigger on_auth_user_created;
end;
$$ language plpgsql security definer;