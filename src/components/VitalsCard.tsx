import React, { useState } from "react";
import { 
  Heart, 
  Activity, 
  Moon, 
  Droplet, 
  TrendingUp, 
  Plus, 
  ChevronRight, 
  Sparkle,
  PenLine
} from "lucide-react";
import { Vitals } from "../types";

interface VitalsCardProps {
  type: keyof Vitals;
  value: any;
  onUpdate: (type: keyof Vitals, newValue: any) => void;
}

export default function VitalsCard({ type, value, onUpdate }: VitalsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      let finalValue: any = inputValue;
      if (type !== "bloodPressure") {
        finalValue = Number(inputValue);
      }
      onUpdate(type, finalValue);
      setIsEditing(false);
      setInputValue("");
    }
  };

  const handleQuickWater = (amount: number) => {
    if (type === "waterIntake") {
      const current = Number(value) || 0;
      onUpdate("waterIntake", current + amount);
    }
  };

  const getCardConfig = () => {
    switch (type) {
      case "heartRate":
        return {
          title: "Heart Rate",
          unit: "bpm",
          icon: Heart,
          color: "text-rose-400",
          bgColor: "bg-rose-500/10",
          borderColor: "border-rose-500/20",
          status: value < 60 ? "Bradycardia (Slow)" : value > 100 ? "Elevated" : "Optimal Rest",
          statusColor: value < 60 ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" : value > 100 ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" : "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
          placeholder: "e.g., 72",
          step: "1",
        };
      case "bloodPressure":
        return {
          title: "Blood Pressure",
          unit: "mmHg",
          icon: Activity,
          color: "text-cyan-400",
          bgColor: "bg-cyan-500/10",
          borderColor: "border-cyan-500/20",
          status: "Optimal parameters",
          statusColor: "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20",
          placeholder: "e.g., 115/75",
          step: "any",
        };
      case "waterIntake":
        return {
          title: "Water Intake",
          unit: "ml",
          icon: Droplet,
          color: "text-blue-400",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/20",
          status: value >= 2000 ? "Met limits!" : `${Math.max(0, 2000 - value)}ml left`,
          statusColor: value >= 2000 ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-blue-400 bg-blue-500/10 border border-blue-500/20",
          placeholder: "e.g., 250",
          step: "50",
        };
      case "sleepDuration":
        return {
          title: "Sleep Duration",
          unit: "hr",
          icon: Moon,
          color: "text-purple-400",
          bgColor: "bg-purple-500/10",
          borderColor: "border-purple-500/20",
          status: value < 7 ? "Deficit" : "Excellent sleep",
          statusColor: value < 7 ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" : "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
          placeholder: "e.g., 7.5",
          step: "0.1",
        };
      case "bloodSugar":
        return {
          title: "Blood Sugar",
          unit: "mg/dL",
          icon: Sparkle,
          color: "text-amber-400",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/20",
          status: value < 70 ? "Below limits" : value > 140 ? "Elevated" : "Stable glycemia",
          statusColor: value < 70 ? "text-rose-450 bg-rose-500/10 border border-rose-500/20 text-rose-400" : value > 140 ? "text-amber-405 bg-amber-500/10 border border-amber-500/20 text-amber-400" : "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
          placeholder: "e.g., 90",
          step: "1",
        };
      default:
        return {
          title: "Vital Tracking",
          unit: "",
          icon: TrendingUp,
          color: "text-gray-400",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/20",
          status: "Logged",
          statusColor: "text-gray-400 bg-gray-500/10 border border-gray-500/20",
          placeholder: "Value",
          step: "1",
        };
    }
  };

  const config = getCardConfig();
  const IconComponent = config.icon;

  return (
    <div 
      id={`vitals-card-${type}`} 
      className="relative bg-[#17181f]/95 border border-[#2c2d3a] rounded-3xl p-5 shadow-lg transition duration-200 hover:border-emerald-400/40 hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between h-[210px]"
    >
      {/* Background decoration matching dark luxury dashboard */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-5 blur-2xl ${config.bgColor}`} />

      {/* Upper Segment */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-[#20212b]/80 border ${config.borderColor} flex items-center justify-center`}>
              <IconComponent className={`w-4 h-4 ${config.color}`} />
            </div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{config.title}</h3>
          </div>
          
          <button 
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 hover:bg-[#20212c] rounded-lg text-gray-400 hover:text-white transition"
            title="Log new observation"
          >
            <PenLine className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Value Area */}
        {!isEditing ? (
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="font-sans text-3xl font-extrabold text-white tracking-tight">
              {type === "waterIntake" ? (value || 0).toLocaleString() : value || "--"}
            </span>
            {config.unit && (
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{config.unit}</span>
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} className="mt-2 text-left">
            <div className="flex gap-1.5">
              <input
                type={type === "bloodPressure" ? "text" : "number"}
                step={config.step}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={config.placeholder}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#20212c] border border-[#2d2f3d] text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition"
                autoFocus
                required
              />
              <button 
                type="submit"
                className="py-1.5 px-3 rounded-lg text-[10px] font-bold text-white bg-emerald-400 hover:bg-emerald-500 hover:text-black transition uppercase tracking-wider shrink-0"
              >
                Log
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer Area with Status Badge */}
      <div className="mt-auto pt-3">
        {type === "waterIntake" && !isEditing && (
          <div className="flex items-center gap-1.5 mb-2.5">
            <button
              type="button"
              onClick={() => handleQuickWater(250)}
              className="px-2 py-0.5 text-[9px] font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition flex items-center gap-0.5 border border-blue-500/20"
            >
              <Plus className="w-3 h-3" /> 250
            </button>
            <button
              type="button"
              onClick={() => handleQuickWater(500)}
              className="px-2 py-0.5 text-[9px] font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition flex items-center gap-0.5 border border-blue-500/20"
            >
              <Plus className="w-3 h-3" /> 500
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide inline-block ${config.statusColor}`}>
            {config.status}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </div>
      </div>
    </div>
  );
}
