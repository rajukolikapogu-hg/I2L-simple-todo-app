import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:4173")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Fill the 'What needs doing?' field with a unique task name and click the 'Add task' button.
        # What needs doing? text field
        elem = page.locator('[id="task-title"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("toggle-test-20260906-01")
        
        # -> Fill the 'What needs doing?' field with a unique task name and click the 'Add task' button.
        # Add task button
        elem = page.get_by_role('button', name='Add task', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the checkbox labeled 'Mark "toggle-test-20260906-01" as complete' to mark the task complete.
        # Mark "toggle-test-20260906-01" as complete checkbox
        elem = page.get_by_label('Mark "toggle-test-20260906-01" as complete', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the checkbox labeled 'Mark "toggle-test-20260906-01" as complete' to toggle the task back to active.
        # Mark "toggle-test-20260906-01" as complete checkbox
        elem = page.get_by_label('Mark "toggle-test-20260906-01" as complete', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The task 'toggle-test-20260906-01' is present in the task list.
        # Assert-outcome: passed
        # Assert: The task title 'toggle-test-20260906-01' is visible in the list.
        await expect(page.locator("xpath=/html/body/div/main/ul/li/label/span").nth(0)).to_have_text("toggle-test-20260906-01", timeout=15000), "The task title 'toggle-test-20260906-01' is visible in the list."
        
        # --> The task 'toggle-test-20260906-01' is shown as active (its checkbox is unchecked).
        # Assert-outcome: passed
        # Assert: The task's completion checkbox is unchecked, indicating the task is active.
        await expect(page.locator("xpath=/html/body/div/main/ul/li/label/input").nth(0)).to_have_attribute("checked", "false", timeout=15000), "The task's completion checkbox is unchecked, indicating the task is active."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    