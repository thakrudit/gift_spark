import express from 'express';
import { script } from '../controllers/indexController.js';
const router = express.Router();

router.post("/script", script)

export default router;