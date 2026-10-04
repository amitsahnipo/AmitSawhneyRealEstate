import {
  ValuationAnalytics,
  ValuationAuditRecord,
  ValuationEngineConfig,
  ValuationLeadSubmission,
  ValuationResponse
} from './types.js';
import { DEFAULT_VALUATION_CONFIG } from './valuationConfig.js';

class ValuationStore {
  private config: ValuationEngineConfig = { ...DEFAULT_VALUATION_CONFIG };
  private auditRecords: Map<string, ValuationAuditRecord> = new Map();
  private leadSubmissions: Map<string, ValuationLeadSubmission> = new Map();

  constructor() {
    this.seedInitialAudits();
  }

  private seedInitialAudits() {
    // Seed a couple realistic audits so analytics and audit trail are rich from day 1
    const sample1: ValuationAuditRecord = {
      auditId: 'cma-wht-seed-01',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      subjectAddress: '123 Main Street, Whitby, ON',
      municipality: 'Whitby',
      province: 'ON',
      propertyType: 'Detached Home',
      estimatedValue: 945000,
      lowValue: 910000,
      highValue: 980000,
      confidence: 'High',
      comparablesCount: 5,
      comparableIds: ['comp-wht-01', 'comp-wht-02', 'comp-wht-03'],
      modelVersion: 'cma-scoring-v2.1',
      aiPromptVersion: 'gemini-cma-prompt-v2',
      userAdjustedDetails: false,
      mode: 'seller'
    };

    const sample2: ValuationAuditRecord = {
      auditId: 'cma-brk-seed-02',
      timestamp: new Date(Date.now() - 3600000 * 26).toISOString(),
      subjectAddress: '18 Carnwith Drive East, Brooklin, ON',
      municipality: 'Brooklin',
      province: 'ON',
      propertyType: 'Detached Home',
      estimatedValue: 1145000,
      lowValue: 1100000,
      highValue: 1190000,
      confidence: 'High',
      comparablesCount: 4,
      comparableIds: ['comp-brk-01', 'comp-brk-02', 'comp-brk-03'],
      modelVersion: 'cma-scoring-v2.1',
      aiPromptVersion: 'gemini-cma-prompt-v2',
      userAdjustedDetails: true,
      mode: 'buyer'
    };

    this.auditRecords.set(sample1.auditId, sample1);
    this.auditRecords.set(sample2.auditId, sample2);
  }

  public getConfig(): ValuationEngineConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<ValuationEngineConfig>): ValuationEngineConfig {
    this.config = {
      ...this.config,
      ...newConfig,
      weights: {
        ...this.config.weights,
        ...(newConfig.weights || {})
      }
    };
    return { ...this.config };
  }

  public recordAudit(valuation: ValuationResponse, mode: 'seller' | 'buyer', userAdjusted = false): void {
    const record: ValuationAuditRecord = {
      auditId: valuation.auditId,
      timestamp: new Date().toISOString(),
      subjectAddress: valuation.subjectProperty.address,
      municipality: valuation.subjectProperty.municipality,
      province: valuation.subjectProperty.province,
      propertyType: valuation.subjectProperty.propertyType,
      estimatedValue: valuation.estimatedValue,
      lowValue: valuation.lowValue,
      highValue: valuation.highValue,
      confidence: valuation.confidence,
      comparablesCount: valuation.comparablesCount,
      comparableIds: valuation.comparables.map(c => c.id),
      modelVersion: 'cma-scoring-v2.1',
      aiPromptVersion: 'gemini-cma-prompt-v2',
      userAdjustedDetails: userAdjusted,
      mode
    };
    this.auditRecords.set(record.auditId, record);
  }

  public recordLead(lead: ValuationLeadSubmission): ValuationLeadSubmission {
    this.leadSubmissions.set(lead.id, lead);
    return lead;
  }

  public getLeads(): ValuationLeadSubmission[] {
    return Array.from(this.leadSubmissions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getAuditRecord(auditId: string): ValuationAuditRecord | undefined {
    return this.auditRecords.get(auditId);
  }

  public getAnalytics(): ValuationAnalytics {
    const audits = Array.from(this.auditRecords.values());
    const totalValuations = audits.length;

    const valuationsByCity: Record<string, number> = {};
    const valuationsByProvince: Record<string, number> = {};
    let sumEstimatedValue = 0;
    let sellerCount = 0;
    let buyerCount = 0;
    let insufficientCount = 0;

    audits.forEach(a => {
      valuationsByCity[a.municipality] = (valuationsByCity[a.municipality] || 0) + 1;
      valuationsByProvince[a.province] = (valuationsByProvince[a.province] || 0) + 1;
      sumEstimatedValue += a.estimatedValue;
      if (a.mode === 'buyer') buyerCount++;
      else sellerCount++;
      if (a.estimatedValue === 0) insufficientCount++;
    });

    const averageEstimatedValue = totalValuations > 0 ? Math.round(sumEstimatedValue / totalValuations) : 0;
    const leadConversionCount = this.leadSubmissions.size;
    const leadConversionRate = totalValuations > 0 ? Number(((leadConversionCount / totalValuations) * 100).toFixed(1)) : 0;

    const recentAudits = [...audits]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15);

    return {
      totalValuations,
      valuationsByCity,
      valuationsByProvince,
      averageEstimatedValue,
      leadConversionCount,
      leadConversionRate,
      buyerVsSellerRatio: {
        sellerCount,
        buyerCount
      },
      insufficientDataCount: insufficientCount,
      recentAudits
    };
  }
}

export const valuationStore = new ValuationStore();
