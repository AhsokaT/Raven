import assert from 'assert/strict';
import pc from 'picocolors';
import { House } from '../util/enum.js';
import { DatabaseConnection } from './DatabaseConnection.js';

export class HouseStore extends Map<House.id, number> {
    async load() {
        await using connection = await DatabaseConnection.connect();

        for await (const [id, points] of connection.fetch())
            this.set(id, points);

        assert(House.ids.every((id) => this.has(id)), Error('Missing house points.'));

        console.log(`${pc.green('DATABASE')} Loaded ${pc.cyan(`${this.size} entries`)} into house store`);

        return this;
    }

    async patch(data: [id: House.id, points: number][]) {
        await using connection = await DatabaseConnection.connect();

        for await (const [id, points] of await connection.patch(data))
            this.set(id, points);
    }

    get(id: House.id): number {
        const holds = super.get(id);

        assert(typeof holds === 'number', Error('Missing house points.'));

        return holds;
    }

    set(id: House.id, points: number): this {
        return super.set(id, points);
    }

    toSorted() {
        return [...this.entries()].sort(([, a], [, b]) => b - a);
    }

    indexOf(id: House.id): number {
        return this.toSorted().findIndex(([name]) => name === id);
    }

    position(id: House.id): number {
        return this.indexOf(id) + 1;
    }

    copy() {
        return new Map(this);
    }

    delete(): boolean {
        throw Error('Cannot delete house points.');
    }

    static load() {
        return new HouseStore().load();
    }
}
