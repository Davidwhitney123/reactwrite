import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import SearchResults from '../src/components/SearchResults';

describe('SearchResults', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should ignore stale results from earlier queries', async () => {
    render(<SearchResults />);

    const input = screen.getByLabelText(/search users/i);

    await act(async () => {
      fireEvent.change(input, { target: { value: 'ali' } });
      await vi.advanceTimersByTimeAsync(100);
    });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'bob' } });
      await vi.advanceTimersByTimeAsync(120);
    });

    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('Bobby Lee')).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
    expect(screen.queryByText('Alicia Smith')).not.toBeInTheDocument();
  });
});
