import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseListParams, resolveDateRange } from './adminBookingController.js';

describe('AdminBookingController helpers', () => {
  it('parses defaults for list params', () => {
    const req = { query: {} } as unknown as Parameters<typeof parseListParams>[0];
    const params = parseListParams(req);

    assert.equal(params.page, 1);
    assert.equal(params.perPage, 25);
    assert.equal(params.sortField, 'createdAt');
    assert.equal(params.sortOrder, 'DESC');
    assert.equal(params.status, undefined);
    assert.equal(params.search, undefined);
    assert.equal(params.dateFrom, undefined);
    assert.equal(params.dateTo, undefined);
  });

  it('parses filters, search, and pagination with quick range', () => {
    const req = {
      query: {
        _page: '2',
        _perPage: '10',
        sortField: 'scheduledDate',
        sortOrder: 'ASC',
        status: 'pending',
        q: 'alice',
        dateRange: 'today',
      },
    } as unknown as Parameters<typeof parseListParams>[0];

    const params = parseListParams(req);

    assert.equal(params.page, 2);
    assert.equal(params.perPage, 10);
    assert.equal(params.sortField, 'scheduledDate');
    assert.equal(params.sortOrder, 'ASC');
    assert.equal(params.status, 'pending');
    assert.equal(params.search, 'alice');
    assert.ok(params.dateFrom instanceof Date);
    assert.ok(params.dateTo instanceof Date);
    assert.equal(
      params.dateTo?.getTime() && params.dateFrom?.getTime() && params.dateTo > params.dateFrom,
      true
    );
  });

  it('computes this_week date range starting on Monday', () => {
    const { from, to } = resolveDateRange('this_week');
    assert.ok(from instanceof Date);
    assert.ok(to instanceof Date);
    assert.equal(from?.getDay(), 1);
    const deltaDays = ((to?.getTime() ?? 0) - (from?.getTime() ?? 0)) / (1000 * 60 * 60 * 24);
    assert.equal(deltaDays, 7);
  });

  it('uses custom start and end dates when provided', () => {
    const { from, to } = resolveDateRange(undefined, '2024-01-10', '2024-01-12');
    assert.ok(from instanceof Date);
    assert.ok(to instanceof Date);
    assert.equal(from?.getHours(), 0);
    const diffDays = ((to?.getTime() ?? 0) - (from?.getTime() ?? 0)) / (1000 * 60 * 60 * 24);
    assert.equal(diffDays, 3);
  });
});
