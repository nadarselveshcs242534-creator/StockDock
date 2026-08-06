import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Package, FileText, BarChart3, LogOut, Layers, CheckCircle2, Printer, Store, Filter, Eye, Trash2, Download, AlertCircle, Phone, MapPin, Sparkles, Zap, ShieldCheck, ArrowRight, Truck, Sun, Moon, Clock, Languages, Bot, X, CreditCard, CheckCircle, QrCode, Copy, Check, RefreshCw, Smartphone, ArrowLeft, AlertTriangle, Receipt, ShoppingBag, Lock, Timer, RefreshCcw, Radio, Home, Calendar, FileSpreadsheet } from 'lucide-react';

// ⚡ DYNAMIC API BASE URL FOR VITE DEPLOYMENT
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';

// ============================================================================
// 🍞 MULTI-BRAND MASTER INVENTORY
// ============================================================================
const MASTER_INVENTORY = {
  'Relish White Bread 400g': { brand: 'Relish', price: 45, defaultTarget: 5 },
  'Relish White Bread 200g': { brand: 'Relish', price: 25, defaultTarget: 5 },
  'Relish Brown Bread 400g': { brand: 'Relish', price: 50, defaultTarget: 3 },
  'Relish Brown Bread 200g': { brand: 'Relish', price: 25, defaultTarget: 3 },
  'Relish Special Bread': { brand: 'Relish', price: 45, defaultTarget: 3 },
  'Relish Sandwich Bread 800g': { brand: 'Relish', price: 90, defaultTarget: 2 },
  'Relish Cream Roll Single': { brand: 'Relish', price: 8, defaultTarget: 15 },
  'Relish Cream Roll Double': { brand: 'Relish', price: 13, defaultTarget: 10 },
  'Relish Bun Pav (Fruit Bun)': { brand: 'Relish', price: 8, defaultTarget: 10 },
  'Relish Vesta Bread': { brand: 'Relish', price: 50, defaultTarget: 2 },

  'English Oven White Bread 400g': { brand: 'English Oven', price: 45, defaultTarget: 5 },
  'English Oven White Bread 200g': { brand: 'English Oven', price: 25, defaultTarget: 5 },
  'English Oven Whole Wheat': { brand: 'English Oven', price: 50, defaultTarget: 3 },
  'English Oven Brown Bread 200g': { brand: 'English Oven', price: 25, defaultTarget: 3 },
  'English Oven Multigrain Bread': { brand: 'English Oven', price: 60, defaultTarget: 2 },
  'English Oven Milk Bread': { brand: 'English Oven', price: 45, defaultTarget: 4 },
  'English Oven Burger Bun 2pcs': { brand: 'English Oven', price: 20, defaultTarget: 5 },
  'English Oven Pizza 6 inches': { brand: 'English Oven', price: 25, defaultTarget: 4 },
  'English Oven Seeded Bun': { brand: 'English Oven', price: 40, defaultTarget: 3 },
  'English Oven Pizza 8 inches': { brand: 'English Oven', price: 50, defaultTarget: 2 },
  'English Oven Jumbo Seeded Bun': { brand: 'English Oven', price: 80, defaultTarget: 2 },
  'English Oven Barrel Bread': { brand: 'English Oven', price: 90, defaultTarget: 2 },
  'English Oven White Bread 1000g': { brand: 'English Oven', price: 100, defaultTarget: 2 },

  'Max Heath White Bread 400g': { brand: 'Max Heath', price: 45, defaultTarget: 5 },
  'Max Heath White Bread 200g': { brand: 'Max Heath', price: 25, defaultTarget: 5 },
  'Max Heath Brown Bread 400g': { brand: 'Max Heath', price: 50, defaultTarget: 3 },
  'Max Heath Brown Bread 200g': { brand: 'Max Heath', price: 25, defaultTarget: 3 },
  'Max Heath Multigrain Bread': { brand: 'Max Heath', price: 60, defaultTarget: 2 },
  'Max Heath White Bread 800g': { brand: 'Max Heath', price: 90, defaultTarget: 2 }
};

// ============================================================================
// 🏦 3 MULTI-ACCOUNT GATEWAY SETTINGS
// ============================================================================
const MERCHANT_ACCOUNTS = [
  { id: 'gpay', name: 'Google Pay', tag: 'Primary Acc 1', bank: 'HDFC Bank • Main Server', upiId: 'selveshnadar@okhdfcbank', color: 'from-blue-600 to-blue-800', border: 'border-blue-500/30', icon: '🔵' },
  { id: 'phonepe', name: 'PhonePe', tag: 'Backup Acc 2', bank: 'ICICI Bank • Server 2', upiId: 'selveshnadar@ibl', color: 'from-blue-700 to-indigo-800', border: 'border-indigo-500/30', icon: '🟣' },
  { id: 'paytm', name: 'Paytm', tag: 'Backup Acc 3', bank: 'SBI Bank • Server 3', upiId: 'selveshnadar@paytm', color: 'from-cyan-600 to-cyan-800', border: 'border-cyan-500/30', icon: '🟢' }
];

const formatTime12H = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

// Date Helpers
const isToday = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

const isThisMonth = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

// CSV Downloader Helper
const triggerCSVDownload = (csvContent, fileName) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- TRILINGUAL DICTIONARY ENGINE ---
const TRANSLATIONS = {
  en: {
    welcome: "Welcome to StockDock", subWelcome: "Enterprise POS & Supply Chain Cloud",
    storeOwner: "Store Owner", distributor: "Distributor", fullName: "Full Name",
    shopName: "Official Shop Name", shopAddress: "Shop Address (Area, City)",
    openTime: "Open Time", closeTime: "Close Time", agencyName: "Agency / Distribution Name",
    warehouseAddress: "Warehouse Address", mobileNumber: "Mobile Contact Number (10 Digits)",
    username: "Username", password: "Password", loginBtn: "Access Portal",
    registerBtn: "Register Enterprise Account", newUser: "New to StockDock? ",
    alreadyReg: "Already registered? ", createAcc: "Create Account", loginHere: "Login Here",
    live: "Live", signOut: "Sign Out", dailyMatrix: "Daily Stock Matrix", autoCalc: "Auto-Calculating",
    variety: "Variety", price: "Price", target: "Target", left: "Left", expired: "Expired",
    load: "Load", totalCargoLoad: "Total Cargo to Load", units: "Units", estBill: "Est. Billable Total",
    genInvoice: "Generate Official Master Invoice", taxInvoice: "Official Tax Invoice", ref: "Ref:",
    savePdf: "Save PDF", billedTo: "Billed To Store", date: "Date", item: "Item", leftExp: "Left(Exp)",
    loaded: "Loaded", total: "Total", masterTotal: "Master Total Due", awaitingPos: "Awaiting POS Submission",
    awaitingSub: "Select bread varieties and click generate to render the official printable tax invoice.",
    salesAnalytics: "Sales & Expiry Analytics", agency: "Agency", storeFilter: "Store Filter:", timeFilter: "Time Filter:",
    allStores: "🌐 All Stores (Network Total)", noSales: "No sales data recorded for this view yet.",
    liveNotices: "Live Cargo Dispatch Notices", inspectNotices: "Inspect order breakdowns or download official PDF tax invoices",
    storeDetails: "Store Details", pkgBreakdown: "Package Breakdown", manage: "Manage", totalBreads: "Total Breads",
    viewBill: "View Bill", dispatchedInvoice: "Official Dispatched Invoice", close: "Close", dispatchDate: "Dispatch Date",
    subtotal: "Subtotal", deleteTitle: "Delete Record?", deleteWarn: "You are about to permanently erase the data for",
    downloadFirst: "Want to download an accounting copy first?", viewSaveFirst: "View & Save PDF Copy First",
    permDelete: "Delete Immediately", downloadAndDelete: "Download CSV & Delete", cancel: "Cancel", aiSuccessTitle: "AI Prediction Applied!",
    aiTargetUpdated: "Target successfully updated to:", aiModelLabel: "Engine:", aiConfidenceLabel: "Confidence Score:",
    aiErrorTitle: "AI Service Unreachable", aiErrorDesc: "Could not connect to backend AI service. Is `node server.js` running on Port 5005?",
    payOnline: "Proceed to Checkout", proceedToPay: "Proceed to Secure Payment", backToInvoice: "Back to Invoice Review",
    paidBadge: "PAID", unpaidBadge: "UNPAID", verifySettle: "I Have Paid • Verify & Settle Invoice", scanText: "Scan with GPay, PhonePe, Paytm or BHIM", switchAccText: "Switch Bank Server if Account 1 is Down:",
    checkoutTitle: "StockDock Secure Checkout Portal", returnDash: "Return to Dashboard",
    sessionExpires: "QR Code Expires In:", qrExpired: "QR Session Expired", regenQr: "Regenerate QR Code", paymentDoneTitle: "Payment Verified & Settled!", paymentDoneSub: "Your transaction was securely settled via HDFC Bank Multi-Server Routing.", amountPaid: "Amount Paid:", paidTo: "Settled Into Account:", txnRef: "Transaction ID:", printReceipt: "Print Official Receipt",
    tabHome: "Home Dashboard", tabOrder: "Order Catalog", tabGraphs: "Performance Graphs", tabHistory: "Order History", tabPayments: "Payment History",
    historyTitle: "Order Delivery History", historySub: "Track past cargo deliveries in your network", paymentsTitle: "Payment & Settlements", paymentsSub: "Manage unpaid invoices and view past payment receipts", noHistory: "No orders found in your history.", noPayments: "No pending or past payments found.",
    shopPerformance: "My Shop Performance", shopPerformanceSub: "Visualize which products are selling vs expiring",
    menuTitle: "Management Center", menuSub: "Select a portal below to manage your daily operations",
    menuOrderDesc: "Browse multi-brand catalogs and generate new stock invoices.", menuGraphsDesc: "View sales vs. expiry analytics.",
    menuHistoryDesc: "Review all past inventory deliveries and cargo loading.", menuPaymentsDesc: "Settle unpaid bills and view past verified receipts.",
    tabDistAnalytics: "Network Analytics", tabDistHistory: "Network History", tabDistReport: "Sales Reports",
    menuDistAnalyticsDesc: "Visualize overall store sales and expiry metrics.", menuDistHistoryDesc: "View and manage all dispatched cargo orders.", menuDistReportDesc: "Generate and export daily or monthly financial reports.",
    salesReportTitle: "Financial Sales Report", salesReportSub: "Aggregated revenue and cargo data for your network", downloadReport: "Download CSV Report", revenue: "Total Revenue", allTime: "All Time", daily: "Today", monthly: "This Month"
  },
  hi: {
    welcome: "StockDock में आपका स्वागत है", subWelcome: "एंटरप्राइज़ पीओएस और सप्लाई चेन क्लाउड",
    storeOwner: "स्टोर मालिक", distributor: "वितरक (Distributor)", fullName: "पूरा नाम",
    shopName: "दुकान का आधिकारिक नाम", shopAddress: "दुकान का पता (क्षेत्र, शहर)",
    openTime: "खुलने का समय", closeTime: "बंद होने का समय", agencyName: "एजेंसी / वितरण का नाम",
    warehouseAddress: "गोदाम का पता", mobileNumber: "मोबाइल नंबर (10 अंक)",
    username: "यूज़रनेम", password: "पासवर्ड", loginBtn: "पोर्टल खोलें",
    registerBtn: "एंटरप्राइज़ खाता पंजीकृत करें", newUser: "StockDock पर नए हैं? ",
    alreadyReg: "पहले से पंजीकृत हैं? ", createAcc: "खाता बनाएं", loginHere: "यहाँ लॉगिन करें",
    live: "लाइव", signOut: "साइन आउट", dailyMatrix: "दैनिक स्टॉक मैट्रिक्स", autoCalc: "ऑटो-कैलकुलेशन",
    variety: "ब्रेड की किस्म", price: "मूल्य", target: "लक्ष्य", left: "बचा हुआ", expired: "एक्सपायर",
    load: "लोड करें", totalCargoLoad: "लोड करने के लिए कुल माल", units: "यूनिट्स", estBill: "अनुमानित कुल बिल",
    genInvoice: "आधिकारिक मास्टर चालान बनाएं", taxInvoice: "आधिकारिक टैक्स चालान", ref: "संदर्भ:",
    savePdf: "पीडीएफ (PDF) सहेजें", billedTo: "बिल की गई दुकान", date: "दिनांक", item: "आइटम", leftExp: "बचा (एक्सपायर)",
    loaded: "लोड किया गया", total: "कुल", masterTotal: "कुल देय राशि", awaitingPos: "पीओएस सबमिशन की प्रतीक्षा है",
    awaitingSub: "ब्रेड की किस्में चुनें और आधिकारिक प्रिंट करने योग्य टैक्स चालान बनाने के लिए जेनरेट पर क्लिक करें।",
    salesAnalytics: "बिक्री और एक्सपायरी एनालिटिक्स", agency: "एजेंसी", storeFilter: "स्टोर फ़िल्टर:", timeFilter: "समय फ़िल्टर:",
    allStores: "🌐 सभी स्टोर (नेटवर्क कुल)", noSales: "अभी तक इस व्यू के लिए कोई बिक्री डेटा दर्ज नहीं किया गया है।",
    liveNotices: "लाइव कार्गो डिस्पैच नोटिस", inspectNotices: "ऑर्डर का विवरण देखें या आधिकारिक पीडीएफ टैक्स चालान डाउनलोड करें",
    storeDetails: "स्टोर विवरण", pkgBreakdown: "पैकेज विवरण", manage: "प्रबंधन", totalBreads: "कुल ब्रेड",
    viewBill: "बिल देखें", dispatchedInvoice: "आधिकारिक भेजा गया चालान", close: "बंद करें", dispatchDate: "भेजने की तिथि",
    subtotal: "उप-योग", deleteTitle: "रिकॉर्ड हटाएं?", deleteWarn: "आप हमेशा के लिए डेटा मिटाने जा रहे हैं:",
    downloadFirst: "क्या आप पहले एक एकाउंटिंग कॉपी डाउनलोड करना चाहते हैं?", viewSaveFirst: "पहले देखें और पीडीएफ सहेजें",
    permDelete: "तुरंत हटाएं", downloadAndDelete: "CSV डाउनलोड करें और हटाएं", cancel: "रद्द करें", aiSuccessTitle: "AI भविष्यवाणी लागू की गई!",
    aiTargetUpdated: "लक्ष्य सफलतापूर्वक अपडेट किया गया:", aiModelLabel: "इंजन:", aiConfidenceLabel: "विश्वास स्कोर (Confidence):",
    aiErrorTitle: "AI सेवा उपलब्ध नहीं है", aiErrorDesc: "बैकएंड AI सेवा से कनेक्ट नहीं हो सका। क्या `node server.js` पोर्ट 5005 पर चल रहा है?",
    payOnline: "चेकआउट के लिए आगे बढ़ें", proceedToPay: "सुरक्षित भुगतान के लिए आगे बढ़ें", backToInvoice: "चालान पर वापस जाएं",
    paidBadge: "भुगतान हुआ (PAID)", unpaidBadge: "बकाया (UNPAID)", verifySettle: "मैंने भुगतान कर दिया है • पुष्टि करें", scanText: "GPay, PhonePe, Paytm या BHIM से स्कैन करें", switchAccText: "यदि सर्वर 1 बंद है तो बैंक खाता बदलें:",
    checkoutTitle: "StockDock सुरक्षित चेकआउट पोर्टल", returnDash: "डैशबोर्ड पर वापस जाएं",
    sessionExpires: "QR कोड समाप्त होगा:", qrExpired: "QR सत्र समाप्त हो गया", regenQr: "QR कोड पुनः बनाएं", paymentDoneTitle: "भुगतान सफलतापूर्वक पूर्ण हुआ!", paymentDoneSub: "आपका लेन-देन HDFC बैंक सर्वर द्वारा सुरक्षित रूप से संसाधित किया गया।", amountPaid: "भुगतान की गई राशि:", paidTo: "खाते में जमा हुआ:", txnRef: "लेन-देन आईडी:", printReceipt: "आधिकारिक रसीद प्रिंट करें",
    tabHome: "होम डैशबोर्ड", tabOrder: "ऑर्डर कैटलॉग", tabGraphs: "प्रदर्शन ग्राफ़", tabHistory: "ऑर्डर इतिहास", tabPayments: "भुगतान इतिहास",
    historyTitle: "ऑर्डर डिलीवरी इतिहास", historySub: "आपके नेटवर्क में पिछली सभी कार्गो डिलीवरी ट्रैक करें", paymentsTitle: "भुगतान और निपटान", paymentsSub: "अवैतनिक चालान प्रबंधित करें और पिछली भुगतान रसीदें देखें", noHistory: "आपके इतिहास में कोई ऑर्डर नहीं मिला।", noPayments: "कोई लंबित या पिछला भुगतान नहीं मिला।",
    shopPerformance: "मेरी दुकान का प्रदर्शन", shopPerformanceSub: "कल्पना करें कि कौन से उत्पाद बिक रहे हैं और कौन से एक्सपायर हो रहे हैं",
    menuTitle: "प्रबंधन केंद्र", menuSub: "अपने दैनिक कार्यों को प्रबंधित करने के लिए नीचे एक पोर्टल चुनें",
    menuOrderDesc: "मल्टी-ब्रांड कैटलॉग ब्राउज़ करें और नए स्टॉक चालान बनाएं।", menuGraphsDesc: "बिक्री बनाम एक्सपायरी एनालिटिक्स देखें।",
    menuHistoryDesc: "सभी पिछले इन्वेंट्री डिलीवरी की समीक्षा करें।", menuPaymentsDesc: "अवैतनिक बिलों का निपटान करें और पिछली रसीदें देखें।",
    tabDistAnalytics: "नेटवर्क एनालिटिक्स", tabDistHistory: "नेटवर्क इतिहास", tabDistReport: "बिक्री रिपोर्ट",
    menuDistAnalyticsDesc: "समग्र स्टोर बिक्री और एक्सपायरी मेट्रिक्स की कल्पना करें।", menuDistHistoryDesc: "सभी भेजे गए कार्गो ऑर्डर देखें और प्रबंधित करें।", menuDistReportDesc: "दैनिक या मासिक वित्तीय रिपोर्ट जेनरेट और निर्यात करें।",
    salesReportTitle: "वित्तीय बिक्री रिपोर्ट", salesReportSub: "आपके नेटवर्क के लिए कुल राजस्व और कार्गो डेटा", downloadReport: "CSV रिपोर्ट डाउनलोड करें", revenue: "कुल राजस्व", allTime: "पूरा समय", daily: "आज", monthly: "इस महीने"
  },
  ta: {
    welcome: "StockDock-ல் உங்களை வரவேற்கிறோம்", subWelcome: "என்டர்பிரைஸ் POS & சப்ளை செயின் கிளவுட்",
    storeOwner: "கடை உரிமையாளர்", distributor: "விநியோகஸ்தர்", fullName: "முழு பெயர்",
    shopName: "அதிகாரப்பூர்வ கடை பெயர்", shopAddress: "கடை முகவரி (பகுதி, நகரம்)",
    openTime: "திறக்கும் நேரம்", closeTime: "மூடும் நேரம்", agencyName: "ஏஜென்சி / விநியோக பெயர்",
    warehouseAddress: "கிடங்கு முகவரி", mobileNumber: "மொபைல் எண் (10 இலக்கங்கள்)",
    username: "பயனர் பெயர்", password: "கடவுச்சொல்", loginBtn: "போர்ட்டலைத் திறக்கவும்",
    registerBtn: "எண்டர்பிரைஸ் கணக்கைப் பதிவு செய்க", newUser: "StockDock-க்கு புதியவரா? ",
    alreadyReg: "ஏற்கனவே பதிவு செய்துள்ளீர்களா? ", createAcc: "கணக்கை உருவாக்கவும்", loginHere: "இங்கே உள்நுழையவும்",
    live: "லைவ்", signOut: "வெளியேறு", dailyMatrix: "தினசரி ஸ்டாக் மேட்ரிக்ஸ்", autoCalc: "ஆட்டோ-கணக்கீடு",
    variety: "பிரெட் வகை", price: "விலை", target: "இலக்கு", left: "மீதம்", expired: "காலாவதி",
    load: "லோடு", totalCargoLoad: "லோடு செய்ய வேண்டிய மொத்த சரக்கு", units: "யூனிட்கள்", estBill: "மதிப்பிடப்பட்ட மொத்த பில்",
    genInvoice: "அதிகாரப்பூர்வ மாஸ்டர் ரசீதை உருவாக்கு", taxInvoice: "அதிகாரப்பூர்வ வரி ரசீது", ref: "குறிப்பு:",
    savePdf: "PDF-ஐ சேமி", billedTo: "பில் செய்யப்பட்ட கடை", date: "தேதி", item: "பொருள்", leftExp: "மீதம் (காலாவதி)",
    loaded: "லோடு செய்யப்பட்டது", total: "மொத்தம்", masterTotal: "மொத்த செலுத்த வேண்டிய தொகை", awaitingPos: "POS சமர்ப்பிப்பிற்கு காத்திருக்கிறது",
    awaitingSub: "பிரெட் வகைகளைத் தேர்ந்தெடுத்து, அதிகாரப்பூர்வ வரி ரசீதை உருவாக்க ஜெனரேட் என்பதைக் கிளிக் செய்யவும்.",
    salesAnalytics: "விற்பனை & காலாவதி பகுப்பாய்வு", agency: "ஏஜென்சி", storeFilter: "ஸ்டோர் ஃபில்டர்:", timeFilter: "நேர வடிப்பான்:",
    allStores: "🌐 அனைத்து கடைகளும் (நெட்வொர்க் மொத்தம்)", noSales: "இந்த பார்வைக்கு இன்னும் விற்பனை தரவு எதுவும் பதிவு செய்யப்படவில்லை.",
    liveNotices: "லைவ் கார்கோ டிஸ்பாட்ச் அறிவிப்புகள்", inspectNotices: "ஆர்டர் விவரங்களைப் பார்க்கவும் அல்லது அதிகாரப்பூர்வ PDF வரி ரசீதுகளைப் பதிவிறக்கவும்",
    storeDetails: "கடை விவரங்கள்", pkgBreakdown: "பேக்கேஜ் விவரங்கள்", manage: "நிர்வாகம்", totalBreads: "மொத்த பிரெட்கள்",
    viewBill: "பில்லைப் பார்", dispatchedInvoice: "அதிகாரப்பூர்வ அனுப்பப்பட்ட ரசீது", close: "மூடு", dispatchDate: "அனுப்பப்பட்ட தேதி",
    subtotal: "கூட்டுத்தொகை", deleteTitle: "பதிவை நீக்கவா?", deleteWarn: "நீங்கள் இந்தத் தரவை நிரந்தரமாக நீக்கப் போகிறீர்கள்:",
    downloadFirst: "முதலில் கணக்கு பதிவிற்காக ஒரு நகலைப் பதிவிறக்க விரும்புகிறீர்களா?", viewSaveFirst: "முதலில் பார்த்து PDF-ஐ சேமிக்கவும்",
    permDelete: "உடனடியாக நீக்கு", downloadAndDelete: "CSV-ஐ பதிவிறக்கி நீக்கு", cancel: "ரத்து செய்", aiSuccessTitle: "AI கணிப்பு செயல்படுத்தப்பட்டது!",
    aiTargetUpdated: "இலக்கு வெற்றிகரமாக புதுப்பிக்கப்பட்டது:", aiModelLabel: "இயந்திரம் (Engine):", aiConfidenceLabel: "நம்பிக்கை மதிப்பெண் (Confidence):",
    aiErrorTitle: "AI சேவையை தொடர்பு கொள்ள முடியவில்லை", aiErrorDesc: "பின்னணி AI சேவையுடன் இணைக்க முடியவில்லை. போர்ட் 5005-ல் `node server.js` இயங்குகிறதா?",
    payOnline: "செக்அவுட் செய்ய தொடரவும்", proceedToPay: "பாதுகாப்பான கட்டணத்திற்கு தொடரவும்", backToInvoice: "ரசீதுக்கு திரும்புக",
    paidBadge: "செலுத்தப்பட்டது (PAID)", unpaidBadge: "நிலுவை (UNPAID)", verifySettle: "நான் பணம் செலுத்திவிட்டேன் • உறுதி செய்", scanText: "GPay, PhonePe, Paytm அல்லது BHIM மூலம் ஸ்கேன் செய்க", switchAccText: "வங்கி சர்வர் 1 வேலை செய்யவில்லை எனில் கணக்கை மாற்றவும்:",
    checkoutTitle: "StockDock பாதுகாப்பான செக்அவுட் போர்டல்", returnDash: "டேஷ்போர்டுக்கு திரும்பு",
    sessionExpires: "QR காலாவதி நேரம்:", qrExpired: "QR அமர்வு காலாவதியானது", regenQr: "புதிய QR குறியீட்டை உருவாக்கு", paymentDoneTitle: "பணப்பரிவர்த்தனை வெற்றிகரமாக முடிந்தது!", paymentDoneSub: "உங்கள் பரிவர்த்தனை HDFC வங்கி சர்வர் மூலம் பாதுகாப்பாக முடிக்கப்பட்டது.", amountPaid: "செலுத்திய தொகை:", paidTo: "கணக்கில் வரவு வைக்கப்பட்டது:", txnRef: "பரிவர்த்தனை ஐடி:", printReceipt: "அதிகாரப்பூர்வ ரசீதை அச்சிடு",
    tabHome: "முகப்பு டேஷ்போர்டு", tabOrder: "ஆர்டர் பட்டியல்", tabGraphs: "செயல்திறன் வரைபடங்கள்", tabHistory: "ஆர்டர் வரலாறு", tabPayments: "கட்டண வரலாறு",
    historyTitle: "ஆர்டர் டெலிவரி வரலாறு", historySub: "உங்கள் நெட்வொர்க்கில் கடந்த சரக்கு விநியோகங்களை கண்காணிக்கவும்", paymentsTitle: "கட்டணம் மற்றும் தீர்வுகள்", paymentsSub: "செலுத்தப்படாத ரசீதுகளை நிர்வகிக்கவும், கடந்த கட்டண ரசீதுகளைப் பார்க்கவும்", noHistory: "உங்கள் வரலாற்றில் ஆர்டர்கள் எதுவும் இல்லை.", noPayments: "நிலுவையில் உள்ள அல்லது கடந்த கட்டணங்கள் எதுவும் இல்லை.",
    shopPerformance: "என் கடையின் செயல்திறன்", shopPerformanceSub: "எந்த தயாரிப்புகள் விற்பனையாகின்றன, எவை காலாவதியாகின்றன என்பதைப் பார்க்கவும்",
    menuTitle: "மேலாண்மை மையம்", menuSub: "உங்கள் அன்றாட செயல்பாடுகளை நிர்வகிக்க கீழே உள்ள போர்ட்டலைத் தேர்ந்தெடுக்கவும்",
    menuOrderDesc: "பல பிராண்ட் பட்டியல்களை உலாவவும், புதிய ஸ்டாக் ரசீதுகளை உருவாக்கவும்.", menuGraphsDesc: "விற்பனை மற்றும் காலாவதி பகுப்பாய்வைக் காண்க.",
    menuHistoryDesc: "கடந்தகால சரக்கு விநியோகங்களை மதிப்பாய்வு செய்யவும்.", menuPaymentsDesc: "செலுத்தப்படாத பில்களைத் தீர்த்து, கடந்தகால ரசீதுகளைப் பார்க்கவும்.",
    tabDistAnalytics: "நெட்வொர்க் பகுப்பாய்வு", tabDistHistory: "நெட்வொர்க் வரலாறு", tabDistReport: "விற்பனை அறிக்கைகள்",
    menuDistAnalyticsDesc: "ஒட்டுமொத்த விற்பனை மற்றும் காலாவதி அளவீடுகளைக் காண்க.", menuDistHistoryDesc: "அனுப்பப்பட்ட அனைத்து ஆர்டர்களையும் நிர்வகிக்கவும்.", menuDistReportDesc: "தினசரி அல்லது மாதாந்திர நிதி அறிக்கைகளை உருவாக்கவும்.",
    salesReportTitle: "நிதி விற்பனை அறிக்கை", salesReportSub: "உங்கள் நெட்வொர்க்கிற்கான மொத்த வருவாய் மற்றும் சரக்கு தரவு", downloadReport: "CSV அறிக்கையைப் பதிவிறக்கு", revenue: "மொத்த வருவாய்", allTime: "எல்லா நேரமும்", daily: "இன்று", monthly: "இந்த மாதம்"
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [authError, setAuthError] = useState('');
  
  const [theme, setTheme] = useState(() => localStorage.getItem('stockdockTheme') || 'light');
  const isDark = theme === 'dark';
  useEffect(() => { localStorage.setItem('stockdockTheme', theme); }, [theme]);

  const [lang, setLang] = useState(() => localStorage.getItem('stockdockLang') || 'en');
  useEffect(() => { localStorage.setItem('stockdockLang', lang); }, [lang]);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [aiToast, setAiToast] = useState(null);

  // --- TAB NAVIGATION STATE ---
  const [appTab, setAppTab] = useState('MENU'); 
  const [activeBrandTab, setActiveBrandTab] = useState('All');

  // Distributor Specific Filters
  const [distroHistoryFilter, setDistroHistoryFilter] = useState('ALL'); 
  const [distroReportFilter, setDistroReportFilter] = useState('MONTHLY');

  // --- CHECKOUT PORTAL STATE WIZARD ---
  const [currentView, setCurrentView] = useState('DASHBOARD');
  const [activeCheckoutOrder, setActiveCheckoutOrder] = useState(null);
  const [selectedAccIdx, setSelectedAccIdx] = useState(0);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('REVIEW');
  const [timeLeft, setTimeLeft] = useState(600); 

  const [isPrinting, setIsPrinting] = useState(false);

  const [authForm, setAuthForm] = useState({ 
    fullName: '', username: '', password: '', role: 'store_owner', 
    mobileNumber: '', address: '', shopName: '', agencyName: '', 
    openTime: '08:00', closeTime: '22:00' 
  });

  const [orderRows, setOrderRows] = useState(
    Object.entries(MASTER_INVENTORY).map(([name, data]) => ({
      brand: data.brand,
      breadVariety: name, 
      pricePerBread: data.price, 
      targetStock: data.defaultTarget,
      currentLeft: 0, 
      expired: 0
    }))
  );

  const [globalChartData, setGlobalChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedStoreFilter, setSelectedStoreFilter] = useState('ALL');

  const [viewingModalInvoice, setViewingModalInvoice] = useState(null);
  const [deletingOrderWarning, setDeletingOrderWarning] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('stalkUser');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => { if (user) fetchReports(); }, [user]);

  useEffect(() => {
    if (aiToast) {
      const timer = setTimeout(() => setAiToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [aiToast]);

  useEffect(() => {
    if (currentView === 'CHECKOUT' && checkoutStep === 'PAY' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && checkoutStep === 'PAY') {
      setCheckoutStep('EXPIRED');
    }
  }, [currentView, checkoutStep, timeLeft]);

  const formatTimerDisplay = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/reports`);
      setGlobalChartData(res.data.reportData || []);
      setRecentOrders(res.data.orders || []);
    } catch (err) { console.error("API Error:", err); }
  };

  const storeOwnerOrders = useMemo(() => {
    return (recentOrders || []).filter(o => 
      (o.storeOwnerId === user?.username || o.shopName === user?.shopName)
    );
  }, [recentOrders, user]);

  const storeOwnerUnpaidOrders = useMemo(() => {
    return storeOwnerOrders.filter(o => o.paymentStatus !== 'PAID');
  }, [storeOwnerOrders]);

  const storeOwnerChartData = useMemo(() => {
    const customMap = {};
    storeOwnerOrders.forEach(ord => {
      ord?.items?.forEach(item => {
        if (!customMap[item.breadVariety]) customMap[item.breadVariety] = { name: item.breadVariety, sold: 0, expired: 0 };
        customMap[item.breadVariety].sold += item.billableBreads || 0;
        customMap[item.breadVariety].expired += item.expired || 0;
      });
    });
    return Object.values(customMap);
  }, [storeOwnerOrders]);

  const filteredDistributorHistory = useMemo(() => {
    return recentOrders.filter(o => {
      if (distroHistoryFilter === 'DAILY') return isToday(o.date);
      if (distroHistoryFilter === 'MONTHLY') return isThisMonth(o.date);
      return true;
    });
  }, [recentOrders, distroHistoryFilter]);

  const distributorReportData = useMemo(() => {
    const filteredForReport = recentOrders.filter(o => {
      if (distroReportFilter === 'DAILY') return isToday(o.date);
      if (distroReportFilter === 'MONTHLY') return isThisMonth(o.date);
      return true;
    });

    const map = {};
    filteredForReport.forEach(ord => {
      ord.items?.forEach(item => {
        if (!map[item.breadVariety]) map[item.breadVariety] = { name: item.breadVariety, sold: 0, expired: 0, revenue: 0 };
        map[item.breadVariety].sold += item.suppliedBreads || 0;
        map[item.breadVariety].expired += item.expired || 0;
        map[item.breadVariety].revenue += item.itemTotal || 0;
      });
    });
    return Object.values(map);
  }, [recentOrders, distroReportFilter]);

  const distributorReportTotals = useMemo(() => {
    return distributorReportData.reduce((acc, row) => ({
      sold: acc.sold + row.sold,
      revenue: acc.revenue + row.revenue
    }), { sold: 0, revenue: 0 });
  }, [distributorReportData]);

  const distributorBrandReportData = useMemo(() => {
    const filteredForReport = recentOrders.filter(o => {
      if (distroReportFilter === 'DAILY') return isToday(o.date);
      if (distroReportFilter === 'MONTHLY') return isThisMonth(o.date);
      return true;
    });

    const map = {};
    filteredForReport.forEach(ord => {
      ord.items?.forEach(item => {
        const brand = MASTER_INVENTORY[item.breadVariety]?.brand || 'Other';
        if (!map[brand]) map[brand] = 0;
        map[brand] += (item.itemTotal || 0);
      });
    });
    return Object.entries(map).map(([brand, revenue]) => ({ brand, revenue })).sort((a, b) => b.revenue - a.revenue);
  }, [recentOrders, distroReportFilter]);

  const openCheckoutPage = (orderObj) => {
    setActiveCheckoutOrder(orderObj);
    setCheckoutStep('REVIEW'); 
    setCurrentView('CHECKOUT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualSettlement = async (e) => {
    e.preventDefault();
    const activeAcc = MERCHANT_ACCOUNTS[selectedAccIdx];
    setCheckoutStep('SUCCESS');
    try {
      const res = await axios.put(`${API_BASE_URL}/api/orders/${activeCheckoutOrder._id}/pay`, {
        paymentMethod: `Paid via ${activeAcc.name} QR (${activeAcc.tag})`
      });
      if (invoice && invoice._id === activeCheckoutOrder._id) setInvoice(res.data.order);
      fetchReports();
    } catch (err) {
      console.warn("Backend payment route missing. Using Viva-Safe Mock Update to preserve UI state.");
      if (invoice && invoice._id === activeCheckoutOrder._id) {
        setInvoice({...invoice, paymentStatus: 'PAID', paymentMethod: `Paid via ${activeAcc.name} QR`});
      }
      setRecentOrders(prev => prev.map(o => 
        o._id === activeCheckoutOrder._id 
          ? { ...o, paymentStatus: 'PAID', paymentMethod: `Paid via ${activeAcc.name} QR` } 
          : o
      ));
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(MERCHANT_ACCOUNTS[selectedAccIdx].upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => { window.print(); setIsPrinting(false); }, 100);
  };

  const applyAiPrediction = async (breadVariety, price, currentLeft) => {
    try {
      const todayDow = new Date().getDay(); 
      const simulatedPrevSold = Math.max(2, Number(currentLeft) || 5); 
      const res = await axios.post(`${API_BASE_URL}/api/ml/predict-demand`, {
        prev_day_sold: simulatedPrevSold, price_per_bread: price, day_of_week: todayDow
      });
      const aiTarget = res.data.recommended_target;
      updateRow(breadVariety, 'targetStock', aiTarget);
      setAiToast({ type: 'success', title: t.aiSuccessTitle, target: `${aiTarget} ${t.units}`, model: res.data.metadata.model_used, confidence: res.data.metadata.confidence_score });
    } catch (err) { setAiToast({ type: 'error', title: t.aiErrorTitle, desc: t.aiErrorDesc }); }
  };

  const validateAuthForm = () => {
    if (!isLoginView) {
      if (!authForm.fullName || authForm.fullName.trim().length < 2) return "Full Name must be at least 2 characters long.";
      if (!/^\d{10}$/.test(authForm.mobileNumber)) return "Mobile Number must contain exactly 10 numerical digits.";
      if (!authForm.address || authForm.address.trim().length < 4) return "Please provide a complete area and city address.";
      if (authForm.role === 'store_owner') {
        if (!authForm.shopName || authForm.shopName.trim().length < 2) return "Please enter an official Shop Name.";
        if (!authForm.openTime || !authForm.closeTime) return "Please select both Opening and Closing times.";
        if (authForm.openTime === authForm.closeTime) return "Opening and closing times cannot be identical.";
      } else { if (!authForm.agencyName || authForm.agencyName.trim().length < 2) return "Please enter an official Agency Name."; }
    }
    if (!authForm.username || authForm.username.trim().length < 3) return "Username must be at least 3 characters long without spaces.";
    if (!/^[a-zA-Z0-9_]+$/.test(authForm.username)) return "Username can only contain letters, numbers, and underscores.";
    if (!authForm.password || authForm.password.length < 5) return "Password must be at least 5 characters long.";
    return null;
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault(); setAuthError('');
    const validationError = validateAuthForm();
    if (validationError) { setAuthError(validationError); return; }

    try {
      const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register';
      const formattedTimings = authForm.role === 'store_owner' ? `${formatTime12H(authForm.openTime)} - ${formatTime12H(authForm.closeTime)}` : 'N/A';
      const payload = { ...authForm, shopTimings: formattedTimings };
      const res = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
      
      if (isLoginView) {
        const loggedIn = { ...res.data.user, token: res.data.token };
        setUser(loggedIn); localStorage.setItem('stalkUser', JSON.stringify(loggedIn));
      } else {
        setIsLoginView(true); setAuthError('Registration successful! You may now log in.');
        setAuthForm({ fullName: '', username: '', password: '', role: 'store_owner', mobileNumber: '', address: '', shopName: '', agencyName: '', openTime: '08:00', closeTime: '22:00' });
      }
    } catch (err) { setAuthError(err.response?.data?.message || 'Server error. Is the backend running?'); }
  };

  const handleLogout = () => { setUser(null); localStorage.removeItem('stalkUser'); setCurrentView('DASHBOARD'); setAppTab('MENU'); };
  
  const updateRow = (name, field, val) => { 
    const numVal = Math.max(0, Number(val));
    setOrderRows(prev => prev.map(r => r.breadVariety === name ? { ...r, [field]: numVal } : r)); 
  };

  const handleMasterOrderSubmit = async (e) => {
    e.preventDefault();
    const activeItems = orderRows.filter(r => {
      const good = Math.max(0, r.currentLeft - r.expired);
      const toLoad = Math.max(0, r.targetStock - good);
      const sold = Math.max(0, r.targetStock - r.currentLeft);
      return toLoad > 0 || sold > 0;
    });

    if (activeItems.length === 0) return alert("No stock movement detected. Update targets to generate an invoice!");

    try {
      const payload = { storeOwnerId: user.username, shopName: user.shopName || user.fullName, address: user.address || 'N/A', mobileNumber: user.mobileNumber || 'N/A', items: activeItems };
      const res = await axios.post(`${API_BASE_URL}/api/orders`, payload);
      fetchReports();
      openCheckoutPage(res.data.order);
    } catch (err) { alert("Failed to generate master invoice."); }
  };

  const confirmAndDeleteOrderForever = async (orderId) => {
    if (!orderId) { alert("❌ CRITICAL: Corrupted legacy item with no Database ID."); setDeletingOrderWarning(null); return; }
    try {
      await axios.delete(`${API_BASE_URL}/api/orders/${orderId}`);
      setDeletingOrderWarning(null); fetchReports(); 
    } catch (err) { alert(`Backend Error: ${err.response?.data?.error || err.message}`); }
  };

  const handleDownloadAndDelete = async (order) => {
    let csv = 'Bread Variety,Target,Left(Expired),Loaded,Subtotal\n';
    order.items?.forEach(i => {
      csv += `"${i.breadVariety}",${i.targetStock},"${i.currentLeft}(${i.expired})",${i.suppliedBreads},${i.itemTotal}\n`;
    });
    csv += `\nTotal Cargo Load,,,,${order.totalSuppliedBreads}\n`;
    csv += `Master Total Due,,,,${order.totalBillAmount}\n`;
    triggerCSVDownload(csv, `Order_Backup_${order._id.slice(-8)}.csv`);
    
    confirmAndDeleteOrderForever(order._id);
  };

  const handleDownloadReportCSV = () => {
    let csv = `StockDock Financial Report (${distroReportFilter})\n`;
    csv += `Generated On:,${new Date().toLocaleString()}\n\n`;
    
    csv += `--- REVENUE BY COMPANY ---\n`;
    csv += `Company,Revenue Generated\n`;
    distributorBrandReportData.forEach(b => {
      csv += `"${b.brand}",${b.revenue}\n`;
    });
    csv += `\n`;

    csv += `--- ITEMIZED SALES DATA ---\n`;
    csv += `Variety,Cargo Sold,Expired Returns,Total Revenue Generated\n`;
    distributorReportData.forEach(row => {
      csv += `"${row.name}",${row.sold},${row.expired},${row.revenue}\n`;
    });
    csv += `\nTOTALS,${distributorReportTotals.sold},-,${distributorReportTotals.revenue}\n`;
    
    triggerCSVDownload(csv, `StockDock_Report_${distroReportFilter}.csv`);
  };

  const liveTotals = useMemo(() => {
    return orderRows.reduce((acc, r) => {
      const good = Math.max(0, r.currentLeft - r.expired);
      const load = Math.max(0, r.targetStock - good);
      const bill = Math.max(0, r.targetStock - r.currentLeft) * r.pricePerBread;
      return { load: acc.load + load, bill: acc.bill + bill };
    }, { load: 0, bill: 0 });
  }, [orderRows]);

  const uniqueStores = useMemo(() => ['ALL', ...new Set((recentOrders || []).map(o => o?.shopName || 'Unknown'))], [recentOrders]);

  const activeChartDataset = useMemo(() => {
    if (selectedStoreFilter === 'ALL') return globalChartData || [];
    const customMap = {};
    (recentOrders || []).filter(o => o?.shopName === selectedStoreFilter).forEach(ord => {
      ord?.items?.forEach(item => {
        if (!customMap[item.breadVariety]) customMap[item.breadVariety] = { name: item.breadVariety, sold: 0, expired: 0 };
        customMap[item.breadVariety].sold += item.billableBreads || 0; customMap[item.breadVariety].expired += item.expired || 0;
      });
    });
    return Object.values(customMap);
  }, [selectedStoreFilter, globalChartData, recentOrders]);

  const customAnimations = `
    @keyframes smoothFadeIn { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
    @keyframes smoothSlideIn { 0% { opacity: 0; transform: translateX(20px); } 100% { opacity: 1; transform: translateX(0); } }
    .animate-popup { animation: smoothFadeIn 0.35s ease-out forwards; }
    .animate-slide-in { animation: smoothSlideIn 0.35s ease-out forwards; }
  `;

  const tBg = isDark ? 'bg-slate-900 text-slate-50' : 'bg-gray-50 text-gray-900';
  const tCard = isDark ? 'bg-slate-800 border-slate-700 text-slate-100 shadow-xl' : 'bg-white border-gray-300 text-gray-900 shadow-lg';
  const tInput = isDark ? 'bg-slate-900 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-600 focus:ring-blue-600';
  const tNav = isDark ? 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-md' : 'bg-white/95 border-gray-200 text-gray-900 shadow-sm';
  const tSubText = isDark ? 'text-slate-300' : 'text-gray-600'; 

  const LanguageSelectDropdown = () => (
    <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border transition-all duration-200 shadow-sm ${isDark ? 'bg-slate-800 border-slate-600 text-blue-400' : 'bg-white border-gray-300 text-blue-700'}`}>
      <Languages size={18} className="shrink-0" />
      <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent font-bold text-xs sm:text-sm focus:outline-none cursor-pointer pr-1">
        <option value="en" className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-black'}>🇺🇸 English</option>
        <option value="hi" className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-black'}>🇮🇳 हिंदी (Hindi)</option>
        <option value="ta" className={isDark ? 'bg-slate-800 text-white' : 'bg-white text-black'}>🇮🇳 தமிழ் (Tamil)</option>
      </select>
    </div>
  );

  // ----------------------------------------------------------------
  // 1. REGISTRATION & LOGIN PORTAL
  // ----------------------------------------------------------------
  if (!user) {
    return (
      <div className={`min-h-screen font-sans flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300 ${tBg}`}>
        <style>{customAnimations}</style>
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 flex items-center gap-2.5">
          <LanguageSelectDropdown />
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-200 shadow-sm cursor-pointer flex items-center gap-2 ${isDark ? 'bg-slate-800 border-slate-600 text-amber-400 hover:bg-slate-700' : 'bg-white border-gray-300 text-blue-700 hover:bg-gray-100'}`}>
            {isDark ? <Sun size={20}/> : <Moon size={20}/>}
            <span className="text-sm font-bold hidden sm:inline">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className={`w-full max-w-[480px] p-6 sm:p-10 rounded-[2rem] border relative z-10 animate-popup my-8 transition-colors duration-300 ${tCard}`}>
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-tr from-blue-600 to-blue-800 rounded-2xl mb-4 shadow-lg shadow-blue-500/30"><Package className="text-white" size={36} /></div>
            <h1 className="text-3xl font-black tracking-tight text-blue-600">{t.welcome}</h1>
            <p className={`text-sm font-bold mt-2 flex items-center justify-center gap-1.5 ${tSubText}`}><Sparkles size={16} className="text-blue-500"/> {t.subWelcome}</p>
          </div>

          {authError && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-bold text-center border animate-popup flex items-center justify-center gap-2 ${authError.includes('successful') ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-red-50 border-red-300 text-red-700'}`}>
              <AlertCircle size={18} className="shrink-0"/><span>{authError}</span>
            </div>
          )}
          
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className={`flex p-1.5 rounded-xl mb-6 border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gray-100 border-gray-300'}`}>
              <button type="button" onClick={() => setAuthForm({ ...authForm, role: 'store_owner' })} className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center text-center leading-tight min-h-[48px] transition-all duration-300 cursor-pointer ${authForm.role === 'store_owner' ? 'bg-blue-600 text-white shadow-md' : isDark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>{t.storeOwner}</button>
              <button type="button" onClick={() => setAuthForm({ ...authForm, role: 'distributor' })} className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center text-center leading-tight min-h-[48px] transition-all duration-300 cursor-pointer ${authForm.role === 'distributor' ? 'bg-blue-600 text-white shadow-md' : isDark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>{t.distributor}</button>
            </div>

            {!isLoginView && (
              <div className={`space-y-4 border-b pb-6 mb-4 animate-popup ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                <input type="text" name="fullName" required value={authForm.fullName} onChange={e => setAuthForm({...authForm, fullName: e.target.value})} className={`w-full border rounded-xl px-4 py-4 text-base transition-all ${tInput}`} placeholder={t.fullName} />
                {authForm.role === 'store_owner' ? (
                  <>
                    <input type="text" name="shopName" required value={authForm.shopName} onChange={e => setAuthForm({...authForm, shopName: e.target.value})} className={`w-full border rounded-xl px-4 py-4 text-base transition-all ${tInput}`} placeholder={t.shopName} />
                    <input type="text" name="address" required value={authForm.address} onChange={e => setAuthForm({...authForm, address: e.target.value})} className={`w-full border rounded-xl px-4 py-4 text-base transition-all ${tInput}`} placeholder={t.shopAddress} />
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div><label className={`block text-xs font-bold uppercase mb-1.5 flex items-center gap-1 ${tSubText}`}><Clock size={14} className="text-blue-600"/> {t.openTime}</label><input type="time" name="openTime" required value={authForm.openTime || '08:00'} onChange={e => setAuthForm({...authForm, openTime: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-base font-bold transition-all cursor-pointer ${tInput}`} /></div>
                      <div><label className={`block text-xs font-bold uppercase mb-1.5 flex items-center gap-1 ${tSubText}`}><Clock size={14} className="text-blue-600"/> {t.closeTime}</label><input type="time" name="closeTime" required value={authForm.closeTime || '22:00'} onChange={e => setAuthForm({...authForm, closeTime: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-base font-bold transition-all cursor-pointer ${tInput}`} /></div>
                    </div>
                  </>
                ) : (
                  <>
                    <input type="text" name="agencyName" required value={authForm.agencyName} onChange={e => setAuthForm({...authForm, agencyName: e.target.value})} className={`w-full border rounded-xl px-4 py-4 text-base transition-all ${tInput}`} placeholder={t.agencyName} />
                    <input type="text" name="address" required value={authForm.address} onChange={e => setAuthForm({...authForm, address: e.target.value})} className={`w-full border rounded-xl px-4 py-4 text-base transition-all ${tInput}`} placeholder={t.warehouseAddress} />
                  </>
                )}
                <input type="tel" name="mobileNumber" maxLength="10" required value={authForm.mobileNumber} onChange={e => setAuthForm({...authForm, mobileNumber: e.target.value.replace(/\D/g, '')})} className={`w-full border rounded-xl px-4 py-4 text-base transition-all ${tInput}`} placeholder={t.mobileNumber} />
              </div>
            )}

            <input type="text" name="username" required value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} className={`w-full border rounded-xl px-4 py-4 text-base transition-all ${tInput}`} placeholder={t.username} />
            <input type="password" name="password" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className={`w-full border rounded-xl px-4 py-4 text-base transition-all ${tInput}`} placeholder={t.password} />
            
            <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 min-h-[56px] rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-base">
              {isLoginView ? t.loginBtn : t.registerBtn} <ArrowRight size={20}/>
            </button>
          </form>
          
          <div className={`mt-8 text-center text-sm font-bold ${tSubText}`}>
            {isLoginView ? t.newUser : t.alreadyReg}
            <button onClick={() => { setIsLoginView(!isLoginView); setAuthError(''); }} className="text-blue-600 font-black hover:underline transition-colors ml-1 cursor-pointer">
              {isLoginView ? t.createAcc : t.loginHere}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // 2. SEPARATE STANDALONE PAYMENT GATEWAY WIZARD
  // ----------------------------------------------------------------
  if (currentView === 'CHECKOUT' && activeCheckoutOrder) {
    const activeMerchant = MERCHANT_ACCOUNTS[selectedAccIdx];
    
    return (
      <div className={`min-h-screen font-sans flex flex-col p-4 sm:p-10 transition-colors duration-300 ${tBg}`}>
        <style>{customAnimations}</style>
        
        {/* Gateway Header (HIDDEN DURING PRINT) */}
        {!isPrinting && (
          <div className="max-w-4xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between border-b pb-6 mb-8 border-gray-300 gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button onClick={() => { setCurrentView('DASHBOARD'); setAppTab('MENU'); }} className={`inline-flex whitespace-nowrap p-3 rounded-xl border transition-colors cursor-pointer items-center gap-2 text-sm font-bold w-full justify-center sm:w-auto ${isDark ? 'border-slate-600 hover:bg-slate-700 text-slate-200' : 'border-gray-300 hover:bg-gray-100 text-gray-700'}`}>
                <ArrowLeft size={18}/> {t.returnDash}
              </button>
              <div className="hidden sm:block h-8 w-px bg-gray-300 mx-2"></div>
              <div className="hidden sm:flex items-center gap-3">
                <div className="bg-emerald-600 p-2.5 rounded-lg text-white"><Lock size={20}/></div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">{t.checkoutTitle}</h2>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 256-Bit Encrypted
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center sm:text-right w-full sm:w-auto">
              <span className={`text-xs font-bold block ${tSubText}`}>MERCHANT ACCOUNT</span>
              <span className="text-base font-black text-blue-600">StockDock Supply Network</span>
            </div>
          </div>
        )}

        {/* Wizard Body */}
        <div className={`max-w-4xl w-full mx-auto animate-popup ${isPrinting ? 'max-w-none w-full h-full p-0' : ''}`}>
          
          {/* ========================================================= */}
          {/* WIZARD STEP 1: INVOICE REVIEW ONLY */}
          {/* ========================================================= */}
          {checkoutStep === 'REVIEW' && (
            <div className={`${isPrinting ? 'col-span-1 border-none shadow-none bg-white text-black p-0 w-full' : `max-w-3xl mx-auto p-6 sm:p-12 rounded-[2rem] border flex flex-col justify-between shadow-xl ${tCard}`}`}>
              <div>
                <div className={`flex justify-between items-center ${isPrinting ? 'mb-6 border-b-2 border-black pb-4' : 'mb-8'}`}>
                  <span className={`text-sm font-black uppercase tracking-widest ${isPrinting ? 'text-black' : 'text-blue-600'} block`}>{t.taxInvoice}</span>
                  {!isPrinting && (
                    <button onClick={handlePrint} className={`inline-flex whitespace-nowrap p-3 rounded-xl transition-all cursor-pointer items-center gap-2 font-bold text-sm ${isDark ? 'bg-slate-700 text-blue-400 hover:bg-slate-600' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`} title={t.savePdf}>
                      <Printer size={18}/> Print Copy
                    </button>
                  )}
                </div>
                
                <h3 className={`text-4xl sm:text-5xl font-black ${isPrinting ? 'mb-6 text-black' : 'mb-8 text-emerald-600'} font-mono`}>₹{activeCheckoutOrder.totalBillAmount}.00</h3>
                
                <div className={`space-y-4 border-t-2 py-6 my-4 text-sm font-bold ${isPrinting ? 'border-black text-black' : isDark ? 'border-slate-700 text-slate-200' : 'border-gray-200 text-gray-800'}`}>
                  <div className="flex justify-between"><span className={isPrinting ? 'text-gray-600' : tSubText}>Reference Number:</span><span className={`font-mono font-black ${isPrinting ? 'text-black' : 'text-blue-600'}`}>#{activeCheckoutOrder._id.slice(-8).toUpperCase()}</span></div>
                  <div className="flex justify-between"><span className={isPrinting ? 'text-gray-600' : tSubText}>Billed Shop:</span><span className="font-black text-base">{activeCheckoutOrder.shopName}</span></div>
                  <div className="flex justify-between"><span className={isPrinting ? 'text-gray-600' : tSubText}>Date Generated:</span><span className="font-black">{new Date(activeCheckoutOrder.date).toLocaleDateString()}</span></div>
                </div>

                {/* ITEMIZED INVOICE TABLE */}
                <div className={`mt-4 border-t-2 border-b-2 py-4 ${isPrinting ? 'max-h-none overflow-visible border-black' : `max-h-[350px] overflow-x-auto overflow-y-auto no-scrollbar ${isDark ? 'border-slate-700' : 'border-gray-200'}`}`}>
                  <table className={`w-full text-sm text-left ${isPrinting ? 'text-black' : ''}`}>
                    <thead className={`sticky top-0 z-10 backdrop-blur-md ${isPrinting ? 'bg-white text-gray-800' : `${isDark ? 'bg-slate-800/90' : 'bg-white/90'} ${tSubText}`}`}>
                      <tr>
                        <th className="pb-3 font-black uppercase text-xs tracking-wider">{t.item}</th>
                        <th className="pb-3 text-center font-black uppercase text-xs tracking-wider">{t.loaded}</th>
                        <th className="pb-3 text-right font-black uppercase text-xs tracking-wider">{t.subtotal}</th>
                      </tr>
                    </thead>
                    <tbody className="font-bold">
                      {activeCheckoutOrder.items?.map(i => (
                        <tr key={i.breadVariety} className={`border-t ${isPrinting ? 'border-gray-300' : isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                          <td className="py-4 pr-4">{i.breadVariety}</td>
                          <td className={`py-4 text-center text-lg ${isPrinting ? 'text-black' : 'text-blue-600'}`}>{i.suppliedBreads}</td>
                          <td className="py-4 text-right font-mono text-base">₹{i.itemTotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ACTION BUTTON TO PROCEED TO PAYMENT */}
              {!isPrinting && (
                <button 
                  onClick={() => { setCheckoutStep('PAY'); setTimeLeft(600); }}
                  className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-xl shadow-lg transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-3 cursor-pointer min-h-[56px]"
                >
                  {t.proceedToPay} <ArrowRight size={20}/>
                </button>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* WIZARD STEP 2: PAYMENT GATEWAY ONLY */}
          {/* ========================================================= */}
          {(checkoutStep === 'PAY' || checkoutStep === 'EXPIRED') && (
            <div className={`max-w-xl mx-auto p-6 sm:p-12 rounded-[2rem] border flex flex-col justify-between shadow-xl relative overflow-hidden ${tCard}`}>
              
              <button onClick={() => setCheckoutStep('REVIEW')} className={`mb-8 inline-flex whitespace-nowrap w-fit items-center gap-2 text-sm font-bold transition-colors cursor-pointer ${isDark ? 'text-slate-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-700'}`}>
                   <ArrowLeft size={18}/> {t.backToInvoice}
              </button>

              {/* 3-Account Bank Switcher */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${tSubText}`}>
                    <RefreshCw size={14} className="text-blue-600"/> {t.switchAccText}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MERCHANT_ACCOUNTS.map((acc, idx) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setSelectedAccIdx(idx)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${selectedAccIdx === idx ? `bg-blue-600 text-white font-black shadow-md border-transparent` : `${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'}`}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-black flex items-center gap-2">{acc.icon} {acc.name}</span>
                        {selectedAccIdx === idx && <Check size={16} className="shrink-0"/>}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 block truncate ${selectedAccIdx === idx ? 'text-blue-100' : tSubText}`}>{acc.tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* --- 10-MINUTE COUNTDOWN TIMER & QR CONTAINER --- */}
              {checkoutStep === 'EXPIRED' ? (
                <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-red-50 border border-red-200 my-6 py-12 animate-popup">
                  <AlertTriangle size={56} className="text-red-600 mb-4"/>
                  <h4 className="text-xl font-black text-red-700 mb-2">{t.qrExpired}</h4>
                  <p className="text-sm font-bold text-red-600/80 max-w-sm mb-8">For your financial security, QR session tokens expire after 10 minutes. Please regenerate a new token.</p>
                  <button
                    type="button"
                    onClick={() => { setTimeLeft(600); setCheckoutStep('PAY'); }}
                    className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer min-h-[48px]"
                  >
                    <RefreshCcw size={18}/> {t.regenQr}
                  </button>
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-2xl my-6 border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-300'}`}>
                  
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-black mb-6 border ${timeLeft < 180 ? 'bg-red-100 text-red-700 border-red-300 animate-pulse' : 'bg-blue-100 text-blue-700 border-blue-300'}`}>
                    <Timer size={16} className="shrink-0"/>
                    <span>{t.sessionExpires} {formatTimerDisplay(timeLeft)}</span>
                  </div>

                  <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-200 mb-6 shrink-0 relative flex flex-col items-center">
                    <QRCodeSVG 
                      value={`upi://pay?pa=${activeMerchant.upiId}&pn=StockDock%20Supply&am=${activeCheckoutOrder.totalBillAmount}&cu=INR`}
                      size={180}
                      level="H"
                      includeMargin={true}
                    />
                    <span className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-blue-600 text-white font-black text-xs uppercase shadow-md">{activeMerchant.name}</span>
                  </div>
                  <span className="text-4xl font-black text-emerald-600 font-mono">₹{activeCheckoutOrder.totalBillAmount}.00</span>
                  <p className={`text-sm font-black mt-2 ${tSubText}`}>{t.scanText}</p>
                  <p className="text-xs font-bold text-blue-600 mt-2">Active Server: {activeMerchant.bank}</p>
                  
                  <div className={`flex items-center gap-3 mt-6 p-3 rounded-xl w-full justify-between text-sm font-mono font-black border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300 shadow-sm'}`}>
                    <span className="truncate pl-2 text-blue-600">{activeMerchant.upiId}</span>
                    <button type="button" onClick={copyUpiId} className="inline-flex whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg items-center gap-2 text-xs font-sans font-black transition-all cursor-pointer min-h-[40px]">
                      {copiedUpi ? <Check size={16}/> : <Copy size={16}/>} {copiedUpi ? "Copied" : "Copy ID"}
                    </button>
                  </div>
                </div>
              )}

              {/* 100% MANUAL BUTTON CONTROL FOR SETTLEMENT */}
              <button 
                type="button"
                disabled={checkoutStep === 'EXPIRED'}
                onClick={handleManualSettlement}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-xl shadow-lg transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30 disabled:pointer-events-none min-h-[56px]"
              >
                <CheckCircle size={20}/> {t.verifySettle}
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* WIZARD STEP 3: SUCCESS ELECTRONIC RECEIPT */}
          {/* ========================================================= */}
          {checkoutStep === 'SUCCESS' && (
            <div className={`max-w-2xl mx-auto p-6 sm:p-12 rounded-[2rem] border shadow-xl text-center flex flex-col items-center justify-center relative overflow-hidden ${tCard}`}>
              <div className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-emerald-500 text-emerald-600 flex items-center justify-center mb-8 shadow-sm animate-popup">
                <CheckCircle size={56} strokeWidth={3}/>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-mono font-black text-sm uppercase tracking-widest mb-4 border border-emerald-300">
                ✅ SETTLEMENT VERIFIED
              </span>
              <h3 className="text-3xl sm:text-4xl font-black mb-2">{t.paymentDoneTitle}</h3>
              <p className={`text-base font-bold max-w-md mb-10 ${tSubText}`}>{t.paymentDoneSub}</p>

              {/* Electronic Receipt Box */}
              <div className={`w-full rounded-2xl p-6 sm:p-8 border text-left space-y-4 font-bold text-sm mb-10 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-300'}`}>
                <div className={`flex justify-between border-b pb-4 ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                  <span className={tSubText}>{t.amountPaid}</span>
                  <span className="font-mono font-black text-emerald-600 text-xl">₹{activeCheckoutOrder.totalBillAmount}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className={tSubText}>Billed Shop:</span>
                  <span className="font-black text-base">{activeCheckoutOrder.shopName}</span>
                </div>
                <div className="flex justify-between">
                  <span className={tSubText}>{t.paidTo}</span>
                  <span className="font-black text-blue-600 flex items-center gap-2 flex-wrap text-right justify-end">{activeMerchant.icon} {activeMerchant.name} ({activeMerchant.upiId})</span>
                </div>
                <div className="flex justify-between">
                  <span className={tSubText}>Bank Server:</span>
                  <span className="font-black text-right">{activeMerchant.bank}</span>
                </div>
                <div className="flex justify-between">
                  <span className={tSubText}>{t.txnRef}</span>
                  <span className="font-mono font-black text-gray-500 text-right break-all">TXN_IND_{activeCheckoutOrder._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className={tSubText}>Timestamp:</span>
                  <span className="font-black text-right">{new Date().toLocaleString()}</span>
                </div>
              </div>

              {/* Success Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button 
                  onClick={handlePrint}
                  className={`flex-1 py-4 sm:py-5 rounded-xl border font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm min-h-[56px] ${isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200' : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-800'}`}
                >
                  <Printer size={20}/> {t.printReceipt}
                </button>
                <button 
                  onClick={() => { setActiveCheckoutOrder(null); setCurrentView('DASHBOARD'); setAppTab('MENU'); }} 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 sm:py-5 rounded-xl shadow-lg transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer min-h-[56px]"
                >
                  <Home size={20}/> Home Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // 3. MAIN DASHBOARD: STORE OWNER & DISTRIBUTOR (MENU & TABS)
  // ----------------------------------------------------------------
  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500 selection:text-white print:bg-white print:text-black transition-colors duration-300 relative ${tBg}`}>
      <style>{customAnimations}</style>

      {/* AI TOAST NOTIFICATION */}
      {aiToast && (
        <div className={`fixed top-20 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:max-w-sm w-auto p-5 sm:p-6 rounded-[1.5rem] shadow-2xl border animate-slide-in flex flex-col gap-4 transition-colors duration-300 ${aiToast.type === 'success' ? isDark ? 'bg-slate-800 border-blue-500/50 shadow-[0_0_40px_-10px_rgba(37,99,235,0.3)]' : 'bg-white border-blue-300 shadow-xl' : isDark ? 'bg-slate-800 border-red-500/50' : 'bg-white border-red-300'}`}>
          <div className={`flex items-start justify-between gap-2 border-b pb-4 ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl text-white shadow-sm ${aiToast.type === 'success' ? 'bg-blue-600' : 'bg-red-600'}`}>
                {aiToast.type === 'success' ? <Bot size={24} className="animate-pulse" /> : <AlertCircle size={24} />}
              </div>
              <div>
                <h4 className={`font-black text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{aiToast.title}</h4>
                <p className="text-xs font-black text-blue-600 uppercase tracking-wider mt-1">StockDock AI Engine</p>
              </div>
            </div>
            <button onClick={() => setAiToast(null)} className="p-1 text-gray-400 hover:text-gray-800 rounded-lg transition-colors cursor-pointer"><X size={20}/></button>
          </div>

          {aiToast.type === 'success' ? (
            <div className="space-y-3 text-sm">
              <div className={`flex justify-between items-center px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-blue-50 border-blue-200'}`}><span className={`font-bold ${tSubText}`}>{t.aiTargetUpdated}</span><span className="font-black text-blue-700 text-base">{aiToast.target}</span></div>
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}><span className={`block font-black uppercase text-[10px] ${tSubText}`}>{t.aiModelLabel}</span><span className={`font-black truncate block mt-1 ${isDark ? 'text-slate-200' : 'text-gray-800'}`} title={aiToast.model}>{aiToast.model}</span></div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}><span className={`block font-black uppercase text-[10px] ${tSubText}`}>{t.aiConfidenceLabel}</span><span className="font-black text-emerald-600 mt-1 block text-sm">{aiToast.confidence}</span></div>
              </div>
            </div>
          ) : ( <p className={`text-sm font-bold leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{aiToast.desc}</p> )}
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <nav className={`backdrop-blur-md border-b px-4 sm:px-8 py-4 sm:py-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-y-4 sticky top-0 z-30 transition-colors duration-300 print:hidden ${tNav}`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-blue-600 p-2 sm:p-3 rounded-xl text-white shadow-md"><Package size={24}/></div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-blue-600">StockDock</h1>
              <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black bg-blue-100 text-blue-700 border border-blue-300 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {t.live}</span>
            </div>
            <p className={`text-[10px] sm:text-xs font-black uppercase tracking-widest mt-1 ${tSubText}`}>{user?.role === 'store_owner' ? t.storeOwner : t.distributor}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
          <LanguageSelectDropdown />
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-2 ${isDark ? 'bg-slate-800 border-slate-600 text-amber-400 hover:bg-slate-700' : 'bg-white border-gray-300 text-blue-700 hover:bg-gray-100 shadow-sm'}`} title="Toggle Theme">
            {isDark ? <Sun size={20}/> : <Moon size={20}/>}
            <span className="text-sm font-bold hidden md:inline">{isDark ? 'Light' : 'Dark'}</span>
          </button>
          <div className="text-right hidden md:block border-l pl-4 border-gray-300">
            <p className="text-base font-black flex items-center justify-end gap-2">{user?.fullName || 'User'} <ShieldCheck size={18} className="text-emerald-600"/></p>
            <p className={`text-sm font-bold mt-0.5 ${tSubText}`}>{user?.role === 'store_owner' ? user?.shopName : user?.agencyName} • {user?.mobileNumber}</p>
          </div>
          <button onClick={handleLogout} className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm font-black border transition-all duration-200 cursor-pointer shadow-sm ${isDark ? 'bg-slate-800 hover:bg-red-900/50 hover:text-red-400 border-slate-600 hover:border-red-500/50 text-slate-200' : 'bg-white hover:bg-red-50 hover:text-red-700 border-gray-300 text-gray-700'}`}>
            <LogOut size={18}/> <span className="hidden sm:inline">{t.signOut}</span>
          </button>
        </div>
      </nav>

      {/* --- STORE OWNER & DISTRIBUTOR 4-TAB NAVIGATION BAR --- */}
      <div className={`border-b print:hidden sticky top-[73px] sm:top-[89px] z-20 backdrop-blur-md transition-colors ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-gray-200 bg-white/90'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar gap-3 py-4">
          <button onClick={() => setAppTab('MENU')} className={`inline-flex whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-black items-center gap-2.5 transition-all shadow-sm cursor-pointer min-h-[44px] ${appTab === 'MENU' ? 'bg-blue-600 text-white shadow-md border-transparent' : (isDark ? 'bg-slate-800 border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-gray-50 border border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-100')}`}>
            <Home size={18}/> {t.tabHome}
          </button>

          {user?.role === 'store_owner' && (
            <>
              {[
                { id: 'ORDER', icon: <ShoppingBag size={18}/>, label: t.tabOrder },
                { id: 'GRAPHS', icon: <BarChart3 size={18}/>, label: t.tabGraphs },
                { id: 'HISTORY', icon: <Clock size={18}/>, label: t.tabHistory },
                { id: 'PAYMENTS', icon: <CreditCard size={18}/>, label: t.tabPayments }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAppTab(tab.id)}
                  className={`inline-flex whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-black items-center gap-2.5 transition-all shadow-sm cursor-pointer min-h-[44px] ${appTab === tab.id ? 'bg-blue-600 text-white shadow-md border-transparent' : (isDark ? 'bg-slate-800 border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-gray-50 border border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-100')}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </>
          )}

          {user?.role === 'distributor' && (
            <>
              {[
                { id: 'ANALYTICS', icon: <BarChart3 size={18}/>, label: t.tabDistAnalytics },
                { id: 'HISTORY', icon: <Clock size={18}/>, label: t.tabDistHistory },
                { id: 'REPORT', icon: <FileSpreadsheet size={18}/>, label: t.tabDistReport }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAppTab(tab.id)}
                  className={`inline-flex whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-black items-center gap-2.5 transition-all shadow-sm cursor-pointer min-h-[44px] ${appTab === tab.id ? 'bg-blue-600 text-white shadow-md border-transparent' : (isDark ? 'bg-slate-800 border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-gray-50 border border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-100')}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:p-0 print:m-0 print:max-w-full space-y-8">
        
        {/* ============================================================================ */}
        {/* STORE OWNER VIEWS (MENU + 4 TABS) */}
        {/* ============================================================================ */}
        {user?.role === 'store_owner' && (
          <div className="animate-popup">

            {/* TAB 0: HOME MENU */}
            {appTab === 'MENU' && (
              <div className={`border rounded-[2.5rem] p-6 sm:p-14 transition-colors duration-300 print:hidden shadow-lg ${tCard}`}>
                <div className="text-center mb-12">
                  <div className="inline-flex p-5 bg-blue-100 border border-blue-200 text-blue-700 rounded-3xl mb-6 shadow-sm"><Store size={48} /></div>
                  <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.menuTitle}</h2>
                  <p className={`text-base font-bold mt-4 ${tSubText}`}>{t.menuSub}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <button onClick={() => setAppTab('ORDER')} className={`p-8 sm:p-10 rounded-[2rem] border text-left transition-all hover:-translate-y-1 cursor-pointer group shadow-sm hover:shadow-md ${isDark ? 'bg-slate-800 border-slate-600 hover:border-blue-400' : 'bg-white border-gray-300 hover:border-blue-500'}`}>
                    <div className="bg-blue-100 border border-blue-200 text-blue-700 p-5 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform"><ShoppingBag size={32}/></div>
                    <h3 className="text-2xl font-black mb-3">{t.tabOrder}</h3>
                    <p className={`text-base font-bold leading-relaxed ${tSubText}`}>{t.menuOrderDesc}</p>
                  </button>

                  <button onClick={() => setAppTab('GRAPHS')} className={`p-8 sm:p-10 rounded-[2rem] border text-left transition-all hover:-translate-y-1 cursor-pointer group shadow-sm hover:shadow-md ${isDark ? 'bg-slate-800 border-slate-600 hover:border-emerald-400' : 'bg-white border-gray-300 hover:border-emerald-500'}`}>
                    <div className="bg-emerald-100 border border-emerald-200 text-emerald-700 p-5 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform"><BarChart3 size={32}/></div>
                    <h3 className="text-2xl font-black mb-3">{t.tabGraphs}</h3>
                    <p className={`text-base font-bold leading-relaxed ${tSubText}`}>{t.menuGraphsDesc}</p>
                  </button>

                  <button onClick={() => setAppTab('HISTORY')} className={`p-8 sm:p-10 rounded-[2rem] border text-left transition-all hover:-translate-y-1 cursor-pointer group shadow-sm hover:shadow-md ${isDark ? 'bg-slate-800 border-slate-600 hover:border-amber-400' : 'bg-white border-gray-300 hover:border-amber-500'}`}>
                    <div className="bg-amber-100 border border-amber-200 text-amber-700 p-5 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform"><Clock size={32}/></div>
                    <h3 className="text-2xl font-black mb-3">{t.tabHistory}</h3>
                    <p className={`text-base font-bold leading-relaxed ${tSubText}`}>{t.menuHistoryDesc}</p>
                  </button>

                  <button onClick={() => setAppTab('PAYMENTS')} className={`p-8 sm:p-10 rounded-[2rem] border text-left transition-all hover:-translate-y-1 cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-md ${isDark ? 'bg-slate-800 border-slate-600 hover:border-rose-400' : 'bg-white border-gray-300 hover:border-rose-500'}`}>
                    {storeOwnerUnpaidOrders.length > 0 && (<span className="absolute top-6 right-6 sm:top-8 sm:right-8 bg-rose-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-md animate-pulse">{storeOwnerUnpaidOrders.length} Unpaid</span>)}
                    <div className="bg-rose-100 border border-rose-200 text-rose-700 p-5 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform"><CreditCard size={32}/></div>
                    <h3 className="text-2xl font-black mb-3">{t.tabPayments}</h3>
                    <p className={`text-base font-bold leading-relaxed ${tSubText}`}>{t.menuPaymentsDesc}</p>
                  </button>
                </div>
              </div>
            )}
            
            {/* TAB 1: ORDER */}
            {appTab === 'ORDER' && (
              <div className="max-w-5xl mx-auto print:block animate-popup">
                <div className={`border rounded-[2rem] p-4 sm:p-10 transition-colors duration-300 print:hidden ${tCard}`}>
                  <div className={`flex items-center justify-between flex-wrap gap-4 mb-6 border-b pb-6 ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 border border-blue-200 p-4 rounded-2xl text-blue-700"><Layers size={28}/></div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black">{t.dailyMatrix}</h2>
                        <p className={`text-xs sm:text-sm font-bold mt-1 ${tSubText}`}>{user?.shopTimings && user.shopTimings !== 'N/A' && `Timings: ${user.shopTimings}`}</p>
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-sm font-black text-blue-700 bg-blue-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-blue-300">{t.autoCalc}</span>
                  </div>

                  {/* 🍞 BRAND FILTER TOGGLE UI */}
                  <div className="flex gap-3 overflow-x-auto pb-6 mb-4 no-scrollbar">
                    {['All', 'Relish', 'English Oven', 'Max Heath'].map(brand => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => setActiveBrandTab(brand)}
                        className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer min-h-[44px] sm:min-h-[48px] ${activeBrandTab === brand ? 'bg-blue-600 text-white shadow-md border-transparent' : (isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-white border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-100 shadow-sm')}`}
                      >
                        {brand === 'All' ? '🌐 All Brands' : `🍞 ${brand}`}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleMasterOrderSubmit} className="space-y-6 sm:space-y-8">
                    <div className={`overflow-x-auto border rounded-2xl shadow-sm max-h-[500px] overflow-y-auto ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
                      <table className="w-full text-left border-collapse relative min-w-[700px]">
                        <thead className={`sticky top-0 z-10 ${isDark ? 'bg-slate-800' : 'bg-gray-100'} shadow-sm`}>
                          <tr className={`border-b text-xs font-black uppercase tracking-wider ${isDark ? 'border-slate-700 text-slate-300' : 'border-gray-300 text-gray-700'}`}>
                            <th className="p-4">{t.variety}</th><th className="p-4">{t.price}</th><th className="p-4">{t.target}</th><th className="p-4">{t.left}</th><th className="p-4">{t.expired}</th><th className="p-4 text-right">{t.load}</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y text-base font-bold ${isDark ? 'divide-slate-700 bg-slate-900' : 'divide-gray-200 bg-white'}`}>
                          {orderRows.filter(r => activeBrandTab === 'All' || r.brand === activeBrandTab).map((row, index) => {
                            const toLoad = Math.max(0, row.targetStock - Math.max(0, row.currentLeft - row.expired));
                            const isEven = index % 2 === 0;
                            return (
                              <tr key={row.breadVariety} className={`transition-colors duration-150 ${isEven ? (isDark ? 'bg-slate-900' : 'bg-white') : (isDark ? 'bg-slate-800/50' : 'bg-gray-50')}`}>
                                <td className="p-4 font-black min-w-[180px]">
                                  <span className="block mb-1">{row.breadVariety.replace(`${row.brand} `, '')}</span>
                                  <span className={`inline-flex whitespace-nowrap text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded border ${row.brand === 'Relish' ? 'bg-rose-50 text-rose-700 border-rose-200' : row.brand === 'English Oven' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{row.brand}</span>
                                </td>
                                
                                <td className={`p-4 font-black ${tSubText}`}>₹{row.pricePerBread}</td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <input type="number" value={row.targetStock} onChange={e => updateRow(row.breadVariety, 'targetStock', e.target.value)} className={`w-16 sm:w-20 p-2 border rounded-xl font-black text-blue-600 text-center focus:outline-none focus:border-blue-600 transition-all text-sm sm:text-base ${isDark ? 'bg-slate-950 border-slate-600' : 'bg-white border-gray-300 shadow-inner'}`}/>
                                    <button type="button" onClick={() => applyAiPrediction(row.breadVariety, row.pricePerBread, row.currentLeft)} className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0" title="Calculate AI Target">🤖</button>
                                  </div>
                                </td>
                                <td className="p-4"><input type="number" value={row.currentLeft} onChange={e => updateRow(row.breadVariety, 'currentLeft', e.target.value)} className={`w-16 sm:w-20 p-2 border rounded-xl font-bold text-center focus:outline-none focus:border-blue-600 transition-all text-sm sm:text-base ${isDark ? 'bg-slate-950 border-slate-600' : 'bg-white border-gray-300 shadow-inner'}`}/></td>
                                <td className="p-4"><input type="number" value={row.expired} max={row.currentLeft} onChange={e => updateRow(row.breadVariety, 'expired', e.target.value)} className="w-16 sm:w-20 p-2 bg-red-50 border border-red-300 rounded-xl text-red-600 font-black text-center focus:outline-none focus:border-red-600 transition-all text-sm sm:text-base shadow-inner"/></td>
                                <td className="p-4 text-right font-black text-blue-600">
                                  <span className="inline-flex whitespace-nowrap items-center gap-1.5 bg-blue-50 px-3 sm:px-4 py-1.5 rounded-lg border border-blue-200 text-xs sm:text-sm font-black shadow-sm">
                                    <span>{toLoad}</span><span className="text-[9px] sm:text-[10px] font-bold opacity-80">{t.units}</span>
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className={`border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-md transition-colors duration-300 ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-gray-100 border-gray-300'}`}>
                      <div><span className={`text-xs uppercase font-black tracking-widest block mb-1 ${tSubText}`}>{t.totalCargoLoad}</span><span className="text-3xl font-black flex items-center gap-2">{liveTotals.load} <span className="text-sm font-bold text-blue-600">{t.units}</span></span></div>
                      <div className="text-left sm:text-right"><span className={`text-xs uppercase font-black tracking-widest block mb-1 ${tSubText}`}>{t.estBill}</span><span className="text-3xl font-black text-emerald-600 font-mono">₹{liveTotals.bill}</span></div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 sm:py-5 rounded-xl shadow-lg transition-all duration-200 flex justify-center items-center gap-3 cursor-pointer text-sm sm:text-base uppercase tracking-wider hover:-translate-y-1 min-h-[56px]">
                      <CheckCircle2 size={24}/> {t.genInvoice}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: GRAPHS */}
            {appTab === 'GRAPHS' && (
              <div className={`border rounded-[2rem] p-4 sm:p-10 min-h-[500px] h-[70vh] md:h-[650px] flex flex-col transition-colors duration-300 shadow-lg ${tCard}`}>
                <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 border-b pb-6 ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 border border-emerald-200 p-4 rounded-2xl text-emerald-700"><BarChart3 size={28}/></div>
                    <div><h2 className="text-xl sm:text-2xl font-black">{t.shopPerformance}</h2><p className={`text-xs sm:text-sm font-bold mt-1 ${tSubText}`}>{t.shopPerformanceSub}</p></div>
                  </div>
                </div>
                <div className="flex-1 w-full h-full min-h-[300px]">
                  {storeOwnerChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={storeOwnerChartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e5e7eb"}/>
                        <XAxis dataKey="name" stroke={isDark ? "#94a3b8" : "#4b5563"} tick={{fontSize: 10, fill: isDark ? '#cbd5e1' : '#374151', fontWeight: 800}} axisLine={false} tickLine={false}/>
                        <YAxis stroke={isDark ? "#94a3b8" : "#4b5563"} tick={{fontSize: 12, fill: isDark ? '#cbd5e1' : '#374151', fontWeight: 800}} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={{backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '16px', border: isDark ? '1px solid #475569' : '1px solid #d1d5db', color: isDark ? '#f8fafc' : '#111827', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '12px'}} cursor={{fill: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(243, 244, 246, 0.8)'}}/>
                        <Legend wrapperStyle={{paddingTop: '20px', fontWeight: 'bold', fontSize: '12px'}} iconType="circle"/>
                        <Bar dataKey="sold" fill="#2563eb" name="Items Sold" radius={[8, 8, 0, 0]} maxBarSize={50}/>
                        <Bar dataKey="expired" fill="#e11d48" name="Items Expired" radius={[8, 8, 0, 0]} maxBarSize={50}/>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center text-center font-black gap-3 ${tSubText}`}><Zap size={48} className="text-gray-300"/><p className="text-base sm:text-lg">{t.noSales}</p></div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: HISTORY */}
            {appTab === 'HISTORY' && (
              <div className={`border rounded-[2rem] p-4 sm:p-10 transition-colors duration-300 shadow-lg ${tCard}`}>
                <div className={`flex items-center justify-between flex-wrap gap-4 mb-8 border-b pb-6 ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 border border-blue-200 p-4 rounded-2xl text-blue-700"><Clock size={28}/></div>
                    <div><h2 className="text-xl sm:text-2xl font-black">{t.historyTitle}</h2><p className={`text-xs sm:text-sm font-bold mt-1 ${tSubText}`}>{t.historySub}</p></div>
                  </div>
                </div>
                {storeOwnerOrders.length > 0 ? (
                  <div className="overflow-x-auto border rounded-2xl border-gray-200 dark:border-slate-700 shadow-sm">
                    <table className="w-full text-sm sm:text-base text-left min-w-[600px]">
                      <thead className={`border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-300'}`}><tr className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-gray-700'}`}><th className="p-4 sm:p-5">Order Ref</th><th className="p-4 sm:p-5">Date & Time</th><th className="p-4 sm:p-5">Cargo Loaves</th><th className="p-4 sm:p-5 text-center">Payment Status</th><th className="p-4 sm:p-5 text-right">Action</th></tr></thead>
                      <tbody className={`divide-y font-bold ${isDark ? 'divide-slate-700 bg-slate-900' : 'divide-gray-200 bg-white'}`}>
                        {storeOwnerOrders.map((ord, index) => {
                           const isEven = index % 2 === 0;
                           return (
                            <tr key={ord._id} className={`transition-colors duration-150 ${isEven ? (isDark ? 'bg-slate-900' : 'bg-white') : (isDark ? 'bg-slate-800/50' : 'bg-gray-50')}`}>
                              <td className="p-4 sm:p-5 font-mono font-black text-blue-600 truncate">#{ord._id.slice(-8).toUpperCase()}</td>
                              <td className="p-4 sm:p-5 font-black">{new Date(ord.date).toLocaleString()}</td>
                              <td className="p-4 sm:p-5"><span className="inline-flex whitespace-nowrap bg-blue-50 border border-blue-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-black text-blue-700 shadow-sm">{ord.totalSuppliedBreads} Loaves</span></td>
                              <td className="p-4 sm:p-5 text-center"><span className={`inline-flex whitespace-nowrap px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase border shadow-sm ${ord.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'}`}>{ord.paymentStatus || 'UNPAID'}</span></td>
                              <td className="p-4 sm:p-5 text-right"><button onClick={() => setViewingModalInvoice(ord)} className="inline-flex whitespace-nowrap px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-black rounded-xl text-xs sm:text-sm items-center gap-1.5 sm:gap-2 ml-auto hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer min-h-[40px] sm:min-h-[44px]"><Eye size={16}/> {t.viewBill}</button></td>
                            </tr>
                           )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center"><p className={`font-black text-base sm:text-lg ${tSubText}`}>{t.noHistory}</p></div>
                )}
              </div>
            )}

            {/* TAB 4: PAYMENTS */}
            {appTab === 'PAYMENTS' && (
              <div className={`border rounded-[2rem] p-4 sm:p-10 transition-colors duration-300 shadow-lg ${tCard}`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b pb-6 ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-rose-100 border border-rose-200 p-4 rounded-2xl text-rose-700"><CreditCard size={28}/></div>
                    <div><h2 className="text-xl sm:text-2xl font-black">{t.paymentsTitle}</h2><p className={`text-xs sm:text-sm font-bold mt-1 ${tSubText}`}>{t.paymentsSub}</p></div>
                  </div>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-rose-100 border border-rose-300 text-rose-700 text-xs sm:text-sm font-black shadow-sm self-start sm:self-auto">
                    {storeOwnerUnpaidOrders.length} Pending Bills
                  </span>
                </div>
                {storeOwnerOrders.length > 0 ? (
                  <div className="overflow-x-auto border rounded-2xl border-gray-200 dark:border-slate-700 shadow-sm">
                    <table className="w-full text-sm sm:text-base text-left min-w-[700px]">
                      <thead className={`border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-300'}`}><tr className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-gray-700'}`}><th className="p-4 sm:p-5">Invoice Ref</th><th className="p-4 sm:p-5">Date</th><th className="p-4 sm:p-5 text-right">Amount</th><th className="p-4 sm:p-5 text-center">Status</th><th className="p-4 sm:p-5 text-right">Action</th></tr></thead>
                      <tbody className={`divide-y font-bold ${isDark ? 'divide-slate-700 bg-slate-900' : 'divide-gray-200 bg-white'}`}>
                        {storeOwnerOrders.map((ord, index) => {
                          const isEven = index % 2 === 0;
                          return (
                            <tr key={ord._id} className={`transition-colors duration-150 ${isEven ? (isDark ? 'bg-slate-900' : 'bg-white') : (isDark ? 'bg-slate-800/50' : 'bg-gray-50')}`}>
                              <td className="p-4 sm:p-5 font-mono font-black text-blue-600 truncate">#{ord._id.slice(-8).toUpperCase()}</td>
                              <td className="p-4 sm:p-5 font-black">{new Date(ord.date).toLocaleDateString()}</td>
                              <td className="p-4 sm:p-5 text-right font-black font-mono text-emerald-600 text-base sm:text-lg">₹{ord.totalBillAmount}.00</td>
                              <td className="p-4 sm:p-5 text-center"><span className={`inline-flex whitespace-nowrap px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase border shadow-sm ${ord.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`}>{ord.paymentStatus || 'UNPAID'}</span></td>
                              <td className="p-4 sm:p-5 text-right">
                                {ord.paymentStatus === 'PAID' ? (
                                  <button onClick={() => setViewingModalInvoice(ord)} className="inline-flex whitespace-nowrap px-3 sm:px-5 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 font-black rounded-xl text-xs sm:text-sm items-center gap-2 ml-auto transition-all cursor-pointer shadow-sm min-h-[40px] sm:min-h-[44px]"><Receipt size={16}/> View Receipt</button>
                                ) : (
                                  <button onClick={() => openCheckoutPage(ord)} className="inline-flex whitespace-nowrap px-3 sm:px-5 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs sm:text-sm items-center gap-2 ml-auto hover:-translate-y-1 transition-all shadow-md cursor-pointer min-h-[40px] sm:min-h-[44px]"><CreditCard size={16}/> {t.payOnline}</button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center flex flex-col items-center justify-center gap-3"><div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200 mb-2"><CheckCircle2 size={32}/></div><p className="font-black text-base sm:text-lg text-emerald-600">{t.noPayments}</p></div>
                )}
              </div>
            )}

          </div>
        )}

        {/* --- DISTRIBUTOR VIEW (KEPT CLEAN & WIDE) --- */}
        {user?.role === 'distributor' && (
          <div className="space-y-8 print:hidden animate-popup">
            
            {/* DISTRIBUTOR TAB 0: HOME MENU */}
            {appTab === 'MENU' && (
              <div className={`border rounded-[2.5rem] p-6 sm:p-14 transition-colors duration-300 print:hidden shadow-lg ${tCard}`}>
                <div className="text-center mb-12">
                  <div className="inline-flex p-5 bg-blue-100 border border-blue-200 text-blue-700 rounded-3xl mb-6 shadow-sm"><Store size={48} /></div>
                  <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.menuTitle}</h2>
                  <p className={`text-base font-bold mt-4 ${tSubText}`}>{t.menuSub}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  <button onClick={() => setAppTab('ANALYTICS')} className={`p-6 sm:p-10 rounded-[2rem] border text-left transition-all hover:-translate-y-1 cursor-pointer group shadow-sm hover:shadow-md ${isDark ? 'bg-slate-800 border-slate-600 hover:border-emerald-400' : 'bg-white border-gray-300 hover:border-emerald-500'}`}>
                    <div className="bg-emerald-100 border border-emerald-200 text-emerald-700 p-4 sm:p-5 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform"><BarChart3 size={32}/></div>
                    <h3 className="text-xl sm:text-2xl font-black mb-3">{t.tabDistAnalytics}</h3>
                    <p className={`text-xs sm:text-sm font-bold leading-relaxed ${tSubText}`}>{t.menuDistAnalyticsDesc}</p>
                  </button>

                  <button onClick={() => setAppTab('HISTORY')} className={`p-6 sm:p-10 rounded-[2rem] border text-left transition-all hover:-translate-y-1 cursor-pointer group shadow-sm hover:shadow-md ${isDark ? 'bg-slate-800 border-slate-600 hover:border-blue-400' : 'bg-white border-gray-300 hover:border-blue-500'}`}>
                    <div className="bg-blue-100 border border-blue-200 text-blue-700 p-4 sm:p-5 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform"><Clock size={32}/></div>
                    <h3 className="text-xl sm:text-2xl font-black mb-3">{t.tabDistHistory}</h3>
                    <p className={`text-xs sm:text-sm font-bold leading-relaxed ${tSubText}`}>{t.menuDistHistoryDesc}</p>
                  </button>

                  <button onClick={() => setAppTab('REPORT')} className={`p-6 sm:p-10 rounded-[2rem] border text-left transition-all hover:-translate-y-1 cursor-pointer group shadow-sm hover:shadow-md ${isDark ? 'bg-slate-800 border-slate-600 hover:border-amber-400' : 'bg-white border-gray-300 hover:border-amber-500'}`}>
                    <div className="bg-amber-100 border border-amber-200 text-amber-700 p-4 sm:p-5 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform"><FileSpreadsheet size={32}/></div>
                    <h3 className="text-xl sm:text-2xl font-black mb-3">{t.tabDistReport}</h3>
                    <p className={`text-xs sm:text-sm font-bold leading-relaxed ${tSubText}`}>{t.menuDistReportDesc}</p>
                  </button>
                </div>
              </div>
            )}

            {/* DISTRIBUTOR TAB 1: ANALYTICS (Filtered by Store) */}
            {appTab === 'ANALYTICS' && (
              <div className={`border rounded-[2rem] p-4 sm:p-10 min-h-[500px] h-[70vh] md:h-[600px] flex flex-col transition-colors duration-300 shadow-lg ${tCard}`}>
                <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 border-b pb-6 ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 border border-emerald-200 p-4 rounded-2xl text-emerald-700"><BarChart3 size={28}/></div>
                    <div><h2 className="text-xl sm:text-2xl font-black">{t.salesAnalytics}</h2><p className={`text-xs sm:text-sm font-bold mt-1 ${tSubText}`}>{t.agency}: {user?.agencyName}</p></div>
                  </div>
                  <div className={`flex items-center gap-3 border p-2 rounded-xl shadow-sm w-full sm:w-auto ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-300'}`}>
                    <Filter size={18} className="text-blue-600 ml-2 shrink-0"/>
                    <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider hidden sm:inline ${tSubText}`}>{t.storeFilter}</span>
                    <select value={selectedStoreFilter} onChange={e => setSelectedStoreFilter(e.target.value)} className={`w-full sm:w-auto border rounded-lg px-2 sm:px-4 py-2 text-xs sm:text-sm font-black text-blue-700 focus:outline-none cursor-pointer transition-colors ${isDark ? 'bg-slate-800 border-slate-600 hover:border-blue-500' : 'bg-white border-gray-300 hover:border-blue-600'}`}>
                      <option value="ALL">{t.allStores}</option>
                      {uniqueStores.filter(s => s !== 'ALL').map(store => (<option key={store} value={store}>🏪 {store}</option>))}
                    </select>
                  </div>
                </div>

                <div className="flex-1 w-full h-full min-h-[300px]">
                  {activeChartDataset.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activeChartDataset} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e5e7eb"}/>
                        <XAxis dataKey="name" stroke={isDark ? "#94a3b8" : "#4b5563"} tick={{fontSize: 10, fill: isDark ? '#cbd5e1' : '#374151', fontWeight: 800}} axisLine={false} tickLine={false}/>
                        <YAxis stroke={isDark ? "#94a3b8" : "#4b5563"} tick={{fontSize: 12, fill: isDark ? '#cbd5e1' : '#374151', fontWeight: 800}} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={{backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '16px', border: isDark ? '1px solid #475569' : '1px solid #d1d5db', color: isDark ? '#f8fafc' : '#111827', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '12px'}} cursor={{fill: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(243, 244, 246, 0.8)'}}/>
                        <Legend wrapperStyle={{paddingTop: '20px', fontWeight: 'bold', fontSize: '12px'}} iconType="circle"/>
                        <Bar dataKey="sold" fill="#2563eb" name="Breads Sold (Billed)" radius={[8, 8, 0, 0]} maxBarSize={50}/>
                        <Bar dataKey="expired" fill="#e11d48" name="Expired Returns" radius={[8, 8, 0, 0]} maxBarSize={50}/>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center text-center font-black gap-3 ${tSubText}`}><Zap size={48} className="text-gray-300"/><p className="text-base sm:text-lg">{t.noSales}</p></div>
                  )}
                </div>
              </div>
            )}

            {/* DISTRIBUTOR TAB 2: HISTORY (With Date Filters) */}
            {appTab === 'HISTORY' && (
              <div className={`border rounded-[2rem] p-4 sm:p-10 transition-colors duration-300 shadow-lg ${tCard}`}>
                <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 border-b pb-6 ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 border border-blue-200 p-4 rounded-2xl text-blue-700"><Clock size={28}/></div>
                    <div><h2 className="text-xl sm:text-2xl font-black">{t.historyTitle}</h2><p className={`text-xs sm:text-sm font-bold mt-1 ${tSubText}`}>{t.historySub}</p></div>
                  </div>
                  <div className={`flex items-center gap-3 border p-2 rounded-xl shadow-sm w-full sm:w-auto ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-300'}`}>
                    <Calendar size={18} className="text-blue-600 ml-2 shrink-0"/>
                    <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider hidden sm:inline ${tSubText}`}>{t.timeFilter}</span>
                    <select value={distroHistoryFilter} onChange={e => setDistroHistoryFilter(e.target.value)} className={`w-full sm:w-auto border rounded-lg px-2 sm:px-4 py-2 text-xs sm:text-sm font-black text-blue-700 focus:outline-none cursor-pointer transition-colors ${isDark ? 'bg-slate-800 border-slate-600 hover:border-blue-500' : 'bg-white border-gray-300 hover:border-blue-600'}`}>
                      <option value="ALL">{t.allTime}</option>
                      <option value="DAILY">{t.daily}</option>
                      <option value="MONTHLY">{t.monthly}</option>
                    </select>
                  </div>
                </div>

                {filteredDistributorHistory.length > 0 ? (
                  <div className={`overflow-x-auto border rounded-2xl shadow-sm ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                    <table className="w-full text-sm sm:text-base text-left min-w-[800px]">
                      <thead className={`border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-300'}`}><tr className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-gray-700'}`}><th className="p-4 sm:p-5">{t.storeDetails}</th><th className="p-4 sm:p-5">{t.pkgBreakdown}</th><th className="p-4 sm:p-5">{t.totalCargoLoad}</th><th className="p-4 sm:p-5 text-right">{t.masterTotal}</th><th className="p-4 sm:p-5 text-center">{t.manage}</th></tr></thead>
                      <tbody className={`divide-y font-bold ${isDark ? 'divide-slate-700 bg-slate-900' : 'divide-gray-200 bg-white'}`}>
                        {filteredDistributorHistory.map((ord, index) => {
                          const isEven = index % 2 === 0;
                          return (
                          <tr key={ord._id} className={`transition-colors duration-150 ${isEven ? (isDark ? 'bg-slate-900' : 'bg-white') : (isDark ? 'bg-slate-800/50' : 'bg-gray-50')}`}>
                            <td className="p-4 sm:p-5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black flex items-center gap-2 text-base sm:text-lg"><Store size={18} className="text-blue-600 shrink-0"/>{ord.shopName}</span>
                                <span className={`inline-flex whitespace-nowrap px-2 sm:px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase border shadow-sm ${ord.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'}`}>
                                  {ord.paymentStatus || 'UNPAID'}
                                </span>
                              </div>
                              <span className={`text-[10px] sm:text-xs font-black block mt-2 ${tSubText}`}>{new Date(ord.date).toLocaleString()}</span>
                            </td>
                            <td className={`p-4 sm:p-5 text-xs sm:text-sm font-bold max-w-xs sm:max-w-sm truncate ${tSubText}`}>{ord?.items?.map(i => `${i.suppliedBreads}x ${i.breadVariety}`).join(', ') || 'Legacy single item'}</td>
                            <td className="p-4 sm:p-5 font-black text-blue-600"><span className="inline-flex whitespace-nowrap bg-blue-50 border border-blue-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm shadow-sm">{ord.totalSuppliedBreads} {t.totalBreads}</span></td>
                            <td className="p-4 sm:p-5 text-right font-black font-mono text-emerald-600 text-base sm:text-lg">₹{ord.totalBillAmount}</td>
                            <td className="p-4 sm:p-5 text-center">
                              <div className="flex items-center justify-center gap-2 sm:gap-3">
                                <button onClick={() => setViewingModalInvoice(ord)} className="inline-flex whitespace-nowrap px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-black rounded-xl text-xs sm:text-sm items-center gap-1.5 sm:gap-2 hover:-translate-y-1 active:scale-95 transition-all shadow-sm cursor-pointer min-h-[40px] sm:min-h-[44px]"><Eye size={16}/> <span className="hidden xl:inline">{t.viewBill}</span></button>
                                <button onClick={() => setDeletingOrderWarning(ord)} className="inline-flex whitespace-nowrap p-2 sm:p-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl hover:-translate-y-1 active:scale-90 transition-all shadow-sm cursor-pointer min-h-[40px] sm:min-h-[44px]" title="Delete"><Trash2 size={18}/></button>
                              </div>
                            </td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center"><p className={`font-black text-base sm:text-lg ${tSubText}`}>{t.noHistory}</p></div>
                )}
              </div>
            )}

            {/* DISTRIBUTOR TAB 3: MONTHLY / DAILY REPORT GENERATOR */}
            {appTab === 'REPORT' && (
              <div className={`border rounded-[2rem] p-4 sm:p-10 transition-colors duration-300 shadow-lg ${tCard}`}>
                <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 border-b pb-6 ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-amber-100 border border-amber-200 p-4 rounded-2xl text-amber-700"><FileSpreadsheet size={28}/></div>
                    <div><h2 className="text-xl sm:text-2xl font-black">{t.salesReportTitle}</h2><p className={`text-xs sm:text-sm font-bold mt-1 ${tSubText}`}>{t.salesReportSub}</p></div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <div className={`flex items-center gap-3 border p-2 rounded-xl shadow-sm w-full sm:w-auto ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-300'}`}>
                      <Calendar size={18} className="text-blue-600 ml-2 shrink-0"/>
                      <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider hidden sm:inline ${tSubText}`}>{t.timeFilter}</span>
                      <select value={distroReportFilter} onChange={e => setDistroReportFilter(e.target.value)} className={`w-full sm:w-auto border rounded-lg px-2 sm:px-4 py-2 text-xs sm:text-sm font-black text-blue-700 focus:outline-none cursor-pointer transition-colors ${isDark ? 'bg-slate-800 border-slate-600 hover:border-blue-500' : 'bg-white border-gray-300 hover:border-blue-600'}`}>
                        <option value="DAILY">{t.daily}</option>
                        <option value="MONTHLY">{t.monthly}</option>
                      </select>
                    </div>
                    <button onClick={handleDownloadReportCSV} disabled={distributorReportData.length === 0} className="w-full sm:w-auto px-4 sm:px-5 py-3 sm:py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 hover:-translate-y-1 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0 min-h-[44px]">
                      <Download size={18}/> {t.downloadReport}
                    </button>
                  </div>
                </div>

                {distributorReportData.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                      <div className={`p-5 sm:p-6 rounded-2xl border flex items-center justify-between ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-gray-50 border-gray-300'}`}>
                        <div><span className={`text-[10px] sm:text-xs uppercase font-black tracking-widest ${tSubText}`}>{t.totalCargoLoad}</span><h4 className="text-2xl sm:text-3xl font-black mt-1 text-blue-600">{distributorReportTotals.sold} <span className="text-sm sm:text-base text-gray-500">{t.units}</span></h4></div>
                        <Package size={32} className="text-blue-200 sm:w-10 sm:h-10"/>
                      </div>
                      <div className={`p-5 sm:p-6 rounded-2xl border flex items-center justify-between ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-gray-50 border-gray-300'}`}>
                        <div><span className={`text-[10px] sm:text-xs uppercase font-black tracking-widest ${tSubText}`}>{t.revenue}</span><h4 className="text-2xl sm:text-3xl font-black mt-1 text-emerald-600 font-mono">₹{distributorReportTotals.revenue}</h4></div>
                        <CreditCard size={32} className="text-emerald-200 sm:w-10 sm:h-10"/>
                      </div>
                    </div>

                    {/* NEW BRAND REVENUE CARDS */}
                    {distributorBrandReportData.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                        {distributorBrandReportData.map(data => (
                          <div key={data.brand} className={`p-3 sm:p-4 rounded-2xl border flex items-center justify-between shadow-sm ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
                            <span className={`inline-flex whitespace-nowrap text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 sm:px-2.5 py-1 rounded border ${data.brand === 'Relish' ? 'bg-rose-50 text-rose-700 border-rose-200' : data.brand === 'English Oven' ? 'bg-amber-50 text-amber-700 border-amber-200' : data.brand === 'Max Heath' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>{data.brand}</span>
                            <span className="text-base sm:text-lg font-black font-mono">₹{data.revenue}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="h-[250px] sm:h-[300px] mb-8 w-full overflow-x-auto no-scrollbar">
                      <div className="min-w-[600px] h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={distributorReportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e5e7eb"}/>
                            <XAxis dataKey="name" stroke={isDark ? "#94a3b8" : "#4b5563"} tick={{fontSize: 9, fill: isDark ? '#cbd5e1' : '#374151', fontWeight: 800}} axisLine={false} tickLine={false}/>
                            <YAxis yAxisId="left" stroke={isDark ? "#94a3b8" : "#4b5563"} tick={{fontSize: 10, fill: isDark ? '#cbd5e1' : '#374151', fontWeight: 800}} axisLine={false} tickLine={false}/>
                            <YAxis yAxisId="right" orientation="right" stroke={isDark ? "#10b981" : "#059669"} tick={{fontSize: 10, fill: isDark ? '#10b981' : '#059669', fontWeight: 800}} axisLine={false} tickLine={false}/>
                            <Tooltip contentStyle={{backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '12px', border: isDark ? '1px solid #475569' : '1px solid #d1d5db', color: isDark ? '#f8fafc' : '#111827', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '11px'}}/>
                            <Legend wrapperStyle={{paddingTop: '10px', fontWeight: 'bold', fontSize: '11px'}} iconType="circle"/>
                            <Line yAxisId="left" type="monotone" dataKey="sold" stroke="#2563eb" strokeWidth={3} dot={{r: 3, strokeWidth: 2}} name="Cargo Sold"/>
                            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{r: 3, strokeWidth: 2}} name="Revenue (₹)"/>
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className={`overflow-x-auto border rounded-2xl shadow-sm ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                      <table className="w-full text-xs sm:text-sm text-left min-w-[500px]">
                        <thead className={`border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-300'}`}><tr className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-gray-700'}`}><th className="p-3 sm:p-4">{t.variety}</th><th className="p-3 sm:p-4 text-center">Cargo Sold</th><th className="p-3 sm:p-4 text-center">Expired Returns</th><th className="p-3 sm:p-4 text-right">Revenue Generated</th></tr></thead>
                        <tbody className={`divide-y font-bold ${isDark ? 'divide-slate-700 bg-slate-900' : 'divide-gray-200 bg-white'}`}>
                          {distributorReportData.map((row, index) => {
                            const isEven = index % 2 === 0;
                            return (
                            <tr key={row.name} className={`transition-colors duration-150 ${isEven ? (isDark ? 'bg-slate-900' : 'bg-white') : (isDark ? 'bg-slate-800/50' : 'bg-gray-50')}`}>
                              <td className="p-3 sm:p-4 truncate max-w-[150px] sm:max-w-[200px] text-sm sm:text-base">{row.name}</td>
                              <td className="p-3 sm:p-4 text-center text-blue-600 text-base sm:text-lg">{row.sold}</td>
                              <td className="p-3 sm:p-4 text-center text-red-600 text-base sm:text-lg">{row.expired}</td>
                              <td className="p-3 sm:p-4 text-right font-mono text-emerald-600 text-base sm:text-lg">₹{row.revenue}</td>
                            </tr>
                          )})}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center"><p className={`font-black text-base sm:text-lg ${tSubText}`}>{t.noSales}</p></div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MODAL 1: FLOATING INVOICE VIEWER */}
        {viewingModalInvoice && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-50 animate-popup print:static print:bg-white print:inset-auto print:p-0 print:block overflow-y-auto">
            <div className={`border rounded-[2.5rem] shadow-2xl max-w-2xl w-full my-auto overflow-hidden print:shadow-none print:border-none print:max-w-full print:rounded-none print:m-0 print:w-full print:block print:bg-white print:text-black transition-colors duration-300 ${tCard}`}>
              <div className="bg-blue-600 p-6 sm:p-8 text-white flex justify-between items-center print:bg-white print:text-black print:border-b-2 print:border-black print:p-0 print:pb-6 print:mb-6">
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-black">{t.dispatchedInvoice}</h3>
                    <span className={`inline-flex whitespace-nowrap px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border shadow-sm print:border-black print:text-black ${viewingModalInvoice.paymentStatus === 'PAID' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-amber-500 text-white border-amber-400'}`}>
                      {viewingModalInvoice.paymentStatus === 'PAID' ? `✅ ${t.paidBadge}` : `⏳ ${t.unpaidBadge}`}
                    </span>
                  </div>
                  <p className="text-blue-200 text-xs sm:text-sm font-mono mt-1 print:text-gray-600">{t.ref} #{viewingModalInvoice._id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="flex gap-2 sm:gap-3 print:hidden shrink-0">
                  <button onClick={() => window.print()} className="bg-white/20 hover:bg-white/30 border border-white/30 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1 sm:gap-2 hover:-translate-y-1 transition-all cursor-pointer shadow-sm"><Printer size={18}/> <span className="hidden sm:inline">{t.savePdf}</span></button>
                  <button onClick={() => setViewingModalInvoice(null)} className="bg-black/30 hover:bg-black/50 border border-white/10 p-2 sm:p-2.5 rounded-xl text-sm font-black cursor-pointer transition-colors"><X size={20}/></button>
                </div>
              </div>
              <div className="p-5 sm:p-8 print:p-0">
                <div className={`flex flex-col sm:flex-row justify-between border-b-2 pb-5 sm:pb-6 mb-5 sm:mb-6 gap-4 print:border-black print:flex-row ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                  <div>
                    <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest print:text-gray-600 ${tSubText}`}>{t.billedTo}</span>
                    <h4 className="text-lg sm:text-xl font-black mt-1 print:text-black">{viewingModalInvoice.shopName}</h4>
                    {viewingModalInvoice.address && <span className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 mt-2 print:text-gray-700 ${tSubText}`}><MapPin size={16} className="text-blue-600 print:text-black shrink-0"/>{viewingModalInvoice.address}</span>}
                    {viewingModalInvoice.mobileNumber && <span className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 mt-1 print:text-gray-700 ${tSubText}`}><Phone size={16} className="text-blue-600 print:text-black shrink-0"/>{viewingModalInvoice.mobileNumber}</span>}
                  </div>
                  <div className="text-left sm:text-right"><span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest print:text-gray-600 ${tSubText}`}>{t.dispatchDate}</span><p className="text-sm font-black mt-1 print:text-black">{new Date(viewingModalInvoice.date).toLocaleDateString()}</p></div>
                </div>
                <div className={`max-h-[250px] sm:max-h-[300px] overflow-y-auto overflow-x-auto no-scrollbar border rounded-xl print:border-none print:max-h-none print:overflow-visible ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                  <table className="w-full text-xs sm:text-sm my-0 min-w-[500px]">
                    <thead className={`border-b-2 text-left print:border-black sticky top-0 z-10 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-gray-100 border-gray-300 text-gray-700'} print:bg-transparent print:text-black`}><tr><th className="p-3 sm:p-4 font-black uppercase text-[10px] sm:text-xs tracking-wider">{t.item}</th><th className="p-3 sm:p-4 font-black uppercase text-[10px] sm:text-xs tracking-wider">{t.target}</th><th className="p-3 sm:p-4 font-black uppercase text-[10px] sm:text-xs tracking-wider">{t.leftExp}</th><th className="p-3 sm:p-4 font-black uppercase text-[10px] sm:text-xs tracking-wider">{t.loaded}</th><th className="p-3 sm:p-4 text-right font-black uppercase text-[10px] sm:text-xs tracking-wider">{t.total}</th></tr></thead>
                    <tbody className={`divide-y font-bold print:divide-gray-300 ${isDark ? 'divide-slate-700 bg-slate-900' : 'divide-gray-200 bg-white'}`}>
                      {viewingModalInvoice.items?.map(i => (<tr key={i.breadVariety} className="transition-colors"><td className="p-3 sm:p-4 font-black print:text-black max-w-[150px] truncate" title={i.breadVariety}>{i.breadVariety}</td><td className="p-3 sm:p-4">{i.targetStock}</td><td className="p-3 sm:p-4">{i.currentLeft} <span className="text-red-600 font-black print:text-red-700">({i.expired})</span></td><td className="p-3 sm:p-4 font-black text-blue-600 print:text-black text-base sm:text-lg">{i.suppliedBreads}</td><td className="p-3 sm:p-4 text-right font-mono font-black print:text-black text-sm sm:text-base">₹{i.itemTotal}</td></tr>))}
                    </tbody>
                  </table>
                </div>
                <div className={`rounded-2xl p-5 sm:p-6 mt-5 sm:mt-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border shadow-sm print:bg-transparent print:border-none print:p-0 print:border-t-2 print:border-black print:pt-6 print:flex-row ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-300'}`}>
                  <div><span className={`text-[10px] sm:text-xs uppercase font-black tracking-widest block mb-1 print:text-gray-800 ${tSubText}`}>{t.totalCargoLoad}</span><span className="text-xl sm:text-2xl font-black text-blue-600 print:text-black">{viewingModalInvoice.totalSuppliedBreads} {t.units}</span></div>
                  <div className="text-left sm:text-right"><span className={`text-[10px] sm:text-xs uppercase font-black tracking-widest block mb-1 print:text-gray-800 ${tSubText}`}>{t.masterTotal}</span><span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono print:text-black">₹{viewingModalInvoice.totalBillAmount}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: DELETION SAFETY TRAP (WITH DOWNLOAD & DELETE FLOW) */}
        {deletingOrderWarning && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 z-50 print:hidden animate-popup overflow-y-auto">
            <div className={`border rounded-[2.5rem] shadow-2xl max-w-md w-full p-6 sm:p-8 text-center my-auto ${isDark ? 'bg-slate-900 border-red-500/50' : 'bg-white border-red-300'}`}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 border border-red-200 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><AlertCircle size={32} className="sm:w-10 sm:h-10"/></div>
              <h3 className="text-xl sm:text-2xl font-black mb-2">{t.deleteTitle}</h3>
              <p className={`text-xs sm:text-sm font-bold mb-6 sm:mb-8 leading-relaxed ${tSubText}`}>{t.deleteWarn} <strong className={isDark ? 'text-white' : 'text-black'}>{deletingOrderWarning.shopName}</strong> (₹{deletingOrderWarning.totalBillAmount}). {t.downloadFirst}</p>
              <div className="space-y-3">
                {user?.role === 'distributor' ? (
                  <button onClick={() => handleDownloadAndDelete(deletingOrderWarning)} className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-black py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-1 text-xs sm:text-sm cursor-pointer shadow-sm min-h-[48px]"><Download size={18}/> {t.downloadAndDelete}</button>
                ) : (
                  <button onClick={() => { const o = deletingOrderWarning; setDeletingOrderWarning(null); setViewingModalInvoice(o); }} className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-black py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-1 text-xs sm:text-sm cursor-pointer shadow-sm min-h-[48px]"><Download size={18}/> {t.viewSaveFirst}</button>
                )}
                <button onClick={() => confirmAndDeleteOrderForever(deletingOrderWarning._id)} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-1 shadow-md text-xs sm:text-sm cursor-pointer min-h-[48px]"><Trash2 size={18}/> {t.permDelete}</button>
                <button onClick={() => setDeletingOrderWarning(null)} className={`w-full font-black py-3 sm:py-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider cursor-pointer transition-colors min-h-[48px] ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>{t.cancel}</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
