# Académie

Application de gestion scolaire pour établissements privés algériens. L'interface fonctionne immédiatement en mode démonstration, sans configuration externe. Le dossier `supabase/` contient le backend de production (schéma, RLS et Edge Function).

## Démarrage local

```bash
npm install
npm run dev
```

Ouvrez `http://localhost:5173`. Les formulaires de connexion sont préremplis :

- École : `admin@eldjazair.dz` / `demo1234`
- Parent : `parent@eldjazair.dz` / `demo1234`

Ces comptes servent à parcourir la démo locale. Pour l'authentification réelle, créez les mêmes utilisateurs dans Supabase Auth.

## Configuration Supabase

1. Créez un projet Supabase.
2. Exécutez `supabase/migrations/001_initial_schema.sql` dans le SQL Editor.
3. Créez un utilisateur école dans Authentication, copiez son UUID dans `supabase/seed.sql`, puis exécutez ce seed.
4. Déployez la fonction : `supabase functions deploy create-parent`.
5. Copiez `.env.example` vers `.env.local` et renseignez :

```env
VITE_SUPABASE_URL=https://PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

La clé service-role n'est jamais exposée au client : elle reste dans l'environnement de l'Edge Function. Les parents n'ont que des politiques `SELECT`; toutes les écritures sont refusées par RLS.

## Structure

- `src/pages` — espaces administration et parent
- `src/components` — shell responsive et primitives UI
- `src/lib` — données de démonstration et utilitaires
- `supabase/migrations` — schéma, types, triggers et politiques RLS
- `supabase/functions/create-parent` — création sécurisée des comptes parents
- `supabase/seed.sql` — établissement, enseignants, parents et élèves de démonstration

## Production

```bash
npm run build
npm run preview
```

Pour brancher les vues aux données réelles, instanciez `@supabase/supabase-js` avec les deux variables Vite et remplacez progressivement les collections de `src/lib/data.ts` par les requêtes correspondantes. Le schéma et les règles de sécurité sont déjà prêts.
