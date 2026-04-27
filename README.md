# FTD - Finance Trusted Documents

FTD là một ứng dụng web quản lý tài chính cá nhân thông minh và cao cấp, giúp người dùng theo dõi chi tiêu, quản lý các gói đăng ký định kỳ (subscriptions) và lưu trữ hóa đơn (receipts) một cách an toàn, trực quan với chuẩn thiết kế SaaS quốc tế.

## 🌟 Tính Năng Nổi Bật (Features)

- **Receipt Vault (Lưu trữ hóa đơn):** Số hóa và lưu trữ hóa đơn giấy. Quản lý hạn bảo hành của sản phẩm một cách trực quan, giúp bạn không bao giờ bỏ lỡ ngày hết hạn.
- **Subscription Guillotine (Quản lý gói đăng ký):** Theo dõi mọi khoản phí định kỳ (Netflix, Spotify, Gym,...) trong một bảng điều khiển thống nhất.
- **Expense Tracker (Theo dõi chi tiêu):** Ghi log chi tiêu hàng ngày theo các danh mục, dễ dàng tìm kiếm, lọc dữ liệu và nắm bắt dòng tiền.
- **Smart Analytics (Phân tích thông minh):** Trực quan hóa dữ liệu tài chính dưới dạng biểu đồ (tích hợp Recharts), cung cấp cái nhìn tổng quan về tình trạng tài chính.
- **Multi-language (Đa ngôn ngữ):** Hỗ trợ chuyển đổi ngôn ngữ mượt mà giữa Tiếng Anh (English) và Tiếng Việt (Vietnamese) sử dụng `react-i18next`.
- **Giao diện Premium (Glassmorphism & 3D Interactive):** Trải nghiệm người dùng cao cấp với các hiệu ứng 3D Parallax, giao diện kính mờ (glassmorphism) và các Animation siêu mượt được xây dựng bằng Framer Motion.

## 🛠 Tech Stack (Công nghệ Cốt lõi)

### Frontend
- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4 (Sử dụng `@theme` tokens)
- **Animation:** Framer Motion
- **Data Visualization:** Recharts
- **i18n:** react-i18next
- **HTTP Client:** Axios (Tự động gắn Auth Token qua interceptor)

### Backend
- **Runtime:** Node.js + Express
- **Ngôn ngữ:** TypeScript
- **Cơ sở dữ liệu:** MongoDB Atlas (Mongoose ODM)
- **Xác thực:** JWT (JSON Web Tokens)
- **Lập lịch:** node-cron (Xử lý các tác vụ ngầm định kỳ)

## 📁 Cấu Trúc Dự Án (Project Structure)

```text
FTD/
├── frontend/                  # Ứng dụng Frontend (React + Vite)
│   ├── src/
│   │   ├── api.ts             # Cấu hình Axios instance & Interceptors
│   │   ├── App.tsx            # Định tuyến chính (React Router v6)
│   │   ├── index.css          # CSS toàn cục & Tailwind v4 theme tokens
│   │   ├── components/        # Các thành phần giao diện tái sử dụng (VD: Hero3DVisual)
│   │   ├── context/           # Global State (AuthContext)
│   │   ├── hooks/             # Custom Hooks (VD: useNotifications)
│   │   ├── i18n/              # Cấu hình đa ngôn ngữ (en.json, vi.json)
│   │   ├── layouts/           # Bố cục trang (MainLayout, LandingLayout)
│   │   └── pages/             # Layout các trang (Home, Login, Dashboard, Receipts,...)
│   └── package.json
│
├── backend/                   # Máy chủ Backend (Express + TypeScript)
│   ├── src/
│   │   ├── config/            # Cấu hình kết nối Database (MongoDB)
│   │   ├── controllers/       # Xử lý logic nghiệp vụ từng chức năng
│   │   ├── middleware/        # Middleware (Xác thực JWT, Upload file, Rate limiting)
│   │   ├── models/            # Các schema MongoDB (User, Receipt, Expense,...)
│   │   ├── routes/            # Khai báo định tuyến API
│   │   ├── services/          # Tích hợp dịch vụ bên ngoài / logic dùng chung
│   │   ├── jobs/              # Các tiến trình chạy ngầm (Cron jobs)
│   │   └── server.ts          # Entry point của ứng dụng Backend
│   └── package.json
│
└── AGENTS.md                  # Tài liệu hướng dẫn & quy chuẩn Code của dự án
```

## 🚀 Hướng Dẫn Triển Khai Local (Local Development)

Yêu cầu môi trường tối thiểu:
- **Node.js** (Phiên bản LTS)
- **MongoDB** (Có tài khoản MongoDB Atlas hoặc MongoDB Compass local)

### Bước 1: Khởi chạy Backend Server
1. Di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Thiết lập biến môi trường: Tạo file `.env` trong thư mục `backend` và điền các cấu hình:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster...
   JWT_SECRET=your_jwt_secret_key_here
   FRONTEND_URL=http://localhost:5173
   ```
4. Khởi chạy server ở chế độ Development:
   ```bash
   npm run dev
   ```
   *Thành công khi Terminal xuất hiện dòng chữ: `Server FTD đang chạy tại http://localhost:5000` và `MongoDB Connected`.*

### Bước 2: Khởi chạy Frontend Server
1. Mở một terminal mới và di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Khởi chạy ứng dụng:
   ```bash
   npm run dev
   ```
   *(💡 Mẹo cho Windows/PowerShell: Nếu gặp lỗi script bị chặn, hãy dùng lệnh `cmd /c "npm run dev"`).*

4. Truy cập Ứng dụng:
   Mở trình duyệt và truy cập vào [http://localhost:5173](http://localhost:5173) để bắt đầu trải nghiệm.
