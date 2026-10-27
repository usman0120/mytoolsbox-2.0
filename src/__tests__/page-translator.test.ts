import { afterEach, describe, expect, it } from "vitest";
import { PageTranslator, createTextLookup } from "@/lib/i18n/page-translator";
import { localePath } from "@/lib/i18n/locale-path";

afterEach(() => { document.body.innerHTML = ""; });
const settle = async () => { await new Promise((resolve) => setTimeout(resolve, 0)); };

describe("full-page static catalog translation", () => {
  it("translates body copy and accessibility text, not just headings", () => {
    document.body.innerHTML = '<p>Manage your account</p><input placeholder="Email address" aria-label="Email address" value="My personal input"><button title="Save">Save</button>';
    const translator = new PageTranslator(document.body, { "Manage your account": "Gestiona tu cuenta", "Email address": "Correo electrónico", Save: "Guardar" });
    expect(document.querySelector("p")?.textContent).toBe("Gestiona tu cuenta");
    expect(document.querySelector("input")?.placeholder).toBe("Correo electrónico");
    expect(document.querySelector("input")?.value).toBe("My personal input");
    expect(document.querySelector("button")?.title).toBe("Guardar"); translator.dispose();
  });
  it("handles newly opened tabs and dialogs without inserting wrapper nodes", async () => {
    const translator = new PageTranslator(document.body, { Save: "Guardar", Retry: "Reintentar" });
    const paragraph = document.createElement("p"); paragraph.textContent = "Save"; document.body.append(paragraph);
    const text = paragraph.firstChild; await settle();
    expect(paragraph.textContent).toBe("Guardar"); expect(paragraph.firstChild).toBe(text);
    text!.textContent = "Retry"; await settle(); expect(paragraph.textContent).toBe("Reintentar");
    translator.dispose(); expect(paragraph.textContent).toBe("Retry");
  });
  it("leaves code, output, editable content, and user messages untouched", () => {
    document.body.innerHTML = '<code>Save</code><pre>Save</pre><div data-user-content>Save</div><div contenteditable="true">Save</div><textarea>Save</textarea><p>Save</p>';
    const translator = new PageTranslator(document.body, { Save: "Guardar" });
    expect(document.querySelector("code")?.textContent).toBe("Save");
    expect(document.querySelector("[data-user-content]")?.textContent).toBe("Save");
    expect(document.querySelector("[contenteditable]")?.textContent).toBe("Save");
    expect(document.querySelector("textarea")?.value).toBe("Save");
    expect(document.querySelector("p")?.textContent).toBe("Guardar"); translator.dispose();
  });
  it("preserves runtime variables and handles inherited dictionary keys safely", () => {
    const lookup = createTextLookup({ "Captured __MTB_SLOT_0__ of __MTB_SLOT_1__ frames": "Capturó __MTB_SLOT_0__ de __MTB_SLOT_1__ fotogramas" });
    expect(lookup("Captured 3 of 10 frames")).toBe("Capturó 3 de 10 fotogramas");
    expect(lookup("constructor")).toBe("constructor"); expect(lookup("An unknown string")).toBe("An unknown string");
  });
  it("restores English before switching catalogs and keeps DOM identities", () => {
    document.body.innerHTML = "<p>Save</p>"; const text = document.querySelector("p")!.firstChild;
    const spanish = new PageTranslator(document.body, { Save: "Guardar" }); spanish.dispose();
    const urdu = new PageTranslator(document.body, { Save: "محفوظ کریں" });
    expect(text?.textContent).toBe("محفوظ کریں"); expect(document.querySelector("p")!.firstChild).toBe(text); urdu.dispose();
  });
});
describe("locale navigation", () => {
  it("changes prefixes in both directions while preserving tabs and anchors", () => {
    expect(localePath("/ur/settings?tab=history#recent", "en")).toBe("/settings?tab=history#recent");
    expect(localePath("/es/settings?tab=favorites", "ur")).toBe("/ur/settings?tab=favorites");
    expect(localePath("/", "ar")).toBe("/ar");
  });
});
