import connection from "../config/index.js";

export class ticketController {
    // Generate ticket ID in format T001, T002, etc.
    static generateTicketId() {
        return new Promise((resolve, reject) => {
            // Get the latest ticket ID
            connection.query(
                "SELECT ticketId FROM tickets ORDER BY id DESC LIMIT 1",
                (err, result) => {
                    if (err) {
                        // If table doesn't exist or error, start with T001
                        resolve('T001');
                        return;
                    }

                    if (result.length === 0) {
                        // No tickets yet, start with T001
                        resolve('T001');
                    } else {
                        // Extract the numeric part from last ticket ID
                        const lastTicketId = result[0].ticketId;
                        const match = lastTicketId.match(/T(\d+)/);

                        if (match) {
                            const lastNumber = parseInt(match[1]);
                            const newNumber = lastNumber + 1;
                            // Pad with leading zeros to maintain 3 digits
                            const newTicketId = `T${String(newNumber).padStart(3, '0')}`;
                            resolve(newTicketId);
                        } else {
                            // If format is different, start with T001
                            resolve('T001');
                        }
                    }
                }
            );
        });
    }

    static async createTicket(req, res) {
       const { productId, name, email, countryCode, phone, subject, description, ticketType } = req.body;

       // Validate required fields (productId and email not required for call tickets)
       if (!name || !phone || !subject || !description) {
           return res.status(400).json({
               message: "Missing required fields",
               required: ['name', 'phone', 'subject', 'description']
           });
       }

       try {
           // Generate unique ticket ID
           const ticketId = await ticketController.generateTicketId();

           // Combine country code and phone into a single phone field
           const fullPhone = countryCode ? countryCode + ' ' + phone : phone;

           // Extract only the fields that exist in the database
           const dbTicketData = {
               ticketId: ticketId,  // Add generated ticket ID
               productId: productId || null,  // Store productId, null if not selected
               name: name,
               email: email || null,  // Email is optional for call tickets
               phone: fullPhone,  // Store combined phone number with country code
               subject: subject,
               description: description,
               ticketType: ticketType || 'freshdesk'  // Store ticket type, default to freshdesk
               // Removed created_at - database will use default timestamp
           };

           connection.query("INSERT INTO tickets SET ?", dbTicketData, (err, result) => {
           if (err) {
            return res.json({
                message: "Error creating ticket",
                error: err
            })
           } else {
              return res.json({
                message: "Ticket created successfully",
                data: {
                    ...result,
                    ticketId: ticketId  // Include generated ticket ID in response
                }
            })
           }
       });
    } catch (error) {
        console.error('Error in createTicket:', error);
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
    }

    static createCallTicket(req, res) {
        // Add ticketType: 'call' for call page tickets
        const ticketData = {
            ...req.body,
            ticketType: 'call'
        };

        // Reuse the same logic but force ticketType to 'call'
        ticketController.createTicket({ ...req, body: ticketData }, res);
    }
// fetch products for drop down option in create ticket page 
    static getProducts(req, res) {
        connection.query("SELECT * FROM product", (err, result) => {
            if (err) {
                return res.json({
                    message: "Error fetching products",
                    error: err
                });
            } else {
                return res.json({
                    message: "Products fetched successfully",
                    data: result
                });
            }
        });
    }
}
