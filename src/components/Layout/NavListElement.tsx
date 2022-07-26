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
import Button from "@mui/material/Button";
import DnsRoundedIcon from "@mui/icons-material/DnsRounded";
import PermMediaOutlinedIcon from "@mui/icons-material/PhotoSizeSelectActual";
import PublicIcon from "@mui/icons-material/Public";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import TimerIcon from "@mui/icons-material/Timer";
import SettingsIcon from "@mui/icons-material/Settings";
import PhonelinkSetupIcon from "@mui/icons-material/PhonelinkSetup";
import ConstructionIcon from "@mui/icons-material/Construction";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import FormatShapesIcon from "@mui/icons-material/FormatShapes";
import SchemaOutlinedIcon from "@mui/icons-material/SchemaOutlined";
import DataObjectOutlinedIcon from "@mui/icons-material/DataObjectOutlined";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useContext, useState } from "react";
import { MenuListItem } from "../../services/OpenAPI";
import OperationBadge from "../common/OperationBadge";
import { NavigationContext } from "./NavigationContext";
import { scrollToId } from "../../utils/scrollToId";
import { isBrowser } from "../Redoc/Markdown/SanitizedMdBlock";

const MAX_HEADING_DEPTH = 2;

const ICON_MAP = {
  users: <PeopleIcon />,
  database: <DnsRoundedIcon />,
  image: <PermMediaOutlinedIcon />,
  world: <PublicIcon />,
  width: <SettingsEthernetIcon />,
  connectors: <SettingsInputComponentIcon />,
  segments: <ScatterPlotIcon />,
  lines: <FormatShapesIcon />,
  schema: <SchemaOutlinedIcon />,
  setup: <SettingsIcon />,
  api: <DataObjectOutlinedIcon />,
  stopwatch: <TimerIcon />,
  phone_setup: <PhonelinkSetupIcon />,
};

const item = {
  py: "2px",
  px: 3,
  pr: 0,
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
  schemas?: {
    slug: string;
    name: string;
    doNotRender: boolean | null;
  }[];
  pages?: {
    fields: {
      slug: string;
    };
    frontmatter: {
      category: string;
      docVersion: string;
      title: string;
    };
    headings: {
      id: string;
      value: string;
      depth: number;
    }[];
  }[];
  openApiItems: MenuListItem[];
}

interface CollapseButtonProps {
  isOpen: boolean;
  groupId: string;
  onClick: (groupId: string) => void;
}

function CollapseButton({ isOpen, groupId, onClick }: CollapseButtonProps) {
  const handleClick = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    onClick(groupId);
  };
  return (
    <Button onClick={handleClick} sx={{ ...item, pl: 0, m: 0, width: "24px" }}>
      {isOpen ? <ExpandLess /> : <ExpandMore />}
    </Button>
  );
}

export default function NavListElement({
  sections,
  categories,
  groups = [],
  pages = [],
  schemas = [],
  openApiItems,
}: Props) {
  const [
    {
      selectedVersion,
      selectedVersionSlug,
      selectedTagGroup,
      selectedPage,
      selectedSchema,
      visibleElements,
    },
  ] = useContext(NavigationContext);
  const defaultSelectedCategory = selectedTagGroup
    ? groups.find((group) => group.slug === selectedTagGroup).section
    : selectedPage
    ? pages.find((page) => page.fields.slug === selectedPage).frontmatter
        .category
    : selectedSchema
    ? "api-schemas"
    : undefined;

  const defaultSelectedItem =
    selectedTagGroup || selectedPage || selectedSchema;

  const [openedCategory, setOpenedCategory] = useState(defaultSelectedCategory);
  const [openedItems, setOpenedItems] = useState([defaultSelectedItem]);

  const categoryClickHandlers = categories.reduce((acc, category) => {
    acc[category.key] = () => {
      setOpenedCategory(category.key);
    };
    return acc;
  }, {});

  const handleToggleItem = (itemId: string) => {
    if (openedItems.includes(itemId)) {
      setOpenedItems(openedItems.filter((el) => el !== itemId));
    } else {
      setOpenedItems([...openedItems, itemId]);
    }
  };

  const groupClickHandlers = groups.reduce((acc, group) => {
    acc[group.slug] = (event) => {
      if (event.button === 1) {
        window.open(
          `${window.location.origin}/${[
            "",
            selectedVersionSlug,
            group.slug,
          ].join("/")}`,
          "_blank"
        );
      } else {
        window.location.href = ["", selectedVersionSlug, group.slug].join("/");
      }
    };
    return acc;
  }, {});

  const operationClickHandlers = openApiItems.reduce((acc, operation) => {
    acc = {
      ...acc,
      ...groups.reduce((groupacc, group) => {
        group.tags.forEach((tag) => {
          if (group.tags.some((tag) => operation.tags.includes(tag.name))) {
            if (isBrowser()) {
              if (
                window.location.pathname.includes(
                  ["", selectedVersionSlug, group.slug].join("/")
                )
              ) {
                groupacc[`${group.slug}#${operation.operationId}`] = (
                  event
                ) => {
                  if (event.button === 1) {
                    window.open(
                      `${window.location.origin}${window.location.pathname}#${operation.urlId}`,
                      "_blank"
                    );
                  } else {
                    window.location.hash = operation.urlId;

                    scrollToId(operation.urlId);
                  }
                };
              } else {
                groupacc[`${group.slug}#${operation.operationId}`] = (
                  event
                ) => {
                  if (event.button === 1) {
                    window.open(
                      `${window.location.origin}/${
                        ["", selectedVersionSlug, group.slug].join("/") +
                        `#${operation.urlId}`
                      }`,
                      "_blank"
                    );
                  } else {
                    window.location.href =
                      ["", selectedVersionSlug, group.slug].join("/") +
                      `#${operation.urlId}`;
                  }
                };
              }
            }
          }
        });
        if (operation.tags.includes(group.name)) {
          if (isBrowser()) {
            if (
              window.location.pathname.includes(
                ["", selectedVersionSlug, group.slug].join("/")
              )
            ) {
              groupacc[`${group.slug}#${operation.operationId}`] = (event) => {
                if (event.button === 1) {
                  window.open(
                    `${window.location.origin}${window.location.pathname}#${operation.urlId}`,
                    "_blank"
                  );
                } else {
                  window.location.hash = operation.urlId;

                  scrollToId(operation.urlId);
                }
              };
            } else {
              groupacc[`${group.slug}#${operation.operationId}`] = (event) => {
                if (event.button === 1) {
                  window.open(
                    `${window.location.origin}/${
                      ["", selectedVersionSlug, group.slug].join("/") +
                      `#${operation.urlId}`
                    }`,
                    "_blank"
                  );
                } else {
                  window.location.href =
                    ["", selectedVersionSlug, group.slug].join("/") +
                    `#${operation.urlId}`;
                }
              };
            }
          }
        }
        return groupacc;
      }, {}),
    };
    return acc;
  }, {});

  const pagesClickHandlers = pages.reduce((acc, page) => {
    acc[page.fields.slug] = {
      $page: (event) => {
        if (event.button === 1) {
          window.open(
            `${window.location.origin}/${selectedVersionSlug}${page.fields.slug}`,
            "_blank"
          );
        } else {
          window.location.href = `/${selectedVersionSlug}${page.fields.slug}`;
        }
      },
      ...page.headings.reduce((headingAcc, heading) => {
        if (page.fields.slug === selectedPage) {
          headingAcc[heading.id] = (event) => {
            if (event.button === 1) {
              window.open(
                `${window.location.origin}${window.location.pathname}#${heading.id}`,
                "_blank"
              );
            } else {
              window.location.hash = heading.id;

              scrollToId(heading.id);
            }
          };
        } else {
          headingAcc[heading.id] = (event) => {
            if (event.button === 1) {
              window.open(
                `${window.location.origin}/${selectedVersionSlug}${page.fields.slug}#${heading.id}`,
                "_blank"
              );
            } else {
              window.location.href = `/${selectedVersionSlug}${page.fields.slug}#${heading.id}`;
            }
          };
        }
        return headingAcc;
      }, {}),
    };
    return acc;
  }, {});

  const schemaClickHandlers = schemas.reduce((acc, schema) => {
    acc[schema.slug] = {
      $page: (event) => {
        if (event.button === 1) {
          window.open(
            `${window.location.origin}/${selectedVersionSlug}/schemas/${schema.slug}`,
            "_blank"
          );
        } else {
          window.location.href = `/${selectedVersionSlug}/schemas/${schema.slug}`;
        }
      },
    };
    return acc;
  }, {});

  const selectedHash = isBrowser() ? window.location.hash : "";

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
                    {pages
                      .filter((page) => page.frontmatter.category === catKey)
                      .map((page) => (
                        <React.Fragment key={page.fields.slug}>
                          <ListItemButton
                            selected={page.fields.slug === selectedPage}
                            sx={{ ...item, pl: 4 }}
                            style={{ paddingRight: 0 }}
                            key={page.fields.slug}
                          >
                            <ListItemText
                              primary={page.frontmatter.title}
                              onMouseDown={
                                pagesClickHandlers[page.fields.slug].$page
                              }
                            />
                            <CollapseButton
                              isOpen={openedItems.includes(page.fields.slug)}
                              groupId={page.fields.slug}
                              onClick={handleToggleItem}
                            />
                          </ListItemButton>
                          <Collapse
                            in={openedItems.includes(page.fields.slug)}
                            timeout="auto"
                            unmountOnExit
                          >
                            {page.headings
                              .filter(
                                (heading) => heading.depth <= MAX_HEADING_DEPTH
                              )
                              .map((heading) => (
                                <React.Fragment
                                  key={page.fields.slug + heading.id}
                                >
                                  <ListItemButton
                                    onMouseDown={
                                      pagesClickHandlers[page.fields.slug][
                                        heading.id
                                      ]
                                    }
                                    selected={
                                      `${page.fields.slug}#${heading.id}` ===
                                      `${selectedPage}${selectedHash}`
                                    }
                                    sx={{
                                      ...item,
                                      pl: 4 + (heading.depth - 1) * 2,
                                    }}
                                    key={page.fields.slug + heading.id}
                                  >
                                    <ListItemText
                                      primaryTypographyProps={{
                                        style: { fontSize: "12px" },
                                      }}
                                      primary={`- ${heading.value}`}
                                    />
                                  </ListItemButton>
                                </React.Fragment>
                              ))}
                          </Collapse>
                        </React.Fragment>
                      ))}
                    {groups
                      .filter((group) => group.section === catKey)
                      .map((group) => (
                        <React.Fragment key={group.slug}>
                          <ListItemButton
                            onMouseDown={groupClickHandlers[group.slug]}
                            selected={group.slug === selectedTagGroup}
                            sx={{ ...item, pl: 4 }}
                            key={group.slug}
                          >
                            <ListItemText primary={group.name} />
                          </ListItemButton>
                          {openApiItems
                            .filter((openApiItem) =>
                              openApiItem.tags.includes(group.name)
                            )
                            .map((openApiItem) => (
                              <ListItemButton
                                onMouseDown={
                                  operationClickHandlers[
                                    `${group.slug}#${openApiItem.operationId}`
                                  ]
                                }
                                selected={visibleElements.includes(
                                  openApiItem.urlId
                                )}
                                sx={{ ...item, pl: 8 }}
                                key={group.slug + openApiItem.operationId}
                              >
                                <ListItemIcon sx={{ mr: 0 }}>
                                  <OperationBadge item={openApiItem} />
                                </ListItemIcon>
                                <ListItemText
                                  primaryTypographyProps={{
                                    style: { fontSize: "12px" },
                                  }}
                                  primary={openApiItem.summary}
                                />
                              </ListItemButton>
                            ))}
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
                                    onMouseDown={
                                      operationClickHandlers[
                                        `${group.slug}#${openApiItem.operationId}`
                                      ]
                                    }
                                    selected={visibleElements.includes(
                                      openApiItem.urlId
                                    )}
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
                                      primaryTypographyProps={{
                                        style: { fontSize: "12px" },
                                      }}
                                      primary={openApiItem.summary}
                                    />
                                  </ListItemButton>
                                ))}
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      ))}
                    {catKey === "api-schemas"
                      ? schemas.map((schema) => (
                          <React.Fragment key={schema.slug}>
                            <ListItemButton
                              onMouseDown={
                                schemaClickHandlers[schema.slug].$page
                              }
                              selected={schema.slug === selectedSchema}
                              sx={{ ...item, pl: 4 }}
                              key={schema.slug}
                            >
                              <ListItemText primary={schema.name} />
                            </ListItemButton>
                          </React.Fragment>
                        ))
                      : null}
                    {groups.filter((group) => group.section === catKey)
                      .length === 0 &&
                      pages.filter(
                        (page) => page.frontmatter.category === catKey
                      ).length === 0 &&
                      (catKey === "api-schemas"
                        ? schemas.length === 0
                        : true) && (
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
