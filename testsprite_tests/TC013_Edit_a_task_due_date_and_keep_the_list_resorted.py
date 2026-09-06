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
        
        # -> Fill the task title field with 'Change date task', set the due date to 2026-09-10, and click the 'Add task' button to create the task.
        # What needs doing? text field
        elem = page.locator('[id="task-title"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Change date task")
        
        # -> Fill the task title field with 'Change date task', set the due date to 2026-09-10, and click the 'Add task' button to create the task.
        # dueDate date field
        elem = page.locator('[id="task-due-date"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("2026-09-10")
        
        # -> Fill the task title field with 'Change date task', set the due date to 2026-09-10, and click the 'Add task' button to create the task.
        # Add task button
        elem = page.get_by_role('button', name='Add task', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Edit date' button for the task labeled 'Change date task' to open the inline due date editor.
        # Edit date button
        elem = page.get_by_role('button', name='Edit due date for "Change date task"', exact=True)
        await elem.click(timeout=10000)
        
        # -> Change the inline due date to 2026-09-05 by entering '2026-09-05' into the date field and click the 'Save' button.
        # Due date for "Change date task" date field
        elem = page.get_by_label('Due date for "Change date task"', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("2026-09-05")
        
        # -> Change the inline due date to 2026-09-05 by entering '2026-09-05' into the date field and click the 'Save' button.
        # Save due date for "Change date task" button
        elem = page.get_by_role('button', name='Save due date for "Change date task"', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The task 'Change date task' remains visible in the task list.
        # Assert-outcome: passed
        # Assert: Verifies the task label 'Change date task' is visible.
        await expect(page.locator("xpath=/html/body/div[1]/main/ul/li/label/span").nth(0)).to_have_text("Change date task", timeout=15000), "Verifies the task label 'Change date task' is visible."
        
        # --> The task's due date was updated and shows the edited date 'Sep 5, 2026'.
        # Assert-outcome: passed
        # Assert: Verifies the task's due date input reflects the edited date 2026-09-05.
        await expect(page.locator("xpath=/html/body/div[1]/main/ul/li/div[1]/div[2]/input").nth(0)).to_have_value("2026-09-05", timeout=15000), "Verifies the task's due date input reflects the edited date 2026-09-05."
        
        # --> The task list contains only the single edited task, so ordering is trivially correct.
        # Assert-outcome: passed
        # Assert: Verifies there is exactly one task in the list after editing.
        await expect(page.locator("xpath=/html/body/div[1]/main/ul/li/label")).to_have_count(1, timeout=15000), "Verifies there is exactly one task in the list after editing."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    