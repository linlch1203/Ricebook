import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";
import { User, Post, fetchUserPosts } from "../../services/api";

interface MainProps {
  currentUser: User | null;
  users: User[];
  onLogout: () => void;
}

interface Article extends Post {
  author?: string;
  timestamp?: Date;
  image?: string;
}

const Main = ({ currentUser, users, onLogout }: MainProps) => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPostText, setNewPostText] = useState("");
  const [headline, setHeadline] = useState("");
  const [newHeadline, setNewHeadline] = useState("");
  const [following, setFollowing] = useState<User[]>([]);
  const [newFollowUsername, setNewFollowUsername] = useState("");

  // Random images for posts
  const randomImages = [
    "https://picsum.photos/400/300?random=1",
    "https://picsum.photos/400/300?random=2",
    "https://picsum.photos/400/300?random=3",
  ];

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
      return;
    }

    // Set initial headline
    setHeadline(currentUser.company.catchPhrase);
    setNewHeadline(currentUser.company.catchPhrase);

    // Load posts for current user
    loadPosts();

    // Set up following list (next 3 users)
    const followingList = [];
    for (let i = 1; i <= 3; i++) {
      const nextId = (currentUser.id % 10) + i;
      const followedUser = users.find((u) => u.id === nextId);
      if (followedUser) {
        followingList.push(followedUser);
      }
    }
    setFollowing(followingList);
  }, [currentUser, users, navigate]);

  const loadPosts = async () => {
    if (!currentUser) return;

    try {
      const posts = await fetchUserPosts(currentUser.id);

      // Add images to first 3 posts and enhance with metadata
      const enhancedPosts: Article[] = posts
        .slice(0, 10)
        .map((post, index) => ({
          ...post,
          author: currentUser.username,
          timestamp: new Date(Date.now() - index * 3600000), // 1 hour apart
          image: index < 3 ? randomImages[index] : undefined,
        }));

      setArticles(enhancedPosts);
      setFilteredArticles(enhancedPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredArticles(articles);
      return;
    }

    const filtered = articles.filter(
      (article) =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.body.toLowerCase().includes(query.toLowerCase()) ||
        article.author?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredArticles(filtered);
  };

  const handlePostArticle = () => {
    if (!newPostText.trim() || !currentUser) return;

    const newArticle: Article = {
      userId: currentUser.id,
      id: Date.now(),
      title: "New Post",
      body: newPostText,
      author: currentUser.username,
      timestamp: new Date(),
    };

    setArticles([newArticle, ...articles]);
    setFilteredArticles([newArticle, ...filteredArticles]);
    setNewPostText("");
  };

  const handleCancelPost = () => {
    setNewPostText("");
  };

  const handleUpdateHeadline = () => {
    if (newHeadline.trim()) {
      setHeadline(newHeadline);
    }
  };

  const handleAddFollower = () => {
    if (!newFollowUsername.trim()) return;

    // Check if already following
    if (
      following.some(
        (user) =>
          user.username.toLowerCase() === newFollowUsername.toLowerCase()
      )
    ) {
      alert("Already following this user");
      return;
    }

    // Find user in the list
    const userToFollow = users.find(
      (u) => u.username.toLowerCase() === newFollowUsername.toLowerCase()
    );

    if (userToFollow) {
      setFollowing([...following, userToFollow]);
    } else {
      // Create dummy user for non-existent usernames
      const dummyUser: User = {
        id: Date.now(),
        name: newFollowUsername,
        username: newFollowUsername,
        email: "",
        address: { street: "", suite: "", city: "", zipcode: "" },
        phone: "",
        company: { name: "", catchPhrase: "Hello there!" },
      };
      setFollowing([...following, dummyUser]);
    }

    setNewFollowUsername("");
  };

  const handleUnfollow = (userId: number) => {
    setFollowing(following.filter((user) => user.id !== userId));
  };

  const handleLogout = () => {
    onLogout();
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
            {filteredArticles.length === 0 ? (
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
                      <small>{article.timestamp?.toLocaleString()}</small>
                    </div>
                  </div>
                  <h4>{article.title}</h4>
                  {article.image && (
                    <img
                      src={article.image}
                      alt="Post"
                      className="article-image"
                    />
                  )}
                  <p>{article.body}</p>
                  <div className="article-actions">
                    <button className="btn btn-sm">💬 Comment</button>
                    <button className="btn btn-sm">✏️ Edit</button>
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

            <div className="following-list">
              {following.map((user) => (
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
