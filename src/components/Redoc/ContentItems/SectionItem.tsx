import * as React from "react";
import Link from '@mui/material/Link';
import {H3, H4} from "../../common/Headings";
import { Row } from "../../common/Row";
import MiddlePanel from "../../common/MiddlePanel";
import {ExternalDocumentation} from "../ExternalDocumentation/ExternalDocumentation";
import {Markdown} from "../Markdown/Markdown";

interface Props {
  item: any;
}

export default function SectionItem({ item }: Props) {
  const { name, description, externalDocs, level } = item;

  const Header = level === 2 ? H4 : H3;
  return (
    <React.Fragment>
      <Row>
        <MiddlePanel compact={false}>
          <Header>
            <Link href={`#${item.id}`}>{name}</Link>
          </Header>
        </MiddlePanel>
      </Row>
      <Markdown
        source={item.description}
        data-role="redoc-description"
      />
      {/*{externalDocs && (*/}
      {/*  <Row>*/}
      {/*    <MiddlePanel>*/}
      {/*      <ExternalDocumentation externalDocs={externalDocs} />*/}
      {/*    </MiddlePanel>*/}
      {/*  </Row>*/}
      {/*)}*/}
    </React.Fragment>
  );
}
