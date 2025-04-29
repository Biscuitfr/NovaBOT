// service.js
require('dotenv').config(); // Charge les variables d'environnement depuis .env

const serviceStaffRoleId = process.env.SERVICE_STAFF_ROLE_ID;
const authorizedRoleIds = [
    '1173919701060042782',
    '1366360986033848416',
    '1073276953647398942',
    '1072941562134282371',
    '1366360840642498632',
    '1366365649777201242',
];

module.exports = {
    name: 'service',
    aliases: ['ss', 'sa'],
    utilisation: '{prefix}service',
    description: 'Vous donne le rôle Service Staff pour indiquer votre disponibilité (rôles staff autorisés uniquement).',
    categorie: 'Nova Life',

    async execute(client, message, args) {
        if (!serviceStaffRoleId) {
            return message.reply("L'ID du rôle 'Service Staff' n'est pas configuré dans le fichier `.env`.");
        }

        const serviceRole = message.guild.roles.cache.get(serviceStaffRoleId);
        const member = message.member;

        if (!serviceRole) {
            return message.reply("Le rôle 'Service Staff' n'a pas été trouvé sur ce serveur.");
        }

        // Vérifie si le membre a l'un des rôles autorisés
        const isAuthorized = member.roles.cache.some(role => authorizedRoleIds.includes(role.id));
        if (!isAuthorized) {
            return message.reply("Seuls les membres avec un rôle staff autorisé peuvent utiliser cette commande.");
        }

        if (member.roles.cache.has(serviceRole.id)) {
            return message.reply("Vous avez déjà le rôle 'Service Staff'. Utilisez `!unservice` pour le retirer.");
        }

        try {
            await member.roles.add(serviceRole);
            message.reply(`${message.author.tag} a maintenant le rôle 'Service Staff'.`);
        } catch (error) {
            console.error('Erreur lors de l\'ajout du rôle :', error);
            message.reply('Une erreur est survenue lors de l\'ajout du rôle.');
        }
    },
};
