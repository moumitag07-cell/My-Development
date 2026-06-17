import React from "react";
import { UserProfile, MealLog } from "../types";
import { Flame, PieChart, Info, Percent } from "lucide-react";

interface NutritionRingProps {
  profile: UserProfile;
  meals: MealLog[];
}

export default function NutritionRing({ profile, meals }: NutritionRingProps) {
  // Aggregate today's macros
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);
  const totalFiber = meals.reduce((sum, meal) => sum + meal.fiber, 0);

  const calorieTarget = profile.targetCalories || 2000;
  
  // Standard macro proportions recommendation: Protein 25%, Carbs 45%, Fat 30%
  const targetProtein = Math.round((calorieTarget * 0.25) / 4); 
  const targetCarbs = Math.round((calorieTarget * 0.45) / 4);   
  const targetFat = Math.round((calorieTarget * 0.30) / 9);     
  const targetFiber = 30; 

  // SVG configurations for circular progress
  const radius = 70;
  const stroke = 14;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percentage = Math.min(100, (totalCalories / calorieTarget) * 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getProgress = (current: number, target: number) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  return (
    <div id="nutrition-ring-panel" className="bg-[#17181f]/95 border border-[#2c2d3a] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-8 md:gap-14 relative overflow-hidden">
      
      {/* Circle Ring Segment */}
      <div className="relative flex-shrink-0 flex flex-col items-center">
        <div id="svg-ring-container" className="relative w-[180px] h-[180px] flex items-center justify-center">
          <svg className="transform -rotate-90 w-full h-full">
            {/* Dark background track */}
            <circle
              stroke="#242633"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx="90"
              cy="90"
            />
            {/* Active glowing calorie progress ring */}
            <circle
              stroke="url(#calorieGradientDark)"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + " " + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx="90"
              cy="90"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="calorieGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <Flame className="w-6 h-6 text-emerald-400 fill-emerald-500/10 mb-1 animate-pulse" />
            <span className="font-sans text-3xl font-black text-white leading-none tracking-tight">
              {totalCalories}
            </span>
            <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
              of {calorieTarget} kcal
            </span>
          </div>
        </div>
        
        <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-[10px] font-bold text-emerald-400 uppercase tracking-widest shadow-xs">
          <Percent className="w-3.5 h-3.5 text-emerald-400" />
          {Math.round((totalCalories / calorieTarget) * 100)}% Consumed
        </div>
      </div>

      {/* Description / breakdown of macros */}
      <div className="flex-1 w-full space-y-5 text-left">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#20212c] border border-[#2c2d3a] flex items-center justify-center">
              <PieChart className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-base font-extrabold text-white">Dynamic Macro Breakdown</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1 font-medium">Real-time macro parameters aggregated from logs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Protein */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-450 bg-rose-400" />
                Protein
              </span>
              <span className="font-mono text-gray-400">
                <strong className="text-white">{totalProtein}g</strong> / {targetProtein}g
              </span>
            </div>
            <div className="w-full bg-[#242633] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-rose-450 bg-rose-500 h-full rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${getProgress(totalProtein, targetProtein)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Carbohydrates
              </span>
              <span className="font-mono text-gray-400">
                <strong className="text-white">{totalCarbs}g</strong> / {targetCarbs}g
              </span>
            </div>
            <div className="w-full bg-[#242633] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${getProgress(totalCarbs, targetCarbs)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Healthy Lipids
              </span>
              <span className="font-mono text-gray-400">
                <strong className="text-white">{totalFat}g</strong> / {targetFat}g
              </span>
            </div>
            <div className="w-full bg-[#242633] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-cyan-400 h-full rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${getProgress(totalFat, targetFat)}%` }}
              />
            </div>
          </div>

          {/* Fiber */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Dietary Fiber
              </span>
              <span className="font-mono text-gray-400">
                <strong className="text-white">{totalFiber}g</strong> / {targetFiber}g
              </span>
            </div>
            <div className="w-full bg-[#242633] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${getProgress(totalFiber, targetFiber)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="pt-3.5 border-t border-[#232530] flex items-start gap-1.5 text-[10px] text-gray-400 leading-normal">
          <Info className="w-4 h-4 text-emerald-400/80 shrink-0 mt-0.5" />
          <p>
            Standard formula: Protein 25%, Carbohydrate 45%, fat content 30% adjusted to fit active daily energy constraints.
          </p>
        </div>
      </div>
    </div>
  );
}
