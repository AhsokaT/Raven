import {
    SapphireClient,
    SapphireClientOptions,
    StoreRegistryKey,
} from '@sapphire/framework';
import { ClientOptions } from 'discord.js';
import { opendir } from 'fs/promises';
import { basename, extname, join } from 'path';
import { HouseStore } from '../structs/HouseStore.js';
import { isClass, isSubclassOf } from '../util/util.js';

export class Client<
    Ready extends boolean = boolean
> extends SapphireClient<Ready> {
    readonly store: HouseStore;
    readonly irohQuotes = [
        `Sometimes life is like this dark tunnel. You can't always see the light at the end of the tunnel, but if you just keep moving... you will come to a better place.`,
        `Pride is not the opposite of shame, but its source. True humility is the only antidote to shame.`,
        `When you're in your darkest place, you give yourself hope and that's inner strength.`,
        `Life happens wherever you are, whether you make it or not.`,
        `Sometimes the best way to solve your own problems is to help someone else.`,
        `Protection and power are overrated. I think you are very wise to choose happiness and love.`,
        `Sometimes the best way to solve your own problems is to help someone else.`,
        `It is important to draw wisdom from many different places. If you take it from only one place, it becomes rigid and stale. Understanding others, the other elements and the other nations will help you become whole.`,
    ];

    constructor(options: ClientOptions & SapphireClientOptions) {
        super(options);

        this.store = new HouseStore();
        this.stores
            .get('interaction-handlers')
            .registerPath(join(process.cwd(), 'dist', 'handlers'));
    }

    async *walk(path: string): AsyncGenerator<string> {
        try {
            const dir = await opendir(path);

            for await (const dirent of dir) {
                const entry = join(dir.path, dirent.name);

                if (dirent.isDirectory()) yield* this.walk(entry);
                else if (dirent.isFile()) yield entry;
            }
        } catch {}
    }

    async loadPieces(name: StoreRegistryKey) {
        const defaultPath = join(process.cwd(), 'dist', name);
        const store = this.stores.get(name);
        const paths = store.paths.size > 0 ? store.paths : [defaultPath];

        for (const path of paths) {
            for await (const file of this.walk(path)) {
                const resolved = `../${basename(path)}/${basename(file)}`;
                const module = await import(resolved);
                const name = basename(file, extname(file));

                for (const piece of this.parse(module, store.Constructor)) {
                    // @ts-expect-error
                    store.loadPiece({ name, piece });
                }
            }
        }
    }

    *parse<T extends abstract new (...args: any[]) => any>(
        module: unknown,
        ctor: T
    ): Generator<T> {
        if (isClass(module) && isSubclassOf(module, ctor)) yield module;

        if (typeof module !== 'object' || module === null) return;

        for (const i of Object.values(module))
            if (isClass(i) && isSubclassOf(i, ctor)) yield i;
    }

    async login(token?: string) {
        await this.store.load();

        for (const store of this.stores.values())
            await this.loadPieces(store.name);

        return super.login(token);
    }
}

declare module 'discord.js' {
    interface Client {
        readonly store: HouseStore;
        readonly irohQuotes: string[];
        walk(path: string): AsyncGenerator<string>;
        loadPieces(name: StoreRegistryKey): Promise<void>;
        parse<T extends abstract new (...args: any[]) => any>(
            module: unknown,
            ctor: T
        ): Generator<T>;
    }
}
