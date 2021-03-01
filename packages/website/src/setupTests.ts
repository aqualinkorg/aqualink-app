// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import "mutationobserver-shim";

jest.mock("@material-ui/icons", () => ({
  __esModule: true,
  ArrowBack: "ArrowBack",
  Build: "Build",
  Cancel: "Cancel",
  Clear: "Clear",
  Code: "Code",
  Email: "Email",
  ExpandMore: "ExpandMore",
  Favorite: "Favorite",
  FavoriteBorder: "FavoriteBorder",
  FilterHdr: "FilterHdr",
  Flag: "Flag",
  GitHub: "GitHub",
  KeyboardArrowDown: "KeyboardArrowDown",
  KeyboardArrowUp: "KeyboardArrowUp",
  ArrowDownward: "ArrowDownward",
  ArrowUpward: "ArrowUpward",
  LocalOffer: "LocalOffer",
  Menu: "Menu",
  MoreVert: "MoreVert",
  Person: "Person",
  Share: "Share",
  Star: "Star",
  StarBorder: "StarBorder",
  ZoomOutMap: "ZoomOutMap",
}));

function stubMuiComponent(componentName: string, namedExports: any = {}) {
  jest.doMock(`@material-ui/core/${componentName}/${componentName}`, () => ({
    __esModule: true,
    default: `mock-${componentName}`,
    ...namedExports,
  }));
}

stubMuiComponent("Typography");
stubMuiComponent("Button", {
  styles: jest.requireActual("@material-ui/core/Button/Button").styles,
});
stubMuiComponent("IconButton");
stubMuiComponent("TextField");
stubMuiComponent("Avatar");
stubMuiComponent("Box");
stubMuiComponent("Tabs");
stubMuiComponent("Tab");
stubMuiComponent("AppBar");
stubMuiComponent("Toolbar");
stubMuiComponent("Tooltip");
stubMuiComponent("Link");
stubMuiComponent("Card");
stubMuiComponent("CardContent");
stubMuiComponent("Chip");
stubMuiComponent("List");
stubMuiComponent("ListItem");
stubMuiComponent("ListItemText");
stubMuiComponent("Menu");
stubMuiComponent("MenuList");
stubMuiComponent("MenuItem");
stubMuiComponent("Modal");
stubMuiComponent("Popover");
stubMuiComponent("CircularProgress");
stubMuiComponent("Hidden");
stubMuiComponent("ExpansionPanel");
stubMuiComponent("ExpansionPanelSummary");
stubMuiComponent("ExpansionPanelDetails");
stubMuiComponent("Checkbox");
stubMuiComponent("Drawer");
stubMuiComponent("Divider");
stubMuiComponent("Snackbar");
stubMuiComponent("Stepper");
stubMuiComponent("StepButton");
stubMuiComponent("Step");
stubMuiComponent("Switch");
stubMuiComponent("Dialog");
stubMuiComponent("DialogActions");
stubMuiComponent("DialogContent");
stubMuiComponent("DialogContentText");
stubMuiComponent("DialogTitle");
stubMuiComponent("Table");
stubMuiComponent("TableContainer");
stubMuiComponent("TableHead");
stubMuiComponent("TableBody");
stubMuiComponent("TableRow");
stubMuiComponent("TableCell");
stubMuiComponent("TablePagination");
stubMuiComponent("TableSortLabel");
