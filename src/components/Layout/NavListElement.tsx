import * as React from "react";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import List from "@mui/material/List";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PeopleIcon from "@mui/icons-material/People";
import Collapse from "@mui/material/Collapse";
import DnsRoundedIcon from "@mui/icons-material/DnsRounded";
import PermMediaOutlinedIcon from "@mui/icons-material/PhotoSizeSelectActual";
import PublicIcon from "@mui/icons-material/Public";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import TimerIcon from "@mui/icons-material/Timer";
import SettingsIcon from "@mui/icons-material/Settings";
import PhonelinkSetupIcon from "@mui/icons-material/PhonelinkSetup";
import ConstructionIcon from "@mui/icons-material/Construction";
import { useContext, useState } from "react";
import { MenuListItem } from "../../services/OpenAPI";
import OperationBadge from "../common/OperationBadge";
import { NavigationContext } from "./NavigationContext";

const ICON_MAP = {
  users: <PeopleIcon />,
  database: <DnsRoundedIcon />,
  image: <PermMediaOutlinedIcon />,
  world: <PublicIcon />,
  width: <SettingsEthernetIcon />,
  connectors: <SettingsInputComponentIcon />,
  setup: <SettingsIcon />,
  stopwatch: <TimerIcon />,
  phone_setup: <PhonelinkSetupIcon />,
};

const item = {
  py: "2px",
  px: 3,
  color: "rgba(255, 255, 255, 0.7)",
  "&:hover, &:focus": {
    bgcolor: "rgba(255, 255, 255, 0.08)",
  },
};

interface Props {
  categories: { name: string; key: string; section: string; icon: string }[];
  sections: { name: string; key: string }[];
  groups?: {
    slug: string;
    name: string;
    section: string;
    tags: {
      name: string;
      slug: string;
    }[];
  }[];
  openApiItems: MenuListItem[];
}

export default function NavListElement({
  sections,
  categories,
  groups = [],
  openApiItems,
}: Props) {
  const [{ selectedVersion, selectedTagGroup }] = useContext(NavigationContext);
  const defaultSelectedCategory = selectedTagGroup
    ? groups.find((group) => group.slug === selectedTagGroup).section
    : undefined;

  const [openedCategory, setOpenedCategory] = useState(defaultSelectedCategory);

  const categoryClickHandlers = categories.reduce((acc, category) => {
    acc[category.key] = () => {
      setOpenedCategory(category.key);
    };
    return acc;
  }, {});

  const groupClickHandlers = groups.reduce((acc, group) => {
    acc[group.slug] = () => {
      window.location.href = ["", selectedVersion, group.slug].join("/");
    };
    return acc;
  }, {});

  const operationClickHandlers = openApiItems.reduce((acc, operation) => {
    acc = {
      ...acc,
      ...groups.reduce((groupacc, group) => {
        group.tags.forEach((tag) => {
          if (group.tags.some((tag) => operation.tags.includes(tag.name))) {
            groupacc[`${group.slug}#${operation.operationId}`] = () => {
              window.location.href =
                ["", selectedVersion, group.slug].join("/") +
                `#${operation.pathName}`;
            };
          }
        });
        return groupacc;
      }, {}),
    };
    return acc;
  }, {});

  return (
    <React.Fragment>
      {sections.map(({ key, name }) => (
        <Box key={key} sx={{ bgcolor: "#101F33" }}>
          <ListItem sx={{ py: 2, px: 3 }}>
            <ListItemText sx={{ color: "#fff" }}>{name}</ListItemText>
          </ListItem>
          {categories
            .filter((category) => category.section === key)
            .map(({ name: catName, icon, key: catKey }) => (
              <List disablePadding key={catKey}>
                <ListItemButton
                  selected={catKey === openedCategory}
                  sx={item}
                  onClick={categoryClickHandlers[catKey]}
                >
                  <ListItemIcon>{ICON_MAP[icon]}</ListItemIcon>
                  <ListItemText>{catName}</ListItemText>
                </ListItemButton>
                <Collapse
                  in={openedCategory === catKey}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {groups
                      .filter((group) => group.section === catKey)
                      .map((group) => (
                        <React.Fragment key={group.slug}>
                          <ListItemButton
                            onClick={groupClickHandlers[group.slug]}
                            selected={group.slug === selectedTagGroup}
                            sx={{ ...item, pl: 6 }}
                            key={group.slug}
                          >
                            <ListItemText primary={group.name} />
                          </ListItemButton>
                          {group.tags.map((tag) => (
                            <React.Fragment key={group.slug + tag.slug}>
                              <ListItemButton
                                sx={{ ...item, pl: 8 }}
                                key={group.slug + tag.slug}
                              >
                                <ListItemText primary={tag.name} />
                              </ListItemButton>
                              {openApiItems
                                .filter((openApiItem) =>
                                  openApiItem.tags.includes(tag.name)
                                )
                                .map((openApiItem) => (
                                  <ListItemButton
                                    onClick={
                                      operationClickHandlers[
                                        `${group.slug}#${openApiItem.operationId}`
                                      ]
                                    }
                                    sx={{ ...item, pl: 8 }}
                                    key={
                                      group.slug +
                                      tag.slug +
                                      openApiItem.operationId
                                    }
                                  >
                                    <ListItemIcon sx={{ mr: 0 }}>
                                      <OperationBadge item={openApiItem} />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={openApiItem.summary}
                                    />
                                  </ListItemButton>
                                ))}
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      ))}
                    {groups.filter((group) => group.section === catKey)
                      .length === 0 && (
                      <ListItem sx={{ ...item, pl: 8 }} key={"not found"}>
                        <ListItemIcon sx={{ mr: 1 }}>
                          <ConstructionIcon
                            sx={{
                              color: "rgba(255,255,255,0.26)",
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primaryTypographyProps={{
                            color: "rgba(255,255,255,0.26)",
                          }}
                          primary={"Under construction"}
                        />
                      </ListItem>
                    )}
                  </List>
                </Collapse>
              </List>
            ))}
          <Divider sx={{ mt: 2 }} />
        </Box>
      ))}
    </React.Fragment>
  );
}
