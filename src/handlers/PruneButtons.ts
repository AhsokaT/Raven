import { ApplyOptions } from '@sapphire/decorators';
import {
    InteractionHandler,
    InteractionHandlerTypes,
} from '@sapphire/framework';
import assert from 'assert/strict';
import { ButtonInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
    interactionHandlerType: InteractionHandlerTypes.Button,
})
export class PruneButtons extends InteractionHandler {
    async run(interaction: ButtonInteraction) {
        if (interaction.customId.endsWith('cancel'))
            return interaction.update({
                embeds: [],
                components: [],
                content: 'Prune cancelled.',
            });

        await interaction.deferUpdate();

        const num = Number(interaction.customId.split('_').pop());

        assert(interaction.inGuild());
        assert(!isNaN(num));

        let channel =
            interaction.channel ??
            (await interaction.client.channels.fetch(interaction.channelId));

        if (!channel?.isTextBased() || channel.isDMBased())
            return interaction.editReply({
                embeds: [],
                components: [],
                content: 'Could not fetch channel',
            });

        const pruned = await channel.bulkDelete(num, true);
        const content = !pruned.size
            ? `No messages were deleted. It is possible that there were no messages newer than 14 days old in this channel.`
            : `Successfully deleted **${pruned.size} messages**.`;

        await interaction.editReply({
            embeds: [],
            components: [],
            content,
        });
    }

    parse(interaction: ButtonInteraction) {
        return interaction.customId.startsWith('prune')
            ? this.some()
            : this.none();
    }
}
