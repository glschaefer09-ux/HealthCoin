const router = require("express").Router();
const { requireAuth } = require("./auth");

// In-memory feed store for hackathon demo
const posts = [
  { id: 1, userId: 0, username: "HealthCoin", role: "admin", type: "announcement",
    content: "Welcome to Health Space! Share your wellness journey, find verified providers, and earn HLTH for healthy habits. 💊⚕",
    likes: 42, createdAt: new Date().toISOString() },
];

router.get("/", (req, res) => {
  const { category } = req.query;
  const filtered = category ? posts.filter(p => p.category === category) : posts;
  res.json(filtered.slice().reverse());
});

router.post("/", requireAuth, (req, res) => {
  const { content, category, type = "post" } = req.body;
  if (!content || content.length > 500) return res.status(400).json({ error: "Content required (max 500 chars)" });

  const post = {
    id: Date.now(),
    userId: req.userId,
    username: "You",
    role: req.userRole,
    type,
    content,
    category: category || null,
    likes: 0,
    createdAt: new Date().toISOString(),
  };
  posts.push(post);
  res.status(201).json(post);
});

router.post("/:id/like", requireAuth, (req, res) => {
  const post = posts.find(p => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: "Not found" });
  post.likes++;
  res.json({ likes: post.likes });
});

module.exports = router;
