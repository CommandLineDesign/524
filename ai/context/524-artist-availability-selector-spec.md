# Artist Weekly Availability Selector - Technical Specification

## Overview

Build a screen for artists to set their availability on a **week-by-week basis**. Artists select 30-minute time blocks using a click-and-drag rectangular selection pattern. Each week's availability is stored independently (not recurring), with a convenience feature to copy availability from the previous week.

---

## Requirements

### Core Functionality

1. **Week-by-week storage**: Each week is stored separately - this is NOT recurring/perpetual availability. When an artist sets availability for Feb 10-16, that only applies to that specific week.

2. **30-minute time slots**: Grid displays slots from 08:00-20:00 (configurable), with each row representing a 30-minute block.

3. **7-day week view**: Monday through Sunday displayed as columns.

4. **Rectangular drag selection**: 
   - User touches/clicks on one cell (e.g., Monday 9:00)
   - Drags to another cell (e.g., Friday 17:00)
   - All cells in the rectangle between those two points are selected
   - This allows quickly selecting "9am-5pm Monday through Friday" in a single gesture

5. **Toggle behavior**: 
   - If the starting cell is unselected → drag selects cells
   - If the starting cell is already selected → drag deselects cells

6. **Week navigation**: Arrow buttons to move forward/backward through weeks.

7. **Copy previous week**: One-tap action that copies the previous week's availability to the current week. Shows confirmation if current week already has selections.

### Quick Actions

- **"평일 09-17시 선택"** - Select standard work hours (Mon-Fri, 9am-5pm)
- **"이전 주 복사"** - Copy previous week's availability
- **"전체 초기화"** - Clear all selections for current week

### Visual Feedback

- Selected cells: Green/success color
- Unselected cells: Light gray/background color  
- Weekend columns: Slightly different background to distinguish
- During drag: Preview color showing what will be selected/deselected
- Summary: Display total hours selected for the week

---

## User Flow

```
1. Artist opens Availability screen
2. Current week is displayed (Mon-Sun)
3. Artist can:
   a. Drag to select time blocks
   b. Drag over selected blocks to deselect
   c. Use quick actions for common patterns
   d. Navigate to other weeks
   e. Copy from previous week
4. Artist taps "Save" to persist
5. Navigate to next week, repeat as needed
```

---

## Data Model

### Week Identification
Use ISO week format: `{year}-W{weekNumber}` (e.g., "2026-W07")

### Storage Structure
Each record represents one artist's availability for one specific week:

```
artist_availability:
  - artist_id: UUID
  - week_id: "2026-W07" 
  - slots: Array of time ranges
  - updated_at: timestamp
```

### Slot Format
Store as array of start/end time pairs:
```json
[
  {"start": "2026-02-09T09:00:00+09:00", "end": "2026-02-09T09:30:00+09:00"},
  {"start": "2026-02-09T09:30:00+09:00", "end": "2026-02-09T10:00:00+09:00"}
]
```

Or alternatively as a simpler format if preferred:
```json
["2026-02-09T09:00", "2026-02-09T09:30", "2026-02-09T10:00"]
```

The exact format should match existing patterns in the codebase.

---

## UI Layout

```
┌─────────────────────────────────────────────┐
│  근무 가능 시간 설정                          │
│  Set Your Availability                       │
├─────────────────────────────────────────────┤
│     ←    2/10 - 2/16    →                   │  ← Week navigator
├─────────────────────────────────────────────┤
│ [평일 09-17시] [이전 주 복사] [초기화]         │  ← Quick actions
├─────────────────────────────────────────────┤
│ Tip: 드래그하여 시간대를 선택하세요            │
├─────────────────────────────────────────────┤
│      │ 월  │ 화  │ 수  │ 목  │ 금  │ 토  │ 일 │
│      │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun│
│──────┼─────┼─────┼─────┼─────┼─────┼─────┼────│
│ 08:00│     │     │     │     │     │     │    │
│ 08:30│     │     │     │     │     │     │    │
│ 09:00│ ███ │ ███ │ ███ │ ███ │ ███ │     │    │
│ 09:30│ ███ │ ███ │ ███ │ ███ │ ███ │     │    │
│ 10:00│ ███ │ ███ │ ███ │ ███ │ ███ │     │    │
│  ... │ ... │ ... │ ... │ ... │ ... │     │    │
│ 17:00│ ███ │ ███ │ ███ │ ███ │ ███ │     │    │
│ 17:30│     │     │     │     │     │     │    │
├─────────────────────────────────────────────┤
│  이번 주 선택된 시간: 40.0 시간               │  ← Summary
├─────────────────────────────────────────────┤
│           [ 저장하기 (Save) ]                │  ← Fixed footer
└─────────────────────────────────────────────┘
```

---

## Gesture Handling

The key interaction is **pan/drag gesture** that selects a rectangular region:

1. **On gesture start**: 
   - Record the starting cell (row, column)
   - Check if starting cell is selected → determines if we're selecting or deselecting

2. **On gesture update**:
   - Calculate current cell from touch position
   - Compute all cells in rectangle from start to current
   - Show visual preview of affected cells

3. **On gesture end**:
   - Apply the selection/deselection to all cells in rectangle
   - Clear drag state

### Cell-from-position calculation
```
col = floor(touchX / cellWidth)  // 0-6 for Mon-Sun
row = floor(touchY / cellHeight) // 0-N for time slots
```

### Rectangle calculation
```
minRow = min(startRow, endRow)
maxRow = max(startRow, endRow)
minCol = min(startCol, endCol)
maxCol = max(startCol, endCol)

for row in minRow..maxRow:
  for col in minCol..maxCol:
    affectedCells.add(row, col)
```

---

## API Endpoints

### Get availability for a week
```
GET /api/artists/:artistId/availability/:weekId

Response: { data: { weekId, slots, updatedAt } | null }
```

### Update availability for a week
```
PUT /api/artists/:artistId/availability/:weekId

Body: { slots: [...] }
Response: { data: { weekId, slots, updatedAt } }
```

### Get availability for multiple weeks (optional, for preloading)
```
GET /api/artists/:artistId/availability?startWeek=2026-W05&endWeek=2026-W08

Response: { data: [{ weekId, slots, updatedAt }, ...] }
```

---

## Implementation Notes

### Follow existing patterns
- Use the project's existing state management approach
- Use existing styling patterns (StyleSheet with theme tokens)
- Use existing gesture handling libraries already in the project
- Use existing date utilities (likely date-fns based on project setup)

### Do not add new dependencies unless necessary
- The required gesture handling should already be available via react-native-gesture-handler
- Date manipulation should use whatever date library is already in use

### Key components to create
- Main screen component (e.g., `AvailabilityScreen.tsx`)
- Grid component with gesture handling
- Week navigation component  
- Quick action buttons component
- Summary component
- Utility functions for week ID calculation and cell↔slot conversion

### Testing considerations
- Test rectangular selection with various drag directions
- Test toggle behavior (select vs deselect)
- Test week navigation preserves/loads correct data
- Test copy from previous week
- Test on both iOS and Android (gesture handling can differ)

---

## Accessibility

- Cells should have accessibility labels (e.g., "Monday 9:00, selected")
- Week navigation should announce the new week range
- Consider alternative tap-to-toggle mode for users who have difficulty with drag gestures
- Ensure adequate color contrast for selected/unselected states

---

## Edge Cases

1. **Empty previous week**: When copying, if previous week has no availability, show appropriate message
2. **Navigating away with unsaved changes**: Prompt to save or discard
3. **Network errors**: Handle save failures gracefully with retry option
4. **Very long selections**: Ensure performance is acceptable when selecting entire week
5. **Timezone handling**: Store times in KST (Asia/Seoul) consistently

---

## Out of Scope (for this spec)

- Recurring availability templates (e.g., "apply this to all future weeks")
- Availability conflicts with existing bookings
- Buffer time between appointments
- Different availability for different service types

These can be added in future iterations.

---

## Reference

The interaction pattern is similar to [when2meet.com](https://when2meet.com) - a grid-based schedule selector where users drag to "paint" their availability. The key difference is that when2meet is for one-time group scheduling, whereas this is for week-by-week individual availability management.

An interactive HTML demo of this pattern is available for reference (see `availability-demo.html`).
