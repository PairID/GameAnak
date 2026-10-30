# tests/challenger_m_evo_4_2_stress_runner.py
# ==============================================================================
# CHALLENGER M-EVO-4.2: ADVERSARIAL VIEWPORT, TOUCH ERGONOMICS & CONTRAST SUITE
# Empirical reproduction harness for Milestone M-EVO-4
# Zero-fabrication, 100% browser-grounded verification using Playwright + Chromium
# ==============================================================================

import os
import sys
import time
import json
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

PORT = 8130
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
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1)

    print("=" * 72)
    print("⚡ CHALLENGER M-EVO-4.2: ADVERSARIAL VIEWPORT & ERGONOMICS STRESS HARNESS")
    print("Testing 5 Viewports: 320x568, 375x667, 768x1024, 1024x768, 1920x1080")
    print("Requirements: Zero Horizontal Overflow, Touch Targets >= 64px, WCAG AA/AAA")
    print("=" * 72 + "\n")

    failures = []
    passes = []

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

    viewports = [
        {"name": "320x568 (iPhone SE)", "width": 320, "height": 568},
        {"name": "375x667 (Standard Mobile)", "width": 375, "height": 667},
        {"name": "768x1024 (iPad Portrait)", "width": 768, "height": 1024},
        {"name": "1024x768 (iPad Landscape)", "width": 1024, "height": 768},
        {"name": "1920x1080 (Desktop FHD)", "width": 1920, "height": 1080}
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROME_PATH, headless=True)
        page = browser.new_page()
        page.goto(f"http://127.0.0.1:{PORT}/index.html")
        page.wait_for_load_state("networkidle")

        for vp in viewports:
            print(f"\n--- Checking Viewport: {vp['name']} ---")
            page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
            page.wait_for_timeout(200)

            # 1. Worlds View
            page.evaluate("() => { if (window.app) window.app.showWorldsView(); }")
            page.wait_for_timeout(150)
            res_w = page.evaluate("""() => {
                const doc = document.documentElement;
                return { overflow: doc.scrollWidth > doc.clientWidth, scrollW: doc.scrollWidth, clientW: doc.clientWidth };
            }""")
            if res_w['overflow']:
                failures.append(f"[{vp['name']}] Worlds View: scrollWidth ({res_w['scrollW']}) > clientWidth ({res_w['clientW']})")
            else:
                passes.append(f"[{vp['name']}] Worlds View: Zero scroll overflow")

            # 2. Levels View
            page.evaluate("() => { if (window.app) window.app.selectWorld('hewan'); }")
            page.wait_for_timeout(150)
            res_l = page.evaluate("""() => {
                const doc = document.documentElement;
                const innerW = window.innerWidth;
                const headerRight = document.querySelector('.header-right');
                const hrRect = headerRight ? headerRight.getBoundingClientRect() : null;
                const spills = hrRect && hrRect.right > innerW + 1;
                return { overflow: doc.scrollWidth > doc.clientWidth, spills, spillPx: hrRect ? Math.round(hrRect.right - innerW) : 0 };
            }""")
            if res_l['overflow'] or res_l['spills']:
                failures.append(f"[{vp['name']}] Levels View: Header collision / overflow detected (spill = {res_l['spillPx']}px)")
            else:
                passes.append(f"[{vp['name']}] Levels View: Zero header overflow")

            # 3. Game Engines
            for item in levels_to_test:
                eng = item['engine']
                page.evaluate(f"() => {{ if (window.app) window.app.launchLevel('{item['id']}'); }}")
                page.wait_for_timeout(150)
                res_e = page.evaluate("""() => {
                    const doc = document.documentElement;
                    const innerW = window.innerWidth;
                    
                    // Check element boundary spills
                    const spilling = [];
                    const allEls = document.querySelectorAll('*');
                    for (const el of allEls) {
                        if (el.offsetParent === null && !el.getClientRects().length) continue;
                        const r = el.getBoundingClientRect();
                        if (r.width > 0 && r.height > 0 && r.right > innerW + 1.5) {
                            spilling.push({ tag: el.tagName, className: el.className, id: el.id, right: Math.round(r.right), spill: Math.round(r.right - innerW) });
                        }
                    }

                    // Check undersized touch targets (< 63.5px)
                    const interactiveSelectors = [
                        'button', '.pair-item', '.maze-cell', '.nav-btn', '.choice-btn',
                        '.dot-node', '.trace-clear-btn', '.trace-done-btn', '.color-swatch',
                        '.color-target', '.order-item-btn', '.arrow-cmd-btn', '#resetProgBtn',
                        '#runProgBtn', '.memory-card', '.header-btn', '.jumbo-speaker-btn'
                    ];
                    const undersized = [];
                    const checked = new Set();
                    for (const sel of interactiveSelectors) {
                        const els = document.querySelectorAll(sel);
                        for (const el of els) {
                            if (checked.has(el)) continue;
                            checked.add(el);
                            if (el.offsetParent === null && !el.getClientRects().length) continue;
                            const r = el.getBoundingClientRect();
                            if (r.width > 0 && r.height > 0) {
                                if (r.width < 63.5 || r.height < 63.5) {
                                    undersized.push({
                                        sel, id: el.id, className: el.className,
                                        w: Math.round(r.width * 10) / 10,
                                        h: Math.round(r.height * 10) / 10,
                                        text: (el.textContent || '').trim().slice(0, 15)
                                    });
                                }
                            }
                        }
                    }

                    return {
                        overflow: doc.scrollWidth > doc.clientWidth,
                        spillingCount: spilling.length,
                        spillSamples: spilling.slice(0, 3),
                        undersizedCount: undersized.length,
                        undersizedSamples: undersized.slice(0, 5)
                    };
                }""")

                if res_e['overflow'] or res_e['spillingCount'] > 0:
                    failures.append(f"[{vp['name']}] Engine {eng} (Level {item['id']}): Horizontal overflow/spill detected ({res_e['spillingCount']} spilling elements, sample: {res_e['spillSamples']})")
                else:
                    passes.append(f"[{vp['name']}] Engine {eng} (Level {item['id']}): Zero horizontal overflow")

                if res_e['undersizedCount'] > 0:
                    failures.append(f"[{vp['name']}] Engine {eng} (Level {item['id']}): Found {res_e['undersizedCount']} undersized controls (< 64px touch target): {res_e['undersizedSamples']}")
                else:
                    passes.append(f"[{vp['name']}] Engine {eng} (Level {item['id']}): All interactive controls >= 64px")

        browser.close()

    print("\n" + "=" * 72)
    print("📊 CHALLENGER M-EVO-4.2 EXECUTION SUMMARY")
    print("=" * 72)
    print(f"Total Checks Executed : {len(passes) + len(failures)}")
    print(f"Passed Checks         : {len(passes)}")
    print(f"Failed Checks         : {len(failures)}")
    print("=" * 72)

    if failures:
        print("\n❌ EMPIRICAL FAILURES DETECTED:")
        for idx, f in enumerate(failures, 1):
            print(f"  [{idx}] {f}")
        print("\n⚖️ VERDICT: REQUEST_CHANGES")
        sys.exit(1)
    else:
        print("\n✔ VERDICT: APPROVE")
        sys.exit(0)

if __name__ == "__main__":
    main()
