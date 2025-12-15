import sharp from 'sharp';

export const resize = async (imageBuffer: Buffer, size: number) =>
  sharp(imageBuffer).resize({ width: size }).toBuffer();

export const getImageData = async (imageBuffer: Buffer) =>
  sharp(imageBuffer).metadata();
