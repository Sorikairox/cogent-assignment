import { UTCDateMini } from '@date-fns/utc';
import { it, describe, expect, afterEach } from 'vitest';
import { InMemoryJobEventStore } from '../event/store/memory';
import { JobStatus } from '../job';
import { JobService } from '../service';
import { JobEventStore } from '../event/store/store';



describe('Job', () => {

	const jobStore: JobEventStore = new InMemoryJobEventStore();
	const jobService: JobService = new JobService(jobStore);
	afterEach(async () => {
		await jobStore.deleteAll();
	});
	describe('Creation', () => {

		it ('create id and return job', async () => {
			const job = await createJob();

			expect(job.id).toBeDefined();
		});

		it ('create job event', async () => {
			const job = await createJob();

			const lastJobEvent = await jobStore.getLastJobEvent(job.id);

			expect(lastJobEvent).toMatchObject({
				id: 0,
				entityId: job.id,
				status: 'created',
			});
			expect(lastJobEvent.data.type).toEqual('thumbnail');
			expect(lastJobEvent.id).toBeDefined();
			expect(lastJobEvent.createdAt).toBeDefined();
		});

	});

	describe('Get one job status', async () => {
		it('get relevant information', async () => {
			const job = await createJob();
			await createJobEvent(job.id, 'inprogress');

			const jobStatus = await jobService.getJob(job.id);

			expect(jobStatus).toMatchObject({
				id: job.id,
				status: 'inprogress',
				type: 'thumbnail'
			});
			expect(jobStatus.lastChangeDate).toBeDefined();
		});
	});

	describe('Get all job status', () => {
		it('get relevant information', async () => {
			const firstJob = await createJob();
			await createJobEvent(firstJob.id, 'inprogress');
			const secondJob = await createJob();
			await createJobEvent(secondJob.id, 'inprogress');
			await createJobEvent(secondJob.id, 'success');
			const thirdJob = await createJob();
			await createJobEvent(thirdJob.id, 'inprogress');
			await createJobEvent(thirdJob.id, 'error');

			const allJobStatus = await jobService.getAllJobs();

			expect(allJobStatus[0]).toMatchObject(
				{
					id: firstJob.id,
					status: 'inprogress',
					type: 'thumbnail'
				});
			expect(allJobStatus[1]).toMatchObject(
				{
					id: secondJob.id,
					status: 'success',
					type: 'thumbnail'
				});
			expect(allJobStatus[2]).toMatchObject(
				{
					id: thirdJob.id,
					status: 'error',
					type: 'thumbnail'
				});
		});
	});

	async function createJob() {
		return jobService.create({ type: 'thumbnail', data: { name: 'coolpicture' } });
	}

	async function createJobEvent(jobId: string, status: JobStatus) {
		await jobStore.create({ entityId: jobId, status, createdAt: new UTCDateMini(), data: null });
	}
});
