import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

import { users } from '@524/database';

import { db } from '../db/client.js';

export interface UserQuery {
  page: number;
  perPage: number;
  sortField?: 'createdAt' | 'name' | 'email';
  sortOrder?: 'ASC' | 'DESC';
  role?: 'customer' | 'artist' | 'admin';
  search?: string;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string;
  phoneVerified: boolean;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function mapRowToUserListItem(row: typeof users.$inferSelect): UserListItem {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? null,
    phoneNumber: row.phoneNumber,
    phoneVerified: row.phoneVerified ?? false,
    role: row.role,
    isActive: row.isActive ?? true,
    isVerified: row.isVerified ?? false,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class UserRepository {
  async findById(userId: string) {
    const [record] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return record ?? null;
  }

  async findMany(query: UserQuery) {
    const offset = Math.max(query.page - 1, 0) * query.perPage;

    // Build where conditions
    const conditions = [];

    if (query.role) {
      conditions.push(eq(users.role, query.role));
    }

    if (query.search) {
      const searchTerm = `%${query.search}%`;
      const searchCondition = or(
        ilike(users.name, searchTerm),
        ilike(users.email ?? sql`''`, searchTerm),
        ilike(users.phoneNumber, searchTerm)
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
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(sortDirection)
      .limit(query.perPage)
      .offset(offset);

    // Get count
    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause ?? sql`1=1`);

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

    return updated;
  }
}
