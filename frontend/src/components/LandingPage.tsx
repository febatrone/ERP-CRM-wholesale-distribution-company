import React from 'react';
import { 
  ArrowRight, 
  BarChart3, 
  Users, 
  Package, 
  FileCheck, 
  Shield, 
  Activity, 
  Sparkles,
  Database,
  ArrowUpRight,
  TrendingUp,
  Workflow,
  Cpu,
  Layers,
  Zap,
  Globe
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-[#03000a] text-slate-100 overflow-hidden relative font-sans selection:bg-purple-500 selection:text-white">
      {/* Dynamic Animated Core Background Gradients */}
      <div className="absolute top-[-30%] left-[-20%] w-[90%] h-[90%] rounded-full bg-gradient-to-br from-purple-900/30 to-violet-900/10 blur-[160px] pointer-events-none animate-[pulse_12s_infinite_alternate]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-indigo-900/30 to-fuchsia-900/10 blur-[160px] pointer-events-none animate-[pulse_10s_infinite_alternate_2s]" />
      <div className="absolute top-[20%] left-[40%] w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none animate-[ping_8s_infinite]" />

      {/* Cyberpunk Grid Mask with Laser Line animation */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_80%,transparent_100%)] pointer-events-none" />
      
      {/* Animated glowing scanning bar across the grid */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent animate-[pan-line_6s_linear_infinite] pointer-events-none" />

      {/* Futuristic Floating Particles / Bokeh effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-2 h-2 rounded-full bg-purple-400/30 blur-xs animate-[float-particle_7s_infinite]" />
        <div className="absolute top-[45%] left-[80%] w-3.5 h-3.5 rounded-full bg-indigo-400/20 blur-xs animate-[float-particle_11s_infinite_1.5s]" />
        <div className="absolute top-[75%] left-[25%] w-2 h-2 rounded-full bg-fuchsia-400/30 blur-xs animate-[float-particle_9s_infinite_3s]" />
        <div className="absolute top-[30%] left-[65%] w-1.5 h-1.5 rounded-full bg-violet-400/40 blur-xs animate-[float-particle_5s_infinite_0.5s]" />
      </div>

      {/* Premium Glassmorphism Navbar */}
      <header className="sticky top-5 z-50 max-w-6xl mx-auto px-4">
        <div className="w-full bg-[#090514]/65 border border-white/[0.07] backdrop-blur-xl px-6 py-4 rounded-[24px] flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,10,32,0.5)]">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:rotate-6 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="grid grid-cols-2 gap-1 w-4 h-4 z-10">
                <div className="bg-white rounded-sm"></div>
                <div className="bg-purple-300 rounded-sm"></div>
                <div className="bg-purple-300 rounded-sm"></div>
                <div className="bg-white rounded-sm"></div>
              </div>
            </div>
            <div>
              <h1 className="font-black text-white text-base tracking-tight leading-none group-hover:text-purple-400 transition-colors">Insight Scope</h1>
              <p className="text-[9px] text-purple-400/90 font-bold mt-0.5 tracking-widest uppercase">Enterprise ERP & CRM</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-xs font-bold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors relative group py-1">
              <span>Features</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-purple-500 group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#system" className="hover:text-white transition-colors relative group py-1">
              <span>Integrations</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-purple-500 group-hover:w-full transition-all duration-300" />
            </a>
            <span className="px-2.5 py-0.5 bg-purple-950/60 border border-purple-500/30 rounded-full text-[9px] text-purple-400 font-extrabold uppercase flex items-center space-x-1 animate-pulse">
              <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
              <span>REST Active</span>
            </span>
          </div>

          <div>
            <button 
              onClick={onEnterApp}
              className="group px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-28 relative z-10 flex flex-col items-center text-center">
        {/* Glow Pill Badge */}
        <div className="inline-flex items-center space-x-2.5 px-4 py-2 bg-purple-950/40 border border-purple-500/30 rounded-full text-purple-300 text-[10px] font-black tracking-widest uppercase mb-8 shadow-[0_0_20px_rgba(147,51,234,0.15)] animate-[pulse_2s_infinite]">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
          <span>Real-time Wholesale Synchronization Engine</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl text-white">
          Supercharge Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 drop-shadow-[0_2px_15px_rgba(168,85,247,0.25)]">
            Wholesale Logistics
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-lg max-w-3xl mt-8 font-semibold leading-relaxed">
          An advanced database-driven enterprise dashboard. Bind live stock alerts, automated reorder thresholds, multi-item delivery challans, and transactional integrity into a single glassmorphic interface.
        </p>

        {/* Interactive CTA buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto relative">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-9 py-4.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-sm font-extrabold transition-all duration-300 shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 flex items-center justify-center space-x-2.5 hover:-translate-y-1 cursor-pointer"
          >
            <span>Enter Enterprise Portal</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          
          <a
            href="#features"
            className="w-full sm:w-auto px-9 py-4.5 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-2xl text-sm font-bold transition-all duration-300 border border-white/[0.08] hover:border-white/[0.15] flex items-center justify-center space-x-2 backdrop-blur-md"
          >
            <span>Explore Pillars</span>
          </a>
        </div>

        {/* Interactive Advanced UI Mockup with Heavy Glassmorphism */}
        <div className="mt-24 w-full max-w-5xl rounded-[32px] border border-white/[0.08] bg-[#0c0617]/50 p-4 backdrop-blur-2xl shadow-[0_24px_64px_rgba(3,0,10,0.8)] relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 rounded-[32px] blur-md opacity-25 group-hover:opacity-40 transition duration-1000" />
          
          {/* Mockup Title bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] px-2">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 shadow-lg shadow-red-500/20" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 shadow-lg shadow-amber-500/20" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 shadow-lg shadow-green-500/20" />
            </div>
            <div className="px-16 py-1 bg-white/[0.04] border border-white/[0.05] rounded-xl text-[10px] text-purple-400 font-mono tracking-widest uppercase">
              http://insight-scope.net/dashboard
            </div>
            <span className="w-4 h-4 text-white/5" />
          </div>

          {/* Inner Interface Mockup */}
          <div className="bg-[#080410]/70 rounded-2xl p-6 mt-4 text-left grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden border border-white/[0.03]">
            {/* Left Col - Stats & CRM */}
            <div className="space-y-4">
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl relative overflow-hidden group/card hover:bg-white/[0.04] transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pipeline Value</span>
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">₹12,45,200</p>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-purple-500 h-full w-[70%]" />
                </div>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:bg-white/[0.04] transition-all duration-300">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-3 tracking-wider">CRM Pipeline Stages</span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Delta Wholesale</span>
                    <span className="px-2 py-0.5 bg-indigo-50/10 text-indigo-400 border border-indigo-50/20 rounded text-[9px] font-bold">Proposal</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Apex Distributors</span>
                    <span className="px-2 py-0.5 bg-emerald-50/10 text-emerald-400 border border-emerald-50/20 rounded text-[9px] font-bold">Active Lead</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Col - Products & Reorder warnings */}
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/[0.02] border border-amber-500/15 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Stock Reorder Alerts</span>
                  <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
                </div>
                <div className="flex justify-between items-center bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  <div>
                    <p className="text-xs font-bold text-slate-100">Precision Sprocket Max</p>
                    <p className="text-[9px] text-amber-300/80 mt-0.5">Stock level: 10 / Min: 25</p>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black rounded-lg text-[9px] uppercase tracking-wider shadow-md shadow-amber-500/20 hover:scale-105 transition-transform">Restock</span>
                </div>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:bg-white/[0.04] transition-all duration-300">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2.5 tracking-wider">Recent Stock Movements</span>
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between text-slate-400">
                    <span>IN +50 Sprocket Max</span>
                    <span className="text-emerald-400 font-semibold">Replenished</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>OUT -10 Universal Widget</span>
                    <span className="text-slate-500">Sales Order</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col - Sales Order dispatch */}
            <div className="space-y-4">
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl h-full flex flex-col justify-between hover:bg-white/[0.04] transition-all duration-300">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-3 tracking-wider">Active Dispatch Orders</span>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-200">CHN-20260811-0001</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">Universal Widget A x 10</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50/10 text-emerald-400 border border-emerald-50/20 rounded-full text-[9px] font-bold">Confirmed</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Audit Event Log:</span>
                  <span className="text-purple-400 font-black tracking-wider uppercase text-[9px]">100% Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Core Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-28 relative z-10 border-t border-white/[0.06]">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-[9px] font-black tracking-widest uppercase mb-4">
            <Layers className="w-3 h-3" />
            <span>Core Architecture Modules</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">Four Core Pillars, Unified</h2>
          <p className="text-slate-400 mt-4 text-sm sm:text-base leading-relaxed font-medium">
            Eliminate loose spreadsheets. Insight Scope binds CRM pipelines, live inventory controls, dispatch challans, and financials into a single real-time platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-7 rounded-[24px] bg-white/[0.01] border border-white/[0.05] hover:border-purple-500/35 hover:bg-white/[0.02] transition-all duration-300 group hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300 shadow-md shadow-purple-500/10">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">Customer CRM</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-semibold">
              Track leads, categorize retailers/distributors, schedule follow-ups, and add logs to pipeline stages.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-7 rounded-[24px] bg-white/[0.01] border border-white/[0.05] hover:border-purple-500/35 hover:bg-white/[0.02] transition-all duration-300 group hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300 shadow-md shadow-purple-500/10">
              <Package className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">Products & Stock</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-semibold">
              Set automated warning alert triggers on low stock limits, manage locations, and log every movement.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-7 rounded-[24px] bg-white/[0.01] border border-white/[0.05] hover:border-purple-500/35 hover:bg-white/[0.02] transition-all duration-300 group hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300 shadow-md shadow-purple-500/10">
              <FileCheck className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">Sales Orders</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-semibold">
              Configure multi-item challans, confirm stock checks, export beautiful PDF invoices, and dispatch orders.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-7 rounded-[24px] bg-white/[0.01] border border-white/[0.05] hover:border-purple-500/35 hover:bg-white/[0.02] transition-all duration-300 group hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300 shadow-md shadow-purple-500/10">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">Audit Trail</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-semibold">
              Fully compliant security logging capturing logins, order confirmations, stock modifications, and errors.
            </p>
          </div>
        </div>
      </section>

      {/* Database Driven Section */}
      <section id="system" className="max-w-6xl mx-auto px-6 py-28 relative z-10 border-t border-white/[0.06] bg-gradient-to-b from-transparent to-purple-950/[0.08] rounded-[48px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-[10px] font-black tracking-wider uppercase mb-6 shadow-md shadow-indigo-500/5">
              <Database className="w-3 h-3 text-indigo-400" />
              <span>Prisma & PostgreSQL Integration</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
              Real-time Database Integrity
            </h2>
            
            <p className="text-slate-400 mt-6 text-sm sm:text-base leading-relaxed font-medium">
              Insight Scope operates on a clean transactional relational database. When a Wholesale order is confirmed, stock levels decrease automatically. If stock is insufficient, transaction locks prevent negative balances. No duplicate logs or desynced states.
            </p>

            <ul className="mt-8 space-y-4 text-xs text-slate-300 font-bold">
              <li className="flex items-center space-x-3">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px]">✓</span>
                <span>Zod payload validation across every REST endpoint</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px]">✓</span>
                <span>Relational mapping preserving historical invoice snapshot pricing</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px]">✓</span>
                <span>Audit events triggered asynchronously on database updates</span>
              </li>
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl blur-md opacity-25" />
            <div className="bg-[#0f0c1b]/95 border border-white/10 p-6 rounded-3xl relative font-mono text-[10.5px] text-slate-300 overflow-x-auto shadow-2xl">
              {/* Code display inside mockup block */}
              <div className="flex justify-between items-center text-slate-500 border-b border-white/5 pb-3 mb-4">
                <span>prisma.schema</span>
                <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-bold uppercase tracking-wider">PostgreSQL</span>
              </div>
              <p className="text-purple-400">// Automatic Stock Deductions Transaction Block</p>
              <p className="mt-2"><span className="text-purple-400">const</span> result = <span className="text-indigo-400">await</span> prisma.$transaction(<span className="text-indigo-400">async</span> (tx) =&gt; &#123;</p>
              <p className="pl-4">... verify stock levels first ...</p>
              <p className="pl-4 mt-2"><span className="text-purple-400">await</span> tx.product.update(&#123;</p>
              <p className="pl-8">where: &#123; id: item.productId &#125;,</p>
              <p className="pl-8">data: &#123; currentStock: &#123; decrement: item.quantity &#125; &#125;</p>
              <p className="pl-4">&#125;);</p>
              <p className="pl-4 mt-2"><span className="text-purple-400">await</span> tx.stockMovement.create(&#123; ... &#125;);</p>
              <p className="pl-4">... return updatedChallan</p>
              <p>&#125;);</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-white/[0.06] relative z-10 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs gap-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
            <div className="grid grid-cols-2 gap-1 w-3.5 h-3.5">
              <div className="bg-slate-400 rounded-sm"></div>
              <div className="bg-purple-500 rounded-sm"></div>
              <div className="bg-purple-500 rounded-sm"></div>
              <div className="bg-slate-400 rounded-sm"></div>
            </div>
          </div>
          <div>
            <span className="font-bold text-slate-400 block">Insight Scope</span>
            <span className="text-[10px]">ERP System © 2026. All rights reserved.</span>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <button 
            onClick={onEnterApp}
            className="text-slate-400 hover:text-white font-bold transition-colors cursor-pointer"
          >
            Launch Portal
          </button>
        </div>
      </footer>
    </div>
  );
};
