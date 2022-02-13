import * as React from "react";
import { OpenAPI } from "../../../services/OpenAPI";
import SectionItem from "../ContentItems/SectionItem";
import SchemaItem from "../ContentItems/components/SchemaItem";
import { SchemaModel } from "../../../services/models/SchemaModel";
import { MediaTypeModel } from "../../../services/models/MediaTypeModel";
import { OpenAPIV3_1 } from "openapi-types";
import { MiddlePanel, RightPanel } from "../../common/Panels";
import { OperationRow } from "../ContentItems/OperationItem";
import { PrimitiveSchemaItem } from "../ContentItems/components/PrimitiveSchemaItem";
import SchemaExamples from "./SchemaExamples";

interface Props {
  selectedSchema: string;
  openApiStore: OpenAPI;
}

export default function Schema({ selectedSchema, openApiStore }: Props) {
  const schema = new SchemaModel(
    openApiStore,
    openApiStore.spec.components.schemas[selectedSchema],
    "",
    {}
  );

  const examples = {
    "Full json": new MediaTypeModel(
      openApiStore,
      "Full json",
      false,
      {
        schema: openApiStore.spec.components.schemas[selectedSchema],
        example: schema.example,
      } as any as OpenAPIV3_1.MediaTypeObject,
      {
        onlyRequiredInSamples: false,
        generatedPayloadSamplesMaxDepth: 12,
      }
    ),
    "Minimal json": new MediaTypeModel(
      openApiStore,
      "Minimal json",
      false,
      {
        schema: openApiStore.spec.components.schemas[selectedSchema],
        example: schema.example,
      } as any as OpenAPIV3_1.MediaTypeObject,
      {
        onlyRequiredInSamples: true,
        generatedPayloadSamplesMaxDepth: 12,
      }
    ),
  };

  return (
    <React.Fragment>
      <SectionItem item={schema} />
      <OperationRow>
        <MiddlePanel compact={undefined}>
          {schema.isPrimitive && (
            <PrimitiveSchemaItem
              key={schema.title}
              itemKey={schema.title}
              field={schema}
            />
          )}
          {!schema.isPrimitive && (
            <SchemaItem
              schema={schema}
              oneOf={
                Array.isArray(schema.oneOf) && schema.oneOf.length > 0
                  ? schema.oneOf
                  : undefined
              }
            />
          )}
        </MiddlePanel>
        <RightPanel>
          <SchemaExamples examples={examples} />
        </RightPanel>
      </OperationRow>
    </React.Fragment>
  );
}
