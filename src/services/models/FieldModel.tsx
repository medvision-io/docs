import { extractExtensions } from '../../utils';
import { SchemaModel } from './SchemaModel';
import { ExampleModel } from './ExampleModel';
import { mapValues } from '../../utils/helpers';
import {OpenAPIV3_1} from "openapi-types";
import {OpenAPIParameter, OpenAPIParameterLocation, OpenAPIParameterStyle} from "../../types/OpenAPISpec";
import {OpenAPI, Referenced} from "../OpenAPI";

const DEFAULT_SERIALIZATION: Record<
  OpenAPIParameterLocation,
  { explode: boolean; style: OpenAPIParameterStyle }
  > = {
  path: {
    style: 'simple',
    explode: false,
  },
  query: {
    style: 'form',
    explode: true,
  },
  header: {
    style: 'simple',
    explode: false,
  },
  cookie: {
    style: 'form',
    explode: true,
  },
};

/**
 * Field or Parameter model ready to be used by components
 */
export class FieldModel {
  expanded: boolean | undefined = false;

  schema: SchemaModel;
  name: string;
  required: boolean;
  description: string;
  example?: string;
  examples?: Record<string, ExampleModel>;
  deprecated: boolean;
  in?: OpenAPIV3_1.ParameterObject['in'];
  kind: string;
  extensions?: Record<string, any>;
  explode: boolean;
  style?: OpenAPIV3_1.ParameterObject['style'];
  const?: any;

  serializationMime?: string;

  constructor(
    parser: OpenAPI,
    infoOrRef: Referenced<OpenAPIParameter> & { name?: string; kind?: string },
    pointer: string,
    options: any,
  ) {
    const info = parser.deref<OpenAPIParameter>(infoOrRef);
    this.kind = infoOrRef.kind || 'field';
    this.name = infoOrRef.name || info.name;
    this.in = info.in;
    this.required = !!info.required;

    let fieldSchema = info.schema;
    let serializationMime = '';
    if (!fieldSchema && info.in && info.content) {
      serializationMime = Object.keys(info.content)[0];
      fieldSchema = info.content[serializationMime] && info.content[serializationMime].schema;
    }

    this.schema = new SchemaModel(parser, fieldSchema || {}, pointer, options);
    this.description =
      info.description === undefined ? this.schema.description || '' : info.description;
    this.example = info.example || this.schema.example;

    if (info.examples !== undefined) {
      this.examples = mapValues(
        info.examples,
        (example, name) => new ExampleModel(parser, example, name, info.encoding),
      );
    }

    if (serializationMime) {
      this.serializationMime = serializationMime;
    } else if (info.style) {
      this.style = info.style;
    } else if (this.in) {
      this.style = DEFAULT_SERIALIZATION[this.in]?.style ?? 'form'; // fallback to from in case "in" is invalid
    }

    if (info.explode === undefined && this.in) {
      this.explode = DEFAULT_SERIALIZATION[this.in]?.explode ?? true;
    } else {
      this.explode = !!info.explode;
    }

    this.deprecated = info.deprecated === undefined ? !!this.schema.deprecated : info.deprecated;
    parser.exitRef(infoOrRef);

    if (options.showExtensions) {
      this.extensions = extractExtensions(info, options.showExtensions);
    }

    this.const = this.schema?.const || info?.const || '';
  }

  toggle() {
    this.expanded = !this.expanded;
  }
}
