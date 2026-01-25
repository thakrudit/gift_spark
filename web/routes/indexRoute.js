import express from 'express';
import { script } from '../controllers/indexController';
const router = express.Router();

router.post("/script", script)

export default router;