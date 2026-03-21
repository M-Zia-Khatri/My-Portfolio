import { Router } from "express"
import { requireAdmin } from "../middlewares/auth.middleware"
import {
  getAllPortfolioItems,
  getPortfolioItemById,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from "../controllers/portfolio.controller"

const portfolioRouter = Router()

// Public
portfolioRouter
  .get("/", getAllPortfolioItems)
  .get(":id", getPortfolioItemById)

// Admin only
portfolioRouter
  .use(requireAdmin)
  .post("/", createPortfolioItem)
  .patch("/:id", updatePortfolioItem)
  .delete("/:id", deletePortfolioItem)

export default portfolioRouter
