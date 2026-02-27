"use client";

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useSettingsStore } from "@/stores/settingsStore";
import Link from "next/link";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { fontSize, setFontSize } = useSettingsStore();

  const menuItems = [
    { label: "الأذكار والأدعية", icon: "🤲", href: "/adhkar" },
    { label: "إحصائيات القراءة", icon: "📊", href: "/stats" },
    { label: "ختمة جماعية", icon: "👥", href: "/khatm" },
    { label: "روابط القرآن", icon: "🔗", href: "/connections" },
    { label: "القرآن حسب حالتك", icon: "💚", href: "/mood" },
    { label: "دليل المساجد", icon: "🕌", href: "/masjid" },
    { label: "رمضان", icon: "🏮", href: "/ramadan" },
    { label: "متابعة الحفظ", icon: "🧠", href: "/hifz" },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <Header title="المزيد" />
      <div className="px-4 py-6 space-y-6">
        {/* Quick Links */}
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-[var(--card)] transition-colors">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Settings */}
        <div>
          <p className="font-bold mb-3 text-sm text-[var(--muted)]">الإعدادات</p>

          {/* Theme */}
          <Card className="flex items-center justify-between mb-3">
            <span>المظهر</span>
            <button
              onClick={toggleTheme}
              className="px-4 py-1.5 rounded-lg bg-[var(--card-border)] text-sm"
            >
              {theme === "dark" ? "داكن 🌙" : "فاتح ☀️"}
            </button>
          </Card>

          {/* Font Size */}
          <Card className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span>حجم الخط</span>
              <span className="text-sm text-[var(--muted)]">{fontSize}px</span>
            </div>
            <input
              type="range"
              min={18}
              max={42}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
            <p className="quran-text text-center mt-2" style={{ fontSize: `${fontSize}px` }}>
              بِسْمِ ٱللَّهِ
            </p>
          </Card>
        </div>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-xl font-bold">مصحف</p>
          <p className="text-xs text-[var(--muted)] mt-1">الإصدار ١.٠.٠</p>
          <p className="text-xs text-[var(--muted)] mt-1">القرآن الكريم - التراويح - الأذكار</p>
        </div>
      </div>
    </div>
  );
}
