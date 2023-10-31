export type JobType = 'thumbnail';

export type JobStatus = 'created' | 'inprogress' | 'success' | 'error';

export class Job {
	id: string;
	type: JobType;
	status: JobStatus;
	data: unknown;
}
