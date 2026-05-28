import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { ShoppingItem, ShoppingList, ShoppingStatus, ShoppingStore } from "./types";

const LISTS = "shopping_lists";
const ITEMS = "shopping_items";

export async function getOrCreateTeamList(teamId: string, userId: string): Promise<ShoppingList & { id: string }> {
  const q = query(collection(db, LISTS), where("teamId", "==", teamId));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { id: snap.docs[0].id, ...(snap.docs[0].data() as Omit<ShoppingList, "id">) };
  }

  const payload: Omit<ShoppingList, "id"> = {
    teamId,
    title: "Team Shopping",
    stores: [],
    currency: "USD",
    createdBy: userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const ref = await addDoc(collection(db, LISTS), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { ...payload, id: ref.id };
}

export async function listItems(listId: string): Promise<(ShoppingItem & { id: string })[]> {
  try {
    const q = query(collection(db, ITEMS), where("listId", "==", listId), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ShoppingItem, "id">) }));
  } catch {
    const q = query(collection(db, ITEMS), where("listId", "==", listId));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ShoppingItem, "id">) }));
    return items.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
  }
}

export async function addItem(listId: string, item: Omit<ShoppingItem, "id" | "listId">): Promise<string> {
  const payload = {
    ...item,
    listId,
    status: item.status ?? "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, ITEMS), payload);
  return ref.id;
}

export async function updateItem(itemId: string, patch: Partial<ShoppingItem>): Promise<void> {
  await updateDoc(doc(db, ITEMS, itemId), { ...patch, updatedAt: serverTimestamp() });
}

export async function removeItem(itemId: string): Promise<void> {
  await deleteDoc(doc(db, ITEMS, itemId));
}

export async function loadList(listId: string): Promise<(ShoppingList & { id: string }) | null> {
  const d = await getDoc(doc(db, LISTS, listId));
  if (!d.exists()) return null;
  return { id: d.id, ...(d.data() as Omit<ShoppingList, "id">) };
}

export async function updateList(listId: string, patch: Partial<ShoppingList>): Promise<void> {
  await updateDoc(doc(db, LISTS, listId), { ...patch, updatedAt: serverTimestamp() });
}

export async function upsertStore(listId: string, store: ShoppingStore): Promise<void> {
  const list = await loadList(listId);
  if (!list) throw new Error("List not found");
  const stores = [...(list.stores || [])];
  const idx = stores.findIndex((s) => s.id === store.id);
  if (idx >= 0) stores[idx] = { ...stores[idx], ...store };
  else stores.push(store);
  await updateList(listId, { stores });
}

export function cycleStatus(current: ShoppingStatus): ShoppingStatus {
  if (current === "pending") return "in_cart";
  if (current === "in_cart") return "purchased";
  return "pending";
}
