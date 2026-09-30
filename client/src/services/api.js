const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  return res.json();
}

export async function fetchFarms() {
  const res = await fetch(`${API_BASE_URL}/api/farms`);
  if (!res.ok) throw new Error('Failed to fetch farms');
  return res.json();
}

export async function createFarm(data) {
  const res = await fetch(`${API_BASE_URL}/api/farms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create farm');
  return res.json();
}

export async function fetchFields() {
  const res = await fetch(`${API_BASE_URL}/api/fields`);
  if (!res.ok) throw new Error('Failed to fetch fields');
  return res.json();
}

export async function createField(data) {
  const res = await fetch(`${API_BASE_URL}/api/fields`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create field');
  return res.json();
}

export async function fetchCrops() {
  const res = await fetch(`${API_BASE_URL}/api/crops`);
  if (!res.ok) throw new Error('Failed to fetch crops');
  return res.json();
}

export async function createCrop(data) {
  const res = await fetch(`${API_BASE_URL}/api/crops`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create crop');
  return res.json();
}

export async function fetchAdvisories() {
  const res = await fetch(`${API_BASE_URL}/api/advisories`);
  if (!res.ok) throw new Error('Failed to fetch advisories');
  return res.json();
}

export async function diagnoseCrop(data) {
  const res = await fetch(`${API_BASE_URL}/api/advisory/diagnose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate advisory diagnosis');
  }
  return res.json();
}
