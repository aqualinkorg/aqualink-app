import React, { forwardRef } from 'react';
import { Button as MuiButton, ButtonProps } from '@mui/material';
import './Button.scss';

// Preserve MUI's polymorphic API, including router links and forwarded refs.
const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <MuiButton ref={ref} {...props} />
)) as typeof MuiButton;

export default Button;
