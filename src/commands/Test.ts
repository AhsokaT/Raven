import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { House } from '../util/enum.js';
import { toOrdinal } from '../util/util.js';

@ApplyOptions<Command.Options>({
    name: 'test',
    description: 'Command for testing things',
})
export class Test extends Command {
    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const isProduction =
            '_' in process.env && String(process.env._).includes('heroku');

        if (isProduction) return;

        const embed = new EmbedBuilder()
            .setColor('#2B2D31')
            .setTitle(`Points gained ${House.TURTLE.emoji}`)
            .setDescription(`${House.TURTLE.roleMention}`)
            .addFields(
                {
                    name: 'Before',
                    value: '116',
                    inline: true,
                },
                {
                    name: 'Gained',
                    value: '34',
                    inline: true,
                },
                {
                    name: 'Now',
                    value: '150',
                    inline: true,
                },
                {
                    name: 'Position',
                    value: `You are ${toOrdinal(
                        interaction.client.store.position(House.TURTLE.id)
                    )} on the leaderboard\n-# You are in front of ${
                        House[interaction.client.store.toSorted()[2][0]]
                            .roleMention
                    } and behind ${House.RAVEN.roleMention}`,
                    inline: true,
                }
            );

        return await interaction.reply({
            ephemeral: true,
            embeds: [embed],
            allowedMentions: { parse: [] },
        });
    }

    registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand(
            (builder) =>
                builder
                    .setName(this.name)
                    .setDescription(this.description)
                    .setDefaultMemberPermissions(
                        PermissionFlagsBits.ManageGuild
                    ),
            { guildIds: ['509135025560616963'] }
        );
    }
}
