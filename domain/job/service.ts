import { UTCDateMini } from '@date-fns/utc';
import { v4 as uuidv4 } from 'uuid';
import { Job } from './job';
import { JobEventStore } from './event/store/store';

export class JobService {
	constructor(private jobStore: JobEventStore) {
	}
	async create(jobData: Pick<Job, 'type' | 'data'>) {
		const job = {
			...jobData,
			id: uuidv4()
		};
		this.jobStore.create({
			entityId: job.id,
			status: 'created',
			data: job,
			createdAt: new UTCDateMini(),
		});
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
}
