import * as React from "react";
import { OpenAPI } from "../../../services/OpenAPI";
import SectionItem from "../ContentItems/SectionItem";
import SchemaItem from "../ContentItems/components/SchemaItem";
import { SchemaModel } from "../../../services/models/SchemaModel";
import { MediaTypeModel } from "../../../services/models/MediaTypeModel";
import { OpenAPIV3_1 } from "openapi-types";
import { MiddlePanel, RightPanel } from "../../common/Panels";
import Grid from "@mui/material/Grid";
import { isBrowser } from "../Markdown/SanitizedMdBlock";
import ReactJson from "react-json-view";
import { useState } from "react";
import { StyledToggleButton } from "../ContentItems/components/ExamplesItem";
import { OperationRow } from "../ContentItems/OperationItem";

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
      } as any as OpenAPIV3_1.MediaTypeObject,
      {
        onlyRequiredInSamples: true,
        generatedPayloadSamplesMaxDepth: 12,
      }
    ),
  };
  const exampleNames = Object.keys(examples);
  const [selectedExample, setSelectedExample] = useState(exampleNames[0]);

  const handleExampleChange = (
    event: React.MouseEvent<HTMLElement>,
    newParent: string | null
  ) => {
    if (newParent !== null) {
      setSelectedExample(newParent);
    }
  };
  return (
    <React.Fragment>
      <SectionItem item={schema} />
      <OperationRow>
        <MiddlePanel compact={undefined}>
          <SchemaItem schema={schema} />
        </MiddlePanel>
        <RightPanel>
          <Grid container spacing={2} sx={{ mt: 1, ml: 1 }}>
            <Grid item xs={12}>
              {exampleNames.map((parentKey) => (
                <StyledToggleButton
                  key={parentKey}
                  sx={{ mr: 1, pl: 2, pr: 2, pt: 0, pb: 0 }}
                  style={{
                    fontWeight: selectedExample === parentKey ? 700 : 400,
                  }}
                  color={"secondary"}
                  selected={selectedExample === parentKey}
                  value={parentKey}
                  onChange={handleExampleChange}
                >
                  {parentKey}
                </StyledToggleButton>
              ))}
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{ mt: 1, backgroundColor: (theme) => theme.palette.grey[900] }}
          >
            <Grid item xs={12}>
              {examples[selectedExample] != null && isBrowser() && (
                <ReactJson
                  theme={"monokai"}
                  src={examples[selectedExample].examples.default.value}
                  collapsed={1}
                  name={false}
                  collapseStringsAfterLength={10}
                />
              )}
            </Grid>
          </Grid>
        </RightPanel>
      </OperationRow>
    </React.Fragment>
  );
}
