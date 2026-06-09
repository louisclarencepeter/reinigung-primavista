import { timingSafeEqual } from 'node:crypto';
import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: { type: String, trim: true, maxlength: 40, default: '' },
    message: { type: String, required: true, trim: true, minlength: 5, maxlength: 5000 },
  },
  { timestamps: true }
);

// Reuse the compiled model and the connection across warm invocations
const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

async function connect() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(uri, { bufferCommands: false });
}

// GET requires "Authorization: Bearer <ADMIN_TOKEN>"; denies everything when
// ADMIN_TOKEN is unset rather than failing open.
function authorized(req) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  const provided = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const a = Buffer.from(provided);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async (req) => {
  try {
    if (req.method === 'POST') {
      await connect();
      const { name, email, phone, message } = await req.json();
      const contact = await Contact.create({ name, email, phone, message });
      return Response.json({ ok: true, id: contact._id }, { status: 201 });
    }

    if (req.method === 'GET') {
      if (!authorized(req)) {
        return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      }
      await connect();
      const contacts = await Contact.find().sort({ createdAt: -1 }).limit(100);
      return Response.json(contacts);
    }

    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return Response.json(
        { ok: false, error: 'Ungültige Eingaben.', fields: Object.keys(err.errors) },
        { status: 400 }
      );
    }
    console.error(err);
    return Response.json(
      { ok: false, error: 'Serverfehler. Bitte versuchen Sie es später erneut.' },
      { status: 500 }
    );
  }
};

// Serve the function directly at /api/contact — no redirect rule needed,
// and the client keeps POSTing to the same URL as in local dev.
export const config = { path: '/api/contact' };
