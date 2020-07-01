export type Extent = [number, number, number, number];

function pointToPixel(
  lat: number, long: number, boundingBox: Extent, height: number, width: number
) {
  lat3 = lat < 0 ? lat + 180 : lat
  long3 = long < 0 ? long + 360 : long
}

const tiff = await GeoTIFF.fromUrl(MMMFileUrl);
console.log("Number of images (pyramids):", await tiff.getImageCount());
const image = await tiff.getImage();

const boundingBox = image.getBoundingBox();
const width = image.getWidth();
const height = image.getHeight();

const x = 
