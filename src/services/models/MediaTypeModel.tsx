import * as Sampler from "openapi-sampler";

import { isJsonLike, mapValues } from "../../utils";
import { ExampleModel } from "./ExampleModel";
import { OpenAPI } from "../OpenAPI";
import { OpenAPIV3_1 } from "openapi-types";

export class MediaTypeModel {
  examples?: { [name: string]: ExampleModel };
  schema?: OpenAPIV3_1.SchemaObject;
  name: string;
  isRequestType: boolean;
  onlyRequiredInSamples: boolean;
  generatedPayloadSamplesMaxDepth: number;
  schemaRefs: string[];

  /**
   * @param isRequestType needed to know if skipe RO/RW fields in objects
   */
  constructor(
    openApi: OpenAPI,
    name: string,
    isRequestType: boolean,
    info: OpenAPIV3_1.MediaTypeObject,
    options: {
      onlyRequiredInSamples: boolean;
      generatedPayloadSamplesMaxDepth: number;
    } = {
      onlyRequiredInSamples: false,
      generatedPayloadSamplesMaxDepth: 12,
    }
  ) {
    this.schemaRefs = [];
    if (info.schema.$ref != null) {
      this.schemaRefs.push(info.schema.$ref);
      info.schema = openApi.deref(info.schema)
    }
    if (info.schema.allOf != null) {
      info.schema = info.schema.allOf.reduce((acc, schema) => {
        return {
          ...acc,
          ...openApi.deref(schema)
        }
      }, {})
    }
    this.name = name;
    this.isRequestType = isRequestType;
    this.schema = info.schema
    this.schema.discriminatorProp =
      (this.schema.discriminator || this.schema["x-discriminator"] || {}).propertyName || "default-discriminator";
    this.onlyRequiredInSamples = options.onlyRequiredInSamples;
    this.generatedPayloadSamplesMaxDepth =
      options.generatedPayloadSamplesMaxDepth;
    if (info.examples !== undefined) {
      this.examples = mapValues(
        info.examples,
        (example) => new ExampleModel(openApi, example, name, info.encoding)
      );
    } else if (info.example !== undefined) {
      this.examples = {
        default: new ExampleModel(
          openApi,
          { value: openApi.shallowDeref(info.example) },
          name,
          info.encoding
        ),
      };
    } else if (isJsonLike(name)) {
      this.generateExample(openApi, info);
    }
  }

  generateExample = (openApi: OpenAPI, info: OpenAPIV3_1.MediaTypeObject) => {
    const samplerOptions = {
      skipReadOnly: this.isRequestType,
      skipWriteOnly: !this.isRequestType,
      skipNonRequired: this.onlyRequiredInSamples,
      maxSampleDepth: this.generatedPayloadSamplesMaxDepth,
    };
    if (this.schema && this.schema.oneOf) {
      this.examples = {};
      for (const subSchema of this.schema.oneOf) {
        const rawScheme = openApi.deref(subSchema)
        const sample = Sampler.sample(
          rawScheme as any,
          samplerOptions,
          openApi.spec
        );

        if (
          this.schema.discriminatorProp &&
          typeof sample === "object" &&
          sample
        ) {
          sample[this.schema.discriminatorProp] = rawScheme.title;
        }

        this.examples[rawScheme.title] = new ExampleModel(
          openApi,
          {
            value: sample,
          },
          this.name,
          info.encoding
        );
      }
    } else if (this.schema) {
      // console.log(info.schema)
      this.examples = {
        default: new ExampleModel(
          openApi,
          {
            value: Sampler.sample(
              info.schema as any,
              samplerOptions,
              openApi.spec
            ),
          },
          this.name,
          info.encoding
        ),
      };
    }
  };
}
