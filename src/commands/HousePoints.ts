import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    MessageActionRowComponentBuilder,
} from 'discord.js';
import { promisify } from 'util';
import {
    allPointChangeEmbed,
    LeaderboardButton,
    pointChangeButton,
    pointChangeEmbed,
} from '../util/builders.js';
import { ChannelId, House } from '../util/enum.js';

@ApplyOptions<Command.Options>({
    name: 'housepoints',
    description: 'Add or remove points from houses',
})
export class HousePointsCommand extends Command {
    readonly gifs = [
        'https://tenor.com/view/smiling-friends-adult-swim-smiling-friends-smiling-friends-spamish-pim-pimling-smiling-friends-pim-gif-10921009947340864978',
        'https://tenor.com/view/going-crazy-mr-boss-smiling-friends-freaking-out-going-wild-gif-5258506792416434328',
        'https://tenor.com/view/glep-coffee-tired-morning-tired-meme-gif-25383597',
        'https://tenor.com/view/smiling-friends-alan-gif-27591763',
    ] as const;

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const client = interaction.client;
        const current = Object.fromEntries(client.store) as House.Points;
        const newTotals: House.Points = {
            TIGER: interaction.options.getInteger('tigers') ?? current.TIGER,
            OWL: interaction.options.getInteger('owls') ?? current.OWL,
            RAVEN: interaction.options.getInteger('ravens') ?? current.RAVEN,
            TURTLE: interaction.options.getInteger('turtles') ?? current.TURTLE,
            PANDA: interaction.options.getInteger('pandas') ?? current.PANDA,
        };

        let changes = House.ids
            .filter((house) => newTotals[house] !== current[house])
            .map((house): [House.id, number] => [house, newTotals[house]]);

        if (changes.length === 0)
            return interaction.reply({
                content: 'No changes were made',
                ephemeral: true,
            });

        const timeoutTimestamp = ~~((Date.now() + 60_000) / 1000);

        // TODO move changes to staged changes field
        const stagedEmbed = allPointChangeEmbed(
            current,
            newTotals,
            interaction.user
        );
        const stagedStr = stagedEmbed.data.description;

        stagedEmbed
            .setTitle(null)
            .setDescription(
                `> ${
                    client.irohQuotes[
                        ~~(Math.random() * client.irohQuotes.length)
                    ]
                }\n— Uncle Iroh`
            )
            .addFields(
                { name: 'Staged changes', value: stagedStr ?? 'Missing value' },
                {
                    name: ':stopwatch: Timeout',
                    value: `<t:${timeoutTimestamp}:R>`,
                }
            );

        const commitButton = new ButtonBuilder()
            .setCustomId('commit')
            .setLabel('Commit')
            .setStyle(ButtonStyle.Primary);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary);

        const partyButton = new ButtonBuilder()
            .setCustomId('party')
            .setEmoji('🎉')
            .setStyle(ButtonStyle.Secondary);

        const reply = await interaction.reply({
            embeds: [stagedEmbed],
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                    commitButton,
                    cancelButton,
                    partyButton
                ),
            ],
        });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60_000,
        });

        collector.on('collect', async (button) => {
            if (button.customId === 'party') return this.party(button);

            if (button.user.id !== interaction.user.id)
                return button.reply({
                    content: 'You do not have permission to use this',
                    ephemeral: true,
                });

            collector.stop();

            if (button.customId === 'cancel') return reply.delete();

            if (button.customId !== 'commit') return reply.delete();

            await button.update({
                components: [
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                        commitButton.setDisabled(true),
                        cancelButton.setDisabled(true),
                        partyButton.setDisabled(true)
                    ),
                ],
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2B2D31')
                        .setTitle('Committing changes...')
                        .setDescription(`This won't take long`)
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL(),
                        }),
                ],
            });

            let time = performance.now();
            try {
                await client.store.patch(changes);
            } catch (error) {
                console.error(error);

                const errorEmbed = new EmbedBuilder()
                    .setColor('#2B2D31')
                    .setTitle('Error')
                    .setAuthor({
                        name: interaction.client.user.username,
                        iconURL: interaction.client.user.displayAvatarURL(),
                    })
                    .setDescription(
                        'Failed to update database, please try again later'
                    );

                await button.editReply({
                    embeds: [errorEmbed],
                    components: [],
                });

                await promisify(setTimeout)(30_000);

                try {
                    await button.deleteReply();
                } catch (error) {
                    console.error(error);
                }
            }
            time = performance.now() - time;

            const embed = new EmbedBuilder()
                .setColor('#2B2D31')
                .setTitle('Changes pushed')
                .setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .addFields(
                    {
                        name: 'Database update time',
                        value: `${time.toFixed(2)}ms`,
                    },
                    {
                        name: 'Changes',
                        value:
                            allPointChangeEmbed(
                                current,
                                newTotals,
                                interaction.user
                            ).data.description ?? 'Missing value',
                    }
                );

            await button.editReply({
                embeds: [embed],
                allowedMentions: { parse: [] },
                components: [],
            });

            for (const houseId of House.ids) {
                if (newTotals[houseId] === current[houseId]) continue;

                const changeButton = pointChangeButton(current, newTotals);
                const actionRow =
                    new ActionRowBuilder<MessageActionRowComponentBuilder>();
                const embed = pointChangeEmbed(
                    houseId,
                    current[houseId],
                    newTotals[houseId],
                    interaction.user
                );
                const house = House[houseId];

                if (changeButton)
                    actionRow.addComponents(changeButton, LeaderboardButton());
                else actionRow.addComponents(LeaderboardButton());

                try {
                    const channel = await client.channels.fetch(
                        house.channelId
                    );

                    if (!channel?.isTextBased()) continue;

                    await channel.send({
                        embeds: [embed],
                        components: [actionRow],
                    });
                } catch (cause) {
                    console.error(
                        Error('Failed to send point changes to house channel', {
                            cause,
                        })
                    );
                }
            }

            try {
                const channels = [
                    client.channels.fetch(ChannelId.Logs),
                    client.channels.fetch(ChannelId.Trophy),
                ];

                for await (const channel of channels) {
                    if (!channel?.isTextBased()) continue;

                    channel.send({
                        embeds: [
                            allPointChangeEmbed(
                                current,
                                newTotals,
                                interaction.user
                            ),
                        ],
                        allowedMentions: { parse: [] },
                        components: [
                            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                                LeaderboardButton()
                            ),
                        ],
                    });
                }
            } catch (cause) {
                console.error(Error('Failed to send logs', { cause }));
            }
        });

        collector.on('end', (...[, reason]) => {
            if (reason === 'time')
                interaction.deleteReply().catch(console.error);
        });
    }

    async party(button: ButtonInteraction) {
        await button.reply({
            content: this.gifs[~~(Math.random() * this.gifs.length)],
            ephemeral: true,
        });
    }
}
