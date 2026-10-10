/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  LogOut, 
  RefreshCw, 
  FileSpreadsheet, 
  Star, 
  Users, 
  TrendingUp, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Send,
  Sparkles,
  Calendar,
  Tag,
  Plus,
  Trash2,
  Edit3,
  Download,
  BarChart3,
  Bot,
  Sliders,
  Check,
  Clock,
  Megaphone,
  Briefcase,
  DollarSign,
  Filter,
  ChevronRight,
  ShieldCheck,
  CheckCheck,
  ArrowUpRight,
  Menu,
  X,
  Languages,
  QrCode,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Location, Review, Post, BusinessService, TabType } from './types';
import { GrowthTools } from './components/GrowthTools';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [authStatus, setAuthStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Language state: 'en' | 'hi'
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  
  // Locations & Selection
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  
  // Reviews & Replies
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'unreplied' | 'replied' | 'critical' | 'today'>('all');
  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [aiGeneratingReply, setAiGeneratingReply] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  // Auto-Reply Settings
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyTone, setAutoReplyTone] = useState('Warm & Courteous');
  const [autoReplyPromptInstructions, setAutoReplyPromptInstructions] = useState('Always mention our manager direct contact for ratings below 3 stars.');
  const [autoReplyingAll, setAutoReplyingAll] = useState(false);
  const [autoReplyProgress, setAutoReplyProgress] = useState<{ current: number; total: number } | null>(null);

  // Reports Filter & Export
  const [reportDateRange, setReportDateRange] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Posts
  const [posts, setPosts] = useState<Post[]>([]);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostType, setNewPostType] = useState<'STANDARD' | 'OFFER' | 'EVENT'>('STANDARD');
  const [newPostSummary, setNewPostSummary] = useState('');
  const [newPostCtaType, setNewPostCtaType] = useState<'BOOK' | 'ORDER' | 'SHOP' | 'LEARN_MORE' | 'CALL'>('BOOK');
  const [newPostCtaUrl, setNewPostCtaUrl] = useState('https://royalgourmet.example.com/reserve');
  const [newPostCoupon, setNewPostCoupon] = useState('');
  const [newPostMediaUrl, setNewPostMediaUrl] = useState('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80');
  const [generatingAiPost, setGeneratingAiPost] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);

  // Services
  const [services, setServices] = useState<BusinessService[]>([]);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('Dining & Experiences');
  const [newServicePrice, setNewServicePrice] = useState('999');
  const [newServicePriceType, setNewServicePriceType] = useState<'FIXED' | 'STARTING_AT' | 'FREE'>('FIXED');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Translations
  const t = {
    appName: 'SyncPro Live',
    appSub: lang === 'hi' ? 'गूगल प्रोफाइल ऑटोमेशन' : 'GBP Automation Suite',
    dashboard: lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard',
    reviewsReplies: lang === 'hi' ? 'रिव्यू एवं रिप्लाई' : 'Reviews & Replies',
    reportsWeekly: lang === 'hi' ? 'हफ्ते का ब्यौरा व रिपोर्ट' : 'Weekly & Reports',
    autoReply: lang === 'hi' ? 'AI ऑटो रिप्लाई' : 'AI Auto-Reply',
    profilePosts: lang === 'hi' ? 'प्रोफाइल पोस्ट' : 'Profile Posts',
    servicesManager: lang === 'hi' ? 'सर्विसेज मैनेजमेंट' : 'Services Manager',
    growthTools: lang === 'hi' ? 'QR व ग्रोथ टूल्स' : 'QR & Growth Tools',
    sheetsSync: lang === 'hi' ? 'गूगल शीट सिंक' : 'Sheets Sync',
    todayReviews: lang === 'hi' ? 'आज के नए रिव्यू' : "Reviews Today",
    avgRating: lang === 'hi' ? 'एवरेज रेटिंग' : 'Average Rating',
    replyRate: lang === 'hi' ? 'रिप्लाई रेट' : 'Response Rate',
    monitoringActive: lang === 'hi' ? 'लाइव मॉनिटरिंग चालू' : 'Live Monitor Active',
    connectGoogle: lang === 'hi' ? 'गूगल अकाउंट जोड़ें' : 'Connect Google Account',
    disconnect: lang === 'hi' ? 'अकाउंट हटाएं' : 'Disconnect Account'
  };

  useEffect(() => {
    checkAuth();
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setAuthStatus(true);
        fetchLocations();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/user/status');
      const data = await res.json();
      setAuthStatus(data.isAuthenticated);
      fetchLocations();
    } catch (err) {
      console.error(err);
      fetchLocations();
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/gbp/locations');
      const data = await res.json();
      setLocations(data.locations || []);
      if (data.locations && data.locations.length > 0) {
        const defaultLoc = data.locations[0].name;
        setSelectedLocation(defaultLoc);
        loadAllData(defaultLoc);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAllData = (locationName: string) => {
    fetchReviews(locationName);
    fetchPosts(locationName);
    fetchServices(locationName);
  };

  const fetchReviews = async (locationName: string) => {
    try {
      const res = await fetch(`/api/gbp/reviews?locationName=${encodeURIComponent(locationName)}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPosts = async (locationName: string) => {
    try {
      const res = await fetch(`/api/gbp/posts?locationName=${encodeURIComponent(locationName)}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServices = async (locationName: string) => {
    try {
      const res = await fetch(`/api/gbp/services?locationName=${encodeURIComponent(locationName)}`);
      const data = await res.json();
      setServices(data.services || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/auth/url');
      const { url } = await res.json();
      window.open(url, 'google_auth', 'width=600,height=700');
    } catch (e) {
      alert('Error initiating Google Login.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout');
    setAuthStatus(false);
  };

  const activeLoc = locations.find(l => l.name === selectedLocation) || locations[0] || {
    name: 'accounts/1/locations/1',
    title: 'Royal Gourmet Restaurant'
  };

  const parseRating = (ratingStr: string): number => {
    if (ratingStr === 'FIVE') return 5;
    if (ratingStr === 'FOUR') return 4;
    if (ratingStr === 'THREE') return 3;
    if (ratingStr === 'TWO') return 2;
    if (ratingStr === 'ONE') return 1;
    const parts = ratingStr.split('_');
    const num = parseInt(parts[parts.length - 1], 10);
    return isNaN(num) ? 5 : num;
  };

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  const todayReviews = useMemo(() => reviews.filter(r => isToday(r.createTime)), [reviews]);
  const repliedReviews = useMemo(() => reviews.filter(r => !!r.reviewReply?.comment), [reviews]);
  const pendingReviews = useMemo(() => reviews.filter(r => !r.reviewReply?.comment), [reviews]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, r) => acc + parseRating(r.starRating), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const responseRate = useMemo(() => {
    if (reviews.length === 0) return 100;
    return Math.round((repliedReviews.length / reviews.length) * 100);
  }, [reviews, repliedReviews]);

  const displayedReviews = useMemo(() => {
    if (reviewFilter === 'unreplied') return pendingReviews;
    if (reviewFilter === 'replied') return repliedReviews;
    if (reviewFilter === 'today') return todayReviews;
    if (reviewFilter === 'critical') return reviews.filter(r => parseRating(r.starRating) <= 3);
    return reviews;
  }, [reviews, reviewFilter, pendingReviews, repliedReviews, todayReviews]);

  const weeklyDayBreakdown = useMemo(() => {
    const days: { dateLabel: string; dayName: string; total: number; avgRating: number; fiveStars: number; negative: number; replied: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayReviews = reviews.filter(r => {
        const revTime = new Date(r.createTime).getTime();
        return revTime >= dayStart.getTime() && revTime <= dayEnd.getTime();
      });

      const dayTotal = dayReviews.length;
      const dayFive = dayReviews.filter(r => parseRating(r.starRating) === 5).length;
      const dayNegative = dayReviews.filter(r => parseRating(r.starRating) <= 3).length;
      const dayReplied = dayReviews.filter(r => !!r.reviewReply?.comment).length;
      const dayAvg = dayTotal > 0 ? Number((dayReviews.reduce((sum, r) => sum + parseRating(r.starRating), 0) / dayTotal).toFixed(1)) : 5.0;

      days.push({
        dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayName: i === 0 ? (lang === 'hi' ? 'आज' : 'Today') : i === 1 ? (lang === 'hi' ? 'कल' : 'Yesterday') : d.toLocaleDateString('en-US', { weekday: 'short' }),
        total: dayTotal,
        avgRating: dayAvg,
        fiveStars: dayFive,
        negative: dayNegative,
        replied: dayReplied
      });
    }

    return days;
  }, [reviews, lang]);

  // Reply handlers
  const handleOpenReplyModal = (rev: Review) => {
    setReplyingReview(rev);
    setReplyText(rev.reviewReply?.comment || '');
  };

  const handleGenerateAiReply = async (rev: Review) => {
    setAiGeneratingReply(true);
    try {
      const res = await fetch('/api/reviews/ai-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName: rev.reviewer.displayName,
          starRating: rev.starRating,
          comment: rev.comment,
          tone: autoReplyTone,
          businessName: activeLoc?.title || 'Royal Gourmet',
          customInstructions: autoReplyPromptInstructions
        })
      });
      const data = await res.json();
      if (data.reply) setReplyText(data.reply);
    } catch (err) {
      console.error(err);
    } finally {
      setAiGeneratingReply(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyingReview || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch('/api/gbp/reviews/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: replyingReview.reviewId,
          reviewName: replyingReview.name,
          comment: replyText
        })
      });
      const data = await res.json();
      if (data.success && data.reviewReply) {
        setReviews(prev => prev.map(r => r.reviewId === replyingReview.reviewId ? { ...r, reviewReply: data.reviewReply } : r));
        setReplyingReview(null);
        setReplyText('');
      }
    } catch (err) {
      alert('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteReply = async (reviewId: string, reviewName?: string) => {
    if (!confirm('Are you sure you want to delete this reply from Google Business Profile?')) return;
    try {
      await fetch('/api/gbp/reviews/reply', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, reviewName })
      });
      setReviews(prev => prev.map(r => {
        if (r.reviewId === reviewId) {
          const copy = { ...r };
          delete copy.reviewReply;
          return copy;
        }
        return r;
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAutoReplyAllPending = async () => {
    if (pendingReviews.length === 0) {
      alert(lang === 'hi' ? 'सभी रिव्यू के उत्तर पहले से दिए जा चुके हैं!' : 'All reviews already have owner replies!');
      return;
    }
    setAutoReplyingAll(true);
    setAutoReplyProgress({ current: 0, total: pendingReviews.length });

    for (let i = 0; i < pendingReviews.length; i++) {
      const rev = pendingReviews[i];
      try {
        const genRes = await fetch('/api/reviews/ai-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviewerName: rev.reviewer.displayName,
            starRating: rev.starRating,
            comment: rev.comment,
            tone: autoReplyTone,
            businessName: activeLoc?.title || 'Royal Gourmet',
            customInstructions: autoReplyPromptInstructions
          })
        });
        const genData = await genRes.json();
        const generatedText = genData.reply;

        const postRes = await fetch('/api/gbp/reviews/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviewId: rev.reviewId,
            reviewName: rev.name,
            comment: generatedText
          })
        });
        const postData = await postRes.json();
        if (postData.success) {
          setReviews(prev => prev.map(r => r.reviewId === rev.reviewId ? { ...r, reviewReply: postData.reviewReply } : r));
        }
      } catch (err) {
        console.warn('Auto reply error:', rev.reviewId, err);
      }
      setAutoReplyProgress({ current: i + 1, total: pendingReviews.length });
    }

    setTimeout(() => {
      setAutoReplyingAll(false);
      setAutoReplyProgress(null);
      alert(lang === 'hi' ? 'सफलतापूर्वक सभी पेंडिंग रिव्यूज़ पर रिप्लाई भेज दिया गया!' : 'Successfully replied to all pending reviews!');
    }, 500);
  };

  const handleCreatePost = async () => {
    if (!newPostSummary.trim()) return alert('Please enter post text');
    setCreatingPost(true);
    try {
      const res = await fetch('/api/gbp/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: activeLoc?.name,
          topicType: newPostType,
          summary: newPostSummary,
          callToAction: {
            actionType: newPostCtaType,
            url: newPostCtaUrl
          },
          mediaUrl: newPostMediaUrl,
          offer: newPostType === 'OFFER' ? { couponCode: newPostCoupon || 'SPECIAL20' } : undefined
        })
      });
      const data = await res.json();
      if (data.success && data.post) {
        setPosts(prev => [data.post, ...prev]);
        setShowNewPostModal(false);
        setNewPostSummary('');
      }
    } catch (e) {
      alert('Error publishing post');
    } finally {
      setCreatingPost(false);
    }
  };

  const handleAddService = async () => {
    if (!newServiceName.trim()) return alert('Please enter service name');
    try {
      const res = await fetch('/api/gbp/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: activeLoc?.name,
          category: newServiceCategory,
          name: newServiceName,
          price: Number(newServicePrice) || 0,
          priceType: newServicePriceType,
          currency: 'INR',
          description: newServiceDesc
        })
      });
      const data = await res.json();
      if (data.success && data.service) {
        setServices(prev => [...prev, data.service]);
        setShowAddServiceModal(false);
        setNewServiceName('');
        setNewServiceDesc('');
      }
    } catch (e) {
      alert('Failed to add service');
    }
  };

  const handleSyncToSheets = async (customReport: boolean = false) => {
    if (!spreadsheetId.trim()) {
      alert(lang === 'hi' ? 'कृपया पहले Google Sheet ID डालें' : 'Please enter your Google Spreadsheet ID first.');
      return;
    }
    setSyncStatus('syncing');
    setSyncFeedback(lang === 'hi' ? 'Google Sheet में एक्सपोर्ट हो रहा है...' : 'Exporting data to your Google Sheet...');

    let dataToExport: (string | number)[][] = [];
    let sheetTitle = 'Sheet1';

    if (customReport) {
      sheetTitle = 'GBP_Analytics_Report';
      dataToExport = [
        ['GOOGLE BUSINESS PROFILE - PERFORMANCE & REVIEWS REPORT'],
        ['Generated At', new Date().toLocaleString()],
        ['Profile Name', activeLoc?.title || 'Google Business Profile'],
        [''],
        ['SUMMARY METRICS', 'VALUE'],
        ['Total Reviews Count', reviews.length],
        ['Today Reviews Count', todayReviews.length],
        ['Average Star Rating', avgRating],
        ['Response Rate (%)', `${responseRate}%`],
        ['Total Replied Reviews', repliedReviews.length],
        ['Total Pending Reviews', pendingReviews.length],
        [''],
        ['WEEKLY REVIEW BREAKDOWN (DAY BY DAY)'],
        ['Day', 'Date', 'Total Reviews', '5 Stars', 'Negative (<=3)', 'Avg Rating', 'Replied']
      ];

      weeklyDayBreakdown.forEach(day => {
        dataToExport.push([day.dayName, day.dateLabel, day.total, day.fiveStars, day.negative, day.avgRating, day.replied]);
      });

      dataToExport.push(['']);
      dataToExport.push(['DETAILED REVIEWS & REPLIES LOG']);
      dataToExport.push(['Review ID', 'Date & Time', 'Reviewer', 'Rating', 'Customer Comment', 'Owner Reply', 'Reply Date']);

      reviews.forEach(r => {
        dataToExport.push([
          r.reviewId,
          new Date(r.createTime).toLocaleString(),
          r.reviewer.displayName,
          parseRating(r.starRating),
          r.comment || '',
          r.reviewReply?.comment || '(Pending)',
          r.reviewReply?.updateTime ? new Date(r.reviewReply.updateTime).toLocaleString() : ''
        ]);
      });
    } else {
      const headers = ['Review ID', 'Reviewer Name', 'Star Rating', 'Review Comment', 'Date & Time', 'Owner Reply', 'Reply Time'];
      const rows = reviews.map(r => [
        r.reviewId,
        r.reviewer.displayName,
        parseRating(r.starRating),
        r.comment || '',
        new Date(r.createTime).toLocaleString(),
        r.reviewReply?.comment || '(Not Replied)',
        r.reviewReply?.updateTime ? new Date(r.reviewReply.updateTime).toLocaleString() : '-'
      ]);
      dataToExport = [headers, ...rows];
    }

    try {
      const res = await fetch('/api/sync/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: spreadsheetId.trim(),
          data: dataToExport,
          sheetTitle
        })
      });
      const resData = await res.json();
      if (res.ok) {
        setSyncStatus('success');
        setSyncFeedback(lang === 'hi' ? `सफलतापूर्वक डेटा Google Sheet में सेव हो गया!` : `Exported rows to ${resData.range || 'sheet'}!`);
        setTimeout(() => setSyncStatus('idle'), 4000);
      } else {
        setSyncStatus('error');
        setSyncFeedback(resData.error || 'Failed to sync to Google Sheets.');
      }
    } catch (err: any) {
      setSyncStatus('error');
      setSyncFeedback(err.message || 'Sync failed');
    }
  };

  const handleDownloadCsv = () => {
    const headers = ['Review ID', 'Reviewer', 'Rating', 'Date', 'Customer Comment', 'Owner Reply', 'Reply Date'];
    const rows = reviews.map(r => [
      `"${r.reviewId}"`,
      `"${r.reviewer.displayName.replace(/"/g, '""')}"`,
      parseRating(r.starRating),
      `"${new Date(r.createTime).toLocaleDateString()}"`,
      `"${(r.comment || '').replace(/"/g, '""')}"`,
      `"${(r.reviewReply?.comment || '').replace(/"/g, '""')}"`,
      `"${r.reviewReply?.updateTime ? new Date(r.reviewReply.updateTime).toLocaleDateString() : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `GBP_Reviews_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-500 text-sm font-medium">Loading Google Business Profile Suite...</p>
        </div>
      </div>
    );
  }

  // Navigation Items
  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { id: 'dashboard', label: t.dashboard, icon: <BarChart3 className="w-4 h-4 mr-3" /> },
    { id: 'reviews', label: t.reviewsReplies, icon: <MessageSquare className="w-4 h-4 mr-3" />, badge: pendingReviews.length || undefined },
    { id: 'reports', label: t.reportsWeekly, icon: <TrendingUp className="w-4 h-4 mr-3" /> },
    { id: 'autoreply', label: t.autoReply, icon: <Bot className="w-4 h-4 mr-3" />, badge: 'AI' },
    { id: 'growth', label: t.growthTools, icon: <QrCode className="w-4 h-4 mr-3" />, badge: 'New' },
    { id: 'posts', label: t.profilePosts, icon: <Megaphone className="w-4 h-4 mr-3" /> },
    { id: 'services', label: t.servicesManager, icon: <Briefcase className="w-4 h-4 mr-3" /> },
    { id: 'sheets', label: t.sheetsSync, icon: <FileSpreadsheet className="w-4 h-4 mr-3" /> }
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans">
      {/* Desktop Persistent Sidebar (Hidden on mobile < 768px) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 h-screen flex-col p-6 sticky top-0 overflow-y-auto z-20 flex-shrink-0">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold shadow-sm">G</div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-lg leading-tight tracking-tight">{t.appName}</span>
            <span className="text-[10px] text-slate-400 font-medium">{t.appSub}</span>
          </div>
        </div>

        {/* Location Selector */}
        <div className="mb-6">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center justify-between">
            <span>{lang === 'hi' ? 'लोकेशन' : 'Location'}</span>
            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">{locations.length}</span>
          </div>
          <select 
            value={selectedLocation || ''}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              loadAllData(e.target.value);
            }}
            className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-700 outline-none focus:border-blue-500"
          >
            {locations.map(loc => (
              <option key={loc.name} value={loc.name}>{loc.title}</option>
            ))}
          </select>
        </div>

        {/* Active Location Info Card */}
        {activeLoc && (activeLoc as any).categories && (
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 shadow-sm">
            {(activeLoc as any).categories?.primaryCategory?.displayName && (
              <div className="flex items-center gap-1.5 mb-1.5 font-medium text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                {(activeLoc as any).categories.primaryCategory.displayName}
              </div>
            )}
            {(activeLoc as any).storefrontAddress?.locality && (
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="leading-tight">
                  {(activeLoc as any).storefrontAddress.addressLines?.[0]} {(activeLoc as any).storefrontAddress.locality}
                </span>
              </div>
            )}
            {activeLoc.storeCode && (
              <div className="mt-2 text-[9px] text-slate-500 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 inline-block">
                Code: {activeLoc.storeCode}
              </div>
            )}
          </div>
        )}

        {/* Nav Tabs */}
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full sidebar-item ${activeTab === item.id ? 'sidebar-item-active' : ''}`}
            >
              {item.icon}
              <span className="flex-1 text-left text-xs font-medium">{item.label}</span>
              {item.badge !== undefined && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  typeof item.badge === 'number' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer Monitor Badge */}
        <div className="mt-auto space-y-3 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-500">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center font-medium text-slate-700">
                <span className="status-pulse"></span> {t.monitoringActive}
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{lang === 'hi' ? 'आज के रिव्यू:' : "Today's Revs:"}</span>
              <span className="font-bold text-slate-700 font-mono">+{todayReviews.length} new</span>
            </div>
          </div>

          {authStatus ? (
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.disconnect}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-md text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" className="w-3.5 h-3.5 invert brightness-200" alt="" />
              {t.connectGoogle}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Off-Canvas Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl p-6 flex flex-col z-10 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">G</div>
                  <span className="font-bold text-slate-800 text-base">{t.appName}</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Profile Switcher */}
              <div className="mb-4">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  {lang === 'hi' ? 'लोकेशन चुनें' : 'Select Location'}
                </label>
                <select 
                  value={selectedLocation || ''}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    loadAllData(e.target.value);
                  }}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-700 outline-none"
                >
                  {locations.map(loc => (
                    <option key={loc.name} value={loc.name}>{loc.title}</option>
                  ))}
                </select>
              </div>

              {/* Mobile Nav Links */}
              <nav className="space-y-1 flex-1">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full sidebar-item text-xs ${activeTab === item.id ? 'sidebar-item-active' : ''}`}
                  >
                    {item.icon}
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <button 
                  onClick={() => setLang(l => l === 'hi' ? 'en' : 'hi')}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-700"
                >
                  <Languages className="w-4 h-4 text-blue-600" />
                  {lang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
                </button>
                {authStatus && (
                  <button 
                    onClick={handleLogout}
                    className="w-full text-xs text-red-600 font-semibold py-1.5 text-center"
                  >
                    {t.disconnect}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto pb-20 md:pb-8">
        {/* Sticky Header with Hamburger & Language Switcher */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 text-sm flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Hamburger on Mobile */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg focus:outline-none"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0 hidden sm:block" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="font-bold text-slate-800 text-xs sm:text-sm truncate max-w-[160px] sm:max-w-[280px]">
                  {activeLoc?.title}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(l => l === 'hi' ? 'en' : 'hi')}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Toggle Language"
            >
              <Languages className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px]">{lang === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>

            {/* Today's review counter chip */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">{lang === 'hi' ? 'आज:' : "Today:"}</span>
              <strong className="text-slate-900 font-bold">+{todayReviews.length}</strong>
            </div>

            <button 
              onClick={() => loadAllData(activeLoc?.name)}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">

          {/* ================= TAB: DASHBOARD ================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Responsive 4 Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="card p-5 border-l-4 border-l-blue-600">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                    {lang === 'hi' ? 'आज के रिव्यू (Reviews Today)' : "Reviews Today"}
                  </div>
                  <div className="text-3xl font-bold text-slate-800">{todayReviews.length}</div>
                  <div className="text-[11px] text-emerald-600 mt-2 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {todayReviews.length > 0 ? `+${todayReviews.length} new reviews today` : 'Live monitoring active'}
                  </div>
                </div>

                <div className="card p-5 border-l-4 border-l-amber-500">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                    {lang === 'hi' ? 'एवरेज स्टार रेटिंग' : 'Average Star Rating'}
                  </div>
                  <div className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                    {avgRating}
                    <div className="flex text-amber-400">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(Number(avgRating)) ? 'fill-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2 font-medium">
                    Total {reviews.length} customer ratings
                  </div>
                </div>

                <div className="card p-5 border-l-4 border-l-emerald-500">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                    {lang === 'hi' ? 'ओनर रिप्लाई रेट' : 'Owner Response Rate'}
                  </div>
                  <div className="text-3xl font-bold text-slate-800">{responseRate}%</div>
                  <div className="text-[11px] text-slate-500 mt-2 font-medium">
                    {repliedReviews.length} replied / {pendingReviews.length} pending
                  </div>
                </div>

                <div className="card p-5 border-l-4 border-l-indigo-500">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                    {lang === 'hi' ? 'लाइव पोस्ट एवं सेवाएं' : 'Posts & Services Live'}
                  </div>
                  <div className="text-3xl font-bold text-slate-800">{posts.length + services.length}</div>
                  <div className="text-[11px] text-slate-400 mt-2 font-medium">
                    {posts.length} posts, {services.length} services active
                  </div>
                </div>
              </div>

              {/* Action Banner for Auto-Reply */}
              {pendingReviews.length > 0 && (
                <div className="card p-4 sm:p-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {pendingReviews.length} {lang === 'hi' ? 'रिव्यू पर रिप्लाई बाकी है' : 'Unreplied Reviews Pending'}
                      </h4>
                      <p className="text-slate-500 text-xs">
                        {lang === 'hi' ? 'AI की मदद से तुरंत सभी कस्टमर्स को सम्मानित रिप्लाई भेजें।' : 'Send personalized AI-crafted owner replies with 1 click.'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('autoreply')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
                  >
                    <Bot className="w-4 h-4" />
                    {lang === 'hi' ? 'ऑटो रिप्लाई करें' : 'Auto-Reply Now'}
                  </button>
                </div>
              )}

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Today & Recent Reviews */}
                <div className="lg:col-span-2 card overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 text-sm">
                        {lang === 'hi' ? 'हाल के रिव्यू एवं ओनर के उत्तर' : 'Recent Reviews & Owner Replies'}
                      </h3>
                      <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                        {reviews.length}
                      </span>
                    </div>
                    <button 
                      onClick={() => setActiveTab('reviews')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      {lang === 'hi' ? 'सभी देखें' : 'View All'} <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 overflow-y-auto max-h-[440px]">
                    {reviews.slice(0, 5).map((rev) => {
                      const stars = parseRating(rev.starRating);
                      const hasReply = !!rev.reviewReply?.comment;
                      const todayReview = isToday(rev.createTime);

                      return (
                        <div key={rev.reviewId} className="p-4 hover:bg-slate-50/60 transition-colors space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={rev.reviewer.profilePhotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'} 
                                className="w-8 h-8 rounded-full border border-slate-200"
                                alt=""
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-xs text-slate-800">{rev.reviewer.displayName}</span>
                                  {todayReview && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 rounded">
                                      TODAY
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                  <div className="flex text-amber-400">
                                    {[1,2,3,4,5].map(i => (
                                      <Star key={i} className={`w-3 h-3 ${i <= stars ? 'fill-amber-400' : 'text-slate-200'}`} />
                                    ))}
                                  </div>
                                  <span>•</span>
                                  <span>{new Date(rev.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>
                            </div>

                            {hasReply ? (
                              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1 flex-shrink-0">
                                <CheckCheck className="w-3 h-3" /> {lang === 'hi' ? 'रिप्लाई दिया' : 'Replied'}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleOpenReplyModal(rev)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors flex items-center gap-1 flex-shrink-0"
                              >
                                <MessageSquare className="w-3 h-3" /> {lang === 'hi' ? 'उत्तर दें' : 'Reply'}
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed sm:pl-11">
                            {rev.comment || <span className="italic text-slate-400">No written text provided.</span>}
                          </p>

                          {hasReply && (
                            <div className="sm:ml-11 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <span>Response from owner</span>
                                <span>{new Date(rev.reviewReply!.updateTime).toLocaleDateString()}</span>
                              </div>
                              <p className="text-slate-700 italic font-medium">"{rev.reviewReply!.comment}"</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Quick Sheets Sync & 7-Day Activity */}
                <div className="space-y-6">
                  <div className="card p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          {lang === 'hi' ? 'गूगल शीट ऑटो सिंक' : 'Google Sheets Sync'}
                        </h4>
                        <p className="text-slate-400 text-xs">
                          {lang === 'hi' ? 'रिव्यू डेटा शीट में लाइव भेजें' : 'Live data export to sheet'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Spreadsheet ID</label>
                      <input 
                        type="text" 
                        placeholder="1x9k...4p2" 
                        value={spreadsheetId}
                        onChange={(e) => setSpreadsheetId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:border-blue-500 outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-2 pt-1">
                      <button 
                        onClick={() => handleSyncToSheets(false)}
                        disabled={syncStatus === 'syncing' || !spreadsheetId}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        {syncStatus === 'syncing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                        {syncStatus === 'syncing' ? 'Syncing...' : (lang === 'hi' ? 'रिव्यू शीट में सिंक करें' : 'Sync Reviews to Sheet')}
                      </button>

                      <button 
                        onClick={() => handleSyncToSheets(true)}
                        disabled={syncStatus === 'syncing' || !spreadsheetId}
                        className="w-full bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                        {lang === 'hi' ? 'पूरी एनालिटिक्स रिपोर्ट भेजें' : 'Export Full Report to Sheet'}
                      </button>

                      {syncFeedback && (
                        <p className={`text-[11px] p-2 rounded text-center ${syncStatus === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {syncFeedback}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 7 Days Bar */}
                  <div className="card p-5 space-y-3">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      {lang === 'hi' ? 'पिछले 7 दिनों की एक्टिविटी' : 'Last 7 Days Velocity'}
                    </h4>
                    <div className="space-y-2">
                      {weeklyDayBreakdown.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium w-16">{item.dayName}</span>
                          <div className="flex-1 mx-3 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, item.total * 30 + 10)}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-700 font-bold w-12 text-right">{item.total} revs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: GROWTH & QR TOOLS ================= */}
          {activeTab === 'growth' && (
            <GrowthTools location={activeLoc} reviews={reviews} lang={lang} />
          )}

          {/* ================= TAB: REVIEWS & REPLIES ================= */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{t.reviewsReplies}</h2>
                  <p className="text-slate-500 text-xs">
                    {lang === 'hi' 
                      ? 'कस्टमर के रिव्यू देखें, ओनर का उत्तर पढ़ें या AI से तुरंत नया उत्तर तैयार करें।' 
                      : 'Monitor feedback, read merchant replies, and publish direct responses to Google.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleDownloadCsv}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    CSV
                  </button>

                  <button 
                    onClick={() => setActiveTab('autoreply')}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {lang === 'hi' ? 'AI ऑटो रिप्लाई' : 'Auto-Reply'}
                  </button>
                </div>
              </div>

              {/* Segmented Filter Control */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto text-xs font-semibold">
                {[
                  { id: 'all', label: `${lang === 'hi' ? 'सभी' : 'All'} (${reviews.length})` },
                  { id: 'today', label: `${lang === 'hi' ? 'आज के' : 'Today'} (${todayReviews.length})` },
                  { id: 'unreplied', label: `${lang === 'hi' ? 'पेंडिंग' : 'Pending'} (${pendingReviews.length})` },
                  { id: 'replied', label: `${lang === 'hi' ? 'रिप्लाई दिया' : 'Replied'} (${repliedReviews.length})` },
                  { id: 'critical', label: lang === 'hi' ? 'क्रिटिकल (1-3★)' : 'Critical (1-3★)' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setReviewFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                      reviewFilter === f.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Review Cards */}
              <div className="space-y-4">
                {displayedReviews.map((rev) => {
                  const stars = parseRating(rev.starRating);
                  const hasReply = !!rev.reviewReply?.comment;

                  return (
                    <div key={rev.reviewId} className="card p-5 space-y-4 transition-all hover:shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <img 
                            src={rev.reviewer.profilePhotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'} 
                            className="w-10 h-10 rounded-full border border-slate-200 mt-0.5 flex-shrink-0"
                            alt=""
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-slate-800">{rev.reviewer.displayName}</h4>
                              {isToday(rev.createTime) && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                                  TODAY
                                </span>
                              )}
                              <span className="text-xs text-slate-400 font-mono">
                                {new Date(rev.createTime).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 mt-1 text-amber-400">
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i <= stars ? 'fill-amber-400' : 'text-slate-200'}`} />
                              ))}
                              <span className="text-xs font-bold text-slate-600 ml-1">{stars} / 5</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {hasReply ? (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                              <CheckCheck className="w-3.5 h-3.5" /> {lang === 'hi' ? 'उत्तर दिया जा चुका है' : 'Replied'}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {lang === 'hi' ? 'उत्तर बाकी है' : 'Pending Reply'}
                            </span>
                          )}

                          <button 
                            onClick={() => handleOpenReplyModal(rev)}
                            className="px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            {hasReply ? (lang === 'hi' ? 'एडिट' : 'Edit') : (lang === 'hi' ? 'रिप्लाई' : 'Reply')}
                          </button>
                        </div>
                      </div>

                      {/* Review Text */}
                      <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed">
                        {rev.comment || <span className="text-slate-400 italic">User left a rating without written feedback.</span>}
                      </div>

                      {/* Reply Box */}
                      {hasReply && (
                        <div className="p-3.5 bg-blue-50/50 border border-blue-200/80 rounded-lg space-y-1 text-xs">
                          <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-blue-600" />
                              Official Owner Response (Published on Google)
                            </span>
                            <button 
                              onClick={() => handleDeleteReply(rev.reviewId, rev.name)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete reply"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-slate-800 font-medium">"{rev.reviewReply!.comment}"</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB: REPORTS & ANALYTICS ================= */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {lang === 'hi' ? 'रिव्यू एनालिटिक्स एवं कस्टम रिपोर्ट्स' : 'Review Analytics & Custom Reports'}
                  </h2>
                  <p className="text-slate-500 text-xs">
                    {lang === 'hi' 
                      ? 'दैनिक और साप्ताहिक ब्यौरा देखें, और सीधे Google Sheets या CSV में एक्सपोर्ट करें।' 
                      : 'Track daily/weekly review counts, ratings distribution, and export directly to Google Sheets.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleDownloadCsv}
                    className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    CSV
                  </button>

                  <button 
                    onClick={() => handleSyncToSheets(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    {lang === 'hi' ? 'गूगल शीट में एक्सपोर्ट करें' : 'Export Full Report to Sheet'}
                  </button>
                </div>
              </div>

              {/* 4 Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    {lang === 'hi' ? 'आज के रिव्यू' : "Today's Reviews"}
                  </div>
                  <div className="text-3xl font-bold text-blue-600">{todayReviews.length}</div>
                  <div className="text-[11px] text-slate-500 mt-2 font-medium">Logged today</div>
                </div>

                <div className="card p-5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    {lang === 'hi' ? '7 दिन का कुल रिव्यू' : '7 Days Volume'}
                  </div>
                  <div className="text-3xl font-bold text-slate-800">
                    {weeklyDayBreakdown.reduce((sum, d) => sum + d.total, 0)}
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-2 font-medium">Weekly customer velocity</div>
                </div>

                <div className="card p-5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    {lang === 'hi' ? 'एवरेज रेटिंग' : 'Average Rating'}
                  </div>
                  <div className="text-3xl font-bold text-amber-500">{avgRating} / 5.0</div>
                  <div className="text-[11px] text-slate-500 mt-2 font-medium">Across all reviews</div>
                </div>

                <div className="card p-5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    {lang === 'hi' ? 'रिस्पॉन्स रेट' : 'Response Rate'}
                  </div>
                  <div className="text-3xl font-bold text-emerald-600">{responseRate}%</div>
                  <div className="text-[11px] text-slate-500 mt-2 font-medium">{repliedReviews.length} of {reviews.length} replied</div>
                </div>
              </div>

              {/* Weekly Day-by-Day Table */}
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-sm">
                    {lang === 'hi' ? 'हफ्ते का दिन-प्रतिदिन ब्यौरा (Weekly Breakdown)' : 'Weekly Day-by-Day Breakdown'}
                  </h3>
                  <span className="text-xs text-slate-400">Past 7 days performance</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full data-table">
                    <thead>
                      <tr>
                        <th>{lang === 'hi' ? 'दिन / तारीख' : 'Day / Date'}</th>
                        <th>{lang === 'hi' ? 'कुल रिव्यू' : 'Total Reviews'}</th>
                        <th>5★</th>
                        <th>&le; 3★</th>
                        <th>Avg Rating</th>
                        <th>{lang === 'hi' ? 'रिप्लाई हुए' : 'Replied'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyDayBreakdown.map((item, idx) => (
                        <tr key={idx} className={item.dayName === 'Today' || item.dayName === 'आज' ? 'bg-blue-50/30' : ''}>
                          <td className="font-semibold text-slate-800 whitespace-nowrap">
                            {item.dayName} <span className="text-slate-400 text-xs font-normal">({item.dateLabel})</span>
                          </td>
                          <td className="font-bold text-slate-700 font-mono">{item.total}</td>
                          <td className="text-amber-600 font-semibold">{item.fiveStars}</td>
                          <td className="text-red-500 font-semibold">{item.negative}</td>
                          <td>
                            <div className="flex items-center gap-1 font-bold text-slate-700">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {item.avgRating}
                            </div>
                          </td>
                          <td className="text-slate-600 font-medium">{item.replied} of {item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: AUTO-REPLY AI ================= */}
          {activeTab === 'autoreply' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{t.autoReply}</h2>
                  <p className="text-slate-500 text-xs">
                    {lang === 'hi' 
                      ? 'Gemini AI की सहायता से बिना देरी सभी कस्टमर्स को सम्मानित रिप्लाई भेजें।' 
                      : 'Intelligent automated responses for incoming 1-5 star reviews using Gemini AI.'}
                  </p>
                </div>

                <button 
                  onClick={handleAutoReplyAllPending}
                  disabled={autoReplyingAll || pendingReviews.length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm self-start sm:self-auto"
                >
                  {autoReplyingAll ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                  {autoReplyingAll 
                    ? `Replying ${autoReplyProgress?.current}/${autoReplyProgress?.total}...` 
                    : (lang === 'hi' ? `सभी ${pendingReviews.length} पेंडिंग रिव्यू पर ऑटो रिप्लाई करें` : `Auto-Reply All ${pendingReviews.length} Pending`)}
                </button>
              </div>

              {autoReplyProgress && (
                <div className="card p-4 bg-blue-50 border-blue-200 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-blue-900">
                    <span>Sending AI-crafted replies...</span>
                    <span>{autoReplyProgress.current} / {autoReplyProgress.total}</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(autoReplyProgress.current / autoReplyProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {lang === 'hi' ? 'रिप्लाई की भाषा और टोन' : 'Reply Tone'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {['Warm & Courteous', 'Professional & Direct', 'Empathetic & Solution-Oriented'].map((tone) => (
                          <button
                            key={tone}
                            onClick={() => setAutoReplyTone(tone)}
                            className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                              autoReplyTone === tone 
                                ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' 
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {tone}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {lang === 'hi' ? 'मैनेजमेंट निर्देश (Instructions for Gemini)' : 'Custom Business Instructions'}
                      </label>
                      <textarea 
                        rows={3}
                        value={autoReplyPromptInstructions}
                        onChange={(e) => setAutoReplyPromptInstructions(e.target.value)}
                        placeholder="e.g. Always apologize politely for ratings below 3 stars and provide manager direct phone: 9876543210."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Pending list */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">
                      {lang === 'hi' ? 'उत्तर के इंतज़ार में रिव्यू' : 'Pending Reviews'} ({pendingReviews.length})
                    </h3>
                  </div>

                  <div className="divide-y divide-slate-100 overflow-y-auto max-h-[350px]">
                    {pendingReviews.map(rev => (
                      <div key={rev.reviewId} className="py-2.5 space-y-1 text-xs">
                        <div className="flex justify-between font-bold">
                          <span>{rev.reviewer.displayName}</span>
                          <span className="text-amber-500">{parseRating(rev.starRating)} ★</span>
                        </div>
                        <p className="text-slate-600 line-clamp-2 italic">"{rev.comment || 'Rating without comment'}"</p>
                        <button
                          onClick={() => handleOpenReplyModal(rev)}
                          className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 pt-1"
                        >
                          <Sparkles className="w-3 h-3" /> Draft AI Response
                        </button>
                      </div>
                    ))}
                    {pendingReviews.length === 0 && (
                      <div className="py-8 text-center text-slate-400">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                        <p className="font-semibold text-xs text-slate-600">All caught up!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: PROFILE POSTS ================= */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{t.profilePosts}</h2>
                  <p className="text-slate-500 text-xs">
                    {lang === 'hi' 
                      ? 'गूगल मैप्स और सर्च पर दिखने वाले अपडेट, ऑफर और इवेंट्स प्रकाशित करें।' 
                      : 'Publish updates, offers, and events directly onto your Google Search and Maps listing.'}
                  </p>
                </div>

                <button 
                  onClick={() => setShowNewPostModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  {lang === 'hi' ? 'नई पोस्ट बनाएं' : 'Create Google Post'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <div key={post.id} className="card overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    {post.mediaUrl && (
                      <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                        <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />
                        <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded shadow bg-slate-900/80 text-white uppercase tracking-wider backdrop-blur-sm">
                          {post.topicType}
                        </span>
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {new Date(post.createTime).toLocaleDateString()}
                          </span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live on Google
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-normal">
                          {post.summary}
                        </p>

                        {post.offer?.couponCode && (
                          <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs font-mono font-bold text-amber-900 flex items-center justify-between">
                            <span>Coupon: {post.offer.couponCode}</span>
                            <Tag className="w-3.5 h-3.5 text-amber-700" />
                          </div>
                        )}
                      </div>

                      {post.callToAction && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">CTA Button</span>
                          <a 
                            href={post.callToAction.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded"
                          >
                            {post.callToAction.actionType}
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB: SERVICES MANAGER ================= */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{t.servicesManager}</h2>
                  <p className="text-slate-500 text-xs">
                    {lang === 'hi' 
                      ? 'अपनी प्रोफाइल की सेवाएं, कीमत और विवरण प्रबंधित करें।' 
                      : 'Add and manage services offered on your Google Business listing.'}
                  </p>
                </div>

                <button 
                  onClick={() => setShowAddServiceModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  {lang === 'hi' ? 'नई सर्विस जोड़ें' : 'Add Service'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {services.map((srv) => (
                  <div key={srv.id} className="card p-5 space-y-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {srv.category}
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm mt-1">{srv.name}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-1 rounded">
                          {srv.priceType === 'FREE' ? 'FREE' : `${srv.priceType === 'STARTING_AT' ? 'From ' : ''}₹${srv.price}`}
                        </span>
                        <button 
                          onClick={async () => {
                            await fetch(`/api/gbp/services/${srv.id}`, { method: 'DELETE' });
                            setServices(prev => prev.filter(s => s.id !== srv.id));
                          }}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {srv.description || 'No service description provided.'}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1 text-emerald-600">
                        <Check className="w-3 h-3" /> Synced to Google Profile
                      </span>
                      <span>Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB: SHEETS SYNC ================= */}
          {activeTab === 'sheets' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{t.sheetsSync}</h2>
                <p className="text-slate-500 text-xs">
                  {lang === 'hi' 
                    ? 'सभी रिव्यू, ओनर के रिप्लाई और साप्ताहिक रिपोर्ट को Google Sheet में एक्सपोर्ट करें।' 
                    : 'Export all reviews, merchant replies, and weekly analytics directly to your Google Sheet.'}
                </p>
              </div>

              <div className="card p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Spreadsheet ID</label>
                  <input 
                    type="text" 
                    placeholder="1x9k...4p2" 
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-blue-500 outline-none font-mono"
                  />
                  <p className="text-xs text-slate-400">
                    Open your Google Sheet, copy the string between <code className="bg-slate-100 px-1 py-0.5 rounded">/d/</code> and <code className="bg-slate-100 px-1 py-0.5 rounded">/edit</code>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button 
                    onClick={() => handleSyncToSheets(false)}
                    disabled={syncStatus === 'syncing' || !spreadsheetId}
                    className="p-4 bg-white border border-slate-200 hover:border-blue-500 rounded-xl text-left space-y-2 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 group-hover:text-blue-600">
                        {lang === 'hi' ? 'रिव्यू लॉग शीट में एक्सपोर्ट करें' : 'Export Reviews Log'}
                      </h4>
                      <p className="text-xs text-slate-500">Pushes table of review ID, customer name, star rating, comment, date, and owner reply.</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleSyncToSheets(true)}
                    disabled={syncStatus === 'syncing' || !spreadsheetId}
                    className="p-4 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl text-left space-y-2 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 group-hover:text-emerald-600">
                        {lang === 'hi' ? 'पूरी एनालिटिक्स रिपोर्ट एक्सपोर्ट करें' : 'Export Full Analytics Report'}
                      </h4>
                      <p className="text-xs text-slate-500">Pushes summary metrics, today's review counts, and 7-day day-by-day performance tables.</p>
                    </div>
                  </button>
                </div>

                {syncFeedback && (
                  <div className={`p-4 rounded-lg text-xs font-semibold ${syncStatus === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {syncFeedback}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Mobile Bottom Navigation (Visible on mobile < 768px) */}
      <MobileBottomNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingReviewsCount={pendingReviews.length}
        openMobileMenu={() => setMobileMenuOpen(true)}
        lang={lang}
      />

      {/* Modal: Reply to Review */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl card p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Reply to Google Review</h3>
                <p className="text-slate-400 text-xs">Response publishes directly to your Google Business Profile.</p>
              </div>
              <button onClick={() => setReplyingReview(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{replyingReview.reviewer.displayName}</span>
                <span className="text-amber-500 font-bold">{parseRating(replyingReview.starRating)} ★</span>
              </div>
              <p className="text-slate-600 italic">"{replyingReview.comment || 'No text comment provided'}"</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Your Response</label>
                <button
                  type="button"
                  onClick={() => handleGenerateAiReply(replyingReview)}
                  disabled={aiGeneratingReply}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {aiGeneratingReply ? 'Generating with Gemini...' : 'Generate Smart AI Reply'}
                </button>
              </div>

              <textarea 
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response to the customer..."
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button 
                onClick={() => setReplyingReview(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitReply}
                disabled={sendingReply || !replyText.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                {sendingReply ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {sendingReply ? 'Publishing...' : 'Publish to Google'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal: Create Post */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg card p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Create Google Business Post</h3>
              <button onClick={() => setShowNewPostModal(false)} className="text-slate-400 text-sm font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Post Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['STANDARD', 'OFFER', 'EVENT'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewPostType(type)}
                      className={`p-2 rounded-lg border font-bold text-center ${newPostType === type ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      {type === 'STANDARD' ? "What's New" : type === 'OFFER' ? 'Special Offer' : 'Event'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Post Summary / Text</label>
                <textarea 
                  rows={3}
                  value={newPostSummary}
                  onChange={(e) => setNewPostSummary(e.target.value)}
                  placeholder="Announce your update or special offer..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                />
              </div>

              {newPostType === 'OFFER' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Coupon Code (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="SPECIAL20"
                    value={newPostCoupon}
                    onChange={(e) => setNewPostCoupon(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none font-mono"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Call to Action</label>
                  <select 
                    value={newPostCtaType}
                    onChange={(e: any) => setNewPostCtaType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                  >
                    <option value="BOOK">Book</option>
                    <option value="ORDER">Order Online</option>
                    <option value="SHOP">Shop</option>
                    <option value="LEARN_MORE">Learn More</option>
                    <option value="CALL">Call Now</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Link URL</label>
                  <input 
                    type="text" 
                    value={newPostCtaUrl}
                    onChange={(e) => setNewPostCtaUrl(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Photo Image URL</label>
                <input 
                  type="text" 
                  value={newPostMediaUrl}
                  onChange={(e) => setNewPostMediaUrl(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowNewPostModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">
                Cancel
              </button>
              <button 
                onClick={handleCreatePost}
                disabled={creatingPost || !newPostSummary.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                {creatingPost ? 'Publishing...' : 'Publish to Google'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal: Add Service */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md card p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Add Business Service</h3>
              <button onClick={() => setShowAddServiceModal(false)} className="text-slate-400 text-sm font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select 
                  value={newServiceCategory}
                  onChange={(e) => setNewServiceCategory(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                >
                  <option value="Dining & Experiences">Dining & Experiences</option>
                  <option value="Catering & Events">Catering & Events</option>
                  <option value="Takeaway & Delivery">Takeaway & Delivery</option>
                  <option value="Reservations & VIP">Reservations & VIP</option>
                  <option value="Custom Service">Custom Service</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Service Name</label>
                <input 
                  type="text" 
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="e.g. Birthday Party Hall Booking"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price Type</label>
                  <select 
                    value={newServicePriceType}
                    onChange={(e: any) => setNewServicePriceType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                  >
                    <option value="FIXED">Fixed Price</option>
                    <option value="STARTING_AT">Starting At</option>
                    <option value="FREE">Free</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    disabled={newServicePriceType === 'FREE'}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none disabled:opacity-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea 
                  rows={2}
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  placeholder="Details about what is included..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowAddServiceModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">
                Cancel
              </button>
              <button 
                onClick={handleAddService}
                disabled={!newServiceName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Save Service
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
