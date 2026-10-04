import { Router, Request, Response } from 'express';
import { searchAddressAutocomplete, parseCanadianAddress } from './addressData.js';
import { PropertyDataProvider, ComparableSalesProvider } from './providers.js';
import { ValuationScoringEngine } from './scoringEngine.js';
import { generateValuationExplanation, generateComparableRationale } from './aiExplainer.js';
import { valuationStore } from './valuationStore.js';
import { SubjectPropertyInput, ValuationLeadSubmission } from './types.js';

export const valuationRouter = Router();

/**
 * 1. Address Autocomplete
 * GET /api/valuation/autocomplete?q=...
 */
valuationRouter.get('/autocomplete', (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const results = searchAddressAutocomplete(query, 8);
  res.json(results);
});

/**
 * 2. Property Details Lookup
 * POST /api/valuation/property-details
 */
valuationRouter.post('/property-details', (req: Request, res: Response) => {
  const { address } = req.body;
  if (!address || typeof address !== 'string' || address.trim().length < 3) {
    return res.status(400).json({ error: 'A valid Canadian property address is required.' });
  }

  try {
    const details = PropertyDataProvider.getPropertyDetails(address);
    res.json(details);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve property details', message: err?.message });
  }
});

/**
 * 3. Calculate Real-Time Property Valuation
 * POST /api/valuation/estimate
 */
valuationRouter.post('/estimate', async (req: Request, res: Response) => {
  const { address, propertyDetails, renovations, askingPrice, mode = 'seller' } = req.body;

  if (!address && !propertyDetails?.address) {
    return res.status(400).json({ error: 'Address is required to calculate home valuation.' });
  }

  try {
    const targetAddress = (address || propertyDetails.address).trim();
    const config = valuationStore.getConfig();

    // 1. Gather Subject Property Attributes
    let subject: SubjectPropertyInput;
    let userAdjusted = false;

    if (propertyDetails && propertyDetails.bedrooms) {
      subject = {
        ...PropertyDataProvider.getPropertyDetails(targetAddress),
        ...propertyDetails,
        renovations: renovations || propertyDetails.renovations || {}
      };
      userAdjusted = true;
    } else {
      subject = PropertyDataProvider.getPropertyDetails(targetAddress);
      if (renovations) {
        subject.renovations = renovations;
      }
    }

    if (askingPrice && Number(askingPrice) > 0) {
      subject.askingPrice = Number(askingPrice);
    }

    // 2. Fetch Verified Comparable Sales
    const { comparables, radiusUsedKm, lookbackDaysUsed } = ComparableSalesProvider.getComparables(
      subject,
      config.searchRadiusKm,
      config.lookbackDays
    );

    // 3. Score Comparables & Calculate Statistical Valuation
    const valuation = ValuationScoringEngine.calculateValuation(
      subject,
      comparables,
      config,
      radiusUsedKm,
      lookbackDaysUsed
    );

    // 4. Generate AI CMA Explanation
    valuation.aiExplanation = await generateValuationExplanation(valuation, subject);

    // 5. Record Valuation in Audit Trail
    valuationStore.recordAudit(valuation, mode === 'buyer' ? 'buyer' : 'seller', userAdjusted);

    res.json(valuation);
  } catch (err: any) {
    console.error('Valuation error:', err);
    res.status(500).json({
      error: 'Valuation calculation failed',
      message: err?.message || 'An unexpected error occurred while analyzing comparable sales.'
    });
  }
});

/**
 * 4. AI Explanation for an Individual Comparable
 * POST /api/valuation/comp-explanation
 */
valuationRouter.post('/comp-explanation', async (req: Request, res: Response) => {
  const { comp, subject } = req.body;
  if (!comp || !subject) {
    return res.status(400).json({ error: 'Both comparable and subject property are required.' });
  }

  try {
    const explanation = await generateComparableRationale(comp, subject);
    res.json({ explanation });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate comparable rationale', message: err?.message });
  }
});

/**
 * 5. Lead Generation / Personalized CMA Request
 * POST /api/valuation/lead
 */
valuationRouter.post('/lead', (req: Request, res: Response) => {
  const {
    auditId,
    firstName,
    lastName,
    email,
    phone,
    propertyAddress,
    municipality,
    province,
    estimatedValue,
    valuationDate,
    propertyType,
    bedrooms,
    bathrooms,
    intent,
    consentToBeContacted,
    notes
  } = req.body;

  if (!firstName || !email || !phone || !propertyAddress) {
    return res.status(400).json({ error: 'First name, email, phone number, and property address are required.' });
  }

  const lead: ValuationLeadSubmission = {
    id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    auditId,
    createdAt: new Date().toISOString(),
    firstName,
    lastName: lastName || '',
    email,
    phone,
    propertyAddress,
    municipality,
    province,
    estimatedValue: estimatedValue ? Number(estimatedValue) : undefined,
    valuationDate,
    propertyType,
    bedrooms: bedrooms ? Number(bedrooms) : undefined,
    bathrooms: bathrooms ? Number(bathrooms) : undefined,
    intent: intent || 'seller_cma',
    consentToBeContacted: consentToBeContacted !== false,
    notes
  };

  valuationStore.recordLead(lead);

  res.status(201).json({
    success: true,
    message: 'Your request for a detailed Comparative Market Analysis has been received. Amit Sawhney will connect with you within 24 hours.',
    leadId: lead.id
  });
});

/**
 * Root POST /api/valuation handler for legacy compatibility
 */
valuationRouter.post('/', (req: Request, res: Response) => {
  const { fullName, firstName, lastName, email, phone, propertyAddress, address, city, propertyType, bedrooms, bathrooms, condition, timeframeToSell, notes } = req.body;
  const fName = firstName || (fullName ? fullName.split(' ')[0] : 'Visitor');
  const lName = lastName || (fullName ? fullName.split(' ').slice(1).join(' ') : '');
  const targetAddress = propertyAddress || address || 'Ontario Property';

  if (!phone || !targetAddress) {
    return res.status(400).json({ error: 'Phone number and property address are required.' });
  }

  const lead: ValuationLeadSubmission = {
    id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString(),
    firstName: fName,
    lastName: lName,
    email: email || '',
    phone,
    propertyAddress: targetAddress,
    municipality: city || 'Durham / GTA',
    propertyType: propertyType || 'Detached Home',
    bedrooms: Number(bedrooms) || 3,
    bathrooms: Number(bathrooms) || 2,
    intent: 'seller_cma',
    consentToBeContacted: true,
    notes: `[Legacy Form Submission] Timeframe: ${timeframeToSell || 'Not specified'}. Condition: ${condition || 'Standard'}. ${notes || ''}`
  };

  valuationStore.recordLead(lead);

  res.status(201).json({
    success: true,
    message: `Home valuation request received for ${targetAddress}. Amit Sawhney will prepare your comprehensive Comparative Market Analysis (CMA).`,
    valuation: lead
  });
});

/**
 * 6. Valuation Config & Admin Management
 * GET /api/valuation/config
 * PUT /api/valuation/config
 */
valuationRouter.get('/config', (req: Request, res: Response) => {
  res.json(valuationStore.getConfig());
});

valuationRouter.put('/config', (req: Request, res: Response) => {
  const updated = valuationStore.updateConfig(req.body);
  res.json({ success: true, config: updated });
});

/**
 * 7. Valuation Analytics
 * GET /api/valuation/analytics
 */
valuationRouter.get('/analytics', (req: Request, res: Response) => {
  const stats = valuationStore.getAnalytics();
  res.json(stats);
});

/**
 * 8. Audit Record Lookup
 * GET /api/valuation/audit/:id
 */
valuationRouter.get('/audit/:id', (req: Request, res: Response) => {
  const record = valuationStore.getAuditRecord(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Audit record not found' });
  }
  res.json(record);
});
