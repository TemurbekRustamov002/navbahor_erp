#!/bin/bash

if [ -f .env ]; then
  export $(cat .env | sed 's/#.*//g' | xargs)
fi

if [ -z "$DOMAIN_NAME" ]; then
  echo "XATOLIK: .env faylida DOMAIN_NAME (IP manzil) ko'rsatilmagan!"
  exit 1
fi

echo "### $DOMAIN_NAME (IP) uchun Self-Signed sertifikat yaratilmoqda..."

# Papka yaratish
mkdir -p nginx/certs

# Sertifikat generatsiya qilish
openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
  -keyout nginx/certs/privkey.pem \
  -out nginx/certs/fullchain.pem \
  -subj "/C=UZ/ST=Tashkent/L=Tashkent/O=Navbahor/OU=IT/CN=$DOMAIN_NAME"

echo "### Sertifikatlar tayyor: nginx/certs papkasida joylashdi."
echo "### Endi 'docker-compose up -d --build' orqali ishga tushirishingiz mumkin."
