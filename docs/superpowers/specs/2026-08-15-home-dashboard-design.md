# Home Dashboard — Đặc tả thiết kế

Ngày: 2026-08-15

## 1. Mục tiêu

Thiết kế lại trang Home/Game Hub sau đăng nhập thành dashboard gia đình tối giản, giúp người dùng nhận biết nhanh chức năng chính và mở hoạt động bằng một thao tác. Trang tiếp tục đồng bộ với thương hiệu **Học cùng con**, nhưng chuyển hệ màu chính sang kem và xanh lá dịu.

Thay đổi chỉ tác động đến giao diện và trải nghiệm điều hướng của Home. Các đường dẫn, dữ liệu tài khoản, cơ chế đăng nhập và nội dung của từng game không thay đổi.

## 2. Phân cấp nội dung

Trang Home gồm bốn vùng theo thứ tự:

1. Header dùng chung của ứng dụng.
2. Khối chào mừng có tên tài khoản và lời dẫn ngắn.
3. Dashboard hoạt động, trong đó **Học cùng con** là lựa chọn chính.
4. Dòng trạng thái dữ liệu cục bộ ở cuối nội dung.

Không bổ sung thống kê hoặc dữ liệu tiến độ mới trong lần thay đổi này. Mục tiêu là làm rõ phân cấp của những chức năng đã có.

## 3. Dashboard hoạt động

### 3.1 Thẻ chính

Thẻ **Học cùng con** có diện tích và độ nổi bật lớn nhất. Nội dung gồm:

- Biểu tượng thương hiệu.
- Nhãn ngắn thể hiện đây là hoạt động được đề xuất.
- Tên “Học cùng con”.
- Mô tả luyện Toán lớp 1–5.
- Nhãn hành động “Bắt đầu học” kèm mũi tên để gợi ý điều hướng.

Toàn bộ bề mặt thẻ là một liên kết tới `/hoc-cung-con/app`; nhãn hành động không phải nút lồng bên trong.

### 3.2 Thẻ game phụ

Ba thẻ Random Number, Cờ Caro và Cờ Vua có kích thước nhỏ hơn và được trình bày nhất quán. Mỗi thẻ gồm biểu tượng, tiêu đề, mô tả ngắn và mũi tên định hướng.

Toàn bộ mỗi thẻ là một liên kết tới trang game tương ứng. Liên kết “Mở” riêng biệt hiện tại được loại bỏ.

Kiến trúc danh sách vẫn dựa trên dữ liệu cấu hình để có thể thêm game mới mà không phải sao chép markup.

## 4. Tương tác

- Con trỏ chuột thể hiện rõ toàn bộ thẻ có thể chọn.
- Hover làm thẻ nâng nhẹ, đổi màu viền sang xanh lá và dịch chuyển mũi tên vừa đủ để phản hồi thao tác.
- Focus bàn phím có outline tương phản cao và không phụ thuộc vào màu hover.
- Nhấn `Enter` trên thẻ thực hiện điều hướng như liên kết thông thường.
- Không dùng nút hoặc liên kết tương tác lồng bên trong thẻ.
- Hiệu ứng chuyển động được tắt hoặc giảm khi thiết bị bật `prefers-reduced-motion`.

## 5. Phong cách thị giác

- Nền trang: kem nhạt, giữ cảm giác ấm của sản phẩm gia đình.
- Màu chủ đạo: xanh lá dịu cho điểm nhấn, trạng thái tương tác và thẻ học chính.
- Màu san hô: chỉ giữ ở chi tiết thương hiệu nhỏ để duy trì liên hệ với giao diện hiện tại.
- Thẻ: trắng ngà, viền mảnh, bóng đổ nhẹ và bo góc vừa phải.
- Chữ: navy đậm cho tiêu đề, xám xanh cho nội dung phụ.
- Icon: cùng kích thước khung và cách căn chỉnh; màu nền có thể phân biệt từng hoạt động nhưng giữ độ bão hòa thấp.
- Khoảng trắng được dùng để phân nhóm nội dung, tránh thêm đường kẻ hoặc trang trí không cần thiết.

## 6. Responsive

### Desktop

- Header hiển thị trên một hàng trong vùng nội dung tối đa.
- Khối chào mừng gọn, không chiếm toàn bộ chiều cao màn hình.
- Thẻ Học cùng con chiếm khoảng một nửa vùng dashboard.
- Ba thẻ game phụ sử dụng phần còn lại theo lưới cân đối.

### Tablet

- Thẻ Học cùng con chiếm toàn bộ chiều rộng.
- Các game phụ chia hai cột; thẻ cuối thích nghi với không gian còn lại.

### Mobile

- Header và khoảng cách dọc được thu gọn.
- Các thẻ xếp một cột và toàn bộ bề mặt dễ chạm.
- Nội dung thẻ được rút gọn để tránh chiều cao quá lớn.
- Không xuất hiện khoảng trống ngang hoặc menu bị xuống hàng rời rạc.

## 7. Khả năng truy cập

- Dashboard dùng danh sách có ngữ nghĩa; mỗi hoạt động là một liên kết toàn khối.
- Tên truy cập của thẻ mô tả rõ hành động và hoạt động đích.
- Icon trang trí được ẩn khỏi trình đọc màn hình.
- Tương phản chữ, viền focus và trạng thái hover đáp ứng khả năng đọc trên nền kem/trắng.
- Không dùng riêng màu sắc để truyền đạt lựa chọn hoặc trạng thái.
- Vùng chạm trên mobile đủ lớn và không yêu cầu thao tác chính xác vào một nhãn nhỏ.

## 8. Phạm vi mã nguồn dự kiến

- Cập nhật cấu trúc trang trong `src/pages/GameHubPage.tsx`.
- Cập nhật style Home và breakpoint liên quan trong `src/styles/global.css`.
- Điều chỉnh hoặc bổ sung test cho cấu trúc liên kết toàn thẻ, nội dung và đường dẫn.
- Giữ nguyên `AppHeader`, trừ khi cần thêm class hoặc wrapper nhỏ để sửa lỗi responsive của Home mà không làm ảnh hưởng các trang khác.

Không thay đổi routing, repository, storage, auth hoặc các trang HTML game.

## 9. Kiểm thử và xác minh

- Component test xác nhận bốn hoạt động đều là liên kết toàn thẻ và trỏ đúng URL.
- Test xác nhận không còn liên kết “Mở” riêng trong mỗi thẻ.
- Chạy toàn bộ test hiện có để kiểm tra hồi quy.
- Chạy production build và GitHub Pages build.
- Kiểm tra trực quan trên desktop, tablet và mobile.
- Kiểm tra điều hướng bằng bàn phím, focus state và `prefers-reduced-motion`.
- Xác nhận các game HTML cũ vẫn mở đúng từ Home.

## 10. Tiêu chí hoàn thành

- Home thể hiện rõ Học cùng con là hoạt động chính.
- Toàn bộ bốn thẻ đều có thể click/chạm để điều hướng; không còn nút “Mở” riêng.
- Bố cục không tạo khoảng trống ngang bất thường và hoạt động tốt ở ba nhóm màn hình.
- Hệ màu kem – xanh lá dịu đồng bộ, dễ đọc và vẫn giữ một điểm nhấn thương hiệu san hô.
- Hover, focus và reduced motion hoạt động đúng.
- Không làm thay đổi chức năng đăng nhập, dữ liệu cục bộ, routing hoặc các game hiện có.
- Toàn bộ test và build bắt buộc đều thành công.
