import { useEffect, useState } from "react";
import "./ThemeToggle.css";

export default function ThemeToggle() {

  /* ================= INIT STATE (FIX ERREUR) ================= */

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark";
  });

  /* ================= SYNC DOM ================= */

  useEffect(() => {

    if (isDark) {

      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");

    } else {

      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");

    }

  }, [isDark]);

  /* ================= TOGGLE ================= */

  function toggleTheme() {

    setIsDark(prev => !prev);

  }

  /* ================= UI ================= */

  return (

    <div className="theme-toggle-wrapper">

      <input
        type="checkbox"
        id="hide-checkbox"
        checked={isDark}
        onChange={toggleTheme}
      />

      <label
        htmlFor="hide-checkbox"
        className="toggle"
      >

        <span className="toggle-button">

          <span className="crater crater-1"></span>
          <span className="crater crater-2"></span>
          <span className="crater crater-3"></span>
          <span className="crater crater-4"></span>
          <span className="crater crater-5"></span>
          <span className="crater crater-6"></span>
          <span className="crater crater-7"></span>

        </span>

        <span className="star star-1"></span>
        <span className="star star-2"></span>
        <span className="star star-3"></span>
        <span className="star star-4"></span>
        <span className="star star-5"></span>
        <span className="star star-6"></span>
        <span className="star star-7"></span>
        <span className="star star-8"></span>

      </label>

    </div>

  );

}