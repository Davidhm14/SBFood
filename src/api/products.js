const API_URL = '/api/products';

export const getAllProducts = async () => {
 const token = localStorage.getItem('sbfood_token');
  const response = await fetch(API_URL, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
};

export const createProduct = async (data) => {
  const token = localStorage.getItem('sbfood_token');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
};

export const updateProduct = async (id, data) => {
 const token = localStorage.getItem('sbfood_token');

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
};

export const deleteProduct = async (id) => {
const token = localStorage.getItem('sbfood_token');

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });
  if (!response.ok) throw new Error(`Error ${response.status}`);
};
