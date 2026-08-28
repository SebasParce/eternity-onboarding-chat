-- Bucket privado para las fotos/videos de validación de setup. Path esperado:
-- {auth.uid()}/{archivo} — así las políticas de storage.objects pueden usar
-- el primer segmento del path para saber de quién es el archivo, sin
-- necesitar una tabla intermedia.
insert into storage.buckets (id, name, public)
values ('setup-validation', 'setup-validation', false)
on conflict (id) do nothing;

-- El creador autenticado puede subir y leer únicamente dentro de su propia
-- carpeta ({auth.uid()}/...). Nada de update/delete: un envío nuevo es un
-- archivo nuevo, se audita completo en setup_validation.
create policy "setup_validation_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'setup-validation'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "setup_validation_select_own_folder"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'setup-validation'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
