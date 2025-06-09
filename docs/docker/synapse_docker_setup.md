# 🚀 Hướng dẫn Cài đặt Synapse (Matrix Homeserver) với Docker

## 🧾 Mục tiêu
- Tự host một Matrix Homeserver với Synapse.
- Cho phép đăng ký tài khoản qua API mà không cần CAPTCHA.
- Dễ dàng triển khai với Docker.

---

## ⚙️ Yêu cầu
- Đã cài đặt [Docker](https://www.docker.com/)
- Hệ điều hành: Windows / macOS / Linux

---

## 📁 Bước 1: Tạo thư mục project

```bash
mkdir synapse-server
cd synapse-server
mkdir data
```

> ⚠️ **Lưu ý**: Dùng đường dẫn tuyệt đối nếu bạn dùng Windows. VD: `C:/Users/yourname/synapse-server/data`

---

## 🛠️ Bước 2: Tạo file cấu hình ban đầu

Chạy lệnh sau để tạo file `homeserver.yaml`:

### Trên Linux/macOS:

```bash
docker run -it --rm -v "$(pwd)/data:/data" -e SYNAPSE_SERVER_NAME=localhost -e SYNAPSE_REPORT_STATS=yes   matrixdotorg/synapse:latest generate
```

### Trên Windows (PowerShell):

```powershell
docker run -it --rm `
  -v ${PWD}\data:/data `
  -e SYNAPSE_SERVER_NAME=localhost `
  -e SYNAPSE_REPORT_STATS=yes `
  matrixdotorg/synapse:latest generate
```

Sau khi chạy xong, kiểm tra thư mục `data/` phải có các file:
- `homeserver.yaml`
- `localhost.signing.key`
- `localhost.log.config`

---

## ✏️ Bước 3: Chỉnh sửa file `homeserver.yaml`

Mở `data/homeserver.yaml` và sửa hoặc thêm các dòng sau:

```yaml
enable_registration: true
registration_requires_token: false
enable_registration_captcha: false
enable_registration_without_verification: true
suppress_key_server_warning: true
```

---

## 🚀 Bước 4: Chạy Synapse với Docker

Chạy lệnh sau để khởi động Synapse:

```bash
docker run -d   --name synapse   -v "$(pwd)/data:/data"   -p 8008:8008   matrixdotorg/synapse:latest
```

> 🔥 Synapse sẽ chạy tại: `http://localhost:8008`

---

## 🧪 Bước 5: Đăng ký tài khoản người dùng qua API

Gửi `POST` đến endpoint:

```http
POST http://localhost:8008/_matrix/client/v3/register
```

### 🧾 Ví dụ body JSON:

```json
{
  "username": "testuser",
  "password": "12345678",
  "auth": {
    "type": "m.login.dummy"
  }
}
```

> 🛡️ Nếu bạn gặp lỗi về xác thực, hãy chắc chắn đã đặt `enable_registration_without_verification: true`

---

## 🔁 Một số lệnh hữu ích

### Xem log container:

```bash
docker logs -f synapse
```

### Dừng container:

```bash
docker stop synapse
```

### Khởi động lại container:

```bash
docker start synapse
```

---

## 🧩 Tùy chọn nâng cao

- Gắn domain thật (ví dụ `chat.example.com`)
- Cấu hình TLS với reverse proxy (Nginx, Caddy)
- Kết nối với Element Web client

---

## 📚 Tham khảo

- [Matrix Synapse Docker Hub](https://hub.docker.com/r/matrixdotorg/synapse)
- [Matrix Spec](https://spec.matrix.org/)
- [Synapse Docs](https://matrix-org.github.io/synapse/latest/)

---

✅ **Bạn đã tự host homeserver Matrix thành công và có thể đăng ký tài khoản qua API!**