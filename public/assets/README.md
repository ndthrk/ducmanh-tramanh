# Thay ảnh thiệp cưới

- Chép ảnh mới vào `public/assets/photos/`.
- Chép ảnh QR quà cưới vào `public/assets/gifts/`.
- Chép nhạc nền MP3 vào `public/assets/music/`.
- Các họa tiết trang trí rồng–phượng nằm trong `public/assets/ornaments/`.
- Cập nhật các đường dẫn trong `config/wedding.ts`, mục `assets`.
- Đường dẫn nhạc và thời điểm bắt đầu được cấu hình tại mục `music`.
- Mỗi màu dress code là một phần tử `{ label, color }`; có thể thêm hoặc bớt trực tiếp trong mảng `dressCode`.
- Đường dẫn dùng trên website luôn bắt đầu bằng `/assets/`, ví dụ `/assets/photos/anh-bia.jpg`.

Nên dùng ảnh JPG hoặc WebP, chiều rộng khoảng 1600–2560 px và tối ưu dung lượng trước khi đưa lên website.
