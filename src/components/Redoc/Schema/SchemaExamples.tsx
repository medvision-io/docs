import * as React from "react";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useState } from "react";
import ReactJson from "react-json-view";
import { isBrowser } from "../Markdown/SanitizedMdBlock";
import { StyledToggleButton } from "../ContentItems/components/ExamplesItem";
import { StyledPre } from "../../common/PrismDiv";
import { highlight } from "../../../utils";
import { MediaTypeModel } from "../../../services/models/MediaTypeModel";

interface Props {
  examples: Record<string, MediaTypeModel>;
}

export default function SchemaExamples({ examples }: Props) {
  if (examples == null || Object.keys(examples).length === 0) {
    return null;
  }
  const exampleNames = Object.keys(examples);
  const [selectedExample, setSelectedExample] = useState(exampleNames[0]);
  const selectedExampleDataOptions = Object.entries(
    examples[selectedExample].examples
  );
  const [selectedExampleOption, setSelectedExampleOption] = useState(
    selectedExampleDataOptions[0][0]
  );

  const handleExampleChange = (
    event: React.MouseEvent<HTMLElement>,
    newParent: string | null
  ) => {
    if (newParent !== null) {
      setSelectedExample(newParent);
    }
  };

  const handleExampleOptionChange = (event: SelectChangeEvent) => {
    setSelectedExampleOption(event.target.value);
  };

  return (
    <React.Fragment>
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
        {selectedExampleDataOptions.length > 0 && (
          <Grid item xs={12}>
            <FormControl
              variant="standard"
              sx={{ m: 1, minWidth: "90%" }}
              color={"secondary"}
            >
              <InputLabel
                id="media-select-label"
                sx={{ color: (theme) => theme.palette.grey[300] }}
              >
                Content Type
              </InputLabel>
              <Select
                labelId="media-select-label"
                id="media-select"
                value={selectedExampleOption}
                onChange={handleExampleOptionChange}
                label="Content Type"
                sx={{ color: (theme) => theme.palette.grey[300] }}
              >
                {selectedExampleDataOptions.map(([optionName, optionObj]) => (
                  <MenuItem key={optionName} value={optionName}>
                    {optionName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
      <Grid
        item
        xs={12}
        sx={{ mt: 1, backgroundColor: (theme) => theme.palette.grey[900] }}
      >
        <Grid item xs={12}>
          {examples[selectedExample] != null &&
            isBrowser() &&
            (typeof examples[selectedExample].examples[selectedExampleOption]?.value ===
            "object" ? (
              <ReactJson
                theme={"monokai"}
                src={examples[selectedExample].examples[selectedExampleOption]?.value}
                collapsed={1}
                name={false}
                collapseStringsAfterLength={10}
              />
            ) : (
              <StyledPre
                style={{ padding: "24px 8px", fontSize: "16px" }}
                dangerouslySetInnerHTML={{
                  __html: highlight(
                    examples[selectedExample].examples[selectedExampleOption]?.value || "",
                    "python"
                  ),
                }}
              />
            ))}
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
