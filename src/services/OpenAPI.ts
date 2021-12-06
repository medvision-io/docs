import { OpenAPISpec } from "../types/OpenAPISpec";

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
  pathName: string;
  summary: string;
  operationId: string;
  httpVerb: string;
  isWebhook: boolean;
};

export function isOperationName(key: string): boolean {
  return key in operationNames;
}
export const GROUP_DEPTH = 0;

export class OpenAPI {
  spec: OpenAPISpec;
  menuItems: MenuListItem[];

  constructor({ spec }: { spec: OpenAPISpec }) {
    this.spec = spec;

    this.menuItems = OpenAPI.buildMenu(this.spec);
  }

  static buildMenu(spec: OpenAPISpec): MenuListItem[] {
    const items: any[] = [];

    const tagsMap = OpenAPI.getTagsWithOperations(spec);
    items.push(...OpenAPI.getTagsItems(tagsMap));

    return OpenAPI.reduceMapsToListItems(items);
  }

  static reduceMapsToListItems(tagsMap: any[]): MenuListItem[] {
    const listItems: MenuListItem[] = [];

    function addItemsToList(list: MenuListItem[], item: any) {
      if (item.items) {
        item.items.forEach((innerTagMap) => addItemsToList(list, innerTagMap));
      } else {
        list.push({
          tags: item.tags,
          pathName: item.pathName,
          summary: item.summary,
          operationId: item.operationId,
          httpVerb: item.httpVerb,
          isWebhook: item.isWebhook,
        });
      }
    }

    tagsMap.forEach((tagsMap) => addItemsToList(listItems, tagsMap));

    return listItems;
  }

  static getTagsWithOperations(spec: OpenAPISpec) {
    const tags: TagsInfoMap = {};
    const webhooks = spec["x-webhooks"] || spec.webhooks;
    for (const tag of spec.tags || []) {
      tags[tag.name] = { ...tag, operations: [] };
    }

    if (webhooks) {
      getTags(webhooks, true);
    }

    if (spec.paths) {
      getTags(spec.paths);
    }

    function getTags(paths: OpenAPISpec["paths"], isWebhook?: boolean) {
      for (const pathName of Object.keys(paths)) {
        const path = paths[pathName];
        const operations = Object.keys(path).filter(isOperationName);
        for (const operationName of operations) {
          const operationInfo = path[operationName];
          let operationTags = operationInfo?.tags;

          if (!operationTags || !operationTags.length) {
            // empty tag
            operationTags = [""];
          }

          for (const tagName of operationTags) {
            let tag = tags[tagName];
            if (tag === undefined) {
              tag = {
                name: tagName,
                operations: [],
              };
              tags[tagName] = tag;
            }
            if (tag["x-traitTag"]) {
              continue;
            }
            tag.operations.push({
              ...operationInfo,
              pathName,
              // pointer: JsonPointer.compile(['paths', pathName, operationName]),
              httpVerb: operationName,
              pathParameters: path.parameters || [],
              pathServers: path.servers,
              isWebhook: !!isWebhook,
            });
          }
        }
      }
    }
    return tags;
  }

  static getTagsItems(tagsMap: TagsInfoMap): any[] {
    const tagNames = Object.keys(tagsMap); // all tags

    const tags = tagNames.map((tagName) => {
      if (!tagsMap[tagName]) {
        console.warn(`Non-existing tag "${tagName}"`);
        return null;
      }
      tagsMap[tagName].used = true;
      return tagsMap[tagName];
    });

    const res: Array<any> = [];
    for (const tag of tags) {
      if (!tag) {
        continue;
      }
      const item = tag;
      item.depth = GROUP_DEPTH + 1;

      // don't put empty tag into content, instead put its operations
      if (tag.name === "") {
        const items = [
          ...this.getOperationsItems(undefined, tag, item.depth + 1),
        ];
        res.push(...items);
        continue;
      }

      item.items = [...this.getOperationsItems(item, tag, item.depth + 1)];

      res.push(item);
    }
    return res;
  }

  static getOperationsItems(
    parent: any | undefined,
    tag: any,
    depth: number
  ): any[] {
    if (tag.operations.length === 0) {
      return [];
    }

    const res: any[] = [];
    for (const operationInfo of tag.operations) {
      const operation = operationInfo;
      operation.depth = depth;
      res.push(operation);
    }
    return res;
  }
}
