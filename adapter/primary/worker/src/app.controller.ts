import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { Job } from '../../../../domain/job/entity';
import { JobService } from '../../../../domain/job/service';
import { PictureService } from '../../../../domain/picture/service';

@Controller()
export class AppController {
  private readonly logger = new Logger('JobExecution');
  constructor(
    private readonly pictureService: PictureService,
    private readonly jobService: JobService,
  ) {}

  @HttpCode(200)
  @Post('job/execute')
  async executeJob(@Body() job: Job) {
    this.jobService
      .execute(job, async (executedJob) => {
        if (executedJob.type === 'thumbnail') {
          await this.pictureService.generateThumbnail(executedJob.data.name);
        } else {
          throw new Error('UnknownJobType');
        }
      })
      .catch((e) => {
        this.logger.error(e);
      });
    return 'ok';
  }
}
