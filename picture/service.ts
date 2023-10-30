import { PictureStore } from './store/store';
import { ThumbnailService } from './thumbnail/service';

export class PictureService {
	constructor(private pictureStore: PictureStore, private thumbnailService: ThumbnailService) {
	}
	save(name: string, content: Buffer) {
		return this.pictureStore.save(name, content);
	}

	async generateThumbnail(pictureName: string) {
		const imageData = await this.pictureStore.get(pictureName);
		const thumbnailData = await this.thumbnailService.generate(imageData, { width: 100, height: 100});
		await this.pictureStore.save(`${pictureName}-thumbnail`, thumbnailData);
	}
}
