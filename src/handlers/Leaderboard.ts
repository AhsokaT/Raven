import { ApplyOptions } from '@sapphire/decorators';
import {
    InteractionHandler,
    InteractionHandlerTypes,
} from '@sapphire/framework';
import {
    ActionRowBuilder,
    ButtonInteraction,
    MessageActionRowComponentBuilder,
} from 'discord.js';
import {
    createLeaderboardEmbed,
    createUpdateLeaderboardButton
} from '../util/builders.js';

@ApplyOptions<InteractionHandler.Options>({
    interactionHandlerType: InteractionHandlerTypes.Button,
})
export class Leaderboard extends InteractionHandler {
    async run(interaction: ButtonInteraction) {
        if (interaction.customId === 'LEADERBOARD')
            await interaction.reply({
                embeds: [createLeaderboardEmbed(interaction.client.store)],
                components: [
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                        createUpdateLeaderboardButton()
                    ),
                ],
                allowedMentions: { parse: [] },
            });
        else
            await interaction.update({
                embeds: [createLeaderboardEmbed(interaction.client.store)],
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
