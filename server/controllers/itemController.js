const Item = require("../models/Item");
const User = require("../models/User");

// Initial sample items to populate MongoDB if empty
const defaultSeedItems = [
  {
    name: "DSLR Camera",
    category: "Electronics",
    image: "📷",
    pricePerDay: 500,
    securityDeposit: 2000,
    location: "Vijayawada",
    condition: "Excellent",
    description: "Capture memorable moments with this DSLR camera. Suitable for photography, college events, and trips.",
    ownerName: "Community Member",
  },
  {
    name: "Projector",
    category: "Electronics",
    image: "📽️",
    pricePerDay: 350,
    securityDeposit: 1500,
    location: "Vijayawada",
    condition: "Very Good",
    description: "A convenient projector for presentations, movie nights, and college events.",
    ownerName: "Community Member",
  },
  {
    name: "Bicycle",
    category: "Vehicles",
    image: "🚲",
    pricePerDay: 250,
    securityDeposit: 1000,
    location: "Vijayawada",
    condition: "Very Good",
    description: "A bicycle for short-distance travel, exercise, and exploring nearby places.",
    ownerName: "Community Member",
  },
  {
    name: "Power Drill",
    category: "Tools",
    image: "🛠️",
    pricePerDay: 200,
    securityDeposit: 800,
    location: "Vijayawada",
    condition: "Very Good",
    description: "A power drill for home improvement, repairs, and DIY projects.",
    ownerName: "Community Member",
  },
  {
    name: "Camping Tent",
    category: "Camping",
    image: "🏕️",
    pricePerDay: 400,
    securityDeposit: 1200,
    location: "Vijayawada",
    condition: "Good",
    description: "A camping tent for outdoor adventures and weekend trips.",
    ownerName: "Community Member",
  },
  {
    name: "Acoustic Guitar",
    category: "Instruments",
    image: "🎸",
    pricePerDay: 300,
    securityDeposit: 1500,
    location: "Vijayawada",
    condition: "Excellent",
    description: "An acoustic guitar for music practice, performances, and learning sessions.",
    ownerName: "Community Member",
  },
];

// Helper to auto-seed if items collection is empty
async function seedDefaultItemsIfEmpty() {
  const count = await Item.countDocuments();
  if (count === 0) {
    // Find or create a default demo user
    let demoUser = await User.findOne({ email: "community@univo.org" });
    if (!demoUser) {
      demoUser = await User.create({
        name: "Community Member",
        email: "community@univo.org",
        password: "hashedpassword123",
        phone: "9876543210",
        location: "Vijayawada",
      });
    }

    const itemsToInsert = defaultSeedItems.map((item) => ({
      ...item,
      owner: demoUser._id,
      ownerName: demoUser.name,
      isAvailable: true,
    }));

    await Item.insertMany(itemsToInsert);
    console.log("Pre-populated MongoDB with initial UNIVO items!");
  }
}

// 1. GET ALL ITEMS (with optional search and category filter)
async function getAllItems(req, res) {
  try {
    // Auto-seed on first request if database has no items
    await seedDefaultItemsIfEmpty();

    const { search, category } = req.query;

    // Build simple filter query
    let query = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      // Simple regex for case-insensitive matching
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    let items = await Item.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      items: items,
    });
  } catch (error) {
    console.error("Get items error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error fetching items.",
    });
  }
}

// 2. GET SINGLE ITEM BY ID
async function getItemById(req, res) {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    return res.status(200).json({
      success: true,
      item: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching item details.",
    });
  }
}

// 3. CREATE NEW ITEM (Protected)
async function createItem(req, res) {
  try {
    const {
      name,
      category,
      description,
      image,
      condition,
      location,
      pricePerDay,
      securityDeposit,
    } = req.body;

    // Validate required fields
    if (!name || !category || !description || !pricePerDay || !location) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (name, category, description, price, location).",
      });
    }

    // Category emoji helper for nice display
    const categoryIcons = {
      Electronics: "📷",
      Vehicles: "🚲",
      Tools: "🛠️",
      Furniture: "🪑",
      Sports: "🏏",
      Instruments: "🎸",
      Camping: "🏕️",
    };

    const finalImage = image && image.trim() !== "" ? image : (categoryIcons[category] || "📦");

    const newItem = await Item.create({
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      image: finalImage,
      condition: condition || "Good",
      location: location.trim(),
      pricePerDay: Number(pricePerDay),
      securityDeposit: Number(securityDeposit) || 0,
      isAvailable: true,
      owner: req.user.id,
      ownerName: req.user.name || "UNIVO Member",
    });

    return res.status(201).json({
      success: true,
      message: "Item listed successfully!",
      item: newItem,
    });
  } catch (error) {
    console.error("Create item error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error adding item to database.",
    });
  }
}

// 4. GET MY LISTINGS (Protected)
async function getMyListings(req, res) {
  try {
    const items = await Item.find({ owner: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      items: items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching your listings.",
    });
  }
}

// 5. DELETE ITEM (Protected)
async function deleteItem(req, res) {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    // Ensure only the owner can delete their item
    if (item.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this item.",
      });
    }

    await Item.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Item removed successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting item.",
    });
  }
}

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  getMyListings,
  deleteItem,
};
