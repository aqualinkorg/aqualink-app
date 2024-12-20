import React from 'react';
import { Box } from '@mui/material';
import SiteTable from '../../HomeMap/SiteTable';
import { Collection } from '../collection';

const Table = ({ collection }: TableIncomingProps) => (
  <Box width="100%" mt="55px" mb="20px">
    <SiteTable
      showCard={false}
      showSiteFiltersDropdown={false}
      isExtended
      collection={collection}
      scrollTableOnSelection={false}
      scrollPageOnSelection
    />
  </Box>
);

interface TableIncomingProps {
  collection: Collection;
}

export default Table;
