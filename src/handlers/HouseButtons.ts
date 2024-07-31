import {
    ActionRowBuilder,
    MessageActionRowComponentBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ButtonInteraction,
    TextChannel,
} from 'discord.js';
import { House, ChannelId } from '../util/enum.js';
import {
    InteractionHandler,
    InteractionHandlerTypes,
} from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { HouseInfoButton, UserInfoButton } from '../util/builders.js';

@ApplyOptions<InteractionHandler.Options>({
    interactionHandlerType: InteractionHandlerTypes.Button,
})
export class HouseButtons extends InteractionHandler {
    async run(interaction: ButtonInteraction) {
        if (/^(CHOOSEHOUSE)/.test(interaction.customId)) {
            const houseId = interaction.customId.split('_').pop() as House.id;
            const actionRow =
                new ActionRowBuilder<MessageActionRowComponentBuilder>();
            const house = House[houseId];

            actionRow.addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setLabel("I'm not sure yet")
                    .setCustomId(`HOUSEUNSURE`),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel('Sign me up!')
                    .setCustomId(`HOUSECONFIRM_${house.id}`)
            );

            interaction.update({
                content: `You can only join a house once, are you sure you want to join **${house.name}** <@&${house.roleId}>?`,
                embeds: [],
                components: [actionRow],
            });
        } else if (/^(HOUSEUNSURE)/.test(interaction.customId)) {
            const actionRow =
                new ActionRowBuilder<MessageActionRowComponentBuilder>();

            const buttons = House.ALL.map((house) =>
                new ButtonBuilder()
                    .setCustomId(`CHOOSEHOUSE_${house.id}`)
                    .setLabel(house.name)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(house.emoji)
            );

            actionRow.addComponents(buttons);

            const embed = new EmbedBuilder()
                .setColor('#2F3136')
                .setTitle('Choose your house')
                .setDescription(
                    'You can only join a house once, choose wisely!'
                )
                .addFields(
                    House.ALL.map((house) => ({
                        name: `${house.emoji} ${house.name}`,
                        value: `<@&${house.roleId}>\n-# ${house.description}`,
                    }))
                );

            interaction.update({
                content: '',
                embeds: [embed],
                components: [actionRow],
            });
        } else if (/^(HOUSECONFIRM)/.test(interaction.customId)) {
            if (!interaction.inCachedGuild())
                return void interaction.reply({
                    content: 'error',
                    ephemeral: true,
                });

            const selection = interaction.customId.split('_').pop() as House.id;
            const house = House[selection];

            try {
                await interaction.update({
                    components: [
                        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Success)
                                .setLabel('Sign me up!')
                                .setCustomId(`HOUSECONFIRM_${selection}`)
                                .setDisabled(true)
                        ),
                    ],
                });
            } catch (err) {
                return console.error(err);
            }

            try {
                await interaction.member.roles.add(house.roleId);
            } catch (err) {
                interaction
                    .editReply({
                        content:
                            ':x: There was an error assigning your house, try again later',
                        components: [],
                    })
                    .catch(console.debug);

                return console.error(err);
            }

            interaction
                .editReply({
                    content: `You have successfully joined **${House[selection].name}**! You now have access to <#${house.channelId}>`,
                    components: [],
                })
                .catch(console.debug);

            const logs = (await interaction.client.channels.fetch(
                ChannelId.Logs
            )) as TextChannel;

            logs.send({
                content: `${interaction.user} **became ${
                    selection === 'OWL' ? 'an' : 'a'
                }** <@&${house.roleId}>`,
                components: [
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                        UserInfoButton(interaction.user.id, 'Member'),
                        HouseInfoButton(selection)
                    ),
                ],
                allowedMentions: { parse: [] },
            }).catch(console.error);

            const channel = (await interaction.guild.channels.fetch(
                house.channelId
            )) as TextChannel;

            channel
                .send(
                    `<@&${house.roleId}> ${interaction.user} **has joined the house!** Give them a warm welcome! :smile:`
                )
                .then((message) => {
                    message.react('🥳');
                    message.react(house.emoji);
                })
                .catch(console.error);
        }
    }

    parse(interaction: ButtonInteraction) {
        return /^(CHOOSEHOUSE|HOUSEUNSURE|HOUSECONFIRM)/.test(
            interaction.customId
        )
            ? this.some()
            : this.none();
    }
}
