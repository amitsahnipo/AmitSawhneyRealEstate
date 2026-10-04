import { Router, Request, Response } from 'express';
import { affordabilityStore } from './affordabilityStore.js';
import { calculateAffordability, evaluatePropertyAffordability } from '../src/services/affordabilityService.js';
import { BuyerFinancialProfile } from '../src/types.js';
import { db } from './db.js';

export const affordabilityRouter = Router();

// GET /api/affordability/rules
affordabilityRouter.get('/rules', (req: Request, res: Response) => {
  try {
    const rules = affordabilityStore.getRules();
    res.json({ success: true, rules });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/affordability/rules (Admin / Configurable)
affordabilityRouter.put('/rules', (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const updated = affordabilityStore.updateRules(updates);
    res.json({ success: true, message: 'Mortgage qualification rules updated successfully', rules: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/affordability/calculate
affordabilityRouter.post('/calculate', (req: Request, res: Response) => {
  try {
    const profile: BuyerFinancialProfile = req.body;
    if (!profile) {
      return res.status(400).json({ success: false, message: 'Buyer profile is required' });
    }
    const rules = affordabilityStore.getRules();
    const assessment = calculateAffordability(profile, rules);
    res.json({ success: true, assessment, rules });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/affordability/profile
affordabilityRouter.post('/profile', (req: Request, res: Response) => {
  try {
    const profile: BuyerFinancialProfile = req.body;
    if (!profile) {
      return res.status(400).json({ success: false, message: 'Profile data missing' });
    }
    const result = affordabilityStore.saveProfile(profile);

    // Sync with registered client record if userId or email matches a registered client
    let updatedUser: any = null;
    let targetUserId = profile.userId;
    if (!targetUserId && profile.email) {
      const found = db.findUserByEmail(profile.email);
      if (found) targetUserId = found.id;
    }

    if (targetUserId) {
      updatedUser = db.updateUserProfile(targetUserId, {
        targetBudgetMax: result.assessment.estimatedPurchasePriceMax,
        targetBudgetMin: result.assessment.estimatedPurchasePriceMin,
        intendedDownPayment: result.assessment.estimatedDownPayment,
        preApprovalAmount: result.assessment.estimatedMortgageMax,
        propertyTypePlanning: profile.propertyTypePlanning,
        downPaymentSource: profile.downPaymentSource,
        mortgagePreApprovalStatus: profile.mortgagePreApprovalStatus || 'Pre-approved',
        affordabilityAssessment: result.assessment,
        buyerFinancialProfile: result.profile
      });
    }

    res.json({
      success: true,
      profile: result.profile,
      assessment: result.assessment,
      user: updatedUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/affordability/profile/:id
affordabilityRouter.get('/profile/:id', (req: Request, res: Response) => {
  try {
    const profile = affordabilityStore.getProfile(req.params.id);
    const assessment = affordabilityStore.getAssessment(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.json({ success: true, profile, assessment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/affordability/evaluate-property
affordabilityRouter.post('/evaluate-property', (req: Request, res: Response) => {
  try {
    const { propertyPrice, buyerUpperRange } = req.body;
    const result = evaluatePropertyAffordability(Number(propertyPrice), Number(buyerUpperRange));
    res.json({ success: true, evaluation: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/showings - Book showing or assistance showing
affordabilityRouter.post('/showings', (req: Request, res: Response) => {
  try {
    const requestData = req.body;
    if (!requestData.fullName || !requestData.email || !requestData.phone || !requestData.preferredDate) {
      return res.status(400).json({ success: false, message: 'Missing required contact or appointment details' });
    }
    const saved = affordabilityStore.addShowingRequest(requestData);
    res.json({
      success: true,
      message: saved.isAssistanceShowing
        ? 'Assistance showing inquiry received. Amit Sawhney REALTOR® and financing team will coordinate with you.'
        : 'Private showing appointment requested. Our concierge team will confirm shortly.',
      showing: saved
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/showings
affordabilityRouter.get('/showings', (req: Request, res: Response) => {
  try {
    const showings = affordabilityStore.getShowings();
    res.json({ success: true, showings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/offers - Create or update pre-offer qualification & draft
affordabilityRouter.post('/offers', (req: Request, res: Response) => {
  try {
    const draft = req.body;
    if (!draft.buyerInfo?.fullName || !draft.purchaseTerms?.offerPrice) {
      return res.status(400).json({ success: false, message: 'Buyer full name and offer price are required' });
    }
    const saved = affordabilityStore.addOfferDraft(draft);
    res.json({
      success: true,
      message: 'Offer draft forwarded to Amit Sawhney, Licensed REALTOR® for fiduciary compliance & review.',
      offer: saved
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/offers
affordabilityRouter.get('/offers', (req: Request, res: Response) => {
  try {
    const offers = affordabilityStore.getOffers();
    res.json({ success: true, offers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/offers/:id/review
affordabilityRouter.put('/offers/:id/review', (req: Request, res: Response) => {
  try {
    const { status, realtorNotes } = req.body;
    const updated = affordabilityStore.updateOfferStatus(req.params.id, status, realtorNotes);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Offer draft not found' });
    }
    res.json({ success: true, offer: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
