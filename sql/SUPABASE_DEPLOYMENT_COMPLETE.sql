-- ============================================================================
-- SCRIPT COMPLET DE DÉPLOIEMENT SUPABASE / POSTGRESQL 15+
-- RÉSEAU DE TRANSPORT CAMEROUNAIS (RTC) — ÉCOSYSTÈME MULTI-SYSTÈMES & CRM
-- Modules : SYNSR-CAM, SYNDEC-CAM, SYNREC-CAM, SYNGESE-CAM, SYNCRM-CAM
-- ============================================================================

-- Activation des extensions requises
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. SCHÉMA CORE / IDENTITÉ & AUDIT
-- ============================================================================

-- Table des Rôles
CREATE TABLE IF NOT EXISTS public.core_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_role VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des Modules de l'écosystème
CREATE TABLE IF NOT EXISTS public.core_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_module VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(150) NOT NULL,
    description TEXT,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    periode_debut DATE,
    periode_fin DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des Utilisateurs
CREATE TABLE IF NOT EXISTS public.core_utilisateurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nom_entite VARCHAR(200) NOT NULL,
    identifiant VARCHAR(200) UNIQUE NOT NULL,
    email VARCHAR(200),
    telephone VARCHAR(50),
    role_code VARCHAR(50) NOT NULL DEFAULT 'voyageur',
    commune_attache VARCHAR(150),
    etablissement VARCHAR(200),
    statut VARCHAR(30) NOT NULL DEFAULT 'Actif',
    dernier_acces TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table du Journal d'Audit
CREATE TABLE IF NOT EXISTS public.core_journal_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    utilisateur_id UUID REFERENCES public.core_utilisateurs(id) ON DELETE SET NULL,
    module_code VARCHAR(30) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entite VARCHAR(100),
    entite_id VARCHAR(100),
    details JSONB,
    adresse_ip VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. SCHÉMA SYNCRM-CAM (GESTION DE LA RELATION CLIENT & PARTENAIRES)
-- ============================================================================

-- Table des Comptes & Entreprises (Agences, Entreprises, Écoles, Ministères)
CREATE TABLE IF NOT EXISTS public.syncrm_comptes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(200) NOT NULL,
    type_compte VARCHAR(50) NOT NULL DEFAULT 'Entreprise', -- 'Agence de Voyage', 'Entreprise', 'Institution / Ministère', 'Établissement Scolaire', 'Partenaire'
    secteur_activite VARCHAR(100),
    statut VARCHAR(50) NOT NULL DEFAULT 'Prospect', -- 'Prospect', 'Client Actif', 'Partenaire Institutionnel', 'Inactif'
    telephone VARCHAR(50),
    email VARCHAR(150),
    adresse VARCHAR(255),
    ville VARCHAR(100) DEFAULT 'Douala',
    region VARCHAR(100) DEFAULT 'Littoral',
    site_web VARCHAR(200),
    responsable_compte VARCHAR(150),
    chiffre_affaires_annuel_fcfa NUMERIC(15,2) DEFAULT 0,
    note_satisfaction NUMERIC(3,2) DEFAULT 4.5, -- Note sur 5
    tags TEXT[],
    commentaires TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des Contacts & Usagers
CREATE TABLE IF NOT EXISTS public.syncrm_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compte_id UUID REFERENCES public.syncrm_comptes(id) ON DELETE SET NULL,
    nom VARCHAR(150) NOT NULL,
    prenom VARCHAR(150),
    type_contact VARCHAR(50) NOT NULL DEFAULT 'Usager', -- 'Usager', 'Directeur / Chef d''agence', 'Représentant Légal', 'Responsable Logistique', 'Parent d''élève'
    fonction VARCHAR(150),
    email VARCHAR(150),
    telephone VARCHAR(50) NOT NULL,
    cni VARCHAR(50),
    ville VARCHAR(100) DEFAULT 'Yaoundé',
    region VARCHAR(100) DEFAULT 'Centre',
    canal_prefere VARCHAR(30) DEFAULT 'WhatsApp / SMS', -- 'WhatsApp / SMS', 'Email', 'Téléphone', 'Guichet'
    statut VARCHAR(30) NOT NULL DEFAULT 'Actif', -- 'Actif', 'Inactif', 'Prospect'
    score_engagement INT DEFAULT 70, -- Sur 100
    date_derniere_interaction TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des Opportunités Commerciales & Pipeline Partenariats
CREATE TABLE IF NOT EXISTS public.syncrm_opportunites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titre VARCHAR(255) NOT NULL,
    compte_id UUID REFERENCES public.syncrm_comptes(id) ON DELETE CASCADE,
    contact_principal_id UUID REFERENCES public.syncrm_contacts(id) ON DELETE SET NULL,
    etape VARCHAR(50) NOT NULL DEFAULT 'Prospection', -- 'Prospection', 'Qualification', 'Proposition', 'Négociation', 'Gagné', 'Perdu'
    montant_fcfa NUMERIC(15,2) NOT NULL DEFAULT 0,
    probabilite_pourcent INT NOT NULL DEFAULT 20,
    date_cloture_prevue DATE,
    responsable VARCHAR(150),
    source_lead VARCHAR(100) DEFAULT 'Portail RTC', -- 'Portail RTC', 'Recommandation', 'Campagne SMS', 'Démarchage Direct', 'Appel d''Offres'
    motif_perte TEXT,
    commentaires TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des Tickets de Support & Réclamations Usagers
CREATE TABLE IF NOT EXISTS public.syncrm_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_ticket VARCHAR(50) UNIQUE NOT NULL,
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    contact_id UUID REFERENCES public.syncrm_contacts(id) ON DELETE SET NULL,
    compte_id UUID REFERENCES public.syncrm_comptes(id) ON DELETE SET NULL,
    canal_origine VARCHAR(50) NOT NULL DEFAULT 'Web / Portail', -- 'Guichet', 'Web / Portail', 'SOS / Signalement', 'Téléphone', 'WhatsApp / SMS'
    type_demande VARCHAR(50) NOT NULL DEFAULT 'Réclamation', -- 'Réclamation', 'Assistance Technique', 'Demande d''information', 'Litige Bagage', 'Signalement'
    priorite VARCHAR(30) NOT NULL DEFAULT 'Moyenne', -- 'Basse', 'Moyenne', 'Haute', 'Urgente'
    statut VARCHAR(50) NOT NULL DEFAULT 'Nouveau', -- 'Nouveau', 'En cours', 'En attente usager', 'Résolu', 'Clôturé'
    assigne_a VARCHAR(150),
    delai_resolution_heures INT,
    solution_apportee TEXT,
    note_satisfaction_usager INT, -- Sur 5
    date_resolution TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des Interactions & Journal d'Échanges
CREATE TABLE IF NOT EXISTS public.syncrm_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_interaction VARCHAR(50) NOT NULL, -- 'Appel Téléphonique', 'Réunion / Entretien', 'Email', 'SMS / WhatsApp', 'Visite Terrain', 'Courrier Officiel'
    sujet VARCHAR(255) NOT NULL,
    details TEXT,
    contact_id UUID REFERENCES public.syncrm_contacts(id) ON DELETE CASCADE,
    compte_id UUID REFERENCES public.syncrm_comptes(id) ON DELETE SET NULL,
    opportunite_id UUID REFERENCES public.syncrm_opportunites(id) ON DELETE SET NULL,
    ticket_id UUID REFERENCES public.syncrm_tickets(id) ON DELETE SET NULL,
    auteur VARCHAR(150) NOT NULL,
    date_interaction TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action_a_suivre VARCHAR(255),
    date_echeance_action DATE,
    statut_action VARCHAR(30) DEFAULT 'À faire', -- 'À faire', 'En cours', 'Terminé'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des Campagnes de Communication (SMS, Email, Alertes)
CREATE TABLE IF NOT EXISTS public.syncrm_campagnes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(200) NOT NULL,
    type_campagne VARCHAR(50) NOT NULL DEFAULT 'SMS', -- 'SMS', 'Email', 'Alerte Portaire / Push', 'Multi-Canal'
    objectif VARCHAR(100) NOT NULL, -- 'Sensibilisation Sécurité', 'Relance Facturation', 'Offre Promotionnelle', 'Alerte Trafic'
    statut VARCHAR(30) NOT NULL DEFAULT 'Brouillon', -- 'Brouillon', 'Planifiée', 'En cours', 'Envoyée', 'Terminée'
    segment_cible VARCHAR(100) DEFAULT 'Tous les Usagers',
    message_contenu TEXT NOT NULL,
    destinataires_total INT DEFAULT 0,
    messages_envoyes INT DEFAULT 0,
    messages_delivres INT DEFAULT 0,
    taux_ouverture_pourcent NUMERIC(5,2) DEFAULT 0,
    taux_clic_pourcent NUMERIC(5,2) DEFAULT 0,
    date_envoi_prevue TIMESTAMPTZ,
    date_envoi_reelle TIMESTAMPTZ,
    budget_fcfa NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des Devis, Factures & Contrats Partenaires
CREATE TABLE IF NOT EXISTS public.syncrm_devis_factures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(50) UNIQUE NOT NULL,
    type_document VARCHAR(30) NOT NULL DEFAULT 'Facture', -- 'Devis', 'Facture', 'Reçu', 'Avoir'
    compte_id UUID REFERENCES public.syncrm_comptes(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.syncrm_contacts(id) ON DELETE SET NULL,
    opportunite_id UUID REFERENCES public.syncrm_opportunites(id) ON DELETE SET NULL,
    objet VARCHAR(255) NOT NULL,
    montant_ht_fcfa NUMERIC(15,2) NOT NULL DEFAULT 0,
    tva_pourcent NUMERIC(5,2) DEFAULT 19.25,
    montant_ttc_fcfa NUMERIC(15,2) NOT NULL DEFAULT 0,
    statut_paiement VARCHAR(30) NOT NULL DEFAULT 'En attente', -- 'Brouillon', 'Envoyé', 'Payé', 'En retard', 'Annulé'
    mode_reglement VARCHAR(50) DEFAULT 'Orange Money', -- 'Orange Money', 'MTN Mobile Money', 'Virement Bancaire', 'Espèces', 'Chèque'
    reference_transaction VARCHAR(100),
    date_emission DATE NOT NULL DEFAULT CURRENT_DATE,
    date_echeance DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    date_reglement TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. SCHÉMA SYNSR-CAM (SÉCURITÉ ROUTIÈRE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.synsr_agences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    nom_commercial VARCHAR(200) NOT NULL,
    chef_agence VARCHAR(150),
    ville VARCHAR(100) NOT NULL,
    region VARCHAR(100) DEFAULT 'Centre',
    telephone VARCHAR(50),
    statut VARCHAR(30) NOT NULL DEFAULT 'Validée',
    frais_annuel_fcfa NUMERIC(10,2) DEFAULT 2500.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.synsr_chauffeurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    nom_complet VARCHAR(150) NOT NULL,
    agence_id UUID REFERENCES public.synsr_agences(id) ON DELETE CASCADE,
    plaque VARCHAR(30) NOT NULL,
    telephone VARCHAR(50),
    permis_numero VARCHAR(50),
    nb_passagers_prevu INT DEFAULT 1,
    statut VARCHAR(30) DEFAULT 'Enregistré',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.synsr_passagers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(150) NOT NULL,
    cni VARCHAR(50),
    telephone VARCHAR(50),
    trajet VARCHAR(200),
    mode_voyage VARCHAR(30) DEFAULT 'agence',
    agence_id UUID REFERENCES public.synsr_agences(id) ON DELETE SET NULL,
    contact_urgence_nom VARCHAR(150),
    contact_urgence_tel VARCHAR(50),
    frais_fcfa NUMERIC(10,2) DEFAULT 100.00,
    statut VARCHAR(30) DEFAULT 'En route',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.synsr_voyages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    agence_id UUID REFERENCES public.synsr_agences(id) ON DELETE SET NULL,
    chauffeur_id UUID REFERENCES public.synsr_chauffeurs(id) ON DELETE SET NULL,
    ville_depart VARCHAR(100) NOT NULL,
    ville_arrivee VARCHAR(100) NOT NULL,
    date_depart TIMESTAMPTZ NOT NULL,
    statut VARCHAR(30) DEFAULT 'En cours',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.synsr_accidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    lieu VARCHAR(200) NOT NULL,
    region VARCHAR(100) NOT NULL,
    date_heure TIMESTAMPTZ NOT NULL,
    gravite VARCHAR(30) NOT NULL,
    nb_victimes INT DEFAULT 0,
    description TEXT,
    statut VARCHAR(30) DEFAULT 'Enquête ouverte',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.synsr_signalements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    type_infraction VARCHAR(100) NOT NULL,
    lieu VARCHAR(200) NOT NULL,
    plaque_immatriculation VARCHAR(50),
    date_heure TIMESTAMPTZ NOT NULL,
    description TEXT,
    statut VARCHAR(30) DEFAULT 'Transmis aux forces de l''ordre',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.synsr_alertes_sos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    emetteur_nom VARCHAR(150),
    telephone VARCHAR(50),
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    lieu_approximatif VARCHAR(200),
    type_urgence VARCHAR(100) DEFAULT 'Accident grave',
    statut VARCHAR(30) DEFAULT 'Actif',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. SCHÉMA SYNDEC-CAM (ÉTAT CIVIL)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.syndec_communes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(150) NOT NULL,
    region VARCHAR(100) NOT NULL,
    departement VARCHAR(100) NOT NULL,
    centre_etat_civil VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.syndec_declarations_naissance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(50) UNIQUE NOT NULL,
    nom_enfant VARCHAR(150) NOT NULL,
    prenom_enfant VARCHAR(150),
    sexe VARCHAR(10) NOT NULL,
    date_naissance DATE NOT NULL,
    lieu_naissance VARCHAR(150) NOT NULL,
    nom_pere VARCHAR(150),
    nom_mere VARCHAR(150) NOT NULL,
    commune VARCHAR(150) NOT NULL,
    statut VARCHAR(30) DEFAULT 'En attente de validation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.syndec_declarations_mariage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(50) UNIQUE NOT NULL,
    nom_epoux VARCHAR(150) NOT NULL,
    nom_epouse VARCHAR(150) NOT NULL,
    date_mariage DATE NOT NULL,
    regime_matrimonial VARCHAR(100),
    commune VARCHAR(150) NOT NULL,
    statut VARCHAR(30) DEFAULT 'Validé',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.syndec_declarations_deces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(50) UNIQUE NOT NULL,
    nom_defunt VARCHAR(150) NOT NULL,
    date_deces DATE NOT NULL,
    lieu_deces VARCHAR(150) NOT NULL,
    cause_deces VARCHAR(200),
    commune VARCHAR(150) NOT NULL,
    statut VARCHAR(30) DEFAULT 'Validé',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. SCHÉMA SYNREC-CAM (RECENSEMENT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.synrec_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_agent VARCHAR(30) UNIQUE NOT NULL,
    nom_complet VARCHAR(150) NOT NULL,
    telephone VARCHAR(50),
    zone_affectee VARCHAR(150),
    region VARCHAR(100),
    statut VARCHAR(30) DEFAULT 'Actif',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.synrec_menages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_menage VARCHAR(50) UNIQUE NOT NULL,
    chef_menage_nom VARCHAR(150) NOT NULL,
    region VARCHAR(100) NOT NULL,
    departement VARCHAR(100) NOT NULL,
    commune VARCHAR(100) NOT NULL,
    nb_personnes INT NOT NULL DEFAULT 1,
    type_logement VARCHAR(100),
    agent_id UUID REFERENCES public.synrec_agents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.synrec_personnes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menage_id UUID REFERENCES public.synrec_menages(id) ON DELETE CASCADE,
    nom VARCHAR(150) NOT NULL,
    prenom VARCHAR(150),
    sexe VARCHAR(10) NOT NULL,
    age INT,
    nationalite VARCHAR(100) DEFAULT 'Camerounaise',
    profession VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. SCHÉMA SYNGESE-CAM (GESTION ÉDUCATIVE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.syngese_etablissements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    type_etablissement VARCHAR(50) NOT NULL, -- 'Primaire', 'Secondaire Général', 'Technique'
    region VARCHAR(100) NOT NULL,
    departement VARCHAR(100) NOT NULL,
    ville VARCHAR(100) NOT NULL,
    directeur_nom VARCHAR(150),
    telephone VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.syngese_eleves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matricule VARCHAR(30) UNIQUE NOT NULL,
    nom VARCHAR(150) NOT NULL,
    prenom VARCHAR(150),
    sexe VARCHAR(10) NOT NULL,
    date_naissance DATE,
    etablissement_id UUID REFERENCES public.syngese_etablissements(id) ON DELETE CASCADE,
    classe VARCHAR(50) NOT NULL,
    nom_parent VARCHAR(150),
    telephone_parent VARCHAR(50),
    statut VARCHAR(30) DEFAULT 'Inscrit',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. SCHÉMA SYNGESP-CAM (GESTION HOSPITALIÈRE & PLANIFICATION DES RESSOURCES)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.syngesp_etablissements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    type_etablissement VARCHAR(100) NOT NULL, -- 'Hôpital Général', 'Hôpital Régional', 'Hôpital de District', 'CMA', 'Clinique Privée', 'Confessionnel'
    statut_juridique VARCHAR(50) DEFAULT 'Public',
    region VARCHAR(100) NOT NULL DEFAULT 'Centre',
    departement VARCHAR(100) NOT NULL DEFAULT 'Mfoundi',
    district_sante VARCHAR(100) NOT NULL,
    ville VARCHAR(100) NOT NULL DEFAULT 'Yaoundé',
    adresse VARCHAR(255),
    telephone VARCHAR(50),
    email VARCHAR(150),
    responsable VARCHAR(150),
    capacite_lits INT DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.syngesp_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etablissement_id UUID REFERENCES public.syngesp_etablissements(id) ON DELETE CASCADE,
    nom VARCHAR(150) NOT NULL,
    pole VARCHAR(100) NOT NULL DEFAULT 'Soins Critiques',
    chef_service VARCHAR(150),
    capacite_lits INT DEFAULT 20,
    lits_occupes INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.syngesp_personnel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etablissement_id UUID REFERENCES public.syngesp_etablissements(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.syngesp_services(id) ON DELETE SET NULL,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    titre VARCHAR(20) DEFAULT 'Dr.',
    categorie VARCHAR(100) NOT NULL, -- 'Médecin Spécialiste', 'Médecin Généraliste', 'Infirmier Diplômé d''État', 'Sage-femme', 'Technicien Labo', 'Pharmacien'
    specialite VARCHAR(150),
    telephone VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    type_contrat VARCHAR(100) DEFAULT 'Fonctionnaire MINSANTE',
    nb_gardes_mois INT DEFAULT 0,
    nb_gardes_max INT DEFAULT 6,
    solde_conges_jours INT DEFAULT 30,
    statut VARCHAR(30) DEFAULT 'Actif',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.syngesp_gardes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personnel_id UUID REFERENCES public.syngesp_personnel(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.syngesp_services(id) ON DELETE CASCADE,
    type_garde VARCHAR(50) NOT NULL, -- 'Garde 24 Heures', 'Garde 12 Heures Nuit', 'Garde 12 Heures Jour', 'Astreinte Opérationnelle'
    periode VARCHAR(100),
    date_garde DATE NOT NULL,
    role_garde VARCHAR(150),
    statut VARCHAR(50) DEFAULT 'Confirmée',
    remplacant_id UUID REFERENCES public.syngesp_personnel(id) ON DELETE SET NULL,
    valide_par VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.syngesp_conges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personnel_id UUID REFERENCES public.syngesp_personnel(id) ON DELETE CASCADE,
    type_conge VARCHAR(100) NOT NULL, -- 'Congé Annuel', 'Congé Maladie', 'Mission', 'Maternité'
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    nb_jours INT NOT NULL,
    motif TEXT,
    remplacant_nom VARCHAR(150),
    statut VARCHAR(50) DEFAULT 'En attente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.syngesp_patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_unique VARCHAR(50) UNIQUE NOT NULL, -- 'PAT-2026-XXXX'
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    sexe VARCHAR(10) NOT NULL,
    date_naissance DATE,
    telephone VARCHAR(50),
    ville VARCHAR(100) DEFAULT 'Yaoundé',
    groupe_sanguin VARCHAR(10),
    couverture VARCHAR(100) DEFAULT 'Couverture Santé Universelle (CSU)',
    csu_matricule VARCHAR(100),
    contact_urgence VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.syngesp_rendez_vous (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.syngesp_patients(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.syngesp_services(id) ON DELETE CASCADE,
    medecin_id UUID REFERENCES public.syngesp_personnel(id) ON DELETE SET NULL,
    date_rdv DATE NOT NULL,
    heure_rdv TIME NOT NULL,
    motif VARCHAR(255) NOT NULL,
    statut VARCHAR(50) DEFAULT 'Planifié',
    priorite VARCHAR(30) DEFAULT 'Normale',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.syngesp_lits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES public.syngesp_services(id) ON DELETE CASCADE,
    chambre VARCHAR(50) NOT NULL,
    numero_lit VARCHAR(50) NOT NULL,
    statut VARCHAR(50) DEFAULT 'Disponible', -- 'Disponible', 'Occupé', 'Réservé', 'En désinfection'
    patient_id UUID REFERENCES public.syngesp_patients(id) ON DELETE SET NULL,
    date_admission TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.syngesp_interventions_bloc (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salle_bloc VARCHAR(100) NOT NULL,
    patient_id UUID REFERENCES public.syngesp_patients(id) ON DELETE CASCADE,
    chirurgien_id UUID REFERENCES public.syngesp_personnel(id) ON DELETE SET NULL,
    anesthesiste_id UUID REFERENCES public.syngesp_personnel(id) ON DELETE SET NULL,
    type_intervention VARCHAR(255) NOT NULL,
    date_heure TIMESTAMPTZ NOT NULL,
    duree_estimee_min INT DEFAULT 60,
    statut VARCHAR(50) DEFAULT 'Programmé',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.syngesp_examens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(50) UNIQUE NOT NULL,
    patient_id UUID REFERENCES public.syngesp_patients(id) ON DELETE CASCADE,
    type_examen VARCHAR(150) NOT NULL,
    categorie VARCHAR(50) NOT NULL DEFAULT 'Laboratoire', -- 'Laboratoire', 'Imagerie Médicale'
    prescripteur VARCHAR(150),
    technicien_id UUID REFERENCES public.syngesp_personnel(id) ON DELETE SET NULL,
    statut VARCHAR(50) DEFAULT 'En cours',
    resultat TEXT,
    date_prescription TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.syngesp_pharmacie (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_dci VARCHAR(50) UNIQUE NOT NULL,
    designation VARCHAR(200) NOT NULL,
    forme VARCHAR(100) NOT NULL,
    quantite_stock INT DEFAULT 0,
    seuil_alerte INT DEFAULT 50,
    lot VARCHAR(50),
    peremption DATE,
    prix_unitaire_fcfa NUMERIC(12,2) DEFAULT 0,
    couverture_csu BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.syngesp_factures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(50) UNIQUE NOT NULL,
    patient_id UUID REFERENCES public.syngesp_patients(id) ON DELETE CASCADE,
    prestations TEXT NOT NULL,
    total_ttc_fcfa NUMERIC(15,2) NOT NULL DEFAULT 0,
    part_csu_fcfa NUMERIC(15,2) DEFAULT 0,
    ticket_moderateur_patient_fcfa NUMERIC(15,2) NOT NULL DEFAULT 0,
    statut_paiement VARCHAR(50) DEFAULT 'Payé',
    mode_reglement VARCHAR(50) DEFAULT 'Orange Money',
    reference_transaction VARCHAR(100),
    date_facture DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. FONCTIONS TRIGGERS POUR AUTO UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Application des triggers
DROP TRIGGER IF EXISTS trg_syncrm_comptes_updated_at ON public.syncrm_comptes;
CREATE TRIGGER trg_syncrm_comptes_updated_at BEFORE UPDATE ON public.syncrm_comptes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_syncrm_contacts_updated_at ON public.syncrm_contacts;
CREATE TRIGGER trg_syncrm_contacts_updated_at BEFORE UPDATE ON public.syncrm_contacts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_syncrm_opportunites_updated_at ON public.syncrm_opportunites;
CREATE TRIGGER trg_syncrm_opportunites_updated_at BEFORE UPDATE ON public.syncrm_opportunites FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_syncrm_tickets_updated_at ON public.syncrm_tickets;
CREATE TRIGGER trg_syncrm_tickets_updated_at BEFORE UPDATE ON public.syncrm_tickets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 9. SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Activation du RLS sur toutes les tables
ALTER TABLE public.core_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_journal_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.syncrm_comptes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syncrm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syncrm_opportunites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syncrm_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syncrm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syncrm_campagnes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syncrm_devis_factures ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.syngesp_etablissements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syngesp_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syngesp_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syngesp_gardes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syngesp_conges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syngesp_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syngesp_rendez_vous ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syngesp_lits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syngesp_interventions_bloc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syngesp_examens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syngesp_pharmacie ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syngesp_factures ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.synsr_agences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synsr_chauffeurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synsr_passagers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synsr_voyages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synsr_accidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synsr_signalements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synsr_alertes_sos ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.syndec_communes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syndec_declarations_naissance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syndec_declarations_mariage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syndec_declarations_deces ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.synrec_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synrec_menages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synrec_personnes ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.syngese_etablissements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syngese_eleves ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUES RLS
-- ----------------------------------------------------------------------------
-- ATTENTION — CE BLOC A ÉTÉ RÉÉCRIT POUR CORRIGER UNE FAILLE CRITIQUE.
--
-- La version précédente créait, sur les 39 tables, une politique unique :
--     FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)
-- Autrement dit : le rôle « anon » — celui de la clé anonyme publiée dans le
-- bundle JavaScript de l'application, donc connue de tout visiteur — disposait
-- des droits SELECT, INSERT, UPDATE et DELETE sur l'intégralité des données :
-- dossiers patients et résultats d'examens, numéros de CNI des passagers,
-- coordonnées GPS des alertes SOS, déclarations d'état civil, élèves mineurs
-- et leurs parents, journal d'audit (donc effaçable). Activer la RLS puis
-- l'ouvrir par USING(true) revient à ne pas l'activer du tout.
--
-- Le rôle « anon » n'a désormais AUCUN droit. Toute lecture ou écriture exige
-- une session authentifiée (auth.uid() non nul).
--
-- CONSÉQUENCE FONCTIONNELLE À CONNAÎTRE AVANT DÉPLOIEMENT : l'application se
-- connecte aujourd'hui à Supabase avec la seule clé anonyme, sans
-- authentification. Après application de ce script, la synchronisation cloud
-- ne fonctionnera plus tant que Supabase Auth n'aura pas été branché
-- (supabaseAuth.signIn existe déjà dans src/lib/supabaseClient.js mais n'est
-- appelé nulle part). C'est le comportement voulu : une base de santé
-- nationale ne peut pas rester lisible et modifiable sans authentification.
--
-- ÉTAPE SUIVANTE, indispensable : ces politiques n'appliquent pour l'instant
-- qu'un contrôle d'authentification, pas de cloisonnement par établissement,
-- commune ou zone. Il reste à restreindre chaque table au périmètre de
-- l'utilisateur (USING (etablissement_id = ...)), faute de quoi tout agent
-- authentifié lit les données de tout le pays.
-- ============================================================================

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;

DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'core_roles', 'core_modules', 'core_utilisateurs', 'core_journal_audit',
        'syncrm_comptes', 'syncrm_contacts', 'syncrm_opportunites', 'syncrm_tickets',
        'syncrm_interactions', 'syncrm_campagnes', 'syncrm_devis_factures',
        'syngesp_etablissements', 'syngesp_services', 'syngesp_personnel', 'syngesp_gardes',
        'syngesp_conges', 'syngesp_patients', 'syngesp_rendez_vous', 'syngesp_lits',
        'syngesp_interventions_bloc', 'syngesp_examens', 'syngesp_pharmacie', 'syngesp_factures',
        'synsr_agences', 'synsr_chauffeurs', 'synsr_passagers', 'synsr_voyages',
        'synsr_accidents', 'synsr_signalements', 'synsr_alertes_sos',
        'syndec_communes', 'syndec_declarations_naissance', 'syndec_declarations_mariage', 'syndec_declarations_deces',
        'synrec_agents', 'synrec_menages', 'synrec_personnes',
        'syngese_etablissements', 'syngese_eleves'
    ];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        -- Suppression de l'ancienne politique ouverte, si le script a déjà été appliqué.
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'policy_public_all_' || t, t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'policy_auth_read_' || t, t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'policy_auth_write_' || t, t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'policy_auth_update_' || t, t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'policy_auth_delete_' || t, t);

        EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL)', 'policy_auth_read_' || t, t);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL)', 'policy_auth_write_' || t, t);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL)', 'policy_auth_update_' || t, t);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL)', 'policy_auth_delete_' || t, t);
    END LOOP;
END $$;

-- Le journal d'audit n'a de valeur probante que s'il ne peut être ni modifié ni
-- effacé : il était jusqu'ici supprimable ligne par ligne, y compris anonymement.
DROP POLICY IF EXISTS policy_auth_update_core_journal_audit ON public.core_journal_audit;
DROP POLICY IF EXISTS policy_auth_delete_core_journal_audit ON public.core_journal_audit;

-- ============================================================================
-- 10. ACTIVATION DU TEMPS RÉEL (REALTIME SUPABASE)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        -- Les tables nominatives de santé ont été RETIRÉES de la publication temps réel :
        -- le Realtime respecte la RLS, mais celle-ci étant précédemment ouverte au rôle anon,
        -- n'importe qui pouvait ouvrir un WebSocket et suivre en direct les admissions de
        -- patients, les motifs de rendez-vous et les alertes SOS géolocalisées. Ne rediffuser
        -- ces tables qu'une fois un cloisonnement par établissement en place, et de préférence
        -- au travers de vues expurgées des identifiants patients.
        ALTER PUBLICATION supabase_realtime ADD TABLE
            public.syncrm_contacts,
            public.syncrm_tickets,
            public.syngesp_gardes;
    END IF;
EXCEPTION
    -- L'erreur est remontée en avertissement plutôt qu'avalée : un WHEN OTHERS THEN NULL
    -- rendait un déploiement partiel indétectable.
    WHEN OTHERS THEN RAISE WARNING 'Publication Realtime non modifiée : %', SQLERRM;
END $$;

-- ============================================================================
-- 11. DONNÉES INITIALES & DÉMONSTRATION (SEED DATA)
-- ============================================================================

-- Modules
INSERT INTO public.core_modules (code_module, libelle, description, actif) VALUES
('SYNSR', 'SYNSR-CAM', 'Système Numérique de Sécurité Routière du Cameroun', TRUE),
('SYNDEC', 'SYNDEC-CAM', 'Système Numérique de Déclaration du Cameroun (État Civil)', TRUE),
('SYNREC', 'SYNREC-CAM', 'Système Numérique du Recensement du Cameroun', TRUE),
('SYNGESE', 'SYNGESE-CAM', 'Système de Gestion du Système Éducatif du Cameroun', TRUE),
('SYNCRM', 'SYNCRM-CAM', 'Système Numérique de Relation Client & Partenariats', TRUE),
('SYNGESP', 'SYNGESP-CAM', 'Système de Gestion Hospitalière & Planification des Ressources', TRUE)
ON CONFLICT (code_module) DO NOTHING;

-- Hôpital Initial (HGY)
INSERT INTO public.syngesp_etablissements (id, code, nom, type_etablissement, statut_juridique, region, departement, district_sante, ville, telephone, email, responsable, capacite_lits) VALUES
('h1111111-1111-1111-1111-111111111111', 'HGY-001', 'Hôpital Général de Yaoundé (HGY)', 'Hôpital Général / 1ère Catégorie', 'Public', 'Centre', 'Mfoundi', 'Djoungolo', 'Yaoundé', '+237 222 21 20 18', 'direction@hgy.cm', 'Pr. Vincent de Paul Djientcheu', 350)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- FIN DU SCRIPT COMPLET DE DÉPLOIEMENT SUPABASE
-- ============================================================================

