import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  Sparkles,
  Shield,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Animation variants
───────────────────────────────────────────── */
const pageVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.15 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut", delay: 0.1 + i * 0.08 },
  }),
};

/* ─────────────────────────────────────────────
   Progress step indicator
───────────────────────────────────────────── */
const steps = ["Your Info", "Review", "Confirm"];

const ProgressIndicator = ({ currentStep }) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {steps.map((step, idx) => {
      const isCompleted = idx < currentStep;
      const isActive = idx === currentStep;
      return (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors
                ${
                  isActive
                    ? "bg-accent-600 border-accent-600 text-white shadow-lg shadow-accent-500/30"
                    : isCompleted
                      ? "bg-accent-100 dark:bg-accent-900/30 border-accent-400 text-accent-600 dark:text-accent-400"
                      : "bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500"
                }`}
            >
              {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
            </div>
            <span
              className={`mt-1.5 text-xs font-medium ${
                isActive
                  ? "text-accent-600 dark:text-accent-400"
                  : isCompleted
                    ? "text-accent-500 dark:text-accent-400"
                    : "text-stone-400 dark:text-stone-500"
              }`}
            >
              {step}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`h-0.5 w-16 mx-1 mb-5 rounded-full transition-colors ${
              idx < currentStep ? "bg-accent-400" : "bg-stone-200 dark:bg-stone-700"
            }`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ─────────────────────────────────────────────
   Reusable input wrapper with icon
───────────────────────────────────────────── */
const InputWrapper = ({ icon: Icon, children }) => (
  <div className="relative">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none">
      <Icon size={18} />
    </div>
    {children}
  </div>
);

/* ─────────────────────────────────────────────
   Shared class strings
───────────────────────────────────────────── */
const inputCls =
  "w-full pl-11 pr-4 py-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all";

const selectCls =
  "w-full pl-11 pr-4 py-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all appearance-none";

const textareaCls =
  "w-full px-4 py-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all resize-none";

/* ─────────────────────────────────────────────
   Section header
───────────────────────────────────────────── */
const SectionHeader = ({ label }) => (
  <p className="text-xs uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400 mb-4">
    {label}
  </p>
);

/* ─────────────────────────────────────────────
   Field label
───────────────────────────────────────────── */
const FieldLabel = ({ children }) => (
  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
    {children}
  </label>
);

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const Booking = () => {
  const { user, token } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const tour = location.state?.tour;

  if (!tour || !user) {
    return navigate("/login");
  }

  const { _id: tourId, title, price } = tour;

  /* Resolve photo URL */
  const photoUrl =
    tour.photo && tour.photo.startsWith("http")
      ? tour.photo
      : `${import.meta.env.VITE_BACKEND_URL}${tour.photo || ""}`;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    travelers: 1,
    startDate: location.state?.selectedDate || "",
    specialRequests: "",
  });

  const [totalPrice, setTotalPrice] = useState(price);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [bookingConfig, setBookingConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/booking-config`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setBookingConfig(data.config);
      } catch (err) {
        console.error("Failed to load booking config:", err);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, [token, backendUrl]);

  const depositAmount = bookingConfig
    ? bookingConfig.depositPerPerson * parseInt(formData.travelers, 10)
    : 0;

  const validateStep0 = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.startDate) {
      toast.error("Please fill in all required fields.");
      return false;
    }
    if (parseInt(formData.travelers, 10) < 1) {
      toast.error("At least 1 traveler is required.");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 0 && !validateStep0()) return;
    if (currentStep === 1 && !policyAccepted) {
      toast.error("Please accept the booking policy to continue.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  /* ── handlers ───────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${backendUrl}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            tourId,
            policyAcceptedAt: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create booking");
      }

      const data = await response.json();
      toast.success("Booking successful!");
      navigate("/invoice", { state: { booking: data.booking, bookingConfig } });
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── total price recalculation ──────────── */
  useEffect(() => {
    setTotalPrice(price * parseInt(formData.travelers, 10));
  }, [formData.travelers, price]);

  /* ── maxTravelers ───────────────────────── */
  const selectedDateObj = tour.availableDates?.find(
    (d) => (typeof d === "string" ? d : d.date) === formData.startDate
  );
  const maxTravelers = selectedDateObj?.remainingSlots ?? tour.maxGroupSize;

  /* ── price formatting ───────────────────── */
  const fmt = (n) => "$" + n?.toLocaleString("en-US");

  /* ─────────────────────────────────────────
     Render
  ───────────────────────────────────────── */
  return user ? (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-[Outfit]">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">

        {/* ── Breadcrumb / Back link ── */}
        <motion.button
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-accent-600 dark:hover:text-accent-400 transition-colors mb-8 group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Go back
        </motion.button>

        {/* ── Page title ── */}
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Book Your Tour
          </h1>
          <p className="mt-2 text-stone-500 dark:text-stone-400">
            Complete the details below to confirm your trip
          </p>
        </motion.div>

        {/* ── Progress indicator ── */}
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
          <ProgressIndicator currentStep={currentStep} />
        </motion.div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

          {/* ══════════════════════════════════════
              LEFT COLUMN — Form
          ══════════════════════════════════════ */}
          <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
          >
            {currentStep === 0 && (
              <form className="space-y-6">

              {/* Section 1 — Personal info */}
              <motion.div
                custom={0}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm"
              >
                <SectionHeader label="Personal Information" />
                <div className="space-y-5">

                  <div>
                    <FieldLabel>Full Name *</FieldLabel>
                    <InputWrapper icon={User}>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Smith"
                        className={inputCls}
                        required
                      />
                    </InputWrapper>
                  </div>

                  <div>
                    <FieldLabel>Email *</FieldLabel>
                    <InputWrapper icon={Mail}>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                        className={inputCls}
                        required
                      />
                    </InputWrapper>
                  </div>

                  <div>
                    <FieldLabel>Phone Number *</FieldLabel>
                    <InputWrapper icon={Phone}>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0912 345 678"
                        className={inputCls}
                        required
                      />
                    </InputWrapper>
                  </div>

                </div>
              </motion.div>

              {/* Section 2 — Trip details */}
              <motion.div
                custom={1}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm"
              >
                <SectionHeader label="Trip Details" />
                <div className="space-y-5">

                  {/* Start Date */}
                  <div>
                    <FieldLabel>Departure Date *</FieldLabel>
                    {tour.availableDates && tour.availableDates.length > 0 ? (
                      <InputWrapper icon={Calendar}>
                        <select
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          className={selectCls}
                          required
                        >
                          <option value="" disabled>
                            Select an available date
                          </option>
                          {tour.availableDates.map((d, index) => {
                            const dateStr =
                              typeof d === "string" ? d : d.date;
                            const remaining =
                              typeof d === "string" ? null : d.remainingSlots;
                            const isSoldOut =
                              remaining !== null && remaining <= 0;
                            return (
                              <option
                                key={index}
                                value={dateStr}
                                disabled={isSoldOut}
                              >
                                {dateStr}
                                {remaining !== null
                                  ? ` (${remaining} slots left)`
                                  : ""}
                                {isSoldOut ? " — Sold out" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </InputWrapper>
                    ) : (
                      <InputWrapper icon={Calendar}>
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          className={inputCls}
                          required
                        />
                      </InputWrapper>
                    )}
                  </div>

                  {/* Number of travelers */}
                  <div>
                    <FieldLabel>Number of Travelers *</FieldLabel>
                    <InputWrapper icon={Users}>
                      <input
                        type="number"
                        name="travelers"
                        min="1"
                        max={formData.startDate ? maxTravelers : undefined}
                        value={formData.travelers}
                        onChange={(e) => {
                          let val = parseInt(e.target.value, 10);
                          if (formData.startDate && val > maxTravelers)
                            val = maxTravelers;
                          handleChange({
                            target: { name: "travelers", value: val },
                          });
                        }}
                        className={inputCls}
                      />
                    </InputWrapper>
                    {formData.startDate && maxTravelers != null && (
                      <p className="mt-1.5 text-xs text-stone-400 dark:text-stone-500">
                        Max {maxTravelers} travelers for this date
                      </p>
                    )}
                  </div>

                </div>
              </motion.div>

              {/* Section 3 — Special requests */}
              <motion.div
                custom={2}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm"
              >
                <SectionHeader label="Special Requests" />
                <FieldLabel>Additional notes (optional)</FieldLabel>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  rows={4}
                  placeholder="e.g. sea view room, vegetarian meal, wheelchair access…"
                  className={textareaCls}
                />
              </motion.div>

              {/* Next button */}
              <motion.button custom={3} variants={sectionVariants} initial="hidden" animate="visible"
                type="button" onClick={handleNextStep}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 bg-accent-700 hover:bg-accent-800 text-white font-semibold text-base py-4 rounded-xl shadow-lg shadow-accent-700/25 transition-colors">
                Continue to Policy <ArrowRight size={18} />
              </motion.button>

            </form>
            )}

            {currentStep === 1 && (
              <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-6">
                 {/* Policy & Deposit content */}
                 <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
                   <SectionHeader label="Booking Policy" />
                   <div className="whitespace-pre-wrap text-sm text-stone-600 dark:text-stone-300 mb-6">{bookingConfig?.policyContent}</div>
                   <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
                      <input type="checkbox" id="policyAccept" checked={policyAccepted} onChange={(e) => setPolicyAccepted(e.target.checked)} className="w-5 h-5 accent-accent-600 rounded" />
                      <label htmlFor="policyAccept" className="text-sm text-stone-700 dark:text-stone-200 cursor-pointer select-none font-medium">I have read and agree to the booking policy.</label>
                   </div>
                 </div>
                 <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
                    <SectionHeader label="Deposit & Payment" />
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      Required deposit per person is <span className="font-semibold text-stone-900 dark:text-stone-100">{fmt(bookingConfig?.depositPerPerson)}</span>. <br/>
                      Total deposit required for {formData.travelers} travelers: <span className="text-accent-600 dark:text-accent-400 font-bold text-lg">{fmt(depositAmount)}</span>
                    </p>
                    {bookingConfig?.bankInfo && (
                       <div className="bg-stone-50 dark:bg-stone-800 p-5 rounded-2xl text-sm space-y-2 border border-stone-200 dark:border-stone-700/50">
                         <div className="flex gap-2 items-start"><span className="text-stone-500 w-24">Bank:</span><span className="font-medium">{bookingConfig.bankInfo.bankName}</span></div>
                         <div className="flex gap-2 items-start"><span className="text-stone-500 w-24">Account:</span><span className="font-medium text-lg text-accent-700 dark:text-accent-400">{bookingConfig.bankInfo.accountNumber}</span></div>
                         <div className="flex gap-2 items-start"><span className="text-stone-500 w-24">Name:</span><span className="font-medium">{bookingConfig.bankInfo.accountHolder}</span></div>
                         {bookingConfig.bankInfo.branch && <div className="flex gap-2 items-start"><span className="text-stone-500 w-24">Branch:</span><span className="font-medium">{bookingConfig.bankInfo.branch}</span></div>}
                         <div className="flex gap-2 items-start mt-2 pt-2 border-t border-stone-200 dark:border-stone-700"><span className="text-stone-500 w-24">Transfer Note:</span><span className="font-medium italic text-stone-700 dark:text-stone-300">{bookingConfig.transferNoteTemplate}</span></div>
                       </div>
                    )}
                    {bookingConfig?.qrCodeImage && (
                       <div className="mt-6 flex flex-col items-center">
                         <p className="text-xs text-stone-500 uppercase tracking-wide font-semibold mb-3">Scan to Pay</p>
                         <img src={`${backendUrl}${bookingConfig.qrCodeImage}`} alt="QR" className="w-56 h-56 object-contain rounded-xl border border-stone-200 dark:border-stone-700 p-2 bg-white" />
                       </div>
                    )}
                 </div>
                 <div className="flex gap-4">
                    <button type="button" onClick={handlePrevStep} className="w-1/3 py-4 rounded-xl font-semibold border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">Back</button>
                    <button type="button" onClick={handleNextStep} className="w-2/3 py-4 rounded-xl font-semibold bg-accent-700 hover:bg-accent-800 text-white shadow-lg shadow-accent-700/25 transition-colors flex items-center justify-center gap-2">
                      Review Booking <ArrowRight size={18} />
                    </button>
                 </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-6">
                 <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
                   <SectionHeader label="Confirm Booking" />
                   <div className="space-y-3 text-sm">
                     <p className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800/50"><span className="text-stone-500">Name</span> <span className="font-medium text-stone-900 dark:text-stone-100">{formData.name}</span></p>
                     <p className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800/50"><span className="text-stone-500">Email</span> <span className="font-medium text-stone-900 dark:text-stone-100">{formData.email}</span></p>
                     <p className="flex justify-between items-center py-2"><span className="text-stone-500">Phone</span> <span className="font-medium text-stone-900 dark:text-stone-100">{formData.phone}</span></p>
                   </div>
                 </div>
                 <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 flex gap-3 text-sm items-start">
                    <Shield size={20} className="shrink-0 mt-0.5" />
                    <p>Please note: Your booking will remain pending until the bank transfer of <span className="font-bold">{fmt(depositAmount)}</span> is confirmed by our staff.</p>
                 </div>
                 <div className="flex gap-4">
                    <button type="button" onClick={handlePrevStep} disabled={isSubmitting} className="w-1/3 py-4 rounded-xl font-semibold border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors disabled:opacity-50">Back</button>
                    <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="w-2/3 py-4 rounded-xl font-semibold bg-accent-700 hover:bg-accent-800 text-white shadow-lg shadow-accent-700/25 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                      {isSubmitting ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Processing…
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={18} /> Confirm Booking
                        </>
                      )}
                    </button>
                 </div>
              </motion.div>
            )}
          </motion.div>

          {/* ══════════════════════════════════════
              RIGHT COLUMN — Sticky Tour Summary
          ══════════════════════════════════════ */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="lg:sticky lg:top-6"
          >
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">

              {/* Tour photo */}
              <div className="relative h-48 bg-stone-200 dark:bg-stone-800">
                {tour.photo ? (
                  <img
                    src={photoUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <MapPin size={40} />
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {/* City badge */}
                {tour.city && (
                  <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/30">
                    <MapPin size={11} />
                    {tour.city}
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="p-6 space-y-5">

                {/* Tour title */}
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug">
                  {title}
                </h3>

                {/* Quick info pills */}
                <div className="flex flex-wrap gap-2">
                  {tour.distance && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-full">
                      <Clock size={12} />
                      {tour.distance} km
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-700 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/30 px-3 py-1.5 rounded-full">
                    {fmt(price)} / person
                  </span>
                </div>

                {/* Divider */}
                <hr className="border-stone-100 dark:border-stone-800" />

                {/* Selected booking info */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-500 dark:text-stone-400">
                      Departure Date
                    </span>
                    <span className="font-medium text-stone-800 dark:text-stone-200">
                      {formData.startDate ? (
                        formData.startDate
                      ) : (
                        <span className="text-stone-400 italic">Not selected</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 dark:text-stone-400">
                      Travelers
                    </span>
                    <span className="font-medium text-stone-800 dark:text-stone-200">
                      {formData.travelers} travelers
                    </span>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 space-y-2.5 text-sm">
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>
                      {fmt(price)} × {formData.travelers} travelers
                    </span>
                    <span>{fmt(totalPrice)}</span>
                  </div>
                  <hr className="border-stone-200 dark:border-stone-700" />
                  <div className="flex justify-between font-bold text-base">
                    <span className="text-stone-900 dark:text-stone-100">
                      Total
                    </span>
                    <span className="text-accent-600 dark:text-accent-400 text-lg">
                      {fmt(totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Trust note */}
                <p className="text-xs text-center text-stone-400 dark:text-stone-500">
                  🔒 Your information is fully secured
                </p>

              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  ) : (
    <div className="text-center mt-20 text-stone-600 dark:text-stone-400">
      Please log in to make a booking.
    </div>
  );
};

export default Booking;
