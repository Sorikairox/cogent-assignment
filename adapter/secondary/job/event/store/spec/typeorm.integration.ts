import 'reflect-metadata';
import { UTCDateMini } from '@date-fns/utc';
import { DataSource } from 'typeorm';
import { createDatabase, dropDatabase } from 'typeorm-extension';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { v4 as uuidv4 } from 'uuid';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { JobEvent } from '../../../../../../domain/job/event/entity';
import { JobEventModel, TypeORMJobEventStore } from '../typeorm';

const dbOptions: PostgresConnectionOptions = {
	type: 'postgres',
	host: 'localhost',
	port: 5432,
	username: 'postgres',
	password: 'example',
	database: 'postgres' + uuidv4(),
	entities: [JobEventModel],
	synchronize: true,
	logging: false,
};


describe('Job Event Store TypeORM', () => {
	const jobEventStore = new TypeORMJobEventStore();
	beforeAll(async () => {
		await createDatabase({
			options: dbOptions
		});
		const AppDataSource = new DataSource(dbOptions);
		await AppDataSource.initialize();
		await AppDataSource.synchronize(true);
	});

	afterAll(() => {
		dropDatabase({
			options: dbOptions
		});
	});

	describe('create', () => {
		it('store data in db', async () => {
			await jobEventStore.create({ entityId: 'cool-entity', createdAt: new UTCDateMini() ,status: 'created', data: { name: 'cool-image' } });
			const jobEventsInDb = await jobEventStore.getJobEvents('cool-entity');

			expect(jobEventsInDb.length).toEqual(1);
			expect(jobEventsInDb[0]).toMatchObject<Partial<JobEvent>>({
				id: 1,
				entityId: 'cool-entity',
				status: 'created',
				data: {
					name: 'cool-image'
				}
			});
		});
	});
});
