import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobService } from '../../../../domain/job/service';
import { PictureService } from '../../../../domain/picture/service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly pictureService: PictureService,
    private readonly jobService: JobService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('thumbnail/create')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    await this.pictureService.save(file.originalname, file.buffer);
    return this.jobService.create({
      type: 'thumbnail',
      data: { name: file.originalname },
    });
  }

  @Get('thumbnail/:sourcePictureName')
  async getThumbnail(@Param('sourcePictureName') sourcePictureName) {
    return this.pictureService.getThumbnail(sourcePictureName);
  }

  @Get('job/:id')
  async getJob(@Param('id') id: string) {
    return this.jobService.getJob(id);
  }

  @Get('job')
  async getAllJob() {
    return this.jobService.getAllJobs();
  }
}
