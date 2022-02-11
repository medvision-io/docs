import * as React from "react";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { OpenAPIV3_1 } from "openapi-types";
import { useContext, useEffect, useState } from "react";
import { Timeline } from "./KeyItem";
import { OpenAPIContext } from "../../../Layout/OpenAPIContext";

import "./globalStyles.css";
import { PropertiesItem } from "./PropertiesItem";
import { AdditionalPropertiesItem } from "./AdditionalPropertiesItem";
import { SchemaModel } from "../../../../services/models/SchemaModel";

interface Props {
  schema:
    | OpenAPIV3_1.SchemaObject
    | {
        $ref: string;
      }
    | SchemaModel
    | any;
  oneOf?: SchemaModel[];
  allOf?: SchemaModel[];
  onSelectedSchemaChange?: (schemaName: string) => void;
}

export default function SchemaItem({
  schema,
  oneOf,
  allOf,
  onSelectedSchemaChange,
}: Props) {
  if (schema == null) {
    return null;
  }
  const { openApi } = useContext(OpenAPIContext);
  const [selectedItems, setSelectedItem] = useState<string[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<SchemaModel | null>(
    oneOf != null ? oneOf[0] : null
  );

  let selectedSchemaObj = null;

  if (oneOf != null) {
    selectedSchemaObj = selectedSchema?.$ref
      ? openApi.deref(selectedSchema)
      : selectedSchema;
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
      if(onSelectedSchemaChange && schemaRef.pointer != null) {
        onSelectedSchemaChange(schemaRef.pointer);
      }
    }
  };

  let properties = selectedSchemaObj.fields || [];

  return (
    <Paper elevation={1} sx={{ pt: 1, width: "100%" }}>
      {oneOf != null && (
        <React.Fragment>
          <Typography variant={"caption"} sx={{ pl: 1, pr: 1 }}>
            {schema.oneOfType}
          </Typography>
          <ToggleButtonGroup
            value={selectedSchema}
            size={"small"}
            exclusive
            onChange={selectSchema}
            aria-label="scheme selector"
          >
            {oneOf.map((schemaRefObj) => {
              const nameDecoded = schemaRefObj.title;
              return (
                <ToggleButton
                  style={{ textTransform: "none" }}
                  key={nameDecoded}
                  value={schemaRefObj}
                  aria-label={nameDecoded}
                >
                  {nameDecoded}
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
          <br />
        </React.Fragment>
      )}
      {selectedSchemaObj.type === "array" && (
        <Typography variant={"caption"} sx={{ pl: 1 }}>
          Array [
        </Typography>
      )}
      <Timeline>
        {selectedSchemaObj.additionalProperties != null && (
          <AdditionalPropertiesItem
            item={selectedSchemaObj.additionalProperties}
            onItemClick={handleToggleItems}
            requiredItems={selectedSchemaObj.required}
            selectedItems={selectedItems}
          />
        )}
        {properties.map((item) => (
          <PropertiesItem
            key={item.name}
            itemKey={item.name}
            field={item}
            onItemClick={handleToggleItems}
            requiredItems={selectedSchemaObj.required}
            selectedItems={selectedItems}
          />
        ))}
        {selectedSchemaObj.type === "array" && selectedSchemaObj.items != null && (
          <PropertiesItem
            itemKey={selectedSchemaObj.items.title}
            field={{
              ...selectedSchemaObj.items,
              schema: selectedSchemaObj.items,
            }}
            onItemClick={handleToggleItems}
            requiredItems={selectedSchemaObj.required}
            selectedItems={selectedItems}
          />
        )}
      </Timeline>
      {selectedSchemaObj.type === "array" && (
        <Typography variant={"caption"} sx={{ pl: 1 }}>
          ]
        </Typography>
      )}
    </Paper>
  );
}
