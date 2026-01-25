import express from 'express';
const router = express.Router();

router.post('/create-free-gift', createFreeGift);

export default router;