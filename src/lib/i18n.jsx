import React, { createContext, useContext, useState, useEffect } from "react";
import { Globe, LayoutGrid } from "lucide-react";

export const translations = {
  fr: {
    // Commun & Odoo ERP
    app_title: "Réseau de Transport Camerounais",
    national_portal: "Portail des systèmes numériques nationaux",
    sovereign_platform: "Plateforme Numérique Souveraine du Cameroun",
    system_active: "Système actif",
    welcome: "Bienvenue",
    login: "Se connecter",
    logout: "Se déconnecter",
    signup: "Créer un compte",
    no_account: "Pas encore de compte ? Créer un compte",
    have_account: "Déjà un compte ? Se connecter",
    identifier: "Identifiant (email ou téléphone)",
    password: "Mot de passe",
    confirm_password: "Confirmer le mot de passe",
    full_name: "Nom complet",
    contact: "Contact (email ou téléphone)",
    role_profile: "Profil & Secteur",
    search: "Rechercher...",
    filter: "Filtrer",
    reset_filters: "Réinitialiser les filtres",
    actions: "Actions",
    edit: "Modifier",
    delete: "Supprimer",
    cancel: "Annuler",
    save: "Enregistrer",
    confirm: "Confirmer",
    close: "Fermer",
    add: "Ajouter",
    new: "Nouveau",
    create: "+ Nouveau",
    details: "Détails",
    download_pdf: "Télécharger en PDF",
    export_excel: "Exporter Excel",
    export_csv: "Exporter CSV",
    export_pdf: "Exporter PDF",
    status: "Statut",
    date: "Date",
    region: "Région",
    departement: "Département",
    commune: "Commune",
    active: "Actif",
    pending: "En attente",
    validated: "Validé",
    suspended: "Suspendu",
    closed: "Clôturé",
    previous: "◄ Précédent",
    next: "Suivant ►",
    page: "Page",
    total_records: "lignes au total",
    page_size: "15 lignes par page",
    double_click_hint: "Astuce : double-cliquez sur une ligne pour la modifier ou la supprimer.",
    back_to_portal: "Portail RTC",
    back_to_portal_full: "Retour au portail RTC",
    choose_module: "Choisissez un module",
    module_desc: "Chaque module est un système indépendant. Votre accès dépend des droits accordés par l'Administrateur système RTC.",
    access_module: "Accéder au module",
    unauthorized: "Accès non autorisé",
    inactive_module: "Module actuellement inactif",
    odoo_apps: "Applications",
    odoo_view_list: "Vue Liste",
    odoo_view_kanban: "Vue Kanban",
    odoo_filters: "Filtres",
    odoo_group_by: "Grouper par",
    odoo_favorites: "Favoris",
    
    // Modules Portals
    synsr_name: "SYNSR",
    synsr_title: "Système Numérique de Sécurité Routière du Cameroun",
    synsr_desc: "",
    syndec_name: "SYNDEC",
    syndec_title: "Système Numérique de Déclaration du Cameroun",
    syndec_desc: "",
    synrec_name: "SYNREC",
    synrec_title: "Système Numérique du Recensement du Cameroun",
    synrec_desc: "",
    syngese_name: "SYNGESE",
    syngese_title: "Système intégré de Gestion du Système Éducatif du Cameroun",
    syngese_desc: "",
    camsms_name: "SMS",
    camsms_title: "Cameroon School Management System",
    camsms_desc: "",
    syngeshp_name: "SYNGESHP",
    syngeshp_title: "Système Numérique de Gestion Hospitalière et de Planification du Cameroun",
    syngeshp_desc: "",

    // Navigation SYNSR-CAM
    nav_dashboard: "Tableau de bord",
    nav_agencies: "Agences de transport",
    nav_passengers: "Passagers",
    nav_vehicles: "Véhicules particuliers",
    nav_drivers: "Chauffeurs d'agence",
    nav_trips: "Voyages & Manifestes",
    nav_accidents: "Accidents & Zones à risque",
    nav_alerts: "Alertes SOS & Urgences",
    nav_reports: "Signalements citoyens",
    nav_inquiry: "Recherche & Enquête",
    nav_notifications: "Notifications",
    nav_geoloc: "Géolocalisation",
    nav_api: "API & Rapports BI",
    nav_events: "Événements & Agenda",
    nav_team_chat: "Chat & Discussions",
    sync_gmail: "Synchroniser avec Gmail",
    download_ics: "Télécharger .ics",
    mention_colleague: "Taguer un collègue (@)",
    nav_internal_staff: "Personnel du RTC",
    nav_users: "Comptes utilisateurs",
    nav_audit: "Administration SYNSR",
    nav_ussd: "USSD *1234#",
    nav_about: "À propos",

    // Navigation SYNDEC-CAM
    nav_syndec_dashboard: "Tableau de bord national",
    nav_births: "Déclarations de naissance",
    nav_marriages: "Déclarations de mariage",
    nav_deaths: "Déclarations de décès",
    nav_extracts: "Extraits & QR Code",
    nav_communes: "Communes",
    nav_officers: "Officier d'état civil & Maire",
    nav_payments: "Paiements électroniques",
    nav_syndec_admin: "Administration SYNDEC-CAM",
    nav_syndec_about: "À propos SYNDEC-CAM",

    // Navigation SYNREC-CAM
    nav_synrec_dashboard: "Tableau de bord national",
    nav_census_territory: "Gestion territoriale",
    nav_households: "Ménages & logements",
    nav_individuals: "Personnes recensées",
    nav_enumerators: "Agents recenseurs",
    nav_gis: "Cartographie SIG",
    nav_duplicates: "Doublons & contrôle qualité",
    nav_zone_supervisors: "Gestion de zone",
    nav_synrec_admin: "Administration SYNREC",
    nav_synrec_about: "À propos SYNREC-CAM",
    nav_synrec_ussd: "Recensement USSD",

    // Navigation SYNGESE-CAM
    nav_syngese_dashboard: "Tableau de bord",
    nav_establishments: "Établissements",
    nav_students: "Élèves",
    nav_teachers: "Enseignants",
    nav_classes: "Classes",
    nav_attendance: "Présences",
    nav_fee_payments: "Paiements",
    nav_subjects: "Matières",
    nav_evaluations: "Évaluations",
    nav_report_cards: "Bulletins",
    nav_school_documents: "Documents",
    nav_academic_years: "Années scolaires",
    nav_timetables: "Emplois du temps",
    nav_syngese_admin: "Administration SYNGESE",

    // Navigation CAM-SMS
    nav_camsms_dashboard: "Dashboard",
    nav_schools: "Schools",
    nav_learners: "Learners",
    nav_camsms_teachers: "Teachers",
    nav_camsms_classes: "Classes",
    nav_camsms_attendance: "Attendance",
    nav_camsms_fees: "School Fees",
    nav_camsms_subjects: "Subjects",
    nav_assessments: "Assessments",
    nav_camsms_report_cards: "Report Cards",
    nav_camsms_documents: "Documents",
    nav_camsms_years: "Academic Years",
    nav_camsms_timetable: "Timetable",
    nav_camsms_admin: "SMS Administration",

    // Navigation SYNGESHP-CAM
    nav_syngeshp_dashboard: "Tableau de Bord & KPIs",
    nav_hospitals: "Établissements & Pôles",
    nav_medical_staff: "Personnel Médical & RH",
    nav_shifts: "Plannings & Gardes",
    nav_leaves: "Congés & Absences",
    nav_patients: "Dossiers Patients & RDV",
    nav_beds: "Lits & Hospitalisations",
    nav_operating_theatre: "Bloc Opératoire",
    nav_lab_imaging: "Laboratoire & Imagerie",
    nav_pharmacy: "Pharmacie & Stocks",
    nav_csu_billing: "Facturation & CSU",
    nav_syngeshp_admin: "Administration SYNGESHP",

    // Language
    language: "Langue",
    french: "Français",
    english: "English",
  },
  en: {
    // Common & Odoo ERP
    app_title: "Cameroon Transport Network",
    national_portal: "National Digital Systems Portal",
    sovereign_platform: "Sovereign Digital Platform of Cameroon",
    system_active: "System Active",
    welcome: "Welcome",
    login: "Log In",
    logout: "Log Out",
    signup: "Create Account",
    no_account: "Don't have an account? Sign up",
    have_account: "Already have an account? Log in",
    identifier: "Identifier (Email or Phone)",
    password: "Password",
    confirm_password: "Confirm Password",
    full_name: "Full Name",
    contact: "Contact (Email or Phone)",
    role_profile: "Profile & Sector",
    search: "Search...",
    filter: "Filter",
    reset_filters: "Reset Filters",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
    confirm: "Confirm",
    close: "Close",
    add: "Add",
    new: "New",
    create: "+ New",
    details: "Details",
    download_pdf: "Download PDF",
    export_excel: "Export Excel",
    export_csv: "Export CSV",
    export_pdf: "Export PDF",
    status: "Status",
    date: "Date",
    region: "Region",
    departement: "Division",
    commune: "Sub-division / Council",
    active: "Active",
    pending: "Pending",
    validated: "Validated",
    suspended: "Suspended",
    closed: "Closed",
    previous: "◄ Previous",
    next: "Next ►",
    page: "Page",
    total_records: "total rows",
    page_size: "15 rows per page",
    double_click_hint: "Tip: Double-click a row to edit or delete it.",
    back_to_portal: "RTC Portal",
    back_to_portal_full: "Back to RTC Portal",
    choose_module: "Choose a Module",
    module_desc: "Each module is an independent system. Your access depends on the permissions granted by the RTC System Administrator.",
    access_module: "Access Module",
    unauthorized: "Access Unauthorized",
    inactive_module: "Module currently inactive",
    odoo_apps: "Applications",
    odoo_view_list: "List View",
    odoo_view_kanban: "Kanban View",
    odoo_filters: "Filters",
    odoo_group_by: "Group By",
    odoo_favorites: "Favorites",

    // Modules Portals
    synsr_name: "SYNSR",
    synsr_title: "Cameroon National Road Safety & Transport System",
    synsr_desc: "",
    syndec_name: "SYNDEC",
    syndec_title: "Cameroon Civil Status & Legal Declarations System",
    syndec_desc: "",
    synrec_name: "SYNREC",
    synrec_title: "Cameroon National Census & Demographics System",
    synrec_desc: "",
    syngese_name: "SYNGESE",
    syngese_title: "Cameroon Integrated Educational Management System",
    syngese_desc: "",
    camsms_name: "SMS",
    camsms_title: "Cameroon School Management System",
    camsms_desc: "",
    syngeshp_name: "SYNGESHP",
    syngeshp_title: "Cameroon Hospital Operations & Health Planning System",
    syngeshp_desc: "",

    // Navigation SYNSR-CAM
    nav_dashboard: "Dashboard & KPIs",
    nav_agencies: "Transport Agencies",
    nav_passengers: "Passengers",
    nav_vehicles: "Vehicles & Fleet",
    nav_drivers: "Agency Drivers",
    nav_trips: "Trips & Manifests",
    nav_accidents: "Accidents & Blackspots",
    nav_alerts: "SOS Alerts & Emergencies",
    nav_reports: "Citizen Reports",
    nav_inquiry: "Search & Investigation",
    nav_notifications: "Notifications",
    nav_geoloc: "Geolocation",
    nav_api: "API & BI Reports",
    nav_events: "Events & Calendar",
    nav_team_chat: "Team Chat & Channels",
    sync_gmail: "Sync with Gmail",
    download_ics: "Download .ics",
    mention_colleague: "Mention colleague (@)",
    nav_internal_staff: "RTC Staff",
    nav_users: "User Accounts",
    nav_audit: "SYNSR Administration",
    nav_ussd: "USSD *1234# Channel",
    nav_about: "About",

    // Navigation SYNDEC-CAM
    nav_syndec_dashboard: "Civil Status Dashboard",
    nav_births: "Birth Declarations",
    nav_marriages: "Marriage Declarations",
    nav_deaths: "Death Declarations",
    nav_extracts: "Certified Extracts & QR",
    nav_communes: "Councils & Municipalities",
    nav_officers: "Civil Status Registrars & Mayors",
    nav_payments: "Electronic Payments",
    nav_syndec_admin: "SYNDEC Administration",
    nav_syndec_about: "About SYNDEC-CAM",

    // Navigation SYNREC-CAM
    nav_synrec_dashboard: "Census Dashboard",
    nav_census_territory: "Territorial Management",
    nav_households: "Households & Dwellings",
    nav_individuals: "Enumerated Persons",
    nav_enumerators: "Census Enumerators",
    nav_gis: "GIS & Cartography",
    nav_duplicates: "Duplicate Control & QA",
    nav_zone_supervisors: "Zone Supervisors",
    nav_synrec_admin: "SYNREC Administration",
    nav_synrec_about: "About SYNREC-CAM",
    nav_synrec_ussd: "USSD Census",

    // Navigation SYNGESE-CAM
    nav_syngese_dashboard: "Academic Dashboard",
    nav_establishments: "Schools & Colleges",
    nav_students: "Students & Pupils",
    nav_teachers: "Teachers & Faculty",
    nav_classes: "Classes & Classrooms",
    nav_attendance: "Attendance Records",
    nav_fee_payments: "Tuition & Fees",
    nav_subjects: "Subjects & Courses",
    nav_evaluations: "Evaluations & Exams",
    nav_report_cards: "Report Cards",
    nav_school_documents: "School Certificates",
    nav_academic_years: "Academic Years",
    nav_timetables: "Timetables & Schedules",
    nav_syngese_admin: "SYNGESE Administration",

    // Navigation CAM-SMS
    nav_camsms_dashboard: "Dashboard",
    nav_schools: "Schools & Campuses",
    nav_learners: "Learners (Pupils / Students)",
    nav_camsms_teachers: "Teachers & Staff",
    nav_camsms_classes: "Classes & Streams",
    nav_camsms_attendance: "Daily Attendance",
    nav_camsms_fees: "School Fees & Receipts",
    nav_camsms_subjects: "Subjects & Allocations",
    nav_assessments: "Assessments & Tests",
    nav_camsms_report_cards: "Report Cards",
    nav_camsms_documents: "Documents",
    nav_camsms_years: "Academic Years",
    nav_camsms_timetable: "Timetable & Schedules",
    nav_camsms_admin: "SMS Administration",

    // Navigation SYNGESHP-CAM
    nav_syngeshp_dashboard: "Dashboard & KPIs",
    nav_hospitals: "Hospitals & Facilities",
    nav_medical_staff: "Medical Staff & HR",
    nav_shifts: "Duty Rosters & Shifts",
    nav_leaves: "Leaves & Absences",
    nav_patients: "Patient Records & Appts",
    nav_beds: "Beds & Inpatients",
    nav_operating_theatre: "Operating Theatre",
    nav_lab_imaging: "Laboratory & Imaging",
    nav_pharmacy: "Pharmacy & Stocks",
    nav_csu_billing: "Billing & UHC Insurance",
    nav_syngeshp_admin: "SYNGESHP Administration",

    // Language
    language: "Language",
    french: "Français",
    english: "English",
  }
};

const LanguageContext = createContext({
  lang: "fr",
  setLang: () => {},
  t: (key, fallback) => (fallback !== undefined ? fallback : key),
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem("app_lang") || "fr";
    } catch {
      return "fr";
    }
  });

  const setLang = (newLang) => {
    const valid = newLang === "en" ? "en" : "fr";
    setLangState(valid);
    try {
      localStorage.setItem("app_lang", valid);
    } catch (e) {
      console.warn("Storage error", e);
    }
  };

  const t = (key, fallback) => {
    const dict = translations[lang] || translations.fr;
    if (dict && Object.prototype.hasOwnProperty.call(dict, key)) {
      return dict[key];
    }
    return fallback !== undefined ? fallback : key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/**
 * Odoo-Style Language Switcher Component
 */
export function LanguageSwitcher({ className = "", compact = false }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`inline-flex items-center rounded-lg p-0.5 bg-black/40 border border-white/10 ${className}`}>
      <button
        type="button"
        onClick={() => setLang("fr")}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all duration-150 ${
          lang === "fr"
            ? "bg-[#714B67] text-white shadow-sm font-bold border border-[#a27196]/40"
            : "text-[#8FA8B0] hover:text-white hover:bg-white/5"
        }`}
        title="Passer en Français"
      >
        <span>🇫🇷</span>
        {!compact && <span>FR</span>}
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all duration-150 ${
          lang === "en"
            ? "bg-[#714B67] text-white shadow-sm font-bold border border-[#a27196]/40"
            : "text-[#8FA8B0] hover:text-white hover:bg-white/5"
        }`}
        title="Switch to English"
      >
        <span>🇬🇧</span>
        {!compact && <span>EN</span>}
      </button>
    </div>
  );
}

/**
 * Odoo ERP Top App Bar Header Component
 */
export function OdooTopBar({ moduleName, currentView, onPortal, rightSlot }) {
  const { lang, t } = useLanguage();

  return (
    <header className="min-h-12 bg-[#1E1F29] border-b border-[#2E3040] flex items-center justify-between px-4 py-2 text-white shrink-0 flex-wrap gap-2 shadow-sm">
      <div className="flex items-center gap-3">
        {onPortal && (
          <button
            type="button"
            onClick={onPortal}
            title={t("odoo_apps", "Applications")}
            className="w-8 h-8 rounded-lg bg-[#714B67] hover:bg-[#86597a] flex items-center justify-center text-white transition-transform active:scale-95 shadow"
          >
            <LayoutGrid size={17} />
          </button>
        )}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-[#EAF2F4] tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "14px" }}>
            {moduleName}
          </span>
          {currentView && (
            <>
              <span className="text-white/30">/</span>
              <span className="text-[#00A09D] font-semibold">{currentView}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        {rightSlot}
      </div>
    </header>
  );
}
