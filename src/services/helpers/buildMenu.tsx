import { OpenAPISpec } from "../../types/OpenAPISpec";
import {
  GROUP_DEPTH,
  isOperationName,
  MenuListItem,
  TagsInfoMap,
} from "../OpenAPI";
import kebabCase from "lodash.kebabcase";

function buildMenu(spec: OpenAPISpec): MenuListItem[] {
  const items: any[] = [];

  const tagsMap = getTagsWithOperations(spec);
  items.push(...getTagsItems(tagsMap));

  return reduceMapsToListItems(items);
}

function reduceMapsToListItems(tagsMap: any[]): MenuListItem[] {
  const listItems: MenuListItem[] = [];

  function addItemsToList(list: MenuListItem[], item: any) {
    if (item.items) {
      item.items.forEach((innerTagMap) => addItemsToList(list, innerTagMap));
    } else {
      list.push({
        id: getOperationId(item.httpVerb, item.pathName),
        urlId: encodeURIComponent(getOperationId(item.httpVerb, item.pathName)),
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

function getTagId(tag: any): string {
  return kebabCase(tag.name);
}

function getOperationId(httpVerb: string, pathName: string): string {
  return `${kebabCase(httpVerb)}${pathName}`;
}

export function getTagsWithOperations(spec: OpenAPISpec) {
  const tags: TagsInfoMap = {};
  const webhooks = spec["x-webhooks"] || spec.webhooks;
  for (const tag of spec.tags || []) {
    tags[tag.name] = {
      ...tag,
      displayName: tag["x-displayName"] || tag.name,
      operations: [],
      id: getTagId(tag),
    };
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
            id: getOperationId(operationName, pathName),
            // pointer: JsonPointer.compile(['paths', pathName, operationName]),
            urlId: encodeURIComponent(getOperationId(operationName, pathName)),
            deprecated: !!operationInfo.deprecated,
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

function getTagsItems(tagsMap: TagsInfoMap): any[] {
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
      const items = [...getOperationsItems(undefined, tag, item.depth + 1)];
      res.push(...items);
      continue;
    }

    item.items = [...getOperationsItems(item, tag, item.depth + 1)];

    res.push(item);
  }
  return res;
}

function getOperationsItems(
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

export default buildMenu;
