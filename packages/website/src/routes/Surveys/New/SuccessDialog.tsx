import React from "react";
import { Typography } from "@material-ui/core";
import Dialog, { Action } from "../../../common/Dialog";

const SuccessDialog = ({ reefId, surveyId, open }: SuccessDialogProps) => {
  const actions: Action[] = [
    {
      size: "small",
      variant: "outlined",
      color: "primary",
      text: "Back To Reef",
      link: `/reefs/${reefId}`,
      action: () => {},
    },
    {
      size: "small",
      variant: "outlined",
      color: "primary",
      text: "See Survey",
      link: `/reefs/${reefId}/survey_details/${surveyId}`,
      action: () => {},
    },
  ];

  return (
    <Dialog
      open={open}
      header="Media successfully uploaded"
      content={
        <Typography color="textSecondary">
          Your media upload was successful. Where would you like to go next?
        </Typography>
      }
      actions={actions}
      onClose={() => {}}
    />
  );
};

interface SuccessDialogProps {
  reefId: number;
  surveyId: number;
  open: boolean;
}

export default SuccessDialog;
