import {
    ActionRowBuilder,
    MessageActionRowComponentBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';
import { House } from '../util/enum.js';
import { Command } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { createHouseChooseEmbed } from '../util/builders.js';

@ApplyOptions<Command.Options>({
    name: 'choosehouse',
    description: 'Choose your house!',
})
export class ChooseHouseCommand extends Command {
    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild())
            return interaction.reply({
                content: 'error',
                ephemeral: true,
            });

        // if (
        //     interaction.member.roles.cache.hasAny(
        //         ...House.ALL.map((house) => house.roleId)
        //     )
        // )
        //     return interaction.reply({
        //         content: 'You have already joined a house!',
        //         ephemeral: true,
        //     });

        const actionRow =
            new ActionRowBuilder<MessageActionRowComponentBuilder>();

        const buttons = House.ALL.map((house) =>
            new ButtonBuilder()
                .setCustomId(`CHOOSEHOUSE_${house.id}`)
                .setLabel(house.name)
                .setStyle(ButtonStyle.Primary)
                .setEmoji(house.emoji)
        );

        actionRow.addComponents(buttons);

        await interaction.reply({
            embeds: [createHouseChooseEmbed()],
            components: [actionRow],
            ephemeral: true,
        });
    }
}
