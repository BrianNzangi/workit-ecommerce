import { buildBaseHtml } from './templates/base';

interface RenderEmailOptions {
  previewText?: string;
  body: string;
}

export function renderEmail({ previewText, body }: RenderEmailOptions): string {
  return buildBaseHtml({ previewText, children: body });
}
