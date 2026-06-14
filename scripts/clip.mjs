import { chromium } from "playwright";

const clips = JSON.parse(process.argv[2] || "[]");
const b = await chromium.launch();
const c = await b.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
  colorScheme: "dark",
});
const p = await c.newPage();
await p.goto("http://localhost:3217/", { waitUntil: "networkidle" });
await p.waitForTimeout(2200);
for (const cl of clips) {
  await p.screenshot({ path: `/tmp/fd/${cl.name}.png`, clip: cl });
}
await b.close();
console.log("clips done:", clips.map((c) => c.name).join(", "));
