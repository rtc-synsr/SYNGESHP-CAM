import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Calendar, Clock, MapPin, Users, Plus, MessageSquare, Send,
  Share2, Download, Check, ExternalLink, AtSign, Trash2, Tag,
  Smile, Bell, ChevronRight, X, AlertCircle, Sparkles, Filter
} from "lucide-react";
import { useLanguage } from "../lib/i18n.jsx";

// ============================================================================
// LISTE GLOBALE DES COLLÈGUES DISPONIBLES POUR LES MENTIONS @
// ============================================================================
export const LISTE_COLLEGUES = [
  { id: "usr-01", nom: "Patrick MBALLA", role: "Administrateur système RTC", module: "SYNSR", email: "admin@rtc.cm" },
  { id: "usr-test-01", nom: "M. MBALLA Atangana", role: "Administrateur & Usager Référent", module: "SYNSR", email: "mballatanga@gmail.com" },
  { id: "usr-test-02", nom: "Mme BEDIGA Patricia", role: "Responsable Coordination & Parent Référent", module: "SYNGESE", email: "patriciabediga@gmail.com" },
  { id: "usr-02", nom: "Dr. Marc Eboumbou", role: "Médecin Urgentiste", module: "SYNGESHP", email: "dr.eboumbou@minsante.cm" },
  { id: "usr-03", nom: "Pr. Vincent de Paul Djientcheu", role: "Directeur HGY", module: "SYNGESHP", email: "directeur.hgy@minsante.cm" },
  { id: "usr-04", nom: "Clémence Mengue", role: "Infirmière Major", module: "SYNGESHP", email: "inf.mengue@hgy.cm" },
  { id: "usr-05", nom: "Dr. Madeleine Tchuente", role: "Pharmacienne", module: "SYNGESHP", email: "pharm.tchuente@hgy.cm" },
  { id: "usr-06", nom: "Pr. Emile Mboudou", role: "Directeur HGOPED", module: "SYNGESHP", email: "directeur.hgoped@minsante.cm" },
  { id: "usr-07", nom: "Mme Bella Thérèse", role: "Proviseur Leclerc", module: "SYNGESE", email: "directeur.leclerc@mineduc.cm" },
  { id: "usr-08", nom: "M. Atangana Paul", role: "Directeur Primaire Bastos", module: "SYNGESE", email: "directeur.bastos@minedub.cm" },
  { id: "usr-09", nom: "M. Nkoa Jean", role: "Enseignant Mathématiques", module: "SYNGESE", email: "enseignant.leclerc@mineduc.cm" },
  { id: "usr-10", nom: "Dr. Fonkwen Peter", role: "Principal GBHS Bamenda", module: "CAMSMS", email: "principal.gbhs@minesec.cm" },
  { id: "usr-11", nom: "Mrs. Lum Grace", role: "Teacher GBHS Bamenda", module: "CAMSMS", email: "teacher.gbhs@minesec.cm" },
  { id: "usr-12", nom: "Ekwalla Paul", role: "Chef Agence Général Voyages", module: "SYNSR", email: "p.ekwalla@generalvoyages.cm" },
  { id: "usr-13", nom: "Fotso Marcel", role: "Superviseur Flotte Ouest", module: "SYNSR", email: "m.fotso@rtc.cm" },
  { id: "usr-14", nom: "Mbarga Rose", role: "Coordinatrice Sécurité Routière", module: "SYNSR", email: "r.mbarga@rtc.cm" },
];

// ============================================================================
// DONNÉES INITIALES DES ÉVÉNEMENTS
// ============================================================================
export const INITIAL_EVENTS = [
  {
    id: "EVT-001",
    titre: "Comité National de Sécurité Routière & Corridor N3",
    dateDebut: "2026-09-02T09:00",
    dateFin: "2026-09-02T11:30",
    lieu: "Yaoundé, Salle de crise MINTRANS / Visioconférence",
    module: "SYNSR",
    type: "Comité / Réunion",
    participants: ["Patrick MBALLA", "Ekwalla Paul", "Mbarga Rose"],
    description: "Revue mensuelle de l'accidentologie sur l'Axe Douala-Yaoundé et déploiement des patrouilles radar.",
  },
  {
    id: "EVT-002",
    titre: "Staff Médical & Revue des Urgences Traumatologiques",
    dateDebut: "2026-09-03T08:30",
    dateFin: "2026-09-03T10:00",
    lieu: "Hôpital Général de Yaoundé - Amphithéâtre A",
    module: "SYNGESHP",
    type: "Staff Médical",
    participants: ["Dr. Marc Eboumbou", "Pr. Vincent de Paul Djientcheu", "Clémence Mengue"],
    description: "Coordination des admissions d'urgences, lits de réanimation et protocoles CSU pour les accidentés.",
  },
  {
    id: "EVT-003",
    titre: "Conseil Pédagogique de Rentrée & Harmonisation des Programmes",
    dateDebut: "2026-09-04T14:00",
    dateFin: "2026-09-04T16:30",
    lieu: "Lycée Général Leclerc - Salle des Actes",
    module: "SYNGESE",
    type: "Conseil Pédagogique",
    participants: ["Mme Bella Thérèse", "M. Nkoa Jean"],
    description: "Préparation de l'année scolaire 2026/2027, affectation des classes et calendrier des évaluations séquentielles.",
  },
  {
    id: "EVT-004",
    titre: "General PTA & Academic Board Meeting (Term 1 Prep)",
    dateDebut: "2026-09-05T10:00",
    dateFin: "2026-09-05T12:30",
    lieu: "GBHS Bamenda Main Auditorium",
    module: "CAMSMS",
    type: "PTA Meeting",
    participants: ["Dr. Fonkwen Peter", "Mrs. Lum Grace"],
    description: "Parents Teachers Association general assembly and school development project reviews for the new academic year.",
  },
];

// ============================================================================
// CANAUX DE DISCUSSION SPÉCIFIQUES PAR MODULE
// ============================================================================
export const MODULE_CHANNELS = {
  SYNSR: [
    { id: "synsr-securite", label: "#synsr-securite", desc: "Sécurité Routière, Patrouilles & Radars N3/N4" },
    { id: "synsr-flotte", label: "#synsr-flotte", desc: "Coordination Agences, Véhicules & Chauffeurs" },
    { id: "synsr-urgences", label: "#synsr-urgences", desc: "Alertes SOS, Accidents & Signalements Citoyens" },
  ],
  SYNGESHP: [
    { id: "syngeshp-urgences", label: "#syngeshp-urgences", desc: "Staff Médical, Urgences & Traumatologie" },
    { id: "syngeshp-lits", label: "#syngeshp-lits", desc: "Hospitalisations, Lits & Bloc Opératoire" },
    { id: "syngeshp-pharmacie", label: "#syngeshp-pharmacie", desc: "Pharmacie, Stocks Médicaux & CSU" },
  ],
  SYNGESE: [
    { id: "syngese-pedagogie", label: "#syngese-pedagogie", desc: "Conseils Pédagogiques & Enseignants" },
    { id: "syngese-administration", label: "#syngese-administration", desc: "Direction, Inscriptions & Frais de Scolarité" },
    { id: "syngese-evaluations", label: "#syngese-evaluations", desc: "Examens, Évaluations & Bulletins" },
  ],
  CAMSMS: [
    { id: "camsms-staff", label: "#camsms-staff", desc: "Staff Room & Teacher Coordination" },
    { id: "camsms-academic", label: "#camsms-academic", desc: "Assessments, Timetables & Report Cards" },
    { id: "camsms-pta", label: "#camsms-pta", desc: "PTA Affairs & Student Welfare" },
  ],
  ALL: [
    { id: "synsr-securite", label: "#synsr-securite", desc: "Sécurité Routière & Patrouilles" },
    { id: "syngeshp-urgences", label: "#syngeshp-urgences", desc: "Staff Médical & Urgences" },
    { id: "syngese-pedagogie", label: "#syngese-pedagogie", desc: "Établissements Francophones" },
    { id: "camsms-staff", label: "#camsms-staff", desc: "Anglophone School Network" },
  ],
};

// ============================================================================
// DONNÉES INITIALES DU CHAT D'ÉQUIPE (SECTORISÉES)
// ============================================================================
export const INITIAL_CHAT_MESSAGES = [
  // --- SYNSR-CAM (Sécurité Routière) ---
  {
    id: "msg-synsr-1",
    channel: "synsr-securite",
    module: "SYNSR",
    auteur: "Patrick MBALLA",
    auteurRole: "Administrateur système RTC",
    date: "09:15",
    texte: "Bonjour aux équipes de sécurité routière. Patrouilles coordonnées déployées sur l'axe Douala-Yaoundé (N3).",
    reactions: { "👍": 3 },
  },
  {
    id: "msg-synsr-2",
    channel: "synsr-securite",
    module: "SYNSR",
    auteur: "Mbarga Rose",
    auteurRole: "Coordinatrice Sécurité",
    date: "09:40",
    texte: "Signalement d'un ralentissement important au PK 42 zone Boumnyebel. @Fotso Marcel patrouille en route.",
    reactions: { "🚨": 2 },
  },
  {
    id: "msg-synsr-3",
    channel: "synsr-flotte",
    module: "SYNSR",
    auteur: "Ekwalla Paul",
    auteurRole: "Chef Agence Général Voyages",
    date: "10:05",
    texte: "Tous les manifestes de passagers du départ 10h30 sont enregistrés et conformes dans SYNSR.",
    reactions: { "✅": 2 },
  },
  {
    id: "msg-synsr-4",
    channel: "synsr-urgences",
    module: "SYNSR",
    auteur: "Patrick MBALLA",
    auteurRole: "Administrateur système RTC",
    date: "10:30",
    texte: "Transmission des alertes SOS synchronisée avec la DGSN et la Gendarmerie.",
    reactions: { "🎯": 2 },
  },

  // --- SYNGESHP-CAM (Santé / Hôpitaux) ---
  {
    id: "msg-hosp-1",
    channel: "syngeshp-urgences",
    module: "SYNGESHP",
    auteur: "Dr. Marc Eboumbou",
    auteurRole: "Médecin Urgentiste",
    date: "08:30",
    texte: "Bonjour au staff médical. Bloc opératoire 1 prêt pour urgences traumatologiques.",
    reactions: { "🩺": 4 },
  },
  {
    id: "msg-hosp-2",
    channel: "syngeshp-urgences",
    module: "SYNGESHP",
    auteur: "Clémence Mengue",
    auteurRole: "Infirmière Major",
    date: "09:10",
    texte: "Stock de culots globulaires O+ vérifié à la banque de sang. @Dr. Marc Eboumbou 12 unités disponibles.",
    reactions: { "✅": 3 },
  },
  {
    id: "msg-hosp-3",
    channel: "syngeshp-lits",
    module: "SYNGESHP",
    auteur: "Pr. Vincent de Paul Djientcheu",
    auteurRole: "Directeur HGY",
    date: "10:00",
    texte: "Point lits : 4 lits de réanimation libérés ce matin au Pavillon A.",
    reactions: { "👍": 2 },
  },
  {
    id: "msg-hosp-4",
    channel: "syngeshp-pharmacie",
    module: "SYNGESHP",
    auteur: "Dr. Madeleine Tchuente",
    auteurRole: "Pharmacienne",
    date: "10:45",
    texte: "Arrivage de kits CSU et perfusions validé en pharmacie centrale.",
    reactions: { "💊": 3 },
  },

  // --- SYNGESE-CAM (Éducation Francophone) ---
  {
    id: "msg-edu-1",
    channel: "syngese-pedagogie",
    module: "SYNGESE",
    auteur: "Mme Bella Thérèse",
    auteurRole: "Proviseur Lycée Leclerc",
    date: "08:45",
    texte: "Bonjour chers collègues. Réunion d'harmonisation pédagogique ce vendredi à 14h en salle des actes.",
    reactions: { "📚": 5 },
  },
  {
    id: "msg-edu-2",
    channel: "syngese-pedagogie",
    module: "SYNGESE",
    auteur: "M. Nkoa Jean",
    auteurRole: "Enseignant Mathématiques",
    date: "09:25",
    texte: "Progression séquentielle de Mathématiques déposée pour les classes de Terminale.",
    reactions: { "✍️": 3 },
  },
  {
    id: "msg-edu-3",
    channel: "syngese-evaluations",
    module: "SYNGESE",
    auteur: "M. Atangana Paul",
    auteurRole: "Directeur Primaire Bastos",
    date: "10:15",
    texte: "Saisie des notes de la 1ère séquence clôturée pour l'ensemble des classes.",
    reactions: { "📋": 2 },
  },

  // --- CAM-SMS (Anglophone Education) ---
  {
    id: "msg-camsms-1",
    channel: "camsms-staff",
    module: "CAMSMS",
    auteur: "Dr. Fonkwen Peter",
    auteurRole: "Principal GBHS Bamenda",
    date: "08:15",
    texte: "Good morning esteemed teachers. Please ensure that all lesson notes and schemes of work are finalized.",
    reactions: { "👏": 4 },
  },
  {
    id: "msg-camsms-2",
    channel: "camsms-staff",
    module: "CAMSMS",
    auteur: "Mrs. Lum Grace",
    auteurRole: "Teacher GBHS Bamenda",
    date: "09:05",
    texte: "Form 5 Mock exam timetables have been moderated and published.",
    reactions: { "📑": 3 },
  },
  {
    id: "msg-camsms-3",
    channel: "camsms-pta",
    module: "CAMSMS",
    auteur: "Dr. Fonkwen Peter",
    auteurRole: "Principal GBHS Bamenda",
    date: "10:30",
    texte: "PTA executive committee meeting scheduled for Saturday at 10:00 AM.",
    reactions: { "🤝": 2 },
  },
];

// ============================================================================
// SUITE DE NOTIFICATIONS MULTI-CANAUX (GMAIL, EMAIL PROFESSIONNEL, SMS / TEXTE)
// ============================================================================

export function openGmailComposer({ to = "", subject = "", body = "" }) {
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function openProfessionalMail({ to = "", subject = "", body = "" }) {
  const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}

export function openSmsComposer({ phone = "", message = "" }) {
  const cleanPhone = (phone || "").replace(/[^0-9+]/g, "");
  const smsUrl = `sms:${encodeURIComponent(cleanPhone)}?body=${encodeURIComponent(message)}`;
  window.open(smsUrl, "_blank");
}

export function sendEventGmailNotification(event) {
  const emails = (event.participants || [])
    .map((p) => {
      const match = LISTE_COLLEGUES.find((c) => c.nom === p);
      return match ? match.email : "";
    })
    .filter(Boolean)
    .join(",");

  const subject = `[${event.module}-CAM] Notification & Convocation : ${event.titre}`;
  const body = `Bonjour,\n\nVous êtes convié(e) à l'événement planifié sur la plateforme Réseau de Transport Camerounais (RTC) :\n\n📌 Événement : ${event.titre}\n📅 Date & Heure : ${new Date(event.dateDebut).toLocaleString("fr-FR")} -> ${new Date(event.dateFin).toLocaleTimeString("fr-FR")}\n📍 Lieu : ${event.lieu || "Non spécifié"}\n🏷️ Module : ${event.module}-CAM\n👥 Participants : ${(event.participants || []).join(", ")}\n\n📝 Détails / Ordre du jour :\n${event.description || "Aucune note complémentaire."}\n\nAccès direct à la plateforme : https://synsr-rtc.vercel.app\n\nCordialement,\nAdministration Plateforme Numérique RTC`;

  openGmailComposer({ to: emails, subject, body });
}

export function sendEventProMailNotification(event) {
  const emails = (event.participants || [])
    .map((p) => {
      const match = LISTE_COLLEGUES.find((c) => c.nom === p);
      return match ? match.email : "";
    })
    .filter(Boolean)
    .join(";");

  const subject = `[${event.module}-CAM] Convocation Officielle : ${event.titre}`;
  const body = `Bonjour,\n\nNotification officielle concernant l'événement :\n\n- Titre : ${event.titre}\n- Date début : ${new Date(event.dateDebut).toLocaleString("fr-FR")}\n- Date fin : ${new Date(event.dateFin).toLocaleString("fr-FR")}\n- Lieu : ${event.lieu || "Cameroun"}\n- Système : ${event.module}-CAM\n\nAccès : https://synsr-rtc.vercel.app\n\nDirection Générale RTC`;

  openProfessionalMail({ to: emails, subject, body });
}

export function sendEventSmsNotification(event) {
  const text = `[RTC ${event.module}] Evt: ${event.titre} le ${new Date(event.dateDebut).toLocaleDateString("fr-FR")} a ${new Date(event.dateDebut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}. Info: synsr-rtc.vercel.app`;
  openSmsComposer({ phone: "+237 6 99 00 00 00", message: text });
}

export const DEFAULT_TEST_RECIPIENTS = [
  { nom: "M. MBALLA Atangana", email: "mballatanga@gmail.com", tel: "+237 6 99 11 22 33", role: "Administrateur & Usager Référent" },
  { nom: "Mme BEDIGA Patricia", email: "patriciabediga@gmail.com", tel: "+237 6 77 44 55 66", role: "Responsable Coordination & Parent Référent" },
];

export function generateAutomatedTestPayloads() {
  const timeStr = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = new Date().toLocaleDateString("fr-FR");

  return [
    {
      id: `NTF-AUTO-${Date.now()}-1`,
      destinataire: "M. MBALLA Atangana",
      contact: "mballatanga@gmail.com",
      canal: "Gmail",
      type: "Confirmation",
      objet: `[SYNSR-RTC] Confirmation de Réservation Express #${Math.floor(1000 + Math.random() * 9000)}`,
      message: `Bonjour M. MBALLA Atangana,\n\nVotre voyage Douala ➔ Yaoundé est validé avec succès sur la plateforme SYNSR-CAM.\n\n🚌 Agence : Général Voyages VIP\n🎫 Siège réservé : N° 14B\n🕒 Départ : Aujourd'hui à ${timeStr} (Gare de Bassa)\n🛡️ Suivi GPS & Sécurité : Activé en temps réel.\n\nMerci de voyager en toute sécurité avec le Réseau de Transport Camerounais.`,
      date: `${dateStr} ${timeStr}`,
      statut: "Envoyé (Gmail Automatisé)",
    },
    {
      id: `NTF-AUTO-${Date.now()}-2`,
      destinataire: "Mme BEDIGA Patricia",
      contact: "patriciabediga@gmail.com",
      canal: "Gmail",
      type: "Avis Scolaire",
      objet: `[SYNGESE-CAM] Notification Académique & Disponibilité du Bulletin Trimestriel`,
      message: `Chère Mme BEDIGA Patricia,\n\nNous vous informons que le bulletin d'évaluation de la 1ère séquence est désormais disponible en ligne sur SYNGESE-CAM.\n\n🏫 Établissement : Lycée Général Leclerc\n📊 Moyenne générale : 16.5 / 20 (Félicitations du Conseil)\n📅 Réunion parents-professeurs : Vendredi prochain à 14h00.\n\nAccédez à votre espace parent sur : https://synsr-rtc.vercel.app`,
      date: `${dateStr} ${timeStr}`,
      statut: "Envoyé (Gmail Automatisé)",
    },
    {
      id: `NTF-AUTO-${Date.now()}-3`,
      destinataire: "M. MBALLA Atangana & Mme BEDIGA Patricia",
      contact: "mballatanga@gmail.com, patriciabediga@gmail.com",
      canal: "Email Pro",
      type: "Alerte Médicale",
      objet: `[SYNGESHP-CAM] Rapport de Garde & Prise en Charge CSU Hôpital Général`,
      message: `Bonjour,\n\nNotification automatique du système hospitalier SYNGESHP-CAM :\n\n🏥 Pôle Médical : Hôpital Général de Yaoundé (HGY)\n🩺 Statut : Couverture CSU activée et 4 lits de soins intensifs libérés.\n📋 Staff de coordination : Prévu ce jour avec l'équipe traumatologie.\n\nCoordination Direction Médicale & Plateforme Numérique RTC.`,
      date: `${dateStr} ${timeStr}`,
      statut: "Transmis (Pro Automatisé)",
    },
    {
      id: `NTF-AUTO-${Date.now()}-4`,
      destinataire: "M. MBALLA Atangana & Mme BEDIGA Patricia",
      contact: "+237 6 99 11 22 33 / +237 6 77 44 55 66",
      canal: "SMS",
      type: "Urgence",
      objet: `[SMS RTC] Alerte Flash Trafic & Météo Axe Lourd`,
      message: `[FLASH RTC] Ralentissement résorbé au PK 42 axe Douala-Ydé. Circulation fluide et patrouilles actives. Assistance 24/7 au *1234#`,
      date: `${dateStr} ${timeStr}`,
      statut: "Délivré (SMS GSM)",
    },
  ];
}

// ============================================================================
// HELPER : GÉNÉRATEURS DE LIENS GOOGLE CALENDAR / GMAIL ET EXPORT ICS
// ============================================================================
export function generateGoogleCalendarUrl(event) {
  const formatIsoForGCal = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const start = formatIsoForGCal(event.dateDebut);
  const end = formatIsoForGCal(event.dateFin || event.dateDebut);
  const title = encodeURIComponent(event.titre || "Événement Plateforme RTC");
  const details = encodeURIComponent(
    `${event.description || ""}\n\n[Système: ${event.module}] Participants: ${(event.participants || []).join(", ")}`
  );
  const location = encodeURIComponent(event.lieu || "Cameroun");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

export function downloadIcsFile(event) {
  const formatIsoForIcs = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Réseau de Transport Camerounais//Collaboration Suite//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:rtc-evt-${event.id}-${Date.now()}@rtc.cm`,
    `DTSTAMP:${formatIsoForIcs(new Date().toISOString())}`,
    `DTSTART:${formatIsoForIcs(event.dateDebut)}`,
    `DTEND:${formatIsoForIcs(event.dateFin || event.dateDebut)}`,
    `SUMMARY:${event.titre || "Événement RTC"}`,
    `DESCRIPTION:${(event.description || "").replace(/\n/g, "\\n")}`,
    `LOCATION:${event.lieu || ""}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `evenement_${event.id || "rtc"}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================================
// COMPOSANT 1 : GESTIONNAIRE D'ÉVÉNEMENTS & SYNCHRONISATION GMAIL
// ============================================================================
export function EventsManagerView({
  events = INITIAL_EVENTS,
  onAddEvent,
  onDeleteEvent,
  moduleContext = "ALL", // "SYNSR" | "SYNGESHP" | "SYNGESE" | "CAMSMS" | "ALL"
  currentUserName = "Patrick MBALLA"
}) {
  const { lang, t } = useLanguage();
  const [filterModule, setFilterModule] = useState(moduleContext === "ALL" ? "" : moduleContext);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [form, setForm] = useState({
    titre: "",
    dateDebut: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    dateFin: new Date(Date.now() + 93600000).toISOString().slice(0, 16),
    lieu: "",
    module: moduleContext === "ALL" ? "SYNSR" : moduleContext,
    type: "Réunion / Coordination",
    participants: [currentUserName],
    description: "",
  });

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchMod = !filterModule || e.module === filterModule;
      const matchSearch =
        !search ||
        e.titre.toLowerCase().includes(search.toLowerCase()) ||
        e.lieu.toLowerCase().includes(search.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(search.toLowerCase()));
      return matchMod && matchSearch;
    });
  }, [events, filterModule, search]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.titre.trim()) return;
    const newEvt = {
      id: `EVT-${Math.floor(100 + Math.random() * 900)}`,
      ...form,
    };
    if (onAddEvent) onAddEvent(newEvt);
    setModalOpen(false);
    setForm({
      titre: "",
      dateDebut: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      dateFin: new Date(Date.now() + 93600000).toISOString().slice(0, 16),
      lieu: "",
      module: moduleContext === "ALL" ? "SYNSR" : moduleContext,
      type: "Réunion / Coordination",
      participants: [currentUserName],
      description: "",
    });
  };

  const getModuleBadgeColor = (mod) => {
    switch (mod) {
      case "SYNSR": return "bg-[#1E8FA6]/20 text-[#5FC2D6] border-[#1E8FA6]/30";
      case "SYNGESHP": return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "SYNGESE": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "CAMSMS": return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5" style={{ fontFamily: "Rajdhani, sans-serif" }}>
            <Calendar className="text-[#00A09D]" size={22} />
            {lang === "en" ? "Collaborative Event & Calendar Manager" : "Gestionnaire d'Événements & Calendrier Collaboratif"}
          </h2>
          <p className="text-xs text-[#8FA8B0] mt-0.5">
            {lang === "en"
              ? "Schedule meetings, fleet inspections, medical shifts, and PTA councils with 1-click Gmail / Google Calendar sync."
              : "Planification d'événements, comités de sécurité, gardes médicales et conseils d'école avec synchronisation Gmail et export .ics."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-[#00A09D] hover:bg-[#00bfae] text-white rounded-lg text-xs font-bold flex items-center gap-2 transition shadow"
        >
          <Plus size={16} /> {lang === "en" ? "New Event" : "Nouvel événement"}
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="p-3 bg-[#102530] border border-white/10 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
          <Filter size={15} className="text-[#8FA8B0]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "en" ? "Search event title, venue..." : "Rechercher un événement, lieu..."}
            className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="bg-[#0A1A22] border border-white/10 text-xs text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="">{lang === "en" ? "All Modules" : "Tous les systèmes"}</option>
            <option value="SYNSR">SYNSR-CAM (Sécurité Routière)</option>
            <option value="SYNGESHP">SYNGESHP-CAM (Santé)</option>
            <option value="SYNGESE">SYNGESE-CAM (Éducation FR)</option>
            <option value="CAMSMS">CAM-SMS (Education EN)</option>
          </select>
        </div>
      </div>

      {/* Grille des événements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((evt) => (
          <div key={evt.id} className="p-5 rounded-xl bg-[#102530] border border-white/10 space-y-4 hover:border-[#00A09D]/50 transition shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${getModuleBadgeColor(evt.module)}`}>
                {evt.module}-CAM • {evt.type}
              </span>
              {onDeleteEvent && (
                <button
                  type="button"
                  onClick={() => onDeleteEvent(evt.id)}
                  title="Supprimer"
                  className="text-gray-500 hover:text-red-400 p-1"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-white leading-snug">{evt.titre}</h3>
              {evt.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{evt.description}</p>}
            </div>

            <div className="space-y-1.5 text-xs text-[#8FA8B0] border-t border-white/5 pt-3">
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-[#5FC2D6] shrink-0" />
                <span className="font-mono text-gray-200">
                  {new Date(evt.dateDebut).toLocaleString(lang === "en" ? "en-GB" : "fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                  {" ➔ "}
                  {new Date(evt.dateFin).toLocaleTimeString(lang === "en" ? "en-GB" : "fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              {evt.lieu && (
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-amber-400 shrink-0" />
                  <span className="truncate">{evt.lieu}</span>
                </div>
              )}
              {evt.participants && evt.participants.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users size={13} className="text-emerald-400 shrink-0" />
                  <span className="truncate">
                    {evt.participants.map((p, i) => (
                      <span key={i} className="text-gray-300 mr-1.5 font-medium">@{p}</span>
                    ))}
                  </span>
                </div>
              )}
            </div>

            {/* Barre d'actions & Notifications multi-canaux */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <a
                  href={generateGoogleCalendarUrl(evt)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition text-center"
                >
                  <ExternalLink size={13} className="text-red-400" />
                  <span>{lang === "en" ? "Sync Google Calendar" : "Sync Google Agenda"}</span>
                </a>
                <button
                  type="button"
                  onClick={() => downloadIcsFile(evt)}
                  title={lang === "en" ? "Download .ics iCalendar file" : "Télécharger fichier .ics"}
                  className="py-2 px-3 bg-[#1E8FA6]/20 hover:bg-[#1E8FA6]/40 text-[#5FC2D6] border border-[#1E8FA6]/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Download size={13} />
                  <span>.ICS</span>
                </button>
              </div>

              {/* Envoi des notifications de convocation multi-canaux */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => sendEventGmailNotification(evt)}
                  title="Notifier les participants via Gmail (Google)"
                  className="flex-1 py-1.5 px-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-md font-semibold flex items-center justify-center gap-1 transition"
                >
                  <Send size={11} /> <span>Gmail</span>
                </button>
                <button
                  type="button"
                  onClick={() => sendEventProMailNotification(evt)}
                  title="Notifier les participants via Messagerie Pro (Outlook / Mailto)"
                  className="flex-1 py-1.5 px-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md font-semibold flex items-center justify-center gap-1 transition"
                >
                  <Share2 size={11} /> <span>Mail Pro</span>
                </button>
                <button
                  type="button"
                  onClick={() => sendEventSmsNotification(evt)}
                  title="Notifier les participants par SMS / Texte"
                  className="flex-1 py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md font-semibold flex items-center justify-center gap-1 transition"
                >
                  <MessageSquare size={11} /> <span>SMS</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Création d'Événement */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#102530] border border-white/20 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="text-[#00A09D]" size={18} />
                {lang === "en" ? "Create New Scheduled Event" : "Planifier un nouvel événement"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-300 mb-1">Titre de l'événement *</label>
                <input
                  required
                  type="text"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  placeholder="ex: Réunion de coordination sécurité routière"
                  className="w-full bg-[#0A1A22] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A09D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">Date & Heure de début *</label>
                  <input
                    required
                    type="datetime-local"
                    value={form.dateDebut}
                    onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
                    className="w-full bg-[#0A1A22] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-300 mb-1">Date & Heure de fin *</label>
                  <input
                    required
                    type="datetime-local"
                    value={form.dateFin}
                    onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
                    className="w-full bg-[#0A1A22] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">Système / Module *</label>
                  <select
                    value={form.module}
                    onChange={(e) => setForm({ ...form, module: e.target.value })}
                    className="w-full bg-[#0A1A22] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="SYNSR">SYNSR-CAM (Sécurité Routière)</option>
                    <option value="SYNGESHP">SYNGESHP-CAM (Gestion Hospitalière)</option>
                    <option value="SYNGESE">SYNGESE-CAM (Éducation Francophone)</option>
                    <option value="CAMSMS">CAM-SMS (Anglophone Education)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-300 mb-1">Lieu / Salle / Visioconférence</label>
                  <input
                    type="text"
                    value={form.lieu}
                    onChange={(e) => setForm({ ...form, lieu: e.target.value })}
                    placeholder="ex: Salle de réunion / Google Meet"
                    className="w-full bg-[#0A1A22] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Description & Ordre du jour</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Détails, points à traiter, objectifs..."
                  className="w-full bg-[#0A1A22] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00A09D] hover:bg-[#00bfae] text-white rounded-lg text-xs font-bold shadow"
                >
                  Enregistrer & Planifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT 2 : BLOC DE NOTES COLLABORATIVES AVEC SUGGESTIONS @COLLÈGUE
// ============================================================================
export function CollaborativeNotesWidget({
  targetEntityId, // e.g. "SIG-3391", "ACC-118", "PAT-001", "ELEVE-01"
  targetEntityType = "Signalement",
  currentUserName = "Patrick MBALLA",
  notes = [],
  onAddNote,
  onDeleteNote,
}) {
  const { lang } = useLanguage();
  const [text, setText] = useState("");
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionPosition, setMentionPosition] = useState(0);
  const textareaRef = useRef(null);

  // Suggestions filtrées pour l'autocomplétion @
  const matchingColleagues = useMemo(() => {
    if (!mentionQuery) return LISTE_COLLEGUES.slice(0, 6);
    return LISTE_COLLEGUES.filter((c) =>
      c.nom.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(mentionQuery.toLowerCase())
    ).slice(0, 6);
  }, [mentionQuery]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    setText(val);

    const lastAtIndex = val.lastIndexOf("@", pos - 1);
    if (lastAtIndex !== -1) {
      const query = val.slice(lastAtIndex + 1, pos);
      if (!query.includes(" ") && query.length < 25) {
        setMentionQuery(query);
        setMentionPosition(lastAtIndex);
        setShowMentionMenu(true);
        return;
      }
    }
    setShowMentionMenu(false);
  };

  const insertMention = (colleagueNom) => {
    const before = text.slice(0, mentionPosition);
    const after = text.slice(textareaRef.current.selectionStart);
    const newText = `${before}@${colleagueNom} ${after}`;
    setText(newText);
    setShowMentionMenu(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Détection des collègues tagués
    const mentionsFound = LISTE_COLLEGUES.filter((c) => text.includes(`@${c.nom}`)).map((c) => c.nom);

    const newNote = {
      id: `NOTE-${Date.now()}`,
      targetId: targetEntityId,
      auteur: currentUserName,
      date: new Date().toISOString(),
      contenu: text.trim(),
      mentions: mentionsFound,
    };

    if (onAddNote) onAddNote(newNote);
    setText("");
    setShowMentionMenu(false);
  };

  // Affichage avec surlignage des @mentions
  const renderNoteContent = (content) => {
    const parts = content.split(/(@[A-Za-zÀ-ÿ0-9.\s-]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("@")) {
        return (
          <span key={idx} className="font-bold text-[#5FC2D6] bg-[#1E8FA6]/20 px-1.5 py-0.5 rounded text-[11px] inline-flex items-center gap-0.5 border border-[#1E8FA6]/30">
            <AtSign size={10} />
            {part.slice(1)}
          </span>
        );
      }
      return part;
    });
  };

  const entityNotes = notes.filter((n) => !targetEntityId || n.targetId === targetEntityId);

  return (
    <div className="p-4 bg-[#0A1A22] border border-white/10 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-mono tracking-wider">
          <MessageSquare size={14} className="text-[#00A09D]" />
          {lang === "en" ? "Collaborative Notes & Mentions (@)" : "Notes Collaboratives & Mentions (@)"}
        </span>
        <span className="text-[10px] text-gray-400 font-mono">
          Tapez <strong>@</strong> pour mentionner un collègue
        </span>
      </div>

      {/* Liste des notes existantes */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {entityNotes.length === 0 ? (
          <div className="text-xs text-gray-500 italic py-2">
            Aucune note pour le moment. Laissez un mémo ou taguez un collègue ci-dessous.
          </div>
        ) : (
          entityNotes.map((n) => (
            <div key={n.id} className="p-2.5 bg-[#102530] border border-white/5 rounded-lg text-xs space-y-1">
              <div className="flex items-center justify-between text-[10px] text-[#8FA8B0]">
                <strong className="text-gray-200">{n.auteur}</strong>
                <div className="flex items-center gap-2">
                  <span>{new Date(n.date).toLocaleString(lang === "en" ? "en-GB" : "fr-FR", { dateStyle: "short", timeStyle: "short" })}</span>
                  {onDeleteNote && (
                    <button onClick={() => onDeleteNote(n.id)} className="text-gray-500 hover:text-red-400">
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>
              <div className="text-gray-300 leading-relaxed">
                {renderNoteContent(n.contenu)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulaire d'ajout avec popover de mentions */}
      <form onSubmit={handleSubmit} className="relative space-y-2">
        <textarea
          ref={textareaRef}
          rows={2}
          value={text}
          onChange={handleTextChange}
          placeholder="Écrire une note... Utilisez @ pour taguer un médecin, enseignant ou agent..."
          className="w-full bg-[#102530] border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00A09D]"
        />

        {/* Menu contextuel popup des mentions @ */}
        {showMentionMenu && (
          <div className="absolute bottom-full mb-1 left-0 z-30 bg-[#102530] border border-teal-500/40 rounded-lg shadow-2xl p-1.5 w-64 max-h-48 overflow-y-auto space-y-1">
            <div className="text-[10px] text-[#5FC2D6] font-mono px-2 py-0.5 border-b border-white/5">
              Suggestions collègues (@)
            </div>
            {matchingColleagues.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => insertMention(c.nom)}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-[#1E8FA6]/20 transition flex flex-col text-xs text-gray-200"
              >
                <span className="font-bold text-white flex items-center gap-1">
                  <AtSign size={11} className="text-[#5FC2D6]" /> {c.nom}
                </span>
                <span className="text-[10px] text-gray-400">{c.role} ({c.module})</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-[#8FA8B0]">
            <button
              type="button"
              onClick={() => {
                setText((prev) => prev + " @");
                setShowMentionMenu(true);
                setMentionPosition(text.length + 1);
              }}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[11px] text-[#5FC2D6] flex items-center gap-1 border border-white/5"
            >
              <AtSign size={12} /> Taguer
            </button>
          </div>
          <button
            type="submit"
            disabled={!text.trim()}
            className="px-3 py-1.5 bg-[#00A09D] hover:bg-[#00bfae] disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow"
          >
            <Send size={12} /> Publier la note
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// COMPOSANT 3 : GESTIONNAIRE DE CHAT & MESSAGERIE D'ÉQUIPE (SECTORISÉ PAR MODULE)
// ============================================================================
export function TeamChatWidget({
  messages = INITIAL_CHAT_MESSAGES,
  onSendMessage,
  currentUserName = "Patrick MBALLA",
  currentRole = "Administrateur",
  defaultChannel = null,
  moduleContext = "ALL", // "SYNSR" | "SYNGESHP" | "SYNGESE" | "CAMSMS" | "ALL"
}) {
  const { lang } = useLanguage();
  const channels = MODULE_CHANNELS[moduleContext] || MODULE_CHANNELS.ALL;
  const [activeChannel, setActiveChannel] = useState(defaultChannel || channels[0]?.id || "synsr-securite");
  const [inputMessage, setInputMessage] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const messagesEndRef = useRef(null);

  // Synchronisation du canal actif si le module change
  useEffect(() => {
    if (channels.length > 0 && !channels.some((c) => c.id === activeChannel)) {
      setActiveChannel(channels[0].id);
    }
  }, [moduleContext, channels]);

  const channelMessages = useMemo(() => {
    return messages.filter((m) => {
      const isChannel = m.channel === activeChannel;
      const isMod = moduleContext === "ALL" || !m.module || m.module === moduleContext || channels.some((c) => c.id === m.channel);
      return isChannel && isMod;
    });
  }, [messages, activeChannel, moduleContext, channels]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [channelMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      channel: activeChannel,
      module: moduleContext === "ALL" ? "SYNSR" : moduleContext,
      auteur: currentUserName,
      auteurRole: currentRole,
      date: new Date().toLocaleTimeString(lang === "en" ? "en-GB" : "fr-FR", { hour: "2-digit", minute: "2-digit" }),
      texte: inputMessage.trim(),
      reactions: {},
    };

    if (onSendMessage) onSendMessage(newMsg);
    setInputMessage("");
    setShowMentions(false);
  };

  const moduleColleagues = useMemo(() => {
    if (moduleContext === "ALL") return LISTE_COLLEGUES;
    const filtered = LISTE_COLLEGUES.filter((c) => c.module === moduleContext);
    return filtered.length > 0 ? filtered : LISTE_COLLEGUES;
  }, [moduleContext]);

  const renderMessageContent = (content) => {
    const parts = content.split(/(@[A-Za-zÀ-ÿ0-9.\s-]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("@")) {
        return (
          <span key={idx} className="font-bold text-[#5FC2D6] bg-[#1E8FA6]/20 px-1 py-0.2 rounded inline-flex items-center gap-0.5 border border-[#1E8FA6]/30">
            <AtSign size={10} />
            {part.slice(1)}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="h-[600px] flex flex-col md:flex-row bg-[#102530] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      {/* Volet latéral des canaux du module */}
      <div className="w-full md:w-64 bg-[#0A1A22] border-r border-white/10 p-3 space-y-3 shrink-0 flex flex-col">
        <div className="text-xs font-bold text-white flex items-center justify-between px-2 uppercase font-mono tracking-wider">
          <span className="flex items-center gap-2">
            <MessageSquare size={15} className="text-[#00A09D]" />
            {lang === "en" ? "Channels" : "Canaux"}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1E8FA6]/20 text-[#5FC2D6] font-bold">
            {moduleContext === "ALL" ? "RTC" : `${moduleContext}-CAM`}
          </span>
        </div>

        <div className="space-y-1 flex-1 overflow-y-auto">
          {channels.map((ch) => {
            const isActive = activeChannel === ch.id;
            const msgCount = messages.filter((m) => m.channel === ch.id).length;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => setActiveChannel(ch.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex flex-col ${
                  isActive
                    ? "bg-[#1E8FA6]/20 text-[#5FC2D6] border border-[#1E8FA6]/40 font-bold"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{ch.label}</span>
                  {msgCount > 0 && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono text-gray-300">
                      {msgCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 font-normal truncate mt-0.5">{ch.desc}</span>
              </button>
            );
          })}
        </div>

        <div className="p-2.5 bg-white/5 rounded-lg text-[11px] text-gray-400 space-y-1">
          <div className="text-white font-semibold flex items-center gap-1">
            <AtSign size={12} className="text-[#5FC2D6]" /> {currentUserName}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            ● {currentRole} ({moduleContext === "ALL" ? "Plateforme" : `${moduleContext}-CAM`})
          </div>
        </div>
      </div>

      {/* Zone centrale des messages */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#102530]">
        {/* En-tête du canal actif */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-[#0A1A22]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-mono">
                #{activeChannel}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-gray-300 font-mono">
                {moduleContext === "ALL" ? "RTC" : `${moduleContext}-CAM`}
              </span>
            </div>
            <p className="text-[11px] text-[#8FA8B0] mt-0.5">
              {channels.find((c) => c.id === activeChannel)?.desc}
            </p>
          </div>
          <div className="text-xs text-[#5FC2D6] font-mono px-2.5 py-1 rounded bg-[#1E8FA6]/10 border border-[#1E8FA6]/20">
            {channelMessages.length} message(s)
          </div>
        </div>

        {/* Fil des messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {channelMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-gray-500 text-xs italic">
              Aucun message dans #{activeChannel} pour {moduleContext === "ALL" ? "la plateforme" : moduleContext}. Lancez la discussion ci-dessous !
            </div>
          ) : (
            channelMessages.map((m) => (
              <div key={m.id} className="p-3 bg-[#0A1A22] rounded-xl border border-white/5 space-y-1 hover:border-white/10 transition">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{m.auteur}</span>
                    <span className="text-[10px] text-gray-400 font-mono">({m.auteurRole})</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">{m.date}</span>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">
                  {renderMessageContent(m.texte)}
                </p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Barre de saisie */}
        <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-[#0A1A22] flex items-center gap-2 relative">
          {showMentions && (
            <div className="absolute bottom-full mb-2 left-3 z-30 bg-[#102530] border border-teal-500/40 rounded-lg shadow-2xl p-1.5 w-64 max-h-48 overflow-y-auto space-y-1">
              <div className="text-[10px] text-[#5FC2D6] font-mono px-2 py-0.5 border-b border-white/5">
                Taguer un collègue ({moduleContext === "ALL" ? "Tous" : moduleContext})
              </div>
              {moduleColleagues.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setInputMessage((prev) => `${prev}@${c.nom} `);
                    setShowMentions(false);
                  }}
                  className="w-full text-left px-2 py-1 rounded hover:bg-[#1E8FA6]/20 transition flex flex-col text-xs text-gray-200"
                >
                  <span className="font-bold text-white flex items-center gap-1">
                    <AtSign size={11} className="text-[#5FC2D6]" /> {c.nom}
                  </span>
                  <span className="text-[10px] text-gray-400">{c.role}</span>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowMentions(!showMentions)}
            title="Mentionner un collègue"
            className="p-2 text-gray-400 hover:text-[#5FC2D6] hover:bg-white/5 rounded-lg transition"
          >
            <AtSign size={16} />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Message dans #${activeChannel}... (tapez @ pour mentionner)`}
            className="flex-1 bg-[#102530] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00A09D]"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="px-4 py-2 bg-[#00A09D] hover:bg-[#00bfae] disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT 4 : BOUTON FLOTTANT DU CHAT D'ÉQUIPE (ADAPTÉ AU MODULE EN COURS)
// ============================================================================
export function FloatingChatButton({
  messages = INITIAL_CHAT_MESSAGES,
  onSendMessage,
  currentUserName = "Patrick MBALLA",
  currentRole = "Administrateur",
  currentModule = "SYNSR", // "SYNSR" | "SYNGESHP" | "SYNGESE" | "CAMSMS"
}) {
  const [open, setOpen] = useState(false);
  const channels = MODULE_CHANNELS[currentModule] || MODULE_CHANNELS.ALL;
  const channelIds = channels.map((c) => c.id);
  const relevantMessages = messages.filter((m) => channelIds.includes(m.channel) || m.module === currentModule);
  const unreadCount = relevantMessages.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={`Chat d'équipe — ${currentModule}-CAM`}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#00A09D] hover:bg-[#00bfae] text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/20"
      >
        <MessageSquare size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0A1A22]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-[95vw] sm:w-[500px] max-h-[600px] h-[540px] bg-[#102530] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-3 bg-[#0A1A22] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-[#00A09D]" />
              <span className="text-xs font-bold text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                Chat d'Équipe — {currentModule}-CAM
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00A09D]/20 text-[#5FC2D6] font-mono">
                Espace dédié
              </span>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white p-1">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <TeamChatWidget
              messages={messages}
              onSendMessage={onSendMessage}
              currentUserName={currentUserName}
              currentRole={currentRole}
              moduleContext={currentModule}
            />
          </div>
        </div>
      )}
    </>
  );
}
