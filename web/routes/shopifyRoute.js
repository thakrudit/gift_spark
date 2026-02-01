import express from 'express';
import { createFreeGift, createGoalFreeGift, getFreeGift, getGoalFreeGift, removeFreeGift } from '../controllers/shopifyController.js';
const router = express.Router();

router.post('/create-free-gift', createFreeGift);
router.get("/get-free-gift", getFreeGift);
router.post('/remove-free-gift', removeFreeGift);
router.post('/create-gift-goal', createGoalFreeGift);
router.get('/get-goal-free-gift', getGoalFreeGift);

export default router;