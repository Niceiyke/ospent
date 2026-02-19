import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod';

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

const dbPath = path.join(__dirname, 'db', 'ospent.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    monthly_budget REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
    budget_limit REAL DEFAULT 0,
    budget_interval TEXT DEFAULT 'monthly',
    is_capital INTEGER DEFAULT 0,
    is_recurring INTEGER DEFAULT 0,
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

try { db.exec("ALTER TABLE users ADD COLUMN monthly_budget REAL DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE categories ADD COLUMN is_capital INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE categories ADD COLUMN is_recurring INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE categories ADD COLUMN budget_interval TEXT DEFAULT 'monthly'"); } catch (e) {}

async function seed() {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get('testuser');
  if (!user) {
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const userResult = db.prepare('INSERT INTO users (username, password, monthly_budget) VALUES (?, ?, ?)')
      .run('testuser', hashedPassword, 500000);
    const userId = userResult.lastInsertRowid;
    
    const categories = [
      { id: uuidv4(), name: 'Salary', color: '#10b981', type: 'income', budgetLimit: 0 },
      { id: uuidv4(), name: 'Freelance', color: '#34d399', type: 'income', budgetLimit: 0 },
      { id: uuidv4(), name: 'Rent', color: '#ef4444', type: 'expense', budgetLimit: 1000 },
      { id: uuidv4(), name: 'Food', color: '#f87171', type: 'expense', budgetLimit: 500 },
      { id: uuidv4(), name: 'Transport', color: '#fca5a5', type: 'expense', budgetLimit: 200 },
    ];

    const insertCat = db.prepare('INSERT INTO categories (id, user_id, name, color, type, budget_limit, budget_interval) VALUES (?, ?, ?, ?, ?, ?, ?)');
    categories.forEach(c => insertCat.run(c.id, userId, c.name, c.color, c.type, c.budgetLimit, 'monthly'));
    console.log('Seeded testuser successfully!');
  }
}
seed();

const authenticateToken = (req, res, next) => {
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1)
});

const budgetSchema = z.object({
  monthlyBudget: z.number()
});

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  type: z.enum(['income', 'expense']),
  budgetLimit: z.number().optional(),
  budgetInterval: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  isCapital: z.boolean().optional(),
  isRecurring: z.boolean().optional()
});

const transactionSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  category_id: z.string().uuid(),
  description: z.string().max(500).optional()
});

app.post('/api/login', async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input', details: result.error.flatten() });
  }

  const { username, password } = result.data;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  
  res.json({ token, user: { id: user.id, username: user.username, monthlyBudget: user.monthly_budget } });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.sendStatus(200);
});

app.put('/api/user/budget', authenticateToken, (req, res) => {
  const result = budgetSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const { monthlyBudget } = result.data;
  db.prepare('UPDATE users SET monthly_budget = ? WHERE id = ?').run(monthlyBudget, req.user.id);
  res.sendStatus(200);
});

app.get('/api/categories', authenticateToken, (req, res) => {
  const categories = db.prepare('SELECT id, name, color, type, budget_limit as budgetLimit, budget_interval as budgetInterval, is_capital as isCapital, is_recurring as isRecurring FROM categories WHERE user_id = ?').all(req.user.id);
  res.json(categories.map(c => ({
    ...c,
    budgetLimit: c.budgetLimit || 0,
    budgetInterval: c.budgetInterval || 'monthly',
    isCapital: !!c.isCapital,
    isRecurring: !!c.isRecurring
  })));
});

app.post('/api/categories', authenticateToken, (req, res) => {
  const result = categorySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input', details: result.error.flatten() });
  }

  const { id, name, color, type, budgetLimit, budgetInterval, isCapital, isRecurring } = result.data;
  const limit = budgetLimit || 0;
  const interval = budgetInterval || 'monthly';
  
  db.prepare('INSERT INTO categories (id, user_id, name, color, type, budget_limit, budget_interval, is_capital, is_recurring) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id || uuidv4(), req.user.id, name, color, type, limit, interval, isCapital ? 1 : 0, isRecurring ? 1 : 0);
  res.sendStatus(201);
});

app.put('/api/categories/:id', authenticateToken, (req, res) => {
  const result = categorySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const { name, color, budgetLimit, budgetInterval, isCapital, isRecurring } = result.data;
  const limit = budgetLimit || 0;
  const interval = budgetInterval || 'monthly';
  
  const info = db.prepare('UPDATE categories SET name = ?, color = ?, budget_limit = ?, budget_interval = ?, is_capital = ?, is_recurring = ? WHERE id = ? AND user_id = ?')
    .run(name, color, limit, interval, isCapital ? 1 : 0, isRecurring ? 1 : 0, req.params.id, req.user.id);
  
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.sendStatus(200);
});

app.delete('/api/categories/:id', authenticateToken, (req, res) => {
  const info = db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.sendStatus(200);
});

app.get('/api/transactions', authenticateToken, (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
  const offset = (page - 1) * limit;

  const countResult = db.prepare('SELECT COUNT(*) as total FROM transactions WHERE user_id = ?').get(req.user.id);
  const total = countResult?.total || 0;

  const transactions = db.prepare(`
    SELECT t.*, c.name as category_name, c.color as category_color 
    FROM transactions t 
    JOIN categories c ON t.category_id = c.id 
    WHERE t.user_id = ?
    ORDER BY t.date DESC
    LIMIT ? OFFSET ?
  `).all(req.user.id, limit, offset);

  res.json({
    data: transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

app.post('/api/transactions', authenticateToken, (req, res) => {
  const result = transactionSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input', details: result.error.flatten() });
  }

  const { id, date, amount, type, category_id, description } = result.data;
  
  const category = db.prepare('SELECT id FROM categories WHERE id = ? AND user_id = ?').get(category_id, req.user.id);
  if (!category) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  db.prepare('INSERT INTO transactions (id, user_id, date, amount, type, category_id, description) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id || uuidv4(), req.user.id, date, amount, type, category_id, description || '');
  res.sendStatus(201);
});

app.put('/api/transactions/:id', authenticateToken, (req, res) => {
  const result = transactionSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const { date, amount, type, category_id, description } = result.data;
  
  const category = db.prepare('SELECT id FROM categories WHERE id = ? AND user_id = ?').get(category_id, req.user.id);
  if (!category) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  const info = db.prepare('UPDATE transactions SET date = ?, amount = ?, type = ?, category_id = ?, description = ? WHERE id = ? AND user_id = ?')
    .run(date, amount, type, category_id, description || '', req.params.id, req.user.id);
  
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.sendStatus(200);
});

app.delete('/api/transactions/:id', authenticateToken, (req, res) => {
  const info = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

export default app;
