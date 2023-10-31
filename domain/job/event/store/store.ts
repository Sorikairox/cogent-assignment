import { JobEvent } from '../event';

export interface JobEventStore {
  create(event: Omit<JobEvent, 'id'>): Promise<void>;
  getLastJobEvent(jobId: string): Promise<JobEvent>;
}
