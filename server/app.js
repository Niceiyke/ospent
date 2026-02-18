import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const JWT_SECRET = 'ospent-secret-key-123';

app.use(cors());
app.use(express.json());

// --- DATABASE SETUP ---
const dbPath = path.join(__dirname, 'db', 'ospent.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
    budget_limit REAL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
    category_id TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
  );
`);

// Simple migration for new columns
try { db.exec("ALTER TABLE categories ADD COLUMN is_capital INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE categories ADD COLUMN is_recurring INTEGER DEFAULT 0"); } catch (e) {}

// --- SEEDING ---
async function seed() {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get('testuser');
  if (!user) {
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const userResult = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('testuser', hashedPassword);
    const userId = userResult.lastInsertRowid;
    
    const categories = [
      { id: uuidv4(), name: 'Salary', color: '#10b981', type: 'income', budgetLimit: 0 },
      { id: uuidv4(), name: 'Freelance', color: '#34d399', type: 'income', budgetLimit: 0 },
      { id: uuidv4(), name: 'Rent', color: '#ef4444', type: 'expense', budgetLimit: 1000 },
      { id: uuidv4(), name: 'Food', color: '#f87171', type: 'expense', budgetLimit: 500 },
      { id: uuidv4(), name: 'Transport', color: '#fca5a5', type: 'expense', budgetLimit: 200 },
    ];

    const insertCat = db.prepare('INSERT INTO categories (id, user_id, name, color, type, budget_limit) VALUES (?, ?, ?, ?, ?, ?)');
    categories.forEach(c => insertCat.run(c.id, userId, c.name, c.color, c.type, c.budgetLimit));
    console.log('Seeded testuser successfully!');
  }
}
seed();

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- ROUTES ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username } });
});

app.get('/api/categories', authenticateToken, (req, res) => {
  const categories = db.prepare('SELECT id, name, color, type, budget_limit as budgetLimit, is_capital as isCapital, is_recurring as isRecurring FROM categories WHERE user_id = ?').all(req.user.id);
  res.json(categories.map(c => ({
    ...c,
    budgetLimit: c.budgetLimit || 0,
    isCapital: !!c.isCapital,
    isRecurring: !!c.isRecurring
  })));
});

app.post('/api/categories', authenticateToken, (req, res) => {
  const { id, name, color, type, budgetLimit, budget_limit, isCapital, isRecurring } = req.body;
  const limit = budget_limit !== undefined ? budget_limit : (budgetLimit !== undefined ? budgetLimit : 0);
  db.prepare('INSERT INTO categories (id, user_id, name, color, type, budget_limit, is_capital, is_recurring) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id || uuidv4(), req.user.id, name, color, type, limit, isCapital ? 1 : 0, isRecurring ? 1 : 0);
  res.sendStatus(201);
});

app.put('/api/categories/:id', authenticateToken, (req, res) => {
  const { name, color, budgetLimit, budget_limit, isCapital, isRecurring } = req.body;
  const limit = budget_limit !== undefined ? budget_limit : (budgetLimit !== undefined ? budgetLimit : 0);
  db.prepare('UPDATE categories SET name = ?, color = ?, budget_limit = ?, is_capital = ?, is_recurring = ? WHERE id = ? AND user_id = ?')
    .run(name, color, limit, isCapital ? 1 : 0, isRecurring ? 1 : 0, req.params.id, req.user.id);
  res.sendStatus(200);
});

app.delete('/api/categories/:id', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.sendStatus(200);
});

app.get('/api/transactions', authenticateToken, (req, res) => {
  const transactions = db.prepare(`
    SELECT t.*, c.name as category_name, c.color as category_color 
    FROM transactions t 
    JOIN categories c ON t.category_id = c.id 
    WHERE t.user_id = ?
    ORDER BY t.date DESC
  `).all(req.user.id);
  res.json(transactions);
});

app.post('/api/transactions', authenticateToken, (req, res) => {
  const { id, date, amount, type, category_id, description } = req.body;
  db.prepare('INSERT INTO transactions (id, user_id, date, amount, type, category_id, description) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id || uuidv4(), req.user.id, date, amount, type, category_id, description);
  res.sendStatus(201);
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
