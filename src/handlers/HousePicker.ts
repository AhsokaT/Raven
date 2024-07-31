import { ApplyOptions } from '@sapphire/decorators';
import {
    InteractionHandler,
    InteractionHandlerTypes,
} from '@sapphire/framework';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageActionRowComponentBuilder,
    StringSelectMenuInteraction,
} from 'discord.js';
import { House } from '../util/enum.js';
import assert from 'assert/strict';

@ApplyOptions<InteractionHandler.Options>({
    interactionHandlerType: InteractionHandlerTypes.SelectMenu,
})
export class HousePicker extends InteractionHandler {
    async run(interaction: StringSelectMenuInteraction) {
        assert(interaction.inGuild());
        const [selection] = interaction.values as [House.id];
        const house = House[selection];
        const guild =
            interaction.guild ??
            (await interaction.client.guilds.fetch(interaction.guildId));
        const member = interaction.inCachedGuild()
            ? interaction.member
            : await guild.members.fetch(interaction.user.id);
        const roles = House.ALL.map((house) => house.roleId);

        if (
            member.roles.cache.hasAny(...roles) &&
            member.user.id !== '451448994128723978'
        )
            return interaction.reply({
                content: 'You cannot join another house',
                ephemeral: true,
            });

        await interaction.reply({
            ephemeral: true,
            content: `Are you sure you want to join **${house.name}** <@&${house.roleId}>? Once you join, you cannot change your house`,
            allowedMentions: { parse: [] },
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Primary)
                        .setLabel("I'm not sure yet")
                        .setCustomId(`HOUSEUNSURE`),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Success)
                        .setLabel('Sign me up!')
                        .setCustomId(`HOUSECONFIRM_${selection}`)
                ),
            ],
        });
    }

    parse(interaction: StringSelectMenuInteraction) {
        return interaction.customId.startsWith('HOUSE')
            ? this.some()
            : this.none();
    }
}
