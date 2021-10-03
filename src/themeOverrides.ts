import { ThemeOptions } from "@material-ui/core/styles/createMuiTheme";

const themeOverrides: Partial<ThemeOptions> = {
  overrides: {
    MuiTableCell: {
      body: {
        paddingBottom: 8,
        paddingTop: 8
      },
      root: {
        height: 56,
        padding: "4px 24px"
      }
    }
  },
  palette: {
    primary: {
      light: "#FFCC07",
      main: "#FFCC07",
      dark: "#FFCC07",
      contrastText: "#FFFFFF"
    },
    secondary: {
      light: "#FFFFFF",
      main: "#FFFFFF",
      dark: "#FFFFFF",
      contrastText: "#FFCC07"
    },
    error:{
      light: "#FFFFFF",
      main: "#FFFFFF",
      dark: "#FFFFFF",
      contrastText: "#FFCC07"
    },
    type:  "light",
    tonalOffset: 0,
    contrastThreshold: 0, 
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",

    }
  }
};
export default themeOverrides;
