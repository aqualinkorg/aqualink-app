import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DatePicker from "./index";

describe("DatePicker", () => {
  const mockOnDateChange = jest.fn();

  beforeEach(() => {
    mockOnDateChange.mockClear();
  });

  it("renders 'View historical date' label when no date is selected", () => {
    render(
      <DatePicker selectedDate={null} onDateChange={mockOnDateChange} />
    );
    expect(screen.getByText("View historical date")).toBeInTheDocument();
  });

  it("renders the selected date label when a date is active", () => {
    const testDate = new Date("2020-03-15T00:00:00");
    render(
      <DatePicker selectedDate={testDate} onDateChange={mockOnDateChange} />
    );
    // Label should show formatted date (locale dependent, check year at minimum)
    expect(screen.getByText(/2020/)).toBeInTheDocument();
  });

  it("opens the date popover when the calendar icon is clicked", async () => {
    render(
      <DatePicker selectedDate={null} onDateChange={mockOnDateChange} />
    );

    const calendarButton = screen.getByRole("button", { name: /select a past date/i });
    fireEvent.click(calendarButton);

    await waitFor(() => {
      expect(screen.getByText("View map at a past date")).toBeInTheDocument();
    });
  });

  it("calls onDateChange with null when Reset to today is clicked", async () => {
    const testDate = new Date("2020-03-15T00:00:00");
    render(
      <DatePicker selectedDate={testDate} onDateChange={mockOnDateChange} />
    );

    // Click clear (×) button
    const clearButton = screen.getByRole("button", { name: /return to current data/i });
    fireEvent.click(clearButton);

    expect(mockOnDateChange).toHaveBeenCalledWith(null);
  });

  it("applies a date when Apply is clicked", async () => {
    render(
      <DatePicker selectedDate={null} onDateChange={mockOnDateChange} />
    );

    // Open picker
    const calendarButton = screen.getByRole("button", { name: /select a past date/i });
    fireEvent.click(calendarButton);

    await waitFor(() => {
      expect(screen.getByText("View map at a past date")).toBeInTheDocument();
    });

    // Set date value
    const dateInput = screen.getByLabelText(/date/i);
    fireEvent.change(dateInput, { target: { value: "2020-03-15" } });

    // Click Apply
    const applyButton = screen.getByRole("button", { name: /apply/i });
    fireEvent.click(applyButton);

    expect(mockOnDateChange).toHaveBeenCalledTimes(1);
    const calledDate: Date = mockOnDateChange.mock.calls[0][0];
    expect(calledDate).toBeInstanceOf(Date);
    expect(calledDate.getFullYear()).toBe(2020);
    expect(calledDate.getMonth()).toBe(2); // March = 2 (0-indexed)
    expect(calledDate.getDate()).toBe(15);
  });

  it("does not allow future dates", async () => {
    render(
      <DatePicker selectedDate={null} onDateChange={mockOnDateChange} />
    );

    // Open picker
    const calendarButton = screen.getByRole("button", { name: /select a past date/i });
    fireEvent.click(calendarButton);

    await waitFor(() => {
      expect(screen.getByText("View map at a past date")).toBeInTheDocument();
    });

    // Set a future date
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateStr = `${futureDate.getFullYear()}-01-01`;

    const dateInput = screen.getByLabelText(/date/i);
    fireEvent.change(dateInput, { target: { value: futureDateStr } });

    const applyButton = screen.getByRole("button", { name: /apply/i });
    fireEvent.click(applyButton);

    // Should have been called with today's date, not the future date
    expect(mockOnDateChange).toHaveBeenCalledTimes(1);
    const calledDate: Date = mockOnDateChange.mock.calls[0][0];
    expect(calledDate.getFullYear()).toBeLessThanOrEqual(new Date().getFullYear());
  });
});
