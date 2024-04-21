// Création du serveur Express
const express = require('express');
const app = express();
const port = 8080;

// Importation des données de la base de données et du middleware bodyParser
const { taches } = require('./database');
const bodyParser = require('body-parser');

// Utilisation du middleware bodyParser pour analyser les requêtes JSON
app.use(bodyParser.json());

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.status(200).send("Bienvenue dans la page d'accueil");
});

// Route pour récupérer toutes les tâches
app.get('/todos', (req, res) => {
    return res.json(taches);
});

// Route pour récupérer une tâche par son ID
app.get('/todos/:id', (req, res) => {
    console.log(req.params.id);
    const id = parseInt(req.params.id);
    const tache = taches.find(tache => tache.id === id);
    if (!tache) {
        return res.status(404).send("Tâche non trouvée");
    }
    if (isNaN(id)) {
        return console.log("ID de tâche invalide.");
    }
    res.status(200).json(tache);
});

// Route pour ajouter une nouvelle tâche
app.post('/todos', (req, res) => {
    const nouvelleTache = req.body;
    if (!nouvelleTache.title || !nouvelleTache.createdAt || !nouvelleTache.priority) {
        return res.status(400).json({ message: "Les champs title, createdAt et priority sont obligatoires." });
    }
    if (typeof nouvelleTache.finished !== "boolean") {
        nouvelleTache.finished = false;
    }
    nouvelleTache.id = taches.length + 1;
    taches.push(nouvelleTache);
    res.status(201).json(nouvelleTache);
});

// Route pour mettre à jour une tâche existante
app.put('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de tâche invalide' });
    }
    const tacheIndex = taches.findIndex(tache => tache.id === id);
    if (tacheIndex === -1) {
        return res.status(404).json({ error: 'Tâche non trouvée' });
    }
    const updatedTache = {
        ...taches[tacheIndex],
        ...req.body
    };
    taches[tacheIndex] = updatedTache;
    res.status(200).json(updatedTache);
});

// Route pour supprimer une tâche
app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const tacheIndex = taches.findIndex(tache => tache.id === id);
    if (tacheIndex === -1) {
        return res.status(404).json({ error: 'Tâche non trouvée' });
    }
    const deletedTache = taches.splice(tacheIndex, 1)[0];
    res.status(200).json(deletedTache);
});

// Route pour effectuer une recherche de tâches
app.get('/api/todos/recherche', (req, res) => {
    const recherche = req.query.search;
    if (!recherche) {
        return res.status(400).send("Vous n'avez pas défini de mot à rechercher");
    }
    const tachesFiltrees = taches.filter(tache => tache.title.toLowerCase().includes(recherche.toLowerCase()));
    if (tachesFiltrees.length === 0) {
        return res.status(404).send("Aucune tâche correspondant à la recherche n'a été trouvée");
    }
    res.json(tachesFiltrees);
});

// Route pour trier les tâches par ordre de priorité
app.get('/api/todos/order', (req, res) => {
    const tachesTrie = taches.slice().sort((a, b) => a.priority - b.priority);
    res.json(tachesTrie);
});

// Gestion des routes non définies
app.use((req, res) => {
    res.status(404).send("Erreur 404: Ressource non trouvée");
});

// Démarrage du serveur sur le port 8080
app.listen(port, () => {
    console.log(`Le serveur est en écoute sur le port ${port}`);
});

