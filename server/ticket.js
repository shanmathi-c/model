import express from "express";
import {ticketController} from "./controller/ticket.js";
const router = express.Router();

router.post("/new-tickets", ticketController.createTicket);

router.get("/", (req, res) => {
    res.send("get tickets!");
});
export default router;
