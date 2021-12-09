import { OpenAPISpec } from "../../types/OpenAPISpec";
import {
  GROUP_DEPTH,
  isOperationName,
  OperationItem,
  TagsInfoMap,
} from "../OpenAPI";
import { getTagsWithOperations } from "./buildMenu";

function buildOperations(spec: OpenAPISpec): TagsInfoMap {
  const items: any[] = [];

  const tagsMap = getTagsWithOperations(spec);
  // items.push(...getOperationItems(tagsMap));

  return parseTagsToOperationItems(tagsMap);
}

function parseTagsToOperationItems(tagsMap: TagsInfoMap): TagsInfoMap {
  for (const tagName in tagsMap) {
    const currTag = tagsMap[tagName];
    currTag.depth = 1;

    currTag.items = [...getOperationsItems(currTag, currTag.depth + 1)];
  }

  return tagsMap;
}

function getOperationsItems(tag: any, depth: number): OperationItem[] {
  if (tag.operations.length === 0) {
    return [];
  }

  const res: OperationItem[] = [];
  for (const operationInfo of tag.operations) {
    res.push({
      ...operationInfo,
      type: 'operation',
      depth: depth,
    });
  }
  return res;
}

export default buildOperations;
