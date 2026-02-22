import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearBasicAuth, getAuth, getMe } from "../api/api.js";

const linkStyle = ({ isActive }) => ({
  textDecoration: "none",
  padding: "8px 10px",
  borderRadius: 10,
  color: "inherit",
  opacity: isActive ? 1 : 0.82,
  background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
  border: "1px solid transparent",
});

export default function NavBar() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!auth?.token) {
        setMe(null);
        return;
      }
      try {
        const data = await getMe();
        if (!cancelled) setMe(data);
      } catch {
        if (!cancelled) setMe(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth?.token]);

  const onLogout = () => {
    clearBasicAuth();
    setMe(null);
    nav("/login");
  };

  return (
    <header style={{ padding: "14px 0 10px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontWeight: 900, letterSpacing: 0.5 }}>Prime7 (PC)</div>
          <nav style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <NavLink to="/" style={linkStyle}>Головна</NavLink>
            <NavLink to="/build" style={linkStyle}>Збірка</NavLink>
            <NavLink to="/cart" style={linkStyle}>Кошик</NavLink>
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {auth?.token ? (
            <>
              <span style={{ opacity: 0.9, fontSize: 14 }}>
                Вхід: <b>{me?.username || auth.username || "користувач"}</b>
              </span>
              <button
                onClick={onLogout}
                style={{
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)",
                  color: "inherit",
                  padding: "8px 10px",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Вийти
              </button>
            </>
          ) : (
            <button
              onClick={() => nav("/login")}
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
                color: "inherit",
                padding: "8px 10px",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              Увійти
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
