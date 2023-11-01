import { JobStatus } from '../job';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JobEventData = any;

export interface JobEvent {
	id: number;
	entityId: string;
	status: JobStatus;
	data: JobEventData;
	createdAt: Date | string;
}
