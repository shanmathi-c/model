import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import ticketRoutes from "./routes/ticket.js";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());


// create ticket
app.post("/create", ticketRoutes.createTicket);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


