# tests/test_wcag_contrast_audit.py
import os
import sys
import time
import json
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

PORT = 8129
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
ROOT_DIR = r"E:\Coding\GameAnak"

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def run_server():
    server = HTTPServer(("127.0.0.1", PORT), QuietHandler)
    server.serve_forever()

def main():
    os.chdir(ROOT_DIR)
    t = threading.Thread(target=run_server, daemon=True)
    t.start()
    time.sleep(1)

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROME_PATH, headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1024, "height": 768})
        page.goto(f"http://127.0.0.1:{PORT}/index.html")
        page.wait_for_load_state("networkidle")

        audit_script = """() => {
            // Helper to parse rgb/rgba string
            function parseColor(str) {
                if (!str || str === 'transparent') return null;
                const m = str.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
                if (!m) return null;
                return {
                    r: parseInt(m[1], 10),
                    g: parseInt(m[2], 10),
                    b: parseInt(m[3], 10),
                    a: m[4] !== undefined ? parseFloat(m[4]) : 1.0
                };
            }

            // Alpha blend c_top over c_bottom
            function blend(c_top, c_bottom) {
                if (!c_top) return c_bottom;
                if (c_top.a >= 1.0) return c_top;
                const a = c_top.a + c_bottom.a * (1 - c_top.a);
                const r = Math.round((c_top.r * c_top.a + c_bottom.r * c_bottom.a * (1 - c_top.a)) / a);
                const g = Math.round((c_top.g * c_top.a + c_bottom.g * c_bottom.a * (1 - c_top.a)) / a);
                const b = Math.round((c_top.b * c_top.a + c_bottom.b * c_bottom.a * (1 - c_top.a)) / a);
                return { r, g, b, a };
            }

            // Find effective background color by traversing up
            function getEffectiveBg(el) {
                let curr = el;
                let bgStack = [];
                while (curr && curr !== document) {
                    const cs = window.getComputedStyle(curr);
                    const parsed = parseColor(cs.backgroundColor);
                    if (parsed && parsed.a > 0) {
                        bgStack.unshift(parsed);
                        if (parsed.a >= 1.0) break;
                    }
                    curr = curr.parentElement;
                }
                let finalBg = { r: 255, g: 249, b: 240, a: 1.0 }; // --bg-warm default
                for (const c of bgStack) {
                    finalBg = blend(c, finalBg);
                }
                return finalBg;
            }

            function relativeLuminance(rgb) {
                const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
                    const s = val / 255;
                    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
                });
                return 0.2126 * r + 0.7152 * g + 0.0722 * b;
            }

            function contrastRatio(rgb1, rgb2) {
                const l1 = relativeLuminance(rgb1);
                const l2 = relativeLuminance(rgb2);
                const lighter = Math.max(l1, l2);
                const darker = Math.min(l1, l2);
                return (lighter + 0.05) / (darker + 0.05);
            }

            const items = [];
            const all = document.querySelectorAll('*');
            for (const el of all) {
                if (el.offsetParent === null && !el.getClientRects().length) continue;
                // Check if element has direct text
                let hasDirectText = false;
                for (const n of el.childNodes) {
                    if (n.nodeType === Node.TEXT_NODE && n.nodeValue.trim().length > 0) {
                        hasDirectText = true;
                        break;
                    }
                }
                if (!hasDirectText) continue;

                const text = el.textContent.trim().replace(/\\s+/g, ' ');
                if (!text || text.length === 0) continue;

                const cs = window.getComputedStyle(el);
                const fg = parseColor(cs.color) || { r: 30, g: 41, b: 59, a: 1 };
                const bg = getEffectiveBg(el);
                const fontSize = parseFloat(cs.fontSize);
                const fontWeight = parseInt(cs.fontWeight, 10) || 400;
                // WCAG 2.1 definition of Large Text: >= 18pt (24px) or >= 14pt (18.66px) bold (>= 700)
                const isLarge = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
                const ratio = contrastRatio(fg, bg);
                const minRatio = isLarge ? 3.0 : 4.5;
                const passesAA = ratio >= minRatio;
                const passesAAA = ratio >= (isLarge ? 4.5 : 7.0);

                items.push({
                    text: text.slice(0, 30),
                    tag: el.tagName,
                    id: el.id,
                    className: el.className,
                    fontSize: fontSize + 'px',
                    fontWeight,
                    isLarge,
                    fg: `rgb(${fg.r},${fg.g},${fg.b})`,
                    bg: `rgb(${bg.r},${bg.g},${bg.b})`,
                    ratio: Math.round(ratio * 100) / 100,
                    minRatio,
                    passesAA,
                    passesAAA
                });
            }
            return items;
        }"""

        # Audit Worlds View
        page.evaluate("() => { if (window.app) window.app.showWorldsView(); }")
        page.wait_for_timeout(300)
        items_worlds = page.evaluate(audit_script)
        fails_worlds = [it for it in items_worlds if not it['passesAA']]
        print(f"Worlds View: {len(items_worlds)} text elements, {len(fails_worlds)} failing WCAG AA")
        for f in fails_worlds:
            print(f"  FAIL: '{f['text']}' [{f['tag']} .{f['className']}] ratio={f['ratio']}:1 (min {f['minRatio']}:1), fg={f['fg']}, bg={f['bg']}")

        # Audit Levels View (Hewan)
        page.evaluate("() => { if (window.app) window.app.selectWorld('hewan'); }")
        page.wait_for_timeout(300)
        items_levels = page.evaluate(audit_script)
        fails_levels = [it for it in items_levels if not it['passesAA']]
        print(f"Levels View: {len(items_levels)} text elements, {len(fails_levels)} failing WCAG AA")
        for f in fails_levels:
            print(f"  FAIL: '{f['text']}' [{f['tag']} .{f['className']}] ratio={f['ratio']}:1 (min {f['minRatio']}:1), fg={f['fg']}, bg={f['bg']}")

        # Audit Certificate Modal
        page.evaluate("() => { if (window.app) window.app.openCertificateModal(); }")
        page.wait_for_timeout(300)
        items_cert = page.evaluate(audit_script)
        fails_cert = [it for it in items_cert if not it['passesAA']]
        print(f"Certificate Modal: {len(items_cert)} text elements, {len(fails_cert)} failing WCAG AA")
        for f in fails_cert:
            print(f"  FAIL: '{f['text']}' [{f['tag']} .{f['className']}] ratio={f['ratio']}:1 (min {f['minRatio']}:1), fg={f['fg']}, bg={f['bg']}")
        page.evaluate("() => { document.getElementById('modalCertificate').style.display = 'none'; }")

        # Audit Parent Gate Modal
        page.evaluate("() => { if (window.app) window.app.openParentalGateModal(); }")
        page.wait_for_timeout(300)
        items_gate = page.evaluate(audit_script)
        fails_gate = [it for it in items_gate if not it['passesAA']]
        print(f"Parent Gate Modal: {len(items_gate)} text elements, {len(fails_gate)} failing WCAG AA")
        for f in fails_gate:
            print(f"  FAIL: '{f['text']}' [{f['tag']} .{f['className']}] ratio={f['ratio']}:1 (min {f['minRatio']}:1), fg={f['fg']}, bg={f['bg']}")
        page.evaluate("() => { document.getElementById('modalParent').style.display = 'none'; }")

        # Audit Game Engines (sample levels)
        levels_to_test = [
            {"engine": "hubungkan", "id": "01"},
            {"engine": "labirin", "id": "02"},
            {"engine": "pilih", "id": "04"},
            {"engine": "titik", "id": "09"},
            {"engine": "tebalkan", "id": "53"},
            {"engine": "mewarnai", "id": "11"},
            {"engine": "urutkan", "id": "18"},
            {"engine": "panah", "id": "58"},
            {"engine": "memori", "id": "38"}
        ]
        total_engine_fails = []
        for l in levels_to_test:
            page.evaluate(f"() => {{ if (window.app) window.app.launchLevel('{l['id']}'); }}")
            page.wait_for_timeout(200)
            items_g = page.evaluate(audit_script)
            fails_g = [it for it in items_g if not it['passesAA']]
            if fails_g:
                print(f"Engine {l['engine']} (Lvl {l['id']}): {len(fails_g)} failing WCAG AA")
                for f in fails_g:
                    print(f"  FAIL: '{f['text']}' [{f['tag']} .{f['className']}] ratio={f['ratio']}:1 (min {f['minRatio']}:1), fg={f['fg']}, bg={f['bg']}")
                total_engine_fails.extend(fails_g)

        browser.close()

if __name__ == "__main__":
    main()
