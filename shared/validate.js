const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Returns { values, errors }. errors is {} when valid. Same rules run in browser and API. */
export function validateContact(input = {}) {
  const v = Object.fromEntries(
    ['name', 'email', 'phone', 'subject', 'message'].map((k) => [k, String(input[k] ?? '').trim()])
  );
  const errors = {};
  if (v.name.length < 2) errors.name = 'Enter your full name';
  if (!EMAIL.test(v.email)) errors.email = 'Enter a valid email address';
  const digits = v.phone.replace(/\D/g, '');
  if (!/^[+\d\s()-]+$/.test(v.phone) || digits.length < 10 || digits.length > 13)
    errors.phone = 'Enter a phone number with 10 to 13 digits';
  if (v.subject.length < 3) errors.subject = 'Add a short subject';
  if (v.message.length < 10) errors.message = 'Write at least 10 characters';
  if (v.message.length > 2000) errors.message = 'Keep the message under 2,000 characters';
  return { values: v, errors };
}
