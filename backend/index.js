require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { connectDb, disconnectDb } = require("./src/db");
const { ensureTestUser } = require("./src/seed");

const authRoutes = require("./src/auth");
const profileRoutes = require("./src/profile");
const articleRoutes = require("./src/articles");
const followingRoutes = require("./src/following");

const app = express();

const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:4200",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:4200",
  "http://127.0.0.1:5173",
];

const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [];

const allowedOrigins = new Set([...defaultOrigins, ...envOrigins]);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", (req, res) =>
  res.send({ service: "ricebook-backend", status: "ok" })
);

authRoutes(app);
profileRoutes(app);
followingRoutes(app);
articleRoutes(app);

const port = process.env.PORT || 3000;
let server;

const startServer = async () => {
  await connectDb();
  await ensureTestUser();
  if (server && server.listening) {
    return server;
  }
  server = app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
  return server;
};

const stopServer = async () => {
  if (server && server.listening) {
    await new Promise((resolve) => server.close(resolve));
    server = undefined;
  }
  await disconnectDb();
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, stopServer };
