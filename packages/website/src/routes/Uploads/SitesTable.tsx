import {
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
} from '@material-ui/core';
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

  return (
    <TableContainer component={Paper} className={classes.tableContainer}>
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
          {user?.administeredSites?.map((row) => {
            const sitePoints = sitesSurveyPoints.find(
              (x) => x.siteId === row.id,
            );
            return (
              <CollapsibleTableRow
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

const useStyles = makeStyles((theme: Theme) => ({
  tableContainer: {
    marginTop: theme.spacing(3),
  },
  table: {
    minWidth: 650,
  },
}));

export default SitesTable;
