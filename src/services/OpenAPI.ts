import * as JsonPointer from "json-pointer";
import { OpenAPISpec, OpenAPIXCodeSample } from "../types/OpenAPISpec";
import buildMenu from "./helpers/buildMenu";
import { OpenAPIV3_1 } from "openapi-types";
import buildOperations from "./helpers/buildOperations";
import { getDefinitionName } from "./helpers/openapi";
import {MediaTypeModel} from "./models/MediaTypeModel";

export type TagsInfoMap = Record<string, any>;

export const operationNames = {
  get: true,
  post: true,
  put: true,
  head: true,
  patch: true,
  delete: true,
  options: true,
  $ref: true,
};

export type MenuListItem = {
  tags: string[];
  id: string;
  pathName: string;
  summary: string;
  operationId: string;
  httpVerb: string;
  isWebhook: boolean;
};

export interface SectionItem {
  id: string;
  type: string;
  name: string;
  description: string;
  path: string;
  deprecated: boolean;
  depth: number;
  isWebhook: boolean;
  isEvent: boolean;
  isCallback: boolean;
}

export type OperationItem = OpenAPIV3_1.OperationObject &
  SectionItem & {
    operationId: string;
    id: string;
    operationSpec: {
      "x-codeSamples"?: OpenAPIXCodeSample[];
    } & OpenAPIV3_1.OperationObject;
    security: OpenAPIV3_1.SecurityRequirementObject[];
    servers: OpenAPIV3_1.ServerObject[];
  };

export interface OpenAPIRef {
  $ref: string;
}

export type Referenced<T> = OpenAPIRef | T;

export type OpenAPIParameterLocation = "query" | "header" | "path" | "cookie";
export type OpenAPIParameterStyle =
  | "matrix"
  | "label"
  | "form"
  | "simple"
  | "spaceDelimited"
  | "pipeDelimited"
  | "deepObject";

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

export function isOperationName(key: string): boolean {
  return key in operationNames;
}
export const GROUP_DEPTH = 0;

export class OpenAPI {
  spec: OpenAPISpec;
  menuItems: MenuListItem[];
  items: TagsInfoMap;
  allowMergeRefs: boolean;
  _refCounter: RefCounter;
  ignoreNamedSchemas: Set<string>;

  constructor({ spec }: { spec: OpenAPISpec }) {
    this.spec = spec;
    this._refCounter = new RefCounter();
    this.allowMergeRefs = true;
    this.ignoreNamedSchemas = new Set([]);

    this.menuItems = buildMenu(this.spec);
    this.items = buildOperations(this.spec);
    console.log(this.items);

    this.addExamplesToItems();
    console.log(this.items)
  }

  addExamplesToItems = () => {
    Object.keys(this.items).forEach((itemKey) => {
      this.items[itemKey].items = this.items[itemKey].items.map((tagItem) => {
        const additionalData = {
        }

        if(tagItem.requestBody != null) {
          if(tagItem.requestBody.$ref != null) {
            additionalData.requestBody = this.deref(tagItem.requestBody);
          } else {
            additionalData.requestBody = tagItem.requestBody;
          }
          additionalData.requestBody.examples = {}
          Object.entries(additionalData.requestBody.content).forEach(([requestType, requestData]) => {
            additionalData.requestBody.examples[requestType] = new MediaTypeModel(this, requestType, true, requestData)
          })
        }
        if(tagItem.responses != null) {
          if(tagItem.responses.$ref != null) {
            additionalData.responses = this.deref(tagItem.responses);
          } else {
            additionalData.responses = tagItem.responses;
          }
          Object.keys(additionalData.responses).forEach(responseKey => {
            if (additionalData.responses[responseKey].$ref != null) {
              additionalData.responses[responseKey] = this.deref(additionalData.responses[responseKey])
            }
            if(additionalData.responses[responseKey].content != null) {
              additionalData.responses[responseKey].examples = {}
              Object.entries(additionalData.responses[responseKey].content).forEach(([responseType, responseData]) => {
                if(responseData.schema) {
                  additionalData.responses[responseKey].examples[responseType] = new MediaTypeModel(this, responseType, false, responseData)
                } else if (responseData.example) {
                  additionalData.responses[responseKey].examples[responseType] = [responseData.example]
                } else if (responseData.examples) {

                  additionalData.responses[responseKey].examples[responseType] = responseData.examples
                }
              })
            }
          })
        }

        return {
          ...tagItem,
          ...additionalData,
        };
      });
    });
  };

  getRefValue = (ref: string) => {
    return this.byRef(ref);
  };

  exitRef = <T>(ref: Referenced<T>) => {
    if (!this.isRef(ref)) {
      return;
    }
    this._refCounter.exit(ref.$ref);
  };

  deref = <T extends object>(
    obj: OpenAPIRef | T,
    forceCircular = false,
    mergeAsAllOf = false
  ): T => {
    if (this.isRef(obj)) {
      const schemaName = getDefinitionName(obj.$ref);
      if (schemaName && this.ignoreNamedSchemas.has(schemaName)) {
        return { type: "object", title: schemaName } as T;
      }

      const resolved = this.byRef<T>(obj.$ref)!;
      const visited = this._refCounter.visited(obj.$ref);
      this._refCounter.visit(obj.$ref);
      if (visited && !forceCircular) {
        // circular reference detected
        // tslint:disable-next-line
        return Object.assign({}, resolved, { "x-circular-ref": true });
      }
      // deref again in case one more $ref is here
      let result = resolved;
      if (this.isRef(resolved)) {
        result = this.deref(resolved, false, mergeAsAllOf);
        this.exitRef(resolved);
      }
      return this.allowMergeRefs
        ? this.mergeRefs(obj, resolved, mergeAsAllOf)
        : result;
    }
    return obj;
  };

  /**
   * get spec part by JsonPointer ($ref)
   */
  byRef = <T extends any = any>(ref: string): T | undefined => {
    let res;
    if (!this.spec) {
      return;
    }
    if (ref.charAt(0) === "#") {
      ref = ref.substring(1);
    }
    ref = decodeURIComponent(ref);
    try {
      res = JsonPointer.get(this.spec, ref);
    } catch (e) {
      // do nothing
    }
    return res || {};
  };

  shallowDeref = <T extends unknown>(obj: OpenAPIRef | T): T => {
    if (this.isRef(obj)) {
      const schemaName = getDefinitionName(obj.$ref);
      if (schemaName && this.ignoreNamedSchemas.has(schemaName)) {
        return { type: "object", title: schemaName } as T;
      }
      const resolved = this.byRef<T>(obj.$ref);
      return this.allowMergeRefs
        ? this.mergeRefs(obj, resolved, false)
        : (resolved as T);
    }
    return obj;
  };

  mergeRefs = (ref, resolved, mergeAsAllOf: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { $ref, ...rest } = ref;
    const keys = Object.keys(rest);
    if (keys.length === 0) {
      return resolved;
    }
    if (
      mergeAsAllOf &&
      keys.some(
        (k) => k !== "description" && k !== "title" && k !== "externalDocs"
      )
    ) {
      return {
        allOf: [rest, resolved],
      };
    } else {
      return {
        ...resolved,
        ...rest,
      };
    }
  };

  /**
   * checks if the object is OpenAPI reference (contains $ref property)
   */
  isRef(obj: any): obj is OpenAPIRef {
    if (!obj) {
      return false;
    }
    return obj.$ref !== undefined && obj.$ref !== null;
  }
}

class RefCounter {
  _counter = {};

  reset(): void {
    this._counter = {};
  }

  visit(ref: string): void {
    this._counter[ref] = this._counter[ref] ? this._counter[ref] + 1 : 1;
  }

  exit(ref: string): void {
    this._counter[ref] = this._counter[ref] && this._counter[ref] - 1;
  }

  visited(ref: string): boolean {
    return !!this._counter[ref];
  }
}
