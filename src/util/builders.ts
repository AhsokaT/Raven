import {
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    Snowflake,
    User,
} from 'discord.js';
import { Client } from '../client/Client.js';
import { House } from './enum.js';
import { toOrdinal } from './util.js';
import { HouseStore } from '../structs/HouseStore.js';

const padLength = (strs: string[]) =>
    strs.slice().sort((a, b) => b.length - a.length)[0].length + 1;

function padString(str: string, points: (string | number)[]) {
    return str
        .padStart(padLength(points.map(String)), ' ')
        .padEnd(padLength(points.map(String)) + 1, ' ');
}

export const pointChangeButton = (
    before: House.Points,
    after: House.Points
) => {
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
        .setColor('#2B2D31')
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
    before: House.Points,
    after: House.Points,
    author: User
) {
    const allDiff = House.ids
        .map((h) => before[h] - after[h])
        .map((d) => `${d > 0 ? 'Removed' : 'Added'} ${Math.abs(d)} points`);

    return new EmbedBuilder()
        .setColor('#2B2D31')
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

export const HouseInfoButton = (house: House.id, label = 'House') =>
    new ButtonBuilder()
        .setCustomId(`HOUSEINFO_${house}`)
        .setStyle(ButtonStyle.Primary)
        .setLabel(label);

function housePosition(
    [h, p]: readonly [House.id, number],
    index: number,
    all: (readonly [House.id, number])[]
) {
    return `\n\` ${toOrdinal(index + 1)} \` \`${padString(
        `${p} points`,
        all.map(([_, p]) => `${p} points`)
    )}\` <@&${House[h].roleId}>`;
}

export const LeaderboardEmbed = (client: Client) =>
    new EmbedBuilder()
        .setColor('#2B2D31')
        .setTitle('Leaderboard')
        .setDescription(
            client.store
                .toSorted()
                .reduce(
                    (acc, h, i, a) => acc + housePosition(h, i, a),
                    `Refreshed <t:${Math.round(Date.now() / 1000)}:R>\n`
                )
        );

export function createLeaderboardEmbed(store: HouseStore) {
    function createField([id, points]: [House.id, number], index: number) {
        let house = House[id];
        let name = `${toOrdinal(index + 1)} ${house.name} ${house.emoji}`;
        let value = `${points} points`;
        return { name, value };
    }

    return new EmbedBuilder()
        .setColor('#2B2D31')
        .setTitle(':trophy: Leaderboard')
        .setDescription(
            `-# Last updated <t:${Math.round(Date.now() / 1000)}:R>`
        )
        .addFields(store.toSorted().map(createField));
}

export function createLeaderboardButton(label = 'See leaderboard') {
    return new ButtonBuilder()
        .setCustomId('LEADERBOARD')
        .setLabel(label)
        .setStyle(ButtonStyle.Primary);
}

export function createHouseUpdateEmbed(
    house: House,
    before: number,
    after: number,
    author: User,
    store: HouseStore
) {
    let diff = after - before;
    let index = store.indexOf(house.id);
    let inFront = store.toSorted()[index + 1];
    let behind = store.toSorted()[index - 1];
    let inFrontStr = inFront
        ? `, ${after - inFront[1]} points ahead of ${House[inFront[0]].roleMention}`
        : '';
    let behindStr = behind
        ? `${inFront ? ' and ' : ', '}${behind[1] - after} points behind ${House[behind[0]].roleMention}`
        : '';

    let positionStr = `You are ${toOrdinal(
        index + 1
    )}${inFrontStr}${behindStr}`;

    const embed = new EmbedBuilder()
        .setColor('#2B2D31')
        .setAuthor({
            name: author.username,
            iconURL: author.displayAvatarURL(),
        })
        .setTitle(`Points ${diff < 0 ? 'lost' : 'gained'} ${house.emoji}`)
        .setDescription(`${house.roleMention} <t:${Math.round(Date.now() / 1000)}:>`)
        .addFields(
            {
                name: 'Before',
                value: before.toString(),
                inline: true,
            },
            {
                name: diff < 0 ? 'Lost' : 'Gained',
                value: diff.toString(),
                inline: true,
            },
            {
                name: 'Total',
                value: after.toString(),
                inline: true,
            },
            {
                name: 'Leaderboard',
                value: positionStr,
                inline: true,
            }
        );

    return embed;
}

export function createCompetitionUpdateEmbed() {
    // noop
}

export function createUpdateLeaderboardButton(label = 'Get updates') {
    return new ButtonBuilder()
        .setCustomId('UPDATELEADERBOARD')
        .setStyle(ButtonStyle.Primary)
        .setLabel(label);
}

export function createSeeAllChangesButton(url: string) {
    return new ButtonBuilder()
        .setURL(url)
        .setLabel('See all changes')
        .setStyle(ButtonStyle.Link);
}

export function createHouseChooseEmbed() {
    return new EmbedBuilder()
        .setColor('#2B2D31')
        .setTitle('Choose your house')
        .setDescription('You can only join a house once, choose wisely!')
        .addFields(
            House.ALL.map((house) => ({
                name: `${house.emoji} ${house.name}`,
                value: `<@&${house.roleId}>\n-# ${house.description}`,
            }))
        );
}
