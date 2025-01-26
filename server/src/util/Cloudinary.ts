import { v2 as cloudinary, v2 } from 'cloudinary';
import config from '../config/config';
import fs from 'fs';
import Logger from './Logger';

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto'
    });

    fs.unlinkSync(localFilePath);
    return uploadResult;
  } catch (err) {
    Logger.error(err);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (fileUrl: string, fileType: 'image' | 'video') => {
  try {
    const publicId = fileUrl.split('upload')[1].split('/').slice(2).join('/').split('.')[0];

    await v2.api.delete_resources([`${publicId}`], {
      type: 'upload',
      resource_type: fileType
    });
  } catch (error) {
    Logger.error(error);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
