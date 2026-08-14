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
    const sides = input.random() < 0.5 ? 3 : 4
    const shape = sides === 3 ? 'tam giác' : 'hình vuông'
    return makeQuestion(`geometry-${sides}`, 'geometry', `${shape} có bao nhiêu cạnh?`, String(sides), `${shape} có ${sides} cạnh.`, input)
  },
}

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
