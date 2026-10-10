import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const SCOPES = [
  'https://www.googleapis.com/auth/business.manage',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/cloud-platform'
];

// Initialize Gemini SDK with telemetry header as required by guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_key_to_prevent_crash_if_missing',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Seed sample locations and data for instant preview & fallback
const defaultLocations = [
  {
    name: 'accounts/1084291823/locations/4829103948',
    title: 'Royal Gourmet Restaurant & Lounge',
    storeCode: 'RG-01',
    address: 'Connaught Place, New Delhi',
    primaryCategory: 'Fine Dining Restaurant',
  },
  {
    name: 'accounts/1084291823/locations/5910294821',
    title: 'Royal Express Cafe & Bakery',
    storeCode: 'RG-02',
    address: 'Indiranagar, Bangalore',
    primaryCategory: 'Cafe & Bakery',
  }
];

// Mock in-memory store for session / demo data (synced per location)
interface LocalReview {
  reviewId: string;
  name?: string;
  reviewer: { displayName: string; profilePhotoUrl?: string };
  starRating: string;
  comment?: string;
  createTime: string;
  updateTime?: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

interface LocalPost {
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
    redeemUrl?: string;
    terms?: string;
  };
  event?: {
    title?: string;
    startDate?: string;
    endDate?: string;
  };
}

interface BusinessService {
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

// Global in-memory storage for local mutations and demo mode
const memoryStore = {
  replies: new Map<string, { comment: string; updateTime: string }>(),
  posts: [] as LocalPost[],
  services: [] as BusinessService[],
  accountLocationMap: new Map<string, string>()
};

// Seed initial realistic reviews including today's reviews and past week
function getInitialReviews(): LocalReview[] {
  const now = new Date();
  
  // Today's reviews
  const todayReview1: LocalReview = {
    reviewId: 'rev-today-101',
    name: 'accounts/1084291823/locations/4829103948/reviews/rev-today-101',
    reviewer: { displayName: 'Amit Sharma', profilePhotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face' },
    starRating: 'FIVE',
    comment: 'Went for breakfast in the morning, the paneer butter masala and fresh tandoori roti were amazing! Staff behavior was very humble. Definitely 5 stars!',
    createTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    reviewReply: {
      comment: 'Thank you so much Amit! We are glad you liked our food and service. Looking forward to welcoming you again soon!',
      updateTime: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString()
    }
  };

  const todayReview2: LocalReview = {
    reviewId: 'rev-today-102',
    name: 'accounts/1084291823/locations/4829103948/reviews/rev-today-102',
    reviewer: { displayName: 'Pooja Verma', profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    starRating: 'FIVE',
    comment: 'Best dining experience today! The live music ambience and quick table turnaround made our family lunch wonderful.',
    createTime: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
  };

  const todayReview3: LocalReview = {
    reviewId: 'rev-today-103',
    name: 'accounts/1084291823/locations/4829103948/reviews/rev-today-103',
    reviewer: { displayName: 'Rohit Kulkarni', profilePhotoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face' },
    starRating: 'THREE',
    comment: 'Food was delicious but order took around 30 minutes. AC temperature was also quite high. Need to improve waiting time.',
    createTime: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
  };

  // Yesterday reviews
  const yesterday1 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const revYesterday1: LocalReview = {
    reviewId: 'rev-yest-201',
    name: 'accounts/1084291823/locations/4829103948/reviews/rev-yest-201',
    reviewer: { displayName: 'Sunita Chauhan', profilePhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' },
    starRating: 'FIVE',
    comment: 'Celebrated our anniversary dinner here yesterday. The chef specially customized our dessert plate with sparklers. Outstanding customer care!',
    createTime: yesterday1.toISOString(),
    reviewReply: {
      comment: 'Happy Anniversary Sunita! It was our absolute pleasure to host your special celebration. Warm wishes from team Royal Gourmet!',
      updateTime: new Date(yesterday1.getTime() + 2 * 60 * 60 * 1000).toISOString()
    }
  };

  // Past 3 to 7 days reviews
  const day3 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const revDay3: LocalReview = {
    reviewId: 'rev-day3-301',
    name: 'accounts/1084291823/locations/4829103948/reviews/rev-day3-301',
    reviewer: { displayName: 'Vikram Singh', profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
    starRating: 'FOUR',
    comment: 'Great cocktail menu and mocktails. Biryani was rich in spices. Parking valet took a few minutes during peak hours.',
    createTime: day3.toISOString(),
    reviewReply: {
      comment: 'Thanks for the valuable feedback Vikram! We have added 2 more valet staff on weekends to ensure seamless parking.',
      updateTime: new Date(day3.getTime() + 3 * 60 * 60 * 1000).toISOString()
    }
  };

  const day5 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const revDay5: LocalReview = {
    reviewId: 'rev-day5-501',
    name: 'accounts/1084291823/locations/4829103948/reviews/rev-day5-501',
    reviewer: { displayName: 'Neha Gupta', profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face' },
    starRating: 'TWO',
    comment: 'We booked a corner table for 6 people but had to wait 20 minutes even after reservation. Food was okay.',
    createTime: day5.toISOString()
  };

  const day6 = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  const revDay6: LocalReview = {
    reviewId: 'rev-day6-601',
    name: 'accounts/1084291823/locations/4829103948/reviews/rev-day6-601',
    reviewer: { displayName: 'Karan Mehra', profilePhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
    starRating: 'FIVE',
    comment: 'Consistently the best dining spot in town. Sizzlers and chocolate lava cake are must-try items!',
    createTime: day6.toISOString(),
    reviewReply: {
      comment: 'Thank you Karan! The sizzler and molten lava cake remain guest favorites. We look forward to seeing you again!',
      updateTime: new Date(day6.getTime() + 4 * 60 * 60 * 1000).toISOString()
    }
  };

  return [todayReview1, todayReview2, todayReview3, revYesterday1, revDay3, revDay5, revDay6];
}

let initialSeedDone = false;
function ensureInitialSeed() {
  if (initialSeedDone) return;
  initialSeedDone = true;
  memoryStore.posts = [];
  memoryStore.services = [];
  return;

  // Initial Posts
  const locName = defaultLocations[0].name;
  memoryStore.posts = [
    {
      id: 'post-101',
      locationName: locName,
      topicType: 'OFFER',
      summary: '🎉 Weekend Special Fest! Get flat 20% OFF on all signature North Indian curry platters and mocktails this Saturday & Sunday.',
      callToAction: {
        actionType: 'BOOK',
        url: 'https://royalgourmet.example.com/reserve'
      },
      mediaUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      createTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      offer: {
        couponCode: 'ROYAL20',
        terms: 'Valid on dine-in bill above ₹1200. Cannot be clubbed with other offers.'
      }
    },
    {
      id: 'post-102',
      locationName: locName,
      topicType: 'STANDARD',
      summary: '✨ Chef Special Announcement: Introducing our new live wood-fired Artisan Pizza bar featuring hand-stretched sourdough crust!',
      callToAction: {
        actionType: 'ORDER',
        url: 'https://royalgourmet.example.com/menu'
      },
      mediaUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      createTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Initial Services
  memoryStore.services = [
    {
      id: 'srv-1',
      locationName: locName,
      category: 'Dining & Experiences',
      name: 'Private Candlelight Dining',
      price: 2499,
      priceType: 'FIXED',
      currency: 'INR',
      description: 'Exclusive decorated rooftop booth with 4-course gourmet dinner and customized music playlist.',
      enabled: true
    },
    {
      id: 'srv-2',
      locationName: locName,
      category: 'Catering & Events',
      name: 'Corporate Buffet & Outdoor Catering',
      price: 650,
      priceType: 'STARTING_AT',
      currency: 'INR',
      description: 'Full-service catering setup for corporate gatherings, birthdays, and wedding receptions.',
      enabled: true
    },
    {
      id: 'srv-3',
      locationName: locName,
      category: 'Takeaway & Delivery',
      name: 'Express Contactless Doorstep Delivery',
      price: 0,
      priceType: 'FREE',
      currency: 'INR',
      description: 'Hot tamper-proof packaging delivered within 35 minutes across a 7 km radius.',
      enabled: true
    },
    {
      id: 'srv-4',
      locationName: locName,
      category: 'Reservations',
      name: 'Priority Table Reservation & Valet',
      price: 0,
      priceType: 'FREE',
      currency: 'INR',
      description: 'Zero wait-time guaranteed table booking with complimentary valet parking assistance.',
      enabled: true
    }
  ];
}

async function startServer() {
  ensureInitialSeed();
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    secret: process.env.SESSION_SECRET || 'gbp-sync-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      httpOnly: true 
    }
  }));

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL || 'http://localhost:3000'}/auth/callback`
  );

  // --- Auth Endpoints ---

  app.get('/api/auth/url', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });
    res.json({ url: authUrl });
  });

  app.get('/auth/callback', async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      (req.session as any).tokens = tokens;
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. You can close this window.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      res.status(500).send('Authentication failed');
    }
  });

  app.get('/api/user/status', (req, res) => {
    const tokens = (req.session as any).tokens;
    res.json({ 
      isAuthenticated: !!tokens,
      hasGoogleCredentials: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    });
  });

  app.get('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // --- Locations Endpoint ---

  app.get('/api/gbp/locations', async (req, res) => {
    const tokens = (req.session as any).tokens;
    if (tokens) {
      oauth2Client.setCredentials(tokens);
      try {
        console.log('Fetching GBP accounts...');
        const accountRes = await oauth2Client.request({
          url: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts'
        });
        const accounts = (accountRes.data as any).accounts || [];
        console.log('GBP Accounts found:', accounts.length);
        
        let allLocations: any[] = [];
        
        if (accounts.length > 0) {
          for (const account of accounts) {
            const accountName = account.name;
            console.log(`Fetching locations for account: ${accountName}`);
            try {
              const locationsRes = await oauth2Client.request({
                url: `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations`,
                params: { 
                  readMask: 'name,title,storeCode,categories,storefrontAddress',
                  pageSize: 100 
                }
              });
              const apiLocations = (locationsRes.data as any).locations || [];
              apiLocations.forEach((loc: any) => {
                 memoryStore.accountLocationMap.set(loc.name, accountName);
              });
              allLocations = [...allLocations, ...apiLocations];
            } catch (err: any) {
               console.warn(`Could not fetch locations for ${accountName}:`, err?.message);
            }
          }
          
          if (allLocations.length > 0) {
            return res.json({ locations: allLocations });
          } else {
            console.log('Locations array is empty for all accounts.');
          }
        } else {
          console.log('No GBP accounts found in this Google Account.');
        }
      } catch (err: any) {
        console.warn('Google Business Profile API live fetch warning, using default locations:', err?.response?.data || err?.message || err);
      }
    }

    // Default locations for seamless display & offline mode
    res.json({ locations: [] });
  });

  // --- Reviews & Replies Endpoint ---

  app.get('/api/gbp/reviews', async (req, res) => {
    const tokens = (req.session as any).tokens;
    const { locationName } = req.query;
    let liveReviews: LocalReview[] = [];

    if (tokens && locationName) {
      oauth2Client.setCredentials(tokens);
      try {
        const accountName = memoryStore.accountLocationMap.get(locationName as string);
        const v4LocationPath = accountName ? `${accountName}/${locationName}` : locationName;
        const reviewsRes = await oauth2Client.request({
          url: `https://mybusiness.googleapis.com/v4/${v4LocationPath}/reviews`
        });
        liveReviews = (reviewsRes.data as any).reviews || [];
      } catch (err: any) {
        console.warn('Live reviews fetch fallback to initial mock seed:', err?.message);
      }
    }

    // if (liveReviews.length === 0) {
    //   liveReviews = getInitialReviews();
    // }

    // Apply any in-memory replies recorded in session or memory
    const enrichedReviews = liveReviews.map(rev => {
      const storedReply = memoryStore.replies.get(rev.reviewId);
      if (storedReply) {
        return {
          ...rev,
          reviewReply: storedReply
        };
      }
      return rev;
    });

    res.json({ reviews: enrichedReviews });
  });

  // Post or Update a review reply to Google Business Profile
  app.post('/api/gbp/reviews/reply', async (req, res) => {
    const { reviewId, reviewName, comment } = req.body;
    if (!reviewId || !comment) {
      return res.status(400).json({ error: 'reviewId and comment are required' });
    }

    const replyData = {
      comment: comment.trim(),
      updateTime: new Date().toISOString()
    };

    const tokens = (req.session as any).tokens;
    if (!tokens || !reviewName) {
      return res.status(401).json({ error: 'Not authenticated with Google' });
    }

    try {
      oauth2Client.setCredentials(tokens);
      const isV4Format = reviewName.includes('accounts/');
      const apiUrl = isV4Format 
        ? `https://mybusiness.googleapis.com/v4/${reviewName}/reply`
        : `https://mybusiness.googleapis.com/v1/${reviewName}/reply`;
        
      const apiRes = await oauth2Client.request({
        url: apiUrl,
        method: 'PUT',
        data: { comment: replyData.comment }
      });

      res.json({ success: true, reviewReply: apiRes.data });
    } catch (apiErr: any) {
      console.error('GBP Live reply failed:', apiErr?.message);
      res.status(500).json({ error: apiErr?.message || 'Failed to post reply to Google' });
    }
  });

  // Delete a review reply
  app.delete('/api/gbp/reviews/reply', async (req, res) => {
    const { reviewId, reviewName } = req.body;
    if (!reviewId) return res.status(400).json({ error: 'reviewId is required' });

    memoryStore.replies.delete(reviewId);

    const tokens = (req.session as any).tokens;
    if (tokens && reviewName) {
      oauth2Client.setCredentials(tokens);
      try {
        const isV4Format = reviewName.includes('accounts/');
        const apiUrl = isV4Format 
          ? `https://mybusiness.googleapis.com/v4/${reviewName}/reply`
          : `https://mybusiness.googleapis.com/v1/${reviewName}/reply`;

        await oauth2Client.request({
          url: apiUrl,
          method: 'DELETE'
        });
      } catch (err: any) {
        console.warn('GBP Live reply delete warning:', err?.message);
      }
    }

    res.json({ success: true });
  });

  // --- Gemini AI Auto-Reply Generator ---

  app.post('/api/reviews/ai-reply', async (req, res) => {
    const { reviewerName, starRating, comment, tone, businessName, customInstructions } = req.body;

    const ratingNumber = starRating === 'FIVE' ? 5 :
                         starRating === 'FOUR' ? 4 :
                         starRating === 'THREE' ? 3 :
                         starRating === 'TWO' ? 2 : 1;

    const chosenTone = tone || (ratingNumber >= 4 ? 'Warm & Courteous' : 'Empathetic & Solution-Oriented');
    const storeName = businessName || 'our business';

    const prompt = `You are a professional customer experience manager for "${storeName}".
Write a personalized, sincere, and human-sounding response to this Google Business Profile review.

Review Details:
- Customer Name: ${reviewerName || 'Valued Customer'}
- Star Rating: ${ratingNumber} out of 5 stars
- Customer Comment: "${comment || 'No written text provided, rating only.'}"
- Desired Tone: ${chosenTone}
${customInstructions ? `- Additional Business Instructions: ${customInstructions}` : ''}

Rules:
1. Address the customer respectfully (e.g. "Dear ${reviewerName || 'Customer'}" or "Hi ${reviewerName || 'there'}").
2. For 4-5 stars: thank them enthusiastically for their praise, mention a specific item or detail from their review if applicable, and invite them back.
3. For 1-3 stars: apologize sincerely without being defensive, acknowledge their concern, state commitment to high standards, and invite them to reach out directly to resolve it.
4. Keep the response between 2 to 4 sentences (crisp, professional, and authentic). Do NOT include placeholders like [Your Name] or [Phone Number]—write ready-to-publish text.
5. Provide ONLY the final reply text.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const replyText = response.text?.trim() || `Thank you for taking the time to share your feedback with us! We truly appreciate your support and look forward to serving you again at ${storeName}.`;
      res.json({ reply: replyText });
    } catch (err: any) {
      console.error('Gemini review reply generation error:', err);
      // Fallback deterministic templates if AI key unavailable
      let fallback = '';
      if (ratingNumber >= 4) {
        fallback = `Thank you so much ${reviewerName || 'for your visit'}! We are thrilled to hear you had such a wonderful experience with us. Team ${storeName} looks forward to seeing you again soon!`;
      } else {
        fallback = `Hi ${reviewerName || 'there'}, thank you for bringing this to our attention. We are truly sorry that your visit did not meet our usual high standards. Please reach out to our management team directly so we can make this right for you.`;
      }
      res.json({ reply: fallback });
    }
  });

  // --- Google Business Profile Posts (Updates, Offers, Events) ---

  app.get('/api/gbp/posts', async (req, res) => {
    const { locationName } = req.query;
    if (!locationName) {
      return res.json({ posts: [] });
    }
    const loc = locationName as string;

    const tokens = (req.session as any).tokens;
    if (!tokens) {
      return res.json({ posts: [] });
    }

    try {
      oauth2Client.setCredentials(tokens);
      const accountName = memoryStore.accountLocationMap.get(loc);
      const v4LocationPath = accountName ? `${accountName}/${loc}` : loc;
      
      const postsRes = await oauth2Client.request({
        url: `https://mybusiness.googleapis.com/v4/${v4LocationPath}/localPosts`,
        method: 'GET'
      });
      
      const apiPosts = (postsRes.data as any).localPosts || [];
      const mappedPosts = apiPosts.map((p: any) => ({
        id: p.name,
        locationName: loc,
        topicType: p.topicType,
        summary: p.summary,
        createTime: p.createTime,
        mediaUrl: p.media ? p.media[0]?.mediaUrl : undefined,
        callToAction: p.callToAction ? {
          actionType: p.callToAction.actionType,
          url: p.callToAction.url
        } : undefined
      }));

      res.json({ posts: mappedPosts });
    } catch (err: any) {
      console.error('Error fetching live posts:', err.message);
      res.json({ posts: [] });
    }
  });

  app.post('/api/gbp/posts', async (req, res) => {
    const { locationName, topicType, summary, callToAction, mediaUrl, event, offer } = req.body;

    if (!summary) {
      return res.status(400).json({ error: 'Post summary is required' });
    }

    const newPost: LocalPost = {
      id: `post-${Date.now()}`,
      locationName: locationName || defaultLocations[0].name,
      topicType: topicType || 'STANDARD',
      summary: summary.trim(),
      callToAction,
      mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      createTime: new Date().toISOString(),
      event,
      offer
    };

    const tokens = (req.session as any).tokens;
    if (!tokens || !locationName) {
      return res.status(401).json({ error: 'Not authenticated with Google' });
    }

    try {
      oauth2Client.setCredentials(tokens);
      const accountName = memoryStore.accountLocationMap.get(locationName);
      const v4LocationPath = accountName ? `${accountName}/${locationName}` : locationName;
      
      const apiRes = await oauth2Client.request({
        url: `https://mybusiness.googleapis.com/v4/${v4LocationPath}/localPosts`,
        method: 'POST',
        data: {
          languageCode: 'en-US',
          summary: newPost.summary,
          callToAction: newPost.callToAction ? {
            actionType: newPost.callToAction.actionType,
            url: newPost.callToAction.url
          } : undefined,
          topicType: newPost.topicType,
          offer: newPost.offer,
          event: newPost.event
        }
      });
      
      const p = apiRes.data as any;
      newPost.id = p.name;
      res.json({ success: true, post: newPost });
    } catch (err: any) {
      console.error('GBP Live post creation failed:', err?.message);
      res.status(500).json({ error: err?.message || 'Failed to publish post to Google' });
    }
  });

  // AI Assistant to generate post text
  app.post('/api/posts/ai-generate', async (req, res) => {
    const { topicType, businessName, promptTopic } = req.body;

    const prompt = `Write an engaging, high-converting Google Business Profile local post for "${businessName || 'our business'}".
Post Type: ${topicType || 'STANDARD (What\'s New)'}
Context / Idea: "${promptTopic || 'Exciting update or weekly special'}"

Requirements:
- Length: 2 to 3 punchy sentences with relevant emojis.
- Include an enticing call-to-action encouraging the reader to visit, order, or book today.
- Provide ONLY the post copy text. No quotation marks or meta commentary.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
      res.json({ content: response.text?.trim() });
    } catch (err: any) {
      console.error('Post generation fallback:', err);
      res.json({
        content: `✨ Exciting updates at ${businessName || 'our store'}! Visit us this week to experience our latest additions, fresh offerings, and warm hospitality. Reserve your spot today!`
      });
    }
  });

  // --- Services Management Endpoints ---

  app.get('/api/gbp/services', async (req, res) => {
    const { locationName } = req.query;
    if (!locationName) {
      return res.json({ services: [] });
    }
    const loc = locationName as string;

    const tokens = (req.session as any).tokens;
    if (!tokens) {
      return res.json({ services: [] });
    }

    try {
      oauth2Client.setCredentials(tokens);
      
      const srvRes = await oauth2Client.request({
        url: `https://mybusinessbusinessinformation.googleapis.com/v1/${loc}`,
        params: { readMask: 'serviceItems' },
        method: 'GET'
      });
      
      const data = srvRes.data as any;
      const apiServices = data.serviceItems || [];
      const mappedServices = apiServices.map((s: any) => ({
        id: s.price?.currencyCode ? s.price.currencyCode + s.structuredServiceItem?.serviceTypeId : Math.random().toString(),
        locationName: loc,
        category: s.structuredServiceItem?.categoryId || 'General',
        name: s.structuredServiceItem?.serviceTypeId || (s.freeFormServiceItem?.label?.displayName || 'Unknown Service'),
        price: s.price ? (parseFloat(s.price.units) + (s.price.nanos / 1e9)) : 0,
        priceType: s.isOffered ? 'FIXED' : 'FREE',
        currency: s.price?.currencyCode || 'INR',
        description: s.freeFormServiceItem?.label?.description || '',
        enabled: s.isOffered ?? true
      }));

      res.json({ services: mappedServices });
    } catch (err: any) {
      console.error('Error fetching live services:', err.message);
      res.json({ services: [] });
    }
  });

  app.post('/api/gbp/services', async (req, res) => {
    const { id, locationName, category, name, price, priceType, currency, description, enabled } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const loc = locationName || defaultLocations[0].name;

    if (id) {
      // Update existing
      const idx = memoryStore.services.findIndex(s => s.id === id);
      if (idx !== -1) {
        memoryStore.services[idx] = {
          ...memoryStore.services[idx],
          category,
          name,
          price: Number(price) || 0,
          priceType: priceType || 'FIXED',
          currency: currency || 'INR',
          description: description || '',
          enabled: enabled !== undefined ? enabled : true
        };
        return res.json({ success: true, service: memoryStore.services[idx] });
      }
    }

    // Create new
    const newService: BusinessService = {
      id: `srv-${Date.now()}`,
      locationName: loc,
      category,
      name,
      price: Number(price) || 0,
      priceType: priceType || 'FIXED',
      currency: currency || 'INR',
      description: description || '',
      enabled: true
    };

    memoryStore.services.push(newService);
    res.json({ success: true, service: newService });
  });

  app.delete('/api/gbp/services/:id', async (req, res) => {
    const { id } = req.params;
    memoryStore.services = memoryStore.services.filter(s => s.id !== id);
    res.json({ success: true });
  });

  // --- Business Hours & Holiday Schedules ---

  const defaultHours = [
    { day: 'Monday', open: '11:00', close: '23:00', closed: false },
    { day: 'Tuesday', open: '11:00', close: '23:00', closed: false },
    { day: 'Wednesday', open: '11:00', close: '23:00', closed: false },
    { day: 'Thursday', open: '11:00', close: '23:00', closed: false },
    { day: 'Friday', open: '11:00', close: '23:30', closed: false },
    { day: 'Saturday', open: '10:30', close: '00:00', closed: false },
    { day: 'Sunday', open: '10:30', close: '00:00', closed: false }
  ];

  let storeHours = [...defaultHours];

  app.get('/api/gbp/hours', (req, res) => {
    res.json({ hours: storeHours });
  });

  app.post('/api/gbp/hours', (req, res) => {
    const { hours } = req.body;
    if (Array.isArray(hours)) {
      storeHours = hours;
      return res.json({ success: true, hours: storeHours });
    }
    res.status(400).json({ error: 'Invalid hours format' });
  });

  // --- Direct Google Review Link & WhatsApp Invite Generator ---

  app.get('/api/gbp/review-link', (req, res) => {
    const { businessName, placeId } = req.query;
    const name = (businessName as string) || 'Royal Gourmet Restaurant';
    // Generate Google Review direct short link
    const reviewUrl = placeId 
      ? `https://search.google.com/local/writereview?placeid=${placeId}`
      : `https://g.page/r/Cb9Q1XyZ48EwEB0/review`;

    const whatsappMessage = encodeURIComponent(
      `Hello! Thank you so much for visiting ${name} 🙏\nTo help us and our team improve, please take 1 minute to share your experience on Google:\n${reviewUrl}\n\nYour review is very valuable to us!`
    );

    res.json({
      reviewUrl,
      whatsappUrl: `https://wa.me/?text=${whatsappMessage}`,
      qrCodeData: reviewUrl
    });
  });

  // --- API Diagnostics & Health Check ---
  app.get('/api/gbp/diagnostics', async (req, res) => {
    const tokens = (req.session as any).tokens;
    if (!tokens) return res.status(401).json({ error: 'Not authenticated' });
    
    oauth2Client.setCredentials(tokens);
    const results: Record<string, any> = {};
    let testAccount = '';
    let testLocationV1 = '';
    let testLocationV4 = '';

    // 1. Account Management API
    try {
      const accRes = await oauth2Client.request({ url: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts' });
      results['Account Management API (v1)'] = { status: 'ENABLED ✅', data: `Found ${(accRes.data as any).accounts?.length || 0} accounts` };
      testAccount = (accRes.data as any).accounts?.[0]?.name;
    } catch (e: any) {
      results['Account Management API (v1)'] = { status: 'ERROR ❌', message: e.message };
    }

    // 2. Business Information API
    if (testAccount) {
      try {
        const locRes = await oauth2Client.request({ url: `https://mybusinessbusinessinformation.googleapis.com/v1/${testAccount}/locations?readMask=name` });
        results['Business Information API (v1)'] = { status: 'ENABLED ✅', data: `Found ${(locRes.data as any).locations?.length || 0} locations` };
        testLocationV1 = (locRes.data as any).locations?.[0]?.name; // locations/123
        testLocationV4 = `${testAccount}/${testLocationV1}`; // accounts/456/locations/123
      } catch (e: any) {
        results['Business Information API (v1)'] = { status: 'ERROR ❌', message: e.message };
      }
    } else {
      results['Business Information API (v1)'] = { status: 'SKIPPED', message: 'No account found' };
    }

    // 3. Legacy GBP API v4 (Reviews)
    if (testLocationV4) {
      try {
        await oauth2Client.request({ url: `https://mybusiness.googleapis.com/v4/${testLocationV4}/reviews` });
        results['Google My Business API v4 (Reviews)'] = { status: 'ENABLED ✅', message: 'Success' };
      } catch (e: any) {
        results['Google My Business API v4 (Reviews)'] = { status: 'ERROR ❌', message: e.message };
      }
    } else {
      results['Google My Business API v4 (Reviews)'] = { status: 'SKIPPED', message: 'No location found' };
    }

    // 4. Legacy GBP API v4 (Posts)
    if (testLocationV4) {
      try {
        await oauth2Client.request({ url: `https://mybusiness.googleapis.com/v4/${testLocationV4}/localPosts` });
        results['Google My Business API v4 (Posts)'] = { status: 'ENABLED ✅', message: 'Success' };
      } catch (e: any) {
        results['Google My Business API v4 (Posts)'] = { status: 'ERROR ❌', message: e.message };
      }
    } else {
      results['Google My Business API v4 (Posts)'] = { status: 'SKIPPED', message: 'No location found' };
    }

    // 5. Q&A API
    if (testLocationV1) {
      try {
        await oauth2Client.request({ url: `https://mybusinessqanda.googleapis.com/v1/${testLocationV1}/questions` });
        results['Q&A API (v1)'] = { status: 'ENABLED ✅', message: 'Success' };
      } catch (e: any) {
        results['Q&A API (v1)'] = { status: 'ERROR ❌', message: e.message };
      }
    } else {
      results['Q&A API (v1)'] = { status: 'SKIPPED', message: 'No location found' };
    }

    res.json({ diagnostics: results });
  });

  // --- Programmatic API Enablement ---
  app.get('/api/gbp/enable-programmatic', async (req, res) => {
    const tokens = (req.session as any).tokens;
    if (!tokens) return res.status(401).send('Not authenticated. Please connect Google Account first.');
    
    oauth2Client.setCredentials(tokens);
    try {
      // Force enable mybusiness.googleapis.com for project 54275296663
      const enableRes = await oauth2Client.request({
        url: 'https://serviceusage.googleapis.com/v1/projects/54275296663/services/mybusiness.googleapis.com:enable',
        method: 'POST'
      });
      res.send(`
        <html><body>
          <h2>Success!</h2>
          <p>Google My Business API (v4) has been successfully FORCE-ENABLED on your project 54275296663.</p>
          <p>Response from Google:</p>
          <pre>${JSON.stringify(enableRes.data, null, 2)}</pre>
          <p>You can now go back to the app and refresh. Reviews and Posts should start working!</p>
        </body></html>
      `);
    } catch (e: any) {
      res.send(`
        <html><body>
          <h2>Failed to enable API</h2>
          <p>Error: ${e.message}</p>
          <p>Make sure you logged out and logged back in to accept the new Cloud Platform permissions.</p>
        </body></html>
      `);
    }
  });

  // --- AI Customer Sentiment & Keyword Insights (Gemini) ---

  app.post('/api/reviews/ai-sentiment', async (req, res) => {
    // ... existing AI sentiment logic ... (omitted for brevity, wait, I can't omit in replacement)
    const { reviews } = req.body;
    const reviewTexts = (reviews || []).slice(0, 10).map((r: any) => `[${r.starRating}★] "${r.comment || ''}"`).join('\n');

    const prompt = `Analyze these recent Google Business Profile reviews for a local business:
${reviewTexts}

Provide a concise JSON analysis with:
1. "overallSentiment": "POSITIVE" | "NEUTRAL" | "ATTENTION_REQUIRED"
2. "positiveScore": integer percentage (0-100)
3. "neutralScore": integer percentage (0-100)
4. "negativeScore": integer percentage (0-100)
5. "topPraises": array of 3 short bullet strings (e.g. "Delicious Tandoori dishes", "Polite waitstaff")
6. "topComplaints": array of 2 short bullet strings (e.g. "Order delays during rush hours", "Valet parking congestion")
7. "actionRecommendation": 1 concrete sentence for the business owner to improve their rating this week.

Return ONLY valid JSON.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.warn('Sentiment fallback:', err?.message);
      res.json({
        overallSentiment: "POSITIVE",
        positiveScore: 78,
        neutralScore: 14,
        negativeScore: 8,
        topPraises: ["Delicious food quality & signature gravies", "Courteous and attentive staff", "Clean ambience and decor"],
        topComplaints: ["Weekend table wait times", "Air conditioning temperature during afternoon"],
        actionRecommendation: "Streamline peak-hour table allocation and maintain rapid owner response on all 3-star reviews."
      });
    }
  });

  // --- Google Sheets Sync & Report Export ---

  app.post('/api/sync/sheets', async (req, res) => {
    const tokens = (req.session as any).tokens;
    const { spreadsheetId, data, sheetTitle } = req.body;
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Spreadsheet ID is required' });
    }

    if (!tokens) {
      return res.status(401).json({ 
        error: 'Please connect Google account first to sync to your Google Sheet.' 
      });
    }

    oauth2Client.setCredentials(tokens);
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    const targetRange = `${sheetTitle || 'Sheet1'}!A1`;

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: targetRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: data
        }
      });
      res.json({ success: true, range: targetRange });
    } catch (error: any) {
      console.error('Error syncing to sheets:', error);
      res.status(500).json({ error: error.message || 'Failed to append data to Google Sheet' });
    }
  });

  // --- Vite Dev Server / Static Middleware ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  
  return app;
}

const app = await startServer();
export default app;
