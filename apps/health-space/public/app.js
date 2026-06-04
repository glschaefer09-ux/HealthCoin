// Health Space — Single-Page App JS

let currentUser = JSON.parse(localStorage.getItem("hs_user") || "null");
let token       = localStorage.getItem("hs_token") || null;
let isRegister  = false;

// ── HIPAA ──────────────────────────────────────────────────────────────────────
function dismissHipaa() {
  document.getElementById("hipaa-banner").style.display = "none";
  sessionStorage.setItem("hipaa_dismissed", "1");
}
if (sessionStorage.getItem("hipaa_dismissed")) dismissHipaa();

// ── Navigation ─────────────────────────────────────────────────────────────────
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    renderPage(link.dataset.page);
  });
});

function renderPage(page) {
  const main = document.getElementById("main-content");
  const pages = {
    feed:       renderFeed,
    journal:    renderJournal,
    remedies:   renderRemedies,
    providers:  renderProviders,
    messages:   renderMessages,
    ambassador: renderAmbassador,
    profile:    renderProfile,
  };
  (pages[page] || renderFeed)(main);
}

// ── Feed ───────────────────────────────────────────────────────────────────────
async function renderFeed(main) {
  main.innerHTML = `
    <h2 style="margin-bottom:20px">Community Feed</h2>
    ${currentUser ? `
    <div class="compose-box">
      <textarea id="compose-text" rows="3" placeholder="Share your wellness journey…"></textarea>
      <div class="compose-actions">
        <button class="btn-primary" onclick="submitPost()">Post</button>
      </div>
    </div>` : `<div class="card" style="text-align:center;padding:32px">
      <p style="color:var(--muted);margin-bottom:16px">Sign in to share with the community</p>
      <button class="btn-primary" onclick="openAuthModal()">Sign In / Register</button>
    </div>`}
    <div id="feed-list"><p style="color:var(--muted)">Loading feed…</p></div>
  `;
  const posts = await api("GET", "/api/feed");
  const list  = document.getElementById("feed-list");
  if (!posts || !posts.length) { list.innerHTML = `<p style="color:var(--muted)">No posts yet. Be the first!</p>`; return; }
  list.innerHTML = posts.map(p => `
    <div class="card">
      <div class="card-header">
        <div class="avatar">${p.username[0].toUpperCase()}</div>
        <div>
          <span class="username">${p.username}</span>
          <span class="role-badge ${p.role === "provider" ? "provider-badge" : ""}">
            ${p.role === "provider" ? "✓ Provider" : "Patient"}
          </span>
        </div>
        <span class="timestamp">${timeAgo(p.createdAt)}</span>
      </div>
      <p class="post-content">${escHtml(p.content)}</p>
      <div class="post-actions">
        <button class="action-btn" onclick="likePost(${p.id}, this)">❤ ${p.likes}</button>
      </div>
    </div>
  `).join("");
}

async function submitPost() {
  const content = document.getElementById("compose-text").value.trim();
  if (!content) return;
  await api("POST", "/api/feed", { content });
  renderFeed(document.getElementById("main-content"));
}

async function likePost(id, btn) {
  const res = await api("POST", `/api/feed/${id}/like`);
  if (res) btn.textContent = `❤ ${res.likes}`;
}

// ── Journal ────────────────────────────────────────────────────────────────────
async function renderJournal(main) {
  main.innerHTML = `
    <h2 style="margin-bottom:4px">Wellness Journal</h2>
    <p style="color:var(--muted);margin-bottom:24px">Log your health goals and daily habits. A 30-day streak earns 100 HLTH.</p>
    ${currentUser ? `
    <div class="card">
      <input id="j-title" placeholder="Entry title…" />
      <textarea id="j-body" rows="4" placeholder="How are you feeling today? Goals met?"></textarea>
      <select id="j-mood">
        <option value="great">😄 Great</option>
        <option value="good" selected>🙂 Good</option>
        <option value="neutral">😐 Neutral</option>
        <option value="low">😔 Low</option>
      </select>
      <button class="btn-primary" onclick="submitJournal()">Save Entry</button>
    </div>` : requireSignIn()}
    <div id="journal-list"></div>
  `;
  if (!currentUser) return;
  const entries = await api("GET", "/api/journal");
  const list    = document.getElementById("journal-list");
  if (!entries || !entries.length) { list.innerHTML = `<p style="color:var(--muted)">No entries yet. Start your journey!</p>`; return; }
  list.innerHTML = entries.map(e => `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <strong>${escHtml(e.title)}</strong>
        <span class="streak-badge">🔥 ${e.streak}-day streak</span>
      </div>
      <p style="color:var(--muted);font-size:14px">${escHtml(e.body)}</p>
      <div style="margin-top:8px;font-size:12px;color:var(--muted)">${timeAgo(e.createdAt)} • Mood: ${e.mood}</div>
    </div>
  `).join("");
}

async function submitJournal() {
  const title = document.getElementById("j-title").value.trim();
  const body  = document.getElementById("j-body").value.trim();
  const mood  = document.getElementById("j-mood").value;
  if (!title || !body) return;
  await api("POST", "/api/journal", { title, body, mood });
  renderJournal(document.getElementById("main-content"));
}

// ── Home Remedies ──────────────────────────────────────────────────────────────
function renderRemedies(main) {
  const remedies = [
    { title: "Ginger Tea for Nausea",        tags: ["digestion", "natural"], body: "Steep 1 inch fresh ginger in hot water for 10 min. Add honey. Sip slowly." },
    { title: "Honey & Turmeric Sleep Aid",   tags: ["sleep", "anti-inflammatory"], body: "Mix 1 tsp turmeric + 1 tsp honey in warm milk. Drink 30 min before bed." },
    { title: "Salt Water Gargle",            tags: ["throat", "cold"], body: "Dissolve ½ tsp salt in 8oz warm water. Gargle 30 seconds, 3x daily." },
    { title: "Peppermint for Headaches",     tags: ["pain", "natural"], body: "Dilute peppermint oil in carrier oil. Apply to temples. Avoid eyes." },
    { title: "Oatmeal Bath for Skin Relief", tags: ["skin", "itching"], body: "Blend 1 cup plain oatmeal to fine powder. Add to warm (not hot) bath." },
  ];
  main.innerHTML = `
    <h2 style="margin-bottom:4px">Home Remedies</h2>
    <p style="color:var(--muted);margin-bottom:24px">Natural wellness tips shared by the community. Always consult your doctor before trying new remedies.</p>
    <div class="card" style="border-color:#78350f;background:#1a1200;margin-bottom:24px">
      <strong style="color:#fcd34d">⚠ Disclaimer</strong>
      <p style="font-size:13px;color:#fcd34d;margin-top:6px">These are community-shared tips, not medical advice. HealthCoin does not verify efficacy. Always consult a licensed healthcare provider.</p>
    </div>
    ${remedies.map(r => `
    <div class="remedy-card">
      <strong style="display:block;margin-bottom:8px">${r.title}</strong>
      ${r.tags.map(t => `<span class="remedy-tag">${t}</span>`).join("")}
      <p style="margin-top:10px;font-size:14px;color:var(--muted)">${r.body}</p>
    </div>
    `).join("")}
  `;
}

// ── Providers ─────────────────────────────────────────────────────────────────
function renderProviders(main) {
  const providers = [
    { name: "Green Valley Family Medicine", type: "Primary Care", verified: true,  accepts: "HLTH", city: "Chicago, IL" },
    { name: "Calm Mind Counseling",         type: "Mental Health", verified: true, accepts: "HLTH", city: "Austin, TX" },
    { name: "GreenLeaf Pharmacy",           type: "Pharmacy",     verified: true,  accepts: "HLTH", city: "Denver, CO" },
    { name: "PeakFit Gym",                  type: "Fitness",      verified: false, accepts: "HLTH", city: "Miami, FL" },
  ];
  main.innerHTML = `
    <h2 style="margin-bottom:4px">Find a Provider</h2>
    <p style="color:var(--muted);margin-bottom:24px">Verified providers have staked 10,000 HLTH and accept HLTH payments.</p>
    <input placeholder="Search providers…" style="margin-bottom:20px" oninput="filterProviders(this.value)" id="provider-search"/>
    <div id="provider-list">
    ${providers.map(p => `
    <div class="card provider-item" data-name="${p.name.toLowerCase()}" data-type="${p.type.toLowerCase()}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <strong>${p.name}</strong>
          ${p.verified ? `<span class="role-badge provider-badge" style="margin-left:8px">✓ Verified</span>` : ""}
          <div style="color:var(--muted);font-size:13px;margin-top:4px">${p.type} • ${p.city}</div>
        </div>
        <span style="font-size:12px;color:var(--success)">Accepts HLTH ✓</span>
      </div>
    </div>`).join("")}
    </div>
    <div style="text-align:center;margin-top:24px">
      <a href="http://localhost:3001/provider" target="_blank" class="btn-outline">Register Your Practice →</a>
    </div>
  `;
}

function filterProviders(q) {
  document.querySelectorAll(".provider-item").forEach(el => {
    const match = el.dataset.name.includes(q.toLowerCase()) || el.dataset.type.includes(q.toLowerCase());
    el.style.display = match ? "" : "none";
  });
}

// ── Messages ──────────────────────────────────────────────────────────────────
async function renderMessages(main) {
  main.innerHTML = `
    <h2 style="margin-bottom:20px">Messages</h2>
    ${currentUser ? `
    <div class="card">
      <input id="msg-to" placeholder="Recipient user ID" type="number" />
      <textarea id="msg-body" rows="3" placeholder="Write a message…"></textarea>
      <button class="btn-primary" onclick="sendMessage()">Send</button>
    </div>
    <div id="msg-list"><p style="color:var(--muted)">Loading…</p></div>
    ` : requireSignIn()}
  `;
  if (!currentUser) return;
  const msgs = await api("GET", "/api/message");
  const list = document.getElementById("msg-list");
  list.innerHTML = !msgs || !msgs.length
    ? `<p style="color:var(--muted)">No messages yet.</p>`
    : msgs.map(m => `
    <div class="card" style="${m.fromId === currentUser.id ? "border-color:var(--accent)" : ""}">
      <div style="font-size:12px;color:var(--muted);margin-bottom:6px">
        ${m.fromId === currentUser.id ? "You → " + m.toId : "From " + m.fromId} • ${timeAgo(m.createdAt)}
      </div>
      <p>${escHtml(m.body)}</p>
    </div>`).join("");
}

async function sendMessage() {
  const toId = document.getElementById("msg-to").value;
  const body = document.getElementById("msg-body").value.trim();
  if (!toId || !body) return;
  await api("POST", "/api/message", { toId, body });
  renderMessages(document.getElementById("main-content"));
}

// ── Ambassador ────────────────────────────────────────────────────────────────
function renderAmbassador(main) {
  const tiers = [
    { icon: "🌱", name: "Patient Advocate",   desc: "Refer 5 patients who complete onboarding. Earn 50 HLTH bonus." },
    { icon: "💪", name: "Wellness Champion",  desc: "30-day journal streak + 10 referrals. Earn 200 HLTH + profile badge." },
    { icon: "🤝", name: "Community Leader",   desc: "50 referrals + 1 provider onboarded. Earn 500 HLTH + featured profile." },
    { icon: "🗺️",  name: "Regional Director", desc: "5 providers onboarded in your region. Earn 2,000 HLTH + revenue share." },
    { icon: "🏆", name: "National Ambassador", desc: "Top 10 ambassador nationally. Revenue share + advisory role." },
  ];
  main.innerHTML = `
    <h2 style="margin-bottom:4px">Ambassador Program</h2>
    <p style="color:var(--muted);margin-bottom:24px">Grow the HealthCoin community and earn HLTH at every tier.</p>
    ${tiers.map((t, i) => `
    <div class="tier-card">
      <div class="tier-icon">${t.icon}</div>
      <div>
        <div class="tier-name">Tier ${i+1}: ${t.name}</div>
        <div class="tier-desc">${t.desc}</div>
      </div>
    </div>`).join("")}
    <div class="card" style="margin-top:24px;text-align:center">
      <p style="color:var(--muted);margin-bottom:16px">Share your referral link to start climbing tiers</p>
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:monospace;font-size:13px">
        https://healthcoin.app/join?ref=${currentUser ? currentUser.id : "YOURCODE"}
      </div>
    </div>
  `;
}

// ── Profile ───────────────────────────────────────────────────────────────────
function renderProfile(main) {
  if (!currentUser) { main.innerHTML = requireSignIn(); return; }
  main.innerHTML = `
    <h2 style="margin-bottom:24px">Your Profile</h2>
    <div class="card" style="display:flex;align-items:center;gap:20px;margin-bottom:24px">
      <div class="avatar" style="width:64px;height:64px;font-size:24px">${currentUser.username[0].toUpperCase()}</div>
      <div>
        <div style="font-weight:800;font-size:20px">${currentUser.username}</div>
        <div style="color:var(--muted)">${currentUser.role}</div>
      </div>
    </div>
    <div class="card">
      <h3 style="margin-bottom:16px;font-weight:700">Connect Solana Wallet</h3>
      <input id="wallet-addr" placeholder="Paste your wallet address (Phantom, Backpack…)" />
      <button class="btn-primary" onclick="connectWallet()">Connect</button>
    </div>
    <div class="card" style="margin-top:16px">
      <h3 style="margin-bottom:12px;font-weight:700">Wellness Rewards</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        ${[["Checkups", "0"], ["Prescriptions", "0"], ["Journal Streak", "0 days"], ["Referrals", "0"]].map(([l,v]) => `
        <div style="text-align:center">
          <div style="font-size:22px;font-weight:800;color:var(--accent)">${v}</div>
          <div style="font-size:12px;color:var(--muted)">${l}</div>
        </div>`).join("")}
      </div>
    </div>
    <div style="margin-top:24px;text-align:center">
      <button class="btn-outline" onclick="logout()">Sign Out</button>
    </div>
  `;
}

async function connectWallet() {
  const address = document.getElementById("wallet-addr").value.trim();
  if (!address) return;
  await api("POST", "/api/auth/connect-wallet", { address });
  alert("Wallet connected!");
}

function logout() {
  currentUser = null; token = null;
  localStorage.removeItem("hs_user"); localStorage.removeItem("hs_token");
  renderFeed(document.getElementById("main-content"));
}

// ── Auth Modal ─────────────────────────────────────────────────────────────────
function openAuthModal() { document.getElementById("auth-modal").style.display = "flex"; }
function closeAuthModal() { document.getElementById("auth-modal").style.display = "none"; }

document.getElementById("auth-toggle").addEventListener("click", e => {
  e.preventDefault();
  isRegister = !isRegister;
  document.getElementById("auth-title").textContent = isRegister ? "Register" : "Sign In";
  document.getElementById("auth-toggle").textContent = isRegister ? "Already have an account? Sign in" : "Don't have an account? Register";
  document.getElementById("register-fields").style.display = isRegister ? "" : "none";
  document.getElementById("register-role").style.display   = isRegister ? "" : "none";
});

document.getElementById("auth-form").addEventListener("submit", async e => {
  e.preventDefault();
  const email    = document.getElementById("auth-email").value;
  const password = document.getElementById("auth-password").value;
  const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
  const body     = isRegister
    ? { email, password, username: document.getElementById("auth-username").value, role: document.getElementById("auth-role").value }
    : { email, password };
  const res = await api("POST", endpoint, body, true);
  if (res && res.token) {
    token = res.token; currentUser = res.user;
    localStorage.setItem("hs_token", token);
    localStorage.setItem("hs_user", JSON.stringify(currentUser));
    closeAuthModal();
    renderFeed(document.getElementById("main-content"));
  }
});

// ── Helpers ────────────────────────────────────────────────────────────────────
async function api(method, url, body, showErrors = false) {
  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      if (res.status === 401 && !showErrors) openAuthModal();
      const err = await res.json().catch(() => ({}));
      if (showErrors) alert(err.error || "Something went wrong");
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

function escHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function requireSignIn() {
  return `<div class="card" style="text-align:center;padding:32px">
    <p style="color:var(--muted);margin-bottom:16px">Sign in to access this feature</p>
    <button class="btn-primary" onclick="openAuthModal()">Sign In / Register</button>
  </div>`;
}

// ── Boot ───────────────────────────────────────────────────────────────────────
renderFeed(document.getElementById("main-content"));
