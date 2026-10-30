// run_forensic_investigation.mjs
// Automated screenshot & DOM forensic audit for Spidey World levels
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pwPath = 'file:///C:/Users/Bpsdm/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';

const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function run() {
  const { chromium } = await import(pwPath);
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }, // standard mobile phone
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5000 ...');
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });

  // Get all spidey levels
  const spideyLevels = await page.evaluate(async () => {
    const { LEVELS } = await import('./levels.js');
    return LEVELS.filter(l => l.worldId === 'spidey').map(l => ({
      id: l.id,
      title: l.title,
      type: l.type,
      sheetNo: l.sheetNo
    }));
  });

  console.log(`Found ${spideyLevels.length} Spidey levels.`);

  const auditResults = {};

  // Focus list: 14, 16, 18, 19 plus others
  const targetLevels = ['14', '16', '18', '19', '12', '17', '20', '23', '25', '38', '46', '49'];

  for (const lvlMeta of spideyLevels) {
    const lvlId = lvlMeta.id;
    console.log(`\n--- Inspecting Level ${lvlId}: ${lvlMeta.title} (${lvlMeta.type}) ---`);

    await page.evaluate(async (id) => {
      const mod = await import('./app.js');
      mod.App.launchLevel(id);
    }, lvlId);

    await page.waitForTimeout(600);

    const shotPath = path.join(screenshotsDir, `level_${lvlId}.png`);
    await page.screenshot({ path: shotPath, fullPage: true });
    console.log(`Saved screenshot: ${shotPath}`);

    // Detailed forensic extraction for key levels
    if (lvlId === '14') {
      const info = await page.evaluate(() => {
        const leftItems = Array.from(document.querySelectorAll('.hubungkan-col.left-col .hubungkan-item')).map(el => ({
          text: el.innerText.trim(),
          hasSpideyRect: Boolean(el.querySelector('rect[x="36"][y="74"]')),
          hasMaskEllipse: Boolean(el.querySelector('ellipse[rx="36"][ry="42"]')),
          svgHtmlSnippet: el.querySelector('svg')?.outerHTML?.slice(0, 200)
        }));
        const rightItems = Array.from(document.querySelectorAll('.hubungkan-col.right-col .hubungkan-item')).map(el => ({
          text: el.innerText.trim(),
          hasSpideyRect: Boolean(el.querySelector('rect[x="36"][y="74"]')),
          hasMaskEllipse: Boolean(el.querySelector('ellipse[rx="36"][ry="42"]')),
          svgHtmlSnippet: el.querySelector('svg')?.outerHTML?.slice(0, 200)
        }));
        return { leftItems, rightItems };
      });
      auditResults['14'] = info;
    }

    if (lvlId === '16') {
      const info = await page.evaluate(() => {
        const question = document.querySelector('.question-title')?.innerText?.trim();
        const options = Array.from(document.querySelectorAll('.choice-btn')).map((btn, i) => {
          const caption = btn.querySelector('.choice-caption')?.innerText?.trim();
          const hiddenText = btn.querySelector('.choice-text')?.innerText?.trim();
          const svg = btn.querySelector('svg');
          const hasTransform = svg ? svg.getAttribute('transform') || window.getComputedStyle(svg).transform : 'none';
          const innerSvg = svg?.innerHTML?.replace(/\s+/g, ' ').trim();
          return {
            index: i,
            caption,
            hiddenText,
            svgWidth: svg?.getAttribute('width'),
            svgHeight: svg?.getAttribute('height'),
            hasTransform,
            innerSvgHash: innerSvg ? innerSvg.length : 0
          };
        });
        return { question, options };
      });
      auditResults['16'] = info;
    }

    if (lvlId === '18') {
      const info = await page.evaluate(() => {
        const slots = Array.from(document.querySelectorAll('.order-slot')).map(s => s.innerText.trim());
        const buttons = Array.from(document.querySelectorAll('.order-item-btn')).map(b => {
          const label = b.querySelector('.order-label-text')?.innerText?.trim();
          const svg = b.querySelector('svg');
          return {
            label,
            svgWidth: svg?.getAttribute('width'),
            svgHeight: svg?.getAttribute('height'),
            hasSvg: Boolean(svg)
          };
        });
        return { slots, buttons };
      });
      auditResults['18'] = info;
    }

    if (lvlId === '19') {
      const info = await page.evaluate(() => {
        const wrapper = document.querySelector('#dotsCanvasWrapper');
        const overlay = document.querySelector('#revealOverlay');
        const overlayStyle = overlay ? window.getComputedStyle(overlay) : null;
        const dots = Array.from(document.querySelectorAll('.dot-node')).map(d => {
          const rect = d.getBoundingClientRect();
          const style = window.getComputedStyle(d);
          return {
            num: d.innerText.trim(),
            styleLeft: d.style.left,
            styleTop: d.style.top,
            rectX: Math.round(rect.x),
            rectY: Math.round(rect.y),
            rectW: Math.round(rect.width),
            rectH: Math.round(rect.height),
            zIndex: style.zIndex,
            pointerEvents: style.pointerEvents
          };
        });

        // Test click on dot 1
        const dot1 = document.querySelector('.dot-node:first-child');
        const dot1Rect = dot1?.getBoundingClientRect();
        const elementAtDot1 = dot1Rect ? document.elementFromPoint(dot1Rect.x + dot1Rect.width / 2, dot1Rect.y + dot1Rect.height / 2)?.className : 'none';

        return {
          overlayComputed: {
            display: overlayStyle?.display,
            visibility: overlayStyle?.visibility,
            opacity: overlayStyle?.opacity,
            zIndex: overlayStyle?.zIndex,
            pointerEvents: overlayStyle?.pointerEvents
          },
          dots,
          dot1CoveredBy: elementAtDot1
        };
      });
      auditResults['19'] = info;
    }
  }

  await browser.close();

  const reportPath = path.join(__dirname, 'screenshots', 'audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2), 'utf8');
  console.log('\nInvestigation completed! Report saved to:', reportPath);
}

run().catch(console.error);
