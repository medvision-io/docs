import * as React from "react";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { OpenAPIV3_1 } from "openapi-types";
import { useContext, useState } from "react";
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
  oneOf?: (OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject)[];
  allOf?: (OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject)[];
}

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

  let properties = selectedSchemaObj.fields || [];

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
