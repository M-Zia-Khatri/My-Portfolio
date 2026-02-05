import { Router } from "express";

const router = Router();

router.get("/test", (req, res) => {
  res.json({ message: "API working" });
});

export default router;
