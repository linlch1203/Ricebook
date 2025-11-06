// JSON Placeholder API service
const API_BASE = "https://jsonplaceholder.typicode.com";

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
  };
  phone: string;
  company: {
    name: string;
    catchPhrase: string;
  };
}

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE}/users`);
  return response.json();
};

export const fetchPosts = async (): Promise<Post[]> => {
  const response = await fetch(`${API_BASE}/posts`);
  return response.json();
};

export const fetchUserPosts = async (userId: number): Promise<Post[]> => {
  const response = await fetch(`${API_BASE}/posts?userId=${userId}`);
  return response.json();
};

export const fetchUser = async (userId: number): Promise<User> => {
  const response = await fetch(`${API_BASE}/users/${userId}`);
  return response.json();
};

export const fetchCommentsByPostId = async (
  postId: number
): Promise<Comment[]> => {
  const response = await fetch(`${API_BASE}/comments?postId=${postId}`);
  return response.json();
};
