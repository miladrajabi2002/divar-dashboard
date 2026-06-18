# داشبورد دیوار (Divar Dashboard)

داشبورد مدیریت آگهی‌های [دیوار](https://divar.ir) با کمک هوش مصنوعی. ورود با OTP داخل داشبورد، مشاهده و مدیریت آگهی‌ها، آمار تجمیعی، **بررسی هوشمند عملکرد آگهی‌ها (استریم زنده)**، تولید عنوان/متن با AI، و **ساخت بنر آگهی با مدل تصویر** — همه از طریق [OpenRouter](https://openrouter.ai).

> ⚙️ این پروژه برای **اجرای روی سرور شخصی (self-host)** طراحی شده، نه Vercel. راهنمای کامل نصب: [docs/INSTALLATION.md](docs/INSTALLATION.md).

## امکانات

- 🔐 **ورود با OTP دیوار** کاملاً داخل داشبورد (دریافت کد + تأیید) با مدیریت انقضای توکن
- 📋 **مدیریت آگهی‌ها**: لیست، جزئیات، حذف، بارگذاری تدریجی
- 📊 **داشبورد آمار تجمیعی**: تعداد کل/فعال، نمودار رشد، و عملکرد تک‌تک آگهی‌های فعال
- 🤖 **بررسی هوشمند با AI**: گزارش استریم زندهٔ بهبود آگهی‌ها بر اساس چارچوب رشد دیوار (هم تجمیعی، هم تک‌آگهی)
- ✍️ **دستیار هوش مصنوعی**: تولید عنوان و متن آگهی + **بنرساز** (ساخت خودکار بنر از روی پرامپت تصویر) در اندازه‌های استاندارد
- ⚙️ **پیکربندی از داشبورد**: کلید API و انتخاب **مدل متن** و **مدل عکس** جداگانه از صفحهٔ تنظیمات

## استک فنی

| بخش | فناوری |
| --- | --- |
| فریم‌ورک | Next.js 16 (App Router) + React 19 |
| دیتابیس | SQLite + Drizzle ORM (`better-sqlite3`) |
| UI | Tailwind CSS 4 + shadcn / Base UI |
| State | Zustand |
| نمودار | Recharts |
| AI | OpenRouter (از طریق OpenAI SDK + REST) |

## پیش‌نیازها

- **Node.js 20+** و npm
- روی لینوکس برای کامپایل `better-sqlite3`: `build-essential` و `python3`
  ```bash
  sudo apt update && sudo apt install -y git build-essential python3
  ```

## شروع سریع (نصب)

```bash
git clone https://github.com/miladrajabi2002/divar-dashboard.git
cd divar-dashboard
npm install                     # ← همیشه قبل از build لازم است
cp .env.example .env.local      # ویرایش اختیاری
npm run db:migrate              # ساخت دیتابیس
npm run dev                     # حالت توسعه → http://localhost:3000
```

سپس از صفحهٔ **تنظیمات** کلید OpenRouter و مدل‌ها را وارد کنید و با OTP وارد دیوار شوید.

## اجرای Production با PM2

```bash
sudo npm install -g pm2         # یک‌بار
npm install                     # نصب وابستگی‌ها
npm run build                   # build + مهاجرت خودکار دیتابیس
pm2 start ecosystem.config.js   # اجرا روی پورت 3000
pm2 save && pm2 startup         # بالا آمدن خودکار بعد از ریبوت
```

دستورات مفید PM2: `pm2 logs divar-dashboard` ، `pm2 restart divar-dashboard` ، `pm2 status`.

## به‌روزرسانی و ری‌استارت

> ⚠️ بعد از هر `git pull` حتماً `npm install` بزنید؛ وگرنه با اضافه‌شدن پکیج جدید، build با خطای `Module not found` می‌خورد.

```bash
git pull
npm install                     # این مرحله را رد نکنید
npm run build
pm2 restart divar-dashboard
```

راهنمای کامل سرور (Nginx + HTTPS + عیب‌یابی): [docs/INSTALLATION.md](docs/INSTALLATION.md).

## پیکربندی هوش مصنوعی

کلید API و مدل‌ها از دو راه قابل تنظیم‌اند (اولویت با دیتابیس است):

1. **صفحهٔ تنظیمات داشبورد** (پیشنهادی) — در جدول `app_settings` ذخیره می‌شود.
2. **متغیرهای محیطی** در `.env.local` (به‌عنوان مقدار پیش‌فرض) — `OPENROUTER_API_KEY`, `AI_MODEL`, `AI_IMAGE_MODEL`.

> توجه: مدل عکس باید از تولید تصویر (image output) پشتیبانی کند، مثل `google/gemini-2.5-flash-image-preview`.

## هشدار

این پروژه از API‌های داخلی و غیررسمی دیوار استفاده می‌کند و برای **مدیریت شخصی آگهی‌های خودتان** است. مسئولیت استفاده بر عهدهٔ کاربر است.
