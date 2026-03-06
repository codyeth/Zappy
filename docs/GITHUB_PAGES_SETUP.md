# Cấu hình GitHub Pages để hiển thị app Zappy

Nếu trang https://codyeth.github.io/Zappy/ vẫn hiển thị nội dung README thay vì app Zappy, **nguồn deploy đang là "Deploy from a branch"**. Cần chuyển sang **GitHub Actions** để dùng bản build từ workflow.

## Các bước (bắt buộc)

1. Mở repo: **https://github.com/codyeth/Zappy**
2. Vào **Settings** (tab trên cùng).
3. Trong menu trái chọn **Pages** (mục "Code and automation").
4. Ở phần **Build and deployment**:
   - **Source**: đổi từ **"Deploy from a branch"** sang **"GitHub Actions"**.
5. Không cần chọn workflow cụ thể — GitHub sẽ dùng workflow có bước `deploy-pages`.
6. Đợi 1–2 phút (hoặc chạy lại workflow: **Actions** → **Deploy to GitHub Pages** → **Run workflow**).
7. Mở lại https://codyeth.github.io/Zappy/ — sẽ thấy app Zappy (trang chủ, game, category).

## Kiểm tra workflow đã chạy

- Vào **Actions** → chọn run **"Deploy to GitHub Pages"** gần nhất.
- Nếu **build** và **deploy** đều xanh thì artifact đã được deploy.
- Nếu trang vẫn là README thì chắc chắn **Settings → Pages → Source** chưa đổi sang **GitHub Actions**.
