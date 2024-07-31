import { Listener } from '@sapphire/framework';
import assert from 'assert/strict';
import { Events, GuildMember } from 'discord.js';
import { ChannelId } from '../util/enum.js';

export class GuildMemberAdd extends Listener<Events.GuildMemberAdd> {
    async run(member: GuildMember) {
        if (member.guild.id !== '509135025560616963' || member.user.bot) return;

        const channel = await member.guild.channels.fetch(ChannelId.General);
        assert.ok(channel?.isTextBased());
        const commands = await member.guild.commands.fetch();
        const command = commands.find(({ name }) => name === 'choosehouse');

        await channel.send(
            `Welcome to Daily Offenders, ${member}! When you're ready, use ${
                command ? `</${command.name}:${command.id}>` : '`/choosehouse`'
            } to join a house and begin collecting points!`
        );
    }
}
