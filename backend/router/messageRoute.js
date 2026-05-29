import express from 'express';
import { sendMessage } from '../controller/messageContorller.js';

const router = express.Router();

router.post("/send" , sendMessage)

export default router;