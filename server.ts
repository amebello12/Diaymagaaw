import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import { INITIAL_PRODUCTS, INITIAL_STORE_SETTINGS } from './src/data/initialData';
import { Product, StoreSettings } from './src/types';
import { generateMetaCatalogCsv, generateMetaCatalogXml } from './src/utils/whatsappCatalogGenerator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

// Initialize Firebase App for backend real-time catalog fetching
const firebaseApp = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

/**
 * Retrieve latest products from Firestore with fallback to initial data
 */
async function getLiveProducts(): Promise<{ products: Product[]; settings: StoreSettings }> {
  try {
    const productsSnap = await getDocs(collection(firestoreDb, 'products'));
    const products: Product[] = [];
    if (!productsSnap.empty) {
      productsSnap.forEach((doc) => {
        products.push(doc.data() as Product);
      });
    }
    return {
      products: products.length > 0 ? products : INITIAL_PRODUCTS,
      settings: INITIAL_STORE_SETTINGS,
    };
  } catch (err) {
    console.warn('Backend Firestore fetch fallback to initial data:', err);
    return {
      products: INITIAL_PRODUCTS,
      settings: INITIAL_STORE_SETTINGS,
    };
  }
}

/**
 * Extract canonical base URL from incoming HTTP request
 */
function getBaseUrl(req: Request): string {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto = typeof forwardedProto === 'string' ? forwardedProto.split(',')[0].trim() : req.protocol;
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'diaymagaaw.sn';
  return `${proto}://${host}`;
}

async function startServer() {
  const app = express();
  app.use(express.json());

// 1. Meta Product Image endpoint (serves real binary JPG/PNG image so CSV/XML does not bloat with base64 data URIs)
  app.get(
    [
      '/api/catalog/image/:productId',
      '/api/catalog/image/:productId.jpg',
      '/api/catalog/image/:productId.png',
      '/catalog/image/:productId.jpg'
    ],
    async (req: Request, res: Response) => {
      try {
        const { productId } = req.params;
        const cleanId = (productId || '').replace(/\.(jpg|png|jpeg|webp)$/i, '');
        const { products } = await getLiveProducts();
        const product = products.find((p) => p.id === cleanId || p.sku === cleanId || p.slug === cleanId);

        const rawImage = product?.images && product.images[0] ? product.images[0] : '';
        if (rawImage.startsWith('data:image')) {
          const match = rawImage.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
          if (match) {
            const format = match[1] === 'jpg' ? 'jpeg' : match[1];
            const buffer = Buffer.from(match[2], 'base64');
            res.setHeader('Content-Type', `image/${format}`);
            res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
            res.setHeader('Access-Control-Allow-Origin', '*');
            return res.status(200).send(buffer);
          }
        } else if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
          return res.redirect(rawImage);
        }

        // Fallback to store logo or placeholder
        const logoPath = path.resolve(__dirname, 'public', 'logo.jpg');
        if (fs.existsSync(logoPath)) {
          res.setHeader('Content-Type', 'image/jpeg');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.setHeader('Access-Control-Allow-Origin', '*');
          return res.sendFile(logoPath);
        }
        return res.status(404).send('Image not found');
      } catch (err) {
        console.error('Error serving product image:', err);
        return res.status(500).send('Error serving image');
      }
    }
  );

  // 2. Meta Commerce Manager / Facebook Marketplace / WhatsApp Business live CSV feed
  app.get(
    [
      '/api/catalog/feed.csv',
      '/catalog.csv',
      '/feed.csv',
      '/catalog-feed.csv',
      '/api/catalog/meta-feed.csv',
      '/api/catalog/facebook-feed.csv',
      '/api/catalog/whatsapp-feed.csv',
    ],
    async (req: Request, res: Response) => {
      try {
        const { products, settings } = await getLiveProducts();
        const baseUrl = getBaseUrl(req);
        const csv = generateMetaCatalogCsv(products, settings, baseUrl);
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'inline; filename="catalog-facebook-whatsapp-feed.csv"');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.status(200).send('\uFEFF' + csv);
      } catch (error) {
        console.error('Error generating CSV catalog feed:', error);
        res.status(500).send('Error generating Meta catalog feed');
      }
    }
  );

  // 3. Meta Commerce / Google Merchant RSS 2.0 XML data feed
  app.get(
    [
      '/api/catalog/feed.xml',
      '/catalog.xml',
      '/feed.xml',
      '/catalog-feed.xml',
      '/api/catalog/meta-feed.xml',
      '/api/catalog/facebook-feed.xml',
    ],
    async (req: Request, res: Response) => {
      try {
        const { products, settings } = await getLiveProducts();
        const baseUrl = getBaseUrl(req);
        const xml = generateMetaCatalogXml(products, settings, baseUrl);

        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Content-Disposition', 'inline; filename="catalog-facebook-whatsapp-feed.xml"');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.status(200).send(xml);
      } catch (error) {
        console.error('Error generating XML catalog feed:', error);
        res.status(500).send('Error generating XML feed');
      }
    }
  );

  // 4. Catalog Feed status and direct link metadata
  app.get('/api/catalog/summary', async (req: Request, res: Response) => {
    try {
      const { products } = await getLiveProducts();
      const baseUrl = getBaseUrl(req);
      const inStock = products.filter((p) => p.stock > 0).length;

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.json({
        success: true,
        store: 'DIAYMA GAAW SÉNÉGAL',
        totalProducts: products.length,
        inStockCount: inStock,
        feedUrls: {
          csv: `${baseUrl}/api/catalog/feed.csv`,
          rootCsv: `${baseUrl}/catalog.csv`,
          xml: `${baseUrl}/api/catalog/feed.xml`,
          metaCommerce: `${baseUrl}/catalog.csv`,
          catalogPage: `${baseUrl}/#catalogue`,
        },
        metaCompatibility: {
          currency: 'XOF (Franc CFA)',
          format: 'Meta Commerce Manager Official CSV/XML',
          channels: ['WhatsApp Business', 'Facebook Marketplace', 'Facebook Shop', 'Instagram Shopping'],
        },
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate catalog summary' });
    }
  });

  // 4. Server health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'diayma-gaaw-api', timestamp: new Date().toISOString() });
  });

  // 5. Frontend Dev & Production static mounting
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    // Mount Vite middleware for dev mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // Pre-generate physical static files so that static CDNs or direct file requests never 404
  async function syncStaticFeeds() {
    try {
      const { products, settings } = await getLiveProducts();
      const defaultBaseUrl = 'https://diaymagaaw.sn';
      const csvContent = '\uFEFF' + generateMetaCatalogCsv(products, settings, defaultBaseUrl);
      const xmlContent = generateMetaCatalogXml(products, settings, defaultBaseUrl);

      const publicDir = path.resolve(__dirname, 'public');
      const apiCatalogDir = path.resolve(publicDir, 'api', 'catalog');
      if (!fs.existsSync(apiCatalogDir)) {
        fs.mkdirSync(apiCatalogDir, { recursive: true });
      }

      fs.writeFileSync(path.resolve(publicDir, 'catalog.csv'), csvContent, 'utf-8');
      fs.writeFileSync(path.resolve(publicDir, 'feed.csv'), csvContent, 'utf-8');
      fs.writeFileSync(path.resolve(apiCatalogDir, 'feed.csv'), csvContent, 'utf-8');

      fs.writeFileSync(path.resolve(publicDir, 'catalog.xml'), xmlContent, 'utf-8');
      fs.writeFileSync(path.resolve(publicDir, 'feed.xml'), xmlContent, 'utf-8');
      fs.writeFileSync(path.resolve(apiCatalogDir, 'feed.xml'), xmlContent, 'utf-8');

      const distDir = path.resolve(__dirname, 'dist');
      if (fs.existsSync(distDir)) {
        const distApiDir = path.resolve(distDir, 'api', 'catalog');
        if (!fs.existsSync(distApiDir)) {
          fs.mkdirSync(distApiDir, { recursive: true });
        }
        fs.writeFileSync(path.resolve(distDir, 'catalog.csv'), csvContent, 'utf-8');
        fs.writeFileSync(path.resolve(distDir, 'feed.csv'), csvContent, 'utf-8');
        fs.writeFileSync(path.resolve(distApiDir, 'feed.csv'), csvContent, 'utf-8');
        fs.writeFileSync(path.resolve(distDir, 'catalog.xml'), xmlContent, 'utf-8');
        fs.writeFileSync(path.resolve(distDir, 'feed.xml'), xmlContent, 'utf-8');
        fs.writeFileSync(path.resolve(distApiDir, 'feed.xml'), xmlContent, 'utf-8');
      }
      console.log(`[Static Feeds] Synchronized ${products.length} products to static feed files.`);
    } catch (err) {
      console.warn('[Static Feeds] Error writing static files:', err);
    }
  }

  // Run in background on startup
  syncStaticFeeds().catch((e) => console.warn('syncStaticFeeds background error:', e));

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server error:', err);
  process.exit(1);
});
