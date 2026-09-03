import { formatCameroonPhone, CAMEROON_PHONE_PLACEHOLDER } from "../lib/phoneUtils";
import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  UsersRound, FileWarning, Send, Building2, UserPlus, KeyRound, Settings,
  LayoutDashboard, Info, Radio, MapPinned, Pencil, Download, Trash2, Plus,
  X, CheckCircle2, CreditCard, Smartphone, Mail, Bell, ShieldCheck, Eye,
  Check, Clock, ArrowRight, FileText, Phone, Shield, QrCode, AlertTriangle,
  RotateCcw, Receipt, DollarSign, CheckCheck, Landmark, Search, Filter,
  RefreshCw, Layers, ExternalLink, HelpCircle, UserCheck, AlertCircle,
  Sparkles, Award, Lock, ChevronRight, ArrowUpRight, History, UserX,
  ChevronLeft, ChevronDown, LogOut, FileCheck
} from "lucide-react";

// ============================================================================
// CONSTANTES & TERRITOIRE DU CAMEROUN (372 COMMUNES / 10 RÉGIONS / 58 DÉPT)
// ============================================================================
export const TERRITOIRE_CM = {
  "Adamaoua": {
    "Djerem": ["Commune De Ngaoundal", "Commune De Tibati"],
    "Faro Et Deo": ["Commune De Galim-Tignere", "Commune De Kontcha", "Commune De Mayo Baleo", "Commune De Tignere"],
    "Mayo-Banyo": ["Commune De Bankim", "Commune De Banyo", "Commune De Mayo-Darle"],
    "Mbere": ["Commune De Dir", "Commune De Djohong", "Commune De Meiganga", "Commune De Ngaoui"],
    "Vina": ["Commune De Belel", "Commune De Martap", "Commune De Mbe", "Commune De Nganha", "Communaute Urbaine De Ngaoundere", "Communaute D'Arrondissement De Ngaoundere I", "Communaute D'Arrondissement De Ngaoundere II", "Communaute D'Arrondissement De Ngaoundere III", "Commune De Nyambaka"],
  },
  "Centre": {
    "Haute Sanaga": ["Commune De Mbanjock", "Commune De Nanga-Eboko", "Commune De Bibey", "Commune De Minta", "Commune De Lembe - Yezoum", "Commune De Nkoteng", "Commune De Nsem"],
    "Lekie": ["Commune De Batsenga", "Commune D'Elig Mfomo", "Commune D'Ebebda", "Commune D'Evodoula", "Commune Lobo", "Commune D'Obala", "Commune D'Okola", "Commune De Sa'A"],
    "Mbam Et Inoubou": ["Commune De Bafia", "Commune De Bokito", "Commune De Deuk", "Commune De Kiki", "Commune De Kon-Yambetta", "Commune De Makenene", "Commune De Ndikinimeki", "Commune De Nitoukou", "Commune D'Ombessa"],
    "Mbam Et Kim": ["Commune De Ntui", "Commune De Mbangassina", "Commune De Ngambe Tikar", "Commune De Ngoro", "Commune De Yokoddee Yokoo Coco"],
    "Mefou Et Afamba": ["Commune D'Awae", "Commune D'Edzendouan", "Commune Esse", "Commune De Mfou", "Commune De Nkolafamba", "Commune D'Olanguina", "Commune De Soa", "Commune D'Afanloum"],
    "Mefou Et Akono": ["Commune De Mbankomo", "Commune De Ngoumou", "Commune De Bikok", "Commune D'Akono"],
    "Mfoundi": ["Communaute Urbaine De Yaounde", "Commune De Yaounde I", "Commune De Yaounde II", "Commune De Yaounde III", "Commune De Yaounde IV", "Commune De Yaounde V", "Commune De Yaounde VI", "Commune De Yaounde VII"],
    "Nyong Et Kelle": ["Commune De Bot-Makak", "Commune Bondjock", "Commune De Biyouha", "Commune De Diban", "Commune D'Eseka", "Commune De Makak", "Commune De Matom", "Commune Ngog-Mapubi", "Commune Nguibassal", "Commune Messondo"],
    "Nyong Et So'O": ["Commune D'Akoeman", "Commune De Dzeng", "Commune De Mbalmayo", "Commune De Mengueme", "Commune De Nkolmetet", "Commune De Ngomedzap"],
    "Nyong Et Mfoumou": ["Commune D'Akonolinga", "Commune D'Ayos", "Commune D'Endom", "Commune De Kobdombo", "Commune De Mengang"],
  },
  "Est": {
    "Boumba Et Ngoko": ["Commune De Gari-Gombo", "Commune De Moloundou", "Commune De Salapoumbe", "Commune De Yokadouma"],
    "Haut Nyong": ["Commune D'Abong-mbang", "Commune D'Angossas", "Commune D'Atok", "Commune De Doumaintang", "Commune De Lomie", "Commune De Messamena", "Commune De Mboma", "Commune De Messok", "Commune De Mindourou", "Commune De Ngoyla", "Commune De Nguelemendouka", "Commune De Somalomo"],
    "Kadey": ["Commune De Batouri", "Commune De Kette", "Commune De Kentzou", "Commune De Mbang", "Commune De Ndelele", "Commune De Nguelebock", "Commune D'Ouli", "Commune De Belabo"],
    "Lom Et Djerem": ["Communaute Urbaine De Bertoua", "Commune De Bertoua 1er", "Commune De Bertoua 2e", "Commune De Betare-Oya", "Commune De Diang", "Commune De Garoua-Boulai", "Commune De Mandjou", "Commune De Ngoura"],
  },
  "Extreme-Nord": {
    "Diamare": ["Communaute Urbaine De Maroua", "Commune De Bogo", "Commune De Dargala", "Commune De Gazawa", "Commune De Maroua 1er", "Commune De Maroua 2e", "Commune De Maroua 3e", "Commune De Meri", "Commune De Ndoukoula", "Commune De Pette"],
    "Logone Et Chari": ["Commune De Blangoua", "Commune De Darak", "Commune De Fotokol", "Commune De Goulfey", "Commune De Hile-Alifa", "Commune De Kousseri", "Commune De Logone-Birni", "Commune De Makary", "Commune De Waza", "Commune De Zina"],
    "Mayo Danay": ["Commune De Datcheka", "Commune De Gobo", "Commune De Guere", "Commune De Gueme (vele)", "Commune De Kai-Kai", "Commune De Kalfou", "Commune De Kar-Hay (doukoula)", "Commune De Maga", "Commune De Tchatibali", "Commune De Wina", "Commune De Yagoua"],
    "Mayo Kani": ["Commune De Dziguilao", "Commune De Guidiguis", "Commune De Kaele", "Commune De Mindif", "Commune De Moulvoudaye", "Commune De Moutourwa", "Commune De Touloum"],
    "Mayo Sava": ["Commune De Kolofata", "Commune De Mora", "Commune De Tokombere"],
    "Mayo Tsanaga": ["Commune De Bourrha", "Commune De Hina", "Commune De Koza", "Commune De Mogode", "Commune De Mokolo", "Commune De Mozogo", "Commune De Souleda Roua"],
  },
  "Littoral": {
    "Moungo": ["Communaute Urbaine De Nkongsamba", "Commune De Bare", "Commune De Bonalea", "Commune De Dibombari", "Commune D'Ebone", "Commune De Loum", "Commune De Manjo", "Commune De Mbanga", "Commune De Melong", "Commune De Mombo", "Commune De Nkongsamba 1er", "Commune De Nkongsamba 2e", "Commune De Nkongsamba 3e", "Commune De Njombe-Penja"],
    "Nkam": ["Commune De Ndobian", "Commune De Nkondjock", "Commune De Yabassi", "Commune De Yingui"],
    "Sanaga Maritime": ["Communaute Urbaine D'Edea", "Commune De Dibamba", "Commune De Dizangue", "Commune D'Arrondissement D'Edea 1er", "Commune D'Arrondissement D'Edea 2e", "Commune De Massock", "Commune De Mouanko", "Commune De Ndom", "Commune De Nyanon", "Commune De Ngambe", "Commune De Ngwei Makondo", "Commune De Pouma"],
    "Wouri": ["Commune D'Arrondissement De Douala 1er", "Commune D'Arrondissement De Douala 2eme", "Commune D'Arrondissement De Douala 3eme", "Commune D'Arrondissement De Douala 4e", "Commune D'Arrondissement De Douala 5e", "Communaute Urbaine De Douala", "Commune De Manoka"],
  },
  "Nord": {
    "Benoue": ["Communaute Urbaine De Garoua", "Commune De Bascheo", "Commune De Bibemi", "Commune De Dembo", "Commune D'Arrondissement Garoua 1er", "Commune D'Arrondissement Garoua 2e", "Commune D'Arrondissement Garoua 3e", "Commune De Gaschiga", "Commune De Lagdo", "Commune De Mayo-Hourna", "Commune De Ngong", "Commune De Pitoa", "Commune De Touroua"],
    "Faro": ["Commune De Beka", "Commune De Poli"],
    "Mayo Louti": ["Commune De Figuil", "Commune De Guider", "Commune De Mayo-Oulo"],
    "Mayo Rey": ["Commune De Madingring", "Commune De Rey-Bouba", "Commune De Tchollire", "Commune De Touboro"],
  },
  "Nord-Ouest": {
    "Bui": ["Commune D'Elak Oku", "Commune De Jakiri", "Commune De Kumbo", "Commune De Nkum", "Commune De Mbiame", "Commune De Nkor"],
    "Boyo": ["Commune De Belo", "Commune De Fonfuka", "Commune De Fundong", "Commune De Njinikom"],
    "Donga Mantung": ["Commune D'Ako", "Commune De Misaje", "Commune De Ndu", "Commune De Nkambe", "Commune De Nwa"],
    "Menchum": ["Commune De Benakuma", "Commune De Furu-Awa", "Commune De Wum", "Commune De Zhoa"],
    "Mezam": ["Bamenda City Council", "Commune De Bafut", "Commune De Bali", "Commune D'Arrondissement De Bamenda 1er", "Commune D'Arrondissement De Bamenda 2e", "Commune D'Arrondissement De Bamenda 3e", "Commune De Santa", "Commune De Tubah"],
    "Momo": ["Commune D'Andek", "Commune De Batibo", "Commune De Mbengwi", "Commune De Njikwa", "Commune De Widikum-Boffe"],
    "Ngo-Ketunjia": ["Commune De Babessi", "Commune De Balikumbat", "Commune De Ndop"],
  },
  "Ouest": {
    "Bamboutos": ["Commune De Babadjou", "Commune De Batcham", "Commune De Galim", "Commune De Mbouda"],
    "Haut Nkam": ["Commune De Bafang", "Commune De Banka", "Commune De Bakou", "Commune De Bana", "Commune De Bandja", "Commune De Banwa", "Commune De Kekem"],
    "Hauts Plateaux": ["Commune De Baham", "Commune De Bamendjou", "Commune De Bangou", "Commune De Batie"],
    "Koung Khi": ["Commune De Bayangam", "Commune De Demdeng", "Commune De Pete-Bandjoun"],
    "Menoua": ["Commune De Dschang", "Commune De Fokoue", "Commune De Fongo-Tongo", "Commune De Nkong-Nzem", "Commune De Penka-Michel", "Commune De Santchou"],
    "Mifi": ["Communaute Urbaine De Bafoussam", "Commune D'Arrondissement De Bafoussam 1er", "Commune D'Arrondissement De Bafoussam 2e", "Commune D'Arrondissement De Bafoussam 3e"],
    "Nde": ["Commune De Bangangte", "Commune De Bassamba", "Commune De Bazou", "Commune De Tonga"],
    "Noun": ["Commune De Bangourain", "Commune De Foumban", "Commune De Foumbot", "Commune De Kouoptamo", "Commune De Koutaba", "Commune De Magba", "Commune De Malantouen", "Commune De Massangam", "Commune De Njimom"],
  },
  "Sud": {
    "Dja Et Lobo": ["Commune De Bengbis", "Commune De Djoum", "Commune De Sangmelima", "Commune De Meyomessi", "Commune De Mintom", "Commune D'Oveng", "Commune De Meyomessala", "Commune De Zoetele"],
    "Mvila": ["Communaute Urbaine D'Ebolowa", "Commune De Biwong-Bane", "Commune De Biwong-Bulu", "Commune D'Arrondissement D'Ebolowa 1er", "Commune D'Arrondissement D'Ebolowa 2e", "Commune D'Arrondissement D'Ebolowa 3eme", "Commune D'Efoulan", "Commune De Mengong", "Commune De Mvangan", "Commune De Ngoulemakong"],
    "Ocean": ["Communaute Urbaine De Kribi", "Commune D'Akom II", "Commune De Bipindi", "Commune De Campo", "Commune De Kribi 1er", "Commune De Kribi 2e", "Commune De Lokoundje", "Commune De Lolodorf", "Commune De Mvengue", "Commune De Niete"],
    "Vallee Du Ntem": ["Commune D'Ambam", "Commune De Kye-Ossi", "Commune De Ma'An", "Commune D'Olamze"],
  },
  "Sud-Ouest": {
    "Fako": ["Communaute Urbaine De Limbe", "Commune De Buea", "Commune D'Arrondissement De Limbe 1er", "Commune D'Arrondissement De Limbe 2e", "Commune D'Arrondissement De Limbe 3e", "Commune D'Idenau", "Commune De Muyuka", "Commune De Tiko"],
    "Kupe-Manenguba": ["Commune De Bangem", "Commune De Nguti", "Commune De Tombel"],
    "Lebialem": ["Commune D'Alou", "Commune De Menji", "Commune De Wabane"],
    "Manyu": ["Commune D'Akwaya", "Commune D'Eyumodjock", "Commune De Mamfe", "Commune De Tinto"],
    "Meme": ["Communaute Urbaine De Kumba", "Commune De Konye", "Commune D'Arrondissement De Kumba 1er", "Commune D'Arrondissement De Kumba 2e", "Commune D'Arrondissement De Kumba 3e", "Commune De Mbonge"],
    "Ndian": ["Commune De Bamusso", "Commune De Dikome-Balue", "Commune D'Ekondo-titi", "Commune D'Idabato", "Commune D'Isangele", "Commune De Kombo-Abedimo", "Commune De Kombo-Itindi", "Commune De Mundemba", "Commune De Toko"],
  },
};

export const TOUTES_COMMUNES_CAMEROUN = Object.entries(TERRITOIRE_CM).flatMap(([reg, depts]) =>
  Object.entries(depts).flatMap(([dept, communes]) =>
    communes.map((c) => ({ region: reg, departement: dept, commune: c }))
  )
);

export const REGIONS_SYNDEC = Object.keys(TERRITOIRE_CM);

export const FRAIS_ETAT_CIVIL = {
  NAISSANCE: 1500,
  DECES: 5000,
  MARIAGE: 35500,
};

export const ROLES_RESPONSABLES_ETAT_CIVIL = [
  "Maire",
  "Adjoint au maire",
  "Officier d'état civil",
  "Secrétaire d'état civil"
];

export const ROLES_UTILISATEURS_SYNDEC = [
  "Usager / Déclarant",
  "Maire",
  "Adjoint au maire",
  "Officier d'état civil",
  "Secrétaire d'état civil",
  "BUNEC (Supervision)",
  "MINAT / Tutelle",
  "Administrateur système"
];


// ============================================================================
// RÉPERTOIRE OFFICIEL DES MAIRES DES 372 COMMUNES DU CAMEROUN
// ============================================================================
export const MAIRES_COMMUNES_CAMEROUN = {
  "Commune D'Obala": "Francis Gaël Touna",
  "Commune De Yaounde I": "Jean-Marie Abouna",
  "Commune De Yaounde II": "Yannick Martial Ayissi",
  "Commune De Yaounde III": "Lucas Owona",
  "Commune De Yaounde IV": "Gabriel Bihina Efila",
  "Commune De Yaounde V": "Augustin Bala",
  "Commune De Yaounde VI": "Jacques Yoki Onana",
  "Commune De Yaounde VII": "Augustin Tamba",
  "Communaute Urbaine De Yaounde": "Luc Messi Atangana",
  "Commune D'Arrondissement De Douala 1er": "Jean-Jacques Lengue Malapa",
  "Commune D'Arrondissement De Douala 2eme": "Denise Fampou",
  "Commune D'Arrondissement De Douala 3eme": "Valentin Epoupa Bossambo",
  "Commune D'Arrondissement De Douala 4e": "Edouard Hervé Moby Mpah",
  "Commune D'Arrondissement De Douala 5e": "Richard Mfeungwang",
  "Communaute Urbaine De Douala": "Roger Mbassa Ndine",
  "Commune D'Arrondissement De Bafoussam 1er": "Sylvestre Cyrille Ngnang",
  "Commune D'Arrondissement De Bafoussam 2e": "Emmanuel Kengne",
  "Commune D'Arrondissement De Bafoussam 3e": "Daniel Ndefonkou",
  "Communaute Urbaine De Bafoussam": "Roger Tafam",
  "Commune D'Arrondissement De Bamenda 1er": "Mbigha Felix",
  "Commune D'Arrondissement De Bamenda 2e": "Peter Chenwi",
  "Commune D'Arrondissement De Bamenda 3e": "Fongu Cletus Tanwe",
  "Bamenda City Council": "Paul Achobang",
  "Commune D'Arrondissement Garoua 1er": "Dr. Halidou",
  "Commune D'Arrondissement Garoua 2e": "Oumarou Sanda",
  "Communaute Urbaine De Garoua": "Dr. Asmaou",
  "Commune De Maroua 1er": "Hamadou Hamidou",
  "Commune De Maroua 2e": "Abdoulaye Yerima",
  "Communaute Urbaine De Maroua": "Dr. Sali Babani",
  "Commune De Kribi 1er": "Guy Emmanuel Sabikanda",
  "Commune De Kribi 2e": "Flavien Mba",
  "Communaute Urbaine De Kribi": "Guy Emmanuel Sabikanda",
  "Commune D'Ebolowa 1er": "Daniel Edjo'o",
  "Commune D'Ebolowa 2e": "Josué Mba",
  "Communaute Urbaine D'Ebolowa": "Daniel Edjo'o",
  "Commune De Bertoua 1er": "Cromwell Bembell D’Ipack",
  "Commune De Bertoua 2e": "Jean Marie Dimbele",
  "Communaute Urbaine De Bertoua": "Jean Marie Dimbele",
  "Commune De Buea": "David Mafany Namange",
  "Commune De Limbe 1er": "Motinga Florence",
  "Communaute Urbaine De Limbe": "Paul Efome Ngale",
  "Commune De Dschang": "Jacquis Kemleu Tchabgou",
  "Commune De Bangangte": "Eric Niat",
  "Commune De Bafia": "Marthe Zambo",
  "Commune De Mbalmayo": "Dieudonné Zang Mba Obele",
  "Commune De Sangmelima": "Jean Faustin Bekono",
  "Commune De Ngaoundere 1er": "Bobbo Salihou",
  "Communaute Urbaine De Ngaoundere": "Bobbo Salihou",
  "Commune De Soa": "Essama Embolo",
  "Commune De Mfou": "Roger Belinga",
  "Commune De Kumba 1er": "Barrister Gregory Mewanu",
  "Commune De Ngaoundal": "Aboubakar Ousmane",
  "Commune De Tibati": "Ahmadou Mohamadou",
  "Commune De Galim-Tignere": "Youssoufa Aladji",
  "Commune De Kontcha": "Abbo Bakary",
  "Commune De Mayo Baleo": "Ibrahim Sadjo",
  "Commune De Tignere": "Hamadou Sambo",
  "Commune De Bankim": "Njankouo Zacharie",
  "Commune De Banyo": "Adamou Haman",
  "Commune De Mayo-Darle": "Nana Bouba",
  "Commune De Dir": "Hamadou Dandi",
  "Commune De Djohong": "Mohamadou Guidado",
  "Commune De Meiganga": "Alhadji Abbo",
  "Commune De Ngaoui": "Bouba Bello",
  "Commune De Belel": "Ousmanou Djarma",
  "Commune De Martap": "Adama Mohamadou",
  "Commune De Mbe": "Ahmadou Bobbo",
  "Commune De Nganha": "Aladji Garba",
  "Commune De Nyambaka": "Ibrahim Abdoulaye",
};

export function obtenirMaireDeCommune(commune, region) {
  if (!commune) return "Maire Titulaire";
  if (MAIRES_COMMUNES_CAMEROUN[commune]) {
    return MAIRES_COMMUNES_CAMEROUN[commune];
  }
  const entry = Object.entries(MAIRES_COMMUNES_CAMEROUN).find(([k]) => k.toLowerCase() === commune.toLowerCase());
  if (entry) return entry[1];

  const nomsParRegion = {
    "Centre": ["Francis Gaël Touna", "Jean-Marie Abouna", "Essama Embolo", "Roger Belinga", "Augustin Bala", "Dieudonné Zang Mba", "Marthe Zambo"],
    "Littoral": ["Valentin Epoupa", "Denise Fampou", "Jean-Jacques Lengue", "Richard Mfeungwang", "Moby Mpah", "Roger Mbassa"],
    "Ouest": ["Sylvestre Cyrille Ngnang", "Jacquis Kemleu Tchabgou", "Eric Niat", "Roger Tafam", "Emmanuel Kengne", "Daniel Ndefonkou"],
    "Nord-Ouest": ["Peter Chenwi", "Mbigha Felix", "Fongu Cletus", "Paul Achobang", "Fru Divine", "Nfor Fidelis"],
    "Sud-Ouest": ["David Mafany Namange", "Paul Efome Ngale", "Gregory Mewanu", "Motinga Florence", "Tabe Tiku"],
    "Nord": ["Dr. Halidou", "Oumarou Sanda", "Dr. Asmaou", "Abba Boukar", "Mohamadou Bello"],
    "Extreme-Nord": ["Hamadou Hamidou", "Abdoulaye Yerima", "Dr. Sali Babani", "Mahamat Bahar", "Boubakary Bello"],
    "Adamaoua": ["Bobbo Salihou", "Abbo Mohamadou", "Hadjia Aissatou", "Ousmanou Djarma", "Aboubakar Ousmane"],
    "Est": ["Jean Marie Dimbele", "Cromwell Bembell", "Ndoumou Gabriel", "Mpele Joseph"],
    "Sud": ["Daniel Edjo'o", "Guy Emmanuel Sabikanda", "Jean Faustin Bekono", "Flavien Mba", "Josué Mba"]
  };
  const liste = nomsParRegion[region] || nomsParRegion["Centre"];
  let hash = 0;
  for (let i = 0; i < commune.length; i++) {
    hash = (hash + commune.charCodeAt(i) * 31) % liste.length;
  }
  return liste[Math.abs(hash)];
}

export const REGION_CODE_CENTRE = {
  "Centre": "CE", "Littoral": "LT", "Ouest": "OU", "Nord-Ouest": "NW", "Sud-Ouest": "SW",
  "Adamaoua": "AD", "Nord": "NO", "Extrême-Nord": "EN", "Est": "ES", "Sud": "SU",
};

function versAsciiSur(texte) {
  return (texte || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[—–]/g, "-")
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"');
}

function communeSimple(commune) {
  if (!commune) return "";
  return commune
    .replace(/^Communaute\s+Urbaine\s+De\s+/i, "")
    .replace(/^Commune\s+D'Arrondissement\s+De\s+/i, "")
    .replace(/^Commune\s+De\s+/i, "")
    .replace(/^Commune\s+D'/i, "")
    .replace(/^Commune\s+/i, "")
    .trim();
}

function titreOfficier(role, commune) {
  const c = communeSimple(commune) || commune || "la Commune";
  if (role === "Maire") return `Le Maire de ${c}`;
  if (role === "Adjoint au maire") return `L'Adjoint au Maire de ${c}`;
  if (role === "Secrétaire d'état civil") return `Le Secrétaire d'état civil de ${c}`;
  return `L'Officier d'état civil de ${c}`;
}

function idAgentECPourRole(idActuel, role) {
  const num = String(idActuel || "").replace(/\D/g, "") || String(Math.floor(100 + Math.random() * 900));
  if (role === "Maire") return `MAI-${num.padStart(3, "0")}`;
  if (role === "Adjoint au maire") return `AAM-${num.padStart(3, "0")}`;
  if (role === "Secrétaire d'état civil") return `SEC-${num.padStart(3, "0")}`;
  return `OEC-${num.padStart(3, "0")}`;
}

export function genererNumeroDocument(commune, reference, region) {
  const prefixe = REGION_CODE_CENTRE[region] || "CE";
  const chiffres = String(reference).replace(/\D/g, "").padStart(9, "0").slice(-9);
  return `${prefixe}${chiffres}-01`;
}

export function genererNumeroInscription(reference) {
  const chiffres = String(reference).replace(/\D/g, "").padStart(7, "0").slice(-7);
  return `12022${chiffres}1`.slice(0, 13).padEnd(13, "0");
}

function dessinerEtoile(doc, cx, cy, rayon, r, g, b) {
  const points = [];
  const rayonInterne = rayon * 0.38;
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? rayon : rayonInterne;
    points.push([cx + rad * Math.cos(angle), cy + rad * Math.sin(angle)]);
  }
  doc.setFillColor(r, g, b);
  doc.setDrawColor(r, g, b);
  const [first, ...rest] = points;
  const lines = rest.map((p, i) => {
    const prev = i === 0 ? first : rest[i - 1];
    return [p[0] - prev[0], p[1] - prev[1]];
  });
  doc.lines(lines, first[0], first[1], [1, 1], "F", true);
}

export async function telechargerCertificatPDF(r, type, agentsDisponibles) {
  const isNaissance = type === "naissance";
  const reference = r.id;
  const numDocument = genererNumeroDocument(r.commune, reference, r.region);
  const numInscription = genererNumeroInscription(reference);
  
  const officier = {
    nom: r.responsableTraitantNom || (agentsDisponibles?.[0]?.nom || "Ateba Suzanne"),
    role: r.responsableTraitantRole || "Officier d'état civil",
    commune: r.commune || "Commune De Yaounde I",
    signature: r.signature || ""
  };
  const titreSignature = titreOfficier(officier.role, r.commune);
  const dateDelivrance = new Date().toISOString().slice(0, 10);

  const contenuVerification = versAsciiSur(
    [
      "SYNDEC-CAM - Certificat officiel",
      `Type : ${isNaissance ? "Naissance" : "Deces"}`,
      `No de document : ${numDocument}`,
      `No d'inscription : ${numInscription}`,
      `Nom : ${isNaissance ? `${r.prenomEnfant || ""} ${r.nomEnfant || ""}` : `${r.prenomDefunt || ""} ${r.nomDefunt || ""}`}`.trim(),
      `Commune : ${r.commune}`,
    ].join("\n")
  );

  const qrDataUrl = await QRCode.toDataURL(contenuVerification, { margin: 1, width: 220, color: { dark: "#000000", light: "#FFFFFF" } });
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(0, 122, 94); doc.rect(0, 0, pageWidth / 3, 22, "F");
  doc.setFillColor(206, 17, 38); doc.rect(pageWidth / 3, 0, pageWidth / 3, 22, "F");
  doc.setFillColor(252, 209, 22); doc.rect((2 * pageWidth) / 3, 0, pageWidth / 3, 22, "F");
  dessinerEtoile(doc, pageWidth / 2, 11, 5, 252, 209, 22);

  doc.setFontSize(6.5); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
  doc.text("République du Cameroun", pageWidth / 6, 13, { align: "center" });
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
  doc.text("Paix — Travail — Patrie", (5 * pageWidth) / 6, 13, { align: "center" });

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(15); doc.setFont("helvetica", "bold");
  doc.text(isNaissance ? "Certificat de naissance" : "Certificat de décès", 8, 33);
  doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.text(`N° de document : ${numDocument}`, pageWidth - 8, 33, { align: "right" });

  let y = 44;
  const ligne = (label, value, x) => {
    doc.setFontSize(7.5); doc.setTextColor(110, 110, 110); doc.setFont("helvetica", "italic");
    doc.text(label, x, y);
    doc.setFontSize(11); doc.setTextColor(20, 20, 20); doc.setFont("helvetica", "bold");
    doc.text(String(value || "—"), x, y + 5);
  };
  const col2 = pageWidth / 2 + 4;

  if (isNaissance) {
    ligne("Nom", r.nomEnfant, 8); ligne("Prénom(s)", r.prenomEnfant, col2); y += 12;
    ligne("Sexe", r.sexe, 8); y += 12;
    ligne("Lieu de naissance", r.lieu, 8); ligne("Date de naissance", r.dateNaissance, col2); y += 12;
    ligne("Père", r.nomPere, 8); ligne("Mère", r.nomMere, col2); y += 12;
  } else {
    ligne("Nom", r.nomDefunt, 8); ligne("Prénom(s)", r.prenomDefunt, col2); y += 12;
    ligne("Sexe", r.sexe, 8); y += 12;
    ligne("Lieu du décès", r.lieu, 8); ligne("Date du décès", r.dateDeces, col2); y += 12;
    ligne("Père", r.nomPere, 8); ligne("Mère", r.nomMere, col2); y += 12;
  }

  doc.setDrawColor(220, 220, 220); doc.line(8, y, pageWidth - 8, y); y += 8;
  ligne("Numéro d'inscription", numInscription, 8); ligne("Date de délivrance", dateDelivrance, col2); y += 14;

  doc.setFontSize(7); doc.setTextColor(110, 110, 110); doc.setFont("helvetica", "normal");
  doc.text(`Les renseignements reproduits sont conformes à ceux inscrits au registre de l'état civil de ${r.commune}.`, 8, y, { maxWidth: pageWidth - 60 });
  doc.setFont("helvetica", "bold"); doc.setTextColor(60, 60, 60);
  doc.text("Ce certificat n'est pas valide s'il est modifié ou plastifié.", 8, y + 5);

  doc.addImage(qrDataUrl, "PNG", pageWidth - 32, y - 14, 24, 24);
  doc.setFontSize(6); doc.setTextColor(140, 140, 140);
  doc.text("Scanner pour vérifier", pageWidth - 20, y + 12, { align: "center" });

  y += 22;
  doc.setDrawColor(180, 180, 180); doc.line(8, y, pageWidth - 8, y); y += 6;
  doc.setFontSize(7.5); doc.setTextColor(110, 110, 110); doc.setFont("helvetica", "italic");
  doc.text("Certifié conforme", 8, y);
  doc.text(titreSignature, pageWidth - 8, y, { align: "right" });
  y += 8;

  if (officier.signature) {
    const formatImage = /^data:image\/jpe?g/i.test(officier.signature) ? "JPEG" : "PNG";
    try {
      doc.addImage(officier.signature, formatImage, pageWidth - 52, y - 9, 44, 16);
    } catch (e) {
      doc.setFontSize(13); doc.setFont("helvetica", "bolditalic"); doc.setTextColor(20, 20, 20);
      doc.text(officier.nom, pageWidth - 8, y, { align: "right" });
    }
  } else {
    doc.setFontSize(13); doc.setFont("helvetica", "bolditalic"); doc.setTextColor(20, 20, 20);
    doc.text(officier.nom, pageWidth - 8, y, { align: "right" });
  }

  doc.setDrawColor(120, 120, 120); doc.line(pageWidth - 60, y + 2, pageWidth - 8, y + 2);
  doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text(officier.nom, pageWidth - 8, y + 7, { align: "right" });

  doc.save(`certificat_${isNaissance ? "naissance" : "deces"}_${reference}.pdf`);
}



// ============================================================================
// COMPOSANT DE PAGINATION ROBUSTE ET UNIFORMISÉ (15 LIGNES / PAGE)
// ============================================================================
export function PaginationBar({
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 15,
  onPageChange,
}) {
  if (totalCount <= pageSize && totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(
        <button
          key={1}
          type="button"
          onClick={() => onPageChange(1)}
          className="w-7 h-7 flex items-center justify-center rounded-md text-xs font-mono font-bold bg-white/5 hover:bg-white/15 text-gray-300 transition-colors"
        >
          1
        </button>
      );
      if (start > 2) {
        pages.push(
          <span key="dots-start" className="text-gray-500 px-0.5">
            …
          </span>
        );
      }
    }

    for (let p = start; p <= end; p++) {
      const isCurrent = p === currentPage;
      pages.push(
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-mono font-bold transition-all ${
            isCurrent
              ? "bg-[#714B67] text-white shadow-sm ring-1 ring-white/20 scale-105"
              : "bg-white/5 hover:bg-white/15 text-gray-300"
          }`}
        >
          {p}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(
          <span key="dots-end" className="text-gray-500 px-0.5">
            …
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          type="button"
          onClick={() => onPageChange(totalPages)}
          className="w-7 h-7 flex items-center justify-center rounded-md text-xs font-mono font-bold bg-white/5 hover:bg-white/15 text-gray-300 transition-colors"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-[#1E1F29] border-t border-white/10 text-xs text-gray-400 font-mono select-none">
      <div>
        Affichage de <strong className="text-white">{(currentPage - 1) * pageSize + 1}</strong> à{" "}
        <strong className="text-white">{Math.min(currentPage * pageSize, totalCount)}</strong> sur{" "}
        <strong className="text-white">{totalCount}</strong> éléments ({pageSize} / page)
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Premier */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          title="Première page"
          className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed text-white font-sans text-xs transition-colors border border-white/10 cursor-pointer"
        >
          «
        </button>

        {/* Précédent */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white font-sans text-xs font-semibold transition-colors border border-white/10 cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span>Précédent</span>
        </button>

        {/* Numéros de page cliquables */}
        <div className="flex items-center gap-1 mx-1">{renderPageNumbers()}</div>

        {/* Suivant */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#714B67] hover:bg-[#875A7B] disabled:opacity-30 disabled:bg-white/10 disabled:cursor-not-allowed text-white font-sans text-xs font-semibold transition-colors border border-white/10 shadow-sm cursor-pointer"
        >
          <span>Suivant</span>
          <ChevronRight size={14} />
        </button>

        {/* Dernier */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          title="Dernière page"
          className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed text-white font-sans text-xs transition-colors border border-white/10 cursor-pointer"
        >
          »
        </button>
      </div>
    </div>
  );
}


// ============================================================================
// COMPOSANT PAD DE SIGNATURE ÉLECTRONIQUE OFFICIELLE DU RESPONSABLE TRAITANT
// ============================================================================
export function ElectronicSignaturePad({
  value,
  onChange,
  signerName = "Officier / Maire",
  signerRole = "Officier d'état civil",
  signerCommune = "",
  readOnly = false,
  height = 130
}) {
  const canvasRef = React.useRef(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasSignature, setHasSignature] = React.useState(Boolean(value));
  const [activeTab, setActiveTab] = React.useState("draw"); // "draw" | "type" | "upload"
  const [typedName, setTypedName] = React.useState(signerName || "");

  // Initialisation et dessin de la signature existante
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#092C4C";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (value && value.startsWith("data:image")) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasSignature(true);
      };
      img.src = value;
    }
  }, [value]);

  const startDrawing = (e) => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || readOnly) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      onChange(dataUrl);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange("");
  };

  const generateCalligraphicSignature = (nameToUse) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "italic bold 32px 'Brush Script MT', 'Great Vibes', 'Caveat', 'Segoe Script', cursive, serif";
    ctx.fillStyle = "#092C4C";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(nameToUse || typedName || signerName, canvas.width / 2, canvas.height / 2 - 8);

    // Fioriture décorative sous la signature
    ctx.beginPath();
    ctx.strokeStyle = "#092C4C";
    ctx.lineWidth = 2.2;
    ctx.moveTo(canvas.width * 0.18, canvas.height * 0.72);
    ctx.bezierCurveTo(canvas.width * 0.42, canvas.height * 0.88, canvas.width * 0.68, canvas.height * 0.58, canvas.width * 0.84, canvas.height * 0.76);
    ctx.stroke();

    setHasSignature(true);
    onChange(canvas.toDataURL("image/png"));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasSignature(true);
        onChange(canvas.toDataURL("image/png"));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2 select-none">
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] pb-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("draw")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeTab === "draw"
                  ? "bg-[#714B67] text-white shadow-sm ring-1 ring-white/20"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              ✍️ Dessiner au Stylet / Souris
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("type");
                generateCalligraphicSignature(signerName);
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeTab === "type"
                  ? "bg-[#714B67] text-white shadow-sm ring-1 ring-white/20"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              ✒️ Signature Calligraphique
            </button>

            <label className="px-2.5 py-1 rounded-lg font-semibold bg-white/5 hover:bg-white/10 text-gray-300 cursor-pointer transition-colors border border-white/10 flex items-center gap-1">
              📁 Importer Image
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {hasSignature && (
            <button
              type="button"
              onClick={clearSignature}
              className="text-red-400 hover:text-red-300 text-[10px] font-bold underline transition-colors"
            >
              Effacer la signature
            </button>
          )}
        </div>
      )}

      {/* Surface de Dessin du Canvas */}
      <div className="relative bg-[#FAFDFE] rounded-xl border-2 border-dashed border-teal-500/40 shadow-inner overflow-hidden">
        <canvas
          ref={canvasRef}
          width={480}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair touch-none"
        />

        {/* Filigrane d'authenticité */}
        <div className="absolute bottom-1.5 left-3 right-3 flex items-center justify-between pointer-events-none text-[9px] text-gray-400 font-mono border-t border-gray-300/80 pt-0.5">
          <span>Zone officielle de signature électronique • République du Cameroun</span>
          <span className="font-bold text-gray-600 truncate max-w-[200px]">
            {signerRole} : {signerName}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT SÉLECTEUR AVEC ZONE DE RECHERCHE INTÉGRÉE DANS LA LISTE DÉROULANTE
// ============================================================================
function SearchableDropdown({
  label,
  value,
  placeholder = "-- Sélectionner --",
  searchPlaceholder = "🔍 Rechercher...",
  options = [],
  onChange,
  onAddNew,
  isAdding,
  newInputValue,
  onNewInputChange,
  onConfirmAdd,
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = React.useRef(null);
  const searchInputRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((opt) => {
      const text = typeof opt === "string" ? opt : `${opt.label || opt.commune || opt.nom || ""} ${opt.group || opt.region || opt.departement || ""}`;
      return text.toLowerCase().includes(q);
    });
  }, [options, search]);

  return (
    <div className="space-y-1 relative" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="text-[#8FA8B0] font-semibold text-[11px]">{label}</label>
        {onAddNew && (
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onAddNew();
            }}
            className="text-[10px] text-teal-300 hover:underline font-bold"
          >
            {isAdding ? "Annuler" : "+ Ajouter"}
          </button>
        )}
      </div>

      {isAdding ? (
        <div className="flex gap-1">
          <input
            type="text"
            placeholder="Saisir un nouvel élément..."
            value={newInputValue}
            onChange={(e) => onNewInputChange(e.target.value)}
            className="w-full bg-[#13212D] text-xs text-white p-1.5 rounded border border-teal-500/50"
            autoFocus
          />
          <button
            type="button"
            onClick={onConfirmAdd}
            className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-bold"
          >
            OK
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              setSearch("");
            }}
            className={`w-full flex items-center justify-between bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border transition-all text-left ${
              isOpen ? "border-teal-400 ring-1 ring-teal-400/30" : "border-white/10 hover:border-white/20"
            }`}
          >
            <span className={`truncate ${value ? "font-bold text-white" : "text-gray-400"}`}>
              {value || placeholder}
            </span>
            <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180 text-teal-300" : ""}`} />
          </button>

          {required && (
            <input
              type="text"
              required
              value={value || ""}
              onChange={() => {}}
              className="sr-only"
              tabIndex={-1}
            />
          )}

          {isOpen && (
            <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#13212D] border border-teal-500/40 rounded-xl shadow-2xl overflow-hidden max-h-72 flex flex-col backdrop-blur-md">
              {/* Zone de recherche dans la liste déroulante */}
              <div className="p-2 border-b border-white/10 bg-[#1A2C3C] sticky top-0 z-10">
                <div className="relative flex items-center">
                  <Search size={13} className="absolute left-2.5 text-teal-300" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#0D1F28] text-xs text-white pl-8 pr-7 py-1.5 rounded-md border border-white/15 focus:border-teal-400 focus:outline-none placeholder-gray-400 font-medium"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2 text-gray-400 hover:text-white p-0.5"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Liste des résultats filtrés */}
              <div className="overflow-y-auto flex-1 p-1 space-y-0.5 text-xs">
                {filteredOptions.length === 0 ? (
                  <div className="p-3 text-center text-gray-400 text-xs">
                    Aucun résultat pour "<span className="text-white font-medium">{search}</span>"
                  </div>
                ) : (
                  filteredOptions.map((opt, idx) => {
                    const optVal = typeof opt === "string" ? opt : (opt.commune || opt.value || opt.label);
                    const optLabel = typeof opt === "string" ? opt : (opt.label || opt.commune || opt.value);
                    const optSubtitle = typeof opt === "string" ? null : (opt.departement ? `${opt.departement} • Région ${opt.region}` : opt.group);
                    const isSelected = value === optVal;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          onChange(optVal, opt);
                          setIsOpen(false);
                          setSearch("");
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                          isSelected
                            ? "bg-teal-600/30 text-teal-200 font-bold border border-teal-500/30"
                            : "hover:bg-white/5 text-gray-200"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="truncate font-medium">{optLabel}</div>
                          {optSubtitle && <div className="text-[10px] text-gray-400 font-mono">{optSubtitle}</div>}
                        </div>
                        {isSelected && <Check size={13} className="text-teal-300 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL SYNDEC-CAM
// ============================================================================
export default function SyndecCamApp({
  onExit,
  onLock,
  onLogout,
  adminNom = "Patrick MBALLA",
  syndecActif = true,
  syndecPeriode = "2026-T3",
  sessionRole = "admin", // "admin" | "officier_ec" | "citoyen" | "bunec" | "minat"
  sessionUserId = "USR-001",
  sessionCommune = "",
  utilisateursSyndec = [],
  onCreerCompteSyndec,
  onNotify,
}) {
  // 1. TOUS LES ÉTATS (useState) SONT DÉCLARÉS EN PREMIER
  const [syndecTab, setSyndecTab] = useState("syndecDashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Pagination standardisée : 15 éléments par page
  const LIGNES_PAR_PAGE = 15;
  const [pageNaissances, setPageNaissances] = useState(1);
  const [pageDeces, setPageDeces] = useState(1);
  const [pageMariages, setPageMariages] = useState(1);
  const [pageAgents, setPageAgents] = useState(1);
  const [pageUtilisateurs, setPageUtilisateurs] = useState(1);
  const [pageAudit, setPageAudit] = useState(1);
  const [pageCommunes, setPageCommunes] = useState(1);

  // Recherche
  const [searchNaissances, setSearchNaissances] = useState("");
  const [searchDeces, setSearchDeces] = useState("");
  const [searchMariages, setSearchMariages] = useState("");
  const [searchAgents, setSearchAgents] = useState("");
  const [searchUtilisateurs, setSearchUtilisateurs] = useState("");
  const [searchAudit, setSearchAudit] = useState("");
  const [searchCommunes, setSearchCommunes] = useState("");

  // Déclarations de Naissance
  const [naissances, setNaissances] = useState([
    {
      id: "NAI-000201",
      nomEnfant: "Mballa",
      prenomEnfant: "Junior",
      sexe: "M",
      lieu: "Yaoundé",
      dateNaissance: "2026-07-15",
      nomPere: "Patrick Mballa",
      nomMere: "Estelle Mballa",
      region: "Centre",
      departement: "Mfoundi",
      commune: "Commune De Yaounde I",
      centreEtatCivil: "Centre d'état civil principal de Yaoundé 1er",
      responsableTraitantId: "OEC-001",
      responsableTraitantNom: "Ateba Suzanne",
      responsableTraitantRole: "Officier d'état civil",
      declarant: "Patrick Mballa",
      declarantTel: "699001122",
      declarantEmail: "patrick.mballa@rtc.cm",
      statutPaiement: "Payé",
      modePaiement: "Orange Money",
      referencePaiement: "OM-2026-9941",
      montantPaye: 1500,
      datePaiement: "2026-07-16 09:15",
      statut: "Validé",
      notificationSmsEnvoyee: true,
      notificationEmailEnvoyee: true,
      date: "2026-07-16",
      creePar: "USR-001"
    },
    {
      id: "NAI-000202",
      nomEnfant: "Ekwalla",
      prenomEnfant: "Grace",
      sexe: "F",
      lieu: "Douala",
      dateNaissance: "2026-07-20",
      nomPere: "Paul Ekwalla",
      nomMere: "Nya Ekwalla",
      region: "Littoral",
      departement: "Wouri",
      commune: "Commune D'Arrondissement De Douala 3eme",
      centreEtatCivil: "Centre d'état civil secondaire de New-Bell",
      responsableTraitantId: "SEC-002",
      responsableTraitantNom: "Biya Thomas",
      responsableTraitantRole: "Secrétaire d'état civil",
      declarant: "Paul Ekwalla",
      declarantTel: "677112233",
      declarantEmail: "paul.ekwalla@gmail.com",
      statutPaiement: "Payé",
      modePaiement: "MTN Mobile Money",
      referencePaiement: "MOMO-2026-3312",
      montantPaye: 1500,
      datePaiement: "2026-07-21 11:30",
      statut: "En attente",
      notificationSmsEnvoyee: false,
      notificationEmailEnvoyee: false,
      date: "2026-07-21",
      creePar: "USR-002"
    },
    {
      id: "NAI-000203",
      nomEnfant: "Fotso",
      prenomEnfant: "Aline",
      sexe: "F",
      lieu: "Bafoussam",
      dateNaissance: "2026-08-01",
      nomPere: "Marcel Fotso",
      nomMere: "Rose Fotso",
      region: "Ouest",
      departement: "Mifi",
      commune: "Commune D'Arrondissement De Bafoussam 1er",
      centreEtatCivil: "Mairie de Bafoussam 1er",
      responsableTraitantId: "AAM-003",
      responsableTraitantNom: "Kamga Odile",
      responsableTraitantRole: "Adjoint au maire",
      declarant: "Marcel Fotso",
      declarantTel: "690445566",
      declarantEmail: "marcel.fotso@yahoo.fr",
      statutPaiement: "Payé",
      modePaiement: "Orange Money",
      referencePaiement: "OM-2026-5510",
      montantPaye: 1500,
      datePaiement: "2026-08-02 14:00",
      statut: "Validé",
      notificationSmsEnvoyee: true,
      notificationEmailEnvoyee: true,
      date: "2026-08-02",
      creePar: "USR-003"
    }
  ]);

  // Déclarations de Décès
  const [deces, setDeces] = useState([
    {
      id: "DEC-000301",
      nomDefunt: "Nkeng",
      prenomDefunt: "Samuel",
      sexe: "M",
      lieu: "Bamenda",
      dateDeces: "2026-07-10",
      nomPere: "Jean Nkeng",
      nomMere: "Marie Nkeng",
      region: "Nord-Ouest",
      departement: "Mezam",
      commune: "Commune D'Arrondissement De Bamenda 2e",
      centreEtatCivil: "Mairie de Bamenda 2e",
      responsableTraitantId: "OEC-005",
      responsableTraitantNom: "Fru Divine",
      responsableTraitantRole: "Officier d'état civil",
      declarant: "Sonia Nkeng",
      declarantTel: "677998877",
      declarantEmail: "sonia.nkeng@gmail.com",
      statutPaiement: "Payé",
      modePaiement: "Orange Money",
      referencePaiement: "OM-2026-4421",
      montantPaye: 5000,
      datePaiement: "2026-07-11 10:00",
      statut: "Validé",
      notificationSmsEnvoyee: true,
      notificationEmailEnvoyee: true,
      date: "2026-07-11",
      creePar: "USR-004"
    },
    {
      id: "DEC-000302",
      nomDefunt: "Mbarga",
      prenomDefunt: "Rose",
      sexe: "F",
      lieu: "Garoua",
      dateDeces: "2026-07-28",
      nomPere: "—",
      nomMere: "—",
      region: "Nord",
      departement: "Benoue",
      commune: "Commune D'Arrondissement Garoua 1er",
      centreEtatCivil: "Hôtel de Ville Garoua 1er",
      responsableTraitantId: "MAI-006",
      responsableTraitantNom: "Yaya Abdoulaye",
      responsableTraitantRole: "Maire",
      declarant: "Yves Mbarga",
      declarantTel: "699332211",
      declarantEmail: "yves.mbarga@yahoo.fr",
      statutPaiement: "Payé",
      modePaiement: "MTN Mobile Money",
      referencePaiement: "MOMO-2026-7811",
      montantPaye: 5000,
      datePaiement: "2026-07-29 15:45",
      statut: "En attente",
      notificationSmsEnvoyee: false,
      notificationEmailEnvoyee: false,
      date: "2026-07-29",
      creePar: "USR-005"
    }
  ]);

  // Déclarations de Mariage
  const [mariages, setMariages] = useState([
    {
      id: "MAR-000101",
      conjoint1: "Ateba Jean",
      conjoint2: "Belle Aicha",
      region: "Littoral",
      departement: "Wouri",
      commune: "Commune D'Arrondissement De Douala 3eme",
      centreEtatCivil: "Centre d'état civil principal Douala 3e",
      responsableTraitantId: "SEC-002",
      responsableTraitantNom: "Biya Thomas",
      responsableTraitantRole: "Secrétaire d'état civil",
      declarant: "Ateba Jean",
      declarantTel: "699554433",
      declarantEmail: "ateba.jean@gmail.com",
      dateSouhaitee: "2026-09-12",
      statutPaiement: "Payé",
      modePaiement: "Orange Money",
      referencePaiement: "OM-2026-8802",
      montantPaye: 35500,
      datePaiement: "2026-08-01 16:30",
      statut: "En attente de contact",
      notificationSmsEnvoyee: false,
      notificationEmailEnvoyee: false,
      date: "2026-08-01",
      creePar: "USR-006"
    },
    {
      id: "MAR-000102",
      conjoint1: "Nya Grace",
      conjoint2: "Fotso Marcel",
      region: "Centre",
      departement: "Mfoundi",
      commune: "Commune De Yaounde I",
      centreEtatCivil: "Mairie de Yaoundé 1er",
      responsableTraitantId: "OEC-001",
      responsableTraitantNom: "Ateba Suzanne",
      responsableTraitantRole: "Officier d'état civil",
      declarant: "Fotso Marcel",
      declarantTel: "677665544",
      declarantEmail: "fotso.marcel@gmail.com",
      dateSouhaitee: "2026-10-05",
      statutPaiement: "Payé",
      modePaiement: "MTN Mobile Money",
      referencePaiement: "MOMO-2026-9043",
      montantPaye: 35500,
      datePaiement: "2026-07-20 12:10",
      statut: "Date confirmée",
      notificationSmsEnvoyee: true,
      notificationEmailEnvoyee: true,
      date: "2026-07-20",
      creePar: "USR-007"
    }
  ]);

  // Maires et Officiers d'État Civil
  const [agents, setAgents] = useState([
    { id: "OEC-001", nom: "Ateba Suzanne", role: "Officier d'état civil", region: "Centre", departement: "Mfoundi", commune: "Commune De Yaounde I", centreEtatCivil: "Centre d'état civil principal de Yaoundé 1er", dossiersTraites: 42 },
    { id: "SEC-002", nom: "Biya Thomas", role: "Secrétaire d'état civil", region: "Littoral", departement: "Wouri", commune: "Commune D'Arrondissement De Douala 3eme", centreEtatCivil: "Centre d'état civil secondaire de New-Bell", dossiersTraites: 31 },
    { id: "AAM-003", nom: "Kamga Odile", role: "Adjoint au maire", region: "Ouest", departement: "Mifi", commune: "Commune D'Arrondissement De Bafoussam 1er", centreEtatCivil: "Mairie de Bafoussam 1er", dossiersTraites: 18 },
    { id: "MAI-004", nom: "Mengue François", role: "Maire", region: "Centre", departement: "Lekie", commune: "Commune D'Obala", centreEtatCivil: "Hôtel de Ville d'Obala", dossiersTraites: 27 },
    { id: "OEC-005", nom: "Fru Divine", role: "Officier d'état civil", region: "Nord-Ouest", departement: "Mezam", commune: "Commune D'Arrondissement De Bamenda 2e", centreEtatCivil: "Mairie de Bamenda 2e", dossiersTraites: 15 },
    { id: "MAI-006", nom: "Yaya Abdoulaye", role: "Maire", region: "Nord", departement: "Benoue", commune: "Commune D'Arrondissement Garoua 1er", centreEtatCivil: "Hôtel de Ville Garoua 1er", dossiersTraites: 22 },
  ]);

  // Table des Utilisateurs SYNDEC-CAM
  const [utilisateurs, setUtilisateurs] = useState([
    { id: "USR-001", nom: "Patrick MBALLA", profil: "Administrateur système", contact: "+237 6 99 00 11 22", email: "patrick.mballa@rtc.cm", commune: "Commune De Yaounde I", actif: true, dateCreation: "2026-01-10" },
    { id: "USR-002", nom: "Paul Ekwalla", profil: "Usager / Déclarant", contact: "+237 6 77 11 22 33", email: "paul.ekwalla@gmail.com", commune: "Commune D'Arrondissement De Douala 3eme", actif: true, dateCreation: "2026-02-14" },
    { id: "USR-003", nom: "Marcel Fotso", profil: "Usager / Déclarant", contact: "+237 6 90 44 55 66", email: "marcel.fotso@yahoo.fr", commune: "Commune D'Arrondissement De Bafoussam 1er", actif: true, dateCreation: "2026-03-01" },
    { id: "USR-004", nom: "Sonia Nkeng", profil: "Usager / Déclarant", contact: "+237 6 77 99 88 77", email: "sonia.nkeng@gmail.com", commune: "Commune D'Arrondissement De Bamenda 2e", actif: true, dateCreation: "2026-03-15" },
    { id: "USR-005", nom: "Ateba Suzanne", profil: "Officier d'état civil", contact: "+237 6 99 22 33 44", email: "ateba.suzanne@yaounde1.cm", commune: "Commune De Yaounde I", actif: true, dateCreation: "2026-01-15" },
    { id: "USR-006", nom: "Mengue François", profil: "Maire", contact: "+237 6 99 44 55 66", email: "maire@obala.cm", commune: "Commune D'Obala", actif: true, dateCreation: "2026-01-20" },
    { id: "USR-007", nom: "Inspecteur BUNEC Centre", profil: "BUNEC (Supervision)", contact: "+237 6 77 00 22 44", email: "supervision@bunec.cm", commune: "Commune De Yaounde I", actif: true, dateCreation: "2026-01-05" },
    { id: "USR-008", nom: "Délégué Régional MINAT", profil: "MINAT / Tutelle", contact: "+237 6 90 11 22 33", email: "tutelle@minat.gov.cm", commune: "Commune De Yaounde I", actif: true, dateCreation: "2026-01-08" },
  ]);

  // Journal d'Audit Système
  const [auditLog, setAuditLog] = useState([
    { id: "AUD-1001", date: "2026-08-31 09:15", acteur: "Ateba Suzanne", role: "Officier d'état civil", action: "Validation et signature d'acte de naissance", refDossier: "NAI-000201", commune: "Commune De Yaounde I", canal: "Portail Web" },
    { id: "AUD-1002", date: "2026-08-31 08:30", acteur: "Patrick MBALLA", role: "Administrateur système", action: "Création compte usager assisté (Paul Ekwalla)", refDossier: "USR-002", commune: "Commune D'Arrondissement De Douala 3eme", canal: "Espace Admin" },
    { id: "AUD-1003", date: "2026-08-30 16:45", acteur: "Paul Ekwalla", role: "Usager / Déclarant", action: "Paiement Mobile Money frais d'acte (1 500 FCFA)", refDossier: "NAI-000202", commune: "Commune D'Arrondissement De Douala 3eme", canal: "MTN Mobile Money" },
    { id: "AUD-1004", date: "2026-08-30 14:10", acteur: "Fru Divine", role: "Officier d'état civil", action: "Signature d'acte de décès certifié", refDossier: "DEC-000301", commune: "Commune D'Arrondissement De Bamenda 2e", canal: "Portail Web" },
    { id: "AUD-1005", date: "2026-08-29 11:20", acteur: "Mengue François", role: "Maire", action: "Consultation du registre des naissances", refDossier: "REG-OBALA-2026", commune: "Commune D'Obala", canal: "Portail Web" },
    { id: "AUD-1006", date: "2026-08-28 17:00", acteur: "Inspecteur BUNEC Centre", role: "BUNEC (Supervision)", action: "Audit de conformité des actes certifiés", refDossier: "AUDIT-BUNEC-08", commune: "National", canal: "BUNEC Dashboard" },
  ]);

  // Listes dynamiques pour Régions, Communes et Centres d'état civil
  const [listeRegions, setListeRegions] = useState(REGIONS_SYNDEC);
  const [listeCommunes, setListeCommunes] = useState(TOUTES_COMMUNES_CAMEROUN);
  // État des maires modifiables et gestion de la modification de commune
  const [mairesOverrides, setMairesOverrides] = useState({ ...MAIRES_COMMUNES_CAMEROUN });
  const [editingCommune, setEditingCommune] = useState(null);

  const handleOpenEditCommune = (c) => {
    const currentMaire = mairesOverrides[c.commune] || obtenirMaireDeCommune(c.commune, c.region);
    setEditingCommune({
      originalCommune: c.commune,
      commune: c.commune,
      region: c.region,
      departement: c.departement,
      maire: currentMaire,
    });
    setModal("edit_commune");
  };

  const handleSaveEditCommune = (e) => {
    e.preventDefault();
    if (!editingCommune || !editingCommune.commune.trim()) return;

    const orig = editingCommune.originalCommune;
    const newName = editingCommune.commune.trim();
    const newRegion = editingCommune.region;
    const newDept = editingCommune.departement;
    const newMaire = editingCommune.maire.trim() || "Maire Titulaire";

    setListeCommunes((prev) =>
      prev.map((c) =>
        c.commune === orig ? { region: newRegion, departement: newDept, commune: newName } : c
      )
    );

    setMairesOverrides((prev) => {
      const next = { ...prev };
      if (orig !== newName) {
        delete next[orig];
      }
      next[newName] = newMaire;
      return next;
    });

    setAgents((prev) =>
      prev.map((a) =>
        a.commune === orig
          ? { ...a, commune: newName, region: newRegion, nom: a.role === "Maire" ? newMaire : a.nom }
          : a
      )
    );

    enregistrerAudit(`Modification de la commune ${orig} -> ${newName} (Maire: ${newMaire})`, newName, newName);
    setModal(null);
    setEditingCommune(null);
    onNotify?.(`Commune "${newName}" et son Maire (${newMaire}) mis à jour avec succès !`, "success");
  };

  const handleDeleteCommune = (communeName) => {
    if (sessionRole !== "admin") {
      onNotify?.("Suppression de commune réservée exclusivement à l'Administrateur Système.", "error");
      return;
    }
    if (window.confirm(`Confirmez-vous la suppression définitive de la commune "${communeName}" du répertoire national ?`)) {
      setListeCommunes((prev) => prev.filter((c) => c.commune !== communeName));
      setMairesOverrides((prev) => {
        const next = { ...prev };
        delete next[communeName];
        return next;
      });
      enregistrerAudit(`Suppression de la commune ${communeName} du répertoire national`, communeName, communeName);
      if (modal === "edit_commune") {
        setModal(null);
        setEditingCommune(null);
      }
      onNotify?.(`Commune "${communeName}" supprimée avec succès du répertoire.`, "warning");
    }
  };

  const [listeCentres, setListeCentres] = useState([
    "Centre d'état civil principal de la Mairie",
    "Centre d'état civil secondaire",
    "Centre spécial d'état civil d'hôpital",
    "Centre d'état civil d'arrondissement",
    "Centre d'état civil principal de Yaoundé 1er",
    "Centre d'état civil secondaire de New-Bell",
    "Mairie de Bafoussam 1er",
    "Mairie de Bamenda 2e",
    "Hôtel de Ville d'Obala",
    "Hôtel de Ville Garoua 1er"
  ]);

  // États pour l'ajout rapide
  const [modeAjoutRegion, setModeAjoutRegion] = useState(false);
  const [nouvelleRegionInput, setNouvelleRegionInput] = useState("");
  const [modeAjoutCommune, setModeAjoutCommune] = useState(false);
  const [nouvelleCommuneInput, setNouvelleCommuneInput] = useState("");
  const [modeAjoutCentre, setModeAjoutCentre] = useState(false);
  const [nouveauCentreInput, setNouveauCentreInput] = useState("");
  // État pour l'ajout rapide de Responsable d'État Civil (Maire, Adjoint, Officier, Secrétaire)
  const [modeAjoutOfficier, setModeAjoutOfficier] = useState(false);
  const [nouveauOfficierNom, setNouveauOfficierNom] = useState("");
  const [nouveauOfficierRole, setNouveauOfficierRole] = useState("Officier d'état civil");

  const handleAjouterOfficierRapide = (formSetter, activeCommune, activeRegion) => {
    const nom = nouveauOfficierNom.trim();
    if (!nom) return;
    const newId = idAgentECPourRole(null, nouveauOfficierRole);
    const newAgent = {
      id: newId,
      nom,
      role: nouveauOfficierRole,
      region: activeRegion || "Centre",
      departement: "Département",
      commune: activeCommune || "Commune De Yaounde I",
      centreEtatCivil: "Centre d'état civil principal",
      dossiersTraites: 0,
    };
    setAgents((prev) => [newAgent, ...prev]);
    formSetter((prev) => ({
      ...prev,
      responsableTraitantId: newId,
      responsableTraitantNom: nom,
      responsableTraitantRole: nouveauOfficierRole,
    }));
    setNouveauOfficierNom("");
    setModeAjoutOfficier(false);
    onNotify?.(`${nouveauOfficierRole} "${nom}" ajouté(e) et sélectionné(e) avec succès !`, "success");
  };


  // Modales
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editingMariage, setEditingMariage] = useState(null);
  const [editingOfficier, setEditingOfficier] = useState(null);
  const [editingUtilisateur, setEditingUtilisateur] = useState(null);
  const [certificateRecord, setCertificateRecord] = useState(null);
  const [certificateType, setCertificateType] = useState("naissance");
  const [dossierPaiement, setDossierPaiement] = useState(null);
  const [signatureDossier, setSignatureDossier] = useState(null);

  // Formulaires
  const emptyFormNaissance = {
    nomEnfant: "",
    prenomEnfant: "",
    sexe: "M",
    lieu: "",
    dateNaissance: "",
    nomPere: "",
    nomMere: "",
    region: "Centre",
    departement: "Mfoundi",
    commune: "Commune De Yaounde I",
    centreEtatCivil: "Centre d'état civil principal de Yaoundé 1er",
    responsableTraitantId: "OEC-001",
    responsableTraitantNom: "Ateba Suzanne",
    responsableTraitantRole: "Officier d'état civil",
    declarant: adminNom,
    declarantTel: "699001122",
    declarantEmail: "citoyen@syndec.cm",
    payerMaintenant: true,
    operateurMobileMoney: "Orange Money",
    numeroMobileMoney: "699001122",
  };
  const [formNaissance, setFormNaissance] = useState(emptyFormNaissance);

  const emptyFormDeces = {
    nomDefunt: "",
    prenomDefunt: "",
    sexe: "M",
    lieu: "",
    dateDeces: "",
    nomPere: "",
    nomMere: "",
    region: "Littoral",
    departement: "Wouri",
    commune: "Commune D'Arrondissement De Douala 3eme",
    centreEtatCivil: "Centre d'état civil secondaire de New-Bell",
    responsableTraitantId: "SEC-002",
    responsableTraitantNom: "Biya Thomas",
    responsableTraitantRole: "Secrétaire d'état civil",
    declarant: adminNom,
    declarantTel: "699001122",
    declarantEmail: "citoyen@syndec.cm",
    payerMaintenant: true,
    operateurMobileMoney: "Orange Money",
    numeroMobileMoney: "699001122",
  };
  const [formDeces, setFormDeces] = useState(emptyFormDeces);

  const emptyFormMariage = {
    conjoint1: "",
    conjoint2: "",
    region: "Centre",
    departement: "Mfoundi",
    commune: "Commune De Yaounde I",
    centreEtatCivil: "Mairie de Yaoundé 1er",
    responsableTraitantId: "OEC-001",
    responsableTraitantNom: "Ateba Suzanne",
    responsableTraitantRole: "Officier d'état civil",
    declarant: adminNom,
    declarantTel: "699001122",
    declarantEmail: "citoyen@syndec.cm",
    dateSouhaitee: "",
    payerMaintenant: true,
    operateurMobileMoney: "MTN Mobile Money",
    numeroMobileMoney: "677001122",
  };
  const [formMariage, setFormMariage] = useState(emptyFormMariage);

  const emptyFormOfficier = {
    nom: "",
    role: "Officier d'état civil",
    region: "Centre",
    departement: "Mfoundi",
    commune: "Commune De Yaounde I",
    centreEtatCivil: "Centre d'état civil principal",
    signature: ""
  };
  const [formOfficier, setFormOfficier] = useState(emptyFormOfficier);

  const emptyFormUtilisateur = {
    nom: "",
    profil: "Usager / Déclarant",
    contact: "+237 6 99 00 00 00",
    email: "",
    region: "Centre",
    departement: "Mfoundi",
    commune: "Commune De Yaounde I",
    centreEtatCivil: "Mairie Principale",
    actif: true,
  };
  const [formUtilisateur, setFormUtilisateur] = useState(emptyFormUtilisateur);

  const [paiementForm, setPaiementForm] = useState({
    operateur: "Orange Money",
    numeroTelephone: "+237 6 99 00 11 22",
    enCours: false,
  });

  // 2. TOUS LES useMemo SONT DÉCLARÉS ENSUITE (AUCUN PROBLÈME DE TDZ)
  const stats = useMemo(() => {
    const totalNaissances = naissances.length;
    const totalDeces = deces.length;
    const totalMariages = mariages.length;
    const totalDeclarations = totalNaissances + totalDeces + totalMariages;

    const validesNaissances = naissances.filter((n) => n.statut === "Validé").length;
    const validesDeces = deces.filter((d) => d.statut === "Validé").length;
    const validesMariages = mariages.filter((m) => m.statut === "Date confirmée").length;
    const totalValides = validesNaissances + validesDeces + validesMariages;

    const aTraiterResponsable = naissances.filter((n) => n.statutPaiement === "Payé" && n.statut !== "Validé").length
      + deces.filter((d) => d.statutPaiement === "Payé" && d.statut !== "Validé").length
      + mariages.filter((m) => m.statutPaiement === "Payé" && m.statut !== "Date confirmée").length;

    const revNaiss = naissances.filter((n) => n.statutPaiement === "Payé").length * FRAIS_ETAT_CIVIL.NAISSANCE;
    const revDeces = deces.filter((d) => d.statutPaiement === "Payé").length * FRAIS_ETAT_CIVIL.DECES;
    const revMar = mariages.filter((m) => m.statutPaiement === "Payé").length * FRAIS_ETAT_CIVIL.MARIAGE;
    const totalRevenu = revNaiss + revDeces + revMar;

    return { totalDeclarations, totalValides, aTraiterResponsable, totalRevenu };
  }, [naissances, deces, mariages]);

  // Diagramme à Barres des Naissances par Région (10 Régions)
  const donneesNaissancesParRegion = useMemo(() => {
    const baseline = {
      "Adamaoua": 1840,
      "Centre": 5210,
      "Est": 1690,
      "Extrême-Nord": 4320,
      "Littoral": 5480,
      "Nord": 3120,
      "Nord-Ouest": 2280,
      "Ouest": 3650,
      "Sud": 1490,
      "Sud-Ouest": 2180,
    };
    return REGIONS_SYNDEC.map((reg) => {
      const ajoutsDynamiques = naissances.filter((n) => (n.region || "").toLowerCase() === reg.toLowerCase()).length;
      return {
        region: reg,
        naissances: (baseline[reg] || 1500) + ajoutsDynamiques,
      };
    });
  }, [naissances]);

  // Diagramme en Courbe comparatif Natalité (2025 vs 2026 sur 12 mois)
  const donneesComparaisonNatalite = useMemo(() => [
    { mois: "Jan", "2025 (Année précédente)": 2450, "2026 (Année en cours)": 2620 },
    { mois: "Fév", "2025 (Année précédente)": 2380, "2026 (Année en cours)": 2540 },
    { mois: "Mar", "2025 (Année précédente)": 2610, "2026 (Année en cours)": 2810 },
    { mois: "Avr", "2025 (Année précédente)": 2540, "2026 (Année en cours)": 2780 },
    { mois: "Mai", "2025 (Année précédente)": 2720, "2026 (Année en cours)": 2940 },
    { mois: "Juin", "2025 (Année précédente)": 2890, "2026 (Année en cours)": 3120 },
    { mois: "Juil", "2025 (Année précédente)": 2950, "2026 (Année en cours)": 3240 },
    { mois: "Août", "2025 (Année précédente)": 3100, "2026 (Année en cours)": null },
    { mois: "Sep", "2025 (Année précédente)": 2980, "2026 (Année en cours)": null },
    { mois: "Oct", "2025 (Année précédente)": 2870, "2026 (Année en cours)": null },
    { mois: "Nov", "2025 (Année précédente)": 2790, "2026 (Année en cours)": null },
    { mois: "Déc", "2025 (Année précédente)": 3050, "2026 (Année en cours)": null },
  ], []);

  // Filtrage relationnel
  function visiblePourSession(r) {
    if (sessionRole === "citoyen") {
      return r.creePar === sessionUserId || r.declarant === adminNom;
    }
    if (sessionRole === "officier_ec") {
      const estPaye = r.statutPaiement === "Payé";
      const estAttribue =
        !r.responsableTraitantNom ||
        r.responsableTraitantNom === adminNom ||
        r.responsableTraitantId === sessionUserId ||
        (r.commune && sessionCommune && r.commune === sessionCommune);
      return estPaye && estAttribue;
    }
    return true;
  }

  const filteredNaissances = useMemo(() => {
    return naissances.filter(visiblePourSession).filter((r) => {
      if (!searchNaissances.trim()) return true;
      const q = searchNaissances.toLowerCase();
      return [r.id, r.nomEnfant, r.prenomEnfant, r.commune, r.responsableTraitantNom, r.declarant]
        .some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [naissances, searchNaissances, sessionRole, sessionUserId, sessionCommune, adminNom]);

  const filteredDeces = useMemo(() => {
    return deces.filter(visiblePourSession).filter((r) => {
      if (!searchDeces.trim()) return true;
      const q = searchDeces.toLowerCase();
      return [r.id, r.nomDefunt, r.prenomDefunt, r.commune, r.responsableTraitantNom, r.declarant]
        .some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [deces, searchDeces, sessionRole, sessionUserId, sessionCommune, adminNom]);

  const filteredMariages = useMemo(() => {
    return mariages.filter(visiblePourSession).filter((r) => {
      if (!searchMariages.trim()) return true;
      const q = searchMariages.toLowerCase();
      return [r.id, r.conjoint1, r.conjoint2, r.commune, r.responsableTraitantNom, r.declarant]
        .some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [mariages, searchMariages, sessionRole, sessionUserId, sessionCommune, adminNom]);

  const filteredUtilisateurs = useMemo(() => {
    return utilisateurs.filter((u) => {
      if (!searchUtilisateurs.trim()) return true;
      const q = searchUtilisateurs.toLowerCase();
      return [u.id, u.nom, u.profil, u.contact, u.email, u.commune]
        .some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [utilisateurs, searchUtilisateurs]);

  const filteredAudit = useMemo(() => {
    return auditLog.filter((a) => {
      if (!searchAudit.trim()) return true;
      const q = searchAudit.toLowerCase();
      return [a.id, a.date, a.acteur, a.role, a.action, a.refDossier, a.commune]
        .some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [auditLog, searchAudit]);

  const filteredCommunes = useMemo(() => {
    return listeCommunes.filter((c) => {
      if (!searchCommunes.trim()) return true;
      const q = searchCommunes.toLowerCase();
      const maireNom = mairesOverrides[c.commune] || obtenirMaireDeCommune(c.commune, c.region);
      return [c.region, c.departement, c.commune, maireNom]
        .some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [listeCommunes, searchCommunes, mairesOverrides]);

  // 3. PAGINATION & HELPERS
  const paginer = (items, pageActuelle) => {
    const totalPages = Math.max(1, Math.ceil(items.length / LIGNES_PAR_PAGE));
    const pageAjustee = Math.min(pageActuelle, totalPages);
    const startIdx = (pageAjustee - 1) * LIGNES_PAR_PAGE;
    const pageItems = items.slice(startIdx, startIdx + LIGNES_PAR_PAGE);
    return { pageItems, totalPages, pageAjustee, totalItems: items.length };
  };

  const pagNaissances = paginer(filteredNaissances, pageNaissances);
  const pagDeces = paginer(filteredDeces, pageDeces);
  const pagMariages = paginer(filteredMariages, pageMariages);
  const pagAgents = paginer(agents, pageAgents);
  const pagUtilisateurs = paginer(filteredUtilisateurs, pageUtilisateurs);
  const pagAudit = paginer(filteredAudit, pageAudit);
  const pagCommunes = paginer(filteredCommunes, pageCommunes);

      // Pagination unifiée assurée par <PaginationBar />
  // Enregistrement d'audit
  const enregistrerAudit = (action, refDossier, commune = "National") => {
    const nowStamp = new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5);
    const newLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: nowStamp,
      acteur: adminNom,
      role: sessionRole === "admin" ? "Administrateur système" : sessionRole === "bunec" ? "BUNEC (Supervision)" : sessionRole === "officier_ec" ? "Officier / Maire" : "Usager",
      action,
      refDossier,
      commune: commune || sessionCommune || "National",
      canal: "Système SYNDEC",
    };
    setAuditLog((prev) => [newLog, ...prev]);
  };

  // Ajouts dynamiques Région, Commune, Centre
  const handleAjouterRegion = (setter) => {
    const val = nouvelleRegionInput.trim();
    if (!val) return;
    if (!listeRegions.includes(val)) {
      setListeRegions((prev) => [...prev, val]);
    }
    setter((prev) => ({ ...prev, region: val }));
    setNouvelleRegionInput("");
    setModeAjoutRegion(false);
    onNotify?.(`Région "${val}" ajoutée et sélectionnée !`, "success");
  };

  const handleAjouterCommune = (setter, activeRegion) => {
    const val = nouvelleCommuneInput.trim();
    if (!val) return;
    if (!listeCommunes.some((c) => c.commune.toLowerCase() === val.toLowerCase())) {
      setListeCommunes((prev) => [
        { region: activeRegion || "Centre", departement: "Département", commune: val },
        ...prev
      ]);
    }
    setter((prev) => ({ ...prev, commune: val }));
    setNouvelleCommuneInput("");
    setModeAjoutCommune(false);
    onNotify?.(`Commune "${val}" ajoutée et sélectionnée !`, "success");
  };

  const handleAjouterCentre = (setter) => {
    const val = nouveauCentreInput.trim();
    if (!val) return;
    if (!listeCentres.includes(val)) {
      setListeCentres((prev) => [val, ...prev]);
    }
    setter((prev) => ({ ...prev, centreEtatCivil: val }));
    setNouveauCentreInput("");
    setModeAjoutCentre(false);
    onNotify?.(`Centre d'état civil "${val}" ajouté et sélectionné !`, "success");
  };

  // Suppressions (Admin uniquement)
  const handleDeleteNaissance = (id) => {
    if (sessionRole !== "admin") {
      onNotify?.("Suppression réservée exclusivement à l'Administrateur Système.", "error");
      return;
    }
    if (window.confirm(`Confirmez-vous la suppression définitive de la déclaration ${id} ?`)) {
      setNaissances((prev) => prev.filter((n) => n.id !== id));
      enregistrerAudit(`Suppression définitive déclaration naissance ${id}`, id);
      onNotify?.(`Déclaration de naissance ${id} supprimée.`, "warning");
    }
  };

  const handleDeleteDeces = (id) => {
    if (sessionRole !== "admin") {
      onNotify?.("Suppression réservée exclusivement à l'Administrateur Système.", "error");
      return;
    }
    if (window.confirm(`Confirmez-vous la suppression définitive de la déclaration de décès ${id} ?`)) {
      setDeces((prev) => prev.filter((d) => d.id !== id));
      enregistrerAudit(`Suppression définitive déclaration décès ${id}`, id);
      onNotify?.(`Déclaration de décès ${id} supprimée.`, "warning");
    }
  };

  const handleDeleteMariage = (id) => {
    if (sessionRole !== "admin") {
      onNotify?.("Suppression réservée exclusivement à l'Administrateur Système.", "error");
      return;
    }
    if (window.confirm(`Confirmez-vous la suppression définitive des bancs de mariage ${id} ?`)) {
      setMariages((prev) => prev.filter((m) => m.id !== id));
      enregistrerAudit(`Suppression définitive bancs mariage ${id}`, id);
      onNotify?.(`Bancs de mariage ${id} supprimés.`, "warning");
    }
  };

  const handleDeleteUtilisateur = (id) => {
    if (sessionRole !== "admin") {
      onNotify?.("Action réservée à l'Administrateur Système.", "error");
      return;
    }
    if (window.confirm(`Supprimer l'utilisateur ${id} ?`)) {
      setUtilisateurs((prev) => prev.filter((u) => u.id !== id));
      enregistrerAudit(`Suppression compte utilisateur ${id}`, id);
      onNotify?.(`Utilisateur ${id} supprimé.`, "warning");
    }
  };

  // Soumissions de formulaires
  const handleSubmitNaissance = (e) => {
    e.preventDefault();
    if (!formNaissance.nomEnfant.trim() || !formNaissance.commune) {
      onNotify?.("Veuillez renseigner le nom de l'enfant et la commune.", "warning");
      return;
    }

    if (editing?.type === "naissance") {
      setNaissances((prev) =>
        prev.map((n) => (n.id === editing.id ? { ...n, ...formNaissance } : n))
      );
      enregistrerAudit(`Modification déclaration naissance ${editing.id}`, editing.id, formNaissance.commune);
      setEditing(null);
      setModal(null);
      onNotify?.(`Déclaration ${editing.id} modifiée avec succès !`, "success");
      return;
    }

    const newId = `NAI-${String(100000 + naissances.length + 1).slice(1)}`;
    const estPaye = formNaissance.payerMaintenant;
    const nouveau = {
      id: newId,
      date: new Date().toISOString().slice(0, 10),
      creePar: sessionUserId || "USR-001",
      ...formNaissance,
      montantPaye: FRAIS_ETAT_CIVIL.NAISSANCE,
      statutPaiement: estPaye ? "Payé" : "Non payé",
      modePaiement: estPaye ? formNaissance.operateurMobileMoney : null,
      referencePaiement: estPaye ? `${formNaissance.operateurMobileMoney === "Orange Money" ? "OM" : "MOMO"}-2026-${Math.floor(1000 + Math.random() * 9000)}` : null,
      datePaiement: estPaye ? new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5) : null,
      statut: estPaye ? "En attente" : "En attente de paiement (Orange / MTN Money)",
      notificationSmsEnvoyee: false,
      notificationEmailEnvoyee: false,
    };

    setNaissances([nouveau, ...naissances]);
    enregistrerAudit(`Création déclaration naissance ${newId}`, newId, formNaissance.commune);
    setModal(null);
    setFormNaissance(emptyFormNaissance);
    onNotify?.(`Déclaration ${newId} enregistrée avec succès !`, "success");
  };

  const handleSubmitDeces = (e) => {
    e.preventDefault();
    if (!formDeces.nomDefunt.trim() || !formDeces.commune) {
      onNotify?.("Veuillez renseigner le nom du défunt et la commune.", "warning");
      return;
    }

    if (editing?.type === "deces") {
      setDeces((prev) =>
        prev.map((d) => (d.id === editing.id ? { ...d, ...formDeces } : d))
      );
      enregistrerAudit(`Modification déclaration décès ${editing.id}`, editing.id, formDeces.commune);
      setEditing(null);
      setModal(null);
      onNotify?.(`Déclaration ${editing.id} modifiée !`, "success");
      return;
    }

    const newId = `DEC-${String(100000 + deces.length + 1).slice(1)}`;
    const estPaye = formDeces.payerMaintenant;
    const nouveau = {
      id: newId,
      date: new Date().toISOString().slice(0, 10),
      creePar: sessionUserId || "USR-001",
      ...formDeces,
      montantPaye: FRAIS_ETAT_CIVIL.DECES,
      statutPaiement: estPaye ? "Payé" : "Non payé",
      modePaiement: estPaye ? formDeces.operateurMobileMoney : null,
      referencePaiement: estPaye ? `${formDeces.operateurMobileMoney === "Orange Money" ? "OM" : "MOMO"}-2026-${Math.floor(1000 + Math.random() * 9000)}` : null,
      datePaiement: estPaye ? new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5) : null,
      statut: estPaye ? "En attente" : "En attente de paiement (Orange / MTN Money)",
      notificationSmsEnvoyee: false,
      notificationEmailEnvoyee: false,
    };

    setDeces([nouveau, ...deces]);
    enregistrerAudit(`Création déclaration décès ${newId}`, newId, formDeces.commune);
    setModal(null);
    setFormDeces(emptyFormDeces);
    onNotify?.(`Déclaration de décès ${newId} enregistrée !`, "success");
  };

  const handleSubmitMariage = (e) => {
    e.preventDefault();
    if (!formMariage.conjoint1.trim() || !formMariage.conjoint2.trim() || !formMariage.commune) {
      onNotify?.("Veuillez renseigner les conjoints et la commune.", "warning");
      return;
    }

    if (editingMariage) {
      setMariages((prev) =>
        prev.map((m) => (m.id === editingMariage ? { ...m, ...formMariage } : m))
      );
      enregistrerAudit(`Modification bancs mariage ${editingMariage}`, editingMariage, formMariage.commune);
      setEditingMariage(null);
      setModal(null);
      onNotify?.(`Bancs de mariage ${editingMariage} modifiés !`, "success");
      return;
    }

    const newId = `MAR-${String(100000 + mariages.length + 1).slice(1)}`;
    const estPaye = formMariage.payerMaintenant;
    const nouveau = {
      id: newId,
      date: new Date().toISOString().slice(0, 10),
      creePar: sessionUserId || "USR-001",
      ...formMariage,
      montantPaye: FRAIS_ETAT_CIVIL.MARIAGE,
      statutPaiement: estPaye ? "Payé" : "Non payé",
      modePaiement: estPaye ? formMariage.operateurMobileMoney : null,
      referencePaiement: estPaye ? `${formMariage.operateurMobileMoney === "Orange Money" ? "OM" : "MOMO"}-2026-${Math.floor(1000 + Math.random() * 9000)}` : null,
      datePaiement: estPaye ? new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5) : null,
      statut: estPaye ? "En attente de contact" : "En attente de paiement (Orange / MTN Money)",
      notificationSmsEnvoyee: false,
      notificationEmailEnvoyee: false,
    };

    setMariages([nouveau, ...mariages]);
    enregistrerAudit(`Création bancs mariage ${newId}`, newId, formMariage.commune);
    setModal(null);
    setFormMariage(emptyFormMariage);
    onNotify?.(`Bancs de mariage ${newId} enregistrés !`, "success");
  };

  const handleSubmitUtilisateur = (e) => {
    e.preventDefault();
    if (!formUtilisateur.nom.trim()) {
      onNotify?.("Veuillez renseigner le nom de l'utilisateur.", "warning");
      return;
    }

    if (editingUtilisateur) {
      setUtilisateurs((prev) =>
        prev.map((u) => (u.id === editingUtilisateur ? { ...u, ...formUtilisateur } : u))
      );
      enregistrerAudit(`Modification utilisateur ${editingUtilisateur}`, editingUtilisateur, formUtilisateur.commune);
      setEditingUtilisateur(null);
      setModal(null);
      onNotify?.(`Compte utilisateur ${editingUtilisateur} mis à jour !`, "success");
      return;
    }

    const newId = `USR-${String(100 + utilisateurs.length + 1).slice(1)}`;
    const nouveau = {
      id: newId,
      dateCreation: new Date().toISOString().slice(0, 10),
      ...formUtilisateur,
    };

    setUtilisateurs([nouveau, ...utilisateurs]);
    enregistrerAudit(`Création compte ${formUtilisateur.profil} (${formUtilisateur.nom})`, newId, formUtilisateur.commune);
    setModal(null);
    setFormUtilisateur(emptyFormUtilisateur);
    onNotify?.(`Compte ${newId} créé avec succès pour ${formUtilisateur.nom} !`, "success");
  };

  
  // Ouverture de la modale de signature électronique d'un acte
  const handleOuvrirSignatureActe = (record, type) => {
    // Trouver l'officier traitant ou par défaut
    const respNom = record.responsableTraitantNom || adminNom;
    const respRole = record.responsableTraitantRole || "Officier d'état civil";
    const agentExistant = agents.find((a) => a.nom === respNom || a.id === record.responsableTraitantId);

    setSignatureDossier({
      record,
      type,
      signerName: respNom,
      signerRole: respRole,
      signatureImage: record.signature || agentExistant?.signature || "",
    });
    setModal("signature_acte");
  };

  const handleConfirmerSignatureEtValidation = (e) => {
    e.preventDefault();
    if (!signatureDossier) return;

    const { record, type, signerName, signerRole, signatureImage } = signatureDossier;
    const id = record.id;
    const nowIso = new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5);

    let declarantNom = record.declarant || "le déclarant";
    let declarantTel = record.declarantTel || "699001122";
    let declarantEmail = record.declarantEmail || "citoyen@syndec.cm";

    if (type === "naissance") {
      setNaissances((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                statut: "Validé",
                dateValidation: nowIso,
                validePar: signerName,
                signature: signatureImage,
                notificationSmsEnvoyee: true,
                notificationEmailEnvoyee: true,
              }
            : n
        )
      );
    } else if (type === "deces") {
      setDeces((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                statut: "Validé",
                dateValidation: nowIso,
                validePar: signerName,
                signature: signatureImage,
                notificationSmsEnvoyee: true,
                notificationEmailEnvoyee: true,
              }
            : d
        )
      );
    } else if (type === "mariage") {
      setMariages((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                statut: "Date confirmée",
                dateValidation: nowIso,
                validePar: signerName,
                signature: signatureImage,
                notificationSmsEnvoyee: true,
                notificationEmailEnvoyee: true,
              }
            : m
        )
      );
    }

    enregistrerAudit(`Validation et signature électronique ${type} ${id} par ${signerName} (${signerRole})`, id);
    setModal(null);
    setSignatureDossier(null);
    onNotify?.(
      `✅ Acte ${id} signé électroniquement et validé avec succès par ${signerName} ! Notifications SMS et Email expédiées.`,
      "success"
    );
  };

  const handleValiderEtSignerActe = (id, type) => {
    const nowIso = new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5);

    let declarantNom = "le déclarant";
    let declarantTel = "699001122";
    let declarantEmail = "citoyen@syndec.cm";
    let respNom = adminNom;

    if (type === "naissance") {
      setNaissances((prev) =>
        prev.map((n) => {
          if (n.id === id) {
            declarantNom = n.declarant || declarantNom;
            declarantTel = n.declarantTel || declarantTel;
            declarantEmail = n.declarantEmail || declarantEmail;
            respNom = n.responsableTraitantNom || adminNom;
            return {
              ...n,
              statut: "Validé",
              dateValidation: nowIso,
              validePar: respNom,
              notificationSmsEnvoyee: true,
              notificationEmailEnvoyee: true,
            };
          }
          return n;
        })
      );
    } else if (type === "deces") {
      setDeces((prev) =>
        prev.map((d) => {
          if (d.id === id) {
            declarantNom = d.declarant || declarantNom;
            declarantTel = d.declarantTel || declarantTel;
            declarantEmail = d.declarantEmail || declarantEmail;
            respNom = d.responsableTraitantNom || adminNom;
            return {
              ...d,
              statut: "Validé",
              dateValidation: nowIso,
              validePar: respNom,
              notificationSmsEnvoyee: true,
              notificationEmailEnvoyee: true,
            };
          }
          return d;
        })
      );
    } else if (type === "mariage") {
      setMariages((prev) =>
        prev.map((m) => {
          if (m.id === id) {
            declarantNom = m.declarant || declarantNom;
            declarantTel = m.declarantTel || declarantTel;
            declarantEmail = m.declarantEmail || declarantEmail;
            respNom = m.responsableTraitantNom || adminNom;
            return {
              ...m,
              statut: "Date confirmée",
              dateValidation: nowIso,
              validePar: respNom,
              notificationSmsEnvoyee: true,
              notificationEmailEnvoyee: true,
            };
          }
          return m;
        })
      );
    }

    enregistrerAudit(`Validation et signature officielle ${type} ${id} par ${respNom}`, id);
    onNotify?.(
      `✅ Acte ${id} validé ! Notifications SMS (${declarantTel}) et Email (${declarantEmail}) envoyées à ${declarantNom}.`,
      "success"
    );
  };

  
  // Helper de rendu des 3 sélecteurs avec zone de recherche intégrée (Région, Commune, Centre)
  const renderSelecteursTerritoire = (formObj, formSetter) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-black/30 rounded-xl border border-white/10">
      {/* 1. CHAMP RÉGION AVEC RECHERCHE */}
      <SearchableDropdown
        label="Région * :"
        value={formObj.region}
        placeholder="-- Choisir Région --"
        searchPlaceholder="🔍 Filtrer parmi les 10 régions..."
        options={listeRegions}
        onChange={(val) => formSetter({ ...formObj, region: val })}
        onAddNew={() => { setModeAjoutRegion(!modeAjoutRegion); setNouvelleRegionInput(""); }}
        isAdding={modeAjoutRegion}
        newInputValue={nouvelleRegionInput}
        onNewInputChange={setNouvelleRegionInput}
        onConfirmAdd={() => handleAjouterRegion(formSetter)}
        required={true}
      />

      {/* 2. CHAMP COMMUNE AVEC RECHERCHE EN DIRECT (372 COMMUNES) */}
      <SearchableDropdown
        label="Commune * :"
        value={formObj.commune}
        placeholder="-- Choisir Commune --"
        searchPlaceholder="🔍 Rechercher parmi les 372 communes..."
        options={listeCommunes}
        onChange={(val, opt) => {
          const found = typeof opt === "object" && opt.region ? opt : listeCommunes.find((c) => c.commune === val);
          formSetter({
            ...formObj,
            commune: val,
            region: found ? found.region : formObj.region,
            departement: found ? found.departement : formObj.departement,
          });
        }}
        onAddNew={() => { setModeAjoutCommune(!modeAjoutCommune); setNouvelleCommuneInput(""); }}
        isAdding={modeAjoutCommune}
        newInputValue={nouvelleCommuneInput}
        onNewInputChange={setNouvelleCommuneInput}
        onConfirmAdd={() => handleAjouterCommune(formSetter, formObj.region)}
        required={true}
      />

      {/* 3. CHAMP CENTRE D'ÉTAT CIVIL AVEC RECHERCHE EN DIRECT */}
      <SearchableDropdown
        label="Centre d'état civil :"
        value={formObj.centreEtatCivil}
        placeholder="-- Choisir Centre d'état civil --"
        searchPlaceholder="🔍 Rechercher un centre d'état civil..."
        options={listeCentres}
        onChange={(val) => formSetter({ ...formObj, centreEtatCivil: val })}
        onAddNew={() => { setModeAjoutCentre(!modeAjoutCentre); setNouveauCentreInput(""); }}
        isAdding={modeAjoutCentre}
        newInputValue={nouveauCentreInput}
        onNewInputChange={setNouveauCentreInput}
        onConfirmAdd={() => handleAjouterCentre(formSetter)}
      />
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#0A1A22] text-[#EAF2F4] flex flex-col md:flex-row font-sans">
      {/* Mobile Menu Overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* Navigation Latérale */}
      <aside className={`${mobileNavOpen ? "flex fixed" : "hidden"} md:flex md:relative inset-y-0 left-0 z-40 w-64 shrink-0 bg-[#0D1F28] border-r border-white/10 flex-col`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#3FA772]/20 text-[#3FA772] flex items-center justify-center font-bold border border-[#3FA772]/30">
              <UsersRound size={20} />
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                SYNDEC-CAM
              </div>
              <div className="text-[10px] text-teal-400 font-mono">État civil numérique</div>
            </div>
          </div>
          {onExit && (
            <button onClick={onExit} className="p-1 text-gray-400 hover:text-white rounded" title="Quitter">
              <X size={16} />
            </button>
          )}
        </div>

        

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto text-xs font-medium">
          <button
            onClick={() => setSyndecTab("syndecDashboard")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
              syndecTab === "syndecDashboard" ? "bg-[#714B67] text-white font-bold shadow" : "text-gray-300 hover:bg-white/5"
            }`}
          >
            <LayoutDashboard size={15} /> <span>Tableau de bord</span>
          </button>

          <div className="pt-2 text-[10px] uppercase font-mono text-gray-500 px-3">Déclarations Citoyennes</div>

          <button
            onClick={() => setSyndecTab("syndecNaissances")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              syndecTab === "syndecNaissances" ? "bg-[#714B67] text-white font-bold shadow" : "text-gray-300 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UsersRound size={15} className="text-teal-400" />
              <span>Naissances</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/10 font-mono">{naissances.length}</span>
          </button>

          <button
            onClick={() => setSyndecTab("syndecDeces")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              syndecTab === "syndecDeces" ? "bg-[#714B67] text-white font-bold shadow" : "text-gray-300 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileWarning size={15} className="text-amber-400" />
              <span>Décès</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/10 font-mono">{deces.length}</span>
          </button>

          <button
            onClick={() => setSyndecTab("syndecMariages")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              syndecTab === "syndecMariages" ? "bg-[#714B67] text-white font-bold shadow" : "text-gray-300 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Send size={15} className="text-purple-400" />
              <span>Mariages (Bancs)</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/10 font-mono">{mariages.length}</span>
          </button>

          {/* Section Administration & Finance */}
          <div className="pt-2 text-[10px] uppercase font-mono text-gray-500 px-3">Administration & Finance</div>

          <button
            onClick={() => setSyndecTab("syndecUtilisateurs")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
              syndecTab === "syndecUtilisateurs" ? "bg-[#714B67] text-white font-bold shadow" : "text-gray-300 hover:bg-white/5"
            }`}
          >
            <UserCheck size={15} className="text-teal-300" /> <span>Gestion Utilisateurs</span>
          </button>

          <button
            onClick={() => setSyndecTab("syndecAgents")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
              syndecTab === "syndecAgents" ? "bg-[#714B67] text-white font-bold shadow" : "text-gray-300 hover:bg-white/5"
            }`}
          >
            <UserPlus size={15} className="text-emerald-400" /> <span>Maires & Officiers</span>
          </button>

          <button
            onClick={() => setSyndecTab("syndecPaiements")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
              syndecTab === "syndecPaiements" ? "bg-[#714B67] text-white font-bold shadow" : "text-gray-300 hover:bg-white/5"
            }`}
          >
            <KeyRound size={15} className="text-amber-400" /> <span>Paiements Orange/MTN</span>
          </button>

          <button
            onClick={() => setSyndecTab("syndecCommunes")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
              syndecTab === "syndecCommunes" ? "bg-[#714B67] text-white font-bold shadow" : "text-gray-300 hover:bg-white/5"
            }`}
          >
            <Building2 size={15} className="text-blue-400" /> <span>372 Communes CM</span>
          </button>

          <button
            onClick={() => setSyndecTab("syndecAudit")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
              syndecTab === "syndecAudit" ? "bg-[#714B67] text-white font-bold shadow" : "text-gray-300 hover:bg-white/5"
            }`}
          >
            <History size={15} className="text-purple-300" /> <span>Journal d'Audit</span>
          </button>
                </nav>

        {/* Pied de Sidebar : Bloc Session */}
        <div className="p-3 border-t border-white/10 mt-auto bg-[#0A1A22]/80">
          <div className="text-[10px] uppercase tracking-wider text-[#8FA8B0] font-mono mb-2 px-1">
            SESSION
          </div>
          <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 mb-2.5">
            <div className="text-xs text-white font-bold truncate">{adminNom}</div>
            <div className="text-[11px] text-teal-300 font-mono mt-0.5">
              {sessionRole === "citoyen"
                ? "Usager déclarant"
                : sessionRole === "officier_ec"
                ? "Officier d'état civil"
                : sessionRole === "bunec"
                ? "Superviseur BUNEC"
                : "Administrateur national"}
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

      {/* Zone Principale */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
        {/* Header Institutionnel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#1B2936] to-[#13212D] p-4 rounded-2xl border border-white/10 shadow">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3FA772]/20 text-[#3FA772] border border-[#3FA772]/30">
                RÉPUBLIQUE DU CAMEROUN • BUNEC • MINAT • 372 COMMUNES
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1" style={{ fontFamily: "Rajdhani, sans-serif" }}>
              {syndecTab === "syndecDashboard" && "Tableau de Bord National d'État Civil"}
              {syndecTab === "syndecNaissances" && "Déclarations d'Actes de Naissance"}
              {syndecTab === "syndecDeces" && "Déclarations d'Actes de Décès"}
              {syndecTab === "syndecMariages" && "Déclarations de Bancs de Mariage"}
              {syndecTab === "syndecUtilisateurs" && "Gestion des Utilisateurs & Assistance Usagers"}
              {syndecTab === "syndecAgents" && "Maires, Adjoints, Officiers & Secrétaires d'État Civil"}
              {syndecTab === "syndecPaiements" && "Paiements Électroniques Mobile Money (Orange / MTN)"}
              {syndecTab === "syndecCommunes" && "Répertoire des 372 Communes du Territoire National"}
              {syndecTab === "syndecAudit" && "Journal d'Audit & Traçabilité Souveraine"}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {syndecTab === "syndecUtilisateurs" ? (
              <button
                onClick={() => {
                  setEditingUtilisateur(null);
                  setFormUtilisateur(emptyFormUtilisateur);
                  setModal("utilisateur");
                }}
                className="px-4 py-2 bg-[#714B67] hover:bg-[#875A7B] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
              >
                <UserPlus size={15} /> <span>Créer un Compte Usager / Agent</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (syndecTab === "syndecDeces") {
                    setEditing(null);
                    setFormDeces(emptyFormDeces);
                    setModal("deces");
                  } else if (syndecTab === "syndecMariages") {
                    setEditingMariage(null);
                    setFormMariage(emptyFormMariage);
                    setModal("mariage");
                  } else {
                    setEditing(null);
                    setFormNaissance(emptyFormNaissance);
                    setModal("naissance");
                  }
                }}
                className="px-4 py-2 bg-[#714B67] hover:bg-[#875A7B] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
              >
                <Plus size={15} />
                <span>
                  {syndecTab === "syndecDeces"
                    ? "Déclarer un Décès"
                    : syndecTab === "syndecMariages"
                    ? "Déclarer un Mariage"
                    : "Déclarer une Naissance"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* 1. TABLEAU DE BORD (AVEC DIAGRAMME À BARRES 10 RÉGIONS & DIAGRAMME EN COURBE 2025 vs 2026) */}
        {syndecTab === "syndecDashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-[#13212D] border border-white/10 rounded-xl">
                <div className="text-[11px] text-gray-400 uppercase font-mono">Total Déclarations</div>
                <div className="text-2xl font-bold text-white font-mono mt-1">{stats.totalDeclarations}</div>
                <div className="text-[11px] text-teal-400 mt-0.5">372 Communes supervisées</div>
              </div>

              <div className="p-4 bg-[#13212D] border border-white/10 rounded-xl">
                <div className="text-[11px] text-gray-400 uppercase font-mono">Recettes Mobile Money</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                  {stats.totalRevenu.toLocaleString("fr-FR")} FCFA
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">Ventilation 50% Communes / 50% RTC</div>
              </div>

              <div className="p-4 bg-[#13212D] border border-white/10 rounded-xl">
                <div className="text-[11px] text-gray-400 uppercase font-mono">Utilisateurs Enregistrés</div>
                <div className="text-2xl font-bold text-purple-300 font-mono mt-1">{utilisateurs.length}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Usagers, Maires, BUNEC</div>
              </div>

              <div className="p-4 bg-[#13212D] border border-white/10 rounded-xl">
                <div className="text-[11px] text-gray-400 uppercase font-mono">Événements d'Audit</div>
                <div className="text-2xl font-bold text-teal-300 font-mono mt-1">{auditLog.length}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Traçabilité 100% sécurisée</div>
              </div>
            </div>

            {/* GRAPHIQUES : BARRES 10 RÉGIONS & COURBE COMPARATIVE 2025 vs 2026 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. DIAGRAMME À BARRES */}
              <div className="p-5 bg-[#13212D] border border-white/10 rounded-2xl shadow space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3FA772]" />
                      <span>Répartition des Naissances par Région (10 Régions)</span>
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Statistiques consolidées BUNEC pour les 10 régions du Cameroun
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300">
                    National
                  </span>
                </div>

                <div className="h-[280px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={donneesNaissancesParRegion} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis
                        dataKey="region"
                        stroke="#8FA8B0"
                        tick={{ fill: "#8FA8B0", fontSize: 9 }}
                        angle={-30}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis stroke="#8FA8B0" tick={{ fill: "#8FA8B0", fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#13212D",
                          borderColor: "#ffffff20",
                          borderRadius: 10,
                          color: "#fff",
                          fontSize: 12,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
                        }}
                        formatter={(value) => [`${value.toLocaleString("fr-FR")} naissances`, "Enregistrements"]}
                      />
                      <Bar dataKey="naissances" fill="#3FA772" radius={[6, 6, 0, 0]} name="Naissances" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 2. DIAGRAMME EN COURBE */}
              <div className="p-5 bg-[#13212D] border border-white/10 rounded-2xl shadow space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]" />
                      <span>Évolution & Comparatif Mensuel de la Natalité (2025 vs 2026)</span>
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Comparaison 12 mois • Année en cours (2026) arrêtée au mois précédent (Juillet)
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300">
                    +8.2% vs 2025
                  </span>
                </div>

                <div className="h-[280px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={donneesComparaisonNatalite} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="mois" stroke="#8FA8B0" tick={{ fill: "#8FA8B0", fontSize: 10 }} />
                      <YAxis stroke="#8FA8B0" tick={{ fill: "#8FA8B0", fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#13212D",
                          borderColor: "#ffffff20",
                          borderRadius: 10,
                          color: "#fff",
                          fontSize: 12,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
                        }}
                        formatter={(value) => value ? [`${value.toLocaleString("fr-FR")} naissances`, ""] : ["En cours d'enregistrement", ""]}
                      />
                      <Legend wrapperStyle={{ paddingTop: 6, fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="2025 (Année précédente)"
                        stroke="#E5A93C"
                        strokeWidth={2.2}
                        strokeDasharray="4 4"
                        dot={{ r: 3.5, fill: "#E5A93C" }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="2026 (Année en cours)"
                        stroke="#00E5FF"
                        strokeWidth={3}
                        connectNulls={false}
                        dot={{ r: 4.5, fill: "#00E5FF" }}
                        activeDot={{ r: 6.5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#13212D] border border-white/10 rounded-2xl">
              <div className="font-bold text-white mb-2 text-sm">Supervision Nationale BUNEC & Mairies</div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Le Bureau National de l'État Civil (BUNEC) assure la tutelle technique et la supervision statistique des déclarations d'actes de naissance, de décès et de mariage sur l'ensemble des 372 communes du Cameroun.
              </p>
            </div>
          </div>
        )}

        {/* 2. DÉCLARATIONS DE NAISSANCE */}
        {syndecTab === "syndecNaissances" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 bg-[#13212D] p-3 rounded-xl border border-white/10">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par enfant, référence, commune..."
                  value={searchNaissances}
                  onChange={(e) => { setSearchNaissances(e.target.value); setPageNaissances(1); }}
                  className="w-full bg-[#1A2C3C] text-xs text-white pl-9 pr-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                />
              </div>
              <div className="text-[11px] text-teal-400 font-mono hidden sm:block">
                💡 Double-cliquez sur une ligne pour modifier
              </div>
            </div>

            <div className="bg-[#13212D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-[#EAF2F4]">
                  <thead className="bg-[#1E1F29] text-[11px] uppercase tracking-wider text-[#8FA8B0] font-mono border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Réf / Date</th>
                      <th className="py-3 px-4">Enfant & Sexe</th>
                      <th className="py-3 px-4">Lieu de Naissance</th>
                      <th className="py-3 px-4">Commune & Centre</th>
                      <th className="py-3 px-4">Responsable Traitant</th>
                      <th className="py-3 px-4 text-center">Frais Mobile Money</th>
                      <th className="py-3 px-4 text-center">Statut & Notif</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pagNaissances.pageItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-gray-400">Aucune déclaration trouvée.</td>
                      </tr>
                    ) : (
                      pagNaissances.pageItems.map((r) => {
                        const estPaye = r.statutPaiement === "Payé";
                        const estValide = r.statut === "Validé";
                        const peutTraiter = sessionRole === "officier_ec" || sessionRole === "admin";

                        return (
                          <tr
                            key={r.id}
                            onDoubleClick={() => {
                              setFormNaissance(r);
                              setEditing({ type: "naissance", id: r.id });
                              setModal("naissance");
                            }}
                            className="hover:bg-white/5 transition-colors cursor-pointer"
                            title="Double-cliquez pour modifier cette déclaration"
                          >
                            <td className="py-3 px-4 align-top">
                              <div className="font-mono font-bold text-amber-300">{r.id}</div>
                              <div className="text-[10px] text-gray-400 font-mono">{r.date}</div>
                            </td>

                            <td className="py-3 px-4 align-top">
                              <div className="font-bold text-white">{r.prenomEnfant} {r.nomEnfant}</div>
                              <div className="text-[10px] text-teal-300 font-mono">Sexe : {r.sexe} • Né(e) le {r.dateNaissance}</div>
                            </td>

                            <td className="py-3 px-4 align-top">
                              <div className="text-gray-200">{r.lieu}</div>
                              <div className="text-[10px] text-gray-400 truncate max-w-[180px]">P: {r.nomPere} | M: {r.nomMere}</div>
                            </td>

                            <td className="py-3 px-4 align-top">
                              <div className="font-medium text-gray-200">{r.commune}</div>
                              <div className="text-[10px] text-teal-400 font-mono">{r.centreEtatCivil}</div>
                            </td>

                            <td className="py-3 px-4 align-top">
                              <div className="font-bold text-white">{r.responsableTraitantNom}</div>
                              <div className="text-[10px] text-purple-300 font-mono">{r.responsableTraitantRole}</div>
                            </td>

                            <td className="py-3 px-4 text-center align-top">
                              {estPaye ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                  Payé ({r.modePaiement || "OM"})
                                </span>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDossierPaiement({ ...r, typeDossier: "naissance" });
                                    setModal("paiement");
                                  }}
                                  className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold"
                                >
                                  Payer 1500 F
                                </button>
                              )}
                            </td>

                            <td className="py-3 px-4 text-center align-top">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                                {r.statut}
                              </span>
                              {estValide && <div className="text-[8px] text-teal-300 mt-1">SMS & Email ✓</div>}
                            </td>

                            <td className="py-3 px-4 text-center align-top" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1.5">
                                {estValide ? (
                                  <button
                                    onClick={() => {
                                      setCertificateRecord(r);
                                      setCertificateType("naissance");
                                      setModal("certificat");
                                    }}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                                    title="Voir et télécharger l'Acte officiel"
                                  >
                                    <Download size={11} /> Acte
                                  </button>
                                ) : peutTraiter && estPaye ? (
                                  <button
                                    onClick={() => handleOuvrirSignatureActe(r, "naissance")}
                                    className="px-2 py-1 bg-[#3FA772] text-white font-bold rounded text-[10px]"
                                  >
                                    Signer
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setFormNaissance(r);
                                      setEditing({ type: "naissance", id: r.id });
                                      setModal("naissance");
                                    }}
                                    className="p-1 hover:text-teal-300 text-gray-400"
                                    title="Modifier"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                )}

                                {sessionRole === "admin" && (
                                  <button
                                    onClick={() => handleDeleteNaissance(r.id)}
                                    className="p-1 hover:text-red-400 text-gray-500"
                                    title="Supprimer (Admin)"
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
              <PaginationBar currentPage={pagNaissances.pageAjustee}
                totalPages={pagNaissances.totalPages}
                totalCount={pagNaissances.totalItems}
                onPageChange={setPageNaissances}
              />
            </div>
          </div>
        )}

        {/* 3. DÉCLARATIONS DE DÉCÈS */}
        {syndecTab === "syndecDeces" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 bg-[#13212D] p-3 rounded-xl border border-white/10">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par défunt, commune..."
                  value={searchDeces}
                  onChange={(e) => { setSearchDeces(e.target.value); setPageDeces(1); }}
                  className="w-full bg-[#1A2C3C] text-xs text-white pl-9 pr-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                />
              </div>
              <div className="text-[11px] text-teal-400 font-mono hidden sm:block">
                💡 Double-cliquez sur une ligne pour modifier
              </div>
            </div>

            <div className="bg-[#13212D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-[#EAF2F4]">
                  <thead className="bg-[#1E1F29] text-[11px] uppercase tracking-wider text-[#8FA8B0] font-mono border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Réf / Date</th>
                      <th className="py-3 px-4">Défunt & Sexe</th>
                      <th className="py-3 px-4">Lieu & Date Décès</th>
                      <th className="py-3 px-4">Commune & Centre</th>
                      <th className="py-3 px-4">Responsable Traitant</th>
                      <th className="py-3 px-4 text-center">Frais (5 000 FCFA)</th>
                      <th className="py-3 px-4 text-center">Statut & Notif</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pagDeces.pageItems.map((r) => {
                      const estPaye = r.statutPaiement === "Payé";
                      const estValide = r.statut === "Validé";
                      const peutTraiter = sessionRole === "officier_ec" || sessionRole === "admin";

                      return (
                        <tr
                          key={r.id}
                          onDoubleClick={() => {
                            setFormDeces(r);
                            setEditing({ type: "deces", id: r.id });
                            setModal("deces");
                          }}
                          className="hover:bg-white/5 transition-colors cursor-pointer"
                          title="Double-cliquez pour modifier"
                        >
                          <td className="py-3 px-4 align-top font-mono font-bold text-amber-300">{r.id}</td>
                          <td className="py-3 px-4 align-top font-bold text-white">{r.prenomDefunt} {r.nomDefunt}</td>
                          <td className="py-3 px-4 align-top text-gray-200">{r.lieu} ({r.dateDeces})</td>
                          <td className="py-3 px-4 align-top">{r.commune}</td>
                          <td className="py-3 px-4 align-top font-bold text-white">{r.responsableTraitantNom} ({r.responsableTraitantRole})</td>
                          <td className="py-3 px-4 text-center align-top">
                            {estPaye ? <span className="text-emerald-300 font-mono">Payé ({r.modePaiement})</span> : <span className="text-red-400">Non payé</span>}
                          </td>
                          <td className="py-3 px-4 text-center align-top">{r.statut}</td>
                          <td className="py-3 px-4 text-center align-top" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              {estValide ? (
                                <button
                                  onClick={() => {
                                    setCertificateRecord(r);
                                    setCertificateType("deces");
                                    setModal("certificat");
                                  }}
                                  className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                                >
                                  Acte PDF
                                </button>
                              ) : peutTraiter && estPaye ? (
                                <button
                                  onClick={() => handleOuvrirSignatureActe(r, "deces")}
                                  className="px-2 py-1 bg-[#3FA772] text-white font-bold rounded text-[10px]"
                                >
                                  Signer
                                </button>
                              ) : null}

                              {sessionRole === "admin" && (
                                <button
                                  onClick={() => handleDeleteDeces(r.id)}
                                  className="p-1 hover:text-red-400 text-gray-500"
                                  title="Supprimer (Admin)"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <PaginationBar currentPage={pagDeces.pageAjustee}
                totalPages={pagDeces.totalPages}
                totalCount={pagDeces.totalItems}
                onPageChange={setPageDeces}
              />
            </div>
          </div>
        )}

        {/* 4. DÉCLARATIONS DE MARIAGE */}
        {syndecTab === "syndecMariages" && (
          <div className="space-y-4">
            <div className="bg-[#13212D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-[#EAF2F4]">
                  <thead className="bg-[#1E1F29] text-[11px] uppercase tracking-wider text-[#8FA8B0] font-mono border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Réf / Date</th>
                      <th className="py-3 px-4">Conjoints</th>
                      <th className="py-3 px-4">Date Souhaitée & Commune</th>
                      <th className="py-3 px-4">Maire / Officier</th>
                      <th className="py-3 px-4 text-center">Frais (35 500 F)</th>
                      <th className="py-3 px-4 text-center">Statut</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pagMariages.pageItems.map((r) => (
                      <tr
                        key={r.id}
                        onDoubleClick={() => {
                          setFormMariage(r);
                          setEditingMariage(r.id);
                          setModal("mariage");
                        }}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        title="Double-cliquez pour modifier"
                      >
                        <td className="py-3 px-4 align-top font-mono font-bold text-amber-300">{r.id}</td>
                        <td className="py-3 px-4 align-top font-bold text-white">{r.conjoint1} & {r.conjoint2}</td>
                        <td className="py-3 px-4 align-top">{r.dateSouhaitee || "À fixer"} ({r.commune})</td>
                        <td className="py-3 px-4 align-top font-bold text-white">{r.responsableTraitantNom}</td>
                        <td className="py-3 px-4 text-center align-top font-mono text-emerald-300">Payé ({r.modePaiement})</td>
                        <td className="py-3 px-4 text-center align-top">{r.statut}</td>
                        <td className="py-3 px-4 text-center align-top" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            {sessionRole === "admin" && (
                              <button
                                onClick={() => handleDeleteMariage(r.id)}
                                className="p-1 hover:text-red-400 text-gray-500"
                                title="Supprimer (Admin)"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationBar currentPage={pagMariages.pageAjustee}
                totalPages={pagMariages.totalPages}
                totalCount={pagMariages.totalItems}
                onPageChange={setPageMariages}
              />
            </div>
          </div>
        )}

        {/* 5. GESTION DES UTILISATEURS */}
        {syndecTab === "syndecUtilisateurs" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#13212D] p-3 rounded-xl border border-white/10">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, rôle, contact, commune..."
                  value={searchUtilisateurs}
                  onChange={(e) => { setSearchUtilisateurs(e.target.value); setPageUtilisateurs(1); }}
                  className="w-full bg-[#1A2C3C] text-xs text-white pl-9 pr-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  setEditingUtilisateur(null);
                  setFormUtilisateur(emptyFormUtilisateur);
                  setModal("utilisateur");
                }}
                className="px-3.5 py-2 bg-[#714B67] hover:bg-[#875A7B] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
              >
                <UserPlus size={14} /> <span>+ Nouvel Usager / Compte</span>
              </button>
            </div>

            <div className="bg-[#13212D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-[#EAF2F4]">
                  <thead className="bg-[#1E1F29] text-[11px] uppercase tracking-wider text-[#8FA8B0] font-mono border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">ID Utilisateur</th>
                      <th className="py-3 px-4">Nom Complet</th>
                      <th className="py-3 px-4">Rôle / Profil</th>
                      <th className="py-3 px-4">Téléphone</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Commune d'Attache</th>
                      <th className="py-3 px-4 text-center">Statut Compte</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pagUtilisateurs.pageItems.map((u) => (
                      <tr
                        key={u.id}
                        onDoubleClick={() => {
                          setFormUtilisateur(u);
                          setEditingUtilisateur(u.id);
                          setModal("utilisateur");
                        }}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        title="Double-cliquez pour modifier ce compte"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-amber-300">{u.id}</td>
                        <td className="py-3 px-4 font-bold text-white">{u.nom}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {u.profil}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-300">{formatCameroonPhone(u.contact) || "—"}</td>
                        <td className="py-3 px-4 font-mono text-teal-300/90 lowercase">{u.email || "—"}</td>
                        <td className="py-3 px-4 text-gray-200">{u.commune}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                            Actif
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setFormUtilisateur(u);
                                setEditingUtilisateur(u.id);
                                setModal("utilisateur");
                              }}
                              className="p-1 hover:text-teal-300 text-gray-400"
                              title="Modifier"
                            >
                              <Pencil size={12} />
                            </button>
                            {sessionRole === "admin" && (
                              <button
                                onClick={() => handleDeleteUtilisateur(u.id)}
                                className="p-1 hover:text-red-400 text-gray-500"
                                title="Supprimer"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationBar currentPage={pagUtilisateurs.pageAjustee}
                totalPages={pagUtilisateurs.totalPages}
                totalCount={pagUtilisateurs.totalItems}
                onPageChange={setPageUtilisateurs}
              />
            </div>
          </div>
        )}

        {/* 6. JOURNAL D'AUDIT */}
        {syndecTab === "syndecAudit" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 bg-[#13212D] p-3 rounded-xl border border-white/10">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filtrer les audits par acteur, action, dossier..."
                  value={searchAudit}
                  onChange={(e) => { setSearchAudit(e.target.value); setPageAudit(1); }}
                  className="w-full bg-[#1A2C3C] text-xs text-white pl-9 pr-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-[#13212D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-[#EAF2F4]">
                  <thead className="bg-[#1E1F29] text-[11px] uppercase tracking-wider text-[#8FA8B0] font-mono border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Horodatage</th>
                      <th className="py-3 px-4">Acteur / Rôle</th>
                      <th className="py-3 px-4">Action Traçable</th>
                      <th className="py-3 px-4">Réf Dossier</th>
                      <th className="py-3 px-4">Commune / Canal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {pagAudit.pageItems.map((a) => (
                      <tr key={a.id} className="hover:bg-white/5">
                        <td className="py-3 px-4 text-gray-400">{a.date}</td>
                        <td className="py-3 px-4 text-white font-bold">{a.acteur} ({a.role})</td>
                        <td className="py-3 px-4 font-sans text-teal-300">{a.action}</td>
                        <td className="py-3 px-4 text-amber-300 font-bold">{a.refDossier}</td>
                        <td className="py-3 px-4 text-gray-300">{a.commune} • {a.canal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationBar currentPage={pagAudit.pageAjustee}
                totalPages={pagAudit.totalPages}
                totalCount={pagAudit.totalItems}
                onPageChange={setPageAudit}
              />
            </div>
          </div>
        )}

        {/* 7. RÉPERTOIRE DES 372 COMMUNES */}
        {syndecTab === "syndecCommunes" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#13212D] p-3 rounded-xl border border-white/10">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par commune, maire, département, région..."
                  value={searchCommunes}
                  onChange={(e) => { setSearchCommunes(e.target.value); setPageCommunes(1); }}
                  className="w-full bg-[#1A2C3C] text-xs text-white pl-9 pr-3 py-2 rounded-lg border border-white/10 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400 font-mono">
                  Total : <strong className="text-white">{filteredCommunes.length}</strong> communes (10 Régions / 58 Départements)
                </div>
                <div className="text-[11px] text-teal-300 font-sans italic hidden sm:block">
                  💡 Double-cliquez sur une ligne pour modifier le Maire
                </div>
              </div>
            </div>

            <div className="bg-[#13212D] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-[#EAF2F4]">
                  <thead className="bg-[#1E1F29] text-[11px] uppercase tracking-wider text-[#8FA8B0] font-mono border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Région</th>
                      <th className="py-3 px-4">Département</th>
                      <th className="py-3 px-4">Nom Officiel de la Commune</th>
                      <th className="py-3 px-4">Responsable de la commune</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pagCommunes.pageItems.map((c, i) => {
                      const maireNom = mairesOverrides[c.commune] || obtenirMaireDeCommune(c.commune, c.region);

                      return (
                        <tr
                          key={c.commune || i}
                          onDoubleClick={() => handleOpenEditCommune(c)}
                          className="hover:bg-white/10 transition-colors cursor-pointer group"
                          title="Double-cliquez pour modifier le Maire ou la commune"
                        >
                          <td className="py-2.5 px-4 font-bold text-teal-300">{c.region}</td>
                          <td className="py-2.5 px-4 text-gray-300">{c.departement}</td>
                          <td className="py-2.5 px-4 font-medium text-white group-hover:text-teal-200">{c.commune}</td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                                {maireNom.charAt(0)}
                              </div>
                              <div className="truncate">
                                <div className="font-bold text-white text-xs truncate">{maireNom}</div>
                                <div className="text-[10px] text-teal-400 font-mono">Maire de {communeSimple(c.commune)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditCommune(c)}
                                className="p-1 text-gray-400 hover:text-teal-300 rounded hover:bg-white/10"
                                title="Modifier le Maire ou la commune"
                              >
                                <Pencil size={13} />
                              </button>
                              {sessionRole === "admin" && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCommune(c.commune)}
                                  className="p-1 text-gray-400 hover:text-red-400 rounded hover:bg-white/10"
                                  title="Supprimer la commune (Admin)"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <PaginationBar currentPage={pagCommunes.pageAjustee}
                totalPages={pagCommunes.totalPages}
                totalCount={pagCommunes.totalItems}
                onPageChange={(p) => setPageCommunes(p)}
              />
            </div>
          </div>
        )}

        {/* 8. VUE MAIRES & OFFICIERS */}
        {syndecTab === "syndecAgents" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">
                Liste des Maires, Adjoints, Officiers et Secrétaires d'état civil affectés.
              </div>
              <button
                onClick={() => {
                  setFormOfficier(emptyFormOfficier);
                  setEditingOfficier(null);
                  setModal("officier");
                }}
                className="px-3.5 py-2 bg-[#714B67] hover:bg-[#875A7B] text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Plus size={14} /> <span>Nouveau Maire / Officier</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pagAgents.pageItems.map((a) => (
                <div key={a.id} className="p-4 bg-[#13212D] border border-white/10 rounded-2xl space-y-2 shadow">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-teal-500/20 text-teal-300">{a.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">{a.role}</span>
                  </div>
                  <div className="font-bold text-white text-sm">{a.nom}</div>
                  <div className="text-xs text-gray-300">{a.commune}</div>
                  <div className="text-[11px] text-teal-400 font-mono">{a.centreEtatCivil}</div>
                </div>
              ))}
            </div>
            <PaginationBar currentPage={pagAgents.pageAjustee}
              totalPages={pagAgents.totalPages}
              totalCount={pagAgents.totalItems}
              onPageChange={setPageAgents}
            />
          </div>
        )}

        {/* 9. VUE PAIEMENTS ORANGE / MTN */}
        {syndecTab === "syndecPaiements" && (
          <div className="space-y-4">
            <div className="p-4 bg-[#13212D] border border-white/10 rounded-2xl space-y-2">
              <h3 className="font-bold text-white text-base">Règlements Sécurisés Mobile Money (Orange / MTN)</h3>
              <p className="text-xs text-gray-400">
                Chaque acte fait l'objet d'un prélèvement légal automatique et d'une référence certifiée.
              </p>
            </div>

            <div className="bg-[#13212D] border border-white/10 rounded-2xl overflow-hidden shadow">
              <table className="w-full text-xs text-left text-[#EAF2F4]">
                <thead className="bg-[#1E1F29] text-[11px] uppercase tracking-wider text-[#8FA8B0] font-mono border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Réf Dossier</th>
                    <th className="py-3 px-4">Type Acte</th>
                    <th className="py-3 px-4">Opérateur & Réf</th>
                    <th className="py-3 px-4">Part Commune</th>
                    <th className="py-3 px-4">Part RTC</th>
                    <th className="py-3 px-4 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {naissances.filter((n) => n.statutPaiement === "Payé").map((n) => (
                    <tr key={n.id} className="hover:bg-white/5">
                      <td className="py-3 px-4 font-bold text-amber-300">{n.id}</td>
                      <td className="py-3 px-4 font-sans text-white">Naissance</td>
                      <td className="py-3 px-4 text-teal-300">{n.modePaiement} ({n.referencePaiement})</td>
                      <td className="py-3 px-4">750 FCFA</td>
                      <td className="py-3 px-4">750 FCFA</td>
                      <td className="py-3 px-4 font-bold text-right text-emerald-400">1 500 FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>


      {/* =======================================================================
          MODALE MODIFICATION DE COMMUNE & MAIRE (Double-clic sur une ligne)
         ======================================================================= */}
      {modal === "edit_commune" && editingCommune && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 bg-[#714B67] border-b border-[#5B3A52] flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-teal-300" />
                <h3 className="font-bold text-base tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  Modifier la Commune & son Maire
                </h3>
              </div>
              <button onClick={() => { setModal(null); setEditingCommune(null); }} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditCommune} className="p-6 space-y-4 text-xs text-[#EAF2F4]">
              <div>
                <label className="block text-[#8FA8B0] font-semibold mb-1">Nom officiel de la Commune * :</label>
                <input
                  type="text"
                  required
                  value={editingCommune.commune}
                  onChange={(e) => setEditingCommune({ ...editingCommune, commune: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-xs text-white p-2.5 rounded-lg border border-white/10 font-bold focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-[#8FA8B0] font-semibold mb-1">Nom et prénom du Maire (Responsable) * :</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Francis Gaël Touna"
                  value={editingCommune.maire}
                  onChange={(e) => setEditingCommune({ ...editingCommune, maire: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-xs text-white p-2.5 rounded-lg border border-white/10 font-bold focus:border-teal-400 text-teal-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Région * :</label>
                  <select
                    value={editingCommune.region}
                    onChange={(e) => setEditingCommune({ ...editingCommune, region: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2.5 rounded-lg border border-white/10 font-medium focus:border-teal-400"
                  >
                    {listeRegions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Département * :</label>
                  <input
                    type="text"
                    required
                    value={editingCommune.departement}
                    onChange={(e) => setEditingCommune({ ...editingCommune, departement: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2.5 rounded-lg border border-white/10 font-medium focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                {sessionRole === "admin" ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteCommune(editingCommune.originalCommune)}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-red-500/30"
                  >
                    <Trash2 size={13} />
                    <span>Supprimer la commune</span>
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setModal(null); setEditingCommune(null); }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#714B67] hover:bg-[#875A7B] text-white font-bold rounded-xl shadow-lg"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODALE FORMULAIRE : NAISSANCE (3 SÉLECTEURS RÉGION, COMMUNE, CENTRE)
         ======================================================================= */}
      {modal === "naissance" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 bg-[#714B67] border-b border-[#5B3A52] flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <UsersRound size={18} className="text-teal-300" />
                <h3 className="font-bold text-base tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  {editing?.type === "naissance" ? "Modifier la déclaration de naissance" : "Nouvelle déclaration d'acte de naissance"}
                </h3>
              </div>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitNaissance} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto text-[#EAF2F4]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Nom de l'enfant * :</label>
                  <input
                    type="text"
                    required
                    value={formNaissance.nomEnfant}
                    onChange={(e) => setFormNaissance({ ...formNaissance, nomEnfant: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Prénom(s) :</label>
                  <input
                    type="text"
                    value={formNaissance.prenomEnfant}
                    onChange={(e) => setFormNaissance({ ...formNaissance, prenomEnfant: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Sexe * :</label>
                  <select
                    value={formNaissance.sexe}
                    onChange={(e) => setFormNaissance({ ...formNaissance, sexe: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                  >
                    <option value="M">Masculin (M)</option>
                    <option value="F">Féminin (F)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Date de naissance * :</label>
                  <input
                    type="date"
                    required
                    value={formNaissance.dateNaissance}
                    onChange={(e) => setFormNaissance({ ...formNaissance, dateNaissance: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Lieu de naissance * :</label>
                  <input
                    type="text"
                    required
                    placeholder="Ville / Hôpital"
                    value={formNaissance.lieu}
                    onChange={(e) => setFormNaissance({ ...formNaissance, lieu: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                  />
                </div>
              </div>

              {/* SÉLECTEURS RÉGION (10 RÉGIONS), COMMUNE (372 COMMUNES), CENTRE D'ÉTAT CIVIL */}
              {renderSelecteursTerritoire(formNaissance, setFormNaissance)}

              {/* Parents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Nom et prénom du père :</label>
                  <input
                    type="text"
                    value={formNaissance.nomPere}
                    onChange={(e) => setFormNaissance({ ...formNaissance, nomPere: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Nom et prénom de la mère :</label>
                  <input
                    type="text"
                    value={formNaissance.nomMere}
                    onChange={(e) => setFormNaissance({ ...formNaissance, nomMere: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                  />
                </div>
              </div>

              
              {/* Choix du Responsable Traitant avec Recherche et Bouton + Ajouter */}
              <div className="p-3.5 bg-[#1A2C3C] rounded-xl border-teal-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-white font-semibold text-xs">
                    Responsable d'État Civil Traitant (Maire / Adjoint / Officier / Secrétaire) * :
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setModeAjoutOfficier(!modeAjoutOfficier);
                      setNouveauOfficierNom("");
                    }}
                    className="text-[10px] text-teal-300 hover:underline font-bold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20"
                  >
                    {modeAjoutOfficier ? "Annuler" : "+ Ajouter"}
                  </button>
                </div>

                {modeAjoutOfficier ? (
                  <div className="p-2.5 bg-[#13212D] rounded-lg border border-teal-500/40 space-y-2">
                    <div className="text-[11px] text-teal-300 font-bold">Ajouter un nouveau responsable d'état civil :</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nom et prénom du responsable..."
                        value={nouveauOfficierNom}
                        onChange={(e) => setNouveauOfficierNom(e.target.value)}
                        className="w-full bg-[#0D1F28] text-xs text-white p-2 rounded border border-white/15 focus:border-teal-400 font-medium"
                        autoFocus
                      />
                      <select
                        value={nouveauOfficierRole}
                        onChange={(e) => setNouveauOfficierRole(e.target.value)}
                        className="w-full bg-[#0D1F28] text-xs text-white p-2 rounded border border-white/15 focus:border-teal-400"
                      >
                        <option value="Maire">Maire</option>
                        <option value="Adjoint au maire">Adjoint au maire</option>
                        <option value="Officier d'état civil">Officier d'état civil</option>
                        <option value="Secrétaire d'état civil">Secrétaire d'état civil</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setModeAjoutOfficier(false)}
                        className="px-3 py-1 bg-white/5 text-gray-300 rounded text-xs"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAjouterOfficierRapide(setFormNaissance, formNaissance.commune, formNaissance.region)}
                        className="px-4 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold shadow"
                      >
                        Enregistrer & Sélectionner
                      </button>
                    </div>
                  </div>
                ) : (
                  <SearchableDropdown
                    label=""
                    value={
                      formNaissance.responsableTraitantNom
                        ? `${formNaissance.responsableTraitantNom} — ${formNaissance.responsableTraitantRole} (${formNaissance.commune || "Commune"})`
                        : ""
                    }
                    placeholder="-- Choisir un Maire, Officier ou Secrétaire --"
                    searchPlaceholder="🔍 Rechercher par nom, rôle ou commune..."
                    options={agents.map((a) => ({
                      value: a.id,
                      label: `${a.nom} — ${a.role}`,
                      group: `${a.commune} (${a.centreEtatCivil || "Mairie"})`,
                      raw: a,
                    }))}
                    onChange={(val, opt) => {
                      const ag = opt?.raw || agents.find((a) => a.id === val);
                      if (ag) {
                        setFormNaissance({
                          ...formNaissance,
                          responsableTraitantId: ag.id,
                          responsableTraitantNom: ag.nom,
                          responsableTraitantRole: ag.role,
                          centreEtatCivil: ag.centreEtatCivil || formNaissance.centreEtatCivil,
                        });
                      }
                    }}
                    required={true}
                  />
                )}
              </div>

              {/* Paiement Mobile Money 1 500 F */}
              <div className="p-4 bg-[#1E1F29] rounded-xl border border-amber-500/30 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CreditCard size={14} className="text-amber-400" />
                  <span>Frais d'Acte : <strong className="text-amber-300">1 500 FCFA</strong></span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-white font-semibold">
                  <input
                    type="checkbox"
                    checked={formNaissance.payerMaintenant}
                    onChange={(e) => setFormNaissance({ ...formNaissance, payerMaintenant: e.target.checked })}
                    className="w-4 h-4 rounded text-[#3FA772]"
                  />
                  <span>Régler immédiatement par Orange Money ou MTN Mobile Money</span>
                </label>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 bg-white/5 text-gray-300 rounded-xl font-semibold">
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2.5 bg-[#714B67] hover:bg-[#875A7B] text-white font-bold rounded-xl flex items-center gap-1.5 shadow">
                  <CheckCircle2 size={15} />
                  <span>Enregistrer la Déclaration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODALE FORMULAIRE : DÉCÈS (3 SÉLECTEURS RÉGION, COMMUNE, CENTRE)
         ======================================================================= */}
      {modal === "deces" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 bg-[#714B67] border-b border-[#5B3A52] flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <FileWarning size={18} className="text-amber-300" />
                <h3 className="font-bold text-base tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  {editing?.type === "deces" ? "Modifier la déclaration de décès" : "Nouvelle déclaration d'acte de décès"}
                </h3>
              </div>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitDeces} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto text-[#EAF2F4]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Nom du défunt * :</label>
                  <input
                    type="text"
                    required
                    value={formDeces.nomDefunt}
                    onChange={(e) => setFormDeces({ ...formDeces, nomDefunt: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Prénom(s) :</label>
                  <input
                    type="text"
                    value={formDeces.prenomDefunt}
                    onChange={(e) => setFormDeces({ ...formDeces, prenomDefunt: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Sexe * :</label>
                  <select
                    value={formDeces.sexe}
                    onChange={(e) => setFormDeces({ ...formDeces, sexe: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                  >
                    <option value="M">Masculin (M)</option>
                    <option value="F">Féminin (F)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Date du décès * :</label>
                  <input
                    type="date"
                    required
                    value={formDeces.dateDeces}
                    onChange={(e) => setFormDeces({ ...formDeces, dateDeces: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Lieu du décès * :</label>
                  <input
                    type="text"
                    required
                    placeholder="Ville / Hôpital"
                    value={formDeces.lieu}
                    onChange={(e) => setFormDeces({ ...formDeces, lieu: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                  />
                </div>
              </div>

              {/* SÉLECTEURS RÉGION, COMMUNE, CENTRE */}
              {renderSelecteursTerritoire(formDeces, setFormDeces)}

              
              {/* Choix du Responsable Traitant avec Recherche et Bouton + Ajouter */}
              <div className="p-3.5 bg-[#1A2C3C] rounded-xl border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-white font-semibold text-xs">
                    Responsable d'État Civil Traitant (Maire / Adjoint / Officier / Secrétaire) * :
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setModeAjoutOfficier(!modeAjoutOfficier);
                      setNouveauOfficierNom("");
                    }}
                    className="text-[10px] text-teal-300 hover:underline font-bold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20"
                  >
                    {modeAjoutOfficier ? "Annuler" : "+ Ajouter"}
                  </button>
                </div>

                {modeAjoutOfficier ? (
                  <div className="p-2.5 bg-[#13212D] rounded-lg border border-teal-500/40 space-y-2">
                    <div className="text-[11px] text-teal-300 font-bold">Ajouter un nouveau responsable d'état civil :</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nom et prénom du responsable..."
                        value={nouveauOfficierNom}
                        onChange={(e) => setNouveauOfficierNom(e.target.value)}
                        className="w-full bg-[#0D1F28] text-xs text-white p-2 rounded border border-white/15 focus:border-teal-400 font-medium"
                        autoFocus
                      />
                      <select
                        value={nouveauOfficierRole}
                        onChange={(e) => setNouveauOfficierRole(e.target.value)}
                        className="w-full bg-[#0D1F28] text-xs text-white p-2 rounded border border-white/15 focus:border-teal-400"
                      >
                        <option value="Maire">Maire</option>
                        <option value="Adjoint au maire">Adjoint au maire</option>
                        <option value="Officier d'état civil">Officier d'état civil</option>
                        <option value="Secrétaire d'état civil">Secrétaire d'état civil</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setModeAjoutOfficier(false)}
                        className="px-3 py-1 bg-white/5 text-gray-300 rounded text-xs"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAjouterOfficierRapide(setFormDeces, formDeces.commune, formDeces.region)}
                        className="px-4 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold shadow"
                      >
                        Enregistrer & Sélectionner
                      </button>
                    </div>
                  </div>
                ) : (
                  <SearchableDropdown
                    label=""
                    value={
                      formDeces.responsableTraitantNom
                        ? `${formDeces.responsableTraitantNom} — ${formDeces.responsableTraitantRole} (${formDeces.commune || "Commune"})`
                        : ""
                    }
                    placeholder="-- Choisir un Maire, Officier ou Secrétaire --"
                    searchPlaceholder="🔍 Rechercher par nom, rôle ou commune..."
                    options={agents.map((a) => ({
                      value: a.id,
                      label: `${a.nom} — ${a.role}`,
                      group: `${a.commune} (${a.centreEtatCivil || "Mairie"})`,
                      raw: a,
                    }))}
                    onChange={(val, opt) => {
                      const ag = opt?.raw || agents.find((a) => a.id === val);
                      if (ag) {
                        setFormDeces({
                          ...formDeces,
                          responsableTraitantId: ag.id,
                          responsableTraitantNom: ag.nom,
                          responsableTraitantRole: ag.role,
                          centreEtatCivil: ag.centreEtatCivil || formDeces.centreEtatCivil,
                        });
                      }
                    }}
                    required={true}
                  />
                )}
              </div>

              {/* Paiement Mobile Money 5 000 F */}
              <div className="p-4 bg-[#1E1F29] rounded-xl border border-amber-500/30 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CreditCard size={14} className="text-amber-400" />
                  <span>Frais d'Acte de Décès : <strong className="text-amber-300">5 000 FCFA</strong></span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-white font-semibold">
                  <input
                    type="checkbox"
                    checked={formDeces.payerMaintenant}
                    onChange={(e) => setFormDeces({ ...formDeces, payerMaintenant: e.target.checked })}
                    className="w-4 h-4 rounded text-[#3FA772]"
                  />
                  <span>Régler immédiatement par Orange Money ou MTN Mobile Money</span>
                </label>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 bg-white/5 text-gray-300 rounded-xl font-semibold">
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2.5 bg-[#714B67] hover:bg-[#875A7B] text-white font-bold rounded-xl flex items-center gap-1.5 shadow">
                  <CheckCircle2 size={15} />
                  <span>Enregistrer la Déclaration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODALE FORMULAIRE : MARIAGE (3 SÉLECTEURS RÉGION, COMMUNE, CENTRE)
         ======================================================================= */}
      {modal === "mariage" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 bg-[#714B67] border-b border-[#5B3A52] flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Send size={18} className="text-purple-300" />
                <h3 className="font-bold text-base tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  {editingMariage ? "Modifier les bancs de mariage" : "Nouvelle déclaration de bancs de mariage"}
                </h3>
              </div>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitMariage} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto text-[#EAF2F4]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Premier conjoint * :</label>
                  <input
                    type="text"
                    required
                    value={formMariage.conjoint1}
                    onChange={(e) => setFormMariage({ ...formMariage, conjoint1: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Second conjoint * :</label>
                  <input
                    type="text"
                    required
                    value={formMariage.conjoint2}
                    onChange={(e) => setFormMariage({ ...formMariage, conjoint2: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10 font-bold"
                  />
                </div>
              </div>

              {/* SÉLECTEURS RÉGION, COMMUNE, CENTRE */}
              {renderSelecteursTerritoire(formMariage, setFormMariage)}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Date souhaitée :</label>
                  <input
                    type="date"
                    value={formMariage.dateSouhaitee}
                    onChange={(e) => setFormMariage({ ...formMariage, dateSouhaitee: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] font-semibold mb-1">Maire / Officier célébrant * :</label>
                  <select
                    value={formMariage.responsableTraitantId}
                    onChange={(e) => {
                      const ag = agents.find((a) => a.id === e.target.value);
                      if (ag) {
                        setFormMariage({
                          ...formMariage,
                          responsableTraitantId: ag.id,
                          responsableTraitantNom: ag.nom,
                          responsableTraitantRole: ag.role,
                          centreEtatCivil: ag.centreEtatCivil || formMariage.centreEtatCivil,
                        });
                      }
                    }}
                    className="w-full bg-[#13212D] text-xs text-white p-2 rounded-lg border border-white/10"
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>{a.nom} — {a.role} ({a.commune})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Frais Bancs 35 500 F */}
              <div className="p-4 bg-[#1E1F29] rounded-xl border border-amber-500/30 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CreditCard size={14} className="text-amber-400" />
                  <span>Frais de Bancs de Mariage : <strong className="text-amber-300">35 500 FCFA</strong></span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-white font-semibold">
                  <input
                    type="checkbox"
                    checked={formMariage.payerMaintenant}
                    onChange={(e) => setFormMariage({ ...formMariage, payerMaintenant: e.target.checked })}
                    className="w-4 h-4 rounded text-[#3FA772]"
                  />
                  <span>Régler immédiatement par Orange Money ou MTN Mobile Money</span>
                </label>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 bg-white/5 text-gray-300 rounded-xl font-semibold">
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2.5 bg-[#714B67] hover:bg-[#875A7B] text-white font-bold rounded-xl flex items-center gap-1.5 shadow">
                  <CheckCircle2 size={15} />
                  <span>Enregistrer la Déclaration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODALE FORMULAIRE : GESTION DES UTILISATEURS (CRÉATION DE COMPTE)
         ======================================================================= */}
      {modal === "utilisateur" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-teal-300" />
                <h3 className="font-bold text-white text-base">
                  {editingUtilisateur ? "Modifier le Compte Utilisateur" : "Créer un Compte Usager / Agent"}
                </h3>
              </div>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitUtilisateur} className="space-y-3 text-xs text-[#EAF2F4]">
              <div>
                <label className="block text-[#8FA8B0] mb-1">Nom Complet de l'Usager / Agent * :</label>
                <input
                  type="text"
                  required
                  placeholder="ex. Paul Ekwalla ou Inspecteur BUNEC"
                  value={formUtilisateur.nom}
                  onChange={(e) => setFormUtilisateur({ ...formUtilisateur, nom: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10 font-bold"
                />
              </div>

              <div>
                <label className="block text-[#8FA8B0] mb-1">Profil & Rôle Système * :</label>
                <select
                  value={formUtilisateur.profil}
                  onChange={(e) => setFormUtilisateur({ ...formUtilisateur, profil: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                >
                  {ROLES_UTILISATEURS_SYNDEC.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Numéro Téléphone (Format : +237 6 XX XX XX XX) * :</label>
                  <input
                    type="text"
                    required
                    placeholder="+237 6 99 00 11 22"
                    value={formUtilisateur.contact}
                    onChange={(e) => setFormUtilisateur({ ...formUtilisateur, contact: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#8FA8B0] mb-1">Adresse Email :</label>
                  <input
                    type="email"
                    value={formUtilisateur.email}
                    onChange={(e) => setFormUtilisateur({ ...formUtilisateur, email: e.target.value })}
                    className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10 font-mono"
                  />
                </div>
              </div>

              <div>
                <SearchableDropdown
                  label="Commune d'Attache (372 Communes) :"
                  value={formUtilisateur.commune ? `${formUtilisateur.commune} (${formUtilisateur.region || "Centre"})` : ""}
                  placeholder="-- Choisir la Commune d'Attache --"
                  searchPlaceholder="🔍 Rechercher parmi les 372 communes..."
                  options={listeCommunes.map((c) => ({
                    value: c.commune,
                    label: c.commune,
                    group: `${c.departement} • Région ${c.region}`,
                    region: c.region,
                    departement: c.departement,
                  }))}
                  onChange={(val, opt) => {
                    const found = opt || listeCommunes.find((c) => c.commune === val);
                    setFormUtilisateur({
                      ...formUtilisateur,
                      commune: val,
                      region: found ? found.region : formUtilisateur.region,
                      departement: found ? found.departement : formUtilisateur.departement,
                    });
                  }}
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setModal(null)} className="px-3.5 py-2 bg-white/5 text-gray-300 rounded-xl font-semibold">
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2 bg-[#714B67] hover:bg-[#875A7B] text-white font-bold rounded-xl shadow">
                  {editingUtilisateur ? "Enregistrer les modifications" : "Créer le Compte Utilisateur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODALE FORMULAIRE : OFFICIER / MAIRE
         ======================================================================= */}
      {modal === "officier" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  {editingOfficier ? "Modifier le Responsable d'État Civil" : "Enregistrer un Responsable d'État Civil"}
                </h3>
              </div>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!formOfficier.nom.trim()) return;

                if (editingOfficier) {
                  setAgents((prev) =>
                    prev.map((a) => (a.id === editingOfficier ? { ...a, ...formOfficier } : a))
                  );
                } else {
                  const newId = idAgentECPourRole(null, formOfficier.role);
                  setAgents((prev) => [
                    { id: newId, ...formOfficier, dossiersTraites: 0 },
                    ...prev,
                  ]);
                }
                setModal(null);
                setFormOfficier(emptyFormOfficier);
                setEditingOfficier(null);
                onNotify?.("Responsable d'état civil enregistré avec succès !", "success");
              }}
              className="space-y-3 text-xs text-[#EAF2F4]"
            >
              <div>
                <label className="block text-[#8FA8B0] mb-1">Nom et Prénom * :</label>
                <input
                  type="text"
                  required
                  value={formOfficier.nom}
                  onChange={(e) => setFormOfficier({ ...formOfficier, nom: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10 font-bold"
                />
              </div>

              <div>
                <label className="block text-[#8FA8B0] mb-1">Rôle Institutionnel * :</label>
                <select
                  value={formOfficier.role}
                  onChange={(e) => setFormOfficier({ ...formOfficier, role: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                >
                  <option value="Maire">Maire</option>
                  <option value="Adjoint au maire">Adjoint au maire</option>
                  <option value="Officier d'état civil">Officier d'état civil</option>
                  <option value="Secrétaire d'état civil">Secrétaire d'état civil</option>
                </select>
              </div>

              <div>
                <SearchableDropdown
                  label="Commune d'Attache (372 Communes) * :"
                  value={formOfficier.commune ? `${formOfficier.commune} (${formOfficier.region || "Centre"})` : ""}
                  placeholder="-- Choisir la Commune d'Attache --"
                  searchPlaceholder="🔍 Rechercher parmi les 372 communes..."
                  options={listeCommunes.map((c) => ({
                    value: c.commune,
                    label: c.commune,
                    group: `${c.departement} • Région ${c.region}`,
                    region: c.region,
                    departement: c.departement,
                  }))}
                  onChange={(val, opt) => {
                    const found = opt || listeCommunes.find((c) => c.commune === val);
                    setFormOfficier({
                      ...formOfficier,
                      commune: val,
                      region: found ? found.region : formOfficier.region,
                      departement: found ? found.departement : formOfficier.departement,
                    });
                  }}
                  required={true}
                />
              </div>

              <div>
                <label className="block text-[#8FA8B0] mb-1">Centre d'État Civil :</label>
                <input
                  type="text"
                  value={formOfficier.centreEtatCivil}
                  onChange={(e) => setFormOfficier({ ...formOfficier, centreEtatCivil: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10"
                />
              </div>

              <div>
                <label className="block text-[#8FA8B0] mb-1 font-semibold">Signature Électronique Officielle :</label>
                <ElectronicSignaturePad
                  value={formOfficier.signature}
                  onChange={(val) => setFormOfficier({ ...formOfficier, signature: val })}
                  signerName={formOfficier.nom || "Officier / Maire"}
                  signerRole={formOfficier.role || "Officier d'état civil"}
                  signerCommune={formOfficier.commune || ""}
                  height={110}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setModal(null)} className="px-3.5 py-2 bg-white/5 text-gray-300 rounded-xl font-semibold">
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2 bg-[#714B67] hover:bg-[#875A7B] text-white font-bold rounded-xl">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODALE PAIEMENT MOBILE MONEY DÉDIÉE
         ======================================================================= */}
      {modal === "paiement" && dossierPaiement && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#13212D] border border-white/15 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-amber-400" />
                <h3 className="font-bold text-white text-base">Règlement Frais d'État Civil</h3>
              </div>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                <X size={16} />
              </button>
            </div>

            <div className="p-3 bg-black/30 rounded-xl border border-white/10 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Dossier :</span>
                <strong className="font-mono text-amber-300">{dossierPaiement.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Montant des Frais :</span>
                <strong className="text-emerald-400 font-mono font-bold text-sm">
                  {(dossierPaiement.montantPaye || 1500).toLocaleString("fr-FR")} FCFA
                </strong>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const refPaiement = `${paiementForm.operateur === "Orange Money" ? "OM" : "MOMO"}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
                const datePaiement = new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5);

                const updateProps = {
                  statutPaiement: "Payé",
                  modePaiement: paiementForm.operateur,
                  referencePaiement: refPaiement,
                  datePaiement: datePaiement,
                  statut: dossierPaiement.typeDossier === "mariage" ? "En attente de contact" : "En attente",
                };

                if (dossierPaiement.typeDossier === "naissance") {
                  setNaissances((prev) => prev.map((n) => (n.id === dossierPaiement.id ? { ...n, ...updateProps } : n)));
                } else if (dossierPaiement.typeDossier === "deces") {
                  setDeces((prev) => prev.map((d) => (d.id === dossierPaiement.id ? { ...d, ...updateProps } : d)));
                } else if (dossierPaiement.typeDossier === "mariage") {
                  setMariages((prev) => prev.map((m) => (m.id === dossierPaiement.id ? { ...m, ...updateProps } : m)));
                }

                enregistrerAudit(`Paiement ${dossierPaiement.montantPaye || 1500} FCFA (${paiementForm.operateur})`, dossierPaiement.id);
                setModal(null);
                onNotify?.(`Paiement validé (Réf: ${refPaiement}) ! Demande ${dossierPaiement.id} disponible chez l'officier.`, "success");
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaiementForm({ ...paiementForm, operateur: "Orange Money" })}
                  className={`p-2.5 rounded-xl border font-bold text-center ${
                    paiementForm.operateur === "Orange Money" ? "bg-orange-500/20 border-orange-500 text-orange-300" : "bg-[#1A2C3C] border-white/10 text-gray-400"
                  }`}
                >
                  🟠 Orange Money
                </button>
                <button
                  type="button"
                  onClick={() => setPaiementForm({ ...paiementForm, operateur: "MTN Mobile Money" })}
                  className={`p-2.5 rounded-xl border font-bold text-center ${
                    paiementForm.operateur === "MTN Mobile Money" ? "bg-yellow-500/20 border-yellow-500 text-yellow-300" : "bg-[#1A2C3C] border-white/10 text-gray-400"
                  }`}
                >
                  🟡 MTN Mobile Money
                </button>
              </div>

              <div>
                <label className="block text-[#8FA8B0] mb-1">Numéro Payeur :</label>
                <input
                  type="text"
                  required
                  value={paiementForm.numeroTelephone}
                  onChange={(e) => setPaiementForm({ ...paiementForm, numeroTelephone: e.target.value })}
                  className="w-full bg-[#1A2C3C] text-xs text-white p-2 rounded-lg border border-white/10 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setModal(null)} className="px-3.5 py-2 bg-white/5 text-gray-300 rounded-xl font-semibold">
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow">
                  Confirmer le Paiement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* =======================================================================
          MODALE SIGNATURE ÉLECTRONIQUE ET VALIDATION DE L'ACTE D'ÉTAT CIVIL
         ======================================================================= */}
      {modal === "signature_acte" && signatureDossier && (() => {
        const { record, type, signerName, signerRole, signatureImage } = signatureDossier;
        const isNaissance = type === "naissance";
        const isDeces = type === "deces";
        const isMariage = type === "mariage";
        const titre = isNaissance
          ? `Acte de Naissance de ${record.prenomEnfant || ""} ${record.nomEnfant || ""}`
          : isDeces
          ? `Acte de Décès de ${record.prenomDefunt || ""} ${record.nomDefunt || ""}`
          : `Bancs de Mariage : ${record.conjoint1 || ""} & ${record.conjoint2 || ""}`;

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#13212D] border border-teal-500/30 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-8 font-sans">
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-[#1A3848] via-[#714B67] to-[#132B38] border-b border-white/10 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-400/20 border border-teal-300/30 flex items-center justify-center text-teal-300 shadow">
                    <FileCheck size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base tracking-wide" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                      Scellement & Signature Électronique Officielle
                    </h3>
                    <p className="text-[11px] text-teal-200/80 font-mono">
                      Dossier N° {record.id} • {record.commune || "Commune d'attache"}
                    </p>
                  </div>
                </div>
                <button onClick={() => setModal(null)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleConfirmerSignatureEtValidation} className="p-6 space-y-4 text-xs text-[#EAF2F4]">
                {/* Récapitulatif du dossier */}
                <div className="p-3.5 bg-black/30 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider">
                      {isNaissance ? "👶 Acte de Naissance" : isDeces ? "🕊️ Acte de Décès" : "💍 Bans de Mariage"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Paiement validé (Orange/MTN)
                    </span>
                  </div>

                  <div className="text-sm font-bold text-white">{titre}</div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300 pt-1 border-t border-white/5 font-mono">
                    <div>Lieu : <strong className="text-white">{record.lieu || record.commune}</strong></div>
                    <div>Date : <strong className="text-white">{record.dateNaissance || record.dateDeces || record.dateSouhaitee || record.date}</strong></div>
                    <div>Déclarant : <strong className="text-white">{record.declarant || "Citoyen"}</strong></div>
                    <div>Centre EC : <strong className="text-white">{record.centreEtatCivil || "Mairie Principale"}</strong></div>
                  </div>
                </div>

                {/* Responsable Traitant */}
                <div className="p-3 bg-[#1A2C3C] rounded-xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <UserCheck size={18} className="text-teal-400" />
                    <div>
                      <div className="text-[10px] text-gray-400">Responsable d'État Civil Traitant :</div>
                      <div className="font-bold text-white text-xs">{signerName}</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-[#714B67] text-white font-mono text-[10px] font-bold">
                    {signerRole}
                  </span>
                </div>

                {/* Zone de Signature Électronique */}
                <div>
                  <label className="block text-[#8FA8B0] font-bold mb-1 flex items-center justify-between">
                    <span>Apposition de la Signature Électronique * :</span>
                    <span className="text-[10px] text-teal-400 font-mono">Stylet / Souris / Calligraphie</span>
                  </label>
                  <ElectronicSignaturePad
                    value={signatureDossier.signatureImage}
                    onChange={(val) => setSignatureDossier({ ...signatureDossier, signatureImage: val })}
                    signerName={signerName}
                    signerRole={signerRole}
                    signerCommune={record.commune}
                    height={135}
                  />
                </div>

                {/* Mention légale d'assermentation */}
                <div className="p-3 bg-teal-950/30 border border-teal-500/20 rounded-xl text-[10px] text-teal-200/90 leading-relaxed font-mono">
                  ⚖️ <strong>Déclaration d'assermentation :</strong> En validant ce formulaire, j'atteste en ma qualité de <strong>{signerRole}</strong> avoir vérifié l'authenticité des pièces justificatives et appose ma signature électronique légale certifiée conforme pour sceller l'acte d'état civil N° <strong>{record.id}</strong>.
                </div>

                {/* Boutons */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <CheckCircle2 size={16} />
                    <span>Sceller & Valider l'Acte d'État Civil</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* =======================================================================
          MODALE PRÉVISUALISATION DU CERTIFICAT (DESIGN 100% CONFORME À LA PIÈCE JOINTE)
         ======================================================================= */}
      {modal === "certificat" && certificateRecord && (() => {
        const r = certificateRecord;
        const isNaissance = certificateType === "naissance";
        const reference = r.id;
        const numDocument = genererNumeroDocument(r.commune, reference, r.region);
        const numInscription = genererNumeroInscription(reference);
        const dateDelivrance = new Date().toISOString().slice(0, 10);
        const officier = {
          nom: r.responsableTraitantNom || "Ateba Suzanne",
          role: r.responsableTraitantRole || "Officier d'état civil",
          commune: r.commune || "Commune De Yaounde I"
        };
        const titreSignature = titreOfficier(officier.role, r.commune);

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white text-gray-900 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl my-8 font-sans border border-gray-300">
              <div className="grid grid-cols-3 h-14 items-center relative select-none">
                <div className="bg-[#007A5E] h-full flex items-center px-4">
                  <span className="text-white text-xs font-bold">République du Cameroun</span>
                </div>
                <div className="bg-[#CE1126] h-full flex items-center justify-center relative">
                  <span className="text-[#FCD116] text-3xl font-black leading-none drop-shadow">★</span>
                </div>
                <div className="bg-[#FCD116] h-full flex items-center justify-end px-4">
                  <span className="text-white text-xs font-medium drop-shadow">Paix — Travail — Patrie</span>
                </div>
              </div>

              <div className="p-7 space-y-6">
                <div className="flex items-baseline justify-between border-b pb-3">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {isNaissance ? "Certificat de naissance" : "Certificat de décès"}
                  </h2>
                  <div className="text-xs text-gray-700 font-mono">
                    N° de document : <strong className="font-bold text-gray-900">{numDocument}</strong>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs italic text-gray-500">{isNaissance ? "Nom" : "Nom du défunt"}</div>
                      <div className="font-bold text-base text-gray-900">{isNaissance ? r.nomEnfant : r.nomDefunt}</div>
                    </div>
                    <div>
                      <div className="text-xs italic text-gray-500">Prénom(s)</div>
                      <div className="font-bold text-base text-gray-900">{isNaissance ? r.prenomEnfant : r.prenomDefunt}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs italic text-gray-500">Sexe</div>
                    <div className="font-bold text-base text-gray-900">{r.sexe}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs italic text-gray-500">{isNaissance ? "Lieu de naissance" : "Lieu du décès"}</div>
                      <div className="font-bold text-base text-gray-900">{r.lieu}</div>
                    </div>
                    <div>
                      <div className="text-xs italic text-gray-500">{isNaissance ? "Date de naissance" : "Date du décès"}</div>
                      <div className="font-bold text-base text-gray-900">{isNaissance ? r.dateNaissance : r.dateDeces}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs italic text-gray-500">Père</div>
                      <div className="font-bold text-base text-gray-900">{r.nomPere || "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs italic text-gray-500">Mère</div>
                      <div className="font-bold text-base text-gray-900">{r.nomMere || "—"}</div>
                    </div>
                  </div>

                  <hr className="border-gray-200 my-2" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs italic text-gray-500">Numéro d'inscription</div>
                      <div className="font-bold text-base font-mono text-gray-900">{numInscription}</div>
                    </div>
                    <div>
                      <div className="text-xs italic text-gray-500">Date de délivrance</div>
                      <div className="font-bold text-base text-gray-900">{dateDelivrance}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="text-xs text-gray-600 space-y-1 max-w-[280px]">
                    <p className="leading-snug">
                      Les renseignements reproduits sont conformes à ceux inscrits au registre de l'état civil de {r.commune}.
                    </p>
                    <p className="font-bold text-gray-800">
                      Ce certificat n'est pas valide s'il est modifié ou plastifié.
                    </p>
                  </div>

                  <div className="text-center shrink-0">
                    <div className="w-20 h-20 bg-gray-100 p-1 border border-gray-300 rounded flex items-center justify-center">
                      <QrCode size={68} className="text-gray-900" />
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">Scanner pour vérifier</div>
                  </div>
                </div>

                <div className="border-t border-gray-300 pt-3 flex items-start justify-between">
                  <div className="text-xs italic text-gray-500 mt-1">Certifié conforme</div>
                  <div className="text-right space-y-1">
                    <div className="text-xs italic text-gray-700">{titreSignature}</div>
                    {(r.signature || officier.signature) ? (
                      <div className="my-1 flex justify-end">
                        <img
                          src={r.signature || officier.signature}
                          alt="Signature Électronique"
                          className="h-10 max-w-[140px] object-contain"
                        />
                      </div>
                    ) : (
                      <div className="font-bold italic text-lg text-gray-900 tracking-tight" style={{ fontFamily: "serif" }}>
                        {officier.nom}
                      </div>
                    )}
                    <div className="w-32 border-b border-gray-400 ml-auto my-1" />
                    <div className="text-xs font-bold text-gray-900">{officier.nom}</div>
                  </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-end gap-3">
                  <button
                    onClick={() => setModal(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => telechargerCertificatPDF(r, certificateType, agents)}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
                  >
                    <Download size={14} />
                    <span>Télécharger le PDF certifié</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
