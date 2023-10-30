import { PictureStore } from './store/store';

export class PictureService {
	constructor(private pictureStore: PictureStore) {
	}
	save(name: string, content: Buffer) {
		return this.pictureStore.save(name, content);
	}

	generateThumbnail(pictureName: string) {
		throw new Error('Method not implemented.');
	}
}
