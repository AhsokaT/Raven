import assert from 'assert/strict';
import { MongoClient } from 'mongodb';
import { House } from '../util/enum.js';
import { HousePointCache } from './HousePointCache.js';

export class DatabaseConnection implements AsyncDisposable {
    private constructor(readonly mongo: MongoClient) {}

    async [Symbol.asyncDispose]() {
        await this.mongo.close();
    }

    async patch(data: [id: House.id, points: number][]) {
        const operations = data.map(([id, points]) => ({
            updateOne: { filter: { _id: id }, update: { $set: { points } } },
        }));

        const result = await this.mongo
            .db('Raven')
            .collection<House.Document>('Houses')
            .bulkWrite(operations);

        if (!result.ok)
            console.warn(
                `[DATABASE] => Bulk operation did not execute correctly.`
            );

        return this.fetch();
    }

    async fetch() {
        const houses = await this.mongo
            .db('Raven')
            .collection<House.Document>('Houses')
            .find()
            .toArray();

        return new HousePointCache(houses.map((house) => [house._id, house.points]));
    }

    static async connect(url = process.env.MONGO_URL) {
        assert.ok(url, 'Missing url argument.');
        return new DatabaseConnection(await MongoClient.connect(url));
    }
}
