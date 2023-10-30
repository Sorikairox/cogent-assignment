import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PictureService } from './service';
import { PictureStore } from './store/store';
import { FileSystemPictureStore } from './store/filesystem';

describe("Picture", () => {

  const pictureStore = new FileSystemPictureStore();
  const service = new PictureService(pictureStore);

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
})
