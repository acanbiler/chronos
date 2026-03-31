import { marked } from 'marked';

marked.setOptions({ breaks: true });

export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown) as string;
}
