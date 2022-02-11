import Grid from "@mui/material/Grid";
import { KeyItem } from "./KeyItem";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import * as React from "react";
import { PropertyItem } from "./PropertiesItem";
import { SchemaModel } from "../../../../services/models/SchemaModel";

interface Props {
  itemKey: string;
  field: SchemaModel;
  onItemClick?: (key: string) => void;
}

export const PrimitiveSchemaItem = ({ itemKey, field, onItemClick }: Props) => {
  const item = field.schema;

  const isSelectable = item.type === "object";

  const isRequired = field.required === true;

  const isDeprecated = field.deprecated;

  return (
    <Paper elevation={1} sx={{ pt: 1, pl: 1, width: "100%" }}>
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <KeyItem
            itemKey={itemKey}
            name={itemKey}
            deprecated={isDeprecated}
            onClick={isSelectable ? onItemClick : undefined}
          />
          {isRequired && <Typography color={"error"}>required</Typography>}
          {isDeprecated && <Typography color={"error"}>deprecated</Typography>}
        </Grid>
        <Grid item xs={8}>
          <PropertyItem item={field} hideDescription/>
          <Divider sx={{ mt: 2 }} />
        </Grid>
      </Grid>
    </Paper>
  );
};
