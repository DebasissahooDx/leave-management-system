import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'manager'], default: 'employee' },
  leaveBalance: {
    vacation: { type: Number, default: 20 },
    sick: { type: Number, default: 10 }
  }
});

// CHANGE THIS LINE:
export default mongoose.model('User', UserSchema);