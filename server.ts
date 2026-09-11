import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { PROJECTS_DATA } from './src/data/projects.js';
import { RESALE_LISTINGS_DATA } from './src/data/resale.js';
import { COMMUNITIES_DATA } from './src/data/communities.js';
import { AMIT_SAWHNEY } from './src/data/agent.js';
import { getFallbackMarketTrends } from './src/data/marketTrendsFallback.js';
import { VIPRegistration, ConsultationBooking, HomeValuationRequest, ResaleListing } from './src/types.js';
import { authRouter } from './server/authRoutes.js';
import { requireAuth, requireRole, AuthenticatedRequest } from './server/authMiddleware.js';
import { db } from './server/db.js';
import { getLiveRealtorListings, getRealtorListingById, REALTOR_SOURCE_URL, LIVE_REALTOR_LISTINGS } from './server/realtorService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mount Authentication & Role-Based Routes
  app.use('/api/auth', authRouter);
  app.use('/api', authRouter);

  // In-memory data store for registrations & consultations & valuations
  const vipRegistrations: VIPRegistration[] = [
    {
      id: 'reg-demo-1',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      projectId: 'brooklin-trails-tribute',
      projectName: 'Brooklin Trails By Tribute',
      fullName: 'David Miller',
      email: 'david.m@example.com',
      phone: '(416) 555-0192',
      buyerType: 'Investor',
      desiredType: '3 Bed Townhome',
      budgetRange: '$700,000 - $850,000',
      preferredTiming: 'Immediate VIP Launch',
      comments: 'Interested in early deposit structure and rental projections in Durham Region.',
      realtorConsent: true
    },
    {
      id: 'reg-demo-2',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      projectId: 'cobourg-trails-tribute',
      projectName: 'Cobourg Trails By Tribute',
      fullName: 'Priya Sharma',
      email: 'priya.sharma@example.ca',
      phone: '(647) 555-0482',
      buyerType: 'First-Time Buyer',
      desiredType: '2 Bedroom',
      budgetRange: '$550,000 - $700,000',
      preferredTiming: '3 to 6 Months',
      comments: 'Looking for 10-day cooling off period advice and Tarion warranty coverage.',
      realtorConsent: true
    }
  ];

  const consultations: ConsultationBooking[] = [];
  const homeValuations: HomeValuationRequest[] = [];

  // API Route: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API Route: Get Agent details
  app.get('/api/agent', (req, res) => {
    res.json(AMIT_SAWHNEY);
  });

  // API Route: Get projects with filters
  app.get('/api/projects', (req, res) => {
    const { search, city, propertyType, status, maxPrice } = req.query;

    let filtered = [...PROJECTS_DATA];

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.builder.toLowerCase().includes(q) ||
          p.location.city.toLowerCase().includes(q) ||
          p.location.region.toLowerCase().includes(q) ||
          p.location.address.toLowerCase().includes(q)
      );
    }

    if (city && typeof city === 'string' && city !== 'All') {
      filtered = filtered.filter(p => p.location.city.toLowerCase() === city.toLowerCase());
    }

    if (propertyType && typeof propertyType === 'string' && propertyType !== 'All') {
      filtered = filtered.filter(p => p.propertyTypes.includes(propertyType as any));
    }

    if (status && typeof status === 'string' && status !== 'All') {
      filtered = filtered.filter(p => p.status === status);
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      const maxVal = Number(maxPrice);
      filtered = filtered.filter(p => p.priceRange.min <= maxVal);
    }

    res.json(filtered);
  });

  // API Route: Get single project by ID
  app.get('/api/projects/:id', (req, res) => {
    const project = PROJECTS_DATA.find(p => p.id === req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  });

  // API Route: Register Interest / Request VIP Package
  app.post('/api/register-interest', (req, res) => {
    const { fullName, email, phone, buyerType, desiredType, budgetRange, preferredTiming, projectId, projectName, comments } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({ error: 'Full name, email, and phone number are required.' });
    }

    const matchedProject = PROJECTS_DATA.find(p => p.id === projectId);

    const newRegistration: VIPRegistration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      projectId,
      projectName: projectName || matchedProject?.name || 'General Ontario Pre-Construction VIP List',
      fullName,
      email,
      phone,
      buyerType: buyerType || 'End User',
      desiredType: desiredType || '1 Bed + Den',
      budgetRange: budgetRange || 'Flexible',
      preferredTiming: preferredTiming || 'Immediate VIP Launch',
      comments: comments || '',
      realtorConsent: true
    };

    vipRegistrations.unshift(newRegistration);

    // Return custom VIP Information Package response
    res.status(201).json({
      success: true,
      message: 'VIP Registration Received Successfully!',
      registration: newRegistration,
      agentContact: {
        name: AMIT_SAWHNEY.name,
        phone: AMIT_SAWHNEY.phoneFormatted,
        phoneRaw: AMIT_SAWHNEY.phone,
        email: AMIT_SAWHNEY.email,
        license: AMIT_SAWHNEY.license
      },
      vipPackageSummary: {
        accessTier: 'Platinum VIP First-Access',
        coolingOffPeriodGuarantee: '10-Day Statutory Right of Rescission Protection',
        buyerCommissionFee: '$0 (Paid by Builder)',
        nextSteps: [
          'Amit Sawhney will contact you directly via call/text at ' + phone + ' with floor plans & confidential pricing.',
          'Review 10-day cooling off period details with lawyer.',
          'Secure builder incentives (capped development charges & free assignment clauses).'
        ]
      }
    });
  });

  // API Route: Book Consultation
  app.post('/api/consultation', (req, res) => {
    const { fullName, email, phone, preferredDate, preferredTime, topic, notes } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }

    const booking: ConsultationBooking = {
      id: `consult-${Date.now()}`,
      createdAt: new Date().toISOString(),
      fullName,
      email: email || '',
      phone,
      preferredDate: preferredDate || 'As soon as possible',
      preferredTime: preferredTime || 'Morning',
      topic: topic || 'Pre-Construction Consultation',
      notes: notes || ''
    };

    consultations.unshift(booking);

    res.status(201).json({
      success: true,
      message: `Consultation requested with Amit Sawhney (Ontario REALTOR®). Amit will reach out to confirm your ${booking.preferredDate} appointment.`,
      booking
    });
  });

  // API Route: Get Resale Listings with filters
  app.get('/api/resale', (req, res) => {
    const { search, city, propertyType, status, maxPrice, minBeds } = req.query;

    let filtered = [...RESALE_LISTINGS_DATA];

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        l =>
          l.title.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.region.toLowerCase().includes(q) ||
          l.features.some(f => f.toLowerCase().includes(q))
      );
    }

    if (city && typeof city === 'string' && city !== 'All') {
      filtered = filtered.filter(l => l.city.toLowerCase().includes(city.toLowerCase()) || l.region.toLowerCase().includes(city.toLowerCase()));
    }

    if (propertyType && typeof propertyType === 'string' && propertyType !== 'All') {
      filtered = filtered.filter(l => l.propertyType === propertyType);
    }

    if (status && typeof status === 'string' && status !== 'All') {
      filtered = filtered.filter(l => l.status === status);
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      const maxVal = Number(maxPrice);
      filtered = filtered.filter(l => l.price <= maxVal);
    }

    if (minBeds && !isNaN(Number(minBeds)) && Number(minBeds) > 0) {
      filtered = filtered.filter(l => l.bedrooms >= Number(minBeds));
    }

    res.json(filtered);
  });

  // API Route: Get Single Resale Listing by ID
  app.get('/api/resale/:id', (req, res) => {
    const listing = RESALE_LISTINGS_DATA.find(l => l.id === req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Resale listing not found' });
    }
    res.json(listing);
  });

  // API Route: Live MLS® Listings from REALTOR.ca Feed (Supports City Filtering, Pagination, Sort=6-D)
  app.get('/api/realtor/listings', async (req, res) => {
    try {
      const {
        city,
        limit,
        page,
        sortBy,
        propertyType,
        minPrice,
        maxPrice,
        minBeds,
        status,
        search
      } = req.query;

      const response = await getLiveRealtorListings({
        city: typeof city === 'string' ? city : undefined,
        limit: limit ? parseInt(limit as string, 10) : 10,
        page: page ? parseInt(page as string, 10) : 1,
        sortBy: typeof sortBy === 'string' ? sortBy : '6-D',
        propertyType: typeof propertyType === 'string' ? propertyType : undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        minBeds: minBeds ? parseInt(minBeds as string, 10) : undefined,
        status: typeof status === 'string' ? status : undefined,
        searchQuery: typeof search === 'string' ? search : undefined
      });

      res.json(response);
    } catch (error: any) {
      console.error('Error fetching Realtor.ca listings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch live listings',
        message: error.message
      });
    }
  });

  // API Route: Get Single Live REALTOR.ca MLS® Listing by ID or MLS Number
  app.get('/api/realtor/listings/:id', (req, res) => {
    const listing = getRealtorListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found on MLS® network' });
    }
    res.json({ success: true, listing });
  });

  // API Route: Get Available Cities and Counts for Community Panel Integration
  app.get('/api/realtor/cities', (req, res) => {
    const cityCounts: Record<string, number> = {};
    LIVE_REALTOR_LISTINGS.forEach(l => {
      cityCounts[l.city] = (cityCounts[l.city] || 0) + 1;
    });

    const list = Object.entries(cityCounts).map(([name, count]) => ({
      name,
      count
    }));

    res.json({
      success: true,
      totalListings: LIVE_REALTOR_LISTINGS.length,
      cities: list,
      sourceUrl: REALTOR_SOURCE_URL
    });
  });

  // API Route: Get Featured Communities
  app.get('/api/communities', (req, res) => {
    res.json(COMMUNITIES_DATA);
  });

  // API Route: Submit Home Valuation Request
  app.post('/api/valuation', (req, res) => {
    const { fullName, email, phone, propertyAddress, city, propertyType, bedrooms, bathrooms, condition, timeframeToSell, notes } = req.body;

    if (!fullName || !phone || !propertyAddress) {
      return res.status(400).json({ error: 'Full name, phone number, and property address are required.' });
    }

    const valuation: HomeValuationRequest = {
      id: `val-${Date.now()}`,
      createdAt: new Date().toISOString(),
      fullName,
      email: email || '',
      phone,
      propertyAddress,
      city: city || 'Durham / GTA',
      propertyType: propertyType || 'Detached Home',
      bedrooms: Number(bedrooms) || 3,
      bathrooms: Number(bathrooms) || 2,
      condition: condition || 'Well Maintained',
      timeframeToSell: timeframeToSell || 'Curious about market value',
      notes: notes || ''
    };

    homeValuations.unshift(valuation);

    res.status(201).json({
      success: true,
      message: `Home valuation request received for ${propertyAddress}. Amit Sawhney will prepare your comprehensive Comparative Market Analysis (CMA).`,
      valuation
    });
  });

  // API Route: Get All Registrations & Leads (Guarded: AGENT only)
  app.get('/api/registrations', requireAuth, requireRole('AGENT'), (req: AuthenticatedRequest, res) => {
    res.json({
      total: vipRegistrations.length + consultations.length + homeValuations.length,
      registrations: vipRegistrations,
      consultations: consultations,
      valuations: homeValuations
    });
  });

  // =========================================================================
  // "BUY SMART, SAVE BIG" COMMISSION CASHBACK PROGRAM API ROUTES
  // =========================================================================

  // 1. GET /api/cashback/config - Public configuration & disclaimers
  app.get('/api/cashback/config', (req, res) => {
    res.json(db.getCashbackConfig());
  });

  // 2. PUT /api/cashback/config - Update rules (AGENT only)
  app.put('/api/cashback/config', requireAuth, requireRole('AGENT'), (req: AuthenticatedRequest, res) => {
    const updated = db.updateCashbackConfig(req.body);
    res.json({ success: true, config: updated, message: 'Cashback program parameters updated successfully.' });
  });

  // 3. POST /api/cashback/inquiry - Capture buyer eligibility & cashback request
  app.post('/api/cashback/inquiry', (req, res) => {
    const {
      fullName,
      email,
      phone,
      purchasePrice,
      propertyType,
      transactionType,
      targetProjectOrArea,
      projectId,
      purchaseTimeframe,
      workingWithRealtor,
      notes,
      userId
    } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({ error: 'Full name and phone number are required.' });
    }

    const price = Number(purchasePrice) || 800000;
    const config = db.getCashbackConfig();

    // RECO Compliance check: cannot solicit buyers currently under active representation
    const isUnderActiveRep = Boolean(workingWithRealtor);

    let status: any = 'Inquiry';
    let estimatedCashback = 0;

    if (isUnderActiveRep) {
      status = 'Ineligible';
      estimatedCashback = 0;
    } else if (price >= config.minPurchasePrice) {
      status = 'Inquiry';
      estimatedCashback = Math.min(
        config.maxCashbackAmount,
        Math.round(price * (config.defaultCashbackPercent / 100))
      );
    } else {
      status = 'Ineligible';
      estimatedCashback = 0;
    }

    const inquiry = db.createCashbackInquiry({
      fullName,
      email: email || '',
      phone,
      purchasePrice: price,
      propertyType: propertyType || 'Pre-Construction Development',
      transactionType: transactionType || 'Pre-Construction',
      targetProjectOrArea: targetProjectOrArea || 'GTA & Durham Region',
      projectId: projectId || undefined,
      purchaseTimeframe: purchaseTimeframe || '3-6 months',
      workingWithRealtor: isUnderActiveRep,
      notes: notes || '',
      estimatedCashback,
      status,
      commissionRate: config.defaultCommissionRate,
      userId: userId || undefined
    });

    const responseMsg = isUnderActiveRep
      ? 'Inquiry received. Under RECO regulations, cashback and representation services cannot be provided to buyers already under an active representation agreement with another brokerage.'
      : `Congratulations! Your inquiry for estimated potential cashback of $${estimatedCashback.toLocaleString()} on a $${price.toLocaleString()} purchase has been recorded. Amit Sawhney will review eligibility and reach out.`;

    res.status(201).json({
      success: true,
      inquiry,
      message: responseMsg
    });
  });

  // 4. GET /api/cashback/deals - Get deals (Agents see all; Clients see own)
  app.get('/api/cashback/deals', requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.role === 'AGENT') {
      const allDeals = db.getAllCashbackInquiries();
      return res.json({ deals: allDeals, count: allDeals.length });
    } else {
      const userDeals = db.getCashbackInquiriesForUser(user.id, user.email);
      return res.json({ deals: userDeals, count: userDeals.length });
    }
  });

  // 5. PATCH /api/cashback/deals/:id - Update deal status & transaction details (AGENT only)
  app.patch('/api/cashback/deals/:id', requireAuth, requireRole('AGENT'), (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const updates = req.body;

    const updated = db.updateCashbackInquiry(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Cashback deal record not found.' });
    }

    res.json({
      success: true,
      deal: updated,
      message: `Cashback deal #${id} updated successfully.`
    });
  });

  // API Route: Fetch Current Average Canadian Mortgage Rates (Consumer Banking Benchmark e.g. RBC)
  app.get('/api/mortgage-rates', async (req, res) => {
    try {
      // RBC Royal Bank & Canadian Big 5 Consumer Prime Rate (4.45% as of September 2026)
      let primeRate = 4.45;
      let lastUpdated = new Date().toISOString().split('T')[0];

      try {
        // V80691311 is the Bank of Canada official series for "Chartered bank prime lending rate" (RBC, TD, BMO, CIBC, Scotiabank)
        const bocRes = await fetch('https://www.bankofcanada.ca/valet/observations/V80691311/json?recent=1');
        if (bocRes.ok) {
          const bocData = await bocRes.json();
          const obs = bocData?.observations?.[0];
          if (obs?.V80691311?.v) {
            const parsedPrime = parseFloat(obs.V80691311.v);
            if (!isNaN(parsedPrime) && parsedPrime > 0) {
              primeRate = parsedPrime;
            }
            if (obs.d) lastUpdated = obs.d;
          }
        }
      } catch (e) {
        console.log('Bank of Canada API external fetch fallback active; using RBC consumer prime benchmark.');
      }

      const fiveYrFixed = 4.64;
      const threeYrFixed = 4.79;

      // RBC Royal Bank & Major Consumer Banking Institution Variable Rates:
      // 5-Year Closed Variable: RBC Prime (4.45%) - 0.50% discount = 3.95% (3.98% APR)
      const fiveYrVarDiscount = 0.50;
      const fiveYrVariable = Number((primeRate - fiveYrVarDiscount).toFixed(2));

      // 3-Year Closed Variable: RBC Prime (4.45%) - 0.35% discount = 4.10%
      const threeYrVarDiscount = 0.35;
      const threeYrVariable = Number((primeRate - threeYrVarDiscount).toFixed(2));

      res.json({
        source: 'Bank of Canada & Major Consumer Banks (RBC Royal Bank Prime Benchmark)',
        institutionBenchmark: 'RBC Royal Bank Prime Rate (4.45%)',
        lastUpdated,
        primeRate,
        rates: [
          {
            type: '5-Year Fixed',
            rate: fiveYrFixed,
            term: '5 Years',
            category: 'Fixed',
            popular: true,
            description: 'Fixed rate locked for 5 years. Most popular traditional choice for pre-construction closings.'
          },
          {
            type: '3-Year Fixed',
            rate: threeYrFixed,
            term: '3 Years',
            category: 'Fixed',
            popular: false,
            description: 'Shorter fixed lock-in offering future renewal and refinancing flexibility.'
          },
          {
            type: '5-Year Variable',
            rate: fiveYrVariable,
            term: '5 Years',
            category: 'Variable',
            popular: true,
            description: `Based on RBC Prime (${primeRate}%) - 0.50% discount. Effective rate of ${fiveYrVariable}% with fixed monthly payments.`
          },
          {
            type: '3-Year Variable',
            rate: threeYrVariable,
            term: '3 Years',
            category: 'Variable',
            popular: false,
            description: `Based on RBC Prime (${primeRate}%) - 0.35% discount. Effective rate of ${threeYrVariable}% offering shorter variable term exposure.`
          }
        ],
        qualificationBenchmark: {
          stressTestRate: Number((Math.max(fiveYrVariable + 2.0, 5.25)).toFixed(2)),
          notes: 'OSFI Canadian Mortgage Stress Test requires qualifying at contract rate + 2.0% or 5.25% floor.'
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve live mortgage rates.' });
    }
  });

  // In-memory cache for generated Market Trends reports to prevent rate limits / 503 spikes
  const marketTrendsCache = new Map<string, { data: any; expiresAt: number }>();

  // Pre-seed default Durham Region market trends in cache so initial requests resolve instantly
  try {
    marketTrendsCache.set('Durham Region__All Buyers & Investors', {
      data: getFallbackMarketTrends('Durham Region', 'All Buyers & Investors'),
      expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour
    });
  } catch (seedErr) {
    console.warn('Cache pre-seed note:', seedErr);
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Resilient Gemini content generation helper with backoff retry, model fallback, and clean error handling
  async function generateGeminiContent(
    apiKey: string,
    params: {
      contents: any;
      config?: any;
      systemInstruction?: string;
    }
  ): Promise<string | null> {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    // gemini-3.8-flash is the primary high-speed supported model, gemini-flash-latest as fast fallback
    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest'];

    for (const model of modelsToTry) {
      // Try up to 2 attempts per model with jittered backoff for 503 / 429
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const payload: any = {
            model,
            contents: params.contents
          };
          if (params.config) {
            payload.config = params.config;
          }
          if (params.systemInstruction) {
            payload.systemInstruction = params.systemInstruction;
          }

          const response = await ai.models.generateContent(payload);
          if (response && response.text) {
            return response.text;
          }
        } catch (err: any) {
          const errorMsg = err?.message || String(err);
          const isTransient = errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE') || errorMsg.includes('429');
          
          if (isTransient && attempt === 0) {
            // Wait briefly before retrying this model
            await sleep(300 + Math.random() * 200);
            continue;
          }
          // If second attempt failed or non-transient, proceed to next candidate model
          break;
        }
      }
    }
    return null;
  }

  // API Route: Gemini-Powered AI Pre-Construction Real Estate Advisor
  app.post('/api/ai-advisor', async (req, res) => {
    const { userQuery, contextProject } = req.body;

    if (!userQuery) {
      return res.status(400).json({ error: 'User question is required' });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          answer: `Hello! I am **Amit Sawhney's AI VIP Pre-Construction Advisor**. 

Based on Ontario real estate regulations (RECO):
- **10-Day Statutory Cooling Off Period**: Under Section 73 of the Condominium Act, you have 10 calendar days from receiving the signed agreement to review with a lawyer and cancel if needed with full deposit refund.
- **Deposit Structure**: Typical pre-construction deposits are 15-20% spread over 1 to 2 years before occupancy.
- **Agent Representation**: Amit Sawhney (Licensed REALTOR®, Ontario. Phone: **647-895-3613**) represents YOU as buyer at **$0 commission fee** to you!

*To ask custom questions, please ensure GEMINI_API_KEY is configured in Secrets or reach Amit directly at (647) 895-3613.*`,
          suggestedActions: [
            'Request VIP Price List & Floor Plans',
            'Call Amit Sawhney (647-895-3613)',
            'Book 1-on-1 Consultation'
          ]
        });
      }

      const systemInstruction = `You are the official AI Real Estate Advisor for Amit Sawhney, a premier Licensed REALTOR® in Ontario (Phone: 647-895-3613, Brokerage: Blueprint Realty Brokerage Inc.).
Amit specializes in both Pre-Construction & New Builds, as well as Resale Homes across the Greater Toronto Area (GTA) and Durham Region (Whitby, Brooklin, Courtice, Oshawa, Newcastle, Pickering, Ajax, Markham, Toronto, Mississauga, Niagara).
Key knowledge to incorporate naturally:
- Amit Sawhney is a Licensed REALTOR® in Ontario with Platinum VIP builder relationships and deep resale market expertise.
- For buyers (both pre-construction and resale), agent representation is 100% FREE to the buyer (developer/seller pays commission).
- For pre-construction: Ontario Condominium Act provides a 10-day statutory cooling-off period for new condos, Tarion 7-year warranty for new detached/townhomes, capped development charges, and extended deposit structures.
- For resale sellers: Amit provides comprehensive Comparative Market Analysis (CMA), architectural staging, HDR media, and maximum equity marketing.
- Featured Durham Region communities include Whitby, Brooklin (North Whitby), Courtice, Oshawa (Kedron/Windfields), Newcastle, Pickering (Frenchman's Bay), and Ajax.
- Direct contact phone: (647) 895-3613 or 647-895-3613.

Pre-Construction Projects:
${PROJECTS_DATA.map(p => `- ${p.name} in ${p.location.city} (${p.priceRange.display}, ${p.status})`).join('\n')}

Resale Listings Available:
${RESALE_LISTINGS_DATA.map(r => `- ${r.title} in ${r.city} (${r.priceDisplay}, ${r.bedrooms} Bed, ${r.bathrooms} Bath, ${r.propertyType})`).join('\n')}

Format your response cleanly with markdown, bullet points where helpful, and keep tone warm, expert, concise, and trustworthy.`;

      const prompt = contextProject
        ? `User is inquiring about project "${contextProject.name}" in ${contextProject.location.city}.\nUser Question: ${userQuery}`
        : `User Question: ${userQuery}`;

      const generatedText = await generateGeminiContent(apiKey, {
        contents: [{ role: 'user', parts: [{ text: systemInstruction + '\n\n' + prompt }] }]
      });

      const text = generatedText || `Thank you for reaching out regarding pre-construction and resale opportunities in the GTA and Durham Region! In Ontario, buyers are protected by a statutory 10-day cooling off period for new condominiums and 7-year Tarion structural warranties. Working with Amit Sawhney (647-895-3613) provides you with Platinum VIP early pricing and builder capped fees at $0 buyer cost. Please call or text Amit directly for personalized guidance.`;

      res.json({
        answer: text,
        suggestedActions: [
          'Register for Platinum VIP Pricing',
          'Call Amit Sawhney at (647) 895-3613',
          'Explore Featured Projects'
        ]
      });

    } catch (err: any) {
      console.warn('AI Advisor fallback triggered:', err?.message || err);
      res.json({
        answer: `I am happy to assist with your pre-construction question! In Ontario, working with a licensed REALTOR® like Amit Sawhney (647-895-3613) gives you access to early Platinum VIP pricing, capped development levies, and 10-day contract review protection at no buyer cost. For urgent assistance, please call or text Amit directly at (647) 895-3613.`,
        suggestedActions: ['Call Amit Sawhney (647-895-3613)', 'Register VIP Interest']
      });
    }
  });

  // API Route: Dynamic AI-Generated Real Estate Market Trends for Durham Region & GTA
  app.get('/api/market-trends', async (req, res) => {
    const region = (req.query.region as string) || 'Durham Region';
    const buyerFocus = (req.query.buyerFocus as string) || 'All Buyers & Investors';
    const cacheKey = `${region}__${buyerFocus}`;

    // Check memory cache first (15 minute TTL)
    const cached = marketTrendsCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json(cached.data);
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // High quality data fallback if API key is not yet set
        const fallback = getFallbackMarketTrends(region, buyerFocus);
        return res.json(fallback);
      }

      const prompt = `You are a top Toronto Regional Real Estate Board (TRREB) and Building Industry and Land Development Association (BILD) senior market intelligence analyst creating a live, dynamic market trends report for prospective home buyers and real estate investors in Ontario.
The focus region is: "${region}".
The prospective buyer target audience is: "${buyerFocus}".
Representative Licensed Realtor: Amit Sawhney (REALTOR®, Blueprint Realty Brokerage Inc., Phone: (647) 895-3613).

Generate a thorough, realistic, up-to-date, professional JSON object adhering to this schema:
{
  "region": "${region}",
  "buyerFocus": "${buyerFocus}",
  "generatedAt": "${new Date().toISOString()}",
  "source": "TRREB Market Watch & BILD GTA New Home Intelligence Analysis",
  "marketTemperature": {
    "score": 68,
    "label": "Balanced Buyer Advantage",
    "summary": "Concise 2-sentence summary of the prevailing buyer opportunity in ${region}, highlighting builder incentives, deposit flexibility, and rate environment."
  },
  "keyMetrics": [
    {
      "label": "Benchmark Composite Price",
      "value": "$892,400",
      "subtext": "Regional composite across all property types",
      "trend": "neutral",
      "change": "+1.8% QoQ"
    },
    {
      "label": "Avg. Pre-Construction $/SqFt",
      "value": "$840 - $960",
      "subtext": "Durham Region master-planned communities vs $1,350+ in Downtown Toronto",
      "trend": "up",
      "change": "High Value Value Spread"
    },
    {
      "label": "Average Days on Market (DOM)",
      "value": "28 Days",
      "subtext": "Provides conditional negotiation leeway for resale buyers",
      "trend": "down",
      "change": "Stable Absorption"
    },
    {
      "label": "Sales-to-New-Listings (SNLR)",
      "value": "51.4%",
      "subtext": "Balanced territory giving buyers leverage on conditions & inspections",
      "trend": "neutral",
      "change": "Balanced Market"
    }
  ],
  "regionalSpotlights": [
    {
      "regionName": "Whitby & Brooklin",
      "headline": "High-Demand Family Hub & Hwy 407 Expansion Gateway",
      "medianPrice": "$960,000",
      "statusBadge": "Top Family Growth Pick",
      "growthDrivers": [
        "Proximity to Highway 407 & 412 extension",
        "Top-ranked Durham District schools & green conservation trails",
        "New Tribute master-planned communities with extended deposit schedules"
      ],
      "realtorInsight": "Brooklin continues to outperform adjacent areas due to generous lot sizes and family appeal. Pre-construction townhomes here offer prime 2-3 year closing runways."
    },
    {
      "regionName": "Oshawa & Courtice Growth Corridor",
      "headline": "Affordable Entry Point with Robust GO Train Transit Expansion",
      "medianPrice": "$745,000",
      "statusBadge": "Highest Cashflow Potential",
      "growthDrivers": [
        "Metrolinx Bowmanville GO Train expansion connecting Courtice & Bowmanville",
        "Ontario Tech University & Durham College high rental demand",
        "Ontario Power Generation (OPG) nuclear & clean energy expansions"
      ],
      "realtorInsight": "For under $800k, buyers in Oshawa and Courtice get detached homes and spacious towns that would cost 40% more in York or Peel."
    },
    {
      "regionName": "Pickering Waterfront & Ajax",
      "headline": "Lakeshore Proximity & 30-Minute GO Transit to Downtown Toronto",
      "medianPrice": "$910,000",
      "statusBadge": "Rapid Urban Densification",
      "growthDrivers": [
        "Frenchman's Bay nautical waterfront regeneration",
        "Pickering Town Centre mixed-use master redevelopment",
        "Quick 28-minute express GO Train commute into Toronto Union Station"
      ],
      "realtorInsight": "Pickering acts as the gateway between Toronto and Durham. High-rise and mid-rise projects here offer the strongest rent-to-price ratios for transit commuters."
    }
  ],
  "preConVsResale": [
    {
      "factor": "Upfront Capital Required",
      "preConstruction": "Staggered 10-15% deposit over 12-24 months (e.g. 5% at signing, 5% in 120 days, 5% in 365 days)",
      "resale": "Full 5% to 20% down payment required immediately at closing (30-60 days)",
      "recommendation": "Pre-con is ideal for buyers accumulating capital while locking in today's purchase price."
    },
    {
      "factor": "Consumer Legal Protection",
      "preConstruction": "10-Day Statutory Right of Rescission (Condo Act) + Tarion 7-Year New Home Warranty",
      "resale": "Firm purchase once conditions waived; standard property disclosures",
      "recommendation": "Pre-con buyers enjoy a risk-free 10-day lawyer review window to verify all documents."
    },
    {
      "factor": "Occupancy & Equity Growth",
      "preConstruction": "Closing in 2026-2028; ride the market appreciation curve with zero mortgage payments during construction",
      "resale": "Immediate move-in or rental cash flow; start paying mortgage instantly",
      "recommendation": "Choose resale for immediate lifestyle needs, pre-con for equity leverage."
    }
  ],
  "rateImpactAnalysis": {
    "title": "Bank of Canada Policy & Mortgage Stress Test Navigation",
    "bocSummary": "As the Bank of Canada navigates interest rate adjustments, fixed mortgage yields and variable discount spreads are expanding buyer purchasing power. With the 5-year fixed benchmark hovering in the 4.5% - 4.8% range, carrying costs on Durham properties remain significantly more advantageous than Peel or Toronto.",
    "buyerStrategy": "Locking in a pre-construction purchase today allows buyers to secure first-tier Platinum VIP pricing while deferring final mortgage qualification until closing in 2027/2028 when interest rates are projected to settle further."
  },
  "strategicTakeaways": [
    "Pre-construction builder incentives currently include capped development fees, free assignment clauses, and extended deposit structures worth $35,000+ in buyer savings.",
    "Durham Region detached and freehold townhomes present a 25-35% price discount compared to Markham, Richmond Hill, and Mississauga, with matching commuter times via Hwy 407.",
    "Buyers have greater negotiation room in today's balanced market — working with a dedicated VIP Realtor ensures you do not overpay and receive zero-fee representation.",
    "First-time home buyers can leverage the First Home Savings Account (FHSA) tax-free contributions combined with pre-con milestone deposits."
  ],
  "faqs": [
    {
      "question": "Is now a good time to buy pre-construction in Durham Region vs the GTA?",
      "answer": "Yes. Durham Region currently offers some of the highest value per square foot in the Greater Golden Horseshoe ($850-$950/sqft vs $1,300+/sqft in Toronto). Developers are offering rare VIP incentives including capped development levies and extended deposits that typically disappear in overheated markets."
    },
    {
      "question": "How does the 10-day cooling off period protect pre-construction buyers in Ontario?",
      "answer": "Under Section 73 of the Ontario Condominium Act, buyers have a mandatory 10 calendar days after receiving the signed agreement and disclosure statement to have a lawyer review the contract. If you choose not to proceed for any reason, you can cancel and receive your full deposit back with zero penalty."
    },
    {
      "question": "Why should I use Amit Sawhney rather than going directly to the builder sales office?",
      "answer": "Builder sales representatives work exclusively for the developer's best interest. Amit Sawhney represents YOU as the buyer at 100% $0 cost (the builder pays agent commission), securing you early Platinum VIP pricing before public launch, priority unit allocation, and negotiating critical clauses like capped levies and right of assignment."
    }
  ]
}

Return ONLY valid JSON matching this exact structure. Ensure all numbers and insights are sharp, accurate to Ontario/Durham/GTA, realistic, and highly educational for buyers.`;

      // Limit Gemini generation to 6 seconds so the browser request never times out or drops
      const responseText = await Promise.race([
        generateGeminiContent(apiKey, {
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        }),
        new Promise<null>(resolve => setTimeout(() => resolve(null), 6000))
      ]);

      if (!responseText) {
        const fallback = getFallbackMarketTrends(region, buyerFocus);
        marketTrendsCache.set(cacheKey, { data: fallback, expiresAt: Date.now() + 15 * 60 * 1000 });
        return res.json(fallback);
      }

      try {
        const parsed = JSON.parse(responseText);
        marketTrendsCache.set(cacheKey, { data: parsed, expiresAt: Date.now() + 15 * 60 * 1000 });
        return res.json(parsed);
      } catch (parseErr) {
        console.warn('Failed to parse Gemini market trends JSON, serving fallback:', parseErr);
        const fallback = getFallbackMarketTrends(region, buyerFocus);
        return res.json(fallback);
      }
    } catch (err: any) {
      console.warn('Market Trends API handler caught error, using fallback:', err?.message || err);
      const fallback = getFallbackMarketTrends(region, buyerFocus);
      return res.json(fallback);
    }
  });

  // API Route: Custom AI Real Estate Market Query
  app.post('/api/market-trends/ask', async (req, res) => {
    const { question, region, propertyType, budget } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          answer: `### Market Analysis for Durham & GTA
Regarding your inquiry on **${question}**:

- **Current Market Assessment**: Durham Region (including Whitby, Brooklin, Oshawa, Courtice, Pickering, and Ajax) continues to offer the GTA's most attractive price-to-space ratio. Freehold homes and pre-construction developments here provide significant savings compared to York or Peel Regions.
- **Pre-Construction Advantage**: Working with Amit Sawhney gives you first-access Platinum VIP pricing, capped development charges, and a 10-day statutory cooling-off review period with **zero buyer agent fees**.
- **Next Step**: Call or text Amit directly at **(647) 895-3613** for a customized property breakdown and off-market builder sheets.`,
          metrics: {
            estimatedMedian: '$880,000 - $1,050,000',
            marketPhase: 'Balanced Buyer Leeway',
            recommendedAction: 'Lock in Pre-Con Deposit or Negotiate Resale Conditions'
          }
        });
      }

      const prompt = `You are the Senior Market Intelligence Analyst and AI Advisor for Amit Sawhney (Licensed REALTOR®, Ontario, Blueprint Realty Brokerage Inc., Direct Phone: (647) 895-3613).
User Query: "${question}"
Context: Region = "${region || 'Durham Region / GTA'}", Property Type = "${propertyType || 'All'}", Budget = "${budget || 'Flexible'}".

Available Pre-Construction Projects in Portfolio:
${PROJECTS_DATA.map(p => `- ${p.name} in ${p.location.city} (${p.priceRange.display}, ${p.status}, ${p.propertyTypes.join(', ')})`).join('\n')}

Provide a data-rich, actionable, and structured analysis (formatted in Markdown) answering the user's specific question.
Include:
1. Direct answer with current TRREB / BILD market context
2. Comparative price/appreciation perspective (Durham Region vs wider GTA)
3. Actionable recommendation (pre-con vs resale timing, negotiation levers, or deposit strategies)
4. A friendly note encouraging connecting with Amit Sawhney (647-895-3613) for private VIP floor plans & pricing.`;

      const generatedAnswer = await generateGeminiContent(apiKey, {
        contents: prompt
      });

      const answer = generatedAnswer || `### Regional Market Perspective
Regarding **${question}**:

- **Current GTA & Durham Market Dynamic**: Buyers currently benefit from balanced market conditions with favorable builder incentives, flexible deposit schedules, and negotiable inspection conditions.
- **Pricing & Value Comparison**: Durham Region freehold and townhome communities (such as Brooklin, Oshawa, and Courtice) offer significant square-footage value compared to central Toronto, York, or Peel.
- **Consumer Protection**: Ontario Condominium Act Section 73 guarantees a 10-day statutory cooling-off period on all new condo agreements.
- **Realtor Representation**: Amit Sawhney represents you with $0 buyer commission fees. Call or text Amit at **(647) 895-3613** for private floor plans and allocation lists.`;

      res.json({
        answer,
        query: question,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.warn('Market Ask Error fallback triggered:', err?.message || err);
      res.json({
        answer: `In today's GTA and Durham real estate market, buyers have increased leverage to negotiate conditions, select premier floor plans, and secure developer incentives. Amit Sawhney represents buyers at $0 commission fee. Please call or text Amit at (647) 895-3613 for real-time neighborhood metrics.`,
        query: question,
        timestamp: new Date().toISOString()
      });
    }
  });


  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Blueprint Realty server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
