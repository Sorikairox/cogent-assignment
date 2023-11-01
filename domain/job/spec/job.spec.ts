import { UTCDateMini } from '@date-fns/utc';
import { it, describe, expect, afterEach } from 'vitest';
import { InMemoryJobEventStore } from '../event/store/memory';
import { JobService } from '../service';
import { JobEventStore } from '../event/store/store';

describe('Job', () => {

	const jobStore: JobEventStore = new InMemoryJobEventStore();
	const jobService: JobService = new JobService(jobStore);

	describe('Creation', () => {

		afterEach(async () => {
			await jobStore.deleteAll();
		});

		it ('create id and return job', async () => {
			const savedjob = await jobService.create({ type: 'thumbnail', data: { name: 'coolpicture' } });

			expect(savedjob.id).toBeDefined();
		});

		it ('create job event', async () => {
			const savedJob = await jobService.create({ type: 'thumbnail', data: { name: 'coolpicture' } });
			const lastJobEvent = await jobStore.getLastJobEvent(savedJob.id);

			expect(lastJobEvent).toMatchObject({
				id: 0,
				entityId: savedJob.id,
				status: 'created',
			});
			expect(lastJobEvent.data.type).toEqual('thumbnail');
			expect(lastJobEvent.id).toBeDefined();
			expect(lastJobEvent.createdAt).toBeDefined();
		});

	});

	describe('Get one job status', async () => {
		it('get only relevant information', async () => {
			const savedJob = await jobService.create({ type: 'thumbnail', data: { name: 'coolpicture' } });
			await jobStore.create({ entityId: savedJob.id, status: 'inprogress', createdAt: new UTCDateMini(), data: null  });

			const jobStatus = await jobService.getJob(savedJob.id);

			expect(jobStatus).toMatchObject({
				id: savedJob.id,
				status: 'inprogress',
				type: 'thumbnail'
			});
			expect(jobStatus.lastChangeDate).toBeDefined();
		});
	});
});
