import React from 'react';
import {
  Box,
  Button,
  CardMedia,
  Link as MuiLink,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import InfoFooter from 'common/InfoFooter';
import {
  colors,
  instrumentSansFontFamily,
  ibmPlexMonoFontFamily,
} from 'layout/App/theme';
import { ReactComponent as CheckIcon } from 'assets/img/landing-page/icon-check.svg';
import Card from './Card';
import Hero from './Hero';
import {
  aiSteps,
  cardTitles,
  dashboardFeatures,
  facts,
  partnerGroups,
  startSteps,
} from './titles';
import dashboardImage from '../../assets/img/landing-page/dashboard.jpg';
import aiChatImage from '../../assets/img/landing-page/ai-chat.png';

function LandingPage({ classes }: LandingPageProps) {
  return (
    <Box className={classes.root}>
      <Hero />

      <Box
        component="section"
        aria-label="Aqualink at a glance"
        className={classes.facts}
      >
        <Box className={classes.factsInner}>
          {facts.map(({ value, label }) => (
            <Box key={value}>
              <Typography component="div" className={classes.factValue}>
                {value}
              </Typography>
              <Typography component="div" className={classes.factLabel}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box component="section" id="how" className={classes.how}>
        <Typography variant="h2" className={classes.howTitle}>
          Multiple sources of data, one clear picture
        </Typography>
        <Typography className={classes.howText}>
          Every site starts with satellite data automatically. Add sensors and
          surveys whenever you are ready.
        </Typography>
        <Box className={classes.cardGrid}>
          {cardTitles.map((item) => (
            <Card
              key={item.title}
              title={item.title}
              text={item.text}
              tag={item.tag}
              icon={item.icon}
            />
          ))}
        </Box>
      </Box>

      <Box component="section" id="dashboard" className={classes.dashboard}>
        <Box className={classes.dashboardRow}>
          <Box className={classes.dashboardText}>
            <Typography variant="h2" className={classes.sectionTitle}>
              Every site gets its own dashboard
            </Typography>
            <Box component="ul" className={classes.featureList}>
              {dashboardFeatures.map((feature) => (
                <Typography
                  component="li"
                  key={feature}
                  className={classes.featureItem}
                >
                  <CheckIcon
                    aria-hidden="true"
                    className={classes.featureIcon}
                  />
                  <span>{feature}</span>
                </Typography>
              ))}
            </Box>
            <MuiLink
              component={Link}
              to="/sites/1006"
              underline="always"
              className={classes.liveSiteLink}
            >
              Explore a live site →
            </MuiLink>
            <Box className={classes.examplesBlock}>
              <MuiLink
                component={Link}
                to="/examples"
                underline="always"
                className={classes.examplesLink}
              >
                Explore reef examples from around the world →
              </MuiLink>
              <Typography className={classes.examplesText}>
                Examples showcase the full range of capabilities: Smart Buoys,
                the AI assistant, surveys and Reef Check, live video, water
                quality, temperature loggers, 3D models, coral restoration and
                collections.
              </Typography>
            </Box>
          </Box>
          <Box className={classes.dashboardImageWrapper}>
            <CardMedia
              component="img"
              src={dashboardImage}
              alt="An Aqualink site dashboard showing a map, live video, satellite and buoy temperatures, heat stress and wind and waves"
              className={classes.dashboardImage}
            />
          </Box>
        </Box>
      </Box>

      <Box component="section" id="ai" className={classes.ai}>
        <Box className={classes.aiInner}>
          <Box className={classes.aiText}>
            <Typography className={classes.aiEyebrow}>AI insights</Typography>
            <Typography variant="h2" className={classes.sectionTitle}>
              Ask your reef what it needs
            </Typography>
            <Typography className={classes.aiIntro}>
              Every dashboard has an AI assistant. It reads everything Aqualink
              knows about your site, combines it with what reef science and
              conservation practice have learned, and turns it into plain
              advice.
            </Typography>
            <Box component="ol" className={classes.aiSteps}>
              {aiSteps.map(({ title, text, icon: Icon }) => (
                <Box component="li" key={title} className={classes.aiStep}>
                  <Box component="span" className={classes.aiIconBox}>
                    <Icon aria-hidden="true" />
                  </Box>
                  <Box>
                    <Typography component="div" className={classes.aiStepTitle}>
                      {title}
                    </Typography>
                    <Typography component="div" className={classes.aiStepText}>
                      {text}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
          <Box className={classes.aiImageWrapper}>
            <CardMedia
              component="img"
              src={aiChatImage}
              alt="Example AI chat for Keahole Point, Hawai'i. The assistant reports no heat stress: water at 25.0 °C, 2.2 °C below the historical maximum. A user asks whether pale Montipora capitata at 15 m is bleaching. The assistant answers that it is probably not heat, since the buoy reads 24.9 °C at 15 m. It lists other common causes (low-salinity groundwater, sediment or nutrients after rain, natural colony variation) and suggests re-photographing the colonies in 7 days."
              className={classes.aiImage}
            />
          </Box>
        </Box>
      </Box>

      <Box component="section" id="heatwaves" className={classes.heatwaves}>
        <Box className={classes.heatwavesInner}>
          <Box className={classes.heatwavesText}>
            <Typography className={classes.heatwavesEyebrow}>
              Site Collections
            </Typography>
            <Typography variant="h2" className={classes.sectionTitle}>
              Track heatwaves with collections
            </Typography>
            <Typography className={classes.heatwavesIntro}>
              Set up collections of sites and view heat stress data in
              aggregate. Follow a marine heatwave or a whole region, from Brazil
              to Florida, in one view.
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/collections/804"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.heatwavesButton}
          >
            Caribbean Collection
          </Button>
        </Box>
      </Box>

      <Box component="section" id="about" className={classes.about}>
        <Typography variant="h2" className={classes.aboutTitle}>
          Trusted by researchers and conservation groups
        </Typography>
        <Box className={classes.partnerGrid}>
          {partnerGroups.map(({ title, names }) => (
            <Box key={title}>
              <Typography className={classes.partnerLabel}>{title}</Typography>
              <Typography className={classes.partnerNames}>{names}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box component="section" id="register" className={classes.start}>
        <Box className={classes.startBox}>
          <Typography variant="h2" className={classes.sectionTitle}>
            Start monitoring your reef
          </Typography>
          <Typography className={classes.startIntro}>
            No sensors or surveys yet? That is fine. Satellite data and heat
            stress analysis work from day one.
          </Typography>
          <Box component="ol" className={classes.startSteps}>
            {startSteps.map(({ number, title, text }) => (
              <Box component="li" key={number}>
                <Typography component="div" className={classes.startNumber}>
                  {number}
                </Typography>
                <Typography component="div" className={classes.startTitle}>
                  {title}
                </Typography>
                <Typography component="div" className={classes.startText}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box className={classes.startButtons}>
            <Button
              component={Link}
              to="/register"
              className={classes.startButton}
            >
              Register your site
            </Button>
          </Box>
        </Box>
      </Box>

      <InfoFooter />
    </Box>
  );
}

const styles = () =>
  createStyles({
    root: {
      fontFamily: instrumentSansFontFamily,
      color: colors.navy,
      background: colors.white,
      lineHeight: 'normal',
      minWidth: 0,
      WebkitFontSmoothing: 'auto',
      MozOsxFontSmoothing: 'auto',
    },
    facts: {
      borderTop: `1px solid ${colors.borderGray}`,
      borderBottom: `1px solid ${colors.borderGray}`,
    },
    factsInner: {
      maxWidth: 1200,
      margin: '0 auto',
      boxSizing: 'content-box',
      padding: '32px 24px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 24,
    },
    factValue: {
      fontSize: 36,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      fontFamily: 'inherit',
      lineHeight: 'normal',
    },
    factLabel: {
      fontSize: 16,
      color: colors.slateGray,
      marginTop: 4,
      fontFamily: 'inherit',
      lineHeight: 'normal',
      letterSpacing: 'normal',
    },
    how: {
      maxWidth: 1200,
      margin: '0 auto',
      boxSizing: 'content-box',
      padding: '96px 24px 40px',
    },
    sectionTitle: {
      margin: 0,
      fontSize: 40,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      fontWeight: 700,
      fontFamily: 'inherit',
    },
    howTitle: {
      margin: 0,
      fontSize: 40,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      fontWeight: 700,
      maxWidth: 640,
      fontFamily: 'inherit',
    },
    howText: {
      margin: '16px 0 0',
      fontSize: 18,
      lineHeight: 1.55,
      color: colors.slateGray,
      maxWidth: 640,
      fontFamily: 'inherit',
      letterSpacing: 'normal',
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 24,
      marginTop: 48,
    },
    dashboard: {
      maxWidth: 1200,
      margin: '0 auto',
      boxSizing: 'content-box',
      padding: '56px 24px 96px',
    },
    dashboardRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 56,
      alignItems: 'center',
    },
    dashboardText: {
      flex: '1 1 340px',
      minWidth: 0,
    },
    featureList: {
      margin: '28px 0 0',
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
    },
    featureItem: {
      display: 'flex',
      gap: 12,
      fontSize: 17,
      lineHeight: 1.5,
      fontFamily: 'inherit',
      letterSpacing: 'normal',
    },
    featureIcon: {
      flex: 'none',
      marginTop: 2,
    },
    liveSiteLink: {
      display: 'inline-block',
      marginTop: 32,
      padding: '12px 0',
      fontSize: 17,
      fontWeight: 600,
      color: colors.oceanBlue,
      fontFamily: 'inherit',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textDecorationColor: 'currentColor',
      '&:hover': {
        color: colors.darkOceanBlue,
      },
    },
    examplesBlock: {
      marginTop: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    },
    examplesLink: {
      display: 'inline-block',
      padding: '12px 0 0',
      fontSize: 17,
      fontWeight: 600,
      color: colors.oceanBlue,
      fontFamily: 'inherit',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textDecorationColor: 'currentColor',
      '&:hover': {
        color: colors.darkOceanBlue,
      },
    },
    examplesText: {
      margin: 0,
      fontSize: 15,
      lineHeight: 1.5,
      color: colors.slateGray,
      maxWidth: 460,
      fontFamily: 'inherit',
      letterSpacing: 'normal',
    },
    dashboardImageWrapper: {
      flex: '1.4 1 520px',
      minWidth: 0,
      background: colors.mistGray,
      borderRadius: 16,
      padding: 24,
      boxSizing: 'content-box',
    },
    dashboardImage: {
      display: 'block',
      width: '100%',
      height: 'auto',
      borderRadius: 10,
      border: `1px solid ${colors.borderGray}`,
      boxSizing: 'content-box',
    },
    ai: {
      background: colors.mistGray,
      borderTop: `1px solid ${colors.borderGray}`,
    },
    aiInner: {
      maxWidth: 1200,
      margin: '0 auto',
      boxSizing: 'content-box',
      padding: '96px 24px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 56,
      alignItems: 'center',
    },
    aiText: {
      flex: '1 1 420px',
      minWidth: 0,
    },
    aiEyebrow: {
      margin: '0 0 16px',
      fontFamily: ibmPlexMonoFontFamily,
      fontSize: 14,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: colors.oceanBlue,
      lineHeight: 'normal',
    },
    aiIntro: {
      margin: '16px 0 0',
      fontSize: 18,
      lineHeight: 1.55,
      color: colors.slateGray,
      maxWidth: 540,
      fontFamily: 'inherit',
      letterSpacing: 'normal',
    },
    aiSteps: {
      margin: '36px 0 0',
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
    },
    aiStep: {
      display: 'flex',
      gap: 18,
    },
    aiIconBox: {
      flex: 'none',
      width: 44,
      height: 44,
      borderRadius: 10,
      background: colors.white,
      border: `1px solid ${colors.borderGray}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'content-box',
    },
    aiStepTitle: {
      fontSize: 19,
      fontWeight: 600,
      fontFamily: 'inherit',
      lineHeight: 'normal',
      letterSpacing: 'normal',
    },
    aiStepText: {
      fontSize: 16,
      lineHeight: 1.5,
      color: colors.slateGray,
      marginTop: 4,
      fontFamily: 'inherit',
      letterSpacing: 'normal',
    },
    aiImageWrapper: {
      flex: '1 1 460px',
      minWidth: 0,
    },
    aiImage: {
      display: 'block',
      width: '100%',
      height: 'auto',
    },
    heatwaves: {
      background: colors.navy,
      color: colors.white,
    },
    heatwavesInner: {
      maxWidth: 1200,
      margin: '0 auto',
      boxSizing: 'content-box',
      padding: '80px 24px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 40,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    heatwavesText: {
      flex: '1 1 520px',
      minWidth: 0,
    },
    heatwavesEyebrow: {
      margin: '0 0 16px',
      fontFamily: ibmPlexMonoFontFamily,
      fontSize: 14,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: colors.sunsetOrange,
      lineHeight: 'normal',
    },
    heatwavesIntro: {
      margin: '16px 0 0',
      fontSize: 18,
      lineHeight: 1.55,
      color: colors.paleGrayBlue,
      maxWidth: 600,
      fontFamily: 'inherit',
      letterSpacing: 'normal',
    },
    heatwavesButton: {
      flex: 'none',
      background: colors.white,
      color: colors.navy,
      fontSize: 17,
      fontWeight: 600,
      padding: '14px 24px',
      borderRadius: 8,
      minWidth: 0,
      fontFamily: 'inherit',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textTransform: 'none',
      '&:hover': {
        color: colors.navy,
        background: colors.white,
      },
    },
    about: {
      maxWidth: 1200,
      margin: '0 auto',
      boxSizing: 'content-box',
      padding: '96px 24px 40px',
    },
    aboutTitle: {
      margin: 0,
      fontSize: 32,
      lineHeight: 1.15,
      letterSpacing: '-0.02em',
      fontWeight: 700,
      fontFamily: 'inherit',
    },
    partnerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: 32,
      marginTop: 36,
    },
    partnerLabel: {
      margin: '0 0 12px',
      fontFamily: ibmPlexMonoFontFamily,
      fontSize: 13,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: colors.slateGray,
      lineHeight: 'normal',
    },
    partnerNames: {
      margin: 0,
      fontSize: 18,
      lineHeight: 1.7,
      fontWeight: 500,
      fontFamily: 'inherit',
      letterSpacing: 'normal',
    },
    start: {
      maxWidth: 1200,
      margin: '0 auto',
      boxSizing: 'content-box',
      padding: '72px 24px 112px',
    },
    startBox: {
      border: `1px solid ${colors.borderGray}`,
      borderRadius: 20,
      padding: 48,
    },
    startIntro: {
      margin: '14px 0 0',
      fontSize: 18,
      lineHeight: 1.55,
      color: colors.slateGray,
      maxWidth: 620,
      fontFamily: 'inherit',
      letterSpacing: 'normal',
    },
    startSteps: {
      margin: '40px 0 0',
      padding: 0,
      listStyle: 'none',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 32,
    },
    startNumber: {
      fontFamily: ibmPlexMonoFontFamily,
      fontSize: 15,
      fontWeight: 500,
      color: colors.oceanBlue,
      lineHeight: 'normal',
      letterSpacing: 'normal',
    },
    startTitle: {
      fontSize: 20,
      fontWeight: 600,
      marginTop: 8,
      fontFamily: 'inherit',
      lineHeight: 'normal',
      letterSpacing: 'normal',
    },
    startText: {
      fontSize: 16,
      lineHeight: 1.5,
      color: colors.slateGray,
      marginTop: 6,
      fontFamily: 'inherit',
      letterSpacing: 'normal',
    },
    startButtons: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 40,
    },
    startButton: {
      background: colors.oceanBlue,
      color: colors.white,
      fontSize: 17,
      fontWeight: 600,
      padding: '14px 24px',
      borderRadius: 8,
      minWidth: 0,
      fontFamily: 'inherit',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textTransform: 'none',
      '&:hover': {
        color: colors.white,
        background: colors.oceanBlue,
      },
    },
  });

type LandingPageProps = WithStyles<typeof styles>;

export default withStyles(styles)(LandingPage);
