import { PictureStore } from './store';

export class PictureService {

  constructor(private pictureStore: PictureStore) {
  }
    save(name: string, content: Buffer) {
      return this.pictureStore.save(name, content);
    };
}
