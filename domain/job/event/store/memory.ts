import { JobEvent } from '../event';
import { JobEventStore } from './store';

export class InMemoryJobEventStore implements JobEventStore {
	private nextId = 0;
	public readonly events: JobEvent[] = [];
	async create(event: JobEvent) {
		this.events.push({
			id: this.nextId,
			...event
		});
		this.nextId++;
	}

	async getLastJobEvent(jobId: string): Promise<JobEvent> {
		return this.events.find(j => j.entityId === jobId);
	}

}
