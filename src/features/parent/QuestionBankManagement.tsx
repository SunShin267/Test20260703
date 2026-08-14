import { useState, type FormEvent } from 'react'
import type { CustomQuestion, Difficulty, Grade, QuestionBankQuery } from '../../shared/model/types'
import { TOPICS } from '../practice/topicCatalog'
import type { CustomQuestionInput, QuestionBankService } from '../practice/questionBankService'

const difficultyNames: Record<Difficulty, string> = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' }
const emptyInput: CustomQuestionInput = { topicId: 'add', prompt: '', answer: '', explanation: '', grade: 1, difficulty: 'easy' }

export function QuestionBankManagement({ service }: { service: QuestionBankService }) {
  const [query, setQuery] = useState<QuestionBankQuery>({})
  const [version, setVersion] = useState(0)
  const [editing, setEditing] = useState<CustomQuestion | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<CustomQuestion | null>(null)
  const questions = service.list(query)
  const refresh = () => setVersion(current => current + 1)
  void version

  return <section aria-labelledby="question-bank-heading">
    <h2 id="question-bank-heading">Ngân hàng câu hỏi</h2>
    <p>Dữ liệu câu hỏi tùy chỉnh chỉ được lưu trên thiết bị này. Mẫu câu hỏi tạo sẵn không thể sửa hoặc xóa tại đây.</p>
    <div className="filter-row" aria-label="Lọc câu hỏi">
      <label>Lọc lớp<select aria-label="Lọc lớp" value={query.grade ?? ''} onChange={event => setQuery({ ...query, grade: event.target.value ? Number(event.target.value) as Grade : undefined })}><option value="">Tất cả lớp</option>{Array.from({ length: 12 }, (_, index) => index + 1).map(grade => <option key={grade} value={grade}>Lớp {grade}</option>)}</select></label>
      <label>Lọc chủ đề<select aria-label="Lọc chủ đề" value={query.topicId ?? ''} onChange={event => setQuery({ ...query, topicId: event.target.value || undefined })}><option value="">Tất cả chủ đề</option>{TOPICS.map(topic => <option key={topic.id} value={topic.id}>{topic.name}</option>)}</select></label>
      <label>Lọc độ khó<select aria-label="Lọc độ khó" value={query.difficulty ?? ''} onChange={event => setQuery({ ...query, difficulty: event.target.value ? event.target.value as Difficulty : undefined })}><option value="">Tất cả độ khó</option>{(Object.keys(difficultyNames) as Difficulty[]).map(difficulty => <option key={difficulty} value={difficulty}>{difficultyNames[difficulty]}</option>)}</select></label>
    </div>
    <button type="button" onClick={() => { setCreating(true); setEditing(null) }}>Thêm câu hỏi</button>
    {questions.length === 0 ? <p>Chưa có câu hỏi tùy chỉnh phù hợp.</p> : <div className="history-scroll"><table><thead><tr><th scope="col">Đề bài</th><th scope="col">Lớp</th><th scope="col">Độ khó</th><th scope="col">Thao tác</th></tr></thead><tbody>{questions.map(question => <tr key={question.id}><td>{question.prompt}<br /><small>Đáp án: {question.answer}</small></td><td>{question.grade}</td><td>{difficultyNames[question.difficulty]}</td><td><button type="button" onClick={() => { setEditing(question); setCreating(false) }} aria-label={`Sửa câu hỏi ${question.prompt}`}>Sửa</button><button type="button" onClick={() => setDeleting(question)} aria-label={`Xóa câu hỏi ${question.prompt}`}>Xóa</button></td></tr>)}</tbody></table></div>}
    {(creating || editing) && <QuestionEditor key={editing?.id ?? 'new'} initial={editing ?? undefined} onCancel={() => { setCreating(false); setEditing(null) }} onSave={input => { if (editing) service.update(editing.id, input); else service.add(input); setCreating(false); setEditing(null); refresh() }} />}
    {deleting && <div aria-label="Xóa câu hỏi" className="dialog" role="dialog" aria-modal="true"><h3>Xóa câu hỏi?</h3><p>{deleting.prompt}</p><button type="button" onClick={() => { service.remove(deleting.id); setDeleting(null); refresh() }}>Xác nhận xóa câu hỏi</button><button type="button" onClick={() => setDeleting(null)}>Hủy</button></div>}
  </section>
}

function QuestionEditor({ initial, onSave, onCancel }: { initial?: CustomQuestion; onSave: (input: CustomQuestionInput) => void; onCancel: () => void }) {
  const [input, setInput] = useState<CustomQuestionInput>(initial ? { topicId: initial.topicId, prompt: initial.prompt, answer: initial.answer, explanation: initial.explanation, grade: initial.grade, difficulty: initial.difficulty } : emptyInput)
  const [error, setError] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try { onSave(input) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể lưu câu hỏi') }
  }
  return <div aria-label={initial ? 'Sửa câu hỏi' : 'Thêm câu hỏi'} className="dialog" role="dialog" aria-modal="true"><h3>{initial ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h3><form onSubmit={submit} noValidate>
    <label>Chủ đề<select aria-label="Chủ đề" value={input.topicId} onChange={event => setInput({ ...input, topicId: event.target.value })}>{TOPICS.map(topic => <option key={topic.id} value={topic.id}>{topic.name}</option>)}</select></label>
    <label>Lớp câu hỏi<input aria-label="Lớp câu hỏi" type="number" min="1" max="12" value={input.grade} onChange={event => setInput({ ...input, grade: Number(event.target.value) as Grade })} /></label>
    <label>Độ khó<select aria-label="Độ khó" value={input.difficulty} onChange={event => setInput({ ...input, difficulty: event.target.value as Difficulty })}>{(Object.keys(difficultyNames) as Difficulty[]).map(difficulty => <option key={difficulty} value={difficulty}>{difficultyNames[difficulty]}</option>)}</select></label>
    <label>Đề bài<textarea aria-label="Đề bài" value={input.prompt} onChange={event => setInput({ ...input, prompt: event.target.value })} /></label>
    <label>Đáp án<input aria-label="Đáp án" value={input.answer} onChange={event => setInput({ ...input, answer: event.target.value })} /></label>
    <label>Giải thích<textarea aria-label="Giải thích" value={input.explanation} onChange={event => setInput({ ...input, explanation: event.target.value })} /></label>
    {error && <p role="alert">{error}</p>}<button type="submit">Lưu câu hỏi</button><button type="button" onClick={onCancel}>Hủy</button>
  </form></div>
}
