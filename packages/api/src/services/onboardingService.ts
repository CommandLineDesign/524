import { onboardingResponses, users } from '@524/database';
import type {
  OnboardingResponseInput,
  OnboardingState,
  OnboardingStepKey,
} from '@524/shared/onboarding';
import { type OnboardingFlow, onboardingConfig } from '@524/shared/onboardingConfig';
import { and, asc, eq, sql } from 'drizzle-orm';

import { db } from '../db/client.js';

export function computePendingSteps(
  order: OnboardingStepKey[],
  responses: Partial<Record<OnboardingStepKey, unknown>>
) {
  return order.filter((step) => !responses[step]);
}

function djb2Hash(input: string) {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash);
}

function pickFlow(): OnboardingFlow {
  const flow = onboardingConfig.flows.find((f) => f.id === onboardingConfig.defaultFlowId);
  if (!flow) {
    throw new Error('No default onboarding flow configured');
  }
  return flow;
}

function pickVariant(userId: string, flow: OnboardingFlow) {
  const variants = flow.variants;
  if (!variants.length) {
    throw new Error('No variants configured for onboarding flow');
  }

  const totalWeight = variants.reduce((sum, v) => sum + (v.weight || 0), 0) || 1;
  const hash = djb2Hash(userId);
  const bucket = hash % totalWeight;

  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.weight || 0;
    if (bucket < cumulative) return variant;
  }
  return variants.find((v) => v.id === flow.defaultVariantId) || variants[0];
}

export class OnboardingService {
  private assignFlow(userId: string) {
    const flow = pickFlow();
    const variant = pickVariant(userId, flow);
    return { flow, variant };
  }

  async getState(userId: string): Promise<OnboardingState> {
    const { flow, variant } = this.assignFlow(userId);
    const stepOrder = variant.steps.map((s) => s.key);

    const [user] = await db
      .select({
        completed: users.onboardingCompleted,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const rows = await db
      .select({
        step: onboardingResponses.stepKey,
        data: onboardingResponses.response,
        version: onboardingResponses.version,
        isCompletedStep: onboardingResponses.isCompletedStep,
        createdAt: onboardingResponses.createdAt,
        updatedAt: onboardingResponses.updatedAt,
      })
      .from(onboardingResponses)
      .where(
        and(
          eq(onboardingResponses.userId, userId),
          eq(onboardingResponses.flowId, flow.id),
          eq(onboardingResponses.flowVersion, flow.version),
          eq(onboardingResponses.variantId, variant.id)
        )
      )
      .orderBy(asc(onboardingResponses.createdAt));

    const responses: OnboardingState['responses'] = {};
    for (const row of rows) {
      const step = row.step as OnboardingStepKey;
      responses[step] = {
        step,
        data: row.data as OnboardingResponseInput,
        version: row.version ?? 1,
        isCompletedStep: row.isCompletedStep ?? true,
        createdAt:
          row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
        updatedAt:
          row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
      };
    }

    const pendingSteps = computePendingSteps(stepOrder, responses);

    return {
      completed: Boolean(user?.completed),
      responses,
      pendingSteps,
      flowId: flow.id,
      flowVersion: flow.version,
      variantId: variant.id,
      steps: variant.steps.map((s) => ({
        key: s.key,
        title: s.title,
        subtitle: s.subtitle,
        required: s.required,
        shareWithStylist: s.shareWithStylist,
      })),
    };
  }

  async upsertResponse(userId: string, payload: OnboardingResponseInput): Promise<OnboardingState> {
    const { flow, variant } = this.assignFlow(userId);
    const stepDef = variant.steps.find((s) => s.key === payload.step);
    if (!stepDef) {
      throw Object.assign(new Error('Step not allowed for this variant'), { status: 400 });
    }

    await db
      .insert(onboardingResponses)
      .values({
        userId,
        flowId: flow.id,
        flowVersion: flow.version,
        variantId: variant.id,
        stepKey: payload.step,
        response: payload,
        isCompletedStep: true,
      })
      .onConflictDoUpdate({
        target: [
          onboardingResponses.userId,
          onboardingResponses.flowId,
          onboardingResponses.variantId,
          onboardingResponses.stepKey,
        ],
        set: {
          response: payload,
          isCompletedStep: true,
          updatedAt: new Date(),
          version: sql`${onboardingResponses.version} + 1`,
        },
      });

    const state = await this.getState(userId);
    const requiredSteps = variant.steps.filter((s) => s.required).map((s) => s.key);
    const remainingRequired = requiredSteps.filter((key) => !state.responses[key]);
    if (!remainingRequired.length && !state.completed) {
      await db
        .update(users)
        .set({ onboardingCompleted: true, updatedAt: new Date() })
        .where(eq(users.id, userId));
      return this.getState(userId);
    }

    return state;
  }

  async markComplete(userId: string): Promise<OnboardingState> {
    await db
      .update(users)
      .set({ onboardingCompleted: true, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return this.getState(userId);
  }

  /**
   * Get onboarding responses that are marked as shareWithStylist
   * Used to share customer preferences with artists for bookings
   */
  async getSharedResponses(customerId: string): Promise<
    Array<{
      stepKey: string;
      title: string;
      subtitle?: string;
      response: unknown;
    }>
  > {
    const { flow, variant } = this.assignFlow(customerId);

    // Get steps that are marked as shareWithStylist
    const sharedSteps = variant.steps.filter((s) => s.shareWithStylist);
    if (sharedSteps.length === 0) {
      return [];
    }

    const sharedStepKeys = sharedSteps.map((s) => s.key);

    // Get responses for shared steps
    const rows = await db
      .select({
        stepKey: onboardingResponses.stepKey,
        response: onboardingResponses.response,
      })
      .from(onboardingResponses)
      .where(
        and(
          eq(onboardingResponses.userId, customerId),
          eq(onboardingResponses.flowId, flow.id),
          eq(onboardingResponses.flowVersion, flow.version),
          eq(onboardingResponses.variantId, variant.id)
        )
      );

    // Filter to only shared steps and enrich with metadata
    const result = rows
      .filter((row) => sharedStepKeys.includes(row.stepKey as OnboardingStepKey))
      .map((row) => {
        const stepDef = sharedSteps.find((s) => s.key === row.stepKey);
        return {
          stepKey: row.stepKey,
          title: stepDef?.title || row.stepKey,
          subtitle: stepDef?.subtitle,
          response: row.response,
        };
      });

    return result;
  }
}
