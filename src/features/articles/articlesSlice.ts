import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Post,
  Comment,
  fetchUserPosts,
  fetchCommentsByPostId,
} from "../../services/api";
import {
  selectUsers,
  selectCurrentUser,
  selectHeadlineByUserId,
  selectPlaceholderUserIds,
  type AuthState,
} from "../auth/authSlice";

export interface Article extends Post {
  author: string;
  timestamp: string;
  headline: string;
  comments: Comment[];
}

export interface ArticlesState {
  posts: Article[];
  filteredPosts: Article[];
  status: "idle" | "loading" | "failed";
  error: string | null;
  followingIds: number[];
  searchKeyword: string;
}

type WithArticlesState = {
  articles: ArticlesState;
  auth: AuthState;
} & Record<string, unknown>;

const initialState: ArticlesState = {
  posts: [],
  filteredPosts: [],
  status: "idle",
  error: null,
  followingIds: [],
  searchKeyword: "",
};

const enhancePosts = async (
  posts: Post[],
  author: string,
  headline: string
): Promise<Article[]> => {
  const enhanced = await Promise.all(
    posts.map(async (post, index) => {
      const comments = await fetchCommentsByPostId(post.id);
      return {
        ...post,
        author,
        headline,
        timestamp: new Date(Date.now() - index * 60 * 60 * 1000).toISOString(),
        comments,
      };
    })
  );
  return enhanced;
};

const mergeAndSort = (collections: Article[][]): Article[] => {
  return collections
    .flat()
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
};

export const initializeFeed = createAsyncThunk<
  { posts: Article[]; followingIds: number[] },
  void,
  { state: WithArticlesState }
>("articles/initializeFeed", async (_, { getState, rejectWithValue }) => {
  const state = getState();
  const currentUser = selectCurrentUser(state);
  if (!currentUser) {
    return rejectWithValue("User not logged in");
  }

  const users = selectUsers(state);
  const placeholderUserIds = selectPlaceholderUserIds(state);
  const placeholderUser = placeholderUserIds.includes(currentUser.id);

  const followingIds: number[] = [];
  if (placeholderUser) {
    const otherUsers = users.filter((user) => user.id !== currentUser.id);
    for (const candidate of otherUsers) {
      if (!followingIds.includes(candidate.id)) {
        followingIds.push(candidate.id);
      }
      if (followingIds.length === 3) {
        break;
      }
    }
  }

  const lookupHeadline = (userId: number) =>
    selectHeadlineByUserId(state, userId) ||
    users.find((user) => user.id === userId)?.company.catchPhrase ||
    "";

  const basePosts = await enhancePosts(
    await fetchUserPosts(currentUser.id),
    currentUser.username,
    lookupHeadline(currentUser.id)
  );

  const followerCollections: Article[][] = [];
  for (const followerId of followingIds) {
    const follower = users.find((user) => user.id === followerId);
    if (!follower) {
      continue;
    }
    const followerPosts = await fetchUserPosts(followerId);
    followerCollections.push(
      await enhancePosts(
        followerPosts,
        follower.username,
        lookupHeadline(followerId)
      )
    );
  }

  return {
    posts: mergeAndSort([basePosts, ...followerCollections]),
    followingIds,
  };
});

export const addFollowerByUsername = createAsyncThunk<
  { userId: number; posts: Article[] },
  string,
  { state: WithArticlesState }
>(
  "articles/addFollowerByUsername",
  async (username, { getState, rejectWithValue }) => {
    const trimmed = username.trim();
    if (!trimmed) {
      return rejectWithValue("Username required");
    }

    const state = getState();
    const users = selectUsers(state);
    const follower = users.find(
      (candidate) => candidate.username.toLowerCase() === trimmed.toLowerCase()
    );

    if (!follower) {
      return rejectWithValue("User not found");
    }

    if (state.articles.followingIds.includes(follower.id)) {
      return rejectWithValue("Already following user");
    }

    const posts = await fetchUserPosts(follower.id);
    const headline =
      selectHeadlineByUserId(state, follower.id) ||
      follower.company.catchPhrase ||
      "";

    return {
      userId: follower.id,
      posts: await enhancePosts(posts, follower.username, headline),
    };
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
          post.title.toLowerCase().includes(keyword) ||
          post.body.toLowerCase().includes(keyword)
        );
      });
    },
    addLocalArticle(
      state,
      action: PayloadAction<{
        body: string;
        author: string;
        userId: number;
        headline: string;
      }>
    ) {
      const { body, author, userId, headline } = action.payload;
      const article: Article = {
        userId,
        id: Date.now(),
        title: "New Post",
        body,
        author,
        headline,
        timestamp: new Date().toISOString(),
        comments: [],
      };
      state.posts = [article, ...state.posts];
      const keyword = state.searchKeyword.trim().toLowerCase();
      const matchesKeyword =
        !keyword ||
        article.body.toLowerCase().includes(keyword) ||
        article.author.toLowerCase().includes(keyword) ||
        article.title.toLowerCase().includes(keyword);
      state.filteredPosts = matchesKeyword
        ? [article, ...state.filteredPosts]
        : state.filteredPosts.slice();
    },
    removeFollower(state, action: PayloadAction<number>) {
      const userId = action.payload;
      state.followingIds = state.followingIds.filter((id) => id !== userId);
      state.posts = state.posts.filter((post) => post.userId !== userId);
      state.filteredPosts = state.filteredPosts.filter(
        (post) => post.userId !== userId
      );
    },
    resetArticles(state) {
      state.posts = [];
      state.filteredPosts = [];
      state.followingIds = [];
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
        state.posts = action.payload.posts;
        state.filteredPosts = action.payload.posts.slice();
        state.followingIds = action.payload.followingIds;
        state.error = null;
      })
      .addCase(initializeFeed.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Unable to load feed";
      })
      .addCase(addFollowerByUsername.fulfilled, (state, action) => {
        state.followingIds.push(action.payload.userId);
        state.error = null;
        state.posts = mergeAndSort([state.posts, action.payload.posts]);
        state.filteredPosts = state.searchKeyword
          ? state.posts.filter((post) => {
              const keyword = state.searchKeyword.trim().toLowerCase();
              return (
                post.author.toLowerCase().includes(keyword) ||
                post.title.toLowerCase().includes(keyword) ||
                post.body.toLowerCase().includes(keyword)
              );
            })
          : state.posts.slice();
      })
      .addCase(addFollowerByUsername.rejected, (state, action) => {
        state.error = (action.payload as string) ?? "Unable to add follower";
      })
      .addCase(addFollowerByUsername.pending, (state) => {
        state.error = null;
      });
  },
});

export const {
  filterByKeyword,
  addLocalArticle,
  removeFollower,
  resetArticles,
} = articlesSlice.actions;

export const selectAllArticles = (state: WithArticlesState) =>
  state.articles.posts;
export const selectFilteredArticles = (state: WithArticlesState) =>
  state.articles.filteredPosts;
export const selectFollowingIds = (state: WithArticlesState) =>
  state.articles.followingIds;
export const selectArticlesError = (state: WithArticlesState) =>
  state.articles.error;
export const selectArticlesStatus = (state: WithArticlesState) =>
  state.articles.status;

export default articlesSlice.reducer;
