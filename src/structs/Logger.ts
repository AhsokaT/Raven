import { LogLevel, Logger as SapphireLogger } from '@sapphire/framework';
import pc from 'picocolors';

export class Logger extends SapphireLogger {
    constructor(level = LogLevel.Info) {
        super(level);
    }

    write(level: LogLevel, ...values: readonly unknown[]): void {
        if (!this.has(level)) return;
        const method = Logger.levels.get(level);
        if (typeof method === 'string')
            console[method](pc.green(method.toUpperCase()), ...values);
    }
}
