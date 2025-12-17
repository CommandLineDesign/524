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
    // Validate required fields to prevent empty string IDs
    const adminId = params.adminId || params.userId;
    const entityId = params.entityId || params.resourceId;
    const entityType = params.entityType || params.resourceType;

    if (!adminId || adminId.trim() === '') {
      throw new Error('Audit log creation requires a valid adminId or userId');
    }

    if (!entityId || entityId.trim() === '') {
      throw new Error('Audit log creation requires a valid entityId or resourceId');
    }

    if (!entityType || entityType.trim() === '') {
      throw new Error('Audit log creation requires a valid entityType or resourceType');
    }

    const [created] = await db
      .insert(auditLogs)
      .values({
        adminId,
        entityType,
        entityId,
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
