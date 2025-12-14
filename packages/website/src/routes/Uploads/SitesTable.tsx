import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { useSelector } from 'react-redux';
import { userInfoSelector } from 'store/User/userSlice';
import { SurveyPoints } from 'store/Sites/types';
import siteServices from 'services/siteServices';
import { CollapsibleTableRow, TableCellWrap } from './utils';

interface SiteSurveyPoints {
  siteId: number;
  surveyPoints: SurveyPoints[];
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginTop: theme.spacing(3),
  },
  table: {
    minWidth: 650,
  },
}));

function SitesTable() {
  const classes = useStyles();

  const [sitesSurveyPoints, setSitesSurveyPoints] = React.useState<
    SiteSurveyPoints[]
  >([]);

  const user = useSelector(userInfoSelector);

  React.useEffect(() => {
    (async () => {
      if (!user || !user.administeredSites) return;
      const result = await Promise.all(
        user.administeredSites.map(async (x) => {
          const resp = await siteServices.getSiteSurveyPoints(String(x.id));
          return {
            siteId: x.id,
            surveyPoints: resp.data,
          };
        }),
      );
      setSitesSurveyPoints(result);
    })();
  }, [user, user?.administeredSites]);

  if (
    user?.administeredSites === undefined ||
    user.administeredSites.length < 0
  ) {
    return (
      <Typography className={classes.container} variant="h5">
        No administrated sites to show
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} className={classes.container}>
      <Table className={classes.table} size="small">
        <TableHead>
          <TableRow>
            <TableCellWrap />
            <TableCellWrap align="left" bigText>
              Your Administrated Sites&apos; Names
            </TableCellWrap>
            <TableCellWrap align="right" bigText>
              Site IDs
            </TableCellWrap>
          </TableRow>
        </TableHead>
        <TableBody>
          {user.administeredSites.map((row) => {
            const sitePoints = sitesSurveyPoints.find(
              (x) => x.siteId === row.id,
            );
            return (
              <CollapsibleTableRow
                key={row.id}
                row={{
                  siteId: row.id,
                  siteName: row.name,
                  surveyPoints: sitePoints?.surveyPoints,
                }}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default SitesTable;
