import { FieldModel } from './FieldModel';

import {
  detectType,
  extractExtensions,
  humanizeConstraints,
  isNamedDefinition,
  isPrimitiveType,
  JsonPointer,
  pluralizeType,
  sortByField,
  sortByRequired,
} from '../../utils/';

import { l } from '../Labels';
import {OpenAPIV3_1} from "openapi-types";
import {OpenAPI, Referenced} from "../OpenAPI";

// TODO: refactor this model, maybe use getters instead of copying all the values
export class SchemaModel {
  pointer: string;

  type: string | string[];
  displayType: string;
  typePrefix: string = '';
  title: string;
  description: string;
  externalDocs?: OpenAPIV3_1.ExternalDocumentationObject;

  isPrimitive: boolean;
  isCircular: boolean = false;

  format?: string;
  displayFormat?: string;
  nullable: boolean;
  deprecated: boolean;
  pattern?: string;
  example?: any;
  enum: any[];
  default?: any;
  readOnly: boolean;
  writeOnly: boolean;

  constraints: string[];

  fields?: FieldModel[];
  items?: SchemaModel;

  oneOf?: SchemaModel[];
  oneOfType: string;
  discriminatorProp: string;
  activeOneOf: number = 0;

  rawSchema: OpenAPIV3_1.SchemaObject;
  schema: OpenAPIV3_1.SchemaObject;
  extensions?: Record<string, any>;
  const: any;
  contentEncoding?: string;
  contentMediaType?: string;
  minItems?: number;
  maxItems?: number;

  /**
   * @param isChild if schema discriminator Child
   * When true forces dereferencing in allOfs even if circular
   */
  constructor(
    parser: OpenAPI,
    schemaOrRef: Referenced<OpenAPIV3_1.SchemaObject>,
    pointer: string,
    private options: any,
    isChild: boolean = false,
  ) {
    // @ts-ignore
    this.pointer = schemaOrRef.$ref || pointer || '';
    this.rawSchema = parser.deref(schemaOrRef, false, true);
    // @ts-ignore
    this.schema = this.rawSchema;

    this.init(parser, isChild);

    parser.exitRef(schemaOrRef);
    // // @ts-ignore
    // parser.exitParents(this.schema);

    if (options.showExtensions) {
      this.extensions = extractExtensions(this.schema, options.showExtensions);
    }
  }

  /**
   * Set specified alternative schema as active
   * @param idx oneOf index
   */
  activateOneOf(idx: number) {
    this.activeOneOf = idx;
  }

  hasType(type: string) {
    return this.type === type || (Array.isArray(this.type) && this.type.includes(type));
  }

  init(parser: OpenAPI, isChild: boolean) {
    const schema = this.schema;
    this.isCircular = schema['x-circular-ref'];

    this.title =
      schema.title || (isNamedDefinition(this.pointer) && JsonPointer.baseName(this.pointer)) || '';
    this.description = schema.description || '';
    this.type = schema.type || detectType(schema);
    this.format = schema.format;
    this.enum = schema.enum || [];
    this.example = schema.example;
    this.deprecated = !!schema.deprecated;
    this.pattern = schema.pattern;
    this.externalDocs = schema.externalDocs;

    this.constraints = humanizeConstraints(schema);
    this.displayFormat = this.format;
    this.isPrimitive = isPrimitiveType(schema, this.type);
    this.default = schema.default;
    this.readOnly = !!schema.readOnly;
    this.writeOnly = !!schema.writeOnly;
    // this.const = schema.const || '';
    // this.contentEncoding = schema.contentEncoding;
    this.contentMediaType = schema.contentMediaType;
    this.minItems = schema.minItems;
    this.maxItems = schema.maxItems;

    // if (!!schema.nullable || schema['x-nullable']) {
    //   if (
    //     Array.isArray(this.type) &&
    //     !this.type.some(value => value === null || value === 'null')
    //   ) {
    //     this.type = [...this.type, 'null'];
    //   } else if (!Array.isArray(this.type) && (this.type !== null || this.type !== 'null')) {
    //     this.type = [this.type, 'null'];
    //   }
    // }

    this.displayType = Array.isArray(this.type)
      ? this.type.map(item => (item === null ? 'null' : item)).join(' or ')
      : this.type;

    if (this.isCircular) {
      return;
    }

    if (!isChild && getDiscriminator(schema) !== undefined) {
      this.initDiscriminator(schema, parser);
      return;
    } else if (
      isChild &&
      Array.isArray(schema.oneOf) &&
      // @ts-ignore
      schema.oneOf.find(s => s.$ref === this.pointer)
    ) {
      // we hit allOf of the schema with the parent discriminator
      delete schema.oneOf;
    }

    if (schema.oneOf !== undefined) {
      this.initOneOf(schema.oneOf, parser);
      this.oneOfType = 'One of';
      if (schema.anyOf !== undefined) {
        console.warn(
          `oneOf and anyOf are not supported on the same level. Skipping anyOf at ${this.pointer}`,
        );
      }
      return;
    }

    if (schema.anyOf !== undefined) {
      this.initOneOf(schema.anyOf, parser);
      this.oneOfType = 'Any of';
      return;
    }

    if (this.hasType('object')) {
      this.fields = buildFields(parser, schema, this.pointer, this.options);
      // @ts-ignore
    } else if (this.hasType('array') && schema.items) {
      // @ts-ignore
      this.items = new SchemaModel(parser, schema.items, this.pointer + '/items', this.options);
      this.displayType = pluralizeType(this.items.displayType);
      this.displayFormat = this.items.format;
      this.typePrefix = this.items.typePrefix + l('arrayOf');
      this.title = this.title || this.items.title;
      this.isPrimitive = this.items.isPrimitive;
      if (this.example === undefined && this.items.example !== undefined) {
        this.example = [this.items.example];
      }
      if (this.items.isPrimitive) {
        this.enum = this.items.enum;
      }
      if (Array.isArray(this.type)) {
        const filteredType = this.type.filter(item => item !== 'array');
        if (filteredType.length) this.displayType += ` or ${filteredType.join(' or ')}`;
      }
    }

    if (this.enum.length && this.options.sortEnumValuesAlphabetically) {
      this.enum.sort();
    }
  }

  private initOneOf(oneOf: Referenced<OpenAPIV3_1.SchemaObject>[], parser: OpenAPI) {
    this.oneOf = oneOf!.map((variant, idx) => {
      const derefVariant = parser.deref(variant, false, true);

      // @ts-ignore
      const merged = parser.mergeAllOf(derefVariant, this.pointer + '/oneOf/' + idx);
      // const merged = {
      //   ...derefVariant,
      //   const: 'test'
      // };

      // try to infer title
      const title =
        isNamedDefinition("$ref" in variant && variant.$ref) && !merged.title
          ? JsonPointer.baseName("$ref" in variant ? variant.$ref : '')
          : `${merged.title || ''}${(merged.const && JSON.stringify(merged.const)) || ''}`;

      const schema = new SchemaModel(
        parser,
        // merge base schema into each of oneOf's subschemas
        {
          // variant may already have allOf so merge it to not get overwritten
          ...merged,
          title,
          allOf: [{ ...this.schema, oneOf: undefined, anyOf: undefined }],
        } as OpenAPIV3_1.SchemaObject,
        this.pointer + '/oneOf/' + idx,
        this.options,
      );

      parser.exitRef(variant);
      // each oneOf should be independent so exiting all the parent refs
      // otherwise it will cause false-positive recursive detection
      // @ts-ignore
      parser.exitParents(merged);

      return schema;
    });

    if (this.options.simpleOneOfTypeLabel) {
      const types = collectUniqueOneOfTypesDeep(this);
      this.displayType = types.join(' or ');
    } else {
      this.displayType = this.oneOf
        .map(schema => {
          let name =
            schema.typePrefix +
            (schema.title ? `${schema.title} (${schema.displayType})` : schema.displayType);
          if (name.indexOf(' or ') > -1) {
            name = `(${name})`;
          }
          return name;
        })
        .join(' or ');
    }
  }

  private initDiscriminator(
    schema: OpenAPIV3_1.SchemaObject & {
      parentRefs?: string[];
    },
    parser: OpenAPI,
  ) {
    const discriminator = getDiscriminator(schema)!;
    this.discriminatorProp = discriminator.propertyName;
    // @ts-ignore
    const implicitInversedMapping = parser.findDerived([
      ...(schema.parentRefs || []),
      this.pointer,
    ]);

    if (schema.oneOf) {
      for (const variant of schema.oneOf) {
        // @ts-ignore
        if (variant.$ref === undefined) {
          continue;
        }
        // @ts-ignore
        const name = JsonPointer.baseName(variant.$ref);
        // @ts-ignore
        implicitInversedMapping[variant.$ref] = name;
      }
    }

    const mapping = discriminator.mapping || {};

    // Defines if the mapping is exhaustive. This avoids having references
    // that overlap with the mapping entries
    let isLimitedToMapping = discriminator['x-explicitMappingOnly'] || false;
    // if there are no mappings, assume non-exhaustive
    if (Object.keys(mapping).length === 0) {
      isLimitedToMapping = false;
    }

    const explicitInversedMapping = {};
    for (const name in mapping) {
      const $ref = mapping[name];

      if (Array.isArray(explicitInversedMapping[$ref])) {
        explicitInversedMapping[$ref].push(name);
      } else {
        // overrides implicit mapping here
        explicitInversedMapping[$ref] = [name];
      }
    }

    const inversedMapping = isLimitedToMapping
      ? { ...explicitInversedMapping }
      : { ...implicitInversedMapping, ...explicitInversedMapping };

    let refs: Array<{ $ref; name }> = [];

    for (const $ref of Object.keys(inversedMapping)) {
      const names = inversedMapping[$ref];
      if (Array.isArray(names)) {
        for (const name of names) {
          refs.push({ $ref, name });
        }
      } else {
        refs.push({ $ref, name: names });
      }
    }

    // Make the listing respects the mapping
    // in case a mapping is defined, the user usually wants to have the order shown
    // as it was defined in the yaml. This will sort the names given the provided
    // mapping (if provided).
    // The logic is:
    // - If a name is among the mapping, promote it to first
    // - Names among the mapping are sorted by their order in the mapping
    // - Names outside the mapping are sorted alphabetically
    const names = Object.keys(mapping);
    if (names.length !== 0) {
      refs = refs.sort((left, right) => {
        const indexLeft = names.indexOf(left.name);
        const indexRight = names.indexOf(right.name);

        if (indexLeft < 0 && indexRight < 0) {
          // out of mapping, order by name
          return left.name.localeCompare(right.name);
        } else if (indexLeft < 0) {
          // the right is found, so mapping wins
          return 1;
        } else if (indexRight < 0) {
          // left wins as it's in mapping
          return -1;
        } else {
          return indexLeft - indexRight;
        }
      });
    }

    this.oneOf = refs.map(({ $ref, name }) => {
      const innerSchema = new SchemaModel(parser, parser.byRef($ref)!, $ref, this.options, true);
      innerSchema.title = name;
      return innerSchema;
    });
  }
}

function buildFields(
  parser: OpenAPI,
  schema: OpenAPIV3_1.SchemaObject,
  $ref: string,
  options: any,
): FieldModel[] {
  const props = schema.properties || {};
  const additionalProps = schema.additionalProperties;
  const defaults = schema.default;
  let fields = Object.keys(props || []).map(fieldName => {
    let field = props[fieldName];

    if (!field) {
      console.warn(
        `Field "${fieldName}" is invalid, skipping.\n Field must be an object but got ${typeof field} at "${$ref}"`,
      );
      field = {};
    }

    const required =
      schema.required === undefined ? false : schema.required.indexOf(fieldName) > -1;

    return new FieldModel(
      parser,
      {
        name: fieldName,
        required,
        schema: {
          ...field,
          // @ts-ignore
          default: field.default === undefined && defaults ? defaults[fieldName] : field.default,
        },
      },
      $ref + '/properties/' + fieldName,
      options,
    );
  });

  if (options.sortPropsAlphabetically) {
    fields = sortByField(fields, 'name');
  }
  if (options.requiredPropsFirst) {
    // if not sort alphabetically sort in the order from required keyword
    fields = sortByRequired(fields, !options.sortPropsAlphabetically ? schema.required : undefined);
  }

  if (typeof additionalProps === 'object' || additionalProps === true) {
    fields.push(
      new FieldModel(
        parser,
        {
          name: `{${(typeof additionalProps === 'object'
              ? additionalProps['x-additionalPropertiesName'] || 'property'
              : 'property'
          )}}`,
          required: false,
          schema: additionalProps === true ? {} : additionalProps,
          kind: 'additionalProperties',
        },
        $ref + '/additionalProperties',
        options,
      ),
    );
  }

  return fields;
}

function getDiscriminator(schema: OpenAPIV3_1.SchemaObject): OpenAPIV3_1.SchemaObject['discriminator'] {
  return schema.discriminator || schema['x-discriminator'];
}

function collectUniqueOneOfTypesDeep(schema: SchemaModel) {
  const uniqueTypes = new Set();

  function crawl(schema: SchemaModel) {
    for (const oneOfType of schema.oneOf || []) {
      if (oneOfType.oneOf) {
        crawl(oneOfType);
        continue;
      }

      if (oneOfType.type) {
        uniqueTypes.add(oneOfType.type);
      }
    }
  }

  crawl(schema);
  return Array.from(uniqueTypes.values());
}
