import { Events, Listener } from '@sapphire/framework';
import pc from 'picocolors';
import { Client } from '../client/Client.js';

export class Ready extends Listener<typeof Events.ClientReady> {
    run(ready: Client<true>) {
        console.log(
            pc.green('CLIENT'),
            pc.cyan(ready.user.username),
            'ready in',
            process.uptime(),
            'seconds'
        );
    }
}
