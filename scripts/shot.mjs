// Dev-only: screenshot the dashboard at multiple viewports, capture console
// errors, and audit text contrast. Usage: node scripts/shot.mjs [label]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const URL = process.env.URL || "http://localhost:3217/";
const label = process.argv[2] || "pass";
const OUT = "/tmp/fd";
mkdirSync(OUT, { recursive: true });

const viewports = [
  { name: "desktop", width: 1440, height: 960 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "mobile", width: 390, height: 844 },
];

// sRGB relative luminance + WCAG contrast.
function lum([r, g, b]) {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(a, b) {
  const L1 = lum(a),
    L2 = lum(b);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}
function parseRGB(s) {
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(",").map((x) => parseFloat(x.trim()));
  return { rgb: [p[0], p[1], p[2]], a: p[3] ?? 1 };
}

const browser = await chromium.launch();
const errors = [];

for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`[${vp.name}] ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`[${vp.name}] PAGEERROR ${e.message}`));
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2200); // let reveals + count-ups settle
  await page.screenshot({ path: `${OUT}/${label}-${vp.name}.png`, fullPage: true });
  await ctx.close();
}

// Contrast audit on desktop.
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 960 },
  deviceScaleFactor: 1,
  colorScheme: "dark",
});
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(2200);

const audit = await page.evaluate(() => {
  function effectiveBg(el) {
    let n = el;
    while (n) {
      const c = getComputedStyle(n).backgroundColor;
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const p = m[1].split(",").map((x) => parseFloat(x.trim()));
        if ((p[3] ?? 1) > 0.5) return [p[0], p[1], p[2]];
      }
      n = n.parentElement;
    }
    return [10, 14, 18];
  }
  const out = [];
  const els = document.querySelectorAll(
    "p, span, h1, h2, h3, li, a, div",
  );
  for (const el of els) {
    const txt = el.textContent?.trim();
    if (!txt || el.children.length > 0) continue;
    const cs = getComputedStyle(el);
    const fs = parseFloat(cs.fontSize);
    if (fs < 6) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    out.push({
      text: txt.slice(0, 32),
      color: cs.color,
      bg: effectiveBg(el),
      fontSize: fs,
      weight: cs.fontWeight,
    });
  }
  return out;
});

const fails = [];
for (const e of audit) {
  const fg = parseRGB(e.color);
  if (!fg) continue;
  const r = ratio(fg.rgb, e.bg);
  const isLarge = e.fontSize >= 24 || (e.fontSize >= 18.66 && Number(e.weight) >= 700);
  const min = isLarge ? 3 : 4.5;
  if (r < min) {
    fails.push(
      `${r.toFixed(2)}:1 (need ${min}) "${e.text}" ${Math.round(e.fontSize)}px/${e.weight}`,
    );
  }
}

await browser.close();

console.log(`\nScreens written to ${OUT}/${label}-{desktop,tablet,mobile}.png`);
console.log(`\nConsole errors: ${errors.length}`);
errors.slice(0, 20).forEach((e) => console.log("  " + e));
console.log(`\nContrast failures: ${fails.length}`);
fails.slice(0, 40).forEach((f) => console.log("  " + f));
