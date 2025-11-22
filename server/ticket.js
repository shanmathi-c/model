import express from "express";
import {ticketController} from "./controller/ticket.js";
const router = express.Router();

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
router.put("/calls/:callId/start", ticketController.startCall);
router.put("/calls/:callId/end", ticketController.endCall);
router.put("/calls/:callId/missed", ticketController.missedCall);
router.put("/calls/:callId/status", ticketController.updateCallStatus);
router.put("/calls/:callId/agent", ticketController.updateCallAgent);
router.get("/calls", ticketController.getCallLogs);
router.get("/calls/details/:callId", ticketController.getCallDetails);
router.get("/calls/agent/:agentId", ticketController.getCallLogsByAgent);

router.get("/products", ticketController.getProducts);
router.get("/tickets", ticketController.getTickets);
router.get("/tickets/:id/feedback", ticketController.getTicketFeedback);
router.get("/unassigned-tickets", ticketController.getUnassignedTickets);
router.get("/agents/product/:productId", ticketController.getAgentsByProduct);
router.post("/assign", ticketController.assignTicketToAgent);
router.post("/bulk-assign", ticketController.bulkAssignTickets);
router.put("/tickets/:id/status", ticketController.updateTicketStatus);
router.put("/tickets/:id/fcr", ticketController.updateTicketFCR);

// Feedback routes
router.get("/feedback", ticketController.getFeedback);
router.get("/feedback/:id", ticketController.getFeedbackById);
router.post("/feedback/request", ticketController.requestFeedback);
router.put("/feedback/:id/response", ticketController.updateFeedbackResponse);

router.get("/", (req, res) => {
    res.send("get tickets!");
});

router.post("/fix-assign-ticket-ids", ticketController.fixAssignTicketIds);

export default router;
