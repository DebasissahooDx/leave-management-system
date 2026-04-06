import Leave from '../models/Leave.js';
import User from '../models/User.js';

export const applyLeave = async (req, res) => {
  const { type, startDate, endDate, reason } = req.body;
  const leave = await Leave.create({ userId: req.user.id, type, startDate, endDate, reason });
  res.status(201).json(leave);
};

export const getMyLeaves = async (req, res) => {
  const leaves = await Leave.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(leaves);
};

export const getAllLeaves = async (req, res) => {
  const leaves = await Leave.find().populate('userId', 'name email').sort({ createdAt: -1 });
  res.json(leaves);
};

export const updateLeaveStatus = async (req, res) => {
  const { status, managerComment } = req.body;
  const leave = await Leave.findById(req.params.id);

  if (status === 'approved') {
    const user = await User.findById(leave.userId);
    const days = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    user.leaveBalance[leave.type] -= days;
    await user.save();
  }

  leave.status = status;
  leave.managerComment = managerComment;
  await leave.save();
  res.json(leave);
};

export const getUserBalance = async (req, res) => {
  const user = await User.findById(req.user.id).select('leaveBalance');
  res.json(user.leaveBalance);
};

export const getManagerDashboard = async (req, res) => {
  const totalEmployees = await User.countDocuments({ role: 'employee' });
  const totalApproved = await Leave.countDocuments({ status: 'approved' });
  res.json({ totalEmployees, totalApprovedLeaves: totalApproved });
};