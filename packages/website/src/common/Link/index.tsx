import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { IconButton, Tooltip, TooltipProps } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { Launch } from '@mui/icons-material';

const CustomLink = ({
  to,
  tooltipTitle,
  isIcon,
  content,
  classes,
}: CustomLinkProps) => {
  return (
    <Tooltip title={tooltipTitle} placement="top" arrow>
      <Link className={classes.link} to={to}>
        {isIcon ? (
          <IconButton className={classes.button} size="large">
            <Launch color="primary" />
          </IconButton>
        ) : (
          content
        )}
      </Link>
    </Tooltip>
  );
};

const styles = () =>
  createStyles({
    link: {
      textDecoration: 'none',
      color: 'inherit',
      '&:hover': {
        textDecoration: 'none',
        color: 'inherit',
      },
    },
    button: {
      padding: 0,
    },
  });

interface CustomLinkIncomingProps {
  to: LinkProps['to'];
  isIcon: boolean;
  content?: string | null;
  tooltipTitle: TooltipProps['title'];
}

CustomLink.defaultProps = {
  content: null,
};

type CustomLinkProps = CustomLinkIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(CustomLink);
