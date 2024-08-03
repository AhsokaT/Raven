import { ApplyOptions } from '@sapphire/decorators';
import {
    InteractionHandler,
    InteractionHandlerTypes,
} from '@sapphire/framework';
import assert from 'assert/strict';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    MessageActionRowComponentBuilder,
} from 'discord.js';
import {
    createHouseChooseEmbed,
    HouseInfoButton,
    UserInfoButton,
} from '../util/builders.js';
import { ChannelId, House } from '../util/enum.js';

@ApplyOptions<InteractionHandler.Options>({
    interactionHandlerType: InteractionHandlerTypes.Button,
})
export class HouseButtons extends InteractionHandler {
    async run(interaction: ButtonInteraction) {
        if (interaction.customId.startsWith('CHOOSEHOUSE')) {
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

            await interaction.update({
                content: `You can only join a house once, are you sure you want to join **${house.name}** <@&${house.roleId}>?`,
                embeds: [],
                components: [actionRow],
            });
        } else if (interaction.customId.startsWith('HOUSEUNSURE')) {
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

            await interaction.update({
                content: '',
                embeds: [createHouseChooseEmbed()],
                components: [actionRow],
            });
        } else if (interaction.customId.startsWith('HOUSECONFIRM')) {
            if (!interaction.inCachedGuild())
                return interaction.reply({
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
                console.error(err);
                return interaction.editReply({
                    content:
                        ':x: There was an error assigning your house, try again later',
                    components: [],
                });
            }

            await interaction.editReply({
                content: `You have successfully joined **${House[selection].name}**! You now have access to <#${house.channelId}>`,
                components: [],
            });

            const logs = await interaction.client.channels.fetch(
                ChannelId.Logs
            );

            assert(logs?.isTextBased());

            await logs.send({
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
            });

            const channel = await interaction.guild.channels.fetch(
                house.channelId
            );

            assert(channel?.isTextBased());

            const message = await channel.send(
                `<@&${house.roleId}> ${interaction.user} **has joined the house!** Give them a warm welcome! :smile:`
            );

            await message.react('🥳');
            await message.react(house.emoji);
        }
    }

    parse(interaction: ButtonInteraction) {
        return ['CHOOSEHOUSE', 'HOUSEUNSURE', 'HOUSECONFIRM'].some((id) =>
            interaction.customId.startsWith(id)
        )
            ? this.some()
            : this.none();
    }
}
