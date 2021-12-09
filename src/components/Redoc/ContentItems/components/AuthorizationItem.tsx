import * as React from "react";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { SecurityScheme } from "../../../../types/OpenAPISpec";

interface Props {
  security: SecurityScheme[];
}

export default function AuthorizationItem({ security = [] }: Props) {
  if (security.length === 0) {
    return null;
  }
  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {security.map((securityGroup) => (
        <React.Fragment>
          <Grid item xs={4}>
            <Typography>Authorizations:</Typography>
          </Grid>
          <Grid item xs={8}>
            {Object.entries(securityGroup).map(
              ([securityPath, securityItems]) => (
                <Typography>
                  <Link sx={{ mr: 1 }} href={`#${securityPath}`}>
                    {securityPath}
                  </Link>
                  {securityItems && securityItems.length > 0 && (
                    <React.Fragment>
                      (
                      {securityItems.map((secItem, idx) => (
                        <React.Fragment>
                          {idx !== 0 ? ", " : ""}
                          <code>{secItem}</code>
                        </React.Fragment>
                      ))}
                      )
                    </React.Fragment>
                  )}
                </Typography>
              )
            )}
          </Grid>
        </React.Fragment>
      ))}
    </Grid>
  );
}
