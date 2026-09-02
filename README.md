# SYNGESHP-CAM — Système Numérique de Gestion Hospitalière et de Planification du Cameroun

Système intégré de gestion hospitalière, dossiers patients, lits, urgences et CSU

> **Projet Indépendant Déployé**  
> Ce répertoire contient le module autonome **SYNGESHP**, configuré pour démarrer directement sans passer par le portail central multi-systèmes.

---

## 📋 Présentation du Module

Plateforme hospitalière républicaine pour la gestion des soins, admissions, lits d'hospitalisation et pharmacie (MINSANTE).

- **Identifiant Système** : `syngeshp`
- **Nom du Paquet** : `syngeshp-cam`
- **Cadre Réglementaire** : Conforme aux directives de la République du Cameroun.

---

## 🚀 Démarrage Rapide

### 1. Installation des Dépendances (si nécessaire)
Le projet est déjà pré-lié au dossier `node_modules` local. Si vous déplacez ce dossier sur une autre machine, exécutez simplement :
```bash
npm install
```

### 2. Lancement en Mode Développement
Pour démarrer le serveur de développement local :
```bash
npm run dev
```
Puis ouvrez l'adresse indiquée (ex: `http://localhost:5173`) dans votre navigateur web.

### 3. Compilation pour la Production
Pour compiler le projet en vue d'un déploiement sur serveur ou CDN (Vercel, Nginx, etc.) :
```bash
npm run build
```
Les fichiers optimisés seront générés dans le dossier `dist/`.

---

## 🛡️ Sécurité & Conformité
- Authentification avec hachage et contrôles de robustesse.
- Filtrage des données selon les profils et territoires (Région, Département, Commune, Établissement).
- Piste d'audit légale intégrée.
