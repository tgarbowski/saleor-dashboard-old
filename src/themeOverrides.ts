import { Theme } from "@material-ui/core/styles";

const themeOverrides: Partial<Theme> = {
  overrides: {
    MuiTableCell: {
      body: {
        paddingBottom: 8,
        paddingTop: 8,
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
    
   }
};
export default themeOverrides;