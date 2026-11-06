import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { 
  seedDatabaseIfEmpty, 
  getProducts, 
  upsertProduct, 
  upsertProductsBatch,
  deleteProductById, 
  clearAllProducts,
  getCategories,
  upsertCategory,
  deleteCategoryById,
  getOrders,
  createOrder,
  updateOrderStatus,
  getPromoCodes,
  upsertPromoCode,
  deletePromoCodeByCode,
  clearAllPromoCodes,
  getDeliveryZones,
  upsertDeliveryZone,
  getReviews,
  addReview,
  getStoreSettings,
  saveStoreSettings
} from './src/db/queries.ts';
import { Product, StoreSettings } from './src/types.ts';
import { generateMetaCatalogCsv, generateMetaCatalogXml } from './src/utils/whatsappCatalogGenerator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

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
  app.use(express.json({ limit: '15mb' }));

  // Seed database tables on startup if empty
  await seedDatabaseIfEmpty();

  // =================== REST API ROUTES (PostgreSQL / Cloud SQL) ===================

  // Products
  app.get('/api/products', async (_req: Request, res: Response) => {
    try {
      const data = await getProducts();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.post('/api/products', async (req: Request, res: Response) => {
    try {
      if (Array.isArray(req.body)) {
        await upsertProductsBatch(req.body);
        res.json({ success: true, count: req.body.length });
      } else {
        await upsertProduct(req.body);
        res.json({ success: true });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to save product(s)' });
    }
  });

  app.delete('/api/products/:id', async (req: Request, res: Response) => {
    try {
      await deleteProductById(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  app.delete('/api/products', async (_req: Request, res: Response) => {
    try {
      await clearAllProducts();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear products' });
    }
  });

  // Categories
  app.get('/api/categories', async (_req: Request, res: Response) => {
    try {
      const data = await getCategories();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  app.post('/api/categories', async (req: Request, res: Response) => {
    try {
      await upsertCategory(req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save category' });
    }
  });

  app.delete('/api/categories/:id', async (req: Request, res: Response) => {
    try {
      await deleteCategoryById(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  // Orders
  app.get('/api/orders', async (_req: Request, res: Response) => {
    try {
      const data = await getOrders();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  app.post('/api/orders', async (req: Request, res: Response) => {
    try {
      await createOrder(req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save order' });
    }
  });

  app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      await updateOrderStatus(req.params.id, status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  // Promo Codes
  app.get('/api/promo-codes', async (_req: Request, res: Response) => {
    try {
      const data = await getPromoCodes();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch promo codes' });
    }
  });

  app.post('/api/promo-codes', async (req: Request, res: Response) => {
    try {
      await upsertPromoCode(req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save promo code' });
    }
  });

  app.delete('/api/promo-codes/:code', async (req: Request, res: Response) => {
    try {
      await deletePromoCodeByCode(req.params.code);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete promo code' });
    }
  });

  app.delete('/api/promo-codes', async (_req: Request, res: Response) => {
    try {
      await clearAllPromoCodes();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear promo codes' });
    }
  });

  // Delivery Zones
  app.get('/api/delivery-zones', async (_req: Request, res: Response) => {
    try {
      const data = await getDeliveryZones();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch delivery zones' });
    }
  });

  app.post('/api/delivery-zones', async (req: Request, res: Response) => {
    try {
      await upsertDeliveryZone(req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save delivery zone' });
    }
  });

  // Reviews
  app.get('/api/reviews', async (_req: Request, res: Response) => {
    try {
      const data = await getReviews();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  app.post('/api/reviews', async (req: Request, res: Response) => {
    try {
      await addReview(req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save review' });
    }
  });

  // Store Settings
  app.get('/api/settings', async (_req: Request, res: Response) => {
    try {
      const data = await getStoreSettings();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.post('/api/settings', async (req: Request, res: Response) => {
    try {
      await saveStoreSettings(req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save settings' });
    }
  });

  // =================== CATALOG FEEDS (PostgreSQL powered) ===================

  // 1. Meta Commerce Manager / Facebook Marketplace / WhatsApp Business live CSV feed
  app.get(
    [
      '/api/catalog/feed.csv',
      '/catalog.csv',
      '/api/catalog/meta-feed.csv',
      '/api/catalog/facebook-feed.csv',
      '/api/catalog/whatsapp-feed.csv',
    ],
    async (req: Request, res: Response) => {
      try {
        const [liveProducts, settings] = await Promise.all([
          getProducts(),
          getStoreSettings(),
        ]);
        const csv = generateMetaCatalogCsv(liveProducts, settings);
        
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

  // 2. Meta Commerce / Google Merchant RSS 2.0 XML data feed
  app.get(
    [
      '/api/catalog/feed.xml',
      '/catalog.xml',
      '/api/catalog/meta-feed.xml',
      '/api/catalog/facebook-feed.xml',
    ],
    async (req: Request, res: Response) => {
      try {
        const [liveProducts, settings] = await Promise.all([
          getProducts(),
          getStoreSettings(),
        ]);
        const baseUrl = getBaseUrl(req);
        const xml = generateMetaCatalogXml(liveProducts, settings, baseUrl);

        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
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

  // 3. Catalog Feed status and direct link metadata
  app.get('/api/catalog/summary', async (req: Request, res: Response) => {
    try {
      const liveProducts = await getProducts();
      const baseUrl = getBaseUrl(req);
      const inStock = liveProducts.filter((p) => p.stock > 0).length;

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.json({
        success: true,
        store: 'DIAYMA GAAW SÉNÉGAL',
        databaseEngine: 'PostgreSQL (Cloud SQL Developer Edition)',
        totalProducts: liveProducts.length,
        inStockCount: inStock,
        feedUrls: {
          csv: `${baseUrl}/api/catalog/feed.csv`,
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
    res.json({ 
      status: 'ok', 
      service: 'diayma-gaaw-api', 
      database: 'PostgreSQL (Cloud SQL)',
      timestamp: new Date().toISOString() 
    });
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running with PostgreSQL backend on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server error:', err);
  process.exit(1);
});
