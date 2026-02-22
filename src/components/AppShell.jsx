// src/components/AppShell.jsx
import React from "react";
import { NavLink } from "react-router-dom";

function DotLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f6bff" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <circle cx="11" cy="11" r="10" fill="url(#g)" opacity="0.95" />
      <circle cx="11" cy="11" r="4.8" fill="white" opacity="0.9" />
    </svg>
  );
}

export default function AppShell({ children, me, onLogout }) {
  return (
    <div className="container">
      <div className="shell">
        <header className="header">
          <div className="brand">
            <DotLogo />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span>Prime7 (Pc)</span>
                <span className="badge">beta</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                Конфігуратор та магазин комплектуючих
              </div>
            </div>
          </div>

          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
              Каталог
            </NavLink>
            <NavLink to="/build" className={({ isActive }) => (isActive ? "active" : "")}>
              Збірка
            </NavLink>
            <NavLink to="/cart" className={({ isActive }) => (isActive ? "active" : "")}>
              Кошик
            </NavLink>
          </nav>

          <div className="headerRight">
            <div className="pill">
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--primary2)" }} />
              <span>{me?.authenticated ? me.username : "Гість"}</span>
            </div>

            {me?.authenticated ? (
              <button className="btn btnDanger" onClick={onLogout}>
                Вийти
              </button>
            ) : (
              <NavLink to="/login" className="btn btnPrimary">
                Увійти
              </NavLink>
            )}
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
