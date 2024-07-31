import {
    ActionRowBuilder,
    ButtonInteraction,
    MessageActionRowComponentBuilder,
} from 'discord.js';
import {
    InteractionHandler,
    InteractionHandlerTypes,
} from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import {
    DeleteInteractionButton,
    LeaderboardEmbed,
    UpdateLeaderboardButton,
} from '../util/builders.js';
import { Client } from '../client/client.js';

@ApplyOptions<InteractionHandler.Options>({
    interactionHandlerType: InteractionHandlerTypes.Button,
})
export class Leaderboard extends InteractionHandler {
    async run(interaction: ButtonInteraction) {
        if (interaction.customId === 'LEADERBOARD')
            await interaction.reply({
                embeds: [LeaderboardEmbed(interaction.client as Client)],
                components: [
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                        UpdateLeaderboardButton(),
                        DeleteInteractionButton()
                    ),
                ],
                allowedMentions: { parse: [] },
            });
        else
            await interaction.update({
                embeds: [LeaderboardEmbed(interaction.client as Client)],
            });
    }

    parse(interaction: ButtonInteraction) {
        return ['LEADERBOARD', 'UPDATELEADERBOARD'].some((id) =>
            interaction.customId.startsWith(id)
        )
            ? this.some()
            : this.none();
    }
}
