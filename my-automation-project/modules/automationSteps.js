// modules/automationSteps.js

/**
 * Module: automationSteps
 * Description: Contains functions to automate the NATIS booking process.
 * Author: [Your Name]
 * Date: [Current Date]
 */

const { delay } = require('./utils');

/**
 * Automates the NATIS booking steps.
 * @param {object} page - The Puppeteer page instance.
 * @param {number} tabNumber - The tab number for logging purposes.
 * @returns {boolean} - Returns true if automation is successful, else false.
 */
async function automateNATIS(page, tabNumber) {
  try {
    console.log(`\nStarting automation for Tab #${tabNumber}...`);

    // ----------------------------
    // STEP 1: Navigate to NATIS Website
    // ----------------------------
    console.log("STEP 1: Navigating to the NATIS website...");
    await page.goto('https://online.natis.gov.za/', { waitUntil: 'networkidle0' });
    console.log("Successfully loaded the NATIS website.");



    // ----------------------------
    // STEP 2: Click Driving Licence Test Booking Button
    // ----------------------------
    console.log("\nSTEP 2: Clicking the Driving Licence Test Booking button...");
    await page.waitForSelector('div.card.pt-4.p-2.text-center.shadow-lg', { visible: true });
    const foundButton = await page.evaluate(() => {
      const cards = document.querySelectorAll('div.card.pt-4.p-2.text-center.shadow-lg');
      for (let card of cards) {
        const titleElement = card.querySelector('.header-title');
        if (titleElement && titleElement.textContent.includes('Book now for Driving Licence Test')) {
          const bookNowButton = card.querySelector('.card-footer button.btn.btn-success');
          if (bookNowButton) {
            bookNowButton.click();
            return true;
          }
        }
      }
      return false;
    });

    if (!foundButton) {
      throw new Error("Could not locate the Driving Licence Test booking button.");
    }
    console.log("Clicked the Driving Licence Test 'Book Now' button successfully.");

    // Short Delay to allow modal to appear
    await delay(500);

    // ----------------------------
    // STEP 3: Wait for Booking Modal
    // ----------------------------
    console.log("\nSTEP 3: Waiting for the booking modal to appear...");
    await page.waitForSelector('.modal-content', { visible: true });
    console.log("Booking modal appeared successfully.");

    // ----------------------------
    // STEP 4: Select Province (Gauteng)
    // ----------------------------
    console.log("\nSTEP 4: Selecting the province (Gauteng)...");
    // **Important:** Verify the correct value to select. Use '4' if '4: Object' is incorrect.
    await page.select('#provinceCd', '4: Object'); // Replace '4: Object' with '4' if necessary
    console.log("Province selected successfully.");



    // ----------------------------
    // STEP 5: Wait for 'Continue' Button to be Enabled
    // ----------------------------
    console.log("\nSTEP 5: Waiting for the 'Continue' button to be enabled...");
    await page.waitForFunction(() => {
      const button = document.querySelector('.modal-footer .btn-success');
      return button && !button.disabled;
    }, { timeout: 20000 }); // Reduced timeout to 20 seconds
    console.log("'Continue' button is now enabled.");

    // Short Delay before clicking
    await delay(300);

    // ----------------------------
    // STEP 6: Click 'Continue' Button
    // ----------------------------
    console.log("\nSTEP 6: Clicking the 'Continue' button...");
    await page.click('.modal-footer .btn-success');
    console.log("'Continue' button clicked successfully.");

    // Short Delay to allow the next section to load
    await delay(1000);

    // ----------------------------
    // STEP 7: Select Identification Type (RSA ID Document)
    // ----------------------------
    console.log("\nSTEP 7: Selecting the Identification Type (RSA ID Document)...");
    await page.waitForSelector('#idDocTypeCd', { visible: true });
    await page.select('#idDocTypeCd', '2: 02'); // Corrected value with space
    console.log("Identification Type selected successfully.");

    // Short Delay to ensure selection is registered
    await delay(500);

    // ----------------------------
    // STEP 8: Enter ID Number
    // ----------------------------
    console.log("\nSTEP 8: Entering the ID Number...");
    await page.type('#idDocN', '9809015348084');
    console.log("ID Number entered successfully.");



    // ----------------------------
    // STEP 9: Enter Initials
    // ----------------------------
    console.log("\nSTEP 9: Entering the Initials...");
    await page.type('#initials', 'K');
    console.log("Initials entered successfully.");

 
    // ----------------------------
    // STEP 10: Enter Surname
    // ----------------------------
    console.log("\nSTEP 10: Entering the Surname...");
    await page.type('#surname', 'mosia');
    console.log("Surname entered successfully.");



    // ----------------------------
    // STEP 11: Click Next Button
    // ----------------------------
    console.log("\nSTEP 11: Clicking the 'Next' button...");
    await page.waitForSelector('.btn.btn-success', { visible: true });
    const nextButtons = await page.$$('.btn.btn-success');
    if (nextButtons.length === 0) {
      throw new Error("No 'Next' button found.");
    }
    await nextButtons[nextButtons.length - 1].click();
    console.log("'Next' button clicked successfully.");

    // Short Delay to allow the next section to load
    await delay(1000);

    // ----------------------------
    // STEP 12: Enter Cellphone Number
    // ----------------------------
    console.log("\nSTEP 12: Entering the Cellphone Number...");
    await page.waitForSelector('#cellN', { visible: true });
    await page.type('#cellN', '0750368089');
    console.log("Primary Cellphone Number entered successfully.");

    // Short Delay

    // ----------------------------
    // STEP 13: Confirm Cellphone Number
    // ----------------------------
    console.log("\nSTEP 13: Confirming the Cellphone Number...");
    await page.waitForSelector('#confirmcellN', { visible: true });
    await page.type('#confirmcellN', '0750368089');
    console.log("Cellphone Number confirmed successfully.");

    // Short Delay

    // ----------------------------
    // STEP 14: Enter Email Address
    // ----------------------------
    console.log("\nSTEP 14: Entering the Email Address...");
    await page.type('#email', 'Kamogelomosiah@gmail.com');
    console.log("Email Address entered successfully.");

    // Short Delay

    // ----------------------------
    // STEP 15: Confirm Email Address
    // ----------------------------
    console.log("\nSTEP 15: Confirming the Email Address...");
    await page.type('#confirmemail', 'Kamogelomosiah@gmail.com');
    console.log("Email Address confirmed successfully.");

    // Short Delay

    // ----------------------------
    // STEP 16: Click Submit Button
    // ----------------------------
    console.log("\nSTEP 16: Clicking the 'Submit' button...");
    const submitButtons = await page.$$('.btn.btn-success');
    if (submitButtons.length === 0) {
      throw new Error("No 'Submit' button found.");
    }
    await submitButtons[submitButtons.length - 1].click();
    console.log("'Submit' button clicked successfully.");

    // Short Delay to allow the next section to load
    await delay(1000);

    // ----------------------------
    // STEP 17: Select "Heavy Motor Vehicle" Test Category (05)
    // ----------------------------
    console.log("\nSTEP 17: Selecting the 'Heavy Motor Vehicle' Test Category...");
    await page.waitForSelector('#dlExamrTestCat', { visible: true });
    await page.select('#dlExamrTestCat', '2: Object'); // Replace '2: Object' with '2' if necessary
    console.log("'Heavy Motor Vehicle' Test Category selected successfully.");

    // Short Delay

    // ----------------------------
    // STEP 18: Select "C1" License Type
    // ----------------------------
    console.log("\nSTEP 18: Selecting the 'C1' License Type...");
    await page.waitForSelector('#dlTstLicType', { visible: true });
    await page.select('#dlTstLicType', '1: Object'); // Replace '1: Object' with '1' if necessary
    console.log("'C1' License Type selected successfully.");

    // Short Delay

    // ----------------------------
    // STEP 19: Select Test Center
    // ----------------------------
    console.log("\nSTEP 19: Selecting the Test Center...");
    await page.waitForSelector('#infN', { visible: true });
    await page.click('#infN');
    await delay(500); // Wait for dropdown to populate

    await page.select('#infN', '18: Object'); // Replace '18: Object' with '18' if necessary
    await page.evaluate(() => {
      const select = document.querySelector('#infN');
      const event = new Event('change', { bubbles: true });
      select.dispatchEvent(event);
    });
    console.log("Test Center selected and change event dispatched successfully.");

    // Short Delay
    await delay(500);

    // ----------------------------
    // STEP 20: Select the First Available Date
    // ----------------------------
    console.log("\nSTEP 20: Selecting the first available date...");
    await page.waitForSelector('ngb-datepicker', { visible: true });
    const allDateCells = await page.$$('[role="gridcell"].ngb-dp-day:not(.disabled)');

    if (allDateCells.length === 0) {
      throw new Error("No available dates found.");
    }

    const firstAvailableDate = allDateCells[0];
    const ariaLabel = await (await firstAvailableDate.getProperty('ariaLabel')).jsonValue();
    await firstAvailableDate.click();
    console.log(`Selected the first available date: ${ariaLabel}`);

    // Short Delay

    // ----------------------------
    // STEP 21: Select the First Available Time Slot
    // ----------------------------
    console.log("\nSTEP 21: Selecting the first available time slot...");
    await page.waitForSelector('#selectedTime', { visible: true });
    await page.select('#selectedTime', '0: Object'); // Replace '0: Object' with '0' if necessary
    console.log("First available time slot selected successfully.");

    // ----------------------------
    // STEP 22: Click "Book Only"
    // ----------------------------
    console.log("\nSTEP 22: Clicking the 'Book Only' button...");
    await page.waitForSelector('.btn.btn-success', { visible: true });
    await page.click('.btn.btn-success:last-of-type');
    console.log("'Book Only' button clicked successfully.");

    // Short Delay to allow navigation
    await delay(1000);

    // ----------------------------
    // STEP 23: Wait for Navigation to Complete
    // ----------------------------
    console.log("\nSTEP 23: Waiting for navigation to complete...");
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log(`\nNATIS Automation for Tab #${tabNumber} completed successfully.`);
    return true;
  } catch (error) {
    console.error(`Error in Tab #${tabNumber}:`, error);
    // Optionally, capture a screenshot for debugging
    await page.screenshot({ path: `error_tab_${tabNumber}.png` });
    return false;
  }
}

module.exports = {
  automateNATIS,
};
