import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as pictureUtil from 'image-size';
import { PictureService } from '../service';
import { PictureStore } from '../store';
import { FileSystemPictureStore } from '../../../adapter/secondary/picture/store/filesystem';
import { ThumbnailService } from '../thumbnail/service';
import { ImageThumbnailLibService } from '../../../adapter/secondary/picture/thumbnail/service.image-thumbnail-lib';

describe('Picture', () => {

	const pictureStore: PictureStore = new FileSystemPictureStore(__dirname);
	const thumbnailService: ThumbnailService = new ImageThumbnailLibService();
	const service = new PictureService(pictureStore, thumbnailService);

	beforeEach(async () => {
		await service.save( 'smiley-1', Buffer.from('hello'));
	});

	afterEach(async () => {
		await pictureStore.delete('smiley-1');
	});

	describe('Save', () => {

		it('save picture',  async () => {
			const pictureBuffer = await pictureStore.get('smiley-1');
			const fileContent = pictureBuffer.toString();
			expect(fileContent).toEqual('hello');
		});

		//TODO Handle cases where pictureStore cannot save

	});

	describe('Generate thumbnail', () => {

		afterEach(async () => {
			pictureStore.delete('fixture-200-200-thumbnail'); 
			pictureStore.delete('fixture-200-200-thumbnail.png');
		});

		it.each(
			[
				{ pictureName: 'fixture-200-200', expectedThumbnailName: 'fixture-200-200-thumbnail' },
				{ pictureName: 'fixture-200-200.png', expectedThumbnailName: 'fixture-200-200-thumbnail.png' },
			]
		)('create $expectedThumbnailName from $pictureName', async ({ pictureName, expectedThumbnailName }: { pictureName: string, expectedThumbnailName: string }) => {
			await service.generateThumbnail(pictureName);

			const thumbnailBuffer = await pictureStore.get(expectedThumbnailName);
			const dimensions = pictureUtil.imageSize(thumbnailBuffer);

			expect(dimensions.height).toEqual(100);
			expect(dimensions.width).toEqual(100);
		  });
	});

	describe('Get thumbnail', () => {

		it('works if exist', async () => {
			const thumbnailBuffer = await service.getThumbnail('fixture');

			const fileContent = thumbnailBuffer.toString();
			expect(fileContent).toEqual('hello\n');
		});

	});
});
