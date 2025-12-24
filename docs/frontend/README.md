# 524 Frontend Documentation

This directory contains the complete frontend development documentation suite for the 524 Beauty Marketplace React Native mobile application.

## 📚 Documentation Suite

### [Frontend Standards](./frontend-standards.md) ⭐ **PRIMARY REFERENCE**
**Comprehensive guide for React Native development standards and best practices.**

**Contents:**
- Project structure and organization
- Component architecture (Screen, Presentational, Container)
- Styling standards (StyleSheet API, design tokens)
- TypeScript best practices
- State management (Zustand, React Query)
- Performance optimization
- Accessibility guidelines
- Testing standards
- Code quality requirements
- Component library patterns
- Korean market considerations

**When to use:**
- Starting any new component
- Implementing UI from Figma
- Setting up state management
- Writing tests
- Ensuring code quality
- Performance optimization

---

### [Frontend Quick Reference](./frontend-quick-reference.md) ⭐ **QUICK LOOKUP**
**Fast reference guide for common patterns and code snippets.**

**Contents:**
- Design tokens quick reference
- Component templates (ready to copy)
- Screen templates
- React Query hook templates
- Zustand store templates
- Common patterns (FlatList, forms, modals)
- Accessibility quick reference
- Testing templates
- Performance checklist
- Common mistakes to avoid

**When to use:**
- Need a quick code template
- Looking up design token values
- Finding common patterns
- Quick accessibility reference

---

### [Figma Implementation Guide](./figma-implementation-guide.md) ⭐ **UI REBUILD**
**Step-by-step guide for translating Figma designs to React Native.**

**Contents:**
- Pre-implementation checklist
- Design token extraction process
- Component breakdown methodology
- Asset preparation and export
- Implementation step-by-step
- Responsive design considerations
- Animation implementation
- Figma → React Native translation table
- Quality checklist
- Troubleshooting common issues
- Complete implementation example

**When to use:**
- Implementing designs from Figma
- Extracting design tokens
- Handling responsive layouts
- Implementing animations
- Troubleshooting visual inconsistencies

---

### [Component Checklist](./component-checklist.md) ⭐ **QUALITY ASSURANCE**
**Comprehensive checklist for creating and reviewing React Native components.**

**Contents:**
- Pre-development planning
- Component structure requirements
- Styling standards verification
- TypeScript type safety checks
- Performance optimization checklist
- Accessibility requirements
- State management validation
- Interactive states verification
- Testing requirements
- Platform testing (iOS/Android)
- Internationalization checks
- Code quality standards
- Final review checklist

**When to use:**
- Creating any new component
- Reviewing component code
- Ensuring quality standards
- Before submitting for code review
- Training new developers

---

## 🎯 Quick Start Guides

### Creating a New Component
1. Review [Component Checklist](./component-checklist.md#-pre-development)
2. Read [Frontend Standards](./frontend-standards.md#component-architecture)
3. Use template from [Quick Reference](./frontend-quick-reference.md#component-template)
4. Apply design tokens from [Quick Reference](./frontend-quick-reference.md#design-tokens)
5. Add tests using [Quick Reference](./frontend-quick-reference.md#testing-quick-reference)
6. Verify with [Component Checklist](./component-checklist.md#-final-checks)

### Implementing from Figma
1. Follow [Figma Implementation Guide](./figma-implementation-guide.md) step-by-step
2. Extract design tokens using [Figma Guide](./figma-implementation-guide.md#1-design-analysis)
3. Apply [Frontend Standards](./frontend-standards.md#styling-standards)
4. Verify with [Figma Guide](./figma-implementation-guide.md#quality-checklist)

---

## 🎨 Design System

### Design Tokens Location
All design tokens are centralized in `packages/mobile/src/theme/`:

```
theme/
├── colors.ts          # Color palette
├── spacing.ts         # Spacing scale
├── typography.ts      # Font sizes, weights, line heights
├── borderRadius.ts    # Border radius values
├── shadows.ts         # Shadow configurations
└── index.ts          # Exports all tokens
```

### Usage
```typescript
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
```

See [Frontend Standards](./frontend-standards.md#design-tokens-system) for complete documentation.

---

## 📱 Component Library

### Common Components Location
Reusable components are in `packages/mobile/src/components/common/`:

- `Button.tsx` - Primary, secondary, outline, ghost variants
- `Input.tsx` - Text input with label, error, helper text
- `Card.tsx` - Elevated, outlined, flat variants
- `LoadingSpinner.tsx` - Loading indicators
- `ErrorMessage.tsx` - Error display with retry

See [Frontend Standards](./frontend-standards.md#component-library) for implementation details.

---

## 🧪 Testing

### Test Files Location
- Unit tests: Next to component files (e.g., `Button.test.tsx`)
- Integration tests: `packages/mobile/src/__tests__/`

### Testing Resources
- [Frontend Standards](./frontend-standards.md#testing-standards)
- [Quick Reference](./frontend-quick-reference.md#testing-quick-reference)

---

## ✅ Code Quality Standards

### Required Before Committing
- [ ] TypeScript strict mode compliance
- [ ] All styles use design tokens
- [ ] Accessibility labels added
- [ ] Tests written for new functionality
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Follows naming conventions

See [Component Checklist](./component-checklist.md) for complete checklist.

---

## 🔍 "How do I...?"

| Question | Document | Section |
|----------|----------|---------|
| Create a new component? | [Component Checklist](./component-checklist.md) | Complete Checklist |
| Review a component? | [Component Checklist](./component-checklist.md) | Review Checklist |
| Style a component? | [Frontend Standards](./frontend-standards.md) | Styling Standards |
| Fetch data from API? | [Quick Reference](./frontend-quick-reference.md) | React Query Template |
| Implement from Figma? | [Figma Implementation Guide](./figma-implementation-guide.md) | Step-by-Step Process |
| Add global state? | [Quick Reference](./frontend-quick-reference.md) | Zustand Store Template |
| Optimize performance? | [Frontend Standards](./frontend-standards.md) | Performance Optimization |
| Write tests? | [Quick Reference](./frontend-quick-reference.md) | Testing Quick Reference |
| Add accessibility? | [Frontend Standards](./frontend-standards.md) | Accessibility |

---

## 🚀 Best Practices Summary

### DO ✅
- Use design tokens for all styling
- Follow TypeScript strict mode
- Add accessibility labels
- Write tests for components
- Optimize performance (memo, useCallback)
- Handle loading and error states
- Use React Query for server state
- Follow naming conventions

### DON'T ❌
- Hardcode colors or spacing values
- Use `any` type in TypeScript
- Skip accessibility
- Use inline styles
- Forget error handling
- Use ScrollView for long lists
- Skip tests
- Leave console.log statements

---

## 📝 Document Maintenance

These documents are living standards. When you discover new patterns or best practices:

1. Update the relevant document
2. Add examples if helpful
3. Update this README if adding new sections
4. Keep the Quick Reference in sync with Frontend Standards

---

## 🔗 Related Documentation

- [AI Context Documentation](../ai/context/README.md) - Core technical docs and navigation
- [524 Technical Specification](../ai/context/524-technical-specification.md) - System architecture
- [Beauty Marketplace Screens](../ai/context/beauty-marketplace-screens%20(2).md) - UI structure

---

**Documentation Version**: 1.0
**Last Updated**: December 2024
**Maintained By**: 524 Development Team

---

## Quick Links

- [Component Checklist](./component-checklist.md) ⭐
- [Frontend Standards](./frontend-standards.md) ⭐
- [Quick Reference](./frontend-quick-reference.md) ⭐
- [Figma Implementation Guide](./figma-implementation-guide.md) ⭐

