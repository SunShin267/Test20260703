# Family Page Layout — Đặc tả thiết kế

Ngày: 2026-08-15

## 1. Mục tiêu

Tạo một layout React dùng chung cho các trang gia đình đã đăng nhập, nhằm loại bỏ phần header và khối giới thiệu đang bị lặp giữa Game Hub, góc học tập của trẻ và khu vực phụ huynh.

Layout mới phải giữ nguyên thương hiệu **SunShinSon**, điều hướng, đăng xuất, dữ liệu cục bộ và nội dung riêng của từng page. Thay đổi này là refactor giao diện; không thay đổi routing, repository, auth hoặc model dữ liệu.

## 2. Phạm vi

Các trang sử dụng layout:

- `GameHubPage`.
- `ChildDashboardPage` khi chưa bắt đầu một phiên làm bài.
- `ParentDashboardPage`.

Không áp dụng layout cho `PracticePage` khi trẻ đang làm bài, nhằm giữ màn hình luyện tập tập trung và không thêm điều hướng gây xao nhãng.

## 3. Component `FamilyPageLayout`

Tạo `src/components/FamilyPageLayout.tsx` với interface công khai:

```tsx
interface FamilyPageLayoutProps {
  children: ReactNode
  description: ReactNode
  greetingName?: string
  mainClassName?: string
}
```

Cách sử dụng:

```tsx
<FamilyPageLayout
  greetingName={activeProfile.name}
  description="Hôm nay mình cùng chinh phục một bài Toán nhé."
>
  {pageContent}
</FamilyPageLayout>
```

Layout chịu trách nhiệm:

- Đọc tên tài khoản hiện tại từ repository; dùng “gia đình” nếu chưa có tên hợp lệ.
- Render `AppHeader` với nhãn thương hiệu và nhãn Home là `SunShinSon`.
- Gọi `signOut()` và điều hướng tới `/login` với `replace: true` khi đăng xuất.
- Render khối giới thiệu đầu trang gồm eyebrow “Không gian gia đình”, tiêu đề cấp 1 “SunShinSon” và lời chào.
- Dùng `greetingName` cho lời chào khi được truyền; nếu không có thì dùng tên tài khoản.
- Render `description` sau lời chào và `children` bên dưới khối giới thiệu.
- Ghép class mặc định của container với `mainClassName` tùy chọn mà không tạo chuỗi class thừa.

`description` dùng `ReactNode` thay vì chỉ `string` để page có thể bổ sung nội dung nhấn mạnh hoặc liên kết về sau mà không thay đổi interface.

## 4. Thanh điều hướng dùng chung

Tiếp tục sử dụng `AppHeader` hiện có thay vì tạo thanh điều hướng thứ hai. `FamilyPageLayout` truyền:

- `accountName` lấy từ repository để bật biến thể authenticated.
- `brandLabel="SunShinSon"`.
- `homeLabel="SunShinSon"`.
- `onSignOut` do layout quản lý.

Các liên kết giữ nguyên:

- Home: `/`.
- Góc học tập: `/hoc-cung-con/app`.
- Khu vực phụ huynh: `/hoc-cung-con/phu-huynh`.
- Link thương hiệu về trang giới thiệu: `/hoc-cung-con`.

Navigation cục bộ bị trùng trong `ChildDashboardPage` và `ParentDashboardPage` được loại bỏ sau khi hai page dùng layout chung.

## 5. Khối giới thiệu dùng chung

Khối `.hub-intro` hiện có được chuyển thành phần do `FamilyPageLayout` render. Nội dung chung:

- Eyebrow: “Không gian gia đình”.
- Heading cấp 1: “SunShinSon”.
- Lời chào: `Chào <strong>{greetingName ?? accountName}</strong>, {description}`.

Mỗi page chỉ cung cấp phần mô tả:

- Game Hub: “chọn một hoạt động để bắt đầu khoảng thời gian vui vẻ cùng nhau.”
- Child Dashboard có hồ sơ: “hôm nay mình cùng chinh phục một bài Toán nhé.”
- Child Dashboard chưa có hồ sơ: “hãy tạo hồ sơ để bắt đầu học cùng con.”
- Parent Dashboard: “theo dõi tiến độ và quản lý nội dung học tập của con.”

## 6. Bố cục và CSS

Layout render cấu trúc:

```tsx
<div className="family-shell">
  <AppHeader />
  <main className="family-main ...">
    <section className="hub-intro">...</section>
    {children}
  </main>
</div>
```

`family-shell` dùng nền và chiều cao tối thiểu thống nhất với Home hiện tại. `family-main` cung cấp chiều rộng tối đa, căn giữa và padding responsive dùng chung.

Game Hub truyền class biến thể để giữ lưới dashboard rộng. Child và Parent dùng container mặc định. CSS hiện có của `.hub-intro` tiếp tục được tái sử dụng để không thay đổi nhận diện đã duyệt.

Không sao chép rule CSS header vào từng page.

## 7. Luồng dữ liệu và hành vi

1. Router render một page gia đình.
2. Page truyền tên người được chào và mô tả vào `FamilyPageLayout`.
3. Layout đọc tài khoản từ `AppRepository` thông qua `useAppServices`.
4. Layout render `AppHeader`, khối giới thiệu và nội dung page.
5. Khi người dùng đăng xuất, layout gọi auth provider rồi điều hướng về login.

Layout không lưu state riêng và không ghi dữ liệu. Việc đọc tài khoản chỉ phục vụ hiển thị header.

## 8. Trạng thái đặc biệt

- Nếu chưa có hồ sơ trẻ, `ChildDashboardPage` vẫn sử dụng layout và hiển thị form tạo hồ sơ trong `children`.
- Nếu URL chứa một session hợp lệ, `ChildDashboardPage` trả về `PracticePage` như hiện tại và không render layout.
- Nếu tài khoản không có username, layout hiển thị fallback “gia đình”.
- Nếu `mainClassName` không được truyền, output chỉ có class mặc định, không chứa `undefined` hoặc khoảng trắng dư có ý nghĩa.

## 9. Khả năng truy cập

- Mỗi trang chỉ có một heading cấp 1 do layout cung cấp.
- Khối giới thiệu dùng `aria-labelledby` trỏ tới heading có id ổn định.
- Navigation tiếp tục có accessible name từ `AppHeader`.
- Nút đăng xuất vẫn là button thực và dùng được bằng bàn phím.
- Nội dung `children` không bị thay đổi thứ tự focus.
- Màn hình làm bài không thêm navigation ngoài phạm vi cần thiết.

## 10. Kiểm thử

- Component test cho `FamilyPageLayout`: thương hiệu, navigation, greeting fallback, greeting tùy chỉnh và render `children`.
- Component test cho hành vi đăng xuất và điều hướng về `/login`.
- Regression test xác nhận `AppHeader` vẫn giữ mặc định cho Landing Page.
- Page test xác nhận Game Hub, Child Dashboard và Parent Dashboard đều hiển thị layout chung.
- Page test xác nhận trạng thái Child chưa có hồ sơ vẫn nằm trong layout.
- Page test xác nhận `PracticePage` không hiển thị header của layout.
- Chạy toàn bộ test và production build sau refactor.

## 11. Tiêu chí hoàn thành

- Ba page gia đình sử dụng `FamilyPageLayout` thay vì tự render header chung.
- Không còn khối `.hub-intro` bị sao chép trong các page.
- Không còn navigation cục bộ trùng với `AppHeader` trong Child và Parent.
- Nội dung lời chào đúng theo tài khoản hoặc hồ sơ trẻ.
- Đăng xuất hoạt động từ cả ba page.
- Practice Page giữ nguyên trải nghiệm tập trung.
- Các chỉnh sửa chưa commit hiện có của người dùng được bảo toàn trong quá trình refactor.
- Test và build bắt buộc thành công trước khi bàn giao.
