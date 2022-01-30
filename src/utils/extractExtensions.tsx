export function extractExtensions(
  obj: object,
  showExtensions: string[] | true,
): Record<string, any> {
  return Object.keys(obj)
    .filter(key => {
      if (showExtensions === true) {
        return key.startsWith('x-') && !isRedocExtension(key);
      }
      return key.startsWith('x-') && showExtensions.indexOf(key) > -1;
    })
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

export function isRedocExtension(key: string): boolean {
  const redocExtensions = {
    'x-circular-ref': true,
    'x-code-samples': true, // deprecated
    'x-codeSamples': true,
    'x-displayName': true,
    'x-examples': true,
    'x-ignoredHeaderParameters': true,
    'x-logo': true,
    'x-nullable': true,
    'x-servers': true,
    'x-tagGroups': true,
    'x-traitTag': true,
    'x-additionalPropertiesName': true,
    'x-explicitMappingOnly': true,
  };

  return key in redocExtensions;
}