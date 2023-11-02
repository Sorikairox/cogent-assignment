import { UTCDateMini } from '@date-fns/utc';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { JobStatus } from '../../../../../domain/job/entity';
import { JobEvent, JobEventData } from '../../../../../domain/job/event/entity';
import { JobEventStore } from '../../../../../domain/job/event/store';

@Entity()
export class JobEventModel extends BaseEntity {
	@PrimaryGeneratedColumn()
		id!: number;

	@Column('timestamp')
		createdAt!: Date;

	@Column('json')
		data!: JobEventData;

	@Column('text')
		entityId!: string;

	@Column('text')
		status!: JobStatus;
}

export class TypeORMJobEventStore implements JobEventStore {
	async create(event: Omit<JobEvent, 'id'>): Promise<void> {
		const eventInstance = new JobEventModel();
		eventInstance.data = event.data;
		eventInstance.status = event.status;
		eventInstance.entityId = event.entityId;
		eventInstance.createdAt = new UTCDateMini(event.createdAt);
		await eventInstance.save();
	}

	async deleteAll(): Promise<void> {
		await JobEventModel.delete({});
	}

	async getAll(): Promise<JobEvent[]> {
		return JobEventModel.find();
	}

	getJobEvents(jobId: string): Promise<JobEvent[]> {
		return JobEventModel.find({ where: { entityId: jobId} });
	}

	getLastJobEvent(jobId: string): Promise<JobEvent> {
		return JobEventModel.findOne({ where: { entityId: jobId}, order: { id: -1 } }) as Promise<JobEvent>;
	}

}
