# Alpine o'rniga Debian-ga asoslangan 'slim' versiyadan foydalanamiz
FROM node:20-slim

# Debian tizimida OpenSSL va Prisma uchun kerakli kutubxonalar
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    git \
    make \
    python3 \
    g++ \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

# Prisma clientni generatsiya qilish
RUN npx prisma generate

RUN npm run build

EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
