export interface PictureStore {
  save(name: string, content: Buffer): Promise<void>;
  get(name: string): Promise<Buffer>;
  delete(name: string): Promise<void>;
}
