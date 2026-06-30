import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, MapPin, Loader2 } from 'lucide-react';
import { useOrderDraftStore } from '../store/orderDraftStore';
import { orderService } from '../services/orderService';
import OrderStepper from '../components/order/OrderStepper';
import DeliverySlotPicker from '../components/order/DeliverySlotPicker';
import GiftDetailsForm from '../components/order/GiftDetailsForm';
import CouponInput from '../components/order/CouponInput';
import PriceSummary from '../components/cake/PriceSummary';
import { validators } from '../utils/validators';
import { OCCASIONS } from '../constants/referenceData';

const GOOGLE_MAPS_LIBRARIES = ['places'];
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const STEPS = ['Your Details', 'Delivery', 'Review & Submit'];

function MapEnabledAddressField({ value, onChange, onPlaceSelect }) {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries: GOOGLE_MAPS_LIBRARIES });
  const autocompleteRef = useRef(null);

  if (!isLoaded) {
    return <input disabled placeholder="Loading map…" className="w-full rounded-pill border border-cocoa-150 px-4 py-2.5 text-sm dark:border-cocoa-600 dark:bg-cocoa-800" />;
  }

  return (
    <Autocomplete
      onLoad={(ac) => { autocompleteRef.current = ac; }}
      onPlaceChanged={() => {
        const place = autocompleteRef.current?.getPlace();
        if (!place) return;
        const formatted = place.formatted_address || value;
        const loc = place.geometry?.location;
        onPlaceSelect({
          address: formatted,
          lat: loc ? loc.lat() : '',
          lng: loc ? loc.lng() : '',
          mapLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatted)}`
        });
      }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder="Start typing your delivery address…"
        className="w-full rounded-soft border border-cocoa-150 px-4 py-2.5 text-sm dark:border-cocoa-600 dark:bg-cocoa-800"
      />
    </Autocomplete>
  );
}

function PlainAddressField({ value, onChange, mapLink, onMapLinkChange }) {
  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder="Flat / House no., street, landmark, city, pincode"
        className="w-full rounded-soft border border-cocoa-150 px-4 py-2.5 text-sm dark:border-cocoa-600 dark:bg-cocoa-800"
      />
      <div className="flex items-center gap-2">
        <MapPin size={14} className="flex-shrink-0 text-cocoa-300" />
        <input
          value={mapLink}
          onChange={(e) => onMapLinkChange(e.target.value)}
          placeholder="Paste a Google Maps link for precise location (optional)"
          className="w-full rounded-pill border border-cocoa-150 px-3.5 py-2 text-xs dark:border-cocoa-600 dark:bg-cocoa-800"
        />
      </div>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value || '')}`}
        target="_blank" rel="noreferrer"
        className="inline-block text-xs font-semibold text-mulberry-500"
      >
        Open Google Maps to find your location →
      </a>
    </div>
  );
}

export default function OrderForm() {
  const navigate = useNavigate();
  const draft = useOrderDraftStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [latLng, setLatLng] = useState({ lat: '', lng: '' });
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('');

  const methods = useForm({ mode: 'onBlur', defaultValues: { isGift: false } });
  const { register, handleSubmit, trigger, formState: { errors } } = methods;

  if (!draft.cake) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-2xl text-cocoa-700 dark:text-blush">No cake selected yet</h1>
        <p className="mt-2 text-cocoa-400">Pick a cake from the menu to start an order.</p>
        <Link to="/cakes" className="mt-5 inline-block rounded-pill bg-mulberry-500 px-6 py-3 text-sm font-semibold text-white">Browse Cakes</Link>
      </div>
    );
  }

  const pricing = draft.getPricing();

  async function goNext() {
    if (step === 1) {
      const valid = await trigger(['customerName', 'phone', 'email']);
      if (!valid || !address.trim()) {
        if (!address.trim()) toast.error('Please add a delivery address.');
        return;
      }
    }
    if (step === 2) {
      if (!deliveryDate || !deliverySlot) {
        toast.error('Pick a delivery date and slot to continue.');
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  async function onSubmit(formValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formValues,
        address,
        mapLink,
        lat: latLng.lat,
        lng: latLng.lng,
        cakeId: draft.cake.id,
        cakeName: draft.cake.name,
        category: draft.cake.category,
        ...draft.customization,
        weightKg: draft.customization.weightKg === 'custom' ? draft.customization.customWeightKg : draft.customization.weightKg,
        occasion: draft.occasion,
        deliveryDate,
        deliverySlot,
        couponCode: draft.coupon?.code || '',
        basePrice: pricing.basePrice,
        addOnsPrice: pricing.addOnsPrice,
        deliveryCharge: pricing.deliveryCharge,
        discountAmount: pricing.discountAmount,
        totalAmount: pricing.total,
        source: 'Website'
      };

      const result = await orderService.create(payload);

      const fullOrder = { ...payload, orderId: result.orderId, createdAt: result.createdAt };
      sessionStorage.setItem('pn-last-order', JSON.stringify(fullOrder));

      if (result.isDuplicate) {
        toast('We noticed a similar recent order from you — our team will confirm details with you.', { icon: '👀' });
      }

      draft.resetDraft();
      navigate(`/order/confirmation/${result.orderId}`, { state: { order: fullOrder } });
    } catch (err) {
      toast.error(err.message || 'Could not submit your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="mb-2 font-display text-display-md text-cocoa-700 dark:text-blush">Complete Your Order Request</h1>
      <p className="mb-8 text-sm text-cocoa-400">{draft.cake.name} · {draft.customization.weightKg === 'custom' ? draft.customization.customWeightKg : draft.customization.weightKg}kg</p>

      <div className="mb-10 max-w-xl">
        <OrderStepper steps={STEPS} currentStep={step} />
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-5 rounded-soft bg-white p-6 shadow-card dark:bg-cocoa-800">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Full Name</label>
                  <input {...register('customerName', { validate: validators.required('Name') })} className="w-full rounded-pill border border-cocoa-150 px-4 py-2.5 text-sm dark:border-cocoa-600 dark:bg-cocoa-700" />
                  {errors.customerName && <p className="mt-1 text-xs text-red-500">{errors.customerName.message}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Mobile Number</label>
                    <input {...register('phone', { validate: validators.indianPhone })} placeholder="98765 43210" className="w-full rounded-pill border border-cocoa-150 px-4 py-2.5 text-sm dark:border-cocoa-600 dark:bg-cocoa-700" />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Email (optional)</label>
                    <input {...register('email', { validate: validators.email })} className="w-full rounded-pill border border-cocoa-150 px-4 py-2.5 text-sm dark:border-cocoa-600 dark:bg-cocoa-700" />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Delivery Address</label>
                  {GOOGLE_MAPS_API_KEY ? (
                    <MapEnabledAddressField
                      value={address}
                      onChange={setAddress}
                      onPlaceSelect={({ address: a, lat, lng, mapLink: ml }) => { setAddress(a); setLatLng({ lat, lng }); setMapLink(ml); }}
                    />
                  ) : (
                    <PlainAddressField value={address} onChange={setAddress} mapLink={mapLink} onMapLinkChange={setMapLink} />
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 rounded-soft bg-white p-6 shadow-card dark:bg-cocoa-800">
                <DeliverySlotPicker
                  deliveryDate={deliveryDate} deliverySlot={deliverySlot}
                  onDateChange={setDeliveryDate} onSlotChange={setDeliverySlot}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Special Instructions</label>
                  <textarea {...register('specialInstructions')} rows={3} placeholder="Anything our bakers should know?" className="w-full rounded-soft border border-cocoa-150 px-4 py-2.5 text-sm dark:border-cocoa-600 dark:bg-cocoa-700" />
                </div>
                <GiftDetailsForm />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 rounded-soft bg-white p-6 shadow-card dark:bg-cocoa-800">
                <h3 className="font-display text-lg text-cocoa-700 dark:text-blush">Review Your Order</h3>
                <dl className="grid gap-2.5 text-sm sm:grid-cols-2">
                  <div><dt className="text-cocoa-400">Cake</dt><dd className="font-medium text-cocoa-700 dark:text-blush">{draft.cake.name}</dd></div>
                  <div><dt className="text-cocoa-400">Occasion</dt><dd className="font-medium text-cocoa-700 dark:text-blush">{OCCASIONS.find((o) => o.id === draft.occasion)?.label || '—'}</dd></div>
                  <div><dt className="text-cocoa-400">Delivery</dt><dd className="font-medium text-cocoa-700 dark:text-blush">{deliveryDate} · {deliverySlot}</dd></div>
                  <div><dt className="text-cocoa-400">Address</dt><dd className="font-medium text-cocoa-700 dark:text-blush">{address || '—'}</dd></div>
                </dl>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-cocoa-600 dark:text-blush-deep">Have a coupon?</label>
                  <CouponInput orderAmount={pricing.subtotal} coupon={draft.coupon} onApply={draft.applyCoupon} onRemove={draft.removeCoupon} />
                </div>
                <p className="text-xs text-cocoa-400">
                  By submitting, you're sending an order <strong>request</strong> — our team will confirm availability,
                  pricing, and arrange payment & delivery with you directly.
                </p>
              </div>
            )}

            <div className="flex justify-between">
              {step > 1 ? (
                <button type="button" onClick={() => setStep((s) => s - 1)} className="flex items-center gap-1.5 rounded-pill border border-cocoa-200 px-5 py-2.5 text-sm font-semibold text-cocoa-600 dark:border-cocoa-600 dark:text-blush-deep">
                  <ArrowLeft size={15} /> Back
                </button>
              ) : <span />}

              {step < STEPS.length ? (
                <button type="button" onClick={goNext} className="flex items-center gap-1.5 rounded-pill bg-mulberry-500 px-6 py-2.5 text-sm font-semibold text-white">
                  Continue <ArrowRight size={15} />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-pill bg-mulberry-500 px-7 py-3 text-sm font-semibold text-white disabled:opacity-60">
                  {isSubmitting && <Loader2 size={15} className="animate-spin" />} Place Order Request
                </button>
              )}
            </div>
          </div>

          <PriceSummary pricing={pricing} couponCode={draft.coupon?.code} />
        </form>
      </FormProvider>
    </div>
  );
}
