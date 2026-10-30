const BorrowRequest = require("../models/BorrowRequest");
const Item = require("../models/Item");

// 1. CREATE BORROW REQUEST
async function createBorrowRequest(req, res) {
  try {
    const {
      itemId,
      startDate,
      endDate,
      numberOfDays,
      borrowerName,
      borrowerPhone,
      additionalDetails,
    } = req.body;

    // Validate inputs
    if (!itemId || !startDate || !endDate || !numberOfDays) {
      return res.status(400).json({
        success: false,
        message: "Please provide item, start date, end date, and number of days.",
      });
    }

    const days = Number(numberOfDays);
    if (days <= 0) {
      return res.status(400).json({
        success: false,
        message: "Number of rental days must be at least 1.",
      });
    }

    // Find the item in database
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    // Rule: User cannot borrow their own item
    if (item.owner.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot borrow your own listed item.",
      });
    }

    // Rule: Check for overlapping approved bookings
    const overlappingBooking = await BorrowRequest.findOne({
      item: itemId,
      status: "Approved",
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: "This item is already booked for the selected dates.",
      });
    }

    // Calculate rental amount and total amount
    const rentalAmount = item.pricePerDay * days;
    const securityDeposit = item.securityDeposit || 0;
    const totalAmount = rentalAmount + securityDeposit;

    // Create the new borrow request
    const newRequest = await BorrowRequest.create({
      item: item._id,
      itemName: item.name,
      itemImage: item.image,
      borrower: req.user.id,
      borrowerName: borrowerName || req.user.name,
      borrowerPhone: borrowerPhone || "",
      owner: item.owner,
      startDate: startDate,
      endDate: endDate,
      numberOfDays: days,
      pricePerDay: item.pricePerDay,
      rentalAmount: rentalAmount,
      securityDeposit: securityDeposit,
      totalAmount: totalAmount,
      additionalDetails: additionalDetails || "",
      status: "Pending",
      paymentStatus: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Borrow request submitted successfully! Waiting for owner's response.",
      request: newRequest,
    });
  } catch (error) {
    console.error("Borrow request error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error submitting borrow request.",
    });
  }
}

// 2. GET INCOMING REQUESTS FOR OWNER (Protected)
async function getIncomingRequests(req, res) {
  try {
    const requests = await BorrowRequest.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      requests: requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching incoming requests.",
    });
  }
}

// 3. GET MY BORROWINGS / OUTGOING REQUESTS (Protected)
async function getMyBorrowings(req, res) {
  try {
    const requests = await BorrowRequest.find({ borrower: req.user.id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      requests: requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching your borrowing history.",
    });
  }
}

// 4. UPDATE REQUEST STATUS (Accept or Reject - Protected)
async function updateRequestStatus(req, res) {
  try {
    const { status } = req.body; // "Approved" or "Rejected"
    const requestId = req.params.id;

    if (!status || (status !== "Approved" && status !== "Rejected")) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Approved' or 'Rejected'.",
      });
    }

    const request = await BorrowRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Borrow request not found.",
      });
    }

    // Only the item owner can approve or reject
    if (request.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the item owner can approve or reject this request.",
      });
    }

    request.status = status;
    await request.save();

    return res.status(200).json({
      success: true,
      message: `Request has been marked as ${status}.`,
      request: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating request status.",
    });
  }
}

module.exports = {
  createBorrowRequest,
  getIncomingRequests,
  getMyBorrowings,
  updateRequestStatus,
};
