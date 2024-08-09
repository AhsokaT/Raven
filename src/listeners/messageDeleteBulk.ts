import { Listener } from '@sapphire/framework';
import assert from 'assert/strict';
import { ClientEvents, EmbedBuilder, Events } from 'discord.js';
import { ChannelId } from '../util/enum.js';

export class MessageBulkDeleteListener extends Listener<Events.MessageBulkDelete> {
    async run(...[deleted, channel]: ClientEvents[Events.MessageBulkDelete]) {
        if (channel.guildId !== '509135025560616963') return;

        const logs = await channel.client.channels.fetch(ChannelId.Logs);

        assert(logs?.isTextBased());

        const embed = new EmbedBuilder()
            .setColor('#2B2D31')
            .setTitle('Message bulk delete')
            .setAuthor({
                name: channel.client.user.username,
                iconURL: channel.client.user.displayAvatarURL(),
            })
            .addFields(
                { name: 'Channel', value: channel.toString() },
                { name: 'Deleted', value: deleted.size.toString() }
            );

        await logs.send({ embeds: [embed] });
    }
}
