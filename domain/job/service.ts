import { UTCDateMini } from '@date-fns/utc';
import { v4 as uuidv4 } from 'uuid';
import { Job } from './job';
import { JobEventStore } from './event/store/store';
import { JobSender } from './sender/service';

export class JobService {

	constructor(private jobStore: JobEventStore, private jobSender: JobSender) {
	}
	async create(jobData: Pick<Job, 'type' | 'data'>) {
		const job = {
			...jobData,
			id: uuidv4()
		};
		await this.jobStore.create({
			entityId: job.id,
			status: 'created',
			data: job,
			createdAt: new UTCDateMini(),
		});
		await this.jobSender.send(job);
		return job;
	}

	async getJob(jobId: string): Promise<Omit<Job, 'data'>> {
		const events = await this.jobStore.getJobEvents(jobId);
		return {
			id: jobId,
			status: events.at(-1)!.status,
			lastChangeDate: events.at(-1)!.createdAt,
			type: events[0].data.type,
		};
	}

	async getAllJobs() {
		const events = await this.jobStore.getAll();
		const jobMap: Record<string, Omit<Job, 'data'>> = {};
		const jobOrder: string[] = [];
		events.forEach( (jobEvent) => {
			if (!jobMap[jobEvent.entityId]) {
				jobOrder.push(jobEvent.entityId);
				jobMap[jobEvent.entityId] = {
					id: jobEvent.entityId,
					type: jobEvent.data.type,
					status: jobEvent.status,
					lastChangeDate: jobEvent.createdAt
				};
			}
			jobMap[jobEvent.entityId].status = jobEvent.status;
			jobMap[jobEvent.entityId].lastChangeDate = jobEvent.createdAt;
		});
		return jobOrder.map((jobId) => jobMap[jobId]);
	}

	async execute(job:  Pick<Job, 'id' | 'type' | 'data'>, action: (j: Pick<Job, 'id' | 'type' | 'data'>) => Promise<void>) {
		try {
			await action(job);
		} catch (e) {
			await this.jobStore.create({ entityId: job.id, status: 'error', createdAt: new UTCDateMini(), data: e });
			return;
		}
		await this.jobStore.create({ entityId: job.id, status: 'success', createdAt: new UTCDateMini(), data: job });
	}
}
