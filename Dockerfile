# Sử dụng một image Node.js chính thức
FROM node:20-alpine

# Đặt thư mục làm việc bên trong container
WORKDIR /usr/src/app

# Quan trọng: Copy file package.json từ thư mục server
COPY server/package*.json ./

# Cài đặt dependencies (chỉ của server)
RUN npm install --only=production

# Copy toàn bộ code từ thư mục server vào container
# Dấu "." cuối cùng là thư mục hiện tại BÊN TRONG container
COPY server/ .

# Mở cổng 8080 (Cloud Run sẽ dùng $PORT)
EXPOSE 8080

# Lệnh để chạy server
# (Giả sử file 'server/package.json' có script "start")
CMD [ "npm", "start" ]
