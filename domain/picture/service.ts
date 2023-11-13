import { PictureStore } from './store';
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
		const thumbnailPictureName = this.generateThumbnailName(pictureName);
		await this.pictureStore.save(`${thumbnailPictureName}`, thumbnailData);
	}

	async getThumbnail(pictureName: string) {
		return this.pictureStore.get(`${pictureName}-thumbnail`);
	}

	private generateThumbnailName(pictureName: string) {
		const [name, extension] = pictureName.split('.');
		if (extension)
			return `${name}-thumbnail.${extension}`;
		return `${pictureName}-thumbnail`;
	}
}
