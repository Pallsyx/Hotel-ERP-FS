# Hotel ERP FS

Starter kit để chạy SQL Server + seed database + API khung bằng Docker, dùng .NET 10.

## Chạy dự án

```powershell
docker compose down -v
docker compose up -d --build
```

## Truy cập

- Swagger: http://localhost:8080/swagger
- Health: http://localhost:8080/health
- DB Health: http://localhost:8080/health/db
- Seed Summary: http://localhost:8080/api/system/seed-summary

## Kết nối SSMS

- Server: `localhost,1433`
- Login: `sa`
- Password: lấy trong file `.env`

## Reset sạch dữ liệu

```powershell
docker compose down -v
docker compose up -d --build
```
