# Backend API - Sophie Bluel

Ce dossier contient le code backend du projet

## Lancement du backend

Ouvrez un terminal à cet emplacement

Pour installer les dépendances du projet, executez la commande 
```bash 
npm install
```

Une fois les dépendances installées lancez le projet avec la commande 
```bash 
npm start
```

**Laisser tourner ce terminal pour travailler**

## Compte de test pour Sophie Bluel

|email|password|
| :---------------: | :---------------: |
|sophie.bluel@test.tld|S0phie|

## Accéder à Swagger

[documentation Swagger](http://localhost:5678/api-docs/)

Pour lire la documentation, utiliser Chrome ou Firefox

## Endpoints ajoutés

### Gestion des catégories

Les endpoints suivants nécessitent un token JWT (header `Authorization: Bearer <token>`).

- **POST** `/api/categories`
- **PUT** `/api/categories/:id`
- **DELETE** `/api/categories/:id`

Le `DELETE` renvoie une erreur `409` si la catégorie est déjà utilisée par des works.

### Mot de passe oublié

- **POST** `/api/users/forgot-password`
  - body: `{ "email": "...", "password": "..." }`
  - met à jour le mot de passe de l'utilisateur si le compte existe
