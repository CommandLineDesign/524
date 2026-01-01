import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { computePendingSteps } from './onboardingService.js';

describe('computePendingSteps', () => {
  it('returns all steps when no responses exist', () => {
    const pending = computePendingSteps(
      ['celebrity_lookalike', 'celebrity_similar_image', 'celebrity_admire', 'celebrity_result'],
      {}
    );
    assert.deepEqual(pending, [
      'celebrity_lookalike',
      'celebrity_similar_image',
      'celebrity_admire',
      'celebrity_result',
    ]);
  });

  it('drops completed steps in order', () => {
    const pending = computePendingSteps(
      ['celebrity_lookalike', 'celebrity_similar_image', 'celebrity_admire', 'celebrity_result'],
      {
        celebrity_lookalike: { done: true },
        celebrity_similar_image: { done: true },
      }
    );
    assert.deepEqual(pending, ['celebrity_admire', 'celebrity_result']);
  });
});
