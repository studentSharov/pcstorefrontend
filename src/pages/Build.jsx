import React, { useEffect, useMemo, useState } from "react";
import {
  getProducts,
  cfgGetMyBuilds,
  cfgCreateBuild,
  cfgGetBuild,
  cfgValidate,
  cfgSetSingleSlot,
  cfgAddMulti,
  cfgUpdateItemQty,
  cfgRemoveItem,
  addBuildToCart,
} from "../api/api.js";

// UI тексти — українською (без рос.)
const SLOT_UI = [
  { key: "CPU", label: "Процесор (CPU)", required: true, multi: false },
  { key: "MOTHERBOARD", label: "Материнська плата", required: true, multi: false },
  { key: "RAM", label: "Оперативна пам’ять (RAM)", required: true, multi: true },
  { key: "GPU", label: "Відеокарта (GPU)", required: true, multi: false },
  { key: "STORAGE", label: "Накопичувач (Storage)", required: true, multi: true },
  { key: "PSU", label: "Блок живлення (PSU)", required: true, multi: false },
  { key: "CASE", label: "Корпус (Case)", required: true, multi: false },
  { key: "COOLING", label: "Охолодження CPU", required: true, multi: false },
  { key: "CASE_FAN", label: "Вентилятори корпусу", required: false, multi: true },
];

// Тимчасова прив’язка “слот → категорія” (поки ти не переробив категорії).
// Можеш адаптувати під свої назви (UA/EN).
const CATEGORY_HINTS = {
  CPU: ["CPU", "Процесори", "Processor"],
  MOTHERBOARD: ["Motherboard", "Материнські плати", "Mainboard"],
  RAM: ["RAM", "Оперативна памʼять", "Memory"],
  GPU: ["GPU", "Відеокарти", "Graphics"],
  STORAGE: ["Storage", "Накопичувачі", "SSD", "HDD"],
  PSU: ["PSU", "Блоки живлення", "Power"],
  CASE: ["Case", "Корпуси"],
  COOLING: ["Cooling", "Кулери", "Охолодження"],
  CASE_FAN: ["Fans", "Вентилятори"],
};

function cls(...a) {
  return a.filter(Boolean).join(" ");
}

export default function Build() {
  const [products, setProducts] = useState([]);
  const [builds, setBuilds] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const [activeSlot, setActiveSlot] = useState("CPU");
  const [newName, setNewName] = useState("Prime7 конфігурація");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const activeBuild = useMemo(
    () => builds.find((b) => b.id === activeId) || null,
    [builds, activeId]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [p, b] = await Promise.all([getProducts(), cfgGetMyBuilds()]);
        setProducts(p);
        setBuilds(b);
        if (b?.length) setActiveId(b[0].id);
      } catch (e) {
        setErr(e?.message || "Помилка завантаження.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function refreshBuild(id) {
    const b = await cfgGetBuild(id);
    setBuilds((prev) => prev.map((x) => (x.id === id ? b : x)));
  }

  async function handleCreate() {
    const created = await cfgCreateBuild({ name: newName?.trim() || "Prime7 конфігурація" });
    setBuilds((prev) => [created, ...prev]);
    setActiveId(created.id);
  }

  const itemsBySlot = useMemo(() => {
    const map = {};
    for (const s of SLOT_UI) map[s.key] = [];
    for (const it of activeBuild?.items || []) {
      map[it.slotType] = map[it.slotType] || [];
      map[it.slotType].push(it);
    }
    return map;
  }, [activeBuild]);

  const slotCandidates = useMemo(() => {
    // фільтр товарів по category.name (тимчасово)
    const hints = CATEGORY_HINTS[activeSlot] || [];
    const list = products.filter((p) => {
      const name = (p.category?.name || "").toLowerCase();
      return hints.some((h) => name.includes(String(h).toLowerCase()));
    });

    // якщо категорії поки “непопали” — показуємо все, щоб не блокувати роботу
    return list.length ? list : products;
  }, [products, activeSlot]);

  async function chooseSingle(productId) {
    if (!activeId) return;
    await cfgSetSingleSlot(activeId, activeSlot, productId);
    await refreshBuild(activeId);
  }

  async function addMulti(productId, subType = null) {
    if (!activeId) return;
    await cfgAddMulti(activeId, activeSlot, productId, 1, subType);
    await refreshBuild(activeId);
  }

  async function updateQty(itemId, qty) {
    if (!activeId) return;
    await cfgUpdateItemQty(activeId, itemId, qty);
    await refreshBuild(activeId);
  }

  async function removeItem(itemId) {
    if (!activeId) return;
    await cfgRemoveItem(activeId, itemId);
    await refreshBuild(activeId);
  }

  async function handleValidate() {
    if (!activeId) return;
    const b = await cfgValidate(activeId);
    setBuilds((prev) => prev.map((x) => (x.id === activeId ? b : x)));
  }

  async function handleAddToCart() {
    if (!activeBuild?.ready) return;
    await addBuildToCart(activeBuild.id);
    alert("Збірку додано до кошика.");
  }

  if (loading) return <div className="pg">Завантаження…</div>;
  if (err) return <div className="pg">Помилка: {err}</div>;

  return (
    <div className="pg">
      <div className="hdr">
        <div>
          <h1 className="title">Prime7 (PC) — Конфігуратор</h1>
          <div className="sub">
            Збірка купується як <b>один об’єкт</b>. Периферія додається окремо у каталозі/кошику.
          </div>
        </div>

        <div className="hdrRight">
          <button className="btn" onClick={handleValidate}>
            Перевірити сумісність
          </button>
          <button className={cls("btn", "btnPrimary", !activeBuild?.ready && "btnDisabled")} onClick={handleAddToCart}>
            Додати збірку в кошик
          </button>
        </div>
      </div>

      <div className="layout">
        {/* LEFT: builds list */}
        <div className="glass">
          <div className="secTitle">Мої збірки</div>

          <div className="stack">
            {builds.map((b) => (
              <button
                key={b.id}
                className={cls("rowBtn", b.id === activeId && "rowBtnActive")}
                onClick={() => setActiveId(b.id)}
              >
                <div className="rowBtnTop">
                  <div className="rowBtnName">{b.name}</div>
                  <div className="chip">{Number(b.totalPrice || 0).toFixed(2)} ₴</div>
                </div>
                <div className="rowBtnSub">
                  {b.ready ? <span className="ok">Готово</span> : <span className="warn">Потрібні компоненти / є конфлікти</span>}
                </div>
              </button>
            ))}
          </div>

          <div className="divider" />

          <div className="secTitle">Створити нову</div>
          <input className="in" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Назва збірки" />
          <button className={cls("btn", "btnPrimary")} onClick={handleCreate}>
            Створити
          </button>
        </div>

        {/* CENTER: slots */}
        <div className="glass">
          <div className="secTitle">Слоти системного блоку</div>

          <div className="slots">
            {SLOT_UI.map((s) => {
              const selected = s.key === activeSlot;
              const filled = (itemsBySlot[s.key] || []).length > 0;
              return (
                <button
                  key={s.key}
                  className={cls("slotBtn", selected && "slotBtnActive")}
                  onClick={() => setActiveSlot(s.key)}
                >
                  <div className="slotTop">
                    <div className="slotLabel">{s.label}</div>
                    <div className={cls("badge", filled ? "badgeOk" : s.required ? "badgeNeed" : "badgeOpt")}>
                      {filled ? "Обрано" : s.required ? "Обов’язково" : "Опційно"}
                    </div>
                  </div>

                  <div className="slotItems">
                    {(itemsBySlot[s.key] || []).length === 0 ? (
                      <div className="muted">Порожньо</div>
                    ) : (
                      (itemsBySlot[s.key] || []).map((it) => (
                        <div key={it.id} className="mini">
                          <div className="miniName">{it.product?.name}</div>
                          <div className="miniRight">
                            {s.multi && (
                              <input
                                className="qty"
                                type="number"
                                min={1}
                                value={it.quantity}
                                onChange={(e) => updateQty(it.id, Number(e.target.value))}
                              />
                            )}
                            <button className="x" onClick={() => removeItem(it.id)} title="Видалити">
                              ×
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* issues */}
          {activeBuild && !activeBuild.ready && (activeBuild.issues || []).length > 0 && (
            <div className="issues">
              <div className="secTitle">Проблеми</div>
              <ul className="ul">
                {activeBuild.issues.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT: candidates */}
        <div className="glass">
          <div className="secTitle">Вибір компонентів</div>
          <div className="muted" style={{ marginBottom: 10 }}>
            Слот: <b>{SLOT_UI.find((s) => s.key === activeSlot)?.label}</b>
          </div>

          {activeSlot === "STORAGE" && (
            <div className="toolbar">
              <span className="muted">Підтип:</span>
              <button className="pill" onClick={() => setActiveSlot("STORAGE")}>NVMe / SATA / HDD (обираємо при додаванні)</button>
            </div>
          )}

          <div className="cards">
            {slotCandidates.map((p) => (
              <div key={p.id} className="card">
                <div className="cardTop">
                  <div>
                    <div className="cardTitle">{p.name}</div>
                    <div className="cardDesc">{p.description || "—"}</div>
                    <div className="cardMeta">
                      Категорія: <b>{p.category?.name || "—"}</b>
                    </div>
                  </div>
                  <div className="price">{Number(p.price).toFixed(2)} ₴</div>
                </div>

                <div className="actions">
                  {SLOT_UI.find((s) => s.key === activeSlot)?.multi ? (
                    <>
                      {activeSlot === "STORAGE" ? (
                        <>
                          <button className="btn btnPrimary" onClick={() => addMulti(p.id, "NVME")}>Додати як NVMe</button>
                          <button className="btn" onClick={() => addMulti(p.id, "SATA")}>Додати як SATA</button>
                          <button className="btn" onClick={() => addMulti(p.id, "HDD")}>Додати як HDD</button>
                        </>
                      ) : (
                        <button className="btn btnPrimary" onClick={() => addMulti(p.id)}>Додати</button>
                      )}
                    </>
                  ) : (
                    <button className="btn btnPrimary" onClick={() => chooseSingle(p.id)}>
                      Обрати для слоту
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="divider" />
          <div className="muted">
            Порада: після вибору CPU/MB/RAM натисни “Перевірити сумісність” — конфігуратор підсвітить конфлікти.
          </div>
        </div>
      </div>
    </div>
  );
}
