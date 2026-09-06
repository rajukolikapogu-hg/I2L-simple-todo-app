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
        
        # -> Create a new task by filling the 'Task' field and clicking the 'Add task' button to add the task named 'persisted-task-2026-09-06-1'.
        # What needs doing? text field
        elem = page.locator('[id="task-title"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("persisted-task-2026-09-06-1")
        
        # -> Create a new task by filling the 'Task' field and clicking the 'Add task' button to add the task named 'persisted-task-2026-09-06-1'.
        # Add task button
        elem = page.get_by_role('button', name='Add task', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Mark "persisted-task-2026-09-06-1" as complete' checkbox to mark the task completed.
        # Mark "persisted-task-2026-09-06-1" as complete checkbox
        elem = page.get_by_label('Mark "persisted-task-2026-09-06-1" as complete', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Mark "persisted-task-2026-09-06-1" as complete' checkbox to mark the task completed.
        await page.goto("http://localhost:4173/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Reload the page (Simple Todo App) to verify the completed task persists after a refresh.
        await page.goto("http://localhost:4173/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Assertions to verify final state
        
        # --> The task 'persisted-task-2026-09-06-1' is present after the page reload.
        # Assert-outcome: passed
        # Assert: The task title 'persisted-task-2026-09-06-1' is visible in the task list.
        await expect(page.locator("xpath=/html/body/div/main/ul/li/label/span").nth(0)).to_have_text("persisted-task-2026-09-06-1", timeout=15000), "The task title 'persisted-task-2026-09-06-1' is visible in the task list."
        
        # --> The task 'persisted-task-2026-09-06-1' remains marked completed after the page reload.
        # Assert-outcome: passed
        # Assert: The task's completion checkbox is checked after reload.
        await expect(page.locator("xpath=/html/body/div/main/ul/li/label/input").nth(0)).to_have_attribute("checked", "true", timeout=15000), "The task's completion checkbox is checked after reload."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    