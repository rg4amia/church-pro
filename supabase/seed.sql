-- -------------------------------------------------------
-- Église seed (tenant de démonstration)
-- -------------------------------------------------------
insert into public.churches (id, nom, slug)
values ('00000000-0000-0000-0000-c00000000001', 'Église Grâce Abidjan', 'grace-abidjan')
on conflict (id) do nothing;

-- -------------------------------------------------------
-- Utilisateurs auth
-- -------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated',
    'admin@gesteglise.demo',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Apôtre Jean Mensah"}',
    timezone('utc', now()), timezone('utc', now()),
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated',
    'responsable@gesteglise.demo',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Pasteur Ruth Yao"}',
    timezone('utc', now()), timezone('utc', now()),
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated',
    'membre@gesteglise.demo',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Samuel N''Guessan"}',
    timezone('utc', now()), timezone('utc', now()),
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000004',
    'authenticated', 'authenticated',
    'visiteur@gesteglise.demo',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Clarisse Amani"}',
    timezone('utc', now()), timezone('utc', now()),
    '', '', '', ''
  )
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
)
values
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    '{"sub":"a0000000-0000-0000-0000-000000000001","email":"admin@gesteglise.demo"}',
    'email', 'admin@gesteglise.demo',
    timezone('utc', now()), timezone('utc', now()), timezone('utc', now())
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    '{"sub":"a0000000-0000-0000-0000-000000000002","email":"responsable@gesteglise.demo"}',
    'email', 'responsable@gesteglise.demo',
    timezone('utc', now()), timezone('utc', now()), timezone('utc', now())
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    '{"sub":"a0000000-0000-0000-0000-000000000003","email":"membre@gesteglise.demo"}',
    'email', 'membre@gesteglise.demo',
    timezone('utc', now()), timezone('utc', now()), timezone('utc', now())
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000004',
    '{"sub":"a0000000-0000-0000-0000-000000000004","email":"visiteur@gesteglise.demo"}',
    'email', 'visiteur@gesteglise.demo',
    timezone('utc', now()), timezone('utc', now()), timezone('utc', now())
  )
on conflict (id) do nothing;

-- -------------------------------------------------------
-- Membres
-- -------------------------------------------------------
insert into public.members (
  id, nom, prenom, telephone, email, adresse, date_naissance,
  statut, quartier, responsable_id, notes, joined_at, church_id
)
values
  ('10000000-0000-0000-0000-000000000001', 'Mensah',    'Jean',    '+2250701000001', 'jean.mensah@gesteglise.demo',      'Cocody Angre 7e Tranche', '1981-02-12', 'membre',          'Angre',      null,                                         'Vision pastorale et supervision globale.',          '2010-01-10', '00000000-0000-0000-0000-c00000000001'),
  ('10000000-0000-0000-0000-000000000002', 'Yao',       'Ruth',    '+2250701000002', 'ruth.yao@gesteglise.demo',         'Yopougon Maroc',          '1987-05-02', 'membre',          'Yopougon',   '10000000-0000-0000-0000-000000000001', 'Responsable des cellules de l''ouest.',             '2015-09-14', '00000000-0000-0000-0000-c00000000001'),
  ('10000000-0000-0000-0000-000000000003', 'Konan',     'David',   '+2250701000003', 'david.konan@gesteglise.demo',      'Abobo Dokui',             '1992-07-20', 'membre',          'Abobo',      '10000000-0000-0000-0000-000000000002', 'Animateur jeunesse.',                               '2018-03-03', '00000000-0000-0000-0000-c00000000001'),
  ('10000000-0000-0000-0000-000000000004', 'Traore',    'Mariam',  '+2250701000004', 'mariam.traore@gesteglise.demo',    'Bingerville',             '1995-11-15', 'nouveau_converti', 'Bingerville','10000000-0000-0000-0000-000000000002', 'Demande de suivi baptême.',                         '2026-03-10', '00000000-0000-0000-0000-c00000000001'),
  ('10000000-0000-0000-0000-000000000005', 'Amani',     'Clarisse','+2250701000005', 'clarisse.amani@gesteglise.demo',   'Port-Bouet',              '1999-08-11', 'visiteur',        'Port-Bouet', '10000000-0000-0000-0000-000000000002', 'Visiteuse régulière depuis trois semaines.',        '2026-04-07', '00000000-0000-0000-0000-c00000000001'),
  ('10000000-0000-0000-0000-000000000006', 'N''Guessan','Samuel',  '+2250701000006', 'samuel.nguessan@gesteglise.demo',  'Plateau Dokui',           '1989-04-04', 'membre',          'Cocody',     '10000000-0000-0000-0000-000000000001', 'Chef du département média.',                        '2017-05-18', '00000000-0000-0000-0000-c00000000001'),
  ('10000000-0000-0000-0000-000000000007', 'Kouassi',   'Prisca',  '+2250701000007', 'prisca.kouassi@gesteglise.demo',   'Riviera 2',               '1991-09-28', 'membre',          'Riviera',    '10000000-0000-0000-0000-000000000006', 'Coordinatrice accueil.',                            '2019-09-01', '00000000-0000-0000-0000-c00000000001'),
  ('10000000-0000-0000-0000-000000000008', 'Adjei',     'Noah',    '+2250701000008', 'noah.adjei@gesteglise.demo',       'Songon',                  '2003-06-17', 'nouveau_converti', 'Songon',     '10000000-0000-0000-0000-000000000003', 'Intégration via jeunesse.',                         '2026-04-13', '00000000-0000-0000-0000-c00000000001')
on conflict (id) do nothing;

-- -------------------------------------------------------
-- Profils (avec church_id et rôles)
-- -------------------------------------------------------
update public.profiles
set role = 'ADMIN',       member_id = '10000000-0000-0000-0000-000000000001',
    display_name = 'Apôtre Jean Mensah',   church_id = '00000000-0000-0000-0000-c00000000001'
where user_id = 'a0000000-0000-0000-0000-000000000001';

update public.profiles
set role = 'RESPONSABLE', member_id = '10000000-0000-0000-0000-000000000002',
    display_name = 'Pasteur Ruth Yao',     church_id = '00000000-0000-0000-0000-c00000000001'
where user_id = 'a0000000-0000-0000-0000-000000000002';

update public.profiles
set role = 'MEMBRE',      member_id = '10000000-0000-0000-0000-000000000006',
    display_name = 'Samuel N''Guessan',    church_id = '00000000-0000-0000-0000-c00000000001'
where user_id = 'a0000000-0000-0000-0000-000000000003';

update public.profiles
set role = 'VISITEUR',    member_id = '10000000-0000-0000-0000-000000000005',
    display_name = 'Clarisse Amani',       church_id = '00000000-0000-0000-0000-c00000000001'
where user_id = 'a0000000-0000-0000-0000-000000000004';

-- -------------------------------------------------------
-- Cellules de prière
-- -------------------------------------------------------
insert into public.prayer_cells (id, nom, localisation, responsable_id, jour, heure, church_id)
values
  ('30000000-0000-0000-0000-000000000001', 'Cellule Bethanie', 'Yopougon Maroc', '10000000-0000-0000-0000-000000000002', 'Mardi',    '18:30', '00000000-0000-0000-0000-c00000000001'),
  ('30000000-0000-0000-0000-000000000002', 'Cellule Siloé',    'Abobo Dokui',    '10000000-0000-0000-0000-000000000003', 'Mercredi', '18:00', '00000000-0000-0000-0000-c00000000001'),
  ('30000000-0000-0000-0000-000000000003', 'Cellule Grâce',    'Riviera 2',      '10000000-0000-0000-0000-000000000007', 'Vendredi', '19:00', '00000000-0000-0000-0000-c00000000001')
on conflict (id) do nothing;

-- -------------------------------------------------------
-- Réunions de cellule
-- -------------------------------------------------------
insert into public.cell_meetings (id, cellule_id, date, theme, nb_hommes, nb_femmes, nb_enfants, nb_visiteurs, notes, church_id)
values
  ('31000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '2026-04-08', 'Persévérer dans la prière',        6, 9,  4, 2, 'Deux premières visites.',                        '00000000-0000-0000-0000-c00000000001'),
  ('31000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '2026-04-15', 'Grandir dans la parole',            8, 7,  3, 1, 'Bonne interaction jeunesse.',                    '00000000-0000-0000-0000-c00000000001'),
  ('31000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '2026-04-22', 'La fidélité dans le service',       7, 11, 5, 3, 'Suivi immédiat des visiteurs conseillé.',        '00000000-0000-0000-0000-c00000000001'),
  ('31000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000003', '2026-04-25', 'Foi et discipline spirituelle',     5, 10, 2, 2, 'Prévoir un renforcement accueil.',               '00000000-0000-0000-0000-c00000000001')
on conflict (id) do nothing;

-- -------------------------------------------------------
-- Cultes
-- -------------------------------------------------------
insert into public.worship_services (id, date, type, predicateur, theme, nb_hommes, nb_femmes, nb_enfants, nb_visiteurs, audio_url, church_id)
values
  ('40000000-0000-0000-0000-000000000001', '2026-04-06', 'dimanche',          'Apôtre Jean Mensah',      'Rallumer le feu de l''autel',       68, 93, 44, 12, null,                                                    '00000000-0000-0000-0000-c00000000001'),
  ('40000000-0000-0000-0000-000000000002', '2026-04-13', 'dimanche',          'Pasteur Ruth Yao',        'La grâce qui restaure',             72, 95, 46, 16, 'https://example.com/audio/grace-qui-restaure.mp3', '00000000-0000-0000-0000-c00000000001'),
  ('40000000-0000-0000-0000-000000000003', '2026-04-20', 'semaine',           'Fr. Samuel N''Guessan',   'Servir avec excellence',            34, 49, 12, 5,  null,                                                    '00000000-0000-0000-0000-c00000000001'),
  ('40000000-0000-0000-0000-000000000004', '2026-04-27', 'ecole_du_dimanche', 'Servante Prisca Kouassi', 'Former la prochaine génération',    21, 37, 58, 8,  null,                                                    '00000000-0000-0000-0000-c00000000001')
on conflict (id) do nothing;

-- -------------------------------------------------------
-- Suivi nouveaux convertis
-- -------------------------------------------------------
insert into public.newcomer_followups (id, member_id, date_conversion, bapteme, cellule_id, responsable_id, notes, prochain_suivi, church_id)
values
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', '2026-03-30', false, '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Prévoir entretien famille.',              '2026-05-02 16:00:00+00', '00000000-0000-0000-0000-c00000000001'),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', null,         false, '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000007', 'Invitation au parcours découverte.',      '2026-05-04 18:00:00+00', '00000000-0000-0000-0000-c00000000001'),
  ('50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000008', '2026-04-27', false, '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Très engagé, à orienter vers jeunesse.', '2026-05-01 17:30:00+00', '00000000-0000-0000-0000-c00000000001')
on conflict (id) do nothing;

-- -------------------------------------------------------
-- Départements
-- -------------------------------------------------------
insert into public.departments (id, nom, responsable_id, description, church_id)
values
  ('60000000-0000-0000-0000-000000000001', 'Accueil',  '10000000-0000-0000-0000-000000000007', 'Organisation des visiteurs, orientation et réception.',       '00000000-0000-0000-0000-c00000000001'),
  ('60000000-0000-0000-0000-000000000002', 'Jeunesse', '10000000-0000-0000-0000-000000000003', 'Encadrement et développement des jeunes de l''église.',       '00000000-0000-0000-0000-c00000000001'),
  ('60000000-0000-0000-0000-000000000003', 'Média',    '10000000-0000-0000-0000-000000000006', 'Captation, diffusion et archivage des contenus.',             '00000000-0000-0000-0000-c00000000001')
on conflict (id) do nothing;

-- -------------------------------------------------------
-- Activités de département
-- -------------------------------------------------------
insert into public.department_activities (id, departement_id, description, date, objectifs, resultats, church_id)
values
  ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'Refonte du parcours visiteurs dominical',   '2026-04-05', 'Fluidifier l''accueil et réduire le temps d''attente.',  'Temps moyen réduit de 12 min à 5 min.',           '00000000-0000-0000-0000-c00000000001'),
  ('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', 'Atelier vocation et leadership',            '2026-04-16', 'Former 25 jeunes leaders.',                              '31 participants, 9 binômes de mentorat créés.',   '00000000-0000-0000-0000-c00000000001'),
  ('70000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000003', 'Mise à niveau captation audio/vidéo',       '2026-04-18', 'Réduire les pannes et améliorer la diffusion.',          'Deux opérateurs formés, latence abaissée.',       '00000000-0000-0000-0000-c00000000001')
on conflict (id) do nothing;

-- -------------------------------------------------------
-- Inventaire
-- -------------------------------------------------------
insert into public.inventory_items (id, nom, categorie, etat, localisation, date_achat, cout, quantite, church_id)
values
  ('80000000-0000-0000-0000-000000000001', 'Table de mixage Yamaha MG12XU', 'Audio',    'bon',       'Régie principale', '2025-09-12', 320000, 1,   '00000000-0000-0000-0000-c00000000001'),
  ('80000000-0000-0000-0000-000000000002', 'Micro sans fil Shure',          'Audio',    'reparation','Atelier technique','2024-03-04', 185000, 4,   '00000000-0000-0000-0000-c00000000001'),
  ('80000000-0000-0000-0000-000000000003', 'Chaises visiteurs',             'Mobilier', 'bon',       'Salle principale', '2023-11-18', 560000, 120, '00000000-0000-0000-0000-c00000000001'),
  ('80000000-0000-0000-0000-000000000004', 'Projecteur Epson EH-TW',        'Vidéo',    'panne',     'Salle technique',  '2022-06-01', 470000, 1,   '00000000-0000-0000-0000-c00000000001')
on conflict (id) do nothing;

insert into public.inventory_movements (id, bien_id, mouvement_type, quantite, destination, commentaire, moved_at, church_id)
values
  ('81000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000002', 'maintenance', 1,  'Atelier technique', 'Interférences fréquentes.',              '2026-04-25 09:30:00+00', '00000000-0000-0000-0000-c00000000001'),
  ('81000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000004', 'sortie',      1,  'Prestataire SAV',   'Lampe grillée et bruit ventilateur.',    '2026-04-28 10:00:00+00', '00000000-0000-0000-0000-c00000000001'),
  ('81000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000003', 'entree',      20, 'Réserve accueil',   'Livraison complémentaire événement Pâques.', '2026-04-02 14:00:00+00', '00000000-0000-0000-0000-c00000000001')
on conflict (id) do nothing;

-- -------------------------------------------------------
-- Prédications
-- -------------------------------------------------------
insert into public.sermons (id, culte_id, titre, predicateur, date, heure, resume, video_url, thumbnail_url, church_id)
values
  ('90000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Rallumer le feu de l''autel', 'Apôtre Jean Mensah', '2026-04-06', '09:45', 'Un appel à restaurer la ferveur personnelle et communautaire.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', '00000000-0000-0000-0000-c00000000001'),
  ('90000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'La grâce qui restaure',       'Pasteur Ruth Yao',   '2026-04-13', '09:35', 'Comment la grâce de Dieu répare les fractures invisibles.',    'https://www.youtube.com/watch?v=ysz5S6PUM-U', 'https://img.youtube.com/vi/ysz5S6PUM-U/maxresdefault.jpg', '00000000-0000-0000-0000-c00000000001'),
  ('90000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', 'Servir avec excellence',      'Fr. Samuel N''Guessan','2026-04-20','18:20', 'Une culture de qualité au service de la mission.',            'https://www.youtube.com/watch?v=jNQXAC9IVRw', 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg', '00000000-0000-0000-0000-c00000000001')
on conflict (id) do nothing;

-- -------------------------------------------------------
-- Notifications
-- -------------------------------------------------------
insert into public.notifications (id, titre, message, type, canal, audience_role, member_id, scheduled_for, sent_at, read_at, metadata, church_id)
values
  ('91000000-0000-0000-0000-000000000001', 'Rappel cellule Bethanie',        'La réunion de cellule commence ce soir à 18h30.',    'rappel_evenement',   'realtime', null,          '10000000-0000-0000-0000-000000000004', '2026-04-29 16:30:00+00', '2026-04-29 16:30:00+00', null,                       '{"cellule":"Cellule Bethanie"}',           '00000000-0000-0000-0000-c00000000001'),
  ('91000000-0000-0000-0000-000000000002', 'Suivi visiteur prioritaire',     'Clarisse Amani doit être contactée avant jeudi.',    'alerte_suivi',       'email',    'RESPONSABLE', null,                                   '2026-04-30 10:00:00+00', null,                      null,                       '{"niveau":"prioritaire"}',                '00000000-0000-0000-0000-c00000000001'),
  ('91000000-0000-0000-0000-000000000003', 'Nouvelle prédication disponible','La vidéo ''La grâce qui restaure'' est en ligne.',   'nouvelle_predication','realtime', 'MEMBRE',      null,                                   '2026-04-14 13:15:00+00', '2026-04-14 13:15:00+00', '2026-04-14 15:00:00+00','{"sermon_id":"90000000-0000-0000-0000-000000000002"}','00000000-0000-0000-0000-c00000000001'),
  ('91000000-0000-0000-0000-000000000004', 'Brief média samedi',             'Répétition technique à 15h en salle régie.',         'message_interne',    'sms',      'RESPONSABLE', null,                                   '2026-05-02 15:00:00+00', null,                      null,                       '{"departement":"Média"}',                 '00000000-0000-0000-0000-c00000000001')
on conflict (id) do nothing;

-- -------------------------------------------------------
-- Participations
-- -------------------------------------------------------
insert into public.member_participations (id, member_id, source_type, culte_id, cellule_reunion_id, departement_activite_id, attended_at, notes, church_id)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'culte',       '40000000-0000-0000-0000-000000000001', null,                                   null,                                   '2026-04-06 09:30:00+00', 'Première participation dominicale', '00000000-0000-0000-0000-c00000000001'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'culte',       '40000000-0000-0000-0000-000000000002', null,                                   null,                                   '2026-04-13 09:15:00+00', 'Retour invité',                    '00000000-0000-0000-0000-c00000000001'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000008', 'cellule',     null,                                   '31000000-0000-0000-0000-000000000002', null,                                   '2026-04-15 18:00:00+00', 'Participation active',             '00000000-0000-0000-0000-c00000000001'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'departement', null,                                   null,                                   '70000000-0000-0000-0000-000000000002', '2026-04-16 16:00:00+00', 'Atelier jeunes',                   '00000000-0000-0000-0000-c00000000001'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 'cellule',     null,                                   '31000000-0000-0000-0000-000000000001', null,                                   '2026-04-22 18:30:00+00', 'Suivi après conversion',          '00000000-0000-0000-0000-c00000000001'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000008', 'culte',       '40000000-0000-0000-0000-000000000004', null,                                   null,                                   '2026-04-27 09:25:00+00', 'Participation + décision',        '00000000-0000-0000-0000-c00000000001')
on conflict (id) do nothing;
