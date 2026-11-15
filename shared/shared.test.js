import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice } from './format.js';
import { filterProperties } from './filter.js';
import { validateContact } from './validate.js';

test('formatPrice uses Cr / L notation', () => {
  assert.equal(formatPrice(32000000), '₹3.2 Cr');
  assert.equal(formatPrice(8500000), '₹85 L');
  assert.equal(formatPrice(45000000), '₹4.5 Cr');
  assert.equal(formatPrice(50000), '₹50,000');
});

const L = [
  { id: 'a', name: 'Lakeview Villa', location: 'Seminary Hills', city: 'Nagpur', category: 'Residential', type: 'Villa', price: 32e6, featured: true },
  { id: 'b', name: 'Orange City Apartment', location: 'Dharampeth', city: 'Nagpur', category: 'Residential', type: 'Apartment', price: 85e5 },
  { id: 'c', name: 'Wardha Road Showroom', location: 'Wardha Road', city: 'Nagpur', category: 'Commercial', type: 'Commercial', price: 45e6 },
];
test('filter: category chip matches category or type', () => {
  assert.deepEqual(filterProperties(L, { category: 'Residential' }).map((p) => p.id), ['b', 'a']);
  assert.deepEqual(filterProperties(L, { category: 'Villa' }).map((p) => p.id), ['a']);
});
test('filter: search, sort, featured', () => {
  assert.deepEqual(filterProperties(L, { q: 'dharam' }).map((p) => p.id), ['b']);
  assert.deepEqual(filterProperties(L, { sort: 'price-desc' }).map((p) => p.id), ['c', 'a', 'b']);
  assert.deepEqual(filterProperties(L, { featured: true }).map((p) => p.id), ['a']);
  assert.equal(filterProperties(L, { q: 'zzz' }).length, 0);
});
test('validateContact catches every bad field and passes a good one', () => {
  const bad = validateContact({ name: '', email: 'x@', phone: '12', subject: '', message: 'short' });
  assert.deepEqual(Object.keys(bad.errors).sort(), ['email', 'message', 'name', 'phone', 'subject']);
  const ok = validateContact({ name: 'Asha Rao', email: 'asha@example.com', phone: '+91 98765 43210', subject: 'Villa visit', message: 'I would like to visit on Sunday.' });
  assert.deepEqual(ok.errors, {});
});
