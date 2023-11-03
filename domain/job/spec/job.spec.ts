import { UTCDateMini } from '@date-fns/utc';
import { it, describe, expect, afterEach } from 'vitest';
import { JobEvent } from '../event/entity';
import { InMemoryJobEventStore } from '../../../adapter/secondary/job/event/store/memory';
import { Job, JobStatus } from '../entity';
import { InMemoryJobSender } from '../../../adapter/secondary/job/sender/memory';
import { JobService } from '../service';
import { JobEventStore } from '../event/store';



describe('Job', () => {

	const jobSender: InMemoryJobSender = new InMemoryJobSender();
	const jobStore: JobEventStore = new InMemoryJobEventStore();
	const jobService: JobService = new JobService(jobStore, jobSender);

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

		it ('create id and return job', async () => {
			const job = await createJob();

			expect(jobSender.sentJobs[job.id]).toEqual(true);
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
			const secondJob = await createJob();
			await createJobEvent(secondJob.id, 'inprogress');
			const thirdJob = await createJob();
			await createJobEvent(firstJob.id, 'inprogress');
			await createJobEvent(secondJob.id, 'success');
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

	describe('Execute job', () => {

		it('run provided function', async () => {
			const job = await createJob();

			await jobService.execute(job, setJobDataExecutedToTrue);

			expect(job.data.executed).toEqual(true);
		});

		it('save status on success', async () => {
			const job = await createJob();

			await jobService.execute(job, setJobDataExecutedToTrue);
			const lastEventForJob = await jobStore.getLastJobEvent(job.id);
			expect(lastEventForJob).toMatchObject<Partial<JobEvent>>({
				entityId: job.id,
				status: 'success'
			});
		});

		it('save status on action throw', async () => {
			const job = await createJob();

			try {
				await jobService.execute(job, async (job) =>  {
					throw new Error(`${job.id} failed for some reason`);
				});
			} catch (e) { /* empty */ }

			const lastEventForJob = await jobStore.getLastJobEvent(job.id);

			expect(lastEventForJob).toMatchObject<Partial<JobEvent>>({
				entityId: job.id,
				status: 'error'
			});
		});

	});

	const setJobDataExecutedToTrue = async (job: Pick<Job, 'id' | 'type' | 'data'>) => {
		job.data.executed = true;
	};

	async function createJob() {
		return jobService.create({ type: 'thumbnail', data: { name: 'coolpicture' } });
	}

	async function createJobEvent(jobId: string, status: JobStatus) {
		await jobStore.create({ entityId: jobId, status, createdAt: new UTCDateMini(), data: null });
	}
});
