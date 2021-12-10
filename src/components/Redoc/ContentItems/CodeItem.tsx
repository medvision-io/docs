import { useState } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { StyledToggleButton } from "./components/ExamplesItem";
import { StyledPre } from "../../common/PrismDiv";
import { highlight } from "../../../utils";

interface Props {
  codeSamples: {
    lang: string;
    source: string;
  }[];
}

export default function CodeItem({ codeSamples }: Props) {
  if (codeSamples == null || codeSamples.length < 1) {
    return null;
  }
  const [selectedKey, setSelectedKey] = useState(codeSamples[0].lang);

  const handleLangChange = (
    event: React.MouseEvent<HTMLElement>,
    newParent: string | null
  ) => {
    if (newParent !== null) {
      setSelectedKey(newParent);
    }
  };
  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Typography variant={"body1"} sx={{ ml: 2 }}>
        Code samples:
      </Typography>
      <Grid item xs={12}>
        {codeSamples.map(({ lang }) => (
          <StyledToggleButton
            key={lang}
            color={"secondary"}
            sx={{ mr: 1, pl: 2, pr: 2, pt: 0, pb: 0 }}
            size="small"
            selected={selectedKey === lang}
            value={lang}
            style={{ fontWeight: (selectedKey === lang ? 700 : 400) }}
            onChange={handleLangChange}
          >
            {lang}
          </StyledToggleButton>
        ))}
      </Grid>
      <Grid
        item
        xs={12}
        sx={{ mt: 1, backgroundColor: (theme) => theme.palette.grey[900] }}
      >
        {codeSamples
          .filter(({ lang }) => lang === selectedKey)
          .map(({ lang, source }) => {
            return (
              <Grid item xs={12}>
                <StyledPre
                  dangerouslySetInnerHTML={{ __html: highlight(source, lang) }}
                />
              </Grid>
            );
          })}
      </Grid>
    </Grid>
  );
}
