import { OpenAPIV3_1 } from "openapi-types";
import SecuritySchemeObject = OpenAPIV3_1.SecuritySchemeObject;
import {Referenced} from "../services/OpenAPI";

export type OpenAPISpec = OpenAPIV3_1.Document & {
  tags?: OpenAPIV3_1.TagObject & {
    'x-displayName'?: string;
  }[]
  'x-webhooks'?: OpenAPIV3_1.PathsObject;
  'x-tagGroups'?: {
    name: string;
    section: string;
    slug: string;
    tags: string[];
  }[]
}

export type OpenAPIParameterLocation = 'query' | 'header' | 'path' | 'cookie';

export type OpenAPIParameterStyle =
  | 'matrix'
  | 'label'
  | 'form'
  | 'simple'
  | 'spaceDelimited'
  | 'pipeDelimited'
  | 'deepObject';

export interface OpenAPIParameter {
  name: string;
  in?: OpenAPIParameterLocation;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: OpenAPIParameterStyle;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: Referenced<OpenAPIV3_1.SchemaObject>;
  example?: any;
  examples?: { [media: string]: Referenced<OpenAPIV3_1.ExampleObject> };
  content?: { [media: string]: OpenAPIV3_1.MediaTypeObject };
  encoding?: Record<string, OpenAPIV3_1.EncodingObject>;
  const?: any;
}

export interface OpenAPIXCodeSample {
  lang: string;
  label?: string;
  source: string;
}

export type SecurityScheme = SecuritySchemeObject & {
  id: string;
  sectionId: string;
  scopes: string[];
}