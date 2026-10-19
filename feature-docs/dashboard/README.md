# BlackJet: Spec màn Dashboard (tab Home) để luyện code lại

> Nguồn: phân tích tĩnh `blackjetoperator.apk` (Flutter 3 / Dart 3.10.4, build bằng **FlutterFlow**). Logic Dart được khôi phục bằng **blutter**, resource giải mã bằng apktool.
> Mục đích: **học tập**. Bạn tự code lại; đừng copy nguyên asset/brand khi publish (xem mục 10).
>
> Mức tin cậy: **[chắc]** = đọc trực tiếp từ code/hằng số. **[suy luận]** = suy ra từ cấu trúc, chưa thấy app chạy thật (không có thiết bị).

---

## 0. Tóm tắt trong 30 giây

> **Bản luyện tập khác app gốc ở 2 điểm** (chi tiết ở **mục 12**):
> 1. Kết quả tìm kiếm hiện **ngay trên Dashboard**, không chuyển sang màn `JetListings`.
> 2. Khu search **thu gọn thành thanh tóm tắt** khi user cuộn xuống.

Dashboard của khách hàng là route `Home` (`components/home/home_widget.dart`). Nó **không phải** màn thống kê; nó là màn **"tìm và đặt chuyên cơ"**:

```
┌───────────────────────────────────────┐  SafeArea
│ [BlackJet logo]          (💬•3) (🔔•1) │  AppBar trong suốt, 2 icon có badge
│                                       │
│ Flying Private Made                   │  32 / w500
│ Simple                                │
│ Book Your Private Jet Instantly       │  16 / w500 / secondaryText
│                                       │
│ ╭───────────────────────────────────╮ │  Booking card (AnimatedContainer 2000ms)
│ │ ◉ One Way  ○ Round Trip  ○ Multi  │ │  radio
│ │ ┌───────────┐  ⇄  ┌───────────┐   │ │  From / To + nút tròn ở giữa
│ │ │From       │     │To         │   │ │
│ │ │SGN        │     │HAN        │   │ │
│ │ │Ho Chi Minh│     │Hanoi      │   │ │
│ │ └───────────┘     └───────────┘   │ │
│ │ [📅 Departure Date][📅 Return Date]│ │  Return chỉ hiện khi Round Trip
│ │ [👪 2                       ]      │ │  số khách
│ │ ─────────────────────────────────  │ │
│ │ [         Find Your Jet          ] │ │  nút 50px
│ ╰───────────────────────────────────╯ │
│                                       │
│ ╭───────────────────────────────────╮ │  Carousel tin tức (Webflow), cao 220
│ │ (ảnh)  Title…                     │ │  PageView ≤5 bài + dot indicator
│ │        Summary…            • ○ ○  │ │
│ ╰───────────────────────────────────╯ │
│                (130px đệm đáy)        │
├───────────────────────────────────────┤
│  🏠      ✈      📰      (avatar)       │  Bottom nav nổi, nền #191919, bo 24 trên
└───────────────────────────────────────┘
```

---

## 1. Design tokens

### 1.1 Màu: `FlutterFlowTheme` (light / dark) **[chắc]**

| Token | Light | Dark | Dùng ở Dashboard |
|---|---|---|---|
| `primary` | `#000000` | `#FFFFFF` | |
| `primaryText` | `#000000` | `#FFFFFF` | icon trong các ô chọn |
| `secondaryText` | `#555553` | `#979797` | subtitle, text "Select Airport", dot inactive |
| `primaryBackground` | `#F7F7F7` | `#191919` | nền các ô input (From/To/Date/Pax) |
| `secondaryBackground` | `#FFFFFF` | `#000000` | nền body, AppBar, booking card |
| `jetBlack` | `#000000` | `#FFFFFF` | icon AppBar, nút **Find Your Jet** (nền) |
| `ghostWhite` | `#FFFFFF` | `#000000` | chữ trên nút Find Your Jet, icon trong nút tròn |
| `iron` | `#E3E3E3` | `#2A2B29` | border booking card, Divider |
| `ashGrey` | `#B4B4B4` | `#555553` | radio inactive |
| `permanentAsh` | `#555553` | `#555553` | dot carousel inactive |
| `info` | `#FFFFFF` | `#FFFFFF` | dot carousel active |
| `error` | `#EE4040` | `#EE4040` | badge |
| `alternate` | `#E0E3E7` | `#262D34` | |
| `alternateTextOrIcons` | `#000000` | `#E3E3E3` | |
| `cardBackground` | `#F1EFEF` | `#0F0F0F` | |
| `innerTileContainer` | `#FFFFFF` | `#2A2B29` | |
| `componentBackground` | `#E5FFFFFF` | `#E5080705` | |
| `loadStateColour` | `#B4B4B4` | `#2A2B29` | khối skeleton |
| `shimmerColour` | `#E0E0E0` | `#545751` | màu vệt shimmer |
| `fadeOverlay` | `#66FFFFFF` | `#66080705` | |
| `fadeOverLay2` | `#19FFFFFF` | `#1A080705` | |
| `fadeGradient` | `#CDFFFFFF` | `#CC000000` | |
| `success` | `#249689` | `#249689` | |
| `secondary` | `#39D2C0` | `#39D2C0` | |
| `chatMessageInput` | `#FFFFFF` | `#191919` | |
| `paymentLabelColour` | `#FFFFFF` | `#222222` | |

Hằng số cứng (không theo theme) **[chắc]**:
- `Scaffold.backgroundColor` của Home = **`#191919`** (luôn tối, kể cả light mode, nhưng body phủ `secondaryBackground` lên trên).
- Bottom nav: nền `#191919`; icon active `#FFFFFF`, inactive `#555553`.
- Badge text: `#FFFFFF`, 12px.

Theme mode: lưu trong SharedPreferences key `__theme_mode__` (bool). Không có giá trị thì theo **system**.

### 1.2 Typography **[chắc]**

Font chính: **KnulTrial** (Regular/Medium/Bold/ExtraBold, file trong `assets/fonts/`). Mọi text đều dùng font này.

| Style FlutterFlow | Size | Ghi chú |
|---|---|---|
| bodySmall | 12 | |
| bodyMedium / labelMedium | 14 | |
| bodyLarge / titleSmall / labelLarge | 16 | |
| titleMedium | 18 | |
| titleLarge | 22 | |
| headlineSmall / headlineMedium | 24 | |

Override cụ thể trên Dashboard:

| Phần tử | Size | Weight | Màu |
|---|---|---|---|
| Hero "Flying Private Made \nSimple" | 32 (AutoSize, min 20) | 500 | primaryText |
| Subtitle "Book Your Private Jet Instantly" | 16 | 500 | secondaryText |
| Radio label | 14 | 500 (active 700) | jetBlack / ashGrey |
| Label nhỏ "From"/"To"/"Departure Date" | 10 | 500 | primaryText |
| Mã sân bay (APPMAINCODE) | 16 | 500 | primaryText |
| Tên thành phố (AirportCity) | 12 | 500 | secondaryText |
| Nút "Find Your Jet" | titleSmall (16) | | ghostWhite |
| Carousel title | 16 | 500 | `#FFFFFF` |
| Carousel summary | bodyMedium (14) | 300 | `#FFE3E3E3` (trắng 89%) |
| Badge | 12 | | `#FFFFFF` |

### 1.3 Spacing / radius **[chắc]**

| Thứ | Giá trị |
|---|---|
| Padding ngang trang | 12 (hero), 24 (nút Find) |
| Khoảng cách giữa các section | 24 (Column divide), cuối danh sách đệm **130** để không bị bottom nav che |
| Booking card | radius **18**, border 1 `iron`, padding ngang 12 |
| Ô input (From/To/Date/Pax) | cao **50**, radius **12** (From/To) / **8** (date, add-leg), nền `primaryBackground` |
| Nút tròn giữa From/To | **38×38**, radius 100 (tròn) |
| Nút Find Your Jet | cao **50**, radius **12**, border 1, elevation 3 |
| Carousel | cao **220**, radius **16**; padding text 18 ngang / 12 dọc |
| Bottom nav | cao **70**, radius trên **24**, padding ngang 16, icon 28, avatar 40 |
| Icon AppBar | 30 trong vùng bấm 50 |
| Logo | 128.6 × 45, radius 8, BoxFit.cover |

### 1.4 Icons **[chắc]**

Xem `assets/icons/_icon_sheet.png`. Font icon: `BlackJetCustomIcons` (`assets/fonts/BlackJet_Custom_Icons.ttf`), `BlackJetNewIcons`.

| Codepoint | Font | Hình | Dùng ở |
|---|---|---|---|
| `0xe82f` | BlackJetCustomIcons | bong bóng chat | AppBar → ChatSupport |
| `0xe805` | BlackJetCustomIcons | chuông | AppBar → Notification |
| `0xe817` | BlackJetCustomIcons | nhà | Nav tab 1 (Home) |
| `0xe814` | BlackJetCustomIcons | máy bay | Nav tab 2 (Trips); nút giữa khi One Way |
| `0xe812` | BlackJetCustomIcons | tờ báo | Nav tab 3 (Blog) |
| `0xe807` | BlackJetCustomIcons | x trong tròn | đóng sheet chọn sân bay |
| `0xe85f` | BlackJetNewIcons | lịch + sao | ô Departure/Return Date (17px) |
| `0xf01fa` | MaterialIcons | ⇄ | nút giữa khi Round Trip (24px) |
| `0xf046` | MaterialIcons | gia đình | ô số khách (20px) |
| `0xe047` | MaterialIcons | + | "Add Flight Leg" |
| `0xf647` | MaterialIcons | x | xoá leg |
| `0xf00f1` / `0xf537` | MaterialIcons | − / + | sheet đếm khách |
| `0xec5e` / `0xe168` | MaterialIcons | 🔍 / x | ô search sân bay |

---

## 2. Cấu trúc widget chi tiết

```
Title("Home")
└─ GestureDetector(onTap: unfocus)
   └─ PopScope(canPop: false)                 // chặn back trên Home  [suy luận]
      └─ Scaffold(bg: #191919, appBar: AppBar(...))
         └─ SafeArea
            └─ Container(bg: secondaryBackground)
               └─ Stack
                  ├─ Align(top) ─ Padding ─ SingleChildScrollView
                  │   └─ Column(divide: 24, end padding: 130)
                  │       ├─ HeroText
                  │       ├─ BookingCard (AnimatedContainer)
                  │       └─ NewsCarousel (FutureBuilder)
                  └─ Align(0, 1) ─ NavigationBarWidget(pageIndex: 1)
```

### 2.1 AppBar

- `backgroundColor: secondaryBackground`, `elevation: 0`, `automaticallyImplyLeading: false`.
- `flexibleSpace`: Row `spaceBetween`, padding `(0, 5, 24, 5)`:
  - **Trái:** logo `ClipRRect(r8)` 128.6×45. Dark mode dùng `logo_dark_mode.png` (chữ trắng), light mode dùng `logo_light_mode.png` (chữ đen).
  - **Phải:** Row(gap 4):
    - **Chat** (`0xe82f`, 30, `jetBlack`): nếu `FFAppState.UnreadMessages > 0` thì bọc `Badge` (nền `error`, padding 8, `BadgePosition.topEnd`, text = số chưa đọc). Tap → `pushNamed('ChatSupport')`.
    - **Notification** (`0xe805`): tương tự với `UnreadNotifications`. Tap → `pushNamed('Notification')`.

### 2.2 Hero text

Padding `(12, 10, 12, 0)`; Column gap 12:
1. `"Flying Private Made \nSimple"`: AutoSizeText, 32/w500, minFontSize 20.
2. `"Book Your Private Jet Instantly"`: 16/w500, `secondaryText`.

### 2.3 Booking card

`AnimatedContainer(duration: 2000ms, curve: Curves.easeInOut)`, `secondaryBackground`, radius 18, border `iron`, padding ngang 12. Chiều cao tự co giãn theo nội dung, nên khi đổi loại chuyến (hiện/ẩn Return Date, danh sách leg) card **giãn/co mượt trong 2 giây**.

Nội dung (Column, gap 12, đệm trên/dưới 12):

**a) Trip type radio**: `FlutterFlowRadioButton`, cao 30, `WrapAlignment.spaceBetween`.
- Options: `One Way`, `Round Trip`, `Multi City`; mặc định `FFAppState.HomeTripType` hoặc `"One Way"`.
- Active: 14/w700 `jetBlack`; inactive: 14/w500 `ashGrey`.
- `onChanged`: reset form (xem 3.3) và, nếu chọn Multi City, khởi tạo danh sách leg.

**b) Khối One Way / Round Trip** (ẩn khi Multi City):

- **Row From / To** (gap 12), mỗi ô: `Expanded > InkWell > Container(h 50…, w = screenWidth × 0.405, radius 12, primaryBackground)`:
  - From: Column(start): `"From"` 10/w500 · mã `HomeDepartureAirport.APPMAINCODE` (mặc định `"Departure"`) 16/w500 · `AirportCity` (mặc định `"Select Airport"`) 12/w500 `secondaryText`.
  - To: giống From nhưng căn phải (`CrossAxisAlignment.end`), mặc định `"Arrival"`.
  - Tap → mở bottom sheet chọn sân bay (mục 4.1).
- **Nút tròn ở giữa** (Stack căn giữa đè lên Row, 38×38, nền `jetBlack`, icon `ghostWhite`):
  - Round Trip: icon `0xf01fa` (⇄) 24px.
  - One Way: icon máy bay `0xe814` 18px.
  - Không tìm thấy handler "đổi chỗ From/To", nên có vẻ chỉ để trang trí **[suy luận]**.
- **Row Date** (gap 12):
  - **Departure Date**: `AnimatedContainer(2000ms, easeInOut, h 50)`, nền `primaryBackground`, radius 12. Icon `0xe85f` 17px + text `HomeNewDepDateString` format `yMMMd` theo timezone sân bay đi (`$.TimezoneID`), placeholder `"Departure Date"` 10/w500.
  - **Return Date**: chỉ hiện khi `Round Trip`; placeholder `"Return Date"`.
  - Tap → `pickDateWithTimezoneForRequest(...)` (date picker custom theo timezone sân bay) + `HapticFeedback.lightImpact`.
- **Ô số khách**: h 50, icon `0xf046` + số `HomePaxCount`. Tap → sheet đếm khách (mục 4.2).

**c) Khối Multi City** (chỉ khi Multi City): `AnimatedContainer(2000ms, Curves.linear)`.
- `ListView` các leg từ `FFAppState.HomeMultiLegs` (JSON list). Mỗi leg: tiêu đề `"LEG #n"`, From/To (giống trên), Departure Date, Pax, nút xoá → sheet xác nhận `"Remove Flight Leg #n"`.
- Cuối list: nút `"Add Flight Leg"` (h 50, radius 8, `primaryBackground`, icon `+` 24 trong nút 40). Leg mới được tạo bằng `homeAddLegToMultiLegList()`, có thể kế thừa sân bay đến của leg trước làm sân bay đi **[suy luận]**.

**d) Divider** `iron`, padding dọc 8.

**e) Nút "Find Your Jet"** (`FFButtonWidget`): h 50, padding ngang 24, nền `jetBlack`, text `titleSmall` màu `ghostWhite`, border 1px (màu chưa chắc, có thể `ghostWhite`), radius 12, elevation 3. Trong lúc gọi API, `_model.working = true`; dùng cờ này để disable nút hoặc hiện loading **[suy luận]**.

### 2.4 News carousel

- `FutureBuilder<ApiCallResponse>` gọi `Webflow.GetPostsWithPaginationFilters(limit: 10)`; đang load thì hiển thị `LoadingStateBlogsCarouselWidget` (mục 6.3).
- Lọc bài `isArchived == false && isDraft == false`, lấy **5** bài đầu.
- `Container(h 220)` > `ClipRRect(r16)` > `Stack`:
  - `PageView.builder` (PageController initialPage 0). Mỗi trang là `InkWell` gồm:
    - Ảnh `fieldData["main-image"]["url"]`, cao 230, cover.
    - Overlay `LinearGradient` màu `#080705` với alpha **0.1 → 0.4 → 0.8**, stops **[0.2, 0.6, 0.9]**, begin `(0.98, 1)`, end `(-0.98, -1)` (chéo nhẹ, đậm dần về một góc).
    - Text (padding 18/12): `fieldData["meta-title"]` 16/w500 trắng; `fieldData["summery"]` 14/w300 trắng 89%. Gap 8.
    - Tap → `pushNamed('NewsDetail', extra: {post: json})`.
  - `SmoothPageIndicator` (Align bottom, padding 12): `SlideEffect(dotWidth 6, dotHeight 6, spacing 4, radius 16, strokeWidth 1, dotColor #555553, activeDotColor #FFFFFF, PaintingStyle.fill, SlideType.normal)`.
  - Tap vào dot → `animateToPage(i, duration: 500ms, curve: Curves.ease)`.

### 2.5 Bottom navigation (`NavigationBarWidget(pageIndex)`)

- `Material(transparent)` > `SafeArea` > `Container(h 70, bg #191919, radius top 24)` > Row `spaceBetween`, padding ngang 16.
- 4 mục, so sánh với `pageIndex`:

| index | Icon | Route khi tap |
|---|---|---|
| 1 | `0xe817` nhà | `Home` |
| 2 | `0xe814` máy bay | `Trips` |
| 3 | `0xe812` báo | `BlogMainPage` |
| 4 | avatar user (40×40, tròn) | `ProfilePage` |

- Active: icon `#FFFFFF`; inactive `#555553`. Avatar active: border **2px** trắng; inactive: border 1px `#555553`. Avatar bọc `AnimatedContainer(easeInOut)` nên border chuyển mượt.
- Tap tab đang active thì không làm gì. Tap tab khác: `HapticFeedback.selectionClick()` rồi `goNamed(route)` với transition **fade** (`PageTransitionType.fade`).

---

## 3. State và logic

### 3.1 App state dùng trên Dashboard **[chắc]**

FlutterFlow `FFAppState` (global, nhiều field persist bằng SharedPreferences key `ff_<Name>`):

| Field | Kiểu | Ý nghĩa |
|---|---|---|
| `HomeTripType` | String | `One Way` / `Round Trip` / `Multi City` |
| `HomeDepartureAirport`, `HomeArrivalAirport` | JSON | object sân bay `{uniqueid, APPMAINCODE, FAACode, FullAirportName, AirportCity, TimezoneID, ...}` |
| `HomeDepartureDate`, `HomeReturnDate` | DateTime | |
| `HomeNewDepDateString`, `HomeNewRetDateString` | String | ngày đã chọn (string) để hiển thị |
| `HomeAppOutDateAsText`, `HomeAppRetDateAsText`, `HomeDepartureDateAsText`, `HomeDepartureTimeAsText`, `HomeReturnDateAsText`, `HomeReturnTimeAsText`, `HomeDepartureTime` | String | các dạng text gửi API |
| `HomePaxCount` | int | số khách |
| `HomeChildrenPax`, `HomeLapInfantPax`, `HomePetsPax` (+ `HomeOut*`, `HomeRet*`) | int | trẻ em / em bé / thú cưng cho chiều đi/về |
| `HomeMultiLegs` | List<JSON> | các leg cho Multi City |
| `HomeMultiCityRequestID` | String | |
| `HomeRecentAirports` | List<JSON> | sân bay chọn gần đây |
| `HomeBookPassengers` | List | |
| `UnreadMessages`, `UnreadNotifications` | int | badge AppBar |
| `pageView` | | |

Local model (`HomeModel`): `working` (bool, loading của nút), `radioButtonDepartureValue`, `oneWayTripRequest` / `roundTripRequest` (response), `navigationBarModel`.

### 3.2 On page load **[chắc]**

Chạy sau frame đầu (`addPostFrameCallback`):
1. `internetConnected()`.
2. Đặt `HomeDepartureDate` / `HomeReturnDate` về giá trị sentinel (timestamp cố định năm 2024), xoá các chuỗi ngày/giờ trong prefs, xoá `HomeDepartureAirport` / `HomeArrivalAirport`, tức là **form luôn trống khi vào Home**.
3. `checkIfLoggedIn()`:
   - Đã login: `initialiseUser()` (tải profile), cập nhật state, gọi `updateInvoiceNinjaCustomer()` ở background.
   - Chưa login / token hỏng: `clearAppStates()`, `signOut()` (Firebase), `HapticFeedback.lightImpact()`, `goNamedAuth('<login route>')`.

### 3.3 Đổi loại chuyến (radio `onChanged`) **[chắc]**

- Reset: ngày đi/về về sentinel; pax (người lớn, trẻ, em bé, thú cưng) về 0; xoá `HomeArrivalAirport`, `HomeDepartureAirport`, các text ngày/giờ, `HomeMultiCityRequestID`.
- Nếu là `Multi City`: `HomeMultiLegs = homeAddLegToMultiLegList([])`, tức tạo sẵn leg đầu tiên.
- `setState` làm 2 `AnimatedContainer` co giãn (2s).

### 3.4 Bấm "Find Your Jet" **[chắc]**

```
HapticFeedback.selectionClick()

if tripType == "Multi City":
    validate từng leg (sân bay đi/đến, ngày)
    → submitMultiRequestCall(legs…)
else:
    if departureAirport == null → snackbar "Please Include The Departure Airport."
    if arrivalAirport   == null → snackbar "Please Include The Arrival Airport."
    if departureDate chưa chọn  → snackbar "Please include the Departure Date"
    if paxCount == 0            → snackbar "Please Select at Least One Passenger to Continue"
    if Round Trip:
        if returnDate chưa chọn → "Please Select Return Date To Continue"
        if returnDate < departureDate →
            "The Return Date cannot be earlier than the Departure Date. Please select a Return Date that is on or after the Departure Date."

    model.working = true
    One Way    → SubmitOneWayRequest(depId, arrId, depDateUTC, pax, children, lapInfants, pets, …)
    Round Trip → SubmitRoundTripRequest(… + returnDateUTC, ret* pax)

    if statusCode == 200:
        // ⚠ Bản luyện tập KHÔNG làm nhánh này, mà hiển thị kết quả ngay trên Dashboard: xem mục 12.
        goNamed("JetListings", params: {
            tripType, departureAirport(JSON), arrivalAirport(JSON),
            departureDate(DateTime), triprequestid(flightRequestID),
            distance: appCalculateDistanceOneWay(dep, arr)   // double
        })
        reset toàn bộ state Home* (như 3.3) + HomeBookPassengers = [], HomeMultiLegs = []
    else:
        SnackBar(text: response.exceptionMessage, color ghostWhite,
                 bg jetBlack, duration 2000ms)
    model.working = false
```

Thứ tự các nhánh validation là **[suy luận]** theo thứ tự chuỗi trong code; nội dung message là **[chắc]**.

Backend thật là Bubble (`/api/1.1/wf/v3app_submitflightrequest`, `…_return`, `v3app_submitmultileg`). Khi luyện tập, bạn **mock** các API này trong `data/datasources/mock`.

---

## 4. Bottom sheets mở từ Dashboard

Tất cả mở bằng `showModalBottomSheet(isScrollControlled: true, useSafeArea: true, backgroundColor: transparent)`, padding đáy = `viewInsets` (tránh bàn phím). Sheet đóng thì `setState` lại Home.

### 4.1 Chọn sân bay (`FromDepartureWidget` / `ToDestinationWidget`)

- Nền `secondaryBackground`, radius trên 24, padding 16.
- Header: tiêu đề `"From"` (hoặc `"To"` / `"Return Airport"` / `"Destination"` khi Round Trip) 24/w500 + nút đóng `0xe807` 50.
- TextField `autofocus`, hint `"Search for airports by city, code, or name..."`, icon search `0xec5e` và clear `0xe168`; mỗi lần gõ thì `EasyDebounce` (10ms) gọi `SearchAirportsCall(query)`.
- `"Recent Airports"`: list từ `HomeRecentAirports`. Mỗi dòng: `APPMAINCODE` / `FAACode - FullAirportName`.
- Chọn 1 sân bay: set `HomeDepartureAirport` (hoặc arrival), `homeUpdateRecentAirports()` (đưa lên đầu, khử trùng lặp), reset ngày/giờ đi (vì timezone đổi), `pop()`.
- Ràng buộc: mở "To" khi chưa chọn "From" thì báo `"Please Choose Your Departure Airport First"`; return trên Round Trip thì báo `"Please Choose Your Return Airport First"`.
- Animation: xem 6.2.

### 4.2 Đếm số khách (`CountSelectorWidget`)

- Nền `secondaryBackground`, radius trên 24, padding 16; tiêu đề `"Number of Passengers"` (hoặc `"One Way Passengers"`, `"Leg #n"`) 24/w500.
- Row: nút `−` (`0xf00f1`) · số 55/w500 căn giữa · nút `+` (`0xf537`). Nút tròn 60, nền `iron`, icon `primaryText` 18, gap 18.
- Nút `"Done"` (nền `jetBlack`, chữ `ghostWhite`, radius 100) → `Navigator.pop(count)`.
- Mỗi lần bấm: `HapticFeedback.selectionClick()`. Giới hạn min/max chưa xác định được, đoán là min 1 **[suy luận]**.

### 4.3 Date picker

`pickDateWithTimezoneForRequest(context, title: "Departure Date" | "Return Date", timezoneId)` là custom action. Ngày chọn được chuẩn hoá theo timezone sân bay, gửi API ở dạng UTC (`dateToUTCString`).

### 4.4 Xoá leg

`BottomSheetRemoveMultiLegFlightLegWidget(title: "Remove Flight Leg #n")` xác nhận xong thì xoá phần tử khỏi `HomeMultiLegs`.

---

## 5. Haptics **[chắc]**

| Hành động | Haptic |
|---|---|
| Tap tab nav, mở sheet, bấm Find, +/− | `selectionClick` |
| Chọn ngày xong, logout cưỡng bức | `lightImpact` |

RN: `react-native-haptic-feedback` (`impactLight`, `selection`).

---

## 6. Animations

### 6.1 Bảng tổng hợp **[chắc]**

| # | Ở đâu | Loại | Trigger | Duration | Delay | Curve | Giá trị |
|---|---|---|---|---|---|---|---|
| A1 | Booking card | `AnimatedContainer` (size) | đổi trip type | **2000ms** | 0 | `easeInOut` = cubic(0.42, 0, 0.58, 1) | height auto |
| A2 | Khối Multi City | `AnimatedContainer` | thêm/xoá leg, đổi type | **2000ms** | 0 | **linear** | height auto |
| A3 | Ô Departure/Return Date | `AnimatedContainer` | hiện/ẩn Return | **2000ms** | 0 | easeInOut | width/visibility |
| A4 | Carousel | `PageController.animateToPage` | tap dot | **500ms** | 0 | `Curves.ease` = cubic(0.25, 0.1, 0.25, 1) | trang |
| A5 | Carousel loading | `ShimmerEffect` | mount | **800ms**, chạy **1 lần** (loop false) | 0 | easeInOut | màu `shimmerColour`, góc **0.524 rad (30°)** |
| A6 | Avatar nav | `AnimatedContainer` 40×40 | đổi tab | chưa xác định | 0 | easeInOut | border 1px `#555553` → 2px `#FFFFFF` |
| A7 | Chuyển tab | page transition | `goNamed` | FlutterFlow mặc định ≈ 300ms **[suy luận]** | | | **fade** |
| A8 | Sheet sân bay: header row | Fade + Move | onPageLoad | 400ms | **200ms** | easeInOut | opacity 0→1, offset **(0, 60) → (0, 0)** |
| A9 | Sheet sân bay: textfield | Fade + Move | onPageLoad | 600ms | **400ms** | easeInOut | như trên |
| A10 | Sheet sân bay: Recent list | Fade + Move | onPageLoad | 800ms | **600ms** | easeInOut | như trên |
| A11–13 | Sheet đếm khách: 3 row | Fade + Move | onPageLoad | 400/600/800ms | **200/400/600ms** | easeInOut | như trên |
| A14 | Bottom sheet | slide up hệ thống | open | Material mặc định 250ms | | | |

Animation duy nhất chạy theo vòng lặp là shimmer, và nó chỉ chạy một lần. Không có Lottie trên Dashboard. Lottie (`assets/jsons/No_*.json`, 576×576, 30fps, 0.8–3s) chỉ dùng cho empty state ở màn khác.

### 6.2 Pattern "stagger fade-up" (A8–A13)

Đây là pattern chữ ký của app: mỗi khối trong sheet trượt lên 60px và hiện dần, khối sau trễ hơn khối trước 200ms. Duration tăng theo (400, 600, 800ms), tức khối sau chậm hơn. Với flutter_animate, `MoveEffect` + `FadeEffect` chạy song song với cùng delay/duration.

React Native Reanimated 4 (repo của bạn đã có):

```tsx
// src/core/ui/FadeUp.tsx
import Animated, { Easing, FadeIn, withDelay, withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useEffect } from 'react';

const EASE_IN_OUT = Easing.bezier(0.42, 0, 0.58, 1);

/** BlackJet "onPageLoad" effect: fade 0→1 + translateY 60→0. */
export function FadeUp({ index, children }: { index: number; children: React.ReactNode }) {
  const delay = 200 * (index + 1);      // 200, 400, 600
  const duration = 400 + 200 * index;   // 400, 600, 800
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration, easing: EASE_IN_OUT }));
  }, [delay, duration, p]);
  const style = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * 60 }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
}
```

### 6.3 Booking card co giãn 2s (A1–A3)

Flutter `AnimatedContainer` không có height cố định, nhưng FlutterFlow vẫn animate kích thước theo constraint. Trên RN:

```tsx
import Animated, { LinearTransition, Easing } from 'react-native-reanimated';
const cardLayout = LinearTransition.duration(2000).easing(Easing.bezier(0.42, 0, 0.58, 1));
const legsLayout = LinearTransition.duration(2000).easing(Easing.linear);

<Animated.View layout={cardLayout} style={styles.bookingCard}>…</Animated.View>
// Return Date: entering/exiting
<Animated.View entering={FadeIn.duration(2000)} exiting={FadeOut.duration(2000)} layout={cardLayout} />
```

> 2000ms khá chậm, cảm giác "sang trọng"; muốn y hệt thì giữ 2000, muốn UX nhanh hơn thì để 300–400.

### 6.4 Shimmer skeleton (A5)

- Khối skeleton carousel: Container 200 (cao), radius 16, nền `primaryBackground`, padding 16; đáy có 2 thanh `loadStateColour` radius 100: **142×8** và **93×8**, cách nhau 20, Column căn `end/start`.
- Mỗi thanh có `ShimmerEffect(duration 800ms, color shimmerColour, angle 0.524 rad, curve easeInOut)`, chạy 1 lần.

RN: `react-native-linear-gradient` + Reanimated `translateX` từ −width → +width trong 800ms, xoay gradient 30°.

---

## 7. Trạng thái màn hình

| Trạng thái | Hiển thị |
|---|---|
| Đang tải carousel | Skeleton 6.4 |
| Lỗi API carousel | Không thấy widget lỗi riêng, nên khả năng cao là list trống / ẩn **[suy luận]** |
| Đang submit | Nút Find disable (`working`) |
| Lỗi submit | SnackBar đen (`jetBlack`), chữ `ghostWhite`, 2s |
| Mất mạng | App có route `NoInternet` riêng (ngoài phạm vi Dashboard) |
| Chưa đăng nhập | Bị đẩy về màn login (3.2) |

---

## 8. Data shape gợi ý cho mock

```ts
// domain/entities
export type Airport = {
  id: string;            // uniqueid
  code: string;          // APPMAINCODE (vd "SGN")
  faaCode?: string;      // FAACode
  name: string;          // FullAirportName
  city: string;          // AirportCity
  timezoneId: string;    // TimezoneID (IANA)
  lat?: number; lng?: number; // để tính distance
};

export type TripType = 'One Way' | 'Round Trip' | 'Multi City';

export type FlightLeg = {
  index: number;
  departureAirport?: Airport;
  arrivalAirport?: Airport;
  departureDate?: string; // ISO UTC
  paxCount: number;
};

export type FlightSearch = {
  tripType: TripType;
  from?: Airport; to?: Airport;
  departureDate?: string; returnDate?: string;
  pax: { adults: number; children: number; lapInfants: number; pets: number };
  legs: FlightLeg[];
};

export type NewsPost = {
  id: string; title: string; summary: string; imageUrl: string;
  isArchived: boolean; isDraft: boolean;
};

// data: FlightRequestResult = { flightRequestId: string; distance: number }
```

---

## 9. Map sang repo React Native của bạn (`private-jet`)

Repo đang có `features/dashboard` (LoyaltyCard, NextTripCard, StatTile, SpendChart) và tab bar mặc định. Để luyện **đúng dashboard BlackJet**, gợi ý:

```
src/core/theme/theme.ts            ← thay palette bằng bảng 1.1 (light + dark), font KnulTrial
src/core/ui/FadeUp.tsx             ← 6.2
src/core/ui/Shimmer.tsx            ← 6.4
src/core/ui/BottomSheet.tsx        ← (@gorhom/bottom-sheet hoặc Modal + Reanimated)
src/app/navigation/RootNavigator   ← custom tabBar = BlackJetTabBar (2.5)
src/features/dashboard/
  domain/entities/{airport,flight-search,news-post}.ts
  domain/usecases/{search-airports,submit-flight-request,get-news}.ts
  data/datasources/mock/{airports,news}.mock.ts
  presentation/
    dashboard-slice.ts             ← state 3.1 (Redux Toolkit)
    screens/DashboardScreen.tsx    ← 2.x
    components/
      HomeAppBar.tsx  HeroText.tsx  BookingCard.tsx  TripTypeRadio.tsx
      AirportField.tsx  DateField.tsx  PaxField.tsx  MultiLegList.tsx
      FindJetButton.tsx  NewsCarousel.tsx  BlackJetTabBar.tsx
      SearchSummaryBar.tsx  JetResultList.tsx  JetCard.tsx  JetCardSkeleton.tsx   ← mục 12
    use-collapsible-search.ts   ← mục 12.4
    sheets/ AirportSearchSheet.tsx  CountSelectorSheet.tsx
  domain/entities/jet-listing.ts  domain/usecases/search-jets.ts  data/datasources/mock/jets.mock.ts  ← mục 12
```

Validation 3.4 nên đặt trong `domain/usecases/submit-flight-request.ts` (pure function trả về lỗi đầu tiên), để viết unit test dễ.

Thứ tự luyện tập đề xuất: (1) theme và font → (2) tab bar → (3) layout tĩnh Home → (4) radio + co giãn 2s → (5) sheet chọn sân bay + FadeUp → (6) đếm khách → (7) validation + submit mock → (8) carousel + shimmer → (9) danh sách kết quả + JetCard (12.2–12.3) → (10) thu gọn search khi cuộn (12.4).

---

## 10. Assets đi kèm (`assets/`)

| File | Nguồn trong APK | Dùng cho |
|---|---|---|
| `images/logo_light_mode.png` | `2230703_BlackJetBrandBook-1_031824.png` (1000×500, chữ đen) | AppBar light |
| `images/logo_dark_mode.png` | `…BrandBook-2…` (chữ trắng) | AppBar dark |
| `images/splash.png` | `Splash.png` (1125×2436) | splash |
| `fonts/KnulTrial-*.otf` | font chính | |
| `fonts/BlackJet_Custom_Icons.ttf`, `fonts/BlackJet_NewIcons.ttf` | icon font | icon 1.4 |
| `icons/*.png`, `icons/_icon_sheet.png` | render từ icon font | xem nhanh từng icon |
| `lottie/no_plane_found_light.json` | `No_Plane_Found_-_Black.json` (nét đen, 576×576, 30fps, 3s) | empty state kết quả, light mode |
| `lottie/no_plane_found_dark.json` | `No_Plane_Found_-_White.json` (nét trắng) | empty state kết quả, dark mode |

Ảnh carousel và avatar lấy từ mạng (Webflow CDN / Bubble CDN), không có trong APK.

**Lưu ý bản quyền:**
- **KnulTrial** là bản *Trial* của font Knul, thường chỉ được dùng thử, không dùng thương mại. Nếu publish app, hãy thay font khác (ví dụ Inter, Manrope).
- Logo, tên **BlackJet** và icon font là tài sản của công ty. Chỉ dùng để luyện tập local, không publish.

---

## 11. Những gì chưa xác định được

- Giới hạn min/max của bộ đếm khách.
- Nút tròn giữa From/To có hoán đổi sân bay không (không thấy handler).
- Chính xác thời lượng page transition fade (FlutterFlow mặc định).
- Hình dạng response đầy đủ của `SearchAirportsCall` (chỉ thấy các field dùng ở UI: `uniqueid`, `APPMAINCODE`, `FAACode`, `FullAirportName`, `AirportCity`, `TimezoneID`).
- Giao diện thực tế (khoảng cách pixel tuyệt đối có thể lệch vài px do `AutoSizeText` và `screenWidth × 0.405`). Nếu bạn có video quay màn hình, mình có thể đối chiếu và chỉnh lại.

---

## 12. Biến thể luyện tập: kết quả ngay trên Dashboard + search thu gọn khi cuộn

> Mục này là **thiết kế mới** cho bản luyện tập, không có trong app gốc. Những phần lấy từ app gốc (thẻ máy bay, empty state, shimmer, pull-to-refresh) ghi rõ **[gốc]**; phần còn lại là **[mới]**, bạn có thể chỉnh tuỳ ý.

### 12.1 Luồng mới

```
idle ──Find──▶ loading ──200 + có data──▶ results
  ▲               │  └──200 + rỗng────────▶ empty
  │               └──lỗi────────────────────▶ error (giữ kết quả cũ nếu có)
  └──────── "New Flight Request" / sửa form rồi Find lại ─────────┘
```

| | App gốc | Bản luyện tập |
|---|---|---|
| Sau khi submit thành công | `goNamed("JetListings")` rồi reset form | **Ở lại Dashboard**, form **giữ nguyên** giá trị |
| Hiển thị kết quả | màn riêng | section "Available Jets" ngay dưới khu search |
| News carousel | luôn hiện | chỉ hiện khi `idle` (chưa search); có kết quả thì ẩn |
| Hero text | luôn hiện | cuộn đi trước, sau đó khu search mới thu gọn |
| Tap 1 thẻ máy bay | `pushNamed("Jet_Details")` | giữ nguyên, vẫn sang màn chi tiết (ngoài phạm vi) |

Gọi API (mock), giữ đúng 2 bước như app gốc:
1. `submitFlightRequest(search)` → `flightRequestId` (gốc: `SubmitOneWay/RoundTrip/MultiRequest`).
2. `getAircraftListings(flightRequestId)` → `JetListing[]` (gốc: `GetAircraftListingsCall`, đọc `$.response.flightrequest`).

State thêm vào `dashboard-slice`:

```ts
type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';
interface DashboardSearchState {
  status: SearchStatus;
  results: JetListing[];
  lastQuery?: FlightSearch;      // dùng cho pull-to-refresh và thanh tóm tắt
  flightRequestId?: string;
  error?: string;
}
```

Quy tắc:
- Bấm **Find Your Jet**: validate như 3.4 → `status = loading` (giữ `results` cũ để không nháy) → gọi API → `success`/`empty`/`error`.
- Khi chuyển sang `loading`, tự cuộn xuống để khu search **thu gọn** và section kết quả hiện ngay dưới thanh tóm tắt (12.4, A17).
- Sửa form sau khi đã có kết quả thì **giữ kết quả** cho đến khi bấm Find lại. Gợi ý: đổi chữ nút thành **"Update Results"** khi form khác `lastQuery`.
- Đổi loại chuyến (radio) thì vẫn reset form như 3.3 và đưa `status` về `idle` (xoá kết quả).
- Lỗi: SnackBar như 3.4; nếu đã có kết quả trước đó thì giữ nguyên list.
- **Pull-to-refresh** **[gốc]**: chỉ bật khi `status ∈ {success, empty}`, chạy lại `lastQuery`. Gốc dùng `RefreshIndicator(displacement 40, strokeWidth 2, triggerMode onEdge)`.

### 12.2 Section kết quả

```
┌───────────────────────────────────────┐
│ SGN → HAN   ·  20 Nov · 2 · One Way  ✎│  ← thanh tóm tắt (khu search đã thu gọn)
├───────────────────────────────────────┤
│ Available Jets                    12  │  ← header section
│ ╭───────────────────────────────────╮ │
│ │ Gulfstream G650        Non Stop   │ │  JetCard [gốc]
│ │ (ảnh, vuốt ngang)                 │ │
│ │ Heavy Jet              5h 20m     │ │
│ │                     [ 42,000 USD ]│ │
│ ╰───────────────────────────────────╯ │
│ ╭───────────────────────────────────╮ │
│ │ …                                 │ │
```

- Header **[mới]**: `"Available Jets"` 18/w500 `primaryText` + số lượng 14/w500 `secondaryText`, padding `(12, 16, 12, 8)`.
- List: các thẻ cách nhau **16** (gốc dùng `ListView.separated`; khoảng cách đúng chưa xác định được), padding ngang 12; cuối list đệm 130 (cho bottom nav).
- **Loading** **[gốc]**: 3 thẻ skeleton cao 250, radius 20, nền `primaryBackground`, các thanh `loadStateColour` radius 100 (40×8 và 80×8…), shimmer 800ms / 30° / easeInOut như A5.
- **Empty** **[gốc]**: Lottie `assets/lottie/no_plane_found_light.json` (light) / `…_dark.json` (dark), chạy loop; tiêu đề `"No Listings Available"`, mô tả `"Sorry, no aircraft listings are available now. Submit a new flight request to find the right aircraft and start the process!"`, nút `"New Flight Request"` (style như Find Your Jet). Bấm nút thì **mở rộng lại khu search** (12.4).
- **Error** **[mới]**: nếu chưa có kết quả nào thì hiện dòng `"Couldn't load jets. Pull to retry."` (secondaryText 14) thay cho list.

### 12.3 JetCard **[gốc]** (`components/jet_card_widget.dart`)

| Thuộc tính | Giá trị |
|---|---|
| Kích thước | full width, cao **250**, radius **20**, `ClipRRect` |
| Ảnh | `PageView` các ảnh máy bay (`appGetAircraftPhotosFromQuote`); ảnh fade-in khi tải (2000ms) |
| Dot ảnh | giống carousel 2.4: `SlideEffect` 6×6, spacing 4, `#555553` / `#FFFFFF`, căn phải dưới, padding 12; tap dot `animateToPage` 500ms `Curves.ease` |
| Overlay | `LinearGradient` trên → dưới: `#69000000` → `#00191919` → `#80000000` → `#B2000000`, stops `[0.25, 0.5, 0.75, 1.0]` (tối ở mép trên để đọc chữ, trong ở giữa, tối dần xuống đáy) |
| Góc trên trái | tên máy bay `app_aircraft_description_text`, 16/w500 trắng |
| Dưới tên | `"Non Stop"` 12/w500 trắng |
| Góc trên phải | 1 dòng 12/w500 trắng (chưa rõ field) |
| Góc dưới trái | hạng máy bay `app_aircraft_class_text` (vd "Heavy Jet") 12/w500 trắng |
| Góc dưới phải | thời gian bay `formatFlightDuration(...)` (vd "5h 20m") 12/w500 trắng |
| Chip giá | `Align(1, 0.8)`, **80×25**, nền `#FFFFFF`, radius **5**, padding `(5, 2.5)`, text `updatedprice` hoặc `calculateTotalPriceForAircraft(...)`, mặc định `"0 USD"`, 14/w700 `#000000`, AutoSize (min 10) |
| Padding nội dung | 12 |
| Container | `AnimatedContainer`, curve `Curves.easeIn` = cubic(0.42, 0, 1, 1) |
| Xuất hiện | Fade 0→1, **600ms**, easeInOut (giống `rowOnPageLoadAnimation` của màn JetListings). **[mới]** stagger 80ms theo index, tối đa 5 thẻ đầu |
| Tap | `HapticFeedback.selectionClick` → màn chi tiết |

Mock entity:

```ts
export type JetListing = {
  id: string;                 // $._id
  name: string;               // app_aircraft_description_text, vd "Gulfstream G650"
  aircraftClass: string;      // app_aircraft_class_text, vd "Heavy Jet"
  photos: string[];           // ảnh
  nonStop: boolean;
  flightDurationMin: number;  // → "5h 20m"
  price: number;              // updatedprice
  currency: 'USD';
  seats?: number;             // gợi ý cho dòng góc trên phải
};
```

### 12.4 Thu gọn khu search khi cuộn **[mới]**

**Hai trạng thái:**

| | Expanded | Collapsed |
|---|---|---|
| Nội dung | hero + booking card đầy đủ (mục 2.3) | **thanh tóm tắt** cao **56** |
| Thanh tóm tắt | n/a | nền `secondaryBackground`, border dưới 1px `iron`, padding ngang 12. Trái: `"SGN → HAN"` 16/w500 `primaryText` (Multi City: `"SGN → HAN → +2"`). Dưới: `"20 Nov 2026 · 2 pax · One Way"` 12/w500 `secondaryText` (Round Trip thêm `"– 24 Nov"`). Phải: nút tròn 36, nền `primaryBackground`, icon bút ✎ hoặc chevron ⌄ 18 `primaryText` |

Thanh tóm tắt đọc `lastQuery` nếu có, không thì đọc giá trị form hiện tại.

**Cơ chế** (cuộn tới đâu thu gọn tới đó, không phải bật/tắt). Đã implement trong `src/features/dashboard/presentation/use-collapsible-search.ts`:

```
heroH = chiều cao hero text   (onLayout)
H     = chiều cao khu search   (onLayout; đổi khi đổi trip type)
C     = 56                     (thanh tóm tắt)
R     = H − C                  (quãng thu gọn)

y = scrollY
1. 0 ≤ y ≤ heroH            → hero cuộn đi và mờ dần (opacity 1→0).
2. heroH < y ≤ heroH + R    → p = (y − heroH) / R  (0→1)
                              khu search cuộn lên theo nội dung, form mờ dần (opacity 1→0 khi p ∈ [0, 0.6])
                              thanh tóm tắt ghim ở đỉnh hiện dần (opacity 0→1, translateY 8→0 khi p ∈ [0.5, 1])
3. y > heroH + R            → collapsed: 56pt cuối của khu search nằm đúng dưới thanh tóm tắt, list cuộn tiếp.
```

**Không snap nội dung:** trang dừng đúng chỗ thả tay, không bao giờ tự `scrollTo`. Kéo ngược lên một chút (kể cả từ cuối trang) chỉ cuộn đúng quãng đó, không nhảy về đầu.

**Thanh tóm tắt ghim dưới app bar, kiểu `SliverAppBar(pinned: true)` của Flutter:**
- Khi form đã cuộn đi, thanh hiện ra (220ms) ở đỉnh vùng nội dung, ngay dưới app bar, và đứng yên ở đó dù trang cuộn lên hay xuống, cho tới khi cuộn ngược về tới form.
- Thanh không bao giờ đè lên app bar: vùng chứa (`body`) có `overflow: hidden`.
- Màn kết quả (`SearchResultsScreen`) không ghim thanh dưới header mà đưa thẳng lên header, cạnh nút back, thay chỗ tiêu đề "Your search" (`HeaderSearchSlot`, bản `compact` cao 48 của `SearchSummaryBar`). Tiêu đề và thanh cross-fade theo `progress`.
- Test: `__tests__/features/dashboard/presentation/use-collapsible-search.test.tsx` (thanh ghim, không tự cuộn, chỉ tap mới về đầu) và test bố cục trong `DashboardScreen.test.tsx`.

**Mở rộng lại:**
- Tap thanh tóm tắt hoặc nút `"New Flight Request"` → `scrollTo(0)`, khu search mở lại theo cuộn.
- Cuộn ngược lên tới form cũng tự mở.
- **[chưa làm]** Android back khi đang collapsed thì mở rộng trước rồi mới thoát.

**Khi nào cho thu gọn:** mọi trạng thái. Ở `idle` bên dưới là news carousel, ở `success` là danh sách máy bay. Nội dung có `minHeight = viewport + heroH + R`, nên lúc nào cũng cuộn đủ để thu gọn, kể cả khi list ngắn.

**Tự thu gọn sau khi bấm Find (A17):** gọi `collapse()`, tức `scrollTo(heroH + R)`, nên skeleton/kết quả hiện ngay dưới thanh tóm tắt.

**Quyết định triển khai** (khác bản nháp spec trước):
- Bản nháp đặt khu search là **overlay** `position: absolute` phía trên list. Bỏ cách này: card chiếm gần hết màn hình, mà vuốt trên overlay thì **không cuộn** list bên dưới.
- Đã làm: hero và khu search **nằm trong `ScrollView`**, cuộn tự nhiên, nên vuốt ở đâu cũng cuộn được. Không animate `height` của phần tử nào trong `ScrollView`; chỉ đổi `opacity`/`transform`, nên scroll không nhảy.
- Chỉ thanh tóm tắt là overlay (`position: absolute; top: 0`), và chỉ nhận tap khi `p > 0.5`: `useAnimatedReaction` báo về state JS để đổi `pointerEvents`. Form đầy đủ thì ngược lại.

### 12.5 Animation bổ sung

| # | Ở đâu | Loại | Trigger | Thời lượng | Curve | Giá trị | Nguồn |
|---|---|---|---|---|---|---|---|
| A15 | Hero | opacity | scroll 0→heroH | theo scroll | linear | opacity 1→0 | [mới] |
| A16 | Khu search | cuộn + crossfade | scroll heroH→heroH+R | theo scroll | linear | form 1→0 (p 0–0.6); summary 0→1, translateY 8→0 (p 0.5–1) | [mới] |
| A17 | List | scrollTo | Find / tap summary / snap | hệ thống (~250–300ms) | hệ thống | tới `heroH+R` hoặc 0 | [mới] |
| A18 | Skeleton kết quả | Shimmer | loading | 800ms, 30° | easeInOut | `shimmerColour` | [gốc] |
| A19 | JetCard | Fade | xuất hiện | 600ms | easeInOut | 0→1, stagger 80ms | [gốc] + stagger [mới] |
| A20 | Ảnh trong JetCard | fade-in ảnh | ảnh tải xong | 2000ms | | 0→1 | [gốc] |
| A21 | Dot ảnh JetCard | `animateToPage` | tap dot | 500ms | `Curves.ease` | | [gốc] |
| A22 | Empty state | Lottie | `empty` | 3s, loop | | | [gốc] |

### 12.6 Test gợi ý

- `search-jets` usecase: validate (mọi message 3.4), 200 có data → `success`, 200 rỗng → `empty`, lỗi → `error` và giữ `results` cũ.
- Reducer: đổi trip type thì `status → idle` và `results = []`; sửa field không xoá kết quả.
- `SearchSummaryBar`: format đúng cho One Way, Round Trip ("– 24 Nov") và Multi City ("→ +n").
- UI: bấm Find hiện skeleton rồi hiện thẻ; empty hiện Lottie + nút; bấm "New Flight Request" gọi `expand()`.

---

## 13. Đã implement trong repo

| Spec | Code |
|---|---|
| 1.1–1.4 Token, font, icon | `src/core/theme/blackjet.ts`, `src/core/ui/BJText.tsx`, `src/core/ui/Icon.tsx`; font trong `src/assets/fonts` (link bằng `npx react-native-asset`) |
| 2.1–2.2 App bar, hero | `presentation/components/HomeAppBar.tsx` + `BadgeButton.tsx` (badge lấy từ `getInbox`), `HeroText.tsx` |
| 2.3 Booking card | `components/BookingCard.tsx`, `LegEditor.tsx`, `RowErrors.tsx`, `TripTypeRadio.tsx`, `RouteRow.tsx`, `FieldBox.tsx`, `AirportBox.tsx`, `DateBox.tsx`, `FieldButton.tsx`, `GuestsRow.tsx`, `components/SearchPanel.tsx` (nối store và sheet) |
| 2.4 News carousel | `components/NewsCarousel.tsx`, `components/PhotoPager.tsx` |
| 2.5 Bottom nav | `src/app/navigation/BlackJetTabBar.tsx`: 3 tab Home / Flights / Trips. Repo chưa có Blog và Profile nên chưa có tab avatar |
| 3.4 Validation | `domain/entities/charter.ts` → `checkDraft()`, giữ nguyên câu báo lỗi gốc; thêm 2 luật: 2 sân bay phải khác nhau, các leg Multi City phải theo thứ tự ngày |
| 4.x Sheets | `components/BJSheet.tsx`, `AirportSheet.tsx` (recent ở trên, rồi tất cả sân bay), `CalendarSheet.tsx` (lật tháng, lưới tháng/năm tới 24 tháng, giờ khởi hành 06:00–22:00 mỗi 30 phút hoặc "Any time", bấm Done để chọn; `MonthDays`, `MonthYearPicker`, `TimeChips`, `calendar-months.ts`), `CountSheet.tsx` (1–16 khách), `ConfirmSheet.tsx` |
| 5 Haptics | `src/core/ui/haptics.ts` (`react-native-haptic-feedback`) |
| 6.2 Fade-up, 6.4 Shimmer | `src/core/ui/FadeUp.tsx`, `src/core/ui/Shimmer.tsx` (gradient bằng `backgroundImage` của RN 0.88) |
| 12.1 Luồng mới | `presentation/charter-search-slice.ts` (form + search đang hiển thị), `dashboard-api.ts` → `searchCharters` |
| 12.2–12.3 Kết quả, JetCard | `components/JetResults.tsx`, `LegQuoteGroup.tsx`, `NoListings.tsx`, `ResultsLoadError.tsx`, `components/JetCard.tsx`, `JetCardSkeleton.tsx`; empty state dùng Lottie |
| 12.4 Thu gọn khi cuộn | `presentation/use-collapsible-search.ts`, `components/SearchSummaryBar.tsx`, `screens/DashboardScreen.tsx` |
| Mock | `data/datasources/mock/charter.mock.ts`: 6 máy bay, giá theo khoảng cách great-circle giữa 7 sân bay mock của Flights; `news.mock.ts` |

Khác với spec:
- Dữ liệu là **charter** (thuê nguyên máy bay, mọi tuyến), không phải chuyến bay theo lịch của tab Flights. Round Trip và Multi City có một nhóm kết quả cho mỗi leg.
- Nút tròn giữa From/To **đổi chỗ** hai sân bay (app gốc có vẻ chỉ để trang trí).
- Chỉ dashboard theo light/dark của hệ thống; các màn khác giữ theme tối cũ.
- Bấm vào JetCard và vào bài tin tức chưa mở màn chi tiết nào (màn chi tiết nằm ngoài phạm vi).
