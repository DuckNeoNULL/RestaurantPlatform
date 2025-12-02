import AuditLog from "../models/AuditLog.js";

const AuditLogDAO = {
  create(data, options = {}) {
    return AuditLog.create([data], options);
  },
};

export default AuditLogDAO;
