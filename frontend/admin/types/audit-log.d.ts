export type AuditLog = {
  _id: string;
  userId: string;
  action: string;
  resource: string;
  details: any;
  timestamp: string;
};

export type CreateAuditLogData = Omit<AuditLog, '_id'>;
