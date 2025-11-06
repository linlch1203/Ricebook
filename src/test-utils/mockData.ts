import type { Post, User, Comment } from "../services/api";

export const mockUsers: User[] = [
  {
    id: 1,
    name: "Leanne Graham",
    username: "Bret",
    email: "Sincere@april.biz",
    address: {
      street: "Kulas Light",
      suite: "Apt. 556",
      city: "Gwenborough",
      zipcode: "92998-3874",
    },
    phone: "1-770-736-8031 x56442",
    company: {
      name: "Romaguera-Crona",
      catchPhrase: "Multi-layered client-server neural-net",
    },
  },
  {
    id: 2,
    name: "Ervin Howell",
    username: "Antonette",
    email: "Shanna@melissa.tv",
    address: {
      street: "Victor Plains",
      suite: "Suite 879",
      city: "Wisokyburgh",
      zipcode: "90566-7771",
    },
    phone: "010-692-6593 x09125",
    company: {
      name: "Deckow-Crist",
      catchPhrase: "Proactive didactic contingency",
    },
  },
  {
    id: 3,
    name: "Clementine Bauch",
    username: "Samantha",
    email: "Nathan@yesenia.net",
    address: {
      street: "Douglas Extension",
      suite: "Suite 847",
      city: "McKenziehaven",
      zipcode: "59590-4157",
    },
    phone: "1-463-123-4447",
    company: {
      name: "Romaguera-Jacobson",
      catchPhrase: "Face to face bifurcated interface",
    },
  },
  {
    id: 4,
    name: "Patricia Lebsack",
    username: "Karianne",
    email: "Julianne.OConner@kory.org",
    address: {
      street: "Hoeger Mall",
      suite: "Apt. 692",
      city: "South Elvis",
      zipcode: "53919-4257",
    },
    phone: "493-170-9623 x156",
    company: {
      name: "Robel-Corkery",
      catchPhrase: "Multi-tiered zero tolerance productivity",
    },
  },
  {
    id: 5,
    name: "Chelsey Dietrich",
    username: "Kamren",
    email: "Lucio_Hettinger@annie.ca",
    address: {
      street: "Skiles Walks",
      suite: "Suite 351",
      city: "Roscoeview",
      zipcode: "33263",
    },
    phone: "(254)954-1289",
    company: {
      name: "Keebler LLC",
      catchPhrase: "User-centric fault-tolerant solution",
    },
  },
];

export const mockPostsByUserId: Record<number, Post[]> = {
  1: [
    {
      userId: 1,
      id: 1,
      title: "User 1 Post One",
      body: "Content from Bret for the first post",
    },
    {
      userId: 1,
      id: 2,
      title: "User 1 Post Two",
      body: "Another story from Bret",
    },
  ],
  2: [
    {
      userId: 2,
      id: 3,
      title: "Antonette shares",
      body: "Sharing a quick update",
    },
  ],
  3: [
    {
      userId: 3,
      id: 4,
      title: "Samantha insight",
      body: "Thoughts from Samantha",
    },
  ],
  4: [
    {
      userId: 4,
      id: 5,
      title: "Karianne news",
      body: "Breaking news from Karianne",
    },
  ],
  5: [
    {
      userId: 5,
      id: 6,
      title: "Kamren report",
      body: "Status update from Kamren",
    },
  ],
};

export const mockCommentsByPostId: Record<number, Comment[]> = {
  1: [
    {
      postId: 1,
      id: 101,
      name: "Commenter One",
      email: "commenter1@example.com",
      body: "Love this update!",
    },
  ],
  2: [
    {
      postId: 2,
      id: 102,
      name: "Commenter Two",
      email: "commenter2@example.com",
      body: "Interesting perspective",
    },
    {
      postId: 2,
      id: 103,
      name: "Commenter Three",
      email: "commenter3@example.com",
      body: "Thanks for sharing!",
    },
  ],
  3: [
    {
      postId: 3,
      id: 104,
      name: "Follower",
      email: "follower@example.com",
      body: "A nice read",
    },
  ],
  4: [],
  5: [
    {
      postId: 5,
      id: 105,
      name: "Fan",
      email: "fan@example.com",
      body: "Always insightful",
    },
  ],
  6: [
    {
      postId: 6,
      id: 106,
      name: "Supporter",
      email: "support@example.com",
      body: "Keep the updates coming",
    },
  ],
} as const;
