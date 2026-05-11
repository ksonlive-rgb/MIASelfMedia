import html2canvas from "html2canvas";

export interface ReportCaptureOptions {
  element: HTMLElement;
  /** 文件名（可不带后缀，最终为 `.png`） */
  fileName: string;
  backgroundColor?: string;
  scale?: number;
}

/** html2canvas 1.x 无法解析的现代色彩函数（会出现在 Tailwind 等全局 CSS 中）。 */
const MODERN_COLOR_FUNC_RE = /\b(?:lab|oklab|lch|oklch|color-mix)\(/i;

function computedValueHasModernColorFunc(value: string): boolean {
  if (!value || value === "none") return false;
  return MODERN_COLOR_FUNC_RE.test(value);
}

function isSafeForHtml2CanvasColor(value: string): boolean {
  if (!value) return true;
  return !MODERN_COLOR_FUNC_RE.test(value);
}

const COLORISH_CSS_PROP = new Set([
  "color",
  "background-color",
  "background-image",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "outline-color",
  "box-shadow",
  "text-shadow",
  "text-decoration-color",
  "-webkit-text-fill-color",
  "caret-color",
  "column-rule-color",
  "filter",
  "backdrop-filter",
  "list-style-image",
]);

const CLONE_INLINE_PROPS: readonly string[] = [
  "display",
  "box-sizing",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "z-index",
  "float",
  "clear",
  "width",
  "height",
  "min-width",
  "max-width",
  "min-height",
  "max-height",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-style",
  "border-right-style",
  "border-bottom-style",
  "border-left-style",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "border-radius",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
  "overflow",
  "overflow-x",
  "overflow-y",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-transform",
  "white-space",
  "word-break",
  "word-wrap",
  "vertical-align",
  "color",
  "background-color",
  "background-image",
  "background-size",
  "background-position",
  "background-repeat",
  "background-attachment",
  "background-clip",
  "background-origin",
  "flex-direction",
  "flex-wrap",
  "justify-content",
  "align-items",
  "align-content",
  "align-self",
  "flex",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "gap",
  "row-gap",
  "column-gap",
  "grid-template-columns",
  "grid-template-rows",
  "grid-auto-columns",
  "grid-auto-rows",
  "grid-auto-flow",
  "grid-column",
  "grid-row",
  "grid-area",
  "justify-items",
  "justify-self",
  "place-items",
  "place-content",
  "opacity",
  "visibility",
  "box-shadow",
  "text-shadow",
  "outline-width",
  "outline-style",
  "outline-color",
  "outline-offset",
  "object-fit",
  "object-position",
  "transform",
  "transform-origin",
  "filter",
  "backdrop-filter",
  "text-decoration-line",
  "text-decoration-style",
  "text-decoration-color",
  "text-decoration-thickness",
  "-webkit-text-fill-color",
  "caret-color",
  "column-rule-width",
  "column-rule-style",
  "column-rule-color",
  "list-style-type",
  "list-style-position",
  "list-style-image",
  "table-layout",
  "border-collapse",
  "border-spacing",
  "caption-side",
];

const PRI = "important";

/** 仅在显式几何/文本节点上写 fill/stroke，避免根 &lt;svg&gt; / &lt;g&gt; 误伤整图。 */
const SVG_FILL_STROKE_TAGS = new Set([
  "path",
  "circle",
  "rect",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "textpath",
  "use",
]);

/**
 * 去掉 Tailwind class，把原节点计算样式写入克隆内联（截图前保版式）。
 * 使用页面真实节点的 getComputedStyle(original)，不依赖克隆文档里的 &lt;style&gt;。
 */
function prepareCloneSubtreeForHtml2Canvas(original: Element, clone: Element): void {
  if (original instanceof HTMLElement && clone instanceof HTMLElement) {
    clone.removeAttribute("class");
    clone.removeAttribute("style");

    const cs = window.getComputedStyle(original);
    const s = clone.style;

    for (const prop of CLONE_INLINE_PROPS) {
      const raw = cs.getPropertyValue(prop);
      const val = raw.trim();
      if (!val) continue;

      const colorish = COLORISH_CSS_PROP.has(prop);
      if (colorish) {
        if (!isSafeForHtml2CanvasColor(val)) continue;
        if (
          (prop === "background-image" ||
            prop === "box-shadow" ||
            prop === "text-shadow" ||
            prop === "filter" ||
            prop === "backdrop-filter" ||
            prop === "list-style-image") &&
          val === "none"
        ) {
          continue;
        }
      }

      s.setProperty(prop, val);
    }

    if (original instanceof HTMLCanvasElement && clone instanceof HTMLCanvasElement) {
      try {
        const w = original.width;
        const h = original.height;
        clone.width = w;
        clone.height = h;
        const cctx = clone.getContext("2d");
        if (cctx) {
          cctx.drawImage(original, 0, 0);
        }
      } catch {
        /* 忽略 taint 等 */
      }
    }
  }

  if (original instanceof SVGElement && clone instanceof SVGElement) {
    clone.removeAttribute("class");

    const cs = window.getComputedStyle(original);
    const fill = cs.fill;
    if (fill && fill !== "none" && isSafeForHtml2CanvasColor(fill)) {
      clone.setAttribute("fill", fill);
    }
    const stroke = cs.stroke;
    if (stroke && stroke !== "none" && isSafeForHtml2CanvasColor(stroke)) {
      clone.setAttribute("stroke", stroke);
    }
    const stopColor = cs.getPropertyValue("stop-color").trim();
    if (stopColor && isSafeForHtml2CanvasColor(stopColor)) {
      clone.setAttribute("stop-color", stopColor);
    }
  }

  const oLen = original.children.length;
  const cLen = clone.children.length;
  const n = Math.min(oLen, cLen);
  for (let i = 0; i < n; i++) {
    prepareCloneSubtreeForHtml2Canvas(original.children[i], clone.children[i]);
  }
}

function elementNeedsMonochromeFallback(el: Element, cs: CSSStyleDeclaration): boolean {
  if (
    computedValueHasModernColorFunc(cs.color) ||
    computedValueHasModernColorFunc(cs.backgroundColor)
  ) {
    return true;
  }
  if (
    computedValueHasModernColorFunc(cs.borderTopColor) ||
    computedValueHasModernColorFunc(cs.borderRightColor) ||
    computedValueHasModernColorFunc(cs.borderBottomColor) ||
    computedValueHasModernColorFunc(cs.borderLeftColor)
  ) {
    return true;
  }
  const bgi = cs.backgroundImage;
  if (bgi && bgi !== "none" && computedValueHasModernColorFunc(bgi)) {
    return true;
  }

  if (el instanceof SVGElement) {
    if (computedValueHasModernColorFunc(cs.fill) || computedValueHasModernColorFunc(cs.stroke)) {
      return true;
    }
    const sc = cs.getPropertyValue("stop-color").trim();
    if (sc && computedValueHasModernColorFunc(sc)) return true;
  }

  return false;
}

/**
 * 在仍带有全局 &lt;style&gt; 时，用克隆文档的 getComputedStyle 检测是否混入 lab()/oklch() 等；
 * 若该节点任意相关计算值含现代色彩函数，则强制写入安全内联色（牺牲彩度换不崩溃）。
 */
function scrubCloneSubtreeUsingComputedStyle(
  clonedRoot: HTMLElement,
  clonedDocument: Document,
): void {
  const view = clonedDocument.defaultView ?? window;
  const nodes: Element[] = [clonedRoot, ...clonedRoot.querySelectorAll("*")];

  for (const el of nodes) {
    const cs = view.getComputedStyle(el);
    if (!elementNeedsMonochromeFallback(el, cs)) continue;

    if (el instanceof HTMLElement) {
      el.style.setProperty("color", "#000000", PRI);
      el.style.setProperty("background-color", "#ffffff", PRI);
      el.style.setProperty("background-image", "none", PRI);
      el.style.setProperty("border-top-color", "#000000", PRI);
      el.style.setProperty("border-right-color", "#000000", PRI);
      el.style.setProperty("border-bottom-color", "#000000", PRI);
      el.style.setProperty("border-left-color", "#000000", PRI);
    }

    if (el instanceof SVGElement) {
      el.removeAttribute("style");
      const tag = el.tagName.toLowerCase();
      if (tag === "stop") {
        el.setAttribute("stop-color", "#000000");
      } else if (SVG_FILL_STROKE_TAGS.has(tag)) {
        el.setAttribute("fill", "#000000");
        el.setAttribute("stroke", "#000000");
      }
    }
  }
}

/** 删除克隆文档中的全局样式，避免 html2canvas 解析 Tailwind 里含 lab() 的 CSS 文本。 */
function removeAllStyleTagsFromClonedDocument(doc: Document): void {
  doc.querySelectorAll("style").forEach((node) => {
    node.parentNode?.removeChild(node);
  });
}

/** 将报告 DOM 导出为一张 PNG 长图（适合手机保存到相册）。 */
export async function downloadReportImage({
  element,
  fileName,
  backgroundColor = "#18181b",
  scale = 2,
}: ReportCaptureOptions): Promise<void> {
  const canvas = await html2canvas(element, {
    scale,
    backgroundColor,
    logging: false,
    useCORS: true,
    onclone(clonedDocument, clonedElement) {
      prepareCloneSubtreeForHtml2Canvas(element, clonedElement);
      scrubCloneSubtreeUsingComputedStyle(clonedElement, clonedDocument);
      removeAllStyleTagsFromClonedDocument(clonedDocument);
    },
  });

  const imgData = canvas.toDataURL("image/png");
  const base = fileName.replace(/\.(pdf|png)$/i, "").trim() || "report";
  const name = `${base}.png`;

  const link = document.createElement("a");
  link.download = name;
  link.href = imgData;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
