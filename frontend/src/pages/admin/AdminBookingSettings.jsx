import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { Save, Upload, Loader2, DollarSign, FileText, Building2, QrCode, MessageSquareText, ShieldCheck, CreditCard } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import { motion } from "framer-motion";

const inputCls =
  "w-full px-4 py-3 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-900/50 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 focus:bg-white dark:focus:bg-stone-950 transition-all duration-300 text-sm shadow-sm";

const labelCls = "block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const SectionCard = ({ icon: Icon, title, desc, children }) => (
  <motion.div variants={itemVariants} className="group relative overflow-hidden rounded-3xl bg-white/70 dark:bg-stone-900/70 backdrop-blur-2xl border border-stone-200/60 dark:border-stone-800/60 shadow-lg shadow-stone-200/20 dark:shadow-black/20 transition-all duration-500 hover:shadow-xl hover:border-accent-500/30">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-400 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-3xl" />
    <div className="p-6 sm:p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 transform group-hover:scale-105 transition-transform duration-500">
          <Icon size={22} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight">{title}</h3>
          {desc && <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{desc}</p>}
        </div>
      </div>
      <div className="space-y-5">
        {children}
      </div>
    </div>
  </motion.div>
);

const AdminBookingSettings = () => {
  const { token } = useContext(AppContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [config, setConfig] = useState({
    depositPerPerson: 50,
    policyContent: "",
    bankInfo: { bankName: "", accountNumber: "", accountHolder: "", branch: "" },
    qrCodeImage: "",
    transferNoteTemplate: "DEVGO {bookingId}",
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/booking-config`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setConfig(res.data.config);
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [token, backendUrl]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { _id, __v, createdAt, updatedAt, qrCodeImage, ...payload } = config;
      const res = await axios.put(`${backendUrl}/api/admin/booking-config`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setConfig(res.data.config);
        toast.success("Settings saved successfully", { icon: "✓" });
      } else {
        toast.error(res.data.message || "Failed to save");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("qrImage", file);
      const res = await axios.post(`${backendUrl}/api/admin/booking-config/qr`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setConfig(res.data.config);
        toast.success("QR code uploaded successfully");
      } else {
        toast.error(res.data.message || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleBankChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      bankInfo: { ...prev.bankInfo, [field]: value },
    }));
  };

  const fmt = (n) => "$" + n?.toLocaleString("en-US");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 className="w-12 h-12 text-accent-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-32 relative">
      <AdminPageHeader title="Booking Settings" subtitle="Configure deposit amounts, booking policies, and bank transfer details." />

      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="max-w-5xl space-y-8 mt-8"
      >
        {/* Deposit */}
        <SectionCard icon={DollarSign} title="Deposit Rules" desc="Set the required deposit amount per traveler.">
          <div>
            <label className={labelCls}>Amount per person (USD)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <DollarSign size={18} className="text-stone-400" />
              </div>
              <input type="number" min="0" value={config.depositPerPerson} onChange={(e) => handleChange("depositPerPerson", Number(e.target.value))} className={`${inputCls} pl-11 text-lg font-medium`} />
            </div>
            <div className="mt-3 p-3 rounded-xl bg-stone-100/50 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/50 flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
              <ShieldCheck size={16} className="text-accent-500" />
              Example calculation: 2 travelers × {fmt(config.depositPerPerson)} = <span className="font-bold text-accent-600 dark:text-accent-400">{fmt(config.depositPerPerson * 2)} deposit</span>
            </div>
          </div>
        </SectionCard>

        {/* Policy */}
        <SectionCard icon={FileText} title="Booking Policy" desc="Display guidelines and terms users must agree to.">
          <div>
            <label className={labelCls}>Policy Content (Plain text or Markdown)</label>
            <textarea rows={8} value={config.policyContent} onChange={(e) => handleChange("policyContent", e.target.value)} placeholder="Enter your booking terms, cancellation policies, etc." className={`${inputCls} resize-y leading-relaxed`} />
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bank Info */}
          <SectionCard icon={Building2} title="Bank Details" desc="Where should customers transfer the deposit?">
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Bank Name</label>
                <input type="text" value={config.bankInfo.bankName} onChange={(e) => handleBankChange("bankName", e.target.value)} placeholder="e.g. Chase Bank" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Account Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CreditCard size={18} className="text-stone-400" />
                  </div>
                  <input type="text" value={config.bankInfo.accountNumber} onChange={(e) => handleBankChange("accountNumber", e.target.value)} placeholder="e.g. 1234567890" className={`${inputCls} pl-11 tracking-wider`} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Account Holder</label>
                <input type="text" value={config.bankInfo.accountHolder} onChange={(e) => handleBankChange("accountHolder", e.target.value)} placeholder="e.g. JOHN DOE" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Branch (Optional)</label>
                <input type="text" value={config.bankInfo.branch} onChange={(e) => handleBankChange("branch", e.target.value)} placeholder="e.g. New York" className={inputCls} />
              </div>
            </div>
          </SectionCard>

          <div className="space-y-8 flex flex-col">
            {/* Transfer Note */}
            <SectionCard icon={MessageSquareText} title="Transfer Note" desc="Instructions for the transaction message.">
              <div>
                <label className={labelCls}>
                  Template (Use <code className="text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/30 px-1.5 py-0.5 rounded font-mono text-xs">{`{bookingId}`}</code>)
                </label>
                <input type="text" value={config.transferNoteTemplate} onChange={(e) => handleChange("transferNoteTemplate", e.target.value)} placeholder="DEVGO {bookingId}" className={inputCls} />
                <p className="mt-2 text-xs text-stone-500">This helps you easily match transfers to bookings.</p>
              </div>
            </SectionCard>

            {/* QR Code */}
            <SectionCard icon={QrCode} title="QR Code" desc="Upload a payment QR code.">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative group/qr w-40 h-40 shrink-0 rounded-3xl border-2 border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-center overflow-hidden bg-stone-50 dark:bg-stone-800/50 transition-colors hover:border-accent-400">
                  {config.qrCodeImage ? (
                    <>
                      <img src={`${backendUrl}${config.qrCodeImage}`} alt="QR Code" className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button onClick={() => fileInputRef.current?.click()} className="bg-white text-stone-900 px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:scale-105 transition-transform">
                          Change
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <QrCode size={40} className="mx-auto text-stone-300 dark:text-stone-600 mb-2" />
                      <span className="text-sm font-medium text-stone-500">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full text-center sm:text-left mt-2">
                  <p className="text-sm text-stone-600 dark:text-stone-400 mb-4 leading-relaxed">
                    Allow customers to easily scan and pay. Keep the image clear and high-contrast.
                  </p>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleQrUpload} className="hidden" />
                  {!config.qrCodeImage && (
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className="inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all active:scale-95 disabled:opacity-50 shadow-sm">
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      {uploading ? "Uploading..." : "Browse Image"}
                    </button>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </motion.div>

      {/* Sticky Bottom Save Bar */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", damping: 20 }}
        className="fixed bottom-0 left-0 md:left-[260px] lg:left-[280px] right-0 p-4 sm:p-5 bg-white/70 dark:bg-stone-950/70 backdrop-blur-2xl border-t border-stone-200/50 dark:border-stone-800/50 z-40"
      >
        <div className="max-w-5xl flex items-center justify-between">
          <div className="hidden sm:block">
            <h4 className="font-bold text-stone-900 dark:text-white">Unsaved Changes</h4>
            <p className="text-xs text-stone-500">Make sure to save your settings before leaving.</p>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-accent-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminBookingSettings;
