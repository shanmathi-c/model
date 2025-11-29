import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from 'url';
import ticketRoutes from "./ticket.js";

const app = express();
const PORT = 5001;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(bodyParser.json());

// Serve static files from public directory
app.use('/recordings', express.static(path.join(__dirname, '../public/recordings')));

// routes
app.use("/", ticketRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


