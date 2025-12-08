import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { computePendingSteps } from './onboardingService.js';

describe('computePendingSteps', () => {
  it('returns all steps when no responses exist', () => {
    const pending = computePendingSteps(['kpop_lookalike', 'service_interests'], {});
    assert.deepEqual(pending, ['kpop_lookalike', 'service_interests']);
  });

  it('drops completed steps in order', () => {
    const pending = computePendingSteps(['kpop_lookalike', 'service_interests'], {
      kpop_lookalike: { done: true },
    });
    assert.deepEqual(pending, ['service_interests']);
  });
});
