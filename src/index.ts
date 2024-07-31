import { ActivityType, GatewayIntentBits } from 'discord.js';
import { Client } from './client/client.js';

const client = new Client({
    presence: {
        status: 'idle',
        activities: [
            {
                type: ActivityType.Watching,
                name: 'Zuko looking for his honour',
            },
        ],
    },
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    baseUserDirectory: null,
});

client.login();
