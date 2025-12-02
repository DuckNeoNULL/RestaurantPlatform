# Project Rules – Wedding Restaurant Booking

## Project Structure
- server/: Backend Node.js (Express, MySQL)
- client/: Frontend React
- .env: file cấu hình môi trường (không commit), chỉ commit .env.example. Tự tạo file .env dựa vào file mẫu .env.example

## Coding Rules
- Code dùng tiếng Anh
- CamelCase cho biến/hàm → userName, getUserData
- Đặt tên biến như đã định nghĩa ở database
- PascalCase cho React Component → LoginPage, Navbar
- UPPER_CASE cho hằng số → JWT_SECRET
- Backend: tách rõ routes, controllers, models (không query DB trong routes)
- Frontend: tách components (dùng chung) và pages (theo màn hình), API gọi qua api/axios.js
- API phải trả về JSON chuẩn, có xử lý lỗi

## Git Workflow
- Branch theo tên mỗi người
- Commit message rõ ràng, vd:
  - feat: add login API
  - fix: resolve CORS issue
  - docs: update README
- Không push trực tiếp lên main, push lên branch của riêng mình, mọi thay đổi phải tạo pull request

## Checklist trước khi merge
- Code dễ đọc, đặt tên đúng chuẩn
- API có xử lý lỗi
- Không commit .env và node_modules/

## Setup
### Backend
cd server
npm install
npm run dev

### Frontend
cd client
npm install
npm start

## Cấu trúc
### Backend (Node.js + Express)

src/config/       - Cấu hình DB, môi trường  
src/models/       - Định nghĩa các model tương ứng DB table  
src/dao/          - Truy vấn DB (Data Access Object)  
src/services/     - Business logic, xử lý nghiệp vụ  
src/controllers/  - Xử lý request/response từ client  
src/routes/       - Định nghĩa endpoint, map tới controller  
src/middlewares/  - Auth, validate, logging, error handler  
src/utils/        - Các hàm helper dùng chung  
src/app.js        - Khởi tạo Express, middleware, routes  
src/server.js     - Start server, lắng nghe cổng  

### Frontend (React)
assets/ : Hình ảnh, icon, font

components/ : Reusable UI components (Button, Modal, Navbar)

features/ : Module theo chức năng hoặc role (auth, customer, owner, admin, restaurant, payment)

services/ : Gọi API backend bằng axios/fetch

hooks/ : Custom hooks (useAuth, useBooking)

utils/ : Helper functions dùng chung

App.js : Quản lý routes, phân quyền theo role

index.js : Render React app vào DOM

