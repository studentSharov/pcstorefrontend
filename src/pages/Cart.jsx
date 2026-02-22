import React, { useEffect, useState } from "react";
import {
  cartCheckout,
  cartClear,
  cartRemoveItem,
  cartUpdateQty,
  getMyCart,
} from "../api/api.js";

function Card({ children }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.03)",
        borderRadius: 14,
        padding: 12,
      }}
    >
      {children}
    </div>
  );
}

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const c = await getMyCart();
      setCart(c);
    } catch {
      setMsg("Не вдалося завантажити кошик.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateQty = async (itemId, qty) => {
    try {
      await cartUpdateQty(itemId, qty);
      await load();
    } catch {
      setMsg("Не вдалося змінити кількість.");
    }
  };

  const remove = async (itemId) => {
    try {
      await cartRemoveItem(itemId);
      await load();
    } catch {
      setMsg("Не вдалося видалити позицію.");
    }
  };

  const clear = async () => {
    try {
      await cartClear();
      await load();
    } catch {
      setMsg("Не вдалося очистити кошик.");
    }
  };

  const checkout = async () => {
    try {
      await cartCheckout();
      await load();
      setMsg("Кошик оформлено (демо-режим).");
      setTimeout(() => setMsg(null), 1400);
    } catch {
      setMsg("Не вдалося оформити кошик.");
    }
  };

  return (
    <div style={{ padding: "18px 0" }}>
      <h1 style={{ margin: "10px 0 6px" }}>Кошик</h1>
      <p style={{ marginTop: 0, opacity: 0.86 }}>
        Тут будуть товари та (пізніше) збірки як окремі об'єкти.
      </p>

      {msg && (
        <div
          style={{
            margin: "10px 0",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          {msg}
        </div>
      )}

      {loading ? (
        <div style={{ opacity: 0.85 }}>Завантаження...</div>
      ) : !cart ? (
        <div style={{ opacity: 0.85 }}>Немає даних.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ opacity: 0.9 }}>
                Статус: <b>{cart.status}</b>
              </div>
              <div style={{ opacity: 0.9 }}>
                Разом: <b>{Number(cart.total || 0).toFixed(2)} ₴</b>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <button
                onClick={clear}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  cursor: "pointer",
                  color: "inherit",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                Очистити
              </button>

              <button
                onClick={checkout}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  cursor: "pointer",
                  color: "inherit",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                Оформити
              </button>
            </div>
          </Card>

          <div style={{ display: "grid", gap: 10 }}>
            {(cart.items || []).length === 0 ? (
              <div style={{ opacity: 0.85 }}>Кошик порожній.</div>
            ) : (
              cart.items.map((it) => {
                const name = it.type === "PRODUCT" ? it.product?.name : it.build?.name || "Build";
                const unit = Number(it.unitPrice || 0).toFixed(2);
                const line = Number(it.lineTotal || 0).toFixed(2);

                return (
                  <Card key={it.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 700 }}>{name}</div>
                      <div style={{ opacity: 0.9 }}>{line} ₴</div>
                    </div>

                    <div style={{ marginTop: 6, opacity: 0.85, fontSize: 13 }}>
                      Ціна за одиницю: {unit} ₴
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
                      <span style={{ opacity: 0.85 }}>Кількість:</span>
                      <input
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) => updateQty(it.id, Number(e.target.value))}
                        style={{
                          width: 90,
                          padding: "8px 10px",
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.14)",
                          background: "rgba(255,255,255,0.06)",
                          color: "inherit",
                        }}
                      />
                      <button
                        onClick={() => remove(it.id)}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 10,
                          cursor: "pointer",
                          color: "inherit",
                          border: "1px solid rgba(255,255,255,0.14)",
                          background: "rgba(255,255,255,0.04)",
                        }}
                      >
                        Видалити
                      </button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
