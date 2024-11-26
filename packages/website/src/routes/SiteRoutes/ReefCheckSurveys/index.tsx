import React, { useEffect } from 'react';
import { Box, Button, Grid, Typography } from '@material-ui/core';
import { Link, useParams } from 'react-router-dom';
import { reefCheckSurveyGetRequest } from 'store/ReefCheckSurveys/reefCheckSurveySlice';
import { useSelector, useDispatch } from 'react-redux';
import { siteErrorSelector, siteRequest } from 'store/Sites/selectedSiteSlice';
import NavBar from 'common/NavBar';
import { ArrowBack } from '@material-ui/icons';
import { ReefCheckSurveyOrganismsTable } from './ReefCheckSurveyOrganismsTable';
import { ReefCheckSurveySummary } from './ReefCheckSurveySummary';
import { ReefCheckSurveyDetails } from './ReefCheckSurveyDetails';
import { fishColumns } from './colDefs/fish.colDef';
import { invertebratesColumns } from './colDefs/invertables.colDef';
import { impactColumns } from './colDefs/impact.colDef';
import { rareAnimalsColumns } from './colDefs/rareAnimals.colDef';
import { bleachingColumns } from './colDefs/bleaching.colDef';
import { reefStructureColumns } from './colDefs/reefStructure';
import { ReefCheckSurveySubstrates } from './ReefCheckSurveySubstratesTable';

const impactRows = [
  'Coral Damage Anchor',
  'Coral Damage Dynamite',
  'Coral Damage Other',
  'Trash Fish Nets',
  'Trash General',
];

export const ReefCheckSurveyViewPage = () => {
  const { id: siteId = '', sid: surveyId = '' } =
    useParams<{ id: string; sid: string }>();
  const error = useSelector(siteErrorSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(reefCheckSurveyGetRequest({ siteId, surveyId }));
    dispatch(siteRequest(siteId));
  }, [dispatch, siteId, surveyId]);

  if (error) {
    return <Typography>Error loading site details</Typography>;
  }
  return (
    <>
      <NavBar searchLocation />

      <Box bgcolor="#F5F6F6" paddingX={4}>
        <Box>
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
          <Grid item>
            <ReefCheckSurveySummary />
          </Grid>
          <Grid item>
            <ReefCheckSurveyDetails />
          </Grid>
          <Grid item>
            <ReefCheckSurveyOrganismsTable
              title="Fish"
              description="Fish data is collected along four 5 meter wide by 20 meter long segments (100m²) of a 100 meter transect line for a total survey area of 400 square meters. Fish seen up to 5 meters above the line are included."
              columns={fishColumns}
              filter={(row) => row.type === 'Fish'}
            />
          </Grid>
          <Grid item>
            <ReefCheckSurveyOrganismsTable
              title="Invertebrate"
              description="Invertebrate data is collected along four 5 meter wide by 20 meter long segments (100m²) of a 100 meter transect line for a total survey area of 400 square meters."
              columns={invertebratesColumns}
              filter={(row) => row.type === 'Invertebrate'}
            />
          </Grid>
          <Grid item>
            <ReefCheckSurveyOrganismsTable
              title="Impact"
              description="0-3 scale. 0 = none, 1 = low (1 piece), 2 = medium (2-4 pieces) and 3 = high (5+ pieces)"
              columns={impactColumns}
              filter={(row) =>
                row.type === 'Impact' && impactRows.includes(row.organism)
              }
            />
          </Grid>
          <Grid item>
            <ReefCheckSurveyOrganismsTable
              title="Bleaching and Coral Diseases"
              description="Black band, white band, White Plague, and Aspergillosis are coral diseases."
              columns={bleachingColumns}
              filter={(row) =>
                row.type === 'Impact' && !impactRows.includes(row.organism)
              }
            />
          </Grid>
          <Grid item>
            <ReefCheckSurveyOrganismsTable
              title="Rare Animal"
              columns={rareAnimalsColumns}
              filter={(row) => row.type === 'Rare Animal'}
            />
          </Grid>
          <Grid item>
            <ReefCheckSurveySubstrates
              title="Reef Structure and Composition"
              columns={reefStructureColumns}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
