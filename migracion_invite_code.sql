-- ================================================================
-- KOMU — añade el código de invitación a las comunidades
-- ================================================================
-- Ejecuta esto UNA VEZ en el SQL Editor de Supabase antes de usar la
-- nueva versión de la app (el HTML de un solo archivo). No borra ni
-- toca nada existente, solo añade una columna y le pone un código a
-- las comunidades de ejemplo que ya tenías.

alter table comunidad.communities
  add column if not exists invite_code text unique;

update comunidad.communities set invite_code = 'OLIVOS-1' where slug = 'olivos' and invite_code is null;
update comunidad.communities set invite_code = 'EMPRESA-1' where slug = 'empresademo' and invite_code is null;
update comunidad.communities set invite_code = 'VILLANUEVA-1' where slug = 'villanueva' and invite_code is null;
update comunidad.communities set invite_code = 'SANJOSE-1' where slug = 'sanjose' and invite_code is null;

-- Si creas una comunidad nueva más adelante, dale también un invite_code
-- único (letras/números que quieras) para que la gente pueda unirse con él.

-- ================================================================
-- Segundo arreglo: dejar que un CONDUCTOR también pueda crear la fila
-- de "coincidencia" cuando publica su trayecto y encuentra pasajeros
-- que ya estaban buscando algo compatible (antes solo el pasajero
-- podía crear su propia coincidencia; ahora hace falta en los dos
-- sentidos, porque cualquiera de los dos puede publicar primero).
-- ================================================================
drop policy if exists "comunidad_matches_insert_driver" on comunidad.match_interactions;
create policy "comunidad_matches_insert_driver" on comunidad.match_interactions for insert
  with check (trip_id in (select id from comunidad.trips where driver_id = auth.uid()));
