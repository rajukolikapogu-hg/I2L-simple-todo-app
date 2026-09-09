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
        
        # -> Fill 'Invalid edit task' into the Task field, set the Due date to '2026-09-07', and click the 'Add task' button.
        # What needs doing? text field
        elem = page.locator('[id="task-title"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Invalid edit task")
        
        # -> Fill 'Invalid edit task' into the Task field, set the Due date to '2026-09-07', and click the 'Add task' button.
        # dueDate date field
        elem = page.locator('[id="task-due-date"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("2026-09-07")
        
        # -> Fill 'Invalid edit task' into the Task field, set the Due date to '2026-09-07', and click the 'Add task' button.
        # Add task button
        elem = page.get_by_role('button', name='Add task', exact=True)
        await elem.click(timeout=10000)
        
        # -> Clear the inline due date field for 'Invalid edit task' and click the 'Save' button to trigger validation.
        # Due date for "Invalid edit task" date field
        elem = page.get_by_label('Due date for "Invalid edit task"', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("")
        
        # -> Clear the inline due date field for 'Invalid edit task' and click the 'Save' button to trigger validation.
        # Save due date for "Invalid edit task" button
        elem = page.get_by_role('button', name='Save due date for "Invalid edit task"', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> A validation message 'Please choose a valid due date.' is visible beneath the inline date editor.
        # Assert-outcome: passed
        # Assert: Validation message 'Please choose a valid due date.' is shown.
        await expect(page.locator("xpath=/html/body/div[1]/main/ul/li/div[1]/div[2]/input").nth(0)).to_contain_text("Please choose a valid due date.", timeout=15000), "Validation message 'Please choose a valid due date.' is shown."
        
        # --> The inline date editor for the task remains open (date input and Save/Cancel buttons are visible).
        await page.locator("xpath=/html/body/div[1]/main/ul/li/div[1]/div[2]/input").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The inline date input is visible, showing the editor is open.
        await expect(page.locator("xpath=/html/body/div[1]/main/ul/li/div[1]/div[2]/input").nth(0)).to_be_visible(timeout=15000), "The inline date input is visible, showing the editor is open."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    