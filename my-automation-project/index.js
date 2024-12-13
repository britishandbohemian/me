
// ------------------------------------------------------------------------------
 // Import required modules
// ------------------------------------------------------------------------------
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { automateNATIS } = require('./modules/automationSteps');
const readline = require('readline');

// Add stealth plugin to puppeteer to help avoid detection
puppeteer.use(StealthPlugin());

// Time interval for retries if no slots found (1 minute)
const RETRY_INTERVAL_MS = 1 * 60 * 1000; // 60000 ms (60,000 ms = 1 minute)

// ------------------------------------------------------------------------------
 // Function to create and run automation on a browser instance
// ------------------------------------------------------------------------------
async function createAndRunInstance(browserOptions, tabNumber) {
  let browser;
  try {
    browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    console.log(`Tab #${tabNumber}: Browser instance launched.`);

    // Run the NATIS automation steps
    const success = await automateNATIS(page, tabNumber);
    console.log(`Tab #${tabNumber}: Automation completed with result: ${success ? 'Success' : 'Failure'}`);

    if (success) {
      // If successful and it's a visible browser, keep it open
      if (!browserOptions.headless) {
        console.log(`Tab #${tabNumber}: Foreground browser will remain open.`);
      } else {
        await browser.close();
        console.log(`Tab #${tabNumber}: Background browser instance closed (success).`);
      }
    } else {
      // If no slots found (failure), close the browser
      await browser.close();
      console.log(`Tab #${tabNumber}: Browser closed due to no slots found.`);
    }

    return success;
  } catch (error) {
    console.error(`Tab #${tabNumber}: Error during automation:`, error);
    if (browser) {
      await browser.close();
      console.log(`Tab #${tabNumber}: Browser closed due to error.`);
    }
    return false;
  }
}

// ------------------------------------------------------------------------------
 // Helper function to attempt booking and retry if no slots found
// ------------------------------------------------------------------------------
async function attemptBooking(browserOptions, tabNumber) {
  const success = await createAndRunInstance(browserOptions, tabNumber);
  if (!success) {
    // No slots found - close the browser (already closed in createAndRunInstance)
    // and retry after 1 minute
    console.log(`Tab #${tabNumber}: No slots found. Retrying in 1 minute...`);
    setTimeout(() => {
      attemptBooking(browserOptions, tabNumber);
    }, RETRY_INTERVAL_MS);
  }
}

// ------------------------------------------------------------------------------
 // Initialize and handle keyboard input
// ------------------------------------------------------------------------------
async function runAutomation() {
  let tabCounter = 1; // Start tab numbering from 1

  // Launch the initial visible browser instance (headless: false) with retry logic
  attemptBooking(
    {
      headless: false,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    },
    tabCounter
  );

  tabCounter++;

  // Setup readline interface for keyboard input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Make sure to listen for raw data for keypress events
  readline.emitKeypressEvents(process.stdin, rl);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  console.log("Automation running. Press 'a' to create a new visible instance, 'q' to quit.");

  // Listen for keypress events
  process.stdin.on('keypress', async (str, key) => {
    if (key && key.name === 'a') {
      console.log(`Creating new visible browser instance as Tab #${tabCounter}...`);

      // Launch a new visible browser instance (headless: false) with retry logic
      attemptBooking(
        {
          headless: false,
          defaultViewport: null,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
        },
        tabCounter
      );

      tabCounter++;
    } else if (key && (key.name === 'q' || (key.ctrl && key.name === 'c'))) {
      console.log("Exiting automation...");
      process.exit();
    }
  });
}

// ------------------------------------------------------------------------------
 // Start the automation
// ------------------------------------------------------------------------------
runAutomation().catch(error => {
  console.error("Unexpected error in automation:", error);
});