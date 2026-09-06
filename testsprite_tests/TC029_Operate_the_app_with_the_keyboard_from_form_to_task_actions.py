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
        
        # -> Use keyboard navigation to fill the Task field with "Keyboard task", set the Due date to "2026-09-06", then submit the form using the keyboard (Tab to the 'Add task' button and press Enter).
        # What needs doing? text field
        elem = page.locator('[id="task-title"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Keyboard task")
        
        # -> Use keyboard navigation to fill the Task field with "Keyboard task", set the Due date to "2026-09-06", then submit the form using the keyboard (Tab to the 'Add task' button and press Enter).
        # dueDate date field
        elem = page.locator('[id="task-due-date"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("2026-09-06")
        
        # --> Assertions to verify final state
        
        # --> The new task 'Keyboard task' is displayed in the task list.
        # Assert-outcome: failed
        # Assert: Expected the task 'Keyboard task' to be visible in the task list.
        await expect(page.locator("xpath=/html/body/div/main/ul/li/label").nth(0)).to_have_text("Keyboard task", timeout=15000), "Expected the task 'Keyboard task' to be visible in the task list."
        
        # --> Keyboard focus did not move from the form into the new task's row controls after pressing Tab.
        await page.locator("xpath=/html/body/div/main/form/div[2]/input").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: failed
        # Assert: Expected focus to move into the task row controls instead of remaining on the Due date input.
        await expect(page.locator("xpath=/html/body/div/main/form/div[2]/input").nth(0)).to_be_visible(timeout=15000), "Expected focus to move into the task row controls instead of remaining on the Due date input."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    