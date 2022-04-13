import multer from 'multer';
import cloudinary from 'cloudinary';
import expressAsyncHandler from "express-async-handler";
import express from 'express';
import { isAuth } from '../utils.js';

const uploadRouter = express.Router();

cloudinary.config({
  cloud_name: 'dxjprordi',
  api_key: '645649249743982',
  api_secret: 'ZrkD5hrVM1AkTJBrSp0yg_x-7EE',
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}.jpg`);
  },
});

uploadRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      console.log(req.body.image)
      let result = await cloudinary.uploader.upload_large(req.body.image, {
        public_id: `${Date.now()}`,
        resource_type: "auto", // jpeg, png
      });
      res.json({
        public_id: result.public_id,
        url: result.secure_url,
      });
    } catch (error) {
      console.log(error)
      res.json({error: error});
    }
  
  })
);
uploadRouter.post(
  "/removeimage",
  expressAsyncHandler(async (req, res) => {
    let image_id = req.body.public_id;

    cloudinary.uploader.destroy(image_id, (err, result) => {
      if (err) {
        return res.json({ success: false, err });
      } else {
        return res.json({ success: true, status: 'u don delete am'});
      }
    });
  })
);

const upload = multer({ storage });

// uploadRouter.post('/', isAuth, upload.single('image'), (req, res) => {
//   res.send(`/${req.file.path}`);
// });

export default uploadRouter;
