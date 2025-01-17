import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, '../../public/temp'));
  },
  filename: function (_req, file, cb) {
    cb(null, file.originalname);
  }
});

export const upload = multer({ storage: storage });
