import type { MathTopic, SupportedGrade } from '../../shared/model/types'

export const TOPICS: MathTopic[] = [
  { id: 'number-sense', name: 'Cảm nhận số', icon: '🔢', minGrade: 1, maxGrade: 5, category: 'number', generatorId: 'number-sense' },
  { id: 'counting', name: 'Đếm số', icon: '🧮', minGrade: 1, maxGrade: 2, category: 'number', generatorId: 'counting' },
  { id: 'add', name: 'Phép cộng', icon: '➕', minGrade: 1, maxGrade: 5, category: 'arithmetic', generatorId: 'add' },
  { id: 'subtract', name: 'Phép trừ', icon: '➖', minGrade: 1, maxGrade: 5, category: 'arithmetic', generatorId: 'subtract' },
  { id: 'compare', name: 'So sánh', icon: '⚖️', minGrade: 1, maxGrade: 5, category: 'number', generatorId: 'compare' },
  { id: 'missing-number', name: 'Tìm số còn thiếu', icon: '❓', minGrade: 1, maxGrade: 5, category: 'arithmetic', generatorId: 'missing-number' },
  { id: 'patterns', name: 'Quy luật', icon: '🧩', minGrade: 1, maxGrade: 5, category: 'number', generatorId: 'patterns' },
  { id: 'multiply', name: 'Phép nhân', icon: '✖️', minGrade: 2, maxGrade: 5, category: 'arithmetic', generatorId: 'multiply' },
  { id: 'divide', name: 'Phép chia', icon: '➗', minGrade: 2, maxGrade: 5, category: 'arithmetic', generatorId: 'divide' },
  { id: 'word-add-subtract', name: 'Bài toán cộng trừ', icon: '📖', minGrade: 1, maxGrade: 5, category: 'arithmetic', generatorId: 'word-add-subtract' },
  { id: 'word-multiply-divide', name: 'Bài toán nhân chia', icon: '🛒', minGrade: 2, maxGrade: 5, category: 'arithmetic', generatorId: 'word-multiply-divide' },
  { id: 'fractions', name: 'Phân số', icon: '🍰', minGrade: 3, maxGrade: 5, category: 'number', generatorId: 'fractions' },
  { id: 'length', name: 'Độ dài', icon: '📏', minGrade: 1, maxGrade: 5, category: 'measurement', generatorId: 'length' },
  { id: 'mass', name: 'Khối lượng', icon: '⚖️', minGrade: 2, maxGrade: 5, category: 'measurement', generatorId: 'mass' },
  { id: 'time', name: 'Thời gian', icon: '🕒', minGrade: 1, maxGrade: 5, category: 'measurement', generatorId: 'time' },
  { id: 'geometry', name: 'Hình học', icon: '🔺', minGrade: 1, maxGrade: 5, category: 'geometry', generatorId: 'geometry' },
  { id: 'perimeter-area', name: 'Chu vi và diện tích', icon: '🏠', minGrade: 3, maxGrade: 5, category: 'geometry', generatorId: 'perimeter-area' },
  { id: 'mixed', name: 'Tổng hợp', icon: '🌟', minGrade: 1, maxGrade: 5, category: 'mixed', generatorId: 'mixed' },
]

export const topicsForGrade = (grade: SupportedGrade): MathTopic[] =>
  TOPICS.filter(topic => topic.minGrade <= grade && grade <= topic.maxGrade)
