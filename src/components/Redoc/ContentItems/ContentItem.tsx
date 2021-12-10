import * as React from "react";
import { Section } from "../../common/Section";
import ContentItems from "./ContentItems";
import SectionItem from "./SectionItem";
import OperationItem from "./OperationItem";

interface Props {
  item: any;
}

export default function ContentItem({ item }: Props) {
  let content;
  const { type } = item;
  switch (type) {
    case 'group':
      content = null;
      break;
    case 'tag':
    case 'section':
      content = <SectionItem item={item} />;
      break;
    case 'operation':
      content = <OperationItem item={item} />;
      break;
    default:
      content = <SectionItem item={item} />;
  }

  return (
    <React.Fragment>
      {content != null && (
        <Section id={item.urlId} underlined={item.type === 'operation'}>
          {content}
        </Section>
      )}
      {item.items && <ContentItems items={item.items} />}
    </React.Fragment>
  );
}
