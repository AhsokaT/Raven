import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord.js';
import { createHouseUpdateEmbed } from '../util/builders.js';
import { House } from '../util/enum.js';

@ApplyOptions<Command.Options>({
    name: 'test',
    description: 'Command for testing things',
})
export class Test extends Command {
    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const isProduction =
            '_' in process.env && String(process.env._).includes('heroku');

        if (isProduction) return;

        const embed = createHouseUpdateEmbed(
            House.TIGER,
            100,
            120,
            interaction.user,
            interaction.client.store
        );

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
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
