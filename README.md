# GestEglise

Application de gestion d’église évangélique construite avec `Next.js 16`, `TypeScript`, `Tailwind CSS`, `Supabase` et une couche de démonstration locale pour pouvoir lancer le projet immédiatement.

## Fonctionnalités

- RBAC avec rôles `ADMIN`, `RESPONSABLE`, `MEMBRE`, `VISITEUR`
- Gestion des membres
- Gestion des cellules de prière et des réunions
- Gestion des cultes
- Suivi des nouveaux convertis et visiteurs
- Gestion des départements et activités
- Gestion de l’inventaire et des mouvements
- Rapports avec graphiques
- Export `PDF` et `Excel`
- Notifications temps réel / mock Email-SMS
- Module prédications avec vidéo YouTube intégrée
- Dark mode

## Stack

- Frontend: `Next.js App Router`
- UI: `React 19`, `Tailwind CSS 4`, `Recharts`, `Lucide`
- Backend: `Supabase Auth`, `PostgreSQL`, `RLS`, `Realtime`
- Export: `pdf-lib`, `xlsx`

## Lancement rapide

```bash
npm install
npm run dev
```

L’application démarre immédiatement en mode démo si les variables Supabase ne sont pas renseignées.

## Variables d’environnement

Copier `.env.example` vers `.env.local` puis compléter si vous voulez le mode connecté:

```bash
cp .env.example .env.local
```

Variables disponibles:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_DEMO_ROLE`

## Comptes de test Supabase

Après exécution du seed:

- `admin@gesteglise.demo` / `Password123!`
- `responsable@gesteglise.demo` / `Password123!`
- `membre@gesteglise.demo` / `Password123!`
- `visiteur@gesteglise.demo` / `Password123!`

## Base de données Supabase

Schéma principal:

- Migration: [202604291300_init.sql](/Users/stephaneamia/Documents/AEJ2026/GESTION EGLISE/supabase/migrations/202604291300_init.sql)
- Seed: [seed.sql](/Users/stephaneamia/Documents/AEJ2026/GESTION EGLISE/supabase/seed.sql)

Le schéma inclut:

- tables métier complètes
- clés étrangères
- index de performance
- vues de reporting
- triggers `updated_at`
- trigger de création de profil lors d’un nouvel utilisateur Auth
- politiques `RLS`

## Structure du projet

```text
src/
  app/
    (platform)/
      page.tsx
      members/page.tsx
      cells/page.tsx
      services/page.tsx
      newcomers/page.tsx
      departments/page.tsx
      inventory/page.tsx
      reports/page.tsx
      notifications/page.tsx
      sermons/page.tsx
    api/
      entities/[entity]/route.ts
      notifications/dispatch/route.ts
      reports/export/route.ts
    sign-in/page.tsx
  components/
    app-shell/
    auth/
    charts/
    crud/
    modules/
    providers/
    ui/
  lib/
    services/
    supabase/
    validation/
    api-client.ts
    auth.ts
    env.ts
    mock-data.ts
    navigation.ts
    permissions.ts
    realtime.ts
    types.ts
  types/
    database.ts
supabase/
  migrations/
  seed.sql
middleware.ts
```

## Architecture

- `src/lib/services/app-data.ts` centralise la lecture métier pour le dashboard et les modules.
- `src/components/modules/*` contient les écrans métier.
- `src/components/crud/crud-table.tsx` fournit le moteur CRUD réutilisable.
- `src/app/api/entities/[entity]/route.ts` sert de couche d’écriture générique vers Supabase.
- `src/lib/permissions.ts` formalise le RBAC côté application.
- `middleware.ts` protège les routes applicatives.

## Commandes utiles

```bash
npm run dev
npm run lint
npm run typecheck
npm run check
npm run build
```

## Utilisation avec Supabase

### Option 1: projet Supabase existant

1. Créez un projet Supabase
2. Ajoutez les variables `.env.local`
3. Appliquez la migration
4. Exécutez le seed

Exemple avec la CLI:

```bash
supabase db push
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

### Option 2: mode démo local

Si vous ne configurez pas Supabase:

- l’auth passe automatiquement en mode démo
- les listes sont préchargées avec les mocks
- le CRUD est stocké localement dans le navigateur

## Exemples de CRUD

### Via API Next.js

Créer un membre:

```bash
curl -X POST http://localhost:3000/api/entities/members \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "nom": "Koffi",
      "prenom": "Esther",
      "telephone": "+2250701009999",
      "email": "esther.koffi@example.com",
      "statut": "membre"
    }
  }'
```

Mettre à jour un culte:

```bash
curl -X PUT http://localhost:3000/api/entities/services \
  -H "Content-Type: application/json" \
  -d '{
    "id": "40000000-0000-0000-0000-000000000001",
    "payload": {
      "date": "2026-04-06",
      "type": "dimanche",
      "predicateur": "Apôtre Jean Mensah",
      "theme": "Rallumer le feu de l''autel",
      "nb_hommes": 68,
      "nb_femmes": 93,
      "nb_enfants": 44,
      "nb_visiteurs": 12
    }
  }'
```

Supprimer un bien:

```bash
curl -X DELETE http://localhost:3000/api/entities/inventory \
  -H "Content-Type: application/json" \
  -d '{ "id": "80000000-0000-0000-0000-000000000004" }'
```

### Directement avec Supabase JS

```ts
const { data, error } = await supabase
  .from("members")
  .select("*")
  .order("nom");
```

```ts
const { data, error } = await supabase
  .from("sermons")
  .insert({
    titre: "La foi qui bâtit",
    predicateur: "Pasteur Ruth Yao",
    date: "2026-05-04",
  })
  .select()
  .single();
```

## Déploiement

### Vercel

1. Connecter le dépôt à Vercel
2. Définir les variables d’environnement
3. Déployer

### Railway

1. Créer un service `Node`
2. Définir les mêmes variables d’environnement
3. Construire avec `npm run build`
4. Démarrer avec `npm run start`

## Vérification effectuée

- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Remarques

- Le mock de notification serveur est disponible sur `/api/notifications/dispatch`
- Les exports sont disponibles sur `/api/reports/export`
- Le mode démo permet de tester toute la navigation sans backend configuré
