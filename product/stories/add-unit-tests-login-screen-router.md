# Add Unit Tests for Login Screen Router Component

**Role**: Developer
**Priority**: Medium
**Status**: ⏳ Not Started
**Dependencies**:

- None

**Estimated Effort**: S (1-2 days)

## Story Statement

**As a** Developer  
**I want** unit tests for the LoginScreen router component  
**So that** I can ensure the component correctly renders dev or production login screens based on configuration

## Detailed Description

The LoginScreen component acts as a router that conditionally renders either the DevLoginScreen or NewLoginScreen based on the `config.useDevLogin` value. Currently, this critical routing logic has no test coverage, which means changes to the configuration or component logic could introduce bugs without being caught.

Adding comprehensive unit tests will ensure the routing behavior works correctly and provide confidence when making changes to the login screen logic. This is especially important since the component handles different environments (dev vs prod) and the wrong screen being shown could affect development workflow or production user experience.

## Acceptance Criteria

### Functional Requirements

- **Given** `config.useDevLogin` is true - **When** LoginScreen renders - **Then** DevLoginScreen component is rendered
- **Given** `config.useDevLogin` is false - **When** LoginScreen renders - **Then** NewLoginScreen component is rendered
- **Given** configuration changes during runtime - **When** LoginScreen re-renders - **Then** correct screen is displayed based on new config value
- **Given** navigation props are passed - **When** LoginScreen renders - **Then** navigation props are forwarded to the rendered screen component

### Non-Functional Requirements

- **Performance**: Tests execute quickly and don't impact development workflow
- **Maintainability**: Tests are clear and easy to understand for future developers
- **Coverage**: Tests cover all conditional branches and edge cases

## User Experience Flow

1. Developer runs test suite during development
2. System executes LoginScreen router tests
3. Tests verify correct screen rendering based on configuration
4. Developer receives feedback on routing logic correctness
5. Tests prevent regressions when modifying login screen logic

## Technical Context

- **Epic Integration**: Part of the login screen testing and quality assurance epic
- **System Components**: LoginScreen.tsx router component, Jest testing framework
- **Data Requirements**: Mock configuration values for testing
- **Integration Points**: React Native Testing Library, Jest mocks for configuration

## Definition of Done

- [ ] Unit test file created for LoginScreen component
- [ ] Tests cover both dev and prod login screen routing scenarios
- [ ] Configuration mocking implemented correctly
- [ ] Navigation prop forwarding tested
- [ ] Tests pass consistently in CI/CD pipeline
- [ ] Test coverage meets project standards (80%+)
- [ ] Code reviewed and approved

## Notes

The tests should use React Native Testing Library for component testing and Jest for mocking the configuration. Consider testing both the initial render and re-renders when configuration changes to ensure the component responds correctly to dynamic configuration updates.
