/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Eye, Check, X, Sparkles } from 'lucide-react';
import { CARD_TEMPLATES } from '../data';
import { PersonalizedCard, MessageCardTemplate } from '../types';

interface PersonalizeCardModalProps {
  initialCard?: PersonalizedCard;
  onSave: (card: PersonalizedCard) => void;
  onClose: () => void;
  title?: string;
}

export default function PersonalizeCardModal({ 
  initialCard, 
  onSave, 
  onClose, 
  title = "Personalize Your Calligraphy Gift Card" 
}: PersonalizeCardModalProps) {
  const [cardTemplate, setCardTemplate] = useState<MessageCardTemplate>(
    CARD_TEMPLATES.find(t => t.id === initialCard?.templateId) || CARD_TEMPLATES[0]
  );
  const [toName, setToName] = useState(initialCard?.toName || '');
  const [fromName, setFromName] = useState(initialCard?.fromName || '');
  const [messageText, setMessageText] = useState(
    initialCard?.message || 'Wishing you a very Happy Raksha Bandhan! May our bond grow stronger with each passing day. Sending you endless love, protective thoughts, and sweets across the miles.'
  );
  const [showCardPreview, setShowCardPreview] = useState(true);

  const handleSave = () => {
    onSave({
      templateId: cardTemplate.id,
      toName: toName || 'Beloved Brother',
      fromName: fromName || 'Caring Sister',
      message: messageText
    });
  };

  return (
    <div id="card-personalizer-backdrop" className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 text-charcoal-text">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-stone-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-warm-cream p-5 flex justify-between items-center border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-serif text-lg font-black italic text-primary leading-none">{title}</h3>
              <p className="text-[10px] text-charcoal-text/60 mt-1 font-sans">Complimentary hand-written card printed on heavy art stock.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-500 hover:text-stone-700 hover:bg-stone-200/60 rounded-full p-1.5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Editor Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Card Style Selectors */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-text/70 font-sans">Card Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {CARD_TEMPLATES.map((tpl) => (
                <button
                  type="button"
                  key={tpl.id}
                  onClick={() => setCardTemplate(tpl)}
                  className={`p-2 rounded-lg border text-xs text-center font-bold font-serif transition-all cursor-pointer flex flex-col justify-center items-center ${
                    cardTemplate.id === tpl.id
                      ? 'border-primary ring-2 ring-primary/10 bg-warm-cream scale-[1.02]'
                      : 'border-stone-200 hover:border-stone-300 bg-white text-charcoal-text/70'
                  }`}
                  style={{ borderLeft: `4px solid ${tpl.borderColor}` }}
                >
                  <span style={{ color: tpl.textColor }}>{tpl.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Senders and Recipients */}
          <div className="grid grid-cols-2 gap-3 pt-1">
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

          {/* Letter text editor */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-text/70 mb-1 font-sans">Heartfelt Message</label>
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              maxLength={320}
              className="w-full p-3 border border-stone-200 rounded-lg text-xs text-charcoal-text font-serif leading-relaxed focus:border-primary focus:outline-none bg-warm-cream resize-none"
            />
            <div className="flex justify-between items-center mt-1 text-[10px] text-charcoal-text/50 font-sans">
              <span>Limit: {messageText.length}/320 characters</span>
              <button
                type="button"
                onClick={() => setShowCardPreview(!showCardPreview)}
                className="text-primary font-bold underline cursor-pointer"
              >
                {showCardPreview ? "Hide Render" : "Show Render"}
              </button>
            </div>
          </div>

          {/* Interactive Live Card Render */}
          {showCardPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-xl shadow-inner border border-stone-200 relative overflow-hidden"
              style={{
                backgroundColor: cardTemplate.bgColor,
                borderColor: cardTemplate.borderColor,
                backgroundImage: cardTemplate.bgPattern || 'none'
              }}
            >
              <div className="border border-dashed p-3 rounded-lg" style={{ borderColor: cardTemplate.borderColor }}>
                <span className="text-[8px] uppercase tracking-widest block text-center mb-3 opacity-50 font-sans font-bold">Calligraphy Print Proof</span>
                <div className={`space-y-2 ${cardTemplate.fontClass}`} style={{ color: cardTemplate.textColor }}>
                  <p className="text-[11px] font-bold">To: {toName || 'Beloved Brother'}</p>
                  <p className="text-[11px] italic leading-relaxed whitespace-pre-line font-medium">"{messageText || 'Type your message...'}"</p>
                  <p className="text-[11px] font-bold text-right">With Love: {fromName || 'Caring Sister'}</p>
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-warm-cream border-t border-stone-100 flex gap-2 shrink-0 font-mono">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-stone-200 bg-white text-stone-600 font-bold text-xs uppercase tracking-widest py-3 rounded-lg hover:bg-stone-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 bg-primary text-white font-bold text-xs uppercase tracking-widest py-3 rounded-lg hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            Save Card <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
