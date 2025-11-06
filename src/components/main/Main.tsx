import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  logout,
  selectCurrentUser,
  selectHeadline,
  selectUsers,
  updateHeadline,
} from "../../features/auth/authSlice";
import {
  addFollowerByUsername,
  addLocalArticle,
  filterByKeyword,
  initializeFeed,
  removeFollower,
  resetArticles,
  selectAllArticles,
  selectArticlesError,
  selectArticlesStatus,
  selectFilteredArticles,
  selectFollowingIds,
} from "../../features/articles/articlesSlice";

const Main = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const headline = useAppSelector(selectHeadline);
  const users = useAppSelector(selectUsers);
  const allArticles = useAppSelector(selectAllArticles);
  const filteredArticles = useAppSelector(selectFilteredArticles);
  const followingIds = useAppSelector(selectFollowingIds);
  const articlesStatus = useAppSelector(selectArticlesStatus);
  const articlesError = useAppSelector(selectArticlesError);

  const [searchQuery, setSearchQuery] = useState("");
  const [newPostText, setNewPostText] = useState("");
  const [newHeadline, setNewHeadline] = useState("");
  const [newFollowUsername, setNewFollowUsername] = useState("");

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    dispatch(resetArticles());
    dispatch(initializeFeed());
  }, [currentUser?.id, dispatch]);

  useEffect(() => {
    setNewHeadline(headline);
  }, [headline]);

  const followingUsers = useMemo(
    () => users.filter((user) => followingIds.includes(user.id)),
    [users, followingIds]
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    dispatch(filterByKeyword(query));
  };

  const handlePostArticle = () => {
    if (!currentUser || !newPostText.trim()) {
      return;
    }
    dispatch(
      addLocalArticle({
        body: newPostText.trim(),
        author: currentUser.username,
        userId: currentUser.id,
        headline,
      })
    );
    setNewPostText("");
  };

  const handleCancelPost = () => {
    setNewPostText("");
  };

  const handleUpdateHeadline = () => {
    if (newHeadline.trim()) {
      dispatch(updateHeadline(newHeadline.trim()));
    }
  };

  const handleAddFollower = () => {
    if (!newFollowUsername.trim()) {
      return;
    }
    dispatch(addFollowerByUsername(newFollowUsername.trim()));
    setNewFollowUsername("");
  };

  const handleUnfollow = (userId: number) => {
    dispatch(removeFollower(userId));
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetArticles());
    navigate("/");
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-content">
          <h1>RiceBook</h1>
          <div className="navbar-user">
            <img
              src={`https://i.pravatar.cc/50?u=${currentUser.id}`}
              alt={currentUser.name}
              className="navbar-avatar"
            />
            <span>{currentUser.name}</span>
            <button
              onClick={() => navigate("/profile")}
              className="btn btn-secondary"
            >
              Profile
            </button>
            <button onClick={handleLogout} className="btn btn-logout">
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <div className="main-content">
        {/* Left Column: Feed */}
        <div className="feed-column">
          {/* User Info Section */}
          <div className="user-info-card">
            <img
              src={`https://i.pravatar.cc/100?u=${currentUser.id}`}
              alt={currentUser.name}
              className="profile-pic"
            />
            <div className="user-details">
              <h3>{currentUser.name}</h3>
              <p className="headline">{headline}</p>
              <div className="headline-update">
                <input
                  type="text"
                  value={newHeadline}
                  onChange={(e) => setNewHeadline(e.target.value)}
                  placeholder="Update your headline..."
                  className="headline-input"
                />
                <button onClick={handleUpdateHeadline} className="btn btn-sm">
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* New Post Section */}
          <div className="new-post-card">
            <h3>Create a New Post</h3>
            <textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="What's on your mind?"
              className="new-post-textarea"
              rows={4}
            />
            <div className="new-post-actions">
              <button
                className="btn btn-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  const fileInput = document.createElement("input");
                  fileInput.type = "file";
                  fileInput.accept = "image/*";
                  fileInput.click();
                }}
              >
                📷 Upload Image
              </button>
              <div>
                <button
                  onClick={handleCancelPost}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={handlePostArticle} className="btn btn-primary">
                  Post
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search articles by text or author..."
              className="search-input"
            />
          </div>

          {/* Articles Feed */}
          <div className="articles-feed">
            {articlesStatus === "loading" ? (
              <p className="no-articles">Loading articles...</p>
            ) : filteredArticles.length === 0 ? (
              <p className="no-articles">No articles found</p>
            ) : (
              filteredArticles.map((article) => (
                <div key={article.id} className="article-card">
                  <div className="article-header">
                    <img
                      src={`https://i.pravatar.cc/40?u=${article.userId}`}
                      alt={article.author}
                      className="article-avatar"
                    />
                    <div>
                      <strong>{article.author}</strong>
                      <small>
                        {new Date(article.timestamp).toLocaleString()}
                      </small>
                    </div>
                  </div>
                  <h4>{article.title}</h4>
                  <p>{article.body}</p>
                  <div className="article-actions">
                    <button className="btn btn-sm">💬 Comment</button>
                    <button className="btn btn-sm">✏️ Edit</button>
                  </div>
                  <div className="article-comments">
                    {article.comments.length === 0 ? (
                      <p className="no-comments">No comments yet</p>
                    ) : (
                      <details>
                        <summary>Comments ({article.comments.length})</summary>
                        <ul>
                          {article.comments.map((comment) => (
                            <li key={comment.id}>
                              <strong>{comment.name}</strong>
                              <p>{comment.body}</p>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="sidebar-column">
          <div className="sidebar-card">
            <h3>Following</h3>
            <p className="following-meta">
              Showing {filteredArticles.length} of {allArticles.length} articles
            </p>
            <div className="add-follower">
              <input
                type="text"
                value={newFollowUsername}
                onChange={(e) => setNewFollowUsername(e.target.value)}
                placeholder="Username to follow"
                className="follower-input"
              />
              <button
                onClick={handleAddFollower}
                className="btn btn-primary btn-sm"
              >
                Add
              </button>
            </div>
            {articlesError && (
              <p className="error-message follower-error">{articlesError}</p>
            )}

            <div className="following-list">
              {followingUsers.map((user) => (
                <div key={user.id} className="follower-item">
                  <img
                    src={`https://i.pravatar.cc/50?u=${user.id}`}
                    alt={user.name}
                    className="follower-avatar"
                  />
                  <div className="follower-info">
                    <strong>{user.name}</strong>
                    <small>{user.company.catchPhrase}</small>
                  </div>
                  <button
                    onClick={() => handleUnfollow(user.id)}
                    className="btn-unfollow"
                    title="Unfollow"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
