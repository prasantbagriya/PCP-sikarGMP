import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Share2, 
  MessageCircle, 
  Copy, 
  Check, 
  Download, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  ThumbsUp, 
  ExternalLink,
  Save,
  RefreshCw
} from 'lucide-react';
import { Location, Review, StoreHour, SentimentAnalysis } from '../types';

interface GrowthToolsProps {
  location: Location;
  reviews: Review[];
  lang: 'en' | 'hi';
}

export const GrowthTools: React.FC<GrowthToolsProps> = ({ location, reviews, lang }) => {
  const [reviewLinkData, setReviewLinkData] = useState<{ reviewUrl: string; whatsappUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [storeHours, setStoreHours] = useState<StoreHour[]>([]);
  const [savingHours, setSavingHours] = useState(false);
  const [hoursSavedFeedback, setHoursSavedFeedback] = useState(false);

  // Sentiment Analysis
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [analyzingSentiment, setAnalyzingSentiment] = useState(false);

  useEffect(() => {
    fetchReviewLink();
    fetchHours();
    runSentimentAnalysis();
  }, [location.name]);

  const fetchReviewLink = async () => {
    try {
      const res = await fetch(`/api/gbp/review-link?businessName=${encodeURIComponent(location.title)}`);
      const data = await res.json();
      setReviewLinkData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHours = async () => {
    try {
      const res = await fetch('/api/gbp/hours');
      const data = await res.json();
      setStoreHours(data.hours || []);
    } catch (e) {
      console.error(e);
    }
  };

  const runSentimentAnalysis = async () => {
    setAnalyzingSentiment(true);
    try {
      const res = await fetch('/api/reviews/ai-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews })
      });
      const data = await res.json();
      setSentiment(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingSentiment(false);
    }
  };

  const handleCopyLink = () => {
    if (reviewLinkData?.reviewUrl) {
      navigator.clipboard.writeText(reviewLinkData.reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    try {
      await fetch('/api/gbp/hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: storeHours })
      });
      setHoursSavedFeedback(true);
      setTimeout(() => setHoursSavedFeedback(false), 2500);
    } catch (e) {
      alert('Failed to save hours');
    } finally {
      setSavingHours(false);
    }
  };

  const updateHour = (index: number, field: keyof StoreHour, val: any) => {
    setStoreHours(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          {lang === 'hi' ? 'ग्रोथ टूल्स एवं कस्टमर इनसाइट्स' : 'Customer Growth & Profile Tools'}
        </h2>
        <p className="text-slate-500 text-xs mt-0.5">
          {lang === 'hi' 
            ? 'QR कोड से ज्यादा 5-स्टार रिव्यू पाएं, WhatsApp से रिक्वेस्ट भेजें और AI सेंटिमेंट इनसाइट्स देखें।' 
            : 'Collect more 5-star Google reviews with printable QR codes, WhatsApp invites, and Gemini AI sentiment insights.'}
        </p>
      </div>

      {/* Row 1: QR Code & WhatsApp Inviter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Printable QR Code Card */}
        <div className="card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                {lang === 'hi' ? 'रिव्यू काउंटर स्टैंड' : 'In-Store Review Stand'}
              </span>
              <h3 className="font-bold text-slate-800 text-base mt-1">
                {lang === 'hi' ? 'गूगल रिव्यू QR कोड जनरेटर' : 'Google Review QR Code'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'hi' 
                  ? 'इसे प्रिंट करके बिलिंग काउंटर या डाइनिंग टेबल पर लगाएं ताकि कस्टमर तुरंत 5-स्टार रिव्यू दे सकें।' 
                  : 'Place on billing desks, table tents, or receipts for 1-scan Google reviews.'}
              </p>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <QrCode className="w-6 h-6" />
            </div>
          </div>

          {/* QR Code Mock Graphic */}
          <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-36 h-36 bg-white p-2.5 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center">
              {/* Scalable vector QR pattern simulation */}
              <div className="w-full h-full border-4 border-slate-900 rounded p-1 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-6 h-6 bg-slate-900 rounded-xs flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white"></div>
                  </div>
                  <div className="w-6 h-6 bg-slate-900 rounded-xs flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white"></div>
                  </div>
                </div>
                <div className="text-center font-bold text-[9px] text-blue-600 tracking-tighter">
                  ★ REVIEW US ★
                </div>
                <div className="flex justify-between items-end">
                  <div className="w-6 h-6 bg-slate-900 rounded-xs flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white"></div>
                  </div>
                  <div className="w-6 h-6 border-2 border-slate-900 flex items-center justify-center">
                    <div className="w-2 h-2 bg-slate-900"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-xs text-slate-800">{location.title}</p>
              <p className="text-[10px] text-slate-400">Scan camera to leave a 5-star Google review</p>
            </div>
          </div>

          {/* Direct Link Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={reviewLinkData?.reviewUrl || 'https://g.page/r/Cb9Q1XyZ48EwEB0/review'} 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 outline-none"
              />
              <button 
                onClick={handleCopyLink}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 flex-shrink-0 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? (lang === 'hi' ? 'कॉपी हुआ!' : 'Copied!') : (lang === 'hi' ? 'कॉपी' : 'Copy')}
              </button>
            </div>

            <div className="flex gap-2">
              <a 
                href={reviewLinkData?.reviewUrl || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-center rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {lang === 'hi' ? 'रिव्यू लिंक खोलें' : 'Test Review Page'}
              </a>

              <button 
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                {lang === 'hi' ? 'QR स्टैंड प्रिंट करें' : 'Print QR Stand'}
              </button>
            </div>
          </div>
        </div>

        {/* WhatsApp Review Requester Card */}
        <div className="card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                {lang === 'hi' ? 'व्हाट्सएप ऑटोमेशन' : 'WhatsApp Automation'}
              </span>
              <h3 className="font-bold text-slate-800 text-base mt-1">
                {lang === 'hi' ? 'व्हाट्सएप रिव्यू इनविटेशन' : 'WhatsApp Review Requester'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'hi'
                  ? 'हाल ही में आए कस्टमर को व्हाट्सएप पर 1-क्लिक रिव्यू रिक्वेस्ट मैसेज भेजें।'
                  : 'Send pre-composed polite review requests to recent guests in 1 click.'}
              </p>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <MessageCircle className="w-6 h-6" />
            </div>
          </div>

          {/* WhatsApp Message Preview Box */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {lang === 'hi' ? 'मैसेज प्रीव्यू (कस्टमर को दिखेगा)' : 'Message Preview'}
            </div>
            <div className="bg-white p-3 rounded-lg shadow-2xs border border-emerald-100 text-slate-700 space-y-2 leading-relaxed">
              <p>
                नमस्ते! <strong>{location.title}</strong> में पधारने के लिए आपका बहुत-बहुत धन्यवाद 🙏
              </p>
              <p>
                हमारी सेवा और खाने का अनुभव आपके लिए कैसा रहा? कृपया 1 मिनट निकालकर अपना 5-स्टार रिव्यू और विचार Google पर जरूर साझा करें:
              </p>
              <p className="font-mono text-blue-600 text-[11px]">
                {reviewLinkData?.reviewUrl || 'https://g.page/r/Cb9Q1XyZ48EwEB0/review'}
              </p>
              <p className="text-slate-400 text-[10px]">
                आपका फीडबैक हमारी पूरी टीम का हौसला बढ़ाता है! ✨
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <a 
              href={reviewLinkData?.whatsappUrl || '#'} 
              target="_blank" 
              rel="noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              {lang === 'hi' ? 'व्हाट्सएप पर शेयर करें' : 'Open in WhatsApp Web / App'}
            </a>
            <p className="text-[10px] text-center text-slate-400">
              {lang === 'hi' ? 'ग्राहक का नंबर चुनकर सीधे सेंड करें' : 'Opens WhatsApp with message ready to deliver to your customer'}
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Gemini AI Sentiment Breakdown */}
      <div className="card p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-base">
                {lang === 'hi' ? 'AI कस्टमर सेंटिमेंट एवं टॉपिक्स एनालिसिस' : 'Gemini AI Customer Sentiment & Insights'}
              </h3>
              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'hi' 
                ? 'AI सभी रिव्यू का विश्लेषण करके बताता है कि कस्टमर को क्या सबसे ज्यादा पसंद आ रहा है और कहाँ सुधार चाहिए।' 
                : 'Real-time analysis of what customers love and areas needing operational attention.'}
            </p>
          </div>

          <button 
            onClick={runSentimentAnalysis}
            disabled={analyzingSentiment}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 self-start transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzingSentiment ? 'animate-spin' : ''}`} />
            {analyzingSentiment ? (lang === 'hi' ? 'एनालिसिस जारी...' : 'Analyzing...') : (lang === 'hi' ? 'ताजा करें' : 'Re-Analyze')}
          </button>
        </div>

        {sentiment ? (
          <div className="space-y-6">
            {/* Visual Sentiment Distribution Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-700 flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" /> Positive ({sentiment.positiveScore}%)
                </span>
                <span className="text-slate-500">
                  Neutral ({sentiment.neutralScore}%)
                </span>
                <span className="text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Critical ({sentiment.negativeScore}%)
                </span>
              </div>

              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-700"
                  style={{ width: `${sentiment.positiveScore}%` }}
                />
                <div 
                  className="bg-slate-300 h-full transition-all duration-700"
                  style={{ width: `${sentiment.neutralScore}%` }}
                />
                <div 
                  className="bg-red-500 h-full transition-all duration-700"
                  style={{ width: `${sentiment.negativeScore}%` }}
                />
              </div>
            </div>

            {/* Praise vs Complaints Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/40 border border-emerald-200/70 rounded-xl space-y-2">
                <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                  {lang === 'hi' ? 'कस्टमर की सबसे बड़ी तारीफें' : 'Top Customer Praises'}
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {sentiment.topPraises.map((praise, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{praise}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-amber-50/40 border border-amber-200/70 rounded-xl space-y-2">
                <h4 className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {lang === 'hi' ? 'सुधार के मुख्य बिंदु (Complaints)' : 'Key Areas for Improvement'}
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {sentiment.topComplaints.map((comp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{comp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* AI Actionable Recommendation */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-blue-900 block mb-0.5">
                  {lang === 'hi' ? 'इस हफ्ते के लिए AI सलाह:' : 'Gemini Operational Recommendation:'}
                </span>
                <p className="text-blue-800 leading-relaxed font-medium">
                  {sentiment.actionRecommendation}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-xs">Analyzing reviews with Gemini AI...</p>
          </div>
        )}
      </div>

      {/* Row 3: Store Operating Hours & Holiday Timings */}
      <div className="card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {lang === 'hi' ? 'दुकान / रेस्टोरेंट का समय (Operating Hours)' : 'Business Hours Management'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'hi' 
                ? 'Google Maps पर दिखने वाले खुलने और बंद होने का समय यहाँ से अपडेट करें।' 
                : 'Keep your Google Maps opening and closing hours updated for customers.'}
            </p>
          </div>

          <button 
            onClick={handleSaveHours}
            disabled={savingHours}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start shadow-sm transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            {savingHours ? (lang === 'hi' ? 'सेव हो रहा है...' : 'Saving...') : (lang === 'hi' ? 'समय सेव करें' : 'Save Hours to Google')}
          </button>
        </div>

        {hoursSavedFeedback && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            {lang === 'hi' ? 'दुकान का समय सफलतापूर्वक Google Profile पर अपडेट हो गया!' : 'Store hours updated successfully on Google Profile!'}
          </div>
        )}

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {storeHours.map((h, idx) => (
            <div key={h.day} className="py-3 flex items-center justify-between gap-4 text-xs min-w-[340px]">
              <span className="font-semibold text-slate-800 w-28">{h.day}</span>
              
              <div className="flex items-center gap-2 flex-1">
                <input 
                  type="time" 
                  value={h.open} 
                  disabled={h.closed}
                  onChange={(e) => updateHour(idx, 'open', e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-700 font-mono disabled:opacity-40"
                />
                <span className="text-slate-400 font-bold">to</span>
                <input 
                  type="time" 
                  value={h.close} 
                  disabled={h.closed}
                  onChange={(e) => updateHour(idx, 'close', e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-700 font-mono disabled:opacity-40"
                />
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={h.closed} 
                  onChange={(e) => updateHour(idx, 'closed', e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-slate-500 font-medium">{lang === 'hi' ? 'बंद (Closed)' : 'Closed'}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
