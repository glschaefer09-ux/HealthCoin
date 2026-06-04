const router = require("express").Router();
const { requireAuth } = require("./auth");

const journals = [];

router.get("/", requireAuth, (req, res) => {
  res.json(journals.filter(j => j.userId === req.userId).reverse());
});

router.post("/", requireAuth, (req, res) => {
  const { title, body, mood, tags } = req.body;
  if (!title || !body) return res.status(400).json({ error: "Title and body required" });

  const entry = {
    id: Date.now(),
    userId: req.userId,
    title,
    body,
    mood: mood || "neutral",
    tags: tags || [],
    streak: calcStreak(req.userId),
    createdAt: new Date().toISOString(),
  };
  journals.push(entry);
  res.status(201).json(entry);
});

function calcStreak(userId) {
  const userEntries = journals
    .filter(j => j.userId === userId)
    .map(j => new Date(j.createdAt).toDateString());
  const unique = [...new Set(userEntries)];
  let streak = 1;
  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (unique.includes(d.toDateString())) streak++;
    else break;
  }
  return streak;
}

module.exports = router;
