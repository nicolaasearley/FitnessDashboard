import { chromium } from "playwright";
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 2, colorScheme: "dark" });
const p = await c.newPage();
await p.goto("http://localhost:3217/", { waitUntil: "networkidle" });
await p.waitForTimeout(1800);

// Expand the marquee run (Forest City HM has best-effort splits) + the 5K TT.
const targets = ["Forest City Road Race HM", "5K TT at the Track"];
for (const t of targets) {
  const el = p.locator(`button:has-text("${t}")`).first();
  if (await el.count()) await el.click();
}
await p.waitForTimeout(700);
const actBox = await p.locator("#activity").boundingBox();
if (actBox)
  await p.screenshot({
    path: "/tmp/fd/expanded-session.png",
    clip: { x: actBox.x, y: actBox.y, width: actBox.width, height: Math.min(actBox.height, 900) },
  });

// Expand a PR card (5 K).
const pr = p.locator('#records button:has-text("5 K")').first();
if (await pr.count()) await pr.click();
await p.waitForTimeout(600);
const recBox = await p.locator("#records").boundingBox();
if (recBox)
  await p.screenshot({
    path: "/tmp/fd/expanded-pr.png",
    clip: { x: recBox.x, y: recBox.y, width: recBox.width, height: Math.min(recBox.height, 600) },
  });

console.log("interaction shots done");
await b.close();
