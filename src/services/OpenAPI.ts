import * as JsonPointer from "json-pointer";
import { OpenAPISpec, OpenAPIXCodeSample } from "../types/OpenAPISpec";
import buildMenu from "./helpers/buildMenu";
import { OpenAPIV3_1 } from "openapi-types";
import buildOperations from "./helpers/buildOperations";
import {getDefinitionName, isNamedDefinition} from "../utils/openapi";
import { MediaTypeModel } from "./models/MediaTypeModel";
import { ExampleModel } from "./models/ExampleModel";
import slugify from "slugify";

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
  urlId: string,
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
  versionSlug: string;
  menuItems: MenuListItem[];
  items: TagsInfoMap;
  allowMergeRefs: boolean;
  _refCounter: RefCounter;
  ignoreNamedSchemas: Set<string>;

  constructor({ spec, versionSlug }: { spec: OpenAPISpec, versionSlug: string }) {
    this.spec = spec;
    this.versionSlug = versionSlug;
    this._refCounter = new RefCounter();
    this.allowMergeRefs = true;
    this.ignoreNamedSchemas = new Set([]);

    this.menuItems = buildMenu(this.spec);
    this.items = buildOperations(this.spec);

    this.addExamplesToItems();
  }

  generateSchemaLink = (schemaRef): {
    href: string,
    name: string,
  } => {
    const schemaName = schemaRef.split('/').pop()
    const schemaSlug = slugify(schemaName, {
      replacement: "-",
      lower: true,
      strict: true,
    })
    return {
      href: `/${this.versionSlug}/schemas/${schemaSlug}`,
      name: schemaName
    };
  }

  addExamplesToItems = () => {
    Object.keys(this.items).forEach((itemKey) => {
      this.items[itemKey].items = this.items[itemKey].items.map((tagItem) => {
        const additionalData = {};

        if (tagItem.requestBody != null) {
          if (tagItem.requestBody.$ref != null) {
            additionalData.requestBody = this.deref(tagItem.requestBody);
          } else {
            additionalData.requestBody = tagItem.requestBody;
          }
          additionalData.requestBody.examples = {};
          Object.entries(additionalData.requestBody.content).forEach(
            ([requestType, requestData]) => {
              additionalData.requestBody.examples[requestType] =
                new MediaTypeModel(this, requestType, true, requestData);
            }
          );
        }
        if (tagItem.responses != null) {
          if (tagItem.responses.$ref != null) {
            additionalData.responses = {
              ...this.deref(tagItem.responses),
              ...tagItem.responses,
            };
            delete additionalData.$ref;
          } else {
            additionalData.responses = tagItem.responses;
          }
          Object.keys(additionalData.responses).forEach((responseKey) => {
            if (additionalData.responses[responseKey].$ref != null) {
              additionalData.responses[responseKey] = {
                ...this.deref(
                  additionalData.responses[responseKey]
                ),
                ...additionalData.responses[responseKey],
              };
              delete additionalData.responses[responseKey].$ref;
            }
            if (additionalData.responses[responseKey].content != null) {
              additionalData.responses[responseKey].examples = {};
              Object.entries(
                additionalData.responses[responseKey].content
              ).forEach(([responseType, responseData]) => {
                if (responseData.schema) {
                  additionalData.responses[responseKey].examples[responseType] =
                    new MediaTypeModel(this, responseType, false, responseData);
                } else if (responseData.example) {
                  additionalData.responses[responseKey].examples[responseType] =
                    {
                      examples: {
                        default: new ExampleModel(
                          this,
                          { value: this.shallowDeref(responseData.example) },
                          responseType,
                          responseData.encoding
                        ),
                      },
                    };
                } else if (responseData.examples) {
                  additionalData.responses[responseKey].examples[responseType] =
                    {
                      examples: Object.entries(responseData.examples).reduce(
                        (acc, [exampleId, example]) => {
                          acc[exampleId] = new ExampleModel(
                            this,
                            { value: this.shallowDeref(example) },
                            responseType,
                            responseData.encoding
                          );
                          return acc;
                        },
                        {}
                      ),
                    };
                }
              });
            }
          });
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
   * Merge allOf constraints.
   * @param schema schema with allOF
   * @param $ref pointer of the schema
   * @param forceCircular whether to dereference children even if it is a circular ref
   */
  mergeAllOf(
    schema: OpenAPIV3_1.SchemaObject,
    $ref?: string,
    forceCircular: boolean = false,
    used$Refs = new Set<string>(),
  ) {
    if ($ref) {
      used$Refs.add($ref);
    }

    schema = this.hoistOneOfs(schema);

    if (schema.allOf === undefined) {
      return schema;
    }

    let receiver = {
      ...schema,
      allOf: undefined,
      parentRefs: [],
      title: schema.title || getDefinitionName($ref),
    };

    // avoid mutating inner objects
    if (receiver.properties !== undefined && typeof receiver.properties === 'object') {
      receiver.properties = { ...receiver.properties };
    }
    if (receiver.items !== undefined && typeof receiver.items === 'object') {
      receiver.items = { ...receiver.items };
    }

    const allOfSchemas = schema.allOf
      .map(subSchema => {
        if (subSchema && subSchema.$ref && used$Refs.has(subSchema.$ref)) {
          return undefined;
        }

        const resolved = this.deref(subSchema, forceCircular, true);
        const subRef = subSchema.$ref || undefined;
        const subMerged = this.mergeAllOf(resolved, subRef, forceCircular, used$Refs);
        receiver.parentRefs!.push(...(subMerged.parentRefs || []));
        return {
          $ref: subRef,
          schema: subMerged,
        };
      })
      .filter(child => child !== undefined) as Array<{
      $ref: string | undefined;
      schema: OpenAPIV3_1.SchemaObject;
    }>;

    for (const { $ref: subSchemaRef, schema: subSchema } of allOfSchemas) {
      if (
        receiver.type !== subSchema.type &&
        receiver.type !== undefined &&
        subSchema.type !== undefined
      ) {
        console.warn(
          `Incompatible types in allOf at "${$ref}": "${receiver.type}" and "${subSchema.type}"`,
        );
      }

      if (subSchema.type !== undefined) {
        receiver.type = subSchema.type;
      }

      if (subSchema.properties !== undefined) {
        receiver.properties = receiver.properties || {};
        for (const prop in subSchema.properties) {
          if (!receiver.properties[prop]) {
            receiver.properties[prop] = subSchema.properties[prop];
          } else {
            // merge inner properties
            const mergedProp = this.mergeAllOf(
              { allOf: [receiver.properties[prop], subSchema.properties[prop]] },
              $ref + '/properties/' + prop,
            );
            receiver.properties[prop] = mergedProp;
            this.exitParents(mergedProp); // every prop resolution should have separate recursive stack
          }
        }
      }

      if (subSchema.items !== undefined) {
        receiver.items = receiver.items || {};
        // merge inner properties
        receiver.items = this.mergeAllOf(
          { allOf: [receiver.items, subSchema.items] },
          $ref + '/items',
        );
      }

      if (subSchema.required !== undefined) {
        receiver.required = (receiver.required || []).concat(subSchema.required);
      }

      // merge rest of constraints
      // TODO: do more intelligent merge
      receiver = { ...subSchema, ...receiver };

      if (subSchemaRef) {
        receiver.parentRefs!.push(subSchemaRef);
        if (receiver.title === undefined && isNamedDefinition(subSchemaRef)) {
          // this is not so correct behaviour. commented out for now
          // ref: https://github.com/Redocly/redoc/issues/601
          // receiver.title = JsonPointer.baseName(subSchemaRef);
        }
      }
    }

    return receiver;
  }

  exitParents(shema) {
    for (const parent$ref of shema.parentRefs || []) {
      this.exitRef({ $ref: parent$ref });
    }
  }

  private hoistOneOfs(schema: OpenAPIV3_1.SchemaObject) {
    if (schema.allOf === undefined) {
      return schema;
    }

    const allOf = schema.allOf;
    for (let i = 0; i < allOf.length; i++) {
      const sub = allOf[i];
      if (Array.isArray(sub.oneOf)) {
        const beforeAllOf = allOf.slice(0, i);
        const afterAllOf = allOf.slice(i + 1);
        return {
          oneOf: sub.oneOf.map(part => {
            const merged = this.mergeAllOf({
              allOf: [...beforeAllOf, part, ...afterAllOf],
            });

            // each oneOf should be independent so exiting all the parent refs
            // otherwise it will cause false-positive recursive detection
            this.exitParents(merged);
            return merged;
          }),
        };
      }
    }

    return schema;
  }

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
