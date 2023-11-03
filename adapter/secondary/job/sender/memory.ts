import { Job } from '../../../../domain/job/entity';
import { JobSender } from '../../../../domain/job/sender';

export class InMemoryJobSender implements JobSender {
	public sentJobs: Record<string, boolean> = {};

	async send(job: Job): Promise<void> {
		this.sentJobs[job.id] = true;
	}
}
