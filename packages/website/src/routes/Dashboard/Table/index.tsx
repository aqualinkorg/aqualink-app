import React from 'react';
import { Box } from '@material-ui/core';
import SiteTableContainer from '../../HomeMap/SiteTableContainer';
import { Collection } from '../collection';

const Table = ({ collection }: TableIncomingProps) => (
  <Box width="100%" mt="55px" mb="20px">
    <SiteTableContainer
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
