import { JobEvent } from '../event';
import { JobEventStore } from './store';

export class InMemoryJobEventStore implements JobEventStore {
	private nextId = 0;
	public  events: JobEvent[] = [];

	async create(event: JobEvent) {
		this.events.push({
			...event,
			id: this.nextId,
		});
		this.nextId++;
	}

	async getJobEvents(jobId: string): Promise<JobEvent[]> {
		return this.events.filter(j => j.entityId === jobId);
	}

	async getLastJobEvent(jobId: string): Promise<JobEvent> {
		const lastEvent =  this.events.findLast(j => j.entityId === jobId);
		if (!lastEvent)
			throw Error('NoEventForJob');
		return lastEvent;
	}

	async deleteAll() {
		this.events = [];
		this.nextId = 0;
	}

}
