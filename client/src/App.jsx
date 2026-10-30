import { useState, useEffect } from "react";
import "./App.css";
import Dashboard from "./Dashboard";

// Backend API Base URL (uses environment variable on Vercel, falls back to localhost locally)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const categories = [
  { name: "Electronics", icon: "📷" },
  { name: "Vehicles", icon: "🛵" },
  { name: "Tools", icon: "🔧" },
  { name: "Furniture", icon: "🛋️" },
  { name: "Sports", icon: "🏏" },
  { name: "Instruments", icon: "🎸" },
  { name: "Camping", icon: "🏕️" },
];

// Helper to get logged-in user from localStorage
function getStoredUser() {
  try {
    const saved = localStorage.getItem("univo_user");
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

function Navbar({ setPage, currentUser, onLogout }) {
  return (
    <header className="navbar">
      <button
        className="logo"
        onClick={() => setPage("home")}
        type="button"
      >
        UNIVO<span>.</span>
      </button>

      <nav className="nav-links">
        <button onClick={() => setPage("home")}>Home</button>
        <button
          onClick={() => {
            setPage("home");
            setTimeout(() => {
              document
                .getElementById("categories")
                ?.scrollIntoView({ behavior: "smooth" });
            }, 0);
          }}
        >
          Categories
        </button>
        <button
          onClick={() => {
            setPage("home");
            setTimeout(() => {
              document
                .getElementById("popular")
                ?.scrollIntoView({ behavior: "smooth" });
            }, 0);
          }}
        >
          Explore Items
        </button>
        <button
          onClick={() => {
            setPage("home");
            setTimeout(() => {
              document
                .getElementById("how-it-works")
                ?.scrollIntoView({ behavior: "smooth" });
            }, 0);
          }}
        >
          How It Works
        </button>
      </nav>

      <div className="nav-actions">
        {currentUser ? (
          <>
            <button
              className="login"
              onClick={() => setPage("dashboard")}
              type="button"
            >
              Dashboard ({currentUser.name})
            </button>
            <button
              className="signup"
              onClick={onLogout}
              type="button"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <button
              className="login"
              onClick={() => setPage("login")}
              type="button"
            >
              Log In
            </button>
            <button
              className="signup"
              onClick={() => setPage("signup")}
              type="button"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
}

function ItemCard({ item, onSelect }) {
  return (
    <article className="item-card">
      <button
        className="item-image"
        onClick={() => onSelect(item)}
        aria-label={`View ${item.name}`}
        type="button"
      >
        <span className="available-badge">
          {item.isAvailable ? "Available" : "Rented"}
        </span>
        <span className="item-emoji">{item.image || item.icon || "📦"}</span>
      </button>

      <div className="item-content">
        <span className="item-category">{item.category}</span>
        <h3>{item.name}</h3>
        <p className="item-location">📍 {item.location}</p>

        <div className="item-card-bottom">
          <strong>
            ₹{item.pricePerDay || item.price} <small>/ day</small>
          </strong>
          <button
            className="view-item-btn"
            onClick={() => onSelect(item)}
            type="button"
            aria-label={`View details for ${item.name}`}
          >
            ↗
          </button>
        </div>
      </div>
    </article>
  );
}

function HomePage({ setPage, onSelectItem, currentUser, onLogout }) {
  const [itemsList, setItemsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Fetch real items from backend MongoDB
  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/items`);
        const data = await response.json();
        if (data.success && data.items) {
          setItemsList(data.items);
        }
      } catch (error) {
        console.error("Could not fetch items:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  // Filter items based on search and category
  const filteredItems = itemsList.filter((item) => {
    const itemName = item.name || "";
    const itemCat = item.category || "";
    const itemLoc = item.location || "";

    const matchesSearch =
      itemName.toLowerCase().includes(search.toLowerCase()) ||
      itemCat.toLowerCase().includes(search.toLowerCase()) ||
      itemLoc.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      !selectedCategory || itemCat === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const visibleItems = showAll ? filteredItems : filteredItems.slice(0, 4);

  function searchItems(event) {
    event.preventDefault();
    document.getElementById("popular")?.scrollIntoView({ behavior: "smooth" });
  }

  function chooseCategory(category) {
    setSelectedCategory(category);
    setShowAll(true);
    document.getElementById("popular")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <Navbar
        setPage={setPage}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <main>
        <section className="hero">
          <p className="hero-eyebrow">UNIVO — USE MORE. OWN LESS.</p>

          <h1>
            Find it Nearby.
            <br />
            <span>Rent it Easily.</span>
          </h1>

          <p className="hero-description">
            Why buy things you only need occasionally? Discover items around
            you and borrow from your community.
          </p>

          <form className="search-bar" onSubmit={searchItems}>
            <span className="search-icon">🔍</span>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setShowAll(true);
              }}
              placeholder="Search for camera, drill, bike, tent..."
              aria-label="Search items"
            />
            <button type="submit">Search</button>
          </form>

          <div className="quick-categories">
            {[
              { name: "Camera", icon: "📷", category: "Electronics" },
              { name: "Bike", icon: "🚲", category: "Vehicles" },
              { name: "Tools", icon: "🛠️", category: "Tools" },
              { name: "Camping", icon: "🏕️", category: "Camping" },
              { name: "Projector", icon: "📽️", category: "Electronics" },
              { name: "Instruments", icon: "🎸", category: "Instruments" },
            ].map((cat) => (
              <button
                key={cat.name}
                className="quick-category"
                type="button"
                onClick={() => {
                  setSearch(cat.name === "Camera" || cat.name === "Projector" ? cat.name : "");
                  chooseCategory(cat.category);
                }}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </section>

        <section className="advantages">
          <div className="section-heading centered">
            <p className="section-eyebrow">THE UNIVO ADVANTAGE</p>
            <h2>A smarter way to get what you need.</h2>
            <p>Good things are better when shared.</p>
          </div>

          <div className="advantage-grid">
            <article className="advantage-card">
              <div className="advantage-icon">💰</div>
              <h3>Save Money</h3>
              <p>
                Rent items when you need them instead of spending money on
                things you rarely use.
              </p>
            </article>

            <article className="advantage-card">
              <div className="advantage-icon">📍</div>
              <h3>Find Nearby</h3>
              <p>
                Discover useful items and rental options in your local
                community.
              </p>
            </article>

            <article className="advantage-card">
              <div className="advantage-icon">🌱</div>
              <h3>Share Sustainably</h3>
              <p>
                Make better use of existing resources by sharing items instead
                of buying new ones.
              </p>
            </article>
          </div>
        </section>

        <section className="categories-section" id="categories">
          <div className="section-heading">
            <h2>Browse by Category</h2>
            <p>Find exactly what you need</p>
          </div>

          <div className="category-grid">
            {categories.map((cat) => (
              <button
                key={cat.name}
                className={`category-card ${
                  selectedCategory === cat.name ? "selected" : ""
                }`}
                type="button"
                onClick={() => chooseCategory(cat.name)}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="popular-section" id="popular">
          <div className="section-heading">
            <p className="section-eyebrow">DISCOVER YOUR NEXT RENTAL</p>
            <h2>
              {selectedCategory || search ? "Explore Items" : "Popular Items"}
            </h2>
            <p>
              {selectedCategory
                ? `Items in ${selectedCategory}`
                : search
                ? `Search results for "${search}"`
                : "A few useful items to get you started"}
            </p>
          </div>

          {(selectedCategory || search) && (
            <button
              className="clear-filters"
              type="button"
              onClick={() => {
                setSelectedCategory("");
                setSearch("");
                setShowAll(false);
              }}
            >
              Clear filters ×
            </button>
          )}

          {loading ? (
            <p style={{ textAlign: "center", padding: "2rem" }}>
              Loading items from MongoDB...
            </p>
          ) : visibleItems.length > 0 ? (
            <div className="items-grid">
              {visibleItems.map((item) => (
                <ItemCard
                  key={item._id || item.id}
                  item={item}
                  onSelect={onSelectItem}
                />
              ))}
            </div>
          ) : (
            <div className="empty-results">
              <span>🔎</span>
              <h3>No items found</h3>
              <p>Try another search term or choose a different category.</p>
              <button
                className="signup"
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("");
                  setShowAll(false);
                }}
              >
                Show all items
              </button>
            </div>
          )}

          {filteredItems.length > 4 && (
            <div className="show-more-wrap">
              <button
                className="show-more-btn"
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
              >
                {showAll ? "Show Less ↑" : "View All Items →"}
              </button>
            </div>
          )}
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <p className="section-eyebrow">SIMPLE AND CONVENIENT</p>
            <h2>How UNIVO Works</h2>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <span>01</span>
              <h3>Find an Item</h3>
              <p>Discover items available in your area.</p>
            </article>

            <article className="step-card">
              <span>02</span>
              <h3>Request to Borrow</h3>
              <p>Choose your dates and request the item.</p>
            </article>

            <article className="step-card">
              <span>03</span>
              <h3>Use and Return</h3>
              <p>Enjoy your rental and return it responsibly.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer">
        <button
          className="logo"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          UNIVO<span>.</span>
        </button>
        <p>Use More. Own Less.</p>
      </footer>
    </>
  );
}

function ItemDetails({ item, onBack, setPage, currentUser, onLogout }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [borrowerPhone, setBorrowerPhone] = useState(currentUser?.phone || "");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pricePerDay = item.pricePerDay || item.price || 0;
  const securityDeposit = item.securityDeposit || 0;

  // Minimum date is today
  const today = new Date();
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  // Calculate rental days
  const days =
    startDate && endDate
      ? Math.round(
          (new Date(`${endDate}T00:00:00`) - new Date(`${startDate}T00:00:00`)) /
            86400000
        )
      : 0;

  // Calculations
  const rentalAmount = days > 0 ? days * pricePerDay : 0;
  const totalAmount = days > 0 ? rentalAmount + securityDeposit : 0;

  async function requestBooking(event) {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);

    // 1. Check if user is logged in
    const token = localStorage.getItem("univo_token");
    if (!token || !currentUser) {
      setMessage("Please log in to send a borrow request.");
      setTimeout(() => setPage("login"), 1500);
      return;
    }

    // 2. Validate dates
    if (!startDate || !endDate || days <= 0) {
      setMessage("Please select a valid rental start and end date (at least 1 day).");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/borrow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: item._id,
          startDate: startDate,
          endDate: endDate,
          numberOfDays: days,
          borrowerName: currentUser.name,
          borrowerPhone: borrowerPhone,
          additionalDetails: additionalDetails,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        setMessage(
          `Request sent successfully! Rental: ₹${rentalAmount} + Deposit: ₹${securityDeposit} = Total: ₹${totalAmount}. Waiting for owner approval.`
        );
      } else {
        setIsSuccess(false);
        setMessage(data.message || "Failed to submit request.");
      }
    } catch (err) {
      setIsSuccess(false);
      setMessage("Server connection error. Please make sure the backend is running.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar
        setPage={setPage}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <main className="details-page">
        <button className="back-btn" type="button" onClick={onBack}>
          ← Back to Items
        </button>

        <div className="details-layout">
          <div className="details-image">
            <span className="available-badge">
              {item.isAvailable ? "Available" : "Rented"}
            </span>
            <span>{item.image || item.icon || "📦"}</span>
          </div>

          <section className="details-info">
            <p className="section-eyebrow">{item.category}</p>
            <h1>{item.name}</h1>
            <p className="item-location">📍 {item.location}</p>

            <div className="details-price">
              ₹{pricePerDay} <span>/ day</span>
            </div>

            <div className="details-divider" />

            <h3>About this item</h3>
            <p className="details-description">{item.description}</p>

            <div className="details-meta">
              <div>
                <span>Condition</span>
                <strong>{item.condition || "Good"}</strong>
              </div>
              <div>
                <span>Listed by</span>
                <strong>{item.ownerName || "Community Member"}</strong>
              </div>
              <div>
                <span>Security Deposit</span>
                <strong>₹{securityDeposit}</strong>
              </div>
            </div>

            <form className="booking-form" onSubmit={requestBooking}>
              <h3>Request to Borrow</h3>

              <label htmlFor="start-date">Rental start date</label>
              <input
                id="start-date"
                type="date"
                min={minDate}
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setMessage("");
                }}
                required
              />

              <label htmlFor="end-date">Rental end date</label>
              <input
                id="end-date"
                type="date"
                min={startDate || minDate}
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setMessage("");
                }}
                required
              />

              <label htmlFor="borrower-phone">Your Contact Phone</label>
              <input
                id="borrower-phone"
                type="tel"
                placeholder="e.g. 9876543210"
                value={borrowerPhone}
                onChange={(e) => setBorrowerPhone(e.target.value)}
                required
              />

              <label htmlFor="borrower-note">Note to Owner (Optional)</label>
              <input
                id="borrower-note"
                type="text"
                placeholder="e.g. Need this for a college project presentation"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
              />

              <div className="booking-total" style={{ flexDirection: "column", gap: "0.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <span>Rental Charge ({days} days @ ₹{pricePerDay}/day):</span>
                  <strong>₹{rentalAmount}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <span>Security Deposit (refundable):</span>
                  <strong>₹{securityDeposit}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", borderTop: "1px solid #e0e0e0", paddingTop: "0.4rem" }}>
                  <span>Total Amount:</span>
                  <strong style={{ fontSize: "1.2rem", color: "#166534" }}>₹{totalAmount}</strong>
                </div>
              </div>

              <button
                className="signup booking-btn"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Sending Request..." : "Request to Borrow"}
              </button>

              {message && (
                <p
                  className={isSuccess ? "auth-success" : "auth-error"}
                  role="status"
                  style={{ marginTop: "1rem" }}
                >
                  {message}
                </p>
              )}
            </form>
          </section>
        </div>
      </main>
    </>
  );
}

function AuthPage({ mode, setPage, onAuthSuccess }) {
  const isSignup = mode === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (isSignup && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const endpoint = isSignup
        ? `${API_BASE_URL}/auth/register`
        : `${API_BASE_URL}/auth/login`;

      const requestBody = isSignup
        ? { name, email, password, phone, location }
        : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message || (isSignup ? "Registration successful!" : "Login successful!"));

        // Save token and user details to localStorage
        localStorage.setItem("univo_token", data.token);
        localStorage.setItem("univo_user", JSON.stringify(data.user));

        onAuthSuccess(data.user);

        // Redirect to dashboard after a short moment
        setTimeout(() => {
          setPage("dashboard");
        }, 800);
      } else {
        setError(data.message || "Authentication failed. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to the backend server. Make sure port 5000 is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar setPage={setPage} currentUser={null} />

      <main className="auth-page">
        <section className="auth-card">
          <button
            className="back-btn"
            type="button"
            onClick={() => setPage("home")}
          >
            ← Back to Home
          </button>

          <div className="auth-brand-icon">🌱</div>
          <p className="section-eyebrow">UNIVO — USE MORE. OWN LESS.</p>

          <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
          <p className="auth-subtitle">
            {isSignup
              ? "Join your community and start sharing."
              : "Log in to continue to your UNIVO account."}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && (
              <>
                <label htmlFor="auth-name">Full name</label>
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={80}
                  required
                />
              </>
            )}

            <label htmlFor="auth-email">Email address</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder="At least 6 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />

            {isSignup && (
              <>
                <label htmlFor="auth-confirm-password">
                  Confirm password
                </label>
                <input
                  id="auth-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  minLength={6}
                  required
                />

                <label htmlFor="auth-phone">Phone number (optional)</label>
                <input
                  id="auth-phone"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />

                <label htmlFor="auth-location">Location / City</label>
                <input
                  id="auth-location"
                  type="text"
                  placeholder="e.g. Vijayawada"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
              </>
            )}

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            {success && (
              <p className="auth-success" role="status">
                {success}
              </p>
            )}

            <button
              className="signup auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : isSignup
                ? "Create Account"
                : "Log In"}
            </button>
          </form>

          <p className="auth-switch">
            {isSignup
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setPage(isSignup ? "login" : "signup");
              }}
            >
              {isSignup ? "Log In" : "Sign Up"}
            </button>
          </p>
        </section>
      </main>
    </>
  );
}

function App() {
  const [page, setPage] = useState("login");
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentUser, setCurrentUser] = useState(getStoredUser());

  function goHome() {
    setPage("home");
    setSelectedItem(null);
  }

  function openItem(item) {
    setSelectedItem(item);
    setPage("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLogout() {
    localStorage.removeItem("univo_token");
    localStorage.removeItem("univo_user");
    setCurrentUser(null);
    setPage("home");
  }

  function handleAuthSuccess(user) {
    setCurrentUser(user);
  }

  if (page === "dashboard") {
    // If not logged in, show login page
    if (!currentUser) {
      return (
        <AuthPage
          mode="login"
          setPage={setPage}
          onAuthSuccess={handleAuthSuccess}
        />
      );
    }

    return (
      <Dashboard
        onBackHome={goHome}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  if (page === "details" && selectedItem) {
    return (
      <ItemDetails
        item={selectedItem}
        onBack={goHome}
        setPage={setPage}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  if (page === "login" || page === "signup") {
    return (
      <AuthPage
        mode={page}
        setPage={setPage}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <HomePage
      setPage={setPage}
      onSelectItem={openItem}
      currentUser={currentUser}
      onLogout={handleLogout}
    />
  );
}

export default App;
