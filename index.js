const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { Resvg } = require('@resvg/resvg-js');
const { generateStarSvg } = require('./rating');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const command = new SlashCommandBuilder()
    .setName('note')
    .setDescription('Attribue une note de 0 à 10')
    .addNumberOption(option =>
        option.setName('valeur')
            .setDescription('La note entre 0 et 10')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(10)
    );

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: [command.toJSON()] },
        );
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand() || interaction.commandName !== 'note') return;

    const note = interaction.options.getNumber('valeur', true);
    const displayName =
        interaction.member?.displayName ||
        interaction.member?.nick ||
        interaction.user.globalName ||
        interaction.user.username;
    try {
        const svgContent = generateStarSvg(note, displayName);
        const resvg = new Resvg(svgContent);
        const pngData = resvg.render();
        const pngBuffer = pngData.asPng();

        const attachment = new AttachmentBuilder(pngBuffer, { name: `note-${note}.png` });

        await interaction.reply({
            content: `Note attribuée : **${note.toFixed(1).replace('.', ',')} / 10**`,
            files: [attachment]
        });
    } catch (error) {
        console.error('Erreur pendant la génération de la note :', error);
        try {
            const reply = {
                content: 'Impossible de générer la note. Réessaie dans un instant.',
                ephemeral: true
            };
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        } catch (replyError) {
            console.error('Impossible de répondre à l’interaction Discord :', replyError);
        }
    }
});

client.on('error', error => {
    console.error('Erreur du client Discord :', error);
});

client.login(process.env.DISCORD_TOKEN);
