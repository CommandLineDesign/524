import { auditLogs } from '@524/database';

import { db } from '../db/client.js';

export interface CreateAuditLogParams {
  adminId: string;
  entityType: string;
  entityId: string;
  action: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
}

export class AuditLogRepository {
  async create(params: CreateAuditLogParams) {
    const [created] = await db
      .insert(auditLogs)
      .values({
        adminId: params.adminId,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        changes: params.changes ?? null,
        metadata: params.metadata ?? null,
      })
      .returning();

    return created;
  }
}
