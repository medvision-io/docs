import * as React from "react";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { SecurityScheme } from "../../../../types/OpenAPISpec";
import { OpenAPIV3_1 } from "openapi-types";
import { Timeline } from "./CodeTimeline";
import { PropertyItem } from "./SchemaItem";

interface Props {
  pathParameters: OpenAPIV3_1.ParameterObject[];
}

enum PARAM_PLACES {
  path = "path",
  query = "query",
  cookie = "cookie",
  header = "header",
}

export default function PathParametersItem({ pathParameters = [] }: Props) {
  if (pathParameters.length === 0) {
    return null;
  }

  const pathParameterGroups = pathParameters.reduce(
    (acc, pathParameter) => {
      acc[pathParameter.in].push(pathParameter);

      return acc;
    },
    {
      [PARAM_PLACES.path]: [],
      [PARAM_PLACES.query]: [],
      [PARAM_PLACES.cookie]: [],
      [PARAM_PLACES.header]: [],
    }
  );

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {Object.entries(pathParameterGroups)
        .filter(
          ([groupName, pathParameterGroup]) => pathParameterGroup.length > 0
        )
        .map(([groupName, pathParameterGroups]) => (
          <React.Fragment key={groupName}>
            <Grid item xs={12}>
              {groupName === PARAM_PLACES.path && (
                <Typography>Path Parameters:</Typography>
              )}
              {groupName === PARAM_PLACES.query && (
                <Typography>Query Parameters:</Typography>
              )}
              {groupName === PARAM_PLACES.cookie && (
                <Typography>Cookie Parameters:</Typography>
              )}
              {groupName === PARAM_PLACES.header && (
                <Typography>Header Parameters:</Typography>
              )}
              <Divider />
            </Grid>
            <Timeline>
              {pathParameterGroups.map((pathParameterGroup) => (
                <li key={pathParameterGroup.key + pathParameterGroup.name}>
                  <Grid container xs={12} sx={{ pl: 2 }}>
                    <Grid item xs={5}>
                      <Typography>
                        <Typography
                          style={{
                            textDecorationLine: pathParameterGroup.deprecated
                              ? "line-through"
                              : "auto",
                          }}
                        >
                          {pathParameterGroup.name}
                        </Typography>
                        {pathParameterGroup.required &&
                          !pathParameterGroup.deprecated && (
                            <Typography color={"error"}>required</Typography>
                          )}
                        {pathParameterGroup.deprecated && (
                          <Typography color={"error"}>deprecated</Typography>
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <PropertyItem
                        item={pathParameterGroup.schema}
                        isSelectable={false}
                      />
                      {pathParameterGroup.example && (
                        <Typography variant={"caption"}>
                          Example: <code>{pathParameterGroup.example}</code>
                        </Typography>
                      )}
                      <Typography>{pathParameterGroup.description}</Typography>
                      <Divider />
                    </Grid>
                  </Grid>
                </li>
              ))}
            </Timeline>
          </React.Fragment>
        ))}
    </Grid>
  );
}
