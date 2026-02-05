import express from "express";
import path from "path";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { functions, inngest } from "./config/inngest.js";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js";
import orderRoutes from "./routes/order.route.js";
import reviewRoutes from "./routes/review.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
// import paymentRoutes from "./routes/payment.route.js";

const app = express();
app.use(express.json({ limit: "10mb" })); // allows you to parse the body of the request
app.use(cookieParser());

// Active le middleware Clerk pour gérer automatiquement l’authentification des utilisateurs (sessions, tokens, sécurité) sur toutes les requêtes
app.use(clerkMiddleware());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true })); // credentials: permet l'envoie des requetes avec les cookies
app.use(
  "/api/inngest",
  serve({ client: inngest, functions, signingKey: ENV.INNGEST_SIGNING_KEY }),
);

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

app.get("/api", (req, res) => {
  res.send("Hello World");
});

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
