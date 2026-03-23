import { Router } from "express"
import { submitContact, getContacts, deleteContact } from "../controllers/contact.controller"
import { validateContact } from "../middlewares/contact.middleware"
import { requireAdmin } from "@/middlewares/auth.middleware"

const contactRouter = Router()

contactRouter.post("/", validateContact, submitContact)

contactRouter.use(requireAdmin).get("/", getContacts).delete("/:id", deleteContact)

export default contactRouter
