# داشبورد دیوار (Divar Dashboard)

داشبورد مدیریت آگهی‌های [دیوار](https://divar.ir) با کمک هوش مصنوعی. ورود با OTP داخل داشبورد، مشاهده و مدیریت آگهی‌ها، آمار، تولید عنوان/متن/تحلیل با AI، و **ساخت بنر آگهی با مدل تصویر** — همه از طریق [OpenRouter](https://openrouter.ai).

> ⚙️ این پروژه برای **اجرای روی سرور شخصی (self-host)** طراحی شده، نه Vercel. راهنمای کامل نصب: [docs/INSTALLATION.md](docs/INSTALLATION.md).

## امکانات

- 🔐 **ورود با OTP دیوار** کاملاً داخل داشبورد (دریافت کد + تأیید) با مدیریت انقضای توکن
- 📋 **مدیریت آگهی‌ها**: لیست، جزئیات، حذف، بارگذاری تدریجی
- 📊 **آمار آگهی**: نمایش، بازدید، تماس، چت، جایگاه
- 🤖 **دستیار هوش مصنوعی**: تولید عنوان، متن آگهی، و تحلیل آمار
- 🎨 **بنرساز**: تولید تصویر بنر آگهی در اندازه‌های استاندارد دیوار
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

## شروع سریع

```bash
git clone https://github.com/miladrajabi2002/divar-dashboard.git
cd divar-dashboard
npm install
cp .env.example .env.local      # ویرایش اختیاری
npm run db:migrate              # ساخت دیتابیس
npm run dev                     # http://localhost:3000
```

سپس از صفحهٔ **تنظیمات** کلید OpenRouter و مدل‌ها را وارد کنید و با OTP وارد دیوار شوید.

برای اجرای production روی سرور (build + start یا PM2)، [docs/INSTALLATION.md](docs/INSTALLATION.md) را ببینید.

## پیکربندی هوش مصنوعی

کلید API و مدل‌ها از دو راه قابل تنظیم‌اند (اولویت با دیتابیس است):

1. **صفحهٔ تنظیمات داشبورد** (پیشنهادی) — در جدول `app_settings` ذخیره می‌شود.
2. **متغیرهای محیطی** در `.env.local` (به‌عنوان مقدار پیش‌فرض) — `OPENROUTER_API_KEY`, `AI_MODEL`, `AI_IMAGE_MODEL`.

> توجه: مدل عکس باید از تولید تصویر (image output) پشتیبانی کند، مثل `google/gemini-2.5-flash-image-preview`.

## هشدار

این پروژه از API‌های داخلی و غیررسمی دیوار استفاده می‌کند و برای **مدیریت شخصی آگهی‌های خودتان** است. مسئولیت استفاده بر عهدهٔ کاربر است.
