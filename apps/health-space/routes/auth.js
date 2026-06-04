const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");

const SECRET  = process.env.JWT_SECRET || "healthcoin-dev-secret";

// In-memory user store for hackathon demo — swap for MariaDB in prod
const users = [];

router.post("/register", async (req, res) => {
  const { username, email, password, role = "patient" } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: "Missing fields" });
  if (users.find(u => u.email === email)) return res.status(409).json({ error: "Email already registered" });

  const hash = await bcrypt.hash(password, 10);
  const user = { id: Date.now(), username, email, hash, role, wallet: null, tier: 1 };
  users.push(user);

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, username, role } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.hash)))
    return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

router.post("/connect-wallet", requireAuth, (req, res) => {
  const { address } = req.body;
  const user = users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "Not found" });
  user.wallet = address;
  res.json({ success: true });
});

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(auth.split(" ")[1], SECRET);
    req.userId = payload.id;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = router;
module.exports.requireAuth = requireAuth;
