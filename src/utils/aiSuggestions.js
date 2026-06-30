/**
 * src/utils/aiSuggestions.js
 * ───────────────────────────────────────────────────────────────────
 * Smart, rule-based logic standing in for the three "AI" features —
 * no model API key needed. Each function is pure and synchronous, so
 * results are instant. If you later want to swap in a real LLM call,
 * these are the three functions to replace; every component that uses
 * them only cares about the return shape, not how it's computed.
 * ───────────────────────────────────────────────────────────────────
 */

import { OCCASION_CATEGORY_MAP, OCCASIONS } from '../constants/referenceData';

// keyword → { theme label, decoration hints, palette }
const THEME_KEYWORDS = {
  football: { theme: 'Football', decorations: ['edible football print', 'jersey number topper', 'green pitch base'], palette: ['#1F6F43', '#FFFFFF', '#1B1B1B'] },
  cricket: { theme: 'Cricket', decorations: ['bat & ball fondant pieces', 'stadium backdrop'], palette: ['#1B5E20', '#FFFFFF', '#C62828'] },
  unicorn: { theme: 'Unicorn', decorations: ['pastel rainbow drip', 'edible glitter horn', 'fondant mane'], palette: ['#F7B6D2', '#B3E5FC', '#FFF2A8'] },
  princess: { theme: 'Princess', decorations: ['fondant tiara topper', 'ruffled skirt base', 'edible pearls'], palette: ['#F4C2D7', '#D4AF37', '#FFFFFF'] },
  superhero: { theme: 'Superhero', decorations: ['comic-burst fondant', 'city skyline silhouette', 'logo plaque'], palette: ['#D32F2F', '#1565C0', '#FFC400'] },
  car: { theme: 'Racing Cars', decorations: ['checkered flag border', 'fondant car topper', 'race track icing'], palette: ['#212121', '#E53935', '#FAFAFA'] },
  dinosaur: { theme: 'Dinosaur', decorations: ['fondant dino figures', 'jungle leaf piping', 'volcano accent'], palette: ['#558B2F', '#8D6E63', '#FBC02D'] },
  floral: { theme: 'Floral Elegance', decorations: ['hand-piped sugar flowers', 'gold leaf accents'], palette: ['#F8BBD0', '#FFFFFF', '#C9952B'] },
  jungle: { theme: 'Safari / Jungle', decorations: ['fondant animal figures', 'leaf texture piping'], palette: ['#33691E', '#8D6E63', '#FBC02D'] },
  space: { theme: 'Outer Space', decorations: ['edible planets', 'star sprinkle mix', 'rocket topper'], palette: ['#0D1B2A', '#7B2CBF', '#FFD60A'] },
  minimal: { theme: 'Modern Minimal', decorations: ['clean buttercream finish', 'single botanical accent'], palette: ['#FBF5EF', '#3A1B14', '#C9952B'] },
  rustic: { theme: 'Rustic', decorations: ['semi-naked finish', 'fresh fruit & herb garnish'], palette: ['#8A6451', '#E8DCD0', '#5F7355'] },
  chocolate: { theme: 'Decadent Chocolate', decorations: ['chocolate drip', 'cocoa dust finish', 'gold leaf shards'], palette: ['#3A1B14', '#C9952B', '#1E0F0A'] }
};

const RELATION_OPENERS = {
  mom: 'To the most amazing Mom', mother: 'To the most amazing Mom', dad: 'To the best Dad ever',
  father: 'To the best Dad ever', wife: 'To my wonderful wife', husband: 'To my wonderful husband',
  friend: 'To an incredible friend', sister: 'To the best sister', brother: 'To the best brother',
  boss: 'To a fantastic boss', colleague: 'To a wonderful colleague', partner: 'To my favourite person',
  son: 'To our amazing son', daughter: 'To our amazing daughter', grandma: 'To the sweetest Grandma',
  grandpa: 'To the most wonderful Grandpa'
};

const OCCASION_MESSAGES = {
  birthday: (opener) => `${opener}, Happy Birthday! Wishing you a year as sweet as this cake and full of everything you love.`,
  anniversary: (opener) => `${opener}, Happy Anniversary! Here's to another year of love, laughter, and many more cakes together.`,
  wedding: () => 'Wishing you a lifetime of love, laughter, and happily-ever-afters. Congratulations!',
  engagement: () => 'Congratulations on your engagement! Here\'s to the beginning of your forever.',
  baby_shower: () => 'Welcoming the newest member of the family with so much love. Congratulations!',
  farewell: (opener) => `${opener}, it won't be the same without you. Wishing you all the best in this new chapter!`,
  graduation: (opener) => `${opener}, congratulations on this huge achievement — we're so proud of you!`,
  corporate: () => 'Congratulations on this milestone — here\'s to continued success!'
};

/** AI Cake Recommendation: free-text → ranked list of catalog cakes with a short "why" reason. */
export function recommendCakes(query, cakes, limit = 6) {
  const text = String(query || '').toLowerCase();
  if (!text.trim() || !cakes?.length) return [];

  const matchedOccasion = OCCASIONS.find((o) => text.includes(o.label.toLowerCase()) || text.includes(o.id.replace('_', ' ')));
  const recommendedCategories = matchedOccasion ? OCCASION_CATEGORY_MAP[matchedOccasion.id] || [] : [];
  const matchedThemeKeys = Object.keys(THEME_KEYWORDS).filter((kw) => text.includes(kw));
  const ageMatch = text.match(/(\d{1,2})\s*(?:yr|year|yo)/);

  const scored = cakes.map((cake) => {
    let score = 0;
    const reasons = [];
    const haystack = `${cake.name} ${cake.description} ${(cake.tags || []).join(' ')}`.toLowerCase();

    if (recommendedCategories.includes(cake.category)) { score += 3; reasons.push(matchedOccasion.label); }
    matchedThemeKeys.forEach((kw) => {
      if (haystack.includes(kw)) { score += 5; reasons.push(THEME_KEYWORDS[kw].theme); }
    });
    if (ageMatch && haystack.includes('kid')) score += 1;
    if (cake.isBestSeller) score += 1.5;
    if (cake.isTrending) score += 1;
    score += (cake.rating || 0) * 0.2;

    return { cake, score, reasons: [...new Set(reasons)] };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => ({ ...s.cake, matchReason: s.reasons.length ? `Matches: ${s.reasons.join(', ')}` : 'Popular pick' }));
}

/** AI Cake Message Generator: occasion + who it's for → a ready-to-use cake message. */
export function generateCakeMessage(occasionId, recipientText = '') {
  const relationKey = Object.keys(RELATION_OPENERS).find((r) => recipientText.toLowerCase().includes(r));
  const opener = relationKey ? RELATION_OPENERS[relationKey] : `To ${recipientText || 'someone special'}`;
  const builder = OCCASION_MESSAGES[occasionId] || OCCASION_MESSAGES.birthday;
  return builder(opener);
}

/** AI Theme Suggestions: short description → theme name + decoration ideas + a colour palette. */
export function suggestTheme(description = '', occasionId = '') {
  const text = description.toLowerCase();
  const matchedKey = Object.keys(THEME_KEYWORDS).find((kw) => text.includes(kw));
  if (matchedKey) return { matchedKeyword: matchedKey, ...THEME_KEYWORDS[matchedKey] };

  // Fallback: a tasteful default tied to the occasion rather than a generic guess.
  const fallback = {
    wedding: { theme: 'Classic Elegant', decorations: ['sugar florals', 'gold leaf detailing', 'tiered fondant'], palette: ['#FBF5EF', '#C9952B', '#3A1B14'] },
    birthday: { theme: 'Playful Pastel', decorations: ['buttercream rosettes', 'sprinkle border', 'name plaque'], palette: ['#F7B6D2', '#FFF2A8', '#B3E5FC'] }
  };
  return { matchedKeyword: null, ...(fallback[occasionId] || THEME_KEYWORDS.minimal) };
}
