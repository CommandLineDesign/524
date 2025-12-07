import { AuditLogRepository } from '../repositories/auditLogRepository.js';
import { type UserQuery, UserRepository } from '../repositories/userRepository.js';

export class UserService {
  constructor(
    private readonly repository = new UserRepository(),
    private readonly auditLogRepository = new AuditLogRepository()
  ) {}

  async getUsers(query: UserQuery) {
    return this.repository.findMany(query);
  }

  async getUserById(userId: string) {
    return this.repository.findById(userId);
  }

  async updateUser(
    userId: string,
    updates: {
      name?: string;
      email?: string | null;
      phoneNumber?: string;
      isActive?: boolean;
      isVerified?: boolean;
    },
    adminId: string
  ) {
    // Get current user data for audit
    const currentUser = await this.repository.findById(userId);
    if (!currentUser) {
      throw Object.assign(new Error('User not found'), { status: 404 });
    }

    // Calculate changes for audit log
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    if (updates.name !== undefined && updates.name !== currentUser.name) {
      changes.name = { old: currentUser.name, new: updates.name };
    }
    if (updates.email !== undefined && updates.email !== currentUser.email) {
      changes.email = { old: currentUser.email, new: updates.email };
    }
    if (updates.phoneNumber !== undefined && updates.phoneNumber !== currentUser.phoneNumber) {
      changes.phoneNumber = { old: currentUser.phoneNumber, new: updates.phoneNumber };
    }
    if (updates.isActive !== undefined && updates.isActive !== currentUser.isActive) {
      changes.isActive = { old: currentUser.isActive, new: updates.isActive };
    }
    if (updates.isVerified !== undefined && updates.isVerified !== currentUser.isVerified) {
      changes.isVerified = { old: currentUser.isVerified, new: updates.isVerified };
    }

    // Update user
    const updated = await this.repository.update(userId, updates);

    // Log audit entry if there were changes
    if (Object.keys(changes).length > 0) {
      await this.auditLogRepository.create({
        adminId,
        entityType: 'user',
        entityId: userId,
        action: 'update',
        changes,
      });
    }

    return updated;
  }

  async banUser(userId: string, reason: string, adminId: string) {
    const currentUser = await this.repository.findById(userId);
    if (!currentUser) {
      throw Object.assign(new Error('User not found'), { status: 404 });
    }

    const updated = await this.repository.banUser(userId, reason, adminId);

    await this.auditLogRepository.create({
      adminId,
      entityType: 'user',
      entityId: userId,
      action: 'ban',
      metadata: {
        reason,
        previousBanReason: currentUser.banReason,
        previousBannedAt: currentUser.bannedAt,
      },
    });

    return updated;
  }

  async unbanUser(userId: string, adminId: string) {
    const currentUser = await this.repository.findById(userId);
    if (!currentUser) {
      throw Object.assign(new Error('User not found'), { status: 404 });
    }

    const updated = await this.repository.unbanUser(userId, adminId);

    await this.auditLogRepository.create({
      adminId,
      entityType: 'user',
      entityId: userId,
      action: 'unban',
      metadata: {
        previousBanReason: currentUser.banReason,
        previousBannedAt: currentUser.bannedAt,
      },
    });

    return updated;
  }
}
