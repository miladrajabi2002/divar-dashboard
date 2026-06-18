# راهنمای نصب و راه‌اندازی

این راهنما نصب داشبورد دیوار روی **سرور شخصی** (لینوکس / Ubuntu) را پوشش می‌دهد. برای اجرای محلی روی ویندوز/مک هم همین مراحل (بدون بخش PM2/Nginx) کار می‌کند.

## پیش‌نیازها

- **Node.js 20+** و npm
- **Git**
- ابزار بیلد برای `better-sqlite3` (روی لینوکس): `build-essential` و `python3`

```bash
# Ubuntu / Debian
sudo apt update
sudo apt install -y git build-essential python3
# نصب Node.js 20 (در صورت نبود)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

## ۱) دریافت سورس و نصب وابستگی‌ها

```bash
git clone https://github.com/miladrajabi2002/divar-dashboard.git
cd divar-dashboard
npm install
```

## ۲) تنظیم متغیرهای محیطی

```bash
cp .env.example .env.local
nano .env.local
```

همهٔ مقادیر اختیاری‌اند و می‌توانید کلید API و مدل‌ها را بعداً از صفحهٔ **تنظیمات** داشبورد هم وارد کنید:

```env
DATABASE_PATH=./divar.db
OPENROUTER_API_KEY=            # یا خالی بگذارید و از داشبورد وارد کنید
AI_MODEL=anthropic/claude-sonnet-4-6
AI_IMAGE_MODEL=google/gemini-2.5-flash-image-preview
```

## ۳) ساخت دیتابیس (مهاجرت)

```bash
npm run db:migrate
```

این فایل SQLite را در مسیر `DATABASE_PATH` می‌سازد و جداول را ایجاد می‌کند. (دستور `npm run build` هم به‌صورت خودکار مهاجرت را اجرا می‌کند.)

## ۴) اجرا

### حالت توسعه

```bash
npm run dev
# http://localhost:3000
```

### حالت Production

```bash
npm run build
npm run start        # روی پورت 3000
```

برای تغییر پورت: `PORT=8080 npm run start`.

## ۵) اجرای دائمی با PM2 (پیشنهادی برای سرور)

پروژه یک فایل آمادهٔ `ecosystem.config.js` دارد (پورت ۳۰۰۰، ری‌استارت خودکار):

```bash
sudo npm install -g pm2
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup          # دستور پیشنهادی را اجرا کنید تا بعد از ریبوت بالا بیاید
```

دستورات مفید:

```bash
pm2 logs divar-dashboard      # مشاهدهٔ لاگ
pm2 restart divar-dashboard   # ری‌استارت
pm2 stop divar-dashboard      # توقف
pm2 status                    # وضعیت پروسه‌ها
```

## ۶) Reverse Proxy با Nginx (اختیاری)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

سپس برای HTTPS از Certbot استفاده کنید:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## ۷) اولین استفاده

1. داشبورد را در مرورگر باز کنید.
2. به **تنظیمات** بروید و کلید OpenRouter (از [openrouter.ai/keys](https://openrouter.ai/keys)) و مدل متن و عکس را وارد و ذخیره کنید.
3. روی **ورود به دیوار** بزنید، شمارهٔ موبایل را وارد کنید، کد OTP پیامک‌شده را وارد کنید.
4. حالا آگهی‌ها، آمار، دستیار AI و بنرساز در دسترس‌اند.

## به‌روزرسانی (مهم)

بعد از هر `git pull` حتماً `npm install` بزنید؛ وگرنه اگر پکیج جدیدی اضافه شده باشد بیلد با خطای `Module not found` می‌خورد:

```bash
git pull
npm install            # ← این مرحله را رد نکنید
npm run build          # مهاجرت دیتابیس را هم خودکار اجرا می‌کند
pm2 restart divar-dashboard
```

## نکات و عیب‌یابی

- **خطای `Module not found: Can't resolve 'framer-motion'` (یا `react-hot-toast`)**: یعنی بعد از `git pull` دستور `npm install` اجرا نشده. کافی است `npm install` بزنید و دوباره `npm run build`.
- **خطای بیلد `better-sqlite3`**: مطمئن شوید `build-essential` و `python3` نصب‌اند، سپس `npm rebuild better-sqlite3`.
- **بکاپ دیتابیس**: کافی است از فایل `divar.db` نسخهٔ پشتیبان بگیرید (شامل توکن نشست و تنظیمات است؛ آن را محرمانه نگه دارید).
- **کلید API امن بماند**: فایل‌های `.env.local` و `*.db` در `.gitignore` هستند و نباید commit شوند.
- **توکن دیوار منقضی شد**: داشبورد به‌صورت خودکار درخواست ورود مجدد می‌دهد؛ کافی است دوباره OTP بزنید.
