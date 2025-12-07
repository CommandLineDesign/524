import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { hasAllowedRole, isArtistVerified, selectPrimaryRole } from './roleHelpers.js';

describe('roleHelpers', () => {
  it('selectPrimaryRole prefers admin/support over artist/customer', () => {
    assert.equal(selectPrimaryRole(['customer', 'artist']), 'artist');
    assert.equal(selectPrimaryRole(['customer', 'admin']), 'admin');
    assert.equal(selectPrimaryRole(['support', 'artist']), 'support');
    assert.equal(selectPrimaryRole([]), 'customer');
  });

  it('hasAllowedRole validates membership', () => {
    assert.equal(hasAllowedRole(['artist', 'customer'], ['artist']), true);
    assert.equal(hasAllowedRole(['customer'], ['artist']), false);
    assert.equal(hasAllowedRole(undefined, ['artist']), false);
    assert.equal(hasAllowedRole(['customer'], []), true);
  });

  it('isArtistVerified requires artist role and verified status', () => {
    assert.equal(isArtistVerified(['artist'], 'verified'), true);
    assert.equal(isArtistVerified(['artist'], 'pending_review'), false);
    assert.equal(isArtistVerified(['customer'], 'verified'), false);
  });
});
