# AutoParts Stock - Guide d'Installation et d'Utilisation

## 📦 Application de Gestion de Stock de Pièces Automobiles

**AutoParts Stock** est une application desktop professionnelle pour gérer le stock de pièces automobiles, conçue pour fonctionner en mode **OFFLINE-FIRST** avec une possibilité de synchronisation en ligne (mode hybride).

---

## 🚀 Installation

### Prérequis

- **Windows 10/11** (64 bits)
- **20 Mo** d'espace disque minimum
- Aucune connexion internet requise pour l'utilisation

### Installation depuis l'installateur (.exe)

1. Téléchargez le fichier `AutoParts-Stock-Setup-1.0.0.exe`
2. Double-cliquez sur le fichier pour lancer l'installation
3. Choisissez le dossier d'installation (par défaut: `C:\Program Files\AutoParts Stock`)
4. Cliquez sur "Installer"
5. Lancez l'application depuis le menu Démarrer ou le raccourci bureau

### Version Portable

1. Téléchargez `AutoParts-Stock-Portable-1.0.0.exe`
2. Placez le fichier où vous le souhaitez
3. Double-cliquez pour lancer l'application

---

## 🏁 Première Utilisation

### Configuration Initiale

Au premier lancement, l'application affiche l'écran de configuration :

1. **Création du compte admin**
   - Nom d'utilisateur : `admin` (par défaut, modifiable)
   - Mot de passe : Minimum 6 caractères
   - Nom complet : Optionnel
   - Email : Optionnel

2. **Initialisation automatique**
   - Création de 10 catégories par défaut
   - Configuration des paramètres de base

### Connexion

Après la configuration initiale, utilisez vos identifiants pour vous connecter :
- **Nom d'utilisateur** : Celui défini lors de la configuration
- **Mot de passe** : Celui défini lors de la configuration

---

## 📋 Fonctionnalités

### 1. Tableau de Bord

Vue d'ensemble avec :
- **Total pièces** en stock
- **Valeur totale** du stock
- **Alertes** (stock faible, rupture)
- **Mouvements récents**
- **Chiffre d'affaires** du jour/mois
- **Répartition par catégorie**

### 2. Gestion des Pièces

**Ajouter une pièce :**
1. Cliquez sur "Nouvelle pièce"
2. Remplissez les informations :
   - Nom de la pièce *
   - Référence unique *
   - Catégorie *
   - Prix d'achat
   - Prix de vente
   - Quantité initiale
   - Stock minimum (seuil d'alerte)
   - Emplacement
   - Code-barres
   - Photo (optionnel)
3. Cliquez sur "Créer"

**Modifier une pièce :**
- Cliquez sur le menu ⋮ à droite de la pièce
- Sélectionnez "Modifier"

**Supprimer une pièce :**
- Cliquez sur le menu ⋮
- Sélectionnez "Supprimer"

### 3. Mouvements de Stock

**Entrée de stock (Approvisionnement) :**
1. Cliquez sur le menu ⋮ de la pièce
2. Sélectionnez "Entrée stock"
3. Indiquez :
   - Quantité reçue
   - Prix unitaire
   - Fournisseur
   - Motif

**Sortie de stock (Vente) :**
1. Cliquez sur le menu ⋮ de la pièce
2. Sélectionnez "Sortie stock"
3. Indiquez :
   - Quantité vendue
   - Prix de vente
   - Client
   - Motif

### 4. Historique des Mouvements

- Consultez tous les mouvements (entrées/sorties)
- Filtrez par :
  - Type (Entrée, Sortie, Ajustement, Retour)
  - Date (période)
- Exportez en Excel

### 5. Alertes

L'application génère automatiquement des alertes pour :
- **Stock faible** : Quantité ≤ Stock minimum
- **Rupture de stock** : Quantité = 0

Actions possibles :
- Marquer comme lu
- Résoudre l'alerte

### 6. Paramètres

#### Général
- Nom de l'entreprise
- Coordonnées (téléphone, email, adresse)
- Devise
- Stock minimum par défaut

#### Catégories
- Ajouter/modifier/supprimer des catégories
- 10 catégories préconfigurées :
  - Moteur
  - Transmission
  - Freinage
  - Suspension
  - Électricité
  - Carrosserie
  - Filtres
  - Échappement
  - Refroidissement
  - Éclairage

#### Sécurité
- Changer le mot de passe admin

#### Sauvegardes
- **Créer une sauvegarde** : Copie de la base de données
- **Restaurer** : Charger une sauvegarde précédente

---

## 📤 Export des Données

### Export Excel

1. Allez dans la section "Pièces" ou "Mouvements"
2. Cliquez sur "Exporter"
3. Le fichier Excel se télécharge automatiquement

Contenu de l'export :
- **Pièces** : Référence, nom, catégorie, prix, quantités, valeurs
- **Mouvements** : Date, pièce, type, quantité, prix, détails

---

## 💾 Sauvegarde et Restauration

### Sauvegarde Manuelle

1. Allez dans "Paramètres" → "Sauvegardes"
2. Cliquez sur "Créer une sauvegarde"
3. La sauvegarde est stockée dans le dossier de l'application

### Restauration

1. Allez dans "Paramètres" → "Sauvegardes"
2. Cliquez sur "Restaurer" à côté de la sauvegarde souhaitée
3. Confirmez la restauration
4. Redémarrez l'application

### Via le Menu Fichier

Depuis le menu de l'application :
- **Fichier → Sauvegarder la base de données** : Choisissez l'emplacement
- **Fichier → Restaurer la base de données** : Sélectionnez un fichier .db

---

## 🔧 Mode Hybride (Synchronisation)

Le mode hybride permet de synchroniser les données avec un serveur distant :

1. Allez dans "Paramètres" → "Général"
2. Activez la synchronisation
3. Configurez l'URL du serveur distant
4. Les données seront synchronisées automatiquement

**Note** : L'application continue de fonctionner hors ligne. Les modifications sont synchronisées quand la connexion est disponible.

---

## ⌨️ Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+S` | Sauvegarder |
| `Ctrl+F` | Rechercher |
| `Ctrl+N` | Nouvelle pièce |
| `F5` | Actualiser |
| `F11` | Plein écran |
| `Ctrl+Q` | Quitter |

---

## 📁 Emplacement des Fichiers

### Windows
```
C:\Users\[Utilisateur]\AppData\Local\AutoParts Stock\
├── db\
│   └── custom.db          # Base de données
├── backups\               # Sauvegardes
└── logs\                  # Journaux
```

### Base de données
- Format : SQLite (.db)
- Taille : Variable selon le nombre de pièces
- Peut être copiée/déplacée pour sauvegarde

---

## ❓ Résolution de Problèmes

### L'application ne démarre pas

1. Vérifiez que le fichier de base de données n'est pas verrouillé
2. Redémarrez l'ordinateur
3. Réinstallez l'application

### Mot de passe oublié

1. Localisez le fichier de base de données
2. Renommez `custom.db` en `custom.db.backup`
3. Relancez l'application (réinitialisation complète)

### Données non sauvegardées

Les données sont automatiquement sauvegardées dans SQLite. En cas de problème :
1. Vérifiez l'espace disque disponible
2. Restaurez une sauvegarde précédente

---

## 📞 Support

Pour toute question ou assistance :
- **Email** : support@autoparts-stock.com
- **Documentation** : docs.autoparts-stock.com

---

## 📄 Licence

AutoParts Stock - Logiciel de gestion de stock
© 2025 - Tous droits réservés

---

**Version** : 1.0.0
**Dernière mise à jour** : Mars 2025
