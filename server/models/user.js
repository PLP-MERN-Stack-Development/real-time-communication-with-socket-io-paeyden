const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // add JWT
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  avatarUrl: { type: String, default: '' },
  status: { type: String, enum: ['online', 'offline', 'away'], default: 'offline' },
}, { timestamps: true });

// 🔒 Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔑 Compare passwords
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 🔑 Generate JWT token
UserSchema.methods.generateAuthToken = function () {
  // Include both `_id` and `id` to be compatible with middleware expecting either
  return jwt.sign(
    { _id: this._id, id: this._id, username: this.username, email: this.email },
    process.env.JWT_SECRET, // make sure you set this in .env
    { expiresIn: '24h' }
  );
};

module.exports = mongoose.model('User', UserSchema);