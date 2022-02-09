import * as React from 'react';

import { MarkdownRenderer } from '../../../services/MarkdownRenderer';
import { SanitizedMarkdownHTML } from './SanitizedMdBlock';

export interface StylingMarkdownProps {
  compact?: boolean;
  inline?: boolean;
}

export interface BaseMarkdownProps {
  sanitize?: boolean;
  source: string;
}

export type MarkdownProps = BaseMarkdownProps &
  StylingMarkdownProps & {
    source: string;
    className?: string;
    'data-role'?: string;
  };

export class Markdown extends React.Component<MarkdownProps> {
  render() {
    const { source = '', inline, className, 'data-role': dataRole } = this.props;
    const renderer = new MarkdownRenderer();
    return (
      <SanitizedMarkdownHTML
        html={renderer.renderMd(source)}
        inline={inline}
        className={className}
        data-role={dataRole}
      />
    );
  }
}
