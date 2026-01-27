# Code Review: New Customer Onboarding - Idol Dropdown Flow

**Date:** 2026-01-27
**Base Ref:** origin/main
**Feature Ref:** jl/new-customer-onboarding
**Reviewer:** AI Code Review Assistant

---

## High-Level Summary

**Product impact:** This change introduces a new idol/celebrity selection experience for the onboarding flow, replacing free-text input with a typeahead dropdown featuring a curated list of ~80 Korean celebrities. Users now select from predefined options across three questions, with visual progress indicated via a Venn diagram component. The experience culminates in a confirmation screen displaying their selected idol.

**Engineering approach:** The implementation follows the existing booking flow architecture, adding feature-flagged step renderers that can toggle between the original text input and the new dropdown flow. New reusable components (`IdolTypeahead`, `VennDiagram`) are added with proper TypeScript typing, memoization for performance, and consistent styling patterns. The `react-native-svg` dependency is added to support the diagram visualization.

---

## Prioritized Issues

### Critical

*None identified*

### Major

- [status:done] File: `packages/mobile/src/screens/booking/entry/IdolConfirmationScreen.tsx:22-28`
  - Issue: Side effect (`setResultCelebrity`) called inside `useMemo` computation violates React's rules of hooks - memoized values should be pure calculations without side effects
  - Fix: Move the `setResultCelebrity` call to a `useEffect` hook that runs when the derived value changes:
    ```tsx
    const displayIdol = useMemo(() => {
      if (resultCelebrity) return resultCelebrity;
      return celebrities.lookalike || celebrities.similarImage || celebrities.admire || '아이유';
    }, [celebrities, resultCelebrity]);

    useEffect(() => {
      if (!resultCelebrity && displayIdol !== '아이유') {
        setResultCelebrity(displayIdol);
      }
    }, [displayIdol, resultCelebrity, setResultCelebrity]);
    ```
  - Applied: Moved side effect to useEffect, extracted DEFAULT_IDOL constant

### Minor

- [status:done] File: `packages/mobile/src/components/onboarding/IdolTypeahead.tsx:64-67`
  - Issue: `setTimeout` in `handleBlur` lacks cleanup, risking state updates on unmounted components
  - Fix: Use `useRef` to track mount state or return a cleanup function:
    ```tsx
    const timeoutRef = useRef<NodeJS.Timeout>();

    const handleBlur = useCallback(() => {
      timeoutRef.current = setTimeout(() => {
        setIsFocused(false);
      }, BLUR_DELAY_MS);
    }, []);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, []);
    ```
  - Applied: Added blurTimeoutRef and cleanup useEffect

- [status:done] File: `packages/mobile/src/screens/booking/entry/IdolConfirmationScreen.tsx:27`
  - Issue: Hardcoded fallback string `'아이유'` is a magic value that appears in multiple places
  - Fix: Extract to a constant in `bookingOptions.ts` (e.g., `DEFAULT_IDOL`) and import where needed
  - Applied: Created DEFAULT_IDOL constant in bookingOptions.ts, updated all usages

- [status:done] File: `packages/mobile/src/screens/OnboardingFlowScreen.tsx:20`
  - Issue: Feature flag `useIdolDropdown` is evaluated at module load time (outside component), meaning environment variable changes require app restart
  - Fix: If runtime toggling is needed, move the evaluation inside the component or use a hook. If startup-only evaluation is intentional, add a comment clarifying this behavior
  - Applied: Added clarifying comment explaining intentional module-level evaluation

### Enhancement

- [status:done] File: `packages/mobile/src/components/onboarding/IdolTypeahead.tsx`
  - Issue: Missing accessibility attributes for screen reader support
  - Fix: Add `accessibilityLabel`, `accessibilityHint`, and `accessibilityRole="combobox"` to the input, and `accessibilityRole="option"` to dropdown items
  - Applied: Added accessibilityLabel, accessibilityHint, accessibilityRole to input and dropdown items

- [status:done] File: `packages/mobile/src/components/onboarding/VennDiagram.tsx:17-20`
  - Issue: Magic numbers for circle positioning calculations lack explanation
  - Fix: Add brief comments explaining the geometry (e.g., `0.866` is `cos(30°)` for equilateral triangle positioning)
  - Applied: Added comments explaining 0.866=cos(30°) and triangle geometry

- [status:story] File: `packages/mobile/src/constants/idols.ts`
  - Issue: Hardcoded idol list will require code changes to update; consider whether this should be configurable or fetched from a backend
  - Fix: Evaluate whether to migrate to a remote config or API endpoint for easier content updates without app releases
  - Story: [Remote Idol List Configuration](../stories/remote-idol-list-configuration.md)

---

## Highlights

- **Clean component architecture**: `IdolTypeahead` and `VennDiagram` are well-encapsulated, reusable components with clear props interfaces and TypeScript types
- **Performance-conscious implementation**: Appropriate use of `useMemo`, `useCallback`, and `FlatList` optimizations (`initialNumToRender`, `maxToRenderPerBatch`) in the typeahead
- **Feature flag pattern**: Clean feature flag implementation allows A/B testing between input methods without code duplication
- **Consistent styling**: Components follow the existing theme system (`colors`, `spacing`, `borderRadius`) maintaining visual consistency
- **Cross-platform consideration**: Web-specific outline style handling in `IdolTypeahead` shows attention to multi-platform rendering
- **Type safety**: Proper use of `as const` assertions and derived types (`IdolName`) ensures compile-time safety for idol selections
