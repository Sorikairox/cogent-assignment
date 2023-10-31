import { JobStatus } from '../job';

export class JobEvent {
	id: number;
	entityId: string;
	status: JobStatus;
	data: unknown;
}
