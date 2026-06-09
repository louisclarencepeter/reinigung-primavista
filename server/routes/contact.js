import { Router } from 'express';
import Contact from '../models/Contact.js';

const router = Router();

// POST /api/contact — store a contact request
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body ?? {};
    const contact = await Contact.create({ name, email, phone, message });
    res.status(201).json({ ok: true, id: contact._id });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const fields = Object.keys(err.errors);
      return res.status(400).json({ ok: false, error: 'Ungültige Eingaben.', fields });
    }
    console.error(err);
    res.status(500).json({ ok: false, error: 'Serverfehler. Bitte versuchen Sie es später erneut.' });
  }
});

// GET /api/contact — list stored requests (newest first)
router.get('/', async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 }).limit(100);
  res.json(contacts);
});

export default router;
