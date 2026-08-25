# Games

Ce module contient toute la gestion des mini-jeux du réseau social.

Pour le moment, un seul jeu est implémenté :

- Tic Tac Toe

L'architecture est prévue pour pouvoir ajouter d'autres jeux plus tard sans avoir à recréer toute la gestion des parties.

---

## 1. Fonctionnement général

Le système fonctionne actuellement en **1 contre 1**.

Le fonctionnement d'une partie est le suivant :

```text
Joueur A
   │
   │ crée une partie en défiant Joueur B
   ▼
┌─────────────────┐
│ Partie créée    │
│ status: waiting │
└────────┬────────┘
         │
         │ Joueur B rejoint
         ▼
┌─────────────────┐
│ Partie en cours │
│ status: playing │
└────────┬────────┘
         │
         │ joueurs jouent
         ▼
┌─────────────────────────┐
│ finished / draw         │
└────────────┬────────────┘
             │
             ▼
      Résultat sauvegardé
          en base
```

Une partie en cours n'est **pas sauvegardée en base de données**.

Elle est conservée en mémoire dans `GamesService`.

Seul le résultat final est sauvegardé en base de données afin de pouvoir être utilisé plus tard pour les statistiques.

---

# 2. Structure du module

```text
games/
├── dto/
│   ├── create-game.dto.ts
│   └── make-move.dto.ts
│
├── entities/
│   └── game-result.entity.ts
│
├── enums/
│   └── game-result.enum.ts
│
├── games.controller.ts
├── games.module.ts
├── games.service.ts
├── tictactoe.ts
└── README.md
```

### `tictactoe.ts`

Contient toute la logique du Tic Tac Toe.

Cette classe ne dépend pas de HTTP, de Swagger, de WebSocket ou de TypeORM.

Elle gère notamment :

- la grille ;
- les joueurs X et O ;
- le joueur dont c'est le tour ;
- la validation des coups ;
- la victoire ;
- le match nul ;
- l'état de la partie.

---

### `games.service.ts`

Le service gère les parties au niveau de l'application.

Il s'occupe notamment de :

- créer une partie ;
- attribuer les joueurs ;
- faire rejoindre le joueur défié ;
- recevoir les coups ;
- récupérer l'état d'une partie ;
- détecter la fin d'une partie ;
- sauvegarder le résultat en base ;
- supprimer la partie terminée de la mémoire.

La logique spécifique du Tic Tac Toe reste dans `TicTacToe`.

---

### `games.controller.ts`

Le controller expose l'API REST utilisée actuellement pour communiquer avec le frontend.

Il est protégé par `JwtAuthGuard`.

Tous les endpoints nécessitent donc une authentification.

---

### `games.module.ts`

Module NestJS regroupant les éléments liés aux jeux.

Il permet notamment d'injecter le repository `GameResult` dans `GamesService`.

Le module est commun à tous les mini-jeux.

---

# 3. Tic Tac Toe

Le jeu est actuellement un 1v1.

Le premier joueur est `X`.

Le joueur défié est `O`.

La grille est représentée par 9 positions :

```text
0 | 1 | 2
---------
3 | 4 | 5
---------
6 | 7 | 8
```

Le frontend envoie simplement la position choisie.

Exemple :

```json
{
  "position": 0
}
```

Le backend vérifie ensuite que :

- la partie est en cours ;
- le joueur participe à la partie ;
- c'est bien son tour ;
- la position est valide ;
- la case n'est pas déjà occupée.

Le frontend ne doit donc pas être considéré comme une source de vérité pour la logique du jeu.

---

# 4. États d'une partie

Une partie possède quatre états possibles.

## `waiting`

La partie a été créée mais le joueur défié n'a pas encore rejoint.

```text
Joueur A crée la partie
        ↓
     waiting
        ↓
Joueur B rejoint
```

Aucun coup ne peut être joué dans cet état.

---

## `playing`

Les deux joueurs sont présents et la partie peut commencer.

Le joueur `X` commence toujours.

```text
X → O → X → O → ...
```

---

## `finished`

Un joueur a gagné.

L'attribut `winner` contient alors :

```text
X
```

ou :

```text
O
```

Le joueur correspondant peut ensuite être associé à son `userId` afin d'enregistrer le résultat en base.

---

## `draw`

Toutes les cases sont occupées sans qu'aucun joueur ne gagne.

Dans ce cas :

```text
winner = null
```

Le résultat enregistré en base est un match nul.

---

# 5. API REST

Base URL :

```text
http://localhost:3001
```

Les endpoints sont protégés par JWT.

---

## Créer une partie

```http
POST /games
```

Le joueur connecté crée une partie contre un autre utilisateur.

### Body

```json
{
  "opponentId": "USER_ID"
}
```

Exemple :

```json
{
  "opponentId": "4c1dc5fb-6513-47f8-9b9d-2044d2fc7641"
}
```

Le joueur connecté devient `X`.

Le joueur défié devient `O`.

La partie commence avec :

```text
status = waiting
```

Le endpoint retourne l'identifiant de la partie.

Exemple :

```text
611420fe-faf5-4705-bd17-f924e3f56664
```

---

# 6. Rejoindre une partie

```http
POST /games/:id/join
```

Le joueur défié rejoint la partie.

Exemple :

```http
POST /games/611420fe-faf5-4705-bd17-f924e3f56664/join
```

Le backend vérifie que :

- la partie existe ;
- la partie est encore dans l'état `waiting` ;
- l'utilisateur connecté est bien le joueur défié.

Après le join :

```text
status = playing
```

et :

```text
currentPlayer = X
```

---

# 7. Jouer un coup

```http
POST /games/:id/move
```

Le joueur connecté envoie la position de la case qu'il souhaite jouer.

### Body

```json
{
  "position": 0
}
```

Exemple :

```http
POST /games/611420fe-faf5-4705-bd17-f924e3f56664/move
```

avec :

```json
{
  "position": 0
}
```

Le backend vérifie la validité du coup.

La position doit être un entier compris entre `0` et `8`.

Après le coup, le backend renvoie le nouvel état de la partie.

---

# 8. Récupérer l'état d'une partie

```http
GET /games/:id
```

Permet de récupérer l'état actuel d'une partie sans effectuer de modification.

Exemple :

```http
GET /games/611420fe-faf5-4705-bd17-f924e3f56664
```

Réponse possible :

```json
{
  "gameId": "611420fe-faf5-4705-bd17-f924e3f56664",
  "board": [
    "X",
    null,
    "O",
    null,
    "X",
    null,
    null,
    null,
    null
  ],
  "currentPlayer": "O",
  "status": "playing",
  "winner": null,
  "playerXId": "ALICE_ID",
  "playerOId": "BOB_ID"
}
```

Ce endpoint est notamment utile pour récupérer l'état d'une partie après une reconnexion ou pour synchroniser un client.

---

# 9. Persistance en base de données

Les parties en cours sont volontairement conservées uniquement en mémoire.

Dans `GamesService`, elles sont actuellement stockées dans :

```typescript
private readonly games = new Map<string, TicTacToe>();
```

Cela signifie que :

```text
Partie en cours
      ↓
GamesService
      ↓
Map en mémoire
```

et non :

```text
Partie en cours
      ↓
PostgreSQL
```

Cela évite de sauvegarder inutilement chaque coup.

---

## Résultat final

Lorsqu'une partie est terminée, `GamesService` sauvegarde uniquement son résultat dans PostgreSQL.

La table correspondante est :

```text
game_results
```

Elle contient notamment :

```text
id
playerXId
playerOId
winnerId
result
```

Pour une victoire :

```text
playerXId = ID du joueur X
playerOId = ID du joueur O
winnerId  = ID du gagnant
result    = win
```

Pour un match nul :

```text
playerXId = ID du joueur X
playerOId = ID du joueur O
winnerId  = null
result    = draw
```

Après la sauvegarde du résultat, la partie est supprimée de la mémoire :

```typescript
this.games.delete(gameId);
```

Le résultat reste donc disponible pour les futures statistiques.

---

# 10. Migration

La table `game_results` est créée avec TypeORM.

La migration se trouve dans :

```text
src/database/migrations/
```

La génération d'une migration se fait depuis le conteneur backend :

```bash
docker compose exec backend npm run migration:generate -- src/database/migrations/NomDeLaMigration
```

Puis :

```bash
docker compose exec backend npm run migration:run
```

La migration actuelle crée notamment :

```sql
game_results
```

avec le type enum :

```text
win
draw
```

La configuration TypeORM se trouve dans :

```text
data-source.ts
```

L'entité `GameResult` doit être déclarée dans les `entities` du `DataSource`.

---

# 11. Validation côté backend

Le frontend peut envoyer une position de coup, mais le backend reste responsable de la validité du jeu.

Par exemple, le frontend peut envoyer :

```json
{
  "position": 0
}
```

mais le backend vérifie :

```text
La partie est-elle en cours ?
        ↓
Le joueur participe-t-il ?
        ↓
Est-ce son tour ?
        ↓
La position est-elle valide ?
        ↓
La case est-elle libre ?
        ↓
Le coup est appliqué
        ↓
Victoire ou match nul ?
        ↓
Changement de joueur
```

Cette validation permet notamment d'éviter qu'un client modifié puisse simplement envoyer des coups invalides au serveur.

Le backend est donc la source de vérité pour l'état du jeu.

---

# 12. Authentification

Tous les endpoints du module `games` utilisent :

```typescript
JwtAuthGuard
```

L'utilisateur connecté est récupéré grâce à :

```typescript
@CurrentUser()
```

Le client n'a donc pas besoin d'envoyer son propre `userId` pour effectuer un coup.

Le backend récupère l'utilisateur depuis son JWT.

Par exemple :

```http
POST /games/:id/move
Authorization: Bearer <JWT>
```

avec :

```json
{
  "position": 0
}
```

Le backend sait alors quel joueur effectue le coup.

---

# 13. WebSockets

Les WebSockets ne sont pas encore intégrés dans cette branche.

Pour le moment, la communication se fait uniquement avec l'API REST.

L'architecture de la logique de jeu a cependant été séparée du transport réseau.

La classe :

```text
TicTacToe
```

ne dépend pas de REST.

Elle ne dépend pas non plus des WebSockets.

Elle contient uniquement la logique du jeu.

Cela permettra plus tard d'utiliser la même logique avec les WebSockets.

Exemple :

```text
                    ┌───────────────┐
                    │   TicTacToe   │
                    │ game logic    │
                    └───────┬───────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
              REST API             WebSocket
                 │                     │
              Frontend              Frontend
```

Les WebSockets pourront donc remplacer ou compléter les endpoints REST sans avoir à réécrire les règles du jeu.

---

# 14. Gestion des déconnexions et abandons

Cette partie n'est pas encore implémentée.

Avec le système REST actuel, il n'est pas possible de détecter de manière fiable qu'un joueur a simplement fermé son navigateur ou perdu sa connexion.

La gestion des déconnexions sera donc principalement ajoutée lors de l'intégration des WebSockets.

Les cas à gérer seront notamment :

### Joueur qui quitte volontairement

Exemple :

```text
Alice quitte
      ↓
Bob gagne par abandon
      ↓
Résultat sauvegardé
```

Un endpoint ou un événement WebSocket pourra être ajouté pour gérer ce cas.

### Déconnexion temporaire

Une déconnexion réseau ne devrait probablement pas entraîner immédiatement une défaite.

Une période de grâce pourra être mise en place :

```text
Déconnexion
    ↓
temps d'attente
    ↓
reconnexion ?
   / \
 oui  non
  │    │
  │    └── abandon / défaite
  │
  └── partie continue
```

La durée de cette période devra être définie avec l'équipe.

### Joueur défié qui ne rejoint jamais

Une partie dans l'état :

```text
waiting
```

ne doit pas rester en mémoire indéfiniment.

Un timeout pourra être ajouté plus tard :

```text
waiting
   ↓
timeout
   ↓
suppression de la partie
```

Aucun résultat n'est enregistré puisque la partie n'a jamais commencé.

---

# 15. Ajouter un nouveau jeu

Le module `games` est commun aux différents mini-jeux.

Il n'est donc pas nécessaire de créer un nouveau :

```text
GamesController
GamesService
GamesModule
```

pour chaque jeu.

Par exemple, pour ajouter un deuxième jeu :

```text
games/
├── games.controller.ts
├── games.module.ts
├── games.service.ts
│
├── tictactoe.ts
├── connect4.ts
│
├── dto/
├── entities/
└── enums/
```

La logique spécifique du nouveau jeu sera placée dans son propre fichier.

Par exemple :

```text
connect4.ts
```

La gestion commune des parties restera dans :

```text
games.service.ts
```

---

# 16. État actuel

Le système Tic Tac Toe est actuellement fonctionnel pour le scénario normal 1v1 :

```text
✓ Création d'une partie
✓ Défi d'un utilisateur
✓ Attente du joueur défié
✓ Join de la partie
✓ Attribution X / O
✓ Validation des coups
✓ Gestion des tours
✓ Détection des victoires
✓ Détection des matchs nuls
✓ Récupération de l'état d'une partie
✓ Authentification JWT
✓ Sauvegarde du résultat final en PostgreSQL
✓ Migration TypeORM
✓ Suppression de la partie terminée de la mémoire
```

Les prochaines évolutions prévues sont notamment :

```text
→ Ajout d'autres mini-jeux
→ Intégration des WebSockets
→ Gestion des déconnexions
→ Gestion des abandons
→ Timeout des parties en attente
→ Synchronisation temps réel entre les joueurs
→ Exploitation des résultats pour les statistiques
```

---

# 17. Principe général

Le principe à conserver lors des évolutions est :

> **La logique du jeu appartient au backend et le client ne fait que demander des actions et recevoir l'état du jeu.**

Le frontend pourra gérer l'affichage et les interactions utilisateur, mais le backend reste responsable de la validité de la partie.

La base de données ne sert pas à stocker chaque état intermédiaire du jeu.

Elle sert principalement à conserver les résultats terminés afin de permettre la création future de statistiques.