export function PhonePreview() {
  return (
    <div className="phone-preview" aria-label="Minh họa màn hình bài luyện Toán">
      <div className="phone-preview__speaker" aria-hidden="true" />
      <div className="phone-preview__screen">
        <div className="preview-topline">
          <span>Chào An!</span>
          <span aria-label="Chuỗi học 4 ngày">🔥 4</span>
        </div>
        <p className="preview-kicker">Bài luyện hôm nay</p>
        <h3>Phép cộng</h3>
        <div className="preview-progress" aria-label="Tiến độ bài luyện: 2 trên 5 câu"><span /></div>
        <div className="preview-problem" aria-label="Câu hỏi: 8 cộng 7 bằng bao nhiêu">
          <span>8</span><b>+</b><span>7</span><b>=</b><strong>?</strong>
        </div>
        <div className="preview-options" aria-label="Các đáp án mẫu">
          <span>14</span><span className="is-selected">15</span><span>16</span>
        </div>
        <p className="preview-encouragement">Con làm rất tốt! ✨</p>
      </div>
    </div>
  )
}
