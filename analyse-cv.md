# Analyse du CV : points à améliorer et suites

Source : analyse automatique du CV (`cv/index.html` exporté en HTML). Les conseils détaillés étaient floutés (payants), le sens est déduit des débuts de phrases.

Cible visée : **IT Manager / Lead Tech**. Titre retenu : « IT Manager, responsable de l'équipe développement ».

## Points forts relevés par l'outil

- Expérience riche et diversifiée, progression claire vers des postes de responsabilité.
- Compétences techniques détaillées et à jour (IA générative, RAG).
- Projet RAG concret avec des chiffres (41 000 chunks).
- Formation initiale solide (BAC+5) et formations continues pertinentes.

## Points à améliorer

### 1. Manque de résultats chiffrés : fait

Les expériences listaient des tâches, pas des effets.

Appliqué :
- Volumétries Paris 8 : démat. 600/an, DAR 500/an, RDV étudiants 600/an, ATER 2 000 candidatures (1 200 candidats, 3 campagnes/an), SUAPS 12 000/an, scolarité (7 000 attestations, 22 000 codes d'activation de comptes numériques, 150 000 courriels en 2 mois).
- Audience : 800+ agents, 20 000+ étudiants.
- Gain de temps : ATER, productivité multipliée par 5 (estimation, soit environ 10 dossiers par jour au lieu de 2), fin des échanges par mail, suivi de qui traite quoi, réactivité auprès des demandeurs. Disponibilité 24h/24 et 7j/7.
- Celery en production depuis des années, suivi avec Flower, environ 100 000 tâches exécutées par an.
- Metabase (dataviz) : tableaux de bord pour l'équipe et les services métiers, source des volumétries. Ajouté en puce Paris 8, dans la stack et dans une ligne « Data » des compétences.

### 2. Section « Réalisations » : fait

Simple liste de noms, sans contexte ni impact. Maintenant une ligne par projet avec son résultat chiffré. Helpdesk retiré (n'existe plus).

### 3. Format dense : fait

- Titres de poste raccourcis, stack sur la ligne de l'organisme.
- Missions ESN 2014-2015 regroupées en un bloc, 1994-1998 en « Parcours antérieur ». CCI France et BusinessLine restent détaillées.
- Bloc RAG résumé en une puce (41 000 chunks).
- Format cible : 2 pages A4.

### 4. Soft skills : fait

Ajoutés de façon concrète, pas en liste de qualités :
- 2 points d'équipe par semaine, points métier, workshops techniques (IA, frameworks).
- Entretiens professionnels, congés, résolution de conflits.
- Ateliers de recueil du besoin, arbitrage des priorités, stories rédigées dans Taïga.

### 5. Absence de titre : fait

Un seul titre : « IT Manager, responsable de l'équipe développement », sous-titre « Lead tech Python / Django REST / Angular ». Les 3 lignes de missions sont fusionnées dans le profil. Le portfolio (`index.html`) garde « Responsable de l'équipe développement » seul.

## Suite

À faire :
- [ ] Relire le rendu de `cv/index.html` en aperçu et en impression PDF (2 pages A4, pas de coupure de bloc).
- [ ] Relancer l'analyse sur le site avec le CV exporté pour vérifier que les 5 remarques disparaissent.
- [ ] Commiter (voir proposition de message dans la conversation). Rien n'est commité à ce jour.
- [ ] Ajouter si possible un gain chiffré supplémentaire : délai d'une démarche avant/après, disponibilité en production, nombre de projets livrés.

Questions ouvertes :
- Gain de temps rattaché à ATER (×5) : fait. Le « 10 par jour au lieu de 2 » de la dématérialisation a été retiré.
- Regrouper aussi BusinessLine (2015-2017) dans les anciens postes ? Gardée détaillée pour son poste de responsable d'équipe.
- Reporter les volumétries dans le portfolio (`index.html`), qui a un format différent (historique de commits).
- Compétences : FastAPI passé en Backend, Celery (Flower) ajouté au détail du poste. Fait.
