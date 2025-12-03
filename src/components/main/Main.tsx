import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  logout,
  selectCurrentUser,
  selectHeadline,
  updateHeadline,
} from "../../features/auth/authSlice";
import {
  addFollower,
  addArticle,
  filterByKeyword,
  initializeFeed,
  removeFollower,
  resetArticles,
  selectAllArticles,
  selectArticlesError,
  selectArticlesStatus,
  selectFilteredArticles,
  selectFollowing,
  updateArticle,
} from "../../features/articles/articlesSlice";
import { Article } from "../../services/api";

const Main = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const headline = useAppSelector(selectHeadline);
  const allArticles = useAppSelector(selectAllArticles);
  const filteredArticles = useAppSelector(selectFilteredArticles);
  const following = useAppSelector(selectFollowing);
  const articlesStatus = useAppSelector(selectArticlesStatus);
  const articlesError = useAppSelector(selectArticlesError);

  const [searchQuery, setSearchQuery] = useState("");
  const [newPostText, setNewPostText] = useState("");
  const [newHeadline, setNewHeadline] = useState("");
  const [newFollowUsername, setNewFollowUsername] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

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
    dispatch(initializeFeed({ page: 1 }));
  }, [currentUser?.username, dispatch]);

  useEffect(() => {
    setNewHeadline(headline);
  }, [headline]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    dispatch(filterByKeyword(query));
  };

  const handlePostArticle = () => {
    if (!currentUser || !newPostText.trim()) {
      return;
    }
    const formData = new FormData();
    formData.append("text", newPostText.trim());
    if (selectedImage) {
      formData.append("image", selectedImage);
    }
    dispatch(addArticle(formData));
    setNewPostText("");
    setSelectedImage(null);
  };

  const handleCancelPost = () => {
    setNewPostText("");
    setSelectedImage(null);
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
    dispatch(addFollower(newFollowUsername.trim()));
    setNewFollowUsername("");
  };

  const handleUnfollow = (username: string) => {
    dispatch(removeFollower(username));
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetArticles());
    navigate("/");
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    dispatch(initializeFeed({ page: nextPage, append: true }));
  };

  const handleEdit = (article: Article) => {
    setEditingArticleId(article.pid);
    setEditText(article.text);
  };

  const handleSaveEdit = (pid: number) => {
    dispatch(updateArticle({ id: pid, text: editText }));
    setEditingArticleId(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditingArticleId(null);
    setEditText("");
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
              src={currentUser.avatar || "https://via.placeholder.com/50"}
              alt={currentUser.username}
              className="navbar-avatar"
            />
            <span>{currentUser.username}</span>
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
              src={currentUser.avatar || "https://via.placeholder.com/100"}
              alt={currentUser.username}
              className="profile-pic"
            />
            <div className="user-details">
              <h3>{currentUser.username}</h3>
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
            {selectedImage && (
              <div className="selected-image-preview">
                <p>Image selected: {selectedImage.name}</p>
                <button onClick={() => setSelectedImage(null)}>Remove</button>
              </div>
            )}
            <div className="new-post-actions">
              <button
                className="btn btn-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  const fileInput = document.createElement("input");
                  fileInput.type = "file";
                  fileInput.accept = "image/*";
                  fileInput.onchange = (ev) => {
                    const file = (ev.target as HTMLInputElement).files?.[0];
                    if (file) setSelectedImage(file);
                  };
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
            {articlesStatus === "loading" && page === 1 ? (
              <p className="no-articles">Loading articles...</p>
            ) : filteredArticles.length === 0 ? (
              <p className="no-articles">No articles found</p>
            ) : (
              <>
                {filteredArticles.map((article) => (
                  <div key={article.pid} className="article-card">
                    <div className="article-header">
                      <strong>{article.author}</strong>
                      <small>{new Date(article.date).toLocaleString()}</small>
                    </div>

                    {editingArticleId === article.pid ? (
                      <div className="edit-article-form">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="edit-textarea"
                        />
                        <div className="edit-actions">
                          <button
                            onClick={() => handleSaveEdit(article.pid)}
                            className="btn btn-primary btn-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="btn btn-secondary btn-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4>{article.text}</h4>
                        {article.image && (
                          <img
                            src={article.image}
                            alt="Post content"
                            className="article-image"
                            style={{ maxWidth: "100%", marginTop: "10px" }}
                          />
                        )}
                      </>
                    )}

                    <div className="article-actions">
                      {currentUser.username === article.author && (
                        <button
                          className="btn btn-sm"
                          onClick={() => handleEdit(article)}
                        >
                          ✏️ Edit
                        </button>
                      )}
                      <button className="btn btn-sm">💬 Comment</button>
                    </div>
                    <div className="article-comments">
                      {article.comments.length === 0 ? (
                        <p className="no-comments">No comments yet</p>
                      ) : (
                        <details>
                          <summary>
                            Comments ({article.comments.length})
                          </summary>
                          <ul>
                            {article.comments.map((comment) => (
                              <li key={comment.commentId}>
                                <strong>{comment.author}</strong>
                                <p>{comment.text}</p>
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
                <div
                  className="load-more-container"
                  style={{ textAlign: "center", marginTop: "20px" }}
                >
                  <button
                    onClick={handleLoadMore}
                    className="btn btn-secondary"
                  >
                    Load More
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="sidebar-column">
          <div className="sidebar-card">
            <h3>Following</h3>
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
              {following.map((username) => (
                <div key={username} className="follower-item">
                  <div className="follower-info">
                    <strong>{username}</strong>
                  </div>
                  <button
                    onClick={() => handleUnfollow(username)}
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
