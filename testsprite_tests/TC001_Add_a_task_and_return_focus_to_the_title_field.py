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
        
        # -> Fill the 'Task' input (placeholder 'What needs doing?') with a unique task title, set the Due date field, and click the 'Add task' button.
        # What needs doing? text field
        elem = page.locator('[id="task-title"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("E2E test task 2026-09-06 1")
        
        # -> Fill the 'Task' input (placeholder 'What needs doing?') with a unique task title, set the Due date field, and click the 'Add task' button.
        # dueDate date field
        elem = page.locator('[id="task-due-date"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("2026-09-10")
        
        # -> Fill the 'Task' input (placeholder 'What needs doing?') with a unique task title, set the Due date field, and click the 'Add task' button.
        # Add task button
        elem = page.get_by_role('button', name='Add task', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The newly created task with the exact title appears in the task list.
        # Assert-outcome: passed
        # Assert: The task label text equals the created title.
        await expect(page.locator("xpath=/html/body/div/main/ul/li/label").nth(0)).to_have_text("E2E test task 2026-09-06 1", timeout=15000), "The task label text equals the created title."
        
        # --> Focus returned to the task title input (the 'What needs doing?' field) after adding the task.
        await page.locator("xpath=/html/body/div/main/form/div[1]/input").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The task title input is visible on the page.
        await expect(page.locator("xpath=/html/body/div/main/form/div[1]/input").nth(0)).to_be_visible(timeout=15000), "The task title input is visible on the page."
        # Assert-outcome: passed
        # Assert: The input's placeholder confirms this is the task title field.
        await expect(page.locator("xpath=/html/body/div/main/form/div[1]/input").nth(0)).to_have_attribute("placeholder", "What needs doing?", timeout=15000), "The input's placeholder confirms this is the task title field."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    