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

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }
  try {
    await connect();
    const { name, email, phone, message } = await req.json();
    const contact = await Contact.create({ name, email, phone, message });
    return Response.json({ ok: true, id: contact._id }, { status: 201 });
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
