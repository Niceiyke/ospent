import bcrypt from 'bcryptjs';
import { db } from './db/index.js';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  const hashedPassword = await bcrypt.hash('testpassword', 10);
  try {
    const userResult = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('testuser', hashedPassword);
    const userId = userResult.lastInsertRowid;
    
    // Seed default categories
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
  } catch (err) {
    console.log('Testuser might already exist.');
  }
}

seed();
