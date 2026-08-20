# **NEW N ISLAM** 

Complete Implementation Specification **For AI Coding Agents** 

──────────────────────────────────── 

Version 2.0  •  August 2026 Stack: Next.js 14 + Supabase + Vercel 

## **<u>0. READ THIS FIRST — For Ever</u> AI A nt** **<u>y ge</u>** 

This document is the single source of truth for the New N Islam shop management web application. Every AI agent working on this project — regardless of which tool, account, or session — must read this section before writing any code. 

### **0.1 What This Project Is** 

A web application for New N Islam, a physical wholesale cloth shop in Islampur, Old Dhaka, Bangladesh. The app has two sides: a public customer portal and an admin management panel. It is NOT an ecommerce checkout system. Customers browse stock and place requests. The actual transaction happens physically at the shop. 

### **0.2 Tech Stack — Non-Negotiable** 

|**Framework**|Next.js 14 with App Router|
|---|---|
|**Language**|TypeScript — strict mode|
|**Styling**|Tailwind CSS|
|**Database**|Supabase PostgreSQL|
|**Image Storage**|Supabase Storage|
|**PDF Generation**|@react-pdf/renderer — client side only|
|**Auth — Customer**|Supabase Auth|
|**Auth — Admin**|Custom JWT with bcrypt, stored in HTTP-only cookie|
|**Deployment**|Vercel (single deployment — no separate backend)|
|**API**|Next.js API Routes under /api/ — RESTful conventions|



### **0.3 Current Project State** 

- There is one existing TSX file (single file frontend) generated from an old vague specification 

- Use it as a VISUAL/DESIGN REFERENCE ONLY — extract UI layout, colors, and component styling 

- Discard ALL business logic from the old file — it does not match this specification 

- Migrate the UI into proper Next.js file structure as described in Section 1 

- Delete the original single TSX file after migration is complete 

- Supabase project already exists — reuse it 

- Start a fresh GitHub repo — clean slate 

### **0.4 Switching Between AI Agents** 

This project may be built across multiple AI agents, tools, and sessions (VS Code Claude Code, Antigravity, etc.). When picking up mid-project: 

- Read this entire document first 

- Check which Phase was last completed 

- Continue from the next Phase — do not redo completed work 

- Never contradict the database schema in Section 4 

● Never invent features not listed in this document 

### **0.5 The Most Important Rules** 

- Do NOT treat modules as isolated CRUD pages — this is a connected business system 

- Inventory, Orders, Customer Financials, Expenses, and Payables must stay synchronized 

- Never perform a financial or inventory side effect just because a screen was opened or a PDF was generated 

- Side effects occur ONLY at explicitly defined business events 

- When in doubt about a business rule — check Section 3 before inventing anything 

- Act as a senior developer — apply industry standard best practices for validation, error handling, loading states, empty states, pagination, mobile responsiveness, and security 

- Do NOT add features not listed here — no shopping cart, no payment gateway, no coupon system, no ratings, no reviews, no wishlist, no automated delivery tracking 

##### **0.6 Session Handoff Protocol** 

At the end of every working session, before stopping, the AI agent must update CURRENT_STATUS.md in the project root with the following: 

Last Updated: [date and time] 

Completed Phases: [list] 

Current Phase: [phase name and number] 

Last Thing Done: [specific description] 

Next Task: [exactly what to do next] 

Known Issues: [any bugs or blockers] 

Files Modified This Session: [list of files changed] 

At the start of every new session, the AI agent must: 

1. Read CURRENT_STATUS.md first 

2. Read the Implementation Spec v2 

3. Continue from where the previous agent left off 

4. Update CURRENT_STATUS.md again at the end 

## **1. Project Structure** 

The project is a single Next.js 14 repository deployed on Vercel. There is no separate backend server. 

### **1.1 Folder Structure** 

```
app/
├── (public)/
│   ├── page.tsx                    -- landing page
│   ├── browse/page.tsx             -- browse stock
│   ├── track/page.tsx              -- track order
│   ├── signin/page.tsx             -- customer sign in
│   └── signup/page.tsx             -- customer sign up
│
├── account/
│   └── page.tsx                    -- customer account book (auth
required)
│
├── admin/
│   ├── login/page.tsx              -- admin login
```

```
│   ├── dashboard/page.tsx
```

```
│   ├── inventory/page.tsx
```

```
│   ├── orders/page.tsx
```

```
│   ├── customers/page.tsx
│   ├── customers/[id]/page.tsx     -- customer detail
```

```
│   ├── ledger/page.tsx
```

```
│   ├── payables/page.tsx
│   ├── documents/page.tsx          -- cash memo + color slip
```

```
│   ├── assistant/page.tsx          -- business assistant
│   └── settings/page.tsx
│
├── api/
│   ├── auth/[...route]/route.ts    -- customer auth via Supabase
```

```
│   ├── admin/auth/route.ts         -- admin login/logout
```

```
│   ├── inventory/route.ts
```

```
│   ├── inventory/[id]/route.ts
```

```
│   ├── orders/route.ts
```

```
│   ├── orders/[id]/route.ts
```

```
│   ├── orders/[id]/status/route.ts
```

```
│   ├── customers/route.ts
```

```
│   ├── customers/[id]/route.ts
```

```
│   ├── payments/route.ts
```

```
│   ├── payables/route.ts
```

```
│   ├── payables/[id]/route.ts
```

```
│   ├── expenses/route.ts
```

```
│   ├── color-slips/route.ts
```

```
│   ├── cash-memos/route.ts
```

```
│   ├── settings/route.ts
│   └── assistant/route.ts
│
components/
```

```
├── ui/                             -- shared: Button, Input, Card,
Modal, Table, Badge
├── admin/                          -- admin specific components
```

```
├── public/                         -- customer facing components
└── pdf/                            -- PDF templates using @react-
pdf/renderer
```

```
lib/
├── supabase.ts                     -- Supabase client (browser)
├── supabase-server.ts              -- Supabase client (server)
├── auth.ts                         -- admin JWT helpers
├── utils.ts                        -- shared utilities
└── constants.ts                    -- shared constants (status values
etc)
```

```
types/
└── index.ts                        -- all TypeScript interfaces
```

## **2. Sh Information** **<u>op</u>** 

Shop details are centralized in the database under the shop_settings table. They are used in PDFs and throughout the application. 

|**Shop Name**|New N Islam|
|---|---|
|**Phone**|01711280943|
|**Address**|Islampur, Old Dhaka|



Admin can edit these details from Settings → Shop Details. Changes take effect immediately across the entire application including generated PDFs. 

## **<u>3. Core Business Rules</u>** 

### **3.1 Units and Pricing** 

- All quantities are in Than 

- 1 Than = 30 Goj (calculate internally where needed) 

- Minimum order quantity: 1 Than 

- All selling prices are per Than 

- All buying/purchasing prices are per Than (admin internal) 

- Currency: BDT (Bangladeshi Taka, symbol: ৳ ) 

### **3.2 Request vs Order — Critical Distinction** 

A customer creates a REQUEST. A request becomes an ORDER only after admin confirmation. `Customer creates Request ↓ status: PENDING Admin reviews ↓ status: APPROVED or REJECTED Customer physically contacts shop ↓ Admin confirms ↓ status: CONFIRMED  ← This is when the Order is created ↓ Inventory deducted ↓ Customer financials updated ↓ Financial transaction recorded Admin updates delivery ↓ status: ON_THE_WAY ↓ status: DELIVERED` 

Alternative terminal statuses: REJECTED (from PENDING), EXPIRED (admin manually marks after 30+ days) 

### **3.3 What Triggers Financial and Inventory Side Effects** 

|**Order CONFIRMED**|Inventory deducted + Customer total_purchased increased + Customer<br>due increased + Financial transaction created|
|---|---|
|**Customer Payment**<br>**recorded**|Customer total_paid increased + Customer due decreased + Payment<br>transaction recorded|
|**Restock added**|Inventory qty_than increased + Inventory expense created + Payable<br>created if not fully paid|
|**Payable Payment recorded**|Payable paid_amount increased + Payable due_amount decreased|
|**Cash Memo generated**|NOTHING — cash memo is a document only|
|**Color Slip created**|NOTHING — color slip is a document only|
|**Browse Stock page opened**|NOTHING|
|**Any PDF downloaded**|NOTHING|



### **3.4 Cash Memo Rules** 

- Cash Memo is generated from an existing confirmed order 

- It does NOT create an order 

- It does NOT change inventory 

- It does NOT change customer due 

- It does NOT record a payment 

- It does NOT modify the ledger 

- It is purely a printable/downloadable PDF document 

### **3.5 Inventory Display Rules** 

- Each inventory item has a display toggle — ON or OFF 

- Customers can only see items where display = ON 

- Admin sees ALL inventory regardless of display toggle 

- Buying price, dying cost, supplier info, and purchasing details are NEVER exposed to customers 

### **3.6 Order Source** 

- Every order has an order_source field 

- ONLINE — customer placed request through website 

- OFFLINE — admin created order directly on behalf of a walk-in customer 

- There is no separate module for online vs offline — it is one Orders module with this flag 

## **4. Database** **<u>Schema</u>** 

This schema must be created in Supabase before any code is written. The AI agent must create all tables exactly as defined here. Do not invent additional columns or tables without requirement. 

### **4.1 admins** 

|**Column**|**Type**|**Notes**|
|---|---|---|
|`id`|UUID PK|DEFAULT gen_random_uuid()|
|`admin_id`|TEXT UNIQUE|ADM-001, ADM-002 — auto generated|
|`username`|TEXT UNIQUE|Required — must be unique|
|`phone`|TEXT|Required|
|`password_hash`|TEXT|bcrypt hashed — never plain text|
|`must_change_password`|BOOLEAN|DEFAULT true — force change on first login|
|`created_at`|TIMESTAMPTZ|DEFAULT now()|



### **4.2 customers** 

|**Column**|**Type**|**Notes**|
|---|---|---|
|`id`|UUID PK|DEFAULT gen_random_uuid()|
|`customer_id`|TEXT UNIQUE|CUST-001, CUST-002 — auto generated|
|`name`|TEXT|Required|
|`phone`|TEXT UNIQUE|Required|
|`address`|TEXT|Required|
|`password_hash`|TEXT|bcrypt hashed — Supabase Auth manages this|
|`shop_name`|TEXT|Optional|
|`email`|TEXT|Optional|
|`total_purchased`|NUMERIC|DEFAULT 0 — sum of confirmed order amounts|
|`total_paid`|NUMERIC|DEFAULT 0 — sum of recorded payments|
|`due`|NUMERIC|DEFAULT 0 — total_purchased minus total_paid|
|`status`|TEXT|DEFAULT ALL_CLEAR — ALL_CLEAR or<br>HAS_DUE|
|`created_at`|TIMESTAMPTZ|DEFAULT now()|



### **4.3 inventory** 

|**Column**|**Type**|**Notes**|
|---|---|---|
|`id`|UUID PK|DEFAULT gen_random_uuid()|
|`variant`|TEXT|e.g. Voil, Povline, Polestar, Chapa, Tore|
|`color`|TEXT|e.g. White, Red, Blue|
|`suta_count`|INTEGER|Thread count — 10 to 120|
|`qty_than`|NUMERIC|Current stock in Than|



|`buying_price_per_than`|NUMERIC|Admin only — never expose to customer|
|---|---|---|
|`dying_cost_per_than`|NUMERIC|DEFAULT 0 — admin only|
|`selling_price_per_than`|NUMERIC|Shown to customer|
|`location`|TEXT|Showroom or Warehouse|
|`display`|BOOLEAN|DEFAULT true — controls customer visibility|
|`created_at`|TIMESTAMPTZ|DEFAULT now()|
|||UNIQUE constraint on (variant, suta_count,<br>color)|



### **4.4 inventory_images** 

|**Column**|**Type**|**Notes**|
|---|---|---|
|`id`|UUID PK|DEFAULT gen_random_uuid()|
|`inventory_id`|UUID FK|REFERENCES inventory(id) ON DELETE<br>CASCADE|
|`image_url`|TEXT|Supabase Storage public URL|
|`created_at`|TIMESTAMPTZ|DEFAULT now()|



### **4.5 inventory_restock_logs** 

|**Column**|**Type**|**Notes**|
|---|---|---|
|`id`|UUID PK|DEFAULT gen_random_uuid()|
|`inventory_id`|UUID FK|REFERENCES inventory(id)|
|`qty_added_than`|NUMERIC|Quantity added in Than|
|`buying_price_per_than`|NUMERIC|Price at time of restock|
|`dying_cost_per_than`|NUMERIC|DEFAULT 0|
|`total_cost`|NUMERIC|Calculated: (buying + dying) x qty_than|
|`paid_amount`|NUMERIC|DEFAULT 0|
|`due_amount`|NUMERIC|total_cost minus paid_amount|
|`supplier_name`|TEXT|Optional|
|`note`|TEXT|Optional|
|`created_at`|TIMESTAMPTZ|DEFAULT now()|



### **4.6 orders** 

|**Column**|**Type**|**Notes**|
|---|---|---|
|`id`|UUID PK|DEFAULT gen_random_uuid()|
|`order_id`|TEXT UNIQUE|ORD-2026-001 — auto generated|
|`customer_id`|UUID FK|REFERENCES customers(id)|
|`order_source`|TEXT|ONLINE or OFFLINE|



|`status`|TEXT|PENDING, APPROVED, CONFIRMED,<br>ON_THE_WAY, DELIVERED, REJECTED,<br>EXPIRED|
|---|---|---|
|`total_than`|NUMERIC|Total quantity in Than|
|`total_amount`|NUMERIC|Total bill amount in BDT|
|`note`|TEXT|Optional|
|`confirmed_at`|TIMESTAMPTZ|Set when status changes to CONFIRMED|
|`delivered_at`|TIMESTAMPTZ|Set when status changes to DELIVERED|
|`created_at`|TIMESTAMPTZ|DEFAULT now()|



### **4.7 order_items** 

|**Column**|**Type**|**Notes**|
|---|---|---|
|`id`|UUID PK|DEFAULT gen_random_uuid()|
|`order_id`|UUID FK|REFERENCES orders(id) ON DELETE<br>CASCADE|
|`inventory_id`|UUID FK|REFERENCES inventory(id)|
|`variant`|TEXT|Snapshot at time of order|
|`color`|TEXT|Snapshot at time of order|
|`suta_count`|INTEGER|Snapshot at time of order|
|`qty_than`|NUMERIC|Quantity in Than|
|`rate_per_than`|NUMERIC|Selling price per Than at time of order|
|`total_amount`|NUMERIC|qty_than x rate_per_than|



### **4.8 order_status_history** 

|**Column**|**Type**|**Notes**|
|---|---|---|
|`id`|UUID PK|DEFAULT gen_random_uuid()|
|`order_id`|UUID FK|REFERENCES orders(id) ON DELETE<br>CASCADE|
|`status`|TEXT|The new status|
|`changed_by`|TEXT|admin_id or CUSTOMER or SYSTEM|
|`note`|TEXT|Optional reason for status change|
|`created_at`|TIMESTAMPTZ|DEFAULT now()|



### **4.9 customer_payments** 

|**Column**|**Type**|**Notes**|
|---|---|---|
|`id`|UUID PK|DEFAULT gen_random_uuid()|
|`customer_id`|UUID FK|REFERENCES customers(id)|
|`order_id`|UUID FK|REFERENCES orders(id) — optional, can be<br>general payment|
|`amount`|NUMERIC|Payment amount in BDT|



|`method`|TEXT|CASH, CHEQUE, or BANK|
|---|---|---|
|`note`|TEXT|Optional|
|`recorded_by`|UUID|Admin id who recorded this|
|`created_at`|TIMESTAMPTZ|DEFAULT now()|



### **4.10 payables** 

|**Column**|**Type**|**Notes**|
|---|---|---|
|`id`|UUID PK|DEFAULT gen_random_uuid()|
|`payable_id`|TEXT UNIQUE|PAY-001 — auto generated|
|`description`|TEXT|What this payable is for|
|`party_name`|TEXT|Mill name, factory name etc.|
|`total_amount`|NUMERIC|Total owed|
|`paid_amount`|NUMERIC|DEFAULT 0|
|`due_amount`|NUMERIC|total_amount minus paid_amount|
|`status`|TEXT|UNPAID, PARTIAL, or PAID|
|`inventory_id`|UUID FK|REFERENCES inventory(id) — optional link|
|`restock_log_id`|UUID FK|REFERENCES inventory_restock_logs(id) —<br>optional|
|`created_at`|TIMESTAMPTZ|DEFAULT now()|



### **4.11 payable_payments** 

|**Column**|**Type**|**Notes**|
|---|---|---|
|`id`|UUID PK|DEFAULT gen_random_uuid()|
|`payable_id`|UUID FK|REFERENCES payables(id)|
|`amount`|NUMERIC|Amount paid|
|`method`|TEXT|CASH, CHEQUE, or BANK|
|`note`|TEXT|Optional|
|`recorded_by`|UUID|Admin id|
|`created_at`|TIMESTAMPTZ|DEFAULT now()|



### **4.12 expenses** 

|**Column**|**Type**|**Notes**|
|---|---|---|
|`id`|UUID PK|DEFAULT gen_random_uuid()|
|`category`|TEXT|RENT, SALARY, UTILITY, INVENTORY,<br>OTHER|
|`description`|TEXT|Required|
|`amount`|NUMERIC|Required|
|`date`|DATE|Required|



|`inventory_id`|UUID FK|REFERENCES inventory(id) — if inventory<br>related|
|---|---|---|
|`note`|TEXT|Optional|
|`created_at`|TIMESTAMPTZ|DEFAULT now()|



### **4.13 color_slips** 

|**Column**|**Type**|**Notes**|
|---|---|---|
|`id`|UUID PK|DEFAULT gen_random_uuid()|
|`slip_id`|TEXT UNIQUE|SLIP-001 — auto generated|
|`inventory_id`|UUID FK|REFERENCES inventory(id) — optional|
|`variant`|TEXT|Required|
|`total_qty_than`|NUMERIC|Total quantity in Than|
|`colors`|TEXT|Comma separated: Red, Blue, White|
|`ratio`|TEXT|e.g. 2:1:1|
|`note`|TEXT|Optional|
|`created_at`|TIMESTAMPTZ|DEFAULT now()|



### **4.14 cash_memos** 

|**Column**|**Type**|**Notes**|
|---|---|---|
|`id`|UUID PK|DEFAULT gen_random_uuid()|
|`memo_id`|TEXT UNIQUE|MEMO-001 — auto generated|
|`order_id`|UUID FK|REFERENCES orders(id)|
|`customer_id`|UUID FK|REFERENCES customers(id)|
|`customer_name`|TEXT|Snapshot of customer name|
|`total_amount`|NUMERIC|From order|
|`paid_amount`|NUMERIC|Amount shown as paid on memo — display only|
|`due_amount`|NUMERIC|Display only — does not affect customer ledger|
|`generated_by`|UUID|Admin id|
|`created_at`|TIMESTAMPTZ|DEFAULT now()|



### **4.15 shop_settings** 

|**Column**|**Type**|**Notes**|
|---|---|---|
|`id`|UUID PK|DEFAULT gen_random_uuid()|
|`shop_name`|TEXT|DEFAULT New N Islam|
|`phone`|TEXT|DEFAULT 01711280943|
|`address`|TEXT|DEFAULT Islampur, Old Dhaka|
|`updated_at`|TIMESTAMPTZ|DEFAULT now()|
|||Only one row exists in this table — always upsert|



### **4.16 landing_images** 

|**Column**|**Type**|**Notes**|
|---|---|---|
|`id`|UUID PK|DEFAULT gen_random_uuid()|
|`image_url`|TEXT|Supabase Storage public URL|
|`display_order`|INTEGER|DEFAULT 0 — for ordering images|
|`created_at`|TIMESTAMPTZ|DEFAULT now()|



## **<u>5. Authentication</u>** 

### **5.1 Customer Authentication** 

Use Supabase Auth for all customer authentication. Supabase handles signup, login, session management, and password hashing. 

- Customer signs up with: name, phone, address, password (shop_name and email optional) 

- On signup: system auto-generates CUST-001 style ID and creates customer record in customers table with financials initialized to zero 

- Customer logs in with phone number and password 

- Session stored in Supabase session cookie 

- Protected customer routes check for valid Supabase session 

### **5.2 Admin Authentication** 

Admin authentication is completely separate from customer auth. Do NOT use Supabase Auth for admins. 

- Admins are stored in the admins table in the database 

- Admin logs in at /admin/login with username and password 

- Password verified against bcrypt hash in database 

- On successful login: issue a JWT token stored in an HTTP-only cookie 

- JWT payload contains: admin_id, username, role: admin 

- JWT expires after 8 hours 

- All /admin/ pages and /api/admin/ routes verify this JWT cookie 

- Initial admin: username = boss, password = 1234, must_change_password = true 

- On first login: redirect to change password page before accessing dashboard 

- No public admin registration — only existing admin can create new admin from Settings 

### **5.3 Authorization Rules** 

|**Public routes**|No auth required: /, /browse, /track, /signin, /signup|
|---|---|
|**Customer protected**|Require Supabase session: /account, placing requests|
|**Admin protected**|Require admin JWT cookie: all /admin/* pages|
|**API public**|No auth: GET /api/inventory (display=ON only), GET /api/orders/track|
|**API customer**|Require Supabase session: POST /api/orders (requests)|
|**API admin**|Require admin JWT: all /api/admin/* and write operations|



## **<u>6. Public / Customer Features</u>** 

### **6.1 Landing Page (/)** 

- Promotional headline and shop introduction text 

- Navigation bar: Home, Browse Stock, Track Order, Sign In / Sign Up 

- Admin login link discreetly in footer: /admin/login 

- Track Order input field — customer enters Order ID to check status publicly 

- Product/promotional images — logic: 

   - If admin has uploaded landing images → show those images (randomly selected from collection) 

   - If no landing images uploaded → show random images from inventory items where display = ON and image exists 

- Basic shop info: name, phone, address 

- This is NOT a dashboard — no stats, no charts, no financial data 

### **6.2 Browse Stock (/browse)** 

- No login required 

- Shows only inventory items where display = ON 

- Each item shows: variant, color, quantity (Than), selling price per Than 

- Search by variant and color 

- Color filter: All Colors or specific color 

- Clicking item opens detail view showing: variant, color, quantity, selling price per Than, suta count, images if available 

- Buying price, dying cost, location, and supplier info are NEVER shown to customer 

- Book Now button — redirects to signin if not logged in, otherwise opens request form 

### **6.3 Customer Request (/browse → request form)** 

- Login required — redirect to signin if not authenticated 

- Customer selects inventory item, enters quantity in Than (minimum 1) 

- System shows estimated total: qty_than x selling_price_per_than 

- On submit: order created with status = PENDING, order_source = ONLINE 

- System generates Order ID: ORD-2026-001 format 

- Customer sees confirmation with their Order ID 

- Inventory is NOT deducted at this point 

- Customer financials are NOT updated at this point 

### **6.4 Track Order (/track)** 

- No login required — only Order ID needed 

- Customer enters order ID and sees: current status, order items, timestamps of each status change 

- Does not show financial information 

### **6.5 Customer Account Book (/account)** 

- Login required 

- Shows: total purchased, total paid, remaining due, status (ALL_CLEAR or HAS_DUE) 

- ● Shows list of all their orders with status 

- Shows payment history 

- Read only — customer cannot edit anything here 

## **<u>7. Admin Features</u>** 

### **7.1 Dashboard (/admin/dashboard)** 

Build dashboard LAST — after all other modules are working. It displays real data from existing modules. 

- Total stock (sum of all qty_than across all inventory) 

- Total customer receivables (sum of all customer due amounts) 

- Total payables due (sum of all payable due_amounts) 

- Recent orders (last 10) 

- Pending requests count 

- Recent payments received 

### **7.2 Inventory (/admin/inventory)** 

Admin can: 

- View all inventory — all items regardless of display toggle 

- Add new inventory item: variant, color, suta count, qty_than, buying_price_per_than, dying_cost_per_than, selling_price_per_than, location, display toggle 

- Restock existing item: add qty_than, enter buying price, dying cost, supplier name, paid amount — system calculates total cost and due, creates restock log, creates payable if not fully paid 

- ● Edit inventory item details 

- Delete inventory item 

- Toggle display ON/OFF per item 

- Upload images per item (stored in Supabase Storage bucket: inventory-images) 

- Search by variant, color, location 

- Variant field is free text — admin types any variant name, not limited to a fixed list 

- On restock: if buying_price_per_than or dying_cost_per_than changes from existing, update the inventory record 

### **7.3 Orders (/admin/orders)** 

- View all orders — filter by status, order_source, date 

- View order detail: customer info, items, status history timeline 

- Change order status manually: PENDING → APPROVED → CONFIRMED → ON_THE_WAY → DELIVERED 

- CONFIRMED is the critical step — triggers: inventory deduction, customer financial update, transaction creation 

- Before confirming: check if sufficient stock exists for all order items — if not, show error and do not confirm 

- Admin can also REJECT (from PENDING) or mark EXPIRED (from APPROVED after 30+ days) 

- Create offline order: admin selects or creates customer, selects inventory items, enters quantities — order created with order_source = OFFLINE and status = CONFIRMED immediately 

- Offline order creation immediately triggers all side effects: inventory deduction, customer financial update 

### **7.4 Customers (/admin/customers)** 

- View all customers 

- Search by name, phone, customer ID 

- Open customer detail: personal info, financial standing, order history, payment history 

- Record payment for customer: amount, method (CASH/CHEQUE/BANK), optional note, optional link to specific order 

- On payment recorded: customer total_paid increases, customer due decreases, status updates, payment transaction saved 

### **7.5 Ledger (/admin/ledger)** 

- View all expenses: filter by category, date range 

- Add expense manually: category, description, amount, date 

- Expenses categories: RENT, SALARY, UTILITY, INVENTORY, OTHER 

- Inventory expenses are auto-created on restock — admin should also be able to add manually 

- Summary: total expenses by category, total expenses for period 

### **7.6 Payables (/admin/payables)** 

- View all payables: filter by status (UNPAID, PARTIAL, PAID) 

- Payables are auto-created when a restock is not fully paid 

- Admin can also create payables manually for other dues 

- Record payable payment: amount, method, note 

- On payment: payable paid_amount increases, due_amount decreases, status updates 

### **7.7 Documents (/admin/documents)** 

Two document types. Both are PDF only. Neither affects any business records. 

#### **Cash Memo** 

- Admin selects an existing confirmed order 

- Admin enters paid amount and due amount for display on memo (these are display values only — do NOT update customer ledger) 

- System generates PDF and saves memo record to cash_memos table 

- PDF format: see Section 8 

#### **Color Slip** 

- Admin fills in: variant, total qty in Than, colors (comma separated), ratio (e.g. 2:1:1), optional note 

- Can optionally link to an inventory item 

- System saves color slip record and generates downloadable PDF 

- PDF format: see Section 8 

### **7.8 Business Assistant (/admin/assistant)** 

- Simple statistical analysis — no AI, no LLM, pure math based on existing data 

- 

#### **Top 5 Products to Restock** 

- Based on: order frequency (how many times ordered in last 90 days) and rate of stock depletion 

- Formula: score = (orders_count_last_90_days x 0.7) + (depletion_rate x 0.3) 

- Show top 5 inventory items by score with current stock level 

- 

#### **Slow Moving Stock — Discount Recommendations** 

- Items where qty_than > 0 and no order has included this item in the last 60 days 

- Show list of these items with days since last sale 

- Suggest discount: if 60-90 days → suggest 5-10% discount, if 90+ days → suggest 15-20% discount 

- This is a suggestion only — admin decides, no automatic price change 

### **7.9 Settings (/admin/settings)** 

#### **Shop Details** 

- Edit shop name, phone, address 

- Changes saved to shop_settings table 

#### **Landing Page Images** 

- Upload multiple images to Supabase Storage bucket: landing-images 

- View uploaded images 

- Delete images 

- These images appear on the customer landing page 

#### **Admin Accounts** 

- View all admin accounts 

- Create new admin: username, phone, password — system generates ADM-XXX ID 

- No public admin registration — only from here 

## **<u>8. PDF Format</u>** 

All PDFs use @react-pdf/renderer. Generated client-side and downloaded directly from browser. No server-side PDF generation. 

All PDFs follow this simple format: 

```
[Shop Name]
[Phone Number]
[Address]
[Date]
```

```
─────────────────────────────────────────────
```

```
[Content specific to document type]
```

Plain white background. Clean readable font. No logos, no watermarks, no complex layout. 

### **8.1 Cash Memo PDF** 

`[Shop Name] [Phone] | [Address] Date: [date]          Memo No: [MEMO-001] ───────────────────────────────────────────── Customer: [name]      Customer ID: [CUST-001] Order ID: [ORD-2026-001] SL   Item           Color    Than   Rate/Than    Total 1    [variant]      [color]  [X]` ৳ `[X]` ৳ `[X] 2    ... Grand Total:` ৳ `[X] Paid:` ৳ `[X] Due:` ৳ `[X] Customer Signature: ___________  Authorized: ___________` 

### **8.2 Color Slip PDF** 

```
[Shop Name]
[Phone] | [Address]
Date: [date]          Slip No: [SLIP-001]
─────────────────────────────────────────────
Variant: [variant]
Total Quantity: [X] Than ([X*30] Goj)
Colors and Ratio:
  [Color 1]  :  [ratio part]
  [Color 2]  :  [ratio part]
  [Color 3]  :  [ratio part]
Note: [note if any]
```

## **<u>9. Ima Stora ge ge</u>** 

All images stored in Supabase Storage. Two separate buckets: 

|**inventory-images**|Product images for inventory items. Linked via inventory_images table.<br>Multiple images per item allowed.|
|---|---|
|**landing-images**|Admin uploaded promotional images for customer landing page.<br>Managed from Settings → Landing Page Images.|



- All buckets are public — images accessible via public URL 

- Database stores only the image URL string — not the file 

- Upload, view, delete are the only required operations 

- No image editing or resizing required 

## **10. Implementation Phases** 

Build in this exact order. Do not skip phases. Do not build Phase N+1 before Phase N is tested and working. 

### **Phase 0 — Project Setup** 

- Create new Next.js 14 project with TypeScript and Tailwind CSS 

- Connect to existing Supabase project 

- Create all database tables from Section 4 schema 

- Set up Supabase Storage buckets: inventory-images and landing-images 

- Seed initial admin: username=boss, password=1234, must_change_password=true 

- Seed shop_settings with default values 

- Set up folder structure from Section 1 

- Set up TypeScript types in types/index.ts 

- Read the existing single TSX file for UI/design reference — extract color scheme, component styling, layout patterns 

- Do NOT copy any business logic from the old file 

### **Phase 1 — Authentication** 

- Customer signup and login using Supabase Auth 

- Customer profile creation in customers table on signup 

- Admin login at /admin/login with JWT cookie 

- Must change password flow for first login 

- Route protection for customer and admin pages 

- Admin can create additional admin accounts from Settings 

### **Phase 2 — Inventory** 

- Admin inventory CRUD 

- Display toggle 

- Image upload to Supabase Storage 

- Restock with expense and payable creation 

- Public browse stock page — display=ON items only 

- Search and filter 

### **Phase 3 — Customers** 

- Customer list and search 

- Customer detail page 

- Customer financial summary 

- Payment recording with financial side effects 

### **Phase 4 — Orders** 

- Customer request flow (ONLINE) 

- Admin request management (approve/reject) 

- Order confirmation with all side effects 

- Stock check before confirmation 

- Offline order creation by admin 

- Status history timeline 

- Public track order page 

### **Phase 5 — Ledger and Payables** 

- Expense management 

- Payables list and payment recording 

- Ledger summary 

### **Phase 6 — Documents** 

- Cash Memo generation and PDF download 

- Color Slip generation and PDF download 

### **Phase 7 — Business Assistant** 

- Top 5 restock recommendations 

- Slow moving stock detection and discount suggestions 

### **Phase 8 — Dashboard** 

- Build last — after all modules exist 

- Real data from existing modules — no separate dashboard logic 

### **Phase 9 — Final Testing** 

- Run all end-to-end test scenarios from Section 11 

- Fix any cross-module synchronization issues 

- Mobile responsiveness check 

- Deploy to Vercel 

## **11. End-to-End Test Scenarios** 

Before considering any phase complete, verify these scenarios work correctly. 

### **Test 1 — New Customer Signup** 

- Customer signs up → customer record created in DB → CUST-XXX generated → total_purchased=0, total_paid=0, due=0 → customer appears in admin list 

### **Test 2 — Online Request** 

- Logged-in customer requests item → order created with status=PENDING → inventory unchanged → customer financials unchanged → customer sees Order ID 

### **Test 3 — Admin Approves Request** 

- Admin approves → status=APPROVED → inventory unchanged → customer financials unchanged 

### **Test 4 — Order Confirmation (Critical)** 

- Admin confirms → stock checked → if sufficient: inventory deducted, customer total_purchased increased, customer due increased, status history entry created, confirmed_at set 

### **Test 5 — Insufficient Stock** 

- Admin tries to confirm → stock insufficient → error shown → order stays APPROVED → no inventory change → no financial change 

### **Test 6 — Offline Order** 

- Admin creates offline order → customer selected or created → order created with order_source=OFFLINE and status=CONFIRMED immediately → all side effects triggered 

### **Test 7 — Customer Payment** 

- Admin records ৳ 10,000 payment for customer with due= ৳ 30,000 → customer total_paid increases by 10,000 → due becomes ৳ 20,000 → payment record saved → status updates if due=0 

### **Test 8 — Restock** 

- Admin restocks 10 Than at ৳ 500 buying + ৳ 50 dying, paid ৳ 4,000 → total_cost=5,500 → due=1,500 → inventory qty_than increases → restock log created → payable created for 1,500 → expense recorded 

### **Test 9 — Cash Memo** 

- Admin generates cash memo for confirmed order → PDF downloaded → inventory unchanged → customer ledger unchanged → memo record saved in cash_memos table 

### **Test 10 — Order Timeline** 

- PENDING → APPROVED → CONFIRMED → ON_THE_WAY → DELIVERED → each transition has timestamp in order_status_history 

### **Test 11 — Rejected Request** 

- Admin rejects PENDING order → status=REJECTED → no order created → no inventory change → no financial change 

### **Test 12 — Track Order Public** 

- Anyone enters Order ID on /track without login → sees current status and status history timeline → no financial info shown 

## **12. Senior Devel r Standards** **<u>ope</u>** 

The AI agent must apply these standards throughout the entire project without being asked for each individually. 

### **12.1 Input Validation** 

- Validate all form inputs on both client and server 

- Show clear error messages — not just red borders 

- Prevent duplicate submissions with loading states 

- Validate minimum quantity of 1 Than on all order/request forms 

### **12.2 Error Handling** 

- Every API route has try/catch with meaningful error messages 

- Show user-friendly error messages — never expose raw database errors to UI 

- Handle network errors gracefully — show retry option where appropriate 

### **12.3 UI States** 

- Every data fetch shows a loading state 

- Every empty list shows a meaningful empty state message 

- Every form submission shows a loading/processing state 

- Success and error feedback after every action 

### **12.4 Security** 

- Never expose buying price, dying cost, or internal financial data to customer-facing APIs 

- All admin routes verify JWT on every request — not just on page load 

- Rate limit auth endpoints to prevent brute force 

- Sanitize all user inputs before database operations 

- HTTP-only cookies for admin JWT — not localStorage 

### **12.5 Mobile Responsiveness** 

- All pages must work on mobile (375px minimum width) 

- Admin panel should be usable on tablet 

- Customer portal is mobile-first — shop owner's customers use phones 

### **12.6 Data Consistency** 

- Use database transactions for operations that touch multiple tables simultaneously 

- For example: order confirmation touches orders, order_items, inventory, customers, and order_status_history — all in one atomic transaction 

- If any part fails the entire operation rolls back 

_— End of Specification —_ 

