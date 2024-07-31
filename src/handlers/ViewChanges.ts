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
    DeleteInteractionButton,
    allPointChangeEmbed,
} from '../util/builders.js';
import { House } from '../util/enum.js';

@ApplyOptions<InteractionHandler.Options>({
    interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ViewChanges extends InteractionHandler {
    async run(interaction: ButtonInteraction) {
        let [_, json] = interaction.customId.split('_');

        const changes = JSON.parse(json);

        const before = Object.keys(changes).reduce(
            (acc, h) => Object.assign(acc, { [h]: changes[h][0] }),
            {}
        ) as House.Points;
        const after = Object.keys(changes).reduce(
            (acc, h) => Object.assign(acc, { [h]: changes[h][1] }),
            {}
        ) as House.Points;

        await interaction.reply({
            embeds: [allPointChangeEmbed(before, after, interaction.user)],
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                    DeleteInteractionButton()
                ),
            ],
            allowedMentions: { parse: [] },
        });
    }

    parse(interaction: ButtonInteraction) {
        return interaction.customId.startsWith('P') ? this.some() : this.none();
    }
}
