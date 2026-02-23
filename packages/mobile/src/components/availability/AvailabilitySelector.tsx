import React, { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import { borderRadius, colors, overlays, spacing } from '../../theme';
import {
  DAY_NAMES_KO,
  TIME_SLOTS,
  calculateTotalHours,
  cellToSlotKey,
  isWeekend,
} from '../../utils/weekUtils';
import { QuickActions } from './QuickActions';
import { WeekNavigator } from './WeekNavigator';

export interface AvailabilitySelectorProps {
  weekId: string;
  selectedSlots: Set<string>;
  onSlotsChange: (slots: Set<string>) => void;
  onWeekChange: (weekId: string) => void;
  previousWeekSlots?: Set<string>;
  isLoading?: boolean;
  showQuickActions?: boolean;
  showWeekNavigator?: boolean;
  showSummary?: boolean;
}

interface DragState {
  startRow: number;
  startCol: number;
  currentRow: number;
  currentCol: number;
  isSelecting: boolean; // true = selecting, false = deselecting
}

const CELL_HEIGHT = 36;
const TIME_COLUMN_WIDTH = 50;
const HEADER_HEIGHT = 44;

export function AvailabilitySelector({
  weekId,
  selectedSlots,
  onSlotsChange,
  onWeekChange,
  previousWeekSlots,
  isLoading = false,
  showQuickActions = true,
  showWeekNavigator = true,
  showSummary = true,
}: AvailabilitySelectorProps) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [gridWidth, setGridWidth] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const cellWidth = useMemo(() => {
    if (gridWidth === 0) return 40;
    return (gridWidth - TIME_COLUMN_WIDTH) / 7;
  }, [gridWidth]);

  const handleGridLayout = useCallback((event: LayoutChangeEvent) => {
    setGridWidth(event.nativeEvent.layout.width);
  }, []);

  // Convert touch position to grid cell
  const positionToCell = useCallback(
    (x: number, y: number): { row: number; col: number } | null => {
      // Adjust for time column
      const adjustedX = x - TIME_COLUMN_WIDTH;
      if (adjustedX < 0) return null;

      const col = Math.floor(adjustedX / cellWidth);
      const row = Math.floor(y / CELL_HEIGHT);

      // Clamp to valid range
      if (col < 0 || col > 6) return null;
      if (row < 0 || row >= TIME_SLOTS.length) return null;

      return { row, col };
    },
    [cellWidth]
  );

  // Get all cells in the rectangle between start and current
  const getCellsInRectangle = useCallback(
    (
      startRow: number,
      startCol: number,
      endRow: number,
      endCol: number
    ): Array<{ row: number; col: number }> => {
      const minRow = Math.min(startRow, endRow);
      const maxRow = Math.max(startRow, endRow);
      const minCol = Math.min(startCol, endCol);
      const maxCol = Math.max(startCol, endCol);

      const cells: Array<{ row: number; col: number }> = [];
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          cells.push({ row, col });
        }
      }
      return cells;
    },
    []
  );

  // Check if a cell is in the current drag preview
  const isCellInDragPreview = useCallback(
    (row: number, col: number): boolean => {
      if (!dragState) return false;
      const cells = getCellsInRectangle(
        dragState.startRow,
        dragState.startCol,
        dragState.currentRow,
        dragState.currentCol
      );
      return cells.some((c) => c.row === row && c.col === col);
    },
    [dragState, getCellsInRectangle]
  );

  // Apply the drag selection/deselection
  const applyDragSelection = useCallback(() => {
    if (!dragState) return;

    const cells = getCellsInRectangle(
      dragState.startRow,
      dragState.startCol,
      dragState.currentRow,
      dragState.currentCol
    );

    const newSlots = new Set(selectedSlots);

    for (const { row, col } of cells) {
      const slotKey = cellToSlotKey(weekId, col, row);
      if (dragState.isSelecting) {
        newSlots.add(slotKey);
      } else {
        newSlots.delete(slotKey);
      }
    }

    onSlotsChange(newSlots);
    setDragState(null);
  }, [dragState, getCellsInRectangle, weekId, selectedSlots, onSlotsChange]);

  // Pan gesture for drag selection
  const panGesture = Gesture.Pan()
    .onStart((event) => {
      const cell = positionToCell(event.x, event.y);
      if (!cell) return;

      const slotKey = cellToSlotKey(weekId, cell.col, cell.row);
      const isCurrentlySelected = selectedSlots.has(slotKey);

      setDragState({
        startRow: cell.row,
        startCol: cell.col,
        currentRow: cell.row,
        currentCol: cell.col,
        isSelecting: !isCurrentlySelected, // Toggle behavior
      });
    })
    .onUpdate((event) => {
      if (!dragState) return;

      const cell = positionToCell(event.x, event.y);
      if (!cell) return;

      setDragState((prev) =>
        prev
          ? {
              ...prev,
              currentRow: cell.row,
              currentCol: cell.col,
            }
          : null
      );
    })
    .onEnd(() => {
      applyDragSelection();
    })
    .onFinalize(() => {
      // Ensure drag state is cleared even if gesture is cancelled
      if (dragState) {
        applyDragSelection();
      }
    })
    .minDistance(0)
    .shouldCancelWhenOutside(false);

  // Tap gesture for single cell toggle
  const tapGesture = Gesture.Tap().onEnd((event) => {
    const cell = positionToCell(event.x, event.y);
    if (!cell) return;

    const slotKey = cellToSlotKey(weekId, cell.col, cell.row);
    const newSlots = new Set(selectedSlots);

    if (newSlots.has(slotKey)) {
      newSlots.delete(slotKey);
    } else {
      newSlots.add(slotKey);
    }

    onSlotsChange(newSlots);
  });

  const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

  // Quick action handlers
  const handleSelectWeekdayHours = useCallback(() => {
    const newSlots = new Set(selectedSlots);

    // Monday (0) through Friday (4), 09:00 (index 18) through 17:30 (index 35)
    // Korean work hours: 9 AM - 6 PM
    for (let col = 0; col < 5; col++) {
      for (let row = 18; row <= 35; row++) {
        const slotKey = cellToSlotKey(weekId, col, row);
        newSlots.add(slotKey);
      }
    }

    onSlotsChange(newSlots);
  }, [weekId, selectedSlots, onSlotsChange]);

  const handleCopyPreviousWeek = useCallback(() => {
    if (!previousWeekSlots || previousWeekSlots.size === 0) {
      return;
    }

    // Transform previous week slots to current week by adding 7 days
    const slotDateRegex = /^(\d{4})-(\d{2})-(\d{2})/;
    const newSlots = new Set<string>();

    for (const slot of previousWeekSlots) {
      const match = slot.match(slotDateRegex);
      if (!match) continue;

      const date = new Date(slot);
      date.setDate(date.getDate() + 7);

      const timePart = slot.substring(10);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      newSlots.add(`${year}-${month}-${day}${timePart}`);
    }

    onSlotsChange(newSlots);
  }, [previousWeekSlots, onSlotsChange]);

  const handleClearAll = useCallback(() => {
    onSlotsChange(new Set());
  }, [onSlotsChange]);

  // Render a single cell
  const renderCell = useCallback(
    (row: number, col: number) => {
      const slotKey = cellToSlotKey(weekId, col, row);
      const isSelected = selectedSlots.has(slotKey);
      const isInPreview = isCellInDragPreview(row, col);
      const weekend = isWeekend(col);

      // Show drag preview
      let previewStyle = null;
      if (isInPreview && dragState) {
        if (dragState.isSelecting && !isSelected) {
          previewStyle = styles.cellPreviewSelect;
        } else if (!dragState.isSelecting && isSelected) {
          previewStyle = styles.cellPreviewDeselect;
        }
      }

      return (
        <View
          key={`${row}-${col}`}
          style={[
            styles.cell,
            { width: cellWidth, height: CELL_HEIGHT },
            isSelected && styles.cellSelected,
            !isSelected && weekend && styles.cellWeekend,
          ]}
        >
          {previewStyle && <View style={[styles.cellPreview, previewStyle]} />}
        </View>
      );
    },
    [weekId, selectedSlots, isCellInDragPreview, dragState, cellWidth]
  );

  // Render the grid
  const renderGrid = useMemo(() => {
    const rows = [];

    for (let row = 0; row < TIME_SLOTS.length; row++) {
      const cells = [];
      for (let col = 0; col < 7; col++) {
        cells.push(renderCell(row, col));
      }

      rows.push(
        <View key={row} style={styles.row}>
          <View style={[styles.timeCell, { width: TIME_COLUMN_WIDTH }]}>
            <Text style={styles.timeText}>{TIME_SLOTS[row]}</Text>
          </View>
          {cells}
        </View>
      );
    }

    return rows;
  }, [renderCell]);

  const totalHours = calculateTotalHours(selectedSlots);

  return (
    <GestureHandlerRootView style={styles.container}>
      {showWeekNavigator && (
        <WeekNavigator weekId={weekId} onWeekChange={onWeekChange} disabled={isLoading} />
      )}

      {showQuickActions && (
        <QuickActions
          onSelectWeekdayHours={handleSelectWeekdayHours}
          onCopyPreviousWeek={handleCopyPreviousWeek}
          onClearAll={handleClearAll}
          hasPreviousWeek={Boolean(previousWeekSlots && previousWeekSlots.size > 0)}
          disabled={isLoading}
        />
      )}

      <View style={styles.tipContainer}>
        <Text style={styles.tipText}>Tip: 드래그하여 시간대를 선택하세요</Text>
      </View>

      <View style={styles.gridContainer} onLayout={handleGridLayout}>
        {/* Day headers */}
        <View style={styles.headerRow}>
          <View style={[styles.timeHeaderCell, { width: TIME_COLUMN_WIDTH }]} />
          {DAY_NAMES_KO.map((day, index) => (
            <View
              key={day}
              style={[
                styles.headerCell,
                { width: cellWidth },
                isWeekend(index) && styles.headerCellWeekend,
              ]}
            >
              <Text style={[styles.headerText, isWeekend(index) && styles.headerTextWeekend]}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Scrollable grid area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          <GestureDetector gesture={composedGesture}>
            <View style={styles.gridArea}>
              {isLoading ? (
                <View style={styles.loadingOverlay}>
                  <Text style={styles.loadingText}>Loading...</Text>
                </View>
              ) : (
                renderGrid
              )}
            </View>
          </GestureDetector>
        </ScrollView>
      </View>

      {showSummary && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            이번 주 선택된 시간:{' '}
            <Text style={styles.summaryHours}>{totalHours.toFixed(1)} 시간</Text>
          </Text>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tipContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tipText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  gridContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    height: HEADER_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timeHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCell: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  headerCellWeekend: {
    backgroundColor: colors.surfaceAlt,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  headerTextWeekend: {
    color: colors.muted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gridArea: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  timeCell: {
    height: CELL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.surface,
  },
  timeText: {
    fontSize: 12,
    color: colors.muted,
  },
  cell: {
    height: CELL_HEIGHT,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
    backgroundColor: colors.background,
    position: 'relative',
  },
  cellSelected: {
    backgroundColor: colors.success,
  },
  cellWeekend: {
    backgroundColor: colors.surfaceAlt,
  },
  cellPreview: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: borderRadius.sm,
  },
  cellPreviewSelect: {
    backgroundColor: overlays.successOverlay,
  },
  cellPreviewDeselect: {
    backgroundColor: overlays.errorOverlay,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    fontSize: 14,
    color: colors.muted,
  },
  summaryContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  summaryText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  summaryHours: {
    fontWeight: '700',
    color: colors.success,
  },
});
