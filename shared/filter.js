export const SORTS = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  newest: (a, b) => (b.yearBuilt || 0) - (a.yearBuilt || 0),
};
const norm = (s) => String(s ?? '').trim().toLowerCase();
const isAll = (v) => !v || norm(v) === 'all';

/** category matches either a property's category (Residential/Commercial) or its type (Villa...). */
export function filterProperties(list, { q = '', category = 'All', type = 'All', sort = 'price-asc', featured } = {}) {
  const needle = norm(q);
  const out = list.filter((p) => {
    if (!isAll(category) && ![p.category, p.type].some((v) => norm(v) === norm(category))) return false;
    if (!isAll(type) && norm(p.type) !== norm(type)) return false;
    if (featured && !p.featured) return false;
    if (needle && !norm([p.name, p.location, p.city, p.address].join(' ')).includes(needle)) return false;
    return true;
  });
  return out.sort(SORTS[sort] || SORTS['price-asc']);
}
