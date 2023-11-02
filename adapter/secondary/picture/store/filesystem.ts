import { writeFile, readFile, rm } from 'node:fs/promises';

export class FileSystemPictureStore {

	constructor(private basePath: string) {
	}
	save(name: string, content: Buffer): Promise<void> {
		return writeFile(`${this.basePath}/${name}`, content);
	}
	get(name: string): Promise<Buffer> {
		return readFile(`${this.basePath}/${name}`);
	}

	delete(name: string): Promise<void> {
		return rm(`${this.basePath}/${name}`);
	}
}
