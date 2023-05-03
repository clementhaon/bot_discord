const {SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, DateInputBuilder} = require('discord.js');

module.exports = {  data: new SlashCommandBuilder()
        .setName('recette')
        .setDescription('Recette de saison'),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('maRecette')
            .setTitle('Ma recette');

        // Add components to modal

        // Create the text input components
        const theme = new TextInputBuilder()
            .setCustomId('theme')
            // The label is the prompt the user sees for this input
            .setLabel("Quel type de repas ?")
            // Short means only a single line of text
            .setStyle(TextInputStyle.Short);

        const ingredientPresent = new TextInputBuilder()
            .setCustomId('ingredientPresent')
            .setLabel("Des ingrédients favoris ?")
            // Paragraph means multiple lines of text.
            .setStyle(TextInputStyle.Paragraph);

        const ingredientNonPresent = new TextInputBuilder()
            .setCustomId('ingredientNonPresent')
            .setLabel("Allergie, intolérance ?")
            // Paragraph means multiple lines of text.
            .setStyle(TextInputStyle.Paragraph);


        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new ActionRowBuilder().addComponents(theme);
        const secondActionRow = new ActionRowBuilder().addComponents(ingredientPresent);
        const thirdActionRow = new ActionRowBuilder().addComponents(ingredientNonPresent);

        // Add inputs to the modal
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        // Show the modal to the user
        await interaction.showModal(modal);
    }

}