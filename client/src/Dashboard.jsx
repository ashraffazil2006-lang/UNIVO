import { useState, useEffect } from "react";
import "./Dashboard.css";

// Backend API Base URL (uses environment variable on Vercel, falls back to localhost locally)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const menuItems = [
  { id: "overview", icon: "▦", label: "Overview" },
  { id: "listings", icon: "▣", label: "My Listings" },
  { id: "requests", icon: "↔", label: "Rental Requests" },
  { id: "history", icon: "◷", label: "My Borrowings" },
  { id: "profile", icon: "♙", label: "My Profile" },
];

function StatusBadge({ status }) {
  const className = (status || "pending").toLowerCase().replace(/\s+/g, "-");
  return <span className={`dash-status ${className}`}>{status}</span>;
}

function Dashboard({ onBackHome, currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");

  // State for data from backend MongoDB
  const [listings, setListings] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myBorrowings, setMyBorrowings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Profile form state
  const [profile, setProfile] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    location: currentUser?.location || "",
  });
  const [profileMessage, setProfileMessage] = useState("");

  // Filter state for requests
  const [requestFilter, setRequestFilter] = useState("all");

  // Add Item form state
  const [showListingForm, setShowListingForm] = useState(false);
  const [newListing, setNewListing] = useState({
    name: "",
    category: "Electronics",
    description: "",
    condition: "Good",
    location: currentUser?.location || "Vijayawada",
    pricePerDay: "",
    securityDeposit: "0",
  });
  const [listingMessage, setListingMessage] = useState("");

  // Demo Payment Modal / Action State
  const [selectedBorrowingForPayment, setSelectedBorrowingForPayment] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState(null);

  const token = localStorage.getItem("univo_token");

  // Load all user data from backend
  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    if (!token) return;

    try {
      setLoading(true);

      // 1. Fetch My Listings
      const listingsRes = await fetch(`${API_BASE_URL}/items/my-listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const listingsData = await listingsRes.json();
      if (listingsData.success) {
        setListings(listingsData.items);
      }

      // 2. Fetch Incoming Requests
      const incomingRes = await fetch(`${API_BASE_URL}/borrow/incoming`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const incomingData = await incomingRes.json();
      if (incomingData.success) {
        setIncomingRequests(incomingData.requests);
      }

      // 3. Fetch My Borrowings
      const borrowingsRes = await fetch(`${API_BASE_URL}/borrow/my-borrowings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const borrowingsData = await borrowingsRes.json();
      if (borrowingsData.success) {
        setMyBorrowings(borrowingsData.requests);
      }

      // 4. Fetch Profile
      const profileRes = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      if (profileData.success && profileData.user) {
        setProfile({
          name: profileData.user.name || "",
          email: profileData.user.email || "",
          phone: profileData.user.phone || "",
          location: profileData.user.location || "",
        });
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  // Count metrics
  const pendingRequests = incomingRequests.filter(
    (req) => req.status === "Pending"
  ).length;

  const activeRentals = incomingRequests.filter(
    (req) => req.status === "Approved"
  ).length;

  // Add Item to MongoDB
  async function handleAddListing(event) {
    event.preventDefault();
    setListingMessage("");

    const price = Number(newListing.pricePerDay);
    const deposit = Number(newListing.securityDeposit) || 0;

    if (!newListing.name.trim() || !newListing.description.trim() || price <= 0) {
      setListingMessage("Please fill in item name, description, and a valid price.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newListing.name,
          category: newListing.category,
          description: newListing.description,
          condition: newListing.condition,
          location: newListing.location,
          pricePerDay: price,
          securityDeposit: deposit,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setListings([data.item, ...listings]);
        setNewListing({
          name: "",
          category: "Electronics",
          description: "",
          condition: "Good",
          location: profile.location || "Vijayawada",
          pricePerDay: "",
          securityDeposit: "0",
        });
        setShowListingForm(false);
        setActiveTab("listings");
      } else {
        setListingMessage(data.message || "Failed to add item.");
      }
    } catch (err) {
      setListingMessage("Error connecting to server.");
    }
  }

  // Delete Item from MongoDB
  async function handleRemoveListing(id) {
    if (!window.confirm("Are you sure you want to remove this item?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setListings(listings.filter((item) => item._id !== id));
      } else {
        alert(data.message || "Failed to remove item.");
      }
    } catch (err) {
      alert("Error deleting item from server.");
    }
  }

  // Accept or Reject Request
  async function handleUpdateRequest(id, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/borrow/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setIncomingRequests((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status } : r))
        );
      } else {
        alert(data.message || "Could not update request.");
      }
    } catch (err) {
      alert("Error updating request.");
    }
  }

  // Save Profile Changes
  async function handleSaveProfile(event) {
    event.preventDefault();
    setProfileMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setProfileMessage("Profile updated successfully!");
        localStorage.setItem("univo_user", JSON.stringify(data.user));
      } else {
        setProfileMessage(data.message || "Failed to update profile.");
      }
    } catch (err) {
      setProfileMessage("Server error updating profile.");
    }
  }

  // Process Demo Payment
  async function handleProcessPayment(borrowing) {
    try {
      setPaymentProcessing(true);
      const response = await fetch(`${API_BASE_URL}/payments/demo-pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId: borrowing._id,
          paymentMethod: "Demo UPI / Card",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPaymentSuccessReceipt(data.payment);
        setMyBorrowings((prev) =>
          prev.map((b) =>
            b._id === borrowing._id ? { ...b, paymentStatus: "Paid" } : b
          )
        );
      } else {
        alert(data.message || "Payment failed.");
      }
    } catch (err) {
      alert("Error communicating with payment service.");
    } finally {
      setPaymentProcessing(false);
    }
  }

  // Filter requests
  const visibleRequests = incomingRequests.filter((req) => {
    if (requestFilter === "all") return true;
    return (req.status || "").toLowerCase() === requestFilter;
  });

  // TAB 1: OVERVIEW
  function renderOverview() {
    return (
      <>
        <div className="dash-welcome">
          <div>
            <p className="dash-eyebrow">YOUR UNIVO SPACE</p>
            <h1>Welcome back, {profile.name || "Member"} 👋</h1>
            <p>Manage your listings, requests, and borrowing activity.</p>
          </div>
          <button
            className="dash-primary"
            onClick={() => {
              setActiveTab("listings");
              setShowListingForm(true);
            }}
          >
            + Add an item
          </button>
        </div>

        <div className="dash-stats">
          <div className="dash-stat">
            <span className="dash-stat-icon">📦</span>
            <p>My Listings</p>
            <strong>{listings.length}</strong>
            <small>Items stored in MongoDB</small>
          </div>

          <div className="dash-stat">
            <span className="dash-stat-icon">🔔</span>
            <p>Pending Requests</p>
            <strong>{pendingRequests}</strong>
            <small>Waiting for your approval</small>
          </div>

          <div className="dash-stat">
            <span className="dash-stat-icon">📅</span>
            <p>Active Rentals</p>
            <strong>{activeRentals}</strong>
            <small>Approved bookings</small>
          </div>

          <div className="dash-stat">
            <span className="dash-stat-icon">🌱</span>
            <p>Community</p>
            <strong>Sharing</strong>
            <small>Use more. Own less.</small>
          </div>
        </div>

        <section className="dash-panel">
          <div className="dash-panel-heading">
            <div>
              <h2>Recent Rental Requests</h2>
              <p>People who want to borrow your items.</p>
            </div>
            <button
              className="dash-text-btn"
              onClick={() => setActiveTab("requests")}
            >
              View all →
            </button>
          </div>

          {incomingRequests.length === 0 ? (
            <p style={{ color: "#666", padding: "1rem" }}>
              No incoming requests yet.
            </p>
          ) : (
            incomingRequests.slice(0, 3).map((req) => (
              <div className="dash-request-row" key={req._id}>
                <div className="dash-item-icon">📦</div>
                <div className="dash-row-info">
                  <strong>{req.itemName}</strong>
                  <span>
                    Requested by {req.borrowerName} ({req.borrowerPhone || "No phone"}) · {req.startDate} to {req.endDate} ({req.numberOfDays} days)
                  </span>
                  <b>Total: ₹{req.totalAmount} (Rental: ₹{req.rentalAmount} + Deposit: ₹{req.securityDeposit})</b>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))
          )}
        </section>

        <section className="dash-panel">
          <div className="dash-panel-heading">
            <div>
              <h2>Your Listed Items</h2>
              <p>Items you are currently sharing.</p>
            </div>
            <button
              className="dash-text-btn"
              onClick={() => setActiveTab("listings")}
            >
              Manage listings →
            </button>
          </div>

          {listings.length === 0 ? (
            <p style={{ color: "#666", padding: "1rem" }}>
              You haven't listed any items yet. Click "+ Add an item" above!
            </p>
          ) : (
            <div className="dash-mini-grid">
              {listings.slice(0, 3).map((item) => (
                <div className="dash-mini-card" key={item._id}>
                  <div className="dash-mini-image">{item.image || "📦"}</div>
                  <div className="dash-mini-body">
                    <strong>{item.name}</strong>
                    <span>{item.category}</span>
                    <b>₹{item.pricePerDay} / day</b>
                    <StatusBadge status={item.isAvailable ? "Available" : "Rented"} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </>
    );
  }

  // TAB 2: MY LISTINGS (Add and Remove Items)
  function renderListings() {
    return (
      <>
        <div className="dash-welcome">
          <div>
            <p className="dash-eyebrow">YOUR ITEMS IN MONGODB</p>
            <h1>My Listings</h1>
            <p>Manage the items you make available to your community.</p>
          </div>
          <button
            className="dash-primary"
            onClick={() => setShowListingForm((prev) => !prev)}
          >
            {showListingForm ? "Cancel" : "+ Add an item"}
          </button>
        </div>

        {showListingForm && (
          <form className="dash-panel dash-form" onSubmit={handleAddListing}>
            <h2>Add an item to UNIVO</h2>
            <p>This will save the item directly to MongoDB Atlas.</p>

            <label htmlFor="listing-name">Item Name</label>
            <input
              id="listing-name"
              value={newListing.name}
              onChange={(e) =>
                setNewListing({ ...newListing, name: e.target.value })
              }
              placeholder="e.g. Sony Alpha DSLR Camera"
              required
            />

            <label htmlFor="listing-category">Category</label>
            <select
              id="listing-category"
              value={newListing.category}
              onChange={(e) =>
                setNewListing({ ...newListing, category: e.target.value })
              }
            >
              {[
                "Electronics",
                "Vehicles",
                "Tools",
                "Furniture",
                "Sports",
                "Instruments",
                "Camping",
              ].map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>

            <label htmlFor="listing-description">Description</label>
            <textarea
              id="listing-description"
              rows="3"
              style={{
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontFamily: "inherit",
              }}
              value={newListing.description}
              onChange={(e) =>
                setNewListing({ ...newListing, description: e.target.value })
              }
              placeholder="Describe the item, features, and condition..."
              required
            />

            <label htmlFor="listing-condition">Condition</label>
            <select
              id="listing-condition"
              value={newListing.condition}
              onChange={(e) =>
                setNewListing({ ...newListing, condition: e.target.value })
              }
            >
              <option>Excellent</option>
              <option>Very Good</option>
              <option>Good</option>
              <option>Fair</option>
            </select>

            <label htmlFor="listing-location">Location / City</label>
            <input
              id="listing-location"
              value={newListing.location}
              onChange={(e) =>
                setNewListing({ ...newListing, location: e.target.value })
              }
              placeholder="e.g. Vijayawada"
              required
            />

            <label htmlFor="listing-price">Price per day (₹)</label>
            <input
              id="listing-price"
              type="number"
              min="1"
              value={newListing.pricePerDay}
              onChange={(e) =>
                setNewListing({ ...newListing, pricePerDay: e.target.value })
              }
              placeholder="e.g. 500"
              required
            />

            <label htmlFor="listing-deposit">Security Deposit (₹)</label>
            <input
              id="listing-deposit"
              type="number"
              min="0"
              value={newListing.securityDeposit}
              onChange={(e) =>
                setNewListing({ ...newListing, securityDeposit: e.target.value })
              }
              placeholder="e.g. 1500 (Refundable)"
            />

            {listingMessage && (
              <p className="auth-error" style={{ margin: "0.5rem 0" }}>
                {listingMessage}
              </p>
            )}

            <button className="dash-primary" type="submit">
              Save Item to MongoDB
            </button>
          </form>
        )}

        {listings.length === 0 ? (
          <div className="dash-empty">
            <span>📦</span>
            <h3>No listings yet</h3>
            <p>Add an item to start sharing with your community.</p>
          </div>
        ) : (
          <div className="dash-listing-grid">
            {listings.map((item) => (
              <article className="dash-listing-card" key={item._id}>
                <div className="dash-listing-image">{item.image || "📦"}</div>
                <div className="dash-listing-content">
                  <StatusBadge status={item.isAvailable ? "Available" : "Rented"} />
                  <p>{item.category} · {item.condition}</p>
                  <h3>{item.name}</h3>
                  <strong>₹{item.pricePerDay} / day</strong>
                  <small style={{ color: "#666" }}>
                    Deposit: ₹{item.securityDeposit || 0}
                  </small>
                  <button
                    className="dash-outline-btn"
                    onClick={() => handleRemoveListing(item._id)}
                  >
                    Delete item
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </>
    );
  }

  // TAB 3: INCOMING RENTAL REQUESTS (Accept or Reject)
  function renderRequests() {
    return (
      <>
        <div className="dash-welcome">
          <div>
            <p className="dash-eyebrow">BOOKING MANAGEMENT</p>
            <h1>Rental Requests</h1>
            <p>Review and approve requests from neighbors who want your items.</p>
          </div>
        </div>

        <div className="dash-filter-row">
          {[
            { value: "all", label: "All Requests" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ].map((filter) => (
            <button
              key={filter.value}
              className={`dash-filter ${
                requestFilter === filter.value ? "selected" : ""
              }`}
              onClick={() => setRequestFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <section className="dash-panel">
          {visibleRequests.length === 0 ? (
            <div className="dash-empty">
              <span>📭</span>
              <h3>No requests found</h3>
              <p>There are no incoming requests matching this filter.</p>
            </div>
          ) : (
            visibleRequests.map((req) => (
              <div className="dash-request-row" key={req._id}>
                <div className="dash-item-icon">{req.itemImage || "📦"}</div>
                <div className="dash-row-info">
                  <strong>{req.itemName}</strong>
                  <span>
                    Borrower: <b>{req.borrowerName}</b> (Phone: {req.borrowerPhone || "Not provided"})
                  </span>
                  <span>
                    Dates: {req.startDate} to {req.endDate} ({req.numberOfDays} days)
                  </span>
                  {req.additionalDetails && (
                    <span style={{ fontStyle: "italic", color: "#555" }}>
                      Note: "{req.additionalDetails}"
                    </span>
                  )}
                  <b>
                    Rental: ₹{req.rentalAmount} + Deposit: ₹{req.securityDeposit} = Total: ₹{req.totalAmount}
                  </b>
                  <span style={{ fontSize: "0.85rem", color: req.paymentStatus === "Paid" ? "#15803d" : "#b45309" }}>
                    Payment Status: <b>{req.paymentStatus}</b>
                  </span>
                </div>

                <div className="dash-request-actions">
                  <StatusBadge status={req.status} />

                  {req.status === "Pending" && (
                    <div className="dash-action-buttons">
                      <button
                        className="dash-approve"
                        onClick={() => handleUpdateRequest(req._id, "Approved")}
                      >
                        Accept
                      </button>
                      <button
                        className="dash-reject"
                        onClick={() => handleUpdateRequest(req._id, "Rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      </>
    );
  }

  // TAB 4: MY BORROWINGS & DEMO PAYMENT
  function renderHistory() {
    return (
      <>
        <div className="dash-welcome">
          <div>
            <p className="dash-eyebrow">YOUR RENTALS & PAYMENTS</p>
            <h1>My Borrowings</h1>
            <p>Track the items you requested to borrow and complete demo payments.</p>
          </div>
        </div>

        {/* Demo Payment Confirmation Box */}
        {selectedBorrowingForPayment && (
          <div
            className="dash-panel"
            style={{
              backgroundColor: "#f0fdf4",
              borderColor: "#86efac",
              marginBottom: "1.5rem",
            }}
          >
            <h2>💳 Demo Payment Gateway</h2>
            <p>
              Simulating payment for: <b>{selectedBorrowingForPayment.itemName}</b>
            </p>

            <div style={{ margin: "1rem 0", lineHeight: "1.8" }}>
              <div>Rental Charges: <b>₹{selectedBorrowingForPayment.rentalAmount}</b></div>
              <div>Security Deposit (Refundable): <b>₹{selectedBorrowingForPayment.securityDeposit}</b></div>
              <div style={{ fontSize: "1.2rem", color: "#166534", borderTop: "1px solid #bbf7d0", paddingTop: "0.5rem" }}>
                Total Payable Amount: <b>₹{selectedBorrowingForPayment.totalAmount}</b>
              </div>
              <small style={{ color: "#666" }}>
                (This is a safe demonstration payment. No real credit card or bank details are needed.)
              </small>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                className="dash-primary"
                onClick={() => handleProcessPayment(selectedBorrowingForPayment)}
                disabled={paymentProcessing}
              >
                {paymentProcessing ? "Processing..." : "Confirm & Complete Payment"}
              </button>
              <button
                className="dash-outline-btn"
                onClick={() => {
                  setSelectedBorrowingForPayment(null);
                  setPaymentSuccessReceipt(null);
                }}
              >
                Cancel
              </button>
            </div>

            {paymentSuccessReceipt && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "#dcfce7",
                  borderRadius: "8px",
                  color: "#166534",
                }}
              >
                <b>✅ Payment Successful!</b>
                <div>Transaction ID: <code>{paymentSuccessReceipt.transactionId}</code></div>
                <div>Status: Completed</div>
              </div>
            )}
          </div>
        )}

        <section className="dash-panel">
          {myBorrowings.length === 0 ? (
            <div className="dash-empty">
              <span>🚴</span>
              <h3>No borrowings yet</h3>
              <p>Explore items on the Home page and send your first borrow request!</p>
            </div>
          ) : (
            myBorrowings.map((borrowing) => (
              <div className="dash-request-row" key={borrowing._id}>
                <div className="dash-item-icon">{borrowing.itemImage || "📦"}</div>
                <div className="dash-row-info">
                  <strong>{borrowing.itemName}</strong>
                  <span>
                    Dates: {borrowing.startDate} to {borrowing.endDate} ({borrowing.numberOfDays} days)
                  </span>
                  <b>
                    Total: ₹{borrowing.totalAmount} (Rental: ₹{borrowing.rentalAmount} + Deposit: ₹{borrowing.securityDeposit})
                  </b>
                  <span>
                    Payment: <b style={{ color: borrowing.paymentStatus === "Paid" ? "#16a34a" : "#ca8a04" }}>{borrowing.paymentStatus}</b>
                  </span>
                </div>

                <div className="dash-request-actions" style={{ flexDirection: "column", gap: "0.5rem" }}>
                  <StatusBadge status={borrowing.status} />

                  {/* Show Pay button if Approved and not yet Paid */}
                  {borrowing.status === "Approved" && borrowing.paymentStatus !== "Paid" && (
                    <button
                      className="dash-approve"
                      style={{ backgroundColor: "#16a34a", color: "white" }}
                      onClick={() => {
                        setSelectedBorrowingForPayment(borrowing);
                        setPaymentSuccessReceipt(null);
                      }}
                    >
                      Pay Now (₹{borrowing.totalAmount})
                    </button>
                  )}

                  {borrowing.paymentStatus === "Paid" && (
                    <span style={{ fontSize: "0.85rem", color: "#16a34a", fontWeight: "bold" }}>
                      ✓ Paid Demo
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      </>
    );
  }

  // TAB 5: MY PROFILE
  function renderProfile() {
    return (
      <>
        <div className="dash-welcome">
          <div>
            <p className="dash-eyebrow">ACCOUNT SETTINGS</p>
            <h1>My Profile</h1>
            <p>Manage your personal and contact information in MongoDB.</p>
          </div>
        </div>

        <section className="dash-panel">
          <div className="dash-profile-header">
            <div className="dash-avatar">
              {(profile.name.trim()[0] || "U").toUpperCase()}
            </div>
            <div>
              <h2>{profile.name || "Your name"}</h2>
              <p>UNIVO Community Member</p>
              <small>{profile.email}</small>
            </div>
          </div>

          <form className="dash-form" onSubmit={handleSaveProfile}>
            <label htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />

            <label htmlFor="profile-email">Email (Cannot be changed)</label>
            <input
              id="profile-email"
              value={profile.email}
              disabled
              style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
            />

            <label htmlFor="profile-phone">Phone Number</label>
            <input
              id="profile-phone"
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="e.g. 9876543210"
            />

            <label htmlFor="profile-location">City / Location</label>
            <input
              id="profile-location"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="e.g. Vijayawada"
            />

            {profileMessage && (
              <p
                style={{
                  color: profileMessage.includes("success") ? "#15803d" : "#b91c1c",
                  marginTop: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                {profileMessage}
              </p>
            )}

            <button className="dash-primary" type="submit">
              Save Changes to MongoDB
            </button>
          </form>
        </section>
      </>
    );
  }

  const renderers = {
    overview: renderOverview,
    listings: renderListings,
    requests: renderRequests,
    history: renderHistory,
    profile: renderProfile,
  };

  return (
    <div className="dashboard-app">
      <header className="dash-topbar">
        <button className="dash-logo" onClick={onBackHome}>
          UNIVO<span>.</span>
        </button>

        <div className="dash-topbar-right">
          <span className="dash-member-label">
            Logged in as <b>{profile.name}</b>
          </span>
          <button className="dash-home-btn" onClick={onBackHome}>
            ← Back to Home
          </button>
          <button
            className="dash-home-btn"
            style={{ marginLeft: "0.5rem", background: "#fee2e2", color: "#991b1b" }}
            onClick={onLogout}
          >
            Log Out
          </button>
          <div className="dash-small-avatar">
            {(profile.name.trim()[0] || "U").toUpperCase()}
          </div>
        </div>
      </header>

      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="dash-side-profile">
            <div className="dash-avatar">
              {(profile.name.trim()[0] || "U").toUpperCase()}
            </div>
            <strong>{profile.name || "UNIVO Member"}</strong>
            <span>{profile.location || "Location not set"}</span>
          </div>

          <p className="dash-menu-title">WORKSPACE</p>

          <nav className="dash-menu">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`dash-menu-item ${
                  activeTab === item.id ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab(item.id);
                  setShowListingForm(false);
                  setProfileMessage("");
                  setSelectedBorrowingForPayment(null);
                }}
              >
                <span className="dash-menu-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.id === "requests" && pendingRequests > 0 && (
                  <span className="dash-menu-count">{pendingRequests}</span>
                )}
              </button>
            ))}
          </nav>

          <div style={{ marginTop: "auto", padding: "1rem" }}>
            <button
              onClick={onLogout}
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "8px",
                border: "1px solid #f87171",
                background: "#fef2f2",
                color: "#b91c1c",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Log Out
            </button>
          </div>

          <div className="dash-sidebar-tip">
            <span>🌱</span>
            <strong>Share more, waste less.</strong>
            <p>Every shared item makes a difference.</p>
          </div>
        </aside>

        <main className="dash-main">
          {loading && <p style={{ color: "#666" }}>Syncing with MongoDB Atlas...</p>}
          {renderers[activeTab]()}
          <footer className="dash-footer">
            UNIVO · Use More. Own Less.
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
