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
        
        # -> Fill 'Later task' into the Task field, set the Due date to 2026-09-10, and click the 'Add task' button.
        # What needs doing? text field
        elem = page.locator('[id="task-title"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Later task")
        
        # -> Fill 'Later task' into the Task field, set the Due date to 2026-09-10, and click the 'Add task' button.
        # dueDate date field
        elem = page.locator('[id="task-due-date"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("2026-09-10")
        
        # -> Fill 'Later task' into the Task field, set the Due date to 2026-09-10, and click the 'Add task' button.
        # Add task button
        elem = page.get_by_role('button', name='Add task', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill 'Earlier task' into the Task field, set the Due date to 09/03/2026, and click the 'Add task' button.
        # What needs doing? text field
        elem = page.locator('[id="task-title"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Earlier task")
        
        # -> Fill 'Earlier task' into the Task field, set the Due date to 09/03/2026, and click the 'Add task' button.
        # dueDate date field
        elem = page.locator('[id="task-due-date"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("2026-09-03")
        
        # -> Fill 'Earlier task' into the Task field, set the Due date to 09/03/2026, and click the 'Add task' button.
        # Add task button
        elem = page.get_by_role('button', name='Add task', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Tasks are displayed soonest-first: 'Earlier task' appears above 'Later task'.
        # Assert-outcome: passed
        # Assert: The first list item is 'Earlier task'.
        await expect(page.locator("xpath=/html/body/div/main/ul/li[1]/label").nth(0)).to_have_text("Earlier task", timeout=15000), "The first list item is 'Earlier task'."
        # Assert-outcome: passed
        # Assert: The second list item is 'Later task'.
        await expect(page.locator("xpath=/html/body/div/main/ul/li[2]/label").nth(0)).to_have_text("Later task", timeout=15000), "The second list item is 'Later task'."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    