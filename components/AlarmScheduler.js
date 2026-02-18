import { useEffect } from "react";

export default function AlarmScheduler({ times, medicineName, dosage }) {
  useEffect(() => {
    if (!times || !medicineName) return;

    const timeList = times.split(",").map((t) => t.trim());
    const timers = [];

    const scheduleAlarms = () => {
      timeList.forEach((time) => {
        const [hours, minutes] = time.split(":").map(Number);
        const now = new Date();
        const alarmTime = new Date();
        alarmTime.setHours(hours, minutes, 0, 0);

        // If time already passed today, schedule for tomorrow
        if (alarmTime <= now) {
          alarmTime.setDate(alarmTime.getDate() + 1);
        }

        const delay = alarmTime - now;

        const timer = setTimeout(() => {
          // Browser notification
          if (Notification.permission === "granted") {
            new Notification(`💊 Medicine Reminder`, {
              body: `Time to take ${medicineName} - ${dosage}`,
              icon: "/pill-icon.png",
            });
          } else {
            alert(`💊 Time to take your medicine!\n${medicineName} - ${dosage}`);
          }
        }, delay);

        timers.push(timer);
      });
    };

    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission().then(scheduleAlarms);
    } else {
      scheduleAlarms();
    }

    return () => timers.forEach(clearTimeout);
  }, [times, medicineName, dosage]);

  return null;
}