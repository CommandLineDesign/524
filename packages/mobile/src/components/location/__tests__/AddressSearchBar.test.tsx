import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import type { KeywordSearchResult } from '../../../types/kakao';
import { AddressSearchBar } from '../AddressSearchBar';

// Mock the kakaoService
jest.mock('../../../services/kakaoService', () => ({
  searchKeyword: jest.fn(),
}));

// Mock the useDebounce hook to make it synchronous for testing
jest.mock('../../../hooks/useDebounce', () => ({
  useDebounce: jest.fn((value: string) => value),
}));

const mockSearchKeyword = jest.requireMock('../../../services/kakaoService').searchKeyword;
const mockUseDebounce = jest.requireMock('../../../hooks/useDebounce').useDebounce;

const mockSearchResults: KeywordSearchResult[] = [
  {
    id: '1',
    placeName: 'Starbucks Gangnam',
    addressName: '서울 강남구 강남대로 123',
    roadAddressName: '서울 강남구 강남대로 123',
    latitude: 37.498,
    longitude: 127.028,
    category: '음식점 > 카페',
  },
  {
    id: '2',
    placeName: 'Starbucks Yeoksam',
    addressName: '서울 강남구 역삼로 456',
    roadAddressName: '서울 강남구 역삼로 456',
    latitude: 37.501,
    longitude: 127.035,
    category: '음식점 > 카페',
  },
];

describe('AddressSearchBar', () => {
  const mockOnResultSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchKeyword.mockResolvedValue([]);
    // Reset useDebounce to pass through the value
    mockUseDebounce.mockImplementation((value: string) => value);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render with placeholder text', () => {
      const { getByPlaceholderText } = render(
        <AddressSearchBar onResultSelect={mockOnResultSelect} />
      );

      expect(getByPlaceholderText('주소 또는 장소 검색')).toBeTruthy();
    });

    it('should render with custom placeholder', () => {
      const { getByPlaceholderText } = render(
        <AddressSearchBar onResultSelect={mockOnResultSelect} placeholder="Search here" />
      );

      expect(getByPlaceholderText('Search here')).toBeTruthy();
    });
  });

  describe('Search Debouncing', () => {
    it('should debounce search with 300ms delay', () => {
      jest.useFakeTimers();

      // Track calls to useDebounce to verify debounce delay
      const debounceDelays: number[] = [];
      mockUseDebounce.mockImplementation((value: string, delay: number) => {
        debounceDelays.push(delay);
        return value;
      });

      render(<AddressSearchBar onResultSelect={mockOnResultSelect} />);

      // Verify that useDebounce was called with 300ms delay
      expect(debounceDelays).toContain(300);
    });

    it('should not search when query is less than 2 characters', async () => {
      const { getByPlaceholderText } = render(
        <AddressSearchBar onResultSelect={mockOnResultSelect} />
      );

      const input = getByPlaceholderText('주소 또는 장소 검색');

      await act(async () => {
        fireEvent.changeText(input, 'a');
      });

      expect(mockSearchKeyword).not.toHaveBeenCalled();
    });

    it('should search when query has 2 or more characters', async () => {
      mockSearchKeyword.mockResolvedValue(mockSearchResults);

      const { getByPlaceholderText } = render(
        <AddressSearchBar onResultSelect={mockOnResultSelect} />
      );

      const input = getByPlaceholderText('주소 또는 장소 검색');

      await act(async () => {
        fireEvent.changeText(input, 'ab');
      });

      await waitFor(() => {
        expect(mockSearchKeyword).toHaveBeenCalledWith('ab', undefined);
      });
    });
  });

  describe('Result Selection', () => {
    it('should call onResultSelect when a result is pressed', async () => {
      mockSearchKeyword.mockResolvedValue(mockSearchResults);

      const { getByPlaceholderText, getByText } = render(
        <AddressSearchBar onResultSelect={mockOnResultSelect} />
      );

      const input = getByPlaceholderText('주소 또는 장소 검색');

      // Focus and type to trigger search
      await act(async () => {
        fireEvent(input, 'focus');
        fireEvent.changeText(input, 'Starbucks');
      });

      // Wait for results to appear
      await waitFor(() => {
        expect(getByText('Starbucks Gangnam')).toBeTruthy();
      });

      // Press the result
      await act(async () => {
        fireEvent.press(getByText('Starbucks Gangnam'));
      });

      expect(mockOnResultSelect).toHaveBeenCalledWith(mockSearchResults[0]);
    });

    it('should update input with selected place name', async () => {
      mockSearchKeyword.mockResolvedValue(mockSearchResults);

      const { getByPlaceholderText, getByText, getByDisplayValue } = render(
        <AddressSearchBar onResultSelect={mockOnResultSelect} />
      );

      const input = getByPlaceholderText('주소 또는 장소 검색');

      await act(async () => {
        fireEvent(input, 'focus');
        fireEvent.changeText(input, 'Starbucks');
      });

      await waitFor(() => {
        expect(getByText('Starbucks Gangnam')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(getByText('Starbucks Gangnam'));
      });

      // Input should now show the selected place name
      expect(getByDisplayValue('Starbucks Gangnam')).toBeTruthy();
    });
  });

  describe('Clear Functionality', () => {
    it('should clear input when clear button is pressed', async () => {
      const { getByPlaceholderText, getByDisplayValue, queryByDisplayValue } = render(
        <AddressSearchBar onResultSelect={mockOnResultSelect} />
      );

      const input = getByPlaceholderText('주소 또는 장소 검색');

      await act(async () => {
        fireEvent.changeText(input, 'test query');
      });

      expect(getByDisplayValue('test query')).toBeTruthy();

      // Find and press the clear button (it appears when query is not empty)
      // The clear button is a TouchableOpacity with the ClearIcon
      const clearButtons = input.parent?.parent?.findAllByType(
        require('react-native').TouchableOpacity
      );

      if (clearButtons && clearButtons.length > 0) {
        await act(async () => {
          fireEvent.press(clearButtons[0]);
        });
      }

      // Query should be cleared
      expect(queryByDisplayValue('test query')).toBeNull();
    });
  });

  describe('Location Biasing', () => {
    it('should pass currentLocation to search function', async () => {
      mockSearchKeyword.mockResolvedValue([]);

      const currentLocation = { latitude: 37.5666, longitude: 126.9784 };

      const { getByPlaceholderText } = render(
        <AddressSearchBar onResultSelect={mockOnResultSelect} currentLocation={currentLocation} />
      );

      const input = getByPlaceholderText('주소 또는 장소 검색');

      await act(async () => {
        fireEvent.changeText(input, 'coffee');
      });

      await waitFor(() => {
        expect(mockSearchKeyword).toHaveBeenCalledWith('coffee', currentLocation);
      });
    });
  });

  describe('Error Handling', () => {
    it('should clear results on search error', async () => {
      // First search succeeds
      mockSearchKeyword.mockResolvedValueOnce(mockSearchResults);

      const { getByPlaceholderText, getByText, queryByText } = render(
        <AddressSearchBar onResultSelect={mockOnResultSelect} />
      );

      const input = getByPlaceholderText('주소 또는 장소 검색');

      await act(async () => {
        fireEvent(input, 'focus');
        fireEvent.changeText(input, 'Star');
      });

      await waitFor(() => {
        expect(getByText('Starbucks Gangnam')).toBeTruthy();
      });

      // Second search fails
      mockSearchKeyword.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        fireEvent.changeText(input, 'fail');
      });

      await waitFor(() => {
        // Results should be cleared on error
        expect(queryByText('Starbucks Gangnam')).toBeNull();
      });
    });
  });
});
