export type JobType = 'thumbnail';

export type JobStatus = 'created' | 'inprogress' | 'success' | 'error';

export interface Job {
	id: string;
	type: JobType;
	status: JobStatus;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any;
	lastChangeDate: Date | string;
}
