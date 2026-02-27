"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { useSettingsStore } from "@/stores/settingsStore";
import { calculateQiblaDirection, getDistanceToKaaba } from "@/lib/qibla";

export default function QiblaPage() {
  const location = useSettingsStore((s) => s.location);
  const [compass, setCompass] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [distance, setDistance] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (!location) return;
    setQiblaAngle(calculateQiblaDirection(location.lat, location.lng));
    setDistance(getDistanceToKaaba(location.lat, location.lng));
  }, [location]);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setCompass(e.alpha);
        setPermissionGranted(true);
      }
    };

    // Try to request permission (for iOS)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (DeviceOrientationEvent as any).requestPermission().then((state: string) => {
        if (state === "granted") {
          window.addEventListener("deviceorientation", handleOrientation);
        }
      });
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  return (
    <div className="max-w-lg mx-auto">
      <Header title="اتجاه القبلة" showBack />
      <div className="px-4 py-6 space-y-6">
        {!location ? (
          <div className="text-center py-12">
            <p className="text-[var(--muted)]">يرجى تحديد موقعك أولاً من صفحة الصلاة</p>
          </div>
        ) : (
          <>
            {/* Compass */}
            <div className="flex justify-center py-8">
              <div className="relative w-64 h-64">
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full transition-transform duration-300"
                  style={{ transform: `rotate(${-compass}deg)` }}
                >
                  {/* Compass circle */}
                  <circle cx="100" cy="100" r="95" fill="none" stroke="var(--card-border)" strokeWidth="2" />

                  {/* Direction markers */}
                  {["N", "E", "S", "W"].map((dir, i) => (
                    <text
                      key={dir}
                      x="100"
                      y="20"
                      textAnchor="middle"
                      fill="var(--muted)"
                      fontSize="12"
                      transform={`rotate(${i * 90} 100 100)`}
                    >
                      {dir === "N" ? "ش" : dir === "E" ? "شر" : dir === "S" ? "ج" : "غ"}
                    </text>
                  ))}

                  {/* Qibla arrow */}
                  <line
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="15"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeLinecap="round"
                    transform={`rotate(${qiblaAngle} 100 100)`}
                  />

                  {/* Kaaba icon at qibla direction */}
                  <text
                    x="100"
                    y="12"
                    textAnchor="middle"
                    fontSize="16"
                    transform={`rotate(${qiblaAngle} 100 100)`}
                  >
                    🕋
                  </text>

                  {/* Center dot */}
                  <circle cx="100" cy="100" r="5" fill="#22c55e" />
                </svg>
              </div>
            </div>

            {/* Info */}
            <Card className="text-center">
              <p className="text-lg font-bold">{Math.round(qiblaAngle)}°</p>
              <p className="text-sm text-[var(--muted)]">اتجاه القبلة</p>
            </Card>

            <Card className="text-center">
              <p className="text-lg font-bold">{Math.round(distance)} كم</p>
              <p className="text-sm text-[var(--muted)]">المسافة إلى الكعبة</p>
            </Card>

            {!permissionGranted && (
              <p className="text-center text-xs text-[var(--muted)]">
                حرّك جهازك لتفعيل البوصلة. قد تحتاج إلى السماح بالوصول لمستشعر الاتجاه.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
