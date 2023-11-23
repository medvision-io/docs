import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import HelpIcon from "@mui/icons-material/Help";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import MenuIcon from "@mui/icons-material/Menu";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Slide from "@mui/material/Slide";

const lightColor = "rgba(255, 255, 255, 0.7)";

interface HeaderProps {
  onDrawerToggle: () => void;
  title?: string;
  menuOptions?: {
    name: string;
    action: () => void;
    isSelected: boolean;
  }[];
}

function HideOnScroll(props) {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export default function Header({
  onDrawerToggle,
  title,
  menuOptions,
}: HeaderProps) {
  return (
    <React.Fragment>
      <HideOnScroll>
        <AppBar color="primary" position="sticky" elevation={0}>
          <Toolbar>
            <Grid container spacing={1} alignItems="center">
              <Grid sx={{ display: { sm: "none", xs: "block" } }} item>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={onDrawerToggle}
                  edge="start"
                >
                  <MenuIcon />
                </IconButton>
              </Grid>
              <Grid item xs />
              <Grid item>
                <Link
                  href="https://zhiva.org"
                  variant="body2"
                  sx={{
                    textDecoration: "none",
                    color: lightColor,
                    "&:hover": {
                      color: "common.white",
                    },
                  }}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Go to <strong>ZhivaAI</strong> homepage
                </Link>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      {title && (
        <AppBar
          component="div"
          color="primary"
          position="static"
          elevation={0}
          sx={{ zIndex: 0 }}
        >
          <Toolbar>
            <Grid container alignItems="center" spacing={1}>
              <Grid item xs>
                <Typography color="inherit" variant="h5" component="h1">
                  {title}
                </Typography>
              </Grid>
              <Grid item>
                <Button
                  sx={{ borderColor: lightColor }}
                  variant="outlined"
                  color="inherit"
                  size="small"
                >
                  Web setup
                </Button>
              </Grid>
              <Grid item>
                <Tooltip title="Help">
                  <IconButton color="inherit">
                    <HelpIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      )}
      {menuOptions && (
        <AppBar
          component="div"
          position="static"
          elevation={0}
          sx={{ zIndex: 0 }}
        >
          <Tabs
            value={menuOptions.findIndex((option) => option.isSelected)}
            textColor="inherit"
          >
            {menuOptions.map((menuOption, idx) => (
              <Tab
                key={menuOption.name}
                value={idx}
                label={menuOption.name}
                onClick={menuOption.action}
              />
            ))}
          </Tabs>
        </AppBar>
      )}
    </React.Fragment>
  );
}
