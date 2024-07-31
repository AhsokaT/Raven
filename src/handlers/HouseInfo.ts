import { ApplyOptions } from '@sapphire/decorators';
import {
    InteractionHandler,
    InteractionHandlerTypes,
} from '@sapphire/framework';
import { ButtonInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
    interactionHandlerType: InteractionHandlerTypes.Button,
})
export class HouseInfo extends InteractionHandler {
    async run(interaction: ButtonInteraction) {
        await interaction.reply({
            ephemeral: true,
            content: 'This button does nothing yet!',
        });
    }

    parse(interaction: ButtonInteraction) {
        return interaction.customId.startsWith('HOUSEINFO')
            ? this.some()
            : this.none();
    }
}
