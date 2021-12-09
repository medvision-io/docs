import * as React from "react";
import ContentItem from "./ContentItem";

interface Props {
  items: any[];
}

export default function ContentItems({ items }: Props) {
  if (items.length === 0) {
    return null;
  }
  return (
    <React.Fragment>
      {items.map((item) => {
        return <ContentItem key={item.id} item={item} />;
      })}
    </React.Fragment>
  );
}
