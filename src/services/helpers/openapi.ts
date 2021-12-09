import * as URLtemplate from 'url-template';
import {OpenAPIParameter} from "../OpenAPI";
import {OpenAPIV3_1} from "openapi-types";

export function isJsonLike(contentType: string): boolean {
  return contentType.search(/json/i) !== -1;
}

export function serializeParameterValueWithMime(value: any, mime: string): string {
  if (isJsonLike(mime)) {
    return JSON.stringify(value);
  } else {
    console.warn(`Parameter serialization as ${mime} is not supported`);
    return '';
  }
}

function deepObjectEncodeField(fieldVal: any, fieldName: string): string {
  if (Array.isArray(fieldVal)) {
    console.warn('deepObject style cannot be used with array value:' + fieldVal.toString());
    return '';
  } else if (typeof fieldVal === 'object') {
    return Object.keys(fieldVal)
      .map(k => `${fieldName}[${k}]=${fieldVal[k]}`)
      .join('&');
  } else {
    console.warn('deepObject style cannot be used with non-object value:' + fieldVal.toString());
    return '';
  }
}

export function getDefinitionName(pointer?: string): string | undefined {
  if (!pointer) return undefined;
  const match = pointer.match(/^#\/components\/(schemas|pathItems)\/([^\/]+)$/);
  return match === null ? undefined : match[1];
}

function serializeFormValue(name: string, explode: boolean, value: any) {
  // Use RFC6570 safe name ([a-zA-Z0-9_]) and replace with our name later
  // e.g. URI.template doesn't parse names with hyphen (-) which are valid query param names
  const safeName = '__redoc_param_name__';
  const suffix = explode ? '*' : '';
  const template = URLtemplate.parse(`{?${safeName}${suffix}}`);
  return template
    .expand({ [safeName]: value })
    .substring(1)
    .replace(/__redoc_param_name__/g, name);
}

function serializePathParameter(
  name: string,
  style: OpenAPIParameter['style'],
  explode: boolean,
  value: any,
): string {
  const suffix = explode ? '*' : '';
  let prefix = '';

  if (style === 'label') {
    prefix = '.';
  } else if (style === 'matrix') {
    prefix = ';';
  }

  // Use RFC6570 safe name ([a-zA-Z0-9_]) and replace with our name later
  // e.g. URI.template doesn't parse names with hyphen (-) which are valid query param names
  const safeName = '__redoc_param_name__';
  const template = URLtemplate.parse(`{${prefix}${safeName}${suffix}}`);

  return template.expand({ [safeName]: value }).replace(/__redoc_param_name__/g, name);
}

function serializeQueryParameter(
  name: string,
  style: OpenAPIParameter['style'],
  explode: boolean,
  value: any,
): string {
  switch (style) {
    case 'form':
      return serializeFormValue(name, explode, value);
    case 'spaceDelimited':
      if (!Array.isArray(value)) {
        console.warn('The style spaceDelimited is only applicable to arrays');
        return '';
      }
      if (explode) {
        return serializeFormValue(name, explode, value);
      }

      return `${name}=${value.join('%20')}`;
    case 'pipeDelimited':
      if (!Array.isArray(value)) {
        console.warn('The style pipeDelimited is only applicable to arrays');
        return '';
      }
      if (explode) {
        return serializeFormValue(name, explode, value);
      }

      return `${name}=${value.join('|')}`;
    case 'deepObject':
      if (!explode || Array.isArray(value) || typeof value !== 'object') {
        console.warn('The style deepObject is only applicable for objects with explode=true');
        return '';
      }

      return deepObjectEncodeField(value, name);
    default:
      console.warn('Unexpected style for query: ' + style);
      return '';
  }
}

function serializeHeaderParameter(
  style: OpenAPIParameter['style'],
  explode: boolean,
  value: any,
): string {
  switch (style) {
    case 'simple':
      const suffix = explode ? '*' : '';

      // name is not important here, so use RFC6570 safe name ([a-zA-Z0-9_])
      const name = '__redoc_param_name__';
      const template = URLtemplate.parse(`{${name}${suffix}}`);
      return decodeURIComponent(template.expand({ [name]: value }));
    default:
      console.warn('Unexpected style for header: ' + style);
      return '';
  }
}

function serializeCookieParameter(
  name: string,
  style: OpenAPIParameter['style'],
  explode: boolean,
  value: any,
): string {
  switch (style) {
    case 'form':
      return serializeFormValue(name, explode, value);
    default:
      console.warn('Unexpected style for cookie: ' + style);
      return '';
  }
}

export function serializeParameterValue(
  parameter: OpenAPIParameter & { serializationMime?: string },
  value: any,
): string {
  const { name, style, explode = false, serializationMime } = parameter;

  if (serializationMime) {
    switch (parameter.in) {
      case 'path':
      case 'header':
        return serializeParameterValueWithMime(value, serializationMime);
      case 'cookie':
      case 'query':
        return `${name}=${serializeParameterValueWithMime(value, serializationMime)}`;
      default:
        console.warn('Unexpected parameter location: ' + parameter.in);
        return '';
    }
  }

  if (!style) {
    console.warn(`Missing style attribute or content for parameter ${name}`);
    return '';
  }

  switch (parameter.in) {
    case 'path':
      return serializePathParameter(name, style, explode, value);
    case 'query':
      return serializeQueryParameter(name, style, explode, value);
    case 'header':
      return serializeHeaderParameter(style, explode, value);
    case 'cookie':
      return serializeCookieParameter(name, style, explode, value);
    default:
      console.warn('Unexpected parameter location: ' + parameter.in);
      return '';
  }
}

function humanizeMultipleOfConstraint(multipleOf: number | undefined): string | undefined {
  if (multipleOf === undefined) {
    return;
  }
  const strigifiedMultipleOf = multipleOf.toString(10);
  if (!/^0\.0*1$/.test(strigifiedMultipleOf)) {
    return `multiple of ${strigifiedMultipleOf}`;
  }
  return `decimal places <= ${strigifiedMultipleOf.split('.')[1].length}`;
}

function humanizeRangeConstraint(
  description: string,
  min: number | undefined,
  max: number | undefined,
): string | undefined {
  let stringRange;
  if (min !== undefined && max !== undefined) {
    if (min === max) {
      stringRange = `${min} ${description}`;
    } else {
      stringRange = `[ ${min} .. ${max} ] ${description}`;
    }
  } else if (max !== undefined) {
    stringRange = `<= ${max} ${description}`;
  } else if (min !== undefined) {
    if (min === 1) {
      stringRange = 'non-empty';
    } else {
      stringRange = `>= ${min} ${description}`;
    }
  }

  return stringRange;
}

export function humanizeNumberRange(schema: OpenAPIV3_1.SchemaObject): string | undefined {
  const minimum =
    typeof schema.exclusiveMinimum === 'number'
      ? Math.min(schema.exclusiveMinimum, schema.minimum ?? Infinity)
      : schema.minimum;
  const maximum =
    typeof schema.exclusiveMaximum === 'number'
      ? Math.max(schema.exclusiveMaximum, schema.maximum ?? -Infinity)
      : schema.maximum;
  const exclusiveMinimum = typeof schema.exclusiveMinimum === 'number' || schema.exclusiveMinimum;
  const exclusiveMaximum = typeof schema.exclusiveMaximum === 'number' || schema.exclusiveMaximum;

  if (minimum !== undefined && maximum !== undefined) {
    return `${exclusiveMinimum ? '( ' : '[ '}${minimum} .. ${maximum}${
      exclusiveMaximum ? ' )' : ' ]'
    }`;
  } else if (maximum !== undefined) {
    return `${exclusiveMaximum ? '< ' : '<= '}${maximum}`;
  } else if (minimum !== undefined) {
    return `${exclusiveMinimum ? '> ' : '>= '}${minimum}`;
  }
}

export function humanizeConstraints(schema: OpenAPIV3_1.SchemaObject): string[] {
  const res: string[] = [];

  const stringRange = humanizeRangeConstraint('characters', schema.minLength, schema.maxLength);
  if (stringRange !== undefined) {
    res.push(stringRange);
  }

  const arrayRange = humanizeRangeConstraint('items', schema.minItems, schema.maxItems);
  if (arrayRange !== undefined) {
    res.push(arrayRange);
  }

  const multipleOfConstraint = humanizeMultipleOfConstraint(schema.multipleOf);
  if (multipleOfConstraint !== undefined) {
    res.push(multipleOfConstraint);
  }

  const numberRange = humanizeNumberRange(schema);
  if (numberRange !== undefined) {
    res.push(numberRange);
  }

  if (schema.uniqueItems) {
    res.push('unique');
  }

  return res;
}