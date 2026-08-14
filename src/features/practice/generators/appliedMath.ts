import type { Question } from '../../../shared/model/types'
import type { GeneratorInput, QuestionGenerator } from './types'

const randomInt = (random: () => number, minimum: number, maximum: number): number =>
  minimum + Math.floor(Math.max(0, Math.min(0.999999999, random())) * (maximum - minimum + 1))

const makeQuestion = (id: string, topicId: string, prompt: string, answer: string, explanation: string, input: GeneratorInput): Question => ({
  id,
  topicId,
  prompt,
  answer,
  explanation,
  grade: input.grade,
  difficulty: input.difficulty,
})

const wordAddSubtract: QuestionGenerator = {
  generate(input) {
    const left = randomInt(input.random, 2, input.grade * 10)
    const right = randomInt(input.random, 1, input.grade * 10)
    return makeQuestion(`word-add-${left}-${right}`, 'word-add-subtract', `Lan có ${left} quyển vở, mẹ mua thêm ${right} quyển. Lan có tất cả bao nhiêu quyển vở?`, String(left + right), `${left} + ${right} = ${left + right}.`, input)
  },
}

const wordMultiplyDivide: QuestionGenerator = {
  generate(input) {
    const groups = randomInt(input.random, 2, 6 + input.grade)
    const each = randomInt(input.random, 2, 6 + input.grade)
    return makeQuestion(`word-multiply-${groups}-${each}`, 'word-multiply-divide', `Có ${groups} túi, mỗi túi có ${each} quả táo. Có tất cả bao nhiêu quả táo?`, String(groups * each), `${groups} × ${each} = ${groups * each}.`, input)
  },
}

const fractions: QuestionGenerator = {
  generate(input) {
    const denominator = randomInt(input.random, 2, 8)
    const numerator = randomInt(input.random, 1, denominator - 1)
    return makeQuestion(`fraction-${numerator}-${denominator}`, 'fractions', `Một chiếc bánh chia đều thành ${denominator} phần, lấy ${numerator} phần. Viết phân số chỉ phần đã lấy.`, `${numerator}/${denominator}`, `Phần đã lấy là ${numerator}/${denominator}.`, input)
  },
}

const length: QuestionGenerator = {
  generate(input) {
    const left = randomInt(input.random, 1, input.grade * 10)
    const right = randomInt(input.random, 1, input.grade * 10)
    return makeQuestion(`length-${left}-${right}`, 'length', `Một sợi dây dài ${left} cm, sợi khác dài ${right} cm. Cả hai dài bao nhiêu cm?`, String(left + right), `${left} + ${right} = ${left + right} cm.`, input)
  },
}

const mass: QuestionGenerator = {
  generate(input) {
    const left = randomInt(input.random, 1, input.grade * 5)
    const right = randomInt(input.random, 1, input.grade * 5)
    return makeQuestion(`mass-${left}-${right}`, 'mass', `Một túi gạo nặng ${left} kg và túi kia nặng ${right} kg. Cả hai nặng bao nhiêu kg?`, String(left + right), `${left} + ${right} = ${left + right} kg.`, input)
  },
}

const time: QuestionGenerator = {
  generate(input) {
    const hour = randomInt(input.random, 1, 10)
    const elapsed = randomInt(input.random, 1, Math.min(4, input.grade))
    return makeQuestion(`time-${hour}-${elapsed}`, 'time', `Bắt đầu lúc ${hour} giờ. Sau ${elapsed} giờ là mấy giờ?`, String(hour + elapsed), `${hour} + ${elapsed} = ${hour + elapsed} giờ.`, input)
  },
}

const geometry: QuestionGenerator = {
  generate(input) {
    const fact = geometryFacts[randomInt(input.random, 0, geometryFacts.length - 1)]
    return makeQuestion(`geometry-${fact.id}`, 'geometry', fact.prompt, String(fact.answer), fact.explanation, input)
  },
}

const geometryFacts = [
  { id: 'triangle-sides', prompt: 'Hình tam giác có bao nhiêu cạnh?', answer: 3, explanation: 'Hình tam giác có 3 cạnh.' },
  { id: 'square-sides', prompt: 'Hình vuông có bao nhiêu cạnh?', answer: 4, explanation: 'Hình vuông có 4 cạnh.' },
  { id: 'rectangle-sides', prompt: 'Hình chữ nhật có bao nhiêu cạnh?', answer: 4, explanation: 'Hình chữ nhật có 4 cạnh.' },
  { id: 'rhombus-sides', prompt: 'Hình thoi có bao nhiêu cạnh?', answer: 4, explanation: 'Hình thoi có 4 cạnh.' },
  { id: 'trapezoid-sides', prompt: 'Hình thang có bao nhiêu cạnh?', answer: 4, explanation: 'Hình thang có 4 cạnh.' },
  { id: 'pentagon-sides', prompt: 'Hình ngũ giác có bao nhiêu cạnh?', answer: 5, explanation: 'Hình ngũ giác có 5 cạnh.' },
  { id: 'hexagon-sides', prompt: 'Hình lục giác có bao nhiêu cạnh?', answer: 6, explanation: 'Hình lục giác có 6 cạnh.' },
  { id: 'octagon-sides', prompt: 'Hình bát giác có bao nhiêu cạnh?', answer: 8, explanation: 'Hình bát giác có 8 cạnh.' },
  { id: 'circle-corners', prompt: 'Hình tròn có bao nhiêu góc?', answer: 0, explanation: 'Hình tròn không có góc.' },
  { id: 'cube-faces', prompt: 'Khối lập phương có bao nhiêu mặt?', answer: 6, explanation: 'Khối lập phương có 6 mặt.' },
  { id: 'cuboid-faces', prompt: 'Hình hộp chữ nhật có bao nhiêu mặt?', answer: 6, explanation: 'Hình hộp chữ nhật có 6 mặt.' },
  { id: 'triangular-pyramid-faces', prompt: 'Hình chóp tam giác có bao nhiêu mặt?', answer: 4, explanation: 'Hình chóp tam giác có 4 mặt.' },
  { id: 'cylinder-bases', prompt: 'Hình trụ có bao nhiêu mặt đáy hình tròn?', answer: 2, explanation: 'Hình trụ có 2 mặt đáy hình tròn.' },
  { id: 'cone-bases', prompt: 'Hình nón có bao nhiêu mặt đáy hình tròn?', answer: 1, explanation: 'Hình nón có 1 mặt đáy hình tròn.' },
  { id: 'sphere-edges', prompt: 'Hình cầu có bao nhiêu cạnh?', answer: 0, explanation: 'Hình cầu không có cạnh.' },
] as const

const perimeterArea: QuestionGenerator = {
  generate(input) {
    const width = randomInt(input.random, 2, input.grade * 4)
    const height = randomInt(input.random, 2, input.grade * 4)
    return makeQuestion(`area-${width}-${height}`, 'perimeter-area', `Hình chữ nhật dài ${width} cm, rộng ${height} cm. Diện tích là bao nhiêu cm²?`, String(width * height), `${width} × ${height} = ${width * height} cm².`, input)
  },
}

export const appliedMathGenerators: Record<string, QuestionGenerator> = {
  'word-add-subtract': wordAddSubtract,
  'word-multiply-divide': wordMultiplyDivide,
  fractions,
  length,
  mass,
  time,
  geometry,
  'perimeter-area': perimeterArea,
}
