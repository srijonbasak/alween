const mongoose = require('mongoose');
const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/alweenfragrance';

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'customer' },
  pointsBalance: { type: Number, default: 0 },
  isAffiliate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node create-admin.js <email> <password> [name] [phone]');
    process.exit(1);
  }

  const email = args[0].trim().toLowerCase();
  const password = args[1];
  const name = args[2] || 'Admin User';
  const phone = args[3] || '';

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = 'admin';
      existing.passwordHash = hashPassword(password);
      if (phone) existing.phone = phone;
      await existing.save();
      console.log(`Successfully updated existing user ${email} to ADMIN role and updated password.`);
    } else {
      const newAdmin = new User({
        name,
        email,
        phone,
        passwordHash: hashPassword(password),
        role: 'admin',
        pointsBalance: 0,
        isAffiliate: false
      });
      await newAdmin.save();
      console.log(`Successfully created new ADMIN user: ${email}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

run();
