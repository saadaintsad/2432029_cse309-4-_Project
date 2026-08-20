import React, { useState, useMemo, useEffect } from 'react';
import { 
  Menu, X, Home, PackageSearch, ClipboardList, 
  UserCircle, ShoppingBag, ChevronRight, CheckCircle2,
  Filter, AlertCircle, Store, Users, Lock, ArrowRight,
  Search, Copy, Check, LayoutDashboard, Package, 
  BookOpen, ReceiptText, Palette, Plus, Printer, 
  DollarSign, TrendingUp, TrendingDown, ArrowLeftRight, ShieldCheck,
  Eye, AlertTriangle, Phone, MapPin, SlidersHorizontal, FileText
} from 'lucide-react';

const INITIAL_INVENTORY = [
  { id: 1, variant: 'Poplin', color: 'White', sutaCount: '40x40', quantity: 1500, pricePerGoj: 45, location: 'Showroom' },
  { id: 2, variant: 'Poplin', color: 'Black', sutaCount: '40x40', quantity: 1200, pricePerGoj: 45, location: 'Warehouse' },
  { id: 3, variant: 'Voile', color: 'Navy Blue', sutaCount: '60x60', quantity: 900, pricePerGoj: 55, location: 'Showroom' },
  { id: 4, variant: 'Voile', color: 'Maroon', sutaCount: '60x60', quantity: 350, pricePerGoj: 55, location: 'Warehouse' },
  { id: 5, variant: 'Linen', color: 'Beige', sutaCount: '40x40', quantity: 850, pricePerGoj: 85, location: 'Showroom' },
  { id: 6, variant: 'Linen', color: 'Olive Green', sutaCount: '40x40', quantity: 280, pricePerGoj: 85, location: 'Warehouse' },
  { id: 7, variant: 'Bexi Voile', color: 'Sky Blue', sutaCount: '80x80', quantity: 2000, pricePerGoj: 75, location: 'Warehouse' },
  { id: 8, variant: 'Bexi Voile', color: 'Pink', sutaCount: '80x80', quantity: 1800, pricePerGoj: 75, location: 'Showroom' },
];

const INITIAL_ORDERS = [
  { 
    id: 'ORD-2026-10001', 
    customerName: 'Rahim Traders', 
    customerPhone: '01711000000', 
    date: '2026-06-25', 
    variant: 'Poplin', 
    color: 'White', 
    sutaCount: '40x40',
    quantityThan: 5, 
    totalGoj: 150, 
    totalAmount: 6750, 
    status: 'Delivered',
    note: 'Delivered to Islampur counter. Payment received in full.'
  },
  { 
    id: 'ORD-2026-10002', 
    customerName: 'Bhai Bhai Garments', 
    customerPhone: '01811000000', 
    date: '2026-06-28', 
    variant: 'Linen', 
    color: 'Beige', 
    sutaCount: '40x40',
    quantityThan: 2, 
    totalGoj: 60, 
    totalAmount: 5100, 
    status: 'Confirmed',
    note: 'Awaiting transport dispatch to Narayanganj.'
  },
  { 
    id: 'ORD-2026-10003', 
    customerName: 'Siddique Fabrics', 
    customerPhone: '01911000000', 
    date: '2026-07-02', 
    variant: 'Voile', 
    color: 'Navy Blue', 
    sutaCount: '60x60',
    quantityThan: 4, 
    totalGoj: 120, 
    totalAmount: 6600, 
    status: 'Pending',
    note: 'New online booking request.'
  },
];

const INITIAL_ACCOUNTS = [
  { id: 1, date: '2026-07-01', type: 'Income', amount: 45000, category: 'Sales', description: 'Sale to Rahim Traders' },
  { id: 2, date: '2026-07-01', type: 'Expense', amount: 1200, category: 'Utility', description: 'Electricity Bill' },
  { id: 3, date: '2026-06-30', type: 'Income', amount: 80000, category: 'Sales', description: 'Cash Sales' },
  { id: 4, date: '2026-06-30', type: 'Expense', amount: 5000, category: 'Wages', description: 'Staff Salary' },
];

const INITIAL_CUSTOMERS = [
  { id: 1, name: 'Rahim Traders', phone: '01711000000', address: 'Islampur, Dhaka' },
  { id: 2, name: 'Bhai Bhai Garments', phone: '01811000000', address: 'Narayanganj' },
  { id: 3, name: 'Siddique Fabrics', phone: '01911000000', address: 'Pabna' },
];

const INITIAL_PAYMENTS = [
  { id: 1, customerId: 1, date: '2026-06-25', type: 'Bill', amount: 150000, method: '-', note: 'Invoice #101' },
  { id: 2, customerId: 1, date: '2026-06-28', type: 'Payment', amount: 100000, method: 'Bank Transfer', note: 'Advance deposit' },
  { id: 3, customerId: 2, date: '2026-07-01', type: 'Bill', amount: 50000, method: '-', note: 'Invoice #102' },
];

const INITIAL_COLOR_SLIPS = [
  { id: 1, date: '2026-07-01', variant: 'Voile', quantity: 1000, colors: 'Red, Blue, Green', ratio: '2:2:1' },
  { id: 2, date: '2026-06-29', variant: 'Poplin', quantity: 500, colors: 'Black, White', ratio: '1:1' },
];

export default function App() {
  // Navigation State
  const [appMode, setAppMode] = useState('gateway'); // 'gateway', 'customer', 'admin'
  
  // Shared Data States
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [colorSlips, setColorSlips] = useState(INITIAL_COLOR_SLIPS);

  // Helper Functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(amount);
  };

  const handleCreateOrder = (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const handleAddInventory = (newItem) => {
    setInventory(prev => [newItem, ...prev]);
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* Top Universal Banner with Switcher & Admin Status */}
      {appMode !== 'gateway' && (
        <div className="bg-stone-900 text-stone-300 px-4 py-2 text-xs flex justify-between items-center border-b border-stone-800 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-stone-200">Active Mode:</span> 
            <span className="capitalize bg-stone-800 px-2 py-0.5 rounded text-amber-400 font-medium">{appMode} Portal</span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setAppMode(appMode === 'customer' ? 'admin' : 'customer')}
              className="hover:text-amber-400 flex items-center gap-1.5 transition-colors font-semibold text-amber-400 bg-stone-800 hover:bg-stone-700 px-2.5 py-1 rounded"
            >
              <ShieldCheck size={14} /> 
              <span>{appMode === 'customer' ? 'Switch to Admin Panel' : 'Switch to Customer View'}</span>
            </button>
            <span className="text-stone-700">|</span>
            <button 
              onClick={() => setAppMode('gateway')}
              className="hover:text-white transition-colors text-stone-400"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Render Selected View */}
      {appMode === 'gateway' && (
        <GatewayView onSelectMode={setAppMode} ordersCount={orders.length} stockCount={inventory.length} />
      )}

      {appMode === 'customer' && (
        <CustomerPortal 
          inventory={inventory}
          orders={orders}
          onCreateOrder={handleCreateOrder}
          onSwitchToAdmin={() => setAppMode('admin')}
          onBackToGateway={() => setAppMode('gateway')}
          formatCurrency={formatCurrency}
        />
      )}

      {appMode === 'admin' && (
        <AdminPortal 
          inventory={inventory}
          onAddInventory={handleAddInventory}
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          accounts={accounts}
          setAccounts={setAccounts}
          customers={customers}
          payments={payments}
          setPayments={setPayments}
          colorSlips={colorSlips}
          setColorSlips={setColorSlips}
          onSwitchToCustomer={() => setAppMode('customer')}
          onBackToGateway={() => setAppMode('gateway')}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

function GatewayView({ onSelectMode, ordersCount, stockCount }) {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-amber-700/5 -skew-y-6 transform origin-top-left -z-10"></div>
      
      <div className="text-center mb-10 animate-fade-in z-10 max-w-2xl">
        <div className="bg-amber-700 text-white p-5 rounded-2xl inline-block mb-6 shadow-xl shadow-amber-700/20">
          <Store size={48} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight mb-3">
          New N Islam Clothing
        </h1>
        <p className="text-stone-600 text-base sm:text-lg">
          Wholesale Fabric Management System — Islampur, Dhaka
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl z-10">
        {/* Customer Portal Selection */}
        <button 
          onClick={() => onSelectMode('customer')}
          className="group text-left bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-stone-200 hover:border-amber-500 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="bg-amber-100 text-amber-800 p-4 rounded-xl">
                <Users size={32} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider bg-stone-100 text-stone-600 px-3 py-1 rounded-full">
                Public Access
              </span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Customer Storefront</h2>
            <p className="text-stone-500 mb-6 leading-relaxed text-sm">
              Browse showroom fabric stock, place wholesale Than orders, and track live order status.
            </p>
          </div>
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-amber-700 font-semibold group-hover:translate-x-1 transition-transform">
            <span>Enter Customer Portal</span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </button>

        {/* Admin Portal Selection */}
        <button 
          onClick={() => onSelectMode('admin')}
          className="group text-left bg-stone-900 p-8 rounded-2xl shadow-sm hover:shadow-xl border border-stone-800 hover:border-stone-700 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="bg-stone-800 text-amber-400 p-4 rounded-xl">
                <ShieldCheck size={32} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full">
                Manager Access
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h2>
            <p className="text-stone-400 mb-6 leading-relaxed text-sm">
              Manage inventory, approve bookings, generate print memos, track ledgers, and dyeing color slips.
            </p>
          </div>
          <div className="pt-4 border-t border-stone-800 flex items-center justify-between text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
            <span>Enter Admin Panel</span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </button>
      </div>

      <div className="mt-12 text-center text-xs text-stone-400">
        Active Fabrics: <span className="font-semibold text-stone-700">{stockCount}</span> &bull; Active Bookings: <span className="font-semibold text-stone-700">{ordersCount}</span>
      </div>
    </div>
  );
}

function CustomerPortal({ inventory, orders, onCreateOrder, onSwitchToAdmin, onBackToGateway, formatCurrency }) {
  const [currentView, setCurrentView] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [preSelectedProduct, setPreSelectedProduct] = useState(null);

  const navigateTo = (view, product = null) => {
    if (product) setPreSelectedProduct(product);
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col">
      {/* Top Header / Navigation Bar with Admin Icon Button */}
      <nav className="bg-white shadow-sm border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => navigateTo('home')}>
              <ShoppingBag className="h-8 w-8 text-amber-700 mr-2" />
              <div>
                <h1 className="font-bold text-xl leading-tight text-stone-900">New N Islam</h1>
                <p className="text-xs text-stone-500 font-medium">Clothing Wholesale</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <NavButton icon={<Home size={18} />} label="Home" isActive={currentView === 'home'} onClick={() => navigateTo('home')} />
              <NavButton icon={<PackageSearch size={18} />} label="Browse Stock" isActive={currentView === 'browse'} onClick={() => navigateTo('browse')} />
              <NavButton icon={<ClipboardList size={18} />} label="My Orders" isActive={currentView === 'orders'} onClick={() => navigateTo('orders')} />
              <NavButton icon={<UserCircle size={18} />} label="Account Info" isActive={currentView === 'account'} onClick={() => navigateTo('account')} />
              
              <button 
                onClick={() => navigateTo('order')}
                className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm"
              >
                Place Order
              </button>

              {/* Admin Panel Top Icon Button */}
              <button
                onClick={onSwitchToAdmin}
                className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-amber-400 px-3 py-2 rounded-lg text-xs font-semibold transition-all border border-stone-800 shadow-sm group"
                title="Open Admin Dashboard"
              >
                <ShieldCheck size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Admin Panel</span>
              </button>
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center space-x-2 md:hidden">
              <button
                onClick={onSwitchToAdmin}
                className="p-2 bg-stone-900 text-amber-400 rounded-lg text-xs font-medium flex items-center gap-1"
                title="Admin Panel"
              >
                <ShieldCheck size={18} />
                <span className="text-[11px] font-bold">Admin</span>
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-stone-600 hover:text-stone-900 focus:outline-none p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-stone-200 absolute w-full shadow-lg">
            <div className="px-3 pt-2 pb-3 space-y-1">
              <MobileNavButton icon={<Home size={18} />} label="Home" isActive={currentView === 'home'} onClick={() => navigateTo('home')} />
              <MobileNavButton icon={<PackageSearch size={18} />} label="Browse Stock" isActive={currentView === 'browse'} onClick={() => navigateTo('browse')} />
              <MobileNavButton icon={<ClipboardList size={18} />} label="My Orders" isActive={currentView === 'orders'} onClick={() => navigateTo('orders')} />
              <MobileNavButton icon={<UserCircle size={18} />} label="Account Info" isActive={currentView === 'account'} onClick={() => navigateTo('account')} />
              
              <div className="pt-2 px-3 space-y-2">
                <button 
                  onClick={() => navigateTo('order')}
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex justify-center items-center"
                >
                  Place New Order
                </button>
                <button 
                  onClick={onSwitchToAdmin}
                  className="w-full bg-stone-900 text-amber-400 px-4 py-2.5 rounded-lg font-semibold flex justify-center items-center gap-2 text-sm"
                >
                  <ShieldCheck size={18} /> Open Admin Panel
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main View Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && <CustomerHomeView onNavigate={navigateTo} orders={orders} formatCurrency={formatCurrency} />}
        {currentView === 'browse' && <CustomerBrowseView inventory={inventory} onNavigate={navigateTo} formatCurrency={formatCurrency} />}
        {currentView === 'order' && <CustomerOrderFormView inventory={inventory} preSelected={preSelectedProduct} onSubmitOrder={onCreateOrder} onNavigate={navigateTo} formatCurrency={formatCurrency} />}
        {currentView === 'orders' && <CustomerOrdersView orders={orders} formatCurrency={formatCurrency} />}
        {currentView === 'account' && <CustomerAccountView formatCurrency={formatCurrency} />}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-6 text-center border-t border-stone-800">
        <p className="text-sm font-medium">© {new Date().getFullYear()} New N Islam Clothing. All rights reserved.</p>
        <p className="text-xs mt-1 text-stone-500">Islampur Fabric Market, Dhaka, Bangladesh</p>
      </footer>
    </div>
  );
}

function CustomerHomeView({ onNavigate, orders, formatCurrency }) {
  const [trackCode, setTrackCode] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');

  const handleTrack = () => {
    const cleanCode = trackCode.trim().toLowerCase();
    const found = orders.find(o => o.id.toLowerCase() === cleanCode);
    if (found) {
      setTrackResult(found);
      setTrackError('');
    } else {
      setTrackResult(null);
      setTrackError('Order code not found. Please check your order code (e.g. ORD-2026-10001) and try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
      <div className="bg-amber-100/70 p-5 rounded-full mb-6 text-amber-800">
        <ShoppingBag className="h-14 w-14" />
      </div>
      <h2 className="text-3xl sm:text-5xl font-extrabold text-stone-900 mb-4 tracking-tight">
        সাশ্রয়ী দামে প্রিমিয়াম পাইকারি কাপড়
      </h2>
      <p className="text-base sm:text-lg text-stone-600 max-w-2xl mb-8 leading-relaxed">
        ইসলামপুরের শতভাগ মানসম্মত পপলিন, ভয়েল, লিনেন ও বেক্সি ভয়েল কাপড়ের পাইকারি বুকিং ও সার্বক্ষণিক স্টক আপডেট।
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <button 
          onClick={() => onNavigate('browse')}
          className="flex items-center justify-center bg-white border-2 border-stone-300 hover:border-amber-700 hover:text-amber-700 text-stone-800 px-8 py-3 rounded-xl font-semibold transition-all shadow-sm"
        >
          Browse Stock Catalog
        </button>
        <button 
          onClick={() => onNavigate('order')}
          className="flex items-center justify-center bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-md"
        >
          Book Wholesale Order <ChevronRight className="ml-2 h-5 w-5" />
        </button>
      </div>

      {/* Tracker Module */}
      <div className="mt-12 w-full max-w-3xl mx-auto bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm text-left">
        <div className="flex items-start mb-6">
          <div className="bg-stone-100 p-3.5 rounded-xl mr-4 text-stone-700 flex-shrink-0">
            <Search size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900">Track Order Booking</h3>
            <p className="text-stone-500 text-sm mt-1">Enter your tracking code (e.g., ORD-2026-10001) to verify current status.</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="ENTER ORDER CODE..." 
            value={trackCode}
            onChange={(e) => setTrackCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            className="flex-grow bg-white border border-stone-300 text-stone-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase font-mono text-sm"
          />
          <button 
            onClick={handleTrack}
            disabled={!trackCode.trim()}
            className="bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors whitespace-nowrap"
          >
            Track Status
          </button>
        </div>

        {trackResult && (
          <div className="mt-6 p-5 bg-stone-50 border border-stone-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="font-bold text-stone-900 text-lg">{trackResult.variant} ({trackResult.color})</p>
              <p className="text-sm text-stone-500 mt-1">
                Date: {trackResult.date} &bull; Qty: {trackResult.quantityThan} Than ({trackResult.totalGoj} Goj)
              </p>
              <p className="text-sm font-semibold text-amber-700 mt-1">{formatCurrency(trackResult.totalAmount)}</p>
              {trackResult.note && <p className="text-xs text-stone-500 italic mt-2">Note: {trackResult.note}</p>}
            </div>
            <StatusBadge status={trackResult.status} />
          </div>
        )}
        
        {trackError && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center">
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">{trackError}</span>
          </div>
        )}
      </div>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left">
        <FeatureCard 
          title="Yarn Count Assured" 
          description="Strict quality assurance on thread count ($40\times40$, $60\times60$, $80\times80$)."
        />
        <FeatureCard 
          title="Direct Islampur Rates" 
          description="Wholesale market pricing directly from showroom & warehouse inventory."
        />
        <FeatureCard 
          title="Instant Online Booking" 
          description="Book in Than units directly online and track order fulfillment."
        />
      </div>
    </div>
  );
}

function CustomerBrowseView({ inventory, onNavigate, formatCurrency }) {
  const [filterVariant, setFilterVariant] = useState('All');
  const [filterColor, setFilterColor] = useState('All');

  const variants = ['All', ...new Set(inventory.map(p => p.variant))];
  const colors = ['All', ...new Set(inventory.map(p => p.color))];

  const filteredProducts = useMemo(() => {
    return inventory.filter(product => {
      const matchVariant = filterVariant === 'All' || product.variant === filterVariant;
      const matchColor = filterColor === 'All' || product.color === filterColor;
      return matchVariant && matchColor;
    });
  }, [inventory, filterVariant, filterColor]);

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Showroom & Warehouse Inventory</h2>
          <p className="text-stone-500 mt-1 text-sm">Real-time stock catalog available for bulk booking.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl shadow-sm border border-stone-200">
          <div className="flex items-center text-stone-500 mr-2 hidden sm:flex text-sm font-medium">
            <Filter size={16} className="mr-1" /> Filter:
          </div>
          <select 
            className="bg-stone-50 border border-stone-200 text-stone-700 text-sm rounded-lg p-2 focus:ring-amber-500"
            value={filterVariant}
            onChange={(e) => setFilterVariant(e.target.value)}
          >
            {variants.map(v => <option key={v} value={v}>{v} Variant</option>)}
          </select>
          <select 
            className="bg-stone-50 border border-stone-200 text-stone-700 text-sm rounded-lg p-2 focus:ring-amber-500"
            value={filterColor}
            onChange={(e) => setFilterColor(e.target.value)}
          >
            {colors.map(c => <option key={c} value={c}>{c} Color</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="h-36 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center relative p-4">
                <span className="font-black text-stone-300 text-2xl uppercase tracking-widest">{product.variant}</span>
                <div className="absolute bottom-2 right-2 bg-amber-700 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
                  {formatCurrency(product.pricePerGoj)} / Goj
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-stone-900">{product.variant}</h3>
                  <span className="bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded-md font-mono font-semibold">
                    {product.sutaCount}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm text-stone-600 mb-4">
                  <p><span className="font-medium text-stone-800">Color:</span> {product.color}</p>
                  <p><span className="font-medium text-stone-800">In Stock:</span> {product.quantity.toLocaleString()} Goj</p>
                  <p><span className="font-medium text-stone-800">Location:</span> {product.location}</p>
                </div>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button 
                onClick={() => onNavigate('order', product)}
                className="w-full bg-stone-900 hover:bg-amber-700 text-white py-2.5 rounded-xl transition-colors text-sm font-semibold"
              >
                Book Wholesale Than
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomerOrderFormView({ inventory, preSelected, onSubmitOrder, onNavigate, formatCurrency }) {
  const [selectedProductId, setSelectedProductId] = useState(preSelected ? preSelected.id : (inventory[0]?.id || ''));
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [quantityThan, setQuantityThan] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  const selectedProduct = inventory.find(p => p.id === Number(selectedProductId));
  const totalGoj = quantityThan * 30; // 1 Than = 30 Goj
  const estimatedTotal = selectedProduct ? totalGoj * selectedProduct.pricePerGoj : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct || quantityThan < 1) return;

    setIsSubmitting(true);
    
    setTimeout(() => {
      const generatedId = `ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const newOrder = {
        id: generatedId,
        customerName: customerName || 'Direct Wholesale Buyer',
        customerPhone: customerPhone || 'Not provided',
        date: new Date().toISOString().split('T')[0],
        variant: selectedProduct.variant,
        color: selectedProduct.color,
        sutaCount: selectedProduct.sutaCount,
        quantityThan: quantityThan,
        totalGoj: totalGoj,
        totalAmount: estimatedTotal,
        status: 'Pending',
        note: 'Online booking via customer storefront'
      };
      
      setIsSubmitting(false);
      onSubmitOrder(newOrder);
      setSubmittedOrder(newOrder);
    }, 500);
  };

  const handleCopy = () => {
    if (!submittedOrder) return;
    navigator.clipboard.writeText(submittedOrder.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (submittedOrder) {
    return (
      <div className="max-w-lg mx-auto bg-white border border-stone-200 rounded-2xl p-8 shadow-sm text-center animate-fade-in my-6">
        <div className="bg-emerald-100 text-emerald-600 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={32} strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Order Booking Received!</h2>
        <p className="text-stone-500 mb-8 text-sm">
          Your booking is now recorded in our admin system and pending dispatch review.
        </p>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 mb-8 text-left">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Your Order Code</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-2xl font-extrabold text-stone-900 font-mono">
              {submittedOrder.id}
            </span>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-stone-700 text-xs font-medium shadow-sm"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <button 
          onClick={() => onNavigate('orders')}
          className="bg-amber-700 hover:bg-amber-800 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-sm w-full"
        >
          View All My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900">Wholesale Fabric Booking</h2>
        <p className="text-stone-500 text-sm mt-1">Select fabric specification and enter total Than unit quantity.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-stone-200 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Customer / Shop Name</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Rahim Clothing" 
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)} 
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Contact Phone Number</label>
            <input 
              type="tel" 
              required 
              placeholder="e.g. 01711000000" 
              value={customerPhone} 
              onChange={e => setCustomerPhone(e.target.value)} 
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Select Fabric Variant & Color</label>
          <select 
            required
            className="w-full bg-stone-50 border border-stone-300 text-stone-900 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            {inventory.map(p => (
              <option key={p.id} value={p.id}>
                {p.variant} - {p.color} ({p.sutaCount}) — ৳{p.pricePerGoj}/Goj
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-sm space-y-2">
            <h4 className="font-semibold text-stone-800">Fabric Specifications</h4>
            <div className="grid grid-cols-2 gap-2 text-stone-600">
              <div>Variant: <span className="font-medium text-stone-900">{selectedProduct.variant}</span></div>
              <div>Color: <span className="font-medium text-stone-900">{selectedProduct.color}</span></div>
              <div>Yarn Count: <span className="font-medium text-stone-900">{selectedProduct.sutaCount}</span></div>
              <div>Rate: <span className="font-medium text-amber-700">৳{selectedProduct.pricePerGoj} / Goj</span></div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Quantity in Than (Rolls)
            <span className="text-stone-400 font-normal ml-2 text-xs">(Standard 1 Than = 30 Goj)</span>
          </label>
          <div className="flex items-center">
            <button 
              type="button"
              onClick={() => setQuantityThan(Math.max(1, quantityThan - 1))}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-4 py-3 rounded-l-xl border border-stone-300 font-bold"
            >-</button>
            <input 
              type="number" 
              min="1" 
              required
              value={quantityThan}
              onChange={(e) => setQuantityThan(parseInt(e.target.value) || 1)}
              className="w-24 text-center bg-white border-y border-stone-300 text-stone-900 py-3 font-semibold focus:outline-none"
            />
            <button 
              type="button"
              onClick={() => setQuantityThan(quantityThan + 1)}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-4 py-3 rounded-r-xl border border-stone-300 font-bold"
            >+</button>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-4 space-y-2">
          <div className="flex justify-between text-stone-600 text-sm">
            <span>Calculated Total Yardage:</span>
            <span className="font-semibold text-stone-900">{totalGoj} Goj</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-stone-900">
            <span>Estimated Billing Amount:</span>
            <span className="text-amber-700">{formatCurrency(estimatedTotal)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => onNavigate('browse')}
            className="flex-1 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 py-3 rounded-xl font-medium transition-colors"
          >
            Back
          </button>
          <button 
            type="submit"
            disabled={!selectedProduct || isSubmitting}
            className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors shadow-sm"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Wholesale Order'}
          </button>
        </div>
      </form>
    </div>
  );
}

function CustomerOrdersView({ orders, formatCurrency }) {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900">My Wholesale Bookings</h2>
        <p className="text-stone-500 text-sm mt-1">Real-time status updates from management.</p>
      </div>

      <div className="bg-white shadow-sm border border-stone-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-xs tracking-wider">
                <th className="p-4 font-semibold">Order Code</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Fabric Variant</th>
                <th className="p-4 font-semibold">Quantity</th>
                <th className="p-4 font-semibold text-right">Total Price</th>
                <th className="p-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4 font-bold text-stone-900 font-mono">{order.id}</td>
                  <td className="p-4 text-stone-600">{order.date}</td>
                  <td className="p-4 text-stone-900 font-medium">
                    {order.variant} ({order.color})
                  </td>
                  <td className="p-4 text-stone-600">
                    <div>{order.quantityThan} Than</div>
                    <div className="text-xs text-stone-400">({order.totalGoj} Goj)</div>
                  </td>
                  <td className="p-4 text-right font-bold text-stone-900">{formatCurrency(order.totalAmount)}</td>
                  <td className="p-4 text-center">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CustomerAccountView({ formatCurrency }) {
  const accountSummary = {
    totalBilled: 125000,
    totalPaid: 95000,
    remainingDue: 30000,
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Wholesale Account Ledger</h2>
        <p className="text-stone-500 text-sm mt-1">Summary of billed orders and payments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-stone-400 font-semibold uppercase text-xs tracking-wider mb-2">Total Billed</div>
          <div className="text-3xl font-extrabold text-stone-800">{formatCurrency(accountSummary.totalBilled)}</div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-stone-400 font-semibold uppercase text-xs tracking-wider mb-2">Total Paid</div>
          <div className="text-3xl font-extrabold text-emerald-600">{formatCurrency(accountSummary.totalPaid)}</div>
        </div>

        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-sm">
          <div className="text-amber-800 font-semibold uppercase text-xs tracking-wider mb-2">Remaining Due</div>
          <div className="text-3xl font-extrabold text-amber-900">{formatCurrency(accountSummary.remainingDue)}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <h3 className="font-bold text-lg text-stone-900 flex items-center">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2" />
          Payment Settlement Guide
        </h3>
        <p className="text-stone-600 text-sm leading-relaxed">
          Payments can be settled directly at our Islampur counter or via direct bank transfer. Always mention your Customer Name or Order Code for immediate ledger credit.
        </p>
      </div>
    </div>
  );
}

function AdminPortal({ 
  inventory, 
  onAddInventory, 
  orders, 
  onUpdateOrderStatus, 
  accounts, 
  setAccounts, 
  customers, 
  payments, 
  setPayments, 
  colorSlips, 
  setColorSlips, 
  onSwitchToCustomer, 
  onBackToGateway, 
  formatCurrency 
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Customer Bookings', icon: ShoppingBag, badge: orders.filter(o => o.status === 'Pending').length },
    { id: 'inventory', label: 'Inventory & Stock', icon: Package },
    { id: 'accounts', label: 'Financial Accounts', icon: BookOpen },
    { id: 'memo', label: 'Print Cash Memo', icon: ReceiptText },
    { id: 'colors', label: 'Dyeing Color Slips', icon: Palette },
    { id: 'customers', label: 'Customer Ledgers', icon: Users },
  ];

  return (
    <div className="flex h-[calc(100vh-33px)] bg-slate-100 text-slate-900 overflow-hidden">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden print:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out print:hidden flex flex-col justify-between
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          <div className="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="text-amber-400 h-6 w-6" />
              <span className="text-lg font-bold tracking-wide text-white">New N Islam</span>
            </div>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          
          <div className="px-4 py-3">
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider px-2">Manager Control Panel</p>
          </div>

          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-amber-600 text-white shadow-sm' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <div className="flex items-center">
                    <Icon size={18} className="mr-3" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-amber-500 text-slate-950 font-extrabold text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button 
            onClick={onSwitchToCustomer}
            className="w-full text-xs bg-stone-800 hover:bg-stone-700 text-amber-300 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Users size={14} /> Open Customer Storefront
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full print:w-full print:absolute print:inset-0">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 flex-shrink-0 print:hidden">
          <div className="flex items-center">
            <button 
              className="md:hidden text-slate-600 hover:text-slate-900 mr-4"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-900">
              {navItems.find(item => item.id === activeTab)?.label}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onSwitchToCustomer}
              className="hidden sm:flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-300"
            >
              <Store size={14} /> Storefront
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shadow-sm">
              ADM
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 print:p-0">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <AdminDashboardView 
                inventory={inventory} 
                orders={orders} 
                accounts={accounts} 
                payments={payments} 
                formatCurrency={formatCurrency}
                onSelectOrder={setSelectedOrderModal}
              />
            )}
            {activeTab === 'bookings' && (
              <AdminBookingsView 
                orders={orders} 
                onUpdateOrderStatus={onUpdateOrderStatus} 
                formatCurrency={formatCurrency}
                onSelectOrder={setSelectedOrderModal}
              />
            )}
            {activeTab === 'inventory' && <AdminInventoryView inventory={inventory} onAddInventory={onAddInventory} />}
            {activeTab === 'accounts' && <AdminAccountsView accounts={accounts} setAccounts={setAccounts} formatCurrency={formatCurrency} />}
            {activeTab === 'memo' && <AdminCashMemoView formatCurrency={formatCurrency} />}
            {activeTab === 'colors' && <AdminColorSlipsView colorSlips={colorSlips} setColorSlips={setColorSlips} />}
            {activeTab === 'customers' && <AdminCustomersView customers={customers} payments={payments} setPayments={setPayments} formatCurrency={formatCurrency} />}
          </div>
        </main>
      </div>

      {/* Order Detail Modal */}
      {selectedOrderModal && (
        <OrderDetailModal 
          order={selectedOrderModal} 
          onClose={() => setSelectedOrderModal(null)} 
          onUpdateOrderStatus={onUpdateOrderStatus}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

function AdminDashboardView({ inventory, orders, accounts, payments, formatCurrency, onSelectOrder }) {
  const totalStockGoj = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventory.filter(i => i.quantity < 500);
  const todaySales = accounts.filter(a => a.type === 'Income').reduce((sum, a) => sum + a.amount, 0);
  
  let totalBilled = 0;
  let totalPaid = 0;
  payments.forEach(p => {
    if (p.type === 'Bill') totalBilled += p.amount;
    if (p.type === 'Payment') totalPaid += p.amount;
  });
  const totalReceivables = totalBilled - totalPaid;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl"><Package size={24} /></div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Available Yardage</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalStockGoj.toLocaleString()} <span className="text-xs font-normal text-slate-500">Goj</span></h3>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp size={24} /></div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Recorded Revenue</p>
            <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(todaySales)}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl"><AlertCircle size={24} /></div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Accounts Receivable</p>
            <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalReceivables)}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl"><ShoppingBag size={24} /></div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Pending Orders</p>
            <h3 className="text-2xl font-bold text-slate-900">{orders.filter(o => o.status === 'Pending').length}</h3>
          </div>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="text-amber-600 h-6 w-6 flex-shrink-0" />
            <div>
              <p className="font-bold text-amber-900 text-sm">Low Stock Inventory Alert</p>
              <p className="text-xs text-amber-700">{lowStockItems.length} fabric variants are running low (&lt; 500 Goj remaining).</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-amber-200 text-amber-900 px-3 py-1 rounded-lg">
            {lowStockItems.map(i => `${i.variant} (${i.color})`).join(', ')}
          </span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Recent Booking Requests</h3>
          <span className="text-xs text-slate-500">Click any order to view details</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-semibold">Code</th>
                <th className="px-6 py-3 font-semibold">Customer</th>
                <th className="px-6 py-3 font-semibold">Fabric</th>
                <th className="px-6 py-3 font-semibold">Amount</th>
                <th className="px-6 py-3 font-semibold text-center">Status</th>
                <th className="px-6 py-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 5).map(ord => (
                <tr key={ord.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3.5 font-mono font-bold text-slate-900">{ord.id}</td>
                  <td className="px-6 py-3.5">{ord.customerName}</td>
                  <td className="px-6 py-3.5 font-medium">{ord.variant} ({ord.color})</td>
                  <td className="px-6 py-3.5 font-bold text-slate-900">{formatCurrency(ord.totalAmount)}</td>
                  <td className="px-6 py-3.5 text-center">
                    <StatusBadge status={ord.status} />
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <button 
                      onClick={() => onSelectOrder(ord)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminBookingsView({ orders, onUpdateOrderStatus, formatCurrency, onSelectOrder }) {
  const [filter, setFilter] = useState('All');

  const filteredOrders = filter === 'All' 
    ? orders 
    : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage Customer Bookings</h2>
          <p className="text-slate-500 text-sm">Approve orders, adjust status, and inspect customer details.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Filter Status:</span>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg p-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
          >
            <option value="All">All Statuses ({orders.length})</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Delivered">Delivered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Order Code</th>
                <th className="px-6 py-3.5 font-semibold">Customer Info</th>
                <th className="px-6 py-3.5 font-semibold">Fabric Specs</th>
                <th className="px-6 py-3.5 font-semibold">Quantity</th>
                <th className="px-6 py-3.5 font-semibold text-right">Total Price</th>
                <th className="px-6 py-3.5 font-semibold text-center">Status</th>
                <th className="px-6 py-3.5 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">No orders match filter criteria.</td>
                </tr>
              ) : (
                filteredOrders.map(ord => (
                  <tr key={ord.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{ord.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{ord.customerName}</div>
                      <div className="text-xs text-slate-500">{ord.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{ord.variant} ({ord.color})</div>
                      <div className="text-xs text-slate-400">{ord.sutaCount}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{ord.quantityThan} Than</div>
                      <div className="text-xs text-slate-400">({ord.totalGoj} Goj)</div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={ord.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <select 
                          value={ord.status}
                          onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value)}
                          className="bg-stone-50 border border-slate-300 rounded-lg p-1.5 text-xs font-semibold cursor-pointer focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <button 
                          onClick={() => onSelectOrder(ord)}
                          className="p-1.5 bg-slate-900 text-amber-400 hover:bg-slate-800 rounded-lg text-xs font-semibold"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose, onUpdateOrderStatus, formatCurrency }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl animate-fade-in space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <p className="text-xs text-slate-400 uppercase font-mono font-bold">Order Details</p>
            <h3 className="text-xl font-bold text-slate-900 font-mono">{order.id}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Customer Name</p>
              <p className="font-bold text-slate-900">{order.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Phone Number</p>
              <p className="font-bold text-slate-900">{order.customerPhone}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Order Date</p>
              <p className="font-semibold text-slate-800">{order.date}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Status</p>
              <StatusBadge status={order.status} />
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2">
            <h4 className="font-bold text-amber-900 text-sm">Fabric Specification & Quantity</h4>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <p>Variant: <span className="font-bold text-slate-900">{order.variant}</span></p>
              <p>Color: <span className="font-bold text-slate-900">{order.color}</span></p>
              <p>Yarn Count: <span className="font-mono font-bold">{order.sutaCount}</span></p>
              <p>Total Quantity: <span className="font-bold">{order.quantityThan} Than ({order.totalGoj} Goj)</span></p>
            </div>
            <div className="border-t border-amber-200 pt-2 flex justify-between font-bold text-amber-950">
              <span>Total Billing Amount:</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {order.note && (
            <div className="text-xs text-slate-500 bg-slate-100 p-3 rounded-lg italic">
              <strong>Order Note:</strong> {order.note}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600">Quick Update Status:</label>
            <div className="grid grid-cols-4 gap-2">
              {['Pending', 'Confirmed', 'Delivered', 'Rejected'].map(s => (
                <button
                  key={s}
                  onClick={() => {
                    onUpdateOrderStatus(order.id, s);
                    onClose();
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-colors ${order.status === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-semibold text-sm"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminInventoryView({ inventory, onAddInventory }) {
  const [formData, setFormData] = useState({ 
    variant: 'Poplin', 
    color: '', 
    sutaCount: '40x40', 
    quantity: '', 
    pricePerGoj: '',
    location: 'Warehouse' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.color || !formData.quantity || !formData.pricePerGoj) return;
    onAddInventory({
      id: Date.now(),
      variant: formData.variant,
      color: formData.color,
      sutaCount: formData.sutaCount,
      quantity: Number(formData.quantity),
      pricePerGoj: Number(formData.pricePerGoj),
      location: formData.location
    });
    setFormData({ variant: 'Poplin', color: '', sutaCount: '40x40', quantity: '', pricePerGoj: '', location: 'Warehouse' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900">Stock & Inventory Management</h2>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-4">Add Fabric Stock Run</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Variant</label>
            <select className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={formData.variant} onChange={e => setFormData({...formData, variant: e.target.value})}>
              <option>Poplin</option>
              <option>Voile</option>
              <option>Linen</option>
              <option>Bexi Voile</option>
              <option>Polestar</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Color Name</label>
            <input required type="text" placeholder="e.g. Off-White" className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Yarn Count</label>
            <input required type="text" placeholder="e.g. 60x60" className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={formData.sutaCount} onChange={e => setFormData({...formData, sutaCount: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Qty (Goj)</label>
            <input required type="number" min="1" placeholder="1000" className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Price / Goj (৳)</label>
            <input required type="number" min="1" placeholder="60" className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={formData.pricePerGoj} onChange={e => setFormData({...formData, pricePerGoj: e.target.value})} />
          </div>
          <div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-amber-700 text-white p-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center">
              <Plus size={16} className="mr-1" /> Add Stock
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Variant</th>
                <th className="px-6 py-3.5 font-semibold">Color</th>
                <th className="px-6 py-3.5 font-semibold">Yarn Count</th>
                <th className="px-6 py-3.5 font-semibold text-right">Available (Goj)</th>
                <th className="px-6 py-3.5 font-semibold text-right">Rate / Goj</th>
                <th className="px-6 py-3.5 font-semibold">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3.5 font-bold text-slate-900">{item.variant}</td>
                  <td className="px-6 py-3.5">{item.color}</td>
                  <td className="px-6 py-3.5 text-slate-500 font-mono">{item.sutaCount}</td>
                  <td className="px-6 py-3.5 text-right font-semibold text-slate-900">
                    {item.quantity.toLocaleString()} Goj
                    {item.quantity < 500 && (
                      <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">LOW</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right font-bold text-amber-700">৳{item.pricePerGoj}</td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${item.location === 'Showroom' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                      {item.location}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminAccountsView({ accounts, setAccounts, formatCurrency }) {
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], type: 'Income', amount: '', description: '' });

  const totalIncome = accounts.filter(a => a.type === 'Income').reduce((sum, a) => sum + a.amount, 0);
  const totalExpense = accounts.filter(a => a.type === 'Expense').reduce((sum, a) => sum + a.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    setAccounts([{ id: Date.now(), ...formData, amount: Number(formData.amount) }, ...accounts]);
    setFormData({ ...formData, amount: '', description: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900">Financial Ledger & Expenses</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold uppercase text-slate-500">Total Income</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalIncome)}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100 border-l-4 border-l-red-500">
          <p className="text-xs font-semibold uppercase text-slate-500">Total Expenses</p>
          <h3 className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalExpense)}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-slate-800">
          <p className="text-xs font-semibold uppercase text-slate-500">Net Balance / Profit</p>
          <h3 className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
            {formatCurrency(netProfit)}
          </h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-4">Record Financial Entry</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
            <input required type="date" className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Transaction Type</label>
            <select className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option>Income</option>
              <option>Expense</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <input required type="text" placeholder="e.g. Fabric sale / Factory dyeing charge" className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (৳)</label>
            <input required type="number" min="1" placeholder="0" className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          <div className="md:col-span-5 flex justify-end">
            <button type="submit" className="bg-slate-900 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              Record Transaction
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Date</th>
                <th className="px-6 py-3.5 font-semibold">Description</th>
                <th className="px-6 py-3.5 font-semibold">Type</th>
                <th className="px-6 py-3.5 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3.5 text-slate-600">{acc.date}</td>
                  <td className="px-6 py-3.5 text-slate-900 font-medium">{acc.description}</td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${acc.type === 'Income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {acc.type}
                    </span>
                  </td>
                  <td className={`px-6 py-3.5 text-right font-bold ${acc.type === 'Income' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(acc.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminCashMemoView({ formatCurrency }) {
  const [memoData, setMemoData] = useState({
    customerName: 'Rahim Traders',
    date: new Date().toISOString().split('T')[0],
    items: [{ variant: 'Poplin', color: 'White', thanQty: '5', gojPerThan: '30', pricePerGoj: '45' }]
  });

  const calculateItemTotal = (item) => {
    const totalGoj = (Number(item.thanQty) || 0) * (Number(item.gojPerThan) || 0);
    return totalGoj * (Number(item.pricePerGoj) || 0);
  };

  const grandTotal = memoData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  const addItem = () => {
    setMemoData({
      ...memoData,
      items: [...memoData.items, { variant: 'Voile', color: 'Navy Blue', thanQty: '2', gojPerThan: '30', pricePerGoj: '55' }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...memoData.items];
    newItems[index][field] = value;
    setMemoData({ ...memoData, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = [...memoData.items];
    newItems.splice(index, 1);
    setMemoData({ ...memoData, items: newItems });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="print:hidden">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Cash Memo Invoice Generator</h2>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Customer / Party Name</label>
              <input type="text" className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={memoData.customerName} onChange={e => setMemoData({...memoData, customerName: e.target.value})} placeholder="Customer name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Invoice Date</label>
              <input type="date" className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={memoData.date} onChange={e => setMemoData({...memoData, date: e.target.value})} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800 border-b pb-2">Line Items</h4>
            {memoData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Variant</label>
                  <input type="text" className="w-full text-sm border-slate-300 rounded-lg border p-2" value={item.variant} onChange={e => updateItem(index, 'variant', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Color</label>
                  <input type="text" className="w-full text-sm border-slate-300 rounded-lg border p-2" value={item.color} onChange={e => updateItem(index, 'color', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Qty (Than)</label>
                  <input type="number" min="1" className="w-full text-sm border-slate-300 rounded-lg border p-2" value={item.thanQty} onChange={e => updateItem(index, 'thanQty', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Goj / Than</label>
                  <input type="number" min="1" className="w-full text-sm border-slate-300 rounded-lg border p-2" value={item.gojPerThan} onChange={e => updateItem(index, 'gojPerThan', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Rate / Goj (৳)</label>
                  <input type="number" min="1" className="w-full text-sm border-slate-300 rounded-lg border p-2" value={item.pricePerGoj} onChange={e => updateItem(index, 'pricePerGoj', e.target.value)} />
                </div>
                <div className="md:col-span-1 flex items-center justify-center pb-2 font-bold text-sm text-slate-900">
                  {formatCurrency(calculateItemTotal(item))}
                </div>
                <div className="md:col-span-1 text-right pb-1">
                  {memoData.items.length > 1 && (
                    <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-1">
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button onClick={addItem} className="text-sm text-amber-700 font-semibold flex items-center hover:text-amber-800">
              <Plus size={16} className="mr-1" /> Add Line Item
            </button>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 flex items-center transition-colors font-semibold">
              <Printer size={18} className="mr-2" /> Print Cash Memo
            </button>
          </div>
        </div>
      </div>

      {/* Printable Invoice */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
        <div className="text-center mb-8 border-b-2 border-slate-900 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 uppercase tracking-wider">New N Islam Clothing</h1>
          <p className="text-slate-600 font-medium mt-1">Wholesale Yardage Cloth Merchants</p>
          <p className="text-slate-500 text-xs mt-0.5">Islampur, Dhaka, Bangladesh</p>
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Billed To:</p>
            <h3 className="text-lg font-bold text-slate-900">{memoData.customerName || 'Direct Customer'}</h3>
          </div>
          <div className="text-right">
            <p className="text-slate-600 text-sm">Date: <span className="font-semibold text-slate-900">{memoData.date}</span></p>
            <p className="text-slate-600 text-sm mt-0.5">Memo #: <span className="font-mono font-bold text-slate-900">10092</span></p>
          </div>
        </div>

        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-4 py-2 font-semibold text-xs text-slate-700">SL</th>
              <th className="border border-slate-300 px-4 py-2 font-semibold text-xs text-slate-700">Fabric Description</th>
              <th className="border border-slate-300 px-4 py-2 font-semibold text-xs text-slate-700 text-center">Total Goj</th>
              <th className="border border-slate-300 px-4 py-2 font-semibold text-xs text-slate-700 text-right">Rate/Goj</th>
              <th className="border border-slate-300 px-4 py-2 font-semibold text-xs text-slate-700 text-right">Amount (৳)</th>
            </tr>
          </thead>
          <tbody>
            {memoData.items.map((item, idx) => {
              const totalGoj = (Number(item.thanQty) || 0) * (Number(item.gojPerThan) || 0);
              return (
                <tr key={idx}>
                  <td className="border border-slate-300 px-4 py-2.5 text-sm text-center">{idx + 1}</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-sm font-medium">{item.variant} - {item.color}</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-sm text-center">
                    {totalGoj} Goj <span className="text-xs text-slate-400">({item.thanQty} Than x {item.gojPerThan})</span>
                  </td>
                  <td className="border border-slate-300 px-4 py-2.5 text-sm text-right">৳{item.pricePerGoj}</td>
                  <td className="border border-slate-300 px-4 py-2.5 text-sm text-right font-bold">{calculateItemTotal(item).toLocaleString()}</td>
                </tr>
              );
            })}
            <tr>
              <td colSpan="4" className="border border-slate-300 px-4 py-3 text-right font-extrabold text-slate-900">Grand Total</td>
              <td className="border border-slate-300 px-4 py-3 text-right font-extrabold text-amber-700 text-lg">৳ {grandTotal.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-between mt-16 pt-8">
          <div className="border-t border-slate-400 pt-2 text-center w-48 text-xs text-slate-600">Customer Signature</div>
          <div className="border-t border-slate-400 pt-2 text-center w-48 text-xs text-slate-600">Authorized Signature</div>
        </div>
      </div>
    </div>
  );
}

function AdminColorSlipsView({ colorSlips, setColorSlips }) {
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], variant: 'Voile', quantity: '', colors: '', ratio: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.quantity || !formData.colors) return;
    setColorSlips([{ id: Date.now(), ...formData, quantity: Number(formData.quantity) }, ...colorSlips]);
    setFormData({ date: new Date().toISOString().split('T')[0], variant: 'Voile', quantity: '', colors: '', ratio: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900">Factory Dyeing Color Slips</h2>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-4">Issue Dyeing Instruction Slip</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Variant</label>
            <select className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={formData.variant} onChange={e => setFormData({...formData, variant: e.target.value})}>
              <option>Voile</option>
              <option>Poplin</option>
              <option>Linen</option>
              <option>Bexi Voile</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Total Quantity (Goj)</label>
            <input required type="number" min="1" placeholder="1000" className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Colors Required</label>
            <input required type="text" placeholder="e.g. Navy Blue, Maroon, Olive" className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Ratio Specification</label>
            <input required type="text" placeholder="e.g. 2:1:1" className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={formData.ratio} onChange={e => setFormData({...formData, ratio: e.target.value})} />
          </div>
          <div className="lg:col-span-5 flex justify-end">
            <button type="submit" className="bg-slate-900 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              Issue Color Slip
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Date</th>
                <th className="px-6 py-3.5 font-semibold">Variant</th>
                <th className="px-6 py-3.5 font-semibold">Total Quantity</th>
                <th className="px-6 py-3.5 font-semibold">Assigned Colors</th>
                <th className="px-6 py-3.5 font-semibold">Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {colorSlips.map((slip) => (
                <tr key={slip.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3.5 text-slate-600">{slip.date}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-900">{slip.variant}</td>
                  <td className="px-6 py-3.5 font-semibold">{slip.quantity.toLocaleString()} Goj</td>
                  <td className="px-6 py-3.5 text-slate-800">{slip.colors}</td>
                  <td className="px-6 py-3.5 font-mono text-slate-600">{slip.ratio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminCustomersView({ customers, payments, setPayments, formatCurrency }) {
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]?.id || null);
  const [paymentData, setPaymentData] = useState({ date: new Date().toISOString().split('T')[0], amount: '', method: 'Cash', note: '' });

  const customerPayments = payments.filter(p => p.customerId === selectedCustomer);
  
  let totalBilled = 0;
  let totalPaid = 0;
  customerPayments.forEach(p => {
    if (p.type === 'Bill') totalBilled += p.amount;
    if (p.type === 'Payment') totalPaid += p.amount;
  });
  const remainingDue = totalBilled - totalPaid;

  const activeCustomer = customers.find(c => c.id === selectedCustomer);

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentData.amount) return;
    setPayments([{ 
      id: Date.now(), 
      customerId: selectedCustomer, 
      type: 'Payment', 
      ...paymentData, 
      amount: Number(paymentData.amount) 
    }, ...payments]);
    setPaymentData({ ...paymentData, amount: '', note: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900">Customer Ledgers & Receivables</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-3 px-2">Wholesale Accounts</h3>
          <div className="space-y-1">
            {customers.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCustomer(c.id)}
                className={`w-full text-left p-3 rounded-xl transition-colors ${selectedCustomer === c.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'}`}
              >
                <p className="font-bold text-sm">{c.name}</p>
                <p className="text-xs opacity-75 mt-0.5">{c.phone}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {activeCustomer && (
            <>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{activeCustomer.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{activeCustomer.address} &bull; {activeCustomer.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase text-slate-400">Uncollected Credit Balance</p>
                  <p className={`text-2xl font-extrabold ${remainingDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatCurrency(remainingDue)}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4">Record Payment Received</h3>
                <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                    <input required type="date" className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={paymentData.date} onChange={e => setPaymentData({...paymentData, date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
                    <select className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={paymentData.method} onChange={e => setPaymentData({...paymentData, method: e.target.value})}>
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>bKash/Nagad</option>
                      <option>Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (৳)</label>
                    <input required type="number" min="1" placeholder="0" className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Reference Note</label>
                    <input type="text" placeholder="Deposit slip or bank wire ref" className="w-full border-slate-300 rounded-lg p-2.5 text-sm border focus:ring-2 focus:ring-amber-500" value={paymentData.note} onChange={e => setPaymentData({...paymentData, note: e.target.value})} />
                  </div>
                  <div>
                    <button type="submit" className="w-full bg-slate-900 hover:bg-amber-700 text-white p-2.5 rounded-lg text-sm font-semibold transition-colors">
                      Record Payment
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 font-bold text-slate-900">
                  Statement Ledger History
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                      <tr>
                        <th className="px-6 py-3.5 font-semibold">Date</th>
                        <th className="px-6 py-3.5 font-semibold">Type</th>
                        <th className="px-6 py-3.5 font-semibold">Method / Ref</th>
                        <th className="px-6 py-3.5 font-semibold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customerPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3.5 text-slate-600">{p.date}</td>
                          <td className="px-6 py-3.5">
                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${p.type === 'Bill' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {p.type}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-slate-700">{p.note || p.method}</td>
                          <td className={`px-6 py-3.5 text-right font-bold ${p.type === 'Bill' ? 'text-slate-900' : 'text-emerald-600'}`}>
                            {p.type === 'Bill' ? '+' : '-'}{formatCurrency(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NavButton({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-1.5 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
        isActive 
          ? 'border-amber-700 text-amber-700' 
          : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MobileNavButton({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
        isActive 
          ? 'bg-amber-100 text-amber-900' 
          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function FeatureCard({ title, description }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
      <h3 className="font-bold text-stone-900 mb-2">{title}</h3>
      <p className="text-stone-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  let styles = "bg-stone-100 text-stone-800 border-stone-200";
  
  if (status === 'Pending') styles = "bg-amber-100 text-amber-800 border-amber-200";
  if (status === 'Confirmed') styles = "bg-blue-100 text-blue-800 border-blue-200";
  if (status === 'Delivered') styles = "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (status === 'Rejected') styles = "bg-rose-100 text-rose-800 border-rose-200";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles}`}>
      {status}
    </span>
  );
}