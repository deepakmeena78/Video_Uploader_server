import express from 'express';
import { getVideos, uploadVideo } from '../controller/Fileupload.controller.js';

const router = express.Router();

router.post('/upload', uploadVideo);

router.get('/all', getVideos);

export default router;
