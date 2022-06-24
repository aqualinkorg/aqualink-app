import sharp from 'sharp';

export const resize = async (imageBuffer: Buffer, size: number) => {
  return sharp(imageBuffer).resize({ width: size }).toBuffer();
};

export const getImageData = async (imageBuffer: Buffer) => {
  return sharp(imageBuffer).metadata();
};
