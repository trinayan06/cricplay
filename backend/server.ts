import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import fs from "fs";
import { supabase } from "./config/supabase";

const JWT_SECRET = process.env.JWT_SECRET || "cricplay-super-secret-key-2026";
const ADMIN_EMAIL = "ipl2026@gmail.com";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("ipl2026", 10);
const SECRET_INVITE_CODE = "501503";

// Setup SQLite Database
const db = new Database("cricplay.db");
db.pragma("journal_mode = WAL");

// Initialize Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_verified INTEGER DEFAULT 0,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try {
  db.prepare("ALTER TABLE users ADD COLUMN created_at DATETIME").run();
  db.prepare("UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL").run();
} catch (e) {
  // Column might already exist
}

db.exec(`

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team1 TEXT NOT NULL,
    team2 TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    stadium TEXT NOT NULL,
    entry_fee INTEGER DEFAULT 20,
    status TEXT DEFAULT 'upcoming' -- upcoming, live, completed
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    team TEXT NOT NULL,
    role TEXT NOT NULL, -- BAT, BOWL, AR, WK
    credits REAL DEFAULT 8.5,
    FOREIGN KEY(match_id) REFERENCES matches(id)
  );

  CREATE TABLE IF NOT EXISTS user_teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    match_id INTEGER NOT NULL,
    captain_id INTEGER NOT NULL,
    vice_captain_id INTEGER NOT NULL,
    points REAL DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(match_id) REFERENCES matches(id)
  );

  CREATE TABLE IF NOT EXISTS user_team_players (
    team_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    FOREIGN KEY(team_id) REFERENCES user_teams(id),
    FOREIGN KEY(player_id) REFERENCES players(id),
    PRIMARY KEY(team_id, player_id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    match_id INTEGER NOT NULL,
    transaction_id TEXT,
    screenshot_url TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(match_id) REFERENCES matches(id)
  );

  CREATE TABLE IF NOT EXISTS player_scores (
    match_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    fours INTEGER DEFAULT 0,
    sixes INTEGER DEFAULT 0,
    wickets INTEGER DEFAULT 0,
    catches INTEGER DEFAULT 0,
    hattrick INTEGER DEFAULT 0,
    no_ball INTEGER DEFAULT 0,
    points REAL DEFAULT 0,
    PRIMARY KEY(match_id, player_id),
    FOREIGN KEY(match_id) REFERENCES matches(id),
    FOREIGN KEY(player_id) REFERENCES players(id)
  );
`);

try {
  db.prepare("ALTER TABLE player_scores ADD COLUMN fours INTEGER DEFAULT 0").run();
  db.prepare("ALTER TABLE player_scores ADD COLUMN sixes INTEGER DEFAULT 0").run();
  db.prepare("ALTER TABLE player_scores ADD COLUMN hattrick INTEGER DEFAULT 0").run();
  db.prepare("ALTER TABLE player_scores ADD COLUMN no_ball INTEGER DEFAULT 0").run();
} catch (e) {
  // Columns might already exist
}

db.exec(`

  CREATE TABLE IF NOT EXISTS teams (
    name TEXT PRIMARY KEY,
    logo_url TEXT
  );

  CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    match_id INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    real_amount INTEGER NOT NULL,
    upi_id TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, paid
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(match_id) REFERENCES matches(id),
    UNIQUE(user_id, match_id) 
  );
`);

// Insert default admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE email = ?").get(ADMIN_EMAIL);
if (!adminExists) {
  db.prepare("INSERT INTO users (name, phone, email, password, is_verified, is_admin, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)").run(
    "Admin", "0000000000", ADMIN_EMAIL, ADMIN_PASSWORD_HASH, 1, 1
  );
}

// Multer setup for uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(cors({
    origin: '*', // For production, replace with your actual frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json());
  app.use("/uploads", express.static(uploadDir));

  app.post("/api/users", async (req: any, res: any) => {
    try {
      const { name, email, phone } = req.body;
      console.log("Incoming data:", req.body);
      console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
      console.log("SUPABASE_KEY EXISTS:", !!process.env.SUPABASE_KEY);

      const { data, error } = await supabase
        .from('users')
        .insert([{ name, email, phone }]);

      if (error) {
        console.log("SUPABASE ERROR:", error);
        console.log("SUPABASE ERROR FULL:", JSON.stringify(error, null, 2));
        return res.status(500).json({ error: error.message });
      }

      return res.json({ success: true, data });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Server error" });
    }
  });

  app.post("/api/players", async (req: any, res: any) => {
    const { name, team, role, credits } = req.body;

    const { data, error } = await supabase
      .from("players")
      .insert([{ name, team, role, credits }])
      .select();

    if (error) return res.status(500).json(error);

    res.json(data);
  });

  app.post("/api/leaderboard", async (req: any, res: any) => {
    const { user_id, points, rank } = req.body;

    const { data, error } = await supabase
      .from("leaderboard")
      .upsert([{ user_id, points, rank }])
      .select();

    if (error) return res.status(500).json(error);

    res.json(data);
  });

  // --- Middleware ---
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (!req.user || !req.user.is_admin) return res.status(403).json({ error: "Forbidden" });
    next();
  };

  // --- Auth Routes ---
  app.post("/api/auth/signup", (req, res) => {
    const { name, phone, email, password } = req.body;
    try {
      const hash = bcrypt.hashSync(password, 10);
      const result = db.prepare("INSERT INTO users (name, phone, email, password, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)").run(name, phone, email, hash);
      const token = jwt.sign({ id: result.lastInsertRowid, email, is_admin: 0, is_verified: 0 }, JWT_SECRET);
      res.json({ token, user: { id: result.lastInsertRowid, name, email, is_verified: 0 } });
    } catch (err: any) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, is_admin: user.is_admin, is_verified: user.is_verified }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin, is_verified: user.is_verified } });
  });

  app.post("/api/auth/verify", authenticate, (req: any, res: any) => {
    const { code } = req.body;
    if (code === SECRET_INVITE_CODE) {
      db.prepare("UPDATE users SET is_verified = 1 WHERE id = ?").run(req.user.id);
      const token = jwt.sign({ ...req.user, is_verified: 1 }, JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.status(400).json({ error: "Invalid code" });
    }
  });

  app.get("/api/auth/me", authenticate, (req: any, res: any) => {
    const user = db.prepare("SELECT id, name, email, phone, is_verified, is_admin FROM users WHERE id = ?").get(req.user.id);
    res.json({ user });
  });

  app.get("/api/user/profile", authenticate, (req: any, res: any) => {
    const user = db.prepare("SELECT id, name, email, phone, is_verified, is_admin FROM users WHERE id = ?").get(req.user.id);
    const history = db.prepare(`
      SELECT m.id, m.team1, m.team2, m.date, m.status, ut.points 
      FROM user_teams ut
      JOIN matches m ON ut.match_id = m.id
      WHERE ut.user_id = ?
      ORDER BY m.date DESC, m.time DESC
    `).all(req.user.id);
    res.json({ user, history });
  });

  // --- User Routes ---
  app.get("/api/teams", authenticate, (req: any, res: any) => {
    const teams = db.prepare("SELECT * FROM teams").all();
    const teamMap = teams.reduce((acc: any, t: any) => {
      acc[t.name] = t.logo_url;
      return acc;
    }, {});
    res.json(teamMap);
  });

  app.get("/api/matches", authenticate, (req: any, res: any) => {
    const matches = db.prepare("SELECT * FROM matches ORDER BY date ASC, time ASC").all();
    res.json(matches);
  });

  app.get("/api/matches/:id", authenticate, (req: any, res: any) => {
    const match = db.prepare("SELECT * FROM matches WHERE id = ?").get(req.params.id);
    const players = db.prepare("SELECT * FROM players WHERE match_id = ?").all(req.params.id);
    res.json({ match, players });
  });

  app.post("/api/teams", authenticate, (req: any, res: any) => {
    const { match_id, player_ids, captain_id, vice_captain_id } = req.body;
    
    const match = db.prepare("SELECT * FROM matches WHERE id = ?").get(match_id) as any;
    if (!match) return res.status(404).json({ error: "Match not found" });
    if (match.status !== 'upcoming') return res.status(400).json({ error: "Match is not upcoming" });

    // Check if team creation is allowed (before 7:30 PM IST on match day)
    const matchDate = new Date(`${match.date}T19:30:00+05:30`);
    if (new Date() > matchDate) {
      return res.status(400).json({ error: "Team creation deadline (7:30 PM IST) has passed" });
    }

    const existingTeam = db.prepare("SELECT id FROM user_teams WHERE user_id = ? AND match_id = ?").get(req.user.id, match_id);
    
    db.transaction(() => {
      let teamId;
      if (existingTeam) {
        teamId = (existingTeam as any).id;
        db.prepare("UPDATE user_teams SET captain_id = ?, vice_captain_id = ? WHERE id = ?").run(captain_id, vice_captain_id, teamId);
        db.prepare("DELETE FROM user_team_players WHERE team_id = ?").run(teamId);
      } else {
        const result = db.prepare("INSERT INTO user_teams (user_id, match_id, captain_id, vice_captain_id) VALUES (?, ?, ?, ?)").run(req.user.id, match_id, captain_id, vice_captain_id);
        teamId = result.lastInsertRowid;
      }

      const insertPlayer = db.prepare("INSERT INTO user_team_players (team_id, player_id) VALUES (?, ?)");
      for (const pid of player_ids) {
        insertPlayer.run(teamId, pid);
      }
    })();

    res.json({ success: true });
  });

  app.get("/api/teams/:matchId", authenticate, (req: any, res: any) => {
    const team = db.prepare("SELECT * FROM user_teams WHERE user_id = ? AND match_id = ?").get(req.user.id, req.params.matchId) as any;
    if (!team) return res.json(null);
    const players = db.prepare("SELECT player_id FROM user_team_players WHERE team_id = ?").all(team.id).map((p: any) => p.player_id);
    res.json({ ...team, player_ids: players });
  });

  app.post("/api/payments", authenticate, upload.single("screenshot"), (req: any, res: any) => {
    const { match_id, transaction_id } = req.body;
    const screenshot_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    db.prepare("INSERT INTO payments (user_id, match_id, transaction_id, screenshot_url) VALUES (?, ?, ?, ?)").run(
      req.user.id, match_id, transaction_id, screenshot_url
    );
    res.json({ success: true });
  });

  app.get("/api/payments/:matchId", authenticate, (req: any, res: any) => {
    const payment = db.prepare("SELECT * FROM payments WHERE user_id = ? AND match_id = ? ORDER BY id DESC LIMIT 1").get(req.user.id, req.params.matchId);
    res.json(payment || null);
  });

  app.get("/api/leaderboard/:matchId", async (req: any, res: any) => {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*, users(name)")
      .order("points", { ascending: false });

    if (error) return res.status(500).json(error);

    const ranked = (data || []).map((item: any, index: number) => ({
      ...item,
      rank: index + 1
    }));

    res.json(ranked);
  });

  app.get("/api/user/withdrawal-status/:matchId", authenticate, (req: any, res: any) => {
    const withdrawal = db.prepare("SELECT status FROM withdrawal_requests WHERE user_id = ? AND match_id = ?").get(req.user.id, req.params.matchId) as any;
    res.json({ status: withdrawal?.status || null });
  });

  app.post("/api/withdrawals", async (req: any, res: any) => {
    const { user_id, upi_id, phone, amount } = req.body;

    const { data, error } = await supabase
      .from("withdrawals")
      .insert([{ user_id, upi_id, phone, amount }])
      .select();

    if (error) return res.status(500).json(error);

    res.json(data);
  });

  app.get("/api/admin/withdrawals", authenticate, isAdmin, (req: any, res: any) => {
    const requests = db.prepare(`
      SELECT wr.*, u.name as user_name, m.team1, m.team2
      FROM withdrawal_requests wr
      JOIN users u ON wr.user_id = u.id
      JOIN matches m ON wr.match_id = m.id
      ORDER BY wr.created_at DESC
    `).all();
    res.json(requests);
  });

  app.put("/api/admin/withdraw/:id", authenticate, isAdmin, (req: any, res: any) => {
    const { upi_id, phone, status } = req.body;
    db.prepare("UPDATE withdrawal_requests SET upi_id = ?, phone = ?, status = ? WHERE id = ?")
      .run(upi_id, phone, status, req.params.id);
    res.json({ success: true });
  });

  // --- YouTube Video API ---
  app.get("/api/videos", (req: any, res: any) => {
    const preMatch = db.prepare("SELECT value FROM settings WHERE key = 'pre_match_url'").get() as any;
    const highlight = db.prepare("SELECT value FROM settings WHERE key = 'highlights_url'").get() as any;
    res.json({ 
      preMatchUrl: preMatch?.value || null, 
      highlightUrl: highlight?.value || null 
    });
  });

  app.post("/api/videos", authenticate, isAdmin, (req: any, res: any) => {
    const { preMatchUrl, highlightUrl } = req.body;
    const stmt = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
    
    db.transaction(() => {
      stmt.run('pre_match_url', preMatchUrl);
      stmt.run('highlights_url', highlightUrl);
    })();
    
    res.json({ message: "Videos updated successfully", preMatchUrl, highlightUrl });
  });

  // --- Admin Routes ---
  app.post("/api/admin/teams", authenticate, isAdmin, upload.single("logo"), (req: any, res: any) => {
    const { name, logo_url } = req.body;
    let finalLogoUrl = logo_url;
    
    if (req.file) {
      finalLogoUrl = `/uploads/${req.file.filename}`;
    }
    
    db.prepare(`
      INSERT INTO teams (name, logo_url) VALUES (?, ?)
      ON CONFLICT(name) DO UPDATE SET logo_url = excluded.logo_url
    `).run(name, finalLogoUrl);
    
    res.json({ success: true, logo_url: finalLogoUrl });
  });

  app.delete("/api/admin/teams/:name", authenticate, isAdmin, (req: any, res: any) => {
    db.prepare("DELETE FROM teams WHERE name = ?").run(req.params.name);
    res.json({ success: true });
  });

  app.get("/api/admin/users", authenticate, isAdmin, (req: any, res: any) => {
    const users = db.prepare("SELECT id, name, email, phone, created_at FROM users WHERE is_admin = 0 ORDER BY created_at DESC").all();
    res.json(users);
  });

  app.put("/api/admin/users/:id", authenticate, isAdmin, (req: any, res: any) => {
    const { name, email, phone } = req.body;
    db.prepare("UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?").run(name, email, phone, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/users/:id", authenticate, isAdmin, (req: any, res: any) => {
    db.transaction(() => {
      db.prepare("DELETE FROM user_team_players WHERE team_id IN (SELECT id FROM user_teams WHERE user_id = ?)").run(req.params.id);
      db.prepare("DELETE FROM user_teams WHERE user_id = ?").run(req.params.id);
      db.prepare("DELETE FROM payments WHERE user_id = ?").run(req.params.id);
      db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    })();
    res.json({ success: true });
  });

  app.get("/api/admin/stats", authenticate, isAdmin, (req: any, res: any) => {
    const usersCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE is_admin = 0").get() as any;
    const matchesCount = db.prepare("SELECT COUNT(*) as count FROM matches").get() as any;
    const revenue = db.prepare(`
      SELECT COALESCE(SUM(m.entry_fee), 0) as total 
      FROM payments p 
      JOIN matches m ON p.match_id = m.id 
      WHERE p.status = 'approved'
    `).get() as any;
    res.json({ users: usersCount.count, matches: matchesCount.count, revenue: revenue.total });
  });

  app.post("/api/admin/matches", authenticate, isAdmin, (req: any, res: any) => {
    const { team1, team2, date, time, stadium } = req.body;
    const result = db.prepare("INSERT INTO matches (team1, team2, date, time, stadium) VALUES (?, ?, ?, ?, ?)").run(team1, team2, date, time, stadium);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/admin/matches/:id", authenticate, isAdmin, (req: any, res: any) => {
    const { team1, team2, date, time, stadium, status } = req.body;
    db.prepare("UPDATE matches SET team1=?, team2=?, date=?, time=?, stadium=?, status=? WHERE id=?").run(team1, team2, date, time, stadium, status, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/matches/:id", authenticate, isAdmin, (req: any, res: any) => {
    db.prepare("DELETE FROM matches WHERE id=?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/players", authenticate, isAdmin, (req: any, res: any) => {
    const { match_id, name, team, role, credits } = req.body;
    db.prepare("INSERT INTO players (match_id, name, team, role, credits) VALUES (?, ?, ?, ?, ?)").run(match_id, name, team, role, credits || 8.5);
    res.json({ success: true });
  });

  app.put("/api/admin/players/:id", authenticate, isAdmin, (req: any, res: any) => {
    const { name, team, role, credits } = req.body;
    db.prepare("UPDATE players SET name=?, team=?, role=?, credits=? WHERE id=?").run(name, team, role, credits, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/players/:id", authenticate, isAdmin, (req: any, res: any) => {
    db.transaction(() => {
      // Also delete any scores associated with this player
      db.prepare("DELETE FROM player_scores WHERE player_id = ?").run(req.params.id);
      db.prepare("DELETE FROM user_team_players WHERE player_id = ?").run(req.params.id);
      db.prepare("DELETE FROM players WHERE id = ?").run(req.params.id);
    })();
    res.json({ success: true });
  });

  app.get("/api/admin/payments", authenticate, isAdmin, (req: any, res: any) => {
    const payments = db.prepare(`
      SELECT p.*, u.name as user_name, m.team1, m.team2 
      FROM payments p 
      JOIN users u ON p.user_id = u.id 
      JOIN matches m ON p.match_id = m.id
      ORDER BY p.id DESC
    `).all();
    res.json(payments);
  });

  app.put("/api/admin/payments/:id", authenticate, isAdmin, (req: any, res: any) => {
    const { status } = req.body;
    db.prepare("UPDATE payments SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/scores", authenticate, isAdmin, (req: any, res: any) => {
    const { match_id, player_id, fours, sixes, wickets, catches, hattrick, no_ball } = req.body;
    
    // Formula: (fours * 3) + (sixes * 4) + (wickets * 4) + (catches * 3) + (hattrick * 8) + (noBall * 3)
    const points = (fours * 3) + (sixes * 4) + (wickets * 4) + (catches * 3) + (hattrick * 8) + (no_ball * 3);

    db.prepare(`
      INSERT INTO player_scores (match_id, player_id, fours, sixes, wickets, catches, hattrick, no_ball, points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(match_id, player_id) DO UPDATE SET
      fours=excluded.fours, sixes=excluded.sixes, wickets=excluded.wickets, catches=excluded.catches, 
      hattrick=excluded.hattrick, no_ball=excluded.no_ball, points=excluded.points
    `).run(match_id, player_id, fours, sixes, wickets, catches, hattrick, no_ball, points);

    // Update all user teams points for this match
    const teams = db.prepare("SELECT * FROM user_teams WHERE match_id = ?").all(match_id);
    
    for (const team of teams as any[]) {
      const players = db.prepare("SELECT player_id FROM user_team_players WHERE team_id = ?").all(team.id);
      let totalPoints = 0;
      
      for (const p of players as any[]) {
        const score = db.prepare("SELECT points FROM player_scores WHERE match_id = ? AND player_id = ?").get(match_id, p.player_id) as any;
        if (score) {
          let pPoints = score.points;
          if (p.player_id === team.captain_id) pPoints *= 2;
          else if (p.player_id === team.vice_captain_id) pPoints *= 1.5;
          totalPoints += pPoints;
        }
      }
      
      db.prepare("UPDATE user_teams SET points = ? WHERE id = ?").run(totalPoints, team.id);
    }

    res.json({ success: true });
  });

  app.get("/api/admin/scores/:matchId", authenticate, isAdmin, (req: any, res: any) => {
    const scores = db.prepare(`
      SELECT p.id, p.name, p.team, 
             COALESCE(ps.fours, 0) as fours, 
             COALESCE(ps.sixes, 0) as sixes, 
             COALESCE(ps.wickets, 0) as wickets, 
             COALESCE(ps.catches, 0) as catches,
             COALESCE(ps.hattrick, 0) as hattrick,
             COALESCE(ps.no_ball, 0) as no_ball,
             COALESCE(ps.points, 0) as points
      FROM players p
      LEFT JOIN player_scores ps ON p.id = ps.player_id AND ps.match_id = p.match_id
      WHERE p.match_id = ?
    `).all(req.params.matchId);
    res.json(scores);
  });

  app.put("/api/admin/leaderboard/:matchId/:userId", authenticate, isAdmin, (req: any, res: any) => {
    const { points } = req.body;
    db.prepare("UPDATE user_teams SET points = ? WHERE match_id = ? AND user_id = ?").run(points, req.params.matchId, req.params.userId);
    res.json({ success: true });
  });

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
