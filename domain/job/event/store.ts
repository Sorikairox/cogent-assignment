import { JobEvent } from './entity';

export interface JobEventStore {
  create(event: Omit<JobEvent, 'id'>): Promise<void>;
  getLastJobEvent(jobId: string): Promise<JobEvent>;
  getJobEvents(jobId: string): Promise<JobEvent[]>;
  getAll(): Promise<JobEvent[]>;
  deleteAll(): Promise<void>
}
