import * as React from "react";
import Link from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { SecurityScheme } from "../../../../types/OpenAPISpec";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ShortcutIcon from "@mui/icons-material/Shortcut";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import DangerousOutlinedIcon from "@mui/icons-material/DangerousOutlined";
import { OpenAPIV3_1 } from "openapi-types";
import { ReactElement } from "react";

interface Props {
  responses: OpenAPIV3_1.ResponsesObject;
}

function getSeverityIcon(code: number): ReactElement | false {
  if (code >= 200 && code < 300) {
    return <CheckCircleOutlineIcon fontSize={"inherit"} />;
  }
  if (code >= 300 && code < 400) {
    return <ShortcutIcon fontSize={"inherit"} />;
  }
  if (code >= 400 && code < 500) {
    return <DangerousOutlinedIcon fontSize={"inherit"} />;
  }
  if (code >= 500) {
    return <ErrorOutlineIcon fontSize={"inherit"} />;
  }
  return false;
}

function getSeverity(code: number) {
  if (code >= 200 && code < 300) {
    return "success";
  }
  if (code >= 300 && code < 400) {
    return "info";
  }
  if (code >= 400 && code < 500) {
    return "error";
  }
  if (code >= 500) {
    return "error";
  }
  return "success";
}

export default function ResponsesItem({ responses = {} }: Props) {
  if (Object.keys(responses).length < 1) {
    return null;
  }
  console.log(responses)
  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Typography variant={"body1"} sx={{ ml: 2 }}>
        Responses:
      </Typography>
      {Object.entries(responses).map(([responseVal, response]) => (
        <Grid item xs={12}>
          <Alert
            severity={getSeverity(Number(responseVal))}
            icon={getSeverityIcon(Number(responseVal))}
          >
            {responseVal} - {response.description}
          </Alert>
        </Grid>
      ))}
    </Grid>
  );
}
