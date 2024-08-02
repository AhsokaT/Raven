import assert from 'assert/strict';
import { MongoClient } from 'mongodb';
import { House } from '../util/enum.js';

export class DatabaseConnection implements AsyncDisposable {
    private constructor(readonly mongo: MongoClient) {}

    async [Symbol.asyncDispose]() {
        await this.mongo.close();
        console.log('[DATABASE] => Connection closed.');
    }

    async patch(data: [id: House.id, points: number][]) {
        console.log('[DATABASE] => Patching house points:', data);
        if (data.length === 0) return this.fetch();

        const dbOperation = ([id, points]: [id: House.id, points: number]) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { points } },
            },
        });

        const result = await this.mongo
            .db('Raven')
            .collection<House.Document>('Houses')
            .bulkWrite(data.map(dbOperation));

        if (!result.ok)
            console.warn(
                `[DATABASE] => Bulk operation did not execute correctly.`
            );

        return this.fetch();
    }

    fetch(): AsyncGenerator<readonly [House.id, number], void, void> {
        return this.mongo
            .db('Raven')
            .collection<House.Document>('Houses')
            .find()
            .map((house) => [house._id, house.points] as const)
            [Symbol.asyncIterator]();
    }

    static async connect(url = process.env.MONGO_URL) {
        assert.ok(url, 'Missing url argument.');
        return new DatabaseConnection(await MongoClient.connect(url));
    }
}
