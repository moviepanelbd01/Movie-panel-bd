import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Movie } from '../types/index.ts';
import { api } from '../services/api.ts';

interface DMCAComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMovie?: Movie | null;
}

export const DMCAComplaintModal: React.FC<DMCAComplaintModalProps> = ({
  isOpen,
  onClose,
  targetMovie,
}) => {
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [rightsOwner, setRightsOwner] = useState('');
  const [reason, setReason] = useState('Unauthorized Distribution');
  const [details, setDetails] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.submitReport({
        movieId: targetMovie ? targetMovie.id : 'general-inquiry',
        movieTitle: targetMovie ? targetMovie.title : 'General Takedown Inquiry',
        reporterName: reporterName.trim(),
        reporterEmail: reporterEmail.trim(),
        rightsOwner: rightsOwner.trim() || reporterName.trim(),
        reason,
        details: details.trim(),
        proofUrl: proofUrl.trim() || undefined,
      });

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#12141c] border border-white/10 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-600/20 text-red-500 rounded-xl border border-red-600/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              DMCA & Copyright Takedown Request
            </h3>
            <p className="text-xs text-zinc-400">
              {targetMovie ? `Regarding: "${targetMovie.title}"` : 'Intellectual property infringement notification'}
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-display font-bold text-base text-white">
              Complaint Registered
            </h4>
            <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
              Your takedown request has been recorded in the MOVIE PANEL BD administrator queue. Our compliance team will audit the license rights and take appropriate action within 24 hours.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Full Name / Legal Agent *
                </label>
                <input
                  type="text"
                  required
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Contact Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Original Copyright Owner / Studio *
              </label>
              <input
                type="text"
                required
                value={rightsOwner}
                onChange={(e) => setRightsOwner(e.target.value)}
                placeholder="e.g. Chorki, Hoichoi, SVF, Warner Bros, Independent"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Reason for Complaint
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:border-red-600 focus:outline-none"
              >
                <option value="Unauthorized Distribution">Unauthorized Distribution</option>
                <option value="Copyright Trademark Infringement">Copyright Trademark Infringement</option>
                <option value="Pirated Copy / Leak">Pirated Copy / Leak</option>
                <option value="Defamatory / Harmful Content">Defamatory / Harmful Content</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Statement & Evidence Details *
              </label>
              <textarea
                rows={3}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain why this content infringes your rights with reference links..."
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:border-red-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg cursor-pointer font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg cursor-pointer"
              >
                {loading ? 'Submitting...' : 'Submit Takedown Notice'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
