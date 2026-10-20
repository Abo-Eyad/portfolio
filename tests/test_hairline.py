"""Browser smoke check: python tests/test_hairline.py (requires Python Playwright)."""
import asyncio
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
import tempfile
from threading import Thread

from playwright.async_api import async_playwright


async def check(base_url):
    screenshots = Path(tempfile.gettempdir()) / "portfolio-hairline-review"
    screenshots.mkdir(exist_ok=True)
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch()
        try:
            for language, filename in [("en", "index.html"), ("ar", "index-ar.html")]:
                for mobile, reduced in [(False, False), (True, False), (True, True)]:
                    context = await browser.new_context(
                        viewport={"width": 390 if mobile else 1366, "height": 844 if mobile else 768},
                        is_mobile=mobile,
                        has_touch=mobile,
                        reduced_motion="reduce" if reduced else "no-preference",
                    )
                    page = await context.new_page()
                    errors = []
                    page.on("pageerror", lambda error: errors.append(str(error)))
                    await page.goto(f"{base_url}/{filename}", wait_until="networkidle")
                    await page.locator("#terrain svg").wait_for(timeout=5000)
                    await page.locator("#relay svg").wait_for(timeout=5000)
                    assert await page.locator("html").get_attribute("lang") == language
                    if language == "ar":
                        assert await page.locator(".c-name").inner_text() == "أحمد عبد الوهاب"
                        for selector in ["#terrain", "#relay"]:
                            assert re.search(r"[\u0600-\u06ff]", await page.locator(selector).get_attribute("aria-label"))
                    assert await page.locator("#tools .proj").count() == 4
                    assert await page.locator(".hero .c-stat").count() == 3
                    assert await page.locator(".hero a[href='#contact']").is_visible()
                    assert await page.evaluate("document.documentElement.scrollWidth") <= page.viewport_size["width"], "Horizontal overflow"
                    assert await page.evaluate("innerWidth") == page.viewport_size["width"], "Mobile layout viewport expanded"
                    assert await page.locator("#particles").count() == 0

                    for selector in ["#terrain", "#relay"]:
                        figure = page.locator(selector)
                        assert await figure.get_attribute("role") == "img"
                        assert await figure.get_attribute("aria-label")
                        await figure.scroll_into_view_if_needed()
                        await page.mouse.move(0, 0)
                        await page.wait_for_timeout(1200)
                        before = await figure.locator("svg").inner_html()
                        await page.wait_for_timeout(300)
                        assert await figure.locator("svg").inner_html() == before, "Unexpected autoplay"
                        box = await figure.bounding_box()
                        await page.mouse.move(box["x"] + box["width"] * .7, box["y"] + box["height"] * .45)
                        await page.wait_for_timeout(500)
                        after = await figure.locator("svg").inner_html()
                        if reduced:
                            assert after == before, "Reduced-motion figure moved on hover"
                            assert await figure.evaluate("(el)=>getComputedStyle(el).pointerEvents") == "none"
                        elif not mobile:
                            assert after != before, f"{selector} did not respond to the pointer"

                    if reduced:
                        duration = await page.locator(".shimmer").evaluate("(el)=>getComputedStyle(el).animationDuration")
                        assert float(duration.removesuffix("s")) < .001, "Reduced-motion CSS is unreachable"
                    await page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
                    await page.wait_for_timeout(1000)
                    suffix = f"{language}-{'mobile' if mobile else 'desktop'}{'-reduced' if reduced else ''}"
                    await page.screenshot(path=str(screenshots / f"{suffix}.png"))
                    await page.locator(".profile-card").scroll_into_view_if_needed()
                    await page.wait_for_timeout(1000)
                    await page.locator(".profile-card").screenshot(path=str(screenshots / f"{suffix}-profile.png"))
                    await page.locator(".tools-intro").evaluate(
                        "(el)=>scrollTo({top:scrollY+el.getBoundingClientRect().top-100,behavior:'instant'})"
                    )
                    await page.wait_for_timeout(1000)
                    await page.screenshot(path=str(screenshots / f"{suffix}-tools.png"))
                    assert not errors, errors
                    print(f"PASS: {suffix} rendering, motion, content, overflow and JS errors")
                    await context.close()

            page = await browser.new_page()
            await page.route("**/assets/hairline.bundle.js", lambda route: route.abort())
            await page.goto(base_url, wait_until="networkidle")
            assert await page.locator(".hero h1").is_visible()
            assert await page.locator(".hero a[href='#contact']").is_visible()
            assert await page.locator("#tools .proj").count() == 4
            print("PASS: content and contact link survive a failed illustration download")
        finally:
            await browser.close()
    print(f"Screenshots: {screenshots}")


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=root))
    Thread(target=server.serve_forever, daemon=True).start()
    try:
        asyncio.run(check(f"http://127.0.0.1:{server.server_port}"))
    finally:
        server.shutdown()
        server.server_close()
