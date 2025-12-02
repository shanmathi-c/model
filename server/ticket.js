import express from "express";
import multer from "multer";
import path from "path";
import {ticketController} from "./controller/ticket.js";
const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/recordings/') // Save to public/recordings folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'recording-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'audio/mpeg' || file.originalname.endsWith('.mp3')) {
      cb(null, true);
    } else {
      cb(new Error('Only MP3 files are allowed'));
    }
  }
});

router.post("/new-tickets", ticketController.createTicket);
router.post("/call-tickets", ticketController.createCallTicket);

// Callback routes
router.post("/callback", ticketController.createCallback);
router.get("/callbacks", ticketController.getCallbacks);
router.get("/callback/:callbackId", ticketController.getCallbackById);
router.put("/callback/:callbackId/status", ticketController.updateCallbackStatus);
router.delete("/callback/:callbackId", ticketController.deleteCallback);

// Call logs routes
router.post("/calls", ticketController.createCallLog);
router.post("/calls/reconnect", ticketController.reconnectCall);
router.post("/calls/upload-recording", upload.single('recording'), ticketController.uploadRecording);
router.put("/calls/:callId/start", ticketController.startCall);
router.put("/calls/:callId/end", ticketController.endCall);
router.put("/calls/:callId/missed", ticketController.missedCall);
router.put("/calls/:callId/status", ticketController.updateCallStatus);
router.put("/calls/:callId/agent", ticketController.updateCallAgent);
router.put("/calls/:callId/ticket", ticketController.updateCallTicketId);
router.get("/calls", ticketController.getCallLogs);
router.get("/calls/details/:callId", ticketController.getCallDetails);
router.get("/calls/agent/:agentId", ticketController.getCallLogsByAgent);

router.get("/products", ticketController.getProducts);
router.get("/tickets", ticketController.getTickets);
router.get("/tickets/:id/feedback", ticketController.getTicketFeedback);
router.get("/tickets/:id/activity-logs", ticketController.getActivityLogs);
router.get("/tickets/:id/assignment-history", ticketController.getAssignmentHistory);
router.get("/unassigned-tickets", ticketController.getUnassignedTickets);
router.get("/agents/product/:productId", ticketController.getAgentsByProduct);
router.post("/assign", ticketController.assignTicketToAgent);
router.post("/bulk-assign", ticketController.bulkAssignTickets);
router.post("/merge-ticketcalls", ticketController.mergeTicketCalls);
router.put("/tickets/:id/status", ticketController.updateTicketStatus);
router.put("/tickets/:id/update-all-status", ticketController.updateAllTablesStatus);
router.put("/tickets/:id/fcr", ticketController.updateTicketFCR);
router.put("/tickets/:id/details", ticketController.updateTicketDetails);

// Feedback routes
router.get("/feedback", ticketController.getFeedback);
router.get("/feedback/:id", ticketController.getFeedbackById);
router.post("/feedback/request", ticketController.requestFeedback);
router.put("/feedback/:id/response", ticketController.updateFeedbackResponse);

// Analytics routes
router.get("/analytics/cards", ticketController.getAnalyticsCards);
router.get("/analytics/ticket-trends", ticketController.getTicketTrends);
router.get("/analytics/resolution-time-distribution", ticketController.getResolutionTimeDistribution);
router.get("/analytics/customer-satisfaction-distribution", ticketController.getCustomerSatisfactionDistribution);
router.get("/analytics/agent-performance", ticketController.getAgentPerformance);
router.get("/analytics/call-statistics", ticketController.getCallStatistics);
router.get("/analytics/call-trends", ticketController.getCallTrends);
router.get("/analytics/product-performance", ticketController.getProductPerformance);
router.get("/analytics/callback-status", ticketController.getCallbackStatus);
router.get("/analytics/filter-options", ticketController.getFilterOptions);

router.get("/", (req, res) => {
    res.send("get tickets!");
});

router.post("/fix-assign-ticket-ids", ticketController.fixAssignTicketIds);
router.post("/cleanup-resolved-dates", ticketController.cleanupResolvedOnDates);

export default router;

