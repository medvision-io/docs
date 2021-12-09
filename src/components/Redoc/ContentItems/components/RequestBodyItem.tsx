import * as React from "react";
import Link from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { SecurityScheme } from "../../../../types/OpenAPISpec";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ShortcutIcon from "@mui/icons-material/Shortcut";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RuleIcon from "@mui/icons-material/Rule";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { OpenAPIV3_1 } from "openapi-types";
import { ReactElement, useContext, useState } from "react";
import Divider from "@mui/material/Divider";
import SchemaItem from "./SchemaItem";
import { OpenAPIContext } from "../../../Layout/OpenAPIContext";

interface Props {
  requestBody: OpenAPIV3_1.RequestBodyObject;
}

export default function RequestBodyItem({ requestBody }: Props) {
  if (requestBody == null) {
    return null;
  }
  const { openApi } = useContext(OpenAPIContext);
  if (requestBody.$ref) {
    requestBody = openApi.deref(requestBody);
  }
  const [selectedContent, setSelectedContent] = useState(
    Object.keys(requestBody?.content || {})[0]
  );
  const handleChange = (event: SelectChangeEvent) => {
    setSelectedContent(event.target.value as string);
  };

  const schemaObj =
    (requestBody &&
      requestBody.content &&
      requestBody.content[selectedContent] &&
      requestBody.content[selectedContent].schema) ||
    {};

  const isOneOf = schemaObj.oneOf != null;
  const isAllOf = schemaObj.allOf != null;
  const hasRef = schemaObj.$ref != null;
  const isSchema = !isOneOf && !isAllOf && !hasRef;
  return (
    <Grid container spacing={2}>
      <Grid
        item
        xs={12}
        sx={{
          alignItems: "center",
          display: "flex",
          borderBottom: "1px solid grey",
        }}
      >
        <Grid item xs={5}>
          <Typography>Request Body Schema:</Typography>
        </Grid>
        <Grid item xs={7}>
          <FormControl variant="standard">
            <Select
              id="demo-simple-select"
              value={selectedContent}
              label="Age"
              onChange={handleChange}
            >
              {Object.keys(requestBody?.content || {}).map((contentKey) => (
                <MenuItem key={`contenttype-${contentKey}`} value={contentKey}>
                  {contentKey}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography>{requestBody.description}</Typography>
      </Grid>
      <Grid item xs={12}>
        {isOneOf && (
          <SchemaItem schema={schemaObj.oneOf[0]} oneOf={schemaObj.oneOf} />
        )}
        {isAllOf && (
          <SchemaItem schema={schemaObj.allOf[0]} allOf={schemaObj.allOf} />
        )}
        {(hasRef || schemaObj.properties != null) && (
          <SchemaItem schema={schemaObj} />
        )}
      </Grid>
    </Grid>
  );
}
