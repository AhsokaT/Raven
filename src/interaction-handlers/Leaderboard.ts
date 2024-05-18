import { ActionRowBuilder, ButtonInteraction, MessageActionRowComponentBuilder } from 'discord.js';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { DeleteInteractionButton, LeaderboardEmbed, UpdateLeaderboardButton } from '../Util/builders';
import { Client } from '../Client/client';

@ApplyOptions<InteractionHandler.Options>({
    interactionHandlerType: InteractionHandlerTypes.Button
})
export class Leaderboard extends InteractionHandler {
    run(interaction: ButtonInteraction) {
        if (interaction.customId === 'LEADERBOARD')
            return void interaction.reply({
                embeds: [LeaderboardEmbed(interaction.client as Client)],
                components: [
                    new ActionRowBuilder<MessageActionRowComponentBuilder>()
                        .addComponents(UpdateLeaderboardButton(), DeleteInteractionButton())
                ],
                allowedMentions: { parse: [] }
            }).catch(console.error);

        interaction.update({ embeds: [LeaderboardEmbed(interaction.client as Client)] }).catch(console.debug);
    }

    parse(interaction: ButtonInteraction) {
        return /LEADERBOARD|UPDATELEADERBOARD/.test(interaction.customId) ? this.some() : this.none();
    }
}