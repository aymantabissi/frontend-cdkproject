// src/services/api.js

export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const authHeader = () => {
  const stored = localStorage.getItem("nephroai_user");
  const token  = stored ? JSON.parse(stored)?.token : "";
  return {
    "Content-Type":  "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

// ─── Prediction ───────────────────────────────────────────────────────────────
export async function predictKidney(formData) {
  const response = await fetch(`${BASE_URL}/predict/xgboost`, {
    method:  "POST",
    headers: authHeader(),
    body:    JSON.stringify(formData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Server error");
  }
  return response.json();
}

// ─── History ──────────────────────────────────────────────────────────────────
export async function getMyHistory() {
  const response = await fetch(`${BASE_URL}/my-history`, {
    headers: authHeader(),
  });
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export async function getStats() {
  const response = await fetch(`${BASE_URL}/stats`);
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export async function getAdminUsers() {
  const response = await fetch(`${BASE_URL}/admin/users`, {
    headers: authHeader(),
  });
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

export async function updateUserRole(email, role) {
  const response = await fetch(`${BASE_URL}/admin/users/role`, {
    method:  "PUT",
    headers: authHeader(),
    body:    JSON.stringify({ email, role }),
  });
  if (!response.ok) throw new Error("Failed to update role");
  return response.json();
}

export async function deleteUser(email) {
  const response = await fetch(`${BASE_URL}/admin/users/${encodeURIComponent(email)}`, {
    method:  "DELETE",
    headers: authHeader(),
  });
  if (!response.ok) throw new Error("Failed to delete user");
  return response.json();
}

export async function getAdminStats() {
  const response = await fetch(`${BASE_URL}/admin/stats`, {
    headers: authHeader(),
  });
  if (!response.ok) throw new Error("Failed to fetch admin stats");
  return response.json();
}

export async function createUser(name, email, password, role) {
  const response = await fetch(`${BASE_URL}/admin/users/create`, {
    method:  "POST",
    headers: authHeader(),
    body:    JSON.stringify({ name, email, password, role }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to create user");
  }
  return response.json();
}

export async function createPatient(name, email, password) {
  const response = await fetch(`${BASE_URL}/doctor/patients/create`, {
    method:  "POST",
    headers: authHeader(),
    body:    JSON.stringify({ name, email, password, role: "patient" }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to create patient");
  }
  return response.json();
}