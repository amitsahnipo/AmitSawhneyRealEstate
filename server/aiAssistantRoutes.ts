import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { aiAssistantStore } from './aiAssistantStore.js';
import { AMIT_SAWHNEY } from '../src/data/agent.js';
import { PROJECTS_DATA } from '../src/data/projects.js';
import { RESALE_LISTINGS_DATA } from '../src/data/resale.js';
import { LIVE_REALTOR_LISTINGS } from './realtorService.js';
import { requireAuth, requireRole, AuthenticatedRequest } from './authMiddleware.js';
import {
  AssistantIntent,
  AssistantConversationState,
  AssistantChatResponse,
  VisitorProfile,
  AssistantPropertyCardData
} from '../src/types/assistant.js';

export const aiAssistantRouter = Router();

// Resilient high-speed Gemini helper with model fallback and fast timeout
async function callGeminiAdvisor(
  apiKey: string,
  systemInstruction: string,
  prompt: string
): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));

    const generatePromise = (async () => {
      const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
      for (const model of models) {
        try {
          const response = await ai.models.generateContent({
            model,
            config: {
              systemInstruction,
              temperature: 0.35,
              maxOutputTokens: 300 // enforce short, crisp human answers
            },
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
          });
          if (response?.text) {
            return response.text.trim();
          }
        } catch (e) {
          // Try next candidate model
        }
      }
      return null;
    })();

    return await Promise.race([generatePromise, timeoutPromise]);
  } catch (err) {
    console.warn('Gemini advisor call caught error:', err);
  }
  return null;
}

// Lightweight Visitor Profile Extractor
function extractProfileUpdates(text: string, current: VisitorProfile = {}): VisitorProfile {
  const updated: VisitorProfile = { ...current };
  const lower = text.toLowerCase();

  // Location
  if (lower.includes('brooklin')) updated.location = 'Brooklin';
  else if (lower.includes('whitby')) updated.location = 'Whitby';
  else if (lower.includes('oshawa')) updated.location = 'Oshawa';
  else if (lower.includes('courtice')) updated.location = 'Courtice';
  else if (lower.includes('pickering')) updated.location = 'Pickering';
  else if (lower.includes('ajax')) updated.location = 'Ajax';
  else if (lower.includes('toronto')) updated.location = 'Toronto';
  else if (lower.includes('markham')) updated.location = 'Markham';
  else if (lower.includes('mississauga')) updated.location = 'Mississauga';

  // Property Type
  if (lower.includes('townhouse') || lower.includes('townhome') || lower.includes('town')) {
    updated.propertyType = 'Townhouse';
  } else if (lower.includes('detached') || lower.includes('single family') || lower.includes('house')) {
    updated.propertyType = 'Detached';
  } else if (lower.includes('condo') || lower.includes('apartment')) {
    updated.propertyType = 'Condo';
  } else if (lower.includes('semi') || lower.includes('semi-detached')) {
    updated.propertyType = 'Semi-Detached';
  }

  // Budget
  const budgetMatch = text.match(/\$?(\d{3,4})k/i) || text.match(/\$?(\d{1,2}(?:\.\d{1,2})?)\s*(?:m|million)/i) || text.match(/\$?([6-9]\d{2},\d{3})/);
  if (budgetMatch) {
    updated.budget = budgetMatch[0].toUpperCase();
  } else if (lower.includes('under 600') || lower.includes('under $600k')) {
    updated.budget = 'Under $600K';
  } else if (lower.includes('600k-800k') || lower.includes('600k to 800k') || lower.includes('700k')) {
    updated.budget = '$600K–$800K';
  } else if (lower.includes('800k-1m') || lower.includes('800k to 1m') || lower.includes('850k')) {
    updated.budget = '$800K–$1M';
  } else if (lower.includes('1m+') || lower.includes('over 1m') || lower.includes('over $1m')) {
    updated.budget = '$1M+';
  }

  // Buyer Type
  if (lower.includes('first time') || lower.includes('first-time') || lower.includes('fthb')) {
    updated.buyerType = 'First-Time Buyer';
  } else if (lower.includes('investor') || lower.includes('investment') || lower.includes('rental') || lower.includes('cash flow')) {
    updated.buyerType = 'Investor';
  } else if (lower.includes('downsizing') || lower.includes('retiring')) {
    updated.buyerType = 'Downsizing';
  } else if (lower.includes('upsizing') || lower.includes('growing family') || lower.includes('more space')) {
    updated.buyerType = 'Upsizing';
  }

  // Contact Info
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) updated.email = emailMatch[0];

  const phoneMatch = text.match(/(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
  if (phoneMatch) updated.phone = phoneMatch[0];

  return updated;
}

// Check whether visitor explicitly confirmed or requested to view property listings
function isExplicitPropertyRequest(q: string, lastAssistantText?: string): boolean {
  const lower = q.toLowerCase().trim();

  // Direct explicit display commands
  const explicitPhrases = [
    'show properties',
    'show me properties',
    'show homes',
    'show me homes',
    'show listings',
    'show me listings',
    'show them',
    'show me',
    'show pre-con',
    'show pre-construction',
    'see homes',
    'see properties',
    'see listings',
    'see them',
    'view properties',
    'view listings',
    'view homes',
    'browse homes',
    'browse properties',
    'browse listings',
    'explore pre-construction',
    'explore homes',
    'see projects',
    'show projects',
    'display properties',
    'yes show',
    'show available',
    'send floor plans'
  ];

  if (explicitPhrases.some(phrase => lower.includes(phrase))) {
    return true;
  }

  // If the previous assistant message offered to show properties (e.g. "Want to see them?")
  // and the user affirmatively confirmed
  if (lastAssistantText) {
    const lastLower = lastAssistantText.toLowerCase();
    const assistantAskedToView =
      lastLower.includes('want to see') ||
      lastLower.includes('want me to show') ||
      lastLower.includes('like to see') ||
      lastLower.includes('view them') ||
      lastLower.includes('show matching');

    if (assistantAskedToView) {
      const positiveAcks = [
        'yes',
        'sure',
        'yep',
        'yeah',
        'ok',
        'okay',
        'please',
        'yes please',
        'go ahead',
        'show',
        'show me',
        'why not',
        'definitely',
        'absolutely',
        'i do'
      ];
      if (positiveAcks.some(ack => lower === ack || lower.startsWith(ack + ' ') || lower.endsWith(' ' + ack))) {
        return true;
      }
    }
  }

  return false;
}

// Intent Classifier
function detectIntent(q: string): AssistantIntent {
  const lower = q.toLowerCase();
  if (lower.includes('just looking') || lower.includes('just browsing') || lower.includes('browsing') || lower.includes('not looking right now')) {
    return 'JUST_BROWSING';
  }
  if (lower.includes('cashback') || lower.includes('rebate') || lower.includes('commission') || lower.includes('save big')) {
    return 'CASHBACK_INQUIRY';
  }
  if (lower.includes('pre-con') || lower.includes('preconstruction') || lower.includes('new build') || lower.includes('cooling off') || lower.includes('deposit') || lower.includes('occupancy') || lower.includes('tarion')) {
    return 'PRECON_INQUIRY';
  }
  if (lower.includes('resale') || lower.includes('detached') || lower.includes('showing') || lower.includes('open house') || lower.includes('mls')) {
    return 'RESALE_INQUIRY';
  }
  if (lower.includes('under') || lower.includes('price') || lower.includes('bedroom') || lower.includes('looking for') || lower.includes('find') || lower.includes('homes in') || lower.includes('search') || lower.includes('townhouse') || lower.includes('condo')) {
    return 'PROPERTY_SEARCH';
  }
  if (lower.includes('valuation') || lower.includes('worth') || lower.includes('cma') || lower.includes('sell my')) {
    return 'MARKET_VALUATION';
  }
  if (lower.includes('consultation') || lower.includes('call amit') || lower.includes('speak with') || lower.includes('appointment') || lower.includes('book')) {
    return 'CONSULTATION_REQUEST';
  }
  if (lower.includes('floor plan') || lower.includes('price list') || lower.includes('send details') || lower.includes('register')) {
    return 'LEAD_CAPTURE';
  }
  return 'GENERAL_ADVISORY';
}

// 1. POST /api/ai-assistant/chat - Conversational UX Engine
aiAssistantRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      messages = [],
      currentMessage,
      conversationState = 'EXPLORING',
      visitorProfile = {},
      lastRecommendedProperties = [],
      activeContext
    } = req.body;

    if (!currentMessage || typeof currentMessage !== 'string') {
      return res.status(400).json({ error: 'currentMessage is required' });
    }

    const q = currentMessage.trim();
    const lower = q.toLowerCase();

    // 1. Update lightweight profile
    const profile = extractProfileUpdates(q, visitorProfile);

    // 2. Intent determination
    const intent = detectIntent(lower);

    // 3. Conversation State Progression
    let nextState: AssistantConversationState = conversationState;
    if (intent === 'JUST_BROWSING') {
      nextState = 'EXPLORING';
    } else if (intent === 'PROPERTY_SEARCH') {
      nextState = 'PROPERTY_SEARCH';
    } else if (profile.email || profile.phone) {
      nextState = 'LEAD_CAPTURE';
    } else if (profile.budget && profile.location) {
      nextState = 'HIGH_INTENT';
    } else if (profile.propertyType || profile.location) {
      nextState = 'QUALIFYING';
    } else if (intent === 'CASHBACK_INQUIRY' || intent === 'PRECON_INQUIRY') {
      nextState = 'INFORMATION_SEEKING';
    }

    // Auto-save lead if contact info detected
    if (profile.email || profile.phone) {
      aiAssistantStore.saveLead({
        fullName: profile.fullName || (profile.email ? profile.email.split('@')[0] : 'Website Visitor'),
        phone: profile.phone || '(Provided in chat)',
        email: profile.email || '',
        buyerType: (profile.buyerType as any) || 'First-Time Buyer',
        targetLocation: profile.location || 'GTA / Durham Region',
        budgetRange: profile.budget || 'Flexible',
        intent,
        conversationSummary: `User engaged: "${q.slice(0, 100)}"`,
        conversationSnippet: [
          ...messages.slice(-4),
          { role: 'user', text: q }
        ]
      });
    }

    // Check for Relative Property Inquiries (e.g. "tell me more about the second one", "the first one")
    let relativePropertyMatch: AssistantPropertyCardData | null = null;
    if (lastRecommendedProperties && lastRecommendedProperties.length > 0) {
      if (lower.includes('first') || lower.includes('1st') || lower.includes('number 1')) {
        relativePropertyMatch = lastRecommendedProperties[0];
      } else if (lower.includes('second') || lower.includes('2nd') || lower.includes('number 2')) {
        relativePropertyMatch = lastRecommendedProperties[1] || lastRecommendedProperties[0];
      } else if (lower.includes('third') || lower.includes('3rd') || lower.includes('number 3')) {
        relativePropertyMatch = lastRecommendedProperties[2] || lastRecommendedProperties[0];
      }
    }

    // 4. Instant Fast Handlers for High-Frequency UX Scenarios
    // Handle "Just Browsing" (Principle #15)
    if (intent === 'JUST_BROWSING') {
      const response: AssistantChatResponse = {
        answer: `No problem! 😊 I can help you explore homes, pre-construction projects, or just answer questions whenever you're ready.`,
        intent: 'JUST_BROWSING',
        conversationState: 'EXPLORING',
        visitorProfile: profile,
        suggestedQuickReplies: ['Browse Homes', 'Explore Pre-Construction', 'Ask a Question']
      };
      return res.json(response);
    }

    // Handle "What is cashback?" (Principle #3 example)
    if (lower === 'what is cashback' || lower === 'what is cashback?' || lower.includes('how does cashback work')) {
      const response: AssistantChatResponse = {
        answer: `Cashback is a portion of the commission that may be returned to an eligible buyer, subject to the applicable terms.\n\nWant to know **how much you could receive**?`,
        intent: 'CASHBACK_INQUIRY',
        conversationState: 'INFORMATION_SEEKING',
        visitorProfile: profile,
        statusFeedback: '💰 Calculating cashback parameters...',
        suggestedQuickReplies: ['Calculate my Cashback', 'Am I eligible?', 'How is it paid on closing?']
      };
      return res.json(response);
    }

    // Handle "What is occupancy in pre-construction?" (Principle #16 example)
    if (lower.includes('occupancy') && (lower.includes('what is') || lower.includes('explain'))) {
      const response: AssistantChatResponse = {
        answer: `Occupancy is the period when you can move into the unit before the final closing takes place.\n\n**Want to know about:**\n• Occupancy fees\n• Final closing\n• Deposit requirements`,
        intent: 'PRECON_INQUIRY',
        conversationState: 'INFORMATION_SEEKING',
        visitorProfile: profile,
        suggestedQuickReplies: ['Occupancy Fees', 'Final Closing', 'Deposit Requirements']
      };
      return res.json(response);
    }

    // Handle "How does the 10-day cooling off period work?"
    if (lower.includes('cooling off') || lower.includes('10-day') || lower.includes('10 day')) {
      const response: AssistantChatResponse = {
        answer: `Under Section 73 of the Ontario Condominium Act, you have **10 calendar days** from receiving your signed agreement to review the contract with a lawyer and cancel for a full 100% deposit refund if you choose.\n\nWant to know **what a lawyer reviews during this window**?`,
        intent: 'PRECON_INQUIRY',
        conversationState: 'INFORMATION_SEEKING',
        visitorProfile: profile,
        suggestedQuickReplies: ['What lawyer reviews', 'Does it apply to houses?', 'See Pre-Con Projects']
      };
      return res.json(response);
    }

    // Handle Relative Property Reference (e.g. "tell me more about the second one")
    if (relativePropertyMatch) {
      const prop = relativePropertyMatch;
      const answer = `**${prop.title}** (${prop.city})\n• **Price:** ${prop.priceDisplay}\n• **Type:** ${prop.type === 'preconstruction' ? 'Pre-Construction' : 'Turnkey Resale'}\n• **Key Feature:** ${prop.highlights?.[0] || 'Prime location with top transit and builder warranty'}.\n\nWant me to send you the floor plans or schedule a viewing?`;
      const response: AssistantChatResponse = {
        answer,
        intent: 'PROPERTY_SEARCH',
        conversationState: 'HIGH_INTENT',
        visitorProfile: profile,
        recommendedProperties: [prop],
        suggestedQuickReplies: ['Send Floor Plans', 'Deposit Schedule', 'Ask Another Question']
      };
      return res.json(response);
    }

    // Extract last assistant message text to check for confirmation to view properties
    const lastAssistantMsg = [...messages].reverse().find((m: any) => m.role === 'assistant' || m.sender === 'assistant');
    const lastAssistantText = lastAssistantMsg?.text || '';
    const userExplicitlyRequestedProperties = isExplicitPropertyRequest(q, lastAssistantText);

    // Find available matching properties based on profile & query
    const searchTerms = [profile.location, profile.propertyType, profile.budget, q].filter(Boolean).join(' ');
    const potentialMatches = (
      profile.location ||
      profile.propertyType ||
      profile.budget ||
      intent === 'PROPERTY_SEARCH' ||
      intent === 'PRECON_INQUIRY' ||
      intent === 'RESALE_INQUIRY' ||
      lower.includes('whitby') ||
      lower.includes('brooklin') ||
      lower.includes('oshawa') ||
      lower.includes('pickering')
    ) ? aiAssistantStore.findPropertyRecommendations(searchTerms, 3) : [];

    // STRICT USER INTENT RULE: ONLY attach recommended property cards if the user explicitly confirmed or asked to see them!
    let recommendedProperties: AssistantPropertyCardData[] | undefined = undefined;
    if (userExplicitlyRequestedProperties && potentialMatches.length > 0) {
      recommendedProperties = potentialMatches;
    }

    // 5. Build Fast Gemini Prompt
    const apiKey = process.env.GEMINI_API_KEY;
    let answerText = '';
    let suggestedQuickReplies: string[] = [];

    if (apiKey) {
      const systemInstruction = `You are a fast, knowledgeable, human Ontario real estate advisor assisting clients of Amit Sawhney (Licensed REALTOR®, Blueprint Realty Brokerage Inc., Direct Hotline: 647-895-3613).

CRITICAL UX PRINCIPLES:
1. Fast. Short. Relevant. Conversational. Helpful. Human.
2. DO NOT DISPLAY PROPERTY LISTINGS FOR EVERY QUESTION:
   - When a user asks about an area, home type, or budget, advise them on the community/market first.
   - If properties are available, mention it naturally (e.g., "I found 3 great options in ${profile.location || 'this area'}. Want to see them?") rather than dumping cards.
   - Only when the user explicitly says "show me", "see properties", "yes", or "browse homes" will property cards be displayed.
3. ANSWER FIRST, THEN OFFER MORE: Never force a user through a questionnaire before answering their question.
4. RESPONSE LENGTH LIMITS (Progressive Disclosure):
   - Simple question: 1–3 short sentences.
   - Normal question: 2–4 short bullets or concise paragraphs.
   - Complex question: 5–6 bullets maximum.
5. ASK ONE QUESTION AT A TIME: Never overwhelm with multiple questions. If location is known, ask for budget. If budget is known, ask for property type.
6. NEVER REPEAT THE USER'S QUESTION: Do NOT say "You asked what cashback is..." or "Regarding your question about Whitby...". Answer directly.
7. NO ROBOTIC AI CLICHÉS: Never say "I am pleased to inform you", "Based on your inquiry", "As an AI language model", or "I would be delighted". Sound like an experienced, warm Ontario realtor chatting with a client.
8. DON'T REPEAT INFORMATION: Current Known Profile: ${JSON.stringify(profile)}. If an attribute is already known, do not ask for it again!
9. NO SALES NAGGING: Do not push "Speak to an agent" repeatedly. Recommend Amit or floor plans only when natural.
10. GROUNDING:
   - Pre-con: 10-day cooling off period (s.73 Condo Act), Tarion 7-yr warranty, capped developer charges.
   - Cashback: "Buy Smart, Save Big" returns up to 1.0% rebate on closing with $0 buyer commission fees.
   - Coverage: Greater Toronto Area & Durham Region (Whitby, Brooklin, Oshawa, Courtice, Pickering, Ajax).

REPLY FORMULA:
Answer directly → Optional brief context/bullet → One clear next step or question.`;

      const prompt = `CURRENT VISITOR PROFILE:
- Location: ${profile.location || 'Unknown'}
- Property Type: ${profile.propertyType || 'Unknown'}
- Budget: ${profile.budget || 'Unknown'}
- Buyer Type: ${profile.buyerType || 'Unknown'}
- User explicitly asked to see property cards: ${userExplicitlyRequestedProperties ? 'YES' : 'NO'}

VISITOR MESSAGE: "${q}"`;

      answerText = (await callGeminiAdvisor(apiKey, systemInstruction, prompt)) || '';
    }

    // Fallback if no answer generated
    if (!answerText) {
      if (userExplicitlyRequestedProperties && potentialMatches.length > 0) {
        answerText = `Here are the top properties matching your criteria in ${profile.location || 'Durham Region'}.\n\nWant me to send you the floor plans or schedule a showing?`;
      } else if (potentialMatches.length > 0 && (profile.location || profile.propertyType)) {
        answerText = `Great choice. ${profile.location || 'Durham Region'} has strong ${profile.propertyType ? profile.propertyType.toLowerCase() + ' ' : ''}developments right now.\n\nI found ${potentialMatches.length} matching properties. **Want to see them?**`;
      } else if (intent === 'CASHBACK_INQUIRY') {
        answerText = `Cashback is a portion of the commission returned directly to you on closing, saving you thousands on your purchase.\n\nWant me to estimate your cashback for a specific price?`;
      } else if (profile.location && !profile.budget) {
        answerText = `Great choice — ${profile.location} has excellent communities right now.\n\nRoughly what budget are you considering?`;
      } else {
        answerText = `I can help with that. Whether you're exploring pre-construction launches, resale listings, or our 1% buyer cashback program.\n\nWhat are you looking for most?`;
      }
    }

    // 6. Generate Contextual Quick-Reply Buttons (Minimizing User Typing)
    if (recommendedProperties && recommendedProperties.length > 0) {
      // User just saw properties! Offer next actions
      suggestedQuickReplies = ['Send Floor Plans', 'View Deposit Details', 'Ask a Question'];
    } else if (potentialMatches.length > 0 && !userExplicitlyRequestedProperties && (profile.location || profile.propertyType || intent === 'PROPERTY_SEARCH')) {
      // Properties exist, but user hasn't explicitly confirmed viewing them yet! Offer single-tap "Show Properties"
      suggestedQuickReplies = [
        'Show Properties',
        !profile.budget ? 'Select Budget' : 'Pre-Con vs Resale',
        'Ask a Question'
      ];
    } else if (!profile.budget && (intent === 'PROPERTY_SEARCH' || profile.location || lower.includes('buy') || lower.includes('home') || lower.includes('pre-con'))) {
      suggestedQuickReplies = ['Under $600K', '$600K–$800K', '$800K–$1M', '$1M+'];
    } else if (!profile.propertyType && (profile.budget || profile.location)) {
      suggestedQuickReplies = ['Detached Home', 'Townhouse', 'Condo', 'Not Sure'];
    } else if (!profile.location && (intent === 'PROPERTY_SEARCH' || lower.includes('buy'))) {
      suggestedQuickReplies = ['Whitby & Brooklin', 'Pickering & Ajax', 'Oshawa & Courtice', 'Other GTA'];
    } else if (intent === 'CASHBACK_INQUIRY') {
      suggestedQuickReplies = ['Calculate on $800k', 'Calculate on $1M', 'How does payout work?'];
    } else if (intent === 'PRECON_INQUIRY') {
      suggestedQuickReplies = ['10-Day Cooling Off', 'Deposit Schedules', 'Brooklin & Whitby VIP'];
    } else {
      suggestedQuickReplies = ['Buy a Home', 'Pre-Construction', 'Cashback', 'Ask a Question'];
    }

    const responsePayload: AssistantChatResponse = {
      answer: answerText,
      intent,
      conversationState: nextState,
      visitorProfile: profile,
      recommendedProperties,
      suggestedQuickReplies,
      statusFeedback: recommendedProperties ? `🔎 Found ${recommendedProperties.length} matching properties` : undefined,
      showConsultationPrompt: intent === 'CONSULTATION_REQUEST' || (nextState === 'HIGH_INTENT' && !profile.phone)
    };

    res.json(responsePayload);
  } catch (error: any) {
    console.error('Error in /api/ai-assistant/chat:', error);
    res.status(500).json({
      error: 'An error occurred while processing your request.',
      message: error.message
    });
  }
});

// 2. POST /api/ai-assistant/lead - Direct Lead Capture from Chat UI
aiAssistantRouter.post('/lead', (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      phone,
      buyerType,
      targetLocation,
      budgetRange,
      timeframe,
      propertyTypeInterest,
      workingWithRealtor,
      preApprovedMortgage,
      intent,
      associatedProjectId,
      associatedProjectName,
      conversationSnippet,
      sourceUrl
    } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({ error: 'Full name and phone number are required.' });
    }

    const savedLead = aiAssistantStore.saveLead({
      fullName,
      email: email || '',
      phone,
      buyerType,
      targetLocation,
      budgetRange,
      timeframe,
      propertyTypeInterest,
      workingWithRealtor,
      preApprovedMortgage,
      intent,
      associatedProjectId,
      associatedProjectName,
      conversationSnippet,
      sourceUrl
    });

    res.status(201).json({
      success: true,
      lead: savedLead,
      message: 'VIP inquiry registered. Amit Sawhney will follow up shortly.'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to capture lead.' });
  }
});

// 3. GET /api/ai-assistant/leads - Retrieve Leads (Guarded)
aiAssistantRouter.get('/leads', requireAuth, requireRole('AGENT'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const leads = aiAssistantStore.getLeads();
    const stats = aiAssistantStore.getStats();
    res.json({ success: true, leads, stats });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve AI leads.' });
  }
});
