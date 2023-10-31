import { v4 as uuidv4 } from 'uuid';
import { Job } from './job';
import { JobEventStore } from './event/store/store';

export class JobService {

	constructor(private jobStore: JobEventStore) {
	}
	create(jobData: Pick<Job, 'type' | 'data'>) {
		const job = {
			...jobData,
			id: uuidv4()
		};
		this.jobStore.create({
			entityId: job.id,
			status: 'created',
			data: jobData.data
		});
		return job;
	}
}
