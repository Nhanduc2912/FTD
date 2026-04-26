# FTD – Landing Site, Bug Fixes, UX Audit & GitHub Workflow

## Mục tiêu

Xây dựng bộ trang web giới thiệu thật sự cho FTD (landing site đa trang), sửa tất cả lỗi phát hiện được, cải thiện UX theo web-design-guidelines, và tự động commit GitHub sau mỗi chức năng hoàn thành.

---

## User Review Required

> [!IMPORTANT]
> Trang landing sẽ được đặt tại route `/landing` (hoặc tách thành domain riêng). Hiện tại `/` là dashboard của người dùng đã đăng nhập. Đề xuất: **người chưa đăng nhập vào `/` sẽ redirect về `/landing`** thay vì `/login`.

> [!WARNING]
> Trang web giới thiệu sẽ có nhiều sub-pages. Kiến trúc đề xuất:
> - `/` → Landing (Home) — cho người chưa đăng nhập
> - `/features` → Tính năng chi tiết
> - `/pricing` → Bảng giá
> - `/about` → Về chúng tôi
> - `/privacy` → Chính sách bảo mật
> - `/terms` → Điều khoản dịch vụ
> - `/help` → Trung tâm trợ giúp (FAQ + hướng dẫn)
> - `/login` → Đăng nhập
> - `/register` → Đăng ký

---

## Phát hiện lỗi & UX Issues (Web Design Guidelines)

### `src/pages/Login.tsx`
- `Login.tsx:58` – `<label>` không có `htmlFor` → input không liên kết
- `Login.tsx:63` – `focus:ring-2` dùng `:focus` thay vì `focus-visible:ring` (ring khi click)
- `Login.tsx:86` – Loading state: `'Signing in...'` → `'Signing in…'` (ellipsis)

### `src/pages/Dashboard.tsx`
- `Dashboard.tsx:100` – Không dùng `useTranslation` → text cứng tiếng Anh
- `Dashboard.tsx:186` – `new Date(r.purchaseDate).toLocaleDateString()` → nên dùng `Intl.DateTimeFormat`
- `Dashboard.tsx:213` – `<Icon>` không có `aria-hidden="true"` trong StatCard

### `src/pages/Analytics.tsx`
- `Analytics.tsx:11` – `fmt` không reactive khi language thay đổi (đã sửa trong session trước nhưng cần verify)
- Không có `aria-label` trên các chart containers

### `src/pages/Expenses.tsx`
- `Expenses.tsx:277` – `aria-label` dùng string tiếng Anh cứng, không dùng `t()`
- Monthly trend chỉ hiển thị 1 điểm dữ liệu (cần fetch all expenses, không chỉ tháng được chọn)

### `src/layouts/MainLayout.tsx`
- `MainLayout.tsx:131` – `"All clear! No expiring items."` không được dịch
- `MainLayout.tsx:134` – `"Mark all read"` không được dịch
- `MainLayout.tsx:23` – `localStorage.getItem` trong render → nên dùng lazy init

### `src/context/AuthContext.tsx`
- `AuthContext.tsx:23` – `useState(localStorage.getItem('token'))` sẽ gây hydration mismatch (nên dùng lazy init `() => localStorage.getItem('token')`)

### `src/index.css`
- Thiếu `touch-action: manipulation` trên buttons
- Thiếu `prefers-reduced-motion` media query cho animations
- Thiếu `color-scheme: dark` đã có (✓)

---

## Proposed Changes

### Phase 1 – Bug Fixes (CRITICAL, commit #1)

#### [MODIFY] AuthContext.tsx
- Fix lazy init: `useState(() => localStorage.getItem('token'))`

#### [MODIFY] Login.tsx
- Thêm `htmlFor` + `id` vào labels/inputs
- Thêm `name` attribute, `autoComplete`
- Fix focus: `focus-visible:ring-2` thay `focus:ring-2`
- Fix ellipsis: `'Signing in…'`
- Thêm `spellCheck={false}` trên email input
- Thêm `aria-live="polite"` trên error div

#### [MODIFY] Register.tsx
- Tương tự Login.tsx

#### [MODIFY] Dashboard.tsx
- Thêm `useTranslation` + `useTranslation` i18n
- Dùng `Intl.DateTimeFormat` cho dates
- Thêm `aria-hidden` trên icons
- Thêm `aria-label` trên AlertCircle

#### [MODIFY] index.css
- Thêm `touch-action: manipulation` trên buttons global
- Thêm `@media (prefers-reduced-motion: reduce)` block

---

### Phase 2 – Landing Site (commit #2)

Tạo layout mới `LandingLayout.tsx` và các trang:

#### [NEW] `src/layouts/LandingLayout.tsx`
- Header với logo, nav (Features, Pricing, Help), CTA buttons (Login / Get Started)
- Footer với links đến Privacy, Terms, About, Help

#### [NEW] `src/pages/landing/Home.tsx`
- Hero section: headline lớn, sub-headline, CTA "Get Started Free" + "See Demo"
- Social proof: số liệu (receipts saved, users, warranties tracked)
- Features grid (3 cols): Receipts, Subscriptions, Analytics, Expenses
- How it works: 3 bước
- Testimonials (fake authentic)
- Pricing preview
- Final CTA banner

#### [NEW] `src/pages/landing/Features.tsx`
- Chi tiết từng tính năng với screenshots/illustrations

#### [NEW] `src/pages/landing/Pricing.tsx`
- Free tier vs Pro tier (Freemium model)
- FAQ về pricing

#### [NEW] `src/pages/landing/About.tsx`
- Câu chuyện sản phẩm, mission, team

#### [NEW] `src/pages/landing/Privacy.tsx`
- Chính sách bảo mật (GDPR-like)

#### [NEW] `src/pages/landing/Terms.tsx`
- Điều khoản dịch vụ

#### [NEW] `src/pages/landing/Help.tsx`
- FAQ + hướng dẫn sử dụng theo tính năng

---

### Phase 3 – UX Improvements (commit #3)

- Auth redirect: `/` cho khách → landing, `app/` cho logged in → dashboard
- Skip link cho accessibility
- `overscroll-behavior: contain` trên tất cả modals
- Improve Expenses monthly trend: fetch all expenses not just current month

---

### Phase 4 – Git Commits (sau mỗi phase)

Commit format (theo standard hiện tại):
```
feat(landing): add multi-page marketing site with hero, features, pricing, help, privacy, terms
fix(auth): lazy init localStorage to prevent hydration mismatch
fix(a11y): add htmlFor/id, focus-visible, aria labels across forms
fix(i18n): dashboard and layout using translations
perf(expenses): fetch all expenses for monthly trend chart
```

---

## Verification Plan

### Automated
- TypeScript build: `cd frontend && npm run build`
- Check no console errors

### Manual
- Mở `/` khi chưa đăng nhập → thấy landing page
- Mở `/login` → đăng nhập → về dashboard
- Thử chuyển ngôn ngữ EN/VI → toàn bộ app đổi
- Mở `/help`, `/privacy`, `/terms` không cần đăng nhập
- Mobile responsive check

---

## Commit Convention

```
type(scope): subject

body (if needed)

Refs: #issue (if any)
```

Types: `feat`, `fix`, `perf`, `refactor`, `style`, `docs`, `chore`
