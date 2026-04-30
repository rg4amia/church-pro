Tu es un architecte logiciel senior spécialisé en SaaS, Next.js, Supabase et conception d’applications métier complexes.

Ta mission est de concevoir et générer une application complète de gestion d’église (web app + API + base de données) scalable, sécurisée et maintenable.

## 🎯 OBJECTIF
Créer une application de gestion pour une église évangélique permettant de gérer :
- les membres
- les cellules de prière
- les cultes
- les nouveaux convertis et visiteurs
- les départements
- les biens (inventaire)
- les rapports et statistiques

---

## 🧱 STACK TECHNIQUE
- Frontend : Next.js (App Router, TypeScript, TailwindCSS)
- Backend : Supabase (PostgreSQL + Auth + Realtime)
- Notifications : Supabase Realtime + Email/SMS (mock service)
- Hébergement : Railway ou Vercel

---

## 👥 GESTION DES RÔLES
Implémente un système RBAC :
- ADMIN
- RESPONSABLE
- MEMBRE
- VISITEUR

Chaque rôle a des permissions spécifiques (CRUD limité selon module).

---

## 🧩 MODULES À DÉVELOPPER

### 1. Membres
- CRUD membres
- Champs :
  id, nom, prénom, téléphone, email, adresse, date_naissance
  statut (membre, visiteur, nouveau_converti)
  quartier
  responsable_id
- Historique de participation

---

### 2. Cellules de prière
- CRUD cellules
- Champs :
  nom, localisation, responsable_id, jour, heure
- Enregistrement des réunions :
  date, thème, nb_hommes, nb_femmes, nb_enfants, nb_visiteurs, notes

---

### 3. Cultes
- CRUD cultes
- Types : semaine, dimanche, école du dimanche
- Champs :
  date, type, prédicateur, thème
  nb_hommes, nb_femmes, nb_enfants, nb_visiteurs
  audio_url (optionnel)

---

### 4. Nouveaux convertis / visiteurs
- Suivi d’intégration :
  date_conversion
  baptême (bool)
  cellule_id
  responsable_id
  notes

---

### 5. Départements
- CRUD départements
- Champs :
  nom, responsable_id
- Activités :
  description, date, objectifs, résultats

---

### 6. Inventaire
- CRUD biens
- Champs :
  nom, catégorie, état (bon, panne, réparation)
  localisation, date_achat, coût
- Historique des mouvements

---

### 7. Rapports & Statistiques
- Générer :
  - statistiques membres
  - participation cultes
  - activité cellules
- Graphiques (chart.js ou recharts)
- Export PDF / Excel

---

### 8. Notifications
- Rappels événements
- Alertes suivi membres
- Messages internes

---
### 9. Prédications (Sermons)

Créer un module de gestion des prédications dominicales.

#### Base de données :
Table sermons :
- id
- culte_id (relation)
- titre
- predicateur
- date
- heure
- resume
- video_url
- thumbnail_url
- created_at

#### Fonctionnalités :
- Ajouter une prédication
- Modifier / supprimer
- Lister les prédications
- Filtrer par date / prédicateur
- Recherche par mot-clé

#### Frontend :
- Page /sermons
- Lecteur vidéo intégré (YouTube iframe)
- Carte avec :
  titre, prédicateur, date, résumé

#### Bonus :
- Notifications nouvelles vidéos
- Statistiques des prédications

## 🗄️ BASE DE DONNÉES
Génère :
- Schéma SQL complet (PostgreSQL)
- Relations (foreign keys)
- Index optimisés
- Seed de test

---

## 🔐 SÉCURITÉ
- Auth Supabase
- Row Level Security (RLS)
- Validation des entrées
- Protection des routes (middleware Next.js)

---

## 🖥️ FRONTEND
Créer :
- Dashboard dynamique selon rôle
- Pages :
  /members
  /cells
  /services
  /inventory
  /reports
- UI moderne, responsive, simple (Tailwind)

---

## ⚙️ BACKEND / API
- Utiliser Supabase directement (ou API routes si nécessaire)
- Séparer logique métier (services)
- Gestion erreurs propre

---

## 🔄 TEMPS RÉEL
- Notifications en temps réel (Supabase Realtime)
- Mise à jour live des statistiques

---

## 📦 LIVRABLES ATTENDUS
1. Structure complète du projet
2. Schéma SQL
3. Code frontend (Next.js)
4. Configuration Supabase
5. Exemple de requêtes (CRUD)
6. Données mock
7. README avec instructions de déploiement

---

## ⚠️ CONTRAINTES
- Code propre et modulaire
- Typage strict (TypeScript)
- Pas de code inutile
- Respect des bonnes pratiques

---

## BONUS
- Ajouter pagination + filtres
- Recherche avancée
- Dark mode

---

Commence par :
1. Le schéma de base de données
2. Puis l’architecture du projet
3. Puis les modules un par un

Génère du code prêt à être exécuté.