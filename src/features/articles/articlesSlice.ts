import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Article,
  fetchArticles as apiFetchArticles,
  addArticle as apiAddArticle,
  updateArticle as apiUpdateArticle,
  fetchFollowing as apiFetchFollowing,
  addFollowing as apiAddFollowing,
  removeFollowing as apiRemoveFollowing,
} from "../../services/api";

export interface ArticlesState {
  posts: Article[];
  filteredPosts: Article[];
  following: string[];
  status: "idle" | "loading" | "failed";
  error: string | null;
  searchKeyword: string;
}

const initialState: ArticlesState = {
  posts: [],
  filteredPosts: [],
  following: [],
  status: "idle",
  error: null,
  searchKeyword: "",
};

export const initializeFeed = createAsyncThunk(
  "articles/initializeFeed",
  async (
    {
      page = 1,
      limit = 10,
      append = false,
    }: { page?: number; limit?: number; append?: boolean } = {},
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await apiFetchArticles(page, limit);
      dispatch(fetchFollowing());
      return { articles: res.articles, append };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchFollowing = createAsyncThunk(
  "articles/fetchFollowing",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiFetchFollowing();
      return res.following;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addFollower = createAsyncThunk(
  "articles/addFollower",
  async (username: string, { rejectWithValue, dispatch }) => {
    try {
      const res = await apiAddFollowing(username);
      dispatch(initializeFeed({})); // Refresh feed to include new follower's posts
      return res.following;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeFollower = createAsyncThunk(
  "articles/removeFollower",
  async (username: string, { rejectWithValue, dispatch }) => {
    try {
      const res = await apiRemoveFollowing(username);
      dispatch(initializeFeed({})); // Refresh feed
      return res.following;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addArticle = createAsyncThunk(
  "articles/addArticle",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await apiAddArticle(formData);
      return res.articles;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateArticle = createAsyncThunk(
  "articles/updateArticle",
  async ({ id, text }: { id: number; text: string }, { rejectWithValue }) => {
    try {
      const res = await apiUpdateArticle(id, text);
      return res.articles;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const articlesSlice = createSlice({
  name: "articles",
  initialState,
  reducers: {
    filterByKeyword(state, action: PayloadAction<string>) {
      const keyword = action.payload.trim().toLowerCase();
      state.searchKeyword = action.payload;
      if (!keyword) {
        state.filteredPosts = state.posts.slice();
        return;
      }
      state.filteredPosts = state.posts.filter((post) => {
        return (
          post.author.toLowerCase().includes(keyword) ||
          post.text.toLowerCase().includes(keyword)
        );
      });
    },
    resetArticles(state) {
      state.posts = [];
      state.filteredPosts = [];
      state.following = [];
      state.searchKeyword = "";
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeFeed.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(initializeFeed.fulfilled, (state, action) => {
        state.status = "idle";
        if (action.payload.append) {
          const newPosts = action.payload.articles.filter(
            (p) => !state.posts.some((existing) => existing.pid === p.pid)
          );
          state.posts = [...state.posts, ...newPosts];
        } else {
          state.posts = action.payload.articles;
        }

        state.filteredPosts = state.searchKeyword
          ? state.posts.filter((post) => {
              const keyword = state.searchKeyword.trim().toLowerCase();
              return (
                post.author.toLowerCase().includes(keyword) ||
                post.text.toLowerCase().includes(keyword)
              );
            })
          : state.posts.slice();
        state.error = null;
      })
      .addCase(initializeFeed.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Unable to load feed";
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.following = action.payload;
      })
      .addCase(addFollower.fulfilled, (state, action) => {
        state.following = action.payload;
        state.error = null;
      })
      .addCase(addFollower.rejected, (state, action) => {
        state.error = (action.payload as string) ?? "Unable to add follower";
      })
      .addCase(removeFollower.fulfilled, (state, action) => {
        state.following = action.payload;
      })
      .addCase(addArticle.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.filteredPosts = state.searchKeyword
          ? state.posts.filter((post) => {
              const keyword = state.searchKeyword.trim().toLowerCase();
              return (
                post.author.toLowerCase().includes(keyword) ||
                post.text.toLowerCase().includes(keyword)
              );
            })
          : state.posts.slice();
      })
      .addCase(updateArticle.fulfilled, (state, action) => {
        const updatedArticles = action.payload;
        updatedArticles.forEach((updated) => {
          const index = state.posts.findIndex((p) => p.pid === updated.pid);
          if (index !== -1) {
            state.posts[index] = updated;
          }
        });
        state.filteredPosts = state.searchKeyword
          ? state.posts.filter((post) => {
              const keyword = state.searchKeyword.trim().toLowerCase();
              return (
                post.author.toLowerCase().includes(keyword) ||
                post.text.toLowerCase().includes(keyword)
              );
            })
          : state.posts.slice();
      });
  },
});

export const { filterByKeyword, resetArticles } = articlesSlice.actions;

export const selectAllArticles = (state: { articles: ArticlesState }) =>
  state.articles.posts;
export const selectFilteredArticles = (state: { articles: ArticlesState }) =>
  state.articles.filteredPosts;
export const selectFollowing = (state: { articles: ArticlesState }) =>
  state.articles.following;
export const selectArticlesError = (state: { articles: ArticlesState }) =>
  state.articles.error;
export const selectArticlesStatus = (state: { articles: ArticlesState }) =>
  state.articles.status;

export default articlesSlice.reducer;
