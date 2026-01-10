import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import theme from 'layout/App/theme';
import { ColumnDef, ReefCheckSurveyTable } from '.';

describe('ReefCheckSurveyTable', () => {
  type MockDataItem = {
    id: number;
    name: string;
    age: string;
  };
  const mockTitle = 'title';
  const mockDescription = 'description';
  const mockColumns = [
    { header: 'Name', field: 'name' },
    { header: 'Age', field: 'age' },
  ] as ColumnDef<MockDataItem>[];
  const mockData = [
    { id: 1, name: 'Joe', age: '30' },
    { id: 2, name: 'Doe', age: '25' },
  ];

  function renderReefCheckSurveyTable({
    loading,
    data = mockData,
  }: { loading?: boolean; data?: MockDataItem[] } = {}) {
    return render(
      <ThemeProvider theme={theme}>
        <ReefCheckSurveyTable
          title={mockTitle}
          description={mockDescription}
          columns={mockColumns}
          data={data}
          loading={loading}
        />
      </ThemeProvider>,
    );
  }

  it('should render correctly', () => {
    const { getByText, container } = renderReefCheckSurveyTable();
    expect(getByText(mockTitle)).toBeInTheDocument();
    expect(getByText(mockDescription)).toBeInTheDocument();

    const rows = container.querySelectorAll<HTMLElement>('tr');
    expect(rows.length).toBe(3); // 1 header + 2 data
    expect(
      [...container.querySelectorAll('td, th').values()].map(
        (el) => el.textContent,
      ),
    ).toEqual(['Name', 'Age', 'Joe', '30', 'Doe', '25']);
  });

  it('should render skeleton rows when loading', () => {
    const { container } = renderReefCheckSurveyTable({
      loading: true,
      data: [],
    });
    const rows = container.querySelectorAll<HTMLElement>('tbody tr');
    expect(rows.length).toBe(3); // 3 skeleton rows
    rows.forEach((row) => {
      const skeletons = row.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBe(mockColumns.length);
    });
  });
});
