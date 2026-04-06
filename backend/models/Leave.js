import mongoose from 'mongoose';

const LeaveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['vacation', 'sick'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  managerComment: { type: String, default: '' }
}, { timestamps: true });

// CHANGE THIS LINE:
export default mongoose.model('Leave', LeaveSchema);