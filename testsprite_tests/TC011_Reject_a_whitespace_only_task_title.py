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
        
        # -> Fill the 'Task' field with only whitespace and click the 'Add task' button to submit the form.
        # What needs doing? text field
        elem = page.locator('[id="task-title"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("   ")
        
        # -> Fill the 'Task' field with only whitespace and click the 'Add task' button to submit the form.
        # Add task button
        elem = page.get_by_role('button', name='Add task', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> A validation message is shown for the Task field: "Please enter a task title."
        # Assert-outcome: passed
        # Assert: The task-title field area contains the validation message 'Please enter a task title.'
        await expect(page.locator("xpath=/html/body/div[1]/main/form/div[1]/input").nth(0)).to_contain_text("Please enter a task title.", timeout=15000), "The task-title field area contains the validation message 'Please enter a task title.'"
        
        # --> No new task was created and the tasks list remains empty: "Nothing to do yet — add your first task above."
        # Assert-outcome: passed
        # Assert: The page still displays that there are no tasks: 'Nothing to do yet — add your first task above.'
        await expect(page.locator("xpath=/html/body/div[1]/main/form/button").nth(0)).to_contain_text("Nothing to do yet \u2014 add your first task above.", timeout=15000), "The page still displays that there are no tasks: 'Nothing to do yet \u2014 add your first task above.'"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    