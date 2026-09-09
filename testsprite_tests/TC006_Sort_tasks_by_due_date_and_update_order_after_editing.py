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
        
        # -> Fill the 'What needs doing?' field with 'Later task', set the 'Due date' to 2026-09-10, and click the 'Add task' button to create a task due later.
        # What needs doing? text field
        elem = page.locator('[id="task-title"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Later task")
        
        # -> Fill the 'What needs doing?' field with 'Later task', set the 'Due date' to 2026-09-10, and click the 'Add task' button to create a task due later.
        # dueDate date field
        elem = page.locator('[id="task-due-date"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("2026-09-10")
        
        # -> Fill the 'What needs doing?' field with 'Later task', set the 'Due date' to 2026-09-10, and click the 'Add task' button to create a task due later.
        # Add task button
        elem = page.get_by_role('button', name='Add task', exact=True)
        await elem.click(timeout=10000)
        
        # -> Add a task titled 'Sooner task' with due date 2026-09-04 using the Add task form.
        # What needs doing? text field
        elem = page.locator('[id="task-title"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Sooner task")
        
        # -> Add a task titled 'Sooner task' with due date 2026-09-04 using the Add task form.
        # dueDate date field
        elem = page.locator('[id="task-due-date"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("2026-09-04")
        
        # -> Add a task titled 'Sooner task' with due date 2026-09-04 using the Add task form.
        # Add task button
        elem = page.get_by_role('button', name='Add task', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Edit date' button for the 'Later task' to open the inline due-date editor.
        # Edit date button
        elem = page.get_by_role('button', name='Edit due date for "Later task"', exact=True)
        await elem.click(timeout=10000)
        
        # -> Change the due date for 'Later task' to 09/03/2026 using the inline date field and click the 'Save' button.
        # Due date for "Later task" date field
        elem = page.get_by_label('Due date for "Later task"', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("2026-09-03")
        
        # -> Change the due date for 'Later task' to 09/03/2026 using the inline date field and click the 'Save' button.
        # Save due date for "Later task" button
        elem = page.get_by_role('button', name='Save due date for "Later task"', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The edited 'Later task' shows the saved due date Sep 3, 2026.
        # Assert-outcome: passed
        # Assert: Edited due date input for 'Later task' is 2026-09-03.
        await expect(page.locator("xpath=/html/body/div[1]/main/ul/li[1]/div[1]/div[2]/input").nth(0)).to_have_value("2026-09-03", timeout=15000), "Edited due date input for 'Later task' is 2026-09-03."
        
        # --> The task list is ordered by due date with 'Later task' appearing before 'Sooner task'.
        # Assert-outcome: passed
        # Assert: First task in the list is 'Later task'.
        await expect(page.locator("xpath=/html/body/div[1]/main/ul/li[1]/label").nth(0)).to_have_text("Later task", timeout=15000), "First task in the list is 'Later task'."
        # Assert-outcome: passed
        # Assert: Second task in the list is 'Sooner task'.
        await expect(page.locator("xpath=/html/body/div[1]/main/ul/li[2]/label").nth(0)).to_have_text("Sooner task", timeout=15000), "Second task in the list is 'Sooner task'."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    