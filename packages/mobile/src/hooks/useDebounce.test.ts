import { act, renderHook } from '@testing-library/react-native';

import { useDebounce, useDebouncedCallback } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 400));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'initial' },
    });

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated' });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast forward 200ms - still not updated
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('initial');

    // Fast forward another 200ms (total 400ms) - now should update
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'initial' },
    });

    // Multiple rapid updates
    rerender({ value: 'update1' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'update2' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'update3' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should still have initial value (only 300ms since last change)
    expect(result.current).toBe('initial');

    // Fast forward 400ms from last change
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current).toBe('update3');
  });

  it('should use custom delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 1000), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });

    // Fast forward 400ms - default delay wouldn't have updated
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current).toBe('initial');

    // Fast forward to 1000ms total
    act(() => {
      jest.advanceTimersByTime(600);
    });
    expect(result.current).toBe('updated');
  });

  it('should handle default delay of 400ms', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });

    act(() => {
      jest.advanceTimersByTime(399);
    });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce callback invocation', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 400));

    // Call multiple times rapidly
    act(() => {
      result.current('arg1');
      result.current('arg2');
      result.current('arg3');
    });

    // Callback should not be called yet
    expect(callback).not.toHaveBeenCalled();

    // Fast forward 400ms
    act(() => {
      jest.advanceTimersByTime(400);
    });

    // Callback should only be called once with last arguments
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg3');
  });

  it('should cancel previous timer on new call', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 400));

    act(() => {
      result.current('first');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    act(() => {
      result.current('second');
    });

    // First call timer was reset, fast forward another 300ms (total 600ms from start)
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Still should not be called (only 300ms since 'second')
    expect(callback).not.toHaveBeenCalled();

    // Complete the delay
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('second');
  });

  it('should cleanup timer on unmount', () => {
    const callback = jest.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 400));

    act(() => {
      result.current('test');
    });

    // Unmount before timer fires
    unmount();

    // Fast forward past delay
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Callback should not be called after unmount
    expect(callback).not.toHaveBeenCalled();
  });
});
