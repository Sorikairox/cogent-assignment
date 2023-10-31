import { it, describe, expect } from 'vitest';
import { InMemoryJobEventStore } from '../event/store/memory';
import { JobService } from '../service';
import { JobEventStore } from '../event/store/store';

describe('Job', () => {

	const jobStore: JobEventStore = new InMemoryJobEventStore();
	const jobService: JobService = new JobService(jobStore);

	describe('Creation', () => {

		it ('create id and return job', async () => {
			const savedjob = await jobService.create({ type: 'thumbnail', data: { name: 'coolpicture' } });

			expect(savedjob.id).toBeDefined();
		});

		it ('create job event', async () => {
			const savedJob = await jobService.create({ type: 'thumbnail', data: { name: 'coolpicture' } });
			const lastJobEvent = await jobStore.getLastJobEvent(savedJob.id);

			expect(lastJobEvent).toMatchObject({
				entityId: savedJob.id,
				status: 'created',
			});
			expect(lastJobEvent.id).toBeDefined();
		});

	});
});
