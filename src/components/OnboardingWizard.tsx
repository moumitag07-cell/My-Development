import React, { useState } from "react";
import { UserProfile, Vitals } from "../types";
import { 
  Heart, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  User, 
  Flame, 
  Activity, 
  Moon, 
  Droplet, 
  Check, 
  Chrome, 
  TrendingUp, 
  Info,
  Smartphone,
  CheckCircle,
  Plus
} from "lucide-react";

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile, preloadedVitals?: Partial<Vitals>) => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState<number>(24);
  const [gender, setGender] = useState("Female");
  const [height, setHeight] = useState<number>(172);
  const [weight, setWeight] = useState<number>(58);
  
  const [foodHabits, setFoodHabits] = useState("Balanced");
  const [drinkingHabits, setDrinkingHabits] = useState("Social");
  const [smokingHabits, setSmokingHabits] = useState("Non-smoker");
  const [lifestyleHabits, setLifestyleHabits] = useState("Active");
  const [goals, setGoals] = useState("");

  const [connectionProvider, setConnectionProvider] = useState<"Google Fit" | "Apple Health" | "None">("None");
  const [syncStatus, setSyncStatus] = useState<"idle" | "authenticating" | "connected">("idle");
  const [isRegisteredUnderExternal, setIsRegisteredUnderExternal] = useState<boolean | null>(null);

  const prevStep = () => setStep((curr) => Math.max(1, curr - 1));
  const nextStep = () => {
    if (step === 1 && !name.trim()) {
      alert("Please enter a name to configure your personalized dashboard.");
      return;
    }
    setStep((curr) => Math.min(5, curr + 1));
  };

  const handleConnectProvider = (provider: "Google Fit" | "Apple Health") => {
    setConnectionProvider(provider);
    setSyncStatus("authenticating");

    // Smooth delay for an interactive authenticating experience
    setTimeout(() => {
      setSyncStatus("connected");
    }, 1800);
  };

  const handleFinishOnboarding = () => {
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (gender === "Female") bmr -= 161;
    else bmr += 5;

    let factor = 1.25; // Active defaults
    if (lifestyleHabits === "Sedentary") factor = 1.15;
    else if (lifestyleHabits === "Active") factor = 1.45;
    else if (lifestyleHabits === "Extremely Active") factor = 1.65;

    const baselines = Math.round(bmr * factor);
    const targetCalories = goals.toLowerCase().includes("lose") 
      ? baselines - 350 
      : goals.toLowerCase().includes("gain") 
        ? baselines + 300 
        : baselines;

    const finalProfile: UserProfile = {
      name,
      age,
      gender,
      height,
      weight,
      targetCalories: Math.max(1350, targetCalories),
      goals: goals || `Build endurance under a ${foodHabits.toLowerCase()} diet with highly optimized cardiovascular rates.`,
      foodHabits,
      drinkingHabits,
      smokingHabits,
      lifestyleHabits,
      healthDataConnected: connectionProvider !== "None",
      connectedProvider: connectionProvider,
      onboardingCompleted: true
    };

    let preloadedVitals: Partial<Vitals> | undefined = undefined;
    if (connectionProvider !== "None") {
      preloadedVitals = {
        heartRate: connectionProvider === "Google Fit" ? 62 : 66,
        bloodPressure: "116/72",
        waterIntake: 1800,
        sleepDuration: 7.9,
        bloodSugar: 86,
      };
    }

    onComplete(finalProfile, preloadedVitals);
  };

  const getDietPills = () => [
    { id: "Balanced", label: "Balanced / Anything", desc: "No specific restrictions" },
    { id: "Vegetarian", label: "Vegetarian", desc: "No meat, fish or poultry products" },
    { id: "Vegan", label: "Vegan Plant-Based", desc: "100% pure plant based nourishment" },
    { id: "Keto", label: "Ketogenic / Low-Carb", desc: "High healthy lipids, super low carbs" },
    { id: "Mediterranean", label: "Mediterranean Core", desc: "Lean fish, fresh greens & olive oil" },
    { id: "High-Protein", label: "High Protein Builder", desc: "For nitrogen retention and lean muscle build" }
  ];

  const getLifestyleRates = () => [
    { id: "Sedentary", label: "Sedentary (Desk Job)", desc: "Very little walking or outdoor physical recreation" },
    { id: "Lightly Active", label: "Lightly Active", desc: "Gentle walks, yoga, or stretching 1-2 times weekly" },
    { id: "Active", label: "Active & Athletic", desc: "Dedicated cardiovascular or weight training 3-5 days weekly" },
    { id: "Extremely Active", label: "Extremely Active", desc: "Rigorous athletic training and active outdoors daily" }
  ];

  return (
    <div id="onboarding-screen-bg" className="min-h-screen bg-[#07080b] flex items-center justify-center py-12 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Decorative premium glowing circle backdrops */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container Form Box */}
      <div 
        id="onboarding-card-box" 
        className="w-full max-w-xl bg-[#111217] border border-[#23252f] rounded-[32px] shadow-2xl p-6 sm:p-9 relative overflow-hidden flex flex-col justify-between min-h-[580px]"
      >
        
        {/* Banner header indicating high tier dashboard system */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#23252f]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
              <Heart className="text-emerald-400 w-4.5 h-4.5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Onboarding Quest</span>
                <span className="px-1.5 py-0.5 bg-blue-500 text-[8px] font-black text-white rounded">PRO</span>
              </div>
              <h2 className="text-xs font-semibold text-gray-400">Personalized Fitness & Telemetry Engine</h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s}
                className={`h-1 rounded-full transition-all duration-300 ${
                  s === step ? "w-7 bg-emerald-400" : s < step ? "w-3 bg-emerald-600/60" : "w-1.5 bg-[#23252f]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard screen state machines */}
        <div className="flex-1 my-2">
          
          {/* STEP 1: Personal statistics */}
          {step === 1 && (
            <div className="space-y-6 text-left animate-fade-in">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Step 1 of 5</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">First, let's configure your profile</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  We calculate basal metabolic rates and daily metabolic targets based on your personal indicators.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Polly Strong"
                    className="w-full px-4 py-3 rounded-xl bg-[#1b1c23] border border-[#2c2d3a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Age (Years)</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Math.max(1, Number(e.target.value)))}
                      min="1"
                      className="w-full px-4 py-3 rounded-xl bg-[#1b1c23] border border-[#2c2d3a] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sex</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#1b1c23] border border-[#2c2d3a] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold cursor-pointer"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Height (cm)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Math.max(40, Number(e.target.value)))}
                      className="w-full px-4 py-3 rounded-xl bg-[#1b1c23] border border-[#2c2d3a] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Weight (kg)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Math.max(10, Number(e.target.value)))}
                      className="w-full px-4 py-3 rounded-xl bg-[#1b1c23] border border-[#2c2d3a] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Food Habits */}
          {step === 2 && (
            <div className="space-y-6 text-left animate-fade-in">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Step 2 of 5</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1 font-sans">Select your dietary custom</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Food habits allow Dr. Gemini to construct target micro-nutrient ratios and fibers tailored for you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {getDietPills().map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFoodHabits(p.id)}
                    className={`p-3.5 rounded-xl border text-left transition duration-200 ${
                      foodHabits === p.id 
                        ? "border-emerald-400 bg-emerald-500/5 ring-1 ring-emerald-400 text-white" 
                        : "border-[#2c2d3a] hover:border-[#3d3f52] bg-[#17181f] text-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-white">{p.label}</span>
                      {foodHabits === p.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 leading-snug">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: social patterns / toxicology */}
          {step === 3 && (
            <div className="space-y-6 text-left animate-fade-in">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Step 3 of 5</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">Lifestyle & Social toxicology</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Your drinking and smoking habits help customize safety constraints behind heart diagnostics and sleep optimization.
                </p>
              </div>

              <div className="space-y-5">
                {/* Drinking */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Drinking frequency</span>
                  <div className="grid grid-cols-4 gap-2">
                    {["Non-drinker", "Social", "Moderate", "Heavy"].map((dh) => (
                      <button
                        key={dh}
                        type="button"
                        onClick={() => setDrinkingHabits(dh)}
                        className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold text-center transition ${
                          drinkingHabits === dh 
                            ? "bg-emerald-500/10 border-emerald-400 text-emerald-400" 
                            : "bg-[#17181f] border-[#2c2d3a] text-gray-400 hover:border-gray-500"
                        }`}
                      >
                        {dh}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smoking */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Smoking frequency</span>
                  <div className="grid grid-cols-3 gap-2">
                    {["Non-smoker", "Social", "Daily"].map((sh) => (
                      <button
                        key={sh}
                        type="button"
                        onClick={() => setSmokingHabits(sh)}
                        className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold text-center transition ${
                          smokingHabits === sh 
                            ? "bg-emerald-500/10 border-emerald-400 text-emerald-400" 
                            : "bg-[#17181f] border-[#2c2d3a] text-gray-400 hover:border-gray-500"
                        }`}
                      >
                        {sh}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[#141d1a] border border-emerald-500/20 rounded-xl flex gap-3 text-[11px] text-emerald-400 leading-relaxed">
                  <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p>
                    <strong>Why this matters</strong>: High-precision algorithms dynamically track blood circulation anomalies. Recording metabolic variables enables fully individualized summaries.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Lifestyle Habits & Core Health Goals */}
          {step === 4 && (
            <div className="space-y-6 text-left animate-fade-in">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Step 4 of 5</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">Physical Activity Rate</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Active parameters scale calorie limits, carbohydrate thresholds and resting vitals goals.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {getLifestyleRates().map((lr) => (
                    <button
                      key={lr.id}
                      type="button"
                      onClick={() => setLifestyleHabits(lr.id)}
                      className={`p-3.5 rounded-xl border text-left transition duration-150 ${
                        lifestyleHabits === lr.id 
                          ? "border-emerald-400 bg-emerald-500/5 ring-1 ring-emerald-400" 
                          : "border-[#2c2d3a] hover:border-[#3e4055] bg-[#17181f]"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-white">{lr.label}</span>
                        {lifestyleHabits === lr.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 leading-snug">{lr.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Your Prime Goals</label>
                  <input
                    type="text"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder="e.g., Lower blood sugar, lose 4kg, or track sleep patterns"
                    className="w-full px-4 py-3 rounded-xl bg-[#1b1c23] border border-[#2c2d3a] text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Connect Health Application Databases */}
          {step === 5 && (
            <div className="space-y-6 text-left animate-fade-in">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Step 5 of 5</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">Connect Wearables or Health Apps</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Are you already registered with health tracking systems? Synchronize Google Fit or Apple Health to seamlessly feed core diagnostic markers.
                </p>
              </div>

              {isRegisteredUnderExternal === null ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Device Registration Status:</h4>
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      type="button"
                      onClick={() => setIsRegisteredUnderExternal(true)}
                      className="p-5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-[#2c2d3a] hover:border-emerald-500/40 rounded-2xl text-center flex flex-col items-center justify-center gap-2 group transition"
                    >
                      <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold text-gray-200">Yes, already registered</span>
                      <p className="text-[9px] text-gray-500 max-w-[150px] leading-normal">Instantly hook existing wearable databases</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRegisteredUnderExternal(false)}
                      className="p-5 bg-blue-500/5 hover:bg-blue-500/10 border border-[#2c2d3a] hover:border-blue-500/40 rounded-2xl text-center flex flex-col items-center justify-center gap-2 group transition"
                    >
                      <Plus className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition" />
                      <span className="text-xs font-bold text-gray-200">No, Register & Create New</span>
                      <p className="text-[9px] text-gray-500 max-w-[150px] leading-normal">Open clean local diagnostic storage profiles</p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {isRegisteredUnderExternal ? "Sign in to Wearables API" : "Create Registration Credentials"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisteredUnderExternal(null);
                        setConnectionProvider("None");
                        setSyncStatus("idle");
                      }}
                      className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      Change Status
                    </button>
                  </div>

                  {syncStatus === "idle" && (
                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={() => handleConnectProvider("Google Fit")}
                        className="w-full p-3.5 bg-[#17181f] hover:bg-[#1b1c25] border border-[#2c2d3a] rounded-xl transition flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/30">
                            <Chrome className="w-4.5 h-4.5 text-blue-400" />
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-bold text-white block">Connect Google Fit</span>
                            <span className="text-[10px] text-gray-400">Sync sugar indices and cardio values</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleConnectProvider("Apple Health")}
                        className="w-full p-3.5 bg-[#17181f] hover:bg-[#1b1c25] border border-[#2c2d3a] rounded-xl transition flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
                            <Smartphone className="w-4.5 h-4.5 text-rose-400" />
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-bold text-white block">Sync Apple Health Desktop</span>
                            <span className="text-[10px] text-gray-400">Access daily active metabolic rings</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setConnectionProvider("None");
                          handleFinishOnboarding();
                        }}
                        className="w-full py-2.5 bg-[#1c1d24] hover:bg-[#23242e] rounded-xl text-xs font-bold text-gray-300 text-center transition"
                      >
                        Launch Direct Manual Logging
                      </button>
                    </div>
                  )}

                  {syncStatus === "authenticating" && (
                    <div className="border border-[#2c2d3a] rounded-xl p-8 text-center bg-[#17181f] space-y-3.5">
                      <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest">Opening Secure Connection popup</h4>
                        <p className="text-[10px] text-gray-400 max-w-sm mx-auto leading-normal mt-1">
                          Hooking securely to standard health telemetry. Confirm authorization in the active browser segment for `{connectionProvider}`.
                        </p>
                      </div>
                    </div>
                  )}

                  {syncStatus === "connected" && (
                    <div className="border border-emerald-500/20 rounded-xl p-5 text-center bg-emerald-500/5 space-y-3.5">
                      <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                        <Check className="w-4.5 h-4.5" />
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">Wearable Link Enabled</h4>
                        <p className="text-[10px] text-gray-300 max-w-xs mx-auto leading-normal mt-1">
                          Successfully pulled latest health snapshots from {connectionProvider}. Standard fasting parameters were applied.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto text-left text-[10px] bg-[#14151b] p-3 border border-[#2c2d3a] rounded-xl">
                        <div>
                          <span className="text-gray-400">Preloaded Heart:</span>
                          <span className="float-right font-mono font-bold text-white">{connectionProvider === "Google Fit" ? "62" : "66"} bpm</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Blood Sugar:</span>
                          <span className="float-right font-mono font-bold text-white">86 mg/dL</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Sleep cycles:</span>
                          <span className="float-right font-mono font-bold text-white">7.9 hr</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Provider state:</span>
                          <span className="float-right text-emerald-400 font-bold">Encrypted</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Action Controls footer button links */}
        <div className="mt-8 pt-5 border-t border-[#23252f] flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1 text-xs transition ${
              step === 1 ? "opacity-20 cursor-not-allowed text-gray-600" : "hover:bg-[#1b1c23] text-gray-400 hover:text-white"
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-black font-extrabold rounded-xl shadow-lg shadow-emerald-400/10 transition flex items-center gap-1 text-xs"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishOnboarding}
              disabled={isRegisteredUnderExternal === null}
              className="px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-black font-black rounded-xl shadow-lg shadow-emerald-400/10 text-xs tracking-wider uppercase transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Initialize Deep Dashboard
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
