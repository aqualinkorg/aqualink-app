/* eslint-disable fp/no-mutating-methods */
import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
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
import { useHistory, useParams } from "react-router-dom";

import {
  setSiteOnMap,
  setSearchResult,
} from "../../store/Homepage/homepageSlice";
import type { Site } from "../../store/Sites/types";
import {
  sitesListSelector,
  sitesRequest,
} from "../../store/Sites/sitesListSlice";
import { getSiteNameAndRegion } from "../../store/Sites/helpers";
import mapServices from "../../services/mapServices";
import {
  unsetLatestData,
  unsetLiveData,
  unsetSelectedSite,
} from "../../store/Sites/selectedSiteSlice";

const siteAugmentedName = (site: Site) => {
  const { name, region } = getSiteNameAndRegion(site);
  if (name && region) {
    return `${name}, ${region}`;
  }
  return name || region || "";
};

const Search = ({ geocodingEnabled, classes }: SearchProps) => {
  const browserHistory = useHistory();
  const { id } = useParams<{ id: string }>();
  const [searchedSite, setSearchedSite] = useState<Site | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const dispatch = useDispatch();
  const sites = useSelector(sitesListSelector);
  const filteredSites = (sites || [])
    .filter((site) => siteAugmentedName(site))
    // Sort by formatted name
    .sort((a, b) => {
      const nameA = siteAugmentedName(a);
      const nameB = siteAugmentedName(b);
      return nameA.localeCompare(nameB);
    });

  // Fetch sites for the search bar
  useEffect(() => {
    dispatch(sitesRequest());
  }, [dispatch]);

  const onChangeSearchText = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const searchInput = event.target.value;
    const index = filteredSites.findIndex(
      (site) =>
        siteAugmentedName(site).toLowerCase() === searchInput.toLowerCase()
    );
    if (index > -1) {
      setSearchedSite(filteredSites[index]);
    } else {
      setSearchValue(searchInput);
    }
  };

  const onDropdownItemSelect = (event: ChangeEvent<{}>, value: Site | null) => {
    if (value && parseInt(id, 10) !== value.id) {
      setSearchedSite(null);
      dispatch(setSiteOnMap(value));
      // TODO - create a function to cleanup the state whenever we change the site.
      // At the moment this needs to happen:
      // - through the dropdown
      // - through the search
      // - through the admin side panel
      dispatch(unsetSelectedSite());
      dispatch(unsetLiveData());
      dispatch(unsetLatestData());
      if (!geocodingEnabled) {
        browserHistory.push(`/sites/${value.id}`);
      }
    }
  };

  const onSearchSubmit = () => {
    if (searchedSite) {
      if (!geocodingEnabled) {
        browserHistory.push(`/sites/${searchedSite.id}`);
      }
      dispatch(unsetLiveData());
      dispatch(unsetLatestData());
      dispatch(setSiteOnMap(searchedSite));
      setSearchedSite(null);
    } else if (searchValue && geocodingEnabled) {
      mapServices
        .getLocation(searchValue)
        .then((data) => dispatch(setSearchResult(data)))
        .catch(console.error);
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
          classes={{ listbox: classes.listbox, option: classes.option }}
          id="location"
          autoHighlight
          onKeyPress={onKeyPress}
          className={classes.searchBarInput}
          options={filteredSites}
          noOptionsText={
            geocodingEnabled
              ? `No sites found. Press enter to zoom to "${searchValue}"`
              : undefined
          }
          getOptionLabel={siteAugmentedName}
          value={searchedSite}
          onChange={onDropdownItemSelect}
          onInputChange={(_event, _value, reason) =>
            reason === "clear" && setSearchedSite(null)
          }
          renderInput={(params) => (
            <TextField
              {...params}
              onChange={onChangeSearchText}
              placeholder="Search"
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
    listbox: {
      overflowX: "hidden",
    },
    option: {
      display: "block",
      overflowWrap: "break-word",
    },
  });

interface SearchIncomingProps {
  geocodingEnabled?: boolean;
}

Search.defaultProps = {
  geocodingEnabled: false,
};

type SearchProps = SearchIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Search);
