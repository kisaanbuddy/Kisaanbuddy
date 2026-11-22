/** Explicitly safe field targets; credentials and arbitrary controls are excluded. */
export function safeFields(): (HTMLInputElement | HTMLTextAreaElement)[] {
  return Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      "main input, main textarea",
    ),
  ).filter(
    (el) =>
      !el.disabled &&
      !el.readOnly &&
      el.getClientRects().length > 0 &&
      (el instanceof HTMLTextAreaElement ||
        ["text", "search"].includes(el.type)) &&
      !/password|otp|secret|token|code|phone|email|card|account/i.test(
        `${el.name} ${el.id} ${el.autocomplete} ${el.placeholder}`,
      ),
  );
}
export function findField(name: string) {
  const patterns: Record<string, RegExp> = {
    name: /name|नाम/i,
    village: /village|गांव|गाँव/i,
    crop: /crop|फसल/i,
  };
  return safeFields().find((el) =>
    patterns[name]?.test(
      `${el.name} ${el.id} ${el.placeholder} ${el.getAttribute("aria-label")} ${Array.from(
        el.labels || [],
      )
        .map((l) => l.textContent)
        .join(" ")}`,
    ),
  );
}
export function fillField(
  el: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) {
  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.focus();
}
export function readablePage(): string {
  const main = document.querySelector("main");
  if (!main) return "";
  return Array.from(main.querySelectorAll("h1,h2,h3,p,li,th,td"))
    .filter(
      (el) =>
        el.getClientRects().length > 0 &&
        !el.closest('nav,form,[aria-hidden="true"],[data-voice-private]'),
    )
    .map((el) => el.textContent?.trim())
    .filter(Boolean)
    .join(". ")
    .slice(0, 6000);
}
