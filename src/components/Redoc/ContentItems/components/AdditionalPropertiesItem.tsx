import Grid from "@mui/material/Grid";
import { KeyItem } from "./KeyItem";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import * as React from "react";
import SchemaItem from "./SchemaItem";
import {PropertyItem} from "./PropertiesItem";

export const AdditionalPropertiesItem = ({
  item,
  selectedItems,
  requiredItems,
  onItemClick,
}) => {
  const itemKey = item["x-additionalPropertiesName"] || "additional-property";
  const isOneOf = item.oneOf != null;
  const isAllOf = item.allOf != null;
  const hasRef = item.$ref != null;
  const harArrayRef = item.type === "array" && item.items.$ref != null;

  const isSelectable =
    isOneOf || hasRef || isAllOf || item.properties != null || item.additionalProperties != null || harArrayRef;

  const isRequired =
    (Array.isArray(requiredItems) && requiredItems.includes(itemKey)) ||
    item.required === true;

  return (
    <li key={itemKey}>
      <Typography variant={"caption"} sx={{ pl: 1 }}>
        {"Dictionary {"}
      </Typography>
      <Grid container>
        <Grid item xs={4}>
          <KeyItem
            itemKey={itemKey}
            name={itemKey}
            selected={selectedItems.includes(itemKey)}
            onClick={isSelectable ? onItemClick : undefined}
          />
          {isRequired && <Typography color={"error"}>required</Typography>}
        </Grid>
        <Grid item xs={8}>
          <PropertyItem item={item} />

          <Divider sx={{ mt: 2 }} />
        </Grid>
        {isSelectable && selectedItems.includes(itemKey) && (
          <Grid item xs={12}>
            {isOneOf && (
              <SchemaItem schema={item.oneOf[0]} oneOf={item.oneOf} />
            )}
            {isAllOf && (
              <SchemaItem schema={item.allOf[0]} allOf={item.allOf} />
            )}
            {(hasRef || item.properties != null || item.additionalProperties != null) && (
              <SchemaItem schema={item} />
            )}
            {harArrayRef && (
              <SchemaItem
                schema={{
                  ...item,
                  ...item.items,
                }}
              />
            )}
          </Grid>
        )}
      </Grid>
      <Typography variant={"caption"} sx={{ pl: 1 }}>
        {"}"}
      </Typography>
    </li>
  );
};
