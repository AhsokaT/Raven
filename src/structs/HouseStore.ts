import assert from 'assert/strict';
import { House } from '../util/enum.js';
import { DatabaseConnection } from './DatabaseConnection.js';
import { HousePointCache } from './HousePointCache.js';

export class HouseStore extends HousePointCache {
    async load() {
        await using connection = await DatabaseConnection.connect();

        const fetched = await connection.fetch();

        for (const [id, points] of fetched)
            this.set(id, points);

        assert(House.ids.every(id => this.has(id)), Error('Missing house points.'));
    }

    async patch(points: [id: House.id, points: number][]) {
        await using connection = await DatabaseConnection.connect();

        const patched = await connection.patch(points);

        for (const [id, points] of patched)
            this.set(id, points);
    }
}
