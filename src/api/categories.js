const API_URL = '/api/categories';

export const getAllCategories = async () => {
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

export const createCategory = async (data) => {
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

export const updateCategory = async (id, data) => {
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

export const deleteCategory = async (id) => {
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
