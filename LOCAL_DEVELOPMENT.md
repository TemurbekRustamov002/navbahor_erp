# 💻 Lokal Ishga Tushirish Qo'llanmasi

Dasturda GitHub orqali auto-deploy (master branchiga push qilinganda) o'rnatilgani uchun, lokal rivojlantirish jarayonida ehtiyotkor bo'lish zarur.

## ⚠️ Muhim tavsiyalar
1. **Branchlar bilan ishlash**: Doim `master` branchidan boshqa branchda (masalan, `dev` yoki `local-testing`) ishlang. `master` branchiga faqat hamma narsa tayyor bo'lganda push qiling.
2. **Environment Variables**: `.env` fayllarini gitga push qilmang (ular `.gitignore`ga qo'shilgan).

---

## 🛠 Ishga tushirish usullari

### 1-usul: Docker orqali (Tavsiya etiladi)
Men siz uchun `docker-compose.local.yml` faylini yaratdim. Bu fayl production (server) sozlamalariga tegmagan holda, hamma servisni (DB, Redis, API, Client) lokalda ishga tushiradi.

**Buyruq:**
```bash
docker-compose -f docker-compose.local.yml up -d --build
```
*   **Frontend**: `http://localhost:3100`da ishlaydi.
*   **Backend API**: `http://localhost:8080`da ishlaydi.
*   **Ma'lumotlar bazasi**: `db_data_local` papkasida saqlanadi.

### 2-usul: Manual (Alohida-alohida)
Agar siz kodni real vaqtda o'zgartirib, natijani darhol ko'rmoqchi bo'lsangiz (Hot Reload), quyidagilarni bajaring:

#### A. Ma'lumotlar bazasi va Redis
Buning uchun Docker ishlatgan ma'qul:
```bash
docker-compose -f docker-compose.local.yml up -d db redis
```

#### B. Backend (erp-api)
1. `erp-api` papkasiga kiring:
   ```bash
   cd erp-api
   npm install
   npm run start:dev
   ```

#### C. Frontend (client)
1. `client` papkasiga kiring:
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

## 🔑 Sozlamalar (.env)
Lokalda ishlash uchun quyidagi fayllarni yarating (men ba'zi namunalar tayyorlab qo'ydim):

1. **Root `.env`**: (Yangi yarating)
   ```env
   DOMAIN_NAME=localhost
   ```
2. **erp-api/.env**: (Mavjud `.env.example`dan nusxa oling)
3. **client/.env.local**: (Frontend uchun kerakli URL-lar)

## 📦 Bazani sozlash
Agar birinchi marta bazani ishga tushirayotgan bo'lsangiz, backend papkasida:
```bash
npx prisma migrate dev
npx prisma db seed
```
Buyruqlarini ishga tushirishingiz lozim.
