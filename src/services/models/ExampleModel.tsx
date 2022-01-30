import { resolve as urlResolve } from 'url';

import { isFormUrlEncoded, isJsonLike, urlFormEncodePayload } from '../../utils';
import {OpenAPI} from "../OpenAPI";
import {OpenAPIV3_1} from "openapi-types";

const externalExamplesCache: { [url: string]: Promise<any> } = {};

export class ExampleModel {
  value: any;
  summary?: string;
  description?: string;
  externalValueUrl?: string;

  constructor(
    parser: OpenAPI,
    infoOrRef: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ExampleObject,
    public mime: string,
    encoding?: { [field: string]: OpenAPIV3_1.EncodingObject },
  ) {
    const example = parser.deref(infoOrRef);
    // console.log(example);
    this.value = example.value;
    this.summary = example.summary;
    this.description = example.description;
    if (example.externalValue) {
      this.externalValueUrl = urlResolve(parser.specUrl || '', example.externalValue);
    }
    parser.exitRef(infoOrRef);

    if (isFormUrlEncoded(mime) && this.value && typeof this.value === 'object') {
      this.value = urlFormEncodePayload(this.value, encoding);
    }
  }

  getExternalValue(mimeType: string): Promise<any> {
    if (!this.externalValueUrl) {
      return Promise.resolve(undefined);
    }

    if (externalExamplesCache[this.externalValueUrl]) {
      return externalExamplesCache[this.externalValueUrl];
    }

    externalExamplesCache[this.externalValueUrl] = fetch(this.externalValueUrl).then(res => {
      return res.text().then(txt => {
        if (!res.ok) {
          return Promise.reject(new Error(txt));
        }

        if (isJsonLike(mimeType)) {
          try {
            return JSON.parse(txt);
          } catch (e) {
            return txt;
          }
        } else {
          return txt;
        }
      });
    });

    return externalExamplesCache[this.externalValueUrl];
  }
}
