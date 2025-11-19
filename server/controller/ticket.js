import connection from "../config/index.js";

export class ticketController {
    static createTicket(req, res) {
       const add = req.body;
       connection.query("INSERT INTO tickets SET ?", add, (err, result) => {
           if (err) {
            return res.json({
                message: "Error creating ticket",
                error: err
            })
           } else {
              return res.json({
                message: "Ticket created successfully",
                data: result
            })
           }
       });
    }
}
