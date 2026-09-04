// models/User.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  email:          { type: String, required: true, unique: true },
  password:       { type: String, required: true, select: false },
  role:           { type: String, enum: ['Super Admin','Admin','Coordinator','Engineer'], required: true },
  avatar:         { type: String, default: '' },
  isWork:         { type: Boolean, default: true },
  phoneNum:       { type: String, required: true },
  location:       { type: String, default: '' },
  active:         { type: String, enum: ["Online","Offline"], default: 'Offline' },
  tasksAssigned:  { type: Number, default: 0 },
  leadsCreated:   { type: Number, default: 0 },
  lastLogin:      { type: Date },
  userDeleted:    { type: Boolean, default: false }
},{timestamps: true});

// Hash password on create/update
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare plain text password to hashed
userSchema.methods.verifyPassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
