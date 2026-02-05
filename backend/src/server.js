import express from "express"
import path from "path"
import { clerkMiddleware } from '@clerk/express'

import { ENV } from "./config/env.js"
import { connectDB } from "./config/db.js";

const app = express()

// Active le middleware Clerk pour gérer automatiquement l’authentification des utilisateurs (sessions, tokens, sécurité) sur toutes les requêtes
app.use(clerkMiddleware())



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

const startServer = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log(`Server listening on port ${ENV.PORT}`);
  });
};

startServer();