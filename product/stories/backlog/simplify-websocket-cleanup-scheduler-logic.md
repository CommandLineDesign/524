# Simplify Websocket Cleanup Scheduler Logic

**Role**: Developer
**Priority**: Medium
**Status**: 📋 Backlog
**Dependencies**:

- None

**Estimated Effort**: S (1-2 days)

## Story Statement

**As a** Developer  
**I want** to simplify the adaptive cleanup scheduler logic in the websocket implementation  
**So that** the codebase is easier to maintain and understand while still providing effective resource management

## Detailed Description

The current websocket implementation includes an adaptive cleanup scheduler that may be over-engineered for typical usage patterns. The complex adaptive logic adds maintenance burden and potential for bugs without clear evidence that it provides meaningful benefits over simpler approaches. This story focuses on evaluating whether the adaptive behavior is necessary and either simplifying the logic or adding metrics to validate its value.

## Acceptance Criteria

### Functional Requirements

- **Given** websocket cleanup scheduler is running - **When** evaluating complexity vs benefit - **Then** either simplified logic is implemented or metrics are added to validate adaptive behavior
- **Given** simplified cleanup logic - **When** system runs under normal load - **Then** resource cleanup continues to work effectively
- **Given** metrics are added - **When** system operates - **Then** data shows whether adaptive behavior provides measurable benefits

### Non-Functional Requirements

- **Performance**: No degradation in cleanup effectiveness or system performance
- **Usability**: Code is easier to understand and maintain
- **Reliability**: Cleanup operations remain robust under various load conditions

## User Experience Flow

1. Developer reviews current adaptive cleanup scheduler implementation
2. Developer evaluates whether adaptive behavior provides clear benefits over simple periodic cleanup
3. Either simplified logic is implemented or comprehensive metrics are added
4. Changes are tested to ensure cleanup effectiveness is maintained

## Technical Context

- **Epic Integration**: Part of messaging feature reliability improvements
- **System Components**: Websocket connection management, cleanup scheduling
- **Data Requirements**: Connection tracking data, cleanup metrics
- **Integration Points**: Websocket service, connection tracking Maps

## Definition of Done

- [ ] Adaptive cleanup logic evaluated for necessity and complexity
- [ ] Either simplified implementation completed or metrics added for validation
- [ ] Code reviewed for maintainability improvements
- [ ] Testing confirms cleanup effectiveness maintained
- [ ] Documentation updated to reflect changes

## Notes

The adaptive cleanup scheduler in packages/api/src/websocket/chatSocket.ts:75-110 may be overly complex for typical usage patterns. Need to determine if the adaptive behavior provides meaningful benefits or if simpler periodic cleanup would suffice.