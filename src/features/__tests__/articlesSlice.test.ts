import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import articlesReducer, {
  addFollowerByUsername,
  addLocalArticle,
  filterByKeyword,
  initializeFeed,
  removeFollower,
  selectAllArticles,
  selectFilteredArticles,
  selectArticlesError,
  selectFollowingIds,
  resetArticles,
} from "../articles/articlesSlice";
import authReducer, { loadUsers, login, register } from "../auth/authSlice";
import {
  mockCommentsByPostId,
  mockPostsByUserId,
  mockUsers,
} from "../../test-utils/mockData";
import * as api from "../../services/api";

const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      articles: articlesReducer,
    },
  });

describe("Validate Article actions", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(api, "fetchUserPosts").mockImplementation(
      async (userId: number) => {
        return mockPostsByUserId[userId] ?? [];
      }
    );
    vi.spyOn(api, "fetchCommentsByPostId").mockImplementation(
      async (postId: number) => mockCommentsByPostId[postId] ?? []
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch all articles for current logged in user (posts state is set)", async () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));
    store.dispatch(login({ username: "Bret", password: "Kulas Light" }));

    await store.dispatch(initializeFeed());

    const posts = selectAllArticles(store.getState());
    const expectedCount =
      mockPostsByUserId[1].length +
      mockPostsByUserId[2].length +
      mockPostsByUserId[3].length +
      mockPostsByUserId[4].length;
    expect(posts.length).toEqual(expectedCount);
  });

  it("should fetch subset of articles for current logged in user given search keyword (posts state is filtered)", async () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));
    store.dispatch(login({ username: "Bret", password: "Kulas Light" }));
    await store.dispatch(initializeFeed());

    store.dispatch(filterByKeyword("Bret"));

    const filtered = selectFilteredArticles(store.getState());
    expect(filtered.length).toEqual(mockPostsByUserId[1].length);
    filtered.forEach((article) => {
      expect(article.author).toEqual("Bret");
    });
  });

  it("should add articles when adding a follower (posts state is larger )", async () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));
    store.dispatch(login({ username: "Bret", password: "Kulas Light" }));
    await store.dispatch(initializeFeed());

    const before = selectAllArticles(store.getState()).length;

    await store.dispatch(addFollowerByUsername("Kamren"));

    const after = selectAllArticles(store.getState()).length;
    expect(after).toBeGreaterThan(before);
  });

  it("should remove articles when removing a follower (posts state is smaller)", async () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));
    store.dispatch(login({ username: "Bret", password: "Kulas Light" }));
    await store.dispatch(initializeFeed());

    const before = selectAllArticles(store.getState()).length;
    const followerPostCount = mockPostsByUserId[2].length;

    store.dispatch(removeFollower(2));

    const after = selectAllArticles(store.getState()).length;
    expect(after).toEqual(before - followerPostCount);
  });

  it("should show an error when adding a follower that does not exist", async () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));
    store.dispatch(login({ username: "Bret", password: "Kulas Light" }));
    await store.dispatch(initializeFeed());

    await store.dispatch(addFollowerByUsername("notreal"));

    const error = selectArticlesError(store.getState());
    expect(error).toEqual("User not found");
  });

  it("should add new articles with text-only to the top of the feed", async () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));
    store.dispatch(login({ username: "Bret", password: "Kulas Light" }));
    await store.dispatch(initializeFeed());

    store.dispatch(
      addLocalArticle({
        body: "Fresh thoughts",
        author: "Bret",
        userId: 1,
        headline: "Working hard",
      })
    );

    const posts = selectAllArticles(store.getState());
    expect(posts[0].body).toEqual("Fresh thoughts");
  });

  it("should attach comments to each article", async () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));
    store.dispatch(login({ username: "Bret", password: "Kulas Light" }));

    await store.dispatch(initializeFeed());

    const posts = selectAllArticles(store.getState());
    expect(posts[0].comments.length).toEqual(
      (mockCommentsByPostId[posts[0].id] ?? []).length
    );
  });

  it("should not pre-populate followers for newly registered users", async () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));
    store.dispatch(
      register({
        name: "Brand New",
        email: "brand@new.com",
        phone: "123-456-7890",
        zipcode: "12345",
        password: "secret1",
      })
    );

    await store.dispatch(initializeFeed());

    const following = selectFollowingIds(store.getState());
    expect(following.length).toEqual(0);
    expect(selectAllArticles(store.getState()).length).toEqual(0);
  });

  it("should clear keyword when resetting articles", () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));
    store.dispatch(login({ username: "Bret", password: "Kulas Light" }));

    store.dispatch(filterByKeyword("test"));
    store.dispatch(resetArticles());

    const state = store.getState();
    expect(selectFilteredArticles(state).length).toEqual(0);
    expect(selectFollowingIds(state).length).toEqual(0);
  });

  it("should preserve filtered posts when new article does not match search", async () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));
    store.dispatch(login({ username: "Bret", password: "Kulas Light" }));
    await store.dispatch(initializeFeed());

    store.dispatch(filterByKeyword("Antonette"));
    const filteredBefore = selectFilteredArticles(store.getState()).length;

    store.dispatch(
      addLocalArticle({
        body: "Does not match keyword",
        author: "Bret",
        userId: 1,
        headline: "Working hard",
      })
    );

    const filteredAfter = selectFilteredArticles(store.getState()).length;
    expect(filteredAfter).toEqual(filteredBefore);
  });

  it("should reject initializing feed when no user is logged in", async () => {
    const store = createStore();
    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));

    await store.dispatch(initializeFeed());

    expect(selectArticlesError(store.getState())).toEqual("User not logged in");
  });
});
