import {
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    Snowflake,
    User,
} from 'discord.js';
import { Client } from '../client/client.js';
import { HousePoints } from '../database/DatabaseManager.js';
import { House } from './enum.js';

function numberToOrdinal(n: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = n % 100;
    return n + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}

const padLength = (strs: string[]) =>
    strs.slice().sort((a, b) => b.length - a.length)[0].length + 1;

function padString(str: string, points: (string | number)[]) {
    return str
        .padStart(padLength(points.map(String)), ' ')
        .padEnd(padLength(points.map(String)) + 1, ' ');
}

export const pointChangeButton = (before: HousePoints, after: HousePoints) => {
    const json = JSON.stringify(
        (Object.keys(before) as House.id[]).reduce(
            (acc, h) => Object.assign(acc, { [h]: [before[h], after[h]] }),
            {}
        )
    );

    if (json.length > 98) return null;

    return new ButtonBuilder()
        .setCustomId(`P_${json}`)
        .setLabel('See all changes')
        .setStyle(ButtonStyle.Primary);
};

export function pointChangeEmbed(
    house: House.id,
    before: number,
    after: number,
    author: User
) {
    const diff = `${before - after > 0 ? 'Removed' : 'Added'} ${Math.abs(
        before - after
    )} points`;

    return new EmbedBuilder()
        .setColor('#2F3136')
        .setTitle('Point update')
        .setAuthor({
            name: author.username,
            iconURL: author.displayAvatarURL(),
        })
        .setDescription(
            `\`${padString(diff, [diff])}\` \`${padString(before.toString(), [
                before,
            ])}\` → \`${padString(after.toString(), [after])}\` <@&${
                House[house].roleId
            }>`
        );
}

export function allPointChangeEmbed(
    before: HousePoints,
    after: HousePoints,
    author: User
) {
    const allDiff = House.ids
        .map((h) => before[h] - after[h])
        .map((d) => `${d > 0 ? 'Removed' : 'Added'} ${Math.abs(d)} points`);

    return new EmbedBuilder()
        .setColor('#2F3136')
        .setTitle('Point update')
        .setAuthor({
            name: author.username,
            iconURL: author.displayAvatarURL(),
        })
        .setDescription(
            House.ids
                .slice()
                .sort((a, b) => after[b] - after[a])
                .reduce((acc, house) => {
                    if (before[house] === after[house]) return acc;

                    const diff = before[house] - after[house];

                    const diffStr =
                        '`' +
                        [
                            ...padString(
                                [
                                    ...`${
                                        diff > 0 ? 'Removed' : 'Added'
                                    } ${Math.abs(diff)} points`,
                                ]
                                    .reverse()
                                    .join(''),
                                allDiff
                            ),
                        ]
                            .reverse()
                            .join('') +
                        '`';

                    return (
                        acc +
                        `\n${diffStr} \`${padString(
                            before[house].toString(),
                            Object.values(before)
                        )}\` → \`${padString(
                            after[house].toString(),
                            Object.values(after)
                        )}\` <@&${House[house].roleId}>`
                    );
                }, '')
        );
}

export const UpdateLeaderboardButton = (label = 'Refresh') =>
    new ButtonBuilder()
        .setCustomId('UPDATELEADERBOARD')
        .setStyle(ButtonStyle.Primary)
        .setLabel(label);

export const DeleteInteractionButton = () =>
    new ButtonBuilder()
        .setCustomId('DELETEINTERACTION')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️');

export const UserInfoButton = (user: Snowflake, label = 'User') =>
    new ButtonBuilder()
        .setCustomId(`USERINFO_${user}`)
        .setStyle(ButtonStyle.Primary)
        .setLabel(label);

export const LeaderboardButton = (label = 'Leaderboard') =>
    new ButtonBuilder()
        .setCustomId('LEADERBOARD')
        .setStyle(ButtonStyle.Primary)
        .setLabel(label);

export const HouseInfoButton = (house: House.id, label = 'House') =>
    new ButtonBuilder()
        .setCustomId(`HOUSEINFO_${house}`)
        .setStyle(ButtonStyle.Primary)
        .setLabel(label);

export const RevokeBanButton = (user: Snowflake, label = 'Revoke ban') =>
    new ButtonBuilder()
        .setCustomId(`UNBAN_${user}`)
        .setStyle(ButtonStyle.Danger)
        .setLabel(label);

export const BanButton = (user: Snowflake, label = 'Ban') =>
    new ButtonBuilder()
        .setCustomId(`BAN_${user}`)
        .setStyle(ButtonStyle.Danger)
        .setLabel(label);

function housePosition(
    [h, p]: [House.id, number],
    index: number,
    all: [string, number][]
) {
    return `\n\` ${numberToOrdinal(index + 1)} \` \`${padString(
        `${p} points`,
        all.map(([_, p]) => `${p} points`)
    )}\` <@&${House[h].roleId}>`;
}

export const LeaderboardEmbed = (client: Client) =>
    new EmbedBuilder()
        .setColor('#2F3136')
        .setTitle('Leaderboard')
        .setDescription(
            client.database.sorted.reduce(
                (acc, h, i, a) => acc + housePosition(h, i, a),
                `Refreshed <t:${Math.round(Date.now() / 1000)}:R>\n`
            )
        );
