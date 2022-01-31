import * as React from "react";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { OpenAPIV3_1 } from "openapi-types";
import { ReactElement, useContext, useState } from "react";
import ReactJson from "react-json-view";
import ToggleButton from "@mui/material/ToggleButton";
import { isBrowser } from "../../Markdown/SanitizedMdBlock";
import Link from "@mui/material/Link";
import { OpenAPIContext } from "../../../Layout/OpenAPIContext";

interface Props {
  requestBody?: OpenAPIV3_1.RequestBodyObject;
  responses?: OpenAPIV3_1.ResponsesObject;
  type: string;
}

function getTitle(type: string): ReactElement {
  switch (type) {
    case "request":
      return (
        <Typography variant={"body1"} sx={{ ml: 2 }}>
          Request samples:
        </Typography>
      );
    case "response":
      return (
        <Typography variant={"body1"} sx={{ ml: 2 }}>
          Response samples:
        </Typography>
      );
    default:
      return (
        <Typography variant={"body1"} sx={{ ml: 2 }}>
          Samples:
        </Typography>
      );
  }
}

function hasExamples(responses, requestBody, type) {
  if (
    type === "request" &&
    (requestBody == null ||
      requestBody.examples == null ||
      Object.values(requestBody.examples).every(
        (requestData) =>
          requestData.examples == null || requestData.examples.length < 1
      ))
  ) {
    return false;
  }
  if (
    type === "response" &&
    (responses == null ||
      Object.values(responses).every(
        (responseData) =>
          responseData.examples == null || responseData.examples.length < 1
      ))
  ) {
    return false;
  }

  return true;
}

function getExamplesList({ responses, requestBody, type }: Props): {
  example: any;
  name: string;
  key: string;
  parentKey: string;
  mediaType: string;
  schemaRefs?: string[];
}[] {
  if (type === "request") {
    return Object.entries(requestBody.examples).reduce(
      (acc, [requestKey, requestData]) => {
        if (requestData.examples) {
          Object.entries(requestData.examples).forEach(
            ([exampleKey, example]) => {
              acc.push({
                parentKey: requestKey,
                mediaType: requestKey,
                key: exampleKey,
                name: exampleKey,
                schemaRefs: requestData.schemaRefs,
                example,
              });
            }
          );
        }
        return acc;
      },
      []
    );
  }
  if (type === "response") {
    return Object.entries(responses).reduce(
      (acc, [responseKey, responseData]) => {
        if (responseData.examples) {
          Object.entries(responseData.examples).forEach(
            ([mediaType, mediaData]) => {
              if (mediaData.examples != null) {
                Object.entries(mediaData.examples).forEach(
                  ([exampleKey, example]) => {
                    acc.push({
                      parentKey: responseKey,
                      mediaType: mediaType,
                      key: exampleKey,
                      name: exampleKey,
                      schemaRefs: mediaData.schemaRefs,
                      example,
                    });
                  }
                );
              }
            }
          );
        }
        return acc;
      },
      []
    );
  }

  return [];
}

export const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  "&.MuiToggleButton-root": {
    color: theme.palette.grey[400],
    borderColor: theme.palette.grey[400],
  },
  "&:hover": {
    color: theme.palette.grey[400],
    backgroundColor: theme.palette.secondary.dark,
    borderColor: "transparent",
  },
  "&.Mui-selected": {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.secondary.main,
    borderColor: "transparent",
  },
  "&.Mui-selected:hover": {
    color: theme.palette.grey[400],
    backgroundColor: theme.palette.secondary.dark,
    borderColor: "transparent",
  },
}));

export default function ExamplesItem({ responses, requestBody, type }: Props) {
  if (!hasExamples(responses, requestBody, type)) {
    return null;
  }
  const examples = getExamplesList({ responses, requestBody, type });
  const uniqueParentKeys = Array.from(
    new Set(examples.map(({ parentKey }) => parentKey))
  );
  const mediaTypes = uniqueParentKeys.reduce((acc, parentKey) => {
    acc[parentKey] = Array.from(
      new Set(
        examples
          .filter(({ parentKey: elParentKey }) => elParentKey === parentKey)
          .map(({ mediaType }) => mediaType)
      )
    );
    return acc;
  }, {});

  const [selectedParent, setSelectedParent] = useState(uniqueParentKeys[0]);
  const [selectedMedia, setSelectedMedia] = useState(
    mediaTypes[uniqueParentKeys[0]][0]
  );
  const { openApi } = useContext(OpenAPIContext);

  const handleParentChange = (
    event: React.MouseEvent<HTMLElement>,
    newParent: string | null
  ) => {
    if (newParent !== null) {
      setSelectedParent(newParent);
    }
  };
  const handleMediaChange = (event: SelectChangeEvent) => {
    setSelectedMedia(event.target.value);
  };

  return (
    <Grid container spacing={2} sx={{ mt: 1, ml: 0, pr: 2 }}>
      {getTitle(type)}
      {type !== "request" && (
        <Grid item xs={12}>
          {uniqueParentKeys.map((parentKey) => (
            <StyledToggleButton
              key={parentKey}
              sx={{ mr: 1, pl: 2, pr: 2, pt: 0, pb: 0 }}
              style={{ fontWeight: selectedParent === parentKey ? 700 : 400 }}
              color={"secondary"}
              selected={selectedParent === parentKey}
              value={parentKey}
              onChange={handleParentChange}
            >
              {parentKey}
            </StyledToggleButton>
          ))}
        </Grid>
      )}
      <Grid
        item
        xs={12}
        sx={{ mt: 1, backgroundColor: (theme) => theme.palette.grey[900] }}
      >
        {mediaTypes[selectedParent] && (
          <FormControl
            variant="standard"
            sx={{ m: 1, minWidth: "90%" }}
            color={"secondary"}
          >
            <InputLabel
              id="media-select-label"
              sx={{ color: (theme) => theme.palette.grey[300] }}
            >
              Content Type
            </InputLabel>
            <Select
              labelId="media-select-label"
              id="media-select"
              value={selectedMedia}
              onChange={handleMediaChange}
              label="Content Type"
              sx={{ color: (theme) => theme.palette.grey[300] }}
            >
              {mediaTypes[selectedParent].map((mediaType) => (
                <MenuItem
                  key={selectedParent + "-" + mediaType}
                  value={mediaType}
                >
                  {mediaType}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {examples
          .filter(
            ({ key, parentKey, mediaType }) =>
              mediaType === selectedMedia && parentKey === selectedParent
          )
          .map(({ example, schemaRefs }) => {
            return (
              <Grid item xs={12}>
                {isBrowser() && (
                  <ReactJson
                    theme={"monokai"}
                    src={example.value}
                    collapsed={1}
                    name={false}
                    collapseStringsAfterLength={10}
                  />
                )}
                {schemaRefs != null &&
                  schemaRefs.map((schemaRef) => {
                    const schemaLinkObj = openApi.generateSchemaLink(schemaRef);

                    return (
                      <Typography variant={"body2"} sx={{ p: 1, mt: 2 }}>
                        <span>Detailed definition available in </span>
                        <Link
                          href={schemaLinkObj.href}
                          underline={"hover"}
                          aria-label={"Link to Schema definition"}
                        >
                          {`${schemaLinkObj.name} schema`}
                        </Link>
                      </Typography>
                    );
                  })}
              </Grid>
            );
          })}
      </Grid>
    </Grid>
  );
}
