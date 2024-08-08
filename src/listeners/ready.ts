import { Events, Listener } from '@sapphire/framework';
import pc from 'picocolors';
import { Client } from '../client/Client.js';

export class Ready extends Listener<typeof Events.ClientReady> {
    run(ready: Client<true>) {
        console.debug(`${pc.green('CLIENT')} Logged in as ${pc.cyan(ready.user.username)}`);
    }
}
