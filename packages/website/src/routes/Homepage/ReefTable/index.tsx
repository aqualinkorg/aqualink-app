/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import SelectedReefCard from "./selectedReefCard";
import {
  reefsRequest,
  reefsListSelector,
} from "../../../store/Reefs/reefsListSlice";
import {
  reefRequest,
  reefDetailsSelector,
} from "../../../store/Reefs/selectedReefSlice";

const ReefTable = () => {
  const reefsList = useSelector(reefsListSelector);
  const selectedReefDetails = useSelector(reefDetailsSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(reefsRequest());
    dispatch(reefRequest("1"));
  }, [dispatch]);
  return (
    <>
      <SelectedReefCard reef={selectedReefDetails} />
    </>
  );
};

export default ReefTable;
