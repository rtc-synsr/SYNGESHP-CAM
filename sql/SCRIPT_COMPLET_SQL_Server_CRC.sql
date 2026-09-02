/* ============================================================================
   SCRIPT COMPLET — SCHÉMA DE BASE DE DONNÉES DE L'ÉCOSYSTÈME RÉSEAU DE TRANSPORT
   CAMEROUNAIS (RTC) — SYNSR-CAM · SYNDEC-CAM · SYNREC-CAM
   Moteur cible : Microsoft SQL Server 2019 ou supérieur
   Architecture : une instance, trois schémas applicatifs indépendants
                  (synsr, syndec, synrec) + un schéma commun (core) pour
                  l'identité, les rôles, les modules et l'audit.

   AVERTISSEMENT : ce script décrit l'architecture cible recommandée pour un
   déploiement de production. Le prototype actuel de l'application ne se
   connecte à aucune base de données réelle ; il utilise le stockage
   persistant du navigateur. Ce script est livré comme point de départ pour
   une équipe de développement chargée de l'industrialisation.
   ============================================================================ */

-- ============================================================================
-- 0. CRÉATION DE LA BASE ET DES SCHÉMAS
-- ============================================================================
IF DB_ID('CRC_Ecosystem') IS NULL
BEGIN
    CREATE DATABASE CRC_Ecosystem;
END
GO
USE CRC_Ecosystem;
GO

CREATE SCHEMA core;   -- Identité, rôles, audit — commun aux 3 modules
GO
CREATE SCHEMA synsr;  -- SYNSR-CAM — Sécurité routière
GO
CREATE SCHEMA syndec; -- SYNDEC-CAM — État civil
GO
CREATE SCHEMA synrec; -- SYNREC-CAM — Recensement
GO

/* ============================================================================
   1. SCHÉMA CORE — Identité, rôles et audit (commun aux 3 modules)
   ============================================================================ */

CREATE TABLE core.Roles (
    RoleId          INT IDENTITY(1,1) PRIMARY KEY,
    CodeRole        NVARCHAR(50)  NOT NULL UNIQUE,   -- ex. 'admin', 'mintrans', 'mindef', 'bunec', 'bucrep'...
    Libelle         NVARCHAR(150) NOT NULL,           -- ex. 'Administrateur système RTC'
    Description     NVARCHAR(500) NULL
);
GO

CREATE TABLE core.Modules (
    ModuleId        INT IDENTITY(1,1) PRIMARY KEY,
    CodeModule      NVARCHAR(20) NOT NULL UNIQUE,     -- 'SYNSR', 'SYNDEC', 'SYNREC'
    Libelle         NVARCHAR(150) NOT NULL,
    Actif           BIT NOT NULL DEFAULT 1,
    PeriodeDebut    DATE NULL,
    PeriodeFin      DATE NULL
);
GO

CREATE TABLE core.RoleModuleAcces (
    RoleId          INT NOT NULL REFERENCES core.Roles(RoleId),
    ModuleId        INT NOT NULL REFERENCES core.Modules(ModuleId),
    NiveauAcces     NVARCHAR(20) NOT NULL DEFAULT 'complet', -- 'complet' | 'restreint'
    PRIMARY KEY (RoleId, ModuleId)
);
GO

CREATE TABLE core.Utilisateurs (
    UtilisateurId       INT IDENTITY(1,1) PRIMARY KEY,
    NomEntite           NVARCHAR(200) NOT NULL,
    Identifiant         NVARCHAR(200) NOT NULL UNIQUE,  -- email ou téléphone
    MotDePasseHash      VARBINARY(256) NOT NULL,
    MotDePasseSel       VARBINARY(64)  NOT NULL,
    RoleId              INT NOT NULL REFERENCES core.Roles(RoleId),
    CommuneAttache      NVARCHAR(100) NULL,             -- pour les profils SYNDEC-CAM territoriaux
    Statut              NVARCHAR(20) NOT NULL DEFAULT 'Actif', -- Actif | Suspendu
    ChangementMdpRequis BIT NOT NULL DEFAULT 1,
    DateCreation        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    DerniereConnexion   DATETIME2 NULL
);
GO
CREATE INDEX IX_Utilisateurs_RoleId ON core.Utilisateurs(RoleId);
GO

CREATE TABLE core.JournalAudit (
    AuditId         BIGINT IDENTITY(1,1) PRIMARY KEY,
    UtilisateurId   INT NULL REFERENCES core.Utilisateurs(UtilisateurId),
    ModuleId        INT NULL REFERENCES core.Modules(ModuleId),
    Action          NVARCHAR(100) NOT NULL,             -- 'Connexion', 'Création', 'Modification', 'Suppression'...
    Entite          NVARCHAR(100) NULL,                 -- table/objet concerné
    EntiteId        NVARCHAR(50)  NULL,
    Detail          NVARCHAR(MAX) NULL,
    AdresseIP       NVARCHAR(45)  NULL,
    Horodatage      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX IX_JournalAudit_Utilisateur ON core.JournalAudit(UtilisateurId, Horodatage DESC);
GO

/* ============================================================================
   2. SCHÉMA SYNSR — Sécurité routière (SYNSR-CAM, anciennement SSRN)
   ============================================================================ */

CREATE TABLE synsr.Agences (
    AgenceId        INT IDENTITY(1,1) PRIMARY KEY,
    Code            NVARCHAR(20) NOT NULL UNIQUE,       -- 'AG-0091'
    NomCommercial   NVARCHAR(200) NOT NULL,
    ChefAgence      NVARCHAR(150) NULL,                 -- Nom complet du chef d'agence, responsable désigné
    Ville           NVARCHAR(100) NOT NULL,
    Statut          NVARCHAR(20) NOT NULL DEFAULT 'En attente', -- Validée | En attente | Suspendue
    FraisAnnuelFCFA DECIMAL(10,2) NOT NULL DEFAULT 2500.00, -- Frais d'enregistrement annuel, payable Orange Money / MTN Money
    DateCreation    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- Un chauffeur d'agence s'enregistre avant chaque voyage — distinct de l'enregistrement permanent
-- du véhicule particulier. Une agence peut avoir plusieurs chauffeurs, mais un chauffeur n'appartient
-- qu'à une seule agence (AgenceId NOT NULL, jamais nullable).
CREATE TABLE synsr.ChauffeursAgence (
    ChauffeurAgenceId  INT IDENTITY(1,1) PRIMARY KEY,
    Code               NVARCHAR(20) NOT NULL UNIQUE,       -- 'CHA-3021'
    NomComplet         NVARCHAR(150) NOT NULL,
    AgenceId           INT NOT NULL REFERENCES synsr.Agences(AgenceId), -- 1 chauffeur -> exactement 1 agence
    Plaque             NVARCHAR(30) NOT NULL,
    NbPassagersPrevu   INT NOT NULL DEFAULT 1,
    Telephone          NVARCHAR(30) NULL,
    Destination        NVARCHAR(100) NULL,
    Statut             NVARCHAR(20) NOT NULL DEFAULT 'Enregistré',
    FraisEnregistrementFCFA DECIMAL(10,2) NOT NULL DEFAULT 100.00, -- Payable Orange Money / MTN Money
    CreeParUtilisateurId INT NULL REFERENCES core.Utilisateurs(UtilisateurId),
    DateEnregistrement DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE synsr.Passagers (
    PassagerId      INT IDENTITY(1,1) PRIMARY KEY,
    Code            NVARCHAR(20) NOT NULL UNIQUE,
    Nom             NVARCHAR(150) NOT NULL,
    CNI             NVARCHAR(30)  NULL,
    Telephone       NVARCHAR(30)  NULL,
    DateNaissance   DATE NULL,
    ContactUrgenceNom NVARCHAR(150) NULL,
    ContactUrgenceTel NVARCHAR(30)  NULL,
    FraisEnregistrementFCFA DECIMAL(10,2) NOT NULL DEFAULT 100.00, -- Frais d'enregistrement voyageur, payable Orange Money / MTN Money
    Trajet          NVARCHAR(200) NULL,
    ModeVoyage      NVARCHAR(20) NOT NULL DEFAULT 'agence', -- agence | covoiturage
    AgenceId        INT NULL REFERENCES synsr.Agences(AgenceId),               -- renseigné si ModeVoyage = 'agence'
    VoyageId        INT NULL,                                                  -- un passager -> AU PLUS un seul voyage (FK ajoutée après création de Voyages, voir plus bas)
    ChauffeurAgenceId INT NULL REFERENCES synsr.ChauffeursAgence(ChauffeurAgenceId), -- renseigné si ModeVoyage = 'agence'
    VehiculeId      INT NULL,                                                 -- renseigné si ModeVoyage = 'covoiturage' (FK ajoutée après création de Vehicules, voir plus bas)
    CreeParUtilisateurId INT NULL REFERENCES core.Utilisateurs(UtilisateurId),
    Statut          NVARCHAR(20) NOT NULL DEFAULT 'En route'
);
GO

CREATE TABLE synsr.Vehicules (
    VehiculeId      INT IDENTITY(1,1) PRIMARY KEY,
    Code            NVARCHAR(20) NOT NULL UNIQUE,
    Conducteur      NVARCHAR(150) NOT NULL,
    Immatriculation NVARCHAR(30)  NOT NULL,
    Type            NVARCHAR(50)  NULL,
    Places          INT NULL,
    VilleDepart     NVARCHAR(100) NULL,
    VilleArrivee    NVARCHAR(100) NULL,
    VilleResidence  NVARCHAR(100) NULL,
    Quartier        NVARCHAR(150) NULL,
    ContactUrgenceNom NVARCHAR(150) NULL,
    ContactUrgenceTel NVARCHAR(30)  NULL,
    Telephone       NVARCHAR(30)  NULL,
    Rattachement    NVARCHAR(20) NOT NULL DEFAULT 'Particulier', -- Particulier | Agence
    AgenceRattacheeId INT NULL REFERENCES synsr.Agences(AgenceId), -- Renseigné uniquement si Rattachement = 'Agence'
    FraisEnregistrementFCFA DECIMAL(10,2) NOT NULL DEFAULT 100.00 -- Frais d'enregistrement chauffeur, payable Orange Money / MTN Money
);
GO

-- Contrainte différée : un passager en mode covoiturage est rattaché à un véhicule particulier
ALTER TABLE synsr.Passagers ADD CONSTRAINT FK_Passagers_Vehicule FOREIGN KEY (VehiculeId) REFERENCES synsr.Vehicules(VehiculeId);
GO

CREATE TABLE synsr.Voyages (
    VoyageId        INT IDENTITY(1,1) PRIMARY KEY,
    Code            NVARCHAR(20) NOT NULL UNIQUE,
    AgenceId        INT NULL REFERENCES synsr.Agences(AgenceId),
    ChauffeurAgenceId INT NULL REFERENCES synsr.ChauffeursAgence(ChauffeurAgenceId), -- enregistrement du chauffeur pour ce voyage précis
    Chauffeur       NVARCHAR(150) NULL,                  -- dénormalisé pour affichage rapide
    VehiculeId      INT NULL REFERENCES synsr.Vehicules(VehiculeId),
    Trajet          NVARCHAR(200) NOT NULL,
    HeureDepart     DATETIME2 NULL,
    Passagers       INT NOT NULL DEFAULT 0,
    CreeParUtilisateurId INT NULL REFERENCES core.Utilisateurs(UtilisateurId),
    Statut          NVARCHAR(20) NOT NULL DEFAULT 'Prévu' -- Prévu | En cours | Terminé | Annulé
);
GO

-- Contrainte différée : un passager appartient à au plus un seul voyage (1 voyage -> 1 ou plusieurs passagers)
ALTER TABLE synsr.Passagers ADD CONSTRAINT FK_Passagers_Voyage FOREIGN KEY (VoyageId) REFERENCES synsr.Voyages(VoyageId);
GO

CREATE TABLE synsr.Accidents (
    AccidentId      INT IDENTITY(1,1) PRIMARY KEY,
    Code            NVARCHAR(20) NOT NULL UNIQUE,
    EvenementId     NVARCHAR(30) NULL,                  -- lien avec Signalements (anti-doublon)
    DateAccident    DATE NOT NULL,
    Lieu            NVARCHAR(200) NOT NULL,
    AgenceId        INT NULL REFERENCES synsr.Agences(AgenceId),
    VoyageId        INT NULL REFERENCES synsr.Voyages(VoyageId), -- le voyage au cours duquel l'accident est survenu
    Blesses         INT NOT NULL DEFAULT 0,
    BlessesGraves   INT NOT NULL DEFAULT 0,
    Deces           INT NOT NULL DEFAULT 0,
    Cause           NVARCHAR(200) NULL,
    CreeParUtilisateurId INT NULL REFERENCES core.Utilisateurs(UtilisateurId),
    Statut          NVARCHAR(20) NOT NULL DEFAULT 'Ouvert' -- Ouvert | Résolu | Clôturé
);
GO

-- Table de jonction : un voyage peut avoir 1 ou plusieurs accidentés, et un accident peut concerner
-- 1 ou plusieurs voyageurs/passagers (relation plusieurs-à-plusieurs).
CREATE TABLE synsr.AccidentsVictimes (
    AccidentId      INT NOT NULL REFERENCES synsr.Accidents(AccidentId),
    PassagerId      INT NOT NULL REFERENCES synsr.Passagers(PassagerId),
    TypeVictime     NVARCHAR(20) NOT NULL DEFAULT 'Blessé', -- Blessé | Blessé grave | Décédé
    PRIMARY KEY (AccidentId, PassagerId)
);
GO

-- Recherches & enquêtes : liées aux agences, voyages, passagers, véhicules particuliers, chauffeurs
-- particuliers (Vehicules), accidents, signalements et alertes SOS — chaque colonne de rattachement
-- est nullable, une même enquête pouvant ne concerner qu'une partie de ces entités.
CREATE TABLE synsr.RecherchesEnquetes (
    EnqueteId       INT IDENTITY(1,1) PRIMARY KEY,
    Code            NVARCHAR(20) NOT NULL UNIQUE,        -- 'ENQ-0001'
    Objet           NVARCHAR(300) NOT NULL,
    AgenceId        INT NULL REFERENCES synsr.Agences(AgenceId),
    VoyageId        INT NULL REFERENCES synsr.Voyages(VoyageId),
    PassagerId      INT NULL REFERENCES synsr.Passagers(PassagerId),
    VehiculeId      INT NULL REFERENCES synsr.Vehicules(VehiculeId),         -- chauffeur particulier concerné
    AccidentId      INT NULL REFERENCES synsr.Accidents(AccidentId),
    SignalementId   INT NULL,                                                -- FK ajoutée après création de Signalements (voir plus bas)
    AlerteSOSId     INT NULL,                                                -- FK ajoutée après création d'AlertesSOS (voir plus bas)
    EnqueteurUtilisateurId INT NULL REFERENCES core.Utilisateurs(UtilisateurId), -- DGSN / Gendarmerie / MINDEF ayant ouvert l'enquête
    Statut          NVARCHAR(20) NOT NULL DEFAULT 'Ouverte', -- Ouverte | En cours | Clôturée
    DateOuverture   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE synsr.Signalements (
    SignalementId   INT IDENTITY(1,1) PRIMARY KEY,
    Reference       NVARCHAR(20) NOT NULL UNIQUE,
    EvenementId     NVARCHAR(30) NULL,
    Type            NVARCHAR(50) NOT NULL,               -- Viol | Vol | Violence conjugale | Accident | Autres
    Lieu            NVARCHAR(200) NULL,
    DateSignalement DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Classification  NVARCHAR(50) NULL,
    TransmisA       NVARCHAR(100) NULL,                  -- DGSN, Gendarmerie...
    FraisFCFA       DECIMAL(10,2) NOT NULL DEFAULT 100.00 -- Payable Orange Money / MTN Money
);
GO

CREATE TABLE synsr.AlertesSOS (
    AlerteId        INT IDENTITY(1,1) PRIMARY KEY,
    Reference       NVARCHAR(20) NOT NULL UNIQUE,
    Type            NVARCHAR(50) NOT NULL,               -- Accident, Braquage, Véhicule en panne...
    VoyageId        INT NULL REFERENCES synsr.Voyages(VoyageId),
    PassagerId      INT NULL REFERENCES synsr.Passagers(PassagerId),
    Latitude        DECIMAL(9,6) NULL,
    Longitude       DECIMAL(9,6) NULL,
    DateEnvoi       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Statut          NVARCHAR(30) NOT NULL DEFAULT 'Nouvelle', -- Nouvelle | En cours de traitement | Intervention effectuée | Clôturée | Fausse alerte
    AutoriteAssignee NVARCHAR(50) NULL                    -- Gendarmerie | DGSN
);
GO
CREATE INDEX IX_AlertesSOS_Statut ON synsr.AlertesSOS(Statut);
GO

-- Contraintes différées sur RecherchesEnquetes (tables Signalements et AlertesSOS désormais créées)
ALTER TABLE synsr.RecherchesEnquetes ADD CONSTRAINT FK_Enquetes_Signalement FOREIGN KEY (SignalementId) REFERENCES synsr.Signalements(SignalementId);
ALTER TABLE synsr.RecherchesEnquetes ADD CONSTRAINT FK_Enquetes_AlerteSOS FOREIGN KEY (AlerteSOSId) REFERENCES synsr.AlertesSOS(AlerteId);
GO

CREATE TABLE synsr.Notifications (
    NotificationId  INT IDENTITY(1,1) PRIMARY KEY,
    Destinataire    NVARCHAR(200) NOT NULL,
    Canal           NVARCHAR(20) NOT NULL DEFAULT 'SMS',  -- SMS | Email | Push
    Sujet           NVARCHAR(200) NULL,
    Contenu         NVARCHAR(MAX) NULL,
    Statut          NVARCHAR(20) NOT NULL DEFAULT 'Envoyée', -- Envoyée | Échouée | En attente
    DateEnvoi       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE synsr.Employes (
    EmployeId       INT IDENTITY(1,1) PRIMARY KEY,
    Nom             NVARCHAR(150) NOT NULL,
    Profil          NVARCHAR(100) NOT NULL,              -- Support, Superviseur, Administrateur système, Technicien...
    Email           NVARCHAR(200) NULL,
    DateEmbauche    DATE NULL,
    Statut          NVARCHAR(20) NOT NULL DEFAULT 'Actif'
);
GO

CREATE TABLE synsr.ClesAPI (
    CleId           INT IDENTITY(1,1) PRIMARY KEY,
    UtilisateurId   INT NULL REFERENCES core.Utilisateurs(UtilisateurId),
    CleValeur       NVARCHAR(100) NOT NULL UNIQUE,
    Description     NVARCHAR(200) NULL,
    DateCreation    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    DateExpiration  DATETIME2 NULL,
    Statut          NVARCHAR(20) NOT NULL DEFAULT 'Active' -- Active | Révoquée
);
GO

/* ============================================================================
   3. SCHÉMA SYNDEC — État civil (SYNDEC-CAM)
   ============================================================================ */

CREATE TABLE syndec.Communes (
    CommuneId       INT IDENTITY(1,1) PRIMARY KEY,
    Nom             NVARCHAR(100) NOT NULL UNIQUE,
    Departement     NVARCHAR(100) NULL,
    Region          NVARCHAR(100) NULL
);
GO

CREATE TABLE syndec.OfficiersEtatCivil (
    OfficierId      INT IDENTITY(1,1) PRIMARY KEY,
    UtilisateurId   INT NULL REFERENCES core.Utilisateurs(UtilisateurId),
    Nom             NVARCHAR(150) NOT NULL,
    Role            NVARCHAR(50)  NOT NULL,              -- Maire | Adjoint au maire | Officier d'état civil | Secrétaire d'état civil
    CommuneId       INT NOT NULL REFERENCES syndec.Communes(CommuneId),
    DossiersTraites INT NOT NULL DEFAULT 0
);
GO

CREATE TABLE syndec.DeclarationsNaissance (
    DeclarationId   INT IDENTITY(1,1) PRIMARY KEY,
    Reference       NVARCHAR(20) NOT NULL UNIQUE,        -- 'NAI-000201'
    NomEnfant       NVARCHAR(150) NOT NULL,
    PrenomEnfant    NVARCHAR(150) NULL,
    Sexe            CHAR(1) NOT NULL CHECK (Sexe IN ('M','F')),
    LieuNaissance   NVARCHAR(150) NULL,
    DateNaissance   DATE NOT NULL,
    NomPere         NVARCHAR(150) NULL,
    NomMere         NVARCHAR(150) NULL,
    CommuneId       INT NOT NULL REFERENCES syndec.Communes(CommuneId),
    Declarant       NVARCHAR(150) NULL,
    CreeParUtilisateurId INT NULL REFERENCES core.Utilisateurs(UtilisateurId), -- Usager ayant créé la déclaration (visibilité restreinte à ses propres dossiers)
    PieceIdentiteParent     NVARCHAR(260) NULL,          -- Pièce jointe : identité d'un des parents ou des deux (nom de fichier)
    CertificatNaissanceHopital NVARCHAR(260) NULL,       -- Pièce jointe : certificat délivré par un hôpital / centre hospitalier
    Statut          NVARCHAR(20) NOT NULL DEFAULT 'En attente', -- En attente | Validé | Rejeté
    SignePar        INT NULL REFERENCES syndec.OfficiersEtatCivil(OfficierId),
    DateDeclaration DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE syndec.DeclarationsDeces (
    DeclarationId   INT IDENTITY(1,1) PRIMARY KEY,
    Reference       NVARCHAR(20) NOT NULL UNIQUE,
    NomDefunt       NVARCHAR(150) NOT NULL,
    PrenomDefunt    NVARCHAR(150) NULL,
    Sexe            CHAR(1) NULL CHECK (Sexe IN ('M','F')),
    LieuDeces       NVARCHAR(150) NULL,
    DateDeces       DATE NOT NULL,
    CommuneId       INT NOT NULL REFERENCES syndec.Communes(CommuneId),
    Declarant       NVARCHAR(150) NULL,
    CreeParUtilisateurId INT NULL REFERENCES core.Utilisateurs(UtilisateurId),
    PieceIdentiteDeclarant   NVARCHAR(260) NULL,         -- Pièce jointe : identité du déclarant
    ActeNaissanceDefunt      NVARCHAR(260) NULL,         -- Pièce jointe : acte de naissance du défunt
    CertificatDecesHopital   NVARCHAR(260) NULL,         -- Pièce jointe : certificat délivré par un hôpital / centre hospitalier
    MontantPaye     DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
    PartCommune     DECIMAL(10,2) NOT NULL DEFAULT 2500.00,
    PartCRC         DECIMAL(10,2) NOT NULL DEFAULT 2500.00,
    Statut          NVARCHAR(20) NOT NULL DEFAULT 'En attente',
    SignePar        INT NULL REFERENCES syndec.OfficiersEtatCivil(OfficierId),
    DateDeclaration DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE syndec.DeclarationsMariage (
    DeclarationId   INT IDENTITY(1,1) PRIMARY KEY,
    Reference       NVARCHAR(20) NOT NULL UNIQUE,
    Conjoint1       NVARCHAR(150) NOT NULL,
    Conjoint2       NVARCHAR(150) NOT NULL,
    CommuneId       INT NOT NULL REFERENCES syndec.Communes(CommuneId),
    DateSouhaitee   DATE NULL,
    MontantPaye     DECIMAL(10,2) NOT NULL DEFAULT 35500.00,
    PartCommune     DECIMAL(10,2) NOT NULL DEFAULT 17750.00,
    PartCRC         DECIMAL(10,2) NOT NULL DEFAULT 17750.00,
    Statut          NVARCHAR(30) NOT NULL DEFAULT 'En attente de contact', -- En attente de contact | Date confirmée
    DateDeclaration DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE syndec.PaiementsElectroniques (
    PaiementId      INT IDENTITY(1,1) PRIMARY KEY,
    TypeDeclaration NVARCHAR(20) NOT NULL,               -- 'Naissance' | 'Deces' | 'Mariage'
    DeclarationRef  NVARCHAR(20) NOT NULL,                -- référence de la déclaration liée
    Montant         DECIMAL(10,2) NOT NULL,
    Operateur       NVARCHAR(30) NOT NULL,                -- 'Orange Money' | 'MTN Mobile Money'
    ReferencePaiement NVARCHAR(50) NOT NULL UNIQUE,
    Statut          NVARCHAR(20) NOT NULL DEFAULT 'Confirmé',
    DatePaiement    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

/* ============================================================================
   4. SCHÉMA SYNREC — Recensement (SYNREC-CAM)
   ============================================================================ */

CREATE TABLE synrec.ZonesRecensement (
    ZoneId          INT IDENTITY(1,1) PRIMARY KEY,
    Code            NVARCHAR(20) NOT NULL UNIQUE,        -- 'ZD-0202'
    Region          NVARCHAR(100) NOT NULL,
    Departement     NVARCHAR(100) NULL,
    Commune         NVARCHAR(100) NULL,
    Statut          NVARCHAR(30) NOT NULL DEFAULT 'Non commencée', -- Terminée | En cours | Non commencée | À vérifier
    Progression     TINYINT NOT NULL DEFAULT 0 CHECK (Progression BETWEEN 0 AND 100),
    LogementsPrevus INT NOT NULL DEFAULT 0,
    LogementsVisites INT NOT NULL DEFAULT 0
);
GO

CREATE TABLE synrec.Menages (
    MenageId        INT IDENTITY(1,1) PRIMARY KEY,
    Code            NVARCHAR(40) NOT NULL UNIQUE,        -- 'CM-CE-CEN-YDE-001-000457'
    Region          NVARCHAR(100) NOT NULL,
    Departement     NVARCHAR(100) NULL,
    Commune         NVARCHAR(100) NULL,
    ZoneId          INT NULL REFERENCES synrec.ZonesRecensement(ZoneId),
    TypeLogement    NVARCHAR(50) NULL,
    NbPersonnes     INT NOT NULL DEFAULT 0,
    Statut          NVARCHAR(20) NOT NULL DEFAULT 'En attente', -- Validé | En attente | Rejeté
    Canal           NVARCHAR(20) NOT NULL DEFAULT 'AGENT',       -- WEB | MOBILE | USSD | AGENT
    DateEnregistrement DATE NOT NULL DEFAULT CAST(SYSUTCDATETIME() AS DATE)
);
GO

CREATE TABLE synrec.Personnes (
    PersonneId      INT IDENTITY(1,1) PRIMARY KEY,
    Reference       NVARCHAR(20) NOT NULL UNIQUE,        -- 'PR-1001'
    MenageId        INT NOT NULL REFERENCES synrec.Menages(MenageId),
    Nom             NVARCHAR(150) NOT NULL,
    Prenom          NVARCHAR(150) NULL,
    Sexe            CHAR(1) NULL CHECK (Sexe IN ('M','F')),
    DateNaissance   DATE NULL,
    LienChefMenage  NVARCHAR(50) NULL,
    Instruction     NVARCHAR(30) NULL,
    Activite        NVARCHAR(100) NULL
);
GO

CREATE TABLE synrec.AgentsRecenseurs (
    AgentId         INT IDENTITY(1,1) PRIMARY KEY,
    Reference       NVARCHAR(20) NOT NULL UNIQUE,        -- 'REC-002547'
    UtilisateurId   INT NULL REFERENCES core.Utilisateurs(UtilisateurId),
    Nom             NVARCHAR(150) NOT NULL,
    Region          NVARCHAR(100) NULL,
    Departement     NVARCHAR(100) NULL,
    Commune         NVARCHAR(150) NULL,
    ZoneId          INT NULL REFERENCES synrec.ZonesRecensement(ZoneId),
    LogementsPrevus INT NOT NULL DEFAULT 0,
    LogementsVisites INT NOT NULL DEFAULT 0,
    MenagesValides  INT NOT NULL DEFAULT 0,
    MenagesRejetes  INT NOT NULL DEFAULT 0,
    DerniereSync    DATETIME2 NULL,
    StatutAppareil  NVARCHAR(20) NOT NULL DEFAULT 'Synchronisé', -- Synchronisé | En attente | Hors ligne
    StatutMission   NVARCHAR(30) NOT NULL DEFAULT 'Non commencée' -- Non commencée | En cours | En attente de validation | Terminée
);
GO

-- Cycle de vie de la mission d'un agent recenseur : l'agent démarre (Non commencée -> En cours),
-- puis soumet son résultat (En cours -> En attente de validation, automatique), puis le chef de
-- zone valide (-> Terminée, automatique, répercuté sur l'écran de l'agent).
CREATE TABLE synrec.ChefsZone (
    ChefZoneId      INT IDENTITY(1,1) PRIMARY KEY,
    Reference       NVARCHAR(20) NOT NULL UNIQUE,        -- 'CDZ-001'
    UtilisateurId   INT NULL REFERENCES core.Utilisateurs(UtilisateurId),
    Nom             NVARCHAR(150) NOT NULL,
    Region          NVARCHAR(100) NULL,
    Departement     NVARCHAR(100) NULL,
    Commune         NVARCHAR(150) NULL,
    ZoneId          INT NULL REFERENCES synrec.ZonesRecensement(ZoneId),
    Telephone       NVARCHAR(30) NULL,
    VilleResidence  NVARCHAR(100) NULL,
    Email           NVARCHAR(200) NULL
);
GO

CREATE TABLE synrec.Doublons (
    DoublonId       INT IDENTITY(1,1) PRIMARY KEY,
    Reference       NVARCHAR(20) NOT NULL UNIQUE,        -- 'DUP-001'
    MenageA_Id      INT NOT NULL REFERENCES synrec.Menages(MenageId),
    MenageB_Id      INT NOT NULL REFERENCES synrec.Menages(MenageId),
    Region          NVARCHAR(100) NULL,
    Statut          NVARCHAR(30) NOT NULL DEFAULT 'En attente de contrôle', -- En attente de contrôle | Fusionné
    TraitePar       INT NULL REFERENCES core.Utilisateurs(UtilisateurId),
    DateTraitement  DATETIME2 NULL
);
GO

/* ============================================================================
   5. DONNÉES DE RÉFÉRENCE INITIALES (rôles et modules)
   ============================================================================ */

INSERT INTO core.Modules (CodeModule, Libelle, Actif) VALUES
    ('SYNSR',  'Système Numérique de Sécurité Routière du Cameroun', 1),
    ('SYNDEC', 'Système Numérique de Déclaration du Cameroun', 1),
    ('SYNREC', 'Système Numérique du Recensement du Cameroun', 1);
GO

INSERT INTO core.Roles (CodeRole, Libelle) VALUES
    ('admin',       'Administrateur système RTC'),
    ('mintrans',    'Administrateur système MINTRANS'),
    ('mindef',      'Administrateur système MINDEF'),
    ('dgsn',        'Administrateur système DGSN / Gendarmerie Nationale'),
    ('minat',       'Administrateur système MINAT'),
    ('bunec',       'Administrateur système BUNEC'),
    ('officier_ec', 'Maire / Adjoint au maire / Officier d''état civil / Secrétaire d''état civil'),
    ('bucrep',      'Administrateur système BUCREP'),
    ('agent_recenseur', 'Agent recenseur (SYNREC-CAM)'),
    ('chef_zone',   'Chef de zone (SYNREC-CAM)'),
    ('citoyen',     'Citoyen (compte personnel — usager auto-inscrit ou créé par un administrateur)'),
    ('agence',      'Agence de transport'),
    ('voyageur',    'Voyageur'),
    ('analyste',    'Analyste de données'),
    ('rh',          'Ressources Humaines');
GO

-- Attribution des accès module par rôle (reflète TIER_MODULES de l'application)
INSERT INTO core.RoleModuleAcces (RoleId, ModuleId, NiveauAcces)
SELECT r.RoleId, m.ModuleId, 'complet'
FROM core.Roles r CROSS JOIN core.Modules m
WHERE (r.CodeRole = 'admin')                                              -- RTC : accès complet aux 3
   OR (r.CodeRole IN ('mintrans','mindef','dgsn','agence','voyageur','analyste','rh') AND m.CodeModule = 'SYNSR')
   OR (r.CodeRole IN ('minat','bunec','officier_ec') AND m.CodeModule = 'SYNDEC')
   OR (r.CodeRole IN ('bucrep','agent_recenseur','chef_zone') AND m.CodeModule = 'SYNREC')
   OR (r.CodeRole = 'citoyen' AND m.CodeModule IN ('SYNSR','SYNDEC'));    -- Usager : SYNSR-CAM et SYNDEC-CAM uniquement, jamais SYNREC-CAM
GO

PRINT 'Schéma CRC_Ecosystem créé avec succès (schémas core, synsr, syndec, synrec).';
