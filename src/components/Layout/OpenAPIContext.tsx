import * as React from "react";
import { OpenAPI } from "../../services/OpenAPI";

export const OpenAPIContext =
  React.createContext<{ openApi: OpenAPI }>(null);

interface Props {
  openApi: OpenAPI;
}

export const OpenAPIContextProvider: React.FC<Props> = ({
  openApi,
  children,
}) => {
  return (
    <OpenAPIContext.Provider value={{ openApi: openApi }}>
      {children}
    </OpenAPIContext.Provider>
  );
};
