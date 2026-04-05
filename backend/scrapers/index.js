/**
 * Scraper registry.
 * To add a new shop: create a new file in this folder and import it here.
 */

const shaniJacobi = require('./shanijacobi');

// List all scrapers here — each must export { scrape, SOURCE_ID }
const scrapers = [shaniJacobi];

/**
 * Run all scrapers and return a combined, de-duplicated list of products.
 * Products are identified by their link URL.
 */
async function scrapeAll() {
  const results = await Promise.allSettled(scrapers.map((s) => s.scrape()));

  const allProducts = [];
  const seen = new Set();

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      result.value.forEach((p) => {
        if (!seen.has(p.link)) {
          seen.add(p.link);
          allProducts.push(p);
        }
      });
    } else {
      console.error(`Scraper ${scrapers[i].SOURCE_ID} failed:`, result.reason);
    }
  });

  return allProducts;
}

module.exports = { scrapeAll };
