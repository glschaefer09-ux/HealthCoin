const router = require("express").Router();
const { requireAuth } = require("./auth");

const messages = [];

router.get("/", requireAuth, (req, res) => {
  const thread = messages.filter(
    m => m.fromId === req.userId || m.toId === req.userId
  ).reverse();
  res.json(thread);
});

router.post("/", requireAuth, (req, res) => {
  const { toId, body } = req.body;
  if (!toId || !body) return res.status(400).json({ error: "toId and body required" });

  const msg = { id: Date.now(), fromId: req.userId, toId: Number(toId), body, createdAt: new Date().toISOString() };
  messages.push(msg);
  res.status(201).json(msg);
});

module.exports = router;
