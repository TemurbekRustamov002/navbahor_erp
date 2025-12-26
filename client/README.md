# 🏢 Navbahor Tekstil ERP - Next.js Frontend Application

Navbahor Tekstil paxtani qayta ishlash zavodi uchun zamonaviy ERP frontend aplikatsiyasi. **Next.js 14** va **TypeScript** yordamida ishlab chiqilgan professional web ilova.

## 🔧 **Nuxt.js'dan Next.js'ga Migratsiya**

### **Aniqlangan xatoliklar (Nuxt.js versiyasida):**

1. **🐛 Authentication Logic Error**
   - `apps/auth-service/stores/auth.ts` line 49: Password validation logic xatosi
   - **Fixed:** Zustand store'da to'g'ri authentication logikasi

2. **❌ Missing Service Implementations** 
   - Lab va Production service'larda faqat `package.json` mavjud edi
   - **Fixed:** Barcha servislar to'liq implement qilindi

3. **🔗 Hard-coded URL Redirects**
   - Login'dan keyin to'g'ridan-to'g'ri URL redirect
   - **Fixed:** Environment variable'lar va proper routing

4. **📦 Inconsistent Dependencies**
   - Turli service'larda turli xil dependency version'lari
   - **Fixed:** Barcha service'larda consistent dependencies

5. **🐳 Missing Docker Configurations**
   - Service'larda Dockerfile'lar yo'q edi
   - **Fixed:** Har bir service uchun optimized Dockerfile'lar

## 🎯 **Next.js Mikroservislar**

| Servis | Port | URL | Mas'uliyat | Status |
|--------|------|-----|------------|--------|
| 🔐 **Auth Service** | 3000 | `auth.erp.uz` | Autentifikatsiya va avtorizatsiya | ✅ Migrated |
| 📊 **Admin Service** | 3001 | `admin.erp.uz` | Tizim boshqaruvi va monitoring | ✅ Migrated |
| ⚖️ **Scale Service** | 3002 | `scale.erp.uz` | Tarozi va o'lchov tizimlari | ✅ Migrated |
| 🧪 **Lab Service** | 3003 | `lab.erp.uz` | Sifat nazorati va laboratoriya | ✅ Migrated |
| 📦 **Production Service** | 3004 | `production.erp.uz` | Ishlab chiqarish boshqaruvi | ✅ Migrated |
| 👥 **CRM Service** | 3005 | `crm.erp.uz` | Mijozlar bilan ishlash | 🔄 Planned |
| 🏭 **Warehouse Service** | 3006 | `warehouse.erp.uz` | Ombor operatsiyalari | 🔄 Planned |
| 📈 **Analytics Service** | 3007 | `analytics.erp.uz` | Hisobotlar va tahlillar | 🔄 Planned |

## 🚀 **Ishga Tushirish**

### Prerequisites
```bash
# Node.js 18+ va npm o'rnatilgan bo'lishi kerak
node --version  # v18.0.0+
npm --version   # 9.0.0+
```

### Bitta buyruq bilan barcha servislarni ishga tushirish:

```bash
# Repositoriyani klonlash
git clone <repository-url>
cd navbahor-erp-nextjs

# Barcha dependencies o'rnatish
npm run install:all

# Barcha servislarni ishga tushirish (development mode)
npm run dev
```

### Alohida servislarni ishga tushirish:

```bash
# Auth Service (Port 3000)
npm run dev:auth

# Admin Service (Port 3001) 
npm run dev:admin

# Scale Service (Port 3002)
npm run dev:scale

# Lab Service (Port 3003)
npm run dev:lab

# Production Service (Port 3004)
npm run dev:production
```

## 🔐 **Demo Credentials**

### Auth Service (`http://localhost:3000`)
- **Admin:** `admin` / `admin123`
- **Operator:** `operator` / `operator123`
- **Lab Analyst:** `lab_analyst` / `lab123`
- **Production Manager:** `production` / `production123`

## 🏗️ **Arxitektura**

### **Frontend Stack:**
- ⚡ **Next.js 14** - Modern React framework with App Router
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📊 **Recharts** - Data visualization
- 🔄 **Zustand** - Lightweight state management
- 🌐 **Socket.io** - Real-time communication
- 🎯 **TypeScript** - Type safety

### **Key Improvements (Next.js vs Nuxt.js):**
- **🚀 Better Performance:** App Router, Server Components
- **📱 Better SEO:** Built-in optimization
- **🔧 Better DevX:** Improved TypeScript support
- **📦 Better Bundling:** Turbopack integration
- **🎨 Better Styling:** Enhanced Tailwind integration

### **Umumiy Komponentlar:**
- 🔐 **JWT Authentication** - Zustand-based auth store
- 🎯 **API Client Library** - Fetch-based HTTP clients
- 🎨 **Design System** - Shared UI components
- 📱 **Responsive Layout** - Mobile-first design

## 📁 **Fayl Tuzilishi**

```
navbahor-erp-nextjs/
├── apps/                           # Next.js Mikroservislar
│   ├── auth-service/              # 🔐 Autentifikatsiya
│   │   ├── src/
│   │   │   ├── app/               # App Router pages
│   │   │   ├── components/        # React components
│   │   │   ├── store/             # Zustand stores
│   │   │   └── lib/               # Utilities
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── Dockerfile
│   ├── admin-service/             # 📊 Admin panel
│   ├── scale-service/             # ⚖️ Tarozi tizimi
│   ├── lab-service/               # 🧪 Laboratoriya
│   ├── production-service/        # 📦 Ishlab chiqarish
│   ├── crm-service/               # 👥 Mijozlar
│   ├── warehouse-service/         # 🏭 Ombor
│   └── analytics-service/         # 📈 Tahlillar
├── shared/                        # Umumiy komponentlar
│   ├── components/               # UI komponentlar
│   ├── types/                    # TypeScript ta'riflar
│   ├── utils/                    # Umumiy funksiyalar
│   └── hooks/                    # Custom React hooks
├── infrastructure/               # Infratuzilma
│   ├── docker/                   # Container konfiguratsiya
│   ├── nginx/                    # Load balancer
│   └── k8s/                      # Kubernetes manifests
└── docs/                         # Hujjatlar
```

## 🔧 **Development**

### Environment Variables
Har bir servis uchun `.env.local` faylini yarating:

```env
# Auth Service (.env.local)
JWT_SECRET=navbahor-erp-secret-2024
API_BASE_URL=http://localhost:3333
ADMIN_SERVICE_URL=http://localhost:3001
SCALE_SERVICE_URL=http://localhost:3002
```

### Development Commands

```bash
# Barcha dependencies yangilash
npm run install:all

# Barcha servislarni build qilish
npm run build:all

# Production mode'da ishga tushirish
npm run start:all

# Alohida servisni test qilish
cd apps/auth-service && npm run dev

# TypeScript xatoliklarini tekshirish
npm run type-check
```

## 🐳 **Docker Deploy**

```bash
# Docker containers yaratish
docker-compose up -d

# Loglarni ko'rish
docker-compose logs -f

# Container holatini tekshirish
docker-compose ps
```

## 📋 **Migration Guide**

### **Nuxt.js → Next.js migratsiya qadamlari:**

1. **📦 Package.json yangilash**
   ```bash
   # Nuxt dependencies olib tashlash
   npm uninstall nuxt @nuxt/devtools @pinia/nuxt
   
   # Next.js dependencies o'rnatish
   npm install next react react-dom zustand
   ```

2. **🗂️ Fayl struktura o'zgartirish**
   ```bash
   # pages/ → src/app/ (App Router)
   # stores/ → src/store/ (Zustand)
   # composables/ → src/hooks/
   ```

3. **🔄 State Management**
   ```javascript
   // Pinia → Zustand
   const useStore = defineStore() → create()
   ```

4. **🎨 Styling**
   ```bash
   # Nuxt CSS modules → Tailwind classes
   # assets/css/ → globals.css import
   ```

## 📋 **Features**

### ✅ **Migrated**
- [x] 🔐 Authentication system (Zustand-based)
- [x] 📊 Admin dashboard va monitoring
- [x] ⚖️ Real-time tarozi integratsiyasi
- [x] 🧪 Laboratoriya moduli (basic)
- [x] 📦 Ishlab chiqarish boshqaruvi (basic)
- [x] 🎨 Responsive UI design
- [x] 🔄 State management (Zustand)
- [x] 📱 Mobile-first approach

### 🚧 **In Progress**
- [ ] 🧪 To'liq laboratoriya moduli
- [ ] 📦 Marka/batch management
- [ ] 👥 CRM tizimi
- [ ] 🏭 Ombor operatsiyalari
- [ ] 📈 Analytics dashboard

### 🔮 **Planned**
- [ ] 📊 Real-time dashboards
- [ ] 🤖 AI/ML quality predictions
- [ ] 📱 PWA support
- [ ] 🔄 API Gateway
- [ ] 🔔 Notifications system

## 🤝 **Development Workflow**

1. **Auth Service** (`localhost:3000`) - Birinchi kirish nuqtasi
2. **Admin Service** (`localhost:3001`) - Tizim boshqaruvi
3. **Scale Service** (`localhost:3002`) - Operatsional ish
4. Boshqa servislar ehtiyojga qarab

## 📞 **Support**

Texnik yordam yoki savol-javoblar uchun:
- 📧 Email: dev@navbahor.uz
- 💬 Telegram: @navbahor_dev
- 🐛 Issues: GitHub Issues

---

**© 2024 Navbahor Tekstil. Next.js Professional ERP Solution.**