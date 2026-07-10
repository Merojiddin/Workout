export const NUTRITION_LOGS_KEY = 'nutritionLogs'

export interface NutritionLog {
  id: string
  date: string
  bodyWeightKg: number | null
  proteinGrams: number | null
  waterLiters: number | null
  caloriesEstimate: number | null
  creatineTaken: boolean
  creatineGrams: number | null
  wheyTaken: boolean
  wheyScoops: number | null
  eggsCount: number | null
  seafoodMeal: boolean
  oystersMeal: boolean
  nutsServing: boolean
  darkChocolate: boolean
  fruits: string
  coffeeCups: number | null
  notes: string
  createdAt: string
  syncStatus?: 'local-only' | 'synced' | 'pending-sync'
  updatedAt?: string
}
