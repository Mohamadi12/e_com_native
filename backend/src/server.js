import express from "express"
import path from "path"
import { ENV } from "./config/env.js"

const app = express()

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json())

app.get("/api",(req,res) =>{
    res.send("Hello World")
})

// Mettre en production votre app
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(ENV.PORT, () => {
    console.log(`Server is running on port http://localhost:${ENV.PORT}`)
})