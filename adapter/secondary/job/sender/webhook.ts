import { JobType } from '../../../../domain/job/entity';
import { JobSender } from '../../../../domain/job/event/sender';

export class WebhookJobEventSender implements JobSender {
	constructor(private url: string) {
	}
	async send(job: { id: string; data: string; type: JobType }): Promise<void> {
		await fetch(this.url, { method: 'POST', body: JSON.stringify(job)});
	}

}
