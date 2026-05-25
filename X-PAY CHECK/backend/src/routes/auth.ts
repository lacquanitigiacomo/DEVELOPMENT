import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const users: Array<{ id: string; email: string; password: string; name: string }> = [];
const refreshTokens = new Set<string>();

const magicLinkSchema = z.object({ email: z.string().email() });

function signAccessToken(payload: { userId: string; email: string; tier?: 'free' | 'trial' | 'pro' }) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  }
  const { email, password, name } = parsed.data;
  const existing = users.find(u => u.email === email);
  if (existing) return res.status(409).json({ error: 'User already exists' });

  const hashed = await bcrypt.hash(password, 12);
  const user = { id: randomUUID(), email, password: hashed, name };
  users.push(user);

  const token = signAccessToken({ userId: user.id, email, tier: 'free' });

  res.status(201).json({ token, user: { id: user.id, email, name } });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signAccessToken({ userId: user.id, email, tier: 'free' });

  res.json({ token, user: { id: user.id, email, name: user.name } });
});

router.post('/magic-link', (req, res) => {
  const parsed = magicLinkSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid email' });
  const { email } = parsed.data;
  const token = jwt.sign({ email, type: 'magic-link' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '15m' });
  res.json({ success: true, message: 'Magic link generato (mock)', token });
});

router.post('/magic-link/verify', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token mancante' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
    const user = users.find(u => u.email === decoded.email) || { id: randomUUID(), email: decoded.email, password: '', name: decoded.email.split('@')[0] };
    if (!users.find(u => u.email === user.email)) users.push(user);
    const accessToken = signAccessToken({ userId: user.id, email: user.email, tier: 'trial' });
    const refreshToken = jwt.sign({ userId: user.id, email: user.email, type: 'refresh' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '30d' });
    refreshTokens.add(refreshToken);
    res.json({ token: accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name } });
  } catch {
    return res.status(401).json({ error: 'Magic link non valido o scaduto' });
  }
});

router.post('/social', (req, res) => {
  const { provider, idToken, email } = req.body;
  if (!provider || !idToken || !email) return res.status(400).json({ error: 'Payload social incompleto' });
  const user = users.find(u => u.email === email) || { id: randomUUID(), email, password: '', name: email.split('@')[0] };
  if (!users.find(u => u.email === user.email)) users.push(user);
  const token = signAccessToken({ userId: user.id, email: user.email, tier: 'free' });
  res.json({ token, provider, user: { id: user.id, email: user.email, name: user.name } });
});

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.has(refreshToken)) return res.status(401).json({ error: 'Refresh token non valido' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'dev-secret') as any;
    const token = signAccessToken({ userId: decoded.userId, email: decoded.email, tier: 'free' });
    return res.json({ token });
  } catch {
    return res.status(401).json({ error: 'Refresh token scaduto' });
  }
});

export { router as authRouter };
