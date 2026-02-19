import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../app.js';

describe('Auth API', () => {
  const testUser = {
    username: `testuser_${Date.now()}`,
    password: 'testpassword123'
  };

  let token = '';

  describe('POST /api/login', () => {
    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'invalid', password: 'wrong' });
      
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should login with seeded user', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'testuser', password: 'testpassword' });
      
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      token = res.body.token;
    });
  });

  describe('GET /api/categories', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .get('/api/categories');
      
      expect(res.status).toBe(401);
    });

    it('should return categories with auth', async () => {
      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Category',
          color: '#ff0000',
          type: 'expense',
          budgetLimit: 100
        });
      
      expect(res.status).toBe(201);
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '',
          color: 'invalid',
          type: 'invalid'
        });
      
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/transactions', () => {
    it('should return paginated transactions', async () => {
      const res = await request(app)
        .get('/api/transactions?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(10);
    });
  });

  describe('POST /api/transactions', () => {
    let categoryId = '';

    beforeAll(async () => {
      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${token}`);
      const expenseCat = res.body.find((c) => c.type === 'expense');
      categoryId = expenseCat?.id;
    });

    it('should create a new transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2024-01-15',
          amount: 50,
          type: 'expense',
          category_id: categoryId,
          description: 'Test transaction'
        });
      
      expect(res.status).toBe(201);
    });

    it('should return 400 for invalid transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: 'invalid-date',
          amount: -10,
          type: 'expense',
          category_id: 'invalid-uuid'
        });
      
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/user/budget', () => {
    it('should update monthly budget', async () => {
      const res = await request(app)
        .put('/api/user/budget')
        .set('Authorization', `Bearer ${token}`)
        .send({ monthlyBudget: 10000 });
      
      expect(res.status).toBe(200);
    });

    it('should return 400 for invalid budget', async () => {
      const res = await request(app)
        .put('/api/user/budget')
        .set('Authorization', `Bearer ${token}`)
        .send({ monthlyBudget: 'invalid' });
      
      expect(res.status).toBe(400);
    });
  });
});
