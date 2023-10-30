export interface ThumbnailService {
  generate(buffer: Buffer, { width, height }: { width: number, height: number}): Promise<Buffer>;
}
