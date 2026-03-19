import express from "express";
import cors from "cors";
import "./lib/redis.ts";
import routes from "./routes/index.ts";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Server running" });
});

export default app;
