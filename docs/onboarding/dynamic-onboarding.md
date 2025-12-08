# Dynamic Onboarding: Flows, Steps, and Variants

This doc explains how to add/remove onboarding steps, version flows, and prepare for A/B-style variants (without a remote flag service yet).

## Key pieces
- **Config**: `packages/shared/src/onboardingConfig.ts` defines flows, versions, variants, and step metadata (title/subtitle/required/shareWithStylist).
- **Types**: `packages/shared/src/onboarding.ts` exposes `OnboardingState`, `OnboardingStepKey`, and step metadata shapes.
- **Persistence**: `onboarding_responses` table stores `user_id`, `flow_id`, `flow_version`, `variant_id`, `step_key`, JSON `response`, version counter, and timestamps.
- **API**: `/api/v1/onboarding/state` returns the assigned `flowId`, `flowVersion`, `variantId`, ordered steps, responses, and completion flag. `/responses` saves a step, `/complete` can force-complete (auto-complete runs when required steps are filled).
- **Mobile**: `OnboardingFlowScreen` renders steps dynamically from the server-provided list using a step component registry.

## Adding a new step
1) **Define the step key**  
   - Add the key to `OnboardingStepKey` union in `packages/shared/src/onboarding.ts`.
   - Implement UI component mapped in the mobile step registry (see `OnboardingFlowScreen`).

2) **Add to config** (`packages/shared/src/onboardingConfig.ts`)  
   - Append the step to the desired variant’s `steps` array with `title`, `subtitle` (optional), `required`, and `shareWithStylist` flags.
   - If this materially changes the experience, bump `flow.version` (e.g., `v2`) to preserve history/analytics.

3) **Server validation**  
   - The API allows only steps present in the assigned variant; no extra code changes needed beyond updating config and the step key union/type imports where used.

4) **Mobile registry**  
   - Add the renderer for the new `stepKey` in `STEP_RENDERERS` inside `OnboardingFlowScreen`.
   - Use the provided metadata (title/subtitle) from `OnboardingState.steps` instead of hardcoding text.

## Removing or reordering steps
- **Remove**: Delete the step from the variant’s `steps`. Consider bumping `flow.version` if the meaning changes; old responses stay tied to the old version.
- **Reorder**: Change the order in the `steps` array. This controls the displayed order and the pending-step calculation.

## Versions and variants
- **Flow version** (`flowVersion`): Increment when the content/sequence meaningfully changes. Old answers stay associated with their original version via stored columns.
- **Variants**: Each flow can have multiple variants with `weight` for deterministic assignment (hash of userId). Change weights to rebalance traffic. Bump flow version if variants meaningfully change experience.
- **Future remote flags**: When a remote flag service is available, plug it into the flow/variant selector; storage shape (`flow_id`, `flow_version`, `variant_id`) already supports it.

## Sharing with stylists / admin visibility
- Use `shareWithStylist` on steps to drive what can be exposed in stylist-facing views.
- Admin and stylist APIs should hydrate responses with step metadata from config to render friendly Q&A. The step text itself is not stored; it is derived from the flow/version/variant + config.

## Analytics / A/B testing prep
- `flow_id`, `flow_version`, and `variant_id` allow segmentation of completion rates and per-step drop-off.
- Each step can carry an `analyticsTag` for consistent event names.

## FAQ
- **Does the DB store the exact question text?** No. It stores `step_key` + flow/version/variant. To preserve wording changes, keep historical versions in config; don’t overwrite old definitions without bumping `flow.version`.
- **How do we complete onboarding?** Required steps filled → auto-complete; `/complete` endpoint can force it. The mobile client also calls `/complete` after the last step for safety.
- **Can we add optional steps?** Yes. Set `required: false`; completion checks only required steps. Optional steps still store responses.
