import { TypographyProps } from '@mui/material';
import { CSSProperties } from '@mui/styles/withStyles';

export interface Value {
  text: string;
  variant: TypographyProps['variant'];
  marginRight: CSSProperties['marginRight'];
  overflowEllipsis?: boolean;
}
