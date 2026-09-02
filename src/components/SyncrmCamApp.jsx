import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import QRCode from "qrcode";
const logoRTC = new URL("../../assets/logo/logo_crc.png", import.meta.url).href;
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, Legend,
} from "recharts";
import {
  LayoutDashboard, Building2, Users, TrendingUp, LifeBuoy, Send,
  Wallet, Clock, PhoneCall, Mail, MessageSquare, Search, Plus,
  Check, X, ChevronRight, Download, Filter, RefreshCw, Database,
  ArrowRight, Tag, ShieldCheck, AlertCircle, FileText, CheckCircle2,
  Calendar, Star, UserCheck, ExternalLink, HelpCircle, Server, Cloud, Copy,
  CreditCard, Smartphone, Eye, Pencil, Trash2, LogOut, ChevronDown,
  ShieldAlert, PowerOff, Power, Sliders, Layers, Link2, Radio,
  UsersRound, Sparkles, LayoutGrid, CheckSquare, Activity, Globe,
  Shield, Award, Landmark, ChevronUp, Briefcase, UserPlus, FileSpreadsheet,
  DollarSign, Umbrella, AlertTriangle, FileCheck, CalendarDays, BarChart2,
  PieChart as PieIcon, Upload, ArrowUpRight, Bus, MapPin, Truck, Printer
} from "lucide-react";
import {
  getSupabaseCredentials,
  saveCustomCredentials,
  clearCustomCredentials,
  testSupabaseConnection,
  getSupabaseClient,
  syncrmDatabase,
} from "../lib/supabaseClient";

// ============================================================================
// DESIGN TOKENS CRM & RH RTC ENTERPRISE
// ============================================================================
const CRM_THEME = {
  primary: "#714B67",        // Aubergine RTC
  primaryDark: "#5B3A52",    // Dark Purple
  primaryLight: "#875A7B",   // Light Purple
  accent: "#00A09D",         // Teal RTC
  accentDark: "#008784",
  barDark: "#1E1F29",        // Dark Header
  subBarDark: "#2E3040",     // Sub Header
  bgDark: "#0B131B",         // Main Background
  cardDark: "#13212D",       // Main Card Background
  cardBorder: "rgba(255, 255, 255, 0.08)",
  textMain: "#EAF2F4",
  textMuted: "#8FA8B0",
  success: "#28A745",
  warning: "#F0AD4E",
  danger: "#DC3545",
  info: "#17A2B8",
};

// Étapes du Pipeline Commercial CRM
const ETAPES_PIPELINE = [
  { id: "Nouveau", label: "Nouveau", color: "#17A2B8", pct: 10 },
  { id: "Qualifié", label: "Qualifié", color: "#875A7B", pct: 35 },
  { id: "Proposition", label: "Proposition", color: "#F0AD4E", pct: 65 },
  { id: "Négociation", label: "Négociation", color: "#E06D53", pct: 85 },
  { id: "Gagné", label: "Gagné", color: "#28A745", pct: 100 },
  { id: "Perdu", label: "Perdu", color: "#6C757D", pct: 0 },
];

// Étapes du Pipeline de Recrutement RH
const ETAPES_RECRUTEMENT = [
  { id: "Nouveau", label: "Candidature reçue", color: "#17A2B8" },
  { id: "Qualification", label: "Qualification", color: "#875A7B" },
  { id: "Entretien1", label: "1er Entretien", color: "#F0AD4E" },
  { id: "Entretien2", label: "2e Entretien", color: "#E06D53" },
  { id: "Proposition", label: "Proposition Contrat", color: "#00A09D" },
  { id: "Recruté", label: "Recruté", color: "#28A745" },
];

// ============================================================================
// COMPOSANT PRINCIPAL CRM & SUITE RH RTC
// ============================================================================
export default function SyncrmCamApp({
  onExit = () => {},
  onNavigateTab = () => {},
  adminNom = "Patrick MBALLA",
  sessionRole = "admin",
  sessionUser = null,
  syncrmActif = true,
  onToggleActif = () => {},
  onNotify = () => {},
  employesRTC = [],
  onUpdateEmployesRTC = () => {},
  agencesRTC = [],
  onUpdateAgencesRTC = () => {},
  eventsRTC = [],
  onAddEventRTC = () => {},
  onDeleteEventRTC = () => {},
}) {
  // Contrôle d'accès : Réservé au personnel habilité RTC
  const estPersonnelRTC =
    sessionRole === "admin" ||
    sessionRole === "rh" ||
    sessionUser?.role === "Employe RTC" ||
    sessionUser?.role === "Responsable/Directeur RH" ||
    sessionUser?.role === "Technicien RH" ||
    sessionUser?.profil === "Administrateur système" ||
    sessionUser?.profil === "Administrateur système RTC" ||
    sessionUser?.profil === "RTC";

  // Navigation Active :
  // Commercial : 'dashboard' | 'pipeline' | 'comptes' | 'tickets' | 'factures' | 'agenda'
  // RH : 'employes' | 'recrutement' | 'feuillesTemps' | 'conges' | 'paie' | 'departements'
  const [activeApp, setActiveApp] = useState("dashboard");
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban' | 'list'

  // Filtre Agences MINT & Abonnement 2 500 F
  const [agenceFilterType, setAgenceFilterType] = useState("ALL"); // 'ALL' | 'HOMOLOGUEE' | 'PAYEE_2500' | 'EN_ATTENTE'

  // --------------------------------------------------------------------------
  // ÉTAT LOCAL SYNCHRONISÉ AVEC LE RESTE DE L'APPLICATION
  // --------------------------------------------------------------------------

  // Opportunités
  const [opportunites, setOpportunites] = useState([
    {
      id: "c1111111-1111-1111-1111-111111111111",
      titre: "Déploiement 65 Boîtiers GPS & Terminaux Billet QR Code — Général Express",
      compte_nom: "Général Express Voyages",
      etape: "Gagné",
      montant_fcfa: 15000000,
      probabilite: 100,
      date_cloture_prevue: "2026-09-15",
      responsable: "Patrick Mballa",
      source: "Portail RTC",
    },
    {
      id: "c2222222-2222-2222-2222-222222222222",
      titre: "Équipement 80 Bus & Guichets Numériques Connectés — Buca Voyages",
      compte_nom: "Buca Voyages Littoral",
      etape: "Négociation",
      montant_fcfa: 12500000,
      probabilite: 85,
      date_cloture_prevue: "2026-09-30",
      responsable: "Patrick Mballa",
      source: "Démarchage Direct",
    },
    {
      id: "c3333333-3333-3333-3333-333333333333",
      titre: "Système de Télémétrie Satellite & Alertes SOS Grand Nord — Touristique Express",
      compte_nom: "Touristique Express",
      etape: "Proposition",
      montant_fcfa: 18200000,
      probabilite: 65,
      date_cloture_prevue: "2026-10-15",
      responsable: "Patrick Mballa",
      source: "Recommandation MINT",
    },
    {
      id: "c4444444-4444-4444-4444-444444444444",
      titre: "Terminaux Embarquement Sécurisé & Contrôle Chauffeurs — Finexs Voyages",
      compte_nom: "Finexs Voyages Douala",
      etape: "Qualifié",
      montant_fcfa: 14000000,
      probabilite: 35,
      date_cloture_prevue: "2026-11-01",
      responsable: "Jean-Paul Kamga",
      source: "Appel d'Offres",
    },
  ]);

  // Support / Tickets
  const [tickets, setTickets] = useState([
    {
      id: "d1111111-1111-1111-1111-111111111111",
      numero: "TIC-2026-0041",
      titre: "Billet SMS non reçu après paiement USSD (*1234#)",
      contact_nom: "Suzanne Charlotte Eboa",
      contact_tel: "+237 655 44 33 22",
      compte_nom: "Voyageur Régulier / Particulier",
      type: "Assistance Billetterie",
      priorite: "Haute",
      statut: "En cours",
      assigne_a: "Patrick Mballa",
    },
    {
      id: "d2222222-2222-2222-2222-222222222222",
      numero: "TIC-2026-0042",
      titre: "Demande de recalibrage de boîtier GPS Bus N° 14 — Buca Voyages",
      contact_nom: "Serge Belinga",
      contact_tel: "+237 699 11 22 34",
      compte_nom: "Buca Voyages Littoral",
      type: "Maintenance Matériel",
      priorite: "Moyenne",
      statut: "Nouveau",
      assigne_a: "Sarah Ngo Ndjock",
    },
  ]);

  // Factures Flottes
  const [factures, setFactures] = useState([
    {
      id: "f1111111-1111-1111-1111-111111111111",
      numero: "FAC-2026-0801",
      compte_nom: "Général Voyages",
      objet: "Abonnement Annuel Plateforme SYNSR (65 Bus @ 2 500 FCFA/bus)",
      montant_ht: 136500,
      tva: 26000,
      montant_ttc: 162500,
      statut: "Payé",
      mode_reglement: "Virement Bancaire",
      date_emission: "2026-08-01",
      date_echeance: "2026-08-31",
    },
    {
      id: "f2222222-2222-2222-2222-222222222222",
      numero: "FAC-2026-0802",
      compte_nom: "Touristique Express",
      objet: "Abonnement Annuel & Homologation MINT (80 Bus @ 2 500 FCFA/bus)",
      montant_ht: 168000,
      tva: 32000,
      montant_ttc: 200000,
      statut: "Payé",
      mode_reglement: "Orange Money Pro",
      date_emission: "2026-08-10",
      date_echeance: "2026-09-10",
    },
    {
      id: "f3333333-3333-3333-3333-333333333333",
      numero: "FAC-2026-0803",
      compte_nom: "Vatican Voyages",
      objet: "Abonnement Annuel Plateforme SYNSR 2026 (En attente)",
      montant_ht: 2100,
      tva: 400,
      montant_ttc: 2500,
      statut: "En attente",
      mode_reglement: "À régulariser",
      date_emission: "2026-08-25",
      date_echeance: "2026-09-25",
    },
  ]);

  // Candidatures Recrutement
  const [candidatures, setCandidatures] = useState([
    {
      id: "cand-01",
      nom_candidat: "Kevin TAGNE",
      poste_titre: "Développeur Full-Stack React / Supabase",
      email: "kevin.tagne@gmail.com",
      telephone: "+237 671 22 33 44",
      etape: "Entretien2",
      evaluation: 4,
      salaire_souhaite: 600000,
      disponibilite: "Immédiate",
      notes: "Excellente maîtrise de React, Tailwind et PostgreSQL. Test technique réussi avec mention.",
    },
    {
      id: "cand-02",
      nom_candidat: "Laure ATANGANA",
      poste_titre: "Chargé de Recrutement & Formation RH",
      email: "laure.atangana@yahoo.fr",
      telephone: "+237 699 44 55 66",
      etape: "Proposition",
      evaluation: 5,
      salaire_souhaite: 550000,
      disponibilite: "Sous 1 mois",
      notes: "Expérience confirmée de 4 ans en gestion des ressources humaines.",
    },
    {
      id: "cand-03",
      nom_candidat: "Bertrand NZEUKOU",
      poste_titre: "Opérateur Régulateur SOS & Trafic 24/7",
      email: "b.nzeukou@gmail.com",
      telephone: "+237 655 77 88 99",
      etape: "Entretien1",
      evaluation: 3,
      salaire_souhaite: 350000,
      disponibilite: "Immédiate",
      notes: "Bon sens de la communication et réactivité face aux situations d'urgence routière.",
    },
  ]);

  // Feuilles de temps (Semaine SAMEDI -> VENDREDI, 40h/sem, 8h/jour)
  const [feuillesTemps, setFeuillesTemps] = useState([
    {
      id: "ft-001",
      matricule: "0004",
      nom: "Ngo Bakoa",
      semaine_label: "Semaine du Samedi 22/08 au Vendredi 28/08/2026",
      statut: "Approuvé",
      projet: "SYNSR-CAM Transport & Cartographie",
      tache: "Optimisation de l'API de géolocalisation et WebSockets SOS",
      samedi: 8,
      dimanche: 0,
      lundi: 8,
      mardi: 8,
      mercredi: 8,
      jeudi: 8,
      vendredi: 0,
      total_heures: 40,
      heures_normales: 40,
      heures_supp: 0,
    },
    {
      id: "ft-002",
      matricule: "0001",
      nom: "Patrick MBALLA",
      semaine_label: "Semaine du Samedi 22/08 au Vendredi 28/08/2026",
      statut: "Approuvé",
      projet: "Opérations Réseau SYNSR",
      tache: "Supervision des agences VIP et contrôle des manifestes",
      samedi: 8,
      dimanche: 4,
      lundi: 8,
      mardi: 8,
      mercredi: 8,
      jeudi: 8,
      vendredi: 0,
      total_heures: 44,
      heures_normales: 40,
      heures_supp: 4,
    },
    {
      id: "ft-003",
      matricule: "0003",
      nom: "Talla Yves",
      semaine_label: "Semaine du Samedi 29/08 au Vendredi 04/09/2026",
      statut: "Soumis",
      projet: "Contrôle Routier Terrain",
      tache: "Inspection des bus et vérification des billets QR Code",
      samedi: 8,
      dimanche: 0,
      lundi: 8,
      mardi: 8,
      mercredi: 8,
      jeudi: 8,
      vendredi: 0,
      total_heures: 40,
      heures_normales: 40,
      heures_supp: 0,
    },
  ]);

  // Congés
  const [conges, setConges] = useState([
    {
      id: "cg-001",
      matricule: "0003",
      nom_employe: "Talla Yves",
      type: "Congé Maladie",
      date_debut: "2026-08-18",
      date_fin: "2026-08-20",
      jours_ouvres: 3,
      statut: "Approuvé",
      motif: "Paludisme aigu avec repos médical prescrit.",
      justificatif: "Certificat_Medical_Dr_HGY.pdf",
    },
    {
      id: "cg-002",
      matricule: "0002",
      nom_employe: "Essomba Ruth",
      type: "Vacances (Congés payés)",
      date_debut: "2026-09-15",
      date_fin: "2026-09-25",
      jours_ouvres: 9,
      statut: "En attente d'approbation",
      motif: "Congé annuel de repos après mise en production.",
      justificatif: null,
    },
  ]);

  // Bulletins de Paie
  const [bulletinsPaie, setBulletinsPaie] = useState([
    {
      id: "pay-001",
      numero: "PAIE-2026-08-001",
      matricule: "0001",
      nom: "Patrick MBALLA",
      poste: "Administrateur système / DG",
      periode: "Août 2026",
      heures_travaillees: 160,
      heures_supp: 4,
      salaire_base: 850000,
      primes: 100000,
      indemnites: 50000,
      salaire_brut: 1000000,
      retenue_cnps: 42000,
      retenue_irpp: 75000,
      retenue_tcs: 8500,
      total_retenues: 125500,
      salaire_net: 874500,
      statut: "Payé",
      mode_reglement: "Virement Bancaire (Afriland First Bank)",
    },
    {
      id: "pay-002",
      numero: "PAIE-2026-08-002",
      matricule: "0002",
      nom: "Essomba Ruth",
      poste: "Support / Relation Usagers",
      periode: "Août 2026",
      heures_travaillees: 160,
      heures_supp: 0,
      salaire_base: 420000,
      primes: 30000,
      indemnites: 25000,
      salaire_brut: 475000,
      retenue_cnps: 19950,
      retenue_irpp: 32000,
      retenue_tcs: 4500,
      total_retenues: 56450,
      salaire_net: 418550,
      statut: "Payé",
      mode_reglement: "Virement Bancaire (BICEC)",
    },
    {
      id: "pay-003",
      numero: "PAIE-2026-08-003",
      matricule: "0004",
      nom: "Ngo Bakoa",
      poste: "Analyste / Télémétrie Flottes",
      periode: "Août 2026",
      heures_travaillees: 160,
      heures_supp: 0,
      salaire_base: 550000,
      primes: 45000,
      indemnites: 30000,
      salaire_brut: 625000,
      retenue_cnps: 26250,
      retenue_irpp: 45000,
      retenue_tcs: 5500,
      total_retenues: 76750,
      salaire_net: 548250,
      statut: "Payé",
      mode_reglement: "Virement Bancaire (UBA)",
    },
  ]);

  // Recherche & Filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");

  // Modales
  const [modalType, setModalType] = useState(null); // 'opportunite' | 'employe' | 'candidat' | 'feuille' | 'conge' | 'bulletinView' | 'agence' | 'ticket' | 'facture' | 'evenement'
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // État Supabase
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState({ connected: false, message: "" });
  const [syncLoading, setSyncLoading] = useState(false);

  // Formulaire Employé (Propagé vers App.jsx employesRTC)
  const [formEmploye, setFormEmploye] = useState({
    nom: "",
    matricule: "",
    profil: "RTC",
    role: "Support",
    email: "",
    salaire: 500000,
    dateDebut: new Date().toISOString().slice(0, 10),
    statut: "Confirmé",
  });

  // Formulaire Opportunité
  const [formOpp, setFormOpp] = useState({
    titre: "",
    compte_nom: "",
    etape: "Nouveau",
    montant_fcfa: 5000000,
    date_cloture_prevue: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    responsable: adminNom,
  });

  // Formulaire Agence (Propagé vers App.jsx agencesRTC)
  const [formAgence, setFormAgence] = useState({
    nom: "",
    ville: "Douala",
    chefAgence: "",
    statut: "Validée",
    agrement: "agrement_officiel.pdf",
    recuAbonnement: "recu_2026.pdf",
  });

  // Formulaire Feuille de Temps (Cycle Samedi-Vendredi 40h)
  const [formFeuille, setFormFeuille] = useState({
    matricule: "0001",
    projet: "SYNSR-CAM Transport",
    tache: "Supervision et coordination du réseau",
    samedi: 8,
    dimanche: 0,
    lundi: 8,
    mardi: 8,
    mercredi: 8,
    jeudi: 8,
    vendredi: 0,
  });

  // Formulaire Congé
  const [formConge, setFormConge] = useState({
    matricule: "0001",
    type: "Vacances (Congés payés)",
    date_debut: new Date().toISOString().slice(0, 10),
    date_fin: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    motif: "",
    justificatif: "",
  });

  // Formulaire Candidat
  const [formCandidat, setFormCandidat] = useState({
    nom_candidat: "",
    poste_titre: "Opérateur Régulateur SOS & Trafic 24/7",
    email: "",
    telephone: "",
    salaire_souhaite: 450000,
    disponibilite: "Immédiate",
    notes: "",
    evaluation: 4,
  });

  // Formulaire Ticket
  const [formTicket, setFormTicket] = useState({
    titre: "",
    contact_nom: "",
    contact_tel: "",
    compte_nom: "Voyageur Régulier",
    type: "Assistance Billetterie",
    priorite: "Moyenne",
    assigne_a: adminNom,
  });

  // Formulaire Événement Agenda
  const [formEvent, setFormEvent] = useState({
    title: "",
    date: new Date().toISOString().slice(0, 10),
    time: "10:00",
    category: "SYNSR",
    description: "",
  });

  // Test connexion Supabase
  useEffect(() => {
    async function checkSupabase() {
      const res = await testSupabaseConnection();
      setSupabaseStatus(res);
    }
    checkSupabase();
  }, []);

  const handleSyncSupabase = async () => {
    setSyncLoading(true);
    try {
      const res = await testSupabaseConnection();
      setSupabaseStatus(res);
      if (res.connected) {
        onNotify?.("Synchronisation réussie avec Supabase !", "success");
      } else {
        onNotify?.("Mode local actif : données synchronisées avec votre session RTC.", "info");
      }
    } catch (e) {
      onNotify?.("Erreur de synchronisation", "error");
    } finally {
      setSyncLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // LISTE DES EMPLOYÉS CONSOLIDÉE (App.jsx employesRTC + local)
  // --------------------------------------------------------------------------
  const listeEmployesConsolidee = useMemo(() => {
    if (employesRTC && employesRTC.length > 0) {
      return employesRTC;
    }
    return [
      { id: "EMP-01", matricule: "0001", nom: "Patrick MBALLA", profil: "RTC", role: "Administrateur système / DG", email: "patrick.mballa@rtc.cm", salaire: 850000, statut: "Confirmé" },
      { id: "EMP-02", matricule: "0002", nom: "Essomba Ruth", profil: "RTC", role: "Support", email: "essomba.ruth@rtc.cm", salaire: 420000, statut: "Confirmé" },
      { id: "EMP-03", matricule: "0003", nom: "Talla Yves", profil: "RTC", role: "Technicien", email: "talla.yves@rtc.cm", salaire: 480000, statut: "Confirmé" },
      { id: "EMP-04", matricule: "0004", nom: "Ngo Bakoa", profil: "RTC", role: "Analyste", email: "ngo.bakoa@rtc.cm", salaire: 550000, statut: "Confirmé" },
    ];
  }, [employesRTC]);

  // --------------------------------------------------------------------------
  // LISTE DES AGENCES CONSOLIDÉE (App.jsx agencesRTC + local)
  // --------------------------------------------------------------------------
  const listeAgencesConsolidee = useMemo(() => {
    if (agencesRTC && agencesRTC.length > 0) {
      return agencesRTC;
    }
    return [
      { id: "AG-0091", nom: "Général Voyages", ville: "Douala", chefAgence: "Ekwalla Paul", statut: "Validée", agrement: "agrement_general_voyages.pdf", recuAbonnement: "recu_2026_general_voyages.pdf", dateApprobation: "2026-01-15", approuvePar: "MINT" },
      { id: "AG-0092", nom: "Touristique Express", ville: "Yaoundé", chefAgence: "Mballa Estelle", statut: "Validée", agrement: "agrement_touristique_express.pdf", recuAbonnement: "recu_2026_touristique_express.pdf", dateApprobation: "2026-02-03", approuvePar: "MINT" },
      { id: "AG-0093", nom: "Vatican Voyages", ville: "Bafoussam", chefAgence: "Fotso Marcel", statut: "En attente", agrement: "", recuAbonnement: "" },
      { id: "AG-0094", nom: "Nso Boys Travel", ville: "Bamenda", chefAgence: "Nkeng Samuel", statut: "Validée", agrement: "agrement_nso_boys.pdf", recuAbonnement: "recu_2026_nso_boys.pdf", dateApprobation: "2026-01-28", approuvePar: "MINT" },
    ];
  }, [agencesRTC]);

  // Filtrage des Agences
  const filteredAgences = useMemo(() => {
    return listeAgencesConsolidee.filter((a) => {
      const matchSearch = a.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.ville.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (a.chefAgence && a.chefAgence.toLowerCase().includes(searchQuery.toLowerCase()));
      if (agenceFilterType === "HOMOLOGUEE") {
        return matchSearch && a.statut === "Validée";
      }
      if (agenceFilterType === "PAYEE_2500") {
        return matchSearch && Boolean(a.recuAbonnement);
      }
      if (agenceFilterType === "EN_ATTENTE") {
        return matchSearch && (a.statut !== "Validée" || !a.recuAbonnement);
      }
      return matchSearch;
    });
  }, [listeAgencesConsolidee, searchQuery, agenceFilterType]);

  // Filtrage des Employés
  const filteredEmployes = useMemo(() => {
    return listeEmployesConsolidee.filter((e) => {
      const matchSearch = e.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (e.role && e.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (e.matricule && e.matricule.includes(searchQuery));
      return matchSearch;
    });
  }, [listeEmployesConsolidee, searchQuery]);

  // KPI
  const kpis = useMemo(() => {
    const totalAgences = listeAgencesConsolidee.length;
    const agencesHomologuees = listeAgencesConsolidee.filter((a) => a.statut === "Validée").length;
    const agencesPayees2500 = listeAgencesConsolidee.filter((a) => Boolean(a.recuAbonnement)).length;
    const agencesEnAttente = listeAgencesConsolidee.filter((a) => a.statut !== "Validée" || !a.recuAbonnement).length;
    const totalCA = opportunites.filter((o) => o.etape === "Gagné").reduce((sum, o) => sum + (o.montant_fcfa || 0), 0);
    const masseSalariale = listeEmployesConsolidee.reduce((s, e) => s + (e.salaire || 0), 0);
    const ticketsOuverts = tickets.filter((t) => t.statut !== "Résolu" && t.statut !== "Clôturé").length;
    const feuillesEnAttente = feuillesTemps.filter((f) => f.statut === "Soumis").length;
    const congesEnAttente = conges.filter((c) => c.statut === "En attente d'approbation").length;

    return {
      totalAgences,
      agencesHomologuees,
      agencesPayees2500,
      agencesEnAttente,
      totalCA,
      masseSalariale,
      ticketsOuverts,
      feuillesEnAttente,
      congesEnAttente,
      totalEmployes: listeEmployesConsolidee.length,
    };
  }, [listeAgencesConsolidee, opportunites, listeEmployesConsolidee, tickets, feuillesTemps, conges]);

  // --------------------------------------------------------------------------
  // DONNÉES ANALYTIQUES DU TABLEAU DE BORD EXÉCUTIF
  // --------------------------------------------------------------------------
  const pipelineChartData = useMemo(() => {
    return ETAPES_PIPELINE.filter((e) => e.id !== "Perdu").map((et) => {
      const oppsInStage = opportunites.filter((o) => o.etape === et.id);
      const totalMontant = oppsInStage.reduce((s, o) => s + (o.montant_fcfa || 0), 0);
      return {
        etape: et.label,
        montant: totalMontant,
        nb: oppsInStage.length,
        color: et.color,
      };
    });
  }, [opportunites]);

  const agencesConformiteData = useMemo(() => {
    const payees = kpis.agencesPayees2500;
    const nonPayees = Math.max(0, kpis.totalAgences - payees);
    return [
      { name: "Homologuées MINT", value: kpis.agencesHomologuees, color: "#28A745" },
      { name: "Cotisation 2 500 F Réglée", value: payees, color: "#00A09D" },
      { name: "En attente Visa MINT", value: kpis.agencesEnAttente, color: "#F0AD4E" },
      { name: "Cotisation Non Réglée", value: nonPayees, color: "#E06D53" },
    ];
  }, [kpis]);

  const masseSalarialeParRoleData = useMemo(() => {
    const rolesMap = {};
    listeEmployesConsolidee.forEach((emp) => {
      const role = emp.role || "Support";
      if (!rolesMap[role]) rolesMap[role] = { role, totalSalaire: 0, effectif: 0 };
      rolesMap[role].totalSalaire += emp.salaire || 0;
      rolesMap[role].effectif += 1;
    });
    return Object.values(rolesMap);
  }, [listeEmployesConsolidee]);

  const heuresHebdoData = useMemo(() => {
    return [
      { jour: "Samedi", normales: 7, sup: 1 },
      { jour: "Dimanche", normales: 0, sup: 0 },
      { jour: "Lundi", normales: 8, sup: 1.5 },
      { jour: "Mardi", normales: 8, sup: 1 },
      { jour: "Mercredi", normales: 8, sup: 0.5 },
      { jour: "Jeudi", normales: 8, sup: 2 },
      { jour: "Vendredi", normales: 8, sup: 1 },
    ];
  }, []);

  // --------------------------------------------------------------------------
  // ACTIONS SUR LES AGENCES (PROPAGATION VERS APP.JSX agencesRTC)
  // --------------------------------------------------------------------------

  // Action : Valider Agrément MINT
  const handleValiderMINT = (agenceId) => {
    const updated = listeAgencesConsolidee.map((a) => {
      if (a.id === agenceId) {
        return {
          ...a,
          statut: "Validée",
          approuvePar: "MINT",
          dateApprobation: new Date().toISOString().slice(0, 10),
          agrement: a.agrement || `agrement_homologue_${a.id}.pdf`,
        };
      }
      return a;
    });
    onUpdateAgencesRTC(updated);
    onNotify?.("Agrément MINT validé et homologué !", "success");
  };

  // Action : Enregistrer Paiement Abonnement Annuel 2 500 FCFA
  const handlePayerAbonnement2500 = (agenceId) => {
    let agenceNom = "";
    const updated = listeAgencesConsolidee.map((a) => {
      if (a.id === agenceId) {
        agenceNom = a.nom;
        return {
          ...a,
          recuAbonnement: `recu_2026_abonnement_${a.id}.pdf`,
        };
      }
      return a;
    });
    onUpdateAgencesRTC(updated);

    // Ajouter la facture correspondante
    const nouvelleFacture = {
      id: `f-${Date.now()}`,
      numero: `FAC-2500-${Date.now().toString().slice(-4)}`,
      compte_nom: agenceNom,
      objet: "Frais d'abonnement annuel plateforme SYNSR (2 500 FCFA / an)",
      montant_ht: 2100,
      tva: 400,
      montant_ttc: 2500,
      statut: "Payé",
      mode_reglement: "Paiement Direct (Abonnement 2 500 FCFA)",
      date_emission: new Date().toISOString().slice(0, 10),
      date_echeance: new Date().toISOString().slice(0, 10),
    };
    setFactures((prev) => [nouvelleFacture, ...prev]);

    onNotify?.(`Paiement de 2 500 FCFA enregistré pour ${agenceNom}`, "success");
  };

  // Action : Créer une Agence
  const handleSaveAgence = (e) => {
    e.preventDefault();
    const newId = `AG-00${listeAgencesConsolidee.length + 91}`;
    const nouvelle = {
      id: newId,
      nom: formAgence.nom,
      ville: formAgence.ville,
      chefAgence: formAgence.chefAgence,
      statut: formAgence.statut,
      agrement: formAgence.agrement || (formAgence.statut === "Validée" ? "agrement_valide.pdf" : ""),
      recuAbonnement: formAgence.recuAbonnement || "recu_2026.pdf",
      dateApprobation: formAgence.statut === "Validée" ? new Date().toISOString().slice(0, 10) : "",
      approuvePar: formAgence.statut === "Validée" ? "MINT" : "",
    };

    onUpdateAgencesRTC([nouvelle, ...listeAgencesConsolidee]);
    setModalType(null);
    setFormAgence({ nom: "", ville: "Douala", chefAgence: "", statut: "Validée", agrement: "", recuAbonnement: "" });
    onNotify?.(`Agence ${nouvelle.nom} enregistrée dans le CRM & SYNSR`, "success");
  };

  // Action : Supprimer Agence
  const handleDeleteAgence = (agenceId) => {
    const updated = listeAgencesConsolidee.filter((a) => a.id !== agenceId);
    onUpdateAgencesRTC(updated);
    onNotify?.("Agence supprimée", "info");
  };

  // --------------------------------------------------------------------------
  // ACTIONS SUR LE PERSONNEL (PROPAGATION VERS APP.JSX employesRTC)
  // --------------------------------------------------------------------------

  // Action : Créer ou Modifier Employé (Propagé dans Pilotage RH)
  const handleSaveEmploye = (e) => {
    e.preventDefault();
    if (editingItem) {
      const updated = listeEmployesConsolidee.map((emp) =>
        emp.id === editingItem.id ? { ...emp, ...formEmploye } : emp
      );
      onUpdateEmployesRTC(updated);
      onNotify?.(`Fiche de ${formEmploye.nom} mise à jour`, "success");
    } else {
      let maxi = Math.max(0, ...listeEmployesConsolidee.map((e) => parseInt(e?.matricule || "0", 10) || 0));
      const newMatricule = String(maxi + 1).padStart(4, "0");
      const newId = `EMP-0${listeEmployesConsolidee.length + 1}`;

      const nouvelEmploye = {
        id: newId,
        matricule: formEmploye.matricule || newMatricule,
        nom: formEmploye.nom,
        profil: formEmploye.profil || "RTC",
        role: formEmploye.role || "Support",
        email: formEmploye.email || `${formEmploye.nom.toLowerCase().replace(/\s+/g, ".")}@rtc.cm`,
        salaire: Number(formEmploye.salaire) || 500000,
        dateDebut: formEmploye.dateDebut || new Date().toISOString().slice(0, 10),
        statut: formEmploye.statut || "Confirmé",
      };

      onUpdateEmployesRTC([...listeEmployesConsolidee, nouvelEmploye]);
      onNotify?.(`Employé ${nouvelEmploye.nom} (${nouvelEmploye.matricule}) ajouté au Pilotage RH & CRM`, "success");
    }

    setModalType(null);
    setEditingItem(null);
    setFormEmploye({ nom: "", matricule: "", profil: "RTC", role: "Support", email: "", salaire: 500000, dateDebut: new Date().toISOString().slice(0, 10), statut: "Confirmé" });
  };

  // Action : Supprimer Employé
  const handleDeleteEmploye = (empId) => {
    const updated = listeEmployesConsolidee.filter((e) => e.id !== empId);
    onUpdateEmployesRTC(updated);
    onNotify?.("Employé retiré du personnel RTC", "info");
  };

  // Action : Transformer un candidat recruté en Employé officiel RTC
  const handleEmbaucherCandidat = (cand) => {
    let maxi = Math.max(0, ...listeEmployesConsolidee.map((e) => parseInt(e?.matricule || "0", 10) || 0));
    const newMatricule = String(maxi + 1).padStart(4, "0");
    const newId = `EMP-0${listeEmployesConsolidee.length + 1}`;

    const nouvelEmploye = {
      id: newId,
      matricule: newMatricule,
      nom: cand.nom_candidat,
      profil: "RTC",
      role: cand.poste_titre,
      email: cand.email,
      salaire: Number(cand.salaire_souhaite) || 500000,
      dateDebut: new Date().toISOString().slice(0, 10),
      statut: "Confirmé",
    };

    onUpdateEmployesRTC([...listeEmployesConsolidee, nouvelEmploye]);
    setCandidatures((prev) => prev.map((c) => (c.id === cand.id ? { ...c, etape: "Recruté" } : c)));
    onNotify?.(`Félicitations ! ${cand.nom_candidat} est officiellement recruté comme Employé RTC (${newMatricule})`, "success");
  };

  // --------------------------------------------------------------------------
  // ACTIONS SUR LE PIPELINE COMMERCIAL
  // --------------------------------------------------------------------------
  const handleSaveOpp = (e) => {
    e.preventDefault();
    const nouvelleOpp = {
      id: `c-${Date.now()}`,
      titre: formOpp.titre,
      compte_nom: formOpp.compte_nom,
      etape: formOpp.etape,
      montant_fcfa: Number(formOpp.montant_fcfa),
      probabilite: ETAPES_PIPELINE.find((ep) => ep.id === formOpp.etape)?.pct || 10,
      date_cloture_prevue: formOpp.date_cloture_prevue,
      responsable: formOpp.responsable,
      source: "CRM Interne",
    };
    setOpportunites((prev) => [nouvelleOpp, ...prev]);
    setModalType(null);
    setFormOpp({ titre: "", compte_nom: "", etape: "Nouveau", montant_fcfa: 5000000, date_cloture_prevue: "", responsable: adminNom });
    onNotify?.("Convention enregistrée", "success");
  };

  const handleAvancerEtapeOpp = (oppId) => {
    setOpportunites((prev) =>
      prev.map((o) => {
        if (o.id !== oppId) return o;
        const currIdx = ETAPES_PIPELINE.findIndex((e) => e.id === o.etape);
        if (currIdx >= 0 && currIdx < ETAPES_PIPELINE.length - 2) {
          const nextEtape = ETAPES_PIPELINE[currIdx + 1].id;
          return { ...o, etape: nextEtape, probabilite: ETAPES_PIPELINE[currIdx + 1].pct };
        }
        return o;
      })
    );
    onNotify?.("Étape de la convention avancée", "success");
  };

  const handleDeleteOpp = (oppId) => {
    setOpportunites((prev) => prev.filter((o) => o.id !== oppId));
    onNotify?.("Opportunité supprimée", "info");
  };

  const handleSaveTicket = (e) => {
    e.preventDefault();
    const nouveauTicket = {
      id: `tck-${Date.now()}`,
      numero: `TCK-${new Date().getFullYear()}-${String(tickets.length + 1).padStart(3, "0")}`,
      titre: formTicket.titre,
      contact_nom: formTicket.contact_nom || "Demandeur",
      contact_tel: formTicket.contact_tel || "690000000",
      compte_nom: formTicket.compte_nom || "Voyageur Régulier",
      type: formTicket.type || "Assistance Billetterie",
      priorite: formTicket.priorite || "Normale",
      statut: "Nouveau",
      assigne_a: formTicket.assigne_a || adminNom,
      date_creation: new Date().toISOString().slice(0, 10),
    };
    setTickets((prev) => [nouveauTicket, ...prev]);
    setModalType(null);
    setFormTicket({
      titre: "",
      contact_nom: "",
      contact_tel: "",
      compte_nom: "Voyageur Régulier",
      type: "Assistance Billetterie",
      priorite: "Moyenne",
      assigne_a: adminNom,
    });
    onNotify?.("Ticket d'assistance créé avec succès", "success");
  };

  // --------------------------------------------------------------------------
  // ACTIONS SUR LES FEUILLES DE TEMPS (SAMEDI ➔ VENDREDI, 40H/SEM)
  // --------------------------------------------------------------------------
  const handleSaveFeuille = (e) => {
    e.preventDefault();
    const emp = listeEmployesConsolidee.find((em) => em.matricule === formFeuille.matricule);
    const total = Number(formFeuille.samedi) + Number(formFeuille.dimanche) + Number(formFeuille.lundi) +
                  Number(formFeuille.mardi) + Number(formFeuille.mercredi) + Number(formFeuille.jeudi) + Number(formFeuille.vendredi);
    const hNormales = Math.min(40, total);
    const hSupp = Math.max(0, total - 40);

    const nouvelleFeuille = {
      id: `ft-${Date.now()}`,
      matricule: formFeuille.matricule,
      nom: emp?.nom || "Employé",
      semaine_label: `Semaine en cours (Samedi ➔ Vendredi)`,
      statut: "Soumis",
      projet: formFeuille.projet,
      tache: formFeuille.tache,
      samedi: Number(formFeuille.samedi),
      dimanche: Number(formFeuille.dimanche),
      lundi: Number(formFeuille.lundi),
      mardi: Number(formFeuille.mardi),
      mercredi: Number(formFeuille.mercredi),
      jeudi: Number(formFeuille.jeudi),
      vendredi: Number(formFeuille.vendredi),
      total_heures: total,
      heures_normales: hNormales,
      heures_supp: hSupp,
    };

    setFeuillesTemps((prev) => [nouvelleFeuille, ...prev]);
    setModalType(null);
    onNotify?.("Feuille de temps soumise (Cycle Samedi-Vendredi)", "success");
  };

  const handleValiderFeuille = (ftId) => {
    setFeuillesTemps((prev) => prev.map((f) => (f.id === ftId ? { ...f, statut: "Approuvé" } : f)));
    onNotify?.("Feuille de temps validée avec succès (40h/sem)", "success");
  };

  const handleRejeterFeuille = (ftId) => {
    setFeuillesTemps((prev) => prev.map((f) => (f.id === ftId ? { ...f, statut: "Rejeté" } : f)));
    onNotify?.("Feuille de temps rejetée", "info");
  };

  // --------------------------------------------------------------------------
  // ACTIONS SUR LES CONGÉS
  // --------------------------------------------------------------------------
  const handleSaveConge = (e) => {
    e.preventDefault();
    const emp = listeEmployesConsolidee.find((em) => em.matricule === formConge.matricule);
    const d1 = new Date(formConge.date_debut);
    const d2 = new Date(formConge.date_fin);
    const diffDays = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);

    const nouveauConge = {
      id: `cg-${Date.now()}`,
      matricule: formConge.matricule,
      nom_employe: emp?.nom || "Employé",
      type: formConge.type,
      date_debut: formConge.date_debut,
      date_fin: formConge.date_fin,
      jours_ouvres: diffDays,
      statut: "En attente d'approbation",
      motif: formConge.motif,
      justificatif: formConge.justificatif || (formConge.type === "Congé Maladie" ? "Certificat_Medical_Joint.pdf" : null),
    };

    setConges((prev) => [nouveauConge, ...prev]);
    setModalType(null);
    onNotify?.("Demande d'absence enregistrée", "success");
  };

  const handleValiderConge = (cgId) => {
    setConges((prev) => prev.map((c) => (c.id === cgId ? { ...c, statut: "Approuvé" } : c)));
    onNotify?.("Demande de congé approuvée", "success");
  };

  const handleRejeterConge = (cgId) => {
    setConges((prev) => prev.map((c) => (c.id === cgId ? { ...c, statut: "Rejeté" } : c)));
    onNotify?.("Demande de congé rejetée", "info");
  };

  // --------------------------------------------------------------------------
  // ACTIONS SUR LA PAIE (CALCUL AUTOMATIQUE)
  // --------------------------------------------------------------------------
  const handleGenererBulletins = () => {
    const moisLabel = "Août 2026";
    const nouveaux = listeEmployesConsolidee.map((emp, idx) => {
      const base = Number(emp.salaire) || 500000;
      const ft = feuillesTemps.find((f) => f.matricule === emp.matricule);
      const hSupp = ft ? ft.heures_supp : 0;
      const tauxHoraire = base / 160;
      const primeHS = Math.round(hSupp * tauxHoraire * 1.25);
      const primeTransport = 35000;
      const brut = base + primeHS + primeTransport;

      const cnps = Math.round(brut * 0.042);
      const irpp = Math.round(brut * 0.075);
      const tcs = 5000;
      const totalRetenues = cnps + irpp + tcs;
      const net = brut - totalRetenues;

      return {
        id: `pay-${Date.now()}-${idx}`,
        numero: `PAIE-2026-08-${String(idx + 1).padStart(3, "0")}`,
        matricule: emp.matricule,
        nom: emp.nom,
        poste: emp.role || "Personnel RTC",
        periode: moisLabel,
        heures_travaillees: 160,
        heures_supp: hSupp,
        salaire_base: base,
        primes: primeHS,
        indemnites: primeTransport,
        salaire_brut: brut,
        retenue_cnps: cnps,
        retenue_irpp: irpp,
        retenue_tcs: tcs,
        total_retenues: totalRetenues,
        salaire_net: net,
        statut: "Payé",
        mode_reglement: "Virement Bancaire",
      };
    });

    setBulletinsPaie(nouveaux);
    onNotify?.("Bulletins de paie du mois recalculés pour tout le personnel RTC", "success");
  };

  // --------------------------------------------------------------------------
  // ACTIONS SUR L'AGENDA & ÉVÉNEMENTS
  // --------------------------------------------------------------------------
  const handleSaveEvent = (e) => {
    e.preventDefault();
    const newEvt = {
      id: `EVT-${Date.now()}`,
      title: formEvent.title,
      date: formEvent.date,
      time: formEvent.time,
      category: formEvent.category || "SYNSR",
      description: formEvent.description,
      author: adminNom,
      createdAt: new Date().toISOString(),
    };
    onAddEventRTC(newEvt);
    setModalType(null);
    setFormEvent({ title: "", date: new Date().toISOString().slice(0, 10), time: "10:00", category: "SYNSR", description: "" });
    onNotify?.("Événement ajouté à l'Agenda collaboratif RTC", "success");
  };

  // --------------------------------------------------------------------------
  // EXPORT EXCEL UNIVERSEL
  // --------------------------------------------------------------------------
  const handleExportExcel = (type) => {
    let data = [];
    let filename = `Export_RTC_${type}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    if (type === "agences" || type === "comptes") {
      data = listeAgencesConsolidee.map((a) => ({
        ID: a.id,
        "Nom Agence": a.nom,
        Ville: a.ville,
        "Chef d'Agence": a.chefAgence,
        "Statut MINT": a.statut,
        "Homologué par": a.approuvePar || "—",
        "Abonnement 2500 F": a.recuAbonnement ? "Payé (À jour)" : "Impayé",
      }));
    } else if (type === "employes") {
      data = listeEmployesConsolidee.map((e) => ({
        Matricule: e.matricule,
        Nom: e.nom,
        Profil: e.profil,
        Rôle: e.role,
        Email: e.email,
        "Salaire Base (FCFA)": e.salaire,
        Statut: e.statut,
      }));
    } else if (type === "feuilles") {
      data = feuillesTemps.map((f) => ({
        Matricule: f.matricule,
        Nom: f.nom,
        Semaine: f.semaine_label,
        "Total Heures": f.total_heures,
        "Heures Normales (40h)": f.heures_normales,
        "Heures Supp": f.heures_supp,
        Statut: f.statut,
      }));
    } else if (type === "paie") {
      data = bulletinsPaie.map((p) => ({
        Numéro: p.numero,
        Matricule: p.matricule,
        Nom: p.nom,
        Poste: p.poste,
        Période: p.periode,
        "Salaire Brut (FCFA)": p.salaire_brut,
        "Retenues (FCFA)": p.total_retenues,
        "Net à Payer (FCFA)": p.salaire_net,
        Statut: p.statut,
      }));
    } else {
      data = opportunites.map((o) => ({
        Titre: o.titre,
        Agence: o.compte_nom,
        Étape: o.etape,
        "Montant (FCFA)": o.montant_fcfa,
        Responsable: o.responsable,
        "Date Clôture": o.date_cloture_prevue,
      }));
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Données RTC");
    XLSX.writeFile(wb, filename);
    onNotify?.(`Export ${filename} téléchargé`, "success");
  };

  // --------------------------------------------------------------------------
  // CONTRÔLE D'ACCÈS
  // --------------------------------------------------------------------------
  if (!estPersonnelRTC) {
    return (
      <div className="w-full min-h-screen bg-[#0B131B] text-[#EAF2F4] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#13212D] border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
              Accès Réservé au Personnel du RTC
            </h2>
            <p className="text-xs text-[#8FA8B0] leading-relaxed">
              Le module <strong className="text-white">CRM & Suite RH RTC</strong> est réservé aux administrateurs et au personnel habilité.
            </p>
          </div>
          <button
            onClick={onExit}
            className="w-full py-2.5 px-4 bg-[#714B67] hover:bg-[#875A7B] text-white rounded-xl text-xs font-semibold transition-all shadow"
          >
            Retour au Tableau de Bord
          </button>
        </div>
      </div>
    );
  }

  // Si désactivé
  if (!syncrmActif) {
    return (
      <div className="w-full min-h-screen bg-[#0B131B] text-[#EAF2F4] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#13212D] border border-amber-500/30 rounded-2xl p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <PowerOff size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
              Module CRM & RH Désactivé
            </h2>
            <p className="text-xs text-[#8FA8B0] leading-relaxed">
              Ce module est actuellement désactivé. Vous pouvez le réactiver d'un clic.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onToggleActif}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow"
            >
              <Power size={14} /> Activer le CRM & RH
            </button>
            <button onClick={onExit} className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold">
              Quitter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDU PRINCIPAL
  // --------------------------------------------------------------------------
  return (
    <div className="w-full min-h-screen bg-[#0B131B] text-[#EAF2F4] flex flex-col font-sans">
      {/* =========================================================================
          1. HEADER PRINCIPAL
         ========================================================================= */}
      <header className="px-4 py-2 bg-[#714B67] border-b border-[#5B3A52] flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <img src={logoRTC} alt="Logo RTC" className="h-7 w-auto object-contain shrink-0 rounded" />
          <span className="text-sm font-bold text-white tracking-wide shrink-0 hidden sm:inline" style={{ fontFamily: "Rajdhani, sans-serif" }}>
            Suite RH
          </span>

          <span className="text-white/30 hidden sm:inline">|</span>

          {/* Onglets principaux */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveApp("dashboard")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeApp === "dashboard" ? "bg-white text-[#714B67] font-bold shadow" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <LayoutDashboard size={13} />
              <span>Tableau de bord</span>
            </button>

            <button
              onClick={() => setActiveApp("pipeline")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeApp === "pipeline" ? "bg-white text-[#714B67] font-bold shadow" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <TrendingUp size={13} />
              <span>Pipeline Commercial</span>
            </button>

            <button
              onClick={() => setActiveApp("comptes")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeApp === "comptes" ? "bg-white text-[#714B67] font-bold shadow" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Bus size={13} />
              <span>Agences & MINT</span>
              {kpis.agencesEnAttente > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-gray-900 font-bold font-mono">
                  {kpis.agencesEnAttente}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveApp("employes")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeApp === "employes" || activeApp === "recrutement" || activeApp === "feuillesTemps" || activeApp === "conges" || activeApp === "paie" || activeApp === "departements"
                  ? "bg-white text-[#714B67] font-bold shadow"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              <UsersRound size={13} />
              <span>RH & Personnel</span>
            </button>

            <button
              onClick={() => setActiveApp("agenda")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeApp === "agenda" ? "bg-white text-[#714B67] font-bold shadow" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Calendar size={13} />
              <span>Agenda Collaboratif</span>
            </button>

            <button
              onClick={() => setActiveApp("tickets")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeApp === "tickets" ? "bg-white text-[#714B67] font-bold shadow" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <LifeBuoy size={13} />
              <span>Support & USSD</span>
            </button>

            <button
              onClick={() => setActiveApp("factures")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeApp === "factures" ? "bg-white text-[#714B67] font-bold shadow" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Wallet size={13} />
              <span>Facturation 2 500 F</span>
            </button>
          </div>
        </div>

        {/* Actions Supabase & Sortie */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSupabaseModalOpen(true)}
            title="Connexion Base de données / Supabase"
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-all ${
              supabaseStatus.connected ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Database size={13} />
            <span className="font-mono text-[11px] hidden md:inline">{supabaseStatus.connected ? "DB OK" : "DB Local"}</span>
          </button>

          <button
            onClick={handleSyncSupabase}
            disabled={syncLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-white/10 hover:bg-white/20 text-white transition-all"
            title="Synchroniser les données"
          >
            <RefreshCw size={12} className={syncLoading ? "animate-spin text-teal-300" : ""} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={onExit}
            className="flex items-center gap-1 px-3 py-1 rounded text-xs bg-[#5B3A52] hover:bg-[#482c40] text-white font-semibold transition-all shadow"
          >
            <LogOut size={12} />
            <span>Portail</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. SOUS-HEADER DU VOLET RH
         ========================================================================= */}
      {(activeApp === "employes" || activeApp === "recrutement" || activeApp === "feuillesTemps" || activeApp === "conges" || activeApp === "paie" || activeApp === "departements") && (
        <div className="px-4 py-1.5 bg-[#2E3040] border-b border-white/10 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#8FA8B0] font-semibold text-[11px] uppercase mr-2 font-mono hidden sm:inline">Gestion RH :</span>
            <button
              onClick={() => setActiveApp("employes")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeApp === "employes" ? "bg-[#00A09D] text-white font-bold" : "text-gray-300 hover:bg-white/10"
              }`}
            >
              👥 Personnel RTC ({listeEmployesConsolidee.length})
            </button>
            <button
              onClick={() => setActiveApp("recrutement")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                activeApp === "recrutement" ? "bg-[#00A09D] text-white font-bold" : "text-gray-300 hover:bg-white/10"
              }`}
            >
              <span>🎯 Recrutement</span>
            </button>
            <button
              onClick={() => setActiveApp("feuillesTemps")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                activeApp === "feuillesTemps" ? "bg-[#00A09D] text-white font-bold" : "text-gray-300 hover:bg-white/10"
              }`}
            >
              <span>⏱️ Feuilles de Temps (Sam-Ven 40h)</span>
              {kpis.feuillesEnAttente > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-gray-900 font-bold font-mono">{kpis.feuillesEnAttente}</span>
              )}
            </button>
            <button
              onClick={() => setActiveApp("conges")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                activeApp === "conges" ? "bg-[#00A09D] text-white font-bold" : "text-gray-300 hover:bg-white/10"
              }`}
            >
              <span>🏖️ Congés & Absences</span>
              {kpis.congesEnAttente > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-gray-900 font-bold font-mono">{kpis.congesEnAttente}</span>
              )}
            </button>
            <button
              onClick={() => setActiveApp("paie")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeApp === "paie" ? "bg-[#00A09D] text-white font-bold" : "text-gray-300 hover:bg-white/10"
              }`}
            >
              💰 Paie & Fiches de Salaire
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs text-[#8FA8B0] font-mono">
            <span>Masse Salariale : <strong className="text-white">{(kpis.masseSalariale).toLocaleString("fr-FR")} FCFA</strong></span>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. BARRE DE CONTRÔLE (FIL D'ARIANE, RECHERCHE, BOUTONS D'ACTION)
         ========================================================================= */}
      <div className="px-4 py-2.5 bg-[#1E1F29] border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-3 flex-wrap">
          {activeApp === "dashboard" && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  setFormOpp({
                    titre: "",
                    compte_nom: "",
                    etape: "Nouveau",
                    montant_fcfa: 5000000,
                    date_cloture_prevue: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
                    responsable: adminNom,
                  });
                  setModalType("opportunite");
                }}
                className="px-3 py-1.5 rounded-lg bg-[#714B67] hover:bg-[#875A7B] text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow"
              >
                <Plus size={13} /> Convention
              </button>
              <button
                onClick={() => setModalType("agence")}
                className="px-3 py-1.5 rounded-lg bg-[#13212D] hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow"
              >
                <Bus size={13} className="text-teal-400" /> Agence
              </button>
              <button
                onClick={() => { setEditingItem(null); setFormEmploye({ nom: "", matricule: "", profil: "RTC", role: "Support", email: "", salaire: 500000, dateDebut: new Date().toISOString().slice(0, 10), statut: "Confirmé" }); setModalType("employe"); }}
                className="px-3 py-1.5 rounded-lg bg-[#00A09D] hover:bg-[#008784] text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow"
              >
                <UserPlus size={13} /> Personnel RH
              </button>
            </div>
          )}

          {activeApp === "pipeline" && (
            <button
              onClick={() => {
                setFormOpp({
                  titre: "",
                  compte_nom: "",
                  etape: "Nouveau",
                  montant_fcfa: 5000000,
                  date_cloture_prevue: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
                  responsable: adminNom,
                });
                setModalType("opportunite");
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#714B67] hover:bg-[#875A7B] text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow"
            >
              <Plus size={14} /> Nouvelle Convention
            </button>
          )}

          {activeApp === "comptes" && (
            <button
              onClick={() => setModalType("agence")}
              className="px-3.5 py-1.5 rounded-lg bg-[#714B67] hover:bg-[#875A7B] text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow"
            >
              <Plus size={14} /> Nouvelle Agence
            </button>
          )}

          {activeApp === "employes" && (
            <button
              onClick={() => { setEditingItem(null); setFormEmploye({ nom: "", matricule: "", profil: "RTC", role: "Support", email: "", salaire: 500000, dateDebut: new Date().toISOString().slice(0, 10), statut: "Confirmé" }); setModalType("employe"); }}
              className="px-3.5 py-1.5 rounded-lg bg-[#00A09D] hover:bg-[#008784] text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow"
            >
              <UserPlus size={14} /> Nouvel Employé (Sync RH)
            </button>
          )}

          {activeApp === "feuillesTemps" && (
            <button
              onClick={() => setModalType("feuille")}
              className="px-3.5 py-1.5 rounded-lg bg-[#00A09D] hover:bg-[#008784] text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow"
            >
              <Plus size={14} /> Saisir Feuille de Temps
            </button>
          )}

          {activeApp === "conges" && (
            <button
              onClick={() => setModalType("conge")}
              className="px-3.5 py-1.5 rounded-lg bg-[#00A09D] hover:bg-[#008784] text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow"
            >
              <Plus size={14} /> Demander un Congé
            </button>
          )}

          {activeApp === "recrutement" && (
            <button
              onClick={() => setModalType("candidat")}
              className="px-3.5 py-1.5 rounded-lg bg-[#00A09D] hover:bg-[#008784] text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow"
            >
              <Plus size={14} /> Ajouter un Candidat
            </button>
          )}

          {activeApp === "agenda" && (
            <button
              onClick={() => setModalType("evenement")}
              className="px-3.5 py-1.5 rounded-lg bg-[#00A09D] hover:bg-[#008784] text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow"
            >
              <Plus size={14} /> Planifier Événement
            </button>
          )}

          {activeApp === "paie" && (
            <button
              onClick={handleGenererBulletins}
              className="px-3.5 py-1.5 rounded-lg bg-[#714B67] hover:bg-[#875A7B] text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow"
            >
              <RefreshCw size={13} /> Calculer & Générer Bulletins du Mois
            </button>
          )}

          {activeApp === "tickets" && (
            <button
              onClick={() => {
                setFormTicket({
                  titre: "",
                  contact_nom: "",
                  contact_tel: "",
                  compte_nom: "Voyageur Régulier",
                  type: "Assistance Billetterie",
                  priorite: "Normale",
                  assigne_a: adminNom,
                });
                setModalType("ticket");
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#714B67] hover:bg-[#875A7B] text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow"
            >
              <Plus size={14} /> Nouveau Ticket
            </button>
          )}

          {/* Fil d'Ariane */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#8FA8B0]">Portail RTC</span>
            <span className="text-gray-500">/</span>
            <span className="font-bold text-white">
              {activeApp === "dashboard" && "Tableau de Bord Exécutif (Vision 360°)"}
              {activeApp === "pipeline" && "Pipeline Commercial (SYNSR)"}
              {activeApp === "comptes" && "Agences & Conformité MINT"}
              {activeApp === "employes" && "Personnel du RTC (Pilotage RH)"}
              {activeApp === "recrutement" && "Pipeline de Recrutement"}
              {activeApp === "feuillesTemps" && "Feuilles de Temps (Samedi ➔ Vendredi)"}
              {activeApp === "conges" && "Congés & Absences"}
              {activeApp === "paie" && "Bulletins de Paie avec Logo RTC"}
              {activeApp === "agenda" && "Agenda & Calendrier Collaboratif"}
              {activeApp === "tickets" && "Support & Billetterie USSD"}
              {activeApp === "factures" && "Factures & Frais d'Abonnement 2 500 F"}
            </span>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex items-center gap-2 flex-1 max-w-xl justify-end">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8FA8B0]" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#13212D] text-xs text-white pl-8 pr-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#00A09D] transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Vues Cartes | Liste */}
          <div className="flex items-center bg-[#13212D] border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded text-xs transition-all ${viewMode === "kanban" ? "bg-[#714B67] text-white" : "text-gray-400 hover:text-white"}`}
              title="Vue Cartes"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded text-xs transition-all ${viewMode === "list" ? "bg-[#714B67] text-white" : "text-gray-400 hover:text-white"}`}
              title="Vue Tableau"
            >
              <FileSpreadsheet size={14} />
            </button>
          </div>

          {/* Export Excel */}
          <button
            onClick={() => handleExportExcel(activeApp)}
            className="p-1.5 bg-[#13212D] hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all"
            title="Exporter en Excel"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          4. CONTENU PRINCIPAL
         ========================================================================= */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

        {/* ---------------------------------------------------------------------
            0. TABLEAU DE BORD EXÉCUTIF (CRM COMMERCIAL, MINT & PILOTAGE RH)
           --------------------------------------------------------------------- */}
        {activeApp === "dashboard" && (
          <div className="space-y-6">
            {/* Bannière de Bienvenue & Statut Global */}
            <div className="bg-gradient-to-r from-[#714B67]/30 via-[#13212D] to-[#00A09D]/20 border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#714B67] text-white border border-purple-400/30">
                      RÉSEAU DE TRANSPORT CAMEROUNAIS
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Système Opérationnel • SYNSR v1.0
                    </span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Tableau de Bord Exécutif & Pilotage Opérationnel
                  </h1>
                  <p className="text-xs text-[#8FA8B0] max-w-2xl mt-1">
                    Supervision consolidée des conventions de sécurité routière, conformité des agences MINT, recouvrement des abonnements et pilotage RH du RTC.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveApp("pipeline")}
                    className="px-3.5 py-2 rounded-xl bg-[#714B67] hover:bg-[#875A7B] text-xs font-bold text-white flex items-center gap-1.5 shadow transition-all hover:scale-105 active:scale-95"
                  >
                    <TrendingUp size={14} /> Pipeline ({opportunites.length})
                  </button>
                  <button
                    onClick={() => setActiveApp("comptes")}
                    className="px-3.5 py-2 rounded-xl bg-[#00A09D] hover:bg-[#008784] text-xs font-bold text-white flex items-center gap-1.5 shadow transition-all hover:scale-105 active:scale-95"
                  >
                    <Bus size={14} /> Agences ({kpis.totalAgences})
                  </button>
                  <button
                    onClick={() => setActiveApp("employes")}
                    className="px-3.5 py-2 rounded-xl bg-[#1E1F29] hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 shadow transition-all"
                  >
                    <UsersRound size={14} /> Personnel ({listeEmployesConsolidee.length})
                  </button>
                </div>
              </div>
            </div>

            {/* 6 Cartes KPIs Exécutives */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* KPI 1 : CA Gagné */}
              <div
                onClick={() => setActiveApp("pipeline")}
                className="bg-[#13212D] hover:bg-[#182a39] border border-white/10 hover:border-[#714B67] p-4 rounded-xl shadow cursor-pointer transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8FA8B0]">CA Réalisé SYNSR</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  {(kpis.totalCA).toLocaleString("fr-FR")} <span className="text-xs font-normal">F</span>
                </div>
                <div className="text-[11px] text-[#8FA8B0] mt-1 flex items-center justify-between">
                  <span>Conventions gagnées</span>
                  <ArrowUpRight size={12} className="text-emerald-400" />
                </div>
              </div>

              {/* KPI 2 : Agrément MINT */}
              <div
                onClick={() => setActiveApp("comptes")}
                className="bg-[#13212D] hover:bg-[#182a39] border border-white/10 hover:border-emerald-500/40 p-4 rounded-xl shadow cursor-pointer transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8FA8B0]">Visa MINT</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck size={16} />
                  </div>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {kpis.agencesHomologuees} <span className="text-xs text-gray-400 font-normal">/ {kpis.totalAgences}</span>
                </div>
                <div className="text-[11px] text-[#8FA8B0] mt-1 flex items-center justify-between">
                  <span className={kpis.agencesEnAttente > 0 ? "text-amber-400 font-semibold" : "text-emerald-400"}>
                    {kpis.agencesEnAttente} en attente
                  </span>
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* KPI 3 : Frais 2 500 F */}
              <div
                onClick={() => setActiveApp("factures")}
                className="bg-[#13212D] hover:bg-[#182a39] border border-white/10 hover:border-teal-500/40 p-4 rounded-xl shadow cursor-pointer transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8FA8B0]">Frais 2 500 F/an</span>
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wallet size={16} />
                  </div>
                </div>
                <div className="text-lg font-bold text-teal-300 font-mono">
                  {(kpis.agencesPayees2500 * 2500).toLocaleString("fr-FR")} <span className="text-xs font-normal">F</span>
                </div>
                <div className="text-[11px] text-[#8FA8B0] mt-1 flex items-center justify-between">
                  <span>{kpis.agencesPayees2500} / {kpis.totalAgences} acquittés</span>
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* KPI 4 : Effectif & Masse Salariale */}
              <div
                onClick={() => setActiveApp("employes")}
                className="bg-[#13212D] hover:bg-[#182a39] border border-white/10 hover:border-blue-500/40 p-4 rounded-xl shadow cursor-pointer transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8FA8B0]">Effectif & RH</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UsersRound size={16} />
                  </div>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {listeEmployesConsolidee.length} <span className="text-xs text-gray-400 font-normal">Salariés</span>
                </div>
                <div className="text-[11px] text-[#8FA8B0] mt-1 flex items-center justify-between">
                  <span className="truncate">{(kpis.masseSalariale).toLocaleString("fr-FR")} F/m</span>
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* KPI 5 : Tickets USSD & Support */}
              <div
                onClick={() => setActiveApp("tickets")}
                className="bg-[#13212D] hover:bg-[#182a39] border border-white/10 hover:border-amber-500/40 p-4 rounded-xl shadow cursor-pointer transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8FA8B0]">Helpdesk *1234#</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <LifeBuoy size={16} />
                  </div>
                </div>
                <div className="text-lg font-bold text-amber-300 font-mono">
                  {kpis.ticketsOuverts} <span className="text-xs text-gray-400 font-normal">/ {tickets.length}</span>
                </div>
                <div className="text-[11px] text-[#8FA8B0] mt-1 flex items-center justify-between">
                  <span>Tickets à traiter</span>
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* KPI 6 : Feuilles de Temps & Congés */}
              <div
                onClick={() => setActiveApp("feuillesTemps")}
                className="bg-[#13212D] hover:bg-[#182a39] border border-white/10 hover:border-purple-500/40 p-4 rounded-xl shadow cursor-pointer transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8FA8B0]">Temps & Congés</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock size={16} />
                  </div>
                </div>
                <div className="text-lg font-bold text-purple-300 font-mono">
                  {kpis.feuillesEnAttente + kpis.congesEnAttente} <span className="text-xs text-gray-400 font-normal">Demandes</span>
                </div>
                <div className="text-[11px] text-[#8FA8B0] mt-1 flex items-center justify-between">
                  <span>En attente de visa</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>

            {/* Section Graphiques Analytiques (Grille 2x2) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Graphique 1 : Pipeline Commercial */}
              <div className="bg-[#13212D] border border-white/10 rounded-2xl p-5 shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                      Pipeline Commercial — Répartition Financière par Étape
                    </h3>
                    <p className="text-[11px] text-[#8FA8B0]">
                      Montant cumulé des conventions SYNSR (en FCFA)
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveApp("pipeline")}
                    className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                  >
                    <span>Détails</span> <ArrowRight size={12} />
                  </button>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pipelineChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="etape" tick={{ fill: "#8FA8B0", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#8FA8B0", fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                      <Tooltip
                        formatter={(val) => [`${Number(val).toLocaleString("fr-FR")} FCFA`, "Montant"]}
                        contentStyle={{ backgroundColor: "#1E1F29", borderColor: "#ffffff20", borderRadius: 8, fontSize: 12 }}
                      />
                      <Bar dataKey="montant" radius={[6, 6, 0, 0]}>
                        {pipelineChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || "#714B67"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graphique 2 : Conformité MINT & Cotisations 2 500 F */}
              <div className="bg-[#13212D] border border-white/10 rounded-2xl p-5 shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                      Agrément MINT & Régularisation Frais 2 500 FCFA
                    </h3>
                    <p className="text-[11px] text-[#8FA8B0]">
                      Statut des agences de transport routier
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveApp("comptes")}
                    className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                  >
                    <span>Agences</span> <ArrowRight size={12} />
                  </button>
                </div>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={agencesConformiteData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {agencesConformiteData.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val, name) => [`${val} Agence(s)`, name]}
                        contentStyle={{ backgroundColor: "#1E1F29", borderColor: "#ffffff20", borderRadius: 8, fontSize: 12 }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-xs text-gray-300 font-medium">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graphique 3 : Masse Salariale par Rôle */}
              <div className="bg-[#13212D] border border-white/10 rounded-2xl p-5 shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                      Ventilation RH — Masse Salariale par Fonction
                    </h3>
                    <p className="text-[11px] text-[#8FA8B0]">
                      Répartition mensuelle des salaires bruts (FCFA)
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveApp("paie")}
                    className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                  >
                    <span>Bulletins</span> <ArrowRight size={12} />
                  </button>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={masseSalarialeParRoleData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                      <XAxis type="number" tick={{ fill: "#8FA8B0", fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="role" tick={{ fill: "#8FA8B0", fontSize: 11 }} />
                      <Tooltip
                        formatter={(val) => [`${Number(val).toLocaleString("fr-FR")} FCFA`, "Masse Salariale"]}
                        contentStyle={{ backgroundColor: "#1E1F29", borderColor: "#ffffff20", borderRadius: 8, fontSize: 12 }}
                      />
                      <Bar dataKey="totalSalaire" fill="#00A09D" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graphique 4 : Heures de Travail Hebdomadaires */}
              <div className="bg-[#13212D] border border-white/10 rounded-2xl p-5 shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                      Cycle Opérationnel — Heures Hebdo (Samedi ➔ Vendredi)
                    </h3>
                    <p className="text-[11px] text-[#8FA8B0]">
                      Respect de la durée légale de 40h / semaine
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveApp("feuillesTemps")}
                    className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                  >
                    <span>Feuilles de temps</span> <ArrowRight size={12} />
                  </button>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={heuresHebdoData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="gradNormales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#714B67" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#714B67" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradSup" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F0AD4E" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#F0AD4E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="jour" tick={{ fill: "#8FA8B0", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#8FA8B0", fontSize: 10 }} />
                      <Tooltip
                        formatter={(val, name) => [`${val} h`, name === "normales" ? "Heures Normales" : "Heures Supp"]}
                        contentStyle={{ backgroundColor: "#1E1F29", borderColor: "#ffffff20", borderRadius: 8, fontSize: 12 }}
                      />
                      <Area type="monotone" dataKey="normales" stroke="#714B67" fillOpacity={1} fill="url(#gradNormales)" name="normales" />
                      <Area type="monotone" dataKey="sup" stroke="#F0AD4E" fillOpacity={1} fill="url(#gradSup)" name="sup" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Section Actions d'Urgence & Dernières Activités (Grille 3 colonnes) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Colonne 1 : Conventions Récentes */}
              <div className="bg-[#13212D] border border-white/10 rounded-2xl p-5 shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp size={15} className="text-[#00A09D]" />
                      <span>Conventions en Cours</span>
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 font-bold text-gray-300 font-mono">
                      {opportunites.length}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {opportunites.slice(0, 4).map((opp) => (
                      <div key={opp.id} className="p-2.5 bg-[#1A2C3C] rounded-lg border border-white/5 flex items-center justify-between gap-2 hover:bg-white/5 transition-colors">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{opp.titre}</div>
                          <div className="text-[10px] text-[#8FA8B0] truncate">{opp.compte_nom} • {(opp.montant_fcfa || 0).toLocaleString("fr-FR")} F</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold shrink-0 bg-[#714B67] text-white">
                          {opp.etape}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setActiveApp("pipeline")}
                  className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Consulter le Pipeline</span> <ArrowRight size={13} />
                </button>
              </div>

              {/* Colonne 2 : Agences à Régulariser */}
              <div className="bg-[#13212D] border border-white/10 rounded-2xl p-5 shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Bus size={15} className="text-emerald-400" />
                      <span>Agences & Conformité</span>
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 font-bold font-mono">
                      {kpis.agencesEnAttente} en attente
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {listeAgencesConsolidee.slice(0, 4).map((ag) => (
                      <div key={ag.id} className="p-2.5 bg-[#1A2C3C] rounded-lg border border-white/5 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{ag.nom} ({ag.ville})</div>
                          <div className="text-[10px] text-[#8FA8B0]">
                            {ag.statut === "Validée" ? "✅ MINT OK" : "⏳ Visa requis"} • {ag.recuAbonnement ? "💳 2 500 F Payé" : "❌ 2 500 F Impayé"}
                          </div>
                        </div>
                        {ag.statut !== "Validée" ? (
                          <button
                            onClick={() => handleValiderMINT(ag.id)}
                            className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded text-[10px] font-bold shrink-0"
                          >
                            Valider
                          </button>
                        ) : !ag.recuAbonnement ? (
                          <button
                            onClick={() => handlePayerAbonnement2500(ag.id)}
                            className="px-2 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded text-[10px] font-bold shrink-0"
                          >
                            Payer 2.5k
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-bold shrink-0">À jour</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setActiveApp("comptes")}
                  className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Gérer les Agences MINT</span> <ArrowRight size={13} />
                </button>
              </div>

              {/* Colonne 3 : Support USSD & Actions RH */}
              <div className="bg-[#13212D] border border-white/10 rounded-2xl p-5 shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <LifeBuoy size={15} className="text-amber-400" />
                      <span>Support USSD & Alertes RH</span>
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-400/20 text-blue-300 font-bold font-mono">
                      {tickets.length} tickets
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {tickets.slice(0, 4).map((tck) => (
                      <div key={tck.id} className="p-2.5 bg-[#1A2C3C] rounded-lg border border-white/5 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{tck.titre}</div>
                          <div className="text-[10px] text-[#8FA8B0] truncate">{tck.contact_nom} • {tck.type}</div>
                        </div>
                        {tck.statut !== "Résolu" ? (
                          <button
                            onClick={() => handleUpdateTicketStatut(tck.id, "Résolu")}
                            className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-[10px] font-bold shrink-0"
                          >
                            Résoudre
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-500 font-bold shrink-0">Résolu</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setActiveApp("tickets")}
                  className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Accéder au Helpdesk USSD</span> <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            A. AGENCES DE VOYAGE : HOMOLOGATION MINT & ABONNEMENT 2 500 FCFA
           --------------------------------------------------------------------- */}
        {activeApp === "comptes" && (
          <div className="space-y-4">
            {/* Bannière de propagation et statistiques */}
            <div className="bg-[#13212D] border border-white/10 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#714B67] text-white">
                    SYNSR-CAM & MINT
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-bold">
                    Agrément Homologué : {kpis.agencesHomologuees} / {kpis.totalAgences} agences
                  </span>
                </div>
                <h2 className="text-base font-bold text-white tracking-wide mt-1" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  Annuaire des Agences & Régularisation des Frais d'Abonnement (2 500 FCFA/an)
                </h2>
                <p className="text-xs text-[#8FA8B0] mt-0.5">
                  Visualisation en temps réel des agréments validés par le MINT et des reçus d'abonnement acquittés.
                </p>
              </div>

              {/* Filtres d'état rapides */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setAgenceFilterType("ALL")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    agenceFilterType === "ALL" ? "bg-white text-gray-900 font-bold shadow" : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  Toutes ({kpis.totalAgences})
                </button>
                <button
                  onClick={() => setAgenceFilterType("HOMOLOGUEE")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    agenceFilterType === "HOMOLOGUEE" ? "bg-emerald-600 text-white font-bold shadow" : "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                  }`}
                >
                  <ShieldCheck size={12} /> Validées MINT ({kpis.agencesHomologuees})
                </button>
                <button
                  onClick={() => setAgenceFilterType("PAYEE_2500")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    agenceFilterType === "PAYEE_2500" ? "bg-teal-600 text-white font-bold shadow" : "bg-teal-500/10 text-teal-300 hover:bg-teal-500/20"
                  }`}
                >
                  <CreditCard size={12} /> Abonnement 2 500 F Payé ({kpis.agencesPayees2500})
                </button>
                <button
                  onClick={() => setAgenceFilterType("EN_ATTENTE")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    agenceFilterType === "EN_ATTENTE" ? "bg-amber-600 text-white font-bold shadow" : "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                  }`}
                >
                  <AlertCircle size={12} /> En Attente ({kpis.agencesEnAttente})
                </button>
              </div>
            </div>

            {/* Tableau ou Cartes des Agences */}
            {viewMode === "list" ? (
              <div className="bg-[#13212D] border border-white/10 rounded-xl overflow-hidden shadow">
                <table className="w-full text-xs text-left text-[#EAF2F4]">
                  <thead className="bg-[#1E1F29] text-[11px] uppercase tracking-wider text-[#8FA8B0] font-mono border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Code & Nom Agence</th>
                      <th className="py-3 px-4">Ville / Siège</th>
                      <th className="py-3 px-4">Chef d'Agence</th>
                      <th className="py-3 px-4 text-center">Agrément MINT</th>
                      <th className="py-3 px-4 text-center">Abonnement (2 500 F/an)</th>
                      <th className="py-3 px-4 text-center">Actions Immédiates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredAgences.map((ag) => (
                      <tr key={ag.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white flex items-center gap-2">
                            <Bus size={14} className="text-[#00A09D]" />
                            <span>{ag.nom}</span>
                          </div>
                          <div className="text-[10px] text-[#8FA8B0] font-mono ml-5.5">{ag.id}</div>
                        </td>

                        <td className="py-3 px-4 text-[#8FA8B0] font-medium">{ag.ville}</td>
                        <td className="py-3 px-4 text-white">{ag.chefAgence || "—"}</td>

                        {/* Colonne Agrément MINT */}
                        <td className="py-3 px-4 text-center">
                          {ag.statut === "Validée" ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <ShieldCheck size={11} /> Homologuée MINT
                              </span>
                              {ag.dateApprobation && (
                                <span className="text-[9px] text-[#8FA8B0] font-mono mt-0.5">le {ag.dateApprobation}</span>
                              )}
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <AlertCircle size={11} /> En attente validation
                              </span>
                              <span className="text-[9px] text-gray-400 mt-0.5">Pièces non conformes</span>
                            </div>
                          )}
                        </td>

                        {/* Colonne Frais Abonnement 2500 F */}
                        <td className="py-3 px-4 text-center">
                          {ag.recuAbonnement ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                                <CheckCircle2 size={11} /> 2 500 F Payé (À jour)
                              </span>
                              <span className="text-[9px] text-[#8FA8B0] font-mono mt-0.5">{ag.recuAbonnement}</span>
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                                <X size={11} /> 2 500 F Impayé
                              </span>
                              <span className="text-[9px] text-red-400 mt-0.5">Cotisation exigible</span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {ag.statut !== "Validée" && (
                              <button
                                onClick={() => handleValiderMINT(ag.id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold flex items-center gap-1 shadow"
                                title="Valider l'agrément MINT"
                              >
                                <ShieldCheck size={11} /> Valider MINT
                              </button>
                            )}

                            {!ag.recuAbonnement && (
                              <button
                                onClick={() => handlePayerAbonnement2500(ag.id)}
                                className="px-2 py-1 bg-[#00A09D] hover:bg-[#008784] text-white rounded text-[10px] font-semibold flex items-center gap-1 shadow"
                                title="Enregistrer le paiement des 2 500 FCFA"
                              >
                                <CreditCard size={11} /> Payer 2 500 F
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteAgence(ag.id)}
                              className="p-1 hover:text-red-400 text-gray-500 transition-colors"
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAgences.map((ag) => (
                  <div key={ag.id} className="bg-[#13212D] border border-white/10 rounded-xl p-4 space-y-3 hover:border-[#00A09D]/50 transition-all shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#714B67] flex items-center justify-center text-white font-bold">
                          <Bus size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{ag.nom}</div>
                          <div className="text-[10px] text-[#8FA8B0] font-mono">{ag.id} • {ag.ville}</div>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400">{ag.chefAgence || "—"}</span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#8FA8B0]">MINT :</span>
                        {ag.statut === "Validée" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                            <ShieldCheck size={11} /> Homologuée
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 flex items-center gap-1">
                            <AlertCircle size={11} /> En attente
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8FA8B0]">Frais 2 500 F :</span>
                        {ag.recuAbonnement ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 flex items-center gap-1">
                            <CheckCircle2 size={11} /> Payé
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-300 flex items-center gap-1">
                            <X size={11} /> Impayé
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1">
                        {ag.statut !== "Validée" && (
                          <button
                            onClick={() => handleValiderMINT(ag.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold flex items-center gap-0.5"
                          >
                            <ShieldCheck size={11} /> Valider
                          </button>
                        )}
                        {!ag.recuAbonnement && (
                          <button
                            onClick={() => handlePayerAbonnement2500(ag.id)}
                            className="px-2 py-1 bg-[#00A09D] hover:bg-[#008784] text-white rounded text-[10px] font-semibold flex items-center gap-0.5"
                          >
                            <CreditCard size={11} /> 2 500 F
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAgence(ag.id)}
                        className="p-1 hover:text-red-400 text-gray-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------------
            B. PIPELINE COMMERCIAL (SYNSR)
           --------------------------------------------------------------------- */}
        {activeApp === "pipeline" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  Pipeline Commercial — Conventions de Sécurité Routière & Équipements
                </h2>
                <p className="text-xs text-[#8FA8B0]">
                  Contrats d'équipements de flottes (GPS, billetterie QR Code, télémétrie).
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/30 font-mono">
                  {(kpis.totalCA).toLocaleString("fr-FR")} FCFA Gagnés
                </span>
              </div>
            </div>

            {viewMode === "list" ? (
              <div className="bg-[#13212D] border border-white/10 rounded-xl overflow-hidden shadow">
                <table className="w-full text-xs text-left text-[#EAF2F4]">
                  <thead className="bg-[#1E1F29] text-[11px] uppercase tracking-wider text-[#8FA8B0] font-mono border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Convention / Contrat</th>
                      <th className="py-3 px-4">Agence Partenaire</th>
                      <th className="py-3 px-4">Étape Pipeline</th>
                      <th className="py-3 px-4 text-right">Montant (FCFA)</th>
                      <th className="py-3 px-4 text-center">Probabilité</th>
                      <th className="py-3 px-4">Clôture Prévue</th>
                      <th className="py-3 px-4">Responsable</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {opportunites.map((opp) => {
                      const etapeObj = ETAPES_PIPELINE.find((ep) => ep.id === opp.etape) || { label: opp.etape, color: "#8FA8B0" };
                      return (
                        <tr key={opp.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#714B67] text-white font-mono">
                                SYNSR
                              </span>
                              <span>{opp.titre}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-teal-300 font-semibold">{opp.compte_nom}</td>
                          <td className="py-3 px-4">
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ backgroundColor: `${etapeObj.color}25`, color: etapeObj.color, border: `1px solid ${etapeObj.color}50` }}
                            >
                              {etapeObj.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                            {(opp.montant_fcfa || 0).toLocaleString("fr-FR")}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-xs">{opp.probabilite || 0}%</td>
                          <td className="py-3 px-4 font-mono text-[#8FA8B0]">{opp.date_cloture_prevue}</td>
                          <td className="py-3 px-4 text-gray-300">{opp.responsable}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {opp.etape !== "Gagné" && (
                                <button
                                  type="button"
                                  onClick={() => handleAvancerEtapeOpp(opp.id)}
                                  className="px-2.5 py-1 bg-[#00A09D]/20 hover:bg-[#008784]/40 text-teal-200 rounded text-[10px] font-semibold flex items-center gap-1 shadow"
                                  title="Avancer étape"
                                >
                                  <span>Suivant</span>
                                  <ChevronRight size={11} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteOpp(opp.id)}
                                className="p-1 hover:text-red-400 text-gray-500 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
                {ETAPES_PIPELINE.filter((et) => et.id !== "Perdu").map((etape) => {
                  const oppsInStage = opportunites.filter((o) => o.etape === etape.id);
                  const totalStage = oppsInStage.reduce((s, o) => s + (o.montant_fcfa || 0), 0);

                  return (
                    <div key={etape.id} className="bg-[#13212D] border border-white/10 rounded-xl flex flex-col min-w-[240px] shadow">
                      <div className="p-3 border-b border-white/10 flex items-center justify-between" style={{ borderTop: `3px solid ${etape.color}` }}>
                        <div>
                          <div className="text-xs font-bold text-white">{etape.label}</div>
                          <div className="text-[10px] text-[#8FA8B0] font-mono">{totalStage.toLocaleString("fr-FR")} FCFA</div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 font-bold text-gray-300 font-mono">
                          {oppsInStage.length}
                        </span>
                      </div>

                      <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[600px]">
                        {oppsInStage.map((opp) => (
                          <div
                            key={opp.id}
                            className="p-3 bg-[#1A2C3C] hover:bg-[#20364A] border border-white/10 rounded-lg space-y-2 transition-all cursor-pointer shadow-sm group"
                            onClick={() => { setSelectedItem(opp); setModalType("opportunite"); }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#714B67] text-white font-mono">
                                SYNSR
                              </span>
                              <span className="text-[11px] font-bold text-emerald-400 font-mono">
                                {(opp.montant_fcfa || 0).toLocaleString("fr-FR")} F
                              </span>
                            </div>

                            <div className="text-xs font-semibold text-white group-hover:text-teal-300 line-clamp-2">
                              {opp.titre}
                            </div>

                            <div className="text-[11px] text-[#8FA8B0] truncate flex items-center gap-1">
                              <Bus size={11} className="shrink-0 text-teal-400" />
                              <span>{opp.compte_nom}</span>
                            </div>

                            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8FA8B0]">
                              <span>Clôture : {opp.date_cloture_prevue}</span>
                              <div className="flex items-center gap-1.5">
                                {etape.id !== "Gagné" && (
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleAvancerEtapeOpp(opp.id); }}
                                    className="text-[#00A09D] hover:text-teal-200 flex items-center gap-0.5 font-semibold"
                                    title="Avancer étape"
                                  >
                                    <span>Suivant</span>
                                    <ChevronRight size={12} />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteOpp(opp.id); }}
                                  className="text-gray-500 hover:text-red-400 p-0.5"
                                  title="Supprimer"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {oppsInStage.length === 0 && (
                          <div className="py-8 text-center text-gray-500 text-xs border border-dashed border-white/10 rounded-lg">
                            Aucune opportunité
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------------
            C. PERSONNEL DU RTC (SYNCHRONISÉ AVEC PILOTAGE RH)
           --------------------------------------------------------------------- */}
        {activeApp === "employes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 bg-[#13212D] border border-white/10 p-4 rounded-xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#00A09D] text-white">
                    SYNCHRONISÉ AVEC PILOTAGE RH
                  </span>
                  <span className="text-xs text-[#8FA8B0] font-mono">
                    Total Collaborateurs : <strong className="text-white">{listeEmployesConsolidee.length}</strong>
                  </span>
                </div>
                <h2 className="text-base font-bold text-white tracking-wide mt-1" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  Répertoire & Fiches Collaborateurs du Réseau de Transport Camerounais
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEditingItem(null); setFormEmploye({ nom: "", matricule: "", profil: "RTC", role: "Support", email: "", salaire: 500000, dateDebut: new Date().toISOString().slice(0, 10), statut: "Confirmé" }); setModalType("employe"); }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#00A09D] hover:bg-[#008784] text-xs font-semibold text-white flex items-center gap-1.5 shadow"
                >
                  <UserPlus size={14} /> Ajouter un Employé
                </button>
              </div>
            </div>

            {viewMode === "list" ? (
              <div className="bg-[#13212D] border border-white/10 rounded-xl overflow-hidden shadow">
                <table className="w-full text-xs text-left text-[#EAF2F4]">
                  <thead className="bg-[#1E1F29] text-[11px] uppercase tracking-wider text-[#8FA8B0] font-mono border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Matricule</th>
                      <th className="py-3 px-4">Nom & Prénom</th>
                      <th className="py-3 px-4">Rôle / Poste</th>
                      <th className="py-3 px-4">Email Professionnel</th>
                      <th className="py-3 px-4 text-right">Salaire Base (FCFA)</th>
                      <th className="py-3 px-4 text-center">Statut</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredEmployes.map((emp) => (
                      <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-mono text-[#00A09D] font-bold">{emp.matricule}</td>
                        <td className="py-3 px-4 font-bold text-white">{emp.nom}</td>
                        <td className="py-3 px-4 text-teal-200">{emp.role || emp.profil}</td>
                        <td className="py-3 px-4 font-mono text-[#8FA8B0]">{emp.email}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          {(emp.salaire || 0).toLocaleString("fr-FR")}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                            {emp.statut}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => { setEditingItem(emp); setFormEmploye({ nom: emp.nom, matricule: emp.matricule, profil: emp.profil || "RTC", role: emp.role || "Support", email: emp.email, salaire: emp.salaire || 500000, dateDebut: emp.dateDebut || "", statut: emp.statut || "Confirmé" }); setModalType("employe"); }}
                              className="p-1 hover:text-teal-300 text-[#8FA8B0]"
                              title="Modifier"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteEmploye(emp.id)}
                              className="p-1 hover:text-red-400 text-gray-500"
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmployes.map((emp) => (
                  <div key={emp.id} className="bg-[#13212D] border border-white/10 rounded-xl p-4 space-y-3 hover:border-[#00A09D]/50 transition-all shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#00A09D]/20 border border-[#00A09D]/40 flex items-center justify-center text-teal-300 font-bold text-sm">
                          {emp.nom?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{emp.nom}</div>
                          <div className="text-[11px] text-[#00A09D] font-mono">{emp.matricule}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                        {emp.statut}
                      </span>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-white/10 text-xs text-[#8FA8B0]">
                      <div>Poste : <strong className="text-white">{emp.role || emp.profil}</strong></div>
                      <div className="truncate">Email : <span className="font-mono text-gray-300">{emp.email}</span></div>
                      <div>Salaire : <strong className="font-mono text-emerald-400 font-bold">{(emp.salaire || 0).toLocaleString("fr-FR")} FCFA</strong></div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditingItem(emp); setFormEmploye({ nom: emp.nom, matricule: emp.matricule, profil: emp.profil || "RTC", role: emp.role || "Support", email: emp.email, salaire: emp.salaire || 500000, dateDebut: emp.dateDebut || "", statut: emp.statut || "Confirmé" }); setModalType("employe"); }}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-teal-200 rounded text-xs flex items-center gap-1"
                      >
                        <Pencil size={12} /> Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteEmploye(emp.id)}
                        className="p-1 hover:text-red-400 text-gray-500"
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------------
            D. FEUILLES DE TEMPS (SAMEDI ➔ VENDREDI, 40H/SEMAINE, 8H/JOUR)
           --------------------------------------------------------------------- */}
        {activeApp === "feuillesTemps" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 bg-[#13212D] border border-white/10 p-4 rounded-xl">
              <div>
                <span className="text-xs text-amber-300 font-mono">
                  Cycle Hebdomadaire : <strong>Samedi ➔ Vendredi</strong> (40h/semaine • 8h/jour)
                </span>
                <h2 className="text-base font-bold text-white tracking-wide mt-1" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  Feuilles de Temps & Heures Opérationnelles
                </h2>
              </div>
              <button
                onClick={() => setModalType("feuille")}
                className="px-3.5 py-1.5 rounded-lg bg-[#00A09D] hover:bg-[#008784] text-xs font-semibold text-white flex items-center gap-1.5 shadow"
              >
                <Plus size={14} /> Saisir ma feuille de temps
              </button>
            </div>

            <div className="space-y-3">
              {feuillesTemps.map((ft) => (
                <div key={ft.id} className="bg-[#13212D] border border-white/10 rounded-xl p-4 space-y-3 shadow">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="text-sm font-bold text-white">{ft.nom} <span className="text-xs text-[#00A09D] font-mono">({ft.matricule})</span></div>
                      <div className="text-xs text-[#8FA8B0]">{ft.semaine_label} — {ft.projet}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-teal-300">{ft.total_heures}h / 40h</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        ft.statut === "Approuvé" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {ft.statut}
                      </span>

                      {ft.statut === "Soumis" && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleValiderFeuille(ft.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Check size={12} /> Approuver
                          </button>
                          <button
                            onClick={() => handleRejeterFeuille(ft.id)}
                            className="px-2 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-200 rounded text-[11px]"
                          >
                            Rejeter
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-mono pt-2 border-t border-white/10">
                    <div className="bg-[#714B67]/20 p-2 rounded"><span className="text-[10px] text-purple-300 block">Sam (8h)</span><strong className="text-white">{ft.samedi}h</strong></div>
                    <div className="bg-white/5 p-2 rounded"><span className="text-[10px] text-gray-400 block">Dim</span><span className="text-gray-400">{ft.dimanche}h</span></div>
                    <div className="bg-white/5 p-2 rounded"><span className="text-[10px] text-white block">Lun (8h)</span><strong className="text-white">{ft.lundi}h</strong></div>
                    <div className="bg-white/5 p-2 rounded"><span className="text-[10px] text-white block">Mar (8h)</span><strong className="text-white">{ft.mardi}h</strong></div>
                    <div className="bg-white/5 p-2 rounded"><span className="text-[10px] text-white block">Mer (8h)</span><strong className="text-white">{ft.mercredi}h</strong></div>
                    <div className="bg-white/5 p-2 rounded"><span className="text-[10px] text-white block">Jeu (8h)</span><strong className="text-white">{ft.jeudi}h</strong></div>
                    <div className="bg-white/5 p-2 rounded"><span className="text-[10px] text-gray-400 block">Ven</span><span className="text-gray-400">{ft.vendredi}h</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            E. CONGÉS & ABSENCES
           --------------------------------------------------------------------- */}
        {activeApp === "conges" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  Congés & Absences du Personnel RTC
                </h2>
                <p className="text-xs text-[#8FA8B0]">
                  Vacances, congés maladie (avec justificatif médical) et suivi des soldes.
                </p>
              </div>
              <button
                onClick={() => setModalType("conge")}
                className="px-3.5 py-1.5 rounded-lg bg-[#00A09D] hover:bg-[#008784] text-xs font-semibold text-white flex items-center gap-1.5 shadow"
              >
                <Plus size={14} /> Demander un Congé
              </button>
            </div>

            <div className="bg-[#13212D] border border-white/10 rounded-xl overflow-hidden shadow">
              <table className="w-full text-xs text-left text-[#EAF2F4]">
                <thead className="bg-[#1E1F29] text-[11px] uppercase tracking-wider text-[#8FA8B0] font-mono border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Employé</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4 text-center">Jours</th>
                    <th className="py-3 px-4">Motif</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {conges.map((cg) => (
                    <tr key={cg.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{cg.nom_employe} ({cg.matricule})</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] bg-white/10 font-semibold">{cg.type}</span></td>
                      <td className="py-3 px-4 font-mono text-[#8FA8B0]">{cg.date_debut} ➔ {cg.date_fin}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold">{cg.jours_ouvres} j</td>
                      <td className="py-3 px-4 text-xs">{cg.motif}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">{cg.statut}</span></td>
                      <td className="py-3 px-4 text-center">
                        {cg.statut === "En attente d'approbation" && (
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleValiderConge(cg.id)} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px]">Approuver</button>
                            <button onClick={() => handleRejeterConge(cg.id)} className="px-2 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-200 rounded text-[11px]">Rejeter</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            F. PAIE & BULLETINS DE SALAIRE AVEC LOGO RTC
           --------------------------------------------------------------------- */}
        {activeApp === "paie" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  Gestion de la Paie & Bulletins Officiels RTC
                </h2>
                <p className="text-xs text-[#8FA8B0]">
                  Génération des fiches de paie avec Logo Officiel RTC, cotisations CNPS (4.2%) et IRPP/TCS.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenererBulletins}
                  className="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#875A7B] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <RefreshCw size={13} /> Recalculer la Paie
                </button>
                <button
                  onClick={() => handleExportExcel("paie")}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-white/10"
                >
                  <Download size={13} /> Journal de Paie
                </button>
              </div>
            </div>

            <div className="bg-[#13212D] border border-white/10 rounded-xl overflow-hidden shadow">
              <table className="w-full text-xs text-left text-[#EAF2F4]">
                <thead className="bg-[#1E1F29] text-[11px] uppercase tracking-wider text-[#8FA8B0] font-mono border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Bulletin N°</th>
                    <th className="py-3 px-4">Employé</th>
                    <th className="py-3 px-4">Période</th>
                    <th className="py-3 px-4 text-right">Salaire Brut</th>
                    <th className="py-3 px-4 text-right">Retenues (CNPS/IRPP)</th>
                    <th className="py-3 px-4 text-right">Net à Payer (FCFA)</th>
                    <th className="py-3 px-4 text-center">Fiche Officielle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bulletinsPaie.map((bp) => (
                    <tr key={bp.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-[#00A09D] font-bold">{bp.numero}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{bp.nom}</div>
                        <div className="text-[10px] text-[#8FA8B0]">{bp.poste}</div>
                      </td>
                      <td className="py-3 px-4 text-[#8FA8B0]">{bp.periode}</td>
                      <td className="py-3 px-4 text-right font-mono">{bp.salaire_brut.toLocaleString("fr-FR")}</td>
                      <td className="py-3 px-4 text-right font-mono text-red-400">-{bp.total_retenues.toLocaleString("fr-FR")}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                        {bp.salaire_net.toLocaleString("fr-FR")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => { setSelectedItem(bp); setModalType("bulletinView"); }}
                          className="px-2.5 py-1 bg-[#714B67] hover:bg-[#875A7B] text-white rounded text-xs font-semibold flex items-center gap-1 mx-auto shadow"
                        >
                          <Eye size={12} /> Voir Fiche de Paie
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            G. RECRUTEMENT
           --------------------------------------------------------------------- */}
        {activeApp === "recrutement" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  Pipeline de Recrutement RTC
                </h2>
                <p className="text-xs text-[#8FA8B0]">
                  Gérer les candidatures et transformer en 1 clic un candidat retenu en Employé RTC.
                </p>
              </div>
              <button
                onClick={() => setModalType("candidat")}
                className="px-3.5 py-1.5 rounded-lg bg-[#00A09D] hover:bg-[#008784] text-xs font-semibold text-white flex items-center gap-1.5 shadow"
              >
                <Plus size={14} /> Ajouter un Candidat
              </button>
            </div>

            {viewMode === "list" ? (
              <div className="bg-[#13212D] border border-white/10 rounded-xl overflow-hidden shadow">
                <table className="w-full text-xs text-left text-[#EAF2F4]">
                  <thead className="bg-[#1E1F29] text-[11px] uppercase tracking-wider text-[#8FA8B0] font-mono border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Candidat</th>
                      <th className="py-3 px-4">Poste Souhaité</th>
                      <th className="py-3 px-4">Étape</th>
                      <th className="py-3 px-4 text-center">Évaluation</th>
                      <th className="py-3 px-4">Disponibilité</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {candidatures.map((cand) => {
                      const etapeObj = ETAPES_RECRUTEMENT.find((e) => e.id === cand.etape) || { label: cand.etape, color: "#8FA8B0" };
                      return (
                        <tr key={cand.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-bold text-white">{cand.nom_candidat}</td>
                          <td className="py-3 px-4 text-teal-300 font-semibold">{cand.poste_titre}</td>
                          <td className="py-3 px-4">
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ backgroundColor: `${etapeObj.color}25`, color: etapeObj.color, border: `1px solid ${etapeObj.color}50` }}
                            >
                              {etapeObj.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center text-amber-400 text-[10px]">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={10} className={i < cand.evaluation ? "fill-amber-400" : "opacity-30"} />
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[#8FA8B0]">{cand.disponibilite}</td>
                          <td className="py-3 px-4 text-gray-300">{cand.telephone}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {cand.etape === "Proposition" ? (
                                <button
                                  onClick={() => handleEmbaucherCandidat(cand)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold shadow flex items-center gap-1"
                                  title="Embaucher et créer la fiche employé"
                                >
                                  <UserCheck size={11} /> Embaucher
                                </button>
                              ) : cand.etape !== "Recruté" ? (
                                <button
                                  onClick={() => {
                                    const currIdx = ETAPES_RECRUTEMENT.findIndex((e) => e.id === cand.etape);
                                    if (currIdx >= 0 && currIdx < ETAPES_RECRUTEMENT.length - 1) {
                                      setCandidatures((prev) => prev.map((c) => (c.id === cand.id ? { ...c, etape: ETAPES_RECRUTEMENT[currIdx + 1].id } : c)));
                                    }
                                  }}
                                  className="px-2 py-0.5 bg-[#00A09D]/20 hover:bg-[#008784]/40 text-teal-200 rounded text-[10px] font-semibold flex items-center gap-0.5"
                                >
                                  <span>Avancer</span>
                                  <ChevronRight size={11} />
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
                {ETAPES_RECRUTEMENT.map((et) => {
                  const candsInStage = candidatures.filter((c) => c.etape === et.id);
                  return (
                    <div key={et.id} className="bg-[#13212D] border border-white/10 rounded-xl flex flex-col min-w-[200px] shadow">
                      <div className="p-2.5 border-b border-white/10 flex items-center justify-between" style={{ borderTop: `3px solid ${et.color}` }}>
                        <span className="text-xs font-bold text-white truncate">{et.label}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/10 font-mono font-bold">{candsInStage.length}</span>
                      </div>

                      <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[580px]">
                        {candsInStage.map((cand) => (
                          <div
                            key={cand.id}
                            className="p-3 bg-[#1A2C3C] hover:bg-[#20364A] border border-white/10 rounded-lg space-y-2 transition-all shadow-sm group"
                          >
                            <div className="text-xs font-bold text-white group-hover:text-teal-300">{cand.nom_candidat}</div>
                            <div className="text-[10px] text-[#00A09D] font-medium">{cand.poste_titre}</div>

                            <div className="flex items-center text-amber-400 text-[10px]">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={10} className={i < cand.evaluation ? "fill-amber-400" : "opacity-30"} />
                              ))}
                            </div>

                            <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px]">
                              <span className="text-[#8FA8B0]">{cand.disponibilite}</span>
                              {et.id === "Proposition" ? (
                                <button
                                  onClick={() => handleEmbaucherCandidat(cand)}
                                  className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold shadow flex items-center gap-0.5"
                                  title="Embaucher et créer la fiche employé"
                                >
                                  <UserCheck size={11} /> Embaucher
                                </button>
                              ) : et.id !== "Recruté" ? (
                                <button
                                  onClick={() => {
                                    const currIdx = ETAPES_RECRUTEMENT.findIndex((e) => e.id === cand.etape);
                                    if (currIdx >= 0 && currIdx < ETAPES_RECRUTEMENT.length - 1) {
                                      setCandidatures((prev) => prev.map((c) => (c.id === cand.id ? { ...c, etape: ETAPES_RECRUTEMENT[currIdx + 1].id } : c)));
                                    }
                                  }}
                                  className="text-[#00A09D] hover:text-teal-200 flex items-center gap-0.5 font-semibold"
                                >
                                  <span>Avancer</span>
                                  <ChevronRight size={11} />
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ))}

                        {candsInStage.length === 0 && (
                          <div className="py-6 text-center text-gray-500 text-[11px]">Vide</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------------
            H. AGENDA & ÉVÉNEMENTS COLLABORATIFS (SYNCHRONISÉ AVEC LE GESTIONNAIRE D'ÉVÉNEMENTS)
           --------------------------------------------------------------------- */}
        {activeApp === "agenda" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 bg-[#13212D] border border-white/10 p-4 rounded-xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#714B67] text-white">
                    AGENDA COLLABORATIF RTC
                  </span>
                  <span className="text-xs text-teal-300 font-mono">
                    Total Événements : {eventsRTC?.length || 0}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white tracking-wide mt-1" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  Gestionnaire d'Événements, Réunions MINT & Entretiens RH
                </h2>
                <p className="text-xs text-[#8FA8B0]">
                  Les événements planifiés ici sont directement synchronisés avec l'onglet « Événements & Agenda » du portail principal.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalType("evenement")}
                  className="px-3.5 py-1.5 rounded-lg bg-[#00A09D] hover:bg-[#008784] text-xs font-semibold text-white flex items-center gap-1.5 shadow"
                >
                  <Plus size={14} /> Planifier un Événement
                </button>
              </div>
            </div>

            {/* Grille des Événements */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(eventsRTC && eventsRTC.length > 0 ? eventsRTC : []).map((evt) => (
                <div
                  key={evt.id}
                  className="bg-[#13212D] border border-white/10 rounded-xl p-4 space-y-3 hover:border-[#00A09D]/50 transition-all shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#714B67] text-white">
                      {evt.category || "SYNSR"}
                    </span>
                    <span className="text-xs text-amber-300 font-mono flex items-center gap-1">
                      <Clock size={11} /> {evt.time || "10:00"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{evt.title}</h3>
                    <p className="text-xs text-[#8FA8B0] mt-1 line-clamp-2">{evt.description || "Aucune description"}</p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-[#8FA8B0]">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="text-teal-400" />
                      <span>{evt.date}</span>
                    </div>
                    <button
                      onClick={() => onDeleteEventRTC(evt.id)}
                      className="text-gray-500 hover:text-red-400 p-1"
                      title="Supprimer l'événement"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            I. SUPPORT & BILLETS USSD
           --------------------------------------------------------------------- */}
        {activeApp === "tickets" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  Helpdesk & Réclamations Billetterie / USSD (*1234#)
                </h2>
                <p className="text-xs text-[#8FA8B0]">
                  Assistance technique aux voyageurs et agences pour les billets SMS et terminaux.
                </p>
              </div>
              <button
                onClick={() => setModalType("ticket")}
                className="px-3.5 py-1.5 rounded-lg bg-[#714B67] hover:bg-[#875A7B] text-xs font-semibold text-white flex items-center gap-1.5 shadow"
              >
                <Plus size={14} /> Nouveau Ticket
              </button>
            </div>

            {viewMode === "list" ? (
              <div className="bg-[#13212D] border border-white/10 rounded-xl overflow-hidden shadow">
                <table className="w-full text-xs text-left text-[#EAF2F4]">
                  <thead className="bg-[#1E1F29] text-[11px] uppercase tracking-wider text-[#8FA8B0] font-mono border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">N° Ticket</th>
                      <th className="py-3 px-4">Sujet & Type</th>
                      <th className="py-3 px-4">Demandeur</th>
                      <th className="py-3 px-4">Priorité</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tickets.map((t) => (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-mono text-[#00A09D] font-bold">{t.numero}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{t.titre}</div>
                          <div className="text-[10px] text-[#8FA8B0]">{t.type}</div>
                        </td>
                        <td className="py-3 px-4 text-[#8FA8B0]">{t.contact_nom} ({t.contact_tel})</td>
                        <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 font-semibold">{t.priorite}</span></td>
                        <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300">{t.statut}</span></td>
                        <td className="py-3 px-4 text-center">
                          {t.statut !== "Résolu" ? (
                            <button
                              onClick={() => {
                                setTickets((prev) => prev.map((tk) => (tk.id === t.id ? { ...tk, statut: "Résolu" } : tk)));
                                onNotify?.("Ticket résolu", "success");
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold"
                            >
                              Résoudre
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-semibold">✓ Résolu</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Nouveau", "En cours", "Résolu"].map((stat) => {
                  const tksInStat = tickets.filter((tk) => (stat === "Nouveau" ? tk.statut === "Nouveau" || !tk.statut : tk.statut === stat));
                  return (
                    <div key={stat} className="bg-[#13212D] border border-white/10 rounded-xl flex flex-col min-w-[240px] shadow">
                      <div className="p-3 border-b border-white/10 flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{stat}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/10 font-mono font-bold">{tksInStat.length}</span>
                      </div>
                      <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[580px]">
                        {tksInStat.map((tk) => (
                          <div key={tk.id} className="p-3 bg-[#1A2C3C] hover:bg-[#20364A] border border-white/10 rounded-lg space-y-2 transition-all shadow-sm">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono text-[#00A09D] font-bold">{tk.numero}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-500/20 text-red-300">{tk.priorite}</span>
                            </div>
                            <div className="text-xs font-semibold text-white">{tk.titre}</div>
                            <div className="text-[11px] text-[#8FA8B0] truncate">{tk.contact_nom} • {tk.contact_tel}</div>
                            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                              <span className="text-gray-400">{tk.type}</span>
                              {tk.statut !== "Résolu" && (
                                <button
                                  onClick={() => {
                                    setTickets((prev) => prev.map((item) => (item.id === tk.id ? { ...item, statut: "Résolu" } : item)));
                                    onNotify?.("Ticket résolu", "success");
                                  }}
                                  className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold"
                                >
                                  Résoudre
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {tksInStat.length === 0 && (
                          <div className="py-6 text-center text-gray-500 text-[11px]">Aucun ticket</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------------
            J. FACTURATION & FRAIS D'ABONNEMENT
           --------------------------------------------------------------------- */}
        {activeApp === "factures" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  Facturation des Agences & Reçus d'Abonnement (2 500 FCFA/an)
                </h2>
                <p className="text-xs text-[#8FA8B0]">
                  Suivi des encaissements d'abonnements annuels pour la plateforme souveraine SYNSR.
                </p>
              </div>
            </div>

            <div className="bg-[#13212D] border border-white/10 rounded-xl overflow-hidden shadow">
              <table className="w-full text-xs text-left text-[#EAF2F4]">
                <thead className="bg-[#1E1F29] text-[11px] uppercase tracking-wider text-[#8FA8B0] font-mono border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Facture N°</th>
                    <th className="py-3 px-4">Agence de Transport</th>
                    <th className="py-3 px-4">Objet</th>
                    <th className="py-3 px-4 text-right">Montant TTC (FCFA)</th>
                    <th className="py-3 px-4">Mode Paiement</th>
                    <th className="py-3 px-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {factures.map((f) => (
                    <tr key={f.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-[#00A09D] font-bold">{f.numero}</td>
                      <td className="py-3 px-4 font-bold text-white">{f.compte_nom}</td>
                      <td className="py-3 px-4 text-[#8FA8B0]">{f.objet}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">{f.montant_ttc.toLocaleString("fr-FR")}</td>
                      <td className="py-3 px-4 text-[#8FA8B0]">{f.mode_reglement}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">{f.statut}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          5. MODALES INTERACTIVES
         ========================================================================= */}

      {/* Modal Nouvelle Convention (Pipeline Commercial) */}
      {modalType === "opportunite" && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-[#00A09D]" />
                <span>Nouvelle Convention Commerciale</span>
              </h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveOpp} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#8FA8B0] mb-1 font-medium">Titre de la Convention / Projet :</label>
                <input
                  type="text"
                  required
                  placeholder="ex. Convention Équipement GPS & Billetterie Tourisme Express"
                  value={formOpp.titre}
                  onChange={(e) => setFormOpp({ ...formOpp, titre: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#00A09D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] mb-1 font-medium">Agence Partenaire :</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. Tourisme Express SA"
                    value={formOpp.compte_nom}
                    onChange={(e) => setFormOpp({ ...formOpp, compte_nom: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#00A09D]"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1 font-medium">Étape du Pipeline :</label>
                  <select
                    value={formOpp.etape}
                    onChange={(e) => setFormOpp({ ...formOpp, etape: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#00A09D]"
                  >
                    {ETAPES_PIPELINE.map((ep) => (
                      <option key={ep.id} value={ep.id}>{ep.label} ({ep.pct}%)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] mb-1 font-medium">Montant Estimé (FCFA) :</label>
                  <input
                    type="number"
                    required
                    min="100000"
                    step="50000"
                    value={formOpp.montant_fcfa}
                    onChange={(e) => setFormOpp({ ...formOpp, montant_fcfa: Number(e.target.value) })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#00A09D] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1 font-medium">Date Clôture Prévue :</label>
                  <input
                    type="date"
                    required
                    value={formOpp.date_cloture_prevue}
                    onChange={(e) => setFormOpp({ ...formOpp, date_cloture_prevue: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#00A09D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8FA8B0] mb-1 font-medium">Responsable du Compte :</label>
                <input
                  type="text"
                  value={formOpp.responsable}
                  onChange={(e) => setFormOpp({ ...formOpp, responsable: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#00A09D]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#714B67] hover:bg-[#875A7B] text-white font-semibold rounded-xl transition-all shadow"
                >
                  Enregistrer la Convention
                </button>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nouveau Ticket (Support & Billetterie USSD) */}
      {modalType === "ticket" && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <LifeBuoy size={16} className="text-[#00A09D]" />
                <span>Nouveau Ticket Support & Billetterie USSD</span>
              </h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#8FA8B0] mb-1 font-medium">Sujet / Problème signalé :</label>
                <input
                  type="text"
                  required
                  placeholder="ex. Échec impression billet SMS sur terminal POS Agence"
                  value={formTicket.titre}
                  onChange={(e) => setFormTicket({ ...formTicket, titre: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#00A09D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] mb-1 font-medium">Nom du Demandeur :</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. Jean Kouam"
                    value={formTicket.contact_nom}
                    onChange={(e) => setFormTicket({ ...formTicket, contact_nom: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#00A09D]"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1 font-medium">Téléphone Contact :</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. 699112233"
                    value={formTicket.contact_tel}
                    onChange={(e) => setFormTicket({ ...formTicket, contact_tel: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#00A09D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] mb-1 font-medium">Type d'Assistance :</label>
                  <select
                    value={formTicket.type}
                    onChange={(e) => setFormTicket({ ...formTicket, type: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#00A09D]"
                  >
                    <option value="Assistance Billetterie">Assistance Billetterie</option>
                    <option value="USSD *1234#">Service USSD *1234#</option>
                    <option value="Terminal POS & Flashcode">Terminal POS & Flashcode</option>
                    <option value="Facturation & Paiement">Facturation & Paiement</option>
                    <option value="Autre">Autre assistance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1 font-medium">Priorité :</label>
                  <select
                    value={formTicket.priorite}
                    onChange={(e) => setFormTicket({ ...formTicket, priorite: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#00A09D]"
                  >
                    <option value="Basse">Basse</option>
                    <option value="Normale">Normale</option>
                    <option value="Haute">Haute</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#8FA8B0] mb-1 font-medium">Agent Assigné :</label>
                <input
                  type="text"
                  value={formTicket.assigne_a}
                  onChange={(e) => setFormTicket({ ...formTicket, assigne_a: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#00A09D]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#714B67] hover:bg-[#875A7B] text-white font-semibold rounded-xl transition-all shadow"
                >
                  Créer le Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Fiche de Paie avec Logo RTC */}
      {modalType === "bulletinView" && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl font-sans max-h-[90vh] overflow-y-auto">
            {/* Header officiel avec Logo RTC */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <img src={logoRTC} alt="Logo RTC Officiel" className="h-16 w-auto object-contain" />
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">RÉPUBLIQUE DU CAMEROUN • MINT</div>
                  <div className="text-sm font-bold text-[#714B67]">RÉSEAU DE TRANSPORT CAMEROUNAIS (RTC)</div>
                  <div className="text-[11px] font-semibold text-gray-800">BULLETIN OFFICIEL DE SALAIRE — {selectedItem.periode}</div>
                </div>
              </div>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-gray-900 p-1"><X size={20} /></button>
            </div>

            {/* Infos Salarié */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-xl border">
              <div className="space-y-1">
                <div>Matricule : <strong className="font-mono text-[#714B67]">{selectedItem.matricule}</strong></div>
                <div>Salarié : <strong>{selectedItem.nom}</strong></div>
                <div>Poste : {selectedItem.poste}</div>
              </div>
              <div className="space-y-1">
                <div>Heures de Base : <strong>160h (40h/semaine)</strong></div>
                <div>Heures Supp. : <strong>{selectedItem.heures_supp || 0}h</strong></div>
                <div>Règlement : {selectedItem.mode_reglement}</div>
              </div>
            </div>

            {/* Décompte Gains et Retenues */}
            <table className="w-full text-xs text-left border rounded-lg overflow-hidden">
              <thead className="bg-gray-100 border-b font-semibold text-gray-700">
                <tr>
                  <th className="py-2.5 px-3">Rubrique</th>
                  <th className="py-2.5 px-3 text-right">Gains (FCFA)</th>
                  <th className="py-2.5 px-3 text-right">Retenues (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-700">
                <tr>
                  <td className="py-2 px-3 font-semibold">Salaire de Base (40h/semaine)</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-gray-900">{selectedItem.salaire_base.toLocaleString("fr-FR")}</td>
                  <td className="py-2 px-3 text-right font-mono">—</td>
                </tr>
                {selectedItem.primes > 0 && (
                  <tr>
                    <td className="py-2 px-3">Majorations Heures Supplémentaires (+25%)</td>
                    <td className="py-2 px-3 text-right font-mono">{selectedItem.primes.toLocaleString("fr-FR")}</td>
                    <td className="py-2 px-3 text-right font-mono">—</td>
                  </tr>
                )}
                <tr>
                  <td className="py-2 px-3">Indemnités Forfaitaires de Transport</td>
                  <td className="py-2 px-3 text-right font-mono">{selectedItem.indemnites.toLocaleString("fr-FR")}</td>
                  <td className="py-2 px-3 text-right font-mono">—</td>
                </tr>
                <tr className="bg-gray-50 font-bold">
                  <td className="py-2 px-3">TOTAL SALAIRE BRUT</td>
                  <td className="py-2 px-3 text-right font-mono text-[#714B67]">{selectedItem.salaire_brut.toLocaleString("fr-FR")}</td>
                  <td className="py-2 px-3 text-right font-mono">—</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Cotisation Sociale CNPS (4.2%)</td>
                  <td className="py-2 px-3 text-right font-mono">—</td>
                  <td className="py-2 px-3 text-right font-mono text-red-600">-{selectedItem.retenue_cnps.toLocaleString("fr-FR")}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Impôt sur le Revenu des Personnes Physiques (IRPP)</td>
                  <td className="py-2 px-3 text-right font-mono">—</td>
                  <td className="py-2 px-3 text-right font-mono text-red-600">-{selectedItem.retenue_irpp.toLocaleString("fr-FR")}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Taxe de Développement Local & TCS</td>
                  <td className="py-2 px-3 text-right font-mono">—</td>
                  <td className="py-2 px-3 text-right font-mono text-red-600">-{selectedItem.retenue_tcs.toLocaleString("fr-FR")}</td>
                </tr>
              </tbody>
            </table>

            {/* Total Net */}
            <div className="flex items-center justify-between p-4 bg-[#714B67] text-white rounded-xl shadow">
              <span className="text-xs uppercase font-bold tracking-wide">NET À PAYER AU SALARIÉ :</span>
              <span className="text-xl font-bold font-mono">{selectedItem.salaire_net.toLocaleString("fr-FR")} FCFA</span>
            </div>

            {/* Actions Imprimer */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
              >
                <Printer size={14} /> Imprimer / PDF
              </button>
              <button onClick={() => setModalType(null)} className="py-2.5 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-semibold">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouvel Employé (Sync Pilotage RH) */}
      {modalType === "employe" && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">{editingItem ? "Modifier l'Employé" : "Ajouter un Employé (Personnel RTC)"}</h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveEmploye} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Nom & Prénom :</label>
                  <input
                    type="text"
                    required
                    value={formEmploye.nom}
                    onChange={(e) => setFormEmploye({ ...formEmploye, nom: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                    placeholder="Ex: Jean Dupont"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Rôle / Poste :</label>
                  <input
                    type="text"
                    required
                    value={formEmploye.role}
                    onChange={(e) => setFormEmploye({ ...formEmploye, role: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                    placeholder="Ex: Inspecteur Terrain"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Email Professionnel :</label>
                  <input
                    type="email"
                    required
                    value={formEmploye.email}
                    onChange={(e) => setFormEmploye({ ...formEmploye, email: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                    placeholder="nom@rtc.cm"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Salaire de Base (FCFA) :</label>
                  <input
                    type="number"
                    required
                    value={formEmploye.salaire}
                    onChange={(e) => setFormEmploye({ ...formEmploye, salaire: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-[#00A09D] hover:bg-[#008784] text-white font-semibold rounded-xl transition-all shadow">
                  Enregistrer & Propager dans Pilotage RH
                </button>
                <button type="button" onClick={() => setModalType(null)} className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nouvelle Agence (Sync SYNSR) */}
      {modalType === "agence" && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Enregistrer une Agence de Voyage</h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveAgence} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8FA8B0] mb-1">Nom de la Compagnie :</label>
                <input
                  type="text"
                  required
                  value={formAgence.nom}
                  onChange={(e) => setFormAgence({ ...formAgence, nom: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                  placeholder="Ex: Finexs Voyages"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Ville du Siège :</label>
                  <input
                    type="text"
                    required
                    value={formAgence.ville}
                    onChange={(e) => setFormAgence({ ...formAgence, ville: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Chef d'Agence :</label>
                  <input
                    type="text"
                    value={formAgence.chefAgence}
                    onChange={(e) => setFormAgence({ ...formAgence, chefAgence: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Statut Agrément MINT :</label>
                  <select
                    value={formAgence.statut}
                    onChange={(e) => setFormAgence({ ...formAgence, statut: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                  >
                    <option value="Validée">Validée (Homologuée MINT)</option>
                    <option value="En attente">En attente de validation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Frais d'Abonnement (2 500 F/an) :</label>
                  <select
                    value={formAgence.recuAbonnement ? "paye" : "impaye"}
                    onChange={(e) => setFormAgence({ ...formAgence, recuAbonnement: e.target.value === "paye" ? "recu_2026.pdf" : "" })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                  >
                    <option value="paye">Payé (2 500 FCFA acquitté)</option>
                    <option value="impaye">Impayé / En attente</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-[#714B67] hover:bg-[#875A7B] text-white font-semibold rounded-xl transition-all shadow">
                  Enregistrer l'Agence
                </button>
                <button type="button" onClick={() => setModalType(null)} className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Planifier Événement (Sync Agenda Collaboratif) */}
      {modalType === "evenement" && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Planifier un Événement RTC</h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8FA8B0] mb-1">Titre de l'événement :</label>
                <input
                  type="text"
                  required
                  value={formEvent.title}
                  onChange={(e) => setFormEvent({ ...formEvent, title: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                  placeholder="Ex: Commission d'Homologation MINT"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Date :</label>
                  <input
                    type="date"
                    required
                    value={formEvent.date}
                    onChange={(e) => setFormEvent({ ...formEvent, date: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Heure :</label>
                  <input
                    type="time"
                    required
                    value={formEvent.time}
                    onChange={(e) => setFormEvent({ ...formEvent, time: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8FA8B0] mb-1">Description / Ordre du jour :</label>
                <textarea
                  rows={2}
                  value={formEvent.description}
                  onChange={(e) => setFormEvent({ ...formEvent, description: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-[#00A09D] hover:bg-[#008784] text-white font-semibold rounded-xl transition-all shadow">
                  Ajouter à l'Agenda Partagé
                </button>
                <button type="button" onClick={() => setModalType(null)} className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Feuille de Temps (Samedi -> Vendredi) */}
      {modalType === "feuille" && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Saisie Feuille de Temps (Samedi ➔ Vendredi, 40h/semaine)</h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveFeuille} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Employé RTC :</label>
                  <select
                    value={formFeuille.matricule}
                    onChange={(e) => setFormFeuille({ ...formFeuille, matricule: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                  >
                    {listeEmployesConsolidee.map((e) => (
                      <option key={e.id} value={e.matricule}>{e.nom} ({e.matricule})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Projet / Mission :</label>
                  <input
                    type="text"
                    value={formFeuille.projet}
                    onChange={(e) => setFormFeuille({ ...formFeuille, projet: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                  />
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-white mb-2 flex items-center justify-between">
                  <span>Heures quotidiennes (Samedi ➔ Vendredi) :</span>
                  <span className="font-mono text-teal-300">
                    Total : {Number(formFeuille.samedi) + Number(formFeuille.dimanche) + Number(formFeuille.lundi) + Number(formFeuille.mardi) + Number(formFeuille.mercredi) + Number(formFeuille.jeudi) + Number(formFeuille.vendredi)}h / 40h
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  <div>
                    <label className="block text-[10px] text-purple-300 font-bold mb-1">Sam (8h)</label>
                    <input type="number" min="0" max="12" value={formFeuille.samedi} onChange={(e) => setFormFeuille({ ...formFeuille, samedi: e.target.value })} className="w-full bg-[#1A2C3C] text-white text-center p-2 rounded-lg border border-white/10 font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Dim</label>
                    <input type="number" min="0" max="12" value={formFeuille.dimanche} onChange={(e) => setFormFeuille({ ...formFeuille, dimanche: e.target.value })} className="w-full bg-[#1A2C3C] text-white text-center p-2 rounded-lg border border-white/10 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white mb-1">Lun (8h)</label>
                    <input type="number" min="0" max="12" value={formFeuille.lundi} onChange={(e) => setFormFeuille({ ...formFeuille, lundi: e.target.value })} className="w-full bg-[#1A2C3C] text-white text-center p-2 rounded-lg border border-white/10 font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white mb-1">Mar (8h)</label>
                    <input type="number" min="0" max="12" value={formFeuille.mardi} onChange={(e) => setFormFeuille({ ...formFeuille, mardi: e.target.value })} className="w-full bg-[#1A2C3C] text-white text-center p-2 rounded-lg border border-white/10 font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white mb-1">Mer (8h)</label>
                    <input type="number" min="0" max="12" value={formFeuille.mercredi} onChange={(e) => setFormFeuille({ ...formFeuille, mercredi: e.target.value })} className="w-full bg-[#1A2C3C] text-white text-center p-2 rounded-lg border border-white/10 font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white mb-1">Jeu (8h)</label>
                    <input type="number" min="0" max="12" value={formFeuille.jeudi} onChange={(e) => setFormFeuille({ ...formFeuille, jeudi: e.target.value })} className="w-full bg-[#1A2C3C] text-white text-center p-2 rounded-lg border border-white/10 font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Ven</label>
                    <input type="number" min="0" max="12" value={formFeuille.vendredi} onChange={(e) => setFormFeuille({ ...formFeuille, vendredi: e.target.value })} className="w-full bg-[#1A2C3C] text-white text-center p-2 rounded-lg border border-white/10 font-mono" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-[#00A09D] hover:bg-[#008784] text-white font-semibold rounded-xl transition-all shadow">
                  Soumettre pour Approbation
                </button>
                <button type="button" onClick={() => setModalType(null)} className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Demande de Congé */}
      {modalType === "conge" && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Demande de Congé ou Absence</h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveConge} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#8FA8B0] mb-1">Employé RTC :</label>
                <select
                  value={formConge.matricule}
                  onChange={(e) => setFormConge({ ...formConge, matricule: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                >
                  {listeEmployesConsolidee.map((e) => (
                    <option key={e.id} value={e.matricule}>{e.nom} ({e.matricule})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#8FA8B0] mb-1">Type d'absence :</label>
                <select
                  value={formConge.type}
                  onChange={(e) => setFormConge({ ...formConge, type: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                >
                  <option value="Vacances (Congés payés)">Vacances (Congés payés)</option>
                  <option value="Congé Maladie">Congé Maladie (avec justificatif)</option>
                  <option value="Congé Exceptionnel / Maternité">Congé Exceptionnel / Maternité</option>
                  <option value="Récupération / RTT">Récupération / RTT</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Date de début :</label>
                  <input
                    type="date"
                    value={formConge.date_debut}
                    onChange={(e) => setFormConge({ ...formConge, date_debut: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Date de fin :</label>
                  <input
                    type="date"
                    value={formConge.date_fin}
                    onChange={(e) => setFormConge({ ...formConge, date_fin: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8FA8B0] mb-1">Motif / Justification :</label>
                <textarea
                  rows={2}
                  value={formConge.motif}
                  onChange={(e) => setFormConge({ ...formConge, motif: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-[#00A09D] hover:bg-[#008784] text-white font-semibold rounded-xl transition-all shadow">
                  Enregistrer la demande
                </button>
                <button type="button" onClick={() => setModalType(null)} className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Candidat */}
      {modalType === "candidat" && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Ajouter un Candidat au Recrutement</h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const nouveau = {
                  id: `cand-${Date.now()}`,
                  nom_candidat: formCandidat.nom_candidat,
                  poste_titre: formCandidat.poste_titre,
                  email: formCandidat.email,
                  telephone: formCandidat.telephone,
                  etape: "Nouveau",
                  evaluation: Number(formCandidat.evaluation),
                  salaire_souhaite: Number(formCandidat.salaire_souhaite),
                  disponibilite: formCandidat.disponibilite,
                  notes: formCandidat.notes,
                };
                setCandidatures((prev) => [nouveau, ...prev]);
                setModalType(null);
                onNotify?.("Candidat ajouté au pipeline de recrutement", "success");
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[#8FA8B0] mb-1">Nom complet du candidat :</label>
                <input
                  type="text"
                  required
                  value={formCandidat.nom_candidat}
                  onChange={(e) => setFormCandidat({ ...formCandidat, nom_candidat: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                />
              </div>

              <div>
                <label className="block text-[#8FA8B0] mb-1">Poste ciblé :</label>
                <input
                  type="text"
                  required
                  value={formCandidat.poste_titre}
                  onChange={(e) => setFormCandidat({ ...formCandidat, poste_titre: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Email :</label>
                  <input
                    type="email"
                    required
                    value={formCandidat.email}
                    onChange={(e) => setFormCandidat({ ...formCandidat, email: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Téléphone :</label>
                  <input
                    type="text"
                    required
                    value={formCandidat.telephone}
                    onChange={(e) => setFormCandidat({ ...formCandidat, telephone: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-white p-2.5 rounded-lg border border-white/10"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-[#00A09D] hover:bg-[#008784] text-white font-semibold rounded-xl transition-all shadow">
                  Ajouter au Recrutement
                </button>
                <button type="button" onClick={() => setModalType(null)} className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white rounded-xl">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Supabase */}
      {supabaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database size={16} className="text-teal-400" /> Base de Données Souveraine
              </h3>
              <button onClick={() => setSupabaseModalOpen(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="text-xs text-[#8FA8B0] space-y-2">
              <p>Synchronisation bidirectionnelle instantanée avec le module Pilotage RH et l'écosystème SYNSR-CAM.</p>
              <div className="p-3 bg-[#0B131B] rounded-lg border border-white/10 font-mono text-[11px] space-y-1">
                <div>Statut : <span className={supabaseStatus.connected ? "text-emerald-400 font-bold" : "text-teal-300 font-bold"}>{supabaseStatus.connected ? "Connecté à Supabase" : "Session Active Synchronisée"}</span></div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSyncSupabase}
                disabled={syncLoading}
                className="flex-1 py-2 bg-[#00A09D] hover:bg-[#008784] text-white rounded-lg text-xs font-semibold"
              >
                Synchroniser Maintenant
              </button>
              <button onClick={() => setSupabaseModalOpen(false)} className="py-2 px-3 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
