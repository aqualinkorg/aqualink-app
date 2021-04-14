import React from "react";
import { Box } from "@material-ui/core";
import ReefTable from "../../HomeMap/ReefTable";
import { Collection } from "../collection";

const Table = ({ collection }: TableIncomingProps) => {
  return (
    <Box width="100%" mt="55px" mb="20px">
      <ReefTable
        showCard={false}
        showSpottersOnlySwitch={false}
        extended
        collection={collection}
        scrollOnSelection={false}
      />
    </Box>
  );
};

interface TableIncomingProps {
  collection: Collection;
}

export default Table;
