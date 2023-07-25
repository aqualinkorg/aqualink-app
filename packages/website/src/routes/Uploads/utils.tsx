import { TableCell, TableCellProps, Typography } from '@material-ui/core';
import React from 'react';

interface TableCellWrapProps extends TableCellProps {
  bigText?: boolean;
}

export function TableCellWrap({
  bigText = false,
  children,
  ...rest
}: TableCellWrapProps) {
  return (
    <TableCell {...rest}>
      <Typography
        variant={bigText ? 'h6' : 'subtitle1'}
        style={{ color: 'black' }}
        noWrap
      >
        {children}
      </Typography>
    </TableCell>
  );
}
