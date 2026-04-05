/**
 * Scraper for Shani Jacobi earrings
 * Uses the public WP REST API (no auth needed for published products).
 * Category ID 65 = עגילים (earrings)
 *
 * Image strategy:
 *   1. Prefer woocommerce_single (800x800) from the featured media embed
 *   2. Fall back to medium or source_url from the embed
 *   3. For products where the embed fails (auth-restricted media), fetch the
 *      product page and pull the og:image meta tag
 */

const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://shanijacobi.co.il';
const API_BASE = `${BASE_URL}/wp-json/wp/v2`;
const EARRINGS_CATEGORY_ID = 65;
const PER_PAGE = 100; // WP REST API max
const SOURCE_ID = 'shanijacobi';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120',
};

function safeEncodeUrl(url) {
  if (!url) return '';
  try {
    return encodeURI(decodeURI(url));
  } catch {
    return url;
  }
}

async function fetchPage(page) {
  const url =
    `${API_BASE}/product` +
    `?product_cat=${EARRINGS_CATEGORY_ID}` +
    `&per_page=${PER_PAGE}` +
    `&page=${page}` +
    `&_embed=wp:featuredmedia,wp:term` +
    `&status=publish`;

  const response = await axios.get(url, { headers: HEADERS, timeout: 20000 });

  return {
    data: response.data,
    totalPages: parseInt(response.headers['x-wp-totalpages'] || '1', 10),
  };
}

/**
 * Fetch the og:image and first gallery image from a product page.
 * Used as fallback when the WP REST API embed doesn't return image data.
 */
async function fetchImageFromPage(productLink) {
  try {
    const r = await axios.get(productLink, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(r.data);

    // Best source: the actual gallery image (src has the sized version)
    const gallerySrc =
      $('.woocommerce-product-gallery__image img').first().attr('src') || '';

    // Fallback: og:image meta
    const ogImage = $('meta[property="og:image"]').attr('content') || '';

    return safeEncodeUrl(gallerySrc || ogImage);
  } catch {
    return '';
  }
}

function parseProduct(p) {
  const media = p._embedded?.['wp:featuredmedia']?.[0];

  // Prefer 800x800 woocommerce_single; fall back to medium then source_url
  const rawImage =
    media?.media_details?.sizes?.woocommerce_single?.source_url ||
    media?.media_details?.sizes?.medium?.source_url ||
    media?.source_url ||
    '';

  const image = safeEncodeUrl(rawImage);

  // Collect tag slugs from embedded terms
  const terms = (p._embedded?.['wp:term'] || []).flat();
  const tags = terms
    .filter((t) => t.taxonomy === 'product_tag' || t.taxonomy === 'product_cat')
    .map((t) => t.slug);

  const name = p.title?.rendered || '';
  const link = p.link || '';

  if (!name || !link) return null;

  // image may be empty here — will be filled in the fallback pass
  return { name, link, image, price: '', tags, source: SOURCE_ID };
}

async function scrape() {
  console.log(`[${SOURCE_ID}] Scraping via WP REST API...`);
  const allProducts = [];

  let page = 1;
  let totalPages = 1;

  // ── Pass 1: fetch all products via REST API ─────────────────────────────────
  while (page <= totalPages) {
    console.log(`[${SOURCE_ID}] Page ${page}/${totalPages}`);
    try {
      const { data, totalPages: tp } = await fetchPage(page);
      totalPages = tp;
      data.forEach((p) => {
        const parsed = parseProduct(p);
        if (parsed) allProducts.push(parsed);
      });
      page++;
      if (page <= totalPages) await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`[${SOURCE_ID}] Error on page ${page}:`, err.message);
      break;
    }
  }

  // ── Pass 2: fetch missing images from product pages ─────────────────────────
  const missing = allProducts.filter((p) => !p.image);
  if (missing.length > 0) {
    console.log(`[${SOURCE_ID}] Fetching images for ${missing.length} products from their pages...`);
    for (const product of missing) {
      const img = await fetchImageFromPage(product.link);
      if (img) {
        product.image = img;
        console.log(`[${SOURCE_ID}]  ✓ ${product.name}`);
      } else {
        console.log(`[${SOURCE_ID}]  ✗ No image found for: ${product.name}`);
      }
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  // Drop products that still have no image
  const withImages = allProducts.filter((p) => p.image);
  console.log(`[${SOURCE_ID}] Done. ${withImages.length} earrings with images (${allProducts.length - withImages.length} dropped).`);
  return withImages;
}

module.exports = { scrape, SOURCE_ID };
