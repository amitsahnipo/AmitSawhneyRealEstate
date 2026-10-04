import { PROJECTS_DATA } from '../src/data/projects.js';
import { RESALE_LISTINGS_DATA } from '../src/data/resale.js';
import { LIVE_REALTOR_LISTINGS } from './realtorService.js';
import { AssistantLeadRecord, AssistantPropertyCardData, AssistantLeadTier, AssistantLeadStatus, AssistantIntent } from '../src/types/assistant.js';

export class AIAssistantStore {
  private leads: Map<string, AssistantLeadRecord> = new Map();
  private sessionTranscripts: Map<string, Array<{ role: 'user' | 'assistant'; text: string; time?: string }>> = new Map();

  constructor() {
    this.seedInitialLeads();
  }

  private seedInitialLeads() {
    const lead1: AssistantLeadRecord = {
      id: 'ai-lead-101',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      fullName: 'Michael Vanderberg',
      email: 'm.vanderberg@gmail.com',
      phone: '(416) 555-8392',
      buyerType: 'Investor',
      targetLocation: 'Whitby & Brooklin (Durham Region)',
      budgetRange: '$750,000 - $900,000',
      timeframe: '1 to 3 Months',
      propertyTypeInterest: 'Pre-Construction Townhome',
      workingWithRealtor: false,
      preApprovedMortgage: true,
      leadScore: 92,
      scoreTier: 'HOT',
      scoreReasons: [
        'Short purchase horizon (1 to 3 months)',
        'Not committed to another realtor (RECO clear)',
        'Mortgage pre-approved for $900k+',
        'Requested VIP floor plans & deposit schedules for Brooklin Trails'
      ],
      intent: 'PRECON_INQUIRY',
      status: 'NEW',
      agentNotes: 'Client is keen on Tribute master-planned development in Brooklin. Needs extended deposit schedule breakdown.',
      conversationSummary: 'Michael inquired about pre-construction townhomes in Brooklin with closing in 2027. Asked about 10-day cooling off period and builder assignment clauses.',
      conversationSnippet: [
        { role: 'user', text: 'Looking for 3-bed townhomes in Brooklin or Whitby under $900k with good builder reputation.' },
        { role: 'assistant', text: 'Brooklin Trails by Tribute Communities is a standout choice with master-planned parkland and 15% extended deposits.' },
        { role: 'user', text: 'What is the deposit structure and can I get early VIP pricing? Phone is (416) 555-8392.' }
      ],
      associatedProjectId: 'brooklin-trails-tribute',
      associatedProjectName: 'Brooklin Trails By Tribute'
    };

    const lead2: AssistantLeadRecord = {
      id: 'ai-lead-102',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      fullName: 'Sarah & Kenji Tanaka',
      email: 'tanaka.family@outlook.com',
      phone: '(905) 555-4190',
      buyerType: 'First-Time Buyer',
      targetLocation: 'Pickering Waterfront & Ajax',
      budgetRange: '$580,000 - $680,000',
      timeframe: '3 to 6 Months',
      propertyTypeInterest: '1 Bed + Den or 2 Bed Condo',
      workingWithRealtor: false,
      preApprovedMortgage: false,
      leadScore: 78,
      scoreTier: 'WARM',
      scoreReasons: [
        'First-time home buyer with FHSA eligibility',
        'Interested in Buy Smart Save Big cashback rebate (~$6,000)',
        'Timeline 3-6 months with flexible move date'
      ],
      intent: 'CASHBACK_INQUIRY',
      status: 'CONTACTED',
      agentNotes: 'Emailed buyer representation guide and cashback calculator example. Follow up for mortgage specialist introduction.',
      conversationSummary: 'Sarah asked how the 1% cashback program works for first-time buyers and inquired about Pickering City Centre transit connection.',
      conversationSnippet: [
        { role: 'user', text: 'Hi! Can you explain how the 1% cashback works if we buy a pre-construction condo in Pickering?' },
        { role: 'assistant', text: 'Amit Sawhney provides up to 1.0% cashback rebate from the builder commission back to you upon closing, with zero buyer agent fees.' },
        { role: 'user', text: 'That would save us over $6,000! My email is tanaka.family@outlook.com, please send details.' }
      ],
      associatedProjectId: 'pickering-city-centre',
      associatedProjectName: 'Pickering City Centre'
    };

    this.leads.set(lead1.id, lead1);
    this.leads.set(lead2.id, lead2);
  }

  // Calculate Lead Score (0 - 100)
  public calculateLeadScore(data: {
    timeframe?: string;
    budgetRange?: string;
    workingWithRealtor?: boolean;
    preApprovedMortgage?: boolean | 'unknown';
    phone?: string;
    email?: string;
    buyerType?: string;
    hasSpecificProject?: boolean;
  }): { score: number; tier: AssistantLeadTier; reasons: string[] } {
    let score = 20; // Base score for having an advisory conversation
    const reasons: string[] = [];

    // Contact info provided
    if (data.phone && data.phone.trim().length >= 7) {
      score += 20;
      reasons.push('Verified phone number provided');
    }
    if (data.email && data.email.includes('@')) {
      score += 10;
      reasons.push('Direct email captured');
    }

    // Timeline urgency
    if (data.timeframe) {
      const tf = data.timeframe.toLowerCase();
      if (tf.includes('immediate') || tf.includes('0-30') || tf.includes('now')) {
        score += 25;
        reasons.push('High-urgency immediate purchase timeline (0-30 days)');
      } else if (tf.includes('1 to 3') || tf.includes('1-3') || tf.includes('3 months')) {
        score += 20;
        reasons.push('Active purchase window (1-3 months)');
      } else if (tf.includes('3 to 6') || tf.includes('3-6')) {
        score += 12;
        reasons.push('Medium-term purchase planning (3-6 months)');
      } else {
        score += 5;
        reasons.push('Long-term exploration');
      }
    }

    // Representation Status (RECO compliance)
    if (data.workingWithRealtor === false) {
      score += 15;
      reasons.push('Unrepresented buyer (prime client opportunity)');
    } else if (data.workingWithRealtor === true) {
      score -= 20;
      reasons.push('Under existing representation (information-only)');
    }

    // Budget defined
    if (data.budgetRange && data.budgetRange !== 'Flexible' && data.budgetRange.length > 3) {
      score += 10;
      reasons.push(`Clear budget definition (${data.budgetRange})`);
    }

    // Mortgage pre-approved
    if (data.preApprovedMortgage === true) {
      score += 10;
      reasons.push('Financially pre-approved for mortgage');
    }

    // Specific project engagement
    if (data.hasSpecificProject) {
      score += 8;
      reasons.push('Targeting specific community development');
    }

    // Clamp score
    const finalScore = Math.max(10, Math.min(100, score));
    let tier: AssistantLeadTier = 'NURTURE';
    if (finalScore >= 80) tier = 'HOT';
    else if (finalScore >= 50) tier = 'WARM';

    return { score: finalScore, tier, reasons };
  }

  // Create or Update Lead
  public saveLead(leadData: Partial<AssistantLeadRecord> & { fullName: string; phone: string }): AssistantLeadRecord {
    const existingId = leadData.id;
    const now = new Date().toISOString();

    const scoring = this.calculateLeadScore({
      timeframe: leadData.timeframe,
      budgetRange: leadData.budgetRange,
      workingWithRealtor: leadData.workingWithRealtor,
      preApprovedMortgage: leadData.preApprovedMortgage,
      phone: leadData.phone,
      email: leadData.email,
      buyerType: leadData.buyerType,
      hasSpecificProject: Boolean(leadData.associatedProjectId)
    });

    const leadId = existingId || `ai-lead-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const fullLead: AssistantLeadRecord = {
      id: leadId,
      createdAt: leadData.createdAt || now,
      updatedAt: now,
      fullName: leadData.fullName,
      email: leadData.email || '',
      phone: leadData.phone,
      buyerType: leadData.buyerType || 'First-Time Buyer',
      targetLocation: leadData.targetLocation || 'GTA / Durham Region',
      budgetRange: leadData.budgetRange || 'Flexible',
      timeframe: leadData.timeframe || '3 to 6 Months',
      propertyTypeInterest: leadData.propertyTypeInterest || 'Pre-Construction & Resale',
      workingWithRealtor: leadData.workingWithRealtor ?? false,
      preApprovedMortgage: leadData.preApprovedMortgage ?? 'unknown',
      leadScore: leadData.leadScore || scoring.score,
      scoreTier: leadData.scoreTier || scoring.tier,
      scoreReasons: leadData.scoreReasons || scoring.reasons,
      intent: leadData.intent || 'GENERAL_ADVISORY',
      status: leadData.status || 'NEW',
      agentNotes: leadData.agentNotes || '',
      conversationSummary: leadData.conversationSummary || 'Lead generated via AI Real Estate Assistant conversation.',
      conversationSnippet: leadData.conversationSnippet || [],
      associatedProjectId: leadData.associatedProjectId,
      associatedProjectName: leadData.associatedProjectName,
      sourceUrl: leadData.sourceUrl || '/'
    };

    this.leads.set(leadId, fullLead);
    return fullLead;
  }

  public getLeads(): AssistantLeadRecord[] {
    return Array.from(this.leads.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getLeadById(id: string): AssistantLeadRecord | undefined {
    return this.leads.get(id);
  }

  public updateLeadStatus(id: string, status: AssistantLeadStatus, agentNotes?: string): AssistantLeadRecord | null {
    const lead = this.leads.get(id);
    if (!lead) return null;

    lead.status = status;
    if (agentNotes !== undefined) {
      lead.agentNotes = agentNotes;
    }
    lead.updatedAt = new Date().toISOString();
    this.leads.set(id, lead);
    return lead;
  }

  public getStats() {
    const all = Array.from(this.leads.values());
    const hotCount = all.filter(l => l.scoreTier === 'HOT').length;
    const warmCount = all.filter(l => l.scoreTier === 'WARM').length;
    const nurtureCount = all.filter(l => l.scoreTier === 'NURTURE').length;
    const newCount = all.filter(l => l.status === 'NEW').length;
    const contactedCount = all.filter(l => l.status === 'CONTACTED').length;
    const bookedCount = all.filter(l => l.status === 'CONSULTATION_BOOKED').length;

    return {
      totalLeads: all.length,
      hotCount,
      warmCount,
      nurtureCount,
      newCount,
      contactedCount,
      bookedCount
    };
  }

  // Find Property Recommendations based on natural query
  public findPropertyRecommendations(query: string, maxItems: number = 3): AssistantPropertyCardData[] {
    const q = query.toLowerCase();
    const recommendations: AssistantPropertyCardData[] = [];

    // Check pre-construction projects first
    for (const project of PROJECTS_DATA) {
      const matchScore =
        (project.name.toLowerCase().includes(q) ? 3 : 0) +
        (project.location.city.toLowerCase().includes(q) ? 3 : 0) +
        (project.location.region.toLowerCase().includes(q) ? 2 : 0) +
        (project.propertyTypes.some(pt => q.includes(pt.toLowerCase())) ? 2 : 0) +
        (q.includes('pre-con') || q.includes('precon') || q.includes('new build') ? 1 : 0);

      if (matchScore > 0 || (recommendations.length === 0 && (q.includes('under') || q.includes('condo') || q.includes('town')))) {
        recommendations.push({
          id: project.id,
          type: 'preconstruction',
          title: project.name,
          subtitle: `By ${project.builder} • ${project.location.city}`,
          priceDisplay: project.priceRange.display,
          city: project.location.city,
          image: project.image,
          badge: project.status,
          depositSummary: project.depositStructure?.length ? `${project.depositStructure[0].percentage}% at signing` : 'Flexible VIP deposit',
          highlights: project.highlights.slice(0, 2),
          actionLabel: 'Request VIP Package'
        });
      }
      if (recommendations.length >= maxItems) break;
    }

    // Also check resale if pre-con wasn't enough or query matches resale
    if (recommendations.length < maxItems) {
      for (const resale of RESALE_LISTINGS_DATA) {
        const matchScore =
          (resale.title.toLowerCase().includes(q) ? 3 : 0) +
          (resale.city.toLowerCase().includes(q) ? 3 : 0) +
          (resale.region.toLowerCase().includes(q) ? 2 : 0) +
          (resale.propertyType.toLowerCase().includes(q) ? 2 : 0);

        if (matchScore > 0 || recommendations.length < 2) {
          recommendations.push({
            id: resale.id,
            type: 'resale',
            title: resale.title,
            subtitle: `${resale.bedrooms} Bed, ${resale.bathrooms} Bath • ${resale.city}`,
            priceDisplay: resale.priceDisplay,
            city: resale.city,
            beds: resale.bedrooms,
            baths: resale.bathrooms,
            sqft: resale.sqft,
            image: resale.image,
            badge: resale.status,
            highlights: resale.features.slice(0, 2),
            actionLabel: 'Schedule Showing'
          });
        }
        if (recommendations.length >= maxItems) break;
      }
    }

    return recommendations.slice(0, maxItems);
  }
}

export const aiAssistantStore = new AIAssistantStore();
