import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Search, ShoppingBag, PenTool, Settings, 
  TrendingUp, DollarSign, Package, CheckCircle, Zap, Menu, 
  X, ArrowRight, Loader2, Lock, Globe, Download, FileSpreadsheet, 
  Calculator, Eye, Database, Map, Megaphone, CheckSquare
} from 'lucide-react';

// --- ⚡️ CONFIGURATION ---
const APP_CONFIG = {
  SHOPIFY_AFFILIATE_LINK: "https://www.shopify.com/free-trial",
  STRIPE_PAYMENT_LINK: "https://buy.stripe.com/test_3cI3cuajx2xb1TJ4oS2Nq00", 
  RAPID_API_HOST: "aliexpress-datahub.p.rapidapi.com", 
  RAPID_API_URL: "https://aliexpress-datahub.p.rapidapi.com/item_search"
};

// --- 💎 REAL MARKET DATA ---
const REAL_MARKET_DATA = [
    { id: 109, name: "Smart Health Ring", niche: "Wearables", price: "18.00", sellingPrice: "89.99", profit: "71.99", saturation: "Medium", trendScore: 97, isPro: true, image: "https://images.unsplash.com/photo-1622431062669-ed38267b6de5?auto=format&fit=crop&q=80&w=300&h=300", description: "Sleep tracking ring. Cheaper alternative to Oura.", link: "https://www.aliexpress.com" },
    { id: 110, name: "Portable Ice Bath", niche: "Health", price: "35.00", sellingPrice: "129.99", profit: "94.99", saturation: "Medium", trendScore: 95, isPro: true, image: "https://images.unsplash.com/photo-1543353071-87d81280512d?auto=format&fit=crop&q=80&w=300&h=300", description: "Recovery tool for athletes. High ticket winner.", link: "https://www.aliexpress.com" },
    { id: 101, name: "Levitating Moon Lamp", niche: "Decor", price: "24.99", sellingPrice: "89.99", profit: "65.00", saturation: "Medium", trendScore: 98, isPro: false, image: "https://images.unsplash.com/photo-1513506003011-3b03c8b69580?auto=format&fit=crop&q=80&w=300&h=300", description: "Magnetic levitation 3D moon. Viral on TikTok.", link: "https://www.aliexpress.com" },
    { id: 111, name: "AI Gimbal Stabilizer", niche: "Tech", price: "14.50", sellingPrice: "59.99", profit: "45.49", saturation: "Low", trendScore: 93, isPro: false, image: "https://images.unsplash.com/photo-1517623910543-79d35c5c9945?auto=format&fit=crop&q=80&w=300&h=300", description: "Hands-free video creation for influencers.", link: "https://www.aliexpress.com" },
    { id: 102, name: "Ultrasonic Scrubber", niche: "Beauty", price: "12.50", sellingPrice: "45.00", profit: "32.50", saturation: "Low", trendScore: 92, isPro: true, image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=300&h=300", description: "Deep cleansing facial tool. High margin.", link: "https://www.aliexpress.com" },
    { id: 112, name: "Red Light Wand", niche: "Beauty", price: "11.00", sellingPrice: "59.99", profit: "48.99", saturation: "Medium", trendScore: 96, isPro: true, image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=300&h=300", description: "Skincare tech trending now.", link: "https://www.aliexpress.com" }
];

// --- 🔄 SERVICES ---
const DataService = {
  enrichProductData: (apiProduct) => {
    const costPrice = parseFloat(apiProduct.price?.replace(/[^0-9.]/g, '') || 10);
    const sellingPrice = (costPrice * 3).toFixed(2);
    const trendScore = Math.floor(Math.random() * (99 - 80) + 80); 
    return {
      id: apiProduct.itemId || Math.random(),
      name: apiProduct.title || "Unknown Product",
      niche: "Imported",
      price: costPrice.toFixed(2),
      sellingPrice: sellingPrice,
      profit: (sellingPrice - costPrice).toFixed(2),
      saturation: trendScore > 90 ? "Low" : "Medium",
      trendScore: trendScore,
      isPro: trendScore > 92,
      image: apiProduct.image || "https://via.placeholder.com/300",
      description: "High-potential dropshipping product.",
      link: apiProduct.itemUrl
    };
  },
  getProducts: async (query, apiKey) => {
    if (!apiKey) {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (!query || query === "trending") return REAL_MARKET_DATA;
      const lowerQuery = query.toLowerCase();
      return REAL_MARKET_DATA.filter(p => p.name.toLowerCase().includes(lowerQuery) || p.niche.toLowerCase().includes(lowerQuery));
    }
    try {
      const response = await fetch(`${APP_CONFIG.RAPID_API_URL}?q=${query || 'trending'}&page=1`, {
        method: 'GET', headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': APP_CONFIG.RAPID_API_HOST }
      });
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      return (data.result?.resultList || []).map(DataService.enrichProductData);
    } catch (error) { return []; }
  },
  generateShopifyCSV: (products) => {
    const headers = ["Handle", "Title", "Body (HTML)", "Vendor", "Variant Price", "Image Src"];
    const rows = products.map(p => [
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), `"${p.name}"`, `"<p>${p.description}</p>"`, "DropGenius", p.sellingPrice, p.image 
    ].join(","));
    return encodeURI("data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n"));
  }
};

// --- 🎨 AESTHETIC COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", icon: Icon, isLoading, disabled }) => {
  const baseStyle = "flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/20 border border-violet-500/20",
    secondary: "bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10",
    outline: "border border-gray-600 hover:bg-gray-800 text-gray-300",
    premium: "bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-500/20",
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading || disabled}>
      {isLoading ? <Loader2 className="animate-spin" size={20} /> : Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

const Badge = ({ children, color = "violet" }) => {
  const colors = {
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    green: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    gold: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  };
  return <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${colors[color] || colors.violet}`}>{children}</span>;
};

const PremiumModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#0f0a1e] border border-violet-500/30 rounded-3xl max-w-md w-full p-8 relative shadow-2xl shadow-violet-900/50">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
        <div className="text-center mb-6 pt-2">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/30"><Lock size={32} className="text-white" /></div>
          <h2 className="text-3xl font-bold text-white mb-2">Unlock Pro Access</h2>
          <p className="text-gray-400">Get unlimited access to high-margin products and spy tools.</p>
        </div>
        <Button variant="premium" className="w-full py-4 text-lg" onClick={() => window.open(APP_CONFIG.STRIPE_PAYMENT_LINK, '_blank')}>Upgrade for $9.99/mo</Button>
      </div>
    </div>
  );
};

const ProfitCalculator = ({ productPrice = 0, sellingPrice = 0 }) => {
    const [costs, setCosts] = useState({ cost: productPrice, price: sellingPrice, shipping: 5.00, cpa: 15.00 });
    const netProfit = (costs.price - costs.cost - costs.shipping - costs.cpa - ((costs.price * 0.029) + 0.30)).toFixed(2);
    return (
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 mt-3">
            <h4 className="text-white font-bold flex items-center gap-2 mb-4 text-sm"><Calculator size={14} className="text-violet-400"/> Net Profit Calculator</h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
                {['price', 'cost', 'cpa', 'shipping'].map(field => (
                    <div key={field}>
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider">{field}</label>
                        <input type="number" value={costs[field]} onChange={e => setCosts({...costs, [field]: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-violet-500 outline-none transition-colors" />
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-sm text-gray-300">Net Profit:</span><span className={`font-bold text-lg ${netProfit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>${netProfit}</span>
            </div>
        </div>
    );
};

const LogoGenerator = ({ storeName }) => (
    <div className="space-y-4">
        <h3 className="text-white font-semibold">AI Brand Studio</h3>
        <div className="grid grid-cols-2 gap-3">
            {[{font:"font-serif",bg:"bg-black"}, {font:"font-sans",bg:"bg-white text-black"}, {font:"font-mono",bg:"bg-violet-600"}, {font:"font-bold",bg:"bg-gray-800 text-yellow-400"}].map((s, i) => (
                <div key={i} className={`cursor-pointer h-20 rounded-xl flex items-center justify-center gap-2 border-2 border-transparent hover:border-violet-500 transition-all ${s.bg}`}>
                    <span className={`${s.font} ${s.text || 'text-white'} text-lg`}>{storeName || "Brand"}</span>
                </div>
            ))}
        </div>
    </div>
);

// --- VIEWS ---

const DashboardView = ({ isPro, onUpgrade, roadmapProgress }) => (
  <div className="space-y-8 animate-in fade-in duration-700">
    <div className="flex justify-between items-center">
      <div><h2 className="text-3xl font-bold text-white">Dashboard</h2><p className="text-violet-200/60">Welcome back, Boss.</p></div>
      {!isPro && <Button variant="premium" className="hidden md:flex text-sm py-2 px-4" onClick={onUpgrade}><Zap size={16} className="fill-current" /> Go Pro</Button>}
    </div>

    <div className="relative p-6 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/40 to-fuchsia-900/40 backdrop-blur-md border border-white/5"></div>
        <div className="relative z-10">
            <div className="flex justify-between items-end mb-3">
                <div><h3 className="text-white font-bold flex items-center gap-2"><Map size={20} className="text-fuchsia-400"/> Launch Roadmap</h3><p className="text-xs text-gray-400">Your path to $10k/month</p></div>
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">{roadmapProgress}%</span>
            </div>
            <div className="w-full bg-gray-900/50 h-3 rounded-full overflow-hidden border border-white/5"><div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(139,92,246,0.5)]" style={{ width: `${roadmapProgress}%` }}></div></div>
        </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-transparent"><div><p className="text-violet-300 text-sm font-medium">Total Revenue</p><h3 className="text-3xl font-bold text-white mt-1">$0.00</h3></div></Card>
      <Card className="p-6"><div><p className="text-gray-400 text-sm font-medium">Saved Products</p><h3 className="text-3xl font-bold text-white mt-1">12</h3></div></Card>
      <Card className="p-6 border-emerald-500/20 bg-emerald-500/5"><div><p className="text-emerald-400 text-sm font-medium">Next Step</p><h3 className="text-xl font-bold text-white mt-1">Start Store</h3></div><button onClick={() => window.open(APP_CONFIG.SHOPIFY_AFFILIATE_LINK, '_blank')} className="text-xs text-emerald-400 mt-3 hover:text-emerald-300 flex items-center gap-1">Launch on Shopify <ArrowRight size={12}/></button></Card>
    </div>
  </div>
);

const RoadmapView = ({ progress, setProgress }) => {
    const steps = [
        { id: 1, title: "Niche Research", desc: "Find a high-margin niche using the Finder." },
        { id: 2, title: "Product Selection", desc: "Save 3-5 winning products." },
        { id: 3, title: "Asset Generation", desc: "Create Logo & CSV in Builder." },
        { id: 4, title: "Store Launch", desc: "Connect Shopify & Import CSV." },
        { id: 5, title: "Traffic", desc: "Launch Ads via Marketing Hub." },
    ];
    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
             <div className="bg-gradient-to-r from-violet-600 to-fuchsia-700 rounded-2xl p-8 shadow-2xl shadow-violet-900/30 text-center"><h2 className="text-3xl font-bold text-white mb-2">Zero to Hero</h2><p className="text-white/80">Follow the path to your first sale.</p></div>
             <div className="space-y-3">
                {steps.map((step) => {
                    const completed = progress >= step.id * 20;
                    return (
                    <Card key={step.id} className={`p-5 transition-all duration-300 ${completed ? 'border-l-4 border-l-emerald-500 bg-emerald-900/10' : 'border-l-4 border-l-gray-700'}`}>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setProgress(completed ? (step.id - 1) * 20 : step.id * 20)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'border-gray-600 hover:border-violet-500'}`}>{completed && <CheckSquare size={16} />}</button>
                            <div><h3 className={`font-bold text-lg ${completed ? 'text-white' : 'text-gray-400'}`}>{step.title}</h3><p className="text-gray-500 text-xs mt-0.5">{step.desc}</p></div>
                        </div>
                    </Card>
                )})}
            </div>
        </div>
    );
};

const ProductFinderView = ({ isPro, onUpgrade, onAddToStore }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [niche, setNiche] = useState("");
  const [calcId, setCalcId] = useState(null);
  const apiKey = localStorage.getItem('rapid_api_key');

  useEffect(() => { handleSearch(); }, []);
  const handleSearch = () => {
    setIsSearching(true); setResults([]); 
    DataService.getProducts(niche || "trending", apiKey).then(data => { setResults(data); setIsSearching(false); });
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in slide-in-from-right-4 duration-500">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-center shadow-2xl shadow-violet-900/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2">Product Hunter AI</h2>
            <div className="flex items-center justify-center gap-2 mb-6">
                {apiKey ? <Badge color="green">Live API Data</Badge> : <Badge color="violet">Curated Trends DB</Badge>}
            </div>
            <div className="flex gap-2 max-w-lg mx-auto bg-black/20 p-1 rounded-xl backdrop-blur-sm border border-white/10">
                <input type="text" placeholder="Enter a niche (e.g. 'Tech', 'Decor')" className="flex-1 bg-transparent border-none px-4 text-white focus:outline-none placeholder-white/40" value={niche} onChange={(e) => setNiche(e.target.value)} />
                <Button onClick={handleSearch} isLoading={isSearching} icon={Search} className="h-10 rounded-lg">Search</Button>
            </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pb-20">
        {results.map((product) => (
          <Card key={product.id} className="flex flex-col md:flex-row p-4 gap-5 group hover:border-violet-500/30 transition-colors">
            {!isPro && product.isPro && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4">
                <Lock className="text-yellow-400 mb-2" size={32} /><h3 className="text-white font-bold text-lg">Premium Winner</h3>
                <Button variant="premium" onClick={onUpgrade} className="text-sm px-6 mt-3">Unlock Now</Button>
              </div>
            )}
            <div className="w-full md:w-36 h-36 bg-gray-800 rounded-xl overflow-hidden shrink-0 shadow-lg"><img src={product.image} className="w-full h-full object-cover" /></div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2"><div><h3 className="text-lg font-bold text-white leading-tight">{product.name}</h3><div className="flex gap-2 mt-1.5"><Badge color={product.trendScore > 90 ? "green" : "violet"}>{product.trendScore}% Match</Badge></div></div><div className="text-right shrink-0 ml-2"><p className="text-xs text-gray-400">Profit</p><p className="text-xl font-bold text-emerald-400">${product.profit}</p></div></div>
              <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
                 {['TikTok', 'FB Ads'].map(p => <button key={p} className="text-[10px] flex items-center gap-1 text-gray-400 hover:text-white bg-white/5 px-2 py-1 rounded border border-white/5 hover:border-white/20 transition-all"><Eye size={10}/> Spy {p}</button>)}
                 <button onClick={() => setCalcId(calcId === product.id ? null : product.id)} className="text-[10px] flex items-center gap-1 text-violet-300 hover:text-violet-200 bg-violet-500/10 px-2 py-1 rounded border border-violet-500/20"><Calculator size={10}/> Profit Calc</button>
              </div>
              {calcId === product.id && <div className="animate-in slide-in-from-top-2 fade-in"><ProfitCalculator productPrice={product.price} sellingPrice={product.sellingPrice} /></div>}
              <div className="mt-4 flex gap-3">
                 <Button variant="secondary" className="px-4 py-2 text-xs h-9 flex-1" onClick={() => window.open(product.link, '_blank')}>Source</Button>
                 <Button variant="primary" className="px-4 py-2 text-xs h-9 flex-[2]" onClick={() => onAddToStore(product)}>+ Add to Store</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const StoreBuilderView = ({ selectedProducts }) => {
  const [storeName, setStoreName] = useState("");
  const [building, setBuilding] = useState(false);
  const [csvUrl, setCsvUrl] = useState(null);
  const [step, setStep] = useState(1); 

  const startBuild = () => {
    setBuilding(true);
    setTimeout(() => {
        const csv = DataService.generateShopifyCSV(selectedProducts.length > 0 ? selectedProducts : [{ name: "Demo", description: "Desc", sellingPrice: "29.99", image: "" }]);
        setCsvUrl(csv); setBuilding(false); setStep(3);
    }, 2000);
  };

  if (step === 3 && csvUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30"><CheckCircle size={48} className="text-white" /></div>
        <h2 className="text-4xl font-bold text-white mb-3">Ready to Launch!</h2>
        <p className="text-gray-400 mb-8 max-w-md text-lg">Your assets for <strong>{storeName}</strong> have been generated.</p>
        <div className="grid gap-4 w-full max-w-md">
            <a href={csvUrl} download="products.csv" className="w-full"><Button className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-500" icon={Download}>Download Shopify CSV</Button></a>
            <Button variant="secondary" icon={Download}>Download Logo Pack</Button>
            <Button variant="outline" onClick={() => { setCsvUrl(null); setStep(1); }}>Build Another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-center max-w-lg mx-auto p-4">
      {building ? <div className="text-center space-y-6"><Loader2 size={64} className="animate-spin text-violet-500 mx-auto" /><h3 className="text-2xl font-bold text-white">Compiling Assets...</h3></div> : (
        <Card className="p-8 space-y-8">
            {step === 1 && <div className="space-y-6 animate-in slide-in-from-right"><div><label className="block text-sm font-medium text-gray-400 mb-2">Store Name</label><input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="e.g. NovaDrops" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 outline-none text-lg" /></div><Button onClick={() => setStep(2)} disabled={!storeName} className="w-full py-4 text-lg">Next <ArrowRight size={20}/></Button></div>}
            {step === 2 && <div className="space-y-6 animate-in slide-in-from-right"><LogoGenerator storeName={storeName} /><div className="flex gap-4 mt-8"><Button variant="secondary" onClick={() => setStep(1)}>Back</Button><Button onClick={startBuild} className="w-full py-4 text-lg"><Zap size={20} className="fill-current" /> Build Now</Button></div></div>}
        </Card>
      )}
    </div>
  );
};

const MarketingHubView = () => {
  const [activeTool, setActiveTool] = useState("adcopy");
  const [inputVal, setInputVal] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = () => {
    if(!inputVal) return; setLoading(true);
    setTimeout(() => {
        let output = activeTool === "adcopy" ? `🔥 STOP SCROLLING! 🔥\n\nMeet the ${inputVal}.\n✅ Solves your problem instantly\n✅ 50% OFF - 24 Hours Only\n👇 Shop Now:` : `#${inputVal.replace(/\s/g, '')} #viral #fyp`;
        setResult(output); setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-white">Marketing Hub</h2>
      <div className="flex gap-2 p-1 bg-black/20 rounded-xl w-fit">
          {['adcopy', 'influencer', 'hashtags'].map(tool => (
              <button key={tool} onClick={() => {setActiveTool(tool); setResult("")}} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTool === tool ? "bg-violet-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}>{tool.toUpperCase()}</button>
          ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4"><div><label className="block text-sm text-gray-400 mb-2">Input</label><input value={inputVal} onChange={e => setInputVal(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white" placeholder="Product Name..."/></div><Button onClick={generate} isLoading={loading} className="w-full">Generate Content</Button></Card>
        <Card className="p-6 relative bg-black/30"><textarea readOnly value={result} className="w-full h-40 bg-transparent text-gray-300 resize-none outline-none" placeholder="AI Output..." />{result && <Button variant="secondary" className="absolute bottom-4 right-4 text-xs py-1 px-3" onClick={() => navigator.clipboard.writeText(result)}>Copy</Button>}</Card>
      </div>
    </div>
  );
};

const SettingsView = ({ isPro }) => {
    const [apiKey, setApiKey] = useState(localStorage.getItem('rapid_api_key') || '');
    return (
        <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <Card className="p-6"><h3 className="text-lg font-semibold text-white mb-4">API Configuration</h3><div className="bg-black/30 p-4 rounded-xl border border-white/10 space-y-4"><div><label className="block text-sm text-gray-400 mb-2">AliExpress (RapidAPI) Key</label><div className="flex gap-2"><input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Paste Key..." className="flex-1 bg-transparent border border-gray-600 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500" /><Button onClick={() => localStorage.setItem('rapid_api_key', apiKey)} className="py-2 text-sm">Save</Button></div></div></div></Card>
        </div>
    );
};

// --- MAIN LAYOUT ---
const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [storeProducts, setStoreProducts] = useState([]);
  const [roadmapProgress, setRoadmapProgress] = useState(0);

  const NavItem = ({ id, icon: Icon, label }) => (
    <button onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${activeTab === id ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
      <Icon size={20} className={activeTab === id ? "text-white" : "text-gray-500 group-hover:text-white transition-colors"} /> <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#0a0612] text-gray-100 font-sans overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a103c] via-[#0a0612] to-[#0a0612]">
      <aside className="hidden md:flex w-72 flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl z-20">
        <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 relative">
                <div className="absolute inset-0 bg-violet-500 blur-lg opacity-50 rounded-full"></div>
                <img src="/logo3.png" alt="Logo" className="relative z-10 w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">DropGenius</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4"><NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" /><NavItem id="roadmap" icon={Map} label="Launch Roadmap" /><NavItem id="finder" icon={Search} label="Product Hunter" /><NavItem id="builder" icon={ShoppingBag} label="Store Builder" /><NavItem id="marketing" icon={Megaphone} label="Marketing Hub" /><NavItem id="settings" icon={Settings} label="Settings" /></nav>
        <div className="p-4 border-t border-white/5">{!isPro && <div className="bg-gradient-to-br from-violet-900/50 to-fuchsia-900/50 p-5 rounded-2xl border border-white/10"><h4 className="font-bold text-white mb-1">Upgrade Plan</h4><p className="text-xs text-violet-200 mb-3">Unlock all AI features.</p><button onClick={() => setShowUpgradeModal(true)} className="w-full text-xs bg-white text-black font-bold py-2.5 rounded-lg hover:bg-gray-200 transition-colors">Go Pro</button></div>}</div>
      </aside>
      <div className="flex-1 flex flex-col h-full relative">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-black/20 backdrop-blur-md z-20">
            <div className="flex items-center gap-3"><img src="/logo3.png" className="w-8 h-8"/> <span className="font-bold text-lg">DropGenius</span></div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-300">{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
        {mobileMenuOpen && <div className="absolute inset-0 bg-black/95 z-30 p-6 space-y-2"><div className="flex justify-end mb-4"><button onClick={() => setMobileMenuOpen(false)}><X size={28} className="text-white"/></button></div><NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" /><NavItem id="roadmap" icon={Map} label="Launch Roadmap" /><NavItem id="finder" icon={Search} label="Product Hunter" /><NavItem id="builder" icon={ShoppingBag} label="Store Builder" /><NavItem id="marketing" icon={Megaphone} label="Marketing Hub" /></div>}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative"><div className="max-w-6xl mx-auto h-full">{(() => { switch(activeTab) { case "dashboard": return <DashboardView isPro={isPro} onUpgrade={() => setShowUpgradeModal(true)} roadmapProgress={roadmapProgress} />; case "roadmap": return <RoadmapView progress={roadmapProgress} setProgress={setRoadmapProgress} />; case "finder": return <ProductFinderView isPro={isPro} onUpgrade={() => setShowUpgradeModal(true)} onAddToStore={product => { setStoreProducts([...storeProducts, product]); alert("Added to Builder!"); }} />; case "builder": return <StoreBuilderView selectedProducts={storeProducts} />; case "marketing": return <MarketingHubView />; case "settings": return <SettingsView isPro={isPro} />; default: return <DashboardView isPro={isPro} onUpgrade={() => setShowUpgradeModal(true)} roadmapProgress={roadmapProgress} />; } })()}</div></main>
      </div>
      <PremiumModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
};

export default App;