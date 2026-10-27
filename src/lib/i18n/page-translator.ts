// Only mutate existing text-node data and textual accessibility attributes.
// Never insert/remove DOM nodes, translate form values, or contact a provider.
export type TextCatalog = Record<string, string>;
const EXCLUDED = "[translate='no'],[data-user-content],[data-no-translate],[contenteditable],textarea,input,pre,code,script,style,svg,canvas,iframe";
const ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"];
const TECHNICAL_NAMES = new Set(["MyToolsBox", "Google", "Firebase", "JSON", "HTML", "CSS", "PDF", "CSV", "XML", "PNG", "JPEG", "MP3", "WAV", "WebM", "TypeScript", "JavaScript"]);
const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function createTextLookup(catalog: TextCatalog) {
  const patterns = Object.entries(catalog).filter(([source]) => source.includes("__MTB_SLOT_") && !source.startsWith("__MTB_SLOT_")).map(([source, target]) => {
    const slots = source.match(/__MTB_SLOT_\d+__/g) ?? [];
    const parts = source.split(/__MTB_SLOT_\d+__/g);
    return { prefix: parts[0], slots, target, pattern: new RegExp("^" + parts.map(escapeRegex).join("(.+?)") + "$") };
  });
  return (value: string): string => {
    const source = normalize(value);
    if (TECHNICAL_NAMES.has(source)) return value;
    let translated = Object.hasOwn(catalog, source) ? catalog[source] : undefined;
    if (!translated) {
      for (const item of patterns) {
        if (!source.startsWith(item.prefix)) continue;
        const match = item.pattern.exec(source);
        if (match) { let result = item.target; item.slots.forEach((slot, i) => { result = result.replaceAll(slot, match[i + 1]); }); translated = result; break; }
      }
    }
    if (!translated || translated === source) return value;
    return (value.match(/^\s*/)?.[0] ?? "") + translated + (value.match(/\s*$/)?.[0] ?? "");
  };
}

export class PageTranslator {
  private texts = new Map<Text, { original: string; applied: string }>();
  private attributes = new Map<Element, Map<string, { original: string; applied: string }>>();
  private observer: MutationObserver;
  private pending = new Set<Node>();
  private scheduled = false;
  private active = true;
  private lookup: ReturnType<typeof createTextLookup>;

  constructor(private root: HTMLElement, catalog: TextCatalog) {
    this.lookup = createTextLookup(catalog);
    this.observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "childList") record.addedNodes.forEach((node) => this.pending.add(node));
        else this.pending.add(record.target);
      }
      if (!this.scheduled) {
        this.scheduled = true;
        queueMicrotask(() => { this.scheduled = false; if (this.active) { const nodes = [...this.pending]; this.pending.clear(); nodes.forEach((node) => this.scan(node)); } });
      }
    });
    this.scan(root);
    this.observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTES });
  }
  private text(node: Text) {
    if (node.parentElement?.closest(EXCLUDED)) return;
    const previous = this.texts.get(node);
    // An observed write of our own output is not a new source string.
    if (previous?.applied === node.data) return;
    const original = node.data;
    const applied = this.lookup(original);
    if (applied !== original) { this.texts.set(node, { original, applied }); node.data = applied; }
    else this.texts.delete(node);
  }
  private element(element: Element) {
    if (element.closest("[translate='no'],[data-user-content],[data-no-translate],pre,code,script,style,svg,canvas,iframe")) return;
    for (const name of ATTRIBUTES) {
      const original = element.getAttribute(name);
      if (!original || this.attributes.get(element)?.get(name)?.applied === original) continue;
      const applied = this.lookup(original);
      if (applied !== original) {
        if (!this.attributes.has(element)) this.attributes.set(element, new Map());
        this.attributes.get(element)!.set(name, { original, applied }); element.setAttribute(name, applied);
      } else this.attributes.get(element)?.delete(name);
    }
  }
  private scan(node: Node) {
    if (!node.isConnected) return;
    if (node.nodeType === Node.TEXT_NODE) { this.text(node as Text); return; }
    if (node instanceof Element && node.closest(EXCLUDED) && !node.matches("input,textarea")) return;
    if (node instanceof Element) this.element(node);
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: (child) => child instanceof Element && child.matches(EXCLUDED) && !child.matches("input,textarea") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    while (walker.nextNode()) {
      if (walker.currentNode instanceof Text) this.text(walker.currentNode);
      else if (walker.currentNode instanceof Element) this.element(walker.currentNode);
    }
    // Do not retain removed dialogs, routes, or messages indefinitely.
    for (const text of this.texts.keys()) if (!text.isConnected) this.texts.delete(text);
    for (const element of this.attributes.keys()) if (!element.isConnected) this.attributes.delete(element);
  }
  dispose() {
    this.active = false; this.observer.disconnect(); this.pending.clear();
    for (const [node, value] of this.texts) if (node.isConnected && node.data === value.applied) node.data = value.original;
    for (const [element, attributes] of this.attributes) for (const [name, value] of attributes) {
      if (element.isConnected && element.getAttribute(name) === value.applied) element.setAttribute(name, value.original);
    }
    this.texts.clear(); this.attributes.clear();
  }
}
