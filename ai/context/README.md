# 524 AI Context Documentation

This folder contains core technical documentation and context for AI agents working on the 524 Beauty Marketplace project.

## 📚 Documentation Index

### Core Technical Documentation

#### [524 Technical Specification](./524-technical-specification.md)
Complete technical architecture and specifications for the entire 524 platform.

**Contents:**
- System overview and architecture
- Tech stack (React Native, Node.js, PostgreSQL)
- Data models and database schemas
- API design and endpoints
- Korean market integrations (Kakao Pay, Naver Pay, etc.)
- Authentication and authorization
- Real-time features (Socket.io)
- Payment processing
- Deployment and infrastructure
- Security and compliance (PIPA)

**When to use:** Understanding overall system architecture, API endpoints, data models, or Korean market-specific integrations.

---

#### [Beauty Marketplace Screens](./beauty-marketplace-screens%20(2).md)
Screen-by-screen breakdown of the mobile application UI.

**Contents:**
- Complete screen inventory
- User flows for customers and artists
- Screen purposes and functionality
- Navigation structure

**When to use:** Understanding the app's screen structure, user flows, or planning new features.

---

### Frontend Development Standards

📁 **Frontend documentation has been moved to [`docs/frontend/`](../docs/frontend/) for better organization.**

The frontend documentation suite includes:

#### [Frontend Standards](../docs/frontend/frontend-standards.md) ⭐ **PRIMARY REFERENCE**
**Comprehensive guide for React Native development standards and best practices.**

#### [Frontend Quick Reference](../docs/frontend/frontend-quick-reference.md) ⭐ **QUICK LOOKUP**
**Fast reference guide for common patterns and code snippets.**

#### [Figma Implementation Guide](../docs/frontend/figma-implementation-guide.md) ⭐ **UI REBUILD**
**Step-by-step guide for translating Figma designs to React Native.**

#### [Component Checklist](../docs/frontend/component-checklist.md) ⭐ **QUALITY ASSURANCE**
**Comprehensive checklist for creating and reviewing React Native components.**

---

🔗 **Quick Links to Frontend Documentation:**
- [Frontend Standards](../docs/frontend/frontend-standards.md)
- [Quick Reference](../docs/frontend/frontend-quick-reference.md)
- [Figma Implementation Guide](../docs/frontend/figma-implementation-guide.md)
- [Component Checklist](../docs/frontend/component-checklist.md)

---

## 🎯 Quick Start for Common Tasks

### Starting a New Component

1. Review [Component Checklist - Pre-Development](../docs/frontend/component-checklist.md#-pre-development)
2. Read [Frontend Standards - Component Architecture](../docs/frontend/frontend-standards.md#component-architecture)
3. Use template from [Quick Reference - Component Template](../docs/frontend/frontend-quick-reference.md#component-template)
4. Apply design tokens from [Quick Reference - Design Tokens](../docs/frontend/frontend-quick-reference.md#design-tokens)
5. Add tests using [Quick Reference - Testing](../docs/frontend/frontend-quick-reference.md#testing-quick-reference)
6. Verify with [Component Checklist - Final Checks](../docs/frontend/component-checklist.md#-final-checks)

### Implementing from Figma

1. Follow [Figma Implementation Guide](../docs/frontend/figma-implementation-guide.md) step-by-step
2. Extract design tokens using [Figma Guide - Design Analysis](../docs/frontend/figma-implementation-guide.md#1-design-analysis)
3. Apply [Frontend Standards - Styling Standards](../docs/frontend/frontend-standards.md#styling-standards)
4. Verify with [Figma Guide - Quality Checklist](../docs/frontend/figma-implementation-guide.md#quality-checklist)

### Adding Data Fetching

1. Use [Quick Reference - React Query Template](../docs/frontend/frontend-quick-reference.md#react-query-hook-template)
2. Follow [Frontend Standards - State Management](../docs/frontend/frontend-standards.md#state-management)
3. Reference [Technical Spec - API Endpoints](./524-technical-specification.md#restful-endpoints)

### Creating a New Screen

1. Use [Quick Reference - Screen Template](../docs/frontend/frontend-quick-reference.md#screen-template)
2. Follow [Frontend Standards - Screen Components](../docs/frontend/frontend-standards.md#1-screen-components)
3. Reference [Beauty Marketplace Screens](./beauty-marketplace-screens%20(2).md) for context

### Optimizing Performance

1. Check [Frontend Standards - Performance Optimization](../docs/frontend/frontend-standards.md#performance-optimization)
2. Use [Quick Reference - Performance Checklist](../docs/frontend/frontend-quick-reference.md#performance-checklist)
3. Apply memoization patterns from [Quick Reference - Common Patterns](../docs/frontend/frontend-quick-reference.md#common-patterns)

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

See [Frontend Standards - Design Tokens System](./frontend-standards.md#design-tokens-system) for complete documentation.

---

## 📱 Component Library

### Common Components Location
Reusable components are in `packages/mobile/src/components/common/`:

- `Button.tsx` - Primary, secondary, outline, ghost variants
- `Input.tsx` - Text input with label, error, helper text
- `Card.tsx` - Elevated, outlined, flat variants
- `LoadingSpinner.tsx` - Loading indicators
- `ErrorMessage.tsx` - Error display with retry

See [Frontend Standards - Component Library](./frontend-standards.md#component-library) for implementation details.

---

## 🧪 Testing

### Test Files Location
- Unit tests: Next to component files (e.g., `Button.test.tsx`)
- Integration tests: `packages/mobile/src/__tests__/`

### Testing Resources
- [Frontend Standards - Testing Standards](./frontend-standards.md#testing-standards)
- [Quick Reference - Testing Templates](./frontend-quick-reference.md#testing-quick-reference)

---

## 🌏 Korean Market Specifics

### Key Integrations
- **Authentication**: Kakao, Naver, Apple OAuth + Phone OTP
- **Payments**: Kakao Pay, Naver Pay, Toss
- **Maps**: Naver Maps, Kakao Local API
- **SMS**: Naver Cloud SENS
- **Language**: Korean primary, English secondary

### Resources
- [Technical Spec - Korean Market Integrations](./524-technical-specification.md#korean-market-localization)
- [Frontend Standards - Korean Market Considerations](./frontend-standards.md#korean-market-specific-considerations)

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

See [Frontend Standards - Code Quality](./frontend-standards.md#code-quality) for complete checklist.

---

## 🔍 Finding Information

### "How do I...?"

| Question | Document | Section |
|----------|----------|---------|
| Create a new component? | [Component Checklist](../docs/frontend/component-checklist.md) | Complete Checklist |
| Review a component? | [Component Checklist](../docs/frontend/component-checklist.md) | Review Checklist |
| Style a component? | [Frontend Standards](../docs/frontend/frontend-standards.md) | Styling Standards |
| Fetch data from API? | [Quick Reference](../docs/frontend/frontend-quick-reference.md) | React Query Template |
| Implement from Figma? | [Figma Guide](../docs/frontend/figma-implementation-guide.md) | Step-by-Step Process |
| Add global state? | [Quick Reference](../docs/frontend/frontend-quick-reference.md) | Zustand Store Template |
| Optimize performance? | [Frontend Standards](../docs/frontend/frontend-standards.md) | Performance Optimization |
| Write tests? | [Quick Reference](../docs/frontend/frontend-quick-reference.md) | Testing Quick Reference |
| Add accessibility? | [Frontend Standards](../docs/frontend/frontend-standards.md) | Accessibility |
| Find API endpoints? | [Technical Spec](./524-technical-specification.md) | API Design |
| Understand data models? | [Technical Spec](./524-technical-specification.md) | Data Model |

---

## 📖 Document Priority for Agents

### For Frontend Development Tasks:
1. **[Component Checklist](../docs/frontend/component-checklist.md)** - Quality assurance for all components
2. **[Frontend Standards](../docs/frontend/frontend-standards.md)** - Primary reference for all frontend work
3. **[Quick Reference](../docs/frontend/frontend-quick-reference.md)** - Fast lookup for patterns and templates
4. **[Figma Implementation Guide](../docs/frontend/figma-implementation-guide.md)** - When working with designs
5. **[Technical Specification](./524-technical-specification.md)** - For API and data model reference

### For Understanding System Architecture:
1. **[Technical Specification](./524-technical-specification.md)** - Complete system overview
2. **[Beauty Marketplace Screens](./beauty-marketplace-screens%20(2).md)** - UI structure

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

## 🤝 Contributing

When working on the 524 project:

1. **Read the standards first** - Don't guess, follow the documented patterns
2. **Use the templates** - They're designed to be copied and modified
3. **Check the quick reference** - Save time with ready-made snippets
4. **Follow the Figma guide** - For consistent UI implementation
5. **Test your work** - Use the testing templates provided
6. **Ask questions** - If something isn't clear, it should be documented better

---

**Documentation Version**: 1.0  
**Last Updated**: December 2024  
**Maintained By**: 524 Development Team

---

## Quick Links

- [Component Checklist](../docs/frontend/component-checklist.md) ⭐
- [Frontend Standards](../docs/frontend/frontend-standards.md) ⭐
- [Quick Reference](../docs/frontend/frontend-quick-reference.md) ⭐
- [Figma Implementation Guide](../docs/frontend/figma-implementation-guide.md) ⭐
- [Technical Specification](./524-technical-specification.md)
- [Beauty Marketplace Screens](./beauty-marketplace-screens%20(2).md)

