import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Flame, 
  Activity, 
  Moon, 
  Droplet, 
  Sparkles, 
  User, 
  Calendar, 
  Plus, 
  ListRestart, 
  ArrowRight, 
  Brain, 
  ChevronRight, 
  UserCheck, 
  Coffee,
  CheckCircle,
  HelpCircle,
  ShieldPlus,
  Send,
  Loader2,
  Lock,
  X,
  Chrome,
  Smartphone,
  Bell,
  Star,
  Zap,
  TrendingUp,
  Award
} from "lucide-react";
import { UserProfile, Vitals, MealLog, ChatMessage } from "./types";
import UserProfileModal from "./components/UserProfileModal";
import VitalsCard from "./components/VitalsCard";
import NutritionRing from "./components/NutritionRing";
import PhotoLogger from "./components/PhotoLogger";
import OnboardingWizard from "./components/OnboardingWizard";

// Default Profile Definition
const DEFAULT_PROFILE: UserProfile = {
  name: "",
  age: 26,
  gender: "Female",
  height: 172,
  weight: 64,
  targetCalories: 2100,
  goals: "Improve functional strength and maintain visual caloric deconstruction database",
  foodHabits: "Balanced",
  drinkingHabits: "Social",
  smokingHabits: "Non-smoker",
  lifestyleHabits: "Active",
  healthDataConnected: false,
  connectedProvider: "None",
  onboardingCompleted: false,
};

// Default Vitals Definition
const DEFAULT_VITALS: Vitals = {
  heartRate: 68,
  bloodPressure: "116/74",
  waterIntake: 1450,
  sleepDuration: 7.5,
  bloodSugar: 92,
};

// Default Mock Meal list for premium feel on boot
const DEFAULT_MEALS: MealLog[] = [
  {
    id: "m01",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
    foodName: "Warm Blueberry Oatmeal Bowl with Almonds",
    calories: 340,
    protein: 11,
    carbs: 48,
    fat: 9,
    fiber: 8,
    confidence: 0.96,
    description: "Steel-cut oats compiled with rich source fibers, direct fresh antioxidants blueberries, visual almonds flakes containing good fats.",
    suggestions: "Outstanding fiber dose. Consider pairing with a scoop of high-quality whey or vegan protein to balance macro-intake targets."
  },
  {
    id: "m02",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1h ago
    foodName: "Lemon Garlic Grilled Salmon & Wild Quinoa",
    calories: 580,
    protein: 44,
    carbs: 32,
    fat: 22,
    fiber: 5,
    confidence: 0.94,
    description: "Lean Atlantic salmon fillet grilled to perfection, seasoned with heart-friendly cold olive oil and fresh parsley, over a bed of protein-dense quinoa fiber grains.",
    suggestions: "Fabulous omega-3 composition. The wild grains maintain low insulin releases, making it superb for cardiovascular durability."
  }
];

// Contextual AI advisor default starter prompts
const STARTER_PROMPTS = [
  "How does my water intake today affect my average blood pressure parameters?",
  "Recommend a low-glycemic high-protein dinner formulation.",
  "Evaluate my current sleep duration against optimal circadian rhythms.",
  "What parameters should I review with my doctor regarding my blood sugar levels?"
];

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("health_user_profile");
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [vitals, setVitals] = useState<Vitals>(() => {
    const saved = localStorage.getItem("health_user_vitals");
    return saved ? JSON.parse(saved) : DEFAULT_VITALS;
  });

  const [meals, setMeals] = useState<MealLog[]>(() => {
    const saved = localStorage.getItem("health_user_meals");
    return saved ? JSON.parse(saved) : DEFAULT_MEALS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("health_user_chat_msg");
    const parsed = saved ? JSON.parse(saved) : [];
    if (parsed.length === 0) {
      return [
        {
          id: "welcome-coach",
          role: "assistant",
          text: `Hi there! I'm your **personal AI Advisor & Health Coach**. I've synchronized your vitals logs, hydration counts, and latest meal entries.\n\nAsk me anything about optimizing your nutrition, stabilizing blood sugar levels, or creating an exercise schedule matching your goals!`,
          timestamp: new Date().toISOString()
        }
      ];
    }
    return parsed;
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "coach">("summary");
  
  const [weeklyAdvisory, setWeeklyAdvisory] = useState<string | null>(() => {
    return localStorage.getItem("health_user_advisory") || null;
  });
  const [generatingAdvisory, setGeneratingAdvisory] = useState(false);
  const [selectedMealForDetail, setSelectedMealForDetail] = useState<MealLog | null>(null);

  // Chat Interface state
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("health_user_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("health_user_vitals", JSON.stringify(vitals));
  }, [vitals]);

  useEffect(() => {
    localStorage.setItem("health_user_meals", JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem("health_user_chat_msg", JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    if (weeklyAdvisory) {
      localStorage.setItem("health_user_advisory", weeklyAdvisory);
    } else {
      localStorage.removeItem("health_user_advisory");
    }
  }, [weeklyAdvisory]);

  // Aggregate macros today
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, r) => sum + r.protein, 0);
  const totalCarbs = meals.reduce((sum, r) => sum + r.carbs, 0);
  const totalFat = meals.reduce((sum, r) => sum + r.fat, 0);
  const totalFiber = meals.reduce((sum, r) => sum + r.fiber, 0);

  const summaryLogs = {
    mealCount: meals.length,
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat,
    fiber: totalFiber,
  };

  const handleUpdateVital = (type: keyof Vitals, newValue: any) => {
    setVitals((prev) => ({
      ...prev,
      [type]: newValue,
    }));
  };

  const handleMealAdded = (newMeal: Omit<MealLog, "id" | "timestamp">) => {
    const meal: MealLog = {
      ...newMeal,
      id: "meal_" + Date.now(),
      timestamp: new Date().toISOString(),
    };
    setMeals((prev) => [meal, ...prev]);
  };

  const handleClearHistory = () => {
    if (window.confirm("Do you really want to reset your logged meals? This resets progress rings for today.")) {
      setMeals([]);
      setWeeklyAdvisory(null);
    }
  };

  // Generate Smart Personalized advisor overview
  const generatePersonalizedSuggestions = async () => {
    setGeneratingAdvisory(true);
    setWeeklyAdvisory(null);
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: profile,
          vitals,
          summaryLogs
        }),
      });

      if (!response.ok) {
        throw new Error("Could not construct clinical summary.");
      }

      const data = await response.json();
      setWeeklyAdvisory(data.recommendation);
      
      const el = document.getElementById("advisory-target");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err: any) {
      console.error(err);
      alert("Error generating advice report. Please check server security connection.");
    } finally {
      setGeneratingAdvisory(false);
    }
  };

  // Submit Interactive Chat Advisor message
  const handleSendChatMessage = async (presetText?: string) => {
    const messageContent = presetText || chatInput;
    if (!messageContent.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: "user_" + Date.now(),
      role: "user",
      text: messageContent,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          userProfile: profile,
          vitals,
          summaryLogs,
        }),
      });

      if (!response.ok) {
        throw new Error("Advisor encountered issues compiling.");
      }

      const resData = await response.json();
      const assistantMsg: ChatMessage = {
        id: "model_" + Date.now(),
        role: "assistant",
        text: resData.response,
        timestamp: new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: "err_" + Date.now(),
          role: "assistant",
          text: "My apologies, I ran into an error connecting to my wellness database. Please try again in brief.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Inline custom Markdown parser for sleek typography matching instructions
  function renderAdvisoryMarkdown(text: string) {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let cleanLine = line.trim();
      if (cleanLine.startsWith("###")) {
        return <h4 key={idx} className="text-xs font-black text-emerald-400 mt-4 mb-2 first:mt-0 uppercase tracking-widest">{cleanLine.substring(3).trim()}</h4>;
      }
      if (cleanLine.startsWith("##")) {
        return <h3 key={idx} className="text-sm font-extrabold text-white mt-5 mb-2 first:mt-0 border-b border-[#2d2f3d] pb-1.5 flex items-center gap-1.5 uppercase tracking-wide"><Heart className="w-3.5 h-3.5 text-emerald-400" />{cleanLine.substring(2).trim()}</h3>;
      }
      if (cleanLine.startsWith("#")) {
        return <h2 key={idx} className="text-base font-black text-white mt-6 mb-3 first:mt-0 tracking-tight">{cleanLine.substring(1).trim()}</h2>;
      }
      if (cleanLine.startsWith("-") || cleanLine.startsWith("*")) {
        const content = cleanLine.substring(1).trim();
        return (
          <li key={idx} className="list-disc list-inside text-xs text-gray-300 leading-relaxed ml-2 my-1.5">
            {parseBoldText(content)}
          </li>
        );
      }
      if (cleanLine === "") {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-xs text-gray-300 leading-relaxed my-1.5">{parseBoldText(cleanLine)}</p>;
    });
  }

  function parseBoldText(text: string) {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-extrabold text-white">{part}</strong> : part));
  }

  const handleQuickQuestionRedirect = (promptStr: string) => {
    setActiveTab("coach");
    setTimeout(() => {
      handleSendChatMessage(promptStr);
    }, 100);
  };

  if (!profile.onboardingCompleted) {
    return (
      <OnboardingWizard
        onComplete={(completedProfile, preloadedVitals) => {
          setProfile(completedProfile);
          if (preloadedVitals) {
            setVitals((prev) => ({
              ...prev,
              ...preloadedVitals,
            }));
          }
        }}
      />
    );
  }

  return (
    <div id="vitals-dashboard-container" className="min-h-screen bg-[#07080b] pb-16 font-sans text-white">
      
      {/* Premium Luxury Header styled matching high fidelity fitness template */}
      <header id="dashboard-header" className="sticky top-0 z-40 bg-[#0c0d12]/92 backdrop-blur-md border-b border-[#1c1d27] px-4 py-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg relative">
              <Heart className="w-5 h-5 text-emerald-450 text-emerald-400 fill-emerald-500/10" />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 animate-pulse border border-[#07080b]" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 font-mono">Precision Engine</span>
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-mono text-gray-500 font-semibold">V.2.4 LIVE</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">Active Health Ecosystem</h1>
            </div>
          </div>

          <div id="profile-trigger-actions" className="flex items-center gap-3.5">
            {/* User notification bell badge */}
            <div className="relative p-2 rounded-xl bg-[#171822] border border-[#2b2c3a] text-gray-400 hover:text-white transition cursor-pointer hidden sm:block">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>

            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs font-black text-white">{profile.name || "Polly Strong"}</span>
              <span className="text-[10px] text-gray-400 font-bold">Age {profile.age} • {profile.gender} • {profile.weight} kg</span>
            </div>
            
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="px-3.5 py-2 bg-[#12131a] hover:bg-[#1a1b26] border border-[#2c2d3d] rounded-xl transition duration-150 flex items-center gap-2 text-white shadow-md cursor-pointer hover:border-emerald-400/40"
              title="Edit Profile parameters"
            >
              <User className="w-4 h-4 text-emerald-450 text-emerald-450 text-emerald-400" />
              <span className="text-xs font-bold hidden md:inline uppercase tracking-wider">Health Profile</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        
        {/* Dynamic header summary banner (Polly Strong Inspired Goal overview) */}
        <div className="bg-gradient-to-r from-[#111218] via-[#161821] to-[#121319] border border-[#252836] rounded-2xl p-5 mb-6 text-left relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest font-mono">Goal Progress Tracker</span>
                <span className="text-gray-550 text-[10px] text-gray-400">Current streak: 3 days active</span>
              </div>
              <h2 className="text-lg font-black text-white">Good morning, {profile.name || "Polly Strong"}!</h2>
              <p className="text-xs text-gray-400 max-w-xl font-medium leading-relaxed">
                You have synchronized {meals.length} visual food logs today. You've completed {Math.round(Math.min(100, (totalCalories / (profile.targetCalories || 2000)) * 100))}% of your daily energy targets. Keep hydrated to sustain physical endurance levels!
              </p>
            </div>
            
            {/* Custom progress ring bar visually like the screenshot */}
            <div className="shrink-0 min-w-[200px] bg-[#1a1b24] p-3 rounded-xl border border-[#2b2c3a] z-10">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-400 mb-1">
                <span>Daily Target</span>
                <span className="text-emerald-400">{totalCalories} / {profile.targetCalories || 2000} kcal</span>
              </div>
              <div className="w-full bg-[#0d0e13] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${Math.min(100, (totalCalories / (profile.targetCalories || 2000)) * 100)}%` }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[8px] text-gray-500 font-bold uppercase tracking-wider">
                <span>Fibers: {totalFiber}g ({Math.round(totalFiber / 30 * 100)}%)</span>
                <span>Active Target</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar and Tab menu switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-450 text-xs font-semibold">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-300">Continuous Observations</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">Baseline Target: {profile.targetCalories} kcal / day</span>
          </div>

          {/* Luxury Tab Switcher */}
          <div className="bg-[#121319] border border-[#22232a] p-1.5 rounded-2xl flex items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("summary")}
              className={`flex-1 sm:flex-none px-5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                activeTab === "summary" 
                  ? "bg-emerald-400 text-black shadow-lg shadow-emerald-500/10" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Overview Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("coach")}
              className={`flex-1 sm:flex-none px-5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                activeTab === "coach" 
                  ? "bg-emerald-400 text-black shadow-lg shadow-emerald-500/10" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              AI Wellness Advisor
              <span className="px-1.5 py-0.5 bg-rose-500/20 text-[8px] font-black text-rose-400 rounded uppercase tracking-wider">Ask</span>
            </button>
          </div>
        </div>

        {/* Tab CONTENT 1: Summary Dashboard */}
        {activeTab === "summary" && (
          <div className="space-y-8 animate-fade-in text-left">

            {/* Google Fit / Apple Health connection streamline panel */}
            {profile.healthDataConnected ? (
              <div id="device-sync-success-alert" className="bg-[#17181f]/80 border border-emerald-500/20 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-emerald-450 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black uppercase tracking-wider uppercase">Continuous Stream Active</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-xs text-gray-300 mt-1">
                      Biometric observations are synchronized in real-time with your <strong className="text-emerald-400">{profile.connectedProvider}</strong> telemetry.
                    </p>
                  </div>
                </div>
                <div>
                  <button 
                    type="button" 
                    onClick={() => {
                      setProfile(prev => ({ ...prev, healthDataConnected: false, connectedProvider: "None" }));
                    }} 
                    className="text-xs text-rose-450 hover:text-rose-400 font-extrabold transition bg-rose-500/10 border border-rose-500/25 px-4 py-2 rounded-xl"
                  >
                    Disconnect Integration
                  </button>
                </div>
              </div>
            ) : (
              <div id="device-sync-prompt-alert" className="bg-[#121319]/90 border border-[#2b2c3a] rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-2xl rounded-full" />
                <div className="flex items-start gap-4 text-left z-10">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                    <Sparkles className="w-5 h-5 text-emerald-400 fill-emerald-500/10 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 font-mono">Stream Synchronizer Proposal</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-[8px] font-black text-rose-400 uppercase tracking-widest">Step 2 Goal</span>
                    </div>
                    <h4 className="text-sm font-black text-white">Consolidate Historical Sleep & Cardiac Logs</h4>
                    <p className="text-[11px] text-gray-400 leading-normal max-w-2xl">
                      Do you keep biometrics elsewhere? Synchronize with Google Fit or Apple Health in one click to allow Gemini to correlate nutrition targets with actual cardiovascular workload!
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch lg:items-center shrink-0 z-10">
                  <button
                    type="button"
                    onClick={() => {
                      setProfile(prev => ({
                        ...prev,
                        healthDataConnected: true,
                        connectedProvider: "Google Fit"
                      }));
                      setVitals({
                        heartRate: 64,
                        bloodPressure: "116/74",
                        waterIntake: 1800,
                        sleepDuration: 7.8,
                        bloodSugar: 88,
                      });
                    }}
                    className="px-4 py-2 bg-[#1b1c23] hover:bg-[#252733] text-white border border-[#2e3143] text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Chrome className="w-3.5 h-3.5 text-[#4285F4]" />
                    Connect Google Fit
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfile(prev => ({
                        ...prev,
                        healthDataConnected: true,
                        connectedProvider: "Apple Health"
                      }));
                      setVitals({
                        heartRate: 68,
                        bloodPressure: "115/72",
                        waterIntake: 2000,
                        sleepDuration: 8.0,
                        bloodSugar: 90,
                      });
                    }}
                    className="px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-black text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5 fill-black" />
                    Connect Apple Health
                  </button>
                </div>
              </div>
            )}
            
            {/* Top Nutrition split-view */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7">
                <NutritionRing profile={profile} meals={meals} />
              </div>

              <div className="lg:col-span-5">
                <PhotoLogger onMealAdded={handleMealAdded} />
              </div>
            </div>

            {/* Apple Health Vitals Monitoring Grid */}
            <section id="vitals-monitoring-section" className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#232530] pb-2">
                <div className="text-left">
                  <h3 className="text-base font-black text-white tracking-tight uppercase tracking-wider text-xs">Standard Biometrics Panel</h3>
                  <p className="text-xs text-gray-400">Logged diagnostics and daily hydration markers</p>
                </div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                  Continuous tracking
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <VitalsCard 
                  type="heartRate" 
                  value={vitals.heartRate} 
                  onUpdate={handleUpdateVital} 
                />
                <VitalsCard 
                  type="bloodPressure" 
                  value={vitals.bloodPressure} 
                  onUpdate={handleUpdateVital} 
                />
                <VitalsCard 
                  type="waterIntake" 
                  value={vitals.waterIntake} 
                  onUpdate={handleUpdateVital} 
                />
                <VitalsCard 
                  type="sleepDuration" 
                  value={vitals.sleepDuration} 
                  onUpdate={handleUpdateVital} 
                />
                <VitalsCard 
                  type="bloodSugar" 
                  value={vitals.bloodSugar} 
                  onUpdate={handleUpdateVital} 
                />
              </div>
            </section>

            {/* Smart Advisory Clinic */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Personal Coach trigger box */}
              <div className="bg-[#17181f]/95 border border-[#2c2d3a] rounded-3xl p-6 shadow-xl space-y-4 text-left">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Brain className="w-6 h-6 text-emerald-450 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Dynamic Clinical Synthesizer</h3>
                  <p className="text-xs text-gray-400 leading-normal mt-1">
                    Correlate nutrition tracking metrics, average sleep profiles and heart rates to deliver immediate diagnostic optimizations.
                  </p>
                </div>

                <div className="space-y-2.5 border-t border-[#232530] pt-3 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cross-analyzes dynamic macronutrient ratios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Tracks systolic-diastolic vascular resistance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Offers lifestyle improvements targets</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={generatePersonalizedSuggestions}
                  disabled={generatingAdvisory}
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-500 text-black font-black uppercase tracking-wider rounded-xl transition shadow-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {generatingAdvisory ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                      Synthesizing indicators...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 fill-black" />
                      Formulate Suggestions
                    </>
                  )}
                </button>
              </div>

              {/* Advisory Text Output Panel */}
              <div id="advisory-target" className="lg:col-span-2 bg-[#17181f]/95 border border-[#2c2d3a] rounded-3xl p-6 shadow-xl min-h-[300px] flex flex-col justify-between text-left">
                {generatingAdvisory ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 my-auto">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
                    <h4 className="text-sm font-bold text-white">Correlating clinical indicators...</h4>
                    <p className="text-xs text-gray-400 mt-1.5 max-w-sm font-mono text-[10px]">
                      Correlating blood sugar levels, calories, water and cardiorespiratory rates.
                    </p>
                  </div>
                ) : weeklyAdvisory ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#232530] pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Dynamic Diagnostics</span>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider mt-0.5">Clinical Wellness Report</h4>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setWeeklyAdvisory(null);
                          localStorage.removeItem("health_user_advisory");
                        }}
                        className="text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl transition border border-rose-500/20 cursor-pointer"
                      >
                        Reset Report
                      </button>
                    </div>

                    <div className="prose max-w-none text-left space-y-2 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
                      {renderAdvisoryMarkdown(weeklyAdvisory)}
                    </div>

                    <div className="pt-3.5 border-t border-[#232530] flex items-center gap-2.5 text-[10px] text-amber-400 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                      <ShieldPlus className="w-5 h-5 text-amber-400 shrink-0" />
                      <p className="leading-snug">
                        Suggestions are non-diagnostic advisory reports only. For chronic issues, consult certified physicians.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 my-auto">
                    <div className="p-3 bg-[#242633] rounded-full text-gray-500 mb-3 border border-[#2c2d3a]">
                      <Brain className="w-6 h-6 text-gray-400" />
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest">No Active advisory report compiled</h4>
                    <p className="text-[11px] text-gray-400 mt-1.5 max-w-sm leading-normal">
                      Click "Formulate Suggestions" to correlate your historical profile metrics (height, weight, sleep duration, blood sugar, and meals) using Gemini.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Logged Meal History Stream */}
            <section id="meals-history-stream" className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#232530] pb-2">
                <div className="text-left">
                  <h3 className="text-base font-black text-white uppercase tracking-wider text-xs">Today's Core Intake Stream</h3>
                  <p className="text-xs text-gray-400">Chronological history of meals analyzed and verified</p>
                </div>
                
                {meals.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  >
                    <ListRestart className="w-4 h-4" /> Reset Intake Log
                  </button>
                )}
              </div>

              {meals.length === 0 ? (
                <div className="bg-[#121319]/80 border border-dashed border-[#2c2d3a] rounded-3xl p-12 text-center">
                  <Coffee className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-white uppercase tracking-widest">No meals logged for today</p>
                  <p className="text-[11px] text-gray-400 mt-1">Upload a snapshot to parse ingredients with Gemini Vision!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {meals.map((meal) => (
                    <div 
                      key={meal.id} 
                      className="bg-[#17181f]/95 border border-[#2c2d3a] rounded-3xl p-5 shadow-lg transition hover:border-emerald-400/40 flex gap-4 pr-12 relative text-left"
                    >
                      {meal.imageUrl ? (
                        <img 
                          src={meal.imageUrl} 
                          alt={meal.foodName} 
                          className="w-16 h-16 rounded-xl object-cover shrink-0 my-auto border border-[#2b2c3a]" 
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0 flex items-center justify-center my-auto border border-emerald-500/20">
                          <Flame className="w-7 h-7" />
                        </div>
                      )}
                      
                      <div className="space-y-1.5 flex-1 text-left">
                        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-gray-400">
                          <span>{new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span className="text-emerald-450 text-emerald-400 bg-emerald-500/10 px-1 rounded border border-emerald-500/15">Match: {Math.round(meal.confidence * 100)}%</span>
                        </div>
                        
                        <h4 className="text-xs font-black text-white leading-snug uppercase tracking-wide">{meal.foodName}</h4>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
                          <span className="text-rose-455 text-rose-400 font-extrabold">{meal.calories} kcal</span>
                          <span className="text-gray-400">Protein: <strong className="text-white font-mono">{meal.protein}g</strong></span>
                          <span className="text-gray-400">Carbs: <strong className="text-white font-mono">{meal.carbs}g</strong></span>
                          <span className="text-gray-400">Fat: <strong className="text-white font-mono">{meal.fat}g</strong></span>
                        </div>
                      </div>

                      {/* Details trigger */}
                      <div className="absolute right-3.5 top-0 bottom-0 flex items-center">
                        <button
                          type="button"
                          onClick={() => setSelectedMealForDetail(meal)}
                          className="p-1.5 bg-[#20212c] border border-[#2d2f3d] hover:border-emerald-400/40 rounded-xl text-gray-400 hover:text-white transition"
                          title="View Details"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Tab CONTENT 2: AI Health Advisor Conversations */}
        {activeTab === "coach" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch animate-fade-in text-left">
            
            {/* Left rail info & prompt templates */}
            <div className="lg:col-span-1 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="bg-[#17181f]/95 border border-[#2c2d3a] rounded-3xl p-5 shadow-xl space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                    <Brain className="w-4 h-4" /> Telemetry Specs
                  </h3>
                  <p className="text-[11px] text-gray-450 text-gray-400 leading-normal">
                    This interactive AI coaching channel integrates continuous real-time parameters from your active logs:
                  </p>

                  <div className="text-[11px] space-y-2 border-t border-[#232530] pt-3 font-semibold text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Heart rate:</span>
                      <strong className="text-white">{vitals.heartRate} bpm</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Blood pressure:</span>
                      <strong className="text-white">{vitals.bloodPressure} mmHg</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Blood sugar:</span>
                      <strong className="text-white">{vitals.bloodSugar} mg/dL</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-400">Calories logged:</span>
                      <strong className="text-emerald-400">{totalCalories} kcal</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Starting Prompts</h4>
                  <div className="space-y-2">
                    {STARTER_PROMPTS.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleQuickQuestionRedirect(p)}
                        className="w-full text-left p-3 bg-[#17181f]/95 hover:border-emerald-400/40 border border-[#2b2c3a] rounded-2xl transition duration-150 text-[11px] text-gray-300 leading-normal font-medium shadow-lg group flex items-start gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 group-hover:scale-105 transition" />
                        <span>{p}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-[10px] text-gray-400 leading-normal">
                <strong>Emergency Medicine</strong>: Suggestions are wellness indicators only. For acute conditions or standard medicine intervention, contact dispatchers.
              </div>
            </div>

            {/* Main Interactive Chat Area */}
            <div className="lg:col-span-3 bg-[#17181f]/95 border border-[#2c2d3a] rounded-3xl shadow-xl flex flex-col min-h-[550px] max-h-[650px] overflow-hidden">
              
              {/* Advisor status top bar */}
              <div className="px-6 py-4.5 border-b border-[#232530] bg-[#1a1c25]/80 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Brain className="w-4.5 h-4.5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Dr. Gemini Lifestyle Advisor</h3>
                    <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active consultation with {profile.name || "Polly Strong"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Do you want to reset complete conversation history?")) {
                      setChatMessages([
                        {
                          id: "welcome-coach",
                          role: "assistant",
                          text: `Conversations restarted. How can I guide you today?`,
                          timestamp: new Date().toISOString()
                        }
                      ]);
                    }
                  }}
                  className="text-xs font-bold text-gray-400 hover:text-white bg-[#222430] hover:bg-[#2c2e3d] px-3 py-1.5 rounded-lg border border-[#303243] transition cursor-pointer"
                >
                  Clear History
                </button>
              </div>

              {/* Message scroll container */}
              <div id="messages-scroller" className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#111218]/90 text-left scrollbar-thin">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-start gap-2.5 max-w-full`}
                  >
                    {msg.role !== "user" && (
                      <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                        Coach
                      </div>
                    )}
                    <div className={`relative px-4 py-2.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-emerald-400 text-black font-extrabold rounded-tr-xs shadow-md" 
                        : "bg-[#1d1f2a] border border-[#2d2f3d] text-gray-100 rounded-tl-xs shadow-md"
                    }`}>
                      <div className="prose max-w-none text-left break-words">
                        {renderAdvisoryMarkdown(msg.text)}
                      </div>
                      
                      <div className={`text-[9px] mt-1 text-right ${msg.role === "user" ? "text-gray-900" : "text-gray-400"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start items-start gap-2.5">
                    <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/20 text-[2px] text-emerald-400 font-black flex items-center justify-center shrink-0 animate-bounce">
                      ●●●
                    </div>
                    <div className="px-4 py-3 bg-[#1d1f2a] border border-[#2d2f3d] text-gray-400 text-xs italic rounded-2xl rounded-tl-xs flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-450" />
                      Advisor compiling suggestions...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage();
                }}
                className="p-4 bg-[#1a1c25]/80 border-t border-[#232530] flex items-stretch gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask anything (e.g., 'What protein ratios make sense for my calorie count?')"
                  className="flex-1 px-4 py-3 bg-[#111218] border border-[#2c2d3a] focus:outline-none focus:border-emerald-400 rounded-xl text-xs font-semibold placeholder-gray-500 text-white"
                  disabled={chatLoading}
                />
                
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-5 py-2.5 bg-emerald-400 text-black hover:bg-emerald-500 disabled:bg-[#20212a] disabled:text-gray-500 font-black rounded-xl transition duration-150 flex items-center justify-center gap-1 text-xs shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 fill-black" />
                  <span className="uppercase tracking-wider">Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Floating profile editor modal */}
      <UserProfileModal
        profile={profile}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSave={(updated) => setProfile(updated)}
      />

      {/* Modal: Logged Meal In-Depth Details */}
      {selectedMealForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#17181f] border border-[#2c2d3a] rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
            <div className="px-6 py-4.5 border-b border-[#232530] flex items-center justify-between bg-[#1f212a]/80">
              <div className="text-left">
                <span className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest">Detail Deconstruction</span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mt-1">Calorie & Macro Breakdown</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedMealForDetail(null)}
                className="p-1.5 hover:bg-[#2c2e3a] rounded-xl text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-left">
              {selectedMealForDetail.imageUrl && (
                <img 
                  src={selectedMealForDetail.imageUrl} 
                  alt={selectedMealForDetail.foodName} 
                  className="w-full h-44 object-cover rounded-2xl border border-[#2c2d3a] mb-3"
                />
              )}

              <div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Verified Dish Name</span>
                <h4 className="text-sm font-black text-white uppercase tracking-wide mt-0.5">{selectedMealForDetail.foodName}</h4>
              </div>

              {/* Grid Segment */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5">
                  <div className="text-[9px] text-rose-400 font-bold uppercase">Energy</div>
                  <div className="font-mono font-black text-rose-455 text-rose-400 mt-1">{selectedMealForDetail.calories} <span className="text-[8px] font-medium text-gray-400">kcal</span></div>
                </div>
                <div className="bg-[#1e1f29] border border-[#2c2d3a] rounded-xl p-2.5">
                  <div className="text-[9px] text-gray-400 font-bold uppercase">Protein</div>
                  <div className="font-mono font-bold text-white mt-1">{selectedMealForDetail.protein}g</div>
                </div>
                <div className="bg-[#1e1f29] border border-[#2c2d3a] rounded-xl p-2.5">
                  <div className="text-[9px] text-gray-400 font-bold uppercase">Carbs</div>
                  <div className="font-mono font-bold text-white mt-1">{selectedMealForDetail.carbs}g</div>
                </div>
                <div className="bg-[#1e1f29] border border-[#2c2d3a] rounded-xl p-2.5">
                  <div className="text-[9px] text-gray-400 font-bold uppercase">Fats</div>
                  <div className="font-mono font-bold text-white mt-1">{selectedMealForDetail.fat}g</div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#232530]">
                <h5 className="text-[9px] font-bold text-gray-450 uppercase tracking-widest text-[#9ca3af]">Ingredients Composition</h5>
                <p className="text-xs text-gray-200 leading-normal font-semibold">{selectedMealForDetail.description}</p>
              </div>

              <div className="space-y-1.5 p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-xs leading-relaxed text-gray-200">
                <h5 className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5 fill-emerald-500/10" /> AI Lifestyle Advice
                </h5>
                <p>{selectedMealForDetail.suggestions}</p>
              </div>
            </div>

            <div className="p-4 bg-[#1a1c25]/80 border-t border-[#232530] text-right">
              <button
                type="button"
                onClick={() => setSelectedMealForDetail(null)}
                className="px-6 py-2 bg-[#2d2e3b] hover:bg-[#393a4a] text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer copyright segment */}
      <footer className="text-center text-[10px] text-gray-500 max-w-7xl mx-auto px-4 mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-[#1c1d27] pt-6 gap-2">
        <p>© 2026 Apple Fitness-Inspired Sandbox. Powered by Google Gemini-3.5-flash AI core integration.</p>
        <p className="flex items-center gap-1 font-bold text-gray-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400" /> Fully secure, client-side sandbox container.
        </p>
      </footer>
    </div>
  );
}
