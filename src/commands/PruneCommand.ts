import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import assert from 'assert/strict';
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
    MessageActionRowComponentBuilder,
    PermissionFlagsBits,
} from 'discord.js';

@ApplyOptions<Command.Options>({
    name: 'prune',
    description: 'Bulk delete messages',
})
export class PruneCommand extends Command {
    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        assert(interaction.inGuild());
        const num = interaction.options.getInteger('number', true);

        if (num < 2 || num > 100)
            return interaction.reply({
                content: `Your input for \`number\` must be between 2 and 100 inclusive.`,
                ephemeral: true,
            });

        const buttons = [
            new ButtonBuilder()
                .setCustomId(`prune_${num}`)
                .setLabel('Prune')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('prune_cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Primary),
        ];

        const row =
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                buttons
            );

        const content = [
            `Are you sure you want to delete ${num} messages from ${
                interaction.channel ?? 'this channel'
            }?`,
            `:warning: **This action cannot be undone.**`,
            `-# Messages older than 14 days will not be deleted.`,
        ].join('\n');

        await interaction.reply({
            content,
            components: [row],
            ephemeral: true,
        });
    }

    registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand(
            {
                name: this.name,
                description: this.description,
                options: [
                    {
                        name: 'number',
                        description:
                            'Number of messages that should be deleted',
                        type: ApplicationCommandOptionType.Integer,
                        required: true,
                    },
                ],
                defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
            },
            { guildIds: ['509135025560616963'] }
        );
    }
}
