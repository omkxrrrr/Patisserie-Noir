export const OCCASIONS = [
  { id: 'birthday', label: 'Birthday', icon: 'PartyPopper' },
  { id: 'anniversary', label: 'Anniversary', icon: 'Heart' },
  { id: 'wedding', label: 'Wedding', icon: 'Gem' },
  { id: 'engagement', label: 'Engagement', icon: 'Ring' },
  { id: 'baby_shower', label: 'Baby Shower', icon: 'Baby' },
  { id: 'farewell', label: 'Farewell', icon: 'LogOut' },
  { id: 'graduation', label: 'Graduation', icon: 'GraduationCap' },
  { id: 'corporate', label: 'Corporate Event', icon: 'Briefcase' }
];

// Maps an occasion to the cake categories we'd recommend for it.
export const OCCASION_CATEGORY_MAP = {
  birthday: ['Birthday Cakes', 'Theme Cakes', 'Photo Cakes', 'Cupcakes'],
  anniversary: ['Anniversary Cakes', 'Theme Cakes'],
  wedding: ['Wedding Cakes'],
  engagement: ['Wedding Cakes', 'Theme Cakes'],
  baby_shower: ['Theme Cakes', 'Photo Cakes', 'Cupcakes'],
  farewell: ['Theme Cakes', 'Photo Cakes', 'Pastries'],
  graduation: ['Theme Cakes', 'Photo Cakes'],
  corporate: ['Pastries', 'Cupcakes', 'Theme Cakes']
};

export const CAKE_CATEGORIES = [
  'Birthday Cakes', 'Anniversary Cakes', 'Wedding Cakes', 'Theme Cakes',
  'Photo Cakes', 'Cupcakes', 'Pastries'
];

export const DELIVERY_SLOTS = [
  { id: '10AM-12PM', label: '10:00 AM – 12:00 PM' },
  { id: '12PM-2PM', label: '12:00 PM – 2:00 PM' },
  { id: '2PM-4PM', label: '2:00 PM – 4:00 PM' },
  { id: '4PM-6PM', label: '4:00 PM – 6:00 PM' },
  { id: '6PM-8PM', label: '6:00 PM – 8:00 PM' }
];

export const ORDER_STATUSES = [
  'Pending', 'Confirmed', 'Baking', 'Decorating', 'Ready',
  'Out For Delivery', 'Delivered', 'Completed', 'Cancelled'
];

export const ORDER_STATUS_COLORS = {
  Pending: 'bg-cocoa-100 text-cocoa-600',
  Confirmed: 'bg-sage-light text-sage',
  Baking: 'bg-gilt-100 text-gilt-600',
  Decorating: 'bg-mulberry-100 text-mulberry-600',
  Ready: 'bg-mulberry-100 text-mulberry-700',
  'Out For Delivery': 'bg-cocoa-200 text-cocoa-700',
  Delivered: 'bg-sage-light text-sage',
  Completed: 'bg-sage text-white',
  Cancelled: 'bg-red-100 text-red-600'
};

export const COUPON_TAGS = ['welcome', 'festival', 'birthday'];

// Marketing copy for the homepage "Special Offers" section — matches the
// starter coupons seeded by setupSpreadsheet(). Purely presentational;
// the actual discount math is always re-validated server-side at checkout.
export const PROMO_HIGHLIGHTS = [
  { code: 'WELCOME10', title: 'First Order? Welcome Treat', description: '10% off your first cake, on orders above ₹500.' },
  { code: 'FESTIVE20', title: 'Festive Season Special', description: '20% off (up to ₹500) on orders above ₹1,000.' },
  { code: 'BIRTHDAY15', title: 'Birthday Month Discount', description: '15% off birthday cakes above ₹700.' }
];
