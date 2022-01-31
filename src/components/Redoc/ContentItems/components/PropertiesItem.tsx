import Grid from "@mui/material/Grid";
import { KeyItem } from "./KeyItem";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import * as React from "react";
import SchemaItem from "./SchemaItem";
import { OpenAPIV3_1 } from "openapi-types";
import { SchemaModel } from "../../../../services/models/SchemaModel";
import { FieldModel } from "../../../../services/models/FieldModel";
import { ReactElement } from "react";

interface Props {
  itemKey: string;
  field: FieldModel;
  selectedItems: string[];
  requiredItems: string[];
  onItemClick: (key: string) => void;
}

export const PropertiesItem = ({
  itemKey,
  field,
  selectedItems,
  requiredItems,
  onItemClick,
}: Props) => {
  const item = field.schema;
  const isOneOf = item.oneOf != null;
  const isAllOf = item.allOf != null;
  const hasRef = item.$ref != null;
  const hasArrayRef = item.type === "array" && item.items.$ref != null;
  const hasObjArray =
    item.type === "array" &&
    (item.items.type === "object" || item.items.type === "array");

  if (field.title === "Segment") {
    console.log(field, item.type);
  }

  const isSelectable =
    isOneOf ||
    hasRef ||
    isAllOf ||
    item.type === "object" ||
    hasArrayRef ||
    hasObjArray;

  const isRequired =
    (Array.isArray(requiredItems) && requiredItems.includes(itemKey)) ||
    (item.constraints.length > 0 && item.constraints.includes("non-empty")) ||
    field.required === true;

  return (
    <li key={itemKey}>
      <Grid container xs={12}>
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
          <PropertyItem item={item} kind={field.kind} />
          <Divider sx={{ mt: 2 }} />
        </Grid>
        {isSelectable && selectedItems.includes(itemKey) && (
          <Grid item xs={12}>
            {isOneOf &&
              item.oneOf.map((oneOfSchema) => (
                <SchemaItem schema={oneOfSchema} oneOf={item.oneOf} />
              ))}
            {isAllOf &&
              item.allOf.map((oneOfSchema) => (
                <SchemaItem schema={oneOfSchema} allOf={item.allOf} />
              ))}
            {(hasRef || item.type === "object") && <SchemaItem schema={item} />}
            {hasArrayRef && (
              <SchemaItem
                schema={{
                  ...item,
                  ...item.items,
                }}
              />
            )}
            {hasObjArray && (
              <SchemaItem
                schema={{
                  ...item,
                  items: item.items,
                }}
              />
            )}
          </Grid>
        )}
      </Grid>
    </li>
  );
};

function getPropertyName(item: SchemaModel, kind?: string): ReactElement {
  return (
    <React.Fragment>
      {item.typePrefix}
      {kind != null &&
      kind === "additionalProperties" &&
      item.displayType === "object"
        ? "dictionary"
        : item.displayType}
      {item.displayFormat && `<${item.displayFormat}>`}
    </React.Fragment>
  );
}

export const PropertyItem = ({
  item,
  kind,
}: {
  item: SchemaModel;
  kind?: string;
}) => {
  return (
    <React.Fragment>
      <Typography sx={{ mr: 1 }}>
        <Typography variant={"caption"} sx={{ mr: 1 }}>
          {getPropertyName(item, kind)}
        </Typography>
        {item.constraints.length > 0 && (
          <span className={"eqivia"} style={{ marginRight: "12px" }}>
            {item.constraints}
          </span>
        )}
        {item.pattern && <code className="regex">{item.pattern}</code>}
      </Typography>
      {item.example && (
        <Typography variant="caption" component={"p"}>
          Example:{" "}
          <span className={"eqivia"}>{JSON.stringify(item.example)}</span>
        </Typography>
      )}
      {item.enum.length > 0 && (
        <Typography variant="caption" component={"p"}>
          Enum:{" "}
          {item.enum.map((enumItem, idx) => (
            <React.Fragment>
              <span
                className={"eqivia"}
                style={{ marginLeft: idx === 0 ? 0 : "40px" }}
              >
                {enumItem}
              </span>
              <br />
            </React.Fragment>
          ))}
        </Typography>
      )}
      {item.default && (
        <Typography variant="caption" component={"p"}>
          Default: <span className={"eqivia"}>{item.default}</span>
        </Typography>
      )}
      <Typography>{item.description}</Typography>
    </React.Fragment>
  );
};
