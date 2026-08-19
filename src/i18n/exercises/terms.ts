import type { LanguageCode } from '../languages'

/**
 * Exercise taxonomy: categories, equipment tags, difficulty and muscle names.
 *
 * These are stored values -- they are what the filters compare against and
 * what a pasted program writes -- so the data keeps its English spelling and
 * only the label shown on screen is swapped. Lookups are by exact English
 * string, and anything unrecognised (a custom exercise's own muscle name)
 * falls through unchanged rather than disappearing.
 */
type TermMap = Record<string, string>

const viCategories: TermMap = {
  Chest: 'Ngực',
  Back: 'Lưng',
  Shoulders: 'Vai',
  Arms: 'Tay',
  Legs: 'Chân',
  Abs: 'Bụng',
  Posture: 'Tư thế',
  Conditioning: 'Thể lực',
}

const viEquipment: TermMap = {
  Bodyweight: 'Không dụng cụ',
  Backpack: 'Ba lô',
  'Pull-up bar': 'Xà đơn',
  Dips: 'Xà kép',
  Dumbbells: 'Tạ đơn',
  Barbell: 'Tạ đòn',
  Bench: 'Ghế tập',
  Treadmill: 'Máy chạy bộ',
  'Skipping rope': 'Dây nhảy',
  'VR Quest 2': 'VR Quest 2',
  Mat: 'Thảm tập',
  'Resistance bands': 'Dây kháng lực',
  'Cable machine': 'Máy cáp',
  'Smith machine': 'Máy Smith',
  'Weight machine': 'Máy tạ',
  'Plyometric box': 'Bục nhảy',
  'Medicine ball': 'Bóng tạ',
  'Heavy bag': 'Bao cát',
  Landmine: 'Landmine',
  "Captain's chair": 'Ghế nâng chân',
}

const viDifficulty: TermMap = {
  Beginner: 'Người mới',
  Intermediate: 'Trung cấp',
  Advanced: 'Nâng cao',
}

const viMuscles: TermMap = {
  Abs: 'Cơ bụng',
  Adductors: 'Cơ khép đùi',
  'Ankle Dorsiflexors': 'Cơ gập mu bàn chân',
  Back: 'Lưng',
  Biceps: 'Cơ tay trước',
  'Boxing Skill': 'Kỹ thuật boxing',
  Brachialis: 'Cơ cánh tay trong',
  'Breathing Muscles': 'Cơ hô hấp',
  Calves: 'Bắp chân',
  'Cardiovascular System': 'Hệ tim mạch',
  Chest: 'Cơ ngực',
  Core: 'Cơ lõi',
  'Deep Neck Flexors': 'Cơ gập cổ sâu',
  'External Rotators': 'Cơ xoay ngoài',
  'Foot Stabilizers': 'Cơ giữ thăng bằng bàn chân',
  Forearms: 'Cẳng tay',
  'Front Shoulders': 'Vai trước',
  Glutes: 'Cơ mông',
  Grip: 'Lực nắm',
  Hamstrings: 'Cơ đùi sau',
  'Heart & Lungs': 'Tim và phổi',
  'Hip Flexors': 'Cơ gập hông',
  Hips: 'Hông',
  'Lateral Neck Flexors': 'Cơ gập cổ bên',
  Lats: 'Cơ xô',
  Legs: 'Chân',
  'Lower Abs': 'Cơ bụng dưới',
  'Lower Back': 'Lưng dưới',
  'Lower Traps': 'Cơ thang dưới',
  'Neck Extensors': 'Cơ duỗi cổ',
  'Neck Flexors': 'Cơ gập cổ',
  Obliques: 'Cơ liên sườn',
  Quads: 'Cơ đùi trước',
  'Rear Shoulders': 'Vai sau',
  Serratus: 'Cơ răng cưa',
  Shoulders: 'Cơ vai',
  'Side Shoulders': 'Vai giữa',
  Soleus: 'Cơ dép',
  'Tibialis Anterior': 'Cơ chày trước',
  Traps: 'Cơ thang',
  Triceps: 'Cơ tay sau',
  'Upper Back': 'Lưng trên',
  'Upper Chest': 'Ngực trên',
}

type TermRegistry = Partial<Record<LanguageCode, TermMap>>

const categories: TermRegistry = { vi: viCategories }
const equipment: TermRegistry = { vi: viEquipment }
const difficulty: TermRegistry = { vi: viDifficulty }
const muscles: TermRegistry = { vi: viMuscles }

function lookup(registry: TermRegistry, language: LanguageCode, value: string) {
  return registry[language]?.[value] ?? value
}

export function translateCategory(value: string, language: LanguageCode) {
  return lookup(categories, language, value)
}

export function translateEquipment(value: string, language: LanguageCode) {
  return lookup(equipment, language, value)
}

export function translateDifficulty(value: string, language: LanguageCode) {
  return lookup(difficulty, language, value)
}

export function translateMuscle(value: string, language: LanguageCode) {
  return lookup(muscles, language, value)
}

export function translateMuscles(values: string[], language: LanguageCode) {
  return values.map((value) => translateMuscle(value, language))
}
