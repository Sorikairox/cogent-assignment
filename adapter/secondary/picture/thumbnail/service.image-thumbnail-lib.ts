import lib = require('image-thumbnail');
import { ThumbnailService } from '../../../../domain/picture/thumbnail/service';

export class ImageThumbnailLibService implements ThumbnailService {
	generate(imageData: Buffer, { width, height }: { width: number; height: number }): Promise<Buffer> {
		return lib(imageData, { width, height, responseType: 'buffer' });
	}
}
