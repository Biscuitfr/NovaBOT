const express = require('express');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/website'));

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'votreMotDePasseSecurise'; // REMPLACEZ CECI !

let isLoggedIn = false;

app.get('/', (req, res) => {
    if (isLoggedIn) {
        res.sendFile(__dirname + '/website/dashboard.html');
    } else {
        res.sendFile(__dirname + '/website/index.html');
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isLoggedIn = true;
        res.redirect('/');
    } else {
        res.send('Nom d\'utilisateur ou mot de passe incorrect.');
    }
});

app.get('/api/servers', (req, res) => {
    if (isLoggedIn && client) {
        const servers = client.guilds.cache.map(guild => ({
            id: guild.id,
            name: guild.name,
            iconURL: guild.iconURL({ dynamic: true, size: 64 }),
            memberCount: guild.memberCount
        }));
        res.json(servers);
    } else {
        res.status(401).send('Non autorisé');
    }
});

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const token = process.env.DISCORD_BOT_TOKEN;

client.login(token).then(() => {
    console.log(`Bot Discord connecté en tant que ${client.user.tag}`);
    app.listen(port, () => {
        console.log(`Panel web démarré sur le port ${port}`);
    });
}).catch(error => {
    console.error('Erreur lors de la connexion du bot Discord:', error);
});