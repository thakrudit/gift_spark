import express from 'express';
import { script, getScript } from '../controllers/indexController.js';
const router = express.Router();

router.post("/script", script)
router.get("/get-script", getScript)

export default router;