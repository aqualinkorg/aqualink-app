import { Table, TableBody, TableContainer } from '@material-ui/core';
import React, { useState, useContext, forwardRef } from 'react';
import { FixedSizeList, FixedSizeListProps } from 'react-window';

/** Context for cross component communication */
const VirtualTableContext = React.createContext<{
  top: number;
  setTop: (top: number) => void;
  header: React.ReactNode;
  footer: React.ReactNode;
}>({
  top: 0,
  setTop: () => {},
  header: <></>,
  footer: <></>,
});

type VirtualTableProps = {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  row: FixedSizeListProps['children'];
} & Omit<FixedSizeListProps, 'children' | 'innerElementType'>;

/**
 * Displays a virtualized list as table with optional header and footer.
 * It basically accepts all of the same params as the original FixedSizeList.
 * From: https://codesandbox.io/p/sandbox/react-window-with-table-elements-d861o
 * */
export const VirtualTable = forwardRef<FixedSizeList, VirtualTableProps>(
  ({ row, header, footer, ...rest }, ref) => {
    const [top, setTop] = useState(0);

    return (
      <VirtualTableContext.Provider value={{ top, setTop, header, footer }}>
        <FixedSizeList
          {...rest}
          innerElementType={Inner}
          onItemsRendered={(props) => {
            // @ts-ignore
            // eslint-disable-next-line no-underscore-dangle
            const style = ref.current?._getItemStyle(props.overscanStartIndex);
            setTop(style?.top ?? 0);

            // Call the original callback
            rest.onItemsRendered?.(props);
          }}
          ref={ref}
        >
          {row}
        </FixedSizeList>
      </VirtualTableContext.Provider>
    );
  },
);

/**
 * The Inner component of the virtual list. This is the "Magic".
 * Capture what would have been the top elements position and apply it to the table.
 * Other than that, render an optional header and footer.
 * */
const Inner = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
  function Inner({ children, ...rest }, ref) {
    const { header, footer, top } = useContext(VirtualTableContext);
    return (
      <TableContainer {...rest} ref={ref}>
        <Table
          style={{
            top,
            position: 'absolute',
            width: '100%',
          }}
        >
          {header}
          <TableBody style={{ position: 'relative' }}>{children}</TableBody>
          {footer}
        </Table>
      </TableContainer>
    );
  },
);
