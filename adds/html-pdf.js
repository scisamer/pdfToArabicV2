const puppeteer = require('puppeteer');

async function htmlToPdf (html) {

    // Create a browser instance
    const browser = await puppeteer.launch();

    // Create a new page
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    //To reflect CSS used for screens instead of print
    await page.emulateMediaType('screen');

    await page.evaluate(() => {
      const div = document.createElement('div');
      div.innerHTML = `@arwdbot`;
      div.style.cssText = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 32px; color: rgba(158, 36, 10, 0.2);";
      document.body.appendChild(div);
    });
  // Downlaod the PDF
    const pdf = await page.pdf({
      margin: { top: '100px', right: '30px', bottom: '100px', left: '30px' },
      printBackground: true,
      format: 'A4',
    });
    // Close the browser instance
    await browser.close();
    return pdf;
  }

  module.exports = htmlToPdf;