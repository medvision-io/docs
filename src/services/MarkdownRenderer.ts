import { marked } from 'marked';

import { highlight, safeSlugify, unescapeHTMLChars } from "../utils";

const renderer = new marked.Renderer();

marked.setOptions({
  renderer,
  highlight: (str, lang) => {
    return highlight(str, lang);
  },
});

export interface MarkdownHeading {
  id: string;
  name: string;
  level: number;
  items?: MarkdownHeading[];
  description?: string;
}

export class MarkdownRenderer {
  static getTextBeforeHading(md: string, heading: string): string {
    const headingLinePos = md.search(new RegExp(`^##?\\s+${heading}`, "m"));
    if (headingLinePos > -1) {
      return md.substring(0, headingLinePos);
    }
    return md;
  }

  headings: MarkdownHeading[] = [];
  currentTopHeading: MarkdownHeading;

  private headingEnhanceRenderer: marked.Renderer;
  private originalHeadingRule: typeof marked.Renderer.prototype.heading;

  constructor() {
    this.headingEnhanceRenderer = new marked.Renderer();
    this.originalHeadingRule = this.headingEnhanceRenderer.heading.bind(
      this.headingEnhanceRenderer
    );
    this.headingEnhanceRenderer.heading = this.headingRule;
  }

  saveHeading(
    name: string,
    level: number,
    container: MarkdownHeading[] = this.headings,
    parentId?: string
  ): MarkdownHeading {
    name = unescapeHTMLChars(name);
    const item = {
      id: parentId
        ? `${parentId}/${safeSlugify(name)}`
        : `section/${safeSlugify(name)}`,
      name,
      level,
      items: [],
    };
    container.push(item);
    return item;
  }

  flattenHeadings(container?: MarkdownHeading[]): MarkdownHeading[] {
    if (container === undefined) {
      return [];
    }
    const res: MarkdownHeading[] = [];
    for (const heading of container) {
      res.push(heading);
      res.push(...this.flattenHeadings(heading.items));
    }
    return res;
  }

  attachHeadingsDescriptions(rawText: string) {
    const buildRegexp = (heading: MarkdownHeading) => {
      return new RegExp(
        `##?\\s+${heading.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}`
      );
    };

    const flatHeadings = this.flattenHeadings(this.headings);
    if (flatHeadings.length < 1) {
      return;
    }
    let prevHeading = flatHeadings[0];
    let prevRegexp = buildRegexp(prevHeading);
    let prevPos = rawText.search(prevRegexp);
    for (let i = 1; i < flatHeadings.length; i++) {
      const heading = flatHeadings[i];
      const regexp = buildRegexp(heading);
      const currentPos =
        rawText.substr(prevPos + 1).search(regexp) + prevPos + 1;
      prevHeading.description = rawText
        .substring(prevPos, currentPos)
        .replace(prevRegexp, "")
        .trim();

      prevHeading = heading;
      prevRegexp = regexp;
      prevPos = currentPos;
    }
    prevHeading.description = rawText
      .substring(prevPos)
      .replace(prevRegexp, "")
      .trim();
  }

  headingRule = (
    text: string,
    level: 1 | 2 | 3 | 4 | 5 | 6,
    raw: string,
    slugger: marked.Slugger
  ) => {
    if (level === 1) {
      this.currentTopHeading = this.saveHeading(text, level);
    } else if (level === 2) {
      this.saveHeading(
        text,
        level,
        this.currentTopHeading && this.currentTopHeading.items,
        this.currentTopHeading && this.currentTopHeading.id
      );
    }
    return this.originalHeadingRule(text, level, raw, slugger);
  };

  renderMd(rawText: string, extractHeadings: boolean = false): string {
    const opts = extractHeadings
      ? { renderer: this.headingEnhanceRenderer }
      : undefined;

    const res = marked(rawText.toString(), opts);

    return res;
  }

  extractHeadings(rawText: string): MarkdownHeading[] {
    this.renderMd(rawText, true);
    this.attachHeadingsDescriptions(rawText);
    const res = this.headings;
    this.headings = [];
    return res;
  }
}
