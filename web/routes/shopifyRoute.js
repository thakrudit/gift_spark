import express from 'express';
import { createFreeGift } from '../controllers/shopifyController.js';
const router = express.Router();

router.post('/create-free-gift', createFreeGift);

export default router;