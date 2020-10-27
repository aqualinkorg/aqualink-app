import {
  createReadStream,
  createWriteStream,
  ReadStream,
  unlinkSync,
} from 'fs';
import MulterGoogleCloudStorage from 'multer-google-storage';
import sharp from 'sharp';
import mime from 'mime-types';

interface CallbackMessage {
  path: string;
  filename: string;
}

interface FileInfo {
  mimeType: string;
  fieldName: string;
  originalName: string;
}

export class CustomGoogleCloudStorage {
  private googleCloudStorage: MulterGoogleCloudStorage;
  private messageAcc: CallbackMessage;
  private originalFile = 'original';
  private thumbnailFile = 'thumbnail';
  private originalFileExt: string | false;
  private thumbnailFileExt: string | false;
  private fileInfo: FileInfo;
  private multerCallback: any;
  private request: any;
  private thumbnailType = 'image/jpeg';

  constructor(opts: any) {
    this.googleCloudStorage = new MulterGoogleCloudStorage(opts);
  }

  private callback() {
    return (err: any, message?: CallbackMessage) => {
      if (err) {
        this.multerCallback(err);
      } else if (message) {
        if (this.messageAcc) {
          unlinkSync(`${this.originalFile}.${this.originalFileExt}`);
          unlinkSync(`${this.thumbnailFile}.${this.thumbnailFileExt}`);
          this.multerCallback(null, [this.messageAcc, message]);
        } else {
          this.messageAcc = message;
          this.createThumbnail();
        }
      }
    };
  }

  private readFile(filename: string, cb: (img: ReadStream) => void) {
    const readStream = createReadStream(filename);
    readStream.on('open', () => cb(readStream));
  }

  private uploadImageToCloud(mimeType?: string) {
    return (img: ReadStream) => {
      const data: Partial<Express.Multer.File> = {
        fieldname: this.fileInfo.fieldName,
        mimetype: mimeType || this.fileInfo.mimeType,
        originalname: this.fileInfo.originalName,
        stream: img,
      };

      this.googleCloudStorage._handleFile(this.request, data, this.callback());
    };
  }

  private createThumbnail() {
    const fileIn = `${this.originalFile}.${this.originalFileExt}`;
    this.thumbnailFileExt = mime.extension(this.thumbnailType);
    const fileOut = `${this.thumbnailFile}.${this.thumbnailFileExt}`;

    const resizeStream = sharp().resize(600, null).jpeg({ quality: 70 });
    const readStream = createReadStream(fileIn);
    const outputStream = createWriteStream(fileOut);

    readStream.on('open', () => {
      readStream.pipe(resizeStream).pipe(outputStream);
    });

    outputStream.on('finish', () => {
      this.readFile(fileOut, this.uploadImageToCloud(this.thumbnailType));
    });
  }

  _handleFile(req: any, file: Express.Multer.File, cb: any) {
    this.fileInfo = {
      mimeType: file.mimetype,
      fieldName: file.fieldname,
      originalName: file.originalname,
    };
    this.request = req;
    this.multerCallback = cb;
    this.originalFileExt = mime.extension(this.fileInfo.mimeType);
    const fileDest = `${this.originalFile}.${this.originalFileExt}`;

    const outputStream = createWriteStream(fileDest);
    file.stream.pipe(outputStream);

    outputStream.on('finish', () => {
      this.readFile(fileDest, this.uploadImageToCloud());
    });
  }

  _removeFile(req: any, file: any, cb: any) {
    if (file['0']) {
      this.googleCloudStorage._removeFile(req, file['0'], cb);
    }

    if (file['1']) {
      this.googleCloudStorage._removeFile(req, file['1'], cb);
    }
  }
}
