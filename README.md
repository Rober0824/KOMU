# Comunidad — web app

Carpooling de confianza para comunidades cerradas (urbanizaciones, empresas, colegios, municipios).
Next.js 16 (App Router) + TypeScript + Tailwind. El mapa, la ruta y el matching viven en
`src/lib/geo.ts` y `src/lib/match.ts`, listos para conectarse a un proveedor de mapas real
(hoy usan una proyección geométrica sobre coordenadas reales de la zona de Madrid, sin tiles).

## Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

## Conectar Supabase (opcional, por ahora la app funciona con datos mock)

1. En tu proyecto de Supabase, abre el **SQL Editor** y ejecuta `supabase/schema.sql` completo.
2. Copia `.env.local.example` a `.env.local` y rellena `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` desde **Project Settings → API**.
3. `.env.local` ya está en `.gitignore`: nunca se sube a GitHub.

## Estructura

- `src/lib/geo.ts` — geografía real (coordenadas), `MapProvider`, `calculateRoute`.
- `src/lib/match.ts` — `calculateMatch` (score de compatibilidad explicable).
- `src/lib/mockData.ts` — usuarios, comunidades y trayectos de ejemplo.
- `src/lib/state.tsx` — estado global de la app (React Context).
- `src/app/**` — una carpeta por pantalla (App Router de Next.js).
- `supabase/schema.sql` — esquema de base de datos + políticas de RLS.
