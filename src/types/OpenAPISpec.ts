import { OpenAPIV3_1 } from "openapi-types";
import SecuritySchemeObject = OpenAPIV3_1.SecuritySchemeObject;

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