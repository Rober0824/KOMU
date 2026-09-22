-- ================================================================
-- KOMU — 10 pasajeros de ejemplo para probar el % de match
-- ================================================================
-- QUÉ HACE: crea 10 perfiles de prueba en la comunidad "Empresa Demo"
-- y calcula ya su % de coincidencia (con la fórmula real de la app,
-- src/lib/match.ts) contra TU trayecto como conductor.
--
-- ANTES DE EJECUTAR ESTO:
--   1) Asegúrate de que tu cuenta está en la comunidad "Empresa Demo"
--      (en tu perfil, o al unirte). Si estás en otra comunidad, dímelo
--      y te doy la versión ajustada.
--   2) Publica TU trayecto como conductor desde la app con estos datos
--      exactos (para que los % de abajo coincidan con lo que verás):
--        Origen:   Calle Teseo, 110, Madrid   (ya viene preseleccionado)
--        Destino:  RSI, Av. de la Industria 23, Tres Cantos  (escribe "RSI")
--        Hora:     08:00
--        Días:     Lunes a viernes (recurrente = Sí)
--   3) Solo entonces, pega y ejecuta este script completo en el
--      SQL Editor de Supabase (selecciona todo el archivo y "Run").
--
-- Es idempotente-ish: si lo ejecutas dos veces creará el doble de
-- pasajeros de prueba. Si quieres limpiarlo, guarda aparte el bloque
-- "PARA BORRAR LOS DATOS DE PRUEBA" del final.
-- ================================================================

do $$
declare
  v_community_id uuid;
  v_trip_id uuid;
  v_driver_id uuid;
  v_instance_id uuid := '00000000-0000-0000-0000-000000000000';
  r record;
begin
  select id into v_community_id from comunidad.communities where slug = 'empresademo';
  if v_community_id is null then
    raise exception 'No existe la comunidad "empresademo". Revisa el slug o dime en qué comunidad estás.';
  end if;

  -- Tu trayecto más reciente publicado en esa comunidad (el que acabas de crear).
  select t.id, t.driver_id into v_trip_id, v_driver_id
  from comunidad.trips t
  where t.community_id = v_community_id
  order by t.created_at desc
  limit 1;

  if v_trip_id is null then
    raise exception 'No encuentro ningún trayecto en "Empresa Demo". Publica primero tu trayecto (Teseo 110 -> RSI, 08:00, L-V) desde la app y luego vuelve a ejecutar este script.';
  end if;

  raise notice 'Usando el trayecto % (conductor %) para calcular las coincidencias.', v_trip_id, v_driver_id;

  -- ---- Los 10 pasajeros de prueba, con su % de match ya calculado ----
  for r in
    select * from (values
      -- email,                         nombre,             color,     rating, viajes, bio,                                                                                              score, detour_min
      ('rocio.demo@komu-test.local',    'Rocío Serrano',   '#1F5C4A', 4.9,   112, 'Vive prácticamente al lado de Teseo 110 y sale a la misma hora que tú.',                                  99, 0),
      ('maria.demo@komu-test.local',    'María López',     '#E1912F', 4.8,   64,  'Vive muy cerca de tu origen, misma hora y mismos días.',                                                  98, 1),
      ('carlos.demo@komu-test.local',   'Carlos Martín',   '#C1524B', 4.7,   38,  'Vive muy cerca, pero solo hace el trayecto lunes, miércoles y viernes.',                                   99, 0),
      ('noemi.demo@komu-test.local',    'Noemí Sánchez',   '#123D30', 4.9,   95,  'Vive muy cerca, pero sale a las 09:30 en vez de a las 08:00 (90 min de diferencia).',                      78, 1),
      ('ivan.demo@komu-test.local',     'Iván Blanco',     '#1F5C4A', 4.6,   21,  'Vive a 2 km de Teseo 110, pero indica que puede acercarse hasta 1,5 km al punto de encuentro.',           97, 1),
      ('javier.demo@komu-test.local',   'Javier Ruiz',     '#E1912F', 4.5,   17,  'Vive a 1,5 km de Teseo 110, sale 20 min más tarde que tú.',                                                86, 3),
      ('lucia.demo@komu-test.local',    'Lucía Fernández', '#C1524B', 4.8,   53,  'Vive cerca de tu origen, pero su oficina está a unos 5 km de RSI (destino distinto, mismo edificio no).', 84, 2),
      ('pablo.demo@komu-test.local',    'Pablo Díaz',      '#123D30', 4.7,   29,  'Vive a 4 km de Teseo 110, pero indica que puede acercarse hasta 2,5 km al punto de encuentro.',           91, 3),
      ('sara.demo@komu-test.local',     'Sara Gómez',      '#1F5C4A', 4.9,   80,  'Vive a 4 km de Teseo 110 y no tiene margen para acercarse más.',                                          76, 9),
      ('elena.demo@komu-test.local',    'Elena Torres',    '#E1912F', 4.6,   12,  'Vive a 6 km de Teseo 110, demasiado lejos como para que un margen razonable compense la distancia.',       71, 13)
    ) as t(email, name, avatar_color, rating, trips_count, bio, score, detour_min)
  loop
    declare
      v_user_id uuid := gen_random_uuid();
    begin
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) values (
        v_instance_id, v_user_id, 'authenticated', 'authenticated', r.email,
        crypt('komu-test-' || v_user_id::text, gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}', '{}', false,
        '', '', '', ''
      );

      insert into comunidad.profiles (id, name, avatar_color, rating, trips_count, verified, bio, community_id)
      values (v_user_id, r.name, r.avatar_color, r.rating, r.trips_count, true, r.bio, v_community_id);

      insert into comunidad.match_interactions (trip_id, passenger_id, score, detour_minutes, status)
      values (v_trip_id, v_user_id, r.score, r.detour_min, 'new');
    end;
  end loop;

  raise notice '10 pasajeros de prueba creados. Ve a "Mis coincidencias" en la app para verlos.';
end $$;

-- ================= PARA BORRAR LOS DATOS DE PRUEBA =================
-- Cuando termines de probar, esto elimina los 10 usuarios de prueba
-- (y en cascada sus perfiles y coincidencias) sin tocar nada más:
--
--   delete from auth.users where email like '%.demo@komu-test.local';
