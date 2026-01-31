import express from 'express';
import { createFreeGift, getFreeGift, removeFreeGift } from '../controllers/shopifyController.js';
const router = express.Router();

router.post('/create-free-gift', createFreeGift);
router.get("/get-free-gift", getFreeGift);
router.post('/remove-free-gift', removeFreeGift);

export default router;