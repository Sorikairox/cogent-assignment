import { Job } from '../job';
import { JobSender } from './service';

export class InMemoryJobSender implements JobSender {
	public sentJobs: Record<string, boolean> = {};

	async send(job: Job): Promise<void> {
		this.sentJobs[job.id] = true;
	}
}
