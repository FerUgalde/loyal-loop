import React, { useState } from 'react';
import WalletConnector from './components/WalletConnector';
import TokenManagementForm from './components/CreateTokenForm';
import EarnTokensForm from './components/EarnTokensForm';
import TokenSwapForm from './components/TokenSwapForm';
import BusinessDashboard from './components/BusinessDashboard';
import CouponManager from './components/CouponManager';
import { Users, Building2, ArrowLeftRight, Sparkles, TrendingUp, Shield } from 'lucide-react';
import './App.css';

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('customer');

  const getTabIcon = (tabName) => {
    const iconProps = { size: 20, className: "inline mr-2" };
    switch (tabName) {
      case 'customer':
        return <Users {...iconProps} />;
      case 'trading':
        return <ArrowLeftRight {...iconProps} />;
      case 'business':
        return <Building2 {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="App-header mb-8">
        <img 
          src="/logo.png" 
          alt="LoyalLoop Logo" 
          className="h-20 mx-auto mb-4" 
        />
        <h1 className="text-gradient">🔄 LoyalLoop</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
          Complete loyalty token system with DEX trading and business management
        </p>
      </header>

      {/* Wallet Connection */}
      <div className="mb-8">
        <WalletConnector onAccountChange={setCurrentAccount} />
      </div>

      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex justify-center border-b-2 border-gray-200">
          <button
            className={`tab-elegant ${activeTab === 'customer' ? 'active' : ''}`}
            onClick={() => setActiveTab('customer')}
          >
            {getTabIcon('customer')}
            Customer Portal
          </button>
          <button
            className={`tab-elegant ${activeTab === 'trading' ? 'active' : ''}`}
            onClick={() => setActiveTab('trading')}
          >
            {getTabIcon('trading')}
            DEX Trading
          </button>
          <button
            className={`tab-elegant ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => setActiveTab('business')}
          >
            {getTabIcon('business')}
            Business Dashboard
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto">
        {activeTab === 'customer' && (
          <div className="space-y-6 animate-fade-in">
            {/* Customer Features Header */}
            <div className="card-elegant p-6 mb-6">
              <h2 className="text-2xl font-bold text-primary mb-2 flex items-center justify-center">
                <Users className="mr-3" size={28} />
                Customer Portal
              </h2>
              <p className="text-gray-600">
                Earn loyalty tokens through purchases and manage your coupons
              </p>
            </div>

            {/* Customer Actions Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Earn Tokens Section */}
              <div className="card-elegant p-6">
                <h3 className="text-xl font-semibold text-primary mb-4 flex items-center">
                  <Sparkles className="mr-2" size={20} />
                  Earn Tokens
                </h3>
                <EarnTokensForm currentAccount={currentAccount} />
              </div>

              {/* Token Management Section */}
              <div className="card-elegant p-6">
                <h3 className="text-xl font-semibold text-primary mb-4 flex items-center">
                  <TrendingUp className="mr-2" size={20} />
                  Token Management
                </h3>
                <TokenManagementForm currentAccount={currentAccount} />
              </div>
            </div>

            {/* Coupon Management Section */}
            <div className="card-elegant p-6">
              <h3 className="text-xl font-semibold text-primary mb-4 flex items-center">
                <Shield className="mr-2" size={20} />
                Coupon Manager
              </h3>
              <CouponManager currentAccount={currentAccount} />
            </div>
          </div>
        )}

        {activeTab === 'trading' && (
          <div className="animate-fade-in">
            {/* DEX Header */}
            <div className="card-elegant p-6 mb-6">
              <h2 className="text-2xl font-bold text-secondary mb-2 flex items-center justify-center">
                <ArrowLeftRight className="mr-3" size={28} />
                DEX Trading Platform
              </h2>
              <p className="text-gray-600">
                Trade LOYAL tokens with ETH on our decentralized exchange
              </p>
            </div>

            {/* DEX Trading */}
            <div className="card-elegant p-6">
              <TokenSwapForm currentAccount={currentAccount} />
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="animate-fade-in">
            {/* Business Header */}
            <div className="card-elegant p-6 mb-6">
              <h2 className="text-2xl font-bold text-primary mb-2 flex items-center justify-center">
                <Building2 className="mr-3" size={28} />
                Business Management
              </h2>
              <p className="text-gray-600">
                Manage your loyalty token system and view analytics
              </p>
            </div>

            {/* Business Dashboard */}
            <div className="card-elegant p-6">
              <h3 className="text-xl font-semibold text-primary mb-4 flex items-center">
                <TrendingUp className="mr-2" size={20} />
                Analytics Dashboard
              </h3>
              <BusinessDashboard currentAccount={currentAccount} />
            </div>
          </div>
        )}
      </div>
      {/* Feature Showcase Footer */}
      <footer className="mt-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary mr-3" />
              <h3 className="text-3xl font-bold text-primary">
                LoyalLoop Ecosystem Features
              </h3>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover the comprehensive features designed to revolutionize customer loyalty and business engagement
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* For Customers */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-subprimary rounded-xl flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-primary">For Customers</h4>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Earn LOYAL tokens by spending</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Redeem tokens for discounts</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Create and use digital coupons</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Trade tokens on DEX</span>
                </li>
              </ul>
            </div>

            {/* For Businesses */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-secondary to-subsecondary rounded-xl flex items-center justify-center mr-4">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-secondary">For Businesses</h4>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Manage token emission</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Control liquidity pools</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Analytics dashboard</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Customer engagement tools</span>
                </li>
              </ul>
            </div>

            {/* DEX Features */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-subprimary to-subsecondary rounded-xl flex items-center justify-center mr-4">
                  <ArrowLeftRight className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-subprimary">DEX Features</h4>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-subprimary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>ETH ↔ LOYAL swaps</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-subprimary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Real-time pricing</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-subprimary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Low trading fees (1%)</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-subprimary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Liquidity management</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <TrendingUp className="w-8 h-8 text-primary mb-2" />
                <p className="text-gray-600 text-sm">Growing ecosystem with continuous innovation</p>
              </div>
              <div className="flex flex-col items-center">
                <Shield className="w-8 h-8 text-secondary mb-2" />
                <p className="text-gray-600 text-sm">Secure blockchain technology</p>
              </div>
              <div className="flex flex-col items-center">
                <Sparkles className="w-8 h-8 text-subprimary mb-2" />
                <p className="text-gray-600 text-sm">Enhanced user experience</p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">© 2024 LoyalLoop - Powered by Ethereum & Built with ❤️</p>
            <p className="text-gray-500 text-sm mt-2">Empowering businesses with blockchain-based loyalty solutions</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
