// Rehype fixes for the docs Markdown (spec 0024 AC-12: Lighthouse and axe clean on the docs pages).
// - Images served from public/ (`/images/docs/...`) get their real width and height, so the page keeps their
//   space before they load (Starlight's `height: auto` then scales them). Without it the phone page shifts
//   0.24 as its screenshots arrive.
// - Tables get `tabindex="0"`: Starlight makes a wide table scroll sideways, and axe's
//   scrollable-region-focusable needs a keyboard user to be able to reach and scroll it.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { imageSize } from "image-size";
import { visit } from "unist-util-visit";

type Element = {
  type: "element";
  tagName: string;
  properties?: Record<string, unknown>;
};

const PUBLIC_DIR = join(process.cwd(), "public");

function publicImageSize(src: string): { width: number; height: number } | null {
  if (!src.startsWith("/") || src.startsWith("//")) return null;
  try {
    const path = join(PUBLIC_DIR, decodeURI(src.split(/[?#]/)[0]));
    const { width, height } = imageSize(readFileSync(path));
    return width && height ? { width, height } : null;
  } catch {
    return null;
  }
}

export default function rehypeDocsContent() {
  return (tree: unknown) => {
    visit(tree as never, "element", (node: Element) => {
      const properties = (node.properties ??= {});
      if (node.tagName === "img" && properties.width == null && properties.height == null) {
        const size = publicImageSize(String(properties.src ?? ""));
        if (size) {
          properties.width = size.width;
          properties.height = size.height;
        }
      }
      if (node.tagName === "table" && properties.tabIndex == null) {
        properties.tabIndex = 0;
      }
    });
  };
}
