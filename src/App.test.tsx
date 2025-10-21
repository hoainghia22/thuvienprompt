import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { App } from './index';

describe('App Component', () => {
  let mockPocketBase: any;
  let mockGetList: any;
  let mockSubscribe: any;
  let mockUnsubscribe: any;

  beforeEach(() => {
    // Set up fresh mocks for each test run
    mockGetList = vi.fn();
    mockUnsubscribe = vi.fn();
    mockSubscribe = vi.fn().mockReturnValue({
      then: (callback: (unsubscribe: any) => void) => callback(mockUnsubscribe),
    });

    // Mock PocketBase instance
    mockPocketBase = {
      collection: vi.fn().mockReturnValue({
        getList: mockGetList,
        subscribe: mockSubscribe,
      }),
    };

    // Set initial mock response for getList to enable pagination
    mockGetList.mockResolvedValue({
      items: Array.from({ length: 10 }, (_, i) => ({ id: `prompt${i}`, prompt: `Prompt ${i}` })),
      page: 1,
      totalPages: 2,
    });
  });

  it('should not unsubscribe on page change', async () => {
    render(<App pb={mockPocketBase} />);

    const loadMoreButton = await screen.findByTestId('load-more-button');
    expect(loadMoreButton).toBeInTheDocument();

    expect(mockSubscribe).toHaveBeenCalledTimes(1);

    // Set up the mock response for the second page with unique IDs
    mockGetList.mockResolvedValueOnce({
        items: Array.from({ length: 10 }, (_, i) => ({ id: `prompt${i + 10}`, prompt: `Prompt ${i + 10}` })),
        page: 2,
        totalPages: 2,
    });

    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(mockGetList).toHaveBeenCalledTimes(2);
    });

    expect(mockUnsubscribe).not.toHaveBeenCalled();
    expect(mockSubscribe).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = render(<App pb={mockPocketBase} />);

    expect(mockSubscribe).toHaveBeenCalledTimes(1);

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
