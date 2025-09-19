import React from 'react';
import { Grid, IconButton, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';
import { Site } from 'store/Sites/types';

const exampleFiles = ['hobo', 'sonde', 'metlog', 'hui'];

const useStyles = makeStyles(() => ({
  downloadButton: {
    background: 'none !important',
    border: 'none',
    padding: '0 !important',
    color: '#069',
    textDecoration: 'underline',
    cursor: 'pointer',
    textTransform: 'none',
    minWidth: 0,
  },
}));

function Header({ site }: HeaderProps) {
  const classes = useStyles();
  return (
    <Grid container alignItems="center" spacing={1}>
      <Grid item>
        <IconButton
          color="primary"
          component={Link}
          to={`/sites/${site.id}`}
          size="large"
        >
          <ArrowBackIcon />
        </IconButton>
      </Grid>
      <Grid item>
        <Typography variant="h5">Upload Data</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">
          You&apos;re about to upload data for the following parameters: site
          &quot;{site.name}&quot;.
        </Typography>
        <Typography variant="h6">
          Please confirm survey point and sensor type to continue.
        </Typography>
        <Typography style={{ fontSize: '0.8em' }}>
          You can find example file formats here:{' '}
          {exampleFiles.map((file, i) => (
            <span key={file}>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`${
                  process.env.REACT_APP_API_BASE_URL
                }/time-series/sample-upload-files/${encodeURIComponent(file)}`}
                className={classes.downloadButton}
              >
                {file}
              </a>
              {i !== exampleFiles.length - 1 ? ', ' : ''}
            </span>
          ))}
        </Typography>
        <Typography style={{ fontSize: '0.8em' }}>
          For more information about uploading data, visit our&nbsp;
          <a
            href="https://aqualink.org/faq"
            target="_blank"
            rel="noopener noreferrer"
          >
            FAQ page
          </a>
          .
        </Typography>
      </Grid>
    </Grid>
  );
}

interface HeaderProps {
  site: Site;
}

export default Header;
