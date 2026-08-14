import type { MathTopic } from '../../shared/model/types'

interface TopicGridProps {
  topics: MathTopic[]
  onSelect: (topic: MathTopic) => void
}

export function TopicGrid({ topics, onSelect }: TopicGridProps) {
  return (
    <section aria-labelledby="topic-grid-heading">
      <h2 id="topic-grid-heading">Chọn chủ đề</h2>
      <div className="topic-grid">
        {topics.map(topic => (
          <button className="topic-card" key={topic.id} onClick={() => onSelect(topic)} type="button">
            <span aria-hidden="true">{topic.icon}</span> {topic.name}
          </button>
        ))}
      </div>
    </section>
  )
}

