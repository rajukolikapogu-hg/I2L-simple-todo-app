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
        
        # -> Fill the 'Task' field with a unique task title and click the 'Add task' button to submit the form.
        # What needs doing? text field
        elem = page.locator('[id="task-title"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test task - keep default due date 2026-09-06")
        
        # -> Fill the 'Task' field with a unique task title and click the 'Add task' button to submit the form.
        # Add task button
        elem = page.get_by_role('button', name='Add task', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> New task 'Test task - keep default due date 2026-09-06' appears in the task list.
        # Assert-outcome: passed
        # Assert: The task label matches the created task title.
        await expect(page.locator("xpath=/html/body/div[1]/main/ul/li/label").nth(0)).to_have_text("Test task - keep default due date 2026-09-06", timeout=15000), "The task label matches the created task title."
        
        # --> The task's due date is shown as 'Sep 6, 2026', corresponding to 2026-09-06.
        # Assert-outcome: passed
        # Assert: The task's due date input value equals the default date 2026-09-06.
        await expect(page.locator("xpath=/html/body/div[1]/main/ul/li/div[1]/div[2]/input").nth(0)).to_have_value("2026-09-06", timeout=15000), "The task's due date input value equals the default date 2026-09-06."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    