import { writeFile, readFile, rm } from 'node:fs/promises'

export class FileSystemPictureStore {
  save(name: string, content: Buffer): Promise<void> {
    return writeFile(`./${name}`, content);
  };
  get(name: string): Promise<Buffer> {
    return readFile(`./${name}`);
  };

  delete(name: string): Promise<void> {
    return rm(`./${name}`);
  }
}
