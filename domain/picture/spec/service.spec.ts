import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as pictureUtil from 'image-size';
import { PictureService } from '../service';
import { PictureStore } from '../store/store';
import { FileSystemPictureStore } from '../store/filesystem';
import { ThumbnailService } from '../thumbnail/service';
import { ImageThumbnailLibService } from '../thumbnail/service.image-thumbnail-lib';

describe("Picture", () => {

  const pictureStore: PictureStore = new FileSystemPictureStore(__dirname);
  const thumbnailService: ThumbnailService = new ImageThumbnailLibService();
  const service = new PictureService(pictureStore, thumbnailService);

  beforeEach(async () => {
    await service.save( 'smiley-1', Buffer.from('hello'));
  })

  afterEach(async () => {
    await pictureStore.delete('smiley-1');
  });

  describe("Save", () => {
    it('save picture',  async () => {
      const pictureBuffer = await pictureStore.get('smiley-1');
      const fileContent = pictureBuffer.toString();
      expect(fileContent).toEqual('hello');
    });

    //TODO Handle cases where pictureStore fails

  });

  describe('Generate thumbnail', () => {
    afterEach(async () => {
      await pictureStore.delete('fixture-200-200-thumbnail');
    });
    it('thumbnail name is picture name+thumbnail', async () => {
        await service.generateThumbnail('fixture-200-200');

        const thumbnailBuffer = await pictureStore.get('fixture-200-200-thumbnail')
        const dimensions = pictureUtil.imageSize(thumbnailBuffer);

        expect(dimensions.height).toEqual(100);
        expect(dimensions.width).toEqual(100);
    });
  });
})
