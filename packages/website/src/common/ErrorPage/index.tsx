import { Grid, Typography, Box, Button, useTheme } from '@mui/material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import NavBar from '../NavBar';
import Footer from '../Footer';

const ErrorPage = () => {
  const theme = useTheme();
  const pathname = usePathname();

  return (
    <>
      <NavBar searchLocation={false} />
      <Box
        color={theme.palette.primary.main}
        height="100%"
        display="flex"
        alignItems="center"
        flexDirection="column"
        justifyContent="center"
      >
        <Box mb="1rem" p="1rem">
          <Typography variant="h2" align="center">
            Sorry, something went wrong...
          </Typography>
        </Box>
        <Grid container justifyContent="center">
          <Button
            style={{ margin: '1rem' }}
            color="primary"
            variant="contained"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
          {pathname !== '/map' && (
            <Button
              style={{ margin: '1rem', color: 'white' }}
              component={Link}
              href="/map"
              color="primary"
              variant="contained"
            >
              Back to Map
            </Button>
          )}
        </Grid>
      </Box>
      <Footer />
    </>
  );
};

export default ErrorPage;
