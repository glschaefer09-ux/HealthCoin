require("dotenv").config({ path: "../../.env" });
const express = require("express");
const path    = require("path");
const session = require("express-session");

const app  = express();
const PORT = process.env.HEALTH_SPACE_PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: process.env.JWT_SECRET || "healthcoin-dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 86400000 },
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",    require("./routes/auth"));
app.use("/api/feed",    require("./routes/feed"));
app.use("/api/journal", require("./routes/journal"));
app.use("/api/message", require("./routes/message"));

// Serve SPA shell for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Health Space running on http://localhost:${PORT}`));
