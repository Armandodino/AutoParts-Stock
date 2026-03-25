# AutoParts Stock

Application de gestion de stock de pièces automobiles - Mode Offline-First avec synchronisation optionnelle.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Fonctionnalités

- ✅ **Mode Offline-First** - Fonctionne sans connexion internet
- ✅ **Gestion des pièces** - CRUD complet avec photos
- ✅ **Mouvements de stock** - Entrées, sorties, ajustements
- ✅ **Alertes automatiques** - Stock faible, rupture
- ✅ **Tableau de bord** - Statistiques et graphiques
- ✅ **Export Excel** - Pièces et mouvements
- ✅ **Sauvegarde/Restauration** - Base de données SQLite
- ✅ **Sécurité** - Authentification admin
- ✅ **Application Desktop** - Windows (.exe)

## 🛠️ Stack Technique

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Database**: SQLite avec Prisma ORM
- **Desktop**: Electron
- **Build**: electron-builder

## 📦 Installation Développeur

```bash
# Cloner le projet
git clone [repo-url]
cd autoparts-stock

# Installer les dépendances
bun install

# Initialiser la base de données
bun run db:push

# Lancer en développement
bun run dev
```

## 🔨 Build de Production

### Build Web

```bash
# Compiler l'application
bun run build

# Lancer le serveur de production
bun run start
```

### Build Desktop (Windows .exe)

```bash
# Prérequis : build Next.js d'abord
bun run build

# Générer l'installateur Windows
bun run electron:build:win
```

Les fichiers générés se trouvent dans le dossier `dist/` :
- `AutoParts-Stock-Setup-1.0.0.exe` - Installateur
- `AutoParts-Stock-Portable-1.0.0.exe` - Version portable

### Build macOS

```bash
bun run electron:build:mac
```

### Build Linux

```bash
bun run electron:build:linux
```

## 📁 Structure du Projet

```
autoparts-stock/
├── electron/              # Fichiers Electron
│   ├── main.js           # Point d'entrée Electron
│   ├── preload.js        # Script de préchargement
│   └── assets/           # Icônes et ressources
├── prisma/               # Schéma de base de données
│   └── schema.prisma     # Modèles Prisma
├── src/
│   ├── app/              # Routes Next.js
│   │   ├── api/          # API REST
│   │   └── page.tsx      # Page principale
│   ├── components/       # Composants React
│   ├── lib/              # Utilitaires
│   ├── store/            # État global (Zustand)
│   └── types/            # Types TypeScript
├── db/                   # Base de données SQLite
├── public/               # Fichiers statiques
└── package.json
```

## 🔧 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `bun run dev` | Serveur de développement |
| `bun run build` | Build de production Next.js |
| `bun run start` | Serveur de production |
| `bun run lint` | Vérification ESLint |
| `bun run db:push` | Synchroniser le schéma DB |
| `bun run electron:dev` | Electron en développement |
| `bun run electron:build:win` | Build Windows .exe |
| `bun run electron:build:mac` | Build macOS .dmg |
| `bun run electron:build:linux` | Build Linux AppImage |

## 📊 Modèles de Données

### Part (Pièce)
- Nom, référence, description
- Catégorie, prix d'achat/vente
- Quantité, stock minimum
- Emplacement, code-barres, photo

### Movement (Mouvement)
- Type: ENTRY, EXIT, ADJUST, RETURN
- Quantité, prix unitaire/total
- Fournisseur/Client
- Référence facture, notes

### Category (Catégorie)
- Nom, description
- Relation avec les pièces

### Alert (Alerte)
- Type: low_stock, out_of_stock
- Message, statut de résolution

## 🔐 Sécurité

- Authentification locale avec mot de passe hashé (PBKDF2)
- Session stockée localement
- Base de données SQLite chiffrée

## 📤 Export des Données

L'application permet d'exporter :
- **Pièces** : Fichier Excel avec toutes les informations
- **Mouvements** : Historique complet filtrable

## 💾 Sauvegarde

- Sauvegarde manuelle de la base SQLite
- Restauration possible
- Stockage dans le dossier de l'application

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commit (`git commit -m 'Ajout de ma fonctionnalité'`)
4. Push (`git push origin feature/ma-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

Développé par l'équipe AutoParts Stock

---

**Version** : 1.0.0  
**Dernière mise à jour** : Mars 2025
