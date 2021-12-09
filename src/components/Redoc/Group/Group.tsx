import * as React from "react";
import ContentItems from "../ContentItems/ContentItems";
import { OpenAPI } from "../../../services/OpenAPI";
import SectionItem from "../ContentItems/SectionItem";

interface Props {
  selectedGroup: string;
  openApiStore: OpenAPI;
}

export default function Group({ selectedGroup, openApiStore }: Props) {
  const groups = openApiStore.spec["x-tagGroups"].filter(
    (group) => group.slug === selectedGroup
  );

  return (
    <React.Fragment>
      {groups.map((group) => (
        <React.Fragment key={`group-${group.slug}`}>
          {
            group.tags.map(tag => (
              <React.Fragment key={`tag-${tag}`}>
                <SectionItem item={openApiStore.items[tag]} />
                <ContentItems items={openApiStore.items[tag].items} />
              </React.Fragment>
            ))
          }
        </React.Fragment>
      ))}
      ;
    </React.Fragment>
  );
}
