import * as React from "react";
import { useStaticQuery, graphql } from "gatsby";
import semver from "semver";
import { alpha, styled } from "@mui/material/styles";
import Drawer, { DrawerProps } from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputBase from "@mui/material/InputBase";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import HomeIcon from "@mui/icons-material/Home";
import NavListElement from "./NavListElement";

// @ts-ignore
import zhivaIcon from "./zhiva_light.svg";
import { useContext, useEffect, useState } from "react";
import { MenuListItem, OpenAPI } from "../../services/OpenAPI";
import { NavigationContext } from "./NavigationContext";

const item = {
  py: "2px",
  px: 3,
  color: "rgba(255, 255, 255, 0.7)",
  "&:hover, &:focus": {
    bgcolor: "rgba(255, 255, 255, 0.08)",
  },
};

const itemCategory = {
  boxShadow: "0 -1px 0 rgb(255,255,255,0.1) inset",
  py: 1.5,
  px: 3,
};

const CustomizedInput = styled(InputBase)(({ theme }) => ({
  "& .MuiInputBase-input": {
    borderRadius: 4,
    position: "relative",
    backgroundColor: theme.palette.mode === "light" ? "#eee" : "#666",
    border: "1px solid #ced4da",
    fontSize: 16,
    width: "auto",
    padding: "2px 4px",
    marginLeft: 8,
    transition: theme.transitions.create([
      "border-color",
      "background-color",
      "box-shadow",
    ]),
    "&:focus": {
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      borderColor: theme.palette.primary.main,
    },
  },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

interface Props extends DrawerProps {
  openApiItems: MenuListItem[];
}

export default function Navigator(props: Props) {
  const {
    site: {
      siteMetadata: { categories, title, sections },
    },
    allOpenapiYaml: { nodes },
    allMarkdownRemark: { nodes: mdPages },
  } = useStaticQuery(graphql`
    query NavigationQuery {
      allMarkdownRemark {
        nodes {
          fields {
            slug
          }
          frontmatter {
            category
            docVersion
            title
          }
        }
      }
      allOpenapiYaml {
        nodes {
          info {
            version
          }
          slug
          x_tagGroups {
            tags {
              name
              slug
            }
            slug
            name
            section
          }
        }
      }
      site {
        siteMetadata {
          title
          sections {
            name
            key
          }
          categories {
            name
            key
            section
            icon
          }
        }
      }
    }
  `);
  const [{ selectedVersion }] = useContext(NavigationContext);
  const { openApiItems, ...other } = props;

  const versions = nodes.map((openapi) => ({
    version: openapi.info.version,
    key: openapi.slug,
    slug: `/${openapi.slug}`,
  }));

  const groups = nodes.find(
    (node) => node.slug === selectedVersion
  ).x_tagGroups;

  const currVersion = versions.find(ver => ver.key === selectedVersion);
  const pages = mdPages.filter(page => semver.satisfies(currVersion.version, String(page.frontmatter.docVersion)));

  const handleChange = (event: SelectChangeEvent) => {
    const url = new URL(document.URL)
    const currPath = url.pathname.split("/");
    currPath[1] = event.target.value;
    window.location.href = currPath.join("/") + url.hash;
  };

  return (
    <Drawer variant="permanent" {...other}>
      <List disablePadding>
        <ListItem
          sx={{ ...item, ...itemCategory, fontSize: 22, color: "#fff" }}
        >
          <ListItemIcon sx={{ height: 32 }}>
            <img src={zhivaIcon} alt={"Logo"} />
          </ListItemIcon>
          <ListItemText
            sx={{ my: 0 }}
            primary={title}
            primaryTypographyProps={{
              fontSize: "20px !important",
              fontWeight: "medium",
              letterSpacing: 0,
            }}
          />
        </ListItem>
        <ListItem
          sx={{ ...item, ...itemCategory, fontSize: 22 }}
          secondaryAction={
            <FormControl margin={"dense"} sx={{ m: 0 }}>
              <Select
                id="version-select"
                value={selectedVersion}
                input={<CustomizedInput />}
                inputProps={{ "aria-label": "Without label" }}
                MenuProps={MenuProps}
                onChange={handleChange}
              >
                {versions.map(({ version, key }) => (
                  <MenuItem value={key} key={key}>
                    {version}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          }
        >
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText>Project Version</ListItemText>
        </ListItem>
        <NavListElement
          categories={categories}
          sections={sections}
          groups={groups}
          pages={pages}
          openApiItems={openApiItems}
        />
      </List>
    </Drawer>
  );
}
