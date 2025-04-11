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

    async *fetch(): AsyncGenerator<[House.id, number], void, void> {
        const cursor = this.mongo
            .db('Raven')
            .collection<House.Document>('Houses')
            .find();

        for await (const doc of cursor) yield [doc._id, doc.points];
    }

    static async connect() {
        return new DatabaseConnection(await this.mongo.connect());
    }

    static mongo: MongoClient;

    static {
        assert(
            process.env.MONGO_URL,
            'Missing MONGO_URL environment variable.'
        );

        this.mongo = new MongoClient(process.env.MONGO_URL)
            .on('connectionReady', () =>
                console.log(
                    pc.green('DATABASE'),
                    'Connection',
                    pc.yellow('ready')
                )
            )
            .on('connectionClosed', () =>
                console.log(
                    pc.green('DATABASE'),
                    'Connection',
                    pc.red('closed')
                )
            );
    }
}
