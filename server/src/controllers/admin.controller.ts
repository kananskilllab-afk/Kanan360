import { AuditLog } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listAuditLogs = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = {};
  if (req.query.entityType) filter.entityType = req.query.entityType;

  const logs = await AuditLog.find(filter)
    .sort({ timestamp: -1 })
    .limit(200)
    .populate('userId', 'name email role')
    .lean();
  res.json({ logs });
});
