import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, '../../public/temp'));
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + '-' + uniqueSuffix);
  }
});

export const upload = multer({ storage: storage });
