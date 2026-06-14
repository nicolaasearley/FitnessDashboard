import { chromium } from "playwright";

const b = await chromium.launch();

// Reduced motion: content must be fully visible (reveals must not gate content).
const rm = await b.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
  colorScheme: "dark",
  reducedMotion: "reduce",
});
const rmp = await rm.newPage();
await rmp.goto("http://localhost:3217/", { waitUntil: "networkidle" });
await rmp.waitForTimeout(800);
// Any reveal still hidden? (opacity ~0)
const hidden = await rmp.evaluate(() => {
  const els = Array.from(document.querySelectorAll(".reveal"));
  return els.filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.9).length;
});
await rmp.screenshot({ path: "/tmp/fd/reduced-motion.png", clip: { x: 60, y: 0, width: 1320, height: 520 } });
console.log("Reduced-motion reveals still hidden:", hidden);
await rm.close();

// Keyboard focus: tab to first nav link, capture focus ring.
const kb = await b.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, colorScheme: "dark" });
const kbp = await kb.newPage();
await kbp.goto("http://localhost:3217/", { waitUntil: "networkidle" });
await kbp.waitForTimeout(1800);
await kbp.keyboard.press("Tab");
await kbp.keyboard.press("Tab");
const active = await kbp.evaluate(() => {
  const a = document.activeElement;
  return a ? `${a.tagName} ${(a.getAttribute("href") || a.textContent || "").slice(0, 30)}` : "none";
});
console.log("Focused after 2x Tab:", active);
await kbp.screenshot({ path: "/tmp/fd/focus.png", clip: { x: 0, y: 0, width: 400, height: 600 } });
await kb.close();

await b.close();
