import connection from "../config/index.js";

export class ticketController {
    // Helper function to log activity
    static logActivity(ticketId, actionType, description, metadata = {}) {
        return new Promise((resolve, reject) => {
            const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

            const activityData = {
                ticketId: ticketId,
                actionType: actionType,
                description: description,
                previousStatus: metadata.previousStatus || null,
                currentStatus: metadata.currentStatus || null,
                statusUpdatedAt: metadata.statusUpdatedAt || currentTimestamp,
                productId: metadata.productId || null,
                agentId: metadata.agentId || null,
                agentName: metadata.agentName || null,
                callId: metadata.callId || null,
                callStatus: metadata.callStatus || null,
                callType: metadata.callType || null,
                ticketType: metadata.ticketType || null,
                followUpDate: metadata.followUpDate || null,
                followUpStatus: metadata.followUpStatus || null,
                feedbackId: metadata.feedbackId || null,
                additionalInfo: metadata.additionalInfo ? JSON.stringify(metadata.additionalInfo) : null,
                createdAt: currentTimestamp
            };

            connection.query(
                "INSERT INTO activity_log SET ?",
                activityData,
                (err, result) => {
                    if (err) {
                        console.error('Error logging activity:', err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

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

    // Get activity logs for a ticket
    static getActivityLogs(req, res) {
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

            // Now get activity logs for this ticketId
            const query = `
                SELECT
                    al.*,
                    a.agentName as agentNameFromAgents
                FROM activity_log al
                LEFT JOIN agents a ON al.agentId = a.id
                WHERE al.ticketId = ?
                ORDER BY al.createdAt DESC
            `;

            connection.query(query, [ticketId], (err, result) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error fetching activity logs",
                        error: err
                    });
                }

                return res.json({
                    message: "Activity logs fetched successfully",
                    data: result || []
                });
            });
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

           connection.query("INSERT INTO tickets SET ?", dbTicketData, async (err, result) => {
           if (err) {
            return res.json({
                message: "Error creating ticket",
                error: err
            })
           } else {
              // Log activity for ticket creation
              try {
                  await ticketController.logActivity(
                      ticketId,
                      'ticket_created',
                      `Ticket ${ticketId} created by ${name}`,
                      {
                          currentStatus: 'created',
                          ticketType: ticketType || 'freshdesk',
                          productId: productId,
                          additionalInfo: {
                              subject: subject
                          }
                      }
                  );
              } catch (logErr) {
                  console.error('Error logging ticket creation:', logErr);
              }

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
        let { productId, userId, name, email, countryCode, phone, subject, description, agentId, agentName, agentPhone, callType, callId } = req.body;

        // console.log('=== CREATE CALL TICKET REQUEST ===');
        // console.log('Request body:', req.body);
        // console.log('CallId from frontend:', callId);
        // console.log('Agent details:', { agentId, agentName, agentPhone });

        // Validate required fields (name can be fetched from callback table)
        if (!phone || !subject || !description) {
            return res.status(400).json({
                message: "Missing required fields",
                required: ['phone', 'subject', 'description']
            });
        }

        try {
            // Combine country code and phone for checking existing tickets
            const fullPhone = countryCode ? countryCode + ' ' + phone : phone;

            // If name is not provided, try to fetch from callback table using phone number
            if (!name) {
                const callbackData = await new Promise((resolve, reject) => {
                    connection.query(
                        "SELECT name, email FROM callback WHERE phone = ? OR phone LIKE ? ORDER BY createdAt DESC LIMIT 1",
                        [fullPhone, `%${phone}%`],
                        (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        }
                    );
                });

                if (callbackData.length > 0) {
                    name = callbackData[0].name;
                    // Also use email from callback if not provided
                    if (!email && callbackData[0].email) {
                        email = callbackData[0].email;
                    }
                    console.log('Fetched customer data from callback table:', { name, email });
                }
            }

            // If name is still not available, return error
            if (!name) {
                return res.status(400).json({
                    message: "Customer name is required and could not be found in callback table",
                    required: ['name']
                });
            }

            // Check for existing tickets/calls with this phone number
            const existingRecords = await new Promise((resolve, reject) => {
                connection.query(
                    `SELECT
                        t.ticketId, t.status as ticketStatus, t.productId,
                        c.callId, c.callStatus, c.agentId, c.ticketId as callTicketId,
                        a.agentName
                    FROM tickets t
                    LEFT JOIN calls c ON t.ticketId = c.ticketId
                    LEFT JOIN agents a ON c.agentId = a.agentId
                    WHERE t.phone = ?
                    ORDER BY t.createdAt DESC
                    LIMIT 1`,
                    [fullPhone],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });

            console.log('Existing records for phone:', fullPhone, existingRecords);

            // Scenario 2: If ticket/call exists and is NOT resolved/completed
            if (existingRecords.length > 0) {
                const existingRecord = existingRecords[0];
                const isTicketOpen = existingRecord.ticketStatus &&
                    !['resolved', 'closed'].includes(existingRecord.ticketStatus.toLowerCase());
                const isCallOpen = existingRecord.callStatus &&
                    !['resolved', 'completed'].includes(existingRecord.callStatus.toLowerCase());

                if (isTicketOpen || isCallOpen) {
                    // Scenario 2: Reuse existing ticket and agent, but create NEW call record
                    console.log('Reusing existing ticket and agent:', existingRecord);

                    // Create a NEW call record with new callId linked to existing ticketId
                    if (callId) {
                        const newCallData = {
                            callId: callId,
                            ticketId: existingRecord.ticketId,
                            userPhone: fullPhone,
                            productId: productId || existingRecord.productId,
                            agentId: agentId || existingRecord.agentId,
                            agentPhone: agentPhone || null,
                            callStatus: 'pending',
                            ticketStatus: existingRecord.ticketStatus || 'assigned',
                            recordingUrl: null,
                            callType: callType || 'inbound',
                            reason: subject,
                            callDescription: description,
                            startTime: null,
                            endTime: null,
                            resolvedOn: null,
                            followupStatus: 'pending',
                            followupDate: new Date().toISOString().slice(0, 19).replace('T', ' ')
                        };

                        await new Promise((resolve, reject) => {
                            connection.query("INSERT INTO calls SET ?", newCallData, (err, result) => {
                                if (err) reject(err);
                                else resolve(result);
                            });
                        });
                    }

                    return res.json({
                        message: "Connected to existing ticket",
                        reuseExisting: true,
                        data: {
                            ticketId: existingRecord.ticketId,
                            callId: callId,
                            agentId: agentId || existingRecord.agentId,
                            agentName: existingRecord.agentName,
                            existingTicket: true
                        }
                    });
                }
            }

            // Scenario 1: Create new ticket (either no existing records or previous was resolved/completed)
            console.log('Creating new ticket - no open tickets found');

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
                            endTime: null,
                            resolvedOn: null,
                            followupStatus: 'pending',
                            followupDate: new Date().toISOString().slice(0, 19).replace('T', ' ')
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

                    // Log activity for call ticket creation
                    try {
                        await ticketController.logActivity(
                            ticketId,
                            'ticket_created',
                            `Call ticket ${ticketId} created and assigned to ${agentName || 'agent'}`,
                            {
                                currentStatus: 'assigned',
                                productId: productId,
                                agentId: agentId,
                                agentName: agentName,
                                callId: finalCallId,
                                callStatus: 'pending',
                                callType: callType || 'inbound',
                                ticketType: 'call',
                                additionalInfo: {
                                    subject: subject
                                }
                            }
                        );
                    } catch (logErr) {
                        console.error('Error logging call ticket creation:', logErr);
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

        // First, resolve ticket by numeric id or ticketId (e.g., T001) and get current status
        const getTicketQuery = `SELECT id, ticketId, status FROM tickets WHERE id = ? OR ticketId = ?`;

        connection.query(getTicketQuery, [id, id], async (getErr, ticketResult) => {
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
            const previousStatus = ticketResult[0].status;

            // Step 1: update tickets table
            connection.query(
                `UPDATE tickets SET status = ? WHERE id = ?`,
                [status, numericId],
                async (updateErr, updateResult) => {
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

                    // Log activity for status update
                    try {
                        await ticketController.logActivity(
                            formattedTicketId,
                            'status_updated',
                            `Ticket status changed from ${previousStatus} to ${status}`,
                            {
                                previousStatus: previousStatus,
                                currentStatus: status
                            }
                        );
                    } catch (logErr) {
                        console.error('Error logging status update:', logErr);
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

                    connection.query(updateCallsQuery, [agentId, formattedTicketId, numericTicketId], async (callsErr) => {
                        if (callsErr) {
                            console.log('Warning: failed to update calls agentId for ticket', formattedTicketId, callsErr.sqlMessage || callsErr);
                        }

                        // Get agent name for logging
                        connection.query('SELECT agentName FROM agents WHERE id = ?', [agentId], async (agentErr, agentResult) => {
                            const agentName = (!agentErr && agentResult && agentResult.length > 0) ? agentResult[0].agentName : 'Unknown Agent';

                            // Log activity for ticket assignment
                            try {
                                await ticketController.logActivity(
                                    formattedTicketId,
                                    isUpdate ? 'ticket_reassigned' : 'ticket_assigned',
                                    `Ticket ${isUpdate ? 'reassigned' : 'assigned'} to ${agentName}`,
                                    {
                                        previousStatus: originalTicketStatus,
                                        currentStatus: 'assigned',
                                        agentId: agentId,
                                        agentName: agentName
                                    }
                                );
                            } catch (logErr) {
                                console.error('Error logging ticket assignment:', logErr);
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
                     ORDER BY t.createdAt DESC
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

            connection.query("INSERT INTO callback SET ?", callbackData, async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error creating callback request",
                        error: err
                    });
                } else {
                    // Log activity for callback/follow-up creation
                    // Note: If there's an associated ticketId in the future, it should be logged with that ticket
                    // For now, we'll log it with the callbackId as reference
                    if (callbackData.ticketId) {
                        try {
                            await ticketController.logActivity(
                                callbackData.ticketId,
                                'follow_up_scheduled',
                                `Follow-up callback ${callbackId} scheduled for ${name}`,
                                {
                                    productId: productId,
                                    followUpDate: callbackData.followUpDate || null,
                                    followUpStatus: status || 'inbound',
                                    callType: callType || 'inbound',
                                    additionalInfo: {
                                        callbackId: callbackId,
                                        subject: subject
                                    }
                                }
                            );
                        } catch (logErr) {
                            console.error('Error logging callback creation:', logErr);
                        }
                    }

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

        // First get the callback data to check if there's a ticketId and get previous status
        connection.query(
            "SELECT ticketId, status FROM callback WHERE callbackId = ?",
            [callbackId],
            async (getErr, callbackData) => {
                const ticketId = callbackData && callbackData.length > 0 ? callbackData[0].ticketId : null;
                const previousStatus = callbackData && callbackData.length > 0 ? callbackData[0].status : null;

                connection.query(
                    "UPDATE callback SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE callbackId = ?",
                    [status, callbackId],
                    async (err, result) => {
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
                            // Log activity for callback/follow-up status change
                            if (ticketId) {
                                try {
                                    await ticketController.logActivity(
                                        ticketId,
                                        'follow_up_status_changed',
                                        `Follow-up callback ${callbackId} status changed from ${previousStatus || 'unknown'} to ${status}`,
                                        {
                                            followUpStatus: status,
                                            additionalInfo: {
                                                callbackId: callbackId,
                                                previousFollowUpStatus: previousStatus,
                                                newFollowUpStatus: status
                                            }
                                        }
                                    );
                                } catch (logErr) {
                                    console.error('Error logging callback status change:', logErr);
                                }
                            }

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

        console.log('=== CREATE CALL LOG REQUEST ===');
        console.log('Received createCallLog request:', {
            callbackId,
            ticketId,
            agentId,
            agentName,
            agentNumber,
            customerPhone,
            customerName,
            productId,
            subject,
            callType,
            ticketStatus
        });
        console.log('customerPhone exists?', !!customerPhone);
        console.log('=== END CREATE CALL LOG REQUEST ===');

        try {
            // Generate recording URL (pending status) - will use insertId after database insertion
            const tempCallId = 'temp';
            const recordingUrl = ticketController.generateRecordingUrl(tempCallId);

            // Get current timestamp
            const startTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

            // NEW LOGIC: Check previous call to determine scenario
            const checkPreviousCall = (callback) => {
                console.log('=== INSIDE checkPreviousCall ===');
                console.log('customerPhone value:', customerPhone);
                console.log('customerPhone type:', typeof customerPhone);
                console.log('customerPhone truthy?:', !!customerPhone);

                if (!customerPhone) {
                    console.log('⚠️ No customerPhone provided, using default logic - SKIPPING SCENARIO DETECTION');
                    return callback(null, { shouldCreateNewTicket: false, shouldCreateNewCallId: false });
                }

                console.log('=== CHECKING PREVIOUS CALL FOR PHONE:', customerPhone, '===');

                // Query to find the most recent call from this phone number (excluding the current call being created)
                console.log('=== DEBUG: QUERYING PREVIOUS CALL FOR PHONE:', customerPhone, '===');
                connection.query(
                    `SELECT c.callId, c.callStatus, c.ticketId, c.followupStatus, t.status as ticketStatus,
                            c.id as call_id, t.id as ticket_id
                     FROM calls c
                     LEFT JOIN tickets t ON c.ticketId = t.ticketId
                     WHERE c.userPhone = ?
                     ORDER BY c.id DESC
                     LIMIT 1`,
                    [customerPhone],
                    (err, result) => {
                        if (err) {
                            console.error('Error checking previous call:', err);
                            return callback(null, { shouldCreateNewTicket: false, shouldCreateNewCallId: false });
                        }

                        console.log('=== DEBUG: QUERY RESULT ===');
                        console.log('Raw result:', result);

                        if (result && result.length > 0) {
                            const prevCall = result[0];
                            console.log('=== DEBUG: PREVIOUS CALL FOUND ===');
                            console.log('Call ID:', prevCall.callId);
                            console.log('Call Status:', prevCall.callStatus);
                            console.log('Call TicketId (from calls table):', prevCall.ticketId);
                            console.log('Ticket Status (from tickets table):', prevCall.ticketStatus);
                            console.log('Call internal ID:', prevCall.call_id);
                            console.log('Ticket internal ID:', prevCall.ticket_id);

                            // Check if ticket is in open status (Unresolved, Assigned, In Progress, Pending)
                            const openTicketStatuses = ['unresolved', 'assigned', 'in progress', 'in-progress', 'pending'];
                            const ticketOpen = prevCall.ticketStatus && openTicketStatuses.includes(prevCall.ticketStatus.toLowerCase());
                            const ticketClosedOrResolved = prevCall.ticketStatus && (prevCall.ticketStatus.toLowerCase() === 'resolved' || prevCall.ticketStatus.toLowerCase() === 'closed');
                            const callResolvedOrCompleted = prevCall.callStatus && (prevCall.callStatus.toLowerCase() === 'completed' || prevCall.callStatus.toLowerCase() === 'resolved');

                            console.log('=== DEBUG: STATUS ANALYSIS ===');
                            console.log('Call resolved/completed?', callResolvedOrCompleted);
                            console.log('Ticket open (Unresolved/Assigned/In Progress/Pending)?', ticketOpen);
                            console.log('Ticket closed/resolved?', ticketClosedOrResolved);

                            console.log('=== PREVIOUS CALL ANALYSIS ===');
                            console.log('Call ID:', prevCall.callId);
                            console.log('Call Status:', prevCall.callStatus);
                            console.log('  - is resolved/completed?', callResolvedOrCompleted);
                            console.log('Ticket Status:', prevCall.ticketStatus);
                            console.log('  - is open (Unresolved/Assigned/In Progress/Pending)?', ticketOpen);
                            console.log('  - is closed/resolved?', ticketClosedOrResolved);
                            console.log('');

                            // SCENARIO 2: Create new callId for same ticket if ticket is open (Unresolved/Assigned/In Progress/Pending)
                            if (ticketOpen && prevCall.ticketId) {
                                console.log('✅ SCENARIO 2: CREATE NEW CALL ID FOR SAME TICKET');
                                console.log('   Conditions met: Ticket status is Unresolved/Assigned/In Progress/Pending');
                                console.log('   Will create new callId but keep same ticketId:', prevCall.ticketId);

                                return callback(null, {
                                    shouldCreateNewTicket: false,
                                    shouldCreateNewCallId: true,
                                    reuseTicketId: prevCall.ticketId
                                });
                            }

                            // SCENARIO 1: Create new callId with null ticketId if call resolved/completed AND ticket closed/resolved
                            if (callResolvedOrCompleted && ticketClosedOrResolved) {
                                console.log('✅ SCENARIO 1: CREATE NEW CALL ID WITH NULL TICKET ID');
                                console.log('   Conditions met: Previous call resolved/completed AND ticket resolved/closed');
                                console.log('   Will create new callId with ticketId = null');

                                return callback(null, {
                                    shouldCreateNewTicket: true,
                                    shouldCreateNewCallId: false
                                });
                            }

                            // Default: Create new callId with null ticketId (like Scenario 1)
                            console.log('✅ DEFAULT: CREATE NEW CALL ID WITH NULL TICKET ID');
                            console.log('   Reason: Default case - conditions not met for specific scenarios');
                            console.log('   Will create new callId with ticketId = null (new ticket from call page)');

                            return callback(null, {
                                shouldCreateNewTicket: true,
                                shouldCreateNewCallId: false
                            });
                        } else {
                            console.log('No previous call found for phone:', customerPhone);
                            console.log('✅ FIRST CALL: Creating new callId');
                            callback(null, { shouldCreateNewTicket: false, shouldCreateNewCallId: false });
                        }
                    }
                );
            };

            // First, if ticketId is provided, get the formatted ticketId from tickets table
            const getFormattedTicketId = (scenarioResult, callback) => {
                console.log('=== GET FORMATTED TICKET ID ===');
                console.log('scenarioResult:', scenarioResult);
                console.log('ticketId from request:', ticketId);

                // Handle object result from checkPreviousCall
                const shouldCreateNewTicket = scenarioResult.shouldCreateNewTicket;
                const shouldCreateNewCallId = scenarioResult.shouldCreateNewCallId;
                const reuseTicketId = scenarioResult.reuseTicketId;

                console.log('shouldCreateNewTicket:', shouldCreateNewTicket);
                console.log('shouldCreateNewCallId:', shouldCreateNewCallId);
                console.log('reuseTicketId:', reuseTicketId);

                // SCENARIO 1: Previous call completed + ticket resolved/closed
                // Create NEW callId with NULL ticketId (new ticket will be created from call page)
                if (shouldCreateNewTicket) {
                    console.log('✅ SCENARIO 1: Creating new callId with NULL ticketId');
                    console.log('   Previous call completed AND ticket resolved/closed');
                    console.log('   New ticket will be created from call page');
                    console.log('=== END GET FORMATTED TICKET ID ===');
                    return callback(null, null); // ticketId = null for new ticket from call page
                }

                // SCENARIO 2: Multiple calls for same ticket - create new callId but reuse ticketId
                if (shouldCreateNewCallId && reuseTicketId) {
                    console.log('✅ SCENARIO 2: Creating new callId for same ticket');
                    console.log('   Multiple calls allowed for same ticket');
                    console.log('   Will reuse ticketId:', reuseTicketId, '(Directly from previous call - no lookup needed)');
                    console.log('=== END GET FORMATTED TICKET ID ===');
                    return callback(null, reuseTicketId); // Reuse existing ticketId directly
                }

                if (!ticketId || ticketId === 0) {
                    // No ticket, use callbackId or 0
                    const returnValue = ticketId === 0 ? 0 : (ticketId || callbackId);
                    console.log('No ticketId provided, returning:', returnValue);
                    console.log('=== END GET FORMATTED TICKET ID ===');
                    return callback(null, returnValue);
                }

                // Look up the formatted ticketId from tickets table
                console.log('Looking up formatted ticketId for:', ticketId);
                // First try to find by exact ticketId match, then by id
                connection.query(
                    "SELECT ticketId FROM tickets WHERE ticketId = ? LIMIT 1",
                    [ticketId],
                    (err, result) => {
                        if (err) {
                            console.error('Error looking up ticketId by ticketId:', err);
                            console.log('Fallback: Using provided ticketId:', ticketId);
                            console.log('=== END GET FORMATTED TICKET ID ===');
                            return callback(null, ticketId); // Fallback to provided ticketId
                        }

                        if (result && result.length > 0) {
                            const formattedTicketId = result[0].ticketId;
                            console.log('✓ Found formatted ticketId by ticketId:', formattedTicketId);
                            console.log('=== END GET FORMATTED TICKET ID ===');
                            callback(null, formattedTicketId);
                        } else {
                            // If not found by ticketId, try by id (numeric field)
                            console.log('No ticket found by ticketId, trying by id...');
                            connection.query(
                                "SELECT ticketId FROM tickets WHERE id = ? LIMIT 1",
                                [ticketId],
                                (err2, result2) => {
                                    if (err2) {
                                        console.error('Error looking up ticketId by id:', err2);
                                        console.log('Fallback: Using provided ticketId:', ticketId);
                                        console.log('=== END GET FORMATTED TICKET ID ===');
                                        return callback(null, ticketId);
                                    }

                                    if (result2 && result2.length > 0) {
                                        const formattedTicketId = result2[0].ticketId;
                                        console.log('✓ Found formatted ticketId by id:', formattedTicketId);
                                        console.log('=== END GET FORMATTED TICKET ID ===');
                                        callback(null, formattedTicketId);
                                    } else {
                                        console.log('No ticket found in database by either ticketId or id, using provided ticketId:', ticketId);
                                        console.log('=== END GET FORMATTED TICKET ID ===');
                                        callback(null, ticketId);
                                    }
                                }
                            );
                        }
                    }
                );
            };

            // First check if previous call was completed and ticket was resolved/closed
            checkPreviousCall((err, scenarioResult) => {
                if (err) {
                    console.error('Error checking previous call:', err);
                }

                // Get formatted ticketId based on scenario
                getFormattedTicketId(scenarioResult, (err, formattedTicketId) => {
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
            });

            // Helper function to insert call log
            function insertCallLog(nextCallId, actualTicketId) {

                // Use explicit SQL to ensure callId is saved as string
                const insertQuery = `
                    INSERT INTO calls (
                        callId, ticketId, userPhone, productId, agentId, agentPhone,
                        callStatus, ticketStatus, recordingUrl, callType, reason,
                        callDescription, startTime, endTime, resolvedOn, followupStatus, followupDate
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const values = [
                    nextCallId, // callId as string
                    actualTicketId, // Use the correctly calculated ticketId (null if new ticket should be created)
                    customerPhone, // userPhone from frontend
                    productId || null, // productId from frontend
                    agentId, // agentId from frontend
                    agentNumber || agentName || 'Unknown', // agentPhone from frontend or fallback to agentName
                    'pending', // Initial callStatus - should be 'pending' when call starts
                    actualTicketId === null ? 'pending' : (ticketStatus || 'in-progress'), // ticketStatus - pending if no ticket linked
                    'pending', // recordingUrl initially pending
                    callType || 'outbound', // callType from frontend (inbound/outbound)
                    subject || 'Callback request from customer', // reason
                    subject || 'Callback request from customer', // callDescription
                    startTime, // Actual start time when connect call is clicked
                    startTime, // Set endTime to startTime initially, will be updated when call ends
                    null, // resolvedOn - explicitly set to null, should only be set when status changes to resolved
                    'pending', // followupStatus - set to 'pending' initially, will be updated when ticket status changes
                    new Date().toISOString().slice(0, 19).replace('T', ' ') // followupDate - set to current date by default
                ];

                console.log('=== INSERTING NEW CALL ===');
                console.log('Call ID:', nextCallId);
                console.log('Ticket ID:', actualTicketId, actualTicketId === null ? '(NULL - New ticket should be created from call page)' : '(Linked to existing ticket)');
                console.log('User Phone:', customerPhone);
                console.log('Product ID:', productId || null);
                console.log('Agent ID:', agentId);
                console.log('Agent Phone:', agentNumber || agentName || 'Unknown');
                console.log('Call Status:', 'pending');
                console.log('Ticket Status:', actualTicketId === null ? 'pending' : (ticketStatus || 'in-progress'));
                console.log('Call Type:', callType || 'outbound');
                console.log('Start Time:', startTime);
                console.log('Resolved On:', null, '(NULL - will only be set when status changes to resolved)');
                console.log('Followup Status:', 'pending', '(will be updated when ticket status changes)');
                console.log('Followup Date:', new Date().toISOString().slice(0, 19).replace('T', ' '), '(Current date - will be updated when followup is scheduled)');
                console.log('=== END INSERTING NEW CALL ===');

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
                                callStatus: 'pending',
                                ticketId: actualTicketId,
                                scenario: actualTicketId === null ? 'Scenario 1 (new ticket from call page)' : 'Scenario 2 (multiple calls for same ticket)'
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

            // Get ticketId associated with the call first
            connection.query(
                "SELECT ticketId FROM calls WHERE callId = ?",
                [callId],
                async (getErr, callData) => {
                    if (getErr || !callData || callData.length === 0) {
                        console.error('Error fetching call data for logging:', getErr);
                    }

                    const ticketId = callData && callData.length > 0 ? callData[0].ticketId : null;

                    // Update call log with start time and set status to pending (in case it was missed)
                    connection.query(
                        "UPDATE calls SET startTime = ?, callStatus = 'pending' WHERE callId = ?",
                        [startTime, callId],
                        async (err, result) => {
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

                            // Log activity for call start
                            if (ticketId) {
                                try {
                                    await ticketController.logActivity(
                                        ticketId,
                                        'call_started',
                                        `Call ${callId} started`,
                                        {
                                            callId: callId,
                                            callStatus: 'pending',
                                            additionalInfo: {
                                                startTime: startTime
                                            }
                                        }
                                    );
                                } catch (logErr) {
                                    console.error('Error logging call start:', logErr);
                                }
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
                        async (err, updateResult) => {
                            if (err) {
                                return res.status(500).json({
                                    message: "Error updating call log",
                                    error: err
                                });
                            } else {
                                // Log activity for call end
                                if (callLog.ticketId) {
                                    try {
                                        await ticketController.logActivity(
                                            callLog.ticketId,
                                            'call_ended',
                                            `Call ${callId} ended (duration: ${duration}s)`,
                                            {
                                                callId: callId,
                                                callStatus: 'pending',
                                                additionalInfo: {
                                                    endTime: formattedEndTime,
                                                    duration: duration
                                                }
                                            }
                                        );
                                    } catch (logErr) {
                                        console.error('Error logging call end:', logErr);
                                    }
                                }

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
            // First get the call data for logging
            connection.query(
                "SELECT ticketId, callStatus FROM calls WHERE callId = ?",
                [callId],
                async (getErr, callData) => {
                    if (getErr) {
                        console.error('Error fetching call data:', getErr);
                    }

                    const ticketId = callData && callData.length > 0 ? callData[0].ticketId : null;
                    const previousCallStatus = callData && callData.length > 0 ? callData[0].callStatus : null;

                    // Update call log with missed status (null start and end times)
                    connection.query(
                        "UPDATE calls SET startTime = NULL, endTime = NULL, callStatus = 'missed', ticketStatus = 'cancelled', reason = 'User disconnected' WHERE callId = ?",
                        [callId],
                        async (err, result) => {
                            if (err) {
                                return res.status(500).json({
                                    message: "Error updating call log",
                                    error: err
                                });
                            } else {
                                // Log activity for missed call
                                if (ticketId) {
                                    try {
                                        await ticketController.logActivity(
                                            ticketId,
                                            'call_status_changed',
                                            `Call ${callId} status changed from ${previousCallStatus || 'none'} to missed`,
                                            {
                                                callId: callId,
                                                callStatus: 'missed',
                                                previousStatus: previousCallStatus,
                                                currentStatus: 'missed',
                                                additionalInfo: {
                                                    reason: 'User disconnected',
                                                    ticketStatus: 'cancelled'
                                                }
                                            }
                                        );
                                    } catch (logErr) {
                                        console.error('Error logging missed call:', logErr);
                                    }
                                }

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
        const { callStatus, status } = req.body;
        const newStatus = callStatus || status;

        console.log('Received updateCallStatus request for callId:', callId, 'status:', newStatus);

        if (!newStatus) {
            return res.status(400).json({
                message: "Missing required field: callStatus or status"
            });
        }

        // Validate status value
        const validStatuses = ['pending', 'ongoing', 'completed', 'missed', 'cancelled', 'resolved'];
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({
                message: "Invalid status. Must be one of: pending, ongoing, completed, missed, cancelled, resolved"
            });
        }

        try {
            // First get the call data for logging
            connection.query(
                "SELECT ticketId, callStatus FROM calls WHERE callId = ?",
                [callId],
                async (getErr, callData) => {
                    if (getErr) {
                        console.error('Error fetching call data:', getErr);
                    }

                    const ticketId = callData && callData.length > 0 ? callData[0].ticketId : null;
                    const previousCallStatus = callData && callData.length > 0 ? callData[0].callStatus : null;

                    // Update the callStatus in calls table
                    // If status is resolved, set firstCall to 1, otherwise set to 0
                    const firstCallValue = newStatus === 'resolved' ? 1 : 0;
                    connection.query(
                        "UPDATE calls SET callStatus = ?, firstCall = ? WHERE callId = ?",
                        [newStatus, firstCallValue, callId],
                        async (err, result) => {
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

                            // Log activity for call status change
                            if (ticketId) {
                                try {
                                    await ticketController.logActivity(
                                        ticketId,
                                        'call_status_changed',
                                        `Call ${callId} status changed from ${previousCallStatus || 'none'} to ${newStatus}`,
                                        {
                                            callId: callId,
                                            callStatus: newStatus,
                                            previousStatus: previousCallStatus,
                                            currentStatus: newStatus,
                                            additionalInfo: {
                                                statusType: 'call_status'
                                            }
                                        }
                                    );
                                } catch (logErr) {
                                    console.error('Error logging call status change:', logErr);
                                }
                            }

                            return res.json({
                                message: "Call status updated successfully",
                                data: {
                                    callId: callId,
                                    callStatus: newStatus
                                }
                            });
                        }
                    );
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
            // First, verify the call exists and get previous agent
            connection.query(
                "SELECT ticketId, agentId FROM calls WHERE callId = ?",
                [callId],
                async (err, callResult) => {
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

                    const ticketId = callResult[0].ticketId;
                    const previousAgentId = callResult[0].agentId;

                    // Get new agent name
                    connection.query(
                        "SELECT agentName FROM agents WHERE id = ?",
                        [agentId],
                        async (agentErr, agentResult) => {
                            const newAgentName = (!agentErr && agentResult && agentResult.length > 0)
                                ? agentResult[0].agentName
                                : 'Unknown Agent';

                            // Update the agentId in calls table
                            connection.query(
                                "UPDATE calls SET agentId = ? WHERE callId = ?",
                                [agentId, callId],
                                async (updateErr, updateResult) => {
                                    if (updateErr) {
                                        return res.status(500).json({
                                            message: "Error updating call agent",
                                            error: updateErr
                                        });
                                    }

                                    // Log activity for call agent change
                                    if (ticketId) {
                                        try {
                                            await ticketController.logActivity(
                                                ticketId,
                                                'call_agent_changed',
                                                `Call ${callId} agent changed to ${newAgentName}`,
                                                {
                                                    callId: callId,
                                                    agentId: agentId,
                                                    agentName: newAgentName,
                                                    additionalInfo: {
                                                        previousAgentId: previousAgentId
                                                    }
                                                }
                                            );
                                        } catch (logErr) {
                                            console.error('Error logging call agent change:', logErr);
                                        }
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
                           OR phone = c.userPhone COLLATE utf8mb4_unicode_ci
                           OR REPLACE(REPLACE(REPLACE(phone, ' ', ''), '+', ''), '-', '') = REPLACE(REPLACE(REPLACE(c.userPhone, ' ', ''), '+', ''), '-', ''))
                    ORDER BY createdAt DESC
                    LIMIT 1) AS ticketCustomerName,
                   (SELECT name FROM callback
                    WHERE phone = c.userPhone COLLATE utf8mb4_unicode_ci
                       OR REPLACE(REPLACE(REPLACE(phone, ' ', ''), '+', ''), '-', '') = REPLACE(REPLACE(REPLACE(c.userPhone, ' ', ''), '+', ''), '-', '')
                    ORDER BY createdAt DESC
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
                    const processedResult = result.map(row => {
                        const customerName = row.ticketCustomerName || row.callbackCustomerName || 'Unknown Customer';

                        // Debug logging for customer name resolution
                        if (customerName === 'Unknown Customer') {
                            console.log(`Unknown customer for call ${row.callId} - Phone: ${row.userPhone}, ticketCustomerName: ${row.ticketCustomerName}, callbackCustomerName: ${row.callbackCustomerName}`);
                        }

                        return {
                            ...row,
                            customerName: customerName,
                            // Remove the temporary fields
                            ticketCustomerName: undefined,
                            callbackCustomerName: undefined
                        };
                    });

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
            // First get the current status for logging
            connection.query(
                "SELECT status FROM tickets WHERE ticketId = ?",
                [id],
                async (getErr, statusData) => {
                    const previousStatus = statusData && statusData.length > 0 ? statusData[0].status : null;

                    // Update all three tables using ticketId
                    // Update tickets table - status column using ticketId
                    connection.query(
                        "UPDATE tickets SET status = ? WHERE ticketId = ?",
                        [status, id],
                        async (err, ticketsResult) => {
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

                            // Log activity for status update across all tables
                            try {
                                const resolvedNote = status === 'resolved' ? ' (ticket resolved)' : '';
                                await ticketController.logActivity(
                                    id,
                                    status === 'resolved' ? 'ticket_resolved' : 'status_updated',
                                    `Ticket status changed from ${previousStatus || 'unknown'} to ${status}${resolvedNote}`,
                                    {
                                        previousStatus: previousStatus,
                                        currentStatus: status
                                    }
                                );
                            } catch (logErr) {
                                console.error('Error logging status update:', logErr);
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
                        async (err, result) => {
                            if (err) {
                                return res.status(500).json({
                                    message: "Error creating feedback request",
                                    error: err
                                });
                            }

                            // Log activity for feedback request
                            try {
                                await ticketController.logActivity(
                                    ticketId,
                                    'feedback_requested',
                                    `Feedback request ${feedbackId} sent to customer`,
                                    {
                                        feedbackId: feedbackId,
                                        additionalInfo: {
                                            customerEmail: customerEmail,
                                            deliveryStatus: 'pending'
                                        }
                                    }
                                );
                            } catch (logErr) {
                                console.error('Error logging feedback request:', logErr);
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

            // First get the feedback data to get ticketId and feedbackId
            connection.query(
                "SELECT ticketId, feedbackId FROM feedbacks WHERE id = ?",
                [id],
                async (getErr, feedbackData) => {
                    if (getErr || !feedbackData || feedbackData.length === 0) {
                        return res.status(404).json({
                            message: "Feedback request not found"
                        });
                    }

                    const ticketId = feedbackData[0].ticketId;
                    const feedbackId = feedbackData[0].feedbackId;

                    connection.query(
                        "UPDATE feedbacks SET rating = ?, feedbackComment = ?, deliveryStatus = 'received', updatedAt = ? WHERE id = ?",
                        [rating, comments || null, updatedAt, id],
                        async (err, result) => {
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

                            // Log activity for feedback received
                            try {
                                await ticketController.logActivity(
                                    ticketId,
                                    'feedback_received',
                                    `Feedback ${feedbackId} received from customer (Rating: ${rating}/5)`,
                                    {
                                        feedbackId: feedbackId,
                                        additionalInfo: {
                                            rating: rating,
                                            comments: comments,
                                            deliveryStatus: 'received'
                                        }
                                    }
                                );
                            } catch (logErr) {
                                console.error('Error logging feedback received:', logErr);
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
                                console.log(`Setting resolvedOn to ${currentTimestamp} because followupStatus changed to 'resolved'`);
                            } else if (followupStatus !== 'closed') {
                                // If status is changed to something other than resolved or closed, clear resolvedOn
                                // When transitioning to 'closed', preserve the existing resolvedOn date
                                callUpdateFields.push("resolvedOn = ?");
                                callUpdateValues.push(null);
                                console.log(`Clearing resolvedOn because followupStatus changed to '${followupStatus}' (not resolved or closed)`);
                            } else {
                                console.log(`Preserving existing resolvedOn because followupStatus changed to 'closed'`);
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
            const { dateRange, startDate, endDate, agents, products, status, ticketTypes, teams } = req.query;

            // Calculate date range filter for ticket creation
            let dateFilter = '';
            if (dateRange === 'custom' && startDate && endDate) {
                dateFilter = `AND t.createdAt BETWEEN '${startDate}' AND '${endDate} 23:59:59'`;
            } else if (dateRange && dateRange !== 'custom') {
                const days = parseInt(dateRange);
                dateFilter = `AND t.createdAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`;
            }

            // Calculate date range filter for resolution time (only tickets resolved in date range)
            let resolutionDateFilter = '';
            if (dateRange === 'custom' && startDate && endDate) {
                resolutionDateFilter = `AND t.updatedAt BETWEEN '${startDate}' AND '${endDate} 23:59:59'`;
            } else if (dateRange && dateRange !== 'custom') {
                const days = parseInt(dateRange);
                resolutionDateFilter = `AND t.updatedAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`;
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

            let ticketTypeFilter = '';
            if (ticketTypes && ticketTypes.length > 0) {
                const ticketTypeList = Array.isArray(ticketTypes) ? ticketTypes : [ticketTypes];
                const ticketTypePlaceholders = ticketTypeList.map(() => '?').join(',');
                ticketTypeFilter = `AND t.ticketType IN (${ticketTypePlaceholders})`;
            }

            let teamFilter = '';
            if (teams && teams.length > 0) {
                const teamList = Array.isArray(teams) ? teams : [teams];
                const teamPlaceholders = teamList.map(() => '?').join(',');
                teamFilter = `AND EXISTS (
                    SELECT 1 FROM \`assign-ticket\` at
                    JOIN agents a ON at.agentId = a.id
                    WHERE at.ticketId = t.ticketId
                    AND a.team IN (${teamPlaceholders})
                )`;
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
            if (ticketTypes && ticketTypes.length > 0) {
                const ticketTypeList = Array.isArray(ticketTypes) ? ticketTypes : [ticketTypes];
                queryParams.push(...ticketTypeList);
            }
            if (teams && teams.length > 0) {
                const teamList = Array.isArray(teams) ? teams : [teams];
                queryParams.push(...teamList);
            }

            // 1. Total Tickets Count
            const totalTicketsQuery = `
                SELECT COUNT(*) as total
                FROM tickets t
                WHERE 1=1 ${dateFilter} ${agentFilter} ${productFilter} ${statusFilter} ${ticketTypeFilter} ${teamFilter}
            `;

            // 2. Average Resolution Time (in minutes) - from ticket creation to resolution
            const avgResolutionTimeQuery = `
                SELECT
                    AVG(
                        CASE
                            WHEN t.updatedAt IS NOT NULL AND t.createdAt IS NOT NULL THEN
                                TIMESTAMPDIFF(MINUTE, t.createdAt, t.updatedAt)
                            ELSE NULL
                        END
                    ) as avgResolutionTimeMinutes
                FROM tickets t
                WHERE t.status = 'Resolved'
                  AND t.updatedAt IS NOT NULL
                  ${resolutionDateFilter} ${agentFilter} ${productFilter} ${statusFilter} ${ticketTypeFilter} ${teamFilter}
            `;

            // 3. First-Call-Resolution Rate
            const fcrQuery = `
                SELECT
                    COUNT(DISTINCT t.ticketId) as totalTickets,
                    COUNT(DISTINCT CASE WHEN c.firstCall = 1 THEN t.ticketId END) as fcrTickets,
                    (COUNT(DISTINCT CASE WHEN c.firstCall = 1 THEN t.ticketId END) / COUNT(DISTINCT t.ticketId)) * 100 as fcrRate
                FROM tickets t
                LEFT JOIN calls c ON t.ticketId = c.ticketId
                WHERE 1=1 ${dateFilter} ${agentFilter} ${productFilter} ${statusFilter} ${ticketTypeFilter} ${teamFilter}
            `;

            // 4. Status Counts
            const assignedCountQuery = `
                SELECT COUNT(*) as count
                FROM tickets t
                WHERE t.status = 'Assigned'
                  ${dateFilter} ${agentFilter} ${productFilter} ${statusFilter} ${ticketTypeFilter} ${teamFilter}
            `;

            const pendingCountQuery = `
                SELECT COUNT(*) as count
                FROM tickets t
                WHERE t.status = 'Pending'
                  ${dateFilter} ${agentFilter} ${productFilter} ${statusFilter} ${ticketTypeFilter} ${teamFilter}
            `;

            const resolvedCountQuery = `
                SELECT COUNT(*) as count
                FROM tickets t
                WHERE t.status = 'Resolved'
                  ${dateFilter} ${agentFilter} ${productFilter} ${statusFilter} ${ticketTypeFilter} ${teamFilter}
            `;

            const closedCountQuery = `
                SELECT COUNT(*) as count
                FROM tickets t
                WHERE t.status = 'Closed'
                  ${dateFilter} ${agentFilter} ${productFilter} ${statusFilter} ${ticketTypeFilter} ${teamFilter}
            `;

            const inProgressCountQuery = `
                SELECT COUNT(*) as count
                FROM tickets t
                WHERE t.status = 'in-progress'
                  ${dateFilter} ${agentFilter} ${productFilter} ${statusFilter} ${ticketTypeFilter} ${teamFilter}
            `;

            // 5. Average Customer Satisfaction from feedbacks table
            const avgCsatQuery = `
                SELECT
                    AVG(f.rating) as avgCsat,
                    COUNT(f.rating) as totalRatings
                FROM feedbacks f
                LEFT JOIN tickets t ON f.ticketId = t.ticketId
                WHERE f.rating IS NOT NULL
                  ${dateFilter} ${agentFilter} ${productFilter} ${statusFilter} ${ticketTypeFilter} ${teamFilter}
            `;

            // 6. Callback Completion Rate from calls table
            const callbackCompletionQuery = `
                SELECT
                    COUNT(*) as totalCalls,
                    COUNT(CASE WHEN c.callStatus = 'completed' THEN 1 END) as completedCalls,
                    (COUNT(CASE WHEN c.callStatus = 'completed' THEN 1 END) / COUNT(*)) * 100 as completionRate
                FROM calls c
                LEFT JOIN tickets t ON c.ticketId = t.ticketId
                WHERE 1=1 ${dateFilter} ${agentFilter} ${productFilter} ${ticketTypeFilter} ${teamFilter}
            `;

            // 7. Average Reconnection Time (missed to pending)
            // Build date filter for activity_log based on createdAt
            let activityDateFilter = '';
            if (dateRange === 'custom' && startDate && endDate) {
                activityDateFilter = `AND al_missed.createdAt BETWEEN '${startDate}' AND '${endDate} 23:59:59'`;
            } else if (dateRange && dateRange !== 'custom') {
                const days = parseInt(dateRange);
                activityDateFilter = `AND al_missed.createdAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`;
            } else {
                activityDateFilter = `AND al_missed.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
            }

            const reconnectionTimeQuery = `
                SELECT
                    AVG(reconnectionMinutes) as avgReconnectionMinutes,
                    COUNT(*) as reconnectionCount
                FROM (
                    SELECT
                        al_missed.callId,
                        TIMESTAMPDIFF(MINUTE, al_missed.createdAt, al_pending.createdAt) as reconnectionMinutes
                    FROM activity_log al_missed
                    INNER JOIN activity_log al_pending
                        ON CAST(al_missed.callId AS CHAR) = CAST(al_pending.callId AS CHAR)
                    WHERE al_missed.callStatus = 'missed'
                      AND al_pending.callStatus = 'pending'
                      AND al_pending.createdAt > al_missed.createdAt
                      AND al_missed.callId IS NOT NULL
                      AND al_pending.callId IS NOT NULL
                      AND al_pending.createdAt = (
                          SELECT MIN(createdAt)
                          FROM activity_log
                          WHERE CAST(callId AS CHAR) = CAST(al_missed.callId AS CHAR)
                            AND callStatus = 'pending'
                            AND createdAt > al_missed.createdAt
                      )
                      ${activityDateFilter}
                ) as reconnections
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
                    // First get detailed breakdown
                    const detailQuery = `
                        SELECT
                            t.ticketId,
                            t.createdAt,
                            t.updatedAt as resolvedOn,
                            TIMESTAMPDIFF(MINUTE, t.createdAt, t.updatedAt) as resolutionMinutes
                        FROM tickets t
                        WHERE t.status = 'Resolved'
                          AND t.updatedAt IS NOT NULL
                          AND t.createdAt IS NOT NULL
                          ${resolutionDateFilter} ${agentFilter} ${productFilter} ${statusFilter} ${ticketTypeFilter} ${teamFilter}
                        ORDER BY resolutionMinutes DESC
                    `;

                    connection.query(detailQuery, queryParams, (err, detailResult) => {
                        if (err) {
                            reject(err);
                        } else {
                            // Log the actual data
                            console.log('\n========== RESOLUTION TIME CALCULATION BREAKDOWN ==========');
                            console.log(`Total tickets found: ${detailResult.length}`);
                            console.log('Note: Only tickets with status "Resolved" that were RESOLVED in the selected date range');
                            console.log('\nIndividual ticket resolution times (from creation to resolution):');
                            detailResult.forEach((row, index) => {
                                const hours = Math.floor(row.resolutionMinutes / 60);
                                const mins = row.resolutionMinutes % 60;
                                console.log(`${index + 1}. Ticket ${row.ticketId}: ${row.resolutionMinutes} min (${hours}h ${mins}m) - Created: ${row.createdAt}, Resolved: ${row.resolvedOn}`);
                            });

                            // Calculate totals
                            const totalMinutes = detailResult.reduce((sum, row) => sum + row.resolutionMinutes, 0);
                            const avgMinutes = detailResult.length > 0 ? totalMinutes / detailResult.length : 0;
                            const avgHours = Math.floor(avgMinutes / 60);
                            const avgMins = Math.round(avgMinutes % 60);

                            console.log('\n--- CALCULATION ---');
                            console.log(`Total minutes: ${totalMinutes}`);
                            console.log(`Average: ${totalMinutes} ÷ ${detailResult.length} = ${avgMinutes.toFixed(2)} minutes`);
                            console.log(`Average formatted: ${avgHours}h ${avgMins}m`);
                            console.log('========================================================\n');

                            // Now run the original query
                            connection.query(avgResolutionTimeQuery, queryParams, (err2, result) => {
                                if (err2) reject(err2);
                                else resolve({
                                    minutes: Math.round(result[0]?.avgResolutionTimeMinutes || 0),
                                    hours: Math.round((result[0]?.avgResolutionTimeMinutes || 0) / 60 * 10) / 10
                                });
                            });
                        }
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
                }),
                // Status count queries
                new Promise((resolve, reject) => {
                    connection.query(assignedCountQuery, queryParams, (err, result) => {
                        if (err) reject(err);
                        else resolve(result[0]?.count || 0);
                    });
                }),
                new Promise((resolve, reject) => {
                    connection.query(pendingCountQuery, queryParams, (err, result) => {
                        if (err) reject(err);
                        else resolve(result[0]?.count || 0);
                    });
                }),
                new Promise((resolve, reject) => {
                    connection.query(resolvedCountQuery, queryParams, (err, result) => {
                        if (err) reject(err);
                        else resolve(result[0]?.count || 0);
                    });
                }),
                new Promise((resolve, reject) => {
                    connection.query(closedCountQuery, queryParams, (err, result) => {
                        if (err) reject(err);
                        else resolve(result[0]?.count || 0);
                    });
                }),
                new Promise((resolve, reject) => {
                    connection.query(inProgressCountQuery, queryParams, (err, result) => {
                        if (err) reject(err);
                        else resolve(result[0]?.count || 0);
                    });
                }),
                new Promise((resolve, reject) => {
                    connection.query(reconnectionTimeQuery, queryParams, (err, result) => {
                        if (err) reject(err);
                        else resolve({
                            minutes: Math.round(result[0]?.avgReconnectionMinutes || 0),
                            count: result[0]?.reconnectionCount || 0
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
                assignedCount: results[5],
                pendingCount: results[6],
                resolvedCount: results[7],
                closedCount: results[8],
                inProgressCount: results[9],
                avgReconnectionTime: results[10],
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
            const { dateRange, startDate, endDate, agents, products, status, ticketTypes, teams } = req.query;

            // Calculate date range filter
            let days = 30; // default
            let customDateFilter = '';
            if (dateRange === 'custom' && startDate && endDate) {
                customDateFilter = `AND t.createdAt BETWEEN '${startDate}' AND '${endDate} 23:59:59'`;
            } else if (dateRange && dateRange !== 'custom') {
                days = parseInt(dateRange);
            }

            // Build filter conditions
            let agentFilter = '';
            let productFilter = '';
            let statusFilter = '';
            let ticketTypeFilter = '';
            const queryParams = customDateFilter ? [] : [days];

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

            if (ticketTypes && ticketTypes.length > 0) {
                const ticketTypeList = Array.isArray(ticketTypes) ? ticketTypes : [ticketTypes];
                const ticketTypePlaceholders = ticketTypeList.map(() => '?').join(',');
                ticketTypeFilter = `AND t.ticketType IN (${ticketTypePlaceholders})`;
                queryParams.push(...ticketTypeList);
            }

            let teamFilter = '';
            if (teams && teams.length > 0) {
                const teamList = Array.isArray(teams) ? teams : [teams];
                const teamPlaceholders = teamList.map(() => '?').join(',');
                teamFilter = `AND EXISTS (
                    SELECT 1 FROM \`assign-ticket\` at
                    JOIN agents a ON at.agentId = a.id
                    WHERE at.ticketId = t.ticketId
                    AND a.team IN (${teamPlaceholders})
                )`;
                queryParams.push(...teamList);
            }

            // Query to get tickets created per day
            const createdQuery = customDateFilter ? `
                SELECT
                    DATE(t.createdAt) as date,
                    COUNT(*) as count
                FROM tickets t
                WHERE 1=1
                ${customDateFilter}
                ${agentFilter}
                ${productFilter}
                ${statusFilter}
                ${ticketTypeFilter}
                ${teamFilter}
                GROUP BY DATE(t.createdAt)
                ORDER BY date ASC
            ` : `
                SELECT
                    DATE(t.createdAt) as date,
                    COUNT(*) as count
                FROM tickets t
                WHERE t.createdAt >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                ${agentFilter}
                ${productFilter}
                ${statusFilter}
                ${ticketTypeFilter}
                ${teamFilter}
                GROUP BY DATE(t.createdAt)
                ORDER BY date ASC
            `;

            // Query to get tickets resolved per day (from calls table)
            const resolvedQuery = customDateFilter ? `
                SELECT
                    DATE(c.resolvedOn) as date,
                    COUNT(DISTINCT t.ticketId) as count
                FROM tickets t
                LEFT JOIN calls c ON t.ticketId = c.ticketId
                WHERE c.resolvedOn IS NOT NULL
                ${customDateFilter.replace('t.createdAt', 'c.resolvedOn')}
                ${agentFilter}
                ${productFilter}
                ${statusFilter}
                ${ticketTypeFilter}
                ${teamFilter}
                GROUP BY DATE(c.resolvedOn)
                ORDER BY date ASC
            ` : `
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
                ${ticketTypeFilter}
                ${teamFilter}
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

            // Generate date labels
            const labels = [];
            const createdData = [];
            const resolvedData = [];

            // Create maps for quick lookup
            const createdMap = new Map(createdResults.map(r => [r.date.toISOString().split('T')[0], r.count]));
            const resolvedMap = new Map(resolvedResults.map(r => [r.date.toISOString().split('T')[0], r.count]));

            // Generate data for each day
            if (customDateFilter && startDate && endDate) {
                // For custom date range, iterate from startDate to endDate
                const start = new Date(startDate);
                const end = new Date(endDate);
                const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

                for (let i = 0; i < daysDiff; i++) {
                    const date = new Date(start);
                    date.setDate(start.getDate() + i);
                    const dateStr = date.toISOString().split('T')[0];

                    // Format label based on range
                    let label;
                    if (daysDiff <= 7) {
                        label = date.toLocaleDateString('en-US', { weekday: 'short' });
                    } else {
                        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }

                    labels.push(label);
                    createdData.push(createdMap.get(dateStr) || 0);
                    resolvedData.push(resolvedMap.get(dateStr) || 0);
                }
            } else {
                // For relative date range (last N days)
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
            const { dateRange, startDate, endDate, agents, products, status, ticketTypes, teams } = req.query;

            // Calculate date range filter
            let days = 30; // default
            let customDateFilter = '';
            if (dateRange === 'custom' && startDate && endDate) {
                customDateFilter = `AND c1.createdAt BETWEEN '${startDate}' AND '${endDate} 23:59:59'`;
            } else if (dateRange && dateRange !== 'custom') {
                days = parseInt(dateRange);
            }

            // Build filter conditions
            let agentFilter = '';
            let productFilter = '';
            let statusFilter = '';
            let ticketTypeFilter = '';
            const queryParams = customDateFilter ? [] : [days];

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

            if (ticketTypes && ticketTypes.length > 0) {
                const ticketTypeList = Array.isArray(ticketTypes) ? ticketTypes : [ticketTypes];
                const ticketTypePlaceholders = ticketTypeList.map(() => '?').join(',');
                ticketTypeFilter = `AND t.ticketType IN (${ticketTypePlaceholders})`;
                queryParams.push(...ticketTypeList);
            }

            let teamFilter = '';
            if (teams && teams.length > 0) {
                const teamList = Array.isArray(teams) ? teams : [teams];
                const teamPlaceholders = teamList.map(() => '?').join(',');
                teamFilter = `AND EXISTS (
                    SELECT 1 FROM \`assign-ticket\` at
                    JOIN agents a ON at.agentId = a.id
                    WHERE at.ticketId = t.ticketId
                    AND a.team IN (${teamPlaceholders})
                )`;
                queryParams.push(...teamList);
            }

            // Query to get resolution time distribution
            // Use subquery to get only the most recent call per ticket to avoid duplicate counting
            const ticketDateFilter = customDateFilter ? customDateFilter.replace('c1.createdAt', 't.createdAt') : '';

            const query = customDateFilter ? `
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
                        GROUP BY ticketId
                    ) c2 ON c1.ticketId = c2.ticketId AND c1.id = c2.maxId
                ) latest_call ON t.ticketId = latest_call.ticketId
                WHERE 1=1
                ${ticketDateFilter}
                ${agentFilter}
                ${productFilter}
                ${statusFilter}
                ${ticketTypeFilter}
                ${teamFilter}
                GROUP BY timeRange
            ` : `
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
                ${ticketTypeFilter}
                ${teamFilter}
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
            const { dateRange, startDate, endDate, agents, products, status, ticketTypes, teams } = req.query;

            // Calculate date range filter
            let days = 30; // default
            let customDateFilter = '';
            if (dateRange === 'custom' && startDate && endDate) {
                customDateFilter = `AND f.createdAt BETWEEN '${startDate}' AND '${endDate} 23:59:59'`;
            } else if (dateRange && dateRange !== 'custom') {
                days = parseInt(dateRange);
            }

            // Build filter conditions
            let agentFilter = '';
            let productFilter = '';
            let statusFilter = '';
            let ticketTypeFilter = '';
            const queryParams = customDateFilter ? [] : [days];

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

            if (ticketTypes && ticketTypes.length > 0) {
                const ticketTypeList = Array.isArray(ticketTypes) ? ticketTypes : [ticketTypes];
                const ticketTypePlaceholders = ticketTypeList.map(() => '?').join(',');
                ticketTypeFilter = `AND t.ticketType IN (${ticketTypePlaceholders})`;
                queryParams.push(...ticketTypeList);
            }

            let teamFilter = '';
            if (teams && teams.length > 0) {
                const teamList = Array.isArray(teams) ? teams : [teams];
                const teamPlaceholders = teamList.map(() => '?').join(',');
                teamFilter = `AND EXISTS (
                    SELECT 1 FROM \`assign-ticket\` at
                    JOIN agents a ON at.agentId = a.id
                    WHERE at.ticketId = t.ticketId
                    AND a.team IN (${teamPlaceholders})
                )`;
                queryParams.push(...teamList);
            }

            // Query to get customer satisfaction distribution from feedbacks table
            const query = customDateFilter ? `
                SELECT
                    f.rating,
                    COUNT(*) as count
                FROM feedbacks f
                LEFT JOIN tickets t ON f.ticketId = t.ticketId
                WHERE f.rating IS NOT NULL
                AND f.rating BETWEEN 1 AND 5
                ${customDateFilter}
                ${agentFilter}
                ${productFilter}
                ${statusFilter}
                ${ticketTypeFilter}
                ${teamFilter}
                GROUP BY f.rating
                ORDER BY f.rating DESC
            ` : `
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
                ${ticketTypeFilter}
                ${teamFilter}
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
            const { dateRange, startDate, endDate, agents, products, status, ticketTypes, teams } = req.query;

            // Calculate date range filter
            let days = 30; // default
            let dateFilter = '';
            if (dateRange === 'custom' && startDate && endDate) {
                dateFilter = `AND t.createdAt BETWEEN '${startDate}' AND '${endDate} 23:59:59'`;
            } else if (dateRange && dateRange !== 'custom') {
                days = parseInt(dateRange);
                dateFilter = `AND t.createdAt >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)`;
            } else {
                dateFilter = `AND t.createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
            }

            // Build filter conditions
            let agentFilter = '';
            const queryParams = [];

            if (agents && agents.length > 0) {
                const agentList = Array.isArray(agents) ? agents : [agents];
                const agentPlaceholders = agentList.map(() => '?').join(',');
                agentFilter = `AND a.agentName IN (${agentPlaceholders})`;
                queryParams.push(...agentList);
            }

            let productFilter = '';
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

            let ticketTypeFilter = '';
            if (ticketTypes && ticketTypes.length > 0) {
                const ticketTypeList = Array.isArray(ticketTypes) ? ticketTypes : [ticketTypes];
                const ticketTypePlaceholders = ticketTypeList.map(() => '?').join(',');
                ticketTypeFilter = `AND t.ticketType IN (${ticketTypePlaceholders})`;
                queryParams.push(...ticketTypeList);
            }

            let teamFilter = '';
            if (teams && teams.length > 0) {
                const teamList = Array.isArray(teams) ? teams : [teams];
                const teamPlaceholders = teamList.map(() => '?').join(',');
                teamFilter = `AND a.team IN (${teamPlaceholders})`;
                queryParams.push(...teamList);
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
                ${agentFilter}
                ${dateFilter}
                ${productFilter}
                ${statusFilter}
                ${ticketTypeFilter}
                ${teamFilter}
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
            const { dateRange, startDate, endDate, agents, products, status, ticketTypes, teams } = req.query;

            // Calculate date range filter
            let dateFilter = '';
            if (dateRange === 'custom' && startDate && endDate) {
                dateFilter = `AND c.createdAt BETWEEN '${startDate}' AND '${endDate} 23:59:59'`;
            } else if (dateRange && dateRange !== 'custom') {
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

            let statusFilter = '';
            if (status && status.length > 0) {
                const statusList = Array.isArray(status) ? status : [status];
                const statusPlaceholders = statusList.map(() => '?').join(',');
                statusFilter = `AND t.status IN (${statusPlaceholders})`;
            }

            let ticketTypeFilter = '';
            if (ticketTypes && ticketTypes.length > 0) {
                const ticketTypeList = Array.isArray(ticketTypes) ? ticketTypes : [ticketTypes];
                const ticketTypePlaceholders = ticketTypeList.map(() => '?').join(',');
                ticketTypeFilter = `AND t.ticketType IN (${ticketTypePlaceholders})`;
            }

            let teamFilter = '';
            if (teams && teams.length > 0) {
                const teamList = Array.isArray(teams) ? teams : [teams];
                const teamPlaceholders = teamList.map(() => '?').join(',');
                teamFilter = `AND EXISTS (
                    SELECT 1 FROM \`assign-ticket\` at
                    JOIN agents a ON at.agentId = a.id
                    WHERE at.ticketId = t.ticketId
                    AND a.team IN (${teamPlaceholders})
                )`;
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
            if (ticketTypes && ticketTypes.length > 0) {
                const ticketTypeList = Array.isArray(ticketTypes) ? ticketTypes : [ticketTypes];
                queryParams.push(...ticketTypeList);
            }
            if (teams && teams.length > 0) {
                const teamList = Array.isArray(teams) ? teams : [teams];
                queryParams.push(...teamList);
            }

            // 1. Total calls by type (inbound/outbound)
            const totalCallsQuery = `
                SELECT
                    COUNT(*) as totalCalls,
                    COUNT(CASE WHEN c.callType = 'inbound' THEN 1 END) as inboundCalls,
                    COUNT(CASE WHEN c.callType = 'outbound' THEN 1 END) as outboundCalls
                FROM calls c
                LEFT JOIN tickets t ON c.ticketId = t.ticketId
                WHERE 1=1 ${dateFilter} ${agentFilter} ${productFilter} ${statusFilter} ${ticketTypeFilter} ${teamFilter}
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
                  ${dateFilter} ${agentFilter} ${productFilter} ${statusFilter} ${ticketTypeFilter} ${teamFilter}
            `;

            // 3. Missed calls and callbacks count
            const missedCallsQuery = `
                SELECT
                    COUNT(CASE WHEN c.callStatus = 'missed' THEN 1 END) as missedCalls,
                    COUNT(*) as totalCallsWithStatus
                FROM calls c
                LEFT JOIN tickets t ON c.ticketId = t.ticketId
                WHERE 1=1 ${dateFilter} ${agentFilter} ${productFilter} ${statusFilter} ${ticketTypeFilter} ${teamFilter}
            `;

            // 4. Call completion rate
            const callCompletionQuery = `
                SELECT
                    COUNT(*) as totalCalls,
                    COUNT(CASE WHEN c.callStatus = 'completed' THEN 1 END) as completedCalls,
                    (COUNT(CASE WHEN c.callStatus = 'completed' THEN 1 END) / COUNT(*)) * 100 as completionRate
                FROM calls c
                LEFT JOIN tickets t ON c.ticketId = t.ticketId
                WHERE 1=1 ${dateFilter} ${agentFilter} ${productFilter} ${statusFilter} ${ticketTypeFilter} ${teamFilter}
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

    // Get call trends data for line chart (inbound, outbound, missed, completed, pending over time)
    static async getCallTrends(req, res) {
        try {
            const { dateRange, startDate, endDate, agents, products, status, ticketTypes, teams } = req.query;

            // Calculate date range filter
            let days = 30; // default
            let customDateFilter = '';
            if (dateRange === 'custom' && startDate && endDate) {
                customDateFilter = `AND c.createdAt BETWEEN '${startDate}' AND '${endDate} 23:59:59'`;
            } else if (dateRange && dateRange !== 'custom') {
                days = parseInt(dateRange);
            }

            // Build filter conditions
            let agentFilter = '';
            let productFilter = '';
            let statusFilter = '';
            let ticketTypeFilter = '';
            let teamFilter = '';
            const queryParams = customDateFilter ? [] : [days];

            if (agents && agents.length > 0) {
                const agentList = Array.isArray(agents) ? agents : [agents];
                const agentPlaceholders = agentList.map(() => '?').join(',');
                agentFilter = `AND c.agentId IN (
                    SELECT id FROM agents WHERE agentName IN (${agentPlaceholders})
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

            if (ticketTypes && ticketTypes.length > 0) {
                const ticketTypeList = Array.isArray(ticketTypes) ? ticketTypes : [ticketTypes];
                const ticketTypePlaceholders = ticketTypeList.map(() => '?').join(',');
                ticketTypeFilter = `AND t.ticketType IN (${ticketTypePlaceholders})`;
                queryParams.push(...ticketTypeList);
            }

            if (teams && teams.length > 0) {
                const teamList = Array.isArray(teams) ? teams : [teams];
                const teamPlaceholders = teamList.map(() => '?').join(',');
                teamFilter = `AND EXISTS (
                    SELECT 1 FROM agents a
                    WHERE a.id = c.agentId
                    AND a.team IN (${teamPlaceholders})
                )`;
                queryParams.push(...teamList);
            }

            // Query to get call statistics per day
            const callTrendsQuery = customDateFilter ? `
                SELECT
                    DATE(c.createdAt) as date,
                    COUNT(*) as totalCalls,
                    COUNT(CASE WHEN c.callType = 'inbound' THEN 1 END) as inboundCalls,
                    COUNT(CASE WHEN c.callType = 'outbound' THEN 1 END) as outboundCalls,
                    COUNT(CASE WHEN c.callStatus = 'missed' THEN 1 END) as missedCalls,
                    COUNT(CASE WHEN c.callStatus = 'completed' THEN 1 END) as completedCalls,
                    COUNT(CASE WHEN c.callStatus = 'pending' THEN 1 END) as pendingCalls
                FROM calls c
                LEFT JOIN tickets t ON c.ticketId = t.ticketId
                WHERE 1=1
                ${customDateFilter}
                ${agentFilter}
                ${productFilter}
                ${statusFilter}
                ${ticketTypeFilter}
                ${teamFilter}
                GROUP BY DATE(c.createdAt)
                ORDER BY date ASC
            ` : `
                SELECT
                    DATE(c.createdAt) as date,
                    COUNT(*) as totalCalls,
                    COUNT(CASE WHEN c.callType = 'inbound' THEN 1 END) as inboundCalls,
                    COUNT(CASE WHEN c.callType = 'outbound' THEN 1 END) as outboundCalls,
                    COUNT(CASE WHEN c.callStatus = 'missed' THEN 1 END) as missedCalls,
                    COUNT(CASE WHEN c.callStatus = 'completed' THEN 1 END) as completedCalls,
                    COUNT(CASE WHEN c.callStatus = 'pending' THEN 1 END) as pendingCalls
                FROM calls c
                LEFT JOIN tickets t ON c.ticketId = t.ticketId
                WHERE c.createdAt >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                ${agentFilter}
                ${productFilter}
                ${statusFilter}
                ${ticketTypeFilter}
                ${teamFilter}
                GROUP BY DATE(c.createdAt)
                ORDER BY date ASC
            `;

            // Execute query
            const results = await new Promise((resolve, reject) => {
                connection.query(callTrendsQuery, queryParams, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            console.log('\n========== CALL TRENDS QUERY RESULTS ==========');
            console.log('Query returned', results.length, 'rows');
            results.forEach(row => {
                console.log(`Date: ${row.date}, Inbound: ${row.inboundCalls}, Outbound: ${row.outboundCalls}, Missed: ${row.missedCalls}, Completed: ${row.completedCalls}, Pending: ${row.pendingCalls}`);
            });

            // Generate date labels and data arrays
            const labels = [];
            const inboundData = [];
            const outboundData = [];
            const missedData = [];
            const completedData = [];
            const pendingData = [];

            // Create a map for quick lookup (use consistent date format)
            const dataMap = new Map();
            results.forEach(row => {
                // Format date as YYYY-MM-DD without timezone conversion
                const d = new Date(row.date);
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                dataMap.set(dateStr, {
                    inbound: parseInt(row.inboundCalls) || 0,
                    outbound: parseInt(row.outboundCalls) || 0,
                    missed: parseInt(row.missedCalls) || 0,
                    completed: parseInt(row.completedCalls) || 0,
                    pending: parseInt(row.pendingCalls) || 0
                });
            });

            console.log('Call Trends Data Map:', dataMap);

            // Generate all dates in the range
            const startDateObj = customDateFilter && startDate ? new Date(startDate + ' 00:00:00') : new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            const endDateObj = customDateFilter && endDate ? new Date(endDate + ' 23:59:59') : new Date();

            for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const formattedLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                labels.push(formattedLabel);

                const data = dataMap.get(dateStr) || { inbound: 0, outbound: 0, missed: 0, completed: 0, pending: 0 };
                console.log(`Date ${dateStr} (${formattedLabel}):`, data);

                inboundData.push(data.inbound);
                outboundData.push(data.outbound);
                missedData.push(data.missed);
                completedData.push(data.completed);
                pendingData.push(data.pending);
            }

            console.log('\n--- FINAL DATA SENT TO FRONTEND ---');
            console.log('Labels:', labels);
            console.log('Inbound:', inboundData);
            console.log('Outbound:', outboundData);
            console.log('Missed:', missedData);
            console.log('Completed:', completedData);
            console.log('Pending:', pendingData);
            console.log('===============================================\n');

            return res.json({
                message: "Call trends data fetched successfully",
                data: {
                    labels,
                    inbound: inboundData,
                    outbound: outboundData,
                    missed: missedData,
                    completed: completedData,
                    pending: pendingData
                }
            });

        } catch (error) {
            console.error('Error in getCallTrends:', error);
            return res.status(500).json({
                message: "Error fetching call trends data",
                error: error.message
            });
        }
    }

    // Get product performance data
    static async getProductPerformance(req, res) {
        try {
            const { dateRange, startDate, endDate, agents, products, status, ticketTypes, teams } = req.query;

            // Calculate date range filter
            let dateFilter = '';
            let currentPeriodCondition = '';
            let previousPeriodCondition = '';
            let joinDateCondition = '';

            if (dateRange === 'custom' && startDate && endDate) {
                // Calculate the date range span
                const start = new Date(startDate);
                const end = new Date(endDate);
                const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

                // Calculate previous period
                const prevEnd = new Date(start);
                prevEnd.setDate(prevEnd.getDate() - 1);
                const prevStart = new Date(prevEnd);
                prevStart.setDate(prevStart.getDate() - daysDiff);

                const prevStartStr = prevStart.toISOString().split('T')[0];
                const prevEndStr = prevEnd.toISOString().split('T')[0];

                dateFilter = `AND t.createdAt BETWEEN '${startDate}' AND '${endDate} 23:59:59'`;
                currentPeriodCondition = `t.createdAt BETWEEN '${startDate}' AND '${endDate} 23:59:59'`;
                previousPeriodCondition = `t.createdAt BETWEEN '${prevStartStr}' AND '${prevEndStr} 23:59:59'`;
                joinDateCondition = `t.createdAt >= '${prevStartStr}'`;
            } else if (dateRange && dateRange !== 'custom') {
                const days = parseInt(dateRange);
                dateFilter = `AND t.createdAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`;
                currentPeriodCondition = `t.createdAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`;
                previousPeriodCondition = `t.createdAt >= DATE_SUB(NOW(), INTERVAL ${days * 2} DAY) AND t.createdAt < DATE_SUB(NOW(), INTERVAL ${days} DAY)`;
                joinDateCondition = `t.createdAt >= DATE_SUB(NOW(), INTERVAL ${days * 2} DAY)`;
            } else {
                dateFilter = `AND t.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
                currentPeriodCondition = `t.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
                previousPeriodCondition = `t.createdAt >= DATE_SUB(NOW(), INTERVAL 60 DAY) AND t.createdAt < DATE_SUB(NOW(), INTERVAL 30 DAY)`;
                joinDateCondition = `t.createdAt >= DATE_SUB(NOW(), INTERVAL 60 DAY)`;
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
                productFilter = `AND p.productId IN (${productPlaceholders})`;
            }

            let statusFilter = '';
            if (status && status.length > 0) {
                const statusList = Array.isArray(status) ? status : [status];
                const statusPlaceholders = statusList.map(() => '?').join(',');
                statusFilter = `AND t.status IN (${statusPlaceholders})`;
            }

            let ticketTypeFilter = '';
            if (ticketTypes && ticketTypes.length > 0) {
                const ticketTypeList = Array.isArray(ticketTypes) ? ticketTypes : [ticketTypes];
                const ticketTypePlaceholders = ticketTypeList.map(() => '?').join(',');
                ticketTypeFilter = `AND t.ticketType IN (${ticketTypePlaceholders})`;
            }

            let teamFilter = '';
            if (teams && teams.length > 0) {
                const teamList = Array.isArray(teams) ? teams : [teams];
                const teamPlaceholders = teamList.map(() => '?').join(',');
                teamFilter = `AND EXISTS (
                    SELECT 1 FROM \`assign-ticket\` at
                    JOIN agents a ON at.agentId = a.id
                    WHERE at.ticketId = t.ticketId
                    AND a.team IN (${teamPlaceholders})
                )`;
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
            if (ticketTypes && ticketTypes.length > 0) {
                const ticketTypeList = Array.isArray(ticketTypes) ? ticketTypes : [ticketTypes];
                queryParams.push(...ticketTypeList);
            }
            if (teams && teams.length > 0) {
                const teamList = Array.isArray(teams) ? teams : [teams];
                queryParams.push(...teamList);
            }

            // Product performance query - aggregated metrics by product
            const productPerformanceQuery = `
                SELECT
                    p.productId as id,
                    p.productName as category,
                    COUNT(DISTINCT CASE
                        WHEN ${currentPeriodCondition}
                        THEN t.ticketId
                    END) as volume,

                    -- Current period resolution time
                    AVG(
                        CASE
                            WHEN ${currentPeriodCondition}
                            AND c.resolvedOn IS NOT NULL AND c.startTime IS NOT NULL THEN
                                TIMESTAMPDIFF(MINUTE, c.startTime, c.resolvedOn)
                            WHEN ${currentPeriodCondition}
                            AND c.endTime IS NOT NULL AND c.startTime IS NOT NULL THEN
                                TIMESTAMPDIFF(MINUTE, c.startTime, c.endTime)
                            ELSE NULL
                        END
                    ) as currentResolutionTime,

                    -- Previous period resolution time
                    AVG(
                        CASE
                            WHEN ${previousPeriodCondition}
                            AND c.resolvedOn IS NOT NULL AND c.startTime IS NOT NULL THEN
                                TIMESTAMPDIFF(MINUTE, c.startTime, c.resolvedOn)
                            WHEN ${previousPeriodCondition}
                            AND c.endTime IS NOT NULL AND c.startTime IS NOT NULL THEN
                                TIMESTAMPDIFF(MINUTE, c.startTime, c.endTime)
                            ELSE NULL
                        END
                    ) as previousResolutionTime,

                    -- Current period CSAT
                    AVG(
                        CASE
                            WHEN ${currentPeriodCondition}
                            THEN f.rating
                            ELSE NULL
                        END
                    ) as currentCsat,

                    -- Previous period CSAT
                    AVG(
                        CASE
                            WHEN ${previousPeriodCondition}
                            THEN f.rating
                            ELSE NULL
                        END
                    ) as previousCsat,

                    COUNT(DISTINCT CASE
                        WHEN ${currentPeriodCondition}
                        THEN t.ticketId
                    END) as currentPeriodVolume,
                    COUNT(DISTINCT CASE
                        WHEN ${previousPeriodCondition}
                        THEN t.ticketId
                    END) as previousPeriodVolume
                FROM product p
                LEFT JOIN tickets t ON p.productId = t.productId
                    AND ${joinDateCondition}
                    ${agentFilter} ${statusFilter} ${ticketTypeFilter} ${teamFilter}
                LEFT JOIN calls c ON t.ticketId = c.ticketId AND c.callStatus = 'completed'
                LEFT JOIN feedbacks f ON t.ticketId = f.ticketId
                WHERE 1=1 ${productFilter}
                GROUP BY p.productId, category
                HAVING volume > 0
                ORDER BY volume DESC
            `;

            connection.query(productPerformanceQuery, queryParams, (err, result) => {
                if (err) {
                    console.error('Error in getProductPerformance query:', err);
                    return res.status(500).json({
                        message: "Error fetching product performance data",
                        error: err.message
                    });
                }

                // Process results to calculate trends and add sparkline data
                const productPerformance = result.map(product => {
                    // Calculate volume trend (percentage change)
                    const volumeTrend = product.previousPeriodVolume > 0
                        ? ((product.currentPeriodVolume - product.previousPeriodVolume) / product.previousPeriodVolume * 100)
                        : 0;

                    // Calculate REAL resolution time trend (percentage change)
                    const currentResTime = parseFloat(product.currentResolutionTime) || 0;
                    const previousResTime = parseFloat(product.previousResolutionTime) || 0;
                    const resolutionTimeTrend = previousResTime > 0
                        ? ((currentResTime - previousResTime) / previousResTime * 100)
                        : 0;

                    // Calculate REAL CSAT trend (absolute difference in points)
                    const currentCsat = parseFloat(product.currentCsat) || 0;
                    const previousCsat = parseFloat(product.previousCsat) || 0;
                    const csatTrend = currentCsat - previousCsat;

                    // Generate sparkline data (simplified - could be actual historical data)
                    const sparkline = Array.from({ length: 9 }, () =>
                        Math.round(product.volume / 10 + (Math.random() * product.volume / 5 - product.volume / 10))
                    );

                    return {
                        id: product.id,
                        category: product.category,
                        description: '', // No description in database
                        volume: product.volume,
                        resolutionTime: Math.round(currentResTime),
                        csat: parseFloat(currentCsat.toFixed(1)),
                        volumeTrend: parseFloat(volumeTrend.toFixed(1)),
                        resolutionTimeTrend: parseFloat(resolutionTimeTrend.toFixed(1)),
                        csatTrend: parseFloat(csatTrend.toFixed(1)),
                        sparkline: sparkline
                    };
                });

                return res.json({
                    message: "Product performance data fetched successfully",
                    data: productPerformance
                });
            });

        } catch (error) {
            console.error('Error in getProductPerformance:', error);
            return res.status(500).json({
                message: "Error fetching product performance data",
                error: error.message
            });
        }
    }

    // Get callback status data
    static async getCallbackStatus(req, res) {
        try {
            const { dateRange, startDate, endDate, agents, products, status, ticketTypes, teams } = req.query;

            // Calculate date range filter
            let dateFilter = '';
            if (dateRange === 'custom' && startDate && endDate) {
                dateFilter = `AND c.createdAt BETWEEN '${startDate}' AND '${endDate} 23:59:59'`;
            } else if (dateRange && dateRange !== 'custom') {
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

            let statusFilter = '';
            if (status && status.length > 0) {
                const statusList = Array.isArray(status) ? status : [status];
                const statusPlaceholders = statusList.map(() => '?').join(',');
                statusFilter = `AND t.status IN (${statusPlaceholders})`;
            }

            let ticketTypeFilter = '';
            if (ticketTypes && ticketTypes.length > 0) {
                const ticketTypeList = Array.isArray(ticketTypes) ? ticketTypes : [ticketTypes];
                const ticketTypePlaceholders = ticketTypeList.map(() => '?').join(',');
                ticketTypeFilter = `AND t.ticketType IN (${ticketTypePlaceholders})`;
            }

            let teamFilter = '';
            if (teams && teams.length > 0) {
                const teamList = Array.isArray(teams) ? teams : [teams];
                const teamPlaceholders = teamList.map(() => '?').join(',');
                teamFilter = `AND EXISTS (
                    SELECT 1 FROM \`assign-ticket\` at
                    JOIN agents a ON at.agentId = a.id
                    WHERE at.ticketId = t.ticketId
                    AND a.team IN (${teamPlaceholders})
                )`;
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
            if (ticketTypes && ticketTypes.length > 0) {
                const ticketTypeList = Array.isArray(ticketTypes) ? ticketTypes : [ticketTypes];
                queryParams.push(...ticketTypeList);
            }
            if (teams && teams.length > 0) {
                const teamList = Array.isArray(teams) ? teams : [teams];
                queryParams.push(...teamList);
            }

            // Callback status query
            // Count all calls (both inbound and outbound)
            const callbackStatusQuery = `
                SELECT
                    COUNT(CASE WHEN c.callStatus = 'completed' THEN 1 END) as successful,
                    COUNT(CASE WHEN c.callStatus = 'pending' OR c.callStatus = 'ongoing' THEN 1 END) as pending,
                    COUNT(CASE WHEN c.callStatus = 'missed' THEN 1 END) as missed,
                    COUNT(*) as total
                FROM calls c
                LEFT JOIN tickets t ON c.ticketId = t.ticketId
                WHERE 1=1
                  ${dateFilter} ${agentFilter} ${productFilter} ${statusFilter} ${ticketTypeFilter} ${teamFilter}
            `;

            connection.query(callbackStatusQuery, queryParams, (err, result) => {
                if (err) {
                    console.error('Error in getCallbackStatus query:', err);
                    return res.status(500).json({
                        message: "Error fetching callback status data",
                        error: err.message
                    });
                }

                const callbackStatus = {
                    successful: result[0]?.successful || 0,
                    pending: result[0]?.pending || 0,
                    missed: result[0]?.missed || 0,
                    total: result[0]?.total || 0,
                    successRate: result[0]?.total > 0
                        ? Math.round((result[0].successful / result[0].total) * 100 * 10) / 10
                        : 0,
                    filters: {
                        dateRange: dateRange || '30',
                        agents: agents || [],
                        products: products || []
                    }
                };

                return res.json({
                    message: "Callback status data fetched successfully",
                    data: callbackStatus
                });
            });

        } catch (error) {
            console.error('Error in getCallbackStatus:', error);
            return res.status(500).json({
                message: "Error fetching callback status data",
                error: error.message
            });
        }
    }

    // Get filter options for analytics
    static async getFilterOptions(req, res) {
        try {
            // Get all agents
            const agentsQuery = `
                SELECT DISTINCT
                    a.id,
                    a.agentName,
                    a.productId,
                    p.productName as productName
                FROM agents a
                LEFT JOIN product p ON a.productId = p.id
                ORDER BY a.agentName
            `;

            // Get all products
            const productsQuery = `SELECT id, productName FROM product ORDER BY productName`;

            // Get all ticket types
            const ticketTypesQuery = `SELECT DISTINCT ticketType FROM tickets WHERE ticketType IS NOT NULL ORDER BY ticketType`;

            // Get all ticket statuses
            const statusQuery = `SELECT DISTINCT status FROM tickets WHERE status IS NOT NULL ORDER BY status`;

            // Execute all queries in parallel
            const [agents, products, ticketTypes, statuses] = await Promise.all([
                new Promise((resolve, reject) => {
                    connection.query(agentsQuery, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                }),
                new Promise((resolve, reject) => {
                    connection.query(productsQuery, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                }),
                new Promise((resolve, reject) => {
                    connection.query(ticketTypesQuery, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                }),
                new Promise((resolve, reject) => {
                    connection.query(statusQuery, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                })
            ]);

            // Group agents by product to create teams
            const agentTeams = {};
            agents.forEach(agent => {
                const teamName = agent.productName || 'Unassigned';
                if (!agentTeams[teamName]) {
                    agentTeams[teamName] = {
                        teamName,
                        productId: agent.productId,
                        agents: []
                    };
                }
                agentTeams[teamName].agents.push({
                    id: agent.id,
                    name: agent.agentName
                });
            });

            res.status(200).json({
                message: "Filter options retrieved successfully",
                data: {
                    agents: agents.map(agent => ({
                        value: agent.agentName,
                        label: agent.agentName,
                        id: agent.id,
                        productId: agent.productId,
                        team: agent.productName || 'Unassigned'
                    })),
                    products: products.map(product => ({
                        value: product.id.toString(),
                        label: product.productName,
                        id: product.id
                    })),
                    ticketTypes: ticketTypes.map(type => ({
                        value: type.ticketType,
                        label: type.ticketType.charAt(0).toUpperCase() + type.ticketType.slice(1)
                    })),
                    statuses: statuses.map(status => ({
                        value: status.status,
                        label: status.status.charAt(0).toUpperCase() + status.status.slice(1).replace('_', ' ')
                    })),
                    teams: Object.values(agentTeams)
                }
            });

        } catch (error) {
            console.error('Error fetching filter options:', error);
            res.status(500).json({
                message: "Error fetching filter options",
                error: error.message
            });
        }
    }
}
