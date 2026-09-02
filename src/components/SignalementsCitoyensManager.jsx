import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import {
  Siren, ShieldAlert, ShieldCheck, AlertTriangle, AlertCircle, PhoneCall,
  MapPin, Camera, Video, FileText, CheckCircle2, Clock, Users, Building2,
  Car, Eye, Trash2, Download, Search, Filter, Plus, RefreshCw, X, ArrowRight,
  ChevronRight, ExternalLink, HelpCircle, LifeBuoy, Radio, MessageSquare,
  Sparkles, CheckSquare, Layers, Navigation, Shield, Award, Landmark, Upload,
  Sliders, UserCheck, AlertOctagon, UserX, UserPlus, Phone, Flame, Lock,
  Mail, Send, Smartphone, CheckCheck, Inbox, ArrowUpRight, Check
} from "lucide-react";

// ============================================================================
// CONSTANTES INSTITUTIONNELLES & NUMÉROS VERTS CAMEROUN
// ============================================================================
export const NUMEROS_URGENCE_CAMEROUN = {
  GENDARMERIE_DETRESSE: "113",
  POLICE_SECOURS: "117",
  USSD_SIGNALEMENT: "*1234#",
  SMS_COURT: "511",
  CENTRE_MONITORING_MINT: "+237 222 23 10 50",
  URGENCES_MEDICALES: "119",
  SAPEURS_POMPIERS: "118",
};

export const REGIONS_CAMEROUN = [
  "Centre", "Littoral", "Ouest", "Nord-Ouest", "Sud-Ouest",
  "Adamaoua", "Nord", "Extrême-Nord", "Est", "Sud"
];

export const CATEGORIES_SIGNALEMENTS = [
  {
    id: "CHAUSSEE",
    label: "Chaussée & Infrastructure (MINTP)",
    icon: AlertTriangle,
    color: "#E8A33D",
    autoriteParDefaut: "MINTP",
    types: [
      "Nid-de-poule / Dégradation critique",
      "Affaissement de chaussée / Fissures majeures",
      "Éboulement / Glissement de terrain",
      "Inondation / Voie submergée",
      "Obstacle dangereux / Arbre ou débris sur voie",
      "Ouvrage d'art (pont, buse) endommagé"
    ]
  },
  {
    id: "EQUIPEMENTS",
    label: "Équipements & Signalisation (MINTP / Commune)",
    icon: Landmark,
    color: "#00A09D",
    autoriteParDefaut: "MINTP",
    types: [
      "Signalisation verticale arrachée ou masquée",
      "Signalisation horizontale / marquage effacé",
      "Éclairage public / lampadaires en panne",
      "Glissières de sécurité endommagées ou absentes",
      "Feux tricolores en panne ou clignotants",
      "Ralentisseur non conforme / non signalé"
    ]
  },
  {
    id: "VITESSE_COMPORTEMENT",
    label: "Excès de Vitesse & Conduite (MINT / Ym@ne)",
    icon: Car,
    color: "#D2483E",
    autoriteParDefaut: "MINT",
    types: [
      "Excès de vitesse — Chauffeur d'agence de voyage",
      "Excès de vitesse — Chauffeur particulier",
      "Dépassement dangereux / Franchissement ligne continue",
      "Conduite en état d'ébriété / Usage stupéfiant",
      "Surcharge de passagers ou de fret",
      "Refus d'obtempérer / Délit de fuite",
      "Stationnement dangereux en pleine voie"
    ]
  },
  {
    id: "ABUS_AUTORITE",
    label: "Abus d'Autorité & Tracasseries Routières",
    icon: ShieldAlert,
    color: "#875A7B",
    autoriteParDefaut: "DGSN",
    types: [
      "Abus / Tracasserie d'un agent de Police (DGSN)",
      "Abus / Tracasserie d'un gendarme (Gendarmerie)",
      "Rançonnement / Abus préposé au poste de péage",
      "Abus / Rançonnement au poste de pesage",
      "Contrôle routier clandestin non homologué",
      "Confiscation abusive de pièces ou permis"
    ]
  },
  {
    id: "AGRESSION_VIOLENCE",
    label: "Agressions, Violences & Détresse (113 / 117)",
    icon: Siren,
    color: "#DC3545",
    autoriteParDefaut: "Gendarmerie",
    types: [
      "Agression physique sur axe routier ou en gare",
      "Braquage / Vol à main armée de véhicule",
      "Vol à la tire / Vol de bagages passager",
      "Viol / Agression sexuelle",
      "Violence conjugale en situation de déplacement",
      "Détresse voyageur / Passager abandonné"
    ]
  },
  {
    id: "AUTRE",
    label: "Autre Danger Ponctuel",
    icon: HelpCircle,
    color: "#5C7680",
    autoriteParDefaut: "MINT",
    types: [
      "Animal errant sur voie rapide",
      "Incendie de véhicule / Fumée dense",
      "Autre incident routier"
    ]
  }
];

export const AUTORITES_COMPETENTES = [
  {
    id: "Gendarmerie",
    label: "Gendarmerie Nationale (Détresse - 113)",
    badgeColor: "#D2483E",
    email: "detresse113@sed.cm",
    gmailSecours: "gendarmerie.nationale.ops.cm@gmail.com",
    telAstreinte: "+237 699 113 113 (Ligne rouge Détresse 113)",
    contact: "detresse113@sed.cm",
    titreOfficier: "Commandant de Compagnie / Chef Peloton GN"
  },
  {
    id: "DGSN",
    label: "DGSN (Police Secours - 117)",
    badgeColor: "#00A09D",
    email: "urgence117@dgsn.cm",
    gmailSecours: "police.secours.dgsn.cm@gmail.com",
    telAstreinte: "+237 699 117 117 (Poste Central Radio 117)",
    contact: "urgence117@dgsn.cm",
    titreOfficier: "Commissaire Central / Officier de Permanence"
  },
  {
    id: "MINT",
    label: "MINT (Transports & Monitoring SGITR)",
    badgeColor: "#714B67",
    email: "monitoring@mint.gov.cm",
    gmailSecours: "mint.monitoring.cameroun@gmail.com",
    telAstreinte: "+237 222 23 10 50 (Centre National Monitoring MINT)",
    contact: "contact@mint.gov.cm",
    titreOfficier: "Inspecteur Général des Transports / SGITR"
  },
  {
    id: "MINTP",
    label: "MINTP (Entretien & Patrimoine Routier)",
    badgeColor: "#E8A33D",
    email: "entretien.routier@mintp.cm",
    gmailSecours: "mintp.travaux.urgence@gmail.com",
    telAstreinte: "+237 222 22 29 50 (Direction Entretien Routier)",
    contact: "entretien@mintp.cm",
    titreOfficier: "Chef de District des Travaux Publics"
  },
  {
    id: "Commune",
    label: "Commune / Mairie Territoriale",
    badgeColor: "#3FA772",
    email: "voirie@communes.cm",
    gmailSecours: "voirie.municipale.cm@gmail.com",
    telAstreinte: "+237 677 00 22 44 (Service Voirie Municipale)",
    contact: "voirie@communes.cm",
    titreOfficier: "Directeur des Services Techniques Municipaux"
  },
  {
    id: "Peage",
    label: "Gestionnaire des Postes de Péage (Fonds Routier)",
    badgeColor: "#875A7B",
    email: "peage@fondsroutier.cm",
    gmailSecours: "supervision.peages.cm@gmail.com",
    telAstreinte: "+237 690 44 88 12 (Cellule Régulation Péages)",
    contact: "peage@fondsroutier.cm",
    titreOfficier: "Superviseur National des Postes de Péage"
  },
];

/**
 * Composant d'administration et d'interaction des signalements citoyens
 */
export default function SignalementsCitoyensManager({
  signalements = [],
  onUpdateSignalements,
  onNotify,
  userRole = "admin",
  adminNom = "Patrick MBALLA",
}) {
  // Filtres et recherche
  const [search, setSearch] = useState("");
  const [selectedCategorie, setSelectedCategorie] = useState("ALL");
  const [selectedUrgence, setSelectedUrgence] = useState("ALL");
  const [selectedStatut, setSelectedStatut] = useState("ALL");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedAutorite, setSelectedAutorite] = useState("ALL");

  // Modales
  const [modalOpen, setModalOpen] = useState(false); // Création de signalement
  const [dossierDetails, setDossierDetails] = useState(null); // Modale de traitement détaillé
  const [modalDispatchRTC, setModalDispatchRTC] = useState(null); // Modale d'affectation RTC (Email + SMS)
  const [modalAccuseReception, setModalAccuseReception] = useState(null); // Modale d'AR par l'autorité
  const [viewFullDesc, setViewFullDesc] = useState(null); // Aperçu plein texte description

  // État du formulaire d'affectation RTC
  const [dispatchForm, setDispatchForm] = useState({
    autoriteChoisie: "Gendarmerie",
    emailDestinataire: "detresse113@sed.cm",
    gmailSecours: "gendarmerie.nationale.ops.cm@gmail.com",
    telSms: "+237 699 113 113",
    noteRtc: "Signalement prioritaire vérifié par la cellule d'écoute RTC. Intervention requise.",
    envoyerEmail: true,
    envoyerSms: true,
    notifCitoyenSms: true,
  });

  // État du formulaire d'AR par l'autorité
  const [arForm, setArForm] = useState({
    nomSignataire: "Adjudant-Chef ETONDE (Gendarmerie)",
    referenceUnite: "GN-PELOTON-2026-084",
    observationsAR: "Signalement bien reçu par radio et email. Patrouille mobile en route vers le lieu.",
    delaiEstimeMinutes: 20,
  });

  // Formulaire de nouveau signalement
  const [formSignalement, setFormSignalement] = useState({
    categorie: "VITESSE_COMPORTEMENT",
    type: "Excès de vitesse — Chauffeur d'agence de voyage",
    region: "Centre",
    ville: "Yaoundé",
    lieuPrecis: "Axe Yaoundé–Douala, PK 35 (Mbankomo)",
    latitude: "3.7820",
    longitude: "11.2785",
    description: "",
    urgence: "Urgent", // 'Normal' | 'Urgent' | 'Critique / Détresse'
    frequence: "Ponctuel", // 'Ponctuel' | 'Récurrent'
    detailsFrequence: "",
    canal: "Mobile PWA", // 'Mobile PWA' | 'Web' | 'USSD *1234#' | 'SMS 511' | 'Centre 113/117'
    acteurIncrimine: "Agence de voyage",
    nomAgence: "Général Express Voyages",
    plaqueImmatriculation: "LT 4580 HB",
    agentMatriculePoste: "",
    preuveFichier: "photo_radar_vitesse_118kmh.jpg",
    declarantNom: adminNom,
    declarantTel: "699001122",
    declarantEmail: "citoyen@rtc.cm",
    anonyme: false,
  });

  // Géolocalisation automatique
  const [geoLoading, setGeoLoading] = useState(false);
  const handleAutoGPS = () => {
    setGeoLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormSignalement((prev) => ({
            ...prev,
            latitude: pos.coords.latitude.toFixed(4),
            longitude: pos.coords.longitude.toFixed(4),
          }));
          setGeoLoading(false);
          onNotify?.("Position GPS capturée avec succès !", "success");
        },
        () => {
          setFormSignalement((prev) => ({
            ...prev,
            latitude: "3.8480",
            longitude: "11.5021",
          }));
          setGeoLoading(false);
          onNotify?.("Position GPS par défaut attribuée (Yaoundé Centre).", "info");
        },
        { timeout: 5000 }
      );
    } else {
      setGeoLoading(false);
      onNotify?.("Géolocalisation non supportée par votre navigateur.", "warning");
    }
  };

  // Synchronisation des sous-types lors du changement de catégorie
  const handleCategorieChange = (catId) => {
    const cat = CATEGORIES_SIGNALEMENTS.find((c) => c.id === catId);
    if (cat) {
      setFormSignalement((prev) => ({
        ...prev,
        categorie: catId,
        type: cat.types[0],
      }));
    }
  };

  // 1. Enregistrement d'un nouveau signalement par le citoyen -> Reçu par RTC
  const handleSaveSignalement = (e) => {
    e.preventDefault();
    if (!formSignalement.lieuPrecis.trim()) {
      onNotify?.("Veuillez renseigner le lieu précis de l'incident.", "warning");
      return;
    }

    const catObj = CATEGORIES_SIGNALEMENTS.find((c) => c.id === formSignalement.categorie) || CATEGORIES_SIGNALEMENTS[0];
    const autoriteCible = catObj.autoriteParDefaut;

    const newId = `SIG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nouveau = {
      id: newId,
      date: new Date().toISOString().slice(0, 10),
      heure: new Date().toTimeString().slice(0, 5),
      categorie: formSignalement.categorie,
      type: formSignalement.type,
      region: formSignalement.region,
      ville: formSignalement.ville,
      lieu: formSignalement.lieuPrecis,
      latitude: formSignalement.latitude,
      longitude: formSignalement.longitude,
      description: formSignalement.description || "Aucune description détaillée fournie.",
      urgence: formSignalement.urgence,
      frequence: formSignalement.frequence,
      detailsFrequence: formSignalement.detailsFrequence,
      canal: formSignalement.canal,
      acteurIncrimine: formSignalement.acteurIncrimine,
      nomAgence: formSignalement.nomAgence,
      plaque: formSignalement.plaqueImmatriculation,
      agentMatriculePoste: formSignalement.agentMatriculePoste,
      preuveFichier: formSignalement.preuveFichier,
      declarant: formSignalement.anonyme ? "Citoyen Anonyme" : formSignalement.declarantNom,
      declarantTel: formSignalement.anonyme ? "Masqué" : formSignalement.declarantTel,
      declarantEmail: formSignalement.anonyme ? "Masqué" : formSignalement.declarantEmail,
      anonyme: formSignalement.anonyme,
      statutTraitement: "Nouveau (Reçu RTC)",
      classification: "Incident",
      evenementId: `EVT-${Math.floor(5000 + Math.random() * 4000)}`,
      autoriteRecommandee: autoriteCible,
      autoriteAssignee: null, // Pas encore affecté
      affecteParRTC: null,
      dateAffectationRTC: null,
      emailNotifEnvoye: false,
      smsNotifEnvoye: false,
      accuseReceptionValide: false,
      dateAccuseReception: null,
      agentAccuseReception: null,
      transmisMINT: false,
      accuseReceptionMINT: false,
      transmisMINTP: false,
      accuseReceptionMINTP: false,
      transmisDGSN: false,
      accuseReceptionDGSN: false,
      transmisGendarmerie: false,
      accuseReceptionGendarmerie: false,
      transmisCommune: false,
      accuseReceptionCommune: false,
      rapportResolution: "",
      dateResolution: null,
      equipeIntervention: "",
    };

    const updated = [nouveau, ...signalements];
    onUpdateSignalements(updated);
    setModalOpen(false);
    onNotify?.(`Signalement ${newId} reçu par l'employé RTC — Prêt pour affectation à l'autorité.`, "success");
  };

  // 2. Ouverture de la modale de dispatch RTC (Affectation vers l'autorité avec Email + SMS)
  const handleOpenDispatchRTC = (sig) => {
    const defaultAuth = sig.autoriteAssignee || sig.autoriteRecommandee || "Gendarmerie";
    const authObj = AUTORITES_COMPETENTES.find((a) => a.id === defaultAuth) || AUTORITES_COMPETENTES[0];
    
    setDispatchForm({
      autoriteChoisie: authObj.id,
      emailDestinataire: authObj.email,
      gmailSecours: authObj.gmailSecours,
      telSms: authObj.telAstreinte,
      noteRtc: `Signalement ${sig.id} (${sig.type}) à ${sig.lieu}. Envoyé par l'opérateur RTC (${adminNom}).`,
      envoyerEmail: true,
      envoyerSms: true,
      notifCitoyenSms: !sig.anonyme,
    });
    setModalDispatchRTC(sig);
  };

  // Changement d'autorité dans la modale de dispatch
  const handleSelectAutoriteDispatch = (authId) => {
    const authObj = AUTORITES_COMPETENTES.find((a) => a.id === authId);
    if (authObj) {
      setDispatchForm((prev) => ({
        ...prev,
        autoriteChoisie: authId,
        emailDestinataire: authObj.email,
        gmailSecours: authObj.gmailSecours,
        telSms: authObj.telAstreinte,
      }));
    }
  };

  // 3. Validation de l'Affectation par l'employé RTC et Envoi Email + SMS
  const handleConfirmerDispatchRTC = (e) => {
    e.preventDefault();
    if (!modalDispatchRTC) return;

    const sigId = modalDispatchRTC.id;
    const authChoisie = dispatchForm.autoriteChoisie;
    const nowIso = new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5);

    const updated = signalements.map((sig) => {
      if (sig.id === sigId) {
        return {
          ...sig,
          autoriteAssignee: authChoisie,
          affecteParRTC: adminNom,
          dateAffectationRTC: nowIso,
          emailNotifEnvoye: dispatchForm.envoyerEmail,
          emailDestinataireLogs: `${dispatchForm.emailDestinataire} / ${dispatchForm.gmailSecours}`,
          smsNotifEnvoye: dispatchForm.envoyerSms,
          smsDestinataireLogs: dispatchForm.telSms,
          noteRtcDispatch: dispatchForm.noteRtc,
          statutTraitement: "Transmis à l'autorité (En attente d'AR)",
          [`transmis${authChoisie}`]: true,
          [`accuseReception${authChoisie}`]: false, // Pas encore d'AR
        };
      }
      return sig;
    });

    onUpdateSignalements(updated);
    setModalDispatchRTC(null);
    onNotify?.(
      `Signalement ${sigId} affecté à ${authChoisie} ! Notifications envoyées par Email (${dispatchForm.emailDestinataire}) et SMS Texto (${dispatchForm.telSms}).`,
      "success"
    );
  };

  // 4. Ouverture de la modale d'Accusé de Réception (AR) par l'Autorité
  const handleOpenAccuseReception = (sig) => {
    const authKey = sig.autoriteAssignee || "Gendarmerie";
    const authObj = AUTORITES_COMPETENTES.find((a) => a.id === authKey) || AUTORITES_COMPETENTES[0];
    
    setArForm({
      nomSignataire: `Officier de Garde (${authObj.label.split("(")[0].trim()})`,
      referenceUnite: `${authKey.toUpperCase()}-OPS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      observationsAR: `Signalement bien reçu par l'unité de permanence. Ordre d'intervention transmis sur le terrain (${sig.lieu}).`,
      delaiEstimeMinutes: 15,
    });
    setModalAccuseReception(sig);
  };

  // 5. Validation de l'Accusé de Réception (AR)
  const handleValiderAccuseReception = (e) => {
    e.preventDefault();
    if (!modalAccuseReception) return;

    const sigId = modalAccuseReception.id;
    const authKey = modalAccuseReception.autoriteAssignee || "Gendarmerie";
    const nowIso = new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5);

    const updated = signalements.map((sig) => {
      if (sig.id === sigId) {
        return {
          ...sig,
          accuseReceptionValide: true,
          dateAccuseReception: nowIso,
          agentAccuseReception: arForm.nomSignataire,
          referenceUniteAR: arForm.referenceUnite,
          observationsAR: arForm.observationsAR,
          statutTraitement: "Pris en charge (AR validé)",
          [`accuseReception${authKey}`]: true,
        };
      }
      return sig;
    });

    onUpdateSignalements(updated);
    setModalAccuseReception(null);
    onNotify?.(`Accusé de Réception validé pour ${sigId} par ${arForm.nomSignataire} (Ref: ${arForm.referenceUnite}) !`, "success");
  };

  // Progression de statut de traitement
  const handleAvancerStatut = (id) => {
    const statutsCycle = [
      "Nouveau (Reçu RTC)",
      "Transmis à l'autorité (En attente d'AR)",
      "Pris en charge (AR validé)",
      "En intervention",
      "Résolu",
      "Clôturé"
    ];
    const updated = signalements.map((sig) => {
      if (sig.id === id) {
        const currentIdx = statutsCycle.indexOf(sig.statutTraitement || "Nouveau (Reçu RTC)");
        const nextIdx = (currentIdx + 1) % statutsCycle.length;
        const nextStatut = statutsCycle[nextIdx];
        const isResol = nextStatut === "Résolu" || nextStatut === "Clôturé";
        return {
          ...sig,
          statutTraitement: nextStatut,
          dateResolution: isResol ? new Date().toISOString().slice(0, 10) : sig.dateResolution,
        };
      }
      return sig;
    });
    onUpdateSignalements(updated);
    onNotify?.("Statut du signalement mis à jour.", "info");
  };

  // Cycle de classification
  const handleCycleClassification = (id) => {
    const classes = ["Incident", "Accident", "Abus avéré", "Fausse alerte", "Doublon", "Non classé"];
    const updated = signalements.map((sig) => {
      if (sig.id === id) {
        const currentIdx = classes.indexOf(sig.classification || "Non classé");
        const nextIdx = (currentIdx + 1) % classes.length;
        return { ...sig, classification: classes[nextIdx] };
      }
      return sig;
    });
    onUpdateSignalements(updated);
    onNotify?.("Classification mise à jour.", "info");
  };

  // Suppression
  const handleDeleteSignalement = (id) => {
    if (window.confirm(`Confirmez-vous la suppression du signalement ${id} ?`)) {
      const updated = signalements.filter((s) => s.id !== id);
      onUpdateSignalements(updated);
      onNotify?.(`Signalement ${id} supprimé.`, "warning");
    }
  };

  // Enregistrement d'un rapport de résolution dans la modale détaillée
  const handleSaveResolutionDossier = (id, rapport, equipe) => {
    const updated = signalements.map((sig) => {
      if (sig.id === id) {
        return {
          ...sig,
          rapportResolution: rapport,
          equipeIntervention: equipe,
          statutTraitement: "Résolu",
          dateResolution: new Date().toISOString().slice(0, 10),
        };
      }
      return sig;
    });
    onUpdateSignalements(updated);
    setDossierDetails(null);
    onNotify?.(`Dossier ${id} clôturé avec rapport d'intervention.`, "success");
  };

  // Filtrage des signalements
  const filteredSignalements = useMemo(() => {
    return signalements.filter((sig) => {
      const matchSearch =
        !search.trim() ||
        [
          sig.id,
          sig.type,
          sig.lieu,
          sig.ville,
          sig.region,
          sig.description,
          sig.nomAgence,
          sig.plaque,
          sig.declarant,
          sig.autoriteAssignee,
        ].some((v) => (v || "").toLowerCase().includes(search.toLowerCase()));

      const matchCat = selectedCategorie === "ALL" || sig.categorie === selectedCategorie;
      const matchUrg = selectedUrgence === "ALL" || sig.urgence === selectedUrgence;
      const matchStat = selectedStatut === "ALL" || (sig.statutTraitement || "").includes(selectedStatut);
      const matchReg = selectedRegion === "ALL" || sig.region === selectedRegion;
      const matchAut = selectedAutorite === "ALL" || sig.autoriteAssignee === selectedAutorite;

      return matchSearch && matchCat && matchUrg && matchStat && matchReg && matchAut;
    });
  }, [signalements, search, selectedCategorie, selectedUrgence, selectedStatut, selectedRegion, selectedAutorite]);

  // Statistiques KPIs
  const stats = useMemo(() => {
    const total = signalements.length;
    const aAffecterRTC = signalements.filter((s) => !s.autoriteAssignee || (s.statutTraitement || "").includes("Nouveau")).length;
    const enAttenteAR = signalements.filter((s) => s.autoriteAssignee && !s.accuseReceptionValide && (s.statutTraitement || "").includes("Transmis")).length;
    const resolus = signalements.filter((s) => s.statutTraitement === "Résolu" || s.statutTraitement === "Clôturé").length;
    const tauxResolution = total > 0 ? Math.round((resolus / total) * 100) : 0;

    return { total, aAffecterRTC, enAttenteAR, resolus, tauxResolution };
  }, [signalements]);

  // Export Excel
  const handleExportExcel = () => {
    const dataToExport = filteredSignalements.map((s) => ({
      "Référence Ticket": s.id,
      "Date": s.date,
      "Heure": s.heure || "—",
      "Catégorie": s.categorie || "—",
      "Type d'incident": s.type,
      "Région": s.region || "—",
      "Ville": s.ville || "—",
      "Lieu précis": s.lieu,
      "Position GPS": `${s.latitude || ""}, ${s.longitude || ""}`,
      "Urgence": s.urgence || "Normal",
      "Description Complète": s.description || "",
      "Acteur Incriminé": s.nomAgence || s.plaque || s.agentMatriculePoste || "—",
      "Affecté par RTC": s.affecteParRTC || "En attente",
      "Autorité Assignée": s.autoriteAssignee || "Non affecté",
      "Accusé Réception (AR)": s.accuseReceptionValide ? `OUI (${s.agentAccuseReception || ""})` : "En attente AR",
      "Statut de Traitement": s.statutTraitement || "Nouveau",
      "Classification": s.classification || "Incident",
      "Date Résolution": s.dateResolution || "En cours",
      "Déclarant": s.declarant || "Anonyme",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Signalements_SYNSR");
    XLSX.writeFile(wb, `SYNSR_Signalements_Citoyens_${new Date().toISOString().slice(0, 10)}.xlsx`);
    onNotify?.("Fichier Excel des signalements exporté !", "success");
  };

  return (
    <div className="space-y-6">
      {/* =======================================================================
          1. BANNIÈRE INSTITUTIONNELLE & WORKFLOW RTC TRANSMISSION & AR
         ======================================================================= */}
      <div className="bg-gradient-to-r from-[#1B2936] via-[#13212D] to-[#1E1F29] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#714B67] text-white border border-purple-400/30">
                RÉPUBLIQUE DU CAMEROUN • MINT • MINTP • DGSN • GENDARMERIE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                WORKFLOW CITOYEN ➔ RTC ➔ AUTORITÉS (EMAIL + SMS + AR)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
              Signalements Citoyens & Dispatch Opérationnel RTC
            </h1>
            <p className="text-xs text-[#8FA8B0] max-w-3xl mt-1 leading-relaxed">
              Circuit sécurisé : Réception des alertes par l'employé RTC ➔ Affectation avec notification immédiate par Email (Gmail / Pro) & SMS Texto vers l'autorité désignée (Gendarmerie 113, Police 117, MINT, MINTP, Commune) ➔ Émission de l'Accusé de Réception (AR) officiel.
            </p>
          </div>

          {/* Numéros Verts & Actions Rapides */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 113 Gendarmerie */}
            <a
              href={`tel:${NUMEROS_URGENCE_CAMEROUN.GENDARMERIE_DETRESSE}`}
              title="Appeler la Gendarmerie Nationale (Détresse)"
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/40 border border-red-400/40 transition-all active:scale-95 animate-pulse"
            >
              <PhoneCall size={14} />
              <div className="text-left">
                <div className="text-[9px] uppercase tracking-wider font-mono opacity-80">Gendarmerie</div>
                <div className="text-sm font-black font-mono leading-none">113</div>
              </div>
            </a>

            {/* 117 Police Secours */}
            <a
              href={`tel:${NUMEROS_URGENCE_CAMEROUN.POLICE_SECOURS}`}
              title="Appeler Police Secours (DGSN)"
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-950/40 border border-blue-400/40 transition-all active:scale-95"
            >
              <Shield size={14} />
              <div className="text-left">
                <div className="text-[9px] uppercase tracking-wider font-mono opacity-80">Police Secours</div>
                <div className="text-sm font-black font-mono leading-none">117</div>
              </div>
            </a>

            {/* Bouton Nouveau Signalement Citoyen */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#714B67] hover:bg-[#875A7B] text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 border border-purple-400/30"
            >
              <Plus size={16} />
              <span>Nouveau Signalement</span>
            </button>
          </div>
        </div>
      </div>

      {/* =======================================================================
          2. CARTES KPIS STATISTIQUES DU WORKFLOW RTC & AUTORITÉS
         ======================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Total Reçus */}
        <div className="bg-[#13212D] border border-white/10 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-mono text-[#8FA8B0] font-semibold">Total Signalements</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
          <div className="text-[11px] text-[#8FA8B0] mt-1 flex items-center gap-1.5">
            <span className="text-teal-400 font-semibold">PWA • Web • USSD *1234# • 511</span>
          </div>
        </div>

        {/* KPI 2 : À Affecter par Employé RTC */}
        <div className="bg-[#13212D] border border-white/10 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-mono text-[#8FA8B0] font-semibold">À Affecter par RTC</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Inbox size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">{stats.aAffecterRTC}</div>
          <div className="text-[11px] text-[#8FA8B0] mt-1">
            {stats.aAffecterRTC > 0 ? "⚠️ En attente de transmission aux autorités" : "Tous les signalements sont affectés"}
          </div>
        </div>

        {/* KPI 3 : Transmis en Attente d'Accusé de Réception (AR) */}
        <div className="bg-[#13212D] border border-white/10 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-mono text-[#8FA8B0] font-semibold">En Attente d'AR Autorité</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-300 font-mono">{stats.enAttenteAR}</div>
          <div className="text-[11px] text-[#8FA8B0] mt-1">
            Email & SMS envoyés (attente validation AR)
          </div>
        </div>

        {/* KPI 4 : Taux de Résolution */}
        <div className="bg-[#13212D] border border-white/10 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-mono text-[#8FA8B0] font-semibold">Taux de Résolution</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{stats.tauxResolution}%</div>
          <div className="text-[11px] text-[#8FA8B0] mt-1">
            {stats.resolus} dossiers résolus et clôturés
          </div>
        </div>
      </div>

      {/* =======================================================================
          3. BARRE DE FILTRES MULTICRITÈRES & RECHERCHE AVANCÉE
         ======================================================================= */}
      <div className="bg-[#13212D] border border-white/10 p-4 rounded-xl shadow space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA8B0]" />
            <input
              type="text"
              placeholder="Rechercher par lieu, référence, description, agence, plaque…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1A2C3C] text-xs text-white pl-9 pr-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#00A09D] transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Boutons d'Export et Actualisation */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
              title="Exporter vers Excel"
            >
              <Download size={13} className="text-emerald-400" />
              <span>Export Excel</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onNotify?.("Données des signalements actualisées.", "info");
              }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white"
              title="Actualiser"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Filtres par Catégorie, Urgence, Région et Autorité */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-2 border-t border-white/5 text-xs">
          {/* Catégorie */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-[#8FA8B0] mb-1">Catégorie :</label>
            <select
              value={selectedCategorie}
              onChange={(e) => setSelectedCategorie(e.target.value)}
              className="w-full bg-[#1A2C3C] text-xs text-white p-1.5 rounded-lg border border-white/10 focus:outline-none"
            >
              <option value="ALL">Toutes les catégories</option>
              {CATEGORIES_SIGNALEMENTS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Urgence */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-[#8FA8B0] mb-1">Urgence :</label>
            <select
              value={selectedUrgence}
              onChange={(e) => setSelectedUrgence(e.target.value)}
              className="w-full bg-[#1A2C3C] text-xs text-white p-1.5 rounded-lg border border-white/10 focus:outline-none"
            >
              <option value="ALL">Tous niveaux d'urgence</option>
              <option value="Critique / Détresse">🚨 Critique / Détresse (113/117)</option>
              <option value="Urgent">⚠️ Urgent</option>
              <option value="Normal">🟢 Normal</option>
            </select>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-[#8FA8B0] mb-1">Statut :</label>
            <select
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
              className="w-full bg-[#1A2C3C] text-xs text-white p-1.5 rounded-lg border border-white/10 focus:outline-none"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="Nouveau">Nouveau (Reçu RTC)</option>
              <option value="Transmis">Transmis à l'autorité</option>
              <option value="Pris en charge">Pris en charge (AR validé)</option>
              <option value="En intervention">En intervention</option>
              <option value="Résolu">Résolu / Clôturé</option>
            </select>
          </div>

          {/* Région */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-[#8FA8B0] mb-1">Région (10 Régions) :</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-[#1A2C3C] text-xs text-white p-1.5 rounded-lg border border-white/10 focus:outline-none"
            >
              <option value="ALL">Toutes les 10 régions</option>
              {REGIONS_CAMEROUN.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Autorité */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-[#8FA8B0] mb-1">Autorité assignée :</label>
            <select
              value={selectedAutorite}
              onChange={(e) => setSelectedAutorite(e.target.value)}
              className="w-full bg-[#1A2C3C] text-xs text-white p-1.5 rounded-lg border border-white/10 focus:outline-none"
            >
              <option value="ALL">Toutes les autorités</option>
              {AUTORITES_COMPETENTES.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* =======================================================================
          4. TABLEAU DES SIGNALEMENTS AVEC COLONNE DESCRIPTION & ACTIONS
         ======================================================================= */}
      <div className="bg-[#13212D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#EAF2F4]">
            <thead className="bg-[#1E1F29] text-[11px] uppercase tracking-wider text-[#8FA8B0] font-mono border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Réf Ticket / Date</th>
                <th className="py-3 px-4">Type & Catégorie</th>
                <th className="py-3 px-4">Lieu & Région</th>
                <th className="py-3 px-4 min-w-[240px] max-w-[320px]">Description</th>
                <th className="py-3 px-4">Affectation RTC & Autorité</th>
                <th className="py-3 px-4 text-center">Accusé Réception (AR)</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSignalements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <AlertTriangle size={24} className="mx-auto mb-2 text-amber-400 opacity-60" />
                    <p className="font-semibold">Aucun signalement ne correspond à vos filtres.</p>
                    <p className="text-[11px] text-gray-500 mt-1">Créez un nouveau signalement ou réinitialisez les filtres.</p>
                  </td>
                </tr>
              ) : (
                filteredSignalements.map((sig) => {
                  const isCritique = sig.urgence === "Critique / Détresse" || sig.urgence === "Critique";
                  const isUrgent = sig.urgence === "Urgent";
                  const isResol = sig.statutTraitement === "Résolu" || sig.statutTraitement === "Clôturé";
                  const hasAutorite = Boolean(sig.autoriteAssignee);
                  const isARValide = Boolean(sig.accuseReceptionValide);

                  return (
                    <tr key={sig.id} className={`hover:bg-white/5 transition-colors ${isCritique ? "bg-red-500/5" : ""}`}>
                      {/* 1. Réf Ticket & Date */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-mono font-bold text-amber-300 flex items-center gap-1.5">
                          <span>{sig.id}</span>
                          {sig.canal && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-white/10 text-gray-300 font-normal">
                              {sig.canal}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#8FA8B0] mt-0.5 font-mono">
                          {sig.date} {sig.heure ? `${sig.heure}` : ""}
                        </div>
                        <div className="mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-1 ${
                              isCritique
                                ? "bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse"
                                : isUrgent
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-teal-500/10 text-teal-300 border border-teal-500/20"
                            }`}
                          >
                            {isCritique && <Siren size={9} />}
                            <span>{sig.urgence || "Normal"}</span>
                          </span>
                        </div>
                      </td>

                      {/* 2. Type & Catégorie */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-bold text-white leading-snug">{sig.type}</div>
                        <div className="text-[10px] text-teal-400 flex items-center gap-1 mt-1">
                          <span>{sig.classification || "Incident"}</span>
                          {sig.evenementId && <span className="font-mono text-gray-400">({sig.evenementId})</span>}
                        </div>
                        {sig.nomAgence && (
                          <div className="text-[11px] text-purple-300 font-medium mt-1 flex items-center gap-1">
                            <Car size={11} className="shrink-0" />
                            <span>{sig.nomAgence}</span>
                          </div>
                        )}
                        {sig.plaque && (
                          <div className="text-[10px] font-mono text-gray-400">
                            Plaque : <strong className="text-white">{sig.plaque}</strong>
                          </div>
                        )}
                      </td>

                      {/* 3. Lieu & Région */}
                      <td className="py-3 px-4 align-top">
                        <div className="text-gray-200 font-medium flex items-start gap-1">
                          <MapPin size={11} className="text-red-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{sig.lieu}</span>
                        </div>
                        <div className="text-[10px] text-[#8FA8B0] font-mono mt-1">
                          {sig.region || "Centre"} • {sig.ville || "Yaoundé"}
                        </div>
                      </td>

                      {/* 4. COLONNE DESCRIPTION DÉTAILLÉE */}
                      <td className="py-3 px-4 align-top min-w-[240px] max-w-[320px]">
                        <div
                          onClick={() => setViewFullDesc(sig)}
                          className="text-[#D7E4E7] text-xs leading-relaxed line-clamp-3 bg-black/20 p-2 rounded-lg border border-white/5 hover:border-teal-400/40 cursor-pointer transition-all"
                          title="Cliquer pour voir la description complète"
                        >
                          {sig.description || "Aucune description détaillée."}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1 flex items-center justify-between">
                          <span>Déclarant : <strong className="text-gray-300">{sig.declarant || "Anonyme"}</strong></span>
                          <button
                            type="button"
                            onClick={() => setViewFullDesc(sig)}
                            className="text-teal-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>Lire</span> <ArrowUpRight size={10} />
                          </button>
                        </div>
                      </td>

                      {/* 5. Affectation RTC & Autorité */}
                      <td className="py-3 px-4 align-top">
                        {hasAutorite ? (
                          <div className="space-y-1">
                            <div className="font-bold text-white flex items-center gap-1">
                              <Shield size={12} className="text-teal-300 shrink-0" />
                              <span>{sig.autoriteAssignee}</span>
                            </div>
                            <div className="text-[10px] text-[#8FA8B0] font-mono">
                              Affecté par : <strong className="text-gray-200">{sig.affecteParRTC || "RTC"}</strong>
                            </div>
                            {/* Badges Email & SMS */}
                            <div className="flex items-center gap-1 mt-1">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                                <Mail size={9} /> <span>Email OK</span>
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <Smartphone size={9} /> <span>SMS OK</span>
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block">
                              Reçu RTC (Non affecté)
                            </span>
                            <div>
                              <button
                                type="button"
                                onClick={() => handleOpenDispatchRTC(sig)}
                                className="px-2.5 py-1 bg-[#714B67] hover:bg-[#875A7B] text-white rounded text-[10px] font-bold flex items-center gap-1 shadow transition-all active:scale-95"
                              >
                                <Send size={10} /> Affecter Autorité
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 6. Accusé de Réception (AR) */}
                      <td className="py-3 px-4 text-center align-top">
                        {isARValide ? (
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
                              <CheckCheck size={11} />
                              <span>✓AR {sig.autoriteAssignee}</span>
                            </span>
                            <div className="text-[9px] text-[#8FA8B0] font-mono">
                              {sig.dateAccuseReception || "Validé"}
                            </div>
                            <div className="text-[9px] text-gray-400 truncate max-w-[130px]" title={sig.agentAccuseReception}>
                              {sig.agentAccuseReception}
                            </div>
                          </div>
                        ) : hasAutorite ? (
                          <div className="space-y-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-block">
                              ⏳ Attente AR
                            </span>
                            <div>
                              <button
                                type="button"
                                onClick={() => handleOpenAccuseReception(sig)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1 mx-auto transition-all active:scale-95"
                                title="Émettre l'Accusé de Réception (AR) pour l'autorité"
                              >
                                <Check size={10} /> Valider AR
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-[10px]">—</span>
                        )}
                      </td>

                      {/* 7. Statut */}
                      <td className="py-3 px-4 text-center align-top">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                            isResol
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : sig.statutTraitement === "En intervention"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : sig.statutTraitement?.includes("Pris en charge")
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {sig.statutTraitement || "Nouveau"}
                        </span>
                      </td>

                      {/* 8. Actions */}
                      <td className="py-3 px-4 text-center align-top">
                        <div className="flex flex-col gap-1.5 items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setDossierDetails(sig)}
                            className="w-full px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-semibold flex items-center justify-center gap-1 transition-all"
                            title="Ouvrir le dossier complet"
                          >
                            <Eye size={11} /> Dossier
                          </button>

                          {hasAutorite && (
                            <button
                              type="button"
                              onClick={() => handleOpenDispatchRTC(sig)}
                              className="w-full px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-200 rounded text-[10px] font-semibold flex items-center justify-center gap-1 transition-all"
                              title="Réaffecter ou renvoyer Email / SMS"
                            >
                              <Send size={10} /> Réaffecter
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleAvancerStatut(sig.id)}
                            className="w-full px-2 py-1 bg-[#00A09D]/20 hover:bg-[#00A09D]/40 text-teal-200 rounded text-[10px] font-semibold transition-all"
                            title="Avancer le statut"
                          >
                            Statut ➔
                          </button>

                          {userRole === "admin" && (
                            <button
                              type="button"
                              onClick={() => handleDeleteSignalement(sig.id)}
                              className="p-1 hover:text-red-400 text-gray-500 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =======================================================================
          5. MODALE D'AFFECTATION PAR L'EMPLOYÉ RTC (DISPATCH EMAIL + TEXTO SMS)
         ======================================================================= */}
      {modalDispatchRTC && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 bg-[#714B67] border-b border-[#5B3A52] flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <Send size={18} className="text-teal-300" />
                <div>
                  <h3 className="font-bold text-base tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Affectation & Dispatch RTC — Signalement <span className="font-mono text-amber-300">{modalDispatchRTC.id}</span>
                  </h3>
                  <p className="text-[11px] text-white/80">Transmission avec notifications directes par Email (Gmail / Pro) et Texto (SMS)</p>
                </div>
              </div>
              <button onClick={() => setModalDispatchRTC(null)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmerDispatchRTC} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto text-[#EAF2F4]">
              {/* Récapitulatif de l'incident */}
              <div className="p-3.5 bg-black/30 rounded-xl border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{modalDispatchRTC.type}</span>
                  <span className="font-mono text-amber-300 text-[11px]">{modalDispatchRTC.date} à {modalDispatchRTC.heure}</span>
                </div>
                <div className="text-[11px] text-teal-300 flex items-center gap-1">
                  <MapPin size={11} className="shrink-0" />
                  <span>{modalDispatchRTC.lieu} ({modalDispatchRTC.region})</span>
                </div>
                <div className="text-gray-300 text-xs italic bg-white/5 p-2 rounded border border-white/5 mt-1">
                  "{modalDispatchRTC.description}"
                </div>
              </div>

              {/* Sélection de l'Autorité Compétente */}
              <div>
                <label className="block text-[#8FA8B0] font-semibold mb-1.5">
                  1. Sélectionner l'Autorité Compétente Destinataire * :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AUTORITES_COMPETENTES.map((auth) => {
                    const isSelected = dispatchForm.autoriteChoisie === auth.id;
                    return (
                      <div
                        key={auth.id}
                        onClick={() => handleSelectAutoriteDispatch(auth.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 ${
                          isSelected
                            ? "bg-[#714B67]/30 border-[#714B67] text-white shadow-lg"
                            : "bg-[#1A2C3C] border-white/10 text-gray-300 hover:border-white/30"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">{auth.label}</div>
                          <div className="text-[10px] text-[#8FA8B0] font-mono mt-0.5">{auth.email}</div>
                          <div className="text-[10px] text-teal-400 font-mono mt-0.5">{auth.telAstreinte}</div>
                        </div>
                        {isSelected && <CheckCircle2 size={16} className="text-teal-300 shrink-0 mt-0.5" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Paramètres d'Envoi Notifications Email + SMS */}
              <div className="p-4 bg-[#1A2C3C] rounded-xl border border-white/10 space-y-3">
                <div className="font-bold text-white flex items-center gap-2">
                  <Mail size={14} className="text-teal-400" />
                  <span>2. Canaux de Notification d'Urgence :</span>
                </div>

                {/* Email Officiel & Gmail Secours */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-white">
                    <input
                      type="checkbox"
                      checked={dispatchForm.envoyerEmail}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, envoyerEmail: e.target.checked })}
                      className="w-4 h-4 rounded text-[#00A09D]"
                    />
                    <span>Envoyer notification par Email professionnel & Gmail secours</span>
                  </label>
                  {dispatchForm.envoyerEmail && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                      <div>
                        <span className="text-[10px] text-gray-400 block mb-0.5">Email Officiel Institutionnel :</span>
                        <input
                          type="email"
                          value={dispatchForm.emailDestinataire}
                          onChange={(e) => setDispatchForm({ ...dispatchForm, emailDestinataire: e.target.value })}
                          className="w-full bg-[#13212D] text-xs text-white p-2 rounded-lg border border-white/10 font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block mb-0.5">Gmail / Adresse de Secours :</span>
                        <input
                          type="email"
                          value={dispatchForm.gmailSecours}
                          onChange={(e) => setDispatchForm({ ...dispatchForm, gmailSecours: e.target.value })}
                          className="w-full bg-[#13212D] text-xs text-white p-2 rounded-lg border border-white/10 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Texto SMS */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-white">
                    <input
                      type="checkbox"
                      checked={dispatchForm.envoyerSms}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, envoyerSms: e.target.checked })}
                      className="w-4 h-4 rounded text-[#00A09D]"
                    />
                    <span>Envoyer notification par Texto (SMS) sur la ligne d'astreinte de l'unité</span>
                  </label>
                  {dispatchForm.envoyerSms && (
                    <div className="pl-6">
                      <span className="text-[10px] text-gray-400 block mb-0.5">Numéro SMS / Ligne d'astreinte :</span>
                      <input
                        type="text"
                        value={dispatchForm.telSms}
                        onChange={(e) => setDispatchForm({ ...dispatchForm, telSms: e.target.value })}
                        className="w-full bg-[#13212D] text-xs text-white p-2 rounded-lg border border-white/10 font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* Note interne de l'employé RTC */}
                <div className="pt-2 border-t border-white/5">
                  <label className="block text-gray-400 mb-1">Instructions de l'employé RTC ({adminNom}) :</label>
                  <textarea
                    rows={2}
                    value={dispatchForm.noteRtc}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, noteRtc: e.target.value })}
                    className="w-full bg-[#13212D] text-xs text-white p-2 rounded-lg border border-white/10 resize-none"
                  />
                </div>
              </div>

              {/* Boutons d'Action */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalDispatchRTC(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#714B67] hover:bg-[#875A7B] text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
                >
                  <Send size={15} />
                  <span>Transmettre & Expédier Email + SMS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          6. MODALE D'ÉMISSION D'ACCUSÉ DE RÉCEPTION (AR) PAR L'AUTORITÉ
         ======================================================================= */}
      {modalAccuseReception && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 bg-emerald-700 border-b border-emerald-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <CheckCheck size={20} className="text-white" />
                <div>
                  <h3 className="font-bold text-base tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Émettre l'Accusé de Réception (AR) — <span className="font-mono text-amber-200">{modalAccuseReception.id}</span>
                  </h3>
                  <p className="text-[11px] text-white/80">Confirmation officielle de réception par l'autorité désignée</p>
                </div>
              </div>
              <button onClick={() => setModalAccuseReception(null)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleValiderAccuseReception} className="p-6 space-y-4 text-xs text-[#EAF2F4]">
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-200">
                L'autorité <strong>{modalAccuseReception.autoriteAssignee}</strong> confirme avoir reçu le signalement transmis par l'employé RTC <strong>{modalAccuseReception.affecteParRTC || adminNom}</strong> par Email et SMS.
              </div>

              <div>
                <label className="block text-[#8FA8B0] font-semibold mb-1">Nom / Grade de l'Officier ou Agent Signataire * :</label>
                <input
                  type="text"
                  required
                  value={arForm.nomSignataire}
                  onChange={(e) => setArForm({ ...arForm, nomSignataire: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                />
              </div>

              <div>
                <label className="block text-[#8FA8B0] font-semibold mb-1">Référence du Registre de l'Unité * :</label>
                <input
                  type="text"
                  required
                  value={arForm.referenceUnite}
                  onChange={(e) => setArForm({ ...arForm, referenceUnite: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10 font-mono"
                />
              </div>

              <div>
                <label className="block text-[#8FA8B0] font-semibold mb-1">Observations / Mesures Immédiates :</label>
                <textarea
                  rows={2}
                  value={arForm.observationsAR}
                  onChange={(e) => setArForm({ ...arForm, observationsAR: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAccuseReception(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
                >
                  <CheckCheck size={16} />
                  <span>Valider l'Accusé de Réception (AR)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          7. MODALE PLEIN TEXTE DESCRIPTION
         ======================================================================= */}
      {viewFullDesc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="font-bold text-white text-sm">
                Description Complète — <span className="font-mono text-amber-300">{viewFullDesc.id}</span>
              </div>
              <button onClick={() => setViewFullDesc(null)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                <X size={16} />
              </button>
            </div>
            <div className="text-xs text-gray-300 leading-relaxed max-h-60 overflow-y-auto p-3 bg-black/30 rounded-xl border border-white/5 whitespace-pre-wrap">
              {viewFullDesc.description}
            </div>
            <div className="text-[11px] text-teal-400 font-mono flex items-center justify-between">
              <span>Lieu : {viewFullDesc.lieu}</span>
              <span>Déclarant : {viewFullDesc.declarant}</span>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewFullDesc(null)}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          8. MODALE DE CRÉATION DE SIGNALEMENT CITOYEN (5 VOLETS)
         ======================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            {/* Header Modale */}
            <div className="px-6 py-4 bg-[#714B67] border-b border-[#5B3A52] flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <Siren size={20} className="text-teal-300" />
                <div>
                  <h3 className="font-bold text-base tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Nouveau Signalement Citoyen & Sécurité Routière
                  </h3>
                  <p className="text-[11px] text-white/80">Réceptionné par l'employé RTC pour affectation vers Gendarmerie (113), Police (117), MINT, MINTP</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <X size={18} />
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSaveSignalement} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Alerte Urgence 113 / 117 si Critique */}
              {formSignalement.urgence === "Critique / Détresse" && (
                <div className="p-3.5 bg-red-600/20 border border-red-500/40 rounded-xl flex items-start gap-3 animate-pulse">
                  <Siren size={18} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="text-red-200">
                    <strong className="block text-white font-bold mb-0.5">DÉTRESSE / DANGER IMMINENT EN COURS :</strong>
                    En cas d'agression armée ou d'accident grave nécessitant une intervention immédiate, appelez sans attendre le <a href="tel:113" className="underline font-mono font-bold text-white">113 (Gendarmerie)</a> ou le <a href="tel:117" className="underline font-mono font-bold text-white">117 (Police Secours)</a>.
                  </div>
                </div>
              )}

              {/* 1. Catégorie & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Catégorie Principale * :</label>
                  <select
                    value={formSignalement.categorie}
                    onChange={(e) => handleCategorieChange(e.target.value)}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10 focus:border-[#00A09D]"
                  >
                    {CATEGORIES_SIGNALEMENTS.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Type d'Incident Normalisé * :</label>
                  <select
                    value={formSignalement.type}
                    onChange={(e) => setFormSignalement({ ...formSignalement, type: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10 focus:border-[#00A09D]"
                  >
                    {(CATEGORIES_SIGNALEMENTS.find((c) => c.id === formSignalement.categorie)?.types || []).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Acteurs & Équipements incriminés si pertinent */}
              {(formSignalement.type.includes("Chauffeur") || formSignalement.type.includes("agence") || formSignalement.type.includes("vitesse")) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <label className="block text-[#8FA8B0] font-semibold mb-1">Agence de Transport Partenaire :</label>
                    <input
                      type="text"
                      placeholder="Ex: Général Express, Touristique Express, Buca..."
                      value={formSignalement.nomAgence}
                      onChange={(e) => setFormSignalement({ ...formSignalement, nomAgence: e.target.value })}
                      className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10 focus:border-[#00A09D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8FA8B0] font-semibold mb-1">Plaque d'Immatriculation / N° Bus :</label>
                    <input
                      type="text"
                      placeholder="Ex: LT 4580 HB ou Bus N° 12"
                      value={formSignalement.plaqueImmatriculation}
                      onChange={(e) => setFormSignalement({ ...formSignalement, plaqueImmatriculation: e.target.value })}
                      className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10 focus:border-[#00A09D]"
                    />
                  </div>
                </div>
              )}

              {formSignalement.categorie === "ABUS_AUTORITE" && (
                <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl">
                  <label className="block text-purple-300 font-semibold mb-1">Poste de Contrôle / Unité / Préposé concerné :</label>
                  <input
                    type="text"
                    placeholder="Ex: Poste de Péage de Mbankomo, Barrière de contrôle Edéa, Matricule 1204..."
                    value={formSignalement.agentMatriculePoste}
                    onChange={(e) => setFormSignalement({ ...formSignalement, agentMatriculePoste: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10 focus:border-[#00A09D]"
                  />
                </div>
              )}

              {/* 3. Localisation & GPS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Région :</label>
                  <select
                    value={formSignalement.region}
                    onChange={(e) => setFormSignalement({ ...formSignalement, region: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                  >
                    {REGIONS_CAMEROUN.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Ville / Commune :</label>
                  <input
                    type="text"
                    required
                    value={formSignalement.ville}
                    onChange={(e) => setFormSignalement({ ...formSignalement, ville: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Position GPS :</label>
                  <button
                    type="button"
                    onClick={handleAutoGPS}
                    disabled={geoLoading}
                    className="w-full bg-[#1A2C3C] hover:bg-white/10 text-teal-300 p-2 rounded-lg border border-white/10 font-mono text-[11px] flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Navigation size={12} className={geoLoading ? "animate-spin" : ""} />
                    <span>{formSignalement.latitude}, {formSignalement.longitude}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#8FA8B0] font-semibold mb-1">Lieu Précis & Point Kilométrique (PK) * :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Axe Yaoundé–Douala, PK 35 (Mbankomo) ou Rond-Point Déido..."
                  value={formSignalement.lieuPrecis}
                  onChange={(e) => setFormSignalement({ ...formSignalement, lieuPrecis: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10 focus:border-[#00A09D]"
                />
              </div>

              {/* 4. Description & Preuves Numériques */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#8FA8B0] font-semibold">Description Libre des Faits (max 1200 car.) * :</label>
                  <span className="text-[10px] text-gray-500 font-mono">{formSignalement.description.length} / 1200</span>
                </div>
                <textarea
                  rows={3}
                  required
                  maxLength={1200}
                  placeholder="Détaillez les circonstances, vitesse estimée, état de la chaussée, plaques, propos ou dommages constatés..."
                  value={formSignalement.description}
                  onChange={(e) => setFormSignalement({ ...formSignalement, description: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-xs text-white p-2.5 rounded-lg border border-white/10 focus:border-[#00A09D] resize-none"
                />
              </div>

              {/* Upload Preuve Numérique */}
              <div className="p-3 bg-[#1A2C3C] rounded-xl border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Camera size={18} className="text-teal-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Preuve Numérique (Photo / Vidéo / Audio)</div>
                    <div className="text-[10px] text-[#8FA8B0]">Fichier certifié : <strong className="text-teal-300 font-mono">{formSignalement.preuveFichier}</strong> (Max 30 Mo)</div>
                  </div>
                </div>
                <label className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer text-xs font-semibold">
                  <span>Changer</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFormSignalement({ ...formSignalement, preuveFichier: e.target.files[0].name });
                      }
                    }}
                  />
                </label>
              </div>

              {/* 5. Urgence, Canal et Déclarant */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Niveau d'Urgence * :</label>
                  <select
                    value={formSignalement.urgence}
                    onChange={(e) => setFormSignalement({ ...formSignalement, urgence: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                  >
                    <option value="Normal">🟢 Normal (Suivi standard)</option>
                    <option value="Urgent">⚠️ Urgent (Délai 24h)</option>
                    <option value="Critique / Détresse">🚨 Critique / Détresse (Immédiat 113/117)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Fréquence :</label>
                  <select
                    value={formSignalement.frequence}
                    onChange={(e) => setFormSignalement({ ...formSignalement, frequence: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                  >
                    <option value="Ponctuel">Ponctuel (Fait unique)</option>
                    <option value="Récurrent">Récurrent (Quotidien / Hebdo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Canal de Déclaration :</label>
                  <select
                    value={formSignalement.canal}
                    onChange={(e) => setFormSignalement({ ...formSignalement, canal: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                  >
                    <option value="Mobile PWA">Mobile PWA (GPS direct)</option>
                    <option value="Web">Portail Web</option>
                    <option value="USSD *1234#">USSD *1234# (Réseau faible)</option>
                    <option value="SMS 511">SMS Court 511</option>
                    <option value="Centre 113/117">Centre d'écoute</option>
                  </select>
                </div>
              </div>

              {/* Déclarant & Confidentialité */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formSignalement.anonyme}
                    onChange={(e) => setFormSignalement({ ...formSignalement, anonyme: e.target.checked })}
                    className="w-4 h-4 rounded text-[#00A09D] focus:ring-0"
                  />
                  <span className="text-white font-semibold">Signaler de façon 100% Anonyme (protection du citoyen)</span>
                </label>
              </div>

              {!formSignalement.anonyme && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#8FA8B0] mb-1">Nom du Déclarant :</label>
                    <input
                      type="text"
                      value={formSignalement.declarantNom}
                      onChange={(e) => setFormSignalement({ ...formSignalement, declarantNom: e.target.value })}
                      className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8FA8B0] mb-1">Téléphone de Suivi :</label>
                    <input
                      type="text"
                      value={formSignalement.declarantTel}
                      onChange={(e) => setFormSignalement({ ...formSignalement, declarantTel: e.target.value })}
                      className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                    />
                  </div>
                </div>
              )}

              {/* Boutons d'Action Modale */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#714B67] hover:bg-[#875A7B] text-white rounded-xl font-bold flex items-center gap-1.5 shadow"
                >
                  <CheckCircle2 size={15} />
                  <span>Enregistrer (Transmettre au Superviseur RTC)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          9. MODALE DÉTAILLÉE DE TRAITEMENT DE DOSSIER (ESPACE AUTORITÉS)
         ======================================================================= */}
      {dossierDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 bg-[#1E1F29] border-b border-white/10 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <FileText size={18} className="text-teal-400" />
                <div>
                  <h3 className="font-bold text-base tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Dossier d'Intervention — Réf : <span className="font-mono text-amber-300">{dossierDetails.id}</span>
                  </h3>
                  <p className="text-[11px] text-[#8FA8B0]">
                    Événement : {dossierDetails.evenementId || "Non assigné"} • Autorité : {dossierDetails.autoriteAssignee || "En attente"}
                  </p>
                </div>
              </div>
              <button onClick={() => setDossierDetails(null)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto text-[#EAF2F4]">
              {/* Statuts & Accusés de Réception */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-[#1A2C3C] rounded-xl border border-white/10">
                <div>
                  <span className="text-[10px] text-[#8FA8B0] uppercase block">Urgence</span>
                  <span className="font-bold text-red-300">{dossierDetails.urgence}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8FA8B0] uppercase block">Statut Actuel</span>
                  <span className="font-bold text-teal-300">{dossierDetails.statutTraitement}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8FA8B0] uppercase block">Date & Canal</span>
                  <span className="font-mono">{dossierDetails.date} ({dossierDetails.canal || "Web"})</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8FA8B0] uppercase block">Déclarant</span>
                  <span className="truncate block">{dossierDetails.declarant}</span>
                </div>
              </div>

              {/* Traçabilité Dispatch RTC & Notifications */}
              <div className="p-3.5 bg-black/30 rounded-xl border border-white/10 space-y-2">
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Send size={13} className="text-teal-400" />
                  <span>Circuit de Transmission & Dispatch RTC :</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-400">Affecté par :</span>{" "}
                    <strong className="text-white">{dossierDetails.affecteParRTC || "En attente"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">Date d'affectation :</span>{" "}
                    <span className="font-mono text-gray-300">{dossierDetails.dateAffectationRTC || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email envoyé :</span>{" "}
                    <span className="text-blue-300 font-mono">{dossierDetails.emailDestinataireLogs || (dossierDetails.emailNotifEnvoye ? "Oui" : "Non")}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">SMS Texto envoyé :</span>{" "}
                    <span className="text-emerald-300 font-mono">{dossierDetails.smsDestinataireLogs || (dossierDetails.smsNotifEnvoye ? "Oui" : "Non")}</span>
                  </div>
                </div>

                {/* Statut Accusé de Réception */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-gray-400 text-[11px]">Accusé de Réception (AR) :</span>{" "}
                    {dossierDetails.accuseReceptionValide ? (
                      <strong className="text-emerald-300 font-bold">
                        ✓ Validé par {dossierDetails.agentAccuseReception} ({dossierDetails.dateAccuseReception})
                      </strong>
                    ) : (
                      <span className="text-amber-400">⏳ En attente de validation AR par l'autorité</span>
                    )}
                  </div>
                  {!dossierDetails.accuseReceptionValide && dossierDetails.autoriteAssignee && (
                    <button
                      type="button"
                      onClick={() => handleOpenAccuseReception(dossierDetails)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                    >
                      <Check size={12} /> Émettre AR
                    </button>
                  )}
                </div>
              </div>

              {/* Description Détaillée */}
              <div className="space-y-1">
                <div className="font-bold text-white text-xs">Description des Faits :</div>
                <div className="text-[#8FA8B0] leading-relaxed p-3 bg-black/30 rounded-xl border border-white/5 whitespace-pre-wrap">
                  {dossierDetails.description || "Aucune description libre complémentaire fournie."}
                </div>
              </div>

              {/* Localisation & Preuve */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3 bg-[#1A2C3C] rounded-xl border border-white/10">
                  <div className="text-[11px] font-bold text-white mb-1 flex items-center gap-1">
                    <MapPin size={12} className="text-red-400" />
                    <span>Localisation & SIG :</span>
                  </div>
                  <div className="text-[#8FA8B0]">{dossierDetails.lieu}</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-1">
                    Région : {dossierDetails.region} • Ville : {dossierDetails.ville}
                  </div>
                  <div className="text-[10px] text-teal-400 font-mono mt-0.5">
                    Coordonnées : {dossierDetails.latitude}, {dossierDetails.longitude}
                  </div>
                </div>

                <div className="p-3 bg-[#1A2C3C] rounded-xl border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-white mb-1 flex items-center gap-1">
                      <Camera size={12} className="text-teal-400" />
                      <span>Preuve Numérique Jointe :</span>
                    </div>
                    <div className="text-teal-300 font-mono text-[11px]">{dossierDetails.preuveFichier || "Aucun média"}</div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNotify?.("Aperçu de la preuve numérique certifiée affiché.", "info")}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-semibold flex items-center gap-1"
                    >
                      <Eye size={11} /> Voir la preuve
                    </button>
                  </div>
                </div>
              </div>

              {/* Formulaire de Clôture / Rapport d'Intervention */}
              <div className="p-4 bg-[#1E1F29] rounded-xl border border-white/10 space-y-3">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Rapport d'Intervention & Clôture du Dossier :</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#8FA8B0] mb-1">Équipe / Unité Mobilisée :</label>
                    <input
                      id="input-equipe"
                      type="text"
                      defaultValue={dossierDetails.equipeIntervention || "Brigade Routière MINT / MINTP Centre"}
                      className="w-full bg-[#13212D] text-xs text-white p-2 rounded-lg border border-white/10"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8FA8B0] mb-1">Action Corrective Réalisée :</label>
                    <input
                      id="input-action"
                      type="text"
                      defaultValue={dossierDetails.rapportResolution || "Intervention réalisée sur le terrain / PV dressé"}
                      className="w-full bg-[#13212D] text-xs text-white p-2 rounded-lg border border-white/10"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const eq = document.getElementById("input-equipe")?.value;
                      const ac = document.getElementById("input-action")?.value;
                      handleSaveResolutionDossier(dossierDetails.id, ac, eq);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                  >
                    <CheckCircle2 size={14} />
                    <span>Valider la Clôture & Archiver le Dossier</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
