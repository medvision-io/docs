import { styled } from "@mui/material/styles";

const H1 = styled("h1")(({ theme }) => ({
  ...theme.typography.h1,
  margin: theme.spacing(2),
}));

const H2 = styled("h2")(({ theme }) => ({
  ...theme.typography.h2,
  margin: theme.spacing(2),
}));

const H3 = styled("h3")(({ theme }) => ({
  ...theme.typography.h3,
  margin: theme.spacing(2),
}));

const H4 = styled("h4")(({ theme }) => ({
  ...theme.typography.h4,
  margin: theme.spacing(2),
}));

const H5 = styled("h5")(({ theme }) => ({
  ...theme.typography.h5,
  margin: theme.spacing(2),
}));

const H6 = styled("h6")(({ theme }) => ({
  ...theme.typography.h6,
  margin: theme.spacing(1),
}));

export { H1, H2, H3, H4, H5, H6 };
