import { ButtonBuilder, EmbedBuilder, Snowflake } from 'discord.js';
import { Client } from '../client';
import { HouseID, HousePoints } from './House/HousePointManager';
export declare const pointChangeButton: (before: HousePoints, after: HousePoints) => ButtonBuilder | null;
export declare function pointChangeEmbed(house: HouseID, before: number, after: number): EmbedBuilder;
export declare function allPointChangeEmbed(before: HousePoints, after: HousePoints): EmbedBuilder;
export declare const UpdateLeaderboardButton: (label?: string) => ButtonBuilder;
export declare const UserInfoButton: (user: Snowflake, label?: string) => ButtonBuilder;
export declare const LeaderboardButton: (label?: string) => ButtonBuilder;
export declare const HouseInfoButton: (house: HouseID, label?: string) => ButtonBuilder;
export declare const RevokeBanButton: (user: Snowflake, label?: string) => ButtonBuilder;
export declare const BanButton: (user: Snowflake, label?: string) => ButtonBuilder;
export declare const LeaderboardEmbed: (client: Client<true>) => EmbedBuilder;
