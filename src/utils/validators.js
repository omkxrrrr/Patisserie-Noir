export const validators = {
  required: (label) => (value) => (value === undefined || value === null || String(value).trim() === '') ? `${label} is required.` : true,

  indianPhone: (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    const stripped = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
    if (!/^[6-9]\d{9}$/.test(stripped)) return 'Enter a valid 10-digit mobile number.';
    return true;
  },

  email: (value) => {
    if (!value) return true; // email is optional in most of our forms
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a valid email address.';
  },

  futureDate: (value) => {
    if (!value) return 'Pick a delivery date.';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const picked = new Date(value);
    if (picked < today) return 'Delivery date can\'t be in the past.';
    return true;
  },

  minLeadHours: (hours) => (dateValue, slotValue) => {
    if (!dateValue || !slotValue) return true;
    const slotStartHour = parseSlotStartHour(slotValue);
    const deliveryDateTime = new Date(dateValue);
    deliveryDateTime.setHours(slotStartHour, 0, 0, 0);
    const minAllowed = new Date(Date.now() + hours * 60 * 60 * 1000);
    if (deliveryDateTime < minAllowed) {
      return `Please choose a slot at least ${hours} hours from now so we have time to bake.`;
    }
    return true;
  }
};

function parseSlotStartHour(slot) {
  const match = String(slot).match(/^(\d+)(AM|PM)/i);
  if (!match) return 0;
  let hour = Number(match[1]);
  if (/pm/i.test(match[2]) && hour !== 12) hour += 12;
  if (/am/i.test(match[2]) && hour === 12) hour = 0;
  return hour;
}
