import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
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
  },
  { timestamps: true }
);

// Rate-limit entries live in their own collection and self-delete via TTL
// index once the window has passed, so no IP-derived data is retained.
const rateLimitSchema = new mongoose.Schema({
  ipHash: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now, expires: RATE_LIMIT_WINDOW_MS / 1000 },
});

// Reuse the compiled models and the connection across warm invocations
const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);
const RateLimit = mongoose.models.RateLimit || mongoose.model('RateLimit', rateLimitSchema);

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

// Keyed hash: an unsalted sha256 of an IPv4 address is brute-forceable in
// minutes, so without the secret it would still be personal data.
function clientIpHash(req) {
  const ip =
    req.headers.get('x-nf-client-connection-ip') ||
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  const secret = process.env.IP_HASH_SECRET;
  if (!secret) {
    // Degrade rather than reject the inquiry — losing leads is worse.
    console.warn('IP_HASH_SECRET is not set; falling back to unkeyed hash');
    return createHash('sha256').update(ip).digest('hex');
  }
  return createHmac('sha256', secret).update(ip).digest('hex');
}

export default async (req) => {
  try {
    if (req.method === 'POST') {
      let body;
      try {
        body = await req.json();
      } catch {
        return Response.json({ ok: false, error: 'Ungültige Anfrage.' }, { status: 400 });
      }
      const { name, email, phone, message, website, company } = body || {};

      // Honeypot ("website" now, "company" kept for bots replaying the old
      // form): real users never see the field; bots that fill it get a fake
      // success so they don't adapt.
      if (website || company) {
        console.warn('Honeypot triggered — dropping submission');
        return Response.json({ ok: true }, { status: 201 });
      }

      await connect();

      // Record the attempt first, then count: concurrent requests see each
      // other's entries, so a burst can't slip past the check-then-create gap.
      const ipHash = clientIpHash(req);
      await RateLimit.create({ ipHash });
      const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
      const attempts = await RateLimit.countDocuments({ ipHash, createdAt: { $gte: windowStart } });
      if (attempts > RATE_LIMIT_MAX) {
        return Response.json(
          { ok: false, error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
          { status: 429 }
        );
      }

      const contact = await Contact.create({ name, email, phone, message });
      return Response.json({ ok: true, id: contact._id }, { status: 201 });
    }

    if (req.method === 'GET') {
      if (!authorized(req)) {
        return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      }
      await connect();
      // ipHash projection kept for documents created before rate-limit data
      // moved to its own collection.
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
