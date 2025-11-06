import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, fetchUsers } from "../../services/api";
import {
  loadStoredCurrentUserId,
  persistCurrentUserId,
  loadStoredCustomUsers,
  persistCustomUsers,
  loadStoredHeadlines,
  persistHeadlines,
} from "./storage";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  zipcode: string;
  password: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  zipcode?: string;
  password?: string;
}

export interface AuthState {
  users: User[];
  currentUserId: number | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loginError: string | null;
  registrationError: string | null;
  headlineByUserId: Record<number, string>;
  placeholderUserIds: number[];
  customUsers: User[];
}

const initialState: AuthState = {
  users: [],
  currentUserId: null,
  status: "idle",
  loginError: null,
  registrationError: null,
  headlineByUserId: {},
  placeholderUserIds: [],
  customUsers: [],
};

export const loadUsers = createAsyncThunk<User[]>(
  "auth/loadUsers",
  async () => {
    const users = await fetchUsers();
    return users;
  }
);

const normalizeUsername = (username: string) => username.trim().toLowerCase();

type WithAuthState = {
  auth: AuthState;
} & Record<string, unknown>;

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<LoginPayload>) {
      const { username, password } = action.payload;
      const normalized = normalizeUsername(username);
      const user = state.users.find(
        (candidate) => normalizeUsername(candidate.username) === normalized
      );

      if (!user) {
        state.loginError = "Invalid username or password";
        return;
      }

      const expectedPassword = user.address.street;
      if (password !== expectedPassword) {
        state.loginError = "Invalid username or password";
        return;
      }

      state.currentUserId = user.id;
      state.loginError = null;
      state.registrationError = null;
      if (!state.headlineByUserId[user.id]) {
        state.headlineByUserId[user.id] = user.company.catchPhrase;
      }
      persistCurrentUserId(user.id);
      persistHeadlines(state.headlineByUserId);
    },
    logout(state) {
      state.currentUserId = null;
      state.loginError = null;
      persistCurrentUserId(null);
    },
    register(state, action: PayloadAction<RegisterPayload>) {
      const { name, email, phone, zipcode, password } = action.payload;
      const generatedUsername = normalizeUsername(name.replace(/\s+/g, ""));

      const existingUser = state.users.find(
        (user) => normalizeUsername(user.username) === generatedUsername
      );

      if (existingUser) {
        state.registrationError = "Username already exists";
        return;
      }

      const nextId = state.users.length
        ? Math.max(...state.users.map((user) => user.id)) + 1
        : 1;

      const newUser: User = {
        id: nextId,
        name,
        username: generatedUsername,
        email,
        address: {
          street: password,
          suite: "",
          city: "",
          zipcode,
        },
        phone,
        company: {
          name: "",
          catchPhrase: "New here!",
        },
      };

      state.users.push(newUser);
      state.customUsers.push(newUser);
      state.currentUserId = newUser.id;
      state.registrationError = null;
      state.loginError = null;
      state.headlineByUserId[newUser.id] = newUser.company.catchPhrase;
      persistCustomUsers(state.customUsers);
      persistCurrentUserId(newUser.id);
      persistHeadlines(state.headlineByUserId);
    },
    updateHeadline(state, action: PayloadAction<string>) {
      const headline = action.payload.trim();
      if (!state.currentUserId || !headline) {
        return;
      }

      state.headlineByUserId[state.currentUserId] = headline;
      const user = state.users.find(
        (candidate) => candidate.id === state.currentUserId
      );
      if (user) {
        user.company = {
          ...user.company,
          catchPhrase: headline,
        };
        if (!state.placeholderUserIds.includes(user.id)) {
          state.customUsers = state.customUsers.map((candidate) =>
            candidate.id === user.id
              ? {
                  ...candidate,
                  company: { ...candidate.company, catchPhrase: headline },
                }
              : candidate
          );
          persistCustomUsers(state.customUsers);
        }
      }
      persistHeadlines(state.headlineByUserId);
    },
    updateProfile(state, action: PayloadAction<ProfileUpdatePayload>) {
      if (!state.currentUserId) {
        return;
      }

      const user = state.users.find(
        (candidate) => candidate.id === state.currentUserId
      );
      if (!user) {
        return;
      }

      const { name, email, phone, zipcode, password } = action.payload;
      if (name) {
        user.name = name;
      }
      if (email) {
        user.email = email;
      }
      if (phone) {
        user.phone = phone;
      }
      if (zipcode) {
        user.address = { ...user.address, zipcode };
      }
      if (password) {
        user.address = { ...user.address, street: password };
      }
      if (!state.placeholderUserIds.includes(user.id)) {
        state.customUsers = state.customUsers.map((candidate) =>
          candidate.id === user.id
            ? {
                ...candidate,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: { ...user.address },
                company: { ...user.company },
              }
            : candidate
        );
        persistCustomUsers(state.customUsers);
      }
    },
    resetAuthErrors(state) {
      state.loginError = null;
      state.registrationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = [...action.payload];
        state.headlineByUserId = action.payload.reduce<Record<number, string>>(
          (acc, user) => {
            acc[user.id] = user.company.catchPhrase;
            return acc;
          },
          {}
        );
        state.placeholderUserIds = action.payload.map((user) => user.id);

        const storedHeadlines = loadStoredHeadlines();
        state.headlineByUserId = {
          ...state.headlineByUserId,
          ...storedHeadlines,
        };

        const storedCustomUsers = loadStoredCustomUsers();
        state.customUsers = storedCustomUsers;
        storedCustomUsers.forEach((customUser) => {
          if (!state.users.find((user) => user.id === customUser.id)) {
            state.users.push(customUser);
          } else {
            state.users = state.users.map((user) =>
              user.id === customUser.id ? customUser : user
            );
          }
          state.headlineByUserId[customUser.id] =
            customUser.company.catchPhrase;
        });

        const storedCurrentUserId = loadStoredCurrentUserId();
        if (storedCurrentUserId) {
          const exists = state.users.some(
            (user) => user.id === storedCurrentUserId
          );
          if (exists) {
            state.currentUserId = storedCurrentUserId;
          }
        }
      })
      .addCase(loadUsers.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const {
  login,
  logout,
  register,
  updateHeadline,
  updateProfile,
  resetAuthErrors,
} = authSlice.actions;

export const selectUsers = (state: WithAuthState) => state.auth.users;
export const selectAuthStatus = (state: WithAuthState) => state.auth.status;
export const selectCurrentUserId = (state: WithAuthState) =>
  state.auth.currentUserId;
export const selectCurrentUser = (state: WithAuthState) =>
  state.auth.users.find((user) => user.id === state.auth.currentUserId) ?? null;
export const selectLoginError = (state: WithAuthState) => state.auth.loginError;
export const selectRegistrationError = (state: WithAuthState) =>
  state.auth.registrationError;
export const selectHeadline = (state: WithAuthState) => {
  const currentId = state.auth.currentUserId;
  if (!currentId) {
    return "";
  }
  return state.auth.headlineByUserId[currentId] ?? "";
};
export const selectHeadlineByUserId = (state: WithAuthState, userId: number) =>
  state.auth.headlineByUserId[userId] ?? "";
export const selectPlaceholderUserIds = (state: WithAuthState) =>
  state.auth.placeholderUserIds;

export default authSlice.reducer;
