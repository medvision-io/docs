declare module '@mui/material/styles' {
  interface CustomTheme {
    schema?: {
      linesColor?: string,
      defaultDetailsWidth?: string,
      typeNameColor?: string,
      typeTitleColor?: string,
      requireLabelColor?: string,
      labelsTextSize?: string,
      nestingSpacing?: string,
      nestedBackground?: string,
      arrow?: {
        size?: string,
        color?: string,
      },
    };
    code?: {
      fontSize?: string,
      fontFamily?: string,
      lineHeight?: string,
      fontWeight?: string,
      color?: string,
      backgroundColor?: string,
      wrap?: boolean,
    },
    links?: {
      color?: string,
      visited?: string,
      hover?: string,
    },
    codeBlock?: {
      backgroundColor?: string,
    },
    colors?: {
      http: Record<string, string>},
    }
  }

  interface Theme extends CustomTheme {}
  interface ThemeOptions extends CustomTheme {}
}