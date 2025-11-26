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

    // Get customer feedback for a ticket
    static getTicketFeedback(req, res) {
        const { id } = req.params;

        // We try to match either by numeric id or formatted ticketId (T001)
        // First get the ticketId for this id
        const getTicketIdQuery = `SELECT ticketId FROM tickets WHERE id = ? OR ticketId = ? LIMIT 1`;

        connection.query(getTicketIdQuery, [id, id], (err, ticketResult) => {
            if (err) {
                return res.status(500).json({
                    message: "Error finding ticket",
                    error: err
                });
            }

            if (!ticketResult || ticketResult.length === 0) {
                return res.json({
                    message: "Ticket not found",
                    data: []
                });
            }

            const ticketId = ticketResult[0].ticketId;

            // Now get feedback for this ticketId
            const query = `
                SELECT
                    f.*,
                    t.ticketId,
                    t.ticketType,
                    t.productId,
                    p.productName,
                    t.name as customerName,
                    t.email as customerEmail,
                    a.agentName
                FROM feedbacks f
                LEFT JOIN tickets t ON f.ticketId = t.ticketId
                LEFT JOIN product p ON t.productId = p.productId
                LEFT JOIN \`assign-ticket\` at ON t.ticketId = at.ticketId
                LEFT JOIN agents a ON at.agentId = a.id
                WHERE f.ticketId = ?
                ORDER BY f.createdAt DESC
            `;

            connection.query(query, [ticketId], (err, result) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error fetching ticket feedback",
                        error: err
                    });
                }

                return res.json({
                    message: "Ticket feedback fetched successfully",
                    data: result || []
                });
            });
        });
    }

    // Get assignment history for a ticket
    static getAssignmentHistory(req, res) {
        const { id } = req.params;

        // First get the ticketId for this id
        const getTicketIdQuery = `SELECT ticketId FROM tickets WHERE id = ? OR ticketId = ? LIMIT 1`;

        connection.query(getTicketIdQuery, [id, id], (err, ticketResult) => {
            if (err) {
                return res.status(500).json({
                    message: "Error finding ticket",
                    error: err
                });
            }

            if (!ticketResult || ticketResult.length === 0) {
                return res.json({
                    message: "Ticket not found",
                    data: []
                });
            }

            const ticketId = ticketResult[0].ticketId;

            // Get assignment history with agent details
            const query = `
                SELECT
                    at.id,
                    at.ticketId,
                    at.agentId,
                    at.status,
                    at.importAction,
                    at.createdAt,
                    a.agentName,
                    a.agentContact,
                    a.agentEmail
                FROM \`assign-ticket\` at
                LEFT JOIN agents a ON at.agentId = a.id
                WHERE at.ticketId = ?
                ORDER BY at.createdAt DESC
            `;

            connection.query(query, [ticketId], (err, result) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error fetching assignment history",
                        error: err
                    });
                }

                return res.json({
                    message: "Assignment history fetched successfully",
                    data: result || []
                });
            });
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

    static async createCallTicket(req, res) {
        const { productId, userId, name, email, countryCode, phone, subject, description, agentId, agentName, agentPhone, callType, callId } = req.body;

        console.log('=== CREATE CALL TICKET REQUEST ===');
        console.log('Request body:', req.body);
        console.log('CallId from frontend:', callId);
        console.log('Agent details:', { agentId, agentName, agentPhone });

        // Validate required fields
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

            // First, create the ticket in tickets table
            const dbTicketData = {
                ticketId: ticketId,
                productId: productId || null,
                userId: finalUserId,
                name: name,
                email: email || null,
                phone: fullPhone,
                subject: subject,
                description: description,
                status: 'assigned',
                ticketType: 'call'
            };

            connection.query("INSERT INTO tickets SET ?", dbTicketData, async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error creating ticket",
                        error: err
                    });
                }

                // Get the numeric ID of the created ticket
                const numericTicketId = result.insertId;

                try {
                    // Step 2: Handle assign-ticket table if agentId is provided
                    if (agentId) {
                        // Check if assignment already exists for this ticketId
                        const existingAssignment = await new Promise((resolve, reject) => {
                            connection.query(
                                "SELECT * FROM `assign-ticket` WHERE ticketId = ?",
                                [ticketId],
                                (checkErr, checkResult) => {
                                    if (checkErr) {
                                        reject(checkErr);
                                    } else {
                                        resolve(checkResult);
                                    }
                                }
                            );
                        });

                        if (existingAssignment.length > 0) {
                            // Update existing assignment
                            await new Promise((resolve, reject) => {
                                connection.query(
                                    "UPDATE `assign-ticket` SET agentId = ?, status = 'assigned', importAction = 'call', ticketType = 'call' WHERE ticketId = ?",
                                    [agentId, ticketId],
                                    (updateErr, updateResult) => {
                                        if (updateErr) {
                                            reject(updateErr);
                                        } else {
                                            console.log('Assignment updated for ticketId:', ticketId);
                                            resolve(updateResult);
                                        }
                                    }
                                );
                            });
                        } else {
                            // Insert new assignment
                            const assignData = {
                                ticketId: ticketId,
                                agentId: agentId,
                                status: 'assigned',
                                importAction: 'call',
                                ticketType: 'call'
                            };

                            await new Promise((resolve, reject) => {
                                connection.query("INSERT INTO `assign-ticket` SET ?", assignData, (assignErr, assignResult) => {
                                    if (assignErr) {
                                        reject(assignErr);
                                    } else {
                                        console.log('New assignment created for ticketId:', ticketId);
                                        resolve(assignResult);
                                    }
                                });
                            });
                        }

                        // Update ticket status to 'assigned'
                        await new Promise((resolve, reject) => {
                            connection.query("UPDATE tickets SET status = 'assigned' WHERE id = ?", [numericTicketId], (updateErr, updateResult) => {
                                if (updateErr) {
                                    reject(updateErr);
                                } else {
                                    resolve(updateResult);
                                }
                            });
                        });
                    }

                    // Step 3: Handle calls table - either update existing call or create new one
                    let finalCallId;

                    if (callId) {
                        // If callId is provided from frontend, update the existing call record
                        console.log('Updating existing call record with callId:', callId);
                        finalCallId = callId;

                        // Verify the call exists
                        const verifyCall = await new Promise((resolve, reject) => {
                            connection.query(
                                "SELECT id, callId FROM calls WHERE callId = ?",
                                [callId],
                                (err, result) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(result);
                                    }
                                }
                            );
                        });

                        if (verifyCall.length === 0) {
                            return res.status(404).json({
                                message: `CallId ${callId} not found in calls table`,
                                error: "Specified callId does not exist"
                            });
                        }

                        // Update the existing call record with ticket data
                        await new Promise((resolve, reject) => {
                            const updateQuery = `
                                UPDATE calls
                                SET ticketId = ?,
                                    userPhone = ?,
                                    productId = ?,
                                    callStatus = 'pending',
                                    ticketStatus = 'assigned',
                                    reason = ?,
                                    callDescription = ?,
                                    agentId = COALESCE(?, agentId),
                                    agentPhone = COALESCE(?, agentPhone)
                                WHERE callId = ?
                            `;

                            const updateValues = [
                                ticketId,
                                fullPhone,
                                productId || null,
                                subject,
                                description,
                                agentId || null,
                                agentPhone || null,
                                callId
                            ];

                            connection.query(updateQuery, updateValues, (updateErr, updateResult) => {
                                if (updateErr) {
                                    console.error('Error updating call record:', updateErr);
                                    reject(updateErr);
                                } else {
                                    console.log('Call record updated successfully');
                                    resolve(updateResult);
                                }
                            });
                        });
                    } else {
                        // No callId from frontend, create new call record
                        console.log('Creating new call record');
                        finalCallId = await ticketController.generateCallId();

                        const callData = {
                            callId: finalCallId,
                            ticketId: ticketId,
                            userPhone: fullPhone,
                            productId: productId || null,
                            agentId: agentId || null,
                            agentPhone: agentPhone || null,
                            callStatus: 'pending',
                            ticketStatus: 'assigned',
                            recordingUrl: null,
                            callType: callType || 'inbound',
                            reason: subject,
                            callDescription: description,
                            startTime: null,
                            endTime: null
                        };

                        await new Promise((resolve, reject) => {
                            connection.query("INSERT INTO calls SET ?", callData, (callErr, callResult) => {
                                if (callErr) {
                                    console.error('Error creating call record:', callErr);
                                    reject(callErr);
                                } else {
                                    console.log('Call record created successfully');
                                    resolve(callResult);
                                }
                            });
                        });
                    }

                    return res.json({
                        message: "Call ticket created successfully",
                        data: {
                            ticketId: ticketId,
                            userId: finalUserId,
                            numericId: numericTicketId,
                            callId: finalCallId,
                            agentId: agentId || null,
                            agentName: agentName || null,
                            agentPhone: agentPhone || null,
                            status: 'assigned',
                            ticketStatus: 'assigned',
                            ticketType: 'call'
                        }
                    });

                } catch (error) {
                    console.error('Error in createCallTicket additional steps:', error);
                    return res.status(500).json({
                        message: "Error creating additional records",
                        error: error.message
                    });
                }
            });

        } catch (error) {
            console.error('Error in createCallTicket:', error);
            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }

    // Update ticket status and keep related tables in sync
    static updateTicketStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "Missing status"
            });
        }

        // First, resolve ticket by numeric id or ticketId (e.g., T001)
        const getTicketQuery = `SELECT id, ticketId FROM tickets WHERE id = ? OR ticketId = ?`;

        connection.query(getTicketQuery, [id, id], (getErr, ticketResult) => {
            if (getErr) {
                return res.status(500).json({
                    message: "Error fetching ticket",
                    error: getErr
                });
            }

            if (!ticketResult || ticketResult.length === 0) {
                return res.status(404).json({
                    message: "Ticket not found"
                });
            }

            const numericId = ticketResult[0].id;
            const formattedTicketId = ticketResult[0].ticketId || `T${String(ticketResult[0].id).padStart(3, '0')}`;

            // Step 1: update tickets table
            connection.query(
                `UPDATE tickets SET status = ? WHERE id = ?`,
                [status, numericId],
                (updateErr, updateResult) => {
                    if (updateErr) {
                        return res.status(500).json({
                            message: "Error updating ticket status",
                            error: updateErr
                        });
                    }

                    if (updateResult.affectedRows === 0) {
                        return res.status(404).json({
                            message: "Ticket not found"
                        });
                    }

                    // Step 2: update assign-ticket table (best effort)
                    connection.query(
                        "UPDATE `assign-ticket` SET status = ? WHERE ticketId = ?",
                        [status, formattedTicketId],
                        () => {}
                    );

                    // Step 3: update calls table ticketStatus (best effort)
                    connection.query(
                        "UPDATE calls SET ticketStatus = ? WHERE ticketId = ?",
                        [status, formattedTicketId],
                        () => {}
                    );

                    return res.json({
                        message: "Ticket status updated successfully",
                        data: {
                            id: numericId,
                            ticketId: formattedTicketId,
                            status
                        }
                    });
                }
            );
        });
    }

    // Generate call ID in format C001, C002, etc.
    static generateCallId() {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT callId FROM calls WHERE callId REGEXP '^C[0-9]+$' ORDER BY CAST(SUBSTRING(callId, 2) AS UNSIGNED) DESC LIMIT 1",
                (err, result) => {
                    if (err) {
                        resolve('C001');
                        return;
                    }

                    if (result.length === 0) {
                        resolve('C001');
                    } else {
                        const lastCallId = result[0].callId;
                        const match = lastCallId.match(/C(\d+)/);

                        if (match) {
                            const lastNumber = parseInt(match[1]);
                            const newNumber = lastNumber + 1;
                            const newCallId = `C${String(newNumber).padStart(3, '0')}`;
                            resolve(newCallId);
                        } else {
                            resolve('C001');
                        }
                    }
                }
            );
        });
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
                 LEFT JOIN \`assign-ticket\` at ON t.ticketId = at.ticketId
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
                 LEFT JOIN \`assign-ticket\` at ON t.ticketId = at.ticketId
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
                 LEFT JOIN \`assign-ticket\` at ON t.ticketId = at.ticketId
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
                 LEFT JOIN \`assign-ticket\` at ON t.ticketId = at.ticketId
                 LEFT JOIN agents a ON at.agentId = a.id
                 ${whereClause}
                 ORDER BY t.id DESC`,

                // Final fallback without product join
                `SELECT t.*, 'No Product' as productName,
                        a.agentName as assignedAgentName,
                        at.importAction
                 FROM tickets t
                 LEFT JOIN \`assign-ticket\` at ON t.ticketId = at.ticketId
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

        // First, get the proper ticketId format and status from tickets table
        const getTicketQuery = `SELECT id, ticketId, status FROM tickets WHERE id = ? OR ticketId = ?`;

        connection.query(getTicketQuery, [ticketId, ticketId], (getErr, ticketResult) => {
            if (getErr) {
                return res.status(500).json({
                    message: "Error fetching ticket",
                    error: getErr
                });
            }

            if (ticketResult.length === 0) {
                return res.status(404).json({
                    message: "Ticket not found"
                });
            }

            // Use the formatted ticketId (T001, T002, etc.) from the tickets table
            const formattedTicketId = ticketResult[0].ticketId || `T${String(ticketResult[0].id).padStart(3, '0')}`;
            const numericTicketId = ticketResult[0].id;
            const originalTicketStatus = ticketResult[0].status;

            console.log('Assigning ticket:', {
                formattedTicketId,
                numericTicketId,
                originalTicketStatus,
                agentId
            });

        // Step 1: Check if ticket is already assigned
        const checkQuery = `SELECT * FROM \`assign-ticket\` WHERE ticketId = ?`;

        connection.query(checkQuery, [formattedTicketId], (checkErr, checkResult) => {
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
                // Ticket already assigned, update the existing record with assigned status
                assignmentQuery = `UPDATE \`assign-ticket\` SET agentId = ?, status = 'assigned', importAction = 'single', ticketType = 'freshdesk' WHERE ticketId = ?`;
                queryParams = [agentId, formattedTicketId];
                isUpdate = true;
                console.log('Updating existing assignment with status: assigned');
            } else {
                // First time assignment, insert new record with assigned status
                assignmentQuery = `INSERT INTO \`assign-ticket\` (ticketId, agentId, status, importAction, ticketType) VALUES (?, ?, 'assigned', 'single', 'freshdesk')`;
                queryParams = [formattedTicketId, agentId];
                isUpdate = false;
                console.log('Creating new assignment with status: assigned');
            }

            // Step 2: Execute insert or update query
            connection.query(assignmentQuery, queryParams, (assignErr, assignResult) => {
                if (assignErr) {
                    return res.status(500).json({
                        message: isUpdate ? "Error updating assignment record" : "Error creating assignment record",
                        error: assignErr
                    });
                }

                // Step 3: Update ticket status to 'assigned' using numeric ID
                const updateStatusQuery = `UPDATE tickets SET status = 'assigned' WHERE id = ?`;

                connection.query(updateStatusQuery, [numericTicketId], (updateErr, updateResult) => {
                    if (updateErr) {
                        // Rollback for insert case only
                        if (!isUpdate) {
                            connection.query(`DELETE FROM \`assign-ticket\` WHERE ticketId = ? AND agentId = ?`, [formattedTicketId, agentId]);
                        }
                        return res.status(500).json({
                            message: "Error updating ticket status",
                            error: updateErr
                        });
                    }

                    if (updateResult.affectedRows === 0) {
                        // Rollback for insert case only
                        if (!isUpdate) {
                            connection.query(`DELETE FROM \`assign-ticket\` WHERE ticketId = ? AND agentId = ?`, [formattedTicketId, agentId]);
                        }
                        return res.status(404).json({
                            message: "Ticket not found"
                        });
                    }

                    // Step 4: Update calls table agentId for this ticket (best effort)
                    const updateCallsQuery = `UPDATE calls SET agentId = ? WHERE ticketId = ? OR ticketId = ?`;

                    connection.query(updateCallsQuery, [agentId, formattedTicketId, numericTicketId], (callsErr) => {
                        if (callsErr) {
                            console.log('Warning: failed to update calls agentId for ticket', formattedTicketId, callsErr.sqlMessage || callsErr);
                        }

                        return res.json({
                            message: isUpdate ? "Ticket reassigned successfully" : "Ticket assigned successfully",
                            data: {
                                ticketId: formattedTicketId,
                                agentId: agentId,
                                action: isUpdate ? 'reassigned' : 'assigned',
                                importAction: 'single'
                            }
                        });
                    });
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

        // First, get all tickets with their proper formatted ticketId and status
        const placeholders = ticketIds.map(() => '?').join(',');
        const getTicketsQuery = `SELECT id, ticketId, status FROM tickets WHERE id IN (${placeholders}) OR ticketId IN (${placeholders})`;
        const queryParams = [...ticketIds, ...ticketIds];

        connection.query(getTicketsQuery, queryParams, (getErr, ticketResults) => {
            if (getErr) {
                return res.status(500).json({
                    message: "Error fetching tickets",
                    error: getErr
                });
            }

            if (ticketResults.length === 0) {
                return res.status(404).json({
                    message: "No tickets found"
                });
            }

            // Map to get formatted ticketIds and numeric IDs
            const ticketMappings = ticketResults.map(ticket => ({
                numericId: ticket.id,
                formattedId: ticket.ticketId || `T${String(ticket.id).padStart(3, '0')}`
            }));

            // Build the values for bulk insert with formatted ticketIds and assigned status
            const assignValuesWithStatus = ticketMappings.map(mapping =>
                `('${mapping.formattedId}', ${agentId}, 'assigned', 'bulk', 'freshdesk')`
            ).join(',');

            const insertQuery = `INSERT INTO \`assign-ticket\` (ticketId, agentId, status, importAction, ticketType) VALUES ${assignValuesWithStatus}
                                 ON DUPLICATE KEY UPDATE agentId = VALUES(agentId), status = 'assigned', importAction = 'bulk', ticketType = 'freshdesk'`;

            connection.query(insertQuery, (insertErr, insertResult) => {
                if (insertErr) {
                    return res.status(500).json({
                        message: "Error creating assignment records",
                        error: insertErr
                    });
                }

                // Update ticket status to 'assigned' using numeric IDs
                const numericIds = ticketMappings.map(m => m.numericId);
                const updatePlaceholders = numericIds.map(() => '?').join(',');
                const updateStatusQuery = `UPDATE tickets SET status = 'assigned' WHERE id IN (${updatePlaceholders})`;

                connection.query(updateStatusQuery, numericIds, (updateErr, updateResult) => {
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
                            ticketIds: ticketMappings.map(m => m.formattedId),
                            agentId: agentId
                        }
                    });
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
                            COALESCE((SELECT p1.name FROM product p1 WHERE p1.productId = t.productId LIMIT 1), 'No Product') as productName,
                            COALESCE((SELECT a1.agentName FROM \`assign-ticket\` at1 LEFT JOIN agents a1 ON at1.agentId = a1.id WHERE at1.ticketId = t.ticketId ORDER BY at1.id DESC LIMIT 1), NULL) as assignedAgentName,
                            COALESCE((SELECT at2.importAction FROM \`assign-ticket\` at2 WHERE at2.ticketId = t.ticketId ORDER BY at2.id DESC LIMIT 1), NULL) as importAction,
                            COALESCE((SELECT f1.deliveryStatus FROM feedbacks f1 WHERE f1.ticketId = t.ticketId ORDER BY f1.createdAt DESC LIMIT 1), NULL) as feedbackStatus,
                            COALESCE((SELECT f2.rating FROM feedbacks f2 WHERE f2.ticketId = t.ticketId ORDER BY f2.createdAt DESC LIMIT 1), NULL) as feedbackRating,
                            COALESCE((SELECT f3.feedbackComment FROM feedbacks f3 WHERE f3.ticketId = t.ticketId ORDER BY f3.createdAt DESC LIMIT 1), NULL) as feedbackComment,
                            COALESCE((SELECT c1.resolvedOn FROM calls c1 WHERE c1.ticketId = t.ticketId ORDER BY c1.id DESC LIMIT 1), NULL) as resolvedOn,
                            COALESCE((SELECT c2.notes FROM calls c2 WHERE c2.ticketId = t.ticketId ORDER BY c2.id DESC LIMIT 1), NULL) as notes,
                            COALESCE((SELECT CASE WHEN c3.firstCall = 1 THEN 1 ELSE NULL END FROM calls c3 WHERE c3.ticketId = t.ticketId ORDER BY c3.id DESC LIMIT 1), NULL) as fcr
                     FROM tickets t
                     ${whereClause}
                     ORDER BY t.createdAt DESC
                     LIMIT ${limit} OFFSET ${offset}`,

                    // Try with 'name' column and 'created_at'
                    `SELECT t.*,
                            COALESCE((SELECT p1.name FROM product p1 WHERE p1.productId = t.productId LIMIT 1), 'No Product') as productName,
                            (SELECT a1.agentName FROM \`assign-ticket\` at1 LEFT JOIN agents a1 ON at1.agentId = a1.id WHERE at1.ticketId = t.ticketId ORDER BY at1.id DESC LIMIT 1) as assignedAgentName,
                            (SELECT at2.importAction FROM \`assign-ticket\` at2 WHERE at2.ticketId = t.ticketId ORDER BY at2.id DESC LIMIT 1) as importAction,
                            (SELECT f1.deliveryStatus FROM feedbacks f1 WHERE f1.ticketId = t.ticketId ORDER BY f1.createdAt DESC LIMIT 1) as feedbackStatus,
                            (SELECT f2.rating FROM feedbacks f2 WHERE f2.ticketId = t.ticketId ORDER BY f2.createdAt DESC LIMIT 1) as feedbackRating,
                            (SELECT f3.feedbackComment FROM feedbacks f3 WHERE f3.ticketId = t.ticketId ORDER BY f3.createdAt DESC LIMIT 1) as feedbackComment,
                            (SELECT c1.resolvedOn FROM calls c1 WHERE c1.ticketId = t.ticketId ORDER BY c1.id DESC LIMIT 1) as resolvedOn,
                            (SELECT c2.notes FROM calls c2 WHERE c2.ticketId = t.ticketId ORDER BY c2.id DESC LIMIT 1) as notes,
                            (SELECT CASE WHEN c3.firstCall = 1 THEN 1 ELSE NULL END FROM calls c3 WHERE c3.ticketId = t.ticketId ORDER BY c3.id DESC LIMIT 1) as fcr
                     FROM tickets t
                     ${whereClause}
                     ORDER BY t.created_at DESC
                     LIMIT ${limit} OFFSET ${offset}`,

                    // Try with 'name' column and 'id'
                    `SELECT t.*,
                            COALESCE((SELECT p1.name FROM product p1 WHERE p1.productId = t.productId LIMIT 1), 'No Product') as productName,
                            (SELECT a1.agentName FROM \`assign-ticket\` at1 LEFT JOIN agents a1 ON at1.agentId = a1.id WHERE at1.ticketId = t.ticketId ORDER BY at1.id DESC LIMIT 1) as assignedAgentName,
                            (SELECT at2.importAction FROM \`assign-ticket\` at2 WHERE at2.ticketId = t.ticketId ORDER BY at2.id DESC LIMIT 1) as importAction,
                            (SELECT f1.deliveryStatus FROM feedbacks f1 WHERE f1.ticketId = t.ticketId ORDER BY f1.createdAt DESC LIMIT 1) as feedbackStatus,
                            (SELECT f2.rating FROM feedbacks f2 WHERE f2.ticketId = t.ticketId ORDER BY f2.createdAt DESC LIMIT 1) as feedbackRating,
                            (SELECT f3.feedbackComment FROM feedbacks f3 WHERE f3.ticketId = t.ticketId ORDER BY f3.createdAt DESC LIMIT 1) as feedbackComment,
                            (SELECT c1.resolvedOn FROM calls c1 WHERE c1.ticketId = t.ticketId ORDER BY c1.id DESC LIMIT 1) as resolvedOn,
                            (SELECT c2.notes FROM calls c2 WHERE c2.ticketId = t.ticketId ORDER BY c2.id DESC LIMIT 1) as notes,
                            (SELECT CASE WHEN c3.firstCall = 1 THEN 1 ELSE NULL END FROM calls c3 WHERE c3.ticketId = t.ticketId ORDER BY c3.id DESC LIMIT 1) as fcr
                     FROM tickets t
                     ${whereClause}
                     ORDER BY t.id DESC
                     LIMIT ${limit} OFFSET ${offset}`,

                    // Try with 'product_name' column
                    `SELECT t.*,
                            COALESCE((SELECT p1.product_name FROM product p1 WHERE p1.productId = t.productId LIMIT 1), 'No Product') as productName,
                            (SELECT a1.agentName FROM \`assign-ticket\` at1 LEFT JOIN agents a1 ON at1.agentId = a1.id WHERE at1.ticketId = t.ticketId ORDER BY at1.id DESC LIMIT 1) as assignedAgentName,
                            (SELECT at2.importAction FROM \`assign-ticket\` at2 WHERE at2.ticketId = t.ticketId ORDER BY at2.id DESC LIMIT 1) as importAction,
                            (SELECT f1.deliveryStatus FROM feedbacks f1 WHERE f1.ticketId = t.ticketId ORDER BY f1.createdAt DESC LIMIT 1) as feedbackStatus,
                            (SELECT f2.rating FROM feedbacks f2 WHERE f2.ticketId = t.ticketId ORDER BY f2.createdAt DESC LIMIT 1) as feedbackRating,
                            (SELECT f3.feedbackComment FROM feedbacks f3 WHERE f3.ticketId = t.ticketId ORDER BY f3.createdAt DESC LIMIT 1) as feedbackComment,
                            (SELECT c1.resolvedOn FROM calls c1 WHERE c1.ticketId = t.ticketId ORDER BY c1.id DESC LIMIT 1) as resolvedOn,
                            (SELECT c2.notes FROM calls c2 WHERE c2.ticketId = t.ticketId ORDER BY c2.id DESC LIMIT 1) as notes,
                            (SELECT CASE WHEN c3.firstCall = 1 THEN 1 ELSE NULL END FROM calls c3 WHERE c3.ticketId = t.ticketId ORDER BY c3.id DESC LIMIT 1) as fcr
                     FROM tickets t
                     ${whereClause}
                     ORDER BY t.id DESC
                     LIMIT ${limit} OFFSET ${offset}`,

                    // Try with 'title' column
                    `SELECT t.*,
                            COALESCE((SELECT p1.title FROM product p1 WHERE p1.productId = t.productId LIMIT 1), 'No Product') as productName,
                            (SELECT a1.agentName FROM \`assign-ticket\` at1 LEFT JOIN agents a1 ON at1.agentId = a1.id WHERE at1.ticketId = t.ticketId ORDER BY at1.id DESC LIMIT 1) as assignedAgentName,
                            (SELECT at2.importAction FROM \`assign-ticket\` at2 WHERE at2.ticketId = t.ticketId ORDER BY at2.id DESC LIMIT 1) as importAction,
                            (SELECT f1.deliveryStatus FROM feedbacks f1 WHERE f1.ticketId = t.ticketId ORDER BY f1.createdAt DESC LIMIT 1) as feedbackStatus,
                            (SELECT f2.rating FROM feedbacks f2 WHERE f2.ticketId = t.ticketId ORDER BY f2.createdAt DESC LIMIT 1) as feedbackRating,
                            (SELECT f3.feedbackComment FROM feedbacks f3 WHERE f3.ticketId = t.ticketId ORDER BY f3.createdAt DESC LIMIT 1) as feedbackComment,
                            (SELECT c1.resolvedOn FROM calls c1 WHERE c1.ticketId = t.ticketId ORDER BY c1.id DESC LIMIT 1) as resolvedOn,
                            (SELECT c2.notes FROM calls c2 WHERE c2.ticketId = t.ticketId ORDER BY c2.id DESC LIMIT 1) as notes,
                            (SELECT CASE WHEN c3.firstCall = 1 THEN 1 ELSE NULL END FROM calls c3 WHERE c3.ticketId = t.ticketId ORDER BY c3.id DESC LIMIT 1) as fcr
                     FROM tickets t
                     ${whereClause}
                     ORDER BY t.id DESC
                     LIMIT ${limit} OFFSET ${offset}`,

                    // Try with 'productName' column
                    `SELECT t.*,
                            COALESCE((SELECT p1.productName FROM product p1 WHERE p1.productId = t.productId LIMIT 1), 'No Product') as productName,
                            (SELECT a1.agentName FROM \`assign-ticket\` at1 LEFT JOIN agents a1 ON at1.agentId = a1.id WHERE at1.ticketId = t.ticketId ORDER BY at1.id DESC LIMIT 1) as assignedAgentName,
                            (SELECT at2.importAction FROM \`assign-ticket\` at2 WHERE at2.ticketId = t.ticketId ORDER BY at2.id DESC LIMIT 1) as importAction,
                            (SELECT f1.deliveryStatus FROM feedbacks f1 WHERE f1.ticketId = t.ticketId ORDER BY f1.createdAt DESC LIMIT 1) as feedbackStatus,
                            (SELECT f2.rating FROM feedbacks f2 WHERE f2.ticketId = t.ticketId ORDER BY f2.createdAt DESC LIMIT 1) as feedbackRating,
                            (SELECT f3.feedbackComment FROM feedbacks f3 WHERE f3.ticketId = t.ticketId ORDER BY f3.createdAt DESC LIMIT 1) as feedbackComment,
                            (SELECT c1.resolvedOn FROM calls c1 WHERE c1.ticketId = t.ticketId ORDER BY c1.id DESC LIMIT 1) as resolvedOn,
                            (SELECT c2.notes FROM calls c2 WHERE c2.ticketId = t.ticketId ORDER BY c2.id DESC LIMIT 1) as notes,
                            (SELECT CASE WHEN c3.firstCall = 1 THEN 1 ELSE NULL END FROM calls c3 WHERE c3.ticketId = t.ticketId ORDER BY c3.id DESC LIMIT 1) as fcr
                     FROM tickets t
                     ${whereClause}
                     ORDER BY t.id DESC
                     LIMIT ${limit} OFFSET ${offset}`,

                    // Final fallback without product join
                    `SELECT t.*, 'No Product' as productName,
                            (SELECT a1.agentName FROM \`assign-ticket\` at1 LEFT JOIN agents a1 ON at1.agentId = a1.id WHERE at1.ticketId = t.ticketId ORDER BY at1.id DESC LIMIT 1) as assignedAgentName,
                            (SELECT at2.importAction FROM \`assign-ticket\` at2 WHERE at2.ticketId = t.ticketId ORDER BY at2.id DESC LIMIT 1) as importAction,
                            (SELECT f1.deliveryStatus FROM feedbacks f1 WHERE f1.ticketId = t.ticketId ORDER BY f1.createdAt DESC LIMIT 1) as feedbackStatus,
                            (SELECT f2.rating FROM feedbacks f2 WHERE f2.ticketId = t.ticketId ORDER BY f2.createdAt DESC LIMIT 1) as feedbackRating,
                            (SELECT f3.feedbackComment FROM feedbacks f3 WHERE f3.ticketId = t.ticketId ORDER BY f3.createdAt DESC LIMIT 1) as feedbackComment,
                            (SELECT c1.resolvedOn FROM calls c1 WHERE c1.ticketId = t.ticketId ORDER BY c1.id DESC LIMIT 1) as resolvedOn,
                            (SELECT c2.notes FROM calls c2 WHERE c2.ticketId = t.ticketId ORDER BY c2.id DESC LIMIT 1) as notes,
                            (SELECT CASE WHEN c3.firstCall = 1 THEN 1 ELSE NULL END FROM calls c3 WHERE c3.ticketId = t.ticketId ORDER BY c3.id DESC LIMIT 1) as fcr
                     FROM tickets t
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
        const { productId, name, email, countryCode, phone, subject, description, status, agentId, callType } = req.body;

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
                status: status || 'inbound',  // Use status from request or default to 'inbound'
                agentId: agentId || 0,
                callType: callType || 'inbound'
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

        if (!['inbound', 'pending', 'scheduled', 'completed', 'cancelled', 'missed'].includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
                validStatuses: ['inbound', 'pending', 'scheduled', 'completed', 'cancelled', 'missed']
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

            // First, if ticketId is provided, get the formatted ticketId from tickets table
            const getFormattedTicketId = (callback) => {
                if (!ticketId || ticketId === 0) {
                    // No ticket, use callbackId or 0
                    return callback(null, ticketId === 0 ? 0 : (ticketId || callbackId));
                }

                // Look up the formatted ticketId from tickets table
                connection.query(
                    "SELECT ticketId FROM tickets WHERE id = ? OR ticketId = ?",
                    [ticketId, ticketId],
                    (err, result) => {
                        if (err) {
                            console.error('Error looking up ticketId:', err);
                            return callback(null, ticketId); // Fallback to provided ticketId
                        }

                        if (result && result.length > 0) {
                            const formattedTicketId = result[0].ticketId;
                            console.log('Found formatted ticketId:', formattedTicketId, 'for input:', ticketId);
                            callback(null, formattedTicketId);
                        } else {
                            console.log('No ticket found, using provided ticketId:', ticketId);
                            callback(null, ticketId);
                        }
                    }
                );
            };

            // Get formatted ticketId first, then proceed with call creation
            getFormattedTicketId((err, formattedTicketId) => {
                if (err) {
                    console.error('Error getting formatted ticketId:', err);
                }

                // Now get all existing C-format callIds to determine the next one
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
                        insertCallLog(nextCallId, formattedTicketId);
                    }
                );
            });

            // Helper function to insert call log
            function insertCallLog(nextCallId, actualTicketId) {

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

    // Start call (update existing call with start time and ensure status is pending)
    static startCall(req, res) {
        const { callId } = req.params;

        console.log('Received startCall request for callId:', callId);

        try {
            // Get current timestamp
            const startTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

            // Update call log with start time and set status to pending (in case it was missed)
            connection.query(
                "UPDATE calls SET startTime = ?, callStatus = 'pending' WHERE callId = ?",
                [startTime, callId],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Error updating call log",
                            error: err
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            message: "Call log not found"
                        });
                    }

                    return res.json({
                        message: "Call started successfully",
                        data: {
                            callId: callId,
                            startTime: startTime,
                            callStatus: 'pending'
                        }
                    });
                }
            );

        } catch (error) {
            console.error('Error in startCall:', error);
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

                    // Update call log with end time and set status to pending (since it has both start and end times)
                    connection.query(
                        "UPDATE calls SET endTime = ?, callStatus = 'pending' WHERE callId = ?",
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
                                        ticketStatus: callLog.ticketStatus
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

    // Update call status
    static updateCallStatus(req, res) {
        const { callId } = req.params;
        const { callStatus } = req.body;

        console.log('Received updateCallStatus request for callId:', callId, 'callStatus:', callStatus);

        if (!callStatus) {
            return res.status(400).json({
                message: "Missing required field: callStatus"
            });
        }

        // Validate status value
        const validStatuses = ['pending', 'completed', 'cancelled', 'missed'];
        if (!validStatuses.includes(callStatus)) {
            return res.status(400).json({
                message: "Invalid callStatus. Must be one of: pending, completed, cancelled, missed"
            });
        }

        try {
            // Update the callStatus in calls table
            connection.query(
                "UPDATE calls SET callStatus = ? WHERE callId = ?",
                [callStatus, callId],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Error updating call status",
                            error: err
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            message: "Call log not found"
                        });
                    }

                    return res.json({
                        message: "Call status updated successfully",
                        data: {
                            callId: callId,
                            callStatus: callStatus
                        }
                    });
                }
            );

        } catch (error) {
            console.error('Error in updateCallStatus:', error);
            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }

    // Update call agent - updates agentId in calls table
    static updateCallAgent(req, res) {
        const { callId } = req.params;
        const { agentId } = req.body;

        console.log('Received updateCallAgent request for callId:', callId, 'agentId:', agentId);

        if (!agentId) {
            return res.status(400).json({
                message: "Missing required field: agentId"
            });
        }

        try {
            // First, verify the call exists
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

                    // Update the agentId in calls table
                    connection.query(
                        "UPDATE calls SET agentId = ? WHERE callId = ?",
                        [agentId, callId],
                        (updateErr, updateResult) => {
                            if (updateErr) {
                                return res.status(500).json({
                                    message: "Error updating call agent",
                                    error: updateErr
                                });
                            }

                            return res.json({
                                message: "Call agent updated successfully",
                                data: {
                                    callId: callId,
                                    agentId: agentId
                                }
                            });
                        }
                    );
                }
            );

        } catch (error) {
            console.error('Error in updateCallAgent:', error);
            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }

    // Get all call logs
    static getCallLogs(req, res) {
        // Fetch data ONLY from calls table, with customer names via subqueries
        // Using DISTINCT and subqueries to prevent any duplicates
        const { ticketId } = req.query;

        let whereClause = '';
        let queryParams = [];

        if (ticketId) {
            // Match both formatted ticketId (T001) and numeric ID
            // First check if calls.ticketId matches directly, OR resolve from tickets table
            whereClause = 'WHERE (c.ticketId = ? OR c.ticketId = (SELECT t.ticketId FROM tickets t WHERE t.id = ? OR t.ticketId = ? LIMIT 1))';
            queryParams.push(ticketId, ticketId, ticketId);
        }

        const query = `
            SELECT DISTINCT
                   c.id,
                   c.callId,
                   c.ticketId,
                   c.userPhone,
                   c.productId,
                   c.agentId,
                   c.agentPhone,
                   c.callStatus,
                   c.ticketStatus,
                   c.recordingUrl,
                   c.callType,
                   c.reason,
                   c.callDescription,
                   c.startTime,
                   c.endTime,
                   c.createdAt,
                   c.notes,
                   (SELECT name FROM tickets
                    WHERE (ticketId = c.ticketId COLLATE utf8mb4_unicode_ci
                           OR id = c.ticketId
                           OR phone = c.userPhone COLLATE utf8mb4_unicode_ci)
                    LIMIT 1) AS ticketCustomerName,
                   (SELECT name FROM callback
                    WHERE phone = c.userPhone COLLATE utf8mb4_unicode_ci
                    LIMIT 1) AS callbackCustomerName
            FROM calls c
            ${whereClause}
            ORDER BY c.createdAt DESC
        `;

        connection.query(query, queryParams, (err, result) => {
                if (err) {
                    console.error('Error in getCallLogs query:', err);
                    return res.json({
                        message: "Error fetching call logs",
                        error: err
                    });
                } else {
                    // Process results to combine customer names
                    const processedResult = result.map(row => ({
                        ...row,
                        customerName: row.ticketCustomerName || row.callbackCustomerName || 'Unknown Customer',
                        // Remove the temporary fields
                        ticketCustomerName: undefined,
                        callbackCustomerName: undefined
                    }));

                    console.log(`Fetched ${processedResult.length} call logs from calls table${ticketId ? ` for ticketId: ${ticketId}` : ''}`);

                    return res.json({
                        message: "Call logs fetched successfully",
                        data: processedResult
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

    // Get call details by callId (including agent details)
    static getCallDetails(req, res) {
        const { callId } = req.params;

        const query = `
            SELECT
                c.*,
                a.agentName,
                a.email as agentEmail,
                a.phone as agentPhoneNumber,
                p.name as productName,
                t.name as customerName,
                t.email as customerEmail,
                t.subject as ticketSubject,
                t.description as ticketDescription
            FROM calls c
            LEFT JOIN agents a ON c.agentId = a.id
            LEFT JOIN product p ON c.productId = p.productId
            LEFT JOIN tickets t ON c.ticketId = t.ticketId
            WHERE c.callId = ?
        `;

        connection.query(query, [callId], (err, result) => {
            if (err) {
                console.error('Error fetching call details:', err);
                return res.status(500).json({
                    message: "Error fetching call details",
                    error: err
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "Call not found"
                });
            }

            return res.json({
                message: "Call details fetched successfully",
                data: result[0]
            });
        });
    }

    // Fix existing numeric ticketIds to T001 format in assign-ticket table
    static fixAssignTicketIds(req, res) {
        // First, check what we have
        const checkQuery = `
            SELECT at.ticketId, t.ticketId as formatted_ticketId, t.id
            FROM \`assign-ticket\` at
            LEFT JOIN tickets t ON (at.ticketId = t.id OR at.ticketId = t.ticketId)
        `;

        connection.query(checkQuery, (checkErr, checkResult) => {
            if (checkErr) {
                return res.status(500).json({
                    message: "Error checking existing assign-ticket data",
                    error: checkErr
                });
            }

            // Update assign-ticket table to use formatted ticketIds (T001, T002, etc.)
            const updateQuery = `
                UPDATE \`assign-ticket\` at
                INNER JOIN tickets t ON (at.ticketId = t.id OR at.ticketId = CAST(t.id AS CHAR))
                SET at.ticketId = COALESCE(t.ticketId, CONCAT('T', LPAD(t.id, 3, '0')))
                WHERE at.ticketId REGEXP '^[0-9]+$'
            `;

            connection.query(updateQuery, (updateErr, updateResult) => {
                if (updateErr) {
                    return res.status(500).json({
                        message: "Error updating assign-ticket IDs",
                        error: updateErr
                    });
                }

                // Verify the update
                const verifyQuery = `
                    SELECT ticketId, agentId, status, importAction
                    FROM \`assign-ticket\`
                    ORDER BY ticketId
                `;

                connection.query(verifyQuery, (verifyErr, verifyResult) => {
                    if (verifyErr) {
                        return res.status(500).json({
                            message: "Error verifying the update",
                            error: verifyErr
                        });
                    }

                    return res.json({
                        message: "Assign ticket IDs fixed successfully",
                        data: {
                            updatedRows: updateResult.affectedRows,
                            beforeUpdate: checkResult,
                            afterUpdate: verifyResult
                        }
                    });
                });
            });
        });
    }

    // Update ticket status in all related tables (tickets, assign-ticket, calls)
    static updateAllTablesStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "Missing required field: status"
            });
        }

        try {
            // Update all three tables using ticketId
            // Update tickets table - status column using ticketId
            connection.query(
                "UPDATE tickets SET status = ? WHERE ticketId = ?",
                [status, id],
                (err, ticketsResult) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Error updating tickets table",
                            error: err
                        });
                    }

                    if (ticketsResult.affectedRows === 0) {
                        return res.status(404).json({
                            message: "Ticket not found"
                        });
                    }

                    // Update assign-ticket table - status column using ticketId
                    connection.query(
                        "UPDATE `assign-ticket` SET status = ? WHERE ticketId = ?",
                        [status, id],
                        (err, assignResult) => {
                            if (err) {
                                console.error('Error updating assign-ticket table:', err);
                            }

                            // Update calls table - ticketStatus column using ticketId
                            connection.query(
                                "UPDATE calls SET ticketStatus = ? WHERE ticketId = ?",
                                [status, id],
                                (err, callsResult) => {
                                    if (err) {
                                        console.error('Error updating calls table:', err);
                                    }

                                    return res.json({
                                        message: "Status updated successfully in all tables",
                                        data: {
                                            ticketId: id,
                                            status: status,
                                            updatedTables: {
                                                tickets: ticketsResult.affectedRows,
                                                assignTicket: assignResult ? assignResult.affectedRows : 0,
                                                calls: callsResult ? callsResult.affectedRows : 0
                                            }
                                        }
                                    });
                                }
                            );
                        }
                    );
                }
            );
        } catch (error) {
            console.error('Error in updateAllTablesStatus:', error);
            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }

    // Update ticket First Call Resolution
    static updateTicketFCR(req, res) {
        const { id } = req.params;
        const { firstCallResolution } = req.body;

        if (firstCallResolution === undefined || firstCallResolution === null) {
            return res.status(400).json({
                message: "Missing required field: firstCallResolution"
            });
        }

        try {
            connection.query(
                "UPDATE tickets SET firstCallResolution = ? WHERE id = ?",
                [firstCallResolution, id],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Error updating FCR",
                            error: err
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            message: "Ticket not found"
                        });
                    }

                    return res.json({
                        message: "First Call Resolution updated successfully",
                        data: {
                            ticketId: id,
                            firstCallResolution: firstCallResolution
                        }
                    });
                }
            );
        } catch (error) {
            console.error('Error in updateTicketFCR:', error);
            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }

    // Get all feedback (optionally filter by ticketId)
    static getFeedback(req, res) {
        try {
            const { ticketId } = req.query;

            let whereClause = '';
            let queryParams = [];

            if (ticketId) {
                whereClause = 'WHERE f.ticketId = ?';
                queryParams.push(ticketId);
            }

            const query = `
                SELECT
                    f.*,
                    t.ticketId,
                    t.ticketType,
                    t.productId,
                    p.productName,
                    t.name as customerName,
                    t.email as customerEmail,
                    a.agentName
                FROM feedbacks f
                LEFT JOIN tickets t ON f.ticketId = t.ticketId
                LEFT JOIN product p ON t.productId = p.productId
                LEFT JOIN \`assign-ticket\` at ON t.ticketId = at.ticketId
                LEFT JOIN agents a ON at.agentId = a.id
                ${whereClause}
                ORDER BY f.createdAt DESC
            `;

            connection.query(query, queryParams, (err, results) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error fetching feedback",
                        error: err
                    });
                }

                return res.json({
                    message: "Feedback fetched successfully",
                    data: results
                });
            });
        } catch (error) {
            console.error('Error in getFeedback:', error);
            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }

    // Get single feedback by ID
    static getFeedbackById(req, res) {
        const { id } = req.params;

        try {
            const query = `
                SELECT
                    f.*,
                    t.ticketId,
                    t.ticketType,
                    t.productId,
                    p.productName,
                    t.name as customerName,
                    t.email as customerEmail,
                    a.agentName
                FROM feedbacks f
                LEFT JOIN tickets t ON f.ticketId = t.ticketId
                LEFT JOIN product p ON t.productId = p.productId
                LEFT JOIN \`assign-ticket\` at ON t.ticketId = at.ticketId
                LEFT JOIN agents a ON at.agentId = a.id
                WHERE f.id = ?
            `;

            connection.query(query, [id], (err, results) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error fetching feedback",
                        error: err
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        message: "Feedback request not found"
                    });
                }

                return res.json({
                    message: "Feedback fetched successfully",
                    data: results[0]
                });
            });
        } catch (error) {
            console.error('Error in getFeedbackById:', error);
            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }

    // Request feedback from customer
    static requestFeedback(req, res) {
        const { ticketId, customerEmail, ratingScale, includeComments } = req.body;

        if (!ticketId || !customerEmail) {
            return res.status(400).json({
                message: "Missing required fields: ticketId, customerEmail"
            });
        }

        try {
            const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

            // Generate unique feedbackId (similar to ticketId generation)
            connection.query(
                "SELECT feedbackId FROM feedbacks ORDER BY id DESC LIMIT 1",
                (err, result) => {
                    let feedbackId = 'FB001';

                    if (!err && result && result.length > 0 && result[0].feedbackId) {
                        const lastId = result[0].feedbackId;
                        const numPart = parseInt(lastId.substring(2)) + 1;
                        feedbackId = 'FB' + String(numPart).padStart(3, '0');
                    }

                    const query = `
                        INSERT INTO feedbacks (feedbackId, ticketId, deliveryStatus, collectedTimestamp, createdAt, updatedAt)
                        VALUES (?, ?, 'pending', ?, ?, ?)
                    `;

                    connection.query(
                        query,
                        [feedbackId, ticketId, currentTimestamp, currentTimestamp, currentTimestamp],
                        (err, result) => {
                            if (err) {
                                return res.status(500).json({
                                    message: "Error creating feedback request",
                                    error: err
                                });
                            }

                            return res.json({
                                message: "Feedback request sent successfully",
                                data: {
                                    feedbackId: result.insertId,
                                    formattedFeedbackId: feedbackId,
                                    ticketId: ticketId,
                                    customerEmail: customerEmail,
                                    deliveryStatus: 'pending',
                                    collectedTimestamp: currentTimestamp
                                }
                            });
                        }
                    );
                }
            );
        } catch (error) {
            console.error('Error in requestFeedback:', error);
            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }

    // Update feedback with customer response
    static updateFeedbackResponse(req, res) {
        const { id } = req.params;
        const { rating, comments } = req.body;

        if (!rating) {
            return res.status(400).json({
                message: "Missing required field: rating"
            });
        }

        try {
            const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

            connection.query(
                "UPDATE feedbacks SET rating = ?, feedbackComment = ?, deliveryStatus = 'received', updatedAt = ? WHERE id = ?",
                [rating, comments || null, updatedAt, id],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Error updating feedback",
                            error: err
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            message: "Feedback request not found"
                        });
                    }

                    return res.json({
                        message: "Feedback response recorded successfully",
                        data: {
                            feedbackId: id,
                            rating: rating,
                            feedbackComment: comments,
                            deliveryStatus: 'received',
                            updatedAt: updatedAt
                        }
                    });
                }
            );
        } catch (error) {
            console.error('Error in updateFeedbackResponse:', error);
            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }

    // Update ticket details and sync to calls table
    static updateTicketDetails(req, res) {
        const { id } = req.params;
        const { subject, description, priority, followupDate, followupStatus, firstCallResolution, notes } = req.body;

        try {
            // First, get the ticket to find its ticketId
            connection.query(
                "SELECT id, ticketId FROM tickets WHERE id = ? OR ticketId = ?",
                [id, id],
                (err, ticketResult) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Error finding ticket",
                            error: err
                        });
                    }

                    if (!ticketResult || ticketResult.length === 0) {
                        return res.status(404).json({
                            message: "Ticket not found"
                        });
                    }

                    const ticketId = ticketResult[0].ticketId;
                    const numericId = ticketResult[0].id;

                    // Update tickets table - only update fields that exist in tickets table
                    const ticketUpdateFields = [];
                    const ticketUpdateValues = [];

                    if (subject !== undefined) {
                        ticketUpdateFields.push("subject = ?");
                        ticketUpdateValues.push(subject);
                    }
                    if (description !== undefined) {
                        ticketUpdateFields.push("description = ?");
                        ticketUpdateValues.push(description);
                    }

                    // Update tickets table if there are fields to update
                    const updateTicketsTable = (callback) => {
                        if (ticketUpdateFields.length > 0) {
                            ticketUpdateValues.push(numericId);
                            const ticketUpdateQuery = `UPDATE tickets SET ${ticketUpdateFields.join(", ")} WHERE id = ?`;

                            connection.query(ticketUpdateQuery, ticketUpdateValues, (updateErr) => {
                                if (updateErr) {
                                    return callback(updateErr);
                                }
                                callback(null);
                            });
                        } else {
                            callback(null);
                        }
                    };

                    // Execute tickets table update
                    updateTicketsTable((ticketsErr) => {
                        if (ticketsErr) {
                            return res.status(500).json({
                                message: "Error updating ticket",
                                error: ticketsErr
                            });
                        }

                        // Now update the calls table for this ticketId
                        const callUpdateFields = [];
                        const callUpdateValues = [];

                        if (followupDate !== undefined) {
                            callUpdateFields.push("followupDate = ?");
                            callUpdateValues.push(followupDate);
                        }
                        if (followupStatus !== undefined) {
                            callUpdateFields.push("followupStatus = ?");
                            callUpdateValues.push(followupStatus);

                            // Only set resolvedOn if status is being changed to 'resolved'
                            if (followupStatus === 'resolved') {
                                const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
                                callUpdateFields.push("resolvedOn = ?");
                                callUpdateValues.push(currentTimestamp);
                            } else if (followupStatus !== 'closed') {
                                // If status is changed to something other than resolved or closed, clear resolvedOn
                                // When transitioning to 'closed', preserve the existing resolvedOn date
                                callUpdateFields.push("resolvedOn = ?");
                                callUpdateValues.push(null);
                            }
                            // When followupStatus is 'closed', we don't update resolvedOn field,
                            // thus preserving the existing resolvedOn date
                        }
                        if (priority !== undefined) {
                            callUpdateFields.push("priority = ?");
                            callUpdateValues.push(priority);
                        }
                        if (firstCallResolution !== undefined) {
                            callUpdateFields.push("firstCall = ?");
                            callUpdateValues.push(firstCallResolution);
                        }
                        if (notes !== undefined && notes !== null) {
                            // Append new note to existing notes instead of replacing
                            // First, get existing notes
                            connection.query(
                                "SELECT notes FROM calls WHERE ticketId = ? ORDER BY id DESC LIMIT 1",
                                [ticketId],
                                (err, existingNotes) => {
                                    let appendedNotes = notes;

                                    if (!err && existingNotes && existingNotes.length > 0 && existingNotes[0].notes) {
                                        // Append new note with timestamp and separator
                                        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
                                        appendedNotes = existingNotes[0].notes + '\n\n--- ' + timestamp + ' ---\n' + notes;
                                    }

                                    callUpdateFields.push("notes = ?");
                                    callUpdateValues.push(appendedNotes);

                                    // Continue with the update
                                    executeCallUpdate();
                                }
                            );
                            return; // Exit early, executeCallUpdate will be called after getting existing notes
                        }

                        executeCallUpdate();

                        function executeCallUpdate() {
                            if (callUpdateFields.length > 0) {
                                callUpdateValues.push(ticketId);
                                const callUpdateQuery = `UPDATE calls SET ${callUpdateFields.join(", ")} WHERE ticketId = ?`;

                                connection.query(callUpdateQuery, callUpdateValues, (callUpdateErr) => {
                                    if (callUpdateErr) {
                                        console.error('Error updating calls table:', callUpdateErr);
                                    }

                                    return res.json({
                                        message: "Ticket details updated successfully",
                                        data: {
                                            ticketId: ticketId,
                                            updatedFields: {
                                                subject,
                                                description,
                                                priority,
                                                followupDate,
                                                followupStatus,
                                                firstCallResolution,
                                                notes
                                            }
                                        }
                                    });
                                });
                            } else {
                                return res.json({
                                    message: "Ticket details updated successfully",
                                    data: {
                                        ticketId: ticketId,
                                        updatedFields: {
                                            subject,
                                            description
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            );
        } catch (error) {
            console.error('Error in updateTicketDetails:', error);
            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }

    static cleanupResolvedOnDates(req, res) {
        try {
            const query = `
                UPDATE calls
                SET resolvedOn = NULL
                WHERE followupStatus IS NOT NULL
                AND followupStatus != 'resolved'
                AND resolvedOn IS NOT NULL
            `;

            connection.query(query, (err, result) => {
                if (err) {
                    console.error('Error cleaning up resolvedOn dates:', err);
                    return res.status(500).json({
                        message: "Error cleaning up resolvedOn dates",
                        error: err.message
                    });
                }

                return res.json({
                    message: "Successfully cleaned up resolvedOn dates",
                    rowsAffected: result.affectedRows
                });
            });
        } catch (error) {
            console.error('Error in cleanupResolvedOnDates:', error);
            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    }

    // Get analytics cards data with real backend calculations
    static async getAnalyticsCards(req, res) {
        try {
            const { dateRange, agents, products, status } = req.query;

            // Calculate date range filter
            let dateFilter = '';
            if (dateRange && dateRange !== 'custom') {
                const days = parseInt(dateRange);
                dateFilter = `AND t.createdAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`;
            }

            // Build filter conditions
            let agentFilter = '';
            if (agents && agents.length > 0) {
                const agentList = Array.isArray(agents) ? agents : [agents];
                const agentPlaceholders = agentList.map(() => '?').join(',');
                agentFilter = `AND EXISTS (
                    SELECT 1 FROM \`assign-ticket\` at
                    JOIN agents a ON at.agentId = a.id
                    WHERE at.ticketId = t.ticketId
                    AND a.agentName IN (${agentPlaceholders})
                )`;
            }

            let productFilter = '';
            if (products && products.length > 0) {
                const productList = Array.isArray(products) ? products : [products];
                const productPlaceholders = productList.map(() => '?').join(',');
                productFilter = `AND t.productId IN (${productPlaceholders})`;
            }

            let statusFilter = '';
            if (status && status.length > 0) {
                const statusList = Array.isArray(status) ? status : [status];
                const statusPlaceholders = statusList.map(() => '?').join(',');
                statusFilter = `AND t.status IN (${statusPlaceholders})`;
            }

            // Get parameters for queries
            const queryParams = [];
            if (agents && agents.length > 0) {
                const agentList = Array.isArray(agents) ? agents : [agents];
                queryParams.push(...agentList);
            }
            if (products && products.length > 0) {
                const productList = Array.isArray(products) ? products : [products];
                queryParams.push(...productList);
            }
            if (status && status.length > 0) {
                const statusList = Array.isArray(status) ? status : [status];
                queryParams.push(...statusList);
            }

            // 1. Total Tickets Count
            const totalTicketsQuery = `
                SELECT COUNT(*) as total
                FROM tickets t
                WHERE 1=1 ${dateFilter} ${agentFilter} ${productFilter} ${statusFilter}
            `;

            // 2. Average Resolution Time (in minutes) - from calls data
            const avgResolutionTimeQuery = `
                SELECT
                    AVG(
                        CASE
                            WHEN c.resolvedOn IS NOT NULL AND c.startTime IS NOT NULL THEN
                                TIMESTAMPDIFF(MINUTE, c.startTime, c.resolvedOn)
                            WHEN c.endTime IS NOT NULL AND c.startTime IS NOT NULL THEN
                                TIMESTAMPDIFF(MINUTE, c.startTime, c.endTime)
                            ELSE NULL
                        END
                    ) as avgResolutionTimeMinutes
                FROM tickets t
                LEFT JOIN calls c ON t.ticketId = c.ticketId AND c.callStatus = 'completed'
                WHERE (t.status = 'Resolved' OR t.status = 'Closed')
                  AND (c.resolvedOn IS NOT NULL OR c.endTime IS NOT NULL)
                  ${dateFilter} ${agentFilter} ${productFilter} ${statusFilter}
            `;

            // 3. First-Call-Resolution Rate
            const fcrQuery = `
                SELECT
                    COUNT(DISTINCT t.ticketId) as totalTickets,
                    COUNT(DISTINCT CASE WHEN c.firstCall = 1 THEN t.ticketId END) as fcrTickets,
                    (COUNT(DISTINCT CASE WHEN c.firstCall = 1 THEN t.ticketId END) / COUNT(DISTINCT t.ticketId)) * 100 as fcrRate
                FROM tickets t
                LEFT JOIN calls c ON t.ticketId = c.ticketId
                WHERE 1=1 ${dateFilter} ${agentFilter} ${productFilter} ${statusFilter}
            `;

            // 4. Average Customer Satisfaction from feedbacks table
            const avgCsatQuery = `
                SELECT
                    AVG(f.rating) as avgCsat,
                    COUNT(f.rating) as totalRatings
                FROM feedbacks f
                LEFT JOIN tickets t ON f.ticketId = t.ticketId
                WHERE f.rating IS NOT NULL
                  ${dateFilter} ${agentFilter} ${productFilter} ${statusFilter}
            `;

            // 5. Callback Completion Rate from calls table
            const callbackCompletionQuery = `
                SELECT
                    COUNT(*) as totalCalls,
                    COUNT(CASE WHEN c.callStatus = 'completed' THEN 1 END) as completedCalls,
                    (COUNT(CASE WHEN c.callStatus = 'completed' THEN 1 END) / COUNT(*)) * 100 as completionRate
                FROM calls c
                LEFT JOIN tickets t ON c.ticketId = t.ticketId
                WHERE 1=1 ${dateFilter} ${agentFilter} ${productFilter}
            `;

            // Execute all queries in parallel
            const promises = [
                new Promise((resolve, reject) => {
                    connection.query(totalTicketsQuery, queryParams, (err, result) => {
                        if (err) reject(err);
                        else resolve(result[0]?.total || 0);
                    });
                }),
                new Promise((resolve, reject) => {
                    connection.query(avgResolutionTimeQuery, queryParams, (err, result) => {
                        if (err) reject(err);
                        else resolve({
                            minutes: Math.round(result[0]?.avgResolutionTimeMinutes || 0),
                            hours: Math.round((result[0]?.avgResolutionTimeMinutes || 0) / 60 * 10) / 10
                        });
                    });
                }),
                new Promise((resolve, reject) => {
                    connection.query(fcrQuery, queryParams, (err, result) => {
                        if (err) reject(err);
                        else resolve({
                            rate: Math.round(result[0]?.fcrRate || 0 * 10) / 10,
                            total: result[0]?.totalTickets || 0,
                            fcr: result[0]?.fcrTickets || 0
                        });
                    });
                }),
                new Promise((resolve, reject) => {
                    connection.query(avgCsatQuery, queryParams, (err, result) => {
                        if (err) reject(err);
                        else resolve({
                            score: Math.round((result[0]?.avgCsat || 0) * 10) / 10,
                            totalRatings: result[0]?.totalRatings || 0
                        });
                    });
                }),
                new Promise((resolve, reject) => {
                    connection.query(callbackCompletionQuery, queryParams, (err, result) => {
                        if (err) reject(err);
                        else resolve({
                            rate: Math.round(result[0]?.completionRate || 0 * 10) / 10,
                            total: result[0]?.totalCalls || 0,
                            completed: result[0]?.completedCalls || 0
                        });
                    });
                })
            ];

            const results = await Promise.all(promises);

            const analyticsData = {
                totalTickets: results[0],
                avgResolutionTime: results[1],
                firstCallResolution: results[2],
                avgCustomerSatisfaction: results[3],
                callbackCompletionRate: results[4],
                filters: {
                    dateRange: dateRange || '30',
                    agents: agents || [],
                    products: products || [],
                    status: status || []
                }
            };

            return res.json({
                message: "Analytics cards data fetched successfully",
                data: analyticsData
            });

        } catch (error) {
            console.error('Error in getAnalyticsCards:', error);
            return res.status(500).json({
                message: "Error fetching analytics cards data",
                error: error.message
            });
        }
    }

    // Get ticket trends data for line chart (created vs resolved over time)
    static async getTicketTrends(req, res) {
        try {
            const { dateRange, agents, products, status } = req.query;

            // Calculate date range filter
            let days = 30; // default
            if (dateRange && dateRange !== 'custom') {
                days = parseInt(dateRange);
            }

            // Build filter conditions
            let agentFilter = '';
            let productFilter = '';
            let statusFilter = '';
            const queryParams = [days];

            if (agents && agents.length > 0) {
                const agentList = Array.isArray(agents) ? agents : [agents];
                const agentPlaceholders = agentList.map(() => '?').join(',');
                agentFilter = `AND EXISTS (
                    SELECT 1 FROM \`assign-ticket\` at
                    JOIN agents a ON at.agentId = a.id
                    WHERE at.ticketId = t.ticketId
                    AND a.agentName IN (${agentPlaceholders})
                )`;
                queryParams.push(...agentList);
            }

            if (products && products.length > 0) {
                const productList = Array.isArray(products) ? products : [products];
                const productPlaceholders = productList.map(() => '?').join(',');
                productFilter = `AND t.productId IN (${productPlaceholders})`;
                queryParams.push(...productList);
            }

            if (status && status.length > 0) {
                const statusList = Array.isArray(status) ? status : [status];
                const statusPlaceholders = statusList.map(() => '?').join(',');
                statusFilter = `AND t.status IN (${statusPlaceholders})`;
                queryParams.push(...statusList);
            }

            // Query to get tickets created per day
            const createdQuery = `
                SELECT
                    DATE(t.createdAt) as date,
                    COUNT(*) as count
                FROM tickets t
                WHERE t.createdAt >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                ${agentFilter}
                ${productFilter}
                ${statusFilter}
                GROUP BY DATE(t.createdAt)
                ORDER BY date ASC
            `;

            // Query to get tickets resolved per day (from calls table)
            const resolvedQuery = `
                SELECT
                    DATE(c.resolvedOn) as date,
                    COUNT(DISTINCT t.ticketId) as count
                FROM tickets t
                LEFT JOIN calls c ON t.ticketId = c.ticketId
                WHERE c.resolvedOn >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                AND c.resolvedOn IS NOT NULL
                ${agentFilter}
                ${productFilter}
                ${statusFilter}
                GROUP BY DATE(c.resolvedOn)
                ORDER BY date ASC
            `;

            // Execute both queries
            const [createdResults, resolvedResults] = await Promise.all([
                new Promise((resolve, reject) => {
                    connection.query(createdQuery, queryParams, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                }),
                new Promise((resolve, reject) => {
                    connection.query(resolvedQuery, queryParams, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                })
            ]);

            // Generate date labels for the last N days
            const labels = [];
            const createdData = [];
            const resolvedData = [];

            // Create maps for quick lookup
            const createdMap = new Map(createdResults.map(r => [r.date.toISOString().split('T')[0], r.count]));
            const resolvedMap = new Map(resolvedResults.map(r => [r.date.toISOString().split('T')[0], r.count]));

            // Generate data for each day
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                // Format label based on days
                let label;
                if (days <= 7) {
                    // For 7 days, show day names
                    label = date.toLocaleDateString('en-US', { weekday: 'short' });
                } else {
                    // For longer periods, show month/day
                    label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }

                labels.push(label);
                createdData.push(createdMap.get(dateStr) || 0);
                resolvedData.push(resolvedMap.get(dateStr) || 0);
            }

            return res.json({
                message: "Ticket trends data fetched successfully",
                data: {
                    labels,
                    created: createdData,
                    resolved: resolvedData
                }
            });

        } catch (error) {
            console.error('Error in getTicketTrends:', error);
            return res.status(500).json({
                message: "Error fetching ticket trends data",
                error: error.message
            });
        }
    }

    // Get resolution time distribution data
    static async getResolutionTimeDistribution(req, res) {
        try {
            const { dateRange, agents, products, status } = req.query;

            // Calculate date range filter
            let days = 30; // default
            if (dateRange && dateRange !== 'custom') {
                days = parseInt(dateRange);
            }

            // Build filter conditions
            let agentFilter = '';
            let productFilter = '';
            let statusFilter = '';
            const queryParams = [days];

            if (agents && agents.length > 0) {
                const agentList = Array.isArray(agents) ? agents : [agents];
                const agentPlaceholders = agentList.map(() => '?').join(',');
                agentFilter = `AND EXISTS (
                    SELECT 1 FROM \`assign-ticket\` at
                    JOIN agents a ON at.agentId = a.id
                    WHERE at.ticketId = t.ticketId
                    AND a.agentName IN (${agentPlaceholders})
                )`;
                queryParams.push(...agentList);
            }

            if (products && products.length > 0) {
                const productList = Array.isArray(products) ? products : [products];
                const productPlaceholders = productList.map(() => '?').join(',');
                productFilter = `AND t.productId IN (${productPlaceholders})`;
                queryParams.push(...productList);
            }

            if (status && status.length > 0) {
                const statusList = Array.isArray(status) ? status : [status];
                const statusPlaceholders = statusList.map(() => '?').join(',');
                statusFilter = `AND t.status IN (${statusPlaceholders})`;
                queryParams.push(...statusList);
            }

            // Query to get resolution time distribution
            // Use subquery to get only the most recent call per ticket to avoid duplicate counting
            const query = `
                SELECT
                    CASE
                        WHEN TIMESTAMPDIFF(MINUTE, latest_call.startTime,
                            COALESCE(latest_call.resolvedOn, latest_call.endTime)) < 60 THEN 'under_1_hour'
                        WHEN TIMESTAMPDIFF(MINUTE, latest_call.startTime,
                            COALESCE(latest_call.resolvedOn, latest_call.endTime)) >= 60
                            AND TIMESTAMPDIFF(MINUTE, latest_call.startTime,
                            COALESCE(latest_call.resolvedOn, latest_call.endTime)) < 240 THEN '1_to_4_hours'
                        WHEN TIMESTAMPDIFF(MINUTE, latest_call.startTime,
                            COALESCE(latest_call.resolvedOn, latest_call.endTime)) >= 240
                            AND TIMESTAMPDIFF(MINUTE, latest_call.startTime,
                            COALESCE(latest_call.resolvedOn, latest_call.endTime)) < 1440 THEN '4_to_24_hours'
                        WHEN TIMESTAMPDIFF(MINUTE, latest_call.startTime,
                            COALESCE(latest_call.resolvedOn, latest_call.endTime)) >= 1440 THEN 'over_24_hours'
                        ELSE 'unknown'
                    END as timeRange,
                    COUNT(DISTINCT t.ticketId) as count
                FROM tickets t
                INNER JOIN (
                    SELECT c1.ticketId, c1.startTime, c1.resolvedOn, c1.endTime, c1.createdAt
                    FROM calls c1
                    INNER JOIN (
                        SELECT ticketId, MAX(id) as maxId
                        FROM calls
                        WHERE startTime IS NOT NULL
                        AND (resolvedOn IS NOT NULL OR endTime IS NOT NULL)
                        AND createdAt >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                        GROUP BY ticketId
                    ) c2 ON c1.ticketId = c2.ticketId AND c1.id = c2.maxId
                ) latest_call ON t.ticketId = latest_call.ticketId
                WHERE 1=1
                ${agentFilter}
                ${productFilter}
                ${statusFilter}
                GROUP BY timeRange
            `;

            connection.query(query, queryParams, (err, result) => {
                if (err) {
                    console.error('Error in getResolutionTimeDistribution query:', err);
                    return res.status(500).json({
                        message: "Error fetching resolution time distribution data",
                        error: err.message
                    });
                }

                // Initialize all time ranges with 0
                const distribution = {
                    'under_1_hour': 0,
                    '1_to_4_hours': 0,
                    '4_to_24_hours': 0,
                    'over_24_hours': 0
                };

                // Fill in the actual counts
                result.forEach(row => {
                    if (row.timeRange !== 'unknown') {
                        distribution[row.timeRange] = row.count;
                    }
                });

                return res.json({
                    message: "Resolution time distribution data fetched successfully",
                    data: distribution
                });
            });

        } catch (error) {
            console.error('Error in getResolutionTimeDistribution:', error);
            return res.status(500).json({
                message: "Error fetching resolution time distribution data",
                error: error.message
            });
        }
    }

    // Get customer satisfaction distribution data from feedbacks table
    static async getCustomerSatisfactionDistribution(req, res) {
        try {
            const { dateRange, agents, products, status } = req.query;

            // Calculate date range filter
            let days = 30; // default
            if (dateRange && dateRange !== 'custom') {
                days = parseInt(dateRange);
            }

            // Build filter conditions
            let agentFilter = '';
            let productFilter = '';
            let statusFilter = '';
            const queryParams = [days];

            if (agents && agents.length > 0) {
                const agentList = Array.isArray(agents) ? agents : [agents];
                const agentPlaceholders = agentList.map(() => '?').join(',');
                agentFilter = `AND EXISTS (
                    SELECT 1 FROM \`assign-ticket\` at
                    JOIN agents a ON at.agentId = a.id
                    WHERE at.ticketId = t.ticketId
                    AND a.agentName IN (${agentPlaceholders})
                )`;
                queryParams.push(...agentList);
            }

            if (products && products.length > 0) {
                const productList = Array.isArray(products) ? products : [products];
                const productPlaceholders = productList.map(() => '?').join(',');
                productFilter = `AND t.productId IN (${productPlaceholders})`;
                queryParams.push(...productList);
            }

            if (status && status.length > 0) {
                const statusList = Array.isArray(status) ? status : [status];
                const statusPlaceholders = statusList.map(() => '?').join(',');
                statusFilter = `AND t.status IN (${statusPlaceholders})`;
                queryParams.push(...statusList);
            }

            // Query to get customer satisfaction distribution from feedbacks table
            const query = `
                SELECT
                    f.rating,
                    COUNT(*) as count
                FROM feedbacks f
                LEFT JOIN tickets t ON f.ticketId = t.ticketId
                WHERE f.rating IS NOT NULL
                AND f.rating BETWEEN 1 AND 5
                AND f.createdAt >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                ${agentFilter}
                ${productFilter}
                ${statusFilter}
                GROUP BY f.rating
                ORDER BY f.rating DESC
            `;

            connection.query(query, queryParams, (err, result) => {
                if (err) {
                    console.error('Error in getCustomerSatisfactionDistribution query:', err);
                    return res.status(500).json({
                        message: "Error fetching customer satisfaction distribution data",
                        error: err.message
                    });
                }

                // Initialize distribution as an object with numeric values
                const distribution = {};

                // Initialize all ratings with 0
                for (let i = 1; i <= 5; i++) {
                    distribution[i] = 0;
                }

                // Fill in the actual counts
                result.forEach(row => {
                    const rating = parseInt(row.rating);
                    if (rating >= 1 && rating <= 5) {
                        distribution[rating] = parseInt(row.count);
                    }
                });

                return res.json({
                    message: "Customer satisfaction distribution data fetched successfully",
                    data: distribution
                });
            });

        } catch (error) {
            console.error('Error in getCustomerSatisfactionDistribution:', error);
            return res.status(500).json({
                message: "Error fetching customer satisfaction distribution data",
                error: error.message
            });
        }
    }

    // Get agent performance data
    static async getAgentPerformance(req, res) {
        try {
            const { dateRange, products, status } = req.query;

            // Calculate date range filter
            let days = 30; // default
            if (dateRange && dateRange !== 'custom') {
                days = parseInt(dateRange);
            }

            let dateFilter = `AND t.createdAt >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)`;

            // Build filter conditions
            let productFilter = '';
            const queryParams = [];

            if (products && products.length > 0) {
                const productList = Array.isArray(products) ? products : [products];
                const productPlaceholders = productList.map(() => '?').join(',');
                productFilter = `AND t.productId IN (${productPlaceholders})`;
                queryParams.push(...productList);
            }

            let statusFilter = '';
            if (status && status.length > 0) {
                const statusList = Array.isArray(status) ? status : [status];
                const statusPlaceholders = statusList.map(() => '?').join(',');
                statusFilter = `AND t.status IN (${statusPlaceholders})`;
                queryParams.push(...statusList);
            }

            // Query to get agent performance data
            const query = `
                SELECT
                    a.id as agentId,
                    a.agentName,
                    COUNT(DISTINCT at.ticketId) as assigned,
                    COUNT(DISTINCT CASE WHEN t.status IN ('Resolved', 'Closed') THEN at.ticketId END) as resolved,
                    AVG(
                        CASE
                            WHEN c.resolvedOn IS NOT NULL AND c.startTime IS NOT NULL THEN
                                TIMESTAMPDIFF(MINUTE, c.startTime, c.resolvedOn)
                            WHEN c.endTime IS NOT NULL AND c.startTime IS NOT NULL THEN
                                TIMESTAMPDIFF(MINUTE, c.startTime, c.endTime)
                            ELSE NULL
                        END
                    ) as avgResolutionTime,
                    (COUNT(DISTINCT CASE WHEN c.firstCall = 1 THEN at.ticketId END) /
                     NULLIF(COUNT(DISTINCT at.ticketId), 0)) * 100 as fcrRate,
                    AVG(f.rating) as avgCsat,
                    COUNT(DISTINCT f.id) as csatCount
                FROM agents a
                LEFT JOIN \`assign-ticket\` at ON a.id = at.agentId
                LEFT JOIN tickets t ON at.ticketId = t.ticketId
                LEFT JOIN calls c ON t.ticketId = c.ticketId AND (c.resolvedOn IS NOT NULL OR c.endTime IS NOT NULL)
                LEFT JOIN feedbacks f ON t.ticketId = f.ticketId AND f.rating IS NOT NULL
                WHERE 1=1
                ${dateFilter}
                ${productFilter}
                ${statusFilter}
                GROUP BY a.id, a.agentName
                HAVING assigned > 0
                ORDER BY resolved DESC, avgCsat DESC
            `;

            connection.query(query, queryParams, (err, result) => {
                if (err) {
                    console.error('Error in getAgentPerformance query:', err);
                    return res.status(500).json({
                        message: "Error fetching agent performance data",
                        error: err.message
                    });
                }

                // Format the data
                const agentPerformance = result.map((row, index) => ({
                    id: row.agentId,
                    rank: index + 1,
                    name: row.agentName,
                    assigned: row.assigned || 0,
                    resolved: row.resolved || 0,
                    resolutionTime: Math.round(row.avgResolutionTime || 0),
                    fcrRate: Math.round((row.fcrRate || 0) * 10) / 10,
                    csatRating: Math.round((row.avgCsat || 0) * 10) / 10,
                    csatCount: row.csatCount || 0
                }));

                return res.json({
                    message: "Agent performance data fetched successfully",
                    data: agentPerformance
                });
            });

        } catch (error) {
            console.error('Error in getAgentPerformance:', error);
            return res.status(500).json({
                message: "Error fetching agent performance data",
                error: error.message
            });
        }
    }

    // Get call statistics data
    static async getCallStatistics(req, res) {
        try {
            const { dateRange, agents, products } = req.query;

            // Calculate date range filter
            let dateFilter = '';
            if (dateRange && dateRange !== 'custom') {
                const days = parseInt(dateRange);
                dateFilter = `AND c.createdAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`;
            }

            // Build filter conditions
            let agentFilter = '';
            if (agents && agents.length > 0) {
                const agentList = Array.isArray(agents) ? agents : [agents];
                const agentPlaceholders = agentList.map(() => '?').join(',');
                agentFilter = `AND c.agentId IN (
                    SELECT id FROM agents WHERE agentName IN (${agentPlaceholders})
                )`;
            }

            let productFilter = '';
            if (products && products.length > 0) {
                const productList = Array.isArray(products) ? products : [products];
                const productPlaceholders = productList.map(() => '?').join(',');
                productFilter = `AND t.productId IN (${productPlaceholders})`;
            }

            // Get parameters for queries
            const queryParams = [];
            if (agents && agents.length > 0) {
                const agentList = Array.isArray(agents) ? agents : [agents];
                queryParams.push(...agentList);
            }
            if (products && products.length > 0) {
                const productList = Array.isArray(products) ? products : [products];
                queryParams.push(...productList);
            }

            // 1. Total calls by type (inbound/outbound)
            const totalCallsQuery = `
                SELECT
                    COUNT(*) as totalCalls,
                    COUNT(CASE WHEN c.callType = 'inbound' THEN 1 END) as inboundCalls,
                    COUNT(CASE WHEN c.callType = 'outbound' THEN 1 END) as outboundCalls
                FROM calls c
                LEFT JOIN tickets t ON c.ticketId = t.ticketId
                WHERE 1=1 ${dateFilter} ${agentFilter} ${productFilter}
            `;

            // 2. Average call duration (in minutes)
            const avgCallDurationQuery = `
                SELECT
                    AVG(
                        CASE
                            WHEN c.endTime IS NOT NULL AND c.startTime IS NOT NULL THEN
                                TIMESTAMPDIFF(MINUTE, c.startTime, c.endTime)
                            ELSE NULL
                        END
                    ) as avgDurationMinutes,
                    AVG(
                        CASE
                            WHEN c.endTime IS NOT NULL AND c.startTime IS NOT NULL THEN
                                TIMESTAMPDIFF(SECOND, c.startTime, c.endTime)
                            ELSE NULL
                        END
                    ) as avgDurationSeconds
                FROM calls c
                LEFT JOIN tickets t ON c.ticketId = t.ticketId
                WHERE c.startTime IS NOT NULL
                  AND c.endTime IS NOT NULL
                  ${dateFilter} ${agentFilter} ${productFilter}
            `;

            // 3. Missed calls and callbacks count
            const missedCallsQuery = `
                SELECT
                    COUNT(CASE WHEN c.callStatus = 'missed' THEN 1 END) as missedCalls,
                    COUNT(*) as totalCallsWithStatus
                FROM calls c
                LEFT JOIN tickets t ON c.ticketId = t.ticketId
                WHERE 1=1 ${dateFilter} ${agentFilter} ${productFilter}
            `;

            // 4. Call completion rate
            const callCompletionQuery = `
                SELECT
                    COUNT(*) as totalCalls,
                    COUNT(CASE WHEN c.callStatus = 'completed' THEN 1 END) as completedCalls,
                    (COUNT(CASE WHEN c.callStatus = 'completed' THEN 1 END) / COUNT(*)) * 100 as completionRate
                FROM calls c
                LEFT JOIN tickets t ON c.ticketId = t.ticketId
                WHERE 1=1 ${dateFilter} ${agentFilter} ${productFilter}
            `;

            // Execute all queries in parallel
            const promises = [
                new Promise((resolve, reject) => {
                    connection.query(totalCallsQuery, queryParams, (err, result) => {
                        if (err) reject(err);
                        else resolve({
                            total: result[0]?.totalCalls || 0,
                            inbound: result[0]?.inboundCalls || 0,
                            outbound: result[0]?.outboundCalls || 0
                        });
                    });
                }),
                new Promise((resolve, reject) => {
                    connection.query(avgCallDurationQuery, queryParams, (err, result) => {
                        if (err) reject(err);
                        else {
                            const minutes = result[0]?.avgDurationMinutes || 0;
                            const seconds = result[0]?.avgDurationSeconds || 0;
                            resolve({
                                minutes: Math.round(minutes * 10) / 10,
                                seconds: Math.round(seconds),
                                formatted: `${Math.floor(minutes)}m ${Math.round(seconds % 60)}s`
                            });
                        }
                    });
                }),
                new Promise((resolve, reject) => {
                    connection.query(missedCallsQuery, queryParams, (err, result) => {
                        if (err) reject(err);
                        else resolve({
                            missed: result[0]?.missedCalls || 0,
                            total: result[0]?.totalCallsWithStatus || 0
                        });
                    });
                }),
                new Promise((resolve, reject) => {
                    connection.query(callCompletionQuery, queryParams, (err, result) => {
                        if (err) reject(err);
                        else resolve({
                            completionRate: Math.round((result[0]?.completionRate || 0) * 10) / 10,
                            total: result[0]?.totalCalls || 0,
                            completed: result[0]?.completedCalls || 0
                        });
                    });
                })
            ];

            const results = await Promise.all(promises);

            const callStatistics = {
                totalCalls: results[0],
                avgCallDuration: results[1],
                missedCalls: results[2],
                callCompletionRate: results[3],
                filters: {
                    dateRange: dateRange || '30',
                    agents: agents || [],
                    products: products || []
                }
            };

            return res.json({
                message: "Call statistics data fetched successfully",
                data: callStatistics
            });

        } catch (error) {
            console.error('Error in getCallStatistics:', error);
            return res.status(500).json({
                message: "Error fetching call statistics data",
                error: error.message
            });
        }
    }
}
