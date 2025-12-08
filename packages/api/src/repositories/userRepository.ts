import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

import { userRoles, users } from '@524/database';

import { db } from '../db/client.js';

export interface UserQuery {
  page: number;
  perPage: number;
  sortField?: 'createdAt' | 'name' | 'email';
  sortOrder?: 'ASC' | 'DESC';
  role?: 'customer' | 'artist' | 'admin' | 'support';
  search?: string;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string;
  phoneVerified: boolean;
  roles: string[];
  isActive: boolean;
  isVerified: boolean;
  isBanned: boolean;
  banReason: string | null;
  bannedAt: Date | null;
  bannedBy: string | null;
  tokenVersion: number;
  sessionVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

function mapRowToUserListItem(row: {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  phoneVerified: boolean | null;
  roles: string[] | null;
  isActive: boolean | null;
  isVerified: boolean | null;
  isBanned: boolean | null;
  banReason: string | null;
  bannedAt: Date | null;
  bannedBy: string | null;
  tokenVersion: number | null;
  sessionVersion: number | null;
  createdAt: Date;
  updatedAt: Date;
}): UserListItem {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? null,
    phoneNumber: row.phoneNumber ?? '',
    phoneVerified: row.phoneVerified ?? false,
    roles: row.roles ?? [],
    isActive: row.isActive ?? true,
    isVerified: row.isVerified ?? false,
    isBanned: row.isBanned ?? false,
    banReason: row.banReason ?? null,
    bannedAt: row.bannedAt ?? null,
    bannedBy: row.bannedBy ?? null,
    tokenVersion: row.tokenVersion ?? 1,
    sessionVersion: row.sessionVersion ?? 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class UserRepository {
  async findById(userId: string) {
    const [record] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        phoneVerified: users.phoneVerified,
        roles: sql<
          string[]
        >`coalesce(array_agg(distinct ${userRoles.role})::text[], ARRAY[]::text[])`,
        isActive: users.isActive,
        isVerified: users.isVerified,
        isBanned: users.isBanned,
        banReason: users.banReason,
        bannedAt: users.bannedAt,
        bannedBy: users.bannedBy,
        tokenVersion: users.tokenVersion,
        sessionVersion: users.sessionVersion,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(userRoles, eq(users.id, userRoles.userId))
      .where(eq(users.id, userId))
      .groupBy(
        users.id,
        users.name,
        users.email,
        users.phoneNumber,
        users.phoneVerified,
        users.isActive,
        users.isVerified,
        users.isBanned,
        users.banReason,
        users.bannedAt,
        users.bannedBy,
        users.tokenVersion,
        users.sessionVersion,
        users.createdAt,
        users.updatedAt
      )
      .limit(1);
    return record ? mapRowToUserListItem(record) : null;
  }

  async findMany(query: UserQuery) {
    const offset = Math.max(query.page - 1, 0) * query.perPage;

    // Build where conditions
    const conditions = [];

    if (query.role) {
      conditions.push(
        sql`exists (select 1 from ${userRoles} ur where ur.user_id = ${users.id} and ur.role = ${query.role})`
      );
    }

    if (query.search) {
      const searchTerm = `%${query.search}%`;
      const searchCondition = or(
        ilike(users.name, searchTerm),
        ilike(sql`coalesce(${users.email}, '')`, searchTerm),
        ilike(sql`coalesce(${users.phoneNumber}, '')`, searchTerm)
      );

      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Build sort
    type SortColumn = typeof users.createdAt | typeof users.name | typeof users.email;
    let sortColumn: SortColumn = users.createdAt;
    if (query.sortField === 'name') {
      sortColumn = users.name;
    } else if (query.sortField === 'email') {
      sortColumn = users.email ?? users.createdAt;
    }

    const sortDirection =
      (query.sortOrder ?? 'DESC') === 'ASC' ? asc(sortColumn) : desc(sortColumn);

    // Get data
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        phoneVerified: users.phoneVerified,
        roles: sql<
          string[]
        >`coalesce(array_agg(distinct ${userRoles.role})::text[], ARRAY[]::text[])`,
        isActive: users.isActive,
        isVerified: users.isVerified,
        isBanned: users.isBanned,
        banReason: users.banReason,
        bannedAt: users.bannedAt,
        bannedBy: users.bannedBy,
        tokenVersion: users.tokenVersion,
        sessionVersion: users.sessionVersion,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(userRoles, eq(users.id, userRoles.userId))
      .where(whereClause ?? sql`true`)
      .groupBy(
        users.id,
        users.name,
        users.email,
        users.phoneNumber,
        users.phoneVerified,
        users.isActive,
        users.isVerified,
        users.isBanned,
        users.banReason,
        users.bannedAt,
        users.bannedBy,
        users.tokenVersion,
        users.sessionVersion,
        users.createdAt,
        users.updatedAt
      )
      .orderBy(sortDirection)
      .limit(query.perPage)
      .offset(offset);

    // Get count
    const [countRow] = await db
      .select({ count: sql<number>`count(distinct ${users.id})` })
      .from(users)
      .leftJoin(userRoles, eq(users.id, userRoles.userId))
      .where(whereClause ?? sql`true`);

    const total = countRow?.count ?? 0;

    return {
      items: rows.map(mapRowToUserListItem),
      total: Number(total),
    };
  }

  async update(userId: string, updates: Partial<typeof users.$inferInsert>) {
    const [updated] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updated) {
      throw Object.assign(new Error('User not found'), { status: 404 });
    }

    // Return with roles populated
    return this.findById(userId);
  }

  async banUser(userId: string, reason: string, adminId: string) {
    const [updated] = await db
      .update(users)
      .set({
        isBanned: true,
        banReason: reason,
        bannedAt: new Date(),
        bannedBy: adminId,
        tokenVersion: sql`coalesce(${users.tokenVersion}, 1) + 1`,
        sessionVersion: sql`coalesce(${users.sessionVersion}, 1) + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updated) {
      throw Object.assign(new Error('User not found'), { status: 404 });
    }

    return this.findById(userId);
  }

  async unbanUser(userId: string, adminId: string) {
    const [updated] = await db
      .update(users)
      .set({
        isBanned: false,
        banReason: null,
        bannedAt: null,
        bannedBy: null,
        tokenVersion: sql`coalesce(${users.tokenVersion}, 1) + 1`,
        sessionVersion: sql`coalesce(${users.sessionVersion}, 1) + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updated) {
      throw Object.assign(new Error('User not found'), { status: 404 });
    }

    return this.findById(userId);
  }
}
