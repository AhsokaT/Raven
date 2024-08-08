import assert from 'assert/strict';
import { MongoClient } from 'mongodb';
import pc from 'picocolors';
import { House } from '../util/enum.js';

export class DatabaseConnection implements AsyncDisposable {
    private constructor(readonly mongo: MongoClient) {}

    async [Symbol.asyncDispose]() {
        await this.mongo.close();
    }

    async patch(data: [id: House.id, points: number][]) {
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
                `${pc.red(
                    'DATABASE'
                )} Bulk operation did not execute correctly.`
            );

        return this.fetch();
    }

    fetch(): AsyncGenerator<[House.id, number], void, void> {
        return this.mongo
            .db('Raven')
            .collection<House.Document>('Houses')
            .find()
            .map((house) => [house._id, house.points] as [House.id, number])
            [Symbol.asyncIterator]();
    }

    static async connect(url = process.env.MONGO_URL) {
        assert.ok(url, 'Missing url argument.');

        const client = new MongoClient(url)
            .on('connectionReady', () =>
                console.log(`${pc.green('DATABASE')} Connection ready`)
            )
            .on('connectionClosed', () =>
                console.log(`${pc.green('DATABASE')} Connection closed`)
            );

        return new DatabaseConnection(await client.connect());
    }
}
