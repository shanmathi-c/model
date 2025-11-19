import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import ticketRoutes from "./ticket.js";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());


// routes
app.use("/", ticketRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


