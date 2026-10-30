# tests/test_interactive_inspector.py
import os
import sys
import time
import json
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

PORT = 8128
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
    
    audit_results = {}
    
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROME_PATH, headless=True)
        page = browser.new_page()
        page.goto(f"http://127.0.0.1:{PORT}/index.html")
        page.wait_for_load_state("networkidle")
        
        for vp in viewports:
            vp_key = vp["name"]
            audit_results[vp_key] = {}
            print(f"\n=======================================================")
            print(f"AUDITING VIEWPORT: {vp['name']}")
            print(f"=======================================================")
            page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
            page.wait_for_timeout(200)
            
            # Helper to inspect current DOM state
            def inspect_state(state_name):
                return page.evaluate("""(stateName) => {
                    const doc = document.documentElement;
                    const body = document.body;
                    const innerW = window.innerWidth;
                    const innerH = window.innerHeight;
                    
                    // 1. Scroll overflow check
                    const docScrollW = doc.scrollWidth;
                    const docClientW = doc.clientWidth;
                    const bodyScrollW = body.scrollWidth;
                    const bodyClientW = body.clientWidth;
                    const maxScrollW = Math.max(docScrollW, bodyScrollW);
                    const minClientW = Math.min(docClientW, bodyClientW);
                    const hasScrollOverflow = docScrollW > docClientW || bodyScrollW > bodyClientW;
                    
                    // 2. Element bounds overflow check (physical clipping / spilling)
                    const overflowingElements = [];
                    const allEls = document.querySelectorAll('*');
                    for (const el of allEls) {
                        // ignore invisible or offscreen
                        if (el.offsetParent === null && !el.getClientRects().length) continue;
                        const r = el.getBoundingClientRect();
                        if (r.width > 0 && r.height > 0) {
                            if (r.right > innerW + 1.5) { // tolerance
                                overflowingElements.push({
                                    tag: el.tagName,
                                    id: el.id,
                                    className: el.className,
                                    left: Math.round(r.left),
                                    right: Math.round(r.right),
                                    width: Math.round(r.width),
                                    spill: Math.round(r.right - innerW)
                                });
                            }
                        }
                    }
                    
                    // 3. Interactive Touch Targets (>= 64px)
                    const interactiveSelectors = [
                        'button',
                        '.pair-item',
                        '.maze-cell',
                        '.nav-btn',
                        '.choice-btn',
                        '.dot-node',
                        '.trace-clear-btn',
                        '.trace-done-btn',
                        '.color-swatch',
                        '.color-target',
                        '.order-item-btn',
                        '.arrow-cmd-btn',
                        '#resetProgBtn',
                        '#runProgBtn',
                        '.memory-card',
                        '.header-btn',
                        '.jumbo-speaker-btn',
                        '.world-card',
                        '.level-card',
                        '.math-choice-btn'
                    ];
                    
                    const controls = [];
                    const undersized = [];
                    const checkedElements = new Set();
                    
                    for (const sel of interactiveSelectors) {
                        const els = document.querySelectorAll(sel);
                        for (const el of els) {
                            if (checkedElements.has(el)) continue;
                            checkedElements.add(el);
                            
                            if (el.offsetParent === null && !el.getClientRects().length) continue;
                            const r = el.getBoundingClientRect();
                            if (r.width > 0 && r.height > 0) {
                                const entry = {
                                    sel,
                                    w: Math.round(r.width * 10) / 10,
                                    h: Math.round(r.height * 10) / 10,
                                    id: el.id,
                                    className: typeof el.className === 'string' ? el.className : '',
                                    text: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 25)
                                };
                                controls.push(entry);
                                // Target should be >= 63.5px
                                if (r.width < 63.5 || r.height < 63.5) {
                                    undersized.push(entry);
                                }
                            }
                        }
                    }
                    
                    // 4. Squishy transforms check on active controls
                    // Check if elements have transition / transform defined in computedStyle
                    const squishyReport = [];
                    for (const sel of ['button', '.maze-cell', '.nav-btn', '.choice-btn', '.memory-card', '.world-card', '.level-card', '.pair-item']) {
                        const el = document.querySelector(sel);
                        if (el) {
                            const cs = window.getComputedStyle(el);
                            squishyReport.push({
                                sel,
                                transition: cs.transition,
                                cursor: cs.cursor,
                                touchAction: cs.touchAction
                            });
                        }
                    }
                    
                    return {
                        stateName,
                        docScrollW,
                        docClientW,
                        hasScrollOverflow,
                        spillCount: overflowingElements.length,
                        spillSamples: overflowingElements.slice(0, 5),
                        totalControls: controls.length,
                        undersizedCount: undersized.length,
                        undersizedSamples: undersized,
                        squishyReport
                    };
                }""", state_name)
            
            # Test Worlds
            page.evaluate("() => { if (window.app) window.app.showWorldsView(); }")
            page.wait_for_timeout(200)
            res_worlds = inspect_state("viewWorlds")
            audit_results[vp_key]["viewWorlds"] = res_worlds
            print(f"  [Worlds] scrollOverflow={res_worlds['hasScrollOverflow']} (scrollW={res_worlds['docScrollW']}, clientW={res_worlds['docClientW']}), spills={res_worlds['spillCount']}, controls={res_worlds['totalControls']}, undersized={res_worlds['undersizedCount']}")
            if res_worlds['spillSamples']:
                print(f"    Spills: {res_worlds['spillSamples']}")
            if res_worlds['undersizedSamples']:
                print(f"    Undersized: {res_worlds['undersizedSamples']}")
                
            # Test Levels (Hewan)
            page.evaluate("() => { if (window.app) window.app.selectWorld('hewan'); }")
            page.wait_for_timeout(200)
            res_levels = inspect_state("viewLevels")
            audit_results[vp_key]["viewLevels"] = res_levels
            print(f"  [Levels] scrollOverflow={res_levels['hasScrollOverflow']}, spills={res_levels['spillCount']}, controls={res_levels['totalControls']}, undersized={res_levels['undersizedCount']}")
            if res_levels['spillSamples']:
                print(f"    Spills: {res_levels['spillSamples']}")
            if res_levels['undersizedSamples']:
                print(f"    Undersized: {res_levels['undersizedSamples']}")

            # Test each Game Engine
            for item in levels_to_test:
                eng_name = item['engine']
                page.evaluate(f"() => {{ if (window.app) window.app.launchLevel('{item['id']}'); }}")
                page.wait_for_timeout(200)
                res_eng = inspect_state(f"game_{eng_name}")
                audit_results[vp_key][f"game_{eng_name}"] = res_eng
                print(f"  [{eng_name:10}] scrollOverflow={res_eng['hasScrollOverflow']}, spills={res_eng['spillCount']}, controls={res_eng['totalControls']}, undersized={res_eng['undersizedCount']}")
                if res_eng['spillSamples']:
                    print(f"    Spills: {res_eng['spillSamples']}")
                if res_eng['undersizedSamples']:
                    print(f"    Undersized: {res_eng['undersizedSamples']}")

            # Test Modals
            # Victory
            page.evaluate("() => { const m = document.getElementById('modalVictory'); if (m) m.style.display = 'flex'; }")
            page.wait_for_timeout(200)
            res_vic = inspect_state("modalVictory")
            audit_results[vp_key]["modalVictory"] = res_vic
            print(f"  [Victory] scrollOverflow={res_vic['hasScrollOverflow']}, spills={res_vic['spillCount']}, controls={res_vic['totalControls']}, undersized={res_vic['undersizedCount']}")
            if res_vic['spillSamples']:
                print(f"    Spills: {res_vic['spillSamples']}")
            page.evaluate("() => { document.getElementById('modalVictory').style.display = 'none'; }")

            # Certificate
            page.evaluate("() => { if (window.app) window.app.openCertificateModal(); }")
            page.wait_for_timeout(200)
            res_cert = inspect_state("modalCertificate")
            audit_results[vp_key]["modalCertificate"] = res_cert
            print(f"  [Cert]    scrollOverflow={res_cert['hasScrollOverflow']}, spills={res_cert['spillCount']}, controls={res_cert['totalControls']}, undersized={res_cert['undersizedCount']}")
            if res_cert['spillSamples']:
                print(f"    Spills: {res_cert['spillSamples']}")
            page.evaluate("() => { document.getElementById('modalCertificate').style.display = 'none'; }")

            # Parental Gate
            page.evaluate("() => { if (window.app) window.app.openParentalGateModal(); }")
            page.wait_for_timeout(200)
            res_gate = inspect_state("modalParentGate")
            audit_results[vp_key]["modalParentGate"] = res_gate
            print(f"  [Gate]    scrollOverflow={res_gate['hasScrollOverflow']}, spills={res_gate['spillCount']}, controls={res_gate['totalControls']}, undersized={res_gate['undersizedCount']}")
            if res_gate['spillSamples']:
                print(f"    Spills: {res_gate['spillSamples']}")
            if res_gate['undersizedSamples']:
                print(f"    Undersized: {res_gate['undersizedSamples']}")
            page.evaluate("() => { document.getElementById('modalParent').style.display = 'none'; }")

        # Save JSON output for reporting
        with open("tests/audit_viewport_results.json", "w", encoding="utf-8") as f:
            json.dump(audit_results, f, indent=2, ensure_ascii=False)
            
        print("\nAudit completed and saved to tests/audit_viewport_results.json")
        browser.close()

if __name__ == "__main__":
    main()
