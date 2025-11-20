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

    // Generate sequential userId
    static generateUserId() {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT MAX(userId) as maxUserId FROM tickets",
                (err, result) => {
                    if (err) {
                        // If error, start with 1
                        resolve(1);
                        return;
                    }

                    if (result.length > 0 && result[0].maxUserId !== null) {
                        // Increment the maximum userId
                        const newUserId = result[0].maxUserId + 1;
                        resolve(newUserId);
                    } else {
                        // If no users exist, start with 1
                        resolve(1);
                    }
                }
            );
        });
    }

    static async createTicket(req, res) {
       const { productId, userId, name, email, countryCode, phone, subject, description, ticketType } = req.body;

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

           // Generate or use existing userId
           let finalUserId;
           if (userId) {
               finalUserId = parseInt(userId);
           } else {
               // Generate a new sequential userId
               finalUserId = await ticketController.generateUserId();
           }

           // Combine country code and phone into a single phone field
           const fullPhone = countryCode ? countryCode + ' ' + phone : phone;

           // Extract only the fields that exist in the database
           const dbTicketData = {
               ticketId: ticketId,  // Add generated ticket ID
               productId: productId || null,  // Store productId, null if not selected
               userId: finalUserId,  // Add userId field as integer
               name: name,
               email: email || null,  // Email is optional for call tickets
               phone: fullPhone,  // Store combined phone number with country code
               subject: subject,
               description: description,
               status: 'created',  // Add status field with default value 'created'
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
                    ticketId: ticketId,  // Include generated ticket ID in response
                    userId: finalUserId   // Include the userId in response
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

    // Get all unassigned tickets
    static getUnassignedTickets(req, res) {
        // Check if assignedTo field exists in tickets table
        connection.query("SELECT * FROM tickets LIMIT 1", (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error accessing tickets table",
                    error: err
                });
            }

            // Check if assignedTo field exists
            const hasAssignedField = result.length > 0 && 'assignedTo' in result[0];
            let whereClause = hasAssignedField ? "WHERE (t.assignedTo IS NULL OR t.assignedTo = 0)" : "";

            // Try different product column names - using the correct JOIN that worked for getTickets
            // Also join with assign-ticket and agents tables to get assigned agent info
            const queries = [
                // Try with 'name' column in product table and agent join
                `SELECT t.*,
                        CASE WHEN p.name IS NOT NULL THEN p.name ELSE 'No Product' END as productName,
                        a.agentName as assignedAgentName,
                        at.importAction
                 FROM tickets t
                 LEFT JOIN product p ON t.productId = p.productId
                 LEFT JOIN \`assign-ticket\` at ON t.id = at.ticketId
                 LEFT JOIN agents a ON at.agentId = a.id
                 ${whereClause}
                 ORDER BY t.id DESC`,

                // Try with 'product_name' column in product table
                `SELECT t.*,
                        CASE WHEN p.product_name IS NOT NULL THEN p.product_name ELSE 'No Product' END as productName,
                        a.agentName as assignedAgentName,
                        at.importAction
                 FROM tickets t
                 LEFT JOIN product p ON t.productId = p.productId
                 LEFT JOIN \`assign-ticket\` at ON t.id = at.ticketId
                 LEFT JOIN agents a ON at.agentId = a.id
                 ${whereClause}
                 ORDER BY t.id DESC`,

                // Try with 'title' column in product table
                `SELECT t.*,
                        CASE WHEN p.title IS NOT NULL THEN p.title ELSE 'No Product' END as productName,
                        a.agentName as assignedAgentName,
                        at.importAction
                 FROM tickets t
                 LEFT JOIN product p ON t.productId = p.productId
                 LEFT JOIN \`assign-ticket\` at ON t.id = at.ticketId
                 LEFT JOIN agents a ON at.agentId = a.id
                 ${whereClause}
                 ORDER BY t.id DESC`,

                // Try with 'productName' column
                `SELECT t.*,
                        CASE WHEN p.productName IS NOT NULL THEN p.productName ELSE 'No Product' END as productName,
                        a.agentName as assignedAgentName,
                        at.importAction
                 FROM tickets t
                 LEFT JOIN product p ON t.productId = p.productId
                 LEFT JOIN \`assign-ticket\` at ON t.id = at.ticketId
                 LEFT JOIN agents a ON at.agentId = a.id
                 ${whereClause}
                 ORDER BY t.id DESC`,

                // Final fallback without product join
                `SELECT t.*, 'No Product' as productName,
                        a.agentName as assignedAgentName,
                        at.importAction
                 FROM tickets t
                 LEFT JOIN \`assign-ticket\` at ON t.id = at.ticketId
                 LEFT JOIN agents a ON at.agentId = a.id
                 ${whereClause}
                 ORDER BY t.id DESC`
            ];

            // Try queries in sequence
            const tryQuery = (queryIndex) => {
                connection.query(queries[queryIndex], (err, result) => {
                    if (err && queryIndex < queries.length - 1) {
                        console.log(`Query ${queryIndex + 1} failed:`, err.sqlMessage);
                        tryQuery(queryIndex + 1);
                    } else if (err) {
                        console.log('All queries failed');
                        return res.status(500).json({
                            message: "Error fetching unassigned tickets",
                            error: err
                        });
                    } else {
                        console.log(`Query ${queryIndex + 1} succeeded`);
                        return res.json({
                            message: "Unassigned tickets fetched successfully",
                            data: result
                        });
                    }
                });
            };

            tryQuery(0);
        });
    }

    // Get agents available for a specific product
    static getAgentsByProduct(req, res) {
        const { productId } = req.params;

        // Try queries with different column names
        const queries = [
            // With 'name' column and status field
            `SELECT a.*,
                    CASE WHEN p.name IS NOT NULL THEN p.name ELSE 'Product' END as productName
             FROM agents a
             LEFT JOIN product p ON a.productId = p.id
             WHERE a.productId = ? AND (a.status = 'available' OR a.status IS NULL)`,

            // With 'product_name' column
            `SELECT a.*,
                    CASE WHEN p.product_name IS NOT NULL THEN p.product_name ELSE 'Product' END as productName
             FROM agents a
             LEFT JOIN product p ON a.productId = p.id
             WHERE a.productId = ? AND (a.status = 'available' OR a.status IS NULL)`,

            // With different status field (active)
            `SELECT a.*,
                    CASE WHEN p.name IS NOT NULL THEN p.name ELSE 'Product' END as productName
             FROM agents a
             LEFT JOIN product p ON a.productId = p.id
             WHERE a.productId = ? AND (a.status = 'active' OR a.status IS NULL)`,

            // Without status field check
            `SELECT a.*,
                    CASE WHEN p.name IS NOT NULL THEN p.name ELSE 'Product' END as productName
             FROM agents a
             LEFT JOIN product p ON a.productId = p.id
             WHERE a.productId = ?`,

            // Fallback without product join
            `SELECT a.*, 'Product' as productName
             FROM agents a
             WHERE a.productId = ?`
        ];

        // Try queries in sequence
        const tryQuery = (queryIndex) => {
            connection.query(queries[queryIndex], [productId], (err, result) => {
                if (err && queryIndex < queries.length - 1) {
                    console.log(`Agent Query ${queryIndex + 1} failed:`, err.sqlMessage);
                    tryQuery(queryIndex + 1);
                } else if (err) {
                    console.log('All agent queries failed');
                    // Return empty array instead of error
                    return res.json({
                        message: "No agents found",
                        data: []
                    });
                } else {
                    console.log(`Agent Query ${queryIndex + 1} succeeded`);
                    return res.json({
                        message: "Agents fetched successfully",
                        data: result
                    });
                }
            });
        };

        tryQuery(0);
    }

    // Assign ticket to agent
    static assignTicketToAgent(req, res) {
        const { ticketId, agentId } = req.body;

        if (!ticketId || !agentId) {
            return res.status(400).json({
                message: "Missing required fields: ticketId and agentId"
            });
        }

        // Step 1: Insert into assign-ticket table
        // Use correct column names based on your database
        const insertQuery = `INSERT INTO \`assign-ticket\` (ticketId, agentId, status, importAction) VALUES (?, ?, 'assigned', 'single')`;

        connection.query(insertQuery, [ticketId, agentId], (insertErr, insertResult) => {
            if (insertErr) {
                return res.status(500).json({
                    message: "Error creating assignment record",
                    error: insertErr
                });
            }

            // Step 2: Update ticket status to 'assigned'
            const updateStatusQuery = `UPDATE tickets SET status = 'assigned' WHERE id = ?`;

            connection.query(updateStatusQuery, [ticketId], (updateErr, updateResult) => {
                if (updateErr) {
                    // Rollback: delete the assignment record if status update fails
                    connection.query(`DELETE FROM \`assign-ticket\` WHERE ticketId = ? AND agentId = ?`, [ticketId, agentId]);
                    return res.status(500).json({
                        message: "Error updating ticket status",
                        error: updateErr
                    });
                }

                if (updateResult.affectedRows === 0) {
                    // Rollback: delete the assignment record if ticket not found
                    connection.query(`DELETE FROM \`assign-ticket\` WHERE ticketId = ? AND agentId = ?`, [ticketId, agentId]);
                    return res.status(404).json({
                        message: "Ticket not found"
                    });
                }

                return res.json({
                    message: "Ticket assigned successfully",
                    data: {
                        ticketId: ticketId,
                        agentId: agentId,
                        assigned_at: new Date()
                    }
                });
            });
        });
    }

    // Bulk assign tickets to agent
    static bulkAssignTickets(req, res) {
        const { ticketIds, agentId } = req.body;

        if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0 || !agentId) {
            return res.status(400).json({
                message: "Missing required fields: ticketIds (array) and agentId"
            });
        }

        // Step 1: Insert multiple records into assign-ticket table
        // Use correct column names based on your database
        const assignValuesWithStatus = ticketIds.map(ticketId => `(${ticketId}, ${agentId}, 'assigned', 'bulk')`).join(',');
        const insertQuery = `INSERT INTO \`assign-ticket\` (ticketId, agentId, status, importAction) VALUES ${assignValuesWithStatus}`;

        connection.query(insertQuery, (insertErr, insertResult) => {
            if (insertErr) {
                return res.status(500).json({
                    message: "Error creating assignment records",
                    error: insertErr
                });
            }

            // Step 2: Update ticket status to 'assigned' for all tickets
            const placeholders = ticketIds.map(() => '?').join(',');
            const updateStatusQuery = `UPDATE tickets SET status = 'assigned' WHERE id IN (${placeholders})`;

            connection.query(updateStatusQuery, ticketIds, (updateErr, updateResult) => {
                if (updateErr) {
                    // Rollback: delete the assignment records if status update fails
                    const deletePlaceholders = ticketIds.map(() => '?').join(',');
                    connection.query(`DELETE FROM \`assign-ticket\` WHERE ticketId IN (${deletePlaceholders}) AND agentId = ?`, [...ticketIds, agentId]);
                    return res.status(500).json({
                        message: "Error updating ticket statuses",
                        error: updateErr
                    });
                }

                return res.json({
                    message: "Tickets assigned successfully",
                    data: {
                        assignedCount: updateResult.affectedRows,
                        ticketIds: ticketIds,
                        agentId: agentId
                    }
                });
            });
        });
    }

    // Fetch paginated tickets
    static async getTickets(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;


            // Get total count
            const countQuery = "SELECT COUNT(*) as total FROM tickets";
            connection.query(countQuery, (err, countResult) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error fetching ticket count",
                        error: err
                    });
                }

                const total = countResult[0].total;

                // Try queries with different product column names and date columns
                const queries = [
                    // Try with 'name' column and 'createdAt'
                    `SELECT t.*,
                            CASE WHEN p.name IS NOT NULL THEN p.name ELSE 'No Product' END as productName
                     FROM tickets t
                     LEFT JOIN product p ON t.productId = p.productId
                     ORDER BY t.createdAt DESC
                     LIMIT ${limit} OFFSET ${offset}`,

                    // Try with 'name' column and 'created_at'
                    `SELECT t.*,
                            CASE WHEN p.name IS NOT NULL THEN p.name ELSE 'No Product' END as productName
                     FROM tickets t
                     LEFT JOIN product p ON t.productId = p.productId
                     ORDER BY t.created_at DESC
                     LIMIT ${limit} OFFSET ${offset}`,

                    // Try with 'name' column and 'id'
                    `SELECT t.*,
                            CASE WHEN p.name IS NOT NULL THEN p.name ELSE 'No Product' END as productName
                     FROM tickets t
                     LEFT JOIN product p ON t.productId = p.productId
                     ORDER BY t.id DESC
                     LIMIT ${limit} OFFSET ${offset}`,

                    // Try with 'product_name' column
                    `SELECT t.*,
                            CASE WHEN p.product_name IS NOT NULL THEN p.product_name ELSE 'No Product' END as productName
                     FROM tickets t
                     LEFT JOIN product p ON t.productId = p.productId
                     ORDER BY t.id DESC
                     LIMIT ${limit} OFFSET ${offset}`,

                    // Try with 'title' column
                    `SELECT t.*,
                            CASE WHEN p.title IS NOT NULL THEN p.title ELSE 'No Product' END as productName
                     FROM tickets t
                     LEFT JOIN product p ON t.productId = p.productId
                     ORDER BY t.id DESC
                     LIMIT ${limit} OFFSET ${offset}`,

                    // Try with 'productName' column
                    `SELECT t.*,
                            CASE WHEN p.productName IS NOT NULL THEN p.productName ELSE 'No Product' END as productName
                     FROM tickets t
                     LEFT JOIN product p ON t.productId = p.productId
                     ORDER BY t.id DESC
                     LIMIT ${limit} OFFSET ${offset}`,

                    // Final fallback without product join
                    `SELECT t.*, 'No Product' as productName
                     FROM tickets t
                     ORDER BY t.id DESC
                     LIMIT ${limit} OFFSET ${offset}`
                ];

                // Try queries in sequence
                const tryQuery = (queryIndex) => {
                    connection.query(queries[queryIndex], (err, result) => {
                        if (err && queryIndex < queries.length - 1) {
                            console.log(`Tickets Query ${queryIndex + 1} failed:`, err.sqlMessage);
                            tryQuery(queryIndex + 1);
                        } else if (err) {
                            console.log('All tickets queries failed');
                            return res.status(500).json({
                                message: "Error fetching tickets",
                                error: err
                            });
                        } else {
                            console.log(`Tickets Query ${queryIndex + 1} succeeded`);
                            return res.json({
                                message: "Tickets fetched successfully",
                                data: result,
                                pagination: {
                                    total: total,
                                    page: page,
                                    limit: limit,
                                    totalPages: Math.ceil(total / limit)
                                }
                            });
                        }
                    });
                };

                tryQuery(0);
            });
        } catch (error) {
            console.error('Error in getTickets:', error);
            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }
}
