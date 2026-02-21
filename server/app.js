import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { createClient as createLibsqlClient } from '@libsql/client';
import { z } from 'zod';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Production-grade JWT Secret handling
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: JWT_SECRET environment variable is not set in production.');
}
const SAFE_JWT_SECRET = JWT_SECRET || 'dev-secret-key-replace-immediately';

app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// --- DATABASE STRATEGY ---
const IS_PROD = process.env.NODE_ENV === 'production';
const supabase = (IS_PROD || process.env.SUPABASE_URL) 
  ? createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '')
  : null;

const libsql = (!IS_PROD && !process.env.SUPABASE_URL)
  ? createLibsqlClient({ url: `file:${path.join(__dirname, 'db', 'ospent.db')}` })
  : null;

const db = {
  async query(table, action, options = {}) {
    if (supabase) {
      let query = supabase.from(table);
      if (action === 'select') {
        query = query.select(options.select || '*');
        if (options.eq) {
          for (const [key, val] of Object.entries(options.eq)) query = query.eq(key, val);
        }
        if (options.order) query = query.order(options.order.column, { ascending: options.order.ascending });
        if (options.range) query = query.range(options.range.from, options.range.to);
        if (options.single) return await query.single();
        return await query;
      }
      if (action === 'insert') return await query.insert(options.data).select().single();
      if (action === 'update') {
        query = query.update(options.data);
        for (const [key, val] of Object.entries(options.eq)) query = query.eq(key, val);
        return await query;
      }
      if (action === 'delete') {
        query = query.delete();
        for (const [key, val] of Object.entries(options.eq)) query = query.eq(key, val);
        return await query;
      }
    } else {
      // Libsql Fallback
      if (action === 'select') {
        let sql = `SELECT ${options.select || '*'} FROM ${table}`;
        const args = [];
        if (options.eq) {
          const conditions = Object.entries(options.eq).map(([k, v]) => {
            args.push(v);
            return `${k} = ?`;
          });
          sql += ` WHERE ${conditions.join(' AND ')}`;
        }
        if (options.order) sql += ` ORDER BY ${options.order.column} ${options.order.ascending ? 'ASC' : 'DESC'}`;
        if (options.range) sql += ` LIMIT ${options.range.to - options.range.from + 1} OFFSET ${options.range.from}`;
        
        const res = await libsql.execute({ sql, args });
        return { data: options.single ? res.rows[0] : res.rows, error: null, count: res.rows.length };
      }
      if (action === 'insert') {
        const keys = Object.keys(options.data);
        const vals = Object.values(options.data);
        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')}) RETURNING *`;
        const res = await libsql.execute({ sql, args: vals });
        return { data: res.rows[0], error: null };
      }
      if (action === 'update') {
        const sets = Object.entries(options.data).map(([k]) => `${k} = ?`);
        const args = Object.values(options.data);
        let sql = `UPDATE ${table} SET ${sets.join(', ')}`;
        if (options.eq) {
          const conditions = Object.entries(options.eq).map(([k, v]) => {
            args.push(v);
            return `${k} = ?`;
          });
          sql += ` WHERE ${conditions.join(' AND ')}`;
        }
        const res = await libsql.execute({ sql, args });
        return { error: res.rowsAffected === 0 ? { message: 'Not found' } : null };
      }
      if (action === 'delete') {
        let sql = `DELETE FROM ${table}`;
        const args = [];
        if (options.eq) {
          const conditions = Object.entries(options.eq).map(([k, v]) => {
            args.push(v);
            return `${k} = ?`;
          });
          sql += ` WHERE ${conditions.join(' AND ')}`;
        }
        const res = await libsql.execute({ sql, args });
        return { error: null };
      }
    }
  }
};

// --- INIT LIBSQL (Local Only) ---
if (libsql) {
  await libsql.execute(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT, monthly_budget REAL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  await libsql.execute(`CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, user_id TEXT, name TEXT, color TEXT, type TEXT, budget_limit REAL, budget_interval TEXT, is_capital INTEGER, is_recurring INTEGER, FOREIGN KEY(user_id) REFERENCES users(id))`);
  await libsql.execute(`CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, user_id TEXT, date TEXT, amount REAL, type TEXT, category_id TEXT, description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(category_id) REFERENCES categories(id))`);
}

// --- MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  jwt.verify(token, SAFE_JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// --- SCHEMAS ---
const authSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8)
});

// --- ROUTES ---

app.post('/api/signup', async (req, res) => {
  const result = authSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: 'Invalid input' });

  const { username, password } = result.data;
  const { data: existing } = await db.query('users', 'select', { eq: { username }, single: true });

  if (existing) return res.status(409).json({ error: 'Username taken' });

  const hashedPassword = await bcrypt.hash(password, 12);
  const { data: newUser, error } = await db.query('users', 'insert', { 
    data: { id: crypto.randomUUID(), username, password: hashedPassword, monthly_budget: 0 } 
  });

  if (error) return res.status(500).json({ error: 'Signup failed' });

  const token = jwt.sign({ id: newUser.id, username: newUser.username }, SAFE_JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, secure: IS_PROD, sameSite: 'strict' });
  res.status(201).json({ token, user: { id: newUser.id, username: newUser.username, monthlyBudget: newUser.monthly_budget } });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const { data: user } = await db.query('users', 'select', { eq: { username }, single: true });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, SAFE_JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, secure: IS_PROD, sameSite: 'strict' });
  res.json({ token, user: { id: user.id, username: user.username, monthlyBudget: user.monthly_budget } });
});

app.get('/api/categories', authenticateToken, async (req, res) => {
  const { data } = await db.query('categories', 'select', { eq: { user_id: req.user.id } });
  res.json((data || []).map(c => ({
    id: c.id,
    name: c.name,
    color: c.color,
    type: c.type,
    budgetLimit: Number(c.budget_limit) || 0,
    budgetInterval: c.budget_interval || 'monthly',
    isCapital: !!c.is_capital,
    isRecurring: !!c.is_recurring
  })));
});

app.post('/api/categories', authenticateToken, async (req, res) => {
  const { error } = await db.query('categories', 'insert', {
    data: {
      id: crypto.randomUUID(),
      user_id: req.user.id,
      name: req.body.name,
      color: req.body.color,
      type: req.body.type,
      budget_limit: req.body.budgetLimit || 0,
      budget_interval: req.body.budgetInterval || 'monthly',
      is_capital: req.body.isCapital ? 1 : 0,
      is_recurring: req.body.isRecurring ? 1 : 0
    }
  });
  if (error) return res.status(500).json({ error: error.message });
  res.sendStatus(201);
});

app.get('/api/transactions', authenticateToken, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  if (supabase) {
    const { data, count } = await supabase.from('transactions').select('*, categories(name, color)', { count: 'exact' }).eq('user_id', req.user.id).order('date', { ascending: false }).range(from, to);
    return res.json({ data: data.map(t => ({ ...t, category_name: t.categories?.name, category_color: t.categories?.color, categories: undefined })), pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } });
  } else {
    const { data } = await db.query('transactions', 'select', { eq: { user_id: req.user.id }, order: { column: 'date', ascending: false }, range: { from, to } });
    // Join simulation for local dev
    const { data: cats } = await db.query('categories', 'select', { eq: { user_id: req.user.id } });
    const catMap = Object.fromEntries(cats.map(c => [c.id, c]));
    res.json({ data: data.map(t => ({ ...t, category_name: catMap[t.category_id]?.name, category_color: catMap[t.category_id]?.color })), pagination: { page, limit, total: data.length, totalPages: 1 } });
  }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  const { error } = await db.query('transactions', 'insert', {
    data: {
      id: crypto.randomUUID(),
      user_id: req.user.id,
      date: req.body.date,
      amount: req.body.amount,
      type: req.body.type,
      category_id: req.body.category_id,
      description: req.body.description || ''
    }
  });
  if (error) return res.status(500).json({ error: error.message });
  res.sendStatus(201);
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: IS_PROD, sameSite: 'strict' });
  res.sendStatus(200);
});

if (process.env.NODE_ENV !== 'production' && !process.env.SUPABASE_URL) {
  app.listen(PORT, () => console.log(`Backend running with local DB on http://localhost:${PORT}`));
}

export default app;
