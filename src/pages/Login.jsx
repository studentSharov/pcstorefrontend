import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, registerUser, setAuth } from "../api/api.js";

function Field({ label, ...props }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, opacity: 0.85 }}>{label}</span>
      <input
        {...props}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.06)",
          color: "inherit",
          outline: "none",
        }}
      />
    </label>
  );
}

export default function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState("login"); // login | register
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const title = useMemo(() => (mode === "login" ? "Вхід" : "Реєстрація"), [mode]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!username.trim() || !password) {
      setMsg({ type: "error", text: "Заповніть логін і пароль." });
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await registerUser({ username: username.trim(), password });
      }

      // Save Basic Auth locally
      setAuth(username.trim(), password);

      // Verify
      await getMe();

      nav("/build");
    } catch (err) {
      const text =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Не вдалося виконати дію. Перевірте дані та повторіть.";
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "18px 0", display: "grid", placeItems: "start", gap: 12 }}>
      <h1 style={{ margin: "10px 0 0" }}>{title}</h1>
      <p style={{ margin: 0, opacity: 0.85, lineHeight: 1.5 }}>
        Використовується Basic Auth. Дані зберігаються локально у браузері (для демонстрації).
      </p>

      <form
        onSubmit={submit}
        style={{
          marginTop: 10,
          width: "min(460px, 100%)",
          padding: 14,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.03)",
          display: "grid",
          gap: 12,
        }}
      >
        <Field
          label="Логін"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="наприклад: user"
          autoComplete="username"
        />
        <Field
          label="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />

        {msg && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: msg.type === "error" ? "rgba(255, 80, 80, 0.12)" : "rgba(80, 255, 150, 0.10)",
            }}
          >
            {msg.text}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            disabled={loading}
            type="submit"
            style={{
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "inherit",
              padding: "10px 12px",
              borderRadius: 10,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Зачекайте..." : mode === "login" ? "Увійти" : "Створити акаунт"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMsg(null);
              setMode(mode === "login" ? "register" : "login");
            }}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent",
              color: "inherit",
              padding: "10px 12px",
              borderRadius: 10,
              cursor: "pointer",
              opacity: 0.9,
            }}
          >
            {mode === "login" ? "Немає акаунту? Реєстрація" : "Вже є акаунт? Вхід"}
          </button>
        </div>

        <div style={{ opacity: 0.75, fontSize: 13, lineHeight: 1.5 }}>
          Підказка: у твоєму backend вже є користувачі <b>user/user</b> та <b>admin/admin</b>.
        </div>
      </form>
    </div>
  );
}
