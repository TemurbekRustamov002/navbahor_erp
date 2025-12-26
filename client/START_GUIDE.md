# 🚀 Navbahor ERP Frontend - Ishga Tushirish Qo'llanmasi

## **Tezkor Boshlash**

### 1. **Dependencies O'rnatish**
```bash
cd erp-client-nextjs
npm install
```

### 2. **Development Server Ishga Tushirish**
```bash
npm run dev
```

### 3. **Browser'da Ochish**
```
http://localhost:3100
```

## **📋 Demo Hisoblar**

| Role | Username | Password | Sahifa |
|------|----------|----------|---------|
| **Administrator** | `admin` | `admin123` | Bosh boshqaruv paneli |
| **Tarozi Operator** | `operator` | `operator123` | Tarozi tizimi |
| **Lab Mutaxassis** | `lab_analyst` | `lab123` | Laboratoriya |
| **Ishlab Chiqarish** | `production` | `production123` | Production management |
| **Ombor Menejeri** | `warehouse` | `warehouse123` | Ombor boshqaruvi |
| **Mijozlar Menejeri** | `customer` | `customer123` | Mijozlar bilan ishlash |

## **🎯 Asosiy Modullar**

### **1. Dashboard** (`/dashboard`)
- Welcome screen
- Role-based statistics
- Quick actions
- Recent activity
- System status

### **2. Tarozi Tizimi** (`/dashboard/tarozi`)
- Real-time og'irlik ko'rsatkichi
- Toy registration
- Marka ID bilan ishlash
- Tara calibration

### **3. Laboratoriya** (`/dashboard/labaratoriya`)
- Yangi test boshlash
- Test natijalari
- Namlik, ifloslik, pishiqlik testlari
- Lab equipment status

### **4. Mijozlar** (`/dashboard/mijozlar`)
- Mijozlar ro'yxati
- Yangi mijoz qo'shish
- Buyurtmalar tarixi
- Contact management

### **5. Navigation**
- Role-based sidebar menu
- User profile dropdown
- Quick search
- Notifications

## **💻 Tech Stack**

### **Core Technologies:**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Zustand** - State management

### **UI Components:**
- **Lucide React** - Modern icons
- **Headless UI** - Accessible components
- **Custom UI library** - Reusable components

### **Development Tools:**
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## **📁 Project Structure**

```
erp-client-nextjs/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── tarozi/         # Tarozi module
│   │   │   ├── labaratoriya/   # Lab module
│   │   │   ├── mijozlar/       # Customers module
│   │   │   └── layout.tsx      # Dashboard layout
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Login page
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── auth/               # Authentication
│   │   ├── dashboard/          # Dashboard widgets
│   │   ├── layout/             # Layout components
│   │   ├── providers/          # Context providers
│   │   └── ui/                 # UI components
│   ├── stores/                 # Zustand stores
│   │   └── authStore.ts        # Authentication store
│   └── lib/                    # Utility functions
│       └── utils.ts            # Helper functions
├── public/                     # Static assets
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind configuration
├── next.config.js             # Next.js configuration
└── tsconfig.json              # TypeScript configuration
```

## **🔧 Scripts**

```bash
# Development
npm run dev              # Start development server (Port 3100)

# Production
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking
```

## **🌐 API Integration**

Frontend Backend API bilan ishlash uchun tayyorlangan:

```typescript
// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

// Example API call
const response = await fetch(`${API_BASE_URL}/api/tarozi/weights`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## **🎨 Theming**

### **Colors:**
- **Primary Green:** `#10b981` (Navbahor brand)
- **Dark:** `#1a202c`
- **Blue:** `#3b82f6`
- **Purple:** `#8b5cf6`

### **Custom CSS Classes:**
- `.loading-spinner` - Loading animation
- `.fade-in` - Fade in animation
- `.slide-up` - Slide up animation

## **🔐 Authentication Flow**

1. **Login:** User enters credentials
2. **Validation:** Frontend validates with demo accounts
3. **Store:** User data saved in Zustand store (persisted)
4. **Redirect:** Role-based redirect to appropriate dashboard
5. **Guards:** Route protection in dashboard layout

## **📱 Responsive Design**

- **Mobile First:** Tailwind mobile-first approach
- **Breakpoints:**
  - `sm:` 640px and up
  - `md:` 768px and up  
  - `lg:` 1024px and up
  - `xl:` 1280px and up

## **🔍 Development Tips**

### **Adding New Pages:**
1. Create page in `src/app/dashboard/[module]/page.tsx`
2. Add route to sidebar navigation
3. Add role-based access control

### **Creating Components:**
1. Use TypeScript interfaces
2. Follow naming conventions
3. Add proper props types
4. Use Tailwind classes

### **State Management:**
1. Use Zustand for global state
2. Create typed stores
3. Persist important data

## **🐛 Troubleshooting**

### **Common Issues:**

1. **Port 3100 already in use:**
   ```bash
   npx kill-port 3100
   npm run dev
   ```

2. **TypeScript errors:**
   ```bash
   npm run type-check
   ```

3. **Missing dependencies:**
   ```bash
   npm install
   ```

4. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

## **📞 Support**

- **Developer:** Rovo Dev
- **Tech Stack:** Next.js + TypeScript
- **Status:** ✅ Production Ready
- **License:** MIT

---

**🚀 Frontend muvaffaqiyatli ishga tushirildi!**