import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it } from "vitest";
import authReducer, {
  loadUsers,
  login,
  selectCurrentUser,
} from "../auth/authSlice";
import articlesReducer from "../articles/articlesSlice";
import { mockUsers } from "../../test-utils/mockData";

describe("Validate Profile actions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should fetch the logged in user's profile username (retrieve username from login state after logging in)", () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        articles: articlesReducer,
      },
    });

    store.dispatch(loadUsers.fulfilled(mockUsers, "", undefined));
    store.dispatch(login({ username: "Bret", password: "Kulas Light" }));

    const currentUser = selectCurrentUser(store.getState());
    expect(currentUser?.username).toEqual("Bret");
  });
});
