const API_BASE = import.meta.env.PROD
  ? "https://cl278-backend.herokuapp.com"
  : "http://localhost:3000";

export interface User {
  username: string;
  headline?: string;
  avatar?: string;
  email?: string;
  zipcode?: string;
  dob?: string;
  phone?: string;
}

export interface Article {
  pid: number;
  author: string;
  text: string;
  date: string;
  image?: string;
  comments: Comment[];
}

export interface Comment {
  commentId: number;
  author: string;
  text: string;
  date: string;
}

const getCredentials = () => ({ credentials: "include" as RequestCredentials });

export const login = async (
  username: string,
  password: string
): Promise<any> => {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    ...getCredentials(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }
  return response.json();
};

export const register = async (payload: any): Promise<any> => {
  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    ...getCredentials(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }
  return response.json();
};

export const logout = async (): Promise<any> => {
  const response = await fetch(`${API_BASE}/logout`, {
    method: "PUT",
    ...getCredentials(),
  });
  if (!response.ok) {
    throw new Error("Logout failed");
  }
  return response.json();
};

export const fetchArticles = async (
  page = 1,
  limit = 10
): Promise<{ articles: Article[] }> => {
  const response = await fetch(
    `${API_BASE}/articles?page=${page}&limit=${limit}`,
    {
      ...getCredentials(),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch articles");
  }
  return response.json();
};

export const addArticle = async (
  formData: FormData
): Promise<{ articles: Article[] }> => {
  const response = await fetch(`${API_BASE}/article`, {
    method: "POST",
    body: formData,
    ...getCredentials(),
  });
  if (!response.ok) {
    throw new Error("Failed to add article");
  }
  return response.json();
};

export const updateArticle = async (
  id: number,
  text: string
): Promise<{ articles: Article[] }> => {
  const response = await fetch(`${API_BASE}/articles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    ...getCredentials(),
  });
  if (!response.ok) {
    throw new Error("Failed to update article");
  }
  return response.json();
};

export const updateAvatar = async (
  formData: FormData
): Promise<{ username: string; avatar: string }> => {
  const response = await fetch(`${API_BASE}/avatar`, {
    method: "PUT",
    body: formData,
    ...getCredentials(),
  });
  if (!response.ok) {
    throw new Error("Failed to update avatar");
  }
  return response.json();
};

export const updateHeadline = async (
  headline: string
): Promise<{ username: string; headline: string }> => {
  const response = await fetch(`${API_BASE}/headline`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ headline }),
    ...getCredentials(),
  });
  if (!response.ok) {
    throw new Error("Failed to update headline");
  }
  return response.json();
};

export const fetchFollowing = async (
  username?: string
): Promise<{ username: string; following: string[] }> => {
  const userParam = username ? `/${username}` : "";
  const response = await fetch(
    `${API_BASE}/following${userParam}`,
    getCredentials()
  );
  if (!response.ok) {
    throw new Error("Failed to fetch following");
  }
  return response.json();
};

export const addFollowing = async (
  username: string
): Promise<{ username: string; following: string[] }> => {
  const response = await fetch(`${API_BASE}/following/${username}`, {
    method: "PUT",
    ...getCredentials(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add follower");
  }
  return response.json();
};

export const removeFollowing = async (
  username: string
): Promise<{ username: string; following: string[] }> => {
  const response = await fetch(`${API_BASE}/following/${username}`, {
    method: "DELETE",
    ...getCredentials(),
  });
  if (!response.ok) {
    throw new Error("Failed to remove follower");
  }
  return response.json();
};

export const updateEmail = async (
  email: string
): Promise<{ username: string; email: string }> => {
  const response = await fetch(`${API_BASE}/email`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    ...getCredentials(),
  });
  if (!response.ok) throw new Error("Failed to update email");
  return response.json();
};

export const updatePhone = async (
  phone: string
): Promise<{ username: string; phone: string }> => {
  const response = await fetch(`${API_BASE}/phone`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
    ...getCredentials(),
  });
  if (!response.ok) throw new Error("Failed to update phone");
  return response.json();
};

export const updateZipcode = async (
  zipcode: string
): Promise<{ username: string; zipcode: string }> => {
  const response = await fetch(`${API_BASE}/zipcode`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ zipcode }),
    ...getCredentials(),
  });
  if (!response.ok) throw new Error("Failed to update zipcode");
  return response.json();
};

export const updatePassword = async (
  password: string
): Promise<{ username: string; result: string }> => {
  const response = await fetch(`${API_BASE}/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
    ...getCredentials(),
  });
  if (!response.ok) throw new Error("Failed to update password");
  return response.json();
};

export const fetchProfile = async (username?: string): Promise<User> => {
  // We need to fetch multiple fields or have a getProfile endpoint.
  // The backend has individual endpoints.
  // Let's assume we fetch headline, avatar, email, zipcode, dob separately or we can add a getProfile endpoint to backend.
  // For now, let's just fetch headline and avatar as they are most important.
  // Actually, the backend doesn't have a single "get profile" endpoint.
  // I'll implement a helper to fetch all.

  const userParam = username ? `/${username}` : "";
  const [headlineRes, avatarRes, emailRes, zipcodeRes, dobRes] =
    await Promise.all([
      fetch(`${API_BASE}/headline${userParam}`, getCredentials()),
      fetch(`${API_BASE}/avatar${userParam}`, getCredentials()),
      fetch(`${API_BASE}/email${userParam}`, getCredentials()),
      fetch(`${API_BASE}/zipcode${userParam}`, getCredentials()),
      fetch(`${API_BASE}/dob`, getCredentials()), // dob is only for logged in user usually
    ]);

  const headline = await headlineRes.json();
  const avatar = await avatarRes.json();
  const email = await emailRes.json();
  const zipcode = await zipcodeRes.json();
  const dob = await dobRes.json();

  return {
    username: headline.username,
    headline: headline.headline,
    avatar: avatar.avatar,
    email: email.email,
    zipcode: zipcode.zipcode,
    dob: dob.dob,
  };
};
