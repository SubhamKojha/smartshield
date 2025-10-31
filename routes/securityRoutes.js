import express from "express";
import { toggleSecurity, getSecurityStatus } from "../controllers/securityController.js";

const router = express.Router();

router.get("/", getSecurityStatus);
router.post("/toggle", toggleSecurity);

export default router;
