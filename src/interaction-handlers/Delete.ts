import { ButtonInteraction } from 'discord.js';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<InteractionHandler.Options>({
    interactionHandlerType: InteractionHandlerTypes.Button
})
export class Delete extends InteractionHandler {
    run(interaction: ButtonInteraction) {
        interaction.message.delete();
    }

    parse(interaction: ButtonInteraction) {
        return interaction.customId === 'DELETEINTERACTION' ? this.some() : this.none();
    }
}