import { JobType } from '../job';

export interface JobSender {
  send(job: {id: string, data: string, type: JobType}): Promise<void>;
}
