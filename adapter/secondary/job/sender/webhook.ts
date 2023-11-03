import { JobType } from '../../../../domain/job/entity';
import { JobSender } from '../../../../domain/job/sender';

export class WebhookJobEventSender implements JobSender {
	constructor(private url: string) {
	}
	async send(job: { id: string; data: string; type: JobType }): Promise<void> {
		await fetch(`${this.url}/job/execute`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(job)
			});
	}

}
