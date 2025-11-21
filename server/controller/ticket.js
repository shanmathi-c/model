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

        // Step 1: Check if ticket is already assigned
        const checkQuery = `SELECT * FROM \`assign-ticket\` WHERE ticketId = ?`;

        connection.query(checkQuery, [ticketId], (checkErr, checkResult) => {
            if (checkErr) {
                return res.status(500).json({
                    message: "Error checking existing assignment",
                    error: checkErr
                });
            }

            let assignmentQuery;
            let queryParams;
            let isUpdate = false;

            if (checkResult.length > 0) {
                // Ticket already assigned, update the existing record
                assignmentQuery = `UPDATE \`assign-ticket\` SET agentId = ?, status = 'assigned', importAction = 'single' WHERE ticketId = ?`;
                queryParams = [agentId, ticketId];
                isUpdate = true;
            } else {
                // First time assignment, insert new record
                assignmentQuery = `INSERT INTO \`assign-ticket\` (ticketId, agentId, status, importAction) VALUES (?, ?, 'assigned', 'single')`;
                queryParams = [ticketId, agentId];
                isUpdate = false;
            }

            // Step 2: Execute insert or update query
            connection.query(assignmentQuery, queryParams, (assignErr, assignResult) => {
                if (assignErr) {
                    return res.status(500).json({
                        message: isUpdate ? "Error updating assignment record" : "Error creating assignment record",
                        error: assignErr
                    });
                }

                // Step 3: Update ticket status to 'assigned'
                const updateStatusQuery = `UPDATE tickets SET status = 'assigned' WHERE id = ?`;

                connection.query(updateStatusQuery, [ticketId], (updateErr, updateResult) => {
                    if (updateErr) {
                        // Rollback for insert case only
                        if (!isUpdate) {
                            connection.query(`DELETE FROM \`assign-ticket\` WHERE ticketId = ? AND agentId = ?`, [ticketId, agentId]);
                        }
                        return res.status(500).json({
                            message: "Error updating ticket status",
                            error: updateErr
                        });
                    }

                    if (updateResult.affectedRows === 0) {
                        // Rollback for insert case only
                        if (!isUpdate) {
                            connection.query(`DELETE FROM \`assign-ticket\` WHERE ticketId = ? AND agentId = ?`, [ticketId, agentId]);
                        }
                        return res.status(404).json({
                            message: "Ticket not found"
                        });
                    }

                    return res.json({
                        message: isUpdate ? "Ticket reassigned successfully" : "Ticket assigned successfully",
                        data: {
                            ticketId: ticketId,
                            agentId: agentId,
                            action: isUpdate ? 'reassigned' : 'assigned',
                            importAction: 'single'
                        }
                    });
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

        // Step 1: Insert multiple records with ON DUPLICATE KEY UPDATE to handle existing assignments
        // Use correct column names based on your database
        const assignValuesWithStatus = ticketIds.map(ticketId => `(${ticketId}, ${agentId}, 'assigned', 'bulk')`).join(',');
        const insertQuery = `INSERT INTO \`assign-ticket\` (ticketId, agentId, status, importAction) VALUES ${assignValuesWithStatus}
                             ON DUPLICATE KEY UPDATE agentId = VALUES(agentId), status = 'assigned', importAction = 'bulk'`;

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
            const status = req.query.status;

            // Build WHERE clause for status filter
            let whereClause = '';
            if (status) {
                whereClause = `WHERE t.status = '${status}'`;
            }

            // Get total count with status filter
            const countQuery = status
                ? `SELECT COUNT(*) as total FROM tickets t WHERE t.status = '${status}'`
                : "SELECT COUNT(*) as total FROM tickets";

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
                            CASE WHEN p.name IS NOT NULL THEN p.name ELSE 'No Product' END as productName,
                            a.agentName as assignedAgentName,
                            at.importAction
                     FROM tickets t
                     LEFT JOIN product p ON t.productId = p.productId
                     LEFT JOIN \`assign-ticket\` at ON t.id = at.ticketId
                     LEFT JOIN agents a ON at.agentId = a.id
                     ${whereClause}
                     ORDER BY t.createdAt DESC
                     LIMIT ${limit} OFFSET ${offset}`,

                    // Try with 'name' column and 'created_at'
                    `SELECT t.*,
                            CASE WHEN p.name IS NOT NULL THEN p.name ELSE 'No Product' END as productName,
                            a.agentName as assignedAgentName,
                            at.importAction
                     FROM tickets t
                     LEFT JOIN product p ON t.productId = p.productId
                     LEFT JOIN \`assign-ticket\` at ON t.id = at.ticketId
                     LEFT JOIN agents a ON at.agentId = a.id
                     ${whereClause}
                     ORDER BY t.created_at DESC
                     LIMIT ${limit} OFFSET ${offset}`,

                    // Try with 'name' column and 'id'
                    `SELECT t.*,
                            CASE WHEN p.name IS NOT NULL THEN p.name ELSE 'No Product' END as productName,
                            a.agentName as assignedAgentName,
                            at.importAction
                     FROM tickets t
                     LEFT JOIN product p ON t.productId = p.productId
                     LEFT JOIN \`assign-ticket\` at ON t.id = at.ticketId
                     LEFT JOIN agents a ON at.agentId = a.id
                     ${whereClause}
                     ORDER BY t.id DESC
                     LIMIT ${limit} OFFSET ${offset}`,

                    // Try with 'product_name' column
                    `SELECT t.*,
                            CASE WHEN p.product_name IS NOT NULL THEN p.product_name ELSE 'No Product' END as productName,
                            a.agentName as assignedAgentName,
                            at.importAction
                     FROM tickets t
                     LEFT JOIN product p ON t.productId = p.productId
                     LEFT JOIN \`assign-ticket\` at ON t.id = at.ticketId
                     LEFT JOIN agents a ON at.agentId = a.id
                     ${whereClause}
                     ORDER BY t.id DESC
                     LIMIT ${limit} OFFSET ${offset}`,

                    // Try with 'title' column
                    `SELECT t.*,
                            CASE WHEN p.title IS NOT NULL THEN p.title ELSE 'No Product' END as productName,
                            a.agentName as assignedAgentName,
                            at.importAction
                     FROM tickets t
                     LEFT JOIN product p ON t.productId = p.productId
                     LEFT JOIN \`assign-ticket\` at ON t.id = at.ticketId
                     LEFT JOIN agents a ON at.agentId = a.id
                     ${whereClause}
                     ORDER BY t.id DESC
                     LIMIT ${limit} OFFSET ${offset}`,

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
                     ORDER BY t.id DESC
                     LIMIT ${limit} OFFSET ${offset}`,

                    // Final fallback without product join
                    `SELECT t.*, 'No Product' as productName,
                            a.agentName as assignedAgentName,
                            at.importAction
                     FROM tickets t
                     LEFT JOIN \`assign-ticket\` at ON t.id = at.ticketId
                     LEFT JOIN agents a ON at.agentId = a.id
                     ${whereClause}
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

    // Callback-specific methods

    // Generate callback ID in format C001, C002, etc.
    static generateCallbackId() {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT callbackId FROM callback ORDER BY id DESC LIMIT 1",
                (err, result) => {
                    if (err) {
                        // If table doesn't exist or error, start with C001
                        resolve('C001');
                        return;
                    }

                    if (result.length === 0) {
                        // No callbacks yet, start with C001
                        resolve('C001');
                    } else {
                        // Extract the numeric part from last callback ID
                        const lastCallbackId = result[0].callbackId;
                        console.log('Last callbackId:', lastCallbackId, 'Type:', typeof lastCallbackId);

                        // Add safety check for lastCallbackId
                        if (!lastCallbackId || typeof lastCallbackId !== 'string') {
                            console.log('Invalid lastCallbackId, starting with C001');
                            newCallbackId = 'C001';
                        } else {
                            const match = lastCallbackId.match(/C(\d+)/);
                            if (match) {
                                const lastNumber = parseInt(match[1]);
                                const newNumber = lastNumber + 1;
                                // Pad with leading zeros to maintain 3 digits
                                const newCallbackId = `C${String(newNumber).padStart(3, '0')}`;
                                resolve(newCallbackId);
                            } else {
                                // If format is different, start with C001
                                resolve('C001');
                            }
                        }

                        // Handle case where newCallbackId wasn't set
                        if (typeof newCallbackId === 'undefined') {
                            resolve('C001');
                        }
                    }
                }
            );
        });
    }

    // Create a new callback request
    static async createCallback(req, res) {
        const { productId, name, email, countryCode, phone, subject, description, status } = req.body;

        // Validate required fields
        if (!name || !phone || !subject || !description) {
            return res.status(400).json({
                message: "Missing required fields",
                required: ['name', 'phone', 'subject', 'description']
            });
        }

        try {
            // Generate unique callback ID
            const callbackId = await ticketController.generateCallbackId();

            // Combine country code and phone
            const fullPhone = countryCode ? countryCode + ' ' + phone : phone;

            // Include all form data in callback entry
            const callbackData = {
                callbackId: callbackId,
                productId: productId || null,
                name: name,
                email: email || null,
                phone: fullPhone,
                subject: subject,
                description: description,
                status: status || 'inbound'  // Use status from request or default to 'inbound'
            };

            connection.query("INSERT INTO callback SET ?", callbackData, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error creating callback request",
                        error: err
                    });
                } else {
                    return res.json({
                        message: "Callback request created successfully",
                        data: {
                            id: result.insertId,
                            callbackId: callbackId,
                            status: 'inbound',
                            allData: callbackData
                        }
                    });
                }
            });
        } catch (error) {
            console.error('Error in createCallback:', error);
            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }

    // Get all callback requests
    static getCallbacks(req, res) {
        connection.query(
            "SELECT * FROM callback ORDER BY createdAt DESC",
            (err, result) => {
                if (err) {
                    return res.json({
                        message: "Error fetching callbacks",
                        error: err
                    });
                } else {
                    return res.json({
                        message: "Callbacks fetched successfully",
                        data: result
                    });
                }
            }
        );
    }

    // Get callback by ID
    static getCallbackById(req, res) {
        const { callbackId } = req.params;
        connection.query(
            "SELECT * FROM callback WHERE callbackId = ?",
            [callbackId],
            (err, result) => {
                if (err) {
                    return res.json({
                        message: "Error fetching callback",
                        error: err
                    });
                } else if (result.length === 0) {
                    return res.status(404).json({
                        message: "Callback not found"
                    });
                } else {
                    return res.json({
                        message: "Callback fetched successfully",
                        data: result[0]
                    });
                }
            }
        );
    }

    // Update callback status
    static updateCallbackStatus(req, res) {
        const { callbackId } = req.params;
        const { status } = req.body;

        if (!['inbound', 'pending', 'scheduled', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
                validStatuses: ['inbound', 'pending', 'scheduled', 'completed', 'cancelled']
            });
        }

        connection.query(
            "UPDATE callback SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE callbackId = ?",
            [status, callbackId],
            (err, result) => {
                if (err) {
                    return res.json({
                        message: "Error updating callback status",
                        error: err
                    });
                } else if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message: "Callback not found"
                    });
                } else {
                    return res.json({
                        message: "Callback status updated successfully",
                        data: {
                            callbackId: callbackId,
                            status: status
                        }
                    });
                }
            }
        );
    }

    // Delete callback
    static deleteCallback(req, res) {
        const { callbackId } = req.params;

        connection.query(
            "DELETE FROM callback WHERE callbackId = ?",
            [callbackId],
            (err, result) => {
                if (err) {
                    return res.json({
                        message: "Error deleting callback",
                        error: err
                    });
                } else if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message: "Callback not found"
                    });
                } else {
                    return res.json({
                        message: "Callback deleted successfully"
                    });
                }
            }
        );
    }

    
    // Generate recording URL
    static generateRecordingUrl(callId) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        return `/recordings/${callId}_${timestamp}_${randomString}.mp3`;
    }

    // Create new call log
    static createCallLog(req, res) {
        const { callbackId, ticketId, agentId, agentName, agentNumber, customerPhone, customerName, productId, subject, callType, ticketStatus } = req.body;

        console.log('Received createCallLog request:', {
            callbackId,
            ticketId,
            agentId,
            agentName,
            customerPhone,
            customerName,
            productId,
            subject,
            callType,
            ticketStatus
        });

        try {
            // Generate recording URL (pending status) - will use insertId after database insertion
            const tempCallId = 'temp';
            const recordingUrl = ticketController.generateRecordingUrl(tempCallId);

            // Get current timestamp
            const startTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

            // First, get all existing C-format callIds to determine the next one
            connection.query(
                "SELECT callId FROM calls WHERE callId REGEXP '^C[0-9]+$' ORDER BY CAST(SUBSTRING(callId, 2) AS UNSIGNED) DESC",
                (err, callIdResult) => {
                    let nextCallId;

                    if (err) {
                        console.error('Error getting next callId:', err);
                        nextCallId = 'C001';
                    } else if (callIdResult.length === 0) {
                        // No C-format calls yet, start with C001
                        console.log('No C-format calls found, starting with C001');
                        nextCallId = 'C001';
                    } else {
                        console.log('Found existing C-format calls:', callIdResult.map(r => r.callId));
                        // Extract numeric part from last callId and increment
                        const lastCallId = callIdResult[0].callId;
                        console.log('Last callId:', lastCallId, 'Type:', typeof lastCallId);

                        // Add safety check for lastCallId
                        if (!lastCallId || typeof lastCallId !== 'string') {
                            console.log('Invalid lastCallId, starting with C001');
                            nextCallId = 'C001';
                        } else {
                            const match = lastCallId.match(/C(\d+)/);
                            if (match) {
                                const lastNumber = parseInt(match[1]);
                                const newNumber = lastNumber + 1;
                                // Pad with leading zeros to maintain 3 digits
                                nextCallId = `C${String(newNumber).padStart(3, '0')}`;
                                console.log(`Last call ID: ${lastCallId}, Next call ID: ${nextCallId}`);
                            } else {
                                // If format is different, start with C001
                                nextCallId = 'C001';
                            }
                        }
                    }

                    // Continue with insertion
                    insertCallLog(nextCallId);
                }
            );

            // Helper function to insert call log
            function insertCallLog(nextCallId) {
                // Calculate the correct ticketId to use
                const actualTicketId = ticketId === 0 ? 0 : (ticketId || callbackId);

                // Use explicit SQL to ensure callId is saved as string
                const insertQuery = `
                    INSERT INTO calls (
                        callId, ticketId, userPhone, productId, agentId, agentPhone,
                        callStatus, ticketStatus, recordingUrl, callType, reason,
                        callDescription, startTime, endTime
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const values = [
                    nextCallId, // callId as string
                    actualTicketId, // Use the correctly calculated ticketId
                    customerPhone, // userPhone from frontend
                    productId || null, // productId from frontend
                    agentId, // agentId from frontend
                    agentNumber || agentName || 'Unknown', // agentPhone from frontend or fallback to agentName
                    'pending', // Initial callStatus - should be 'pending' when call starts
                    ticketStatus || 'in-progress', // ticketStatus from frontend ticket status
                    'pending', // recordingUrl initially pending
                    callType || 'outbound', // callType from frontend (inbound/outbound)
                    subject || 'Callback request from customer', // reason
                    subject || 'Callback request from customer', // callDescription
                    startTime, // Actual start time when connect call is clicked
                    startTime // Set endTime to startTime initially, will be updated when call ends
                ];

                console.log('Inserting call with values:', {
                    callId: nextCallId,
                    ticketId: actualTicketId,
                    userPhone: customerPhone,
                    productId: productId || null,
                    agentId: agentId,
                    agentPhone: agentNumber || agentName || 'Unknown',
                    callStatus: 'pending',
                    ticketStatus: 'in-progress',
                    callType: callType || 'outbound',
                    startTime: startTime
                });

                connection.query(insertQuery, values, (err, result) => {
                    if (err) {
                        console.error('Error creating call log:', err);
                        return res.status(500).json({
                            message: "Error creating call log",
                            error: err
                        });
                    } else {
                        // Get the auto-generated ID from the database
                        const insertedId = result.insertId;
                        // Generate new recording URL with the callId
                        const finalRecordingUrl = `/recordings/${nextCallId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.mp3`;

                        // Update the recording URL in the database
                        connection.query(
                            "UPDATE calls SET recordingUrl = ? WHERE id = ?",
                            [finalRecordingUrl, insertedId],
                            (updateErr) => {
                                if (updateErr) {
                                    console.error('Error updating recording URL:', updateErr);
                                }
                            }
                        );

                        return res.json({
                            message: "Call log created successfully",
                            data: {
                                callId: nextCallId, // Return the callId we set
                                startTime: startTime,
                                recordingUrl: finalRecordingUrl,
                                callStatus: 'pending'
                            }
                        });
                    }
                });
            }

        } catch (error) {
            console.error('Error in createCallLog:', error);
            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }

    // End call (update with end time and duration)
    static endCall(req, res) {
        const { callId } = req.params;

        console.log('Received endCall request for callId:', callId);

        try {
            // Get the call log to calculate duration
            connection.query(
                "SELECT * FROM calls WHERE callId = ?",
                [callId],
                (err, callResult) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Error fetching call log",
                            error: err
                        });
                    }

                    if (callResult.length === 0) {
                        return res.status(404).json({
                            message: "Call log not found"
                        });
                    }

                    const callLog = callResult[0];
                    const startTime = new Date(callLog.startTime);
                    const endTime = new Date();
                    const duration = Math.floor((endTime - startTime) / 1000); // Duration in seconds

                    // Format end time
                    const formattedEndTime = endTime.toISOString().slice(0, 19).replace('T', ' ');

                    // Update call log with only end time, don't change any status
                    connection.query(
                        "UPDATE calls SET endTime = ? WHERE callId = ?",
                        [formattedEndTime, callId],
                        (err, updateResult) => {
                            if (err) {
                                return res.status(500).json({
                                    message: "Error updating call log",
                                    error: err
                                });
                            } else {
                                return res.json({
                                    message: "Call ended successfully",
                                    data: {
                                        callId: callId,
                                        endTime: formattedEndTime,
                                        duration: duration, // Return duration for frontend
                                        recordingUrl: callLog.recordingUrl,
                                        callStatus: 'pending',
                                        ticketStatus: 'resolved'
                                    }
                                });
                            }
                        }
                    );
                }
            );

        } catch (error) {
            console.error('Error in endCall:', error);
            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }

    // Mark call as missed
    static missedCall(req, res) {
        const { callId } = req.params;

        console.log('Received missedCall request for callId:', callId);

        try {
            // Update call log with missed status (null start and end times)
            connection.query(
                "UPDATE calls SET startTime = NULL, endTime = NULL, callStatus = 'missed', ticketStatus = 'cancelled', reason = 'User disconnected' WHERE callId = ?",
                [callId],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Error updating call log",
                            error: err
                        });
                    } else {
                        return res.json({
                            message: "Call marked as missed",
                            data: {
                                callId: callId,
                                callStatus: 'missed',
                                ticketStatus: 'cancelled'
                            }
                        });
                    }
                }
            );

        } catch (error) {
            console.error('Error in missedCall:', error);
            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }

    // Get all call logs
    static getCallLogs(req, res) {
        // Join calls with callbacks and tickets tables to get customer names
        // Using COLLATE to handle different collations between tables
        const query = `
            SELECT c.*,
                   COALESCE(cb.name, t.name) AS customerName
            FROM calls c
            LEFT JOIN callback cb ON c.userPhone COLLATE utf8mb4_unicode_ci = cb.phone COLLATE utf8mb4_unicode_ci
            LEFT JOIN tickets t ON c.userPhone COLLATE utf8mb4_unicode_ci = t.phone COLLATE utf8mb4_unicode_ci
            ORDER BY c.createdAt DESC
        `;

        connection.query(query, (err, result) => {
                if (err) {
                    return res.json({
                        message: "Error fetching call logs",
                        error: err
                    });
                } else {
                    return res.json({
                        message: "Call logs fetched successfully",
                        data: result
                    });
                }
            }
        );
    }

    // Get call logs by agent
    static getCallLogsByAgent(req, res) {
        const { agentId } = req.params;

        connection.query(
            "SELECT * FROM calls WHERE agentId = ? ORDER BY createdAt DESC",
            [agentId],
            (err, result) => {
                if (err) {
                    return res.json({
                        message: "Error fetching call logs",
                        error: err
                    });
                } else {
                    return res.json({
                        message: "Agent call logs fetched successfully",
                        data: result
                    });
                }
            }
        );
    }
}
