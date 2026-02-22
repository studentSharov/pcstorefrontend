import React from "react";
import { Link } from "react-router-dom";
import { getAuth } from "../api/api.js";

export default function Home() {
  const auth = getAuth();

  return (
    <div style={{ padding: "18px 0" }}>
      <h1 style={{ margin: "10px 0 6px" }}>Prime7 (PC)</h1>

      <p style={{ opacity: 0.86, marginTop: 0, lineHeight: 1.55 }}>
        Демонстраційний проєкт для курсової роботи: каталог комплектуючих, створення збірки та робота з кошиком.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        {auth?.token ? (
          <>
            <Link
              to="/build"
              style={{
                display: "inline-block",
                padding: "10px 12px",
                borderRadius: 10,
                textDecoration: "none",
                color: "inherit",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              Перейти до збірки
            </Link>

            <Link
              to="/cart"
              style={{
                display: "inline-block",
                padding: "10px 12px",
                borderRadius: 10,
                textDecoration: "none",
                color: "inherit",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              Відкрити кошик
            </Link>
          </>
        ) : (
          <Link
            to="/login"
            style={{
              display: "inline-block",
              padding: "10px 12px",
              borderRadius: 10,
              textDecoration: "none",
              color: "inherit",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            Увійти, щоб почати
          </Link>
        )}
      </div>

      <div style={{ marginTop: 18, opacity: 0.86, fontSize: 14, lineHeight: 1.65 }}>
        <div><b>Backend:</b> Spring Boot + PostgreSQL + Basic Auth</div>
        <div><b>Frontend:</b> React + Vite</div>
        <div><b>Мета:</b> зрозумілий інтерфейс і логіка без “підозрілих” прикрас.</div>
      </div>
    </div>
  );
}
