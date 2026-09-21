import { useEffect, useState } from "react";

export const limaDate = (date = new Date()) => date.toLocaleDateString("sv-SE", { timeZone: "America/Lima" });

/** Also refresh after sleep/backgrounding: an open tab must not retain yesterday. */
export function useLimaDate() {
  const [fecha, setFecha] = useState(limaDate);
  useEffect(() => {
    const update = () => setFecha(limaDate());
    const timer = window.setInterval(update, 60_000);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return fecha;
}
