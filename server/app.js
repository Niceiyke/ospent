import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import cookieParser from 'cookie-parser';

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

// --- SUPABASE SETUP ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing SUPABASE_URL or SUPABASE_KEY. Database functionality will fail.');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

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
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const budgetSchema = z.object({
  monthlyBudget: z.number().nonnegative()
});

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  type: z.enum(['income', 'expense']),
  budgetLimit: z.number().optional(),
  budgetInterval: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  isCapital: z.boolean().optional(),
  isRecurring: z.boolean().optional()
});

const transactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  category_id: z.string().uuid(),
  description: z.string().max(500).optional()
});


// --- AUTH ROUTES ---

app.post('/api/signup', async (req, res) => {
  const result = authSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input', details: result.error.flatten().fieldErrors });
  }

  const { username, password } = result.data;

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (existingUser) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const hashedPassword = await bcrypt.hash(password, 12); // Higher salt rounds for production
  
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ username, password: hashedPassword, monthly_budget: 0 })
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Failed to create user' });

  const token = jwt.sign({ id: newUser.id, username: newUser.username }, SAFE_JWT_SECRET, { expiresIn: '7d' });
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  
  res.status(201).json({ token, user: { id: newUser.id, username: newUser.username, monthlyBudget: newUser.monthly_budget } });
});

app.post('/api/login', async (req, res) => {
  const result = authSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const { username, password } = result.data;
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user.id, username: user.username }, SAFE_JWT_SECRET, { expiresIn: '7d' });
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  
  res.json({ token, user: { id: user.id, username: user.username, monthlyBudget: user.monthly_budget } });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.sendStatus(200);
});

// --- PROTECTED ROUTES (DATA ISOLATION ENFORCED) ---

app.put('/api/user/budget', authenticateToken, async (req, res) => {
  const result = budgetSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: 'Invalid input' });
  
  const { error } = await supabase
    .from('users')
    .update({ monthly_budget: result.data.monthlyBudget })
    .eq('id', req.user.id); // Strict ownership

  if (error) return res.status(500).json({ error: error.message });
  res.sendStatus(200);
});

app.get('/api/categories', authenticateToken, async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', req.user.id); // Strict ownership
  
  if (error) return res.status(500).json({ error: error.message });

  res.json(data.map(c => ({
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
  const result = categorySchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: 'Invalid input' });

  const { error } = await supabase
    .from('categories')
    .insert({
      user_id: req.user.id, // Forced ownership
      name: result.data.name,
      color: result.data.color,
      type: result.data.type,
      budget_limit: result.data.budgetLimit || 0,
      budget_interval: result.data.budgetInterval || 'monthly',
      is_capital: result.data.isCapital || false,
      is_recurring: result.data.isRecurring || false
    });

  if (error) return res.status(500).json({ error: error.message });
  res.sendStatus(201);
});

app.put('/api/categories/:id', authenticateToken, async (req, res) => {
  const result = categorySchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: 'Invalid input' });

  const { error } = await supabase
    .from('categories')
    .update({
      name: result.data.name,
      color: result.data.color,
      budget_limit: result.data.budgetLimit || 0,
      budget_interval: result.data.budgetInterval || 'monthly',
      is_capital: result.data.isCapital || false,
      is_recurring: result.data.isRecurring || false
    })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id); // Strict ownership

  if (error) return res.status(500).json({ error: error.message });
  res.sendStatus(200);
});

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id); // Strict ownership

  if (error) return res.status(500).json({ error: error.message });
  res.sendStatus(200);
});

app.get('/api/transactions', authenticateToken, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (name, color)
    `, { count: 'exact' })
    .eq('user_id', req.user.id) // Strict ownership
    .order('date', { ascending: false })
    .range(from, to);

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    data: data.map(t => ({
      ...t,
      category_name: t.categories?.name,
      category_color: t.categories?.color,
      categories: undefined
    })),
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  });
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  const result = transactionSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: 'Invalid input' });

  // Ownership verification for category
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('id', result.data.category_id)
    .eq('user_id', req.user.id) // Verify user owns the category
    .single();

  if (!category) return res.status(400).json({ error: 'Invalid category' });

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: req.user.id, // Forced ownership
      date: result.data.date,
      amount: result.data.amount,
      type: result.data.type,
      category_id: result.data.category_id,
      description: result.data.description || ''
    });

  if (error) return res.status(500).json({ error: error.message });
  res.sendStatus(201);
});

app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
  const result = transactionSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: 'Invalid input' });

  const { error } = await supabase
    .from('transactions')
    .update({
      date: result.data.date,
      amount: result.data.amount,
      type: result.data.type,
      category_id: result.data.category_id,
      description: result.data.description || ''
    })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id); // Strict ownership

  if (error) return res.status(500).json({ error: error.message });
  res.sendStatus(200);
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id); // Strict ownership

  if (error) return res.status(500).json({ error: error.message });
  res.sendStatus(200);
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
}

export default app;
