import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon, Img } from './ui.jsx';
import { api } from '../lib/api.js';
import { formatPrice } from '@shared/format.js';

const SUGGESTIONS = [
  'Help me find a property',
  'Show me available apartments',
  'Can I schedule a property visit?',
  'How can I contact an agent?',
];

let companyPromise = null;

/**
 * Guided property assistant.
 * It is intentionally rule-based: every answer either links to real pages or queries the live
 * properties/company APIs. When an LLM/chat backend becomes available, plug it in inside respond().
 */
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I\'m the Shailesh.dev assistant. I can point you to live listings, prices and visits. What are you looking for?' },
  ]);
  const [input, setInput] = useState('');
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      const esc = (e) => e.key === 'Escape' && setOpen(false);
      const down = (e) => { if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('.chat-fab')) setOpen(false); };
      document.addEventListener('keydown', esc);
      document.addEventListener('pointerdown', down);
      return () => { document.removeEventListener('keydown', esc); document.removeEventListener('pointerdown', down); };
    }
  }, [open]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, typing, open]);

  async function respond(raw) {
    const text = raw.toLowerCase();
    companyPromise = companyPromise || api('/company').catch(() => null);
    const company = await companyPromise;

    const listingReply = (list, intro) => {
      if (!list?.length) return { text: 'I couldn\'t find anything matching that right now. Try the Properties page — new listings are added regularly.' };
      return {
        text: intro,
        cards: list.slice(0, 3).map((p) => ({ id: p.id, name: p.name, loc: `${p.location}, ${p.city}`, price: formatPrice(p.price), img: p.images?.[0] })),
        link: { to: '/properties', label: 'Browse all properties' },
      };
    };

    if (/apartment|flat/.test(text)) return listingReply(await api('/properties?type=Apartment'), 'Here are the apartments currently on our books:');
    if (/villa/.test(text)) return listingReply(await api('/properties?type=Villa'), 'Our villas at the moment:');
    if (/house|bungalow/.test(text)) return listingReply(await api('/properties?type=House'), 'Houses you can see right now:');
    if (/plot|land/.test(text)) return listingReply(await api('/properties?type=Plot'), 'Plots and land we\'re offering:');
    if (/commercial|office|shop|showroom/.test(text)) return listingReply(await api('/properties?type=Commercial'), 'Commercial spaces available:');

    if (/price|cost|how much/.test(text)) {
      const all = await api('/properties');
      return listingReply(all, 'Here\'s a cross-section with current prices — open any one for full pricing details:');
    }

    if (/visit|schedule|book|appointment|tour/.test(text)) {
      return { text: 'I can set that up. Use Book a Visit and pick a property, date and time — the team confirms within one business day.', link: { to: '/contact?subject=Visit', label: 'Book a visit' } };
    }

    if (/contact|agent|call|email|phone|talk/.test(text)) {
      const c = company?.contact || {};
      return {
        text: `You can reach the team on ${c.phone || '+91 98765 43210'} or ${c.email || 'hello@shailesh.dev'}. Our office: ${c.address || '12 Civil Lines, Nagpur'}. Every listing also shows its agent directly.`,
        link: { to: '/contact', label: 'Contact page' },
      };
    }

    if (/find|help|looking|buy|rent|search|want/.test(text)) {
      return { text: 'Happy to help. Tell me the property type — apartments, villas, houses, plots or commercial spaces — or browse the full list with filters for price, bedrooms and area.', link: { to: '/properties', label: 'Open property search' } };
    }

    return { text: 'I can help with finding properties, prices, scheduling a visit or reaching an agent. Try one of the suggestions below.', link: { to: '/properties', label: 'Browse properties' } };
  }

  async function send(value) {
    const text = value.trim();
    if (!text || typing) return;
    setInput('');
    setMessages((m) => [...m, { from: 'user', text }]);
    setTyping(true);
    try {
      const res = await respond(text);
      setMessages((m) => [...m, { from: 'bot', ...res }]);
    } catch {
      setMessages((m) => [...m, { from: 'bot', text: 'I couldn\'t reach the listings just now. Please try again in a moment.' }]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <>
      <button className={`chat-fab ${open ? 'open' : ''}`} aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
        aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? <Icon name="close" size={20} /> : <Icon name="spark" size={22} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.section className="chat-panel" role="dialog" aria-label="Property assistant chat" ref={panelRef}
            initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
            <header className="chat-head">
              <span className="chat-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 10.5 9-7.5 9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-7h5v7" /></svg>
              </span>
              <div><b>Shailesh Assistant</b><small>Guided helper · answers from live listings</small></div>
              <button className="chat-x" aria-label="Close chat" onClick={() => setOpen(false)}><Icon name="close" size={16} /></button>
            </header>
            <div className="chat-log" ref={scrollRef} aria-live="polite">
              {messages.map((m, i) => (
                <div key={i} className={`chat-msg ${m.from}`}>
                  {m.cards && (
                    <div className="chat-cards">
                      {m.cards.map((c) => (
                        <Link key={c.id} className="chat-card" to={`/properties/${c.id}`} onClick={() => setOpen(false)}>
                          <Img src={c.img} alt="" className="chat-card-img" />
                          <span><b>{c.name}</b><small>{c.loc}</small><strong>{c.price}</strong></span>
                        </Link>
                      ))}
                    </div>
                  )}
                  <p>{m.text}</p>
                  {m.link && <Link className="chat-link" to={m.link.to} onClick={() => setOpen(false)}>{m.link.label} <Icon name="arrow" size={14} /></Link>}
                </div>
              ))}
              {typing && <div className="chat-msg bot"><p className="chat-typing" aria-label="Assistant is typing"><i /><i /><i /></p></div>}
            </div>
            <div className="chat-suggest">
              {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}
            </div>
            <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(input); }}>
              <label htmlFor="chat-msg" className="sr-only">Message</label>
              <input id="chat-msg" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about properties, visits, prices…" autoComplete="off" />
              <button type="submit" aria-label="Send message" disabled={!input.trim() || typing}><Icon name="arrow" size={18} /></button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
