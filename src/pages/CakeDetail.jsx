import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { cakeService } from '../services/cakeService';
import { useOrderDraftStore } from '../store/orderDraftStore';
import CakeCustomizerPanel from '../components/cake/CakeCustomizerPanel';
import PriceSummary from '../components/cake/PriceSummary';
import StarRating from '../components/ui/StarRating';
import Badge from '../components/ui/Badge';
import PageLoader from '../components/ui/PageLoader';
import { OCCASIONS } from '../constants/referenceData';
import { suggestTheme, generateCakeMessage } from '../utils/aiSuggestions';

export default function CakeDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const draft = useOrderDraftStore();

  const [cake, setCake] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [themeDescription, setThemeDescription] = useState('');
  const [themeSuggestion, setThemeSuggestion] = useState(null);
  const [recipientText, setRecipientText] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setNotFound(false);
    cakeService.getById(slug)
      .then((data) => {
        if (cancelled) return;
        setCake(data);
        if (draft.cake?.id !== data.id) {
          draft.setCake(data);
          draft.resetCustomization();
        }
      })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (isLoading) return <PageLoader />;
  if (notFound) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-2xl text-cocoa-700 dark:text-blush">We couldn't find that cake</h1>
        <Link to="/cakes" className="mt-4 inline-block text-sm font-semibold text-mulberry-500">← Back to the menu</Link>
      </div>
    );
  }

  const pricing = draft.getPricing();
  const images = cake.images?.length ? cake.images : ['/cake-placeholder.svg'];

  function applyTheme() {
    const suggestion = suggestTheme(themeDescription, draft.occasion);
    setThemeSuggestion(suggestion);
  }

  function useThemeSuggestion() {
    draft.updateCustomization({ theme: themeSuggestion.theme });
    toast.success(`Theme set to "${themeSuggestion.theme}"`);
  }

  function generateMessage() {
    const msg = generateCakeMessage(draft.occasion || 'birthday', recipientText);
    draft.updateCustomization({ customMessage: msg.slice(0, 60) });
    toast.success('Message generated — feel free to tweak it.');
  }

  function handleContinue() {
    if (!cake.isAvailable) {
      toast.error('This cake is currently unavailable. Please pick another.');
      return;
    }
    navigate('/order');
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <Link to="/cakes" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-cocoa-500 hover:text-mulberry-500">
        <ChevronLeft size={16} /> Back to menu
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.3fr_380px]">
        <div>
          {/* Images */}
          <div className="overflow-hidden rounded-soft bg-cocoa-100 dark:bg-cocoa-700">
            <img src={images[activeImage]} alt={cake.name} className="h-80 w-full object-cover sm:h-96" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`h-16 w-16 overflow-hidden rounded-soft border-2 ${i === activeImage ? 'border-mulberry-500' : 'border-transparent'}`}>
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {cake.isBestSeller && <Badge tone="gold">Bestseller</Badge>}
            {cake.isTrending && <Badge tone="mulberry">Trending</Badge>}
            {!cake.isAvailable && <Badge tone="danger">Currently Unavailable</Badge>}
          </div>
          <p className="mt-3 font-mono text-xs uppercase tracking-wider text-cocoa-300">{cake.category}</p>
          <h1 className="mt-1 font-display text-display-md text-cocoa-700 dark:text-blush">{cake.name}</h1>
          <div className="mt-2"><StarRating rating={cake.rating} count={cake.ratingCount} /></div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cocoa-500 dark:text-blush-deep/85">{cake.description}</p>

          {/* Occasion context */}
          <div className="mt-8 max-w-xs">
            <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">What's the occasion?</label>
            <select
              value={draft.occasion}
              onChange={(e) => draft.setOccasion(e.target.value)}
              className="w-full rounded-pill border border-cocoa-150 px-4 py-2.5 text-sm dark:border-cocoa-600 dark:bg-cocoa-800"
            >
              <option value="">Select an occasion</option>
              {OCCASIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>

          {/* AI helpers */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-soft bg-mulberry-50 p-4 dark:bg-mulberry-500/10">
              <h4 className="flex items-center gap-1.5 font-display text-sm text-mulberry-600 dark:text-mulberry-300"><Sparkles size={14} /> AI Theme Suggestion</h4>
              <input
                value={themeDescription}
                onChange={(e) => setThemeDescription(e.target.value)}
                placeholder='e.g. "football", "unicorn", "minimal"'
                className="mt-2 w-full rounded-pill border border-mulberry-200 bg-white px-3.5 py-2 text-xs dark:bg-cocoa-800"
              />
              <button onClick={applyTheme} className="mt-2 text-xs font-semibold text-mulberry-600 dark:text-mulberry-300">Suggest a theme →</button>
              {themeSuggestion && (
                <div className="mt-3 rounded-soft bg-white p-3 text-xs dark:bg-cocoa-800">
                  <p className="font-semibold text-cocoa-700 dark:text-blush">{themeSuggestion.theme}</p>
                  <p className="mt-1 text-cocoa-400">{themeSuggestion.decorations.join(', ')}</p>
                  <div className="mt-2 flex gap-1.5">
                    {themeSuggestion.palette.map((c) => <span key={c} className="h-5 w-5 rounded-full" style={{ background: c }} />)}
                  </div>
                  <button onClick={useThemeSuggestion} className="mt-2 text-xs font-semibold text-mulberry-600 dark:text-mulberry-300">Use this theme</button>
                </div>
              )}
            </div>

            <div className="rounded-soft bg-gilt-100 p-4">
              <h4 className="flex items-center gap-1.5 font-display text-sm text-cocoa-700"><Sparkles size={14} /> AI Cake Message</h4>
              <input
                value={recipientText}
                onChange={(e) => setRecipientText(e.target.value)}
                placeholder='Who is it for? e.g. "Mom", "my friend"'
                className="mt-2 w-full rounded-pill border border-gilt-300 bg-white px-3.5 py-2 text-xs"
              />
              <button onClick={generateMessage} className="mt-2 text-xs font-semibold text-cocoa-700">Generate message →</button>
            </div>
          </div>

          {/* Customizer */}
          <div className="mt-10">
            <h2 className="mb-5 font-display text-xl text-cocoa-700 dark:text-blush">Customize Your Cake</h2>
            <CakeCustomizerPanel customization={draft.customization} onChange={draft.updateCustomization} />
          </div>
        </div>

        {/* Price summary + CTA */}
        <div>
          <PriceSummary pricing={pricing} couponCode={draft.coupon?.code} />
          <button
            onClick={handleContinue}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-pill bg-mulberry-500 px-6 py-3.5 text-sm font-semibold text-white shadow-card hover:bg-mulberry-600"
          >
            Continue to Order Details <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
