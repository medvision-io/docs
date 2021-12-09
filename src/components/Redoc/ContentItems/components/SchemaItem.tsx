import * as React from "react";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { SecurityScheme } from "../../../../types/OpenAPISpec";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ShortcutIcon from "@mui/icons-material/Shortcut";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RuleIcon from "@mui/icons-material/Rule";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { OpenAPIV3_1 } from "openapi-types";
import { ReactElement, useContext, useState } from "react";
import { KeyItem, Timeline } from "./CodeTimeline";
import Divider from "@mui/material/Divider";
import {
  humanizeConstraints,
  serializeParameterValue,
} from "../../../../services/helpers/openapi";
import { OpenAPIContext } from "../../../Layout/OpenAPIContext";

import "./globalStyles.css";

interface Props {
  schema:
    | OpenAPIV3_1.SchemaObject
    | {
        $ref: string;
      }
    | null;
  oneOf?: (OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject)[];
  allOf?: (OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject)[];
}

function getPropertyName(item, isSelectable: boolean): ReactElement {
  const nameDecoded = item?.items?.$ref?.split("/");
  return (
    <React.Fragment>
      {item.type ? item.type : isSelectable ? "object" : ""}
      {item.type === "array"
        ? ` [${
            item.items.$ref
              ? nameDecoded[nameDecoded.length - 1]
              : item.items.type
          }${item.items.format ? `<${item.items.format}>` : ""}]`
        : ""}
      {item.format && `<${item.format}>`}
    </React.Fragment>
  );
}

export const PropertyItem = ({
  item,
  isSelectable,
}: {
  item: any;
  isSelectable?: boolean;
}) => {
  return (
    <React.Fragment>
      <Typography sx={{ mr: 1 }}>
        <Typography variant={"caption"} sx={{ mr: 1 }}>
          {getPropertyName(item, isSelectable)}
        </Typography>
        <code style={{ marginRight: "12px" }}>{humanizeConstraints(item)}</code>
        {item.pattern && <code className="regex">{item.pattern}</code>}
      </Typography>
      {item.example && (
        <Typography variant="caption" component={"p"}>
          Example: <code>{item.example}</code>
        </Typography>
      )}
      {item.enum && (
        <Typography variant="caption" component={"p"}>
          Enum:{" "}
          {item.enum.map((enumItem) => (
            <code style={{ marginRight: "12px" }}>{enumItem}</code>
          ))}
        </Typography>
      )}
      {item.default && (
        <Typography variant="caption" component={"p"}>
          Default: <code>{item.default}</code>
        </Typography>
      )}
      <Typography>{item.description}</Typography>
    </React.Fragment>
  );
};

export default function SchemaItem({ schema, oneOf, allOf }: Props) {
  if (schema == null) {
    return null;
  }
  const { openApi } = useContext(OpenAPIContext);
  const [selectedItems, setSelectedItem] = useState<string[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<string | null>(
    oneOf != null ? oneOf[0].$ref : null
  );

  let selectedSchemaObj = null;

  if (oneOf != null) {
    selectedSchemaObj = openApi.deref({ $ref: selectedSchema });
  } else if (allOf != null) {
    selectedSchemaObj = allOf.reduce((acc, schemaPart) => {
      try {
        return {
          ...acc,
          ...openApi.deref(schemaPart),
        };
      } catch (e) {
        console.error(e);
        return acc;
      }
    }, {});
  } else {
    selectedSchemaObj = schema?.$ref ? openApi.deref(schema) : schema;
  }

  const handleToggleItems = (itemKey: string) => {
    if (selectedItems.includes(itemKey)) {
      setSelectedItem(selectedItems.filter((el) => el !== itemKey));
    } else {
      setSelectedItem([...selectedItems, itemKey]);
    }
  };

  const selectSchema = (
    event: React.MouseEvent<HTMLElement>,
    schemaRef: string | null
  ) => {
    if (schemaRef !== null) {
      setSelectedSchema(schemaRef);
    }
  };

  let properties =
    selectedSchemaObj.type === "array"
      ? selectedSchemaObj.items
      : selectedSchemaObj.properties;

  if (properties?.$ref !== null) {
    const ref = openApi.deref(properties);
    properties = {
      ...properties,
      ...(ref?.properties || ref?.items),
    };
    delete properties.$ref;
  }

  return (
    <Paper elevation={1} sx={{ pt: 1 }}>
      {selectedSchemaObj.type === "array" && (
        <Typography variant={"caption"} sx={{ pl: 1 }}>
          Array [
        </Typography>
      )}
      {oneOf != null && (
        <ToggleButtonGroup
          value={selectedSchema}
          size={"small"}
          exclusive
          onChange={selectSchema}
          aria-label="scheme selector"
        >
          {oneOf.map((schemaRefObj) => {
            const nameDecoded = schemaRefObj.$ref.split("/");
            return (
              <ToggleButton
                value={schemaRefObj.$ref}
                aria-label={nameDecoded[nameDecoded.length - 1]}
              >
                {nameDecoded[nameDecoded.length - 1]}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
      )}
      <Timeline>
        {Object.entries(properties)
          .filter(([key]) => key !== "id")
          .map(([key, item]) => {
            const isOneOf = item.oneOf != null;
            const isAllOf = item.allOf != null;
            const hasRef = item.$ref != null;
            const harArrayRef =
              item.type === "array" && item.items.$ref != null;

            const isSelectable =
              isOneOf ||
              hasRef ||
              isAllOf ||
              item.properties != null ||
              harArrayRef;
            return (
              <li key={key}>
                <Grid container xs={12}>
                  <Grid item xs={4}>
                    <KeyItem
                      itemKey={key}
                      name={key}
                      selected={selectedItems.includes(key)}
                      onClick={isSelectable ? handleToggleItems : undefined}
                    />
                    {Array.isArray(selectedSchemaObj.required) &&
                      selectedSchemaObj.required.includes(key) && (
                        <Typography color={"error"}>required</Typography>
                      )}
                  </Grid>
                  <Grid item xs={8}>
                    <PropertyItem item={item} isSelectable={isSelectable} />

                    <Divider sx={{ mt: 2 }} />
                  </Grid>
                  {isSelectable && selectedItems.includes(key) && (
                    <Grid item xs={12}>
                      {isOneOf && (
                        <SchemaItem schema={item.oneOf[0]} oneOf={item.oneOf} />
                      )}
                      {isAllOf && (
                        <SchemaItem schema={item.allOf[0]} allOf={item.allOf} />
                      )}
                      {(hasRef || item.properties != null) && (
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
              </li>
            );
          })}
      </Timeline>
      {selectedSchemaObj.type === "array" && (
        <Typography variant={"caption"} sx={{ pl: 1 }}>
          ]
        </Typography>
      )}
    </Paper>
  );
}
