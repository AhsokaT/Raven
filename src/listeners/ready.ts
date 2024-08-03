import { Events, Listener } from '@sapphire/framework';
import { Client } from '../client/Client.js';

export class Ready extends Listener<typeof Events.ClientReady> {
    run(ready: Client<true>) {
        console.debug(`${ready.user.tag} is online!`);
    }
}
