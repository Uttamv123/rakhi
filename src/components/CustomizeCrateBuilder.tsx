/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Sparkles, 
  Check, 
  Plus, 
  Trash2, 
  FileText, 
  Eye, 
  ShoppingBag, 
  HelpCircle,
  Undo
} from 'lucide-react';
import { CRATE_BOX_STYLES, RAKHI_THREADS, PREMIUM_TREATS, CARD_TEMPLATES } from '../data';
import { CustomCrate, CrateBoxStyle, RakhiThread, PremiumTreat, MessageCardTemplate, PersonalizedCard, CartItem } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface CustomizeCrateBuilderProps {
  onCrateAdded: (cartItem: CartItem) => void;
  onClose: () => void;
  initialRelationFilter?: 'all' | 'brother' | 'kids' | 'bhaiya-bhabhi';
}

export default function CustomizeCrateBuilder({ onCrateAdded, onClose, initialRelationFilter = 'all' }: CustomizeCrateBuilderProps) {
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<'box' | 'rakhi' | 'treats' | 'card'>('box');
  const [relationFilter, setRelationFilter] = useState<'all' | 'brother' | 'kids' | 'bhaiya-bhabhi'>(initialRelationFilter);
  
  // Custom builder states
  const [selectedBox, setSelectedBox] = useState<CrateBoxStyle>(CRATE_BOX_STYLES[0]);
  
  // Find a sensible default Rakhi based on the initial relationship filter
  const initialRakhi = RAKHI_THREADS.find(r => 
    initialRelationFilter !== 'all' ? r.relationTags.includes(initialRelationFilter) : true
  ) || RAKHI_THREADS[0];
  
  const [selectedRakhi, setSelectedRakhi] = useState<RakhiThread>(initialRakhi);
  const [selectedTreats, setSelectedTreats] = useState<PremiumTreat[]>([PREMIUM_TREATS[0]]);
  
  // Message card states
  const [cardTemplate, setCardTemplate] = useState<MessageCardTemplate>(CARD_TEMPLATES[0]);
  const [toName, setToName] = useState('');
  const [fromName, setFromName] = useState('');
  const [messageText, setMessageText] = useState('Wishing you a very Happy Raksha Bandhan! May our bond grow stronger with each passing day. Sending you endless love, protective thoughts, and sweets across the miles.');
  const [showCardPreview, setShowCardPreview] = useState(false);

  // Calculate prices
  const boxPrice = selectedBox.price;
  const rakhiPrice = selectedRakhi.price;
  const treatsPrice = selectedTreats.reduce((sum, item) => sum + item.price, 0);
  const totalPrice = boxPrice + rakhiPrice + treatsPrice;

  const handleToggleTreat = (treat: PremiumTreat) => {
    if (selectedTreats.some(t => t.id === treat.id)) {
      setSelectedTreats(selectedTreats.filter(t => t.id !== treat.id));
    } else {
      if (selectedTreats.length >= 4) {
        alert("To guarantee transit safety, a single custom crate fits a maximum of 4 premium delicacies.");
        return;
      }
      setSelectedTreats([...selectedTreats, treat]);
    }
  };

  const handleAddCrateToCart = () => {
    const customizedCrate: PersonalizedCard = {
      templateId: cardTemplate.id,
      toName: toName || 'Beloved Brother',
      fromName: fromName || 'Caring Sister',
      message: messageText
    };

    const cartItem: CartItem = {
      id: `custom-${Date.now()}`,
      type: 'custom-crate',
      title: `Custom ${selectedBox.name}`,
      price: totalPrice,
      image: selectedBox.image,
      description: `Hand-assembled premium crate containing a ${selectedRakhi.name} paired with ${selectedTreats.length} curated treats and a custom letter.`,
      details: {
        crateBoxName: selectedBox.name,
        rakhiName: selectedRakhi.name,
        treatsNames: selectedTreats.map(t => `${t.name} (${t.weightGrams}g)`),
        card: customizedCrate
      },
      quantity: 1
    };

    onCrateAdded(cartItem);
    onClose();
  };

  return (
    <div id="crate-builder-backdrop" className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex justify-center items-start md:items-center p-0 md:p-4 text-charcoal-text">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-white w-full max-w-6xl h-full md:h-[90vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-100"
      >
        {/* Header */}
        <div className="bg-warm-cream text-charcoal-text p-6 flex justify-between items-center shrink-0 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-primary" />
            <div>
              <h2 className="font-serif text-2xl font-black italic text-primary tracking-tight">Interactive Crate Studio</h2>
              <p className="text-charcoal-text/70 text-xs font-sans mt-0.5">Draft a masterpiece: Pick custom storage, a protective thread, premium snacks, and letters.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-700 hover:bg-stone-200/60 rounded-full p-2 transition-all cursor-pointer"
            id="close-crate-builder"
          >
            <Undo className="w-5 h-5" />
          </button>
        </div>

        {/* Content Splitted */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left: Beautiful Preview Stage */}
          <div className="lg:w-1/2 bg-[#FAF6F0]/40 p-6 flex flex-col justify-between items-center relative overflow-y-auto border-b lg:border-b-0 lg:border-r border-stone-100">
            <div className="absolute top-4 left-4 bg-white border border-stone-100 text-primary px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Live Mockup Render
            </div>

            {/* Custom Interactive Stage */}
            <div className="w-full max-w-sm aspect-square bg-white border border-stone-100 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center relative mt-6 lg:mt-0">
              
              {/* Outer Box Render */}
              <div 
                className="w-full h-full rounded-xl p-4 flex flex-col justify-between items-center relative transition-all duration-500 overflow-hidden"
                style={{
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
                  backgroundColor: selectedBox.id === 'wooden-heritage' ? '#FAF1E6' : selectedBox.id === 'royal-velvet' ? '#FAF0F2' : '#F7F6F5',
                  border: selectedBox.id === 'wooden-heritage' ? '4px solid #8C6239' : selectedBox.id === 'royal-velvet' ? '4px solid #700016' : '4px dashed #8C8C8C'
                }}
              >
                {/* Visual Label */}
                <span className="absolute top-2 right-2 text-[10px] font-bold tracking-wider uppercase font-mono text-primary/70">
                  {selectedBox.name}
                </span>

                {/* Inside details: Rakhi thread in center */}
                <div className="flex-1 flex flex-col items-center justify-center w-full z-10 py-2">
                  <span className="text-[10px] uppercase font-mono text-primary/70 tracking-widest mb-1.5 font-bold">Crate Centerpiece</span>
                  <div className="relative w-44 h-24 bg-white border border-stone-200/60 rounded-xl flex items-center justify-center overflow-hidden p-2 shadow-xs">
                    {/* Golden string effect */}
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C4A484] to-transparent rotate-6 opacity-80" />
                    <img 
                      src={selectedRakhi.image} 
                      alt={selectedRakhi.name}
                      className="w-20 h-20 object-contain z-10 transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <span className="text-xs font-bold text-charcoal-text mt-2 text-center truncate w-full px-2 font-sans">
                    {selectedRakhi.name}
                  </span>
                </div>

                {/* Treats indicators in the bottom */}
                <div className="w-full border-t border-stone-200/60 pt-3 z-10">
                  <span className="text-[10px] uppercase font-mono text-charcoal-text/60 tracking-widest block text-center mb-1.5 font-bold">
                    Fitted Delicacies ({selectedTreats.length}/4)
                  </span>
                  
                  <div className="flex justify-center gap-2 flex-wrap min-h-[32px]">
                    <AnimatePresence>
                      {selectedTreats.map((treat) => (
                        <motion.div
                          key={treat.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="bg-white border border-stone-200/60 px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs text-[10px] font-semibold text-charcoal-text"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span className="truncate max-w-[80px]">{treat.name}</span>
                        </motion.div>
                      ))}
                      {selectedTreats.length === 0 && (
                        <span className="text-[10px] italic text-charcoal-text/50 font-sans">No treats selected yet</span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Card indicator overlay */}
                <div className="absolute bottom-2 right-2 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold text-primary flex items-center gap-1">
                  <FileText className="w-2.5 h-2.5" /> Letter Included
                </div>
              </div>
            </div>

            {/* Price panel */}
            <div className="w-full max-w-sm mt-4 bg-warm-cream p-4 rounded-xl border border-stone-200/60">
              <h4 className="font-serif text-sm font-bold text-primary mb-2 border-b border-stone-200/60 pb-1.5 flex justify-between">
                <span>Summary Breakdown</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal-text/50">UK Tax Incl.</span>
              </h4>
              <div className="space-y-1.5 text-xs text-charcoal-text/80 font-sans">
                <div className="flex justify-between">
                  <span>Premium Casing:</span>
                  <span className="font-mono font-semibold">{formatPrice(boxPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selected Rakhi Thread:</span>
                  <span className="font-mono font-semibold">{formatPrice(rakhiPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gourmet Treats ({selectedTreats.length}):</span>
                  <span className="font-mono font-semibold">{formatPrice(treatsPrice)}</span>
                </div>
                <div className="flex justify-between text-primary font-medium">
                  <span>Personalized Letter Card:</span>
                  <span className="font-semibold">Complimentary</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-primary pt-2 border-t border-dashed border-stone-200/60 font-mono">
                  <span>Custom Crate Total:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Studio Controls */}
          <div className="lg:w-1/2 flex flex-col h-full overflow-hidden bg-white">
            
            {/* Custom Tab Bar */}
            <div className="flex border-b border-stone-100 text-center shrink-0 bg-warm-cream/35">
              <button
                onClick={() => setActiveTab('box')}
                className={`flex-1 py-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'box' 
                    ? 'border-primary text-primary bg-white font-black' 
                    : 'border-transparent text-stone-400 hover:text-primary hover:bg-stone-50'
                }`}
              >
                <Package className="w-3.5 h-3.5" /> Box
              </button>
              <button
                onClick={() => setActiveTab('rakhi')}
                className={`flex-1 py-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'rakhi' 
                    ? 'border-primary text-primary bg-white font-black' 
                    : 'border-transparent text-stone-400 hover:text-primary hover:bg-stone-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Thread
              </button>
              <button
                onClick={() => setActiveTab('treats')}
                className={`flex-1 py-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'treats' 
                    ? 'border-primary text-primary bg-white font-black' 
                    : 'border-transparent text-stone-400 hover:text-primary hover:bg-stone-50'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Treats
              </button>
              <button
                onClick={() => setActiveTab('card')}
                className={`flex-1 py-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'card' 
                    ? 'border-primary text-primary bg-white font-black' 
                    : 'border-transparent text-stone-400 hover:text-primary hover:bg-stone-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Card
              </button>
            </div>

            {/* Tab Panels */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#FAF6F0]/20">
              
              {/* Tab 1: Box Style */}
              {activeTab === 'box' && (
                <div className="space-y-4">
                  <h3 className="font-serif text-xl font-black italic text-primary flex items-center gap-2">
                    1. Select Outer Packaging
                  </h3>
                  <p className="text-xs text-charcoal-text/70 font-sans">The signature casing defines the visual layout and protective strength of your delivery across the miles.</p>
                  
                  <div className="space-y-3 pt-2">
                    {CRATE_BOX_STYLES.map((box) => (
                      <div
                        key={box.id}
                        onClick={() => setSelectedBox(box)}
                        className={`flex gap-4 p-4 rounded-xl border transition-all cursor-pointer items-center ${
                          selectedBox.id === box.id
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <img 
                          src={box.image} 
                          alt={box.name}
                          className="w-16 h-16 object-cover rounded-lg shrink-0 border border-stone-200/60"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-2">
                            <h4 className="font-bold text-sm text-charcoal-text truncate font-sans">{box.name}</h4>
                            <span className="font-mono text-xs font-bold text-primary shrink-0">{formatPrice(box.price)}</span>
                          </div>
                          <p className="text-xs text-charcoal-text/70 mt-1 leading-relaxed font-sans">{box.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                          selectedBox.id === box.id ? 'bg-primary border-primary text-white' : 'border-stone-300 bg-white'
                        }`}>
                          {selectedBox.id === box.id && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Choose Rakhi Thread */}
              {activeTab === 'rakhi' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <h3 className="font-serif text-xl font-black italic text-primary">
                        2. Select Protective Sacred Thread
                      </h3>
                      <p className="text-xs text-charcoal-text/70 font-sans mt-0.5">Handcrafted by veteran artisans with premium silk, pearls, and pure sandalwood.</p>
                    </div>
                  </div>

                  {/* Relation Filtering Tabs */}
                  <div className="flex flex-wrap gap-1 bg-stone-100/60 p-1 rounded-xl border border-stone-200/40 font-mono text-[10px]">
                    <button
                      type="button"
                      onClick={() => setRelationFilter('all')}
                      className={`flex-1 min-w-[50px] text-center px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        relationFilter === 'all'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
                      }`}
                    >
                      All ({RAKHI_THREADS.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRelationFilter('brother')}
                      className={`flex-1 min-w-[50px] text-center px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        relationFilter === 'brother'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
                      }`}
                    >
                      Brother ({RAKHI_THREADS.filter(r => r.relationTags.includes('brother')).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRelationFilter('kids')}
                      className={`flex-1 min-w-[50px] text-center px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        relationFilter === 'kids'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
                      }`}
                    >
                      Kids ({RAKHI_THREADS.filter(r => r.relationTags.includes('kids')).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRelationFilter('bhaiya-bhabhi')}
                      className={`flex-1 min-w-[50px] text-center px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        relationFilter === 'bhaiya-bhabhi'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
                      }`}
                    >
                      Bhaiya Bhabhi ({RAKHI_THREADS.filter(r => r.relationTags.includes('bhaiya-bhabhi')).length})
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {RAKHI_THREADS.filter(rakhi => relationFilter === 'all' || rakhi.relationTags.includes(relationFilter)).map((rakhi) => (
                      <div
                        key={rakhi.id}
                        onClick={() => setSelectedRakhi(rakhi)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          selectedRakhi.id === rakhi.id
                            ? 'border-primary bg-primary/5 shadow-md scale-[1.01]'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-stone-200/60 mb-2 bg-warm-cream flex items-center justify-center">
                          <img 
                            src={rakhi.image} 
                            alt={rakhi.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          {selectedRakhi.id === rakhi.id && (
                            <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm font-sans">
                              <Check className="w-3 h-3 stroke-[3]" /> Active
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 flex gap-1 z-10">
                            {rakhi.relationTags.map((tag) => (
                              <span 
                                key={tag} 
                                className="bg-stone-900/80 text-white text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                              >
                                {tag === 'bhaiya-bhabhi' ? 'Bhaiya-Bhabhi' : tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-baseline gap-1">
                            <h4 className="font-bold text-xs text-charcoal-text truncate font-sans">{rakhi.name}</h4>
                            <span className="font-mono text-xs font-bold text-primary shrink-0">{formatPrice(rakhi.price)}</span>
                          </div>
                          <p className="text-[10px] text-charcoal-text/70 mt-1 line-clamp-2 leading-relaxed font-sans">{rakhi.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Select Sweets / Chocolates */}
              {activeTab === 'treats' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-xl font-black italic text-primary">
                      3. Select Premium Festive Treats
                    </h3>
                    <span className="text-xs font-bold px-2 py-1 bg-primary/10 rounded-lg text-primary border border-primary/20 font-sans">
                      {selectedTreats.length}/4 Selected
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-text/70 font-sans">
                    Pack authentic traditional Indian confectioneries and air-roasted dry fruits. Guaranteed fresh on arrival across England, Scotland, &amp; Wales.
                  </p>
                  
                  <div className="space-y-3 pt-2">
                    {PREMIUM_TREATS.map((treat) => {
                      const isAdded = selectedTreats.some(t => t.id === treat.id);
                      return (
                        <div
                          key={treat.id}
                          onClick={() => handleToggleTreat(treat)}
                          className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${
                            isAdded
                              ? 'border-primary bg-primary/5 shadow-md'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <img 
                            src={treat.image} 
                            alt={treat.name}
                            className="w-14 h-14 object-cover rounded-lg shrink-0 border border-stone-200/60"
                          />
                          <div className="flex-1 min-w-0 font-sans">
                            <div className="flex justify-between items-baseline gap-1">
                              <h4 className="font-bold text-xs text-charcoal-text truncate">{treat.name}</h4>
                              <span className="font-mono text-xs font-bold text-primary shrink-0">{formatPrice(treat.price)}</span>
                            </div>
                            <p className="text-[10px] text-charcoal-text/70 line-clamp-1 leading-relaxed mt-0.5">{treat.description}</p>
                            <span className="inline-block mt-1 text-[9px] bg-warm-cream text-charcoal-text/80 border border-stone-200/40 font-mono px-1.5 py-0.5 rounded-lg font-bold uppercase">
                              {treat.weightGrams}g • {treat.category}
                            </span>
                          </div>
                          <div className={`w-6 h-6 border flex items-center justify-center shrink-0 transition-colors rounded-lg ${
                            isAdded ? 'bg-primary border-primary text-white' : 'border-stone-300 bg-white text-stone-500'
                          }`}>
                            {isAdded ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 4: Message Card Editor */}
              {activeTab === 'card' && (
                <div className="space-y-4">
                  <h3 className="font-serif text-xl font-black italic text-primary">
                    4. Personalize Hand-Written Message Card
                  </h3>
                  <p className="text-xs text-charcoal-text/70 font-sans">Draft a soulful letter. We will translate your words into calligraphy print on heavy-stock cards inside the crate.</p>
                  
                  {/* Select Theme */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-text/70 font-sans">Select Card Paper Palette</label>
                    <div className="grid grid-cols-3 gap-2">
                      {CARD_TEMPLATES.map((tpl) => (
                        <button
                          type="button"
                          key={tpl.id}
                          onClick={() => setCardTemplate(tpl)}
                          className={`p-2.5 rounded-xl border text-xs text-center font-bold font-serif transition-all cursor-pointer ${
                            cardTemplate.id === tpl.id
                              ? 'border-primary ring-2 ring-primary/10 bg-warm-cream scale-[1.02]'
                              : 'border-stone-200 hover:border-stone-300 bg-white text-charcoal-text/70'
                          }`}
                          style={{ color: tpl.textColor, borderLeft: `4px solid ${tpl.borderColor}` }}
                        >
                          {tpl.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* To / From inputs */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-text/70 mb-1 font-sans">To (Recipient)</label>
                      <input
                        type="text"
                        placeholder="e.g. My Dear Brother Rahul"
                        value={toName}
                        onChange={(e) => setToName(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-charcoal-text focus:border-primary focus:outline-none bg-warm-cream font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-text/70 mb-1 font-sans">From (Sender)</label>
                      <input
                        type="text"
                        placeholder="e.g. Priya"
                        value={fromName}
                        onChange={(e) => setFromName(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-charcoal-text focus:border-primary focus:outline-none bg-warm-cream font-sans"
                      />
                    </div>
                  </div>

                  {/* Message editor */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-text/70 mb-1 font-sans">Heartfelt message</label>
                    <textarea
                      rows={4}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      maxLength={320}
                      className="w-full p-3 border border-stone-200 rounded-lg text-xs text-charcoal-text font-serif leading-relaxed focus:border-primary focus:outline-none bg-warm-cream resize-none"
                    />
                    <div className="flex justify-between items-center mt-1.5 font-sans">
                      <span className="text-[10px] text-charcoal-text/50">Limit: {messageText.length}/320 characters</span>
                      <button
                        type="button"
                        onClick={() => setShowCardPreview(!showCardPreview)}
                        className="text-xs font-bold text-primary flex items-center gap-1 underline cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> {showCardPreview ? "Hide Preview" : "View Print Preview"}
                      </button>
                    </div>
                  </div>

                  {/* Live Interactive Card render popup/collapse */}
                  {showCardPreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-5 rounded-2xl shadow-inner border border-stone-200/80 relative overflow-hidden"
                      style={{
                        backgroundColor: cardTemplate.bgColor,
                        borderColor: cardTemplate.borderColor,
                        backgroundImage: cardTemplate.bgPattern || 'none'
                      }}
                    >
                      <div className="border border-dashed p-4 rounded-xl" style={{ borderColor: cardTemplate.borderColor }}>
                        <span className="text-[9px] uppercase tracking-widest block text-center mb-4 opacity-50 font-sans font-bold">Calligraphy Print Proof</span>
                        <div className={`space-y-3 ${cardTemplate.fontClass}`} style={{ color: cardTemplate.textColor }}>
                          <p className="text-xs font-bold">To: {toName || 'Beloved Brother'}</p>
                          <p className="text-xs italic leading-relaxed whitespace-pre-line font-medium">"{messageText || 'Type your message...'}"</p>
                          <p className="text-xs font-bold text-right">With Love: {fromName || 'Caring Sister'}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </div>
              )}

            </div>

            {/* Bottom Actions */}
            <div className="border-t border-stone-100 p-6 bg-warm-cream flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 rounded-none">
              <div className="text-center sm:text-left font-sans">
                <span className="text-[10px] text-charcoal-text/50 block uppercase font-mono font-bold">Customized Total Crate Price</span>
                <span className="text-2xl font-bold text-primary font-serif">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto font-mono">
                {activeTab !== 'card' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'box') setActiveTab('rakhi');
                      else if (activeTab === 'rakhi') setActiveTab('treats');
                      else if (activeTab === 'treats') setActiveTab('card');
                    }}
                    className="w-full sm:w-auto bg-primary text-white font-bold text-xs uppercase tracking-widest px-8 py-4 hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 rounded-lg cursor-pointer"
                  >
                    Next Step <Sparkles className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddCrateToCart}
                    className="w-full sm:w-auto bg-primary text-white font-bold text-xs uppercase tracking-widest px-8 py-4 hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 shadow-md rounded-lg cursor-pointer"
                  >
                    Add to Gift Basket <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
