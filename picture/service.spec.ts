import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PictureService } from './service';
import { PictureStore } from './store/store';
import { FileSystemPictureStore } from './store/filesystem';

describe("Picture", () => {

  let pictureStore!: PictureStore;
  pictureStore = new FileSystemPictureStore();

  beforeEach(async () => {
    const service = new PictureService(pictureStore);
    await service.save( 'smiley-1', Buffer.from('hello'));
  })

  afterEach(async () => {
    await pictureStore.delete('smiley-1');
  });

  describe("Save", () => {
    it('store picture data',  async () => {
      const pictureBuffer = await pictureStore.get('smiley-1');

      expect(pictureBuffer.toString()).toEqual('hello');
    });

    //TODO Handle cases where pictureStore fails

  });
})
