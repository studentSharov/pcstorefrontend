// src/api/api.js
const API = "http://localhost:8080/api";

// -------------------- auth storage --------------------
function authHeader() {
  const token = localStorage.getItem("basic");
  if (!token) return {};
  return { Authorization: `Basic ${token}` };
}

export function setBasicAuth(username, password) {
  const token = btoa(`${username}:${password}`);
  localStorage.setItem("basic", token);
}

export function clearBasicAuth() {
  localStorage.removeItem("basic");
}

// Aliases (С‡С‚РѕР±С‹ СЃС‚Р°СЂС‹Р№ РєРѕРґ РЅРµ РїР°РґР°Р»)
export function clearAuth() {
  clearBasicAuth();
}

export function getAuth() {
  const token = localStorage.getItem("basic");
  if (!token) return null;

  let username;
  try {
    username = atob(token).split(":")[0];
  } catch {
    username = undefined;
  }

  return username ? { token, username } : { token };
}

// -------------------- core request helper --------------------
async function req(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...authHeader(),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return null;
}

// -------------------- Catalog --------------------
export async function getCategories() {
  return req("/categories");
}

export async function getProducts() {
  return req("/products");
}

// -------------------- Auth API --------------------
export async function me() {
  return req("/auth/me");
}

// Aliases for pages that import legacy names
export async function getMe() {
  return me();
}

export function setAuth(username, password) {
  setBasicAuth(username, password);
}

export async function registerUser(body) {
  return req("/auth/register", { method: "POST", body: JSON.stringify(body) });
}

// -------------------- Builds (legacy endpoints) --------------------
export async function getMyBuilds() {
  // РџРѕРєР° Р±РµРєРµРЅРґ РІРѕР·РІСЂР°С‰Р°РµС‚ РІСЃРµ СЃР±РѕСЂРєРё РїСѓР±Р»РёС‡РЅРѕ
  return req("/builds");
}

export async function createBuild(body) {
  return req("/builds", { method: "POST", body: JSON.stringify(body) });
}

export async function getBuild(buildId) {
  return req(`/builds/${buildId}`);
}

export async function addProductToBuild(buildId, productId) {
  return req(`/builds/${buildId}/add/${productId}`, { method: "POST" });
}

export async function removeProductFromBuild(buildId, productId) {
  return req(`/builds/${buildId}/remove/${productId}`, { method: "DELETE" });
}

// -------------------- Cart (legacy endpoints) --------------------
export async function getCart() {
  return req("/cart");
}

export async function addProductToCart(productId) {
  return req(`/cart/items/product/${productId}`, { method: "POST" });
}

export async function addBuildToCart(buildId) {
  return req(`/cart/items/build/${buildId}`, { method: "POST" });
}

export async function updateCartItemQuantity(itemId, quantity) {
  return req(`/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(itemId) {
  return req(`/cart/items/${itemId}`, { method: "DELETE" });
}

export async function clearCart() {
  return req("/cart/clear", { method: "POST" });
}

export async function checkout() {
  return req("/cart/checkout", { method: "POST" });
}

// Aliases РґР»СЏ Cart.jsx (РµСЃР»Рё РѕРЅ РёРјРїРѕСЂС‚РёСЂСѓРµС‚ РґСЂСѓРіРёРµ РёРјРµРЅР°)
export async function getMyCart() {
  return getCart();
}
export async function cartUpdateQty(itemId, qty) {
  return updateCartItemQuantity(itemId, qty);
}
export async function cartRemoveItem(itemId) {
  return removeCartItem(itemId);
}
export async function cartClear() {
  return clearCart();
}
export async function cartCheckout() {
  return checkout();
}

// -------------------- Configurator compatibility layer --------------------
// Build.jsx Р¶РґС‘С‚ РёРјРµРЅРЅРѕ СЌС‚Рё РёРјРµРЅР°. РџРѕРєР° СЂРµР°Р»СЊРЅРѕРіРѕ РєРѕРЅС„РёРіСѓСЂР°С‚РѕСЂР° РЅР° Р±РµРєРµ РЅРµС‚,
// РјС‹ "РјР°РїРёРј" РЅР° СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёРµ СЌРЅРґРїРѕРёРЅС‚С‹ Builds (ManyToMany) Рё РґРµР»Р°РµРј Р·Р°РіР»СѓС€РєРё.

export async function cfgGetMyBuilds() {
  return getMyBuilds();
}

export async function cfgCreateBuild(name) {
  const safeName = (name && String(name).trim()) || "РњРѕСЏ Р·Р±С–СЂРєР°";
  return createBuild({ name: safeName });
}

export async function cfgGetBuild(buildId) {
  return getBuild(buildId);
}

// Р’Р°Р»РёРґР°С†РёСЏ (РїРѕРєР° Р·Р°РіР»СѓС€РєР°). РџРѕР·Р¶Рµ Р·Р°РјРµРЅРёРј РЅР° /api/configurator/validate
export async function cfgValidate(_payload) {
  return { ok: true, errors: [], warnings: [] };
}

// Single slot: РЅР° С‚РµРєСѓС‰РµРј Р±РµРєРµ РјРѕР¶РЅРѕ С‚РѕР»СЊРєРѕ "РїРѕ РєР°С‚РµРіРѕСЂРёРё РѕРґРёРЅ С‚РѕРІР°СЂ" (РєР°Рє Р±С‹Р»Рѕ РІ BuildController)
// РџРѕСЌС‚РѕРјСѓ cfgSetSingleSlot РїСЂРѕСЃС‚Рѕ РґРѕР±Р°РІР»СЏРµС‚ С‚РѕРІР°СЂ РІ build (Р° Р±РµРє СѓРґР°Р»РёС‚ С‚РѕРІР°СЂ С‚РѕР№ Р¶Рµ РєР°С‚РµРіРѕСЂРёРё)
export async function cfgSetSingleSlot(buildId, slotKey, productId) {
  // slotKey РїРѕРєР° РЅРµ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РЅР° Р±РµРєРµ, РЅРѕ РѕСЃС‚Р°РІР»СЏРµРј РґР»СЏ Р±СѓРґСѓС‰РµРіРѕ
  void slotKey;
  return addProductToBuild(buildId, productId);
}

// Multi slots (RAM/STORAGE/FANS):
// РќР° С‚РµРєСѓС‰РµРј Р±РµРєРµ (ManyToMany) РЅРµС‚ quantity Рё РЅРµС‚ РјСѓР»СЊС‚Рё-СЃР»РѕС‚РѕРІ.
// Р§С‚РѕР±С‹ С„СЂРѕРЅС‚ РќР• РїР°РґР°Р», РґРµР»Р°РµРј РјСЏРіРєСѓСЋ РґРµРіСЂР°РґР°С†РёСЋ:
// - cfgAddMulti: РїСЂРѕСЃС‚Рѕ РґРѕР±Р°РІР»СЏРµС‚ С‚РѕРІР°СЂ (С„Р°РєС‚РёС‡РµСЃРєРё РєР°Рє single)
// - qty/update/remove: Р»РёР±Рѕ no-op, Р»РёР±Рѕ СѓРґР°Р»РµРЅРёРµ С‚РѕРІР°СЂР°
export async function cfgAddMulti(buildId, slotKey, productId, qty = 1) {
  void slotKey;
  void qty; // РїРѕРєР° РЅРµ РїРѕРґРґРµСЂР¶РёРІР°РµС‚СЃСЏ
  return addProductToBuild(buildId, productId);
}

export async function cfgUpdateItemQty(_buildId, _itemIdOrProductId, _qty) {
  // РџРѕРєР° РЅРµ РїРѕРґРґРµСЂР¶РёРІР°РµС‚СЃСЏ РЅР° С‚РµРєСѓС‰РµРј Р±РµРєРµ: РІРµСЂРЅС‘Рј ok, С‡С‚РѕР±С‹ UI РЅРµ РїР°РґР°Р»
  return { ok: true, note: "Quantity is not supported yet on legacy build model." };
}

export async function cfgRemoveItem(buildId, slotKey, productId) {
  void slotKey;
  return removeProductFromBuild(buildId, productId);
}

// Р”РѕРї. Р°Р»РёР°СЃС‹ РЅР° СЃР»СѓС‡Р°Р№, РµСЃР»Рё Сѓ С‚РµР±СЏ РіРґРµ-С‚Рѕ РІСЃС‚СЂРµС‡Р°СЋС‚СЃСЏ РґСЂСѓРіРёРµ cfg-РёРјРµРЅР°
export const cfgGetBuilds = cfgGetMyBuilds;
export const cfgUpdateMultiQty = cfgUpdateItemQty;
export const cfgRemoveMulti = cfgRemoveItem;
