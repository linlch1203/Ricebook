import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it } from "vitest";
import {
  loadUsers,
  login,
  logout,
  selectCurrentUser,
  selectLoginError,
  register,
  selectRegistrationError,
  updateHeadline,
  selectHeadline,
  updateProfile,
  selectUsers,
  resetAuthErrors,
} from "../auth/authSlice";
import authReducer from "../auth/authSlice";
import articlesReducer from "../articles/articlesSlice";
import { mockUsers } from "../../test-utils/mockData";

describe("Validate Authentication", () => {
  const createStore = () =>
    configureStore({
      reducer: {
        auth: authReducer,
        articles: articlesReducer,
      },
    });

  beforeEach(() => {
    localStorage.clear();
  });

  it("should log in a previously registered user (not new users, login state should be set)", () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));

    store.dispatch(login({ username: "Bret", password: "Kulas Light" }));

    const currentUser = selectCurrentUser(store.getState());
    expect(currentUser).not.toBeNull();
    expect(currentUser?.username).toEqual("Bret");
  });

  it("should not log in an invalid user (error state should be set)", () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));

    store.dispatch(login({ username: "Bret", password: "WrongPassword" }));

    const state = store.getState();
    expect(selectCurrentUser(state)).toBeNull();
    expect(selectLoginError(state)).toEqual("Invalid username or password");
  });

  it("should log out a user (login state should be cleared)", () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));
    store.dispatch(login({ username: "Bret", password: "Kulas Light" }));

    store.dispatch(logout());

    const state = store.getState();
    expect(selectCurrentUser(state)).toBeNull();
    expect(selectLoginError(state)).toBeNull();
  });

  it("should register a unique user and set login state", () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));

    store.dispatch(
      register({
        name: "New User",
        email: "new@user.com",
        phone: "123-456-7890",
        zipcode: "12345",
        password: "secret1",
      })
    );

    const state = store.getState();
    const currentUser = selectCurrentUser(state);
    expect(currentUser?.username).toEqual("newuser");
    expect(localStorage.getItem("ricebook/currentUserId")).toEqual(
      String(currentUser?.id)
    );
  });

  it("should prevent registering a duplicate username", () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));

    store.dispatch(
      register({
        name: "Bret",
        email: "duplicate@user.com",
        phone: "123-456-7890",
        zipcode: "12345",
        password: "secret1",
      })
    );

    const state = store.getState();
    expect(selectRegistrationError(state)).toEqual("Username already exists");
    expect(selectCurrentUser(state)).toBeNull();
  });

  it("should update headline and persist it", () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));
    store.dispatch(login({ username: "Bret", password: "Kulas Light" }));

    store.dispatch(updateHeadline("Checking in"));

    const state = store.getState();
    expect(selectHeadline(state)).toEqual("Checking in");
    const storedHeadlines = JSON.parse(
      localStorage.getItem("ricebook/headlines") ?? "{}"
    );
    expect(storedHeadlines[state.auth.currentUserId!]).toEqual("Checking in");
  });

  it("should ignore headline updates when new headline is blank", () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));
    store.dispatch(login({ username: "Bret", password: "Kulas Light" }));

    const original = selectHeadline(store.getState());
    store.dispatch(updateHeadline("   "));

    expect(selectHeadline(store.getState())).toEqual(original);
  });

  it("should update profile details for a custom user", () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));
    store.dispatch(
      register({
        name: "Profile Person",
        email: "profile@user.com",
        phone: "123-456-7890",
        zipcode: "12345",
        password: "secret1",
      })
    );

    store.dispatch(
      updateProfile({
        email: "updated@user.com",
        phone: "321-654-0987",
        zipcode: "54321",
        password: "newsecret",
      })
    );

    const state = store.getState();
    const currentUser = selectCurrentUser(state);
    expect(currentUser?.email).toEqual("updated@user.com");
    expect(currentUser?.phone).toEqual("321-654-0987");
    expect(currentUser?.address.street).toEqual("newsecret");

    const storedCustomUsers = JSON.parse(
      localStorage.getItem("ricebook/customUsers") ?? "[]"
    );
    const storedUser = storedCustomUsers.find(
      (user: { username: string }) => user.username === "profileperson"
    );
    expect(storedUser).toBeDefined();
    expect(storedUser.email).toEqual("updated@user.com");
    expect(storedUser.address.street).toEqual("newsecret");
  });

  it("should keep the user logged in after reload when stored", () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));
    store.dispatch(login({ username: "Bret", password: "Kulas Light" }));

    const newStore = createStore();
    newStore.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));

    const state = newStore.getState();
    expect(selectCurrentUser(state)?.username).toEqual("Bret");
  });

  it("should include registered users when users are reloaded", () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));

    store.dispatch(
      register({
        name: "Reload User",
        email: "reload@user.com",
        phone: "123-456-7890",
        zipcode: "12345",
        password: "secret1",
      })
    );

    const newStore = createStore();
    newStore.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));

    const state = newStore.getState();
    const usernames = selectUsers(state).map((user) => user.username);
    expect(usernames).toContain("reloaduser");
  });

  it("should reset authentication errors", () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));
    store.dispatch(login({ username: "Bret", password: "Wrong" }));

    store.dispatch(resetAuthErrors());

    const state = store.getState();
    expect(selectLoginError(state)).toBeNull();
    expect(selectRegistrationError(state)).toBeNull();
  });

  it("should set loading and failed statuses for loadUsers lifecycle", () => {
    const store = createStore();

    store.dispatch(loadUsers.pending("req", undefined));
    expect(store.getState().auth.status).toEqual("loading");

    store.dispatch(loadUsers.rejected(new Error("boom"), "req"));
    expect(store.getState().auth.status).toEqual("failed");
  });

  it("should merge stored headlines and override placeholder users", () => {
    const customOverride = {
      ...mockUsers[1],
      name: "Antonette Updated",
    };
    localStorage.setItem(
      "ricebook/headlines",
      JSON.stringify({ 1: "Stored headline" })
    );
    localStorage.setItem(
      "ricebook/customUsers",
      JSON.stringify([customOverride])
    );
    localStorage.setItem("ricebook/currentUserId", "1");

    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));

    const state = store.getState();
    expect(selectHeadline(state)).toEqual("Stored headline");
    const updatedUser = selectUsers(state).find((user) => user.id === 2);
    expect(updatedUser?.name).toEqual("Antonette Updated");
    expect(selectCurrentUser(state)?.id).toEqual(1);
  });

  it("should skip profile updates when no user is logged in", () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));

    store.dispatch(updateProfile({ email: "ignored@example.com" }));

    expect(selectCurrentUser(store.getState())).toBeNull();
  });
});
