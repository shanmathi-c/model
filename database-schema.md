# Database Schema Documentation

## Overview
This document outlines the database structure for the ticket management system. The system is built using MySQL database with Node.js backend and manages tickets, calls, callbacks, feedback, and agent assignments.

## Database Connection
- **Database Name**: `shanmathi`
- **Host**: `localhost`
- **Port**: `3306`
- **User**: `root`
- **Database System**: MySQL (using mysql2 package)

## Tables Structure

### 1. `tickets` Table
Main table storing ticket information and customer requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `ticketId` | VARCHAR(255) | UNIQUE | Formatted ticket ID (e.g., T001, T002) |
| `userId` | INT | - | User ID who created the ticket |
| `productId` | INT | NULLABLE | Foreign key to product table |
| `name` | VARCHAR(255) | - | Customer name |
| `email` | VARCHAR(255) | NULLABLE | Customer email address |
| `phone` | VARCHAR(255) | - | Customer phone number with country code |
| `subject` | TEXT | - | Ticket subject |
| `description` | TEXT | - | Detailed ticket description |
| `status` | VARCHAR(255) | - | Ticket status (created, assigned, resolved, etc.) |
| `ticketType` | VARCHAR(255) | - | Type of ticket (freshdesk, call) |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updatedAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |
| `resolvedOn` | TIMESTAMP | NULLABLE | Resolution timestamp |

### 2. `product` Table
Stores product information that tickets are associated with.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `productId` | INT | PRIMARY KEY | Unique product identifier |
| `name` / `productName` / `product_name` / `title` | VARCHAR(255) | - | Product name (column naming varies) |
| `id` | INT | - | Alternative ID column used in some joins |

### 3. `agents` Table
Stores agent information and their specializations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY | Unique agent identifier |
| `agentName` | VARCHAR(255) | - | Agent's full name |
| `productId` | INT | - | Product specialization (links to product table) |
| *Other agent details* | - | - | Additional agent information |

### 4. `assign-ticket` Table
Manages ticket assignments to agents with tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique assignment identifier |
| `ticketId` | INT | FOREIGN KEY | Links to tickets table |
| `agentId` | INT | FOREIGN KEY | Links to agents table |
| `status` | VARCHAR(255) | - | Assignment status |
| `importAction` | VARCHAR(255) | - | Action type (single, bulk, call) |
| `ticketType` | VARCHAR(255) | - | Ticket type (freshdesk, call) |

### 5. `calls` Table
Stores call-related information and communication details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique call identifier |
| `callId` | VARCHAR(255) | UNIQUE | Formatted call ID (e.g., C001, C002) |
| `ticketId` | INT | FOREIGN KEY | Links to tickets table |
| `userPhone` | VARCHAR(255) | - | Customer phone number |
| `productId` | INT | NULLABLE | Related product |
| `agentId` | INT | NULLABLE | Assigned agent |
| `agentPhone` | VARCHAR(255) | NULLABLE | Agent phone number |
| `callStatus` | VARCHAR(255) | - | Call status (pending, ongoing, completed, missed) |
| `ticketStatus` | VARCHAR(255) | - | Related ticket status |
| `recordingUrl` | VARCHAR(255) | NULLABLE | Call recording URL |
| `callType` | VARCHAR(255) | - | Call type (inbound, outbound) |
| `reason` | TEXT | - | Call reason |
| `callDescription` | TEXT | - | Detailed call description |
| `startTime` | TIMESTAMP | NULLABLE | Call start time |
| `endTime` | TIMESTAMP | NULLABLE | Call end time |
| `resolvedOn` | TIMESTAMP | NULLABLE | Resolution timestamp |
| `firstCall` | BOOLEAN | - | First call resolution flag |
| `notes` | TEXT | - | Call notes |
| `fcr` | BOOLEAN | - | First Call Resolution flag |

### 6. `callback` Table
Stores callback requests from customers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique callback identifier |
| `callbackId` | VARCHAR(255) | UNIQUE | Formatted callback ID |
| `productId` | INT | NULLABLE | Related product |
| `name` | VARCHAR(255) | - | Customer name |
| `email` | VARCHAR(255) | NULLABLE | Customer email address |
| `phone` | VARCHAR(255) | - | Customer phone number |
| `subject` | TEXT | - | Callback subject |
| `description` | TEXT | - | Callback description |
| `status` | VARCHAR(255) | DEFAULT 'inbound' | Callback status |
| `agentId` | INT | DEFAULT 0 | Assigned agent (0 for unassigned) |
| `callType` | VARCHAR(255) | DEFAULT 'inbound' | Call type |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updatedAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

### 7. `feedbacks` Table
Stores customer feedback for tickets and calls.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique feedback identifier |
| `feedbackId` | VARCHAR(255) | UNIQUE | Formatted feedback ID (e.g., FB001) |
| `ticketId` | INT | FOREIGN KEY | Links to tickets table |
| `deliveryStatus` | VARCHAR(255) | - | Feedback delivery status (pending, sent, etc.) |
| `rating` | INT | NULLABLE | Customer rating (1-5 scale) |
| `feedbackComment` | TEXT | NULLABLE | Customer feedback comment |
| `collectedTimestamp` | TIMESTAMP | - | When feedback was collected |
| `createdAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updatedAt` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

## Relationships and Foreign Keys

### Primary Relationships
1. **tickets → product**: `tickets.productId` references `product.productId`
2. **tickets → assign-ticket → agents**: Many-to-many relationship through assignments
3. **tickets → calls**: One-to-many relationship (one ticket can have multiple calls)
4. **tickets → feedbacks**: One-to-many relationship (one ticket can have multiple feedback)
5. **agents → product**: Many-to-one relationship (agents specialize in products)

### Relationship Diagram
```
tickets (1) ←→ (N) product
   ↓
   ←→ assign-ticket ←→ agents
   ↓
   ←→ calls
   ↓
   ←→ feedbacks

callback (standalone with optional product link)
```

## ID Generation Patterns

The system uses formatted IDs for better readability and tracking:

- **Ticket IDs**: `T001`, `T002`, `T003`, ... (Sequential numbering)
- **Call IDs**: `C001`, `C002`, `C003`, ... (Sequential numbering)
- **Feedback IDs**: `FB001`, `FB002`, `FB003`, ... (Sequential numbering)
- **Callback IDs**: Follows similar sequential pattern

## Status Values

### Ticket Status
- `created` - Initial ticket creation
- `assigned` - Ticket assigned to an agent
- `in-progress` - Agent working on ticket
- `resolved` - Ticket successfully resolved
- `closed` - Ticket closed (may include unresolved)

### Call Status
- `pending` - Call scheduled or waiting
- `ongoing` - Call currently in progress
- `completed` - Call successfully completed
- `missed` - Call was missed
- `failed` - Call failed to connect

### Feedback Status
- `pending` - Feedback request sent, awaiting response
- `sent` - Feedback notification delivered
- `completed` - Feedback received and processed
- `expired` - Feedback request expired

## Technology Stack

- **Backend**: Node.js with Express.js framework
- **Database**: MySQL using `mysql2` package
- **Frontend**: Nuxt.js (Vue.js framework)
- **Development**: Uses nodemon for server hot-reloading
- **Database Driver**: mysql2 for improved performance and security

## Data Integrity

- All tables have proper primary key constraints
- Foreign key relationships maintain data consistency
- Timestamp fields automatically track creation and updates
- NULLABLE fields properly handle optional data
- Unique constraints prevent duplicate formatted IDs

## Index Recommendations

For optimal performance, consider adding indexes on:
- `tickets.ticketId` (unique index)
- `tickets.status` (for status-based queries)
- `tickets.productId` (foreign key index)
- `calls.ticketId` (foreign key index)
- `calls.callStatus` (for status filtering)
- `feedbacks.ticketId` (foreign key index)
- `assign-ticket.ticketId` and `assign-ticket.agentId` (composite index)