import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, Legend,
} from "recharts";
import {
  LayoutDashboard, LayoutGrid, Building2, Users, Calendar, Clock, AlertTriangle,
  CheckCircle2, Plus, Search, Filter, Download, Stethoscope, Bed,
  Scissors, FlaskConical, Pill, Receipt, ShieldAlert, Check, X,
  UserCheck, ArrowRight, RefreshCw, Database, Eye, Pencil, Trash2,
  LogOut, Lock, PhoneCall, Mail, MapPin, HeartPulse, FileText, Send, UserPlus,
  AlertOctagon, Info, ChevronRight, Activity, Moon, Sun, ArrowLeftRight,
  Printer, CheckSquare, XCircle, FileSpreadsheet, ShieldCheck, MessageSquare
} from "lucide-react";
import {
  getSupabaseCredentials,
  saveCustomCredentials,
  clearCustomCredentials,
  testSupabaseConnection,
  getSupabaseClient,
  syncrmDatabase,
} from "../lib/supabaseClient";
import { LanguageSwitcher, useLanguage } from "../lib/i18n.jsx";
import {
  EventsManagerView,
  CollaborativeNotesWidget,
  TeamChatWidget,
  INITIAL_EVENTS,
  INITIAL_CHAT_MESSAGES,
} from "./CollaborationSuite.jsx";

// ============================================================================
// DONNÉES INITIALES RÉALISTES POUR LES HÔPITAUX DU CAMEROUN
// ============================================================================

const INITIAL_UTILISATEURS_SYNGESHP = [
  {
    id: "usr-hosp-1",
    nom_complet: "Pr. Vincent de Paul Djientcheu",
    email: "direction@hgy.cm",
    telephone: "+237 6 99 22 33 44",
    role: "Directeur / Médecin-Chef",
    etablissement_id: "hosp-1",
    etablissement_nom: "Hôpital Général de Yaoundé (HGY)",
    service_id: "srv-urg-1",
    service_nom: "Urgences médico-chirurgicales",
    statut: "Actif",
    date_creation: "2026-01-10",
    derniere_connexion: "2026-08-28 14:22:10",
  },
  {
    id: "usr-hosp-2",
    nom_complet: "Dr. Sandrine Ntone",
    email: "s.ntone@hgy.cm",
    telephone: "+237 6 77 88 99 00",
    role: "Médecin Spécialiste",
    etablissement_id: "hosp-1",
    etablissement_nom: "Hôpital Général de Yaoundé (HGY)",
    service_id: "srv-chir-1",
    service_nom: "Chirurgie générale et viscérale",
    statut: "Actif",
    date_creation: "2026-01-15",
    derniere_connexion: "2026-08-28 13:45:00",
  },
  {
    id: "usr-hosp-3",
    nom_complet: "Mme. Pauline Meka",
    email: "p.meka@hgy.cm",
    telephone: "+237 6 95 11 22 33",
    role: "Major de service / Cadre infirmier",
    etablissement_id: "hosp-1",
    etablissement_nom: "Hôpital Général de Yaoundé (HGY)",
    service_id: "srv-urg-1",
    service_nom: "Urgences médico-chirurgicales",
    statut: "Actif",
    date_creation: "2026-01-20",
    derniere_connexion: "2026-08-28 11:30:15",
  },
  {
    id: "usr-hosp-4",
    nom_complet: "Dr. Henri Essomba",
    email: "direction@hlc.cm",
    telephone: "+237 6 70 33 44 55",
    role: "Directeur / Médecin-Chef",
    etablissement_id: "hosp-2",
    etablissement_nom: "Hôpital Laquintinie de Douala (HLD)",
    service_id: "srv-urg-2",
    service_nom: "Service des Urgences",
    statut: "Actif",
    date_creation: "2026-02-01",
    derniere_connexion: "2026-08-28 09:12:44",
  },
  {
    id: "usr-hosp-5",
    nom_complet: "M. Blaise Tchatchoua",
    email: "pharmacie@hgy.cm",
    telephone: "+237 6 91 44 55 66",
    role: "Pharmacien Hospitalier",
    etablissement_id: "hosp-1",
    etablissement_nom: "Hôpital Général de Yaoundé (HGY)",
    service_id: "srv-pharm-1",
    service_nom: "Pharmacie hospitalière",
    statut: "Actif",
    date_creation: "2026-02-10",
    derniere_connexion: "2026-08-28 15:05:30",
  },
  {
    id: "usr-hosp-6",
    nom_complet: "Mme. Carine Fouda",
    email: "csu.caisse@hgy.cm",
    telephone: "+237 6 74 12 34 56",
    role: "Gestionnaire CSU / Caissier",
    etablissement_id: "hosp-1",
    etablissement_nom: "Hôpital Général de Yaoundé (HGY)",
    service_id: "srv-csu-1",
    service_nom: "Bureau des admissions et CSU",
    statut: "Actif",
    date_creation: "2026-02-15",
    derniere_connexion: "2026-08-28 15:35:12",
  },
];

const INITIAL_AUDIT_LOG_SYNGESHP = [
  {
    id: "aud-001",
    horodatage: "2026-08-28 15:45:12",
    utilisateur_nom: "Pr. Vincent de Paul Djientcheu",
    role: "Directeur / Médecin-Chef",
    etablissement_nom: "Hôpital Général de Yaoundé (HGY)",
    action: "Prescription intervention chirurgicale",
    table_cible: "bloc_interventions",
    enregistrement_id: "OP-2026-089",
    statut: "Succès",
    ip_terminal: "192.168.10.45",
  },
  {
    id: "aud-002",
    horodatage: "2026-08-28 15:30:00",
    utilisateur_nom: "Mme. Carine Fouda",
    role: "Gestionnaire CSU / Caissier",
    etablissement_nom: "Hôpital Général de Yaoundé (HGY)",
    action: "Validation prise en charge CSU",
    table_cible: "factures_sante",
    enregistrement_id: "FACT-2026-041",
    statut: "Succès",
    ip_terminal: "192.168.10.12",
  },
  {
    id: "aud-003",
    horodatage: "2026-08-28 14:15:22",
    utilisateur_nom: "M. Blaise Tchatchoua",
    role: "Pharmacien Hospitalier",
    etablissement_nom: "Hôpital Général de Yaoundé (HGY)",
    action: "Délivrance de produits pharmaceutiques",
    table_cible: "pharmacie_stocks",
    enregistrement_id: "MED-0024",
    statut: "Succès",
    ip_terminal: "192.168.10.88",
  },
  {
    id: "aud-004",
    horodatage: "2026-08-28 13:50:08",
    utilisateur_nom: "Mme. Pauline Meka",
    role: "Major de service",
    etablissement_nom: "Hôpital Général de Yaoundé (HGY)",
    action: "Attribution lit d'hospitalisation",
    table_cible: "lits_hospitalisation",
    enregistrement_id: "LIT-URG-04",
    statut: "Succès",
    ip_terminal: "192.168.10.20",
  },
  {
    id: "aud-005",
    horodatage: "2026-08-28 11:20:45",
    utilisateur_nom: "Dr. Sandrine Ntone",
    role: "Médecin Spécialiste",
    etablissement_nom: "Hôpital Général de Yaoundé (HGY)",
    action: "Création dossier patient & consultation",
    table_cible: "patients",
    enregistrement_id: "PAT-2026-0158",
    statut: "Succès",
    ip_terminal: "192.168.10.63",
  },
  {
    id: "aud-006",
    horodatage: "2026-08-28 09:15:30",
    utilisateur_nom: "Dr. Henri Essomba",
    role: "Directeur / Médecin-Chef",
    etablissement_nom: "Hôpital Laquintinie de Douala (HLD)",
    action: "Validation planning des gardes de nuit",
    table_cible: "gardes_astreintes",
    enregistrement_id: "GAR-HLD-044",
    statut: "Succès",
    ip_terminal: "192.168.20.10",
  },
];

const INITIAL_ETABLISSEMENTS = [
  {
    id: "hosp-1",
    code: "HGY-001",
    nom: "Hôpital Général de Yaoundé (HGY)",
    type_etablissement: "Hôpital Général / 1ère Catégorie",
    statut_juridique: "Public",
    region: "Centre",
    departement: "Mfoundi",
    district_sante: "Djoungolo",
    ville: "Yaoundé",
    adresse: "Quartier Ngousso",
    telephone: "+237 222 21 20 18",
    email: "direction@hgy.cm",
    responsable: "Pr. Vincent de Paul Djientcheu",
    capacite_lits: 350,
    services_actifs: ["Urgences", "Chirurgie", "Réanimation", "Cardiologie", "Maternité", "Pédiatrie", "Laboratoire", "Radiologie", "Pharmacie"],
  },
  {
    id: "hosp-2",
    code: "HGOPED-002",
    nom: "Hôpital Gynéco-Obstétrique et Pédiatrique de Douala (HGOPED)",
    type_etablissement: "Hôpital Général Spécialisé",
    statut_juridique: "Public",
    region: "Littoral",
    departement: "Wouri",
    district_sante: "Deido",
    ville: "Douala",
    adresse: "Yassa - Axe Lourd Douala-Yaoundé",
    telephone: "+237 233 42 10 50",
    email: "contact@hgoped.cm",
    responsable: "Pr. Emile Telesphore Mboudou",
    capacite_lits: 300,
    services_actifs: ["Gynécologie-Obstétrique", "Pédiatrie & Néonatalogie", "Chirurgie Pédiatrique", "Urgences Mère-Enfant", "Laboratoire", "Imagerie"],
  },
  {
    id: "hosp-3",
    code: "HRB-003",
    nom: "Hôpital Régional de Bafoussam (HRB)",
    type_etablissement: "Hôpital Régional / 2ème Catégorie",
    statut_juridique: "Public",
    region: "Ouest",
    departement: "Mifi",
    district_sante: "Bafoussam",
    ville: "Bafoussam",
    adresse: "Centre-Ville",
    telephone: "+237 233 44 12 34",
    email: "direction@hrbafoussam.cm",
    responsable: "Dr. Enow Orock George",
    capacite_lits: 220,
    services_actifs: ["Médecine Générale", "Chirurgie", "Maternité", "Urgences", "Laboratoire", "Pharmacie"],
  },
  {
    id: "hosp-4",
    code: "HDD-004",
    nom: "Hôpital de District de Deido (HDD)",
    type_etablissement: "Hôpital de District / 4ème Catégorie",
    statut_juridique: "Public",
    region: "Littoral",
    departement: "Wouri",
    district_sante: "Deido",
    ville: "Douala",
    adresse: "Rue Deido Plage",
    telephone: "+237 233 40 55 60",
    email: "hd.deido@minsante.cm",
    responsable: "Dr. Danielle Kedy Koum",
    capacite_lits: 110,
    services_actifs: ["Consultations Externes", "Maternité", "Urgences", "Petite Chirurgie", "Laboratoire"],
  },
];

const INITIAL_SERVICES = [
  { id: "srv-1", etablissement_id: "hosp-1", nom: "Urgences & Déchocage", pole: "Soins Critiques", chef_service: "Dr. Marc Eboumbou", capacite_lits: 24, lits_occupes: 19 },
  { id: "srv-2", etablissement_id: "hosp-1", nom: "Réanimation Polyvalente", pole: "Soins Critiques", chef_service: "Pr. Arthur Ndjock", capacite_lits: 16, lits_occupes: 14 },
  { id: "srv-3", etablissement_id: "hosp-1", nom: "Chirurgie Générale & Digestive", pole: "Pôle Chirurgical", chef_service: "Dr. Alain Mbida", capacite_lits: 45, lits_occupes: 38 },
  { id: "srv-4", etablissement_id: "hosp-1", nom: "Gynécologie & Maternité", pole: "Mère-Enfant", chef_service: "Dr. Sandrine Nguetsop", capacite_lits: 50, lits_occupes: 42 },
  { id: "srv-5", etablissement_id: "hosp-1", nom: "Pédiatrie & Néonatalogie", pole: "Mère-Enfant", chef_service: "Dr. Henriette Nsom", capacite_lits: 35, lits_occupes: 29 },
  { id: "srv-6", etablissement_id: "hosp-1", nom: "Cardiologie & USIC", pole: "Médecine", chef_service: "Pr. Samuel Kingue", capacite_lits: 28, lits_occupes: 22 },
  { id: "srv-7", etablissement_id: "hosp-1", nom: "Laboratoire Central d'Analyses", pole: "Médico-Technique", chef_service: "Dr. Paul Biwoli", capacite_lits: 0, lits_occupes: 0 },
  { id: "srv-8", etablissement_id: "hosp-1", nom: "Radiologie & Scanner", pole: "Médico-Technique", chef_service: "Dr. Christian Fouda", capacite_lits: 0, lits_occupes: 0 },
  { id: "srv-9", etablissement_id: "hosp-1", nom: "Pharmacie Hospitalière", pole: "Pharmaceutique", chef_service: "Dr. Madeleine Tchuente", capacite_lits: 0, lits_occupes: 0 },
];

const INITIAL_PERSONNEL = [
  {
    id: "pers-1",
    matricule: "MED-CMR-8821",
    nom: "Eboumbou",
    prenom: "Marc",
    titre: "Dr.",
    categorie: "Médecin Spécialiste",
    specialite: "Médecine d'Urgence / Réanimation",
    service_id: "srv-1",
    service_nom: "Urgences & Déchocage",
    telephone: "+237 677 11 22 33",
    email: "m.eboumbou@minsante.cm",
    statut: "Actif",
    type_contrat: "Fonctionnaire MINSANTE",
    nb_gardes_mois: 5,
    nb_gardes_max: 7,
    solde_conges_jours: 22,
    qualifications: ["ATLS", "Échographie d'urgence", "Intubation difficile"],
  },
  {
    id: "pers-2",
    matricule: "MED-CMR-9942",
    nom: "Mbida",
    prenom: "Alain",
    titre: "Dr.",
    categorie: "Médecin Spécialiste",
    specialite: "Chirurgie Générale & Viscérale",
    service_id: "srv-3",
    service_nom: "Chirurgie Générale & Digestive",
    telephone: "+237 699 44 55 66",
    email: "a.mbida@minsante.cm",
    statut: "Actif",
    type_contrat: "Fonctionnaire MINSANTE",
    nb_gardes_mois: 4,
    nb_gardes_max: 6,
    solde_conges_jours: 18,
    qualifications: ["Coelio-chirurgie", "Traumatologie avancée"],
  },
  {
    id: "pers-3",
    matricule: "MED-CMR-7719",
    nom: "Nguetsop",
    prenom: "Sandrine",
    titre: "Dr.",
    categorie: "Médecin Spécialiste",
    specialite: "Gynécologie-Obstétrique",
    service_id: "srv-4",
    service_nom: "Gynécologie & Maternité",
    telephone: "+237 675 88 99 00",
    email: "s.nguetsop@minsante.cm",
    statut: "Actif",
    type_contrat: "Contractuel d'administration",
    nb_gardes_mois: 6,
    nb_gardes_max: 6,
    solde_conges_jours: 15,
    qualifications: ["Césarienne complexe", "Échographie obstétricale 3D"],
  },
  {
    id: "pers-4",
    matricule: "INF-CMR-3021",
    nom: "Mengue",
    prenom: "Clémence",
    titre: "Mme",
    categorie: "Infirmier Diplômé d'État (IDE)",
    specialite: "Soins Intensifs & Réanimation",
    service_id: "srv-2",
    service_nom: "Réanimation Polyvalente",
    telephone: "+237 655 22 33 44",
    email: "c.mengue@hgy.cm",
    statut: "Actif",
    type_contrat: "Décisionnaire",
    nb_gardes_mois: 7,
    nb_gardes_max: 8,
    solde_conges_jours: 12,
    qualifications: ["Ventilation mécanique", "Dialyse d'urgence"],
  },
  {
    id: "pers-5",
    matricule: "SF-CMR-4412",
    nom: "Kouam",
    prenom: "Jeanne",
    titre: "Mme",
    categorie: "Sage-femme Principale",
    specialite: "Obstétrique & Salle d'Accouchement",
    service_id: "srv-4",
    service_nom: "Gynécologie & Maternité",
    telephone: "+237 671 33 44 55",
    email: "j.kouam@hgy.cm",
    statut: "Actif",
    type_contrat: "Fonctionnaire",
    nb_gardes_mois: 5,
    nb_gardes_max: 7,
    solde_conges_jours: 25,
    qualifications: ["Réanimation néonatale", "Surveillance monitorage foetal"],
  },
  {
    id: "pers-6",
    matricule: "LAB-CMR-5501",
    nom: "Talla",
    prenom: "Rodrigue",
    titre: "M.",
    categorie: "Technicien Médico-Sanitaire",
    specialite: "Hématologie & Bactériologie",
    service_id: "srv-7",
    service_nom: "Laboratoire Central d'Analyses",
    telephone: "+237 690 12 34 56",
    email: "r.talla@hgy.cm",
    statut: "Actif",
    type_contrat: "Contractuel",
    nb_gardes_mois: 4,
    nb_gardes_max: 6,
    solde_conges_jours: 20,
    qualifications: ["Automates Sysmex", "Microbiologie BSL-2"],
  },
];

const INITIAL_GARDES = [
  {
    id: "grd-1",
    personnel_id: "pers-1",
    personnel_nom: "Dr. Marc Eboumbou",
    service_id: "srv-1",
    service_nom: "Urgences & Déchocage",
    type_garde: "Garde 24 Heures",
    periode: "Jour & Nuit (08h00 - 08h00 J+1)",
    date_garde: "2026-08-24",
    statut: "Confirmée & En cours",
    remplacant_nom: null,
    conflit_detecte: false,
    role_garde: "Médecin Sénior de Garde Urgences",
  },
  {
    id: "grd-2",
    personnel_id: "pers-4",
    personnel_nom: "Mme Clémence Mengue",
    service_id: "srv-2",
    service_nom: "Réanimation Polyvalente",
    type_garde: "Nuit (19h00 - 07h00)",
    periode: "Nuit",
    date_garde: "2026-08-24",
    statut: "Confirmée",
    remplacant_nom: null,
    conflit_detecte: false,
    role_garde: "Infirmière Responsable Nuit Réa",
  },
  {
    id: "grd-3",
    personnel_id: "pers-3",
    personnel_nom: "Dr. Sandrine Nguetsop",
    service_id: "srv-4",
    service_nom: "Gynécologie & Maternité",
    type_garde: "Astreinte Opérationnelle",
    periode: "24 Heures à domicile",
    date_garde: "2026-08-24",
    statut: "Confirmée",
    remplacant_nom: null,
    conflit_detecte: false,
    role_garde: "Gynécologue d'astreinte Césariennes",
  },
  {
    id: "grd-4",
    personnel_id: "pers-2",
    personnel_nom: "Dr. Alain Mbida",
    service_id: "srv-3",
    service_nom: "Chirurgie Générale & Digestive",
    type_garde: "Garde 12 Heures Nuit",
    periode: "20h00 - 08h00",
    date_garde: "2026-08-25",
    statut: "En attente de validation",
    remplacant_nom: null,
    conflit_detecte: false,
    role_garde: "Chirurgien d'Astreinte Bloc",
  },
];

const INITIAL_CONGES = [
  {
    id: "cng-1",
    personnel_id: "pers-6",
    personnel_nom: "M. Rodrigue Talla",
    service_nom: "Laboratoire Central d'Analyses",
    type_conge: "Congé Annuel",
    date_debut: "2026-09-01",
    date_fin: "2026-09-15",
    nb_jours: 14,
    statut: "Validé par Direction RH",
    remplacant_propose: "Mlle Sophie Ndongo",
    motif: "Repos annuel réglementaire",
  },
  {
    id: "cng-2",
    personnel_id: "pers-3",
    personnel_nom: "Dr. Sandrine Nguetsop",
    service_nom: "Gynécologie & Maternité",
    type_conge: "Mission / Séminaire OMS",
    date_debut: "2026-09-10",
    date_fin: "2026-09-13",
    nb_jours: 4,
    statut: "En attente validation",
    remplacant_propose: "Dr. Eric Tchinda",
    motif: "Formation Prise en charge Mortalité Maternelle",
  },
];

const INITIAL_PATIENTS = [
  {
    id: "pat-1",
    ip_unique: "PAT-2026-0841",
    nom: "Ndam",
    prenom: "Arouna",
    sexe: "M",
    date_naissance: "1988-05-14",
    age: 38,
    telephone: "+237 699 88 77 66",
    ville: "Yaoundé",
    quartier: "Biyem-Assi",
    groupe_sanguin: "O+",
    couverture: "Couverture Santé Universelle (CSU)",
    csu_matricule: "CSU-CM-2026-991204",
    statut_actuel: "Hospitalisé (Chirurgie)",
    chambre_lit: "CH-01 / LIT-01",
  },
  {
    id: "pat-2",
    ip_unique: "PAT-2026-0842",
    nom: "Manga",
    prenom: "Marie-Louise",
    sexe: "F",
    date_naissance: "1995-11-20",
    age: 30,
    telephone: "+237 670 12 34 56",
    ville: "Douala",
    quartier: "Akwa Nord",
    groupe_sanguin: "A+",
    couverture: "Assurance Privée (Ascoma)",
    csu_matricule: null,
    statut_actuel: "Hospitalisée (Maternité)",
    chambre_lit: "CH-108 / LIT-MAT-1",
  },
  {
    id: "pat-3",
    ip_unique: "PAT-2026-0843",
    nom: "Abena",
    prenom: "Jean-Baptiste",
    sexe: "M",
    date_naissance: "1962-03-08",
    age: 64,
    telephone: "+237 655 99 00 11",
    ville: "Bafoussam",
    quartier: "Djeleng",
    groupe_sanguin: "B+",
    couverture: "Plein Tarif (Paiement Direct)",
    csu_matricule: null,
    statut_actuel: "Consultation Externe / RDV",
    chambre_lit: "Non hospitalisé",
  },
];

const INITIAL_RENDEZ_VOUS = [
  {
    id: "rdv-1",
    patient_nom: "Jean-Baptiste Abena",
    patient_tel: "+237 655 99 00 11",
    service_nom: "Cardiologie & USIC",
    medecin_nom: "Pr. Samuel Kingue",
    date_rdv: "2026-08-25",
    heure_rdv: "09:30",
    motif: "Contrôle HTA & Échocardiographie de suivi",
    statut: "Confirmé (Rappel SMS envoyé)",
    priorite: "Normale",
  },
  {
    id: "rdv-2",
    patient_nom: "Suzanne Charlotte Eboa",
    patient_tel: "+237 655 44 33 22",
    service_nom: "Gynécologie & Maternité",
    medecin_nom: "Dr. Sandrine Nguetsop",
    date_rdv: "2026-08-25",
    heure_rdv: "11:00",
    motif: "Consultation Prénatale (CPN 3ème trimestre)",
    statut: "Planifié",
    priorite: "Prioritaire",
  },
  {
    id: "rdv-3",
    patient_nom: "Ibrahim Aboubakar",
    patient_tel: "+237 671 99 88 77",
    service_nom: "Urgences & Déchocage",
    medecin_nom: "Dr. Marc Eboumbou",
    date_rdv: "2026-08-24",
    heure_rdv: "14:00",
    motif: "Suivi plaie post-traumatique",
    statut: "Honoré (En consultation)",
    priorite: "Urgente",
  },
];

const INITIAL_LITS = [
  { id: "lit-1", service_nom: "Urgences & Déchocage", chambre: "CH-01", numero_lit: "LIT-01", statut: "Occupé", patient_nom: "Arouna Ndam", date_admission: "2026-08-24 07:15" },
  { id: "lit-2", service_nom: "Urgences & Déchocage", chambre: "CH-01", numero_lit: "LIT-02", statut: "Disponible", patient_nom: null, date_admission: null },
  { id: "lit-3", service_nom: "Urgences & Déchocage", chambre: "CH-02", numero_lit: "LIT-03", statut: "En désinfection", patient_nom: null, date_admission: null },
  { id: "lit-4", service_nom: "Réanimation Polyvalente", chambre: "BOX-01", numero_lit: "LIT-REA-1", statut: "Occupé", patient_nom: "Bello Ousmanou", date_admission: "2026-08-23 18:40" },
  { id: "lit-5", service_nom: "Réanimation Polyvalente", chambre: "BOX-02", numero_lit: "LIT-REA-2", statut: "Réservé", patient_nom: "Post-op Bloc 1", date_admission: "2026-08-24 12:00" },
  { id: "lit-6", service_nom: "Gynécologie & Maternité", chambre: "CH-108", numero_lit: "LIT-MAT-1", statut: "Occupé", patient_nom: "Marie-Louise Manga", date_admission: "2026-08-24 04:30" },
  { id: "lit-7", service_nom: "Gynécologie & Maternité", chambre: "CH-108", numero_lit: "LIT-MAT-2", statut: "Disponible", patient_nom: null, date_admission: null },
];

const INITIAL_BLOC_INTERVENTIONS = [
  {
    id: "bloc-1",
    salle_bloc: "Salle 1 (Chirurgie Viscérale)",
    patient_nom: "Arouna Ndam (38 ans)",
    chirurgien_principal: "Dr. Alain Mbida",
    anesthesiste: "Dr. Cécile Noah",
    type_intervention: "Appendicectomie sous coelioscopie",
    date_heure: "2026-08-24 11:30",
    duree_estimee_min: 60,
    statut: "En cours d'intervention",
    salle_reveil_reservee: true,
  },
  {
    id: "bloc-2",
    salle_bloc: "Salle 2 (Maternité / Césariennes)",
    patient_nom: "Marie-Louise Manga (30 ans)",
    chirurgien_principal: "Dr. Sandrine Nguetsop",
    anesthesiste: "Dr. Paul Atangana",
    type_intervention: "Césarienne programmée pour présentation du siège",
    date_heure: "2026-08-24 14:00",
    duree_estimee_min: 45,
    statut: "Programmé / Équipe prête",
    salle_reveil_reservee: true,
  },
];

const INITIAL_LABO_RADIO = [
  {
    id: "exam-1",
    numero: "EX-2026-4401",
    type_examen: "Goutte Épaisse & Densité Parasitaire (Paludisme)",
    categorie: "Laboratoire",
    patient_nom: "Arouna Ndam",
    prescripteur: "Dr. Marc Eboumbou",
    technicien_nom: "M. Rodrigue Talla",
    statut: "Validé (Positif P. falciparum 12 000 troph/µL)",
    date_prescription: "2026-08-24 07:30",
    delai_rendu: "45 min",
  },
  {
    id: "exam-2",
    numero: "EX-2026-4402",
    type_examen: "Radiographie Pulmonaire Face + Profil",
    categorie: "Imagerie Médicale",
    patient_nom: "Jean-Baptiste Abena",
    prescripteur: "Pr. Samuel Kingue",
    technicien_nom: "Dr. Christian Fouda",
    statut: "En cours de réalisation",
    date_prescription: "2026-08-24 09:45",
    delai_rendu: "30 min",
  },
  {
    id: "exam-3",
    numero: "EX-2026-4403",
    type_examen: "Numération Formule Sanguine (NFS) Complète",
    categorie: "Laboratoire",
    patient_nom: "Marie-Louise Manga",
    prescripteur: "Dr. Sandrine Nguetsop",
    technicien_nom: "M. Rodrigue Talla",
    statut: "Validé (Hb: 11.8 g/dL, Plaquettes: 220 000)",
    date_prescription: "2026-08-24 05:00",
    delai_rendu: "20 min",
  },
];

const INITIAL_PHARMACIE_STOCKS = [
  { id: "med-1", code_dci: "MED-001", designation: "Artésunate Injectable 60mg", forme: "Flacon injectable", quantite_stock: 450, seuil_alerte: 100, lot: "ART-2026-09", peremption: "2027-12-31", prix_unitaire_fcfa: 2500, couverture_csu: true },
  { id: "med-2", code_dci: "MED-002", designation: "Paracétamol Perfusion 1g/100ml", forme: "Poche perfusion", quantite_stock: 620, seuil_alerte: 150, lot: "PARA-26-88", peremption: "2028-06-30", prix_unitaire_fcfa: 1200, couverture_csu: true },
  { id: "med-3", code_dci: "MED-003", designation: "Ceftriaxone 1g Poudre Injectable", forme: "Flacon", quantite_stock: 85, seuil_alerte: 100, lot: "CEF-2026-01", peremption: "2027-04-15", prix_unitaire_fcfa: 3500, couverture_csu: false, alerte_rupture: true },
  { id: "med-4", code_dci: "MED-004", designation: "Ocytocine 10 UI/ml Injectable", forme: "Ampoule", quantite_stock: 310, seuil_alerte: 80, lot: "OXT-25-11", peremption: "2027-08-31", prix_unitaire_fcfa: 1800, couverture_csu: true },
  { id: "med-5", code_dci: "MED-005", designation: "Sérum Salé Isotonique 0.9% 500ml", forme: "Poche", quantite_stock: 1200, seuil_alerte: 300, lot: "SSI-26-03", peremption: "2029-01-01", prix_unitaire_fcfa: 800, couverture_csu: true },
];

const INITIAL_FACTURES_SANTE = [
  {
    id: "fac-sante-1",
    numero: "FAC-SANTE-2026-0312",
    patient_nom: "Arouna Ndam",
    ip_unique: "PAT-2026-0841",
    prestations: "Consultation Urgence + Bilan Labo + Hospitalisation 24h",
    total_ttc_fcfa: 45000,
    part_csu_fcfa: 36000, // 80% pris en charge CSU
    ticket_moderateur_patient_fcfa: 9000,
    statut_paiement: "Payé",
    mode_reglement: "Orange Money",
    reference_transaction: "OM-SANTE-884920",
    date_facture: "2026-08-24",
  },
  {
    id: "fac-sante-2",
    numero: "FAC-SANTE-2026-0313",
    patient_nom: "Marie-Louise Manga",
    ip_unique: "PAT-2026-0842",
    prestations: "Forfait Césarienne + Soins Mère-Enfant 72h",
    total_ttc_fcfa: 125000,
    part_csu_fcfa: 100000,
    ticket_moderateur_patient_fcfa: 25000,
    statut_paiement: "Payé",
    mode_reglement: "MTN Mobile Money",
    reference_transaction: "MOMO-SANTE-110294",
    date_facture: "2026-08-24",
  },
];

// ============================================================================
// COMPOSANT PRINCIPAL : SYNGESHP-CAM APP
// ============================================================================

// Composant standard de Pagination 15 lignes par page pour SYNGESHP-CAM
// Bannière SaaS d'accueil pour SYNGESHP-CAM
function SyngespHospitalOnboardingBanner({ hopitalNom, profession, onDismiss }) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#102530] via-[#0D1F28] to-[#102530] border border-teal-500/40 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-400 rounded border border-teal-500/40">
              Guide SaaS Hospitalier
            </span>
            <span className="text-xs text-[#8FA8B0]">{hopitalNom}</span>
          </div>
          <h2 className="text-base font-bold text-[#EAF2F4] mt-1" style={{ fontFamily: "Rajdhani, sans-serif" }}>
            Bienvenue sur votre espace hospitalier ({profession || "Personnel"}) !
          </h2>
          <p className="text-xs text-[#8FA8B0] mt-0.5">
            Tableau de bord sécurisé avec isolation stricte des données de votre structure :
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setClosed(true); if (onDismiss) onDismiss(); }}
          className="text-xs text-[#8FA8B0] hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors shrink-0"
        >
          ✕ Masquer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 relative z-10">
        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-start gap-2.5 hover:bg-white/10 transition-colors">
          <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
            1
          </div>
          <div>
            <div className="text-xs font-semibold text-[#EAF2F4]">Urgences & Triage</div>
            <div className="text-[11px] text-[#8FA8B0] mt-0.5">Admissions des lits, interventions au bloc et consultations.</div>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-start gap-2.5 hover:bg-white/10 transition-colors">
          <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
            2
          </div>
          <div>
            <div className="text-xs font-semibold text-[#EAF2F4]">Pharmacie & CSU</div>
            <div className="text-[11px] text-[#8FA8B0] mt-0.5">Stocks DCI, alertes de péremption et prise en charge CSU.</div>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-start gap-2.5 hover:bg-white/10 transition-colors">
          <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
            3
          </div>
          <div>
            <div className="text-xs font-semibold text-[#EAF2F4]">Copilot IA Hospitalier</div>
            <div className="text-[11px] text-[#8FA8B0] mt-0.5">Interrogez l'Assistant IA vocal et textuel pour vos requêtes.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SyngespPagination({ currentPage, totalItems, pageSize = 15, onPageChange, label = "lignes" }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageCourante = Math.min(Math.max(1, currentPage), totalPages);
  const start = totalItems > 0 ? (pageCourante - 1) * pageSize + 1 : 0;
  const end = Math.min(pageCourante * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 text-xs text-[#8FA8B0] border-t border-white/10 bg-[#0D1F28]/70 rounded-b-xl">
      <div>
        Affichage de <span className="font-semibold text-white">{start}</span> à <span className="font-semibold text-white">{end}</span> sur <span className="font-semibold text-[#5FC2D6]">{totalItems}</span> {label} (15 lignes par page)
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={pageCourante <= 1}
            onClick={() => onPageChange(pageCourante - 1)}
            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white text-xs border border-white/10 transition-colors"
          >
            ◄ Précédent
          </button>
          <span className="px-2 py-1 text-xs font-mono font-bold text-[#5FC2D6] bg-white/5 rounded border border-white/10">
            Page {pageCourante} / {totalPages}
          </span>
          <button
            type="button"
            disabled={pageCourante >= totalPages}
            onClick={() => onPageChange(pageCourante + 1)}
            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white text-xs border border-white/10 transition-colors"
          >
            Suivant ►
          </button>
        </div>
      )}
    </div>
  );
}

const handleExportData = (table = "data", format = "csv") => {
  try {
    const str = "data:text/csv;charset=utf-8,ID,Date,Statut\n1," + new Date().toISOString() + ",Actif";
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(str));
    link.setAttribute("download", `syngeshp_export_${table}_${Date.now()}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {}
};

export default function SyngespCamApp({
  onExit,
  onLock,
  onLogout,
  adminNom = "Administrateur National MINSANTE",
  sessionRole = "admin",
  sessionUserId = null,
  sessionHopital = "",
  sessionProfession = "Directeur",
  syngespActif = true,
  utilisateursHopital = [],
  onCreerCompteHopital = null,
}) {
  const { lang, t } = useLanguage();
  // Navigation des sous-modules
  // Droits dérivés du rôle de la session. La configuration de la base et les exports de données
  // de santé n'étaient protégés par aucun contrôle : n'importe quel compte atteignant le module
  // pouvait repointer la synchronisation vers une base arbitraire, ou exporter en un clic le
  // fichier nominatif des patients hospitalisés et de leurs prestations médicales.
  const peutConfigurerBase = sessionRole === "admin";
  const peutExporterSante = sessionRole === "admin" || sessionRole === "minsante" || sessionRole === "hopital";
  const [activeTab, setActiveTab] = useState("dashboard");

  const [searchQuery, setSearchQuery] = useState("");
  // État de pagination par onglet (15 lignes par page)
  const [tabPages, setTabPages] = useState({});
  const getTabPage = (t) => tabPages[t] || 1;
  const setTabPage = (t, p) => setTabPages((prev) => ({ ...prev, [t]: p }));
  const [toastMessage, setToastMessage] = useState(null);

  // Notification Toast Helper
  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // --- SUITE COLLABORATIVE (ÉVÉNEMENTS, NOTES AVEC @MENTIONS, CHAT) ---
  const [eventsList, setEventsList] = useState(INITIAL_EVENTS);
  const [notesList, setNotesList] = useState([]);
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT_MESSAGES);

  const handleAddEvent = (newEvt) => {
    setEventsList((prev) => [newEvt, ...prev]);
    showToast("Événement / Garde planifiée avec succès.");
  };

  const handleDeleteEvent = (id) => {
    setEventsList((prev) => prev.filter((e) => e.id !== id));
    showToast("Événement supprimé.");
  };

  const handleAddNote = (newNote) => {
    setNotesList((prev) => [newNote, ...prev]);
    showToast("Note médicale enregistrée avec mention.");
  };

  const handleDeleteNote = (id) => {
    setNotesList((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSendMessage = (newMsg) => {
    setChatMessages((prev) => [...prev, newMsg]);
  };

  // Données d'état (avec sauvegarde localStorage pour mode hors-ligne résilient)
  const [etablissements, setEtablissements] = useState(() => {
    const s = localStorage.getItem("syngesp_etablissements");
    return s ? JSON.parse(s) : INITIAL_ETABLISSEMENTS;
  });

  // Initialisation de l'hôpital en fonction de la session connectée
  const [selectedEtablissementId, setSelectedEtablissementId] = useState(() => {
    if (sessionHopital) {
      // Si sessionHopital est un ID (hosp-1, etc.) ou un nom d'établissement
      const found = INITIAL_ETABLISSEMENTS.find(e => e.id === sessionHopital || e.nom === sessionHopital || e.code === sessionHopital);
      if (found) return found.id;
    }
    return "hosp-1";
  });

  // Métier / Profession médicale de la session
  const [currentProfession, setCurrentProfession] = useState(() => {
    if (sessionProfession) return sessionProfession;
    if (sessionRole === "medecin") return "Médecin";
    if (sessionRole === "infirmier") return "Infirmier";
    if (sessionRole === "pharmacien") return "Pharmacien";
    if (sessionRole === "caissier") return "Caissier";
    return "Directeur";
  });

  // Détermination des habilitations RBAC
  const isDirecteur = sessionRole === "admin" || sessionRole === "minsante" || sessionRole === "hopital" || currentProfession === "Directeur" || currentProfession === "Médecin-Chef";
  const isMedecin = currentProfession === "Médecin" || currentProfession === "Chirurgien" || isDirecteur;
  const isInfirmier = currentProfession === "Infirmier" || currentProfession === "Sage-femme" || isDirecteur;
  const isPharmacien = currentProfession === "Pharmacien" || isDirecteur;
  const isCaissier = currentProfession === "Caissier" || currentProfession === "Facturation" || isDirecteur;
  const isNationalAdmin = sessionRole === "admin" || sessionRole === "minsante";

  const [services, setServices] = useState(() => {
    const s = localStorage.getItem("syngesp_services");
    return s ? JSON.parse(s) : INITIAL_SERVICES;
  });

  const [personnel, setPersonnel] = useState(() => {
    const s = localStorage.getItem("syngesp_personnel");
    return s ? JSON.parse(s) : INITIAL_PERSONNEL;
  });

  const [gardes, setGardes] = useState(() => {
    const s = localStorage.getItem("syngesp_gardes");
    return s ? JSON.parse(s) : INITIAL_GARDES;
  });

  const [conges, setConges] = useState(() => {
    const s = localStorage.getItem("syngesp_conges");
    return s ? JSON.parse(s) : INITIAL_CONGES;
  });

  const [patients, setPatients] = useState(() => {
    const s = localStorage.getItem("syngesp_patients");
    return s ? JSON.parse(s) : INITIAL_PATIENTS;
  });

  const [rendezVous, setRendezVous] = useState(() => {
    const s = localStorage.getItem("syngesp_rendez_vous");
    return s ? JSON.parse(s) : INITIAL_RENDEZ_VOUS;
  });

  const [lits, setLits] = useState(() => {
    const s = localStorage.getItem("syngesp_lits");
    return s ? JSON.parse(s) : INITIAL_LITS;
  });

  const [interventions, setInterventions] = useState(() => {
    const s = localStorage.getItem("syngesp_interventions");
    return s ? JSON.parse(s) : INITIAL_BLOC_INTERVENTIONS;
  });

  const [examens, setExamens] = useState(() => {
    const s = localStorage.getItem("syngesp_examens");
    return s ? JSON.parse(s) : INITIAL_LABO_RADIO;
  });

  const [stocksPharmacie, setStocksPharmacie] = useState(() => {
    const s = localStorage.getItem("syngesp_pharmacie");
    return s ? JSON.parse(s) : INITIAL_PHARMACIE_STOCKS;
  });

  const [factures, setFactures] = useState(() => {
    const s = localStorage.getItem("syngesp_factures");
    return s ? JSON.parse(s) : INITIAL_FACTURES_SANTE;
  });

  // Administration SYNGESHP : Utilisateurs et Journal d'audit
  const [adminSubTab, setAdminSubTab] = useState("database"); // "database" | "utilisateurs" | "audit"
  const [utilisateurs, setUtilisateurs] = useState(() => {
    const s = localStorage.getItem("syngesp_utilisateurs");
    return s ? JSON.parse(s) : INITIAL_UTILISATEURS_SYNGESHP;
  });
  const [auditLog, setAuditLog] = useState(() => {
    const s = localStorage.getItem("syngesp_audit_log");
    return s ? JSON.parse(s) : INITIAL_AUDIT_LOG_SYNGESHP;
  });
  const [adminUserSearch, setAdminUserSearch] = useState("");
  const [adminUserRoleFilter, setAdminUserRoleFilter] = useState("Tous");
  const [adminUserHopitalFilter, setAdminUserHopitalFilter] = useState("Tous");

  const [auditSearch, setAuditSearch] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState("Tous");
  const [auditTableFilter, setAuditTableFilter] = useState("Tous");

  useEffect(() => {
    try { localStorage.setItem("syngesp_utilisateurs", JSON.stringify(utilisateurs)); } catch (e) { console.warn(e); }
  }, [utilisateurs]);

  useEffect(() => {
    try { localStorage.setItem("syngesp_audit_log", JSON.stringify(auditLog)); } catch (e) { console.warn(e); }
  }, [auditLog]);

  const logAuditSyngeshp = (action, table_cible, enregistrement_id = "", statut = "Succès") => {
    const newEntry = {
      id: `aud-${Date.now().toString().slice(-6)}`,
      horodatage: new Date().toISOString().slice(0, 19).replace("T", " "),
      utilisateur_nom: adminNom || "Administrateur",
      role: currentProfession || sessionProfession || "Directeur",
      etablissement_nom: etablissementActif?.nom || "Hôpital Général de Yaoundé (HGY)",
      action,
      table_cible,
      enregistrement_id: enregistrement_id || `REC-${Date.now().toString().slice(-4)}`,
      statut,
      ip_terminal: "192.168.10." + Math.floor(Math.random() * 200 + 10),
    };
    setAuditLog((prev) => [newEntry, ...prev]);
  };

  // Supabase State
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [supabaseCreds, setSupabaseCreds] = useState(getSupabaseCredentials());
  const [supabaseStatus, setSupabaseStatus] = useState({ loading: false, connected: false, message: "" });
  const [syncLoading, setSyncLoading] = useState(false);

  // Modals de création / action
  const [modalType, setModalType] = useState(null); // 'garde', 'echange_garde', 'conge', 'rdv', 'patient', 'lit', 'intervention', 'examen', 'medicament', 'facture_sante', 'etablissement', 'personnel'
  const [selectedItem, setSelectedItem] = useState(null);

  // Sauvegarde automatique localStorage
  useEffect(() => {
    localStorage.setItem("syngesp_etablissements", JSON.stringify(etablissements));
    localStorage.setItem("syngesp_services", JSON.stringify(services));
    localStorage.setItem("syngesp_personnel", JSON.stringify(personnel));
    localStorage.setItem("syngesp_gardes", JSON.stringify(gardes));
    localStorage.setItem("syngesp_conges", JSON.stringify(conges));
    localStorage.setItem("syngesp_patients", JSON.stringify(patients));
    localStorage.setItem("syngesp_rendez_vous", JSON.stringify(rendezVous));
    localStorage.setItem("syngesp_lits", JSON.stringify(lits));
    localStorage.setItem("syngesp_interventions", JSON.stringify(interventions));
    localStorage.setItem("syngesp_examens", JSON.stringify(examens));
    localStorage.setItem("syngesp_pharmacie", JSON.stringify(stocksPharmacie));
    localStorage.setItem("syngesp_factures", JSON.stringify(factures));
  }, [etablissements, services, personnel, gardes, conges, patients, rendezVous, lits, interventions, examens, stocksPharmacie, factures]);

  // Test de connectivité Supabase au chargement
  useEffect(() => {
    checkSupabase();
  }, []);

  const checkSupabase = async () => {
    setSupabaseStatus({ loading: true, connected: false, message: "Vérification de la connexion..." });
    const res = await testSupabaseConnection();
    setSupabaseStatus({ loading: false, connected: res.connected || false, message: res.message });
    setSupabaseCreds(getSupabaseCredentials());
  };

  // Synchronisation Cloud
  const handleSyncSupabase = async () => {
    setSyncLoading(true);
    try {
      const client = getSupabaseClient();
      if (!client) {
        setSupabaseModalOpen(true);
        showToast("Veuillez configurer vos identifiants Supabase dans la boîte de dialogue.", "warning");
        setSyncLoading(false);
        return;
      }
      showToast("Données hospitalières synchronisées avec succès sur Supabase PostgreSQL !", "success");
    } catch (e) {
      showToast("Erreur de synchronisation : " + (e.message || e), "error");
    } finally {
      setSyncLoading(false);
    }
  };

  // Formatage FCFA
  const formatFCFA = (val) => new Intl.NumberFormat("fr-FR").format(val || 0) + " FCFA";

  // =========================================================================
  // FILTRAGE STRICT PAR ÉTABLISSEMENT HOSPITALIER (ISOLATION DES DONNÉES)
  // =========================================================================
  const etablissementActif = useMemo(() => {
    return etablissements.find((e) => e.id === selectedEtablissementId) || etablissements[0];
  }, [etablissements, selectedEtablissementId]);

  const servicesFiltres = useMemo(() => {
    return services.filter((s) => !s.etablissement_id || s.etablissement_id === selectedEtablissementId);
  }, [services, selectedEtablissementId]);

  const serviceIds = useMemo(() => new Set(servicesFiltres.map((s) => s.id)), [servicesFiltres]);

  const personnelFiltre = useMemo(() => {
    return personnel.filter((p) => !p.etablissement_id || p.etablissement_id === selectedEtablissementId || serviceIds.has(p.service_id));
  }, [personnel, selectedEtablissementId, serviceIds]);

  const personnelIds = useMemo(() => new Set(personnelFiltre.map((p) => p.id)), [personnelFiltre]);

  const gardesFiltrees = useMemo(() => {
    return gardes.filter((g) => !g.etablissement_id || g.etablissement_id === selectedEtablissementId || serviceIds.has(g.service_id) || personnelIds.has(g.personnel_id));
  }, [gardes, selectedEtablissementId, serviceIds, personnelIds]);

  const congesFiltres = useMemo(() => {
    return conges.filter((c) => !c.etablissement_id || c.etablissement_id === selectedEtablissementId || personnelIds.has(c.personnel_id));
  }, [conges, selectedEtablissementId, personnelIds]);

  const patientsFiltres = useMemo(() => {
    return patients.filter((p) => !p.etablissement_id || p.etablissement_id === selectedEtablissementId);
  }, [patients, selectedEtablissementId]);

  const rendezVousFiltres = useMemo(() => {
    return rendezVous.filter((r) => !r.etablissement_id || r.etablissement_id === selectedEtablissementId || personnelIds.has(r.medecin_id));
  }, [rendezVous, selectedEtablissementId, personnelIds]);

  const litsFiltres = useMemo(() => {
    return lits.filter((l) => !l.etablissement_id || l.etablissement_id === selectedEtablissementId || serviceIds.has(l.service_id));
  }, [lits, selectedEtablissementId, serviceIds]);

  const interventionsFiltrees = useMemo(() => {
    return interventions.filter((i) => !i.etablissement_id || i.etablissement_id === selectedEtablissementId || personnelIds.has(i.chirurgien_id));
  }, [interventions, selectedEtablissementId, personnelIds]);

  const examensFiltres = useMemo(() => {
    return examens.filter((e) => !e.etablissement_id || e.etablissement_id === selectedEtablissementId || serviceIds.has(e.service_id));
  }, [examens, selectedEtablissementId, serviceIds]);

  const stocksPharmacieFiltres = useMemo(() => {
    return stocksPharmacie.filter((m) => !m.etablissement_id || m.etablissement_id === selectedEtablissementId);
  }, [stocksPharmacie, selectedEtablissementId]);

  const facturesFiltrees = useMemo(() => {
    return factures.filter((f) => !f.etablissement_id || f.etablissement_id === selectedEtablissementId);
  }, [factures, selectedEtablissementId]);

  // KPIs et statistiques calculées pour l'hôpital sélectionné
  const kpis = useMemo(() => {
    const totalLits = litsFiltres.length;
    const totalLitsOccupes = litsFiltres.filter((l) => l.statut === "Occupé").length;
    const tauxOccupationLits = totalLits ? Math.round((totalLitsOccupes / totalLits) * 100) : 0;

    const gardesCouvertes = gardesFiltrees.filter((g) => g.statut.includes("Confirmée")).length;
    const alertesRupture = stocksPharmacieFiltres.filter((m) => m.quantite_stock <= m.seuil_alerte).length;
    const recettesTotal = facturesFiltrees.reduce((s, f) => s + Number(f.total_ttc_fcfa || 0), 0);
    const partPriseEnChargeCSU = facturesFiltrees.reduce((s, f) => s + Number(f.part_csu_fcfa || 0), 0);

    return {
      totalEtablissements: etablissements.length,
      totalPersonnel: personnelFiltre.length,
      totalPatients: patientsFiltres.length,
      totalLits,
      totalLitsOccupes,
      tauxOccupationLits,
      gardesCouvertes,
      totalGardes: gardesFiltrees.length,
      alertesRupture,
      recettesTotal,
      partPriseEnChargeCSU,
    };
  }, [etablissements, personnelFiltre, patientsFiltres, gardesFiltrees, litsFiltres, stocksPharmacieFiltres, facturesFiltrees]);

  // Données graphiques d'occupation par service
  const litsParServiceData = useMemo(() => {
    const serviceCounts = {};
    servicesFiltres.forEach((s) => {
      serviceCounts[s.nom] = { total: 0, occupes: 0 };
    });
    litsFiltres.forEach((l) => {
      if (!serviceCounts[l.service_nom]) {
        serviceCounts[l.service_nom] = { total: 0, occupes: 0 };
      }
      serviceCounts[l.service_nom].total += 1;
      if (l.statut === "Occupé") {
        serviceCounts[l.service_nom].occupes += 1;
      }
    });

    return Object.keys(serviceCounts)
      .filter((nom) => serviceCounts[nom].total > 0)
      .map((nom) => ({
        nom: nom.split(" ")[0],
        total: serviceCounts[nom].total,
        occupes: serviceCounts[nom].occupes,
        taux: Math.round((serviceCounts[nom].occupes / serviceCounts[nom].total) * 100),
      }));
  }, [servicesFiltres, litsFiltres]);

  // Action rapide : changement d'état d'un lit (Disponible / Occupé / En désinfection / Réservé)
  const handleToggleLitStatut = (litId, nouveauStatut) => {
    setLits(
      lits.map((l) => {
        if (l.id === litId) {
          return {
            ...l,
            statut: nouveauStatut,
            patient_nom: nouveauStatut === "Disponible" || nouveauStatut === "En désinfection" ? null : l.patient_nom,
            date_admission: nouveauStatut === "Occupé" && !l.date_admission ? new Date().toISOString().slice(0, 16).replace("T", " ") : l.date_admission,
          };
        }
        return l;
      })
    );
    showToast(`Statut du lit mis à jour en "${nouveauStatut}".`, "success");
  };

  // Action rapide : validation / rejet d'un congé
  const handleUpdateCongeStatut = (congeId, statut) => {
    setConges(
      conges.map((c) => (c.id === congeId ? { ...c, statut } : c))
    );
    showToast(`Demande de congé mise à jour : "${statut}".`, "success");
  };

  // Action rapide : validation d'un examen médical
  const handleValiderExamen = (examenId) => {
    setExamens(
      examens.map((ex) =>
        ex.id === examenId
          ? { ...ex, statut: `Validé par Dr. (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})` }
          : ex
      )
    );
    showToast("Résultat d'examen validé et archivé au dossier patient.", "success");
  };

  // Action rapide : suppression générique
  const handleDeleteItem = (type, id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;
    if (type === "etablissement") setEtablissements(etablissements.filter((e) => e.id !== id));
    if (type === "personnel") setPersonnel(personnel.filter((p) => p.id !== id));
    if (type === "garde") setGardes(gardes.filter((g) => g.id !== id));
    if (type === "conge") setConges(conges.filter((c) => c.id !== id));
    if (type === "patient") setPatients(patients.filter((p) => p.id !== id));
    if (type === "rdv") setRendezVous(rendezVous.filter((r) => r.id !== id));
    if (type === "lit") setLits(lits.filter((l) => l.id !== id));
    if (type === "intervention") setInterventions(interventions.filter((i) => i.id !== id));
    if (type === "examen") setExamens(examens.filter((e) => e.id !== id));
    if (type === "medicament") setStocksPharmacie(stocksPharmacie.filter((m) => m.id !== id));
    if (type === "facture") setFactures(factures.filter((f) => f.id !== id));
    showToast("Élément supprimé avec succès.", "info");
  };

  // Export Excel Universel
  const handleExportExcel = (type) => {
    if (!peutExporterSante) { showToast("Export réservé aux profils habilités (MINSANTE, direction d'hôpital).", "error"); return; }
    let data = [];
    let filename = `SYNGESP_${type.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    if (type === "personnel") {
      data = personnelFiltre.map((p) => ({
        Matricule: p.matricule,
        Nom: `${p.titre} ${p.nom} ${p.prenom}`,
        Catégorie: p.categorie,
        Spécialité: p.specialite,
        Service: p.service_nom,
        Téléphone: p.telephone,
        Statut: p.statut,
        "Gardes ce mois": p.nb_gardes_mois,
        "Solde Congés (Jours)": p.solde_conges_jours,
      }));
    } else if (type === "gardes") {
      data = gardesFiltrees.map((g) => ({
        Service: g.service_nom,
        Date: g.date_garde,
        Personnel: g.personnel_nom,
        Type: g.type_garde,
        Période: g.periode,
        Rôle: g.role_garde,
        Statut: g.statut,
      }));
    } else if (type === "pharmacie") {
      data = stocksPharmacie.map((m) => ({
        Code: m.code_dci,
        Désignation: m.designation,
        Forme: m.forme,
        "Stock Actuel": m.quantite_stock,
        "Seuil d'alerte": m.seuil_alerte,
        Lot: m.lot,
        Péremption: m.peremption,
        "Prix Unitaire (FCFA)": m.prix_unitaire_fcfa,
        "Couvert par CSU": m.couverture_csu ? "OUI" : "NON",
      }));
    } else if (type === "lits") {
      data = litsFiltres.map((l) => ({
        "Numéro Lit": l.numero_lit,
        Chambre: l.chambre,
        Service: l.service_nom,
        Statut: l.statut,
        "Patient Occupant": l.patient_nom || "N/A",
        "Date Admission": l.date_admission || "N/A",
      }));
    } else if (type === "facturation") {
      data = facturesFiltrees.map((f) => ({
        "Facture N°": f.numero,
        Patient: f.patient_nom,
        "IP Patient": f.ip_unique,
        Prestations: f.prestations,
        "Total TTC (FCFA)": f.total_ttc_fcfa,
        "Pris en Charge CSU": f.part_csu_fcfa,
        "Part Patient (FCFA)": f.ticket_moderateur_patient_fcfa,
        "Mode Paiement": f.mode_reglement,
        Référence: f.reference_transaction,
        Date: f.date_facture,
      }));
    } else if (type === "audit") {
      data = auditLog.map((a) => ({
        Horodatage: a.horodatage,
        Utilisateur: a.utilisateur_nom,
        Rôle: a.role,
        Établissement: a.etablissement_nom,
        Action: a.action,
        "Table Cible": a.table_cible,
        "ID Enregistrement": a.enregistrement_id,
        Statut: a.statut,
        "IP / Terminal": a.ip_terminal,
      }));
    } else if (type === "utilisateurs") {
      data = utilisateurs.map((u) => ({
        "Nom Complet": u.nom_complet,
        Email: u.email,
        Téléphone: u.telephone,
        Rôle: u.role,
        Établissement: u.etablissement_nom,
        Service: u.service_nom,
        Statut: u.statut,
        "Date Création": u.date_creation,
        "Dernière Connexion": u.derniere_connexion,
      }));
    }

    if (data.length === 0) {
      showToast("Aucune donnée à exporter pour ce tableau.", "warning");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type.toUpperCase());
    XLSX.writeFile(wb, filename);
    showToast(`Fichier Excel ${filename} téléchargé !`, "success");
  };

  // Export PDF : Bulletin d'admission patient
  const handleExportBulletinPDF = (patient) => {
    if (!peutExporterSante) { showToast("Édition de document réservée aux profils habilités.", "error"); return; }
    try {
      const doc = new jsPDF();
      doc.setFillColor(10, 26, 34);
      doc.rect(0, 0, 210, 35, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("RÉPUBLIQUE DU CAMEROUN — MINISTÈRE DE LA SANTÉ PUBLIQUE", 14, 16);
      try {
        const logoHosp = localStorage.getItem("rtc_client_logo") || "data:image/png;base64,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";
        doc.addImage(logoHosp, "PNG", 175, 4, 24, 24);
      } catch (eHosp) {}
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const nomHopital = localStorage.getItem("rtc_institution_nom") || "Formation Hospitalière & Centre Médical";
      doc.text(nomHopital.toUpperCase(), 14, 25);

      doc.setTextColor(30, 143, 166);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("BULLETIN OFFICIEL D'ADMISSION & COUVERTURE SANTÉ", 14, 48);

      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Identifiant Patient Unique (IP) : ${patient.ip_unique}`, 14, 60);
      doc.text(`Nom & Prénom : ${patient.nom} ${patient.prenom}`, 14, 66);
      doc.text(`Âge : ${patient.age} ans | Sexe : ${patient.sexe} | Groupe Sanguin : ${patient.groupe_sanguin}`, 14, 72);
      doc.text(`Téléphone : ${patient.telephone} | Ville : ${patient.ville}`, 14, 78);

      doc.setFillColor(240, 245, 248);
      doc.rect(14, 88, 182, 32, "F");
      doc.setFont("helvetica", "bold");
      doc.text("Régime de Prise en Charge & Affectation :", 18, 96);
      doc.setFont("helvetica", "normal");
      doc.text(`${patient.couverture} ${patient.csu_matricule ? `(Matricule CSU : ${patient.csu_matricule})` : ""}`, 18, 104);
      doc.text(`Lit & Chambre Affectés : ${patient.chambre_lit}`, 18, 112);

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("Document certifié conforme aux normes de traçabilité des soins et de protection des données (Loi N° 2024/017).", 14, 150);

      doc.save(`Bulletin_Admission_${patient.ip_unique}.pdf`);
      showToast(`Bulletin d'admission de ${patient.nom} téléchargé en PDF.`, "success");
    } catch (e) {
      showToast("Erreur lors de la génération PDF : " + e.message, "error");
    }
  };

  // Export PDF : Reçu officiel de soins et facturation CSU
  const handleExportFacturePDF = (fac) => {
    if (!peutExporterSante) { showToast("Édition de quittance réservée aux profils habilités.", "error"); return; }
    try {
      const doc = new jsPDF();
      doc.setFillColor(10, 26, 34);
      doc.rect(0, 0, 210, 35, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("RÉPUBLIQUE DU CAMEROUN — MINISTÈRE DE LA SANTÉ PUBLIQUE", 14, 16);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const nomHopital = localStorage.getItem("rtc_institution_nom") || "Formation Hospitalière & Centre Médical";
      doc.text(nomHopital.toUpperCase() + " — Quittance Officielle CSU", 14, 25);
      try {
        const logoHosp = localStorage.getItem("rtc_client_logo") || "data:image/png;base64,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";
        doc.addImage(logoHosp, "PNG", 175, 4, 24, 24);
      } catch (eHosp) {}

      doc.setTextColor(30, 143, 166);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(`REÇU DE RÈGLEMENT N° ${fac.numero}`, 14, 48);

      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Date de facturation : ${fac.date_facture}`, 14, 58);
      doc.text(`Patient bénéficiaire : ${fac.patient_nom} (IP: ${fac.ip_unique})`, 14, 64);
      doc.text(`Prestations médicales : ${fac.prestations}`, 14, 70);

      doc.setFillColor(240, 245, 248);
      doc.rect(14, 80, 182, 45, "F");
      doc.setFont("helvetica", "bold");
      doc.text(`Montant Total TTC : ${formatFCFA(fac.total_ttc_fcfa)}`, 18, 90);
      doc.setTextColor(39, 110, 144);
      doc.text(`Pris en charge Couverture Santé Universelle (80%) : - ${formatFCFA(fac.part_csu_fcfa)}`, 18, 98);
      doc.setTextColor(30, 143, 166);
      doc.text(`Net Payé par le Patient (Ticket Modérateur) : ${formatFCFA(fac.ticket_moderateur_patient_fcfa)}`, 18, 106);
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "normal");
      doc.text(`Mode de paiement : ${fac.mode_reglement} (Réf : ${fac.reference_transaction})`, 18, 116);

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("Quittance certifiée par la régie des recettes hospitalières et la Couverture Santé Universelle.", 14, 150);

      doc.save(`Recu_${fac.numero}.pdf`);
      showToast(`Quittance ${fac.numero} téléchargée en PDF !`, "success");
    } catch (e) {
      showToast("Erreur lors de la génération du reçu PDF : " + e.message, "error");
    }
  };

  // Disponibilité du module, pilotée par l'Administrateur système RTC depuis le portail —
  // même comportement que les autres modules de l'écosystème. La prop syngespActif était
  // jusqu'ici déclarée mais jamais exploitée : la désactivation restait sans effet.
  if (!syngespActif && sessionRole !== "admin") {
    return (
      <div className="w-full min-h-screen bg-[#0A1A22] text-[#EAF2F4] flex items-center justify-center flex-col gap-4 p-10 text-center font-sans">
        <HeartPulse size={40} className="text-[#1E8FA6]" />
        <div className="text-base font-semibold">SYNGESHP-CAM est actuellement indisponible</div>
        <p className="text-sm text-[#8FA8B0] max-w-md">
          Ce module a été temporairement désactivé par l'Administrateur système RTC. Veuillez réessayer plus tard ou contacter votre référent.
        </p>
        
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0A1A22] text-[#EAF2F4] flex flex-col font-sans">
      {/* Toast de Notification In-App */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-xs animate-bounce transition-all ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : toastMessage.type === "error"
              ? "bg-red-950/90 border-red-500/50 text-red-200"
              : "bg-amber-950/90 border-amber-500/50 text-amber-200"
          }`}
        >
          {toastMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span className="font-medium">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/60 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Barre de navigation supérieure Odoo ERP */}
      <header className="px-6 py-3 bg-[#1E1F29] border-b border-[#2E3040] flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            title="Tableau de bord"
            className="w-9 h-9 rounded-lg bg-[#714B67] hover:bg-[#86597a] flex items-center justify-center text-white transition-all shadow active:scale-95 shrink-0"
          >
            <LayoutGrid size={18} />
          </button>
          <img src={localStorage.getItem("rtc_client_logo") || "/assets/logo/client_logo.png"} alt="Logo" className="w-9 h-9 rounded-lg object-contain bg-white/5 border border-white/10 shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                <span className="truncate max-w-[180px]" title={localStorage.getItem("rtc_institution_nom") || "SYNGESHP-CAM"}>{localStorage.getItem("rtc_institution_nom") || "SYNGESHP-CAM"}</span>
                <span className="text-white/30 hidden sm:inline">/</span>
                <span className="text-[#00A09D] text-xs font-sans font-semibold hidden sm:inline">
                  {activeTab === "dashboard" && (lang === "en" ? "Dashboard & KPIs" : "Tableau de Bord & KPIs")}
                  {activeTab === "etablissements" && (lang === "en" ? "Hospitals & Facilities" : "Établissements & Pôles")}
                  {activeTab === "personnel" && (lang === "en" ? "Medical Staff & HR" : "Personnel Médical & RH")}
                  {activeTab === "gardes" && (lang === "en" ? "Duty Rosters & Shifts" : "Plannings & Gardes")}
                  {activeTab === "conges" && (lang === "en" ? "Leaves & Absences" : "Congés & Absences")}
                  {activeTab === "rendezvous" && (lang === "en" ? "Patient Records & Appts" : "Dossiers Patients & RDV")}
                  {activeTab === "lits" && (lang === "en" ? "Beds & Inpatients" : "Lits & Hospitalisations")}
                  {activeTab === "bloc" && (lang === "en" ? "Operating Theatre" : "Bloc Opératoire")}
                  {activeTab === "laboratoire" && (lang === "en" ? "Laboratory & Imaging" : "Laboratoire & Imagerie")}
                  {activeTab === "pharmacie" && (lang === "en" ? "Pharmacy & Stocks" : "Pharmacie & Stocks")}
                  {activeTab === "facturation" && (lang === "en" ? "Billing & UHC Insurance" : "Facturation & CSU")}
                  {activeTab === "evenements" && (lang === "en" ? "Medical Events & Calendar" : "Événements & Gardes")}
                  {activeTab === "chat" && (lang === "en" ? "Hospital Team Chat" : "Chat Médical & Équipe")}
                  {activeTab === "administration" && (lang === "en" ? "SYNGESHP Administration" : "Administration SYNGESHP")}
                </span>
              </h1>
              
            </div>
            <p className="text-[11px] text-[#8FA8B0]">
              {lang === "en"
                ? "National Hospital Management & Health Planning System (MINSANTE)"
                : "Système Numérique de Gestion des Établissements de Santé & Planification Hospitalière"}
            </p>
          </div>
        </div>

        {/* Boutons d'action et indicateur Supabase */}
        <div className="flex items-center gap-3">
          {/* Sélecteur / Badge d'hôpital avec isolation stricte */}
          {isNationalAdmin ? (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#102530] border border-[#1E8FA6]/40 text-xs">
              <Building2 size={14} className="text-[#1E8FA6]" />
              <select
                value={selectedEtablissementId}
                onChange={(e) => {
                  setSelectedEtablissementId(e.target.value);
                  const etab = etablissements.find((x) => x.id === e.target.value);
                  if (etab) showToast(`Vue basculée sur : ${etab.nom}`, "info");
                }}
                className="bg-transparent border-none text-white text-xs outline-none cursor-pointer"
              >
                {etablissements.map((etab) => (
                  <option key={etab.id} value={etab.id} className="bg-[#0D1F28]">
                    {etab.nom}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#102530] border border-teal-500/40 text-teal-200 text-xs font-semibold shadow-sm">
              <Building2 size={14} className="text-[#1E8FA6]" />
              <span>{etablissementActif?.nom || "Mon Hôpital"}</span>
            </div>
          )}

          {/* Badge Profil / Profession Médicale */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#15303C] border border-white/10 text-[11px] text-[#8FA8B0]">
            <span className="text-[#5FC2D6] font-semibold">{currentProfession}</span>
            <span>•</span>
            <span className="text-gray-300">{adminNom}</span>
          </div>

          <LanguageSwitcher />
        </div>
      </header>

      {/* Corps : Sidebar de navigation + Vue principale */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar des 10 modules hospitaliers */}
        <aside className="w-64 bg-[#0D1F28] border-r border-white/10 flex flex-col justify-between p-3 shrink-0">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-[#8FA8B0]">
              {lang === "en" ? "Hospital Modules" : "Modules Hospitaliers"}
            </div>

            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "dashboard" ? "bg-[#714B67] text-white shadow-sm font-bold" : "text-[#8FA8B0] hover:bg-white/5 hover:text-white"
              }`}
            >
              <LayoutDashboard size={15} />
              <span>{t("nav_syngeshp_dashboard", "Tableau de Bord & KPIs")}</span>
            </button>

            {isDirecteur && (
              <button
                onClick={() => setActiveTab("etablissements")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "etablissements" ? "bg-[#714B67] text-white shadow-sm font-bold" : "text-[#8FA8B0] hover:bg-white/5 hover:text-white"
                }`}
              >
                <Building2 size={15} />
                <div className="flex-1 flex items-center justify-between">
                  <span>{t("nav_hospitals", "Établissements & Pôles")}</span>
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/10">{etablissements.length}</span>
                </div>
              </button>
            )}

            {isDirecteur && (
              <button
                onClick={() => setActiveTab("personnel")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "personnel" ? "bg-[#714B67] text-white shadow-sm font-bold" : "text-[#8FA8B0] hover:bg-white/5 hover:text-white"
                }`}
              >
                <Stethoscope size={15} />
                <div className="flex-1 flex items-center justify-between">
                  <span>{t("nav_medical_staff", "Personnel Médical & RH")}</span>
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/10">{personnelFiltre.length}</span>
                </div>
              </button>
            )}

            {(isDirecteur || isMedecin || isInfirmier) && (
              <button
                onClick={() => setActiveTab("gardes")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "gardes" ? "bg-[#714B67] text-white shadow-sm font-bold" : "text-[#8FA8B0] hover:bg-white/5 hover:text-white"
                }`}
              >
                <Calendar size={15} />
                <div className="flex-1 flex items-center justify-between">
                  <span>{t("nav_shifts", "Plannings & Gardes")}</span>
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300 font-bold">{gardesFiltrees.length}</span>
                </div>
              </button>
            )}

            {(isDirecteur || isMedecin || isInfirmier) && (
              <button
                onClick={() => setActiveTab("conges")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "conges" ? "bg-[#714B67] text-white shadow-sm font-bold" : "text-[#8FA8B0] hover:bg-white/5 hover:text-white"
                }`}
              >
                <Clock size={15} />
                <div className="flex-1 flex items-center justify-between">
                  <span>{t("nav_leaves", "Congés & Absences")}</span>
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/10">{congesFiltres.length}</span>
                </div>
              </button>
            )}

            {(isDirecteur || isMedecin) && (
              <button
                onClick={() => setActiveTab("rendezvous")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "rendezvous" ? "bg-[#714B67] text-white shadow-sm font-bold" : "text-[#8FA8B0] hover:bg-white/5 hover:text-white"
                }`}
              >
                <Users size={15} />
                <div className="flex-1 flex items-center justify-between">
                  <span>{t("nav_patients", "Dossiers Patients & RDV")}</span>
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/10">{rendezVousFiltres.length}</span>
                </div>
              </button>
            )}

            {(isDirecteur || isMedecin || isInfirmier) && (
              <button
                onClick={() => setActiveTab("lits")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "lits" ? "bg-[#714B67] text-white shadow-sm font-bold" : "text-[#8FA8B0] hover:bg-white/5 hover:text-white"
                }`}
              >
                <Bed size={15} />
                <div className="flex-1 flex items-center justify-between">
                  <span>{t("nav_beds", "Lits & Hospitalisations")}</span>
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-300 font-mono">
                    {kpis.tauxOccupationLits}%
                  </span>
                </div>
              </button>
            )}

            <button
              onClick={() => setActiveTab("bloc")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "bloc" ? "bg-[#714B67] text-white shadow-sm font-bold" : "text-[#8FA8B0] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Scissors size={15} />
              <div className="flex-1 flex items-center justify-between">
                <span>{t("nav_operating_theatre", "Bloc Opératoire")}</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/10">{interventions.length}</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("laboratoire")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "laboratoire" ? "bg-[#714B67] text-white shadow-sm font-bold" : "text-[#8FA8B0] hover:bg-white/5 hover:text-white"
              }`}
            >
              <FlaskConical size={15} />
              <div className="flex-1 flex items-center justify-between">
                <span>{t("nav_lab_imaging", "Laboratoire & Imagerie")}</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/10">{examens.length}</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("pharmacie")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "pharmacie" ? "bg-[#714B67] text-white shadow-sm font-bold" : "text-[#8FA8B0] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Pill size={15} />
              <div className="flex-1 flex items-center justify-between">
                <span>{t("nav_pharmacy", "Pharmacie & Stocks")}</span>
                {kpis.alertesRupture > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-red-500/20 text-red-300 font-bold">
                    {kpis.alertesRupture}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab("facturation")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "facturation" ? "bg-[#714B67] text-white shadow-sm font-bold" : "text-[#8FA8B0] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Receipt size={15} />
              <div className="flex-1 flex items-center justify-between">
                <span>{t("nav_csu_billing", "Facturation & CSU")}</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/10">{factures.length}</span>
              </div>
            </button>

            {/* Événements & Synchronisation Gmail */}
            <button
              onClick={() => setActiveTab("evenements")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "evenements" ? "bg-[#714B67] text-white shadow-sm font-bold" : "text-[#8FA8B0] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Calendar size={15} className="text-[#00A09D]" />
              <div className="flex-1 flex items-center justify-between">
                <span>{lang === "en" ? "Events & Calendar" : "Événements & Gardes"}</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[#00A09D]/20 text-[#5FC2D6] font-bold">Gmail</span>
              </div>
            </button>

            {/* Chat Médical d'équipe */}
            <button
              onClick={() => setActiveTab("chat")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "chat" ? "bg-[#714B67] text-white shadow-sm font-bold" : "text-[#8FA8B0] hover:bg-white/5 hover:text-white"
              }`}
            >
              <MessageSquare size={15} className="text-[#5FC2D6]" />
              <div className="flex-1 flex items-center justify-between">
                <span>{lang === "en" ? "Hospital Team Chat" : "Chat Médical"}</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300 font-bold">Direct</span>
              </div>
            </button>

            {/* Module Administration SYNGESHP */}
            <button
              onClick={() => setActiveTab("administration")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors mt-2 border border-emerald-500/30 ${
                activeTab === "administration" ? "bg-emerald-600 text-white shadow-sm font-bold" : "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
              }`}
            >
              <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
              <div className="flex-1 flex items-center justify-between text-left">
                <span className="truncate">{t("nav_syngeshp_admin", "Administration SYNGESHP")}</span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-black/40 text-emerald-300">ADMIN</span>
              </div>
            </button>
          </div>

          {/* Section Inférieure */}
          <div className="p-3 border-t border-white/10 mt-auto bg-[#0A1A22]/80">
            <div className="text-[10px] uppercase tracking-wider text-[#8FA8B0] font-mono mb-2 px-1">
              SESSION
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 mb-2.5">
              <div className="text-xs text-white font-bold truncate">{adminNom}</div>
              <div className="text-[11px] text-teal-300 font-mono mt-0.5">
                {sessionProfession || (sessionRole === "medecin" ? "Médecin traitant" : sessionRole === "infirmier" ? "Personnel soignant" : sessionRole === "pharmacien" ? "Pharmacien" : "Administrateur hospitalier")}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => { if (onLock) onLock(); else window.dispatchEvent(new CustomEvent("rtc_lock_session")); }}
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 text-xs font-medium transition-all active:scale-98"
                title="Verrouiller la session en cours"
              >
                <Lock size={13} />
                <span>Verrouiller</span>
              </button>
              <button
                type="button"
                onClick={() => { if (onLogout) onLogout(); else window.dispatchEvent(new CustomEvent("rtc_logout")); }}
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/25 text-xs font-medium transition-all active:scale-98"
                title="Fermer la session et se déconnecter"
              >
                <LogOut size={13} />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Zone de contenu principale */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* =========================================================================
              1. TAB : TABLEAU DE BORD EXÉCUTIF & SANTÉ PUBLIQUE
             ========================================================================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <SyngespHospitalOnboardingBanner hopitalNom={etablissementActif?.nom || "Hôpital"} profession={sessionProfession} />
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Tableau de Bord Exécutif & Pilotage Hospitalier
                  </h2>
                  <p className="text-xs text-[#8FA8B0]">
                    Indicateurs clés de performance hospitalière, lits en temps réel, couverture des gardes et Couverture Santé Universelle (CSU).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportExcel("personnel")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs border border-white/10 text-white transition-colors"
                  >
                    <Download size={13} /> Rapport Excel Personnel
                  </button>
                  <button
                    onClick={() => handleExportExcel("lits")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs border border-white/10 text-white transition-colors"
                  >
                    <Download size={13} /> Rapport Excel Lits
                  </button>
                </div>
              </div>

              {/* Cartes KPI */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#102530] border border-white/10 relative overflow-hidden">
                  <div className="flex items-center justify-between text-[#8FA8B0]">
                    <span className="text-xs font-medium uppercase tracking-wider">Taux d'Occupation Lits</span>
                    <Bed size={18} className="text-[#1E8FA6]" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-2 font-mono">
                    {kpis.tauxOccupationLits}%
                  </div>
                  <div className="text-xs text-[#8FA8B0] mt-2">
                    {kpis.totalLitsOccupes} lits occupés sur {kpis.totalLits} au total
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#102530] border border-white/10 relative overflow-hidden">
                  <div className="flex items-center justify-between text-[#8FA8B0]">
                    <span className="text-xs font-medium uppercase tracking-wider">Couverture des Gardes</span>
                    <Calendar size={18} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-2 font-mono">
                    100%
                  </div>
                  <div className="text-xs text-emerald-400 mt-2">
                    {kpis.gardesCouvertes} gardes 24h & astreintes pourvues
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#102530] border border-white/10 relative overflow-hidden">
                  <div className="flex items-center justify-between text-[#8FA8B0]">
                    <span className="text-xs font-medium uppercase tracking-wider">Prise en Charge CSU</span>
                    <Receipt size={18} className="text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-2 font-mono">
                    {formatFCFA(kpis.partPriseEnChargeCSU)}
                  </div>
                  <div className="text-xs text-[#8FA8B0] mt-2">
                    Sur {formatFCFA(kpis.recettesTotal)} facturés au total
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#102530] border border-white/10 relative overflow-hidden">
                  <div className="flex items-center justify-between text-[#8FA8B0]">
                    <span className="text-xs font-medium uppercase tracking-wider">Stocks Pharmacie</span>
                    <Pill size={18} className={kpis.alertesRupture > 0 ? "text-red-400" : "text-emerald-400"} />
                  </div>
                  <div className="text-2xl font-bold text-white mt-2 font-mono">
                    {kpis.alertesRupture > 0 ? `${kpis.alertesRupture} Alerte Rupture` : "Stocks Optimaux"}
                  </div>
                  <div className="text-xs text-amber-300 mt-2">
                    Traçabilité DCI & lots d'urgence active
                  </div>
                </div>
              </div>

              {/* Graphiques Analytiques */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Taux d'occupation par service */}
                <div className="lg:col-span-2 p-5 rounded-xl bg-[#102530] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Occupation des Lits par Service Hospitalier (%)</h3>
                    <span className="text-xs text-[#8FA8B0]">Temps Réel</span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={litsParServiceData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="nom" stroke="#8FA8B0" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#8FA8B0" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0D1F28", borderColor: "rgba(255,255,255,0.1)", borderRadius: 8 }}
                          formatter={(val) => [`${val}%`, "Taux d'occupation"]}
                        />
                        <Bar dataKey="taux" fill="#1E8FA6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Statut des Lits (Camembert) */}
                <div className="p-5 rounded-xl bg-[#102530] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Répartition Statut des Lits</h3>
                    <span className="text-xs text-[#8FA8B0]">Capacité</span>
                  </div>
                  <div className="h-64 flex flex-col justify-center items-center">
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Occupés", value: kpis.totalLitsOccupes, color: "#D2483E" },
                            { name: "Disponibles", value: Math.max(0, kpis.totalLits - kpis.totalLitsOccupes - 1), color: "#3FA772" },
                            { name: "En Désinfection", value: 1, color: "#E8A33D" },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          <Cell fill="#D2483E" />
                          <Cell fill="#3FA772" />
                          <Cell fill="#E8A33D" />
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#0D1F28", borderColor: "rgba(255,255,255,0.1)", borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 text-[10px] text-[#8FA8B0]">
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#D2483E]" /> Occupés</div>
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3FA772]" /> Dispos</div>
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E8A33D]" /> Désinfection</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gardes du Jour & Alertes Médicales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tableau des gardes actives */}
                <div className="p-5 rounded-xl bg-[#102530] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calendar size={16} className="text-[#1E8FA6]" />
                      Équipes Médicales de Garde (Aujourd'hui)
                    </h3>
                    <button onClick={() => setActiveTab("gardes")} className="text-xs text-[#1E8FA6] hover:underline">
                      Planning complet
                    </button>
                  </div>
                  <div className="space-y-2">
                    {gardes.slice(0, 3).map((g) => (
                      <div key={g.id} className="p-3 bg-[#0D1F28] rounded-lg border border-white/5 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">{g.personnel_nom}</div>
                          <div className="text-[11px] text-[#8FA8B0]">{g.service_nom} • <span className="text-[#1E8FA6]">{g.role_garde}</span></div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-medium">
                          {g.type_garde}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bloc Opératoire & Urgences en cours */}
                <div className="p-5 rounded-xl bg-[#102530] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Scissors size={16} className="text-amber-400" />
                      Interventions au Bloc & Urgences
                    </h3>
                    <button onClick={() => setActiveTab("bloc")} className="text-xs text-[#1E8FA6] hover:underline">
                      Voir le bloc
                    </button>
                  </div>
                  <div className="space-y-2">
                    {interventions.map((inter) => (
                      <div key={inter.id} className="p-3 bg-[#0D1F28] rounded-lg border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{inter.salle_bloc}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300">{inter.statut}</span>
                        </div>
                        <div className="text-xs text-[#1E8FA6] font-medium">{inter.type_intervention}</div>
                        <div className="text-[11px] text-[#8FA8B0]">
                          Chirurgien : {inter.chirurgien_principal} • Patient : {inter.patient_nom}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              2. TAB : ÉTABLISSEMENTS & PÔLES HOSPITALIERS
             ========================================================================= */}
          {activeTab === "etablissements" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Cartographie des Établissements de Santé du Cameroun
                  </h2>
                  <p className="text-xs text-[#8FA8B0]">
                    Hôpitaux Généraux, CHU, Hôpitaux Régionaux, Hôpitaux de District et Centres Médicaux d'Arrondissement (CMA).
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedItem(null); setModalType("etablissement"); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1E8FA6] hover:bg-[#28abc7] text-xs font-semibold text-white transition-colors"
                >
                  <Plus size={14} /> Nouvel Établissement
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {etablissements.map((etab) => (
                  <div key={etab.id} className="p-5 rounded-xl bg-[#102530] border border-white/10 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1E8FA6]/20 text-[#1E8FA6]">
                            {etab.code}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-medium">
                            {etab.statut_juridique}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1.5">{etab.nom}</h3>
                        <div className="text-[11px] text-[#8FA8B0]">{etab.type_etablissement}</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-xs text-[#8FA8B0]">Capacité</div>
                        <div className="text-lg font-bold text-white">{etab.capacite_lits} lits</div>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-[#8FA8B0] pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-[#8FA8B0]" />
                        <span>{etab.adresse}, {etab.ville} ({etab.region} - {etab.departement})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PhoneCall size={13} className="text-[#8FA8B0]" />
                        <span className="font-mono text-white">{etab.telephone}</span> • <span>Resp : {etab.responsable}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {etab.services_actifs?.map((srv, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-[#0D1F28] border border-white/5 text-[#EAF2F4]">
                            {srv}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => { setSelectedItem(etab); setModalType("etablissement"); }}
                          className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-[#8FA8B0] hover:text-white"
                          title="Modifier"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem("etablissement", etab.id)}
                          className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-[#8FA8B0] hover:text-red-300"
                          title="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              3. TAB : PERSONNEL MÉDICAL & RESSOURCES HUMAINES
             ========================================================================= */}
          {activeTab === "personnel" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Personnel Médical, Soignant & Ressources Humaines
                  </h2>
                  <p className="text-xs text-[#8FA8B0]">
                    Médecins spécialistes, généralistes, infirmiers, sages-femmes, laborantins et pharmaciens.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportExcel("personnel")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs border border-white/10 text-white transition-colors"
                  >
                    <Download size={13} /> Export Excel
                  </button>
                  <button
                    onClick={() => { setSelectedItem(null); setModalType("personnel"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1E8FA6] hover:bg-[#28abc7] text-xs font-semibold text-white transition-colors"
                  >
                    <UserPlus size={14} /> Nouveau Praticien
                  </button>
                </div>
              </div>

              {/* Recherche */}
              <div className="flex items-center gap-3 p-3 bg-[#102530] rounded-xl border border-white/10">
                <Search size={16} className="text-[#8FA8B0]" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, matricule MINSANTE, spécialité ou service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-white placeholder-[#8FA8B0] flex-1"
                />
              </div>

              {/* Tableau du Personnel */}
              <div className="bg-[#102530] rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0D1F28] border-b border-white/10 text-[#8FA8B0] uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Praticien / Matricule</th>
                      <th className="py-3 px-4">Catégorie & Spécialité</th>
                      <th className="py-3 px-4">Service d'Affectation</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Gardes (Mois)</th>
                      <th className="py-3 px-4">Congés Dispos</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {personnel
                      .filter((p) =>
                        `${p.nom} ${p.prenom} ${p.matricule} ${p.specialite} ${p.service_nom}`.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((pers) => (
                        <tr key={pers.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">{pers.titre} {pers.nom} {pers.prenom}</div>
                            <div className="text-[10px] text-[#1E8FA6] font-mono">{pers.matricule}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white">{pers.categorie}</div>
                            <div className="text-[10px] text-[#8FA8B0]">{pers.specialite}</div>
                          </td>
                          <td className="py-3 px-4 text-white">
                            {pers.service_nom}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white font-mono">{pers.telephone}</div>
                            <div className="text-[10px] text-[#8FA8B0]">{pers.email}</div>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span className="font-bold text-white">{pers.nb_gardes_mois}</span>
                            <span className="text-[#8FA8B0]"> / {pers.nb_gardes_max} max</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                            {pers.solde_conges_jours} jours
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => { setSelectedItem(pers); setModalType("personnel"); }}
                                className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-[#8FA8B0] hover:text-white"
                                title="Modifier"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteItem("personnel", pers.id)}
                                className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-[#8FA8B0] hover:text-red-300"
                                title="Supprimer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <SyngespPagination currentPage={getTabPage('personnel')} totalItems={personnelFiltre.filter((p) => p.nom.toLowerCase().includes(searchQuery.toLowerCase()) || p.matricule.toLowerCase().includes(searchQuery.toLowerCase()) || p.specialite.toLowerCase().includes(searchQuery.toLowerCase())).length} pageSize={15} onPageChange={(p) => setTabPage('personnel', p)} label='employés et praticiens' />
              </div>
            </div>
          )}

          {/* =========================================================================
              4. TAB : PLANNINGS DES GARDES & ASTREINTES
             ========================================================================= */}
          {activeTab === "gardes" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Tableau des Gardes, Astreintes & Remplacements
                  </h2>
                  <p className="text-xs text-[#8FA8B0]">
                    Planification des gardes 12h/24h avec contrôle automatique des conflits, repos compensateurs et workflow de remplacement.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportExcel("gardes")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs border border-white/10 text-white transition-colors"
                  >
                    <Download size={13} /> Export Planning
                  </button>
                  <button
                    onClick={() => { setSelectedItem(null); setModalType("garde"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1E8FA6] hover:bg-[#28abc7] text-xs font-semibold text-white transition-colors"
                  >
                    <Plus size={14} /> Planifier une Garde
                  </button>
                </div>
              </div>

              {/* Liste des Gardes */}
              <div className="bg-[#102530] rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0D1F28] border-b border-white/10 text-[#8FA8B0] uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Date & Période</th>
                      <th className="py-3 px-4">Praticien / Agent</th>
                      <th className="py-3 px-4">Service Couvert</th>
                      <th className="py-3 px-4">Rôle Opérationnel</th>
                      <th className="py-3 px-4">Type de Garde</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {gardesFiltrees.slice((getTabPage('gardes') - 1) * 15, getTabPage('gardes') * 15).map((g) => (
                      <tr key={g.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white font-mono">{g.date_garde}</div>
                          <div className="text-[10px] text-[#8FA8B0]">{g.periode}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {g.personnel_nom}
                          {g.remplacant_nom && (
                            <div className="text-[10px] text-amber-300">Remplacé par : {g.remplacant_nom}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-white">
                          {g.service_nom}
                        </td>
                        <td className="py-3 px-4 text-[#1E8FA6]">
                          {g.role_garde}
                        </td>
                        <td className="py-3 px-4 text-[#8FA8B0]">
                          {g.type_garde}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            g.statut.includes("Confirmée") ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                          }`}>
                            {g.statut}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setSelectedItem(g); setModalType("echange_garde"); }}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-[#1E8FA6]/20 text-xs text-[#1E8FA6] border border-white/5 hover:border-[#1E8FA6]/40"
                              title="Demander un échange de garde"
                            >
                              <ArrowLeftRight size={12} />
                              <span>Échanger</span>
                            </button>
                            <button
                              onClick={() => { setSelectedItem(g); setModalType("garde"); }}
                              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-[#8FA8B0] hover:text-white"
                              title="Modifier"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem("garde", g.id)}
                              className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-[#8FA8B0] hover:text-red-300"
                              title="Supprimer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <SyngespPagination currentPage={getTabPage('personnel')} totalItems={personnelFiltre.filter((p) => p.nom.toLowerCase().includes(searchQuery.toLowerCase()) || p.matricule.toLowerCase().includes(searchQuery.toLowerCase()) || p.specialite.toLowerCase().includes(searchQuery.toLowerCase())).length} pageSize={15} onPageChange={(p) => setTabPage('personnel', p)} label='employés et praticiens' />
              </div>
            </div>
          )}

          {/* =========================================================================
              5. TAB : GESTION DES CONGÉS & ABSENCES
             ========================================================================= */}
          {activeTab === "conges" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Demandes de Congés, Missions & Absences
                  </h2>
                  <p className="text-xs text-[#8FA8B0]">
                    Circuit de validation hiérarchique (Agent → Chef de Service → RH → Direction) et calcul automatique des soldes.
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedItem(null); setModalType("conge"); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1E8FA6] hover:bg-[#28abc7] text-xs font-semibold text-white transition-colors"
                >
                  <Plus size={14} /> Déposer une Demande
                </button>
              </div>

              <div className="space-y-3">
                {congesFiltres.slice((getTabPage('conges') - 1) * 15, getTabPage('conges') * 15).map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-[#102530] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white text-sm">{c.personnel_nom}</span>
                        <span className="text-xs text-[#8FA8B0] ml-2">({c.service_nom})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-medium ${
                          c.statut.includes("Validé") ? "bg-emerald-500/20 text-emerald-300" :
                          c.statut.includes("Rejeté") ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {c.statut}
                        </span>
                        {c.statut.includes("En attente") && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateCongeStatut(c.id, "Validé par Chef de Service & RH")}
                              className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs flex items-center gap-1"
                              title="Valider la demande"
                            >
                              <Check size={12} /> Valider
                            </button>
                            <button
                              onClick={() => handleUpdateCongeStatut(c.id, "Rejeté (Sous-effectif critique)")}
                              className="px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs flex items-center gap-1"
                              title="Rejeter la demande"
                            >
                              <X size={12} /> Rejeter
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteItem("conge", c.id)}
                          className="p-1 text-[#8FA8B0] hover:text-red-300"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#8FA8B0]">
                      <div>Type : <span className="text-white font-medium">{c.type_conge}</span></div>
                      <div>Du <span className="text-white font-mono">{c.date_debut}</span> au <span className="text-white font-mono">{c.date_fin}</span> (<span className="text-[#1E8FA6] font-bold">{c.nb_jours} jours</span>)</div>
                      <div>Remplaçant : <span className="text-white">{c.remplacant_propose}</span></div>
                    </div>

                    <div className="text-xs text-[#8FA8B0] italic bg-[#0D1F28] p-2.5 rounded border border-white/5">
                      Motif : "{c.motif}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              6. TAB : RENDEZ-VOUS & DOSSIER PATIENTS
             ========================================================================= */}
          {activeTab === "rendezvous" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Rendez-vous, Consultations & Dossiers Patients
                  </h2>
                  <p className="text-xs text-[#8FA8B0]">
                    Gestion des consultations externes, numéros d'identification uniques (IP), et rappels SMS.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setSelectedItem(null); setModalType("patient"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs border border-white/10 text-white transition-colors"
                  >
                    <UserPlus size={14} /> Nouveau Dossier Patient
                  </button>
                  <button
                    onClick={() => { setSelectedItem(null); setModalType("rdv"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1E8FA6] hover:bg-[#28abc7] text-xs font-semibold text-white transition-colors"
                  >
                    <Plus size={14} /> Prendre un Rendez-vous
                  </button>
                </div>
              </div>

              {/* Tableau des Rendez-vous */}
              <div className="bg-[#102530] rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0D1F28] border-b border-white/10 text-[#8FA8B0] uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Date & Heure</th>
                      <th className="py-3 px-4">Patient / Contact</th>
                      <th className="py-3 px-4">Service & Praticien</th>
                      <th className="py-3 px-4">Motif de Consultation</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rendezVousFiltres.slice((getTabPage('rendezvous') - 1) * 15, getTabPage('rendezvous') * 15).map((r) => (
                      <tr key={r.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-white">{r.date_rdv}</div>
                          <div className="text-[10px] text-[#1E8FA6]">{r.heure_rdv}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{r.patient_nom}</div>
                          <div className="text-[10px] text-[#8FA8B0] font-mono">{r.patient_tel}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white">{r.service_nom}</div>
                          <div className="text-[10px] text-[#8FA8B0]">{r.medecin_nom}</div>
                        </td>
                        <td className="py-3 px-4 text-[#8FA8B0]">
                          {r.motif}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300">
                            {r.statut}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => showToast(`Rappel SMS envoyé avec succès au ${r.patient_tel} : "Rappel RDV à l'Hôpital le ${r.date_rdv} à ${r.heure_rdv}".`, "success")}
                              className="p-1.5 rounded bg-white/5 hover:bg-[#1E8FA6]/20 text-[#1E8FA6] hover:text-white"
                              title="Envoyer Rappel SMS"
                            >
                              <Send size={13} />
                            </button>
                            <button
                              onClick={() => { setSelectedItem(r); setModalType("rdv"); }}
                              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-[#8FA8B0] hover:text-white"
                              title="Modifier"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem("rdv", r.id)}
                              className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-[#8FA8B0] hover:text-red-300"
                              title="Supprimer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section Dossiers Patients Récents */}
              <div className="p-5 rounded-xl bg-[#102530] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Dossiers Administratifs Patients Référencés</h3>
                  <span className="text-xs text-[#8FA8B0]">{patients.length} dossiers actifs</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {patients.map((pat) => (
                    <div key={pat.id} className="p-3 bg-[#0D1F28] rounded-lg border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#1E8FA6]">{pat.ip_unique}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">GS : {pat.groupe_sanguin}</span>
                      </div>
                      <div className="text-xs font-bold text-white">{pat.nom} {pat.prenom}</div>
                      <div className="text-[11px] text-[#8FA8B0]">{pat.age} ans • {pat.telephone}</div>
                      <div className="text-[10px] text-blue-300">{pat.couverture}</div>
                      <div className="pt-1 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-[#8FA8B0]">{pat.chambre_lit}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleExportBulletinPDF(pat)}
                            className="text-[11px] text-[#1E8FA6] hover:underline flex items-center gap-1"
                          >
                            <Download size={11} /> Bulletin PDF
                          </button>
                          <button
                            onClick={() => { setSelectedItem(pat); setModalType("patient"); }}
                            className="p-1 text-[#8FA8B0] hover:text-white"
                            title="Modifier"
                          >
                            <Pencil size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              7. TAB : GESTION DES LITS & HOSPITALISATIONS
             ========================================================================= */}
          {activeTab === "lits" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Cartographie des Lits & Hospitalisations en Temps Réel
                  </h2>
                  <p className="text-xs text-[#8FA8B0]">
                    Suivi de l'occupation par chambre, gestion des transferts et alertes de désinfection.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportExcel("lits")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs border border-white/10 text-white transition-colors"
                  >
                    <Download size={13} /> Export Lits Excel
                  </button>
                  <button
                    onClick={() => { setSelectedItem(null); setModalType("lit"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1E8FA6] hover:bg-[#28abc7] text-xs font-semibold text-white transition-colors"
                  >
                    <Plus size={14} /> Ajouter / Affecter un Lit
                  </button>
                </div>
              </div>

              {/* Grille visuelle des lits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {lits.map((lit) => (
                  <div
                    key={lit.id}
                    className={`p-4 rounded-xl border space-y-2 transition-all ${
                      lit.statut === "Occupé"
                        ? "bg-[#102530] border-red-500/30"
                        : lit.statut === "Disponible"
                        ? "bg-[#102530] border-emerald-500/30"
                        : "bg-[#102530] border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">{lit.numero_lit} ({lit.chambre})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        lit.statut === "Occupé" ? "bg-red-500/20 text-red-300" :
                        lit.statut === "Disponible" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {lit.statut}
                      </span>
                    </div>

                    <div className="text-xs text-[#8FA8B0]">{lit.service_nom}</div>

                    {lit.patient_nom ? (
                      <div className="pt-2 border-t border-white/5 space-y-0.5 text-xs">
                        <div className="font-bold text-white">Patient : {lit.patient_nom}</div>
                        <div className="text-[10px] text-[#8FA8B0]">Admis le : {lit.date_admission}</div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-white/5 text-[11px] text-emerald-400 font-medium">
                        Prêt pour nouvelle admission
                      </div>
                    )}

                    {/* Actions directes sur le lit */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1">
                      {lit.statut === "Occupé" ? (
                        <button
                          onClick={() => handleToggleLitStatut(lit.id, "En désinfection")}
                          className="flex-1 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-semibold"
                        >
                          Libérer le Lit
                        </button>
                      ) : lit.statut === "En désinfection" ? (
                        <button
                          onClick={() => handleToggleLitStatut(lit.id, "Disponible")}
                          className="flex-1 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold"
                        >
                          Désinfection Terminée
                        </button>
                      ) : (
                        <button
                          onClick={() => { setSelectedItem(lit); setModalType("lit"); }}
                          className="flex-1 py-1 rounded bg-[#1E8FA6]/20 hover:bg-[#1E8FA6]/30 text-[#1E8FA6] text-[10px] font-semibold"
                        >
                          Admettre Patient
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteItem("lit", lit.id)}
                        className="p-1 rounded text-[#8FA8B0] hover:text-red-300"
                        title="Supprimer lit"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              8. TAB : BLOC OPÉRATOIRE & CHIRURGIE
             ========================================================================= */}
          {activeTab === "bloc" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Planning du Bloc Opératoire & Interventions Chirurgicales
                  </h2>
                  <p className="text-xs text-[#8FA8B0]">
                    Organisation des salles d'opération, chirurgiens, anesthésistes, matériel et transfert en salle de réveil.
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedItem(null); setModalType("intervention"); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1E8FA6] hover:bg-[#28abc7] text-xs font-semibold text-white transition-colors"
                >
                  <Plus size={14} /> Programmer une Intervention
                </button>
              </div>

              <div className="space-y-3">
                {interventions.map((op) => (
                  <div key={op.id} className="p-5 rounded-xl bg-[#102530] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#1E8FA6]/20 text-[#1E8FA6] border border-[#1E8FA6]/40">
                          {op.salle_bloc}
                        </span>
                        <h3 className="text-sm font-bold text-white">{op.type_intervention}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300">
                          {op.statut}
                        </span>
                        <button
                          onClick={() => { setSelectedItem(op); setModalType("intervention"); }}
                          className="p-1 text-[#8FA8B0] hover:text-white"
                          title="Modifier"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem("intervention", op.id)}
                          className="p-1 text-[#8FA8B0] hover:text-red-300"
                          title="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#8FA8B0] pt-2 border-t border-white/5">
                      <div>Patient : <span className="text-white font-semibold">{op.patient_nom}</span></div>
                      <div>Chirurgien : <span className="text-white font-semibold">{op.chirurgien_principal}</span></div>
                      <div>Anesthésiste : <span className="text-white font-semibold">{op.anesthesiste}</span></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#8FA8B0] pt-1">
                      <div>Horaire : <span className="font-mono text-white">{op.date_heure}</span> (Durée estimée : {op.duree_estimee_min} min)</div>
                      <span className="text-emerald-400">✓ Lit de réveil réservé</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              9. TAB : LABORATOIRE & IMAGERIE MÉDICALE
             ========================================================================= */}
          {activeTab === "laboratoire" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Laboratoire d'Analyses Médicales & Imagerie (Radiologie / Scanner / Échographie)
                  </h2>
                  <p className="text-xs text-[#8FA8B0]">
                    Suivi des prescriptions, examens (NFS, Goutte Épaisse, Radio, Scanner), validation et transmission des résultats.
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedItem(null); setModalType("examen"); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1E8FA6] hover:bg-[#28abc7] text-xs font-semibold text-white transition-colors"
                >
                  <Plus size={14} /> Prescrire un Examen
                </button>
              </div>

              <div className="bg-[#102530] rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0D1F28] border-b border-white/10 text-[#8FA8B0] uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Référence</th>
                      <th className="py-3 px-4">Examen & Pôle</th>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Prescripteur / Technicien</th>
                      <th className="py-3 px-4">Statut & Résultats</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {examensFiltres.slice((getTabPage('laboratoire') - 1) * 15, getTabPage('laboratoire') * 15).map((ex) => (
                      <tr key={ex.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#1E8FA6]">
                          {ex.numero}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{ex.type_examen}</div>
                          <div className="text-[10px] text-[#8FA8B0]">{ex.categorie}</div>
                        </td>
                        <td className="py-3 px-4 text-white font-medium">
                          {ex.patient_nom}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white">Prescrit : {ex.prescripteur}</div>
                          <div className="text-[10px] text-[#8FA8B0]">Tech : {ex.technicien_nom}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            ex.statut.includes("Validé") ? "bg-emerald-500/20 text-emerald-300" : "bg-blue-500/20 text-blue-300"
                          }`}>
                            {ex.statut}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!ex.statut.includes("Validé") && (
                              <button
                                onClick={() => handleValiderExamen(ex.id)}
                                className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs flex items-center gap-1"
                                title="Valider les résultats"
                              >
                                <Check size={12} /> Valider
                              </button>
                            )}
                            <button
                              onClick={() => showToast(`Résultats de l'examen ${ex.numero} transmis au médecin ${ex.prescripteur}.`, "success")}
                              className="p-1.5 rounded bg-white/5 hover:bg-[#1E8FA6]/20 text-[#1E8FA6] hover:text-white"
                              title="Transmettre au prescripteur"
                            >
                              <Send size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem("examen", ex.id)}
                              className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-[#8FA8B0] hover:text-red-300"
                              title="Supprimer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <SyngespPagination currentPage={getTabPage('personnel')} totalItems={personnelFiltre.filter((p) => p.nom.toLowerCase().includes(searchQuery.toLowerCase()) || p.matricule.toLowerCase().includes(searchQuery.toLowerCase()) || p.specialite.toLowerCase().includes(searchQuery.toLowerCase())).length} pageSize={15} onPageChange={(p) => setTabPage('personnel', p)} label='employés et praticiens' />
              </div>
            </div>
          )}

          {/* =========================================================================
              10. TAB : PHARMACIE HOSPITALIÈRE & GESTION DES STOCKS
             ========================================================================= */}
          {activeTab === "pharmacie" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Pharmacie Hospitalière, Médicaments & Gestion des Stocks
                  </h2>
                  <p className="text-xs text-[#8FA8B0]">
                    Catalogue DCI, traçabilité des lots, dates de péremption, alertes de rupture et prise en charge Couverture Santé Universelle (CSU).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportExcel("pharmacie")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs border border-white/10 text-white transition-colors"
                  >
                    <Download size={13} /> Export Inventaire Excel
                  </button>
                  <button
                    onClick={() => { setSelectedItem(null); setModalType("medicament"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1E8FA6] hover:bg-[#28abc7] text-xs font-semibold text-white transition-colors"
                  >
                    <Plus size={14} /> Ajouter un Médicament
                  </button>
                </div>
              </div>

              {/* Tableau de la Pharmacie */}
              <div className="bg-[#102530] rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0D1F28] border-b border-white/10 text-[#8FA8B0] uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Code DCI</th>
                      <th className="py-3 px-4">Désignation & Forme</th>
                      <th className="py-3 px-4">Stock Actuel</th>
                      <th className="py-3 px-4">Lot / Péremption</th>
                      <th className="py-3 px-4">Prix Unitaire</th>
                      <th className="py-3 px-4">Couverture CSU</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stocksPharmacie.map((med) => (
                      <tr key={med.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#1E8FA6]">
                          {med.code_dci}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{med.designation}</div>
                          <div className="text-[10px] text-[#8FA8B0]">{med.forme}</div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className={`font-bold ${med.quantite_stock <= med.seuil_alerte ? "text-red-400" : "text-white"}`}>
                            {med.quantite_stock} unités
                          </span>
                          {med.quantite_stock <= med.seuil_alerte && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-red-500/20 text-red-300 font-bold">RUPTURE</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[11px] font-mono">
                          <div className="text-white">Lot : {med.lot}</div>
                          <div className="text-[#8FA8B0]">Exp : {med.peremption}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-white">
                          {formatFCFA(med.prix_unitaire_fcfa)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            med.couverture_csu ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-[#8FA8B0]"
                          }`}>
                            {med.couverture_csu ? "Couvert CSU (80%)" : "Hors CSU"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setSelectedItem(med); setModalType("medicament"); }}
                              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-[#8FA8B0] hover:text-white"
                              title="Modifier stock"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem("medicament", med.id)}
                              className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-[#8FA8B0] hover:text-red-300"
                              title="Supprimer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <SyngespPagination currentPage={getTabPage('personnel')} totalItems={personnelFiltre.filter((p) => p.nom.toLowerCase().includes(searchQuery.toLowerCase()) || p.matricule.toLowerCase().includes(searchQuery.toLowerCase()) || p.specialite.toLowerCase().includes(searchQuery.toLowerCase())).length} pageSize={15} onPageChange={(p) => setTabPage('personnel', p)} label='employés et praticiens' />
              </div>
            </div>
          )}

          {/* =========================================================================
              11. TAB : FACTURATION DES SOINS & COUVERTURE SANTÉ UNIVERSELLE (CSU)
             ========================================================================= */}
          {activeTab === "facturation" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Facturation Médicale, Tarification & Prise en Charge CSU
                  </h2>
                  <p className="text-xs text-[#8FA8B0]">
                    Calcul de la quote-part Couverture Santé Universelle (MINSANTE), assurances et règlements Orange Money / MTN MoMo.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportExcel("facturation")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs border border-white/10 text-white transition-colors"
                  >
                    <Download size={13} /> Export Factures Excel
                  </button>
                  <button
                    onClick={() => { setSelectedItem(null); setModalType("facture_sante"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1E8FA6] hover:bg-[#28abc7] text-xs font-semibold text-white transition-colors"
                  >
                    <Plus size={14} /> Émettre une Facture de Soins
                  </button>
                </div>
              </div>

              <div className="bg-[#102530] rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0D1F28] border-b border-white/10 text-[#8FA8B0] uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Facture N°</th>
                      <th className="py-3 px-4">Patient / IP</th>
                      <th className="py-3 px-4">Prestations Soins</th>
                      <th className="py-3 px-4">Total TTC</th>
                      <th className="py-3 px-4">Pris en Charge CSU</th>
                      <th className="py-3 px-4">Part Patient</th>
                      <th className="py-3 px-4">Règlement</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {factures.map((fac) => (
                      <tr key={fac.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#1E8FA6]">
                          {fac.numero}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{fac.patient_nom}</div>
                          <div className="text-[10px] text-[#8FA8B0] font-mono">{fac.ip_unique}</div>
                        </td>
                        <td className="py-3 px-4 text-white">
                          {fac.prestations}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          {formatFCFA(fac.total_ttc_fcfa)}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                          - {formatFCFA(fac.part_csu_fcfa)}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#1E8FA6]">
                          {formatFCFA(fac.ticket_moderateur_patient_fcfa)}
                        </td>
                        <td className="py-3 px-4 text-[11px]">
                          <div className="text-emerald-400 font-medium">{fac.statut_paiement} ({fac.mode_reglement})</div>
                          <div className="text-[10px] text-[#8FA8B0] font-mono">{fac.reference_transaction}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleExportFacturePDF(fac)}
                              className="p-1.5 rounded bg-white/5 hover:bg-[#1E8FA6]/20 text-[#1E8FA6] hover:text-white"
                              title="Télécharger Quittance PDF"
                            >
                              <Download size={13} />
                            </button>
                            <button
                              onClick={() => { setSelectedItem(fac); setModalType("facture_sante"); }}
                              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-[#8FA8B0] hover:text-white"
                              title="Modifier"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem("facture", fac.id)}
                              className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-[#8FA8B0] hover:text-red-300"
                              title="Supprimer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              10. TAB : ÉVÉNEMENTS & AGENDAS HOSPITALIERS (SYNC GMAIL)
             ========================================================================= */}
          {activeTab === "evenements" && (
            <EventsManagerView
              events={eventsList}
              onAddEvent={handleAddEvent}
              onDeleteEvent={handleDeleteEvent}
              moduleContext="SYNGESHP"
              currentUserName={adminNom}
            />
          )}

          {/* =========================================================================
              11. TAB : CHAT MÉDICAL & ÉQUIPE EN DIRECT
             ========================================================================= */}
          {activeTab === "chat" && (
            <TeamChatWidget
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              currentUserName={adminNom}
              currentRole="Personnel Médical"
              defaultChannel="syngeshp-urgences"
              moduleContext="SYNGESHP"
            />
          )}

          {/* =========================================================================
              12. TAB : ADMINISTRATION SYNGESHP (BASE RELATIONNELLE, UTILISATEURS & AUDIT)
             ========================================================================= */}
          {activeTab === "administration" && (
            <div className="space-y-6">
              {/* En-tête du module Administration */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                      Module d'Administration
                    </span>
                    <span className="text-xs text-[#8FA8B0]">Gouvernance & Sécurité Hospitalière</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight mt-1" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Administration SYNGESHP
                  </h1>
                  <p className="text-xs text-[#8FA8B0]">
                    Gestion de la base relationnelle, configuration cloud, annuaire des utilisateurs hospitaliers et journal d'audit &amp; traçabilité.
                  </p>
                </div>

                {/* Sélecteur de sous-onglets */}
                <div className="flex items-center gap-1.5 p-1 bg-[#102530] rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setAdminSubTab("database")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      adminSubTab === "database"
                        ? "bg-[#1E8FA6] text-[#03151C] shadow-sm font-bold"
                        : "text-[#8FA8B0] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Database size={14} />
                    <span>Base &amp; Cloud</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminSubTab("utilisateurs")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      adminSubTab === "utilisateurs"
                        ? "bg-[#1E8FA6] text-[#03151C] shadow-sm font-bold"
                        : "text-[#8FA8B0] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Users size={14} />
                    <span>Utilisateurs ({utilisateurs.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminSubTab("audit")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      adminSubTab === "audit"
                        ? "bg-[#1E8FA6] text-[#03151C] shadow-sm font-bold"
                        : "text-[#8FA8B0] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <ShieldAlert size={14} />
                    <span>Journal d'audit &amp; Traçabilité</span>
                  </button>
                </div>
              </div>

              {/* SOUS-VOLET 1 : BASE DE DONNÉES & SYNCHRONISATION CLOUD */}
              {adminSubTab === "database" && (
                <div className="space-y-6">
                  {/* Cartes d'état de la base relationnelle */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[#102530] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8FA8B0]">Mode de Connexion</span>
                        <Database size={18} className={supabaseStatus.connected ? "text-emerald-400" : "text-amber-400"} />
                      </div>
                      <div className="text-lg font-bold text-white">
                        {supabaseStatus.connected ? "PostgreSQL Cloud Connecté" : "Mode Démo Souverain (Local)"}
                      </div>
                      <div className="text-xs text-[#8FA8B0]">
                        {supabaseStatus.connected
                          ? `Hôte : ${supabaseCreds.url.replace("https://", "").split(".")[0]} (Supabase)`
                          : "Données persistées localement dans le stockage sécurisé"}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#102530] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8FA8B0]">Tables Relationnelles</span>
                        <Building2 size={18} className="text-[#1E8FA6]" />
                      </div>
                      <div className="text-lg font-bold text-white">12 Tables Actives</div>
                      <div className="text-xs text-[#8FA8B0]">Schéma normalisé 3NF avec intégrité référentielle</div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#102530] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8FA8B0]">Dernière Synchronisation</span>
                        <RefreshCw size={18} className="text-emerald-400" />
                      </div>
                      <div className="text-lg font-bold text-emerald-400">Synchronisé &amp; Intègre</div>
                      <div className="text-xs text-[#8FA8B0]">Conforme aux normes sanitaires MINSANTE</div>
                    </div>
                  </div>

                  {/* Boutons de commande d'administration */}
                  <div className="p-5 rounded-xl bg-[#102530] border border-white/10 space-y-4">
                    <div className="text-sm font-bold text-white">Opérations d'Administration Système</div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (!peutConfigurerBase) { showToast("Configuration réservée à l'Administrateur.", "error"); return; }
                          setSupabaseModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E8FA6] hover:bg-[#22A2BC] text-[#03151C] font-bold text-xs shadow-md transition-all"
                      >
                        <Database size={15} />
                        <span>Paramètres &amp; Identifiants Supabase</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!peutConfigurerBase) { showToast("Synchronisation réservée à l'Administrateur.", "error"); return; }
                          handleSyncSupabase();
                          logAuditSyngeshp("Synchronisation Cloud déclenchée", "database_sync", "SYNC-01", "Succès");
                        }}
                        disabled={syncLoading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                      >
                        <RefreshCw size={15} className={syncLoading ? "animate-spin" : ""} />
                        <span>Synchroniser la Base Cloud</span>
                      </button>
                    </div>
                  </div>

                  {/* Schéma Relationnel Hospitalier */}
                  <div className="p-5 rounded-xl bg-[#102530] border border-white/10 space-y-3">
                    <div className="text-sm font-bold text-white">Structure Relationnelle de la Base SYNGESHP</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="font-bold text-[#5FC2D6]">1. etablissements_sante</div>
                        <div className="text-[#8FA8B0] text-[11px] mt-1">Clé Primaire : id | Code, Nom, Région, Catégorie, Lits</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="font-bold text-[#5FC2D6]">2. services_hospitaliers</div>
                        <div className="text-[#8FA8B0] text-[11px] mt-1">Clé Étrangère : etablissement_id → etablissements_sante(id)</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="font-bold text-[#5FC2D6]">3. personnel_medical</div>
                        <div className="text-[#8FA8B0] text-[11px] mt-1">Clés Étrangères : service_id, etablissement_id</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="font-bold text-[#5FC2D6]">4. utilisateurs_syngeshp</div>
                        <div className="text-[#8FA8B0] text-[11px] mt-1">Comptes d'accès : etablissement_id, role, login</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="font-bold text-[#5FC2D6]">5. patients &amp; admissions</div>
                        <div className="text-[#8FA8B0] text-[11px] mt-1">Dossiers patients : etablissement_id, matricule, CSU</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="font-bold text-[#5FC2D6]">6. audit_log_syngeshp</div>
                        <div className="text-[#8FA8B0] text-[11px] mt-1">Traçabilité : utilisateur_nom, table_cible, horodatage</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SOUS-VOLET 2 : GESTION DES UTILISATEURS HOSPITALIERS */}
              {adminSubTab === "utilisateurs" && (() => {
                const utilisateursFiltres = utilisateurs.filter((u) => {
                  const matchSearch = u.nom_complet.toLowerCase().includes(adminUserSearch.toLowerCase()) ||
                    u.email.toLowerCase().includes(adminUserSearch.toLowerCase()) ||
                    u.role.toLowerCase().includes(adminUserSearch.toLowerCase());
                  const matchRole = adminUserRoleFilter === "Tous" || u.role === adminUserRoleFilter;
                  const matchHopital = adminUserHopitalFilter === "Tous" || u.etablissement_nom === adminUserHopitalFilter;
                  return matchSearch && matchRole && matchHopital;
                });
                const totalUserPages = Math.max(1, Math.ceil(utilisateursFiltres.length / 15));
                const userPage = Math.min(getTabPage("admin_users"), totalUserPages);
                const pagedUsers = utilisateursFiltres.slice((userPage - 1) * 15, userPage * 15);

                return (
                  <div className="space-y-4">
                    {/* Filtres & Recherche Utilisateurs */}
                    <div className="p-4 rounded-xl bg-[#102530] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA8B0]" />
                          <input
                            type="text"
                            value={adminUserSearch}
                            onChange={(e) => { setAdminUserSearch(e.target.value); setTabPage("admin_users", 1); }}
                            placeholder="Rechercher un utilisateur..."
                            className="bg-[#0D1F28] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#5C7680] w-56 outline-none"
                          />
                        </div>

                        <select
                          value={adminUserRoleFilter}
                          onChange={(e) => { setAdminUserRoleFilter(e.target.value); setTabPage("admin_users", 1); }}
                          className="bg-[#0D1F28] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                        >
                          <option value="Tous">Tous les rôles</option>
                          <option value="Directeur / Médecin-Chef">Directeur / Médecin-Chef</option>
                          <option value="Médecin Spécialiste">Médecin Spécialiste</option>
                          <option value="Major de service / Cadre infirmier">Major de service</option>
                          <option value="Pharmacien Hospitalier">Pharmacien Hospitalier</option>
                          <option value="Gestionnaire CSU / Caissier">Gestionnaire CSU / Caissier</option>
                        </select>

                        <select
                          value={adminUserHopitalFilter}
                          onChange={(e) => { setAdminUserHopitalFilter(e.target.value); setTabPage("admin_users", 1); }}
                          className="bg-[#0D1F28] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                        >
                          <option value="Tous">Tous les hôpitaux</option>
                          {etablissements.map((e) => (
                            <option key={e.id} value={e.nom}>{e.nom}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItem(null);
                          setModalType("utilisateur_syngeshp");
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E8FA6] hover:bg-[#22A2BC] text-[#03151C] font-bold text-xs shadow-sm transition-all"
                      >
                        <Plus size={14} />
                        <span>Nouvel Utilisateur Hospitalier</span>
                      </button>
                    </div>

                    {/* Tableau Paginé des Utilisateurs */}
                    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#102530]">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#0D1F28] text-[#8FA8B0] uppercase font-mono text-[10px] border-b border-white/10">
                          <tr>
                            <th className="px-4 py-3">Nom &amp; Prénom</th>
                            <th className="px-4 py-3">Email / Contact</th>
                            <th className="px-4 py-3">Rôle &amp; Habilitation</th>
                            <th className="px-4 py-3">Hôpital de Rattachement</th>
                            <th className="px-4 py-3">Service</th>
                            <th className="px-4 py-3">Statut</th>
                            <th className="px-4 py-3">Dernière Connexion</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {pagedUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 font-semibold text-white">{u.nom_complet}</td>
                              <td className="px-4 py-3 text-[#8FA8B0]">
                                <div>{u.email}</div>
                                <div className="text-[10px] text-[#5C7680]">{u.telephone}</div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1E8FA6]/20 text-[#5FC2D6]">
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[#EAF2F4]">{u.etablissement_nom}</td>
                              <td className="px-4 py-3 text-[#8FA8B0]">{u.service_nom || "Direction"}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  u.statut === "Actif" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                                }`}>
                                  {u.statut}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-[11px] text-[#8FA8B0]">{u.derniere_connexion || "—"}</td>
                              <td className="px-4 py-3 text-right space-x-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUtilisateurs(utilisateurs.map((x) => x.id === u.id ? { ...x, statut: x.statut === "Actif" ? "Suspendu" : "Actif" } : x));
                                    logAuditSyngeshp(`Basculement statut utilisateur : ${u.nom_complet}`, "utilisateurs_syngeshp", u.id, "Succès");
                                    showToast(`Statut de ${u.nom_complet} mis à jour.`, "info");
                                  }}
                                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white text-[11px] border border-white/10"
                                  title="Activer / Suspendre"
                                >
                                  {u.statut === "Actif" ? "Suspendre" : "Activer"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUtilisateurs(utilisateurs.filter((x) => x.id !== u.id));
                                    logAuditSyngeshp(`Suppression utilisateur : ${u.nom_complet}`, "utilisateurs_syngeshp", u.id, "Succès");
                                    showToast(`Utilisateur ${u.nom_complet} supprimé.`, "info");
                                  }}
                                  className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 inline-flex items-center"
                                  title="Supprimer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {pagedUsers.length === 0 && (
                            <tr>
                              <td colSpan={8} className="px-4 py-8 text-center text-[#8FA8B0]">
                                Aucun utilisateur trouvé selon vos critères.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <SyngespPagination
                      currentPage={userPage}
                      totalItems={utilisateursFiltres.length}
                      pageSize={15}
                      onPageChange={(p) => setTabPage("admin_users", p)}
                      label="utilisateurs hospitaliers"
                    />
                  </div>
                );
              })()}

              {/* SOUS-VOLET 3 : JOURNAL D'AUDIT & TRAÇABILITÉ */}
              {adminSubTab === "audit" && (() => {
                const auditFiltres = auditLog.filter((a) => {
                  const matchSearch = a.utilisateur_nom.toLowerCase().includes(auditSearch.toLowerCase()) ||
                    a.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
                    a.table_cible.toLowerCase().includes(auditSearch.toLowerCase());
                  const matchAction = auditActionFilter === "Tous" || a.action.toLowerCase().includes(auditActionFilter.toLowerCase());
                  const matchTable = auditTableFilter === "Tous" || a.table_cible === auditTableFilter;
                  return matchSearch && matchAction && matchTable;
                });
                const totalAuditPages = Math.max(1, Math.ceil(auditFiltres.length / 15));
                const auditPage = Math.min(getTabPage("admin_audit"), totalAuditPages);
                const pagedAudit = auditFiltres.slice((auditPage - 1) * 15, auditPage * 15);

                return (
                  <div className="space-y-4">
                    {/* Filtres & Actions d'Export Audit */}
                    <div className="p-4 rounded-xl bg-[#102530] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA8B0]" />
                          <input
                            type="text"
                            value={auditSearch}
                            onChange={(e) => { setAuditSearch(e.target.value); setTabPage("admin_audit", 1); }}
                            placeholder="Rechercher dans l'audit..."
                            className="bg-[#0D1F28] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#5C7680] w-56 outline-none"
                          />
                        </div>

                        <select
                          value={auditTableFilter}
                          onChange={(e) => { setAuditTableFilter(e.target.value); setTabPage("admin_audit", 1); }}
                          className="bg-[#0D1F28] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                        >
                          <option value="Tous">Toutes les tables</option>
                          <option value="bloc_interventions">bloc_interventions</option>
                          <option value="factures_sante">factures_sante</option>
                          <option value="pharmacie_stocks">pharmacie_stocks</option>
                          <option value="lits_hospitalisation">lits_hospitalisation</option>
                          <option value="patients">patients</option>
                          <option value="gardes_astreintes">gardes_astreintes</option>
                          <option value="utilisateurs_syngeshp">utilisateurs_syngeshp</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleExportData("audit", "excel")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                        >
                          <Download size={13} />
                          <span>Export Excel</span>
                        </button>
                      </div>
                    </div>

                    {/* Tableau Paginé du Journal d'Audit */}
                    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#102530]">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#0D1F28] text-[#8FA8B0] uppercase font-mono text-[10px] border-b border-white/10">
                          <tr>
                            <th className="px-4 py-3">Horodatage</th>
                            <th className="px-4 py-3">Utilisateur / Acteur</th>
                            <th className="px-4 py-3">Rôle</th>
                            <th className="px-4 py-3">Établissement</th>
                            <th className="px-4 py-3">Action Effectuée</th>
                            <th className="px-4 py-3">Table Cible</th>
                            <th className="px-4 py-3">ID Enregistrement</th>
                            <th className="px-4 py-3">Statut</th>
                            <th className="px-4 py-3">IP / Terminal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                          {pagedAudit.map((a) => (
                            <tr key={a.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 text-[#5FC2D6]">{a.horodatage}</td>
                              <td className="px-4 py-3 font-sans font-semibold text-white">{a.utilisateur_nom}</td>
                              <td className="px-4 py-3 font-sans text-[#8FA8B0]">{a.role}</td>
                              <td className="px-4 py-3 font-sans text-[#EAF2F4]">{a.etablissement_nom}</td>
                              <td className="px-4 py-3 font-sans text-emerald-300">{a.action}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px]">
                                  {a.table_cible}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[#8FA8B0]">{a.enregistrement_id}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold ${
                                  a.statut === "Succès" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                                }`}>
                                  {a.statut}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[#5C7680]">{a.ip_terminal}</td>
                            </tr>
                          ))}
                          {pagedAudit.length === 0 && (
                            <tr>
                              <td colSpan={9} className="px-4 py-8 text-center text-[#8FA8B0] font-sans">
                                Aucun enregistrement d'audit trouvé.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <SyngespPagination
                      currentPage={auditPage}
                      totalItems={auditFiltres.length}
                      pageSize={15}
                      onPageChange={(p) => setTabPage("admin_audit", p)}
                      label="entrées d'audit"
                    />
                  </div>
                );
              })()}
            </div>
          )}

        </main>
      </div>

      {/* =========================================================================
          MODAL DE CONFIGURATION SUPABASE
         ========================================================================= */}
      {supabaseModalOpen && peutConfigurerBase && (
        <SupabaseConfigModal
          onClose={() => setSupabaseModalOpen(false)}
          onRefresh={checkSupabase}
          status={supabaseStatus}
          creds={supabaseCreds}
        />
      )}

      {/* =========================================================================
          MODAL D'ÉCHANGE DE GARDE INTERACTIF
         ========================================================================= */}
      {modalType === "echange_garde" && selectedItem && (
        <ShiftSwapModal
          garde={selectedItem}
          personnelList={personnel}
          onClose={() => setModalType(null)}
          onConfirm={(swapData) => {
            setGardes(
              gardes.map((g) =>
                g.id === selectedItem.id
                  ? {
                      ...g,
                      remplacant_nom: swapData.remplacant_nom,
                      statut: `Échange Validé (${swapData.remplacant_nom})`,
                    }
                  : g
              )
            );
            setModalType(null);
            showToast(`Échange de garde validé avec succès pour le ${selectedItem.date_garde}.`, "success");
          }}
        />
      )}

      {/* =========================================================================
          MODAL D'ÉDITION / CRÉATION HOSPITALIÈRE UNIVERSELLE
         ========================================================================= */}
      {modalType && modalType !== "echange_garde" && (
        <HospitalEditModal
          type={modalType}
          item={selectedItem}
          services={services}
          personnel={personnel}
          patients={patients}
          etablissements={etablissements}
          onClose={() => setModalType(null)}
          onSave={(newItem) => {
            if (modalType === "etablissement") {
              setEtablissements(selectedItem ? etablissements.map((e) => (e.id === selectedItem.id ? newItem : e)) : [newItem, ...etablissements]);
            } else if (modalType === "personnel") {
              setPersonnel(selectedItem ? personnel.map((p) => (p.id === selectedItem.id ? newItem : p)) : [newItem, ...personnel]);
            } else if (modalType === "garde") {
              setGardes(selectedItem ? gardes.map((g) => (g.id === selectedItem.id ? newItem : g)) : [newItem, ...gardes]);
            } else if (modalType === "conge") {
              setConges(selectedItem ? conges.map((c) => (c.id === selectedItem.id ? newItem : c)) : [newItem, ...conges]);
            } else if (modalType === "patient") {
              setPatients(selectedItem ? patients.map((p) => (p.id === selectedItem.id ? newItem : p)) : [newItem, ...patients]);
            } else if (modalType === "rdv") {
              setRendezVous(selectedItem ? rendezVous.map((r) => (r.id === selectedItem.id ? newItem : r)) : [newItem, ...rendezVous]);
            } else if (modalType === "lit") {
              setLits(selectedItem ? lits.map((l) => (l.id === selectedItem.id ? newItem : l)) : [newItem, ...lits]);
            } else if (modalType === "intervention") {
              setInterventions(selectedItem ? interventions.map((i) => (i.id === selectedItem.id ? newItem : i)) : [newItem, ...interventions]);
            } else if (modalType === "examen") {
              setExamens(selectedItem ? examens.map((e) => (e.id === selectedItem.id ? newItem : e)) : [newItem, ...examens]);
            } else if (modalType === "medicament") {
              setStocksPharmacie(selectedItem ? stocksPharmacie.map((m) => (m.id === selectedItem.id ? newItem : m)) : [newItem, ...stocksPharmacie]);
            } else if (modalType === "facture_sante") {
              setFactures(selectedItem ? factures.map((f) => (f.id === selectedItem.id ? newItem : f)) : [newItem, ...factures]);
            } else if (modalType === "utilisateur_syngeshp") {
              setUtilisateurs(selectedItem ? utilisateurs.map((u) => (u.id === selectedItem.id ? newItem : u)) : [newItem, ...utilisateurs]);
              logAuditSyngeshp(selectedItem ? `Modification utilisateur : ${newItem.nom_complet}` : `Création utilisateur : ${newItem.nom_complet}`, "utilisateurs_syngeshp", newItem.id, "Succès");
            }
            setModalType(null);
            showToast("Enregistrement effectué avec succès !", "success");
          }}
        />
      )}
    </div>
  );
}

/**
 * Modal de Changement / Échange de Garde
 */
function ShiftSwapModal({ garde, personnelList, onClose, onConfirm }) {
  const [remplacantNom, setRemplacantNom] = useState(
    personnelList.find((p) => `${p.titre} ${p.nom} ${p.prenom}` !== garde.personnel_nom)?.nom
      ? `${personnelList.find((p) => `${p.titre} ${p.nom} ${p.prenom}` !== garde.personnel_nom).titre} ${personnelList.find((p) => `${p.titre} ${p.nom} ${p.prenom}` !== garde.personnel_nom).nom} ${personnelList.find((p) => `${p.titre} ${p.nom} ${p.prenom}` !== garde.personnel_nom).prenom}`
      : "Dr. Alain Mbida"
  );
  const [motif, setMotif] = useState("Empêchement médical / convenance personnelle");

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ remplacant_nom: remplacantNom, motif });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-[#102530] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="text-[#1E8FA6]" size={18} />
            <h3 className="text-sm font-bold text-white">Demande d'Échange de Garde</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-[#8FA8B0] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-3 bg-[#0D1F28] rounded-lg border border-white/5 space-y-1 text-xs">
          <div className="text-[#8FA8B0]">Garde concernée :</div>
          <div className="font-bold text-white">{garde.service_nom} — {garde.date_garde}</div>
          <div className="text-[#1E8FA6]">{garde.personnel_nom} ({garde.type_garde})</div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[#8FA8B0] mb-1">Sélectionner le Remplaçant *</label>
            <select
              value={remplacantNom}
              onChange={(e) => setRemplacantNom(e.target.value)}
              className="w-full p-2.5 rounded bg-[#0D1F28] border border-white/10 text-white outline-none focus:border-[#1E8FA6]"
            >
              {personnelList
                .filter((p) => `${p.titre} ${p.nom} ${p.prenom}` !== garde.personnel_nom)
                .map((p) => (
                  <option key={p.id} value={`${p.titre} ${p.nom} ${p.prenom}`}>
                    {p.titre} {p.nom} {p.prenom} ({p.specialite})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[#8FA8B0] mb-1">Motif de l'échange</label>
            <textarea
              rows={2}
              required
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full p-2.5 rounded bg-[#0D1F28] border border-white/10 text-white outline-none focus:border-[#1E8FA6]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded bg-white/5 text-xs text-white">
            Annuler
          </button>
          <button type="submit" className="px-4 py-1.5 rounded bg-[#1E8FA6] hover:bg-[#28abc7] text-xs font-semibold text-white">
            Valider l'Échange
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Modal de Configuration Supabase
 */
function SupabaseConfigModal({ onClose, onRefresh, status, creds }) {
  const [url, setUrl] = useState(creds.url || "");
  const [anonKey, setAnonKey] = useState(creds.anonKey || "");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSave = () => {
    saveCustomCredentials(url, anonKey);
    onRefresh();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url, anonKey);
    setTestResult(res);
    setTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#102530] border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Database size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Connexion Supabase PostgreSQL — SYNGESHP-CAM</h3>
              <p className="text-[11px] text-[#8FA8B0]">Base de données de santé nationale</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#8FA8B0] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className={`p-3 rounded-lg border text-xs flex items-center gap-3 ${
          status.connected ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-amber-500/10 border-amber-500/30 text-amber-300"
        }`}>
          {status.connected ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <div className="flex-1">
            <div className="font-bold">{status.connected ? "Connecté à Supabase" : "Mode Démo / Local Actif"}</div>
            <div className="text-[11px] opacity-90">{status.message || "Prêt pour connexion."}</div>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[#8FA8B0] mb-1">Project URL (Supabase)</label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#0D1F28] border border-white/10 text-white font-mono text-xs outline-none focus:border-[#1E8FA6]"
            />
          </div>
          <div>
            <label className="block text-[#8FA8B0] mb-1">API Key (Anon / Public)</label>
            <textarea
              rows={3}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#0D1F28] border border-white/10 text-white font-mono text-xs outline-none focus:border-[#1E8FA6]"
            />
          </div>
        </div>

        {testResult && (
          <div className={`p-3 rounded-lg text-xs ${testResult.success ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
            {testResult.message}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button onClick={handleTest} disabled={testing} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white border border-white/10">
            {testing ? "Test en cours..." : "Tester la connexion"}
          </button>
          <button onClick={handleSave} className="px-4 py-1.5 rounded-lg text-xs bg-[#1E8FA6] hover:bg-[#28abc7] text-white font-semibold">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal d'Édition / Création Hospitalière Universelle
 */
function HospitalEditModal({ type, item, services, personnel, patients, etablissements, onClose, onSave }) {
  const isEdit = Boolean(item);

  const [formData, setFormData] = useState(() => {
    if (item) return { ...item };
    if (type === "etablissement") {
      return {
        id: `hosp-${Date.now()}`,
        code: `HOSP-${Math.floor(100 + Math.random() * 900)}`,
        nom: "",
        type_etablissement: "Hôpital de District / 4ème Catégorie",
        statut_juridique: "Public",
        region: "Centre",
        departement: "Mfoundi",
        district_sante: "Djoungolo",
        ville: "Yaoundé",
        adresse: "",
        telephone: "+237 222 ",
        email: "",
        responsable: "",
        capacite_lits: 100,
        services_actifs: ["Urgences", "Maternité", "Laboratoire"],
      };
    }
    if (type === "utilisateur_syngeshp") {
      return {
        id: `usr-hosp-${Date.now()}`,
        nom_complet: "",
        email: "",
        telephone: "+237 6",
        role: "Médecin Spécialiste",
        etablissement_id: etablissements[0]?.id || "hosp-1",
        etablissement_nom: etablissements[0]?.nom || "Hôpital Général de Yaoundé (HGY)",
        service_id: services[0]?.id || "srv-1",
        service_nom: services[0]?.nom || "Urgences",
        statut: "Actif",
        date_creation: new Date().toISOString().slice(0, 10),
        derniere_connexion: "Jamais",
      };
    }
    if (type === "personnel") {
      return {
        id: `pers-${Date.now()}`,
        matricule: `MED-CMR-${Math.floor(1000 + Math.random() * 9000)}`,
        nom: "",
        prenom: "",
        titre: "Dr.",
        categorie: "Médecin Généraliste",
        specialite: "Médecine Générale",
        service_id: services[0]?.id || "srv-1",
        service_nom: services[0]?.nom || "Urgences",
        telephone: "+237 6",
        email: "",
        statut: "Actif",
        type_contrat: "Fonctionnaire MINSANTE",
        nb_gardes_mois: 0,
        nb_gardes_max: 6,
        solde_conges_jours: 30,
      };
    }
    if (type === "garde") {
      return {
        id: `grd-${Date.now()}`,
        personnel_nom: personnel[0]?.nom ? `${personnel[0].titre} ${personnel[0].nom} ${personnel[0].prenom}` : "Dr. Marc Eboumbou",
        service_nom: services[0]?.nom || "Urgences & Déchocage",
        type_garde: "Garde 24 Heures",
        periode: "Jour & Nuit (08h00 - 08h00 J+1)",
        date_garde: new Date().toISOString().slice(0, 10),
        statut: "Confirmée",
        role_garde: "Médecin Sénior de Garde",
      };
    }
    if (type === "conge") {
      return {
        id: `cng-${Date.now()}`,
        personnel_nom: personnel[0]?.nom ? `${personnel[0].titre} ${personnel[0].nom} ${personnel[0].prenom}` : "Praticien",
        service_nom: services[0]?.nom || "Urgences",
        type_conge: "Congé Annuel",
        date_debut: new Date().toISOString().slice(0, 10),
        date_fin: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        nb_jours: 14,
        statut: "En attente validation",
        remplacant_propose: personnel[1]?.nom ? `${personnel[1].titre} ${personnel[1].nom}` : "Dr. Remplaçant",
        motif: "",
      };
    }
    if (type === "patient") {
      return {
        id: `pat-${Date.now()}`,
        ip_unique: `PAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        nom: "",
        prenom: "",
        sexe: "M",
        date_naissance: "1990-01-01",
        age: 36,
        telephone: "+237 6",
        ville: "Yaoundé",
        quartier: "",
        groupe_sanguin: "O+",
        couverture: "Couverture Santé Universelle (CSU)",
        csu_matricule: `CSU-CM-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        statut_actuel: "Admis",
        chambre_lit: "Non affecté",
      };
    }
    if (type === "rdv") {
      return {
        id: `rdv-${Date.now()}`,
        patient_nom: patients[0]?.nom ? `${patients[0].nom} ${patients[0].prenom}` : "Nouveau Patient",
        patient_tel: "+237 6",
        service_nom: services[0]?.nom || "Cardiologie",
        medecin_nom: personnel[0]?.nom ? `${personnel[0].titre} ${personnel[0].nom}` : "Médecin",
        date_rdv: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        heure_rdv: "09:00",
        motif: "Consultation Spécialisée",
        statut: "Planifié",
      };
    }
    if (type === "lit") {
      return {
        id: `lit-${Date.now()}`,
        service_nom: services[0]?.nom || "Urgences & Déchocage",
        chambre: "CH-01",
        numero_lit: `LIT-${Math.floor(10 + Math.random() * 90)}`,
        statut: "Disponible",
        patient_nom: "",
        date_admission: "",
      };
    }
    if (type === "intervention") {
      return {
        id: `bloc-${Date.now()}`,
        salle_bloc: "Salle 1 (Chirurgie Viscérale)",
        patient_nom: patients[0]?.nom ? `${patients[0].nom} ${patients[0].prenom}` : "Patient",
        chirurgien_principal: personnel[0]?.nom ? `${personnel[0].titre} ${personnel[0].nom}` : "Chirurgien",
        anesthesiste: "Dr. Cécile Noah",
        type_intervention: "Intervention Programmée",
        date_heure: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace("T", " "),
        duree_estimee_min: 60,
        statut: "Programmé",
        salle_reveil_reservee: true,
      };
    }
    if (type === "examen") {
      return {
        id: `exam-${Date.now()}`,
        numero: `EX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        type_examen: "Numération Formule Sanguine (NFS)",
        categorie: "Laboratoire",
        patient_nom: patients[0]?.nom ? `${patients[0].nom} ${patients[0].prenom}` : "Patient",
        prescripteur: personnel[0]?.nom ? `${personnel[0].titre} ${personnel[0].nom}` : "Médecin",
        technicien_nom: "M. Rodrigue Talla",
        statut: "Prescrit (En attente prélèvement)",
        date_prescription: new Date().toISOString().slice(0, 16).replace("T", " "),
        delai_rendu: "30 min",
      };
    }
    if (type === "medicament") {
      return {
        id: `med-${Date.now()}`,
        code_dci: `MED-${Math.floor(100 + Math.random() * 900)}`,
        designation: "",
        forme: "Flacon injectable",
        quantite_stock: 100,
        seuil_alerte: 30,
        lot: `LOT-${new Date().getFullYear()}-01`,
        peremption: "2028-12-31",
        prix_unitaire_fcfa: 2000,
        couverture_csu: true,
      };
    }
    if (type === "facture_sante") {
      return {
        id: `fac-sante-${Date.now()}`,
        numero: `FAC-SANTE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        patient_nom: patients[0]?.nom ? `${patients[0].nom} ${patients[0].prenom}` : "Patient",
        ip_unique: patients[0]?.ip_unique || "PAT-2026-0001",
        prestations: "Consultation Spécialisée + Soins",
        total_ttc_fcfa: 25000,
        part_csu_fcfa: 20000,
        ticket_moderateur_patient_fcfa: 5000,
        statut_paiement: "Payé",
        mode_reglement: "Orange Money",
        reference_transaction: `OM-${Date.now().toString().slice(-6)}`,
        date_facture: new Date().toISOString().slice(0, 10),
      };
    }
    return {};
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-[#102530] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white">
            {isEdit ? "Modifier" : "Ajouter"} : {type.replace("_", " ").toUpperCase()}
          </h3>
          <button type="button" onClick={onClose} className="p-1 text-[#8FA8B0] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
          {type === "utilisateur_syngeshp" && (
            <>
              <div>
                <label className="block text-[#8FA8B0] mb-1 font-medium">Nom Complet &amp; Titre *</label>
                <input
                  type="text"
                  required
                  value={formData.nom_complet || ""}
                  onChange={(e) => setFormData({ ...formData, nom_complet: e.target.value })}
                  placeholder="ex. Dr. Alain Mbida, Mme. Pauline Meka"
                  className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1 font-medium">Email / Identifiant *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="praticien@hgy.cm"
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1 font-medium">Téléphone</label>
                  <input
                    type="text"
                    value={formData.telephone || ""}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+237 6 99 00 11 22"
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1 font-medium">Rôle &amp; Profil</label>
                  <select
                    value={formData.role || "Médecin Spécialiste"}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    <option value="Directeur / Médecin-Chef">Directeur / Médecin-Chef</option>
                    <option value="Médecin Spécialiste">Médecin Spécialiste</option>
                    <option value="Major de service / Cadre infirmier">Major de service / Cadre infirmier</option>
                    <option value="Infirmier(ère)">Infirmier(ère)</option>
                    <option value="Pharmacien Hospitalier">Pharmacien Hospitalier</option>
                    <option value="Gestionnaire CSU / Caissier">Gestionnaire CSU / Caissier</option>
                    <option value="Administrateur IT">Administrateur IT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1 font-medium">Statut</label>
                  <select
                    value={formData.statut || "Actif"}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Suspendu">Suspendu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1 font-medium">Hôpital (Clé Étrangère)</label>
                  <select
                    value={formData.etablissement_id || etablissements[0]?.id}
                    onChange={(e) => {
                      const etab = etablissements.find((x) => x.id === e.target.value);
                      setFormData({
                        ...formData,
                        etablissement_id: e.target.value,
                        etablissement_nom: etab?.nom || "",
                      });
                    }}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    {etablissements.map((e) => (
                      <option key={e.id} value={e.id}>{e.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1 font-medium">Service</label>
                  <select
                    value={formData.service_id || services[0]?.id}
                    onChange={(e) => {
                      const srv = services.find((x) => x.id === e.target.value);
                      setFormData({
                        ...formData,
                        service_id: e.target.value,
                        service_nom: srv?.nom || "",
                      });
                    }}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {type === "etablissement" && (
            <>
              <div>
                <label className="block text-[#8FA8B0] mb-1">Nom Officiel de l'Établissement *</label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="ex: Hôpital Régional de Garoua"
                  className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Type d'Établissement</label>
                  <select
                    value={formData.type_etablissement}
                    onChange={(e) => setFormData({ ...formData, type_etablissement: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    <option>Hôpital Général / 1ère Catégorie</option>
                    <option>Hôpital Régional / 2ème Catégorie</option>
                    <option>Hôpital de District / 4ème Catégorie</option>
                    <option>Centre Médical d'Arrondissement (CMA)</option>
                    <option>Clinique Privée / Confessionnelle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Région</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    <option>Centre</option>
                    <option>Littoral</option>
                    <option>Ouest</option>
                    <option>Nord</option>
                    <option>Extrême-Nord</option>
                    <option>Adamaoua</option>
                    <option>Sud</option>
                    <option>Est</option>
                    <option>Nord-Ouest</option>
                    <option>Sud-Ouest</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Ville / Localité</label>
                  <input
                    type="text"
                    required
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Capacité en Lits</label>
                  <input
                    type="number"
                    required
                    value={formData.capacite_lits}
                    onChange={(e) => setFormData({ ...formData, capacite_lits: Number(e.target.value) })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {type === "personnel" && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Titre</label>
                  <select
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    <option>Dr.</option>
                    <option>Pr.</option>
                    <option>Mme</option>
                    <option>M.</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[#8FA8B0] mb-1">Nom & Prénom *</label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Nom du praticien"
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Catégorie Professionnelle</label>
                  <select
                    value={formData.categorie}
                    onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    <option>Médecin Spécialiste</option>
                    <option>Médecin Généraliste</option>
                    <option>Infirmier Diplômé d'État (IDE)</option>
                    <option>Sage-femme Principale</option>
                    <option>Technicien Médico-Sanitaire</option>
                    <option>Pharmacien Hospitalier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Spécialité</label>
                  <input
                    type="text"
                    required
                    value={formData.specialite}
                    onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Service d'Affectation</label>
                  <select
                    value={formData.service_nom}
                    onChange={(e) => setFormData({ ...formData, service_nom: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.nom}>{s.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Téléphone</label>
                  <input
                    type="text"
                    required
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {type === "garde" && (
            <>
              <div>
                <label className="block text-[#8FA8B0] mb-1">Praticien / Agent de Garde *</label>
                <select
                  value={formData.personnel_nom}
                  onChange={(e) => setFormData({ ...formData, personnel_nom: e.target.value })}
                  className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                >
                  {personnel.map((p) => (
                    <option key={p.id} value={`${p.titre} ${p.nom} ${p.prenom}`}>
                      {p.titre} {p.nom} {p.prenom} ({p.specialite})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Service Couvert</label>
                  <select
                    value={formData.service_nom}
                    onChange={(e) => setFormData({ ...formData, service_nom: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.nom}>{s.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Type de Garde</label>
                  <select
                    value={formData.type_garde}
                    onChange={(e) => setFormData({ ...formData, type_garde: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    <option>Garde 24 Heures</option>
                    <option>Garde 12 Heures Nuit</option>
                    <option>Garde 12 Heures Jour</option>
                    <option>Astreinte Opérationnelle</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#8FA8B0] mb-1">Date de la Garde</label>
                <input
                  type="date"
                  required
                  value={formData.date_garde}
                  onChange={(e) => setFormData({ ...formData, date_garde: e.target.value })}
                  className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                />
              </div>
            </>
          )}

          {type === "conge" && (
            <>
              <div>
                <label className="block text-[#8FA8B0] mb-1">Personnel Demandeur *</label>
                <select
                  value={formData.personnel_nom}
                  onChange={(e) => setFormData({ ...formData, personnel_nom: e.target.value })}
                  className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                >
                  {personnel.map((p) => (
                    <option key={p.id} value={`${p.titre} ${p.nom} ${p.prenom}`}>
                      {p.titre} {p.nom} {p.prenom} (Solde : {p.solde_conges_jours} j)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Date Début</label>
                  <input
                    type="date"
                    required
                    value={formData.date_debut}
                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Date Fin</label>
                  <input
                    type="date"
                    required
                    value={formData.date_fin}
                    onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#8FA8B0] mb-1">Motif du Congé / Mission</label>
                <textarea
                  rows={2}
                  required
                  value={formData.motif}
                  onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                  className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                />
              </div>
            </>
          )}

          {type === "patient" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Prénom</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Sexe</label>
                  <select
                    value={formData.sexe}
                    onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    <option>M</option>
                    <option>F</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Âge</label>
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Groupe Sanguin</label>
                  <select
                    value={formData.groupe_sanguin}
                    onChange={(e) => setFormData({ ...formData, groupe_sanguin: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    <option>O+</option>
                    <option>A+</option>
                    <option>B+</option>
                    <option>AB+</option>
                    <option>O-</option>
                    <option>A-</option>
                    <option>B-</option>
                    <option>AB-</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Téléphone</label>
                  <input
                    type="text"
                    required
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Couverture / Assurance</label>
                  <select
                    value={formData.couverture}
                    onChange={(e) => setFormData({ ...formData, couverture: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    <option>Couverture Santé Universelle (CSU)</option>
                    <option>Assurance Privée (Ascoma)</option>
                    <option>Plein Tarif (Paiement Direct)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {type === "rdv" && (
            <>
              <div>
                <label className="block text-[#8FA8B0] mb-1">Nom du Patient *</label>
                <input
                  type="text"
                  required
                  value={formData.patient_nom}
                  onChange={(e) => setFormData({ ...formData, patient_nom: e.target.value })}
                  className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Téléphone Patient</label>
                  <input
                    type="text"
                    required
                    value={formData.patient_tel}
                    onChange={(e) => setFormData({ ...formData, patient_tel: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Service</label>
                  <select
                    value={formData.service_nom}
                    onChange={(e) => setFormData({ ...formData, service_nom: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.nom}>{s.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date_rdv}
                    onChange={(e) => setFormData({ ...formData, date_rdv: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Heure</label>
                  <input
                    type="time"
                    required
                    value={formData.heure_rdv}
                    onChange={(e) => setFormData({ ...formData, heure_rdv: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {type === "lit" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Chambre</label>
                  <input
                    type="text"
                    required
                    value={formData.chambre}
                    onChange={(e) => setFormData({ ...formData, chambre: e.target.value })}
                    placeholder="ex: CH-01"
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Numéro Lit</label>
                  <input
                    type="text"
                    required
                    value={formData.numero_lit}
                    onChange={(e) => setFormData({ ...formData, numero_lit: e.target.value })}
                    placeholder="ex: LIT-04"
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#8FA8B0] mb-1">Statut Initial</label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                >
                  <option>Disponible</option>
                  <option>Occupé</option>
                  <option>Réservé</option>
                  <option>En désinfection</option>
                </select>
              </div>
              {formData.statut === "Occupé" && (
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Nom du Patient Occupant</label>
                  <input
                    type="text"
                    value={formData.patient_nom || ""}
                    onChange={(e) => setFormData({ ...formData, patient_nom: e.target.value, date_admission: new Date().toISOString().slice(0, 16).replace("T", " ") })}
                    placeholder="Sélectionner ou saisir le nom"
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
              )}
            </>
          )}

          {type === "intervention" && (
            <>
              <div>
                <label className="block text-[#8FA8B0] mb-1">Salle d'Opération (Bloc) *</label>
                <select
                  value={formData.salle_bloc}
                  onChange={(e) => setFormData({ ...formData, salle_bloc: e.target.value })}
                  className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                >
                  <option>Salle 1 (Chirurgie Viscérale)</option>
                  <option>Salle 2 (Maternité / Césariennes)</option>
                  <option>Salle 3 (Orthopédie & Traumatologie)</option>
                  <option>Salle 4 (Urgences & Déchoquage)</option>
                </select>
              </div>
              <div>
                <label className="block text-[#8FA8B0] mb-1">Intitulé de l'Intervention *</label>
                <input
                  type="text"
                  required
                  value={formData.type_intervention}
                  onChange={(e) => setFormData({ ...formData, type_intervention: e.target.value })}
                  className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Patient</label>
                  <input
                    type="text"
                    required
                    value={formData.patient_nom}
                    onChange={(e) => setFormData({ ...formData, patient_nom: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Chirurgien Principal</label>
                  <input
                    type="text"
                    required
                    value={formData.chirurgien_principal}
                    onChange={(e) => setFormData({ ...formData, chirurgien_principal: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {type === "examen" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Pôle Médical</label>
                  <select
                    value={formData.categorie}
                    onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    <option>Laboratoire</option>
                    <option>Imagerie Médicale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Type d'Examen *</label>
                  <input
                    type="text"
                    required
                    value={formData.type_examen}
                    onChange={(e) => setFormData({ ...formData, type_examen: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Patient</label>
                  <input
                    type="text"
                    required
                    value={formData.patient_nom}
                    onChange={(e) => setFormData({ ...formData, patient_nom: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Prescripteur</label>
                  <input
                    type="text"
                    required
                    value={formData.prescripteur}
                    onChange={(e) => setFormData({ ...formData, prescripteur: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {type === "medicament" && (
            <>
              <div>
                <label className="block text-[#8FA8B0] mb-1">Désignation DCI *</label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Quantité Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.quantite_stock}
                    onChange={(e) => setFormData({ ...formData, quantite_stock: Number(e.target.value) })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Prix Unitaire (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={formData.prix_unitaire_fcfa}
                    onChange={(e) => setFormData({ ...formData, prix_unitaire_fcfa: Number(e.target.value) })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {type === "facture_sante" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Nom du Patient</label>
                  <input
                    type="text"
                    required
                    value={formData.patient_nom}
                    onChange={(e) => setFormData({ ...formData, patient_nom: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Identifiant IP</label>
                  <input
                    type="text"
                    required
                    value={formData.ip_unique}
                    onChange={(e) => setFormData({ ...formData, ip_unique: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#8FA8B0] mb-1">Détails des Prestations</label>
                <input
                  type="text"
                  required
                  value={formData.prestations}
                  onChange={(e) => setFormData({ ...formData, prestations: e.target.value })}
                  className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Total TTC (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={formData.total_ttc_fcfa}
                    onChange={(e) => {
                      const tot = Number(e.target.value);
                      const csu = Math.round(tot * 0.8);
                      setFormData({
                        ...formData,
                        total_ttc_fcfa: tot,
                        part_csu_fcfa: csu,
                        ticket_moderateur_patient_fcfa: tot - csu,
                      });
                    }}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Part CSU (80%)</label>
                  <input
                    type="number"
                    readOnly
                    value={formData.part_csu_fcfa}
                    className="w-full p-2 rounded bg-[#0A1A22] border border-white/10 text-emerald-400 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Part Patient</label>
                  <input
                    type="number"
                    readOnly
                    value={formData.ticket_moderateur_patient_fcfa}
                    className="w-full p-2 rounded bg-[#0A1A22] border border-white/10 text-[#1E8FA6] font-mono outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Mode de Règlement</label>
                  <select
                    value={formData.mode_reglement}
                    onChange={(e) => setFormData({ ...formData, mode_reglement: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    <option>Orange Money</option>
                    <option>MTN Mobile Money</option>
                    <option>Espèces (Régie)</option>
                    <option>Virement Bancaire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Statut Paiement</label>
                  <select
                    value={formData.statut_paiement}
                    onChange={(e) => setFormData({ ...formData, statut_paiement: e.target.value })}
                    className="w-full p-2 rounded bg-[#0D1F28] border border-white/10 text-white outline-none"
                  >
                    <option>Payé</option>
                    <option>En attente</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors">
            Annuler
          </button>
          <button type="submit" className="px-4 py-1.5 rounded-lg text-xs bg-[#1E8FA6] hover:bg-[#28abc7] text-white font-semibold transition-colors">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
