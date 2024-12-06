import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Box, Button, Grid, Typography } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { reefCheckSurveyGetRequest } from 'store/ReefCheckSurveys/reefCheckSurveySlice';
import { siteErrorSelector, siteRequest } from 'store/Sites/selectedSiteSlice';
import NavBar from 'common/NavBar';
import NotFound from 'routes/NotFound';
import { reefCheckImpactRows } from 'store/ReefCheckSurveys';
import { fishColumns } from './colDefs/fish.colDef';
import { invertebratesColumns } from './colDefs/invertables.colDef';
import { impactColumns } from './colDefs/impact.colDef';
import { rareAnimalsColumns } from './colDefs/rareAnimals.colDef';
import { bleachingColumns } from './colDefs/bleaching.colDef';
import { reefStructureColumns } from './colDefs/reefStructure.coldDef';
import { ReefCheckSurveyOrganismsTable } from './ReefCheckSurveyOrganismsTable';
import { ReefCheckSurveySummary } from './ReefCheckSurveySummary';
import { ReefCheckSurveyDetails } from './ReefCheckSurveyDetails';
import { ReefCheckSurveySubstrates } from './ReefCheckSurveySubstratesTable';

export const ReefCheckSurveyViewPage = () => {
  const { id: siteId = '', sid: surveyId = '' } =
    useParams<{ id: string; sid: string }>();
  const error = useSelector(siteErrorSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo({ top: 0 });
    dispatch(reefCheckSurveyGetRequest({ siteId, surveyId }));
    dispatch(siteRequest(siteId));
  }, [dispatch, siteId, surveyId]);

  if (error) {
    return (
      <>
        <NavBar searchLocation />
        <NotFound />
      </>
    );
  }
  return (
    <>
      <NavBar searchLocation />

      <Box bgcolor="#F5F6F6" paddingX={4}>
        <Box marginY={2}>
          <Button
            color="primary"
            startIcon={<ArrowBack />}
            component={Link}
            to={`/sites/${siteId}`}
          >
            <Typography style={{ textTransform: 'none' }}>
              Back to site
            </Typography>
          </Button>
        </Box>
        <Grid container direction="column" spacing={2}>
          <Grid item xs={12}>
            <ReefCheckSurveySummary />
          </Grid>
          <Grid item xs={12}>
            <ReefCheckSurveyDetails />
          </Grid>
          <Grid item xs={12}>
            <ReefCheckSurveySubstrates
              title="Reef Structure and Composition"
              columns={reefStructureColumns}
            />
          </Grid>
          <Grid item xs={12}>
            <ReefCheckSurveyOrganismsTable
              title="Fish"
              description="Fish data is collected along four 5 meter wide by 20 meter long segments (100m²) of a 100 meter transect line for a total survey area of 400 square meters. Fish seen up to 5 meters above the line are included."
              columns={fishColumns}
              filter={(row) => row.type === 'Fish'}
            />
          </Grid>
          <Grid item xs={12}>
            <ReefCheckSurveyOrganismsTable
              title="Invertebrate"
              description="Invertebrate data is collected along four 5 meter wide by 20 meter long segments (100m²) of a 100 meter transect line for a total survey area of 400 square meters."
              columns={invertebratesColumns}
              filter={(row) => row.type === 'Invertebrate'}
            />
          </Grid>
          <Grid item xs={12}>
            <ReefCheckSurveyOrganismsTable
              title="Impact"
              description="0-3 scale. 0 = none, 1 = low (1 piece), 2 = medium (2-4 pieces) and 3 = high (5+ pieces)"
              columns={impactColumns}
              filter={(row) =>
                row.type === 'Impact' &&
                reefCheckImpactRows.includes(row.organism)
              }
            />
          </Grid>
          <Grid item xs={12}>
            <ReefCheckSurveyOrganismsTable
              title="Bleaching and Coral Diseases"
              description="Black band, white band, White Plague, and Aspergillosis are coral diseases."
              columns={bleachingColumns}
              filter={(row) =>
                row.type === 'Impact' &&
                !reefCheckImpactRows.includes(row.organism)
              }
            />
          </Grid>
          <Grid item xs={12}>
            <ReefCheckSurveyOrganismsTable
              title="Rare Animal"
              columns={rareAnimalsColumns}
              filter={(row) => row.type === 'Rare Animal'}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
