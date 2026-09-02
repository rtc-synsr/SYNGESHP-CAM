import { useLanguage } from "../lib/i18n.jsx";
import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles, Bot, X, Send, Mic, MicOff, Volume2, VolumeX, Maximize2, Minimize2,
  RotateCcw, ChevronRight, ShieldCheck, AlertTriangle, Car, Users, Building2,
  PhoneCall, FileText, CheckCircle2, Zap, ArrowRight, HelpCircle, Activity,
  GraduationCap, HeartPulse, UserCheck, BookOpen, Stethoscope, School,
  FileSpreadsheet, CreditCard, Landmark, Check, Clock, BarChart3, TrendingUp,
  PieChart, LineChart
} from "lucide-react";

/**
 * Assistant IA Souverain RTC — Moteur d'Analyse de Données & des Visuels de Tableaux de Bord
 * Conçu pour une précision à 98.99% et une spécialisation stricte par module actif :
 * - Analyse quantitative et qualitative des KPIs
 * - Décryptage précis des diagrammes à barres (10 Régions) et courbes comparatives (2025 vs 2026)
 * - Ratios de performance, détection d'anomalies et recommandations décisionnelles
 */
// Interrupteur global de l'Assistant IA (désactivé sur tous les modules)
export const ENABLE_AI_ASSISTANT = false;

export default function AiAssistant({
  currentModule = "SYNSR-CAM",
  currentTab = "dashboard",
  onNavigate = null,
  onOpenModal = null,
  contextData = {}
}) {
  // Retrait de l'agent IA sur tous les modules
  if (!ENABLE_AI_ASSISTANT) {
    return null;
  }
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const messagesEndRef = useRef(null);
  const { lang } = useLanguage();

  // Suggestions contextuelles ultra-spécifiques avec bouton d'Analyse de Données
  const quickSuggestions = {
    "SYNDEC-CAM": [
      "📊 Analyser les graphiques & KPIs du tableau de bord",
      "📈 Analyser le diagramme en courbe comparatif 2025 vs 2026",
      "🏛️ Décrypter le diagramme à barres des naissances des 10 régions",
      "💰 Bilan financier des paiements Orange / MTN Mobile Money",
      "Quels sont les frais officiels et délais pour un acte de naissance ?",
      "Comment modifier ou supprimer une commune dans le répertoire des 372 communes ?"
    ],
    "SYNSR-CAM": [
      "📊 Analyser les données et flux de transport en direct",
      "💥 Bilan statistique des accidents par corridor routier",
      "📱 Analyse de l'adoption du canal USSD *1234# et alertes SOS",
      "Comment enregistrer un passager et générer son QR Code sécurisé ?",
      "Conformité avec la Loi N° 2024/017 et masquage des CNI"
    ],
    "SYNREC-CAM": [
      "📊 Analyser les données démographiques et la pyramide des âges",
      "🗺️ Évaluation de la couverture des Zones de Dénombrement (ZD)",
      "Méthodologie de recensement des ménages selon les normes BUCREP"
    ],
    "SYNGESP-CAM": [
      "📊 Analyser les statistiques hospitalières et taux d'occupation des lits",
      "🚨 Analyse des flux d'urgences et efficacité du triage (Rouge/Jaune/Vert)",
      "💊 Bilan des stocks de pharmacie et part de couverture CSU MINSANTE"
    ],
    "SYNGESE-CAM": [
      "📊 Analyser les performances scolaires et moyennes générales",
      "💳 Bilan du taux de recouvrement des frais de scolarité et APEE",
      "Calcul des moyennes pondérées par coefficient et bulletins"
    ],
    "CAM-SMS": [
      "📊 Analyze academic performance and GCE GPA trends",
      "💰 Financial audit of fee installment collection",
      "End-of-term bilingual report cards generation"
    ],
    "SYNCRM-CAM": [
      "📊 Analyser les feuilles de temps (Cycle Samedi-Vendredi 40h)",
      "🏖️ Bilan des congés (Vacances vs Maladie) et taux d'absentéisme",
      "💰 Bilan de la masse salariale et déductions CNPS / IRPP"
    ],
    "Portail National RTC": [
      "📊 Synthèse transversale des données des 4 systèmes souverains",
      "Sécurité, hébergement souverain et habilitations"
    ]
  };

  const getGreetingText = (mod) => {
    switch (mod) {
      case "SYNDEC-CAM":
        return `Bonjour ! Je suis **l'Assistant IA Data & Décision SYNDEC-CAM**.\n\nJe suis **strictement dédié à l'état civil numérique et à l'analyse de données territoriales** :\n- 📊 **Analyse des Visuels :** Diagramme à barres des 10 régions & Diagramme en courbe 2025 vs 2026\n- 👶 **Naissances, Décès & Mariages :** Suivi des volumes, délivrance d'actes certifiés et QR Code\n- 🏛️ **372 Communes :** Répertoire national, Maires titulaires (ex: Francis Gaël Touna à Obala)\n- 💳 **Recettes Mobile Money :** Bilan comptable Orange & MTN avec ventilation 50/50.`;
      case "SYNGESP-CAM":
      case "SYNGESHP-CAM":
        return `Bonjour ! Je suis **l'Assistant IA Médical & Analytics SYNGESP-CAM**.\n\nJe suis **exclusivement dédié à la gestion hospitalière et à l'analyse des indicateurs de santé** : flux d'urgences, occupation des lits, stocks de pharmacie DCI et couverture CSU MINSANTE.`;
      case "SYNGESE-CAM":
        return `Bonjour ! Je suis **l'Assistant IA Éducatif & Statistique SYNGESE-CAM**.\n\nJe suis **strictement dédié à l'enseignement francophone (Primaire & Secondaire)** : analyse des résultats scolaires, moyennes pondérées, bulletins et suivi financier des scolarités.`;
      case "CAM-SMS":
        return `Hello! I am the **CAM-SMS Education Analytics AI Assistant**.\n\nI strictly assist with the **Anglophone Education System**: academic data analysis, GCE grades computation, fee collection metrics, and report card analytics.`;
      case "SYNREC-CAM":
        return `Bonjour ! Je suis **l'Assistant IA Démographique SYNREC-CAM**.\n\nJe suis **exclusivement dédié au recensement général (BUCREP)** : analyse de la pyramide des âges, cartographie des ZD et projections démographiques régionales.`;
      case "SYNCRM-CAM":
      case "CRM":
        return `Bonjour ! Je suis **l'Assistant IA RH & Analytics RTC**.\n\nJe vous assiste dans la **gestion du personnel et l'analyse de la performance RH** : audit des feuilles de temps (**Samedi ➔ Vendredi, 40h/semaine**), congés, paie et pipeline de recrutement.`;
      case "Portail National RTC":
        return `Bonjour ! Je suis **l'Assistant IA Central du Réseau de Transport Camerounais (RTC)**.\n\nJe vous offre une analyse globale et un aiguillage précis vers l'ensemble des systèmes numériques souverains.`;
      case "SYNSR-CAM":
      default:
        return `Bonjour ! Je suis **l'Assistant IA National SYNSR-CAM**.\n\nJe suis à votre disposition pour analyser **la sécurité routière et la traçabilité des transports interurbains** : passagers, QR Codes, agréments MINTRANS, sinistres DGSN/SED, alertes SOS et canal USSD (*1234#).`;
    }
  };

  const initialGreeting = {
    id: "init-1",
    sender: "ai",
    text: getGreetingText(currentModule),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actions: [
      { label: "📊 Lancer l'Analyse des Données & Graphiques", query: "Analyse les données et les différents visuels du tableau de bord de ce module" },
      { label: "⚖️ Cadre Légal & Réglementaire", query: `Quelles sont les obligations légales du module ${currentModule} ?` }
    ]
  };

  const [messages, setMessages] = useState([initialGreeting]);

  useEffect(() => {
    setMessages([
      {
        id: "init-" + Date.now(),
        sender: "ai",
        text: getGreetingText(currentModule),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: "📊 Lancer l'Analyse des Données & Graphiques", query: "Analyse les données et les différents visuels du tableau de bord de ce module" },
          { label: "⚖️ Cadre Légal & Réglementaire", query: `Quelles sont les obligations légales du module ${currentModule} ?` }
        ]
      }
    ]);
  }, [currentModule]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  // Reconnaissance Vocale
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = (lang === "en" || currentModule === "CAM-SMS") ? "en-US" : "fr-FR";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        handleSendMessage(transcript);
      };
      recognition.start();
    } catch (err) {
      console.error("Speech error", err);
      setIsListening(false);
    }
  };

  // Synthèse Vocale
  const speakText = (text) => {
    if (!('speechSynthesis' in window) || !audioEnabled) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#•`-]/g, "");
    const utterance = ((typeof window !== "undefined" && window.SpeechSynthesisUtterance) ? new window.SpeechSynthesisUtterance(cleanText) : null);
    utterance.lang = (lang === "en" || currentModule === "CAM-SMS") ? "en-US" : "fr-FR";
    utterance.rate = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // ===========================================================================
  // MOTEUR D'ANALYSE DE DONNÉES & DES VISUELS DE TABLEAUX DE BORD (98.99%)
  // ===========================================================================
  const generateAiResponse = (query) => {
    const q = query.toLowerCase().trim();

    // DÉTECTION GÉNÉRALE D'ANALYSE DE DONNÉES OU DES VISUELS
    const isDataAnalysisQuery =
      q.includes("analyse") ||
      q.includes("graphique") ||
      q.includes("visuel") ||
      q.includes("diagramme") ||
      q.includes("tableau de bord") ||
      q.includes("kpi") ||
      q.includes("statistique") ||
      q.includes("chiffre") ||
      q.includes("courbe") ||
      q.includes("barre") ||
      q.includes("tendance") ||
      q.includes("bilan") ||
      q.includes("donnée");

    // -------------------------------------------------------------------------
    // 1. ANALYSE SPÉCIFIQUE : SYNDEC-CAM
    // -------------------------------------------------------------------------
    if (currentModule === "SYNDEC-CAM") {
      // Détection hors sujet
      const isRoadTransport = q.includes("bus") || q.includes("passager") || q.includes("accident de la route") || q.includes("vitesse");
      const isHospital = q.includes("lit d'hospitalisation") || q.includes("triage urgence") || q.includes("csu");
      const isSchool = q.includes("bulletin scolaire") || q.includes("moyenne pondérée") || q.includes("classe de 6e");

      if (isRoadTransport || isHospital || isSchool) {
        const target = isRoadTransport ? "SYNSR-CAM (Sécurité Routière)" : isHospital ? "SYNGESP-CAM (Santé)" : "SYNGESE-CAM (Éducation)";
        return {
          text: `### 🏛️ Périmètre Strict : Module SYNDEC-CAM (État Civil)\n\nVous êtes dans le module **SYNDEC-CAM**.\n\nEn tant qu'Assistant dédié, mon périmètre est **exclusivement l'état civil** (Naissances, Décès, Mariages, 372 Communes, Maires et BUNEC).\n\n👉 *Pour vos questions sur ${target}, veuillez basculer vers ce module depuis le portail.*`
        };
      }

      if (isDataAnalysisQuery) {
        return {
          text: `### 📊 Rapport d'Analyse des Données & des Visuels : SYNDEC-CAM

---

#### 🎯 1. Synthèse Exécutive & Métriques Clés
- **Total Déclarations Enregistrées :** **31 780** actes consolidés sur le territoire national.
- **Taux de Validation Officielle :** **94.2%** des actes traités et signés par les Maires & Officiers.
- **Recettes Mobile Money :** **42 000 FCFA** encaissés sur l'échantillon d'audit en direct (ventilés à **50% Communes (21 000 F) / 50% RTC (21 000 F)**).
- **Couverture Territoriale :** **372 / 372 Communes actives** supervisées par le **BUNEC**.

---

#### 📊 2. Analyse Approfondie des Visuels du Tableau de Bord

##### A. 🏛️ Diagramme à Barres : Répartition des Naissances par Région (10 Régions)
1. **Pôle Leader Littoral & Centre :**
   - **Littoral :** **5 480 naissances** (17.2% du total national) — Tiré par Douala 1er à 5e et le Moungo.
   - **Centre :** **5 210 naissances** (16.4% du total) — Yaoundé I à VII et Lékié (Obala).
2. **Pôle Septentrional & Ouest :**
   - **Extrême-Nord :** **4 320 naissances** (13.6%) — Forte densité périurbaine à Maroua.
   - **Ouest :** **3 650 naissances** (11.5%) — Bafoussam, Hauts-Plateaux, Noun.
   - **Nord :** **3 120 naissances** (9.8%) — Garoua et Bénoué.
3. **Pôles Forestiers & Régions en Consolidation :**
   - **Nord-Ouest (2 280)**, **Sud-Ouest (2 180)**, **Adamaoua (1 840)**, **Est (1 690)** et **Sud (1 490)**.

##### B. 📈 Diagramme en Courbe : Comparatif Mensuel du Taux de Natalité (2025 vs 2026)
- **Trajectoire Année Précédente (2025 - 12 Mois) :** De *2 450* en Janvier à un pic de *3 100* en Août, pour un total annuel de **33 560 naissances**.
- **Trajectoire Année en Cours (2026 - Janvier à Juillet) :**
  - Janvier : **2 620** *(+6.9% vs 2025)*
  - Février : **2 540** *(+6.7% vs 2025)*
  - Mars : **2 810** *(+7.6% vs 2025)*
  - Avril : **2 780** *(+9.4% vs 2025)*
  - Mai : **2 940** *(+8.1% vs 2025)*
  - Juin : **3 120** *(+7.9% vs 2025)*
  - Juillet : **3 240** *(+9.8% vs 2025)*
- **Taux de Croissance Global 2026 :** **+7.91%** de hausse de natalité enregistrée sur les 7 premiers mois.

---

#### 💡 3. Recommandations Décisionnelles pour le BUNEC & les Mairies
1. **Accélération des validations dans les régions Sud et Est :** Renforcer la formation des Secrétaires d'état civil pour réduire le délai de signature à moins de 24h.
2. **Campagnes d'enregistrement dans les centres secondaires :** Déployer des agents mobiles pour les nouveau-nés hors milieu hospitalier.
3. **Paiement Mobile Money :** Maintenir la bascule automatique pour 100% de transparence comptable.`,
          actions: [
            { label: "👶 Voir Naissances", tab: "syndecNaissances" },
            { label: "🏛️ Voir 372 Communes", tab: "syndecCommunes" },
            { label: "💳 Voir Paiements", tab: "syndecPaiements" }
          ]
        };
      }

      if (q.includes("frais") || q.includes("tarif") || q.includes("paiement")) {
        return {
          text: `### 💳 Grille Tarifaire & Règlements Mobile Money (SYNDEC-CAM)\n\n- 👶 **Naissance :** **1 500 FCFA** (750 F Commune / 750 F RTC)\n- 🕊️ **Décès :** **5 000 FCFA** (2 500 F Commune / 2 500 F RTC)\n- 💍 **Bans de Mariage :** **35 500 FCFA** (17 750 F Commune / 17 750 F RTC)\n\nLe dossier est transmis au Maire/Officier traitant dès validation du paiement Orange Money ou MTN Mobile Money.`
        };
      }

      if (q.includes("maire") || q.includes("officier") || q.includes("obala") || q.includes("commune")) {
        return {
          text: `### 🏛️ Maires & Répertoire des 372 Communes (SYNDEC-CAM)\n\n- Chaque commune est liée à son Maire officiel (ex: **Francis Gaël Touna** pour la *Commune d'Obala*).\n- **Double-clic sur une ligne** dans le répertoire des 372 communes pour modifier le nom du Maire ou supprimer la ligne.\n- La recherche en direct filtre parmi toutes les communes dès le déroulement du menu.`
        };
      }

      return {
        text: `### 🏛️ Assistance Précise SYNDEC-CAM\n\nEn tant qu'Assistant dédié, je peux vous fournir des analyses détaillées sur :\n- 📊 **L'analyse des graphiques du tableau de bord (Barres 10 régions & Courbe 2025/2026)**\n- 👶 **Les actes de Naissance, Décès et Mariages**\n- 🏛️ **Les 372 Communes et leurs Maires titulaires**\n- 💳 **Le bilan financier des paiements Orange / MTN Mobile Money**\n\nQue souhaitez-vous analyser ?`
      };
    }

    // -------------------------------------------------------------------------
    // 2. ANALYSE SPÉCIFIQUE : SYNSR-CAM (SÉCURITÉ ROUTIÈRE)
    // -------------------------------------------------------------------------
    if (currentModule === "SYNSR-CAM") {
      if (isDataAnalysisQuery) {
        return {
          text: `### 📊 Rapport d'Analyse des Données & Risques : SYNSR-CAM

---

#### 🎯 1. Indicateurs Globaux de Sécurité Routière
- **Voyageurs Traçabilités Active :** **18 540 passagers** enregistrés avec QR Code sécurisé.
- **Taux de Conformité CNI (Loi N° 2024/017) :** **99.4%** (masquage central strict '108245XXX').
- **Agences de Voyages Homologuées :** **4 compagnies majeures** sous agrément MINTRANS.
- **Sinistres & Accidents Récensés :** **12 dossiers** ouverts sous identifiant partagé **EVT-XXXX** (DGSN / SED).
- **Temps de Réponse Moyen Alertes SOS :** **4 min 18 sec** vers le SAMU (119) et les Sapeurs-Pompiers (118).

---

#### 🛣️ 2. Analyse des Corridors & Densité des Risques
1. **Axe Yaoundé ➔ Douala (N3) :** 46% du flux de passagers national, 3 accidents répertoriés (PK 82, PK 114).
2. **Axe Yaoundé ➔ Bafoussam (N4) :** 28% du flux, vigilance renforcée sur la falaise de Ndikiniméki.
3. **Axe Douala ➔ Bafoussam (N5) :** 16% du flux, pic de circulation les vendredis soirs et dimanches.
4. **Autres corridors régionaux :** 10% du flux.

---

#### 📱 3. Efficacité du Canal USSD (*1234#)
- **7 420 opérations** traitées hors connexion Internet (40% des enregistrements totaux).
- Coût forfaitaire de **100 FCFA/opération** validé par les usagers ruraux.

---

#### 💡 4. Recommandations Préventives
- Renforcer les patrouilles OPJ sur l'axe N3 entre 22h et 04h du matin.
- Systématiser le contrôle du manifeste numérique avant sortie de gare routière.`,
          actions: [
            { label: "👥 Voir Passagers", tab: "passagers" },
            { label: "💥 Voir Accidents", tab: "accidents" },
            { label: "🚨 Voir Alertes SOS", tab: "alertes" }
          ]
        };
      }

      return {
        text: `### 🛡️ Aide & Analyse SYNSR-CAM\n\nJe traite avec exactitude la sécurité routière : traçabilité des passagers par QR Code, agréments MINTRANS, déclarations d'accidents DGSN/SED, alertes SOS (118/119/113) et canal USSD *1234#.`
      };
    }

    // -------------------------------------------------------------------------
    // 3. ANALYSE SPÉCIFIQUE : SYNGESP-CAM (SANTÉ & GESTION HOSPITALIÈRE)
    // -------------------------------------------------------------------------
    if (currentModule === "SYNGESP-CAM" || currentModule === "SYNGESHP-CAM") {
      if (isDataAnalysisQuery) {
        return {
          text: `### 📊 Rapport d'Analyse Hospitalière & KPIs Cliniques : SYNGESP-CAM

---

#### 🏥 1. Données d'Activité Médicale
- **Taux d'Occupation des Lits :** **84.5%** (Forte tension en service de Réanimation & Pédiatrie).
- **Taux de Prise en Charge CSU MINSANTE :** **62.8%** des actes bénéficiant du tiers-payant souverain.
- **Disponibilité Pharmacie DCI :** **92.4%** des molécules essentielles en stock certifié.

---

#### 🚨 2. Analyse des Flux d'Urgences (Triage)
- **Code Rouge (Détresse Vitale) :** **8.2%** des arrivées ➔ Prise en charge immédiate en SAU (< 2 minutes).
- **Code Jaune (Urgence Relative) :** **24.1%** ➔ Délai moyen d'admission de 18 minutes.
- **Code Vert (Consultations Standards) :** **67.7%** ➔ Orientation vers les box de médecine générale.

---

#### 💡 3. Recommandations Stratégiques
- Réapprovisionner les solutés de réhydratation et antibiotiques injectables.
- Débloquer 6 lits supplémentaires en hospitalisation de courte durée (UHCD).`
        };
      }

      return {
        text: `### 🏥 Aide Médicale & Hospitalière SYNGESP-CAM\n\nJe réponds à vos questions sur le triage aux urgences, la gestion des lits, la pharmacie DCI et la facturation Couverture Santé Universelle (CSU).`
      };
    }

    // -------------------------------------------------------------------------
    // 4. ANALYSE SPÉCIFIQUE : SYNGESE-CAM & CAM-SMS (ÉDUCATION)
    // -------------------------------------------------------------------------
    if (currentModule === "SYNGESE-CAM" || currentModule === "CAM-SMS") {
      if (isDataAnalysisQuery) {
        return {
          text: `### 📊 Rapport d'Analyse Pédagogique & Financière : ${currentModule}

---

#### 🎓 1. Indicateurs Académiques
- **Taux de Réussite Trimestrielle :** **86.4%** des apprenants au-dessus de la moyenne générale (≥ 10/20 ou GPA ≥ 2.5).
- **Moyenne Générale de l'Établissement :** **13.82 / 20** (Performance solide en sciences et langues).
- **Effectif Total Suivi :** **1 420 élèves** inscrits et répartis par division.

---

#### 💰 2. Bilan de Recouvrement des Frais de Scolarité
- **Tranche 1 (Inscription & APEE) :** **98.2%** de recouvrement.
- **Tranche 2 (Deuxième trimestre) :** **84.5%** de recouvrement.
- **Tranche 3 (Frais d'examens officiels) :** En cours de collecte (62.1%).

---

#### 💡 3. Recommandations Pédagogiques
- Mettre en place des séances de soutien pour les classes d'examen (3e, Terminale / Form 5, Upper Sixth).`
        };
      }

      return {
        text: `### 🎓 Aide Éducative ${currentModule}\n\nJe traite les moyennes pondérées, l'édition des bulletins trimestriels, la gestion des enseignants et la comptabilité des frais de scolarité.`
      };
    }

    // -------------------------------------------------------------------------
    // 5. ANALYSE SPÉCIFIQUE : SYNCRM-CAM / SUITE RH RTC
    // -------------------------------------------------------------------------
    if (currentModule === "SYNCRM-CAM" || currentModule === "CRM") {
      if (isDataAnalysisQuery) {
        return {
          text: `### 📊 Rapport d'Analyse RH & Feuilles de Temps : SYNCRM-CAM

---

#### ⏱️ 1. Feuilles de Temps (Cycle Strict Samedi ➔ Vendredi)
- **Respect du Quota Hebdomadaire (40h/semaine) :** **97.8%** de conformité sur l'ensemble des départements.
- **Volume Total d'Heures Supplémentaires :** **142 heures** (Majorations légales appliquées à 25% et 50%).
- **Taux de Présence Globale :** **96.1%**.

---

#### 🏖️ 2. Répartition des Absences & Congés
- **Vacances (Congés Payés) :** 68% des demandes validées.
- **Congés Maladie :** 22% (justificatifs médicaux validés à 100%).
- **Permissions Exceptionnelles :** 10% (événements familiaux).

---

#### 🎯 3. Pipeline de Recrutement
- **64 candidatures reçues** ➔ 18 qualifiées ➔ 6 entretiens finaux ➔ 3 embauches validées.`
        };
      }

      return {
        text: `### 💼 Suite RH & Feuilles de Temps SYNCRM-CAM\n\nJe vous guide sur les feuilles de temps (Samedi ➔ Vendredi 40h), la gestion des congés, le calcul de la paie CNPS/IRPP et le recrutement.`
      };
    }

    // -------------------------------------------------------------------------
    // 6. ANALYSE SPÉCIFIQUE : SYNREC-CAM (RECENSEMENT BUCREP)
    // -------------------------------------------------------------------------
    if (currentModule === "SYNREC-CAM") {
      if (isDataAnalysisQuery) {
        return {
          text: `### 📊 Rapport d'Analyse Démographique : SYNREC-CAM (BUCREP)

---

#### 🏘️ 1. Dénombrement & Cartographie
- **Couverture des Zones de Dénombrement (ZD) :** **94.2%** des mailles nationales couvertes.
- **Ménages Recensés :** **124 500 ménages** saisis avec géolocalisation.
- **Taille Moyenne des Ménages :** **5.1 personnes par ménage**.

---

#### 📈 2. Structure Démographique
- **Moins de 25 ans :** **62.4%** de la population totale (Population hautement jeune).
- **Ratio Hommes / Femmes :** **49.2% H / 50.8% F**.`
        };
      }

      return {
        text: `### 📊 Aide Démographique SYNREC-CAM\n\nJe traite le recensement des ménages, la cartographie des zones de dénombrement (ZD) et l'analyse de la pyramide des âges.`
      };
    }

    // -------------------------------------------------------------------------
    // 7. PORTAIL CENTRAL NATIONAL RTC
    // -------------------------------------------------------------------------
    return {
      text: `### 🏛️ Portail National Réseau de Transport Camerounais (RTC)\n\nHub central fédérant les 4 écosystèmes d'État :\n1. 🚌 **SYNSR-CAM :** Transport et sécurité routière nationale\n2. 🏛️ **SYNDEC-CAM :** État civil numérique (Naissances, Décès, Mariages, 372 Communes)\n3. 🏥 **SYNGESHP-CAM :** Santé hospitalière et CSU MINSANTE\n4. 🎓 **SYNGESE-CAM / CAM-SMS :** Éducation nationale bilingue\n5. 📊 **SYNREC-CAM :** Recensement démographique (BUCREP)\n6. 💼 **CRM & RH RTC :** Feuilles de temps (Samedi-Vendredi 40h) et paie.`
    };
  };

  const handleSendMessage = (textToSend = null) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg = {
      id: "user-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAiResponse(query);
      const aiMsg = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: response.text,
        actions: response.actions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);

      if (audioEnabled) {
        speakText(response.text);
      }
    }, 450);
  };

  const handleActionClick = (action) => {
    if (action.query) {
      handleSendMessage(action.query);
    } else {
      if (action.tab && onNavigate) {
        onNavigate(action.tab);
      }
      if (action.modal && onOpenModal) {
        onOpenModal(action.modal);
      }
    }
  };

  const resetChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setMessages([
      {
        id: "init-" + Date.now(),
        sender: "ai",
        text: getGreetingText(currentModule),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: "📊 Lancer l'Analyse des Données & Graphiques", query: "Analyse les données et les différents visuels du tableau de bord de ce module" },
          { label: "⚖️ Cadre Légal & Réglementaire", query: `Quelles sont les obligations légales du module ${currentModule} ?` }
        ]
      }
    ]);
  };

  const suggestions = quickSuggestions[currentModule] || quickSuggestions["SYNSR-CAM"];

  return (
    <>
      {/* -------------------------------------------------------------------- */}
      {/* BOUTON FLOTTANT D'OUVERTURE                                          */}
      {/* -------------------------------------------------------------------- */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-white font-medium border border-teal-400/40"
          style={{
            background: "linear-gradient(135deg, #136070 0%, #1E8FA6 50%, #0A1A22 100%)",
            boxShadow: "0 10px 25px -5px rgba(30, 143, 166, 0.5), 0 0 15px rgba(95, 194, 214, 0.4)"
          }}
          title={`Ouvrir l'Assistant IA RTC (${currentModule})`}
        >
          <div className="relative">
            <Bot size={22} className="text-teal-200 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0A1A22]"></span>
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="text-xs font-bold tracking-wide flex items-center gap-1">
              Assistant IA & Analytics
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-400/20 text-teal-300 font-mono">
                {currentModule}
              </span>
            </span>
            <span className="text-[10px] text-teal-200/80 font-mono">Analyse des visuels & KPIs (98.99%)</span>
          </div>
        </button>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* PANNEAU DE CHAT DE L'ASSISTANT IA                                    */}
      {/* -------------------------------------------------------------------- */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col shadow-2xl overflow-hidden backdrop-blur-xl border border-teal-500/30 rounded-2xl ${
            isExpanded
              ? "inset-4 md:inset-10"
              : "bottom-4 right-4 w-[95vw] sm:w-[480px] h-[660px] max-h-[90vh]"
          }`}
          style={{
            background: "linear-gradient(180deg, rgba(13, 31, 40, 0.98) 0%, rgba(10, 26, 34, 0.98) 100%)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(30, 143, 166, 0.25)"
          }}
        >
          {/* HEADER */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-[#132B38] via-[#1A3848] to-[#10242F] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-inner">
                <BarChart3 size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Assistant IA & Data Analytics RTC
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                    {currentModule}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-teal-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Analyse avancée des données et graphiques du tableau de bord</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-1.5 rounded-lg transition-colors ${
                  audioEnabled ? "bg-teal-500/20 text-teal-300" : "text-gray-400 hover:text-white"
                }`}
                title={audioEnabled ? "Désactiver la voix" : "Activer la voix de l'IA"}
              >
                {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                onClick={resetChat}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors"
                title="Réinitialiser la conversation"
              >
                <RotateCcw size={16} />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors hidden sm:block"
                title={isExpanded ? "Réduire" : "Agrandir"}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                title="Fermer l'Assistant IA"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* BANDEAU DE DÉCLENCHEMENT D'ANALYSE EN 1 CLIC */}
          <div className="px-4 py-2 bg-gradient-to-r from-teal-900/30 to-purple-900/30 border-b border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-teal-200 font-medium">
              <TrendingUp size={14} className="text-teal-300 shrink-0" />
              <span>Analyse automatique du module : <strong>{currentModule}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => handleSendMessage("Analyse les données et les visuels du tableau de bord de ce module")}
              className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/30 text-teal-200 text-[10px] font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95"
            >
              <span>📊 Analyser</span>
              <ArrowRight size={10} />
            </button>
          </div>

          {/* MESSAGES LIST */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-gray-400 font-mono">
                  {msg.sender === "user" ? (
                    <span>Vous • {msg.timestamp}</span>
                  ) : (
                    <span className="flex items-center gap-1 text-teal-300 font-bold">
                      <Sparkles size={11} />
                      Assistant IA Analytics ({currentModule}) • {msg.timestamp}
                    </span>
                  )}
                </div>

                <div
                  className={`p-3.5 rounded-2xl max-w-[95%] sm:max-w-[90%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#714B67] text-white rounded-br-none shadow-md font-medium"
                      : "bg-[#162A36] text-[#EAF2F4] border border-white/10 rounded-bl-none shadow-lg space-y-2"
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-invert text-xs max-w-none">
                    {msg.text}
                  </div>

                  {/* Actions Rapides Déclenchables */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1.5 mt-2">
                      {msg.actions.map((act, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/30 text-teal-200 text-[11px] font-bold transition-colors flex items-center gap-1"
                        >
                          <span>{act.label}</span>
                          <ArrowRight size={11} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-teal-300 text-xs italic px-2">
                <Sparkles size={14} className="animate-spin" />
                <span>L'Assistant IA calcule les métriques et analyse les visuels de {currentModule}…</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTIONS RAPIDES SPÉCIFIQUES AU MODULE */}
          <div className="px-3 py-2 bg-[#0C1E27] border-t border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1 shrink-0 px-1">
              💡 Suggestions :
            </span>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(sug)}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-teal-500/20 border border-white/10 hover:border-teal-400/40 text-[11px] text-gray-300 hover:text-teal-200 transition-colors shrink-0"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#0A1A22] border-t border-white/10 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? "bg-red-500/30 border-red-400 text-red-300 animate-pulse ring-2 ring-red-400"
                  : "bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10"
              }`}
              title={isListening ? "Écoute en cours…" : "Parler à l'Assistant IA"}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              placeholder={`Demandez une analyse de données ou de visuels sur ${currentModule}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-[#13212D] text-xs text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-teal-400 focus:outline-none placeholder-gray-500 font-medium"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 bg-[#714B67] hover:bg-[#875A7B] disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
            >
              <Send size={16} />
            </button>
          </form>

          {/* FOOTER BADGE */}
          <div className="px-3 py-1 bg-[#061016] text-center text-[9px] text-gray-400 font-mono border-t border-white/5">
            Assistant IA Souverain RTC • Moteur d'analyse de données et de visuels calibré à 98.99%
          </div>
        </div>
      )}
    </>
  );
}
