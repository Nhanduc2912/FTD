# FTD – Lộ trình phát triển tiếp theo

## Tình trạng hiện tại (2026-04-27)

**FTD đã đạt trạng thái SaaS-ready** với 3 commits lớn trong phiên này:
- `6b457b7` — P0-P3 comprehensive improvements (21 files)
- `af3a0d3` — Sidebar collapse, password toggles, analytics empty-state, email templates
- `1f3b94d` — Receipts full i18n + Settings 2-column layout

Điểm đánh giá hiện tại (ước tính):
| Tiêu chí | Trước | Hiện tại |
|---|---|---|
| UX / UI | 6/10 | 8.5/10 |
| i18n (EN/VI) | 4/10 | 9/10 |
| Bảo mật | 5/10 | 8/10 |
| Khả năng mở rộng | 5/10 | 8/10 |
| Monetisation | 0/10 | 5/10 (gating done, Stripe pending) |

---

## Việc còn lại (theo ưu tiên)

### P1 — Hiệu năng (Sprint tiếp theo)

#### [MODIFY] `backend/src/controllers/expenseController.ts`
- Thêm query params: `?page=1&limit=20`
- Response: `{ data: [], page, totalPages, total }`

#### [MODIFY] `backend/src/controllers/receiptController.ts`
- Tương tự expenseController

#### [MODIFY] `backend/src/controllers/subscriptionController.ts`
- Tương tự expenseController

#### [MODIFY] `frontend/src/pages/Expenses.tsx`
- Thêm Prev/Next pagination UI
- `totalExpenses` count từ API response

#### [MODIFY] `frontend/src/pages/Receipts.tsx`
- Thêm Prev/Next pagination UI

---

### P2 — UX (Sprint tiếp theo)

#### [MODIFY] `frontend/src/pages/Receipts.tsx`
- Thay `<input type="file">` bằng drag-and-drop zone
- Style: dashed border, hover hiệu ứng, preview thumbnail

#### [MODIFY] `frontend/src/pages/Expenses.tsx`
- Monthly trend: gọi `api.get('/expenses?all=true')` thay vì filter theo tháng
- `toast.success/error` trên tất cả CRUD operations

#### [MODIFY] `frontend/src/layouts/MainLayout.tsx`
- Dịch "All clear! No expiring items." → `t('nav.noNotifications')`
- Dịch "Mark all read" → `t('nav.markAllRead')`
- Thêm keys vào `en.json` + `vi.json`

---

### P3 — Monetisation

> [!IMPORTANT]
> Cần bổ sung `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID` vào `.env` trước khi bắt đầu.

#### [NEW] `backend/src/controllers/billingController.ts`
- `POST /api/billing/create-checkout-session` — tạo Stripe Checkout
- `POST /api/billing/webhook` — xử lý `customer.subscription.created/updated/deleted`
- `GET /api/billing/portal` — tạo Customer Portal session

#### [NEW] `backend/src/routes/billingRoutes.ts`
- Wire vào `server.ts`

#### [MODIFY] `frontend/src/components/UpgradePrompt.tsx`
- Nút "Upgrade to Pro" → gọi `/api/billing/create-checkout-session`
- Redirect đến Stripe Checkout URL

#### [MODIFY] `frontend/src/pages/Settings.tsx`
- Hiển thị `subscriptionStatus` thực từ API
- Nút "Manage Subscription" → Customer Portal

---

## Verification Plan

### Sau mỗi sprint, chạy:
```bash
cd frontend && cmd /c "npm run build"   # exit 0 required
cd backend  && cmd /c "npx tsc --noEmit"  # 0 errors required
```

### Browser check:
- [ ] `/` → Landing page (guest)
- [ ] `/login` → đăng nhập → `/app`
- [ ] `/app` → Dashboard với WelcomeBanner nếu data trống
- [ ] `/app/receipts` → text hiển thị tiếng Việt khi chuyển ngôn ngữ
- [ ] `/app/settings` → 2 cột, Plan section, Danger Zone
- [ ] Thêm 1 receipt → toast success
- [ ] Sidebar collapse button → thu gọn icon-only
- [ ] Analytics khi không có data → empty-state CTA

---

## Commit Convention

```
type(scope): subject

- bullet detail 1
- bullet detail 2
```

| Type | Khi dùng |
|------|---------|
| `feat` | Tính năng mới |
| `fix` | Sửa bug |
| `perf` | Tối ưu hiệu năng |
| `refactor` | Tái cấu trúc |
| `i18n` | Bổ sung/sửa translations |
| `a11y` | Accessibility |
| `style` | CSS/styling only |
| `chore` | Build config, deps |
