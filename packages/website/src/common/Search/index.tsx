import React, { useState, ChangeEvent, KeyboardEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  withStyles,
  WithStyles,
  createStyles,
  IconButton,
  TextField,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import Autocomplete from "@material-ui/lab/Autocomplete";

import {
  setReefOnMap,
  setSearchResult,
} from "../../store/Homepage/homepageSlice";
import type { Reef } from "../../store/Reefs/types";
import { reefsListSelector } from "../../store/Reefs/reefsListSlice";
import { getReefNameAndRegion } from "../../store/Reefs/helpers";
import mapServices from "../../services/mapServices";

const reefAugmentedName = (reef: Reef) => {
  const { name, region } = getReefNameAndRegion(reef);
  if (name && region) {
    return `${name}, ${region}`;
  }
  return `${name || region || ""}`;
};

const Search = ({ classes }: SearchProps) => {
  const [searchedReef, setSearchedReef] = useState<Reef | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const dispatch = useDispatch();
  // eslint-disable-next-line fp/no-mutating-methods
  const reefs = useSelector(reefsListSelector)
    .filter((reef) => reefAugmentedName(reef))
    // Sort by formatted name
    .sort((a, b) => {
      const nameA = reefAugmentedName(a);
      const nameB = reefAugmentedName(b);
      return nameA.localeCompare(nameB);
    });

  const onDropdownItemSelect = (event: ChangeEvent<{}>, value: Reef | null) => {
    if (value) {
      setSearchedReef(value);
      dispatch(setReefOnMap(value));
    }
  };

  const onSearchSubmit = () => {
    if (searchedReef) {
      dispatch(setReefOnMap(searchedReef));
    } else if (searchValue) {
      mapServices
        .getLocation(searchValue)
        .then((data) => dispatch(setSearchResult(data)))
        // eslint-disable-next-line no-console
        .catch((error) => console.log(error));
    }
  };

  const onKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      onSearchSubmit();
    }
  };

  return (
    <div className={classes.searchBar}>
      <div className={classes.searchBarIcon}>
        <IconButton size="small" onClick={onSearchSubmit}>
          <SearchIcon />
        </IconButton>
      </div>

      <div className={classes.searchBarText}>
        <Autocomplete
          id="location"
          autoHighlight
          onKeyPress={onKeyPress}
          className={classes.searchBarInput}
          options={reefs}
          noOptionsText={`No sites found. Press enter to zoom to "${searchValue}"`}
          getOptionLabel={(reef) => reefAugmentedName(reef)}
          value={searchedReef}
          onChange={onDropdownItemSelect}
          onInputChange={(event, value, reason) =>
            reason === "clear" && setSearchedReef(null)
          }
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search by site name or country"
              variant="outlined"
              InputLabelProps={{
                shrink: false,
              }}
            />
          )}
        />
      </div>
    </div>
  );
};

const styles = () =>
  createStyles({
    searchBar: {
      display: "flex",
      alignItems: "stretch",
      borderRadius: 4,
      overflow: "hidden",
    },
    searchBarIcon: {
      display: "flex",
      justifyContent: "center",
      backgroundColor: "#6ba8c0",
      width: 40,
    },
    searchBarText: {
      paddingLeft: "0.5rem",
      backgroundColor: "#469abb",
      flexGrow: 1,
    },
    searchBarInput: {
      "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        borderWidth: 0,
      },
      "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        borderWidth: 0,
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderWidth: 0,
      },
      height: "100%",
      width: "100%",
    },
  });

type SearchProps = WithStyles<typeof styles>;

export default withStyles(styles)(Search);
