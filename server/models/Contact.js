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

export default mongoose.model('Contact', contactSchema);
