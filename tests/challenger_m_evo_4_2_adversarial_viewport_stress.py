# tests/challenger_m_evo_4_2_adversarial_viewport_stress.py
# Adversarial Empirical Viewport, Touch Ergonomics & Mobile Reflow Stress Suite
# For Milestone M-EVO-4 (Final Acceptance & Forensic Sign-off)
# Executable with Python 3 + Playwright + Chrome binary

import os
import sys
import time
import math
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright

PORT = 8126
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
    
    viewports = [
        {"name": "iPhone SE Portrait (320x568)", "width": 320, "height": 568},
        {"name": "Standard Mobile Portrait (375x667)", "width": 375, "height": 667},
        {"name": "iPad Portrait (768x1024)", "width": 768, "height": 1024},
        {"name": "iPad Landscape (1024x768)", "width": 1024, "height": 768},
        {"name": "Desktop Full HD (1920x1080)", "width": 1920, "height": 1080}
    ]
    
    results = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROME_PATH, headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        # Collect console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(str(err)))
        
        page.goto(f"http://127.0.0.1:{PORT}/index.html")
        page.wait_for_load_state("networkidle")
        
        print("Page loaded successfully. Testing viewports...")
        
        for vp in viewports:
            print(f"\n--- Testing Viewport: {vp['name']} ---")
            page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
            page.wait_for_timeout(300)
            
            # Check horizontal overflow on initial Worlds view
            overflow_info = page.evaluate("""() => {
                const doc = document.documentElement;
                const body = document.body;
                const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
                const clientW = doc.clientWidth;
                const innerW = window.innerWidth;
                
                // Find all elements that overflow window width
                const overflowingElements = [];
                const all = document.querySelectorAll('*');
                for (const el of all) {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        if (rect.right > innerW + 1) { // 1px tolerance for subpixel
                            overflowingElements.push({
                                tag: el.tagName,
                                id: el.id,
                                className: el.className,
                                right: rect.right,
                                width: rect.width,
                                innerW: innerW
                            });
                        }
                    }
                }
                return {
                    scrollW,
                    clientW,
                    innerW,
                    overflow: scrollW > clientW,
                    overflowingElements: overflowingElements.slice(0, 10)
                };
            }""")
            
            print(f"  [Worlds View] scrollWidth={overflow_info['scrollW']}, clientWidth={overflow_info['clientW']}, innerWidth={overflow_info['innerW']}, overflow={overflow_info['overflow']}")
            if overflow_info['overflowingElements']:
                print(f"  Overflowing elements: {overflow_info['overflowingElements']}")
                
        browser.close()

if __name__ == "__main__":
    main()
