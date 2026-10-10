export interface Location {
  name: string;
  title: string;
  storeCode?: string;
  address?: string;
  primaryCategory?: string;
}

export interface ReviewReply {
  comment: string;
  updateTime: string;
}

export interface Review {
  reviewId: string;
  name?: string;
  reviewer: { displayName: string; profilePhotoUrl?: string };
  starRating: string;
  comment?: string;
  createTime: string;
  updateTime?: string;
  reviewReply?: ReviewReply;
}

export interface Post {
  id: string;
  locationName: string;
  topicType: 'STANDARD' | 'EVENT' | 'OFFER';
  summary: string;
  callToAction?: {
    actionType: 'BOOK' | 'ORDER' | 'SHOP' | 'LEARN_MORE' | 'CALL' | 'SIGN_UP';
    url: string;
  };
  mediaUrl?: string;
  createTime: string;
  offer?: {
    couponCode?: string;
    terms?: string;
  };
  event?: {
    title?: string;
    startDate?: string;
    endDate?: string;
  };
}

export interface BusinessService {
  id: string;
  locationName: string;
  category: string;
  name: string;
  price?: number;
  priceType: 'FIXED' | 'STARTING_AT' | 'FREE';
  currency: string;
  description: string;
  enabled: boolean;
}

export interface StoreHour {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface SentimentAnalysis {
  overallSentiment: 'POSITIVE' | 'NEUTRAL' | 'ATTENTION_REQUIRED';
  positiveScore: number;
  neutralScore: number;
  negativeScore: number;
  topPraises: string[];
  topComplaints: string[];
  actionRecommendation: string;
}

export type TabType = 'dashboard' | 'reviews' | 'reports' | 'autoreply' | 'posts' | 'services' | 'sheets' | 'growth';
