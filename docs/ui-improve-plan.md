# UI improve plan

Plan cho 8 yêu cầu improve UI của BackJet. Làm phần cấu trúc trước, chốt mockup rồi mới code giao diện, để không phải làm UI hai lần.

## Yêu cầu

1. Bottom sheet: dữ liệu bên trong không cần animation.
2. Bottom nav dùng liquid glass.
3. UI search trên Dashboard: khi scroll xuống thì thu nhỏ nhưng chưa nổi bật; khi scroll lên thì không quay về trạng thái đầy đủ.
4. Đổi logo app, không dùng logo cũ.
5. Bỏ tab Flights; kết quả là một màn riêng, mở ra sau khi user search từ Dashboard.
6. Kết quả search hiện ở màn riêng; Dashboard chỉ còn UI search và list recommend.
7. Tiết chế animation: chỉ dùng khi đủ và cần.
8. Thiết kế lại UI theo skill `mobile-app-ui-design`.

## Phase 1: Navigation (yêu cầu 5, 6)

1. Bỏ `FlightsTab` trong `src/app/navigation/RootNavigator.tsx`. Tab bar còn 3 tab: Home, Trips, Profile.
2. Thêm màn `SearchResults` vào `HomeStack` (`src/app/navigation/HomeNavigator.tsx`).
   - Chuyển `JetResults` và `SelectionBar` từ Dashboard sang màn này.
   - Mở bằng push khi user bấm Search.
3. Dashboard chỉ còn header, form search và list recommend (`NewsCarousel`).
   - Chuyển `useSearchChartersQuery`, `RefreshControl` và snackbar lỗi sang màn kết quả.
4. Màn kết quả có header tóm tắt chuyến (route, ngày, số khách). Bấm vào thì quay về Dashboard để sửa search.
5. Cập nhật `src/app/navigation/types.ts`, các route từ Notifications và NewsDetail, cùng các test liên quan.

## Phase 2: Thanh search khi scroll (yêu cầu 3)

Nguyên nhân: trong `src/features/dashboard/presentation/use-collapsible-search.ts`, hàm `snap` chỉ chạy khi vị trí scroll đang ở giữa hai trạng thái. Khi đã scroll quá điểm thu gọn, form chỉ hiện lại lúc kéo về sát đầu trang.

1. Dashboard không còn list kết quả dài, nên viết lại hook cho đơn giản và bỏ mẹo `minContentHeight`.
2. Thu gọn theo hướng scroll:
   - kéo xuống quá form: thu thành thanh nhỏ dính trên cùng
   - kéo lên khoảng 24pt: tự mở lại form đầy đủ
3. Làm thanh nhỏ (`SearchSummaryBar`) nổi bật hơn: dạng pill có bóng mềm, nút search màu accent, chữ route to rõ.

## Phase 3: Giảm animation (yêu cầu 1, 7)

1. Bottom sheet: giữ hiệu ứng trượt lên của chính sheet. Bỏ `FadeUp` trên header và từng dòng dữ liệu trong:
   - `BJSheet.tsx`
   - `AirportSheet.tsx`
   - `CalendarSheet.tsx`
   - `CountSheet.tsx`
   - `ConfirmSheet.tsx`
2. Giữ lại:
   - phản hồi khi bấm (`PressableScale`)
   - chuyển màn
   - shimmer lúc loading
   - `SuccessMark` khi đặt chuyến thành công, khoảnh khắc đáng nhớ nhất của flow
3. Bỏ hoặc giảm:
   - `FadeUp` chạy lần lượt trong các list
   - `CountUp` trên giá tiền
   - fade hero khi scroll
   - animation ở Splash và Login, làm đơn giản lại
4. Quy tắc chung:
   - mỗi animation tối đa khoảng 250ms
   - không hiệu ứng chạy lần lượt quá 3 item
   - tôn trọng setting Reduce Motion của máy

## Phase 4: Mockup thiết kế lại (yêu cầu 8)

1. Chuẩn lại token theo skill `mobile-app-ui-design`:
   - khoảng cách theo lưới 8pt
   - tối đa 4 cỡ chữ và 2 độ đậm
   - màu theo tỉ lệ 60/30/10 (nền / chữ và phần tối / accent)
   - bóng mềm, có ám màu nền
2. Làm mockup HTML cho Home, Search Results, Jet Quote, Checkout, Trips, Profile, ở cả light và dark, để duyệt trước.
3. Sau khi duyệt mới code từng màn và chụp lại ảnh trong `docs/screenshots`.

## Phase 5: Bottom nav liquid glass (yêu cầu 2)

1. Đề xuất dùng `createNativeBottomTabNavigator`, có sẵn trong `@react-navigation/bottom-tabs` hiện tại (bản thử nghiệm).
   - iOS 26: tab bar tự có liquid glass của hệ thống.
   - Android: tab Material.
2. Đổi lại sẽ mất bar tự vẽ `BlackJetTabBar`. Tab Profile sẽ là icon, không còn avatar chữ cái đầu.

## Phase 6: Logo mới (yêu cầu 4)

1. Thay `src/assets/images/logo-light.png` và `logo-dark.png` (dùng ở Splash, Login, HomeHeader).
2. Thay icon app:
   - iOS: `ios/BackJet/Images.xcassets/AppIcon.appiconset`
   - Android: `android/app/src/main/res/mipmap-*`

## Cần chốt trước khi làm

1. **Flow đặt ghế cũ trong tab Flights** (`FlightSearch` → `FlightResults` → `Booking`) khác với flow thuê chuyến trên Dashboard.
   - Đề xuất: bỏ hẳn, chỉ giữ flow thuê chuyến.
   - Hoặc: giữ nó dưới dạng màn riêng.
2. **Liquid glass:**
   - Đề xuất: tab bar native (mất avatar trên tab Profile).
   - Hoặc: giữ bar tự vẽ và thêm lib `@callstack/liquid-glass` (chỉ có hiệu ứng trên iOS 26, máy khác chỉ làm mờ nền).
3. **Logo:** dùng file logo có sẵn, hay thiết kế mới (SVG, kiểu wordmark hoặc chữ lồng)?

## Trạng thái (2026-10-18)

Đã làm đủ 6 phase. Các điểm cần chốt được xử lý theo hướng đề xuất:

1. Bỏ flow đặt ghế chuyến bay thường (màn `FlightSearch`, `FlightResults`, `FlightDetail`, `AirportPicker`, `Booking`). Phần domain/data của `flights` vẫn giữ vì flow thuê chuyến dùng sân bay và máy bay từ đó.
2. Liquid glass: dùng `createNativeBottomTabNavigator`. iOS hiện SF Symbols, Android dùng PNG vẽ từ font icon của app.
3. Logo: thiết kế mới (biểu tượng máy bay màu champagne + chữ BLACKJET), xuất PNG cho logo, icon app iOS/Android và icon tab Android.

Khác với plan:

- Phase 4 không làm mockup HTML để duyệt, vì yêu cầu là làm hết không cần hỏi. Thiết kế được áp thẳng vào code qua token mới.
- Flow thuê chuyến (`SearchResults`, `JetQuote`, `CharterCheckout`, `CharterConfirmation`) nằm ở root stack, mở full màn che tab bar.
- Dashboard có thêm list "Popular routes"; bấm một route sẽ điền sân bay vào form.

Đã kiểm tra:

- `tsc`, `eslint`, `jest` (81 test) đều pass.
- Chạy trên iPhone 17 Pro Max (iOS 26): Home, thanh search khi scroll lên/xuống, các sheet, màn kết quả, Jet Quote, Trips, Profile, light và dark.

Chưa làm:

- Ảnh trong `docs/screenshots` vẫn là giao diện cũ.
