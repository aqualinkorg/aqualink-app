import React from 'react';
import {
  Button,
  Typography,
  Box,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import Tune from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import { spotter } from 'assets/spotter';
import { hobo } from 'assets/hobo';
import { AlertLevelLegendContent } from '../alertLevelLegend';

interface IconDescriptionProps {
  icon: React.ReactNode;
  description: string;
  isLarge?: boolean;
}

const IconDescription: React.FC<IconDescriptionProps> = ({
  icon,
  description,
  isLarge,
}) => (
  <Box display="flex" alignItems="center" gap={3} mb={2} pt={1}>
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height={40}
      width={isLarge ? 130 : 40}
    >
      {icon}
    </Box>
    <Typography variant="body2" style={{ lineHeight: 1.5 }}>
      {description}
    </Typography>
  </Box>
);

const InfoDialogContent: React.FC = () => {
  const iconDescriptions = [
    {
      icon: (
        <div
          style={{
            flex: '1 0 40px',
            height: '40px',
            width: '40px',
            backgroundSize: '36px, 36px',
            backgroundRepeat: 'no-repeat',
            border: '2px solid #c6c4c5',
            borderRadius: '5px',
            backgroundImage: `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAQAAABvcdNgAAAEsklEQVR4AWL4TydIhpZK1kpWOlg0w3ZXP6D2soBtG42jeI6ZmQTHzAxiTbSJsYLjO9HhP+WOmcuhciVnmHVQcJnp7DFvScowZorad/+V/fVzMdMT2g9Cv9guXGv/7pYOrXh2U+RRR3dSd9JRx6bIFc/ekqHI29JC6pJ5ZEh1yWkhkbcFeSjxgx3L2m1cb1C7bceyxA+CNjT/Ifff+/kDk2u/w/33/IeCMOSaWZ4glosqT3DNnNZQ7Cs58/3Ce5HL78iZH/vKVIaYlqzfdLu8Vi7dnvUbEza5Idt36tquZFldl6N5Z/POLof0XLK61mZCmJSWjVF9tEjUluu74IUXvgttuVIHE7YxSkaYhJZam7yiM9Pv82JYfl9nptxZaxMJE4YSPty+vF0+Y2up9d3wwijfjZbabqm/3bZ9ecKHsiGmRflnn1MW4pjHf9oLufyn2z3y1D6n8g8TZhxyzipLNPnAUpsOiuWimg52psrTZYnOWYNDTMuWBWa0tJb4rgq1UvmutpaYEbZlwU3CLJm/ayYjHW5/h7xWLn9Hh1vepDkyf7dE7MtT5LR4e7yYpHrkhOUpEfssBLq2pPhAqoSWKUkk7EDqkmK6RrCEzqDjhNDWNE+XSMvkJRDWlZTmCW0l0PHQGRZY5t1L83kT0Y3l2SItk5JAWHl2dCOBm+fPu3fo5/3v61RMCO9Jx2EEYYhb0rmNQMX/vm7gqOEJLcXTGw3CAuRNeyaPWwjR8PRqKQ1PDA/dpv+on9Shox52WFnx0KY8onHayrJzm87i5h9xGw/tfkev0jGsQizqezUKjk12hBMKJ4kbCqGPVNXudyyrShovGw5CgxsRICxF6aRmSjlBnHRzg7Gx8fKqEubI2rahQYdR1YgDIRQO7JvQyD52hoIQx0mxa0ODtW2Iozn1le2iIRdzwWewedyZzewidueOGqlsn1MvcnQpuVwLGG3/IR1hIKxCjelIDZ8ldqWz25jWAsnldEnK0Zxro19TGVb2ffIZEsIO89EIEDvKMPrzmBOQcKQ+rroye6NgRRxqR4U8EAkz0CL6uSGOm6KQCdWjvjRiSP1BPalCRS5iQYiEIvxuBMJEWgzSoHADcVMuN7IuqqTeyUPq22qFimFtxDyBBJEwNyt6TM88blFHao/6tWWhuuOM4SAK4EI4QmFHA+SEyWlp4EQoJ13cYGzMu7yszEIBOm2rVmHUNqwAIQabISNMRstmdhNWcFLsSm+0tjJH1MdRxO5Nx0WDMhCtgD6OKgZeljJqJKc9po8juskR9XN0Y1lZ3mWjLR9JCO1jRDMd0fpYC2VnvjBSEFg7wBENc0R9HFlb0xvF1+TBEpF68d+DHR6IOWVv2BECtxo46hOFUBd/APU57WIoEwJhIi2CdpyZX0m93BZicktMj1AS9dClteUFAUNUIEygRZCtik5zSxI9MubTBH1GOiHsiLJ3OCoSZkILa9PxiN0EbvhsAo8tdAf9Seepd36lGWHmtNANTv5Jd0z4QYyeo/UEJqxKRpg5LZx6btLPsOaEmdMyxYdlc8LMaJnikDlhclqmPiQnTEpLUIZEwkRagjYkEibQErwhkTAKCLQEbUgkzJQWc/0PstHHcfEdQ+UAAAAASUVORK5CYII=)`,
          }}
        />
      ),
      description:
        'Layer icon - Select the layer of the map. You can choose from Satellite Imagery, Sea Surface Temperature, Heat Stress, or SST Anomaly.',
    },
    {
      icon: (
        <FullscreenIcon
          color="primary"
          style={{
            width: '40px',
            height: '40px',
            border: '2px solid #c6c4c5',
            borderRadius: '5px',
          }}
        />
      ),
      description:
        'Fullscreen icon - Toggle between full screen and half screen.',
    },
    {
      icon: (
        <MyLocationIcon
          color="primary"
          style={{
            width: '40px',
            height: '40px',
            border: '2px solid #c6c4c5',
            borderRadius: '5px',
          }}
        />
      ),
      description:
        "My location icon - Click on this icon to zoom in to where you're currently located.",
    },
    {
      icon: (
        <div
          style={{
            width: '40px',
            height: '70px',
            border: '2px solid #c6c4c5',
            borderRadius: '5px',
            textAlign: 'center',
            lineHeight: '30px',
            fontSize: '22px',
          }}
        >
          <div style={{ borderBottom: '1px solid #c6c4c5' }}>+</div>
          <div>-</div>
        </div>
      ),
      description: 'Zoom in and out on the map.',
    },
    {
      icon: (
        <Button
          variant="contained"
          startIcon={<Tune />}
          sx={{ width: '130px' }}
        >
          All sites
        </Button>
      ),
      isLarge: true,
      description:
        'Map filter - Select what type of data and heat stress you want to explore. You can also select multiple species, reef composition, and anthropogenic impact, and the map will display all the selected items.',
    },
  ];

  const siteIconDescriptions = [
    {
      icon: (
        <div
          style={{ width: '30px', height: '30px' }}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: spotter('#FFF200') }}
        />
      ),
      description:
        'This icon indicates that this site has a Sofar Smart Mooring Spotter with transmits real-time wind, wave, and temperature data from the seafloor and sea surface.',
    },
    {
      icon: (
        <div
          style={{ width: '25px', height: '66px' }}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: hobo('#FFF200') }}
        />
      ),
      description:
        'This icon indicate that this site has at least one temperature logger connected to the dashboard.',
    },
    {
      icon: (
        <div
          style={{
            width: '30px',
            height: '30px',
            backgroundColor: '#FFF200',
            borderRadius: '50%',
            border: '2px solid #000',
          }}
        />
      ),
      description:
        'All the other sites have this icon. This includes sites with water quality data, Reef Check data, 3D models, Live streams, surveys, and all others. Every site is automatically equipped with wind, wave, and temperature data from NOAA satellites.',
    },
  ];

  return (
    <Grid spacing={3} margin={1}>
      <Grid xs={12}>
        <Typography variant="h6" color="primary" gutterBottom>
          Icons
        </Typography>
        {iconDescriptions.map((item) => (
          <IconDescription
            icon={item.icon}
            description={item.description}
            isLarge={item.isLarge}
            key={`icon-${item.description
              .substring(0, 20)
              .replace(/\s+/g, '-')}`}
          />
        ))}
      </Grid>

      <Grid xs={12}>
        <Typography variant="h6" color="primary" gutterBottom>
          Layers
        </Typography>
        <Grid spacing={1}>
          <Typography variant="body2" paragraph>
            Click on the layer icon in the top right corner. Then select
            Satellite Imagery, Sea Surface Temperature, Heat Stress, or SST
            Anomaly.
          </Typography>
          <Typography variant="body2" paragraph>
            Sea Surface Temperature - View the global ocean temperature in
            Celsius (°C). The bar in the bottom left corner indicates what
            temperature the colors are.
          </Typography>
          <Typography variant="body2" paragraph>
            Heat Stress - Heat stress is a measure of the amount of time above
            the 20 year historical maximum temperature. The unit of measure for
            heat stress is Degree Heating Weeks (DHW). Many marine environments,
            like coral sites, degrade after prolonged heat exposure, which is
            why this is an important metric. The DHW bar indicates how many
            weeks each area of the ocean has been experiencing heat stress. For
            more in-depth information, view{' '}
            <a href="https://coralreefwatch.noaa.gov/product/5km/tutorial/crw10a_dhw_product.php">
              NOAA CRW&apos;s Heat Stress page.
            </a>
          </Typography>
          <Typography variant="body2" paragraph>
            SST Anomaly - Sea Surface Temperature Anomaly is the difference
            between the daily observed SST and the normal (long-term) SST
            conditions for that specific day of the year. For more in-depth
            information, view{' '}
            <a href="https://coralreefwatch.noaa.gov/product/5km/tutorial/crw07a_ssta_product.php">
              NOAA CRW&apos;s SST Anomaly page.
            </a>
          </Typography>
        </Grid>
      </Grid>

      <Grid xs={12}>
        <Typography variant="h6" color="primary" gutterBottom>
          Site Icons and Colors
        </Typography>
        <Grid spacing={1}>
          <Typography variant="body2" paragraph>
            Each site has its own icon on the map. The heat stress level that
            each site is experiencing is indicated by its color. To learn more
            about heat stress levels, view{' '}
            <a href="https://coralreefwatch.noaa.gov/product/5km/tutorial/crw11a_baa.php">
              NOAA CRW&apos;s bleaching alert page.
            </a>
          </Typography>

          <Box
            position="relative"
            width="100%"
            mb={1}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              fontSize: {
                xs: '12px',
                md: '16px',
              },
            }}
          >
            <AlertLevelLegendContent />
          </Box>

          <Typography variant="body2" paragraph>
            Each site has its own icon on the map, which varies depending on the
            data it has.
          </Typography>

          {siteIconDescriptions.map((item) => (
            <Grid
              xs={12}
              key={`site-icon-${item.description?.replace(/\s+/g, '-')}`}
            >
              <IconDescription
                description={item.description}
                icon={item.icon}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

interface InfoDialogProps {
  infoDialogOpen: boolean;
  handleInfoClose: () => void;
}

export const InfoDialog: React.FC<InfoDialogProps> = ({
  infoDialogOpen,
  handleInfoClose,
}) => {
  return (
    <Dialog open={infoDialogOpen} onClose={handleInfoClose}>
      <DialogTitle
        color="primary"
        sx={{ fontSize: '20px', textAlign: 'center', fontWeight: 'bold' }}
      >
        How to Use the Map
      </DialogTitle>
      <IconButton
        onClick={handleInfoClose}
        color="primary"
        size="large"
        sx={{
          position: 'absolute',
          right: 10,
          top: 10,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <InfoDialogContent />
      </DialogContent>
    </Dialog>
  );
};
