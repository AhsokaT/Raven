import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import {
    InteractionHandler,
    InteractionHandlerTypes,
} from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<InteractionHandler.Options>({
    interactionHandlerType: InteractionHandlerTypes.Button,
})
export class UserInfo extends InteractionHandler {
    async run(interaction: ButtonInteraction) {
        const [, userId] = interaction.customId.split('_');
        const user = await interaction.client.users.fetch(userId);
        const member = await interaction.guild?.members
            .fetch(userId)
            .catch(() => null);

        const infoEmbed = new EmbedBuilder()
            .setColor('#2B2D31')
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setThumbnail(user.displayAvatarURL({ size: 4096 }))
            .addFields({ name: 'Username', value: user.tag });

        const nickname = member?.nickname;
        const displayName = nickname ?? user.globalName;

        if (displayName)
            infoEmbed.addFields({ name: 'Display name', value: displayName });

        infoEmbed.addFields({ name: 'Snowflake ID', value: user.id });

        if (member) {
            if (member.roles.cache.size > 1) {
                const roles = member.roles.cache
                    .filter(
                        (role) =>
                            (typeof role === 'string' ? role : role.id) !==
                            interaction.guildId
                    )
                    .map((role) =>
                        typeof role === 'string' ? `<@&${role}>` : String(role)
                    )
                    .join(' ');

                if (roles.length <= 1024)
                    infoEmbed.addFields({ name: 'Roles', value: roles });
            }

            if (member.premiumSinceTimestamp)
                infoEmbed.addFields({
                    name: 'Boosting since',
                    value: `<t:${Math.round(
                        member.premiumSinceTimestamp / 1000
                    )}:D> <t:${Math.round(
                        member.premiumSinceTimestamp / 1000
                    )}:R>`,
                });

            if (member.isCommunicationDisabled())
                infoEmbed.addFields({
                    name: 'Communication disabled until',
                    value: `<t:${Math.round(
                        member.communicationDisabledUntilTimestamp / 1000
                    )}:f> <t:${Math.round(
                        member.communicationDisabledUntilTimestamp / 1000
                    )}:R> :stopwatch:`,
                });

            if (member.joinedTimestamp)
                infoEmbed.addFields({
                    name: 'Joined server',
                    value: `<t:${Math.round(
                        member.joinedTimestamp / 1000
                    )}:D> <t:${Math.round(member.joinedTimestamp / 1000)}:R>`,
                });
        }

        infoEmbed.addFields({
            name: 'Joined Discord',
            value: `<t:${Math.round(
                user.createdTimestamp / 1000
            )}:D> <t:${Math.round(user.createdTimestamp / 1000)}:R>`,
        });

        await interaction.reply({
            ephemeral: true,
            allowedMentions: { parse: [] },
            embeds: [infoEmbed],
        });
    }

    parse(interaction: ButtonInteraction) {
        return interaction.customId.startsWith('USERINFO')
            ? this.some()
            : this.none();
    }
}
