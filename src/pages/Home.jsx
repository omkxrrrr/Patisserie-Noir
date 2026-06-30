import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, PackageSearch, ChefHat, Truck, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { cakeService } from '../services/cakeService';
import { testimonialService, contentService } from '../services/adminServices';
import CakeCard from '../components/cake/CakeCard';
import { CakeCardSkeleton } from '../components/ui/Skeleton';
import StarRating from '../components/ui/StarRating';
import CakeHeroIllustration from '../components/shared/CakeHeroIllustration';
import { OCCASIONS, PROMO_HIGHLIGHTS } from '../constants/referenceData';

const HOW_IT_WORKS = [
  { icon: PackageSearch, title: 'Browse & Customize', text: 'Pick a cake, choose shape, flavor, weight, and decoration — price updates live.' },
  { icon: ChefHat, title: 'We Bake Fresh', text: 'No shelf mixes. Your cake is baked and decorated to order, close to your delivery date.' },
  { icon: Truck, title: 'Delivered On Time', text: 'Choose a 2-hour delivery window that works for you. We confirm everything by WhatsApp.' }
];

function Section({ eyebrow, title, action, children }) {
  return (
    <section className="container-page py-14 sm:py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h2 className="font-display text-display-md text-cocoa-700 dark:text-blush">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function CakeGrid({ cakes, isLoading, emptyText }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <CakeCardSkeleton key={i} />)}
      </div>
    );
  }
  if (!cakes?.length) {
    return <p className="rounded-soft border border-dashed border-cocoa-200 p-8 text-center text-sm text-cocoa-400 dark:border-cocoa-700">{emptyText}</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {cakes.map((cake) => <CakeCard key={cake.id} cake={cake} />)}
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      cakeService.list({ featured: true, pageSize: 4 }).catch(() => ({ items: [] })),
      cakeService.list({ bestSeller: true, pageSize: 4 }).catch(() => ({ items: [] })),
      cakeService.list({ trending: true, pageSize: 4 }).catch(() => ({ items: [] })),
      testimonialService.listApproved(6, true).catch(() => []),
      contentService.gallery().catch(() => [])
    ]).then(([f, b, t, rev, gal]) => {
      if (cancelled) return;
      setFeatured(f.items || []);
      setBestSellers(b.items || []);
      setTrending(t.items || []);
      setTestimonials(rev || []);
      setGallery(gal || []);
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  function copyCoupon(code) {
    navigator.clipboard?.writeText(code);
    toast.success(`Copied "${code}" — apply it at checkout.`);
  }

  return (
    <div>
      {/* Hero */}
      <section className="container-page grid items-center gap-10 py-12 sm:py-20 lg:grid-cols-2 lg:py-28">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="eyebrow mb-4 flex items-center gap-2"><Sparkles size={14} /> Baked fresh, built to order</p>
          <h1 className="font-display text-display-xl text-cocoa-700 dark:text-blush">
            Cakes designed<br />around <span className="text-mulberry-500">your</span> moment.
          </h1>
          <p className="mt-5 max-w-md text-base text-cocoa-500 dark:text-blush-deep/85">
            Choose a base, customize every layer, and book a delivery slot — all in a few minutes.
            No templates, no shelf cakes. Just yours.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/cakes" className="inline-flex items-center gap-2 rounded-pill bg-mulberry-500 px-7 py-3.5 text-sm font-semibold text-white shadow-card transition-transform hover:scale-[1.02] hover:bg-mulberry-600">
              Order a Cake <ArrowRight size={16} />
            </Link>
            <Link to="/custom-orders" className="inline-flex items-center gap-2 rounded-pill border border-cocoa-200 px-7 py-3.5 text-sm font-semibold text-cocoa-700 transition-colors hover:bg-cocoa-50 dark:border-cocoa-600 dark:text-blush">
              Plan a Wedding / Bulk Order
            </Link>
          </div>
        </motion.div>
        <CakeHeroIllustration />
      </section>

      {/* How it works */}
      <section className="bg-white py-16 dark:bg-cocoa-800">
        <div className="container-page grid gap-8 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center sm:text-left"
            >
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-mulberry-50 text-mulberry-500 dark:bg-mulberry-500/15 sm:mx-0">
                <step.icon size={22} />
              </div>
              <h3 className="font-display text-lg text-cocoa-700 dark:text-blush">{step.title}</h3>
              <p className="mt-1.5 text-sm text-cocoa-400">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Occasions */}
      <Section eyebrow="Shop by occasion" title="What are we celebrating?">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {OCCASIONS.map((o) => (
            <Link
              key={o.id}
              to={`/occasions/${o.id}`}
              className="rounded-soft border border-cocoa-100 bg-white p-4 text-center text-sm font-medium text-cocoa-600 shadow-card transition-transform hover:-translate-y-0.5 hover:border-mulberry-300 dark:border-cocoa-700 dark:bg-cocoa-800 dark:text-blush-deep"
            >
              {o.label}
            </Link>
          ))}
        </div>
      </Section>

      {/* Featured */}
      <Section eyebrow="Handpicked" title="Featured Cakes" action={<Link to="/cakes" className="text-sm font-semibold text-mulberry-500">View all →</Link>}>
        <CakeGrid cakes={featured} isLoading={isLoading} emptyText="Featured cakes will appear here once added in the admin panel." />
      </Section>

      {/* Best sellers */}
      <Section eyebrow="Customer favorites" title="Best Sellers">
        <CakeGrid cakes={bestSellers} isLoading={isLoading} emptyText="Best sellers will appear here once orders start coming in." />
      </Section>

      {/* Trending */}
      <Section eyebrow="Right now" title="Trending This Week">
        <CakeGrid cakes={trending} isLoading={isLoading} emptyText="Nothing trending yet — check back soon." />
      </Section>

      {/* Special offers */}
      <section className="bg-cocoa-700 py-16 dark:bg-cocoa-900">
        <div className="container-page">
          <p className="eyebrow mb-2 text-gilt-300">Save a little</p>
          <h2 className="font-display text-display-md text-white">Special Offers</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {PROMO_HIGHLIGHTS.map((promo) => (
              <div key={promo.code} className="rounded-soft bg-white/5 p-5 ring-1 ring-white/10">
                <h3 className="font-display text-lg text-white">{promo.title}</h3>
                <p className="mt-1.5 text-sm text-blush-deep/75">{promo.description}</p>
                <button
                  onClick={() => copyCoupon(promo.code)}
                  className="mt-4 flex items-center gap-2 rounded-pill bg-gilt px-4 py-2 text-xs font-bold text-cocoa-800"
                >
                  <Copy size={13} /> {promo.code}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <Section eyebrow="Loved by customers" title="What people are saying">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-soft bg-white p-5 shadow-card dark:bg-cocoa-800">
                <StarRating rating={t.rating} />
                <p className="mt-3 text-sm text-cocoa-600 dark:text-blush-deep/90">"{t.text}"</p>
                <p className="mt-4 text-sm font-semibold text-cocoa-700 dark:text-blush">{t.customerName}</p>
                {t.cakeOrdered && <p className="text-xs text-cocoa-400">Ordered: {t.cakeOrdered}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <Section eyebrow="From our kitchen" title="Cake Gallery">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {gallery.slice(0, 12).map((g) => (
              <div key={g.id} className="aspect-square overflow-hidden rounded-soft bg-cocoa-100 dark:bg-cocoa-700">
                <img src={g.imageUrl} alt={g.caption || 'Cake'} className="h-full w-full object-cover transition-transform hover:scale-105" loading="lazy" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* CTA */}
      <section className="container-page pb-24">
        <div className="rounded-soft bg-mulberry-500 px-8 py-14 text-center shadow-lift">
          <h2 className="font-display text-display-md text-white">Ready to design your cake?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/85">It takes about 3 minutes — browse, customize, and submit your request.</p>
          <Link to="/cakes" className="mt-6 inline-flex items-center gap-2 rounded-pill bg-white px-7 py-3.5 text-sm font-semibold text-mulberry-600">
            Start Designing <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
