import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobEventStore } from '../../../../domain/job/event/store';
import { JobService } from '../../../../domain/job/service';
import { PictureService } from '../../../../domain/picture/service';
import {
  JobEventModel,
  TypeORMJobEventStore,
} from '../../../secondary/job/event/store/typeorm';
import { WebhookJobEventSender } from '../../../secondary/job/sender/webhook';
import { FileSystemPictureStore } from '../../../secondary/picture/store/filesystem';
import { ImageThumbnailLibService } from '../../../secondary/picture/thumbnail/service.image-thumbnail-lib';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [JobEventModel],
      synchronize: true,
      logging: false,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'JOB_EVENT_STORE',
      useClass: TypeORMJobEventStore,
    },
    {
      provide: JobService,
      useFactory: (eventStore: JobEventStore) => {
        return new JobService(
          eventStore,
          new WebhookJobEventSender(process.env.WEBHOOK_URL),
        );
      },
      inject: [{ token: 'JOB_EVENT_STORE', optional: false }],
    },
    {
      provide: PictureService,
      useFactory: () => {
        return new PictureService(
          new FileSystemPictureStore(process.env.PICTURE_STORE_PATH),
          new ImageThumbnailLibService(),
        );
      },
    },
  ],
})
export class AppModule {}
