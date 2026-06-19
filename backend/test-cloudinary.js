require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.uploader.upload('C:/Users/Lenovo/Pictures/DSC_9347.JPG',
{ folder: 'portfolio/projects' },
  (error, result) => {
    if (error) console.log('UPLOAD ERROR:', error);
    else console.log('UPLOAD SUCCESS:', result.secure_url);
  }
);