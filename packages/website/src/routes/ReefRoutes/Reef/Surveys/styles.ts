import theme from "../../../../layout/App/theme";

const styles = {
  dates: {
    fontWeight: 500,
    lineHeight: 0.81,
    color: "#757575",
  },
  addNewButton: {
    color: "#979797",
    height: "2rem",
    width: "2rem",
  },
  surveyCard: {
    width: "75%",
    backgroundColor: theme.palette.primary.light,
    border: 1,
    borderStyle: "solid",
    borderColor: "#dddddd",
    borderRadius: 2,
    height: "14rem",
  },
  cardImage: {
    height: "100%",
    width: "100%",
  },
  cardFields: {
    fontWeight: 500,
    lineHeight: 2,
    color: "#9ea6aa",
  },
  cardValues: {
    lineHeight: 2,
    color: "#2f2f2f",
  },
  buttonContainer: {
    height: "100%",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
};

export default styles;
