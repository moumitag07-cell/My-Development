import React, { useState } from "react";
import { UserProfile } from "../types";
import { X, Award, ShieldAlert } from "lucide-react";

interface UserProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: UserProfile) => void;
}

export default function UserProfileModal({
  profile,
  isOpen,
  onClose,
  onSave,
}: UserProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);
  const [height, setHeight] = useState(profile.height);
  const [weight, setWeight] = useState(profile.weight);
  const [targetCalories, setTargetCalories] = useState(profile.targetCalories);
  const [goals, setGoals] = useState(profile.goals);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...profile,
      name,
      age: Number(age) || 25,
      gender,
      height: Number(height) || 170,
      weight: Number(weight) || 60,
      targetCalories: Number(targetCalories) || 2000,
      goals,
    });
    onClose();
  };

  return (
    <div id="user-profile-modal-bg" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div 
        id="user-profile-modal-content"
        className="w-full max-w-lg bg-[#111217] rounded-3xl overflow-hidden shadow-2xl border border-[#2c2e3b] max-h-[90vh] flex flex-col"
      >
        {/* Header with Dark Swiss Theme */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#232530] bg-[#14161f]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">Your Health Profile</h2>
                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] font-bold rounded uppercase">Active Settings</span>
              </div>
              <p className="text-xs text-gray-405 text-gray-400 mt-0.5">Configure live metabolic and dietary variables</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-[#1b1c23] rounded-full text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1b1c23] border border-[#2c2d3a] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold transition"
              placeholder="e.g., Jane Miller"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Age (years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                min="1"
                max="120"
                className="w-full px-4 py-2.5 rounded-xl bg-[#1b1c23] border border-[#2c2d3a] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-semibold transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Biological Sex</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1b1c23] border border-[#2c2d3a] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold transition cursor-pointer"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min="50"
                max="250"
                className="w-full px-4 py-2.5 rounded-xl bg-[#1b1c23] border border-[#2c2d3a] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-semibold transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                min="10"
                max="500"
                className="w-full px-4 py-2.5 rounded-xl bg-[#1b1c23] border border-[#2c2d3a] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-semibold transition"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Daily Target Calories (kcal)</label>
            <input
              type="number"
              value={targetCalories}
              onChange={(e) => setTargetCalories(Number(e.target.value))}
              min="500"
              max="10000"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1b1c23] border border-[#2c2d3a] text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-bold transition"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Primary Goals & Focus</label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1b1c23] border border-[#2c2d3a] text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition leading-relaxed text-xs"
              placeholder="e.g., Stabilize glucose indexes, support regular cardiovascular habits, and keep hydrated."
              required
            />
          </div>

          <div className="p-3.5 bg-[#171f1b] rounded-xl border border-emerald-500/20 flex gap-3 text-emerald-400 text-xs">
            <ShieldAlert className="w-5 h-5 shrink-0 text-emerald-400" />
            <p className="leading-snug">
              Note: Telemetry metrics provide a personalized framework for the AI model advisor. Always cross-reference crucial diagnostic selections with your doctor.
            </p>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 flex items-center justify-between gap-3 border-t border-[#232530]">
            <button
              type="button"
              onClick={() => {
                if (window.confirm("This will reset your onboarding preferences and restart the wizard questionnaire. Proceed?")) {
                  onSave({
                    ...profile,
                    onboardingCompleted: false,
                    healthDataConnected: false,
                    connectedProvider: "None"
                  });
                  onClose();
                }
              }}
              className="px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-xl transition text-xs border border-rose-500/20 shrink-0"
            >
              Reset Onboarding
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4.5 py-2.5 bg-[#1c1d24] hover:bg-[#23242e] text-gray-300 font-semibold rounded-xl transition text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-black font-extrabold rounded-xl transition shadow-lg shadow-emerald-400/10 text-xs"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
