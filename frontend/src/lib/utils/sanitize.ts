import DOMPurify from "dompurify";

export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ["target", "rel"],
    ALLOWED_TAGS: [
      "a", "b", "br", "code", "div", "em", "h1", "h2", "h3", "h4", "h5", "h6",
      "hr", "i", "img", "li", "ol", "p", "pre", "span", "strong", "table",
      "tbody", "td", "th", "thead", "tr", "ul", "blockquote", "cite", "del",
      "ins", "mark", "q", "s", "sub", "sup", "u", "dl", "dt", "dd",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "src", "alt", "class", "id", "style", "title",
      "width", "height", "border", "colspan", "rowspan", "align",
    ],
    ALLOW_DATA_ATTR: false,
  });
}
