# Học cùng con — Đặc tả thiết kế

Ngày: 2026-08-14

## 1. Mục tiêu

Xây lại chức năng bài tập Toán thành ứng dụng React/Vite có thương hiệu **Học cùng con**, lấy cảm hứng từ trải nghiệm của `baitap.xyz` nhưng sử dụng nhận diện và nội dung riêng. Sản phẩm phục vụ gia đình có nhiều trẻ học Toán lớp 1–5, hoạt động không cần backend trong phiên bản đầu và có kiến trúc để mở rộng nội dung đến lớp 12, kết nối backend hoặc AI về sau.

## 2. Phạm vi phiên bản đầu

- Landing page giới thiệu sản phẩm và dẫn vào ứng dụng.
- Nhiều hồ sơ trẻ trên cùng thiết bị.
- Hơn 15 chủ đề Toán theo lớp 1–5; catalog chủ đề cho phép bổ sung dần đến lớp 12.
- Chọn chủ đề, độ khó và số câu hỏi.
- Làm bài, chấm điểm, xem giải thích ngắn và nhận phản hồi động viên.
- Lưu lịch sử luyện tập, thống kê, streak và mục tiêu tuần.
- Khu vực phụ huynh được bảo vệ bằng PIN 4 số.
- Trang đăng nhập cục bộ bảo vệ Game Hub và các chức năng bên trong.
- In phiếu bài tập ra giấy, kèm tùy chọn in đáp án từ khu vực phụ huynh.
- Game Hub và các game HTML cũ tiếp tục hoạt động.
- Các trang HTML cũ dùng chung hệ màu, typography, header và nút điều hướng với Game Hub.
- Dữ liệu được lưu cục bộ nhưng tuân theo interface có thể thay bằng API.

Không nằm trong phạm vi phiên bản đầu:

- Tài khoản trực tuyến hoặc đồng bộ nhiều thiết bị.
- Backend sản xuất.
- Gọi mô hình AI thật.
- Xuất tệp PDF chuyên dụng ngoài khả năng lưu PDF của hộp thoại in trình duyệt.

## 3. Kiến trúc ứng dụng

Repo được chuyển sang React/Vite và sử dụng React Router. Các đường dẫn sản phẩm:

- `/`: Game Hub.
- `/login`: đăng nhập cục bộ trước khi truy cập Game Hub.
- `/hoc-cung-con`: landing page.
- `/hoc-cung-con/app`: ứng dụng dành cho trẻ.
- `/hoc-cung-con/phu-huynh`: bảng điều khiển phụ huynh.

Game Hub và các route ứng dụng được bảo vệ bởi route guard kiểm tra phiên đăng nhập cục bộ. Thông tin đăng nhập được quản lý qua auth service; component không đọc `localStorage` trực tiếp.

Các trang HTML game hiện tại vẫn được giữ nguyên dưới dạng tài nguyên tĩnh và tiếp tục được Game Hub liên kết trực tiếp. Một stylesheet dùng chung cung cấp design token, typography, header, nút và liên kết quay về Game Hub để các trang này có nhận diện thống nhất mà không làm thay đổi logic game.

Ứng dụng chia theo miền chức năng thay vì chia theo loại kỹ thuật:

- `profiles`: hồ sơ trẻ, lớp học, avatar và hồ sơ đang hoạt động.
- `practice`: chủ đề, cấu hình bài luyện, bộ tạo câu hỏi và phiên làm bài.
- `progress`: kết quả, lịch sử, chủ đề mạnh/yếu và tổng hợp theo tuần.
- `streaks`: chuỗi học liên tiếp và lịch hoạt động.
- `parent`: PIN, mục tiêu tuần và các thao tác quản lý.
- `auth`: tài khoản gia đình cục bộ, phiên đăng nhập và route guard.
- `print`: bố cục phiếu bài tập, đáp án và lệnh in của trình duyệt.
- `storage`: interface nguồn dữ liệu, local adapter và migration.

UI chỉ phụ thuộc vào interface của các service. Adapter `localStorage` là implementation đầu tiên; adapter API có thể được bổ sung mà không thay đổi logic màn hình.

## 4. Mô hình dữ liệu

Các model cốt lõi:

- `ChildProfile`: thông tin trẻ, lớp, avatar và trạng thái hồ sơ.
- `MathTopic`: mã chủ đề, lớp phù hợp, nhóm kiến thức và khả năng sinh câu hỏi.
- `PracticeSession`: cấu hình, câu hỏi, trạng thái, thời gian bắt đầu/kết thúc.
- `AnswerResult`: câu trả lời, đáp án đúng, trạng thái đúng/sai và giải thích.
- `ProgressSummary`: tổng hợp tỷ lệ đúng, chủ đề mạnh/yếu và dữ liệu theo tuần.
- `ParentSettings`: PIN đã băm, mục tiêu tuần và tùy chọn gia đình.
- `LocalAccount`: tên đăng nhập, mật khẩu đã băm và trạng thái phiên cục bộ.
- `PrintSettings`: thông tin đầu trang, chế độ in đáp án và tùy chọn trình bày.

Mọi bản ghi bền vững có `id`, `createdAt`, `updatedAt` và `schemaVersion`. Lớp migration nâng dữ liệu qua từng phiên bản schema. Dữ liệu lỗi được cô lập và phục hồi về cấu trúc mặc định hợp lệ; không âm thầm xóa toàn bộ dữ liệu gia đình.

## 5. Bộ tạo câu hỏi

Bộ tạo câu hỏi tuân theo interface chung nhận lớp học, chủ đề, độ khó và số câu, sau đó trả về danh sách câu hỏi chuẩn hóa. Phiên bản đầu chạy hoàn toàn trong trình duyệt.

Tối thiểu hỗ trợ các nhóm, được gắn metadata về lớp tối thiểu/tối đa để catalog có thể mở rộng từ lớp 1 đến lớp 12:

- Cộng và trừ theo phạm vi phù hợp từng lớp.
- Bảng nhân và bảng chia.
- Nhân, chia số có nhiều chữ số.
- So sánh số.
- Điền số còn thiếu.
- Dãy số và quy luật đơn giản.
- Bài toán có lời văn.
- Phân số cơ bản.
- Đổi đơn vị độ dài, khối lượng và thời gian.
- Hình học cơ bản, chu vi và diện tích.
- Bài luyện tổng hợp.

Lớp 1 tập trung vào nhận biết số, đếm, so sánh, cộng trừ cơ bản, hình dạng và bài toán trực quan. Lớp 2–5 tăng dần phạm vi số và bổ sung nhân chia, phân số, đơn vị đo, hình học và bài toán có lời văn. Cấu trúc catalog không hard-code danh sách lớp trong component; khi bổ sung nội dung lớp 6–12 chỉ cần đăng ký topic/generator phù hợp.

Một implementation tạo câu hỏi từ API hoặc AI có thể được thêm sau qua cùng interface. UI luyện tập không phụ thuộc nguồn sinh câu hỏi.

## 6. Trải nghiệm người dùng

### 6.1 Landing page

- Thanh điều hướng mang thương hiệu “Học cùng con”.
- Hero tập trung vào thông điệp “5 phút mỗi ngày, con vững Toán cả năm”.
- Bản xem trước ứng dụng dạng thiết bị di động.
- Thống kê về số chủ đề, lớp học và khả năng luyện mọi lúc.
- Quy trình ba bước: chọn chủ đề, con làm bài, phụ huynh theo dõi.
- Lưới lợi ích, nhận xét phụ huynh và CTA cuối trang.
- Phong cách thân thiện, sáng, dễ đọc trên điện thoại; không sao chép nguyên thương hiệu hoặc tài sản của trang tham chiếu.

### 6.2 Đăng nhập và Game Hub

- Lần đầu sử dụng, gia đình tạo tên đăng nhập và mật khẩu cục bộ.
- Mật khẩu được băm trước khi lưu; phiên đăng nhập chỉ có hiệu lực trên thiết bị hiện tại.
- Chưa đăng nhập thì mọi route bên trong chuyển về `/login`.
- Có thao tác đăng xuất rõ ràng trên Game Hub.
- Game Hub và các trang HTML cũ dùng chung design token, typography, header và kiểu nút để tạo một hệ giao diện thống nhất.

### 6.3 Ứng dụng dành cho trẻ

- Chuyển nhanh giữa nhiều hồ sơ trẻ.
- Dashboard gồm lời chào, streak, mục tiêu hôm nay và chủ đề gợi ý.
- Danh sách chủ đề lọc theo lớp của hồ sơ đang chọn.
- Chọn độ khó và số câu trước khi bắt đầu.
- Hỗ trợ chế độ từng câu và phiếu bài tập.
- Tự động lưu bài đang làm.
- Kết quả gồm điểm, số câu đúng, giải thích ngắn, huy hiệu và lời động viên.
- Có nút in phiếu bài tập trắng để trẻ làm trên giấy.

### 6.4 Khu vực phụ huynh

- Mở khóa bằng PIN 4 số.
- Thêm, sửa, chuyển và xóa hồ sơ trẻ.
- Xem điểm theo tuần, tỷ lệ đúng, lịch sử và mức hoàn thành mục tiêu.
- Hiển thị chủ đề mạnh/yếu và đề xuất nội dung nên ôn.
- Đặt mục tiêu số buổi hoặc số câu mỗi tuần.
- In phiếu bài tập trắng hoặc phiếu kèm đáp án; đáp án chỉ hiện sau khi xác minh PIN.
- Đổi PIN và đặt lại dữ liệu với xác nhận rõ ràng.

### 6.5 Bản in

- Dùng stylesheet `@media print` tối ưu cho khổ A4 và mực đen trắng.
- Ẩn điều hướng, nút và các phần tương tác khi in.
- Hiển thị tên trẻ, lớp, chủ đề, ngày tạo, câu hỏi và vùng trống để làm bài.
- Tùy chọn in đáp án tạo một phần riêng ở cuối hoặc trang kế tiếp.
- Sử dụng hộp thoại in chuẩn của trình duyệt; không tạo tệp PDF riêng trong phiên bản đầu.

## 7. Luồng dữ liệu

1. Người dùng đăng nhập bằng tài khoản gia đình cục bộ.
2. Auth service tạo phiên trên thiết bị và route guard cho phép vào Game Hub.
3. Người dùng chọn hồ sơ trẻ.
4. Ứng dụng tải cấu hình lớp, tiến độ và mục tiêu qua storage service.
5. Người dùng chọn chủ đề, độ khó và số câu.
6. Practice service tạo `PracticeSession` và lưu bản nháp.
7. Mỗi câu trả lời cập nhật phiên đang làm.
8. Khi nộp bài, scoring service tạo `AnswerResult` và tổng kết phiên.
9. Progress service cập nhật lịch sử, tổng hợp chủ đề và streak.
10. Dashboard của trẻ và phụ huynh cùng đọc dữ liệu tổng hợp qua service, không truy cập `localStorage` trực tiếp.
11. Khi in, print service dựng view chỉ đọc từ phiên bài tập và gọi hộp thoại in của trình duyệt.

## 8. Bảo mật và xử lý lỗi

- PIN được băm trước khi lưu, không lưu dạng văn bản thuần.
- Mật khẩu đăng nhập cục bộ cũng được băm, không lưu dạng văn bản thuần.
- Giới hạn số lần nhập sai và khóa tạm thời trên thiết bị.
- Validate toàn bộ dữ liệu đọc từ storage.
- Hiển thị trạng thái rỗng và lỗi thân thiện.
- Tự động lưu phiên làm bài để phục hồi sau khi tải lại trang.
- Xóa hồ sơ và đặt lại dữ liệu luôn cần xác nhận.
- Lỗi của một hồ sơ không làm hỏng dữ liệu của các hồ sơ còn lại.

Lưu ý: đăng nhập và PIN cục bộ là hàng rào dành cho trải nghiệm gia đình, không phải cơ chế bảo mật tương đương xác thực server. Kiến trúc auth service cho phép thay bằng nhà cung cấp xác thực thật trong phiên bản sau.

## 9. Khả năng truy cập và responsive

- Mobile-first, hỗ trợ desktop và tablet.
- Điều hướng, form và bài tập dùng được bằng bàn phím.
- Nhãn accessible đầy đủ cho input và nút icon.
- Focus state rõ ràng.
- Không dùng màu sắc làm tín hiệu đúng/sai duy nhất.
- Tôn trọng `prefers-reduced-motion`.

## 10. Chiến lược kiểm thử

- Unit test: bộ tạo câu hỏi, tính điểm, streak, băm/xác minh mật khẩu và PIN, migration và validation.
- Component test: đăng nhập, route guard, chọn hồ sơ, tạo bài, làm bài, kết quả, mở khóa phụ huynh và quản lý hồ sơ.
- Integration test: đăng nhập → tạo hồ sơ → luyện tập → nộp bài → xem báo cáo phụ huynh → in phiếu.
- Print test: view in không có điều hướng, có đủ câu hỏi và chỉ hiển thị đáp án sau khi xác minh PIN.
- Regression: Game Hub và các game HTML cũ vẫn truy cập được, đồng thời dùng đúng stylesheet nhận diện chung.
- Production build phải thành công.
- Kiểm tra thủ công luồng chính trên desktop và mobile.

## 11. Tiêu chí hoàn thành

- Người dùng có thể tạo ít nhất hai hồ sơ trẻ và chuyển đổi giữa chúng.
- Người dùng phải đăng nhập cục bộ trước khi vào Game Hub và có thể đăng xuất.
- Hồ sơ hỗ trợ lớp 1–5; catalog topic có thể đăng ký nội dung đến lớp 12 mà không sửa component giao diện.
- Mỗi hồ sơ nhận chủ đề đúng theo lớp đã chọn.
- Một phiên bài tập có thể hoàn thành, chấm điểm và lưu lịch sử.
- Tải lại trang khôi phục dữ liệu và phiên đang làm.
- Streak và thống kê tuần cập nhật đúng sau khi hoàn thành bài.
- Khu vực phụ huynh yêu cầu PIN và khóa tạm thời sau nhiều lần nhập sai.
- Phụ huynh xem được lịch sử, chủ đề mạnh/yếu và thay đổi mục tiêu tuần.
- Phụ huynh có thể in phiếu trắng hoặc phiếu kèm đáp án sau khi xác minh PIN.
- Ứng dụng responsive; các game hiện có không bị gián đoạn và có nhận diện thống nhất với Game Hub.
- Kiến trúc không để component truy cập trực tiếp `localStorage`, cho phép thay adapter dữ liệu về sau.
