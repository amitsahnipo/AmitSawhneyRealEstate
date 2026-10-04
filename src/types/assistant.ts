export type AssistantLeadTier = 'HOT' | 'WARM' | 'NURTURE';

export type AssistantLeadStatus = 'NEW' | 'CONTACTED' | 'CONSULTATION_BOOKED' | 'QUALIFIED' | 'ARCHIVED';

export type AssistantIntent =
  | 'PROPERTY_SEARCH'
  | 'PRECON_INQUIRY'
  | 'RESALE_INQUIRY'
  | 'CASHBACK_INQUIRY'
  | 'MARKET_VALUATION'
  | 'LEAD_CAPTURE'
  | 'CONSULTATION_REQUEST'
  | 'GENERAL_ADVISORY'
  | 'JUST_BROWSING';

export type AssistantConversationState =
  | 'NEW_VISITOR'
  | 'EXPLORING'
  | 'INFORMATION_SEEKING'
  | 'PROPERTY_SEARCH'
  | 'QUALIFYING'
  | 'HIGH_INTENT'
  | 'LEAD_CAPTURE'
  | 'HUMAN_HANDOFF'
  | 'COMPLETED';

export interface VisitorProfile {
  propertyType?: string;
  location?: string;
  budget?: string;
  timeline?: string;
  buyerType?: string;
  email?: string;
  phone?: string;
  fullName?: string;
  workingWithRealtor?: boolean;
}

export interface AssistantPropertyCardData {
  id: string;
  type: 'preconstruction' | 'resale' | 'mls';
  title: string;
  subtitle: string;
  priceDisplay: string;
  city: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  image: string;
  badge?: string;
  depositSummary?: string;
  highlights?: string[];
  actionLabel?: string;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  intent?: AssistantIntent;
  quickReplies?: string[];
  recommendedProperties?: AssistantPropertyCardData[];
  showLeadForm?: boolean;
  leadFormPreFill?: {
    buyerType?: string;
    budget?: string;
    timeline?: string;
    targetLocation?: string;
  };
  showConsultationPrompt?: boolean;
  isStreaming?: boolean;
  conversationState?: AssistantConversationState;
  statusFeedback?: string;
}

export interface AssistantLeadRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  email: string;
  phone: string;
  buyerType: 'First-Time Buyer' | 'Investor' | 'Upsizing / Move-Up' | 'Downsizing' | 'Relocating' | 'Other';
  targetLocation: string;
  budgetRange: string;
  timeframe: 'Immediate (0-30 days)' | '1 to 3 Months' | '3 to 6 Months' | '6 to 12 Months' | '1+ Year' | 'Exploring';
  propertyTypeInterest: string;
  workingWithRealtor: boolean;
  preApprovedMortgage: boolean | 'unknown';
  leadScore: number; // 0 - 100
  scoreTier: AssistantLeadTier;
  scoreReasons: string[];
  intent: AssistantIntent;
  status: AssistantLeadStatus;
  agentNotes?: string;
  conversationSummary: string;
  conversationSnippet: Array<{ role: 'user' | 'assistant'; text: string; time?: string }>;
  associatedProjectId?: string;
  associatedProjectName?: string;
  sourceUrl?: string;
}

export interface AssistantChatRequest {
  sessionId: string;
  messages: Array<{ role: 'user' | 'assistant'; text: string }>;
  currentMessage: string;
  conversationState?: AssistantConversationState;
  visitorProfile?: VisitorProfile;
  lastRecommendedProperties?: AssistantPropertyCardData[];
  activeContext?: {
    projectId?: string;
    projectName?: string;
    page?: string;
    city?: string;
  };
}

export interface AssistantChatResponse {
  answer: string;
  intent: AssistantIntent;
  conversationState: AssistantConversationState;
  visitorProfile?: VisitorProfile;
  recommendedProperties?: AssistantPropertyCardData[];
  suggestedQuickReplies: string[];
  statusFeedback?: string;
  showLeadForm?: boolean;
  showConsultationPrompt?: boolean;
  leadQualification?: {
    buyerType?: string;
    targetLocation?: string;
    budgetRange?: string;
    timeframe?: string;
    workingWithRealtor?: boolean;
    confidenceScore?: number;
  };
}
