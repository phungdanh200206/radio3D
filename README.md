# 📻 Máy Phát Băng Cassette Mini 3D (CAD Blueprint MB-001)

Website mô phỏng 3D tương tác thời gian thực cho sản phẩm **Máy Phát Băng Cassette Mini** theo bản vẽ thiết kế kỹ thuật **MB-001** (Tác giả: *Bùi Thị Bảo Ngọc*, Tỷ lệ 1:1 mm). Dự án kết hợp công nghệ đồ họa Three.js hiện đại, vật liệu quang học chân thực và tích hợp phát nhạc trực tuyến qua SoundCloud API.

---

## 🌟 Tính Năng Nổi Bật

### 1. Mô Phỏng 3D Chuẩn Tỷ Lệ Kỹ Thuật 1:1
- Toàn bộ 12 chi tiết cơ khí và vỏ máy được xây dựng chuẩn xác theo số đo bản vẽ CAD MB-001:
  - Khung vỏ chính: $150 \times 110 \times 90\text{ mm}$, bo góc $R20\text{ mm}$, vách dày $16\text{ mm}$.
  - Cửa kính khoét trước: $118 \times 72\text{ mm}$, mép bên $16\text{ mm}$, mép trên $18\text{ mm}$, mép dưới $20\text{ mm}$.
  - Núm xoay điều khiển kim loại: Đường kính $\varnothing 35\text{ mm}$, tiện khía ca-rô chống trượt.
  - Cụm cơ cấu truyền động: Bánh răng lớn $\varnothing 26$, trung gian $\varnothing 18$, bánh răng nhỏ $\varnothing 12$, trục thép $\varnothing 6\text{ L=50 mm}$.
  - Cuộn băng cassette tiêu chuẩn: $100 \times 63 \times 12\text{ mm}$.

### 2. Các Góc Chiếu Trực Giao Kèm Đường Dóng Kích Thước Kỹ Thuật (CAD Dimensions)
- Các nút chuyển nhanh hướng nhìn trực diện:
  - **Mặt trước (Front View)**: Hiện kích thước $150, 110, 118, 72, 16, 18, 20\text{ mm}, R20, \varnothing 35\text{ mm}$.
  - **Mặt sau (Back View)**: Hiện kích thước và vị trí 4 vít liên kết M4.
  - **Mặt trên (Top View)**: Hiện khe mở $105 \times 16\text{ mm}$, khoảng cách biên $22\text{ mm}$.
  - **Mặt bên phải (Right View)**: Chiều sâu $90\text{ mm}$, lòng khoang $58\text{ mm}$, độ nhô núm $18\text{ mm}$.

### 3. Phối Cảnh Tách Rời (Exploded View) & Soi Chi Tiết (Click-to-Inspect)
- Thanh trượt tách rời chi tiết mượt mà từ $0\%$ đến $100\%$ theo các trục độc lập.
- Nhấp trực tiếp vào bất kỳ bộ phận nào trong mô hình 3D để xem thẻ thông số kỹ thuật (STT, vật liệu, kích thước, công dụng) và khung bao kích thước độc lập mà không bị chồng chéo thông tin.

### 4. Mặt Kính Quang Học Siêu Trong Suốt (Optical PBR Glass)
- Độ truyền sáng $96\%$, chiết suất $IOR = 1.52$, lớp bóng gương Clearcoat 1.0 với độ nhám siêu thấp $0.018$, giúp nhìn thấu băng cassette và các bánh răng cơ khí bên trong lồng máy.

### 5. Tích Hợp SoundCloud Widget API & Đồng Bộ Chuyển Động
- Trọn bộ 7 ca khúc chính thức từ Album **"Tam Thái Tử" - Jack (J97)**:
  1. *Người Dưng* (Track No.2)
  2. *Lưu Niên* (Track No.4)
  3. *Anh Yêu Em (我爱你)* (Track No.3)
  4. *Hoa Trong Đá* (Track No.1)
  5. *Nát Tan Cõi Lòng*
  6. *Tam Thái Tử* (Ca khúc chủ đề)
  7. *Mỗi Lần Nhớ Em Là Một Ngày Mưa*
- **Đồng bộ cơ khí**: Khi phát nhạc, 2 bánh xe cuộn băng và hệ thống bánh răng cơ học tự động quay theo thời gian thực.
- **Tùy biến linh hoạt**: Tích hợp ô dán link SoundCloud bất kỳ để phát nhạc trực tiếp trên web.
- Điều khiển âm lượng (Volume Slider 0% - 100%) và nút tắt tiếng nhanh (Mute).

### 6. Bảng 6 Phối Màu Thẩm Mỹ (Color Themes)
- 🪵 **Natural Oak**: Gỗ sồi mộc tự nhiên.
- 🌰 **Walnut & Brass**: Gỗ óc chó trầm và đồng thau cổ điển.
- 🍑 **Summer Retro**: Cam đào mùa hè trẻ trung.
- 🌊 **Seafoam Breeze**: Xanh ngọc pastel thanh mát.
- 🍇 **Midnight Plum**: Mận tím hoàng gia sâu lắng.
- 🤍 **Nordic White**: Trắng sứ Bắc Âu tối giản.

### 7. Giao Diện Sáng (Light Mode) Mặc Định & Giao Diện Tối (Dark Mode)
- Chuyển đổi linh hoạt giữa phòng thu ánh sáng trắng tự nhiên và phòng thu ban đêm huyền bí.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend Core**: Vanilla JavaScript (ES6+), HTML5, CSS3 Glassmorphism
- **3D Graphics Engine**: [Three.js](https://threejs.org/)
- **Animation Library**: [GSAP (GreenSock)](https://greensock.com/gsap/)
- **Build Tool & Bundler**: [Vite](https://vitejs.dev/)
- **Audio Integration**: [SoundCloud Widget API](https://developers.soundcloud.com/docs/api/html5-widget) & Web Audio API

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Clone repository về máy:
```bash
git clone https://github.com/phungdanh200206/radio3D.git
cd radio3D
```

### 2. Cài đặt các thư viện cần thiết:
```bash
npm install
```

### 3. Chạy môi trường phát triển (Development Server):
```bash
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:5173/`

### 4. Đóng gói cho môi trường production:
```bash
npm run build
```
Thư mục sản phẩm sau khi build sẽ nằm trong `dist/`.

---

## 📄 Bản Quyền & Thông Tin Thiết Kế
- **Dự án**: Mô hình 3D Marketing Sản phẩm "Máy Phát Băng Cassette Mini"
- **Bản vẽ kỹ thuật**: MB-001
- **Thiết kế CAD**: Bùi Thị Bảo Ngọc
- **Repository**: [https://github.com/phungdanh200206/radio3D](https://github.com/phungdanh200206/radio3D)
