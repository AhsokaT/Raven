import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ActionRowBuilder, MessageActionRowComponentBuilder } from 'discord.js';
import {
    DeleteInteractionButton,
    LeaderboardEmbed,
    UpdateLeaderboardButton,
} from '../util/builders.js';

@ApplyOptions<Command.Options>({
    name: 'leaderboard',
    description: "See who's ahead in the house competitions",
})
export class Leaderboard extends Command {
    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        await interaction.reply({
            embeds: [LeaderboardEmbed(interaction.client)],
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                    UpdateLeaderboardButton(),
                    DeleteInteractionButton()
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
