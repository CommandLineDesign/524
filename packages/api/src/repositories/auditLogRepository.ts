import { auditLogs } from '@524/database';

import { db } from '../db/client.js';

export interface CreateAuditLogParams {
  adminId?: string;
  userId?: string;
  entityType?: string;
  resourceType?: string;
  entityId?: string | null;
  resourceId?: string | null;
  action: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogRepository {
  async create(params: CreateAuditLogParams) {
    const [created] = await db
      .insert(auditLogs)
      .values({
        adminId: params.adminId || params.userId || '',
        entityType: params.entityType || params.resourceType || '',
        entityId: params.entityId || params.resourceId || '',
        action: params.action,
        changes: params.changes ?? null,
        metadata: params.metadata || params.details || null,
      })
      .returning();

    return created;
  }
}

// Export an instance for convenience
export const auditLogRepository = new AuditLogRepository();
