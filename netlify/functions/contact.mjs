import { createHash, timingSafeEqual } from 'node:crypto';
import mongoose from 'mongoose';

const RATE_LIMIT_MAX = 3;             // submissions…
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // …per IP per 15 minutes

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
    // sha256 of the client IP — for rate limiting without storing the IP itself
    ipHash: { type: String, default: '' },
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

function clientIpHash(req) {
  const ip =
    req.headers.get('x-nf-client-connection-ip') ||
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  return createHash('sha256').update(ip).digest('hex');
}

export default async (req) => {
  try {
    if (req.method === 'POST') {
      const { name, email, phone, message, company } = await req.json();

      // Honeypot: real users never see this field; bots that fill it get a
      // fake success so they don't adapt.
      if (company) {
        return Response.json({ ok: true }, { status: 201 });
      }

      await connect();

      const ipHash = clientIpHash(req);
      const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
      const recent = await Contact.countDocuments({ ipHash, createdAt: { $gte: windowStart } });
      if (recent >= RATE_LIMIT_MAX) {
        return Response.json(
          { ok: false, error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
          { status: 429 }
        );
      }

      const contact = await Contact.create({ name, email, phone, message, ipHash });
      return Response.json({ ok: true, id: contact._id }, { status: 201 });
    }

    if (req.method === 'GET') {
      if (!authorized(req)) {
        return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      }
      await connect();
      const contacts = await Contact.find({}, { ipHash: 0 }).sort({ createdAt: -1 }).limit(100);
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
