import React from "react";
import { Box, useTheme, useMediaQuery } from "@material-ui/core";
import ReefTable from "../../HomeMap/ReefTable";
import { Collection } from "../collection";

const Table = ({ collection }: TableIncomingProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

  return (
    <Box width="100%" mt="55px" mb="20px">
      <ReefTable
        showCard={false}
        showSpottersOnlySwitch={false}
        isExtended
        collection={collection}
        scrollTableOnSelection={false}
        scrollPageOnSelection={isMobile}
      />
    </Box>
  );
};

interface TableIncomingProps {
  collection: Collection;
}

export default Table;
