import { CloseOutlined, ExpandMore, Tune } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionProps,
  AccordionSummary,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Typography,
} from '@mui/material';
import { createStyles, WithStyles, withStyles } from '@mui/styles';
import { Box } from '@mui/system';
import isEmpty from 'lodash/isEmpty';
import React, { SyntheticEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { siteFilterOptions } from 'store/Sites/constants';
import {
  sitesListFiltersSelector,
  patchSiteFilters,
  sitesToDisplayListSelector,
  clearSiteFilters,
} from 'store/Sites/sitesListSlice';
import { PatchSiteFiltersPayload, SiteFilters } from 'store/Sites/types';

type SitesFilterModalComponentProps = WithStyles<typeof styles>;

const SitesFilterModalComponent = ({
  classes,
}: SitesFilterModalComponentProps) => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const filters = useSelector(sitesListFiltersSelector);
  const filteredSites = useSelector(sitesToDisplayListSelector);

  const handleClose = () => setOpen(false);
  const handleClearAll = () => {
    if (!isEmpty(filters)) {
      dispatch(clearSiteFilters());
    }
  };
  const handleFilterChange =
    <T extends keyof SiteFilters>(
      category: PatchSiteFiltersPayload<T>['category'],
      filter: PatchSiteFiltersPayload<T>['filter'],
    ) =>
    (e: SyntheticEvent, checked: boolean) =>
      dispatch(patchSiteFilters({ category, filter, value: checked }));

  const noFilterSelected = Object.values(filters).every(isEmpty);
  const accordionProps: Partial<AccordionProps> = {
    classes: { root: classes.accordion, heading: classes.accordionSummary },
    disableGutters: true,
    square: true,
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Tune />}
        onClick={() => setOpen(true)}
      >
        All sites
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle className={classes.title}>Filters</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={() => ({
            position: 'absolute',
            right: 8,
            top: 8,
          })}
        >
          <CloseOutlined />
        </IconButton>
        <Box>
          <Divider />
          <Box px={2}>
            <FormControlLabel
              checked={noFilterSelected}
              onChange={handleClearAll}
              control={<Checkbox />}
              label="All Sites and Data"
              className={classes.allSites}
              slotProps={{
                typography: {
                  fontWeight: 'bold',
                },
              }}
            />
          </Box>
          <Divider />
          <Accordion {...accordionProps}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              Heat Stress Status
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {siteFilterOptions.heatStressStatus.map(({ value, label }) => (
                  <FormControlLabel
                    key={value}
                    checked={filters.heatStress?.[value] ?? false}
                    onChange={handleFilterChange('heatStress', value)}
                    control={<Checkbox />}
                    label={label}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          <Divider />
          <Accordion {...accordionProps}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              Sensor and Data Types
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {siteFilterOptions.siteOptions.map(({ value, label }) => (
                  <FormControlLabel
                    key={value}
                    checked={filters.siteOptions?.[value] ?? false}
                    onChange={handleFilterChange('siteOptions', value)}
                    control={<Checkbox />}
                    label={label}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          <Divider />
          <Accordion {...accordionProps}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              Species
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="h6" fontWeight="bold">
                Fish
              </Typography>
              <Box sx={{ columnCount: 2 }}>
                {siteFilterOptions.species.fish.map((fish) => (
                  <FormControlLabel
                    key={fish}
                    checked={filters.species?.[fish] ?? false}
                    onChange={handleFilterChange('species', fish)}
                    control={<Checkbox />}
                    label={fish}
                    sx={{ width: '100%' }}
                  />
                ))}
              </Box>
              <Typography variant="h6" fontWeight="bold">
                Invertebrate
              </Typography>
              <Box sx={{ columnCount: 2 }}>
                {siteFilterOptions.species.invertebrates.map((invertebrate) => (
                  <FormControlLabel
                    key={invertebrate}
                    checked={filters.species?.[invertebrate] ?? false}
                    onChange={handleFilterChange('species', invertebrate)}
                    control={<Checkbox />}
                    label={invertebrate}
                    sx={{ width: '100%' }}
                  />
                ))}
              </Box>
              <Typography variant="h6" fontWeight="bold">
                Rare Animals
              </Typography>
              <Box sx={{ columnCount: 2 }}>
                {siteFilterOptions.species.rareAnimals.map((rareAnimal) => (
                  <FormControlLabel
                    key={rareAnimal}
                    checked={filters.species?.[rareAnimal] ?? false}
                    onChange={handleFilterChange('species', rareAnimal)}
                    control={<Checkbox />}
                    label={rareAnimal}
                    sx={{ width: '100%' }}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
          <Divider />
          <Accordion {...accordionProps}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              Reef Composition
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {siteFilterOptions.reefComposition.map(({ value, label }) => (
                  <FormControlLabel
                    key={value}
                    checked={filters.reefComposition?.[value] ?? false}
                    onChange={handleFilterChange('reefComposition', value)}
                    control={<Checkbox />}
                    label={label}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          <Divider />
          <Accordion {...accordionProps}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              Anthropogenic Impact
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {siteFilterOptions.impact.map((item) => (
                  <FormControlLabel
                    key={item}
                    checked={filters.impact?.[item] ?? false}
                    onChange={handleFilterChange('impact', item)}
                    control={<Checkbox />}
                    label={item}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        </Box>
        <DialogActions>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Button disabled={noFilterSelected} onClick={handleClearAll}>
              CLEAR ALL
            </Button>
            <Button variant="contained" onClick={handleClose}>
              SHOW {filteredSites?.length ?? 0} Sites
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

const styles = createStyles({
  title: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
  },
  allSites: {
    marginBottom: 0,
  },
  accordion: {
    boxShadow: 'none',

    '&::before': {
      opacity: 0,
    },
    '& label': {
      marginBottom: 0,
    },
  },
  accordionSummary: {
    '& button': {
      fontWeight: 'bold',
    },
  },
});

export const SitesFilterModal = withStyles(styles)(SitesFilterModalComponent);
