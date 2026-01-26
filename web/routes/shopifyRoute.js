import express from 'express';
import { createFreeGift, getFreeGift } from '../controllers/shopifyController.js';
const router = express.Router();

router.post('/create-free-gift', createFreeGift);
router.get("/get-free-gift", getFreeGift)

export default router;