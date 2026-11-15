import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
const opts = { timestamps: true };

export const Property = models.Property || model('Property', new Schema({
  slug: { type: String, unique: true, required: true, index: true },
  name: { type: String, required: true }, category: { type: String, enum: ['Residential', 'Commercial'], required: true },
  type: { type: String, required: true, index: true }, location: String, city: String, state: String, address: String,
  coordinates: { lat: Number, lng: Number }, price: { type: Number, required: true, min: 0 }, area: Number,
  bedrooms: Number, bathrooms: Number, parking: String, furnishing: String, facing: String, yearBuilt: Number,
  short: String, description: String, construction: String, amenities: [String], features: [String],
  images: [String], video: String, featured: Boolean, agentId: { type: String, index: true },
}, opts));

export const Agent = models.Agent || model('Agent', new Schema({
  slug: { type: String, unique: true, required: true }, name: String, company: String, phone: String, email: String, office: String, bio: String, photo: String,
}, opts));

export const Company = models.Company || model('Company', new Schema({}, { strict: false, ...opts }));

export const Inquiry = models.Inquiry || model('Inquiry', new Schema({
  name: String, email: String, phone: String, subject: String, message: String,
}, opts));
