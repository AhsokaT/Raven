import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ActionRowBuilder, MessageActionRowComponentBuilder } from 'discord.js';
import {
    createLeaderboardEmbed,
    createUpdateLeaderboardButton,
} from '../util/builders.js';

@ApplyOptions<Command.Options>({
    name: 'leaderboard',
    description: "See who's ahead in the house competitions",
})
export class Leaderboard extends Command {
    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        await interaction.reply({
            embeds: [createLeaderboardEmbed(interaction.client.store)],
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                    createUpdateLeaderboardButton()
                ),
            ],
            allowedMentions: { parse: [] },
        });
    }

    registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand(
            { name: this.name, description: this.description },
            { guildIds: ['509135025560616963'] }
        );
    }
}
