import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { validateContact } from '@shared/validate.js';
import { Icon, PageHeader } from '../components/ui.jsx';
import { api } from '../lib/api.js';

const FIELDS = [['name', 'Full name', 'text', 'name'], ['email', 'Email address', 'email', 'email'], ['phone', 'Phone number', 'tel', 'tel'], ['subject', 'Subject', 'text', 'off']];
const ENQUIRY_TYPES = ['General enquiry', 'Buying a home', 'Renting', 'Site visit', 'Home loan assistance', 'Commercial leasing'];
const TIME_SLOTS = ['Flexible', 'Morning (9 am – 12 pm)', 'Afternoon (12 pm – 4 pm)', 'Evening (4 pm – 7 pm)'];
const NO_PROPERTY = 'Not property specific';
const lat = 21.1458, lng = 79.0882;
const MAP = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.006}%2C${lng + 0.01}%2C${lat + 0.006}&layer=mapnik&marker=${lat}%2C${lng}`;
const today = () => new Date().toISOString().slice(0, 10);

export default function Contact() {
  const [params] = useSearchParams();
  const subjectParam = params.get('subject') || '';
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: subjectParam, message: '' });
  const [enquiry, setEnquiry] = useState(ENQUIRY_TYPES[0]);
  const [interest, setInterest] = useState(NO_PROPERTY);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState(TIME_SLOTS[0]);
  const [options, setOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle' });
  const change = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined })); };

  // Property-specific bookings (…?subject=Visit: <name>) preselect the property and enquiry type.
  const referred = subjectParam.match(/^(?:Visit|Enquiry):\s*(.+)$/)?.[1]?.trim();

  useEffect(() => {
    if (import.meta.env.MODE === 'test') return; // keeps the fetch-call order deterministic in tests
    let live = true;
    api('/properties').then((list) => { if (live && Array.isArray(list)) setOptions(list); }).catch(() => {});
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (referred && options.some((p) => p.name === referred)) {
      setInterest(referred);
      if (/^Visit/.test(subjectParam)) setEnquiry('Site visit');
    }
  }, [referred, options, subjectParam]);

  async function submit(e) {
    e.preventDefault();
    const parts = [enquiry !== ENQUIRY_TYPES[0] ? enquiry : '', interest !== NO_PROPERTY ? `Property interest: ${interest}` : '', form.subject].filter(Boolean);
    const { values, errors: errs } = validateContact({ ...form, subject: parts.join(' — ') });
    setErrors(errs);
    if (Object.keys(errs).length) { setStatus({ state: 'idle' }); document.getElementById(`f-${Object.keys(errs)[0]}`)?.focus(); return; }
    if (visitDate || visitTime !== TIME_SLOTS[0]) {
      const when = [visitDate && `Preferred visit date: ${visitDate}`, visitTime !== TIME_SLOTS[0] && `Preferred time: ${visitTime}`].filter(Boolean).join(', ');
      values.message = `${values.message}\n\n${when}`;
    }
    setStatus({ state: 'sending' });
    try {
      await api('/contact', { method: 'POST', body: JSON.stringify(values) });
      setStatus({ state: 'sent' });
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setEnquiry(ENQUIRY_TYPES[0]);
      setInterest(NO_PROPERTY);
      setVisitDate('');
      setVisitTime(TIME_SLOTS[0]);
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      setStatus({ state: 'error', message: err.message });
    }
  }

  return (
    <>
      <PageHeader title="Contact Us">Tell us what you’re looking for and we’ll reply within one business day.</PageHeader>
      <section className="container section">
        <div className="contact-cards">
          <article className="contact-card">
            <span className="contact-icon"><Icon name="pin" size={24} /></span>
            <h3>Visit us</h3>
            <p>12 Civil Lines, Nagpur, Maharashtra 440001</p>
          </article>
          <article className="contact-card">
            <span className="contact-icon"><Icon name="phone" size={24} /></span>
            <h3>Call us</h3>
            <p><a href="tel:+919876543210">+91 98765 43210</a></p>
          </article>
          <article className="contact-card">
            <span className="contact-icon"><Icon name="mail" size={24} /></span>
            <h3>Email us</h3>
            <p><a href="mailto:hello@shailesh.dev">hello@shailesh.dev</a></p>
          </article>
        </div>

        <div className="contact-layout">
          <div className="contact-aside">
            <div className="info-panel">
              <span className="eyebrow light">Let&apos;s talk</span>
              <h2>Tell us what you are looking for</h2>
              <p>Whether you are buying your first home, leasing a commercial space or just exploring the market, we are happy to help.</p>
              <ul className="contact-list">
                <li><Icon name="pin" size={20} /><span>12 Civil Lines, Nagpur 440001</span></li>
                <li><Icon name="phone" size={20} /><a href="tel:+919876543210">+91 98765 43210</a></li>
                <li><Icon name="mail" size={20} /><a href="mailto:hello@shailesh.dev">hello@shailesh.dev</a></li>
              </ul>
              <div className="info-actions">
                <a className="btn btn-dark" href="tel:+919876543210">Call now</a>
                <a className="btn btn-light" href="mailto:hello@shailesh.dev">Email us</a>
              </div>
            </div>
            <iframe className="embed-map" title="Office location map" src={MAP} loading="lazy" />
          </div>

          <form onSubmit={submit} noValidate className="form form-card" aria-label="Contact form">
            <span className="eyebrow">Book a visit or send a message</span>
            <h2>Drop us a message</h2>
            <p className="muted form-intro">Fill in the details below and the right person will get back to you.</p>
            <div className="field-row">
              <div className="field">
                <label htmlFor="f-enquiry">Enquiry type</label>
                <select id="f-enquiry" value={enquiry} onChange={(e) => setEnquiry(e.target.value)}>
                  {ENQUIRY_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-interest">Property of interest</label>
                <select id="f-interest" value={interest} onChange={(e) => setInterest(e.target.value)}>
                  <option>{NO_PROPERTY}</option>
                  {options.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
            </div>
            {FIELDS.map(([k, label, type, ac]) => (
              <div className="field" key={k}>
                <label htmlFor={`f-${k}`}>{label}</label>
                <input id={`f-${k}`} type={type} autoComplete={ac} value={form[k]} onChange={change(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `e-${k}` : undefined} />
                {errors[k] && <p className="field-error" id={`e-${k}`} role="alert">{errors[k]}</p>}
              </div>
            ))}
            <div className="field-row">
              <div className="field">
                <label htmlFor="f-date">Preferred visit date <span className="opt">(optional)</span></label>
                <input id="f-date" type="date" min={today()} value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="f-time">Preferred time</label>
                <select id="f-time" value={visitTime} onChange={(e) => setVisitTime(e.target.value)}>
                  {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="f-message">Message</label>
              <textarea id="f-message" rows={5} value={form.message} onChange={change('message')} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'e-message' : undefined} />
              {errors.message && <p className="field-error" id="e-message" role="alert">{errors.message}</p>}
            </div>
            {status.state === 'error' && <p className="notice error" role="alert">{status.message}</p>}
            {status.state === 'sent' && <p className="notice ok" role="status">Message sent. We’ll reply within one business day.</p>}
            <button className="btn btn-orange block" type="submit" disabled={status.state === 'sending'}>{status.state === 'sending' ? 'Sending…' : 'Send message'}</button>
          </form>
        </div>
      </section>
    </>
  );
}
