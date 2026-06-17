export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  height: number; // in cm
  weight: number; // in kg
  targetCalories: number; // in kcal
  goals: string;
  foodHabits: string; // e.g., "Vegetarian", "Vegan", "Keto", "Everything"
  drinkingHabits: string; // e.g., "Non-drinker", "Social", "Moderate", "Heavy"
  smokingHabits: string; // e.g., "Non-smoker", "Social", "Daily"
  lifestyleHabits: string; // e.g., "Sedentary", "Lightly Active", "Active", "Extremely Active"
  healthDataConnected: boolean;
  connectedProvider: string; // e.g., "Google Fit", "Apple Health", "None"
  onboardingCompleted: boolean;
}

export interface Vitals {
  heartRate: number; // in bpm
  bloodPressure: string; // e.g., "120/80"
  waterIntake: number; // in ml
  sleepDuration: number; // in hours
  bloodSugar: number; // in mg/dL
}

export interface MealLog {
  id: string;
  timestamp: string;
  foodName: string;
  calories: number;
  protein: number; // in g
  carbs: number; // in g
  fat: number; // in g
  fiber: number; // in g
  confidence: number; // 0 to 1
  description: string;
  suggestions: string;
  imageUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}
