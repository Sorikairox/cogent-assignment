import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { Job } from '../../../../domain/job/entity';
import { JobService } from '../../../../domain/job/service';
import { PictureService } from '../../../../domain/picture/service';

@Controller()
export class AppController {
  constructor(
    private readonly pictureService: PictureService,
    private readonly jobService: JobService,
  ) {}

  @HttpCode(200)
  @Post('job/execute')
  async executeJob(@Body() job: Job) {
    this.jobService.execute(job, async (executedJob) => {
      if (executedJob.type === 'thumbnail') {
        await this.pictureService.generateThumbnail(executedJob.data.name);
      }
      throw new Error('UnknownJobType');
    });
    return 'ok';
  }
}
