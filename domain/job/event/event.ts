import { JobStatus } from '../job';

export class JobEvent {
	id: number;
	entityId: string;
	status: JobStatus;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any;
	createdAt: Date | string;
}
