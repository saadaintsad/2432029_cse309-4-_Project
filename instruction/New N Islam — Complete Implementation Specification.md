# **New N Islam — Complete Implementation Specification**

## **0\. Project Purpose**

Build a simple multi-party shop management web application for **New N Islam**, a physical textile/fabric shop.

The application has two sides:

1. **Public / Customer side**  
2. **Admin side**

The system is **not a normal ecommerce checkout system**.

Customers use the website to:

* browse available stock,  
* request/pre-book items,  
* see their own financial standing,  
* track an order using an Order ID.

The actual purchase/confirmation happens physically through the shop.

The Admin uses the system to:

* manage inventory,  
* process customer requests/orders,  
* manage customers,  
* manage customer receivables,  
* manage shop expenses/payables,  
* generate PDFs,  
* receive statistical stocking suggestions.

---

# **1\. Core Design Principles**

The implementation must follow these principles:

### **1.1 Keep one Order module**

Do **not** create separate Online Order and Offline Order modules.

There is only:

> **Orders**

Every order has an `order_source`:

* `ONLINE`  
* `OFFLINE`

---

### **1.2 Customer Request is not an Order**

This distinction is critical.

A customer initially creates a **request**.

Request  
  ↓  
Pending  
  ↓  
Approved  
  ↓  
Customer physically contacts/visits shop  
  ↓  
Confirmed  
  ↓  
Actual Order

Only when the order is **confirmed** does the actual transaction occur.

---

### **1.3 Cash Memo does not affect business records**

Creating a Cash Memo:

* does NOT create an Order  
* does NOT change inventory  
* does NOT change customer due  
* does NOT record a payment  
* does NOT modify the ledger

It is only a PDF/document generated from an existing order when needed.

---

### **1.4 All physical-world order status changes are manual**

The system does not assume that it knows when something was physically confirmed, dispatched, or delivered.

Admin manually changes:

Pending  
Approved  
Confirmed  
On the Way  
Delivered

Alternative terminal statuses:

Rejected  
Expired  
---

### **1.5 Financial records must be traceable**

Whenever money changes, the system should create a corresponding transaction/history record rather than simply overwriting a number.

---

# **2\. Shop Information**

Shop details are centralized in Settings.

### **Current/default shop information**

Shop Name: New N Islam  
Phone: 01711280943  
Address: Islampur, Old Dhaka

Fields:

| Field | Required | Editable |
| ----- | ----- | ----- |
| Shop Name | Yes | Yes |
| Phone Number | Yes | Yes |
| Address | Yes | Yes |

These details are used by generated PDFs.

---

# **3\. User Types**

There are two user types.

## **3.1 Customer**

Customers can:

* browse stock without authentication,  
* request products after authentication,  
* view their own financial standing after authentication,  
* track orders publicly using Order ID.

---

## **3.2 Admin**

Admins can access the Admin module.

Admins can:

* manage inventory,  
* manage orders,  
* manage customers,  
* manage customer ledger,  
* manage business ledger,  
* generate documents,  
* use Business Assistant,  
* manage settings,  
* create additional admin accounts.

There is no public Admin registration.

---

# **4\. Admin Authentication**

## **Initial Admin**

The initial administrator is:

Admin ID: ADM-001  
Username: boss  
Phone: 01711280943  
Initial Password: 1234

The password must **never be stored as plaintext**.

It must be securely hashed.

The initial account should preferably force a password change after first login.

---

## **Additional Admins**

Multiple Admin accounts are supported.

An authenticated Admin can create another Admin from:

Settings  
   ↓  
Admin Accounts  
   ↓  
Create Admin

Fields:

* Username  
* Phone Number  
* Password

System automatically generates:

ADM-001  
ADM-002  
ADM-003  
...

Username must be unique.

There is currently **no role/permission hierarchy**.

All active Admin accounts have the same permissions.

---

# **5\. Customer Account**

## **Customer fields**

### **Required**

* Customer ID  
* Name  
* Phone Number  
* Address  
* Password

### **Optional**

* Shop/Business Name  
* Email

### **System-generated**

* Account creation date

Customer ID is automatically generated.

Example:

CUST-001  
CUST-002  
CUST-003  
---

## **New Customer Financial Initialization**

When a customer signs up:

Total Purchased \= 0  
Paid \= 0  
Due \= 0  
Status \= ALL\_CLEAR

The customer automatically appears in the Admin customer list.

---

# **6\. Public Application Structure**

When someone visits the website, they land on the **general landing page**.

It must not be a dashboard.

## **Landing page should contain**

* Promotional writing  
* Shop introduction  
* Randomly selected product/item images  
* Navigation  
* Track Order area  
* Basic shop information

---

## **Public navigation**

Recommended:

Home  
Browse Stock  
Request Product  
Account Book  
Track Order  
Sign In / Sign Up

Admin login can be available separately through:

/admin/login

It may optionally be linked discreetly from the footer.

---

# **7\. Customer Authentication Rules**

## **Browse Stock**

No login required.

## **Request Product**

Login required.

If unauthenticated:

Please sign in to request products.

Then redirect to login.

## **Account Book**

Login required.

If unauthenticated:

Please sign in to view your financial standing.

Then redirect to login.

## **Track Order**

No login required.

Only Order ID is required.

---

# **8\. Customer Feature: Browse Stock**

Only inventory items with:

display \= ON

are visible.

Customers must not see hidden inventory.

---

## **Product listing**

Each visible inventory item shows:

* Product Variant  
* Color  
* Quantity  
* Selling Price / Than

---

## **Search**

Customer can search by:

* Product Variant  
* Color

Color filter supports:

All Colors  
Specific Color

Examples:

Variant: Voil  
Color: All

or:

Variant: Voil  
Color: Blue  
---

## **Product details**

When customer opens an inventory item:

* Product Variant  
* Color  
* Quantity  
* Selling Price / Than  
* Suta Count  
* Images, if available

Buying price, dying cost, supplier information and internal financial information must **not** be exposed to customers.

---

# **9\. Inventory**

Inventory is an Admin feature.

Admin can:

* add inventory,  
* restock inventory,  
* view inventory,  
* search inventory,  
* open inventory details,  
* manually update inventory,  
* delete inventory,  
* toggle display ON/OFF.

---

# **10\. Inventory Identity**

The three primary identifying fields are:

Product Variant  
Suta Count  
Color

Together they identify one inventory item.

Conceptually:

Product Variant \+ Suta Count \+ Color

must be unique.

Example:

Voil \+ 80 \+ Blue

is one inventory item.

---

## **Important rule**

If Admin adds inventory and the same combination already exists:

Product Variant  
\+  
Suta Count  
\+  
Color

then:

> **Do not create another inventory item.**

Instead, increase the existing item's quantity.

---

## **Primary keys cannot be edited**

When viewing an existing inventory item, Admin may manually update other information.

But:

* Product Variant  
* Suta Count  
* Color

cannot be changed on an existing inventory record.

If the combination is different, it is a new inventory item.

---

# **11\. Inventory Fields**

Each inventory item contains:

| Field | Type |
| ----- | ----- |
| Inventory ID | Auto |
| Product Variant | Dropdown \+ custom text |
| Suta Count | Text/numeric |
| Color | Dropdown \+ custom text |
| Updating Date | Auto |
| Quantity | Numeric |
| Buying Price / Than | Numeric |
| Brought From | Text |
| Dying Cost / Than | Numeric |
| Dyed From | Text |
| Photo 1 | Optional PNG |
| Photo 2 | Optional PNG |
| Selling Price / Than | Numeric |
| Display | ON/OFF |

Additionally, because inventory purchasing creates payable information:

* Paid  
* Due

must be captured for each inventory restocking transaction.

---

# **12\. Inventory Cost**

For each inventory addition/restock:

Buying Cost / Than  
\+  
Dying Cost / Than  
\=  
Own Cost / Than

For example:

Buying \= ৳500 / Than  
Dying \= ৳50 / Than

Own Cost \= ৳550 / Than

The selling price is separate.

Selling Price / Than

is the price customers see.

---

# **13\. Inventory Restocking and Expenses**

When Admin adds inventory, an expense must automatically be created.

This is important:

> Inventory acquisition is a business expense/payable.

Automatic expense types:

Product Variant : Buying  
Product Variant : Dying

Example:

Voil : Buying  
Voil : Dying  
---

## **Automatic expense date**

The expense date comes from the inventory updating information.

The expense's addition date is automatically generated by the system.

---

## **Automatic expense amount**

For an inventory addition:

Buying Expense  
\=  
Quantity Added × Buying Price / Than

and:

Dying Expense  
\=  
Quantity Added × Dying Cost / Than

Total own cost of the newly acquired stock:

Quantity Added ×  
(Buying Price / Than \+ Dying Cost / Than)  
---

# **14\. Inventory Payment and Due**

Admin provides:

Paid

for the inventory acquisition.

System calculates:

Due \= Total Inventory Cost \- Paid

Example:

10 Than  
Buying \= ৳500  
Dying \= ৳50

Total \= 10 × 550  
     \= ৳5,500

Paid \= ৳4,000

Due \= ৳1,500

The Due means:

> Money the shop still owes to the supplier/provider.

This is different from **customer Due**, which means money customers owe the shop.

---

# **15\. Important Inventory Accounting Rule**

Because the same inventory item can be restocked multiple times at different costs, every restocking event should be preserved as its own transaction/expense record.

Do not destroy historical cost information by simply overwriting old financial records.

The inventory item itself can maintain its current/latest operational information, while the Ledger keeps the historical financial transactions.

---

# **16\. Inventory Display**

Every inventory item has:

Display: ON / OFF

### **ON**

Customer can see it.

### **OFF**

Customer cannot see it.

Admin can still see it.

Display OFF does not change quantity or financial records.

---

# **17\. Inventory Search for Admin**

Inventory itself is not a separate search feature.

Admin's Inventory page has search.

Admin can search by:

* Product Variant  
* Color

Color supports:

* All  
* Specific color

Admin can see the complete inventory regardless of display status.

---

# **18\. Orders — Single Module**

There is only one Order module.

It contains:

1. Create Order  
2. Order requests  
3. Past orders  
4. Order details  
5. Cash Memo generation

Every actual order has:

order\_source

with:

ONLINE  
OFFLINE  
---

# **19\. Online Request Workflow**

Customer:

Browse Stock  
   ↓  
Select one/multiple items  
   ↓  
Request Product  
   ↓  
Submit request

The initial status is:

PENDING

Admin sees the request.

Admin can:

Approve  
Reject  
---

# **20\. Request vs Order**

A request is not a confirmed transaction.

### **Pending**

No inventory deduction.

No customer due.

No financial transaction.

### **Approved**

Still no inventory deduction.

Still no customer due.

Still no actual order transaction.

The customer is informed:

> Please contact 01711280943 or visit the shop to confirm your order within 30 days.

---

# **21\. Confirming an Online Order**

When the customer physically confirms the purchase and Admin processes it:

### **First check stock again**

This is essential because the stock may have changed after the original request.

The system must verify that every requested item still has sufficient quantity.

---

## **If stock is insufficient**

Do not create the actual order.

Do not deduct stock.

Show the unavailable/insufficient item(s).

---

## **If stock is available**

Create the actual Order.

Then:

1. Save order.  
2. Save order items.  
3. Preserve each item's selling price at confirmation time.  
4. Deduct inventory quantity.  
5. Update stock.  
6. Update customer financial standing.  
7. Add purchase amount to Total Purchased.  
8. Record the appropriate customer financial transaction.  
9. Update customer Due/Paid according to the confirmed transaction.  
10. Mark request/order as `CONFIRMED`.

These operations should be executed transactionally so that a partial update cannot occur.

---

# **22\. Offline Order Workflow**

Admin can create an order manually from the same Order module.

Admin enters:

* Customer  
* Items  
* Quantities  
* Prices  
* Payment information as required

Set:

order\_source \= OFFLINE  
---

## **Offline order for existing customer**

Admin selects the existing customer.

---

## **Offline order for new customer**

If the customer does not exist:

Create Customer  
   ↓  
Customer ID generated immediately  
   ↓  
Use customer in order

The customer is therefore available in the Customer list immediately.

Their financial standing initially starts from zero and is then updated by the new confirmed order.

---

# **23\. Order Pricing**

When an order is confirmed, the selling price at that moment must be stored in the Order Item.

Do not rely only on the current Inventory Selling Price later.

Example:

Inventory selling price today \= ৳800

Order confirmed \= ৳800

Later inventory price \= ৳850

The old order must still show:

৳800  
---

# **24\. Order Status System**

The normal order timeline is:

PENDING  
   ↓  
APPROVED  
   ↓  
CONFIRMED  
   ↓  
ON\_THE\_WAY  
   ↓  
DELIVERED

Alternative terminal states:

REJECTED  
EXPIRED  
---

# **25\. Status Meanings**

## **Pending**

Customer has submitted a request.

Admin has not approved/rejected it.

---

## **Approved**

Admin accepted the request.

Customer must contact:

01711280943

or visit the shop to confirm within 30 days.

---

## **Confirmed**

The actual order has been confirmed.

At this point the actual transaction occurs:

* Inventory deducted  
* Stock updated  
* Customer financial standing updated  
* Order created/confirmed  
* Ledger-related records updated

---

## **On the Way**

Admin has sent/dispatched the items.

---

## **Delivered**

Customer has received the items.

Admin manually marks this status.

---

## **Rejected**

Admin rejected the original request.

No actual order transaction is created.

---

## **Expired**

An approved request was not confirmed within the allowed period.

The system may display that the approval period has passed, but **status changes are manually controlled by Admin**.

---

# **26\. Order Status Timeline**

Customers should see an ecommerce-style timeline.

Example:

✓ Request Submitted  
 19 Aug, 10:30 AM

✓ Approved  
 20 Aug, 2:15 PM

✓ Confirmed  
 22 Aug, 11:00 AM

● On the Way  
 23 Aug, 4:30 PM

○ Delivered  
 Not delivered yet

When completed:

✓ Request Submitted  
 19 Aug

✓ Approved  
 20 Aug

✓ Confirmed  
 22 Aug

✓ On the Way  
 23 Aug

✓ Delivered  
 25 Aug

Rejected:

✓ Request Submitted  
 19 Aug

✕ Rejected  
 20 Aug

Expired:

✓ Request Submitted  
 19 Aug

✓ Approved  
 20 Aug

✕ Expired  
 20 Sep  
---

# **27\. Order Event History**

Every status change should be preserved.

At minimum:

* Request made date/time  
* Approved date/time  
* Rejected date/time  
* Confirmed date/time  
* On the Way date/time  
* Delivered date/time  
* Expired date/time

Only the events that actually occurred should have timestamps.

This should be stored as an order status/event history rather than relying only on a set of nullable fields.

---

# **28\. Track Order**

Public feature.

No login required.

Customer enters:

Order ID

The system returns the order's public tracking information.

It should show:

* Order ID  
* Current status  
* Timeline  
* Relevant order information  
* Relevant dates  
* Approved message when applicable

Do not expose private customer financial information through Order ID.

---

# **29\. Customer Financial Standing**

Customer-facing feature:

> **Account Book / Financial Standing**

Authentication required.

Each customer can only see their own information.

---

# **30\. Customer Financial Summary**

Show:

Total Purchased  
Paid  
Due  
Status

Example:

Total Purchased: ৳100,000  
Paid:            ৳70,000  
Due:             ৳30,000  
Status:          Due  
---

# **31\. Meaning of Total Purchased**

This is:

> Total value of goods purchased by the customer.

It does not mean current due.

For example:

Purchase 1 \= ৳50,000  
Purchase 2 \= ৳30,000

Total Purchased \= ৳80,000

Even if the customer has already paid everything:

Total Purchased \= ৳80,000  
Paid \= ৳80,000  
Due \= ৳0  
Status \= All Clear  
---

# **32\. Customer Due**

Customer Due means:

> Money the customer currently owes the shop.

When a new order is confirmed:

New Purchase Amount

is added to the customer's accumulated financial relationship.

Example:

Previous:

Total Purchased \= ৳50,000  
Paid \= ৳30,000  
Due \= ৳20,000

New order:

৳10,000

Then:

Total Purchased \= ৳60,000  
Due \= ৳30,000

The exact Paid/Due effect depends on payment made for the new order.

---

# **33\. Customer Transaction History**

Display:

| Date | Due Before | Paid | Due After |
| ----- | ----- | ----- | ----- |
| Date 1 | ৳50,000 | ৳20,000 | ৳30,000 |
| Date 2 | ৳30,000 | ৳10,000 | ৳20,000 |

This history should be generated from financial transactions.

---

# **34\. Record Payment**

Admin can open a customer and choose:

> **Record Payment**

Admin enters:

Payment Amount

On confirmation:

1. Create payment transaction.  
2. Reduce customer's Due.  
3. Increase customer's Paid.  
4. Preserve previous transaction history.  
5. Recalculate current status.

Example:

Due before \= ৳30,000  
Payment \= ৳10,000  
Due after \= ৳20,000

If Due reaches zero:

Status \= ALL\_CLEAR

Otherwise:

Status \= DUE  
---

# **35\. Customer Management and Ledger**

To simplify the application, **Customer Management and Customer Ledger are conceptually merged**.

Admin's Customer section shows a list of customers.

For each customer:

Customer  
├── Basic Information  
├── Total Purchased  
├── Paid  
├── Due  
├── Status  
└── Financial Transaction History

Admin can also:

* Create customer  
* View customer  
* Edit customer information  
* Record payment

---

# **36\. Business Ledger Book**

The Ledger Book is for the shop's own finances.

It is separate from the customer's receivable ledger, but both financial systems belong to the overall Ledger area.

Main areas:

Ledger Book  
├── Summary  
├── Expenses  
├── Payables / Own Debt  
└── Payment History  
---

# **37\. Expenses**

Admin can manually create expenses.

Fields:

* Expense Date  
* Date Added  
* Expense Type  
* Amount  
* Paid  
* Due

---

## **Expense Date**

Admin can select/input the date.

---

## **Date Added**

System automatically records when the expense was added.

---

## **Expense Type**

Dropdown \+ custom text.

Default options:

Bills  
Labour Cost  
Salary of Employees

Admin can enter a custom type.

---

# **38\. Inventory-Generated Expenses**

When inventory is added/restocked, the system automatically creates the corresponding expense records.

Examples:

Voil : Buying  
Voil : Dying

The expense date comes from the inventory updating date.

The amount is calculated from:

Quantity Added × Cost / Than  
---

# **39\. Expense Due**

Every expense has:

Amount  
Paid  
Due

Formula:

Due \= Amount \- Paid

For manually created expenses, Admin can input the relevant payment amount.

For automatically generated inventory expenses, the system derives the amount from inventory data and the recorded payment.

---

# **40\. Shop's Own Debt**

The system must track money the shop owes to suppliers/service providers.

This is **not customer Due**.

There are two different meanings:

### **Customer Due**

Customer owes Shop

### **Shop Due / Payable**

Shop owes Supplier/Provider

They must never be mixed.

---

# **41\. Payable Payment**

If the shop later pays money toward an outstanding expense/payable, Admin should be able to record it.

Example:

Supplier Due \= ৳20,000

Admin pays:

৳8,000

System updates:

Due \= ৳12,000

and creates a payment transaction/history record.

---

# **42\. Ledger Summary**

The Ledger summary should show useful high-level information such as:

* Total expenses  
* Total paid expenses  
* Total outstanding payable  
* Customer receivables / customer due  
* Recent financial transactions

Do not add unnecessary accounting concepts unless needed.

---

# **43\. Cash Memo**

Cash Memo is **not a separate top-level feature**.

It belongs inside:

Orders  
   ↓  
Past Orders  
   ↓  
Order Details  
   ↓  
Create Slip

The button can be called:

> **Create Slip**

---

# **44\. Cash Memo Workflow**

Admin opens an existing order.

Clicks:

> Create Slip

System asks for two fields:

Due  
Payment

These values are manually entered for the document.

Then:

Confirm  
  ↓  
Generate PDF  
---

# **45\. Cash Memo Important Rule**

Generating the Cash Memo must NOT:

* modify inventory,  
* modify stock,  
* modify customer Due,  
* record a payment,  
* modify Customer Ledger,  
* create another Order.

It is purely a document-generation operation.

---

# **46\. Cash Memo PDF Contents**

### **Shop information**

New N Islam  
Phone: 01711280943  
Address: Islampur, Old Dhaka

### **Customer information**

* Customer Name  
* Customer Phone

### **Order information**

* Order Date  
* Ordered Items  
* Individual price for each item  
* Total Price

### **Payment section**

* Today's Date — automatic  
* Due Before — manually entered  
* Paid Now — manually entered  
* Due Left — calculated

The PDF should be downloadable.

---

# **47\. Color Slip**

Color Slip is another simple PDF generator.

It does not affect:

* Inventory  
* Orders  
* Customer financial standing  
* Ledger

Admin generates it independently.

---

# **48\. Color Slip Contents**

### **Shop details**

* Shop name  
* Phone  
* Address

### **Date**

Automatically generated.

### **Items**

Each line contains:

* Product Variant  
* Color  
* Total Than

Example:

Variant      Color       Total Than  
Voil         Blue        30  
Voil         White       20  
Poplin       Red         15

Generate downloadable PDF.

---

# **49\. Business Assistant**

Business Assistant is **not an AI system**.

It uses statistical calculations and search-demand data.

Purpose:

1. Suggest products to stock in the future.  
2. Detect slow-moving stock.  
3. Recommend discounts.

---

# **50\. Search Demand Tracking**

Customer Browse Stock searches should be recorded for statistical analysis.

Admin inventory search can also exist for convenience, but **customer search behavior is the demand signal for Business Assistant**.

A search event should record at least:

* Date/time  
* Product Variant filter  
* Color filter  
* Customer/session identifier if available

---

# **51\. Stock Suggestion Logic**

The primary demand prediction is based on:

> How many times customers searched for a Product Variant while selecting **All Colors**.

The purpose is to determine:

> How much demand exists for the Variant regardless of color.

Example:

Voil \+ All Colors \= 230 searches  
Poplin \+ All Colors \= 180 searches  
Linen \+ All Colors \= 120 searches

Top stocking suggestion:

Top Stock Suggestion

1\. Voil — 230 searches  
2\. Poplin — 180 searches  
3\. Linen — 120 searches  
...  
---

# **52\. Specific Color Demand**

Specific-color searches should also be retained.

Example:

Voil \+ Blue \= 80  
Voil \+ White \= 55  
Voil \+ Red \= 20

This can help Admin understand which colors are being requested.

However, the primary **variant stocking ranking** should use the `All Colors` search filter as specified.

---

# **53\. Top 5 Stock Suggestions**

Business Assistant should produce:

Top Stock Suggestions

1\. Variant A — X All-Color Searches  
2\. Variant B — Y All-Color Searches  
3\. Variant C — Z All-Color Searches  
4\. Variant D — ...  
5\. Variant E — ...

This is a demand indicator, not a guarantee.

The UI should use wording such as:

> Based on customer search demand.

not:

> Guaranteed future sales.

---

# **54\. Slow-Moving Inventory**

Business Assistant should detect inventory that has not experienced quantity deduction for a long period.

Example threshold:

30–60 days

The exact threshold can be configurable in Settings.

If an item has not had a stock deduction within the threshold:

Slow Moving Item

is shown.

---

# **55\. Discount Recommendation**

For slow-moving stock, the system should suggest a discount.

The recommendation should be statistical/simple rather than AI-generated.

The recommendation must consider at least:

* Current Selling Price  
* Own Cost  
* How long the item has remained without sales

The discount must not recommend a selling price below the item's own cost unless the business explicitly allows loss-selling.

Example:

Current Selling Price: ৳800  
Own Cost: ৳550

Suggested Discount: 10%  
Suggested Selling Price: ৳720

The system should clearly state that the discount is a recommendation.

Admin decides whether to actually change the selling price.

---

# **56\. Dashboard**

The Dashboard should remain simple.

The four agreed areas are:

## **1\. Business Overview**

Useful high-level numbers such as:

* Customer count  
* Order/request information  
* Current customer due  
* Outstanding shop payable

Avoid showing total inventory value because it was explicitly excluded.

---

## **2\. Attention Required**

Examples:

* Pending requests  
* Slow-moving stock  
* Outstanding customer due  
* Outstanding supplier/payable  
* Other important items requiring Admin attention

---

## **3\. Recent Activity**

Show recent:

* Orders  
* Payments  
* Expenses  
* Inventory updates

---

## **4\. Business Assistant Preview**

Show a small summary such as:

Top Stock Suggestion  
1\. Variant A  
2\. Variant B  
3\. Variant C  
...

and/or slow-moving alerts.

Dashboard should not become a replacement for the actual modules.

---

# **57\. Settings**

Settings should remain small.

## **Shop Information**

* Shop Name  
* Phone Number  
* Address

---

## **Business Settings**

* Slow-moving threshold

Potentially other simple business-assistant thresholds if actually needed.

Do not expose complicated formulas unnecessarily.

---

## **Admin Accounts**

Authenticated Admin can:

* View Admin accounts  
* Create Admin  
* Manage Admin accounts as needed

No public Admin registration.

---

## **Admin Account**

Each Admin has:

* Admin ID  
* Username  
* Phone  
* Password

System-generated:

* Created date  
* Last login

---

# **58\. Customer/Public Navigation**

Recommended structure:

Home  
Browse Stock  
Request Product  
Account Book  
Track Order  
Sign In / Sign Up  
---

# **59\. Admin Navigation**

Recommended:

Dashboard  
Inventory  
Orders  
Customers  
Ledger Book  
Business Assistant  
Color Slips  
Settings  
---

# **60\. Core Database Entities**

The application should be designed around the following main entities.

Admin  
Customer

InventoryItem  
InventoryRestock

Order  
OrderItem  
OrderStatusHistory

CustomerTransaction

Expense  
PayablePayment

SearchEvent

ShopSettings

Depending on implementation architecture, `Expense` and `PayablePayment` can share a financial transaction abstraction, but the business meaning must remain clear.

---

# **61\. Recommended Relationships**

Customer  
  │  
  ├── Orders  
  │      └── OrderItems  
  │              └── InventoryItem  
  │  
  └── CustomerTransactions

InventoryItem  
  │  
  └── InventoryRestocks  
          │  
          └── Expenses

Expense  
  │  
  └── Payable Payments

Order  
  │  
  └── OrderStatusHistory

Customer / Session  
  │  
  └── SearchEvents  
---

# **62\. Inventory and Order Relationship**

When an Order Item is created, it should reference the Inventory Item.

But it must also preserve a **snapshot** of relevant information:

* Product Variant  
* Color  
* Suta Count  
* Quantity  
* Selling Price at order time

This prevents future inventory edits from changing historical orders.

---

# **63\. Financial Data Integrity**

Do not calculate financial history only from mutable current fields.

For example, do not rely only on:

customer.due

to reconstruct the entire history.

Instead:

Customer Transactions  
      ↓  
Financial History  
      ↓  
Current Balance

The current balance can be stored for quick access, but transactions should remain the source of historical truth.

---

# **64\. Customer Transaction Types**

At minimum:

PURCHASE  
PAYMENT

A purchase increases the customer's financial obligation.

A payment decreases it.

The transaction record should contain:

* Customer  
* Date/time  
* Type  
* Amount  
* Due before  
* Due after  
* Related Order if applicable  
* Related Payment if applicable

---

# **65\. Shop Financial Transaction Types**

At minimum:

EXPENSE  
PAYABLE\_PAYMENT

Inventory acquisition generates expenses.

Paying a supplier/provider generates a payable payment.

---

# **66\. Important Difference Between Purchase and Payment**

Suppose:

Order \= ৳20,000  
Customer pays \= ৳5,000

The system must not treat the order as only ৳5,000.

It records:

Total Purchased \+= ৳20,000  
Paid \+= ৳5,000  
Due \+= ৳15,000

If the customer pays the remaining:

Payment \= ৳15,000

then:

Total Purchased \= ৳20,000  
Paid \= ৳20,000  
Due \= ৳0  
---

# **67\. Order Confirmation Atomicity**

The following should happen as one database transaction:

Create/confirm order  
\+  
Create order items  
\+  
Deduct inventory  
\+  
Update inventory quantity  
\+  
Create customer purchase transaction  
\+  
Update customer financial standing

If one part fails, the system should roll back the entire confirmation.

This prevents situations such as:

Inventory deducted  
but  
Order wasn't created

or:

Order created  
but  
Customer due wasn't updated  
---

# **68\. Inventory Quantity Rules**

Inventory quantity represents available stock.

On confirmed order:

quantity \= quantity \- ordered\_quantity

Never allow quantity to become negative.

Before deduction:

ordered\_quantity \<= available\_quantity

must be true.

Approved requests do **not** reserve/deduct stock unless the project later explicitly introduces stock reservation.

For the current specification, stock is checked again at confirmation.

---

# **69\. Request History**

Customer should be able to see previous requests.

Each request should show:

* Request ID  
* Requested items  
* Request date  
* Current status  
* Relevant status dates  
* Order ID if a confirmed Order was eventually created

Rejected and expired requests remain visible in history.

---

# **70\. Order IDs**

Order IDs should be unique and generated by the system.

Recommended human-readable format:

ORD-000001  
ORD-000002  
...

Customers can use this ID for Track Order.

---

# **71\. Request IDs**

Requests should also have their own unique identifier:

REQ-000001  
REQ-000002  
...

This helps distinguish:

Request

from:

Order

especially when a request is rejected or expires.

---

# **72\. Admin Order Details**

When Admin opens an order/request, show:

### **Customer**

* Customer ID  
* Name  
* Phone  
* Shop/Business  
* Address

### **Order/request**

* Request ID  
* Order ID if created  
* Source: Online/Offline  
* Items  
* Quantity  
* Price  
* Total  
* Current status

### **Timeline**

All status events and dates.

### **Actions**

Actions should depend on current status.

---

# **73\. Online/Offline Flag**

Every actual Order must contain:

Order Source:  
ONLINE / OFFLINE

This is visible to Admin.

This flag must not change after creation.

---

# **74\. Customer Visibility Rules**

Customer can only access:

* their own account,  
* their own requests,  
* their own financial standing.

A customer must never be able to query another customer's financial records by changing an ID in a URL/API request.

Authorization must be enforced server-side.

---

# **75\. Public Order Tracking Security**

Track Order is intentionally public.

However, it should expose only appropriate order information.

Do not expose:

* Customer password  
* Financial standing  
* Customer ledger  
* Internal supplier information  
* Buying cost  
* Dying cost  
* Internal Admin information

---

# **76\. File/Image Rules**

Inventory supports:

* Minimum 0 images  
* Maximum 2 images  
* PNG only

The system must validate:

* file type  
* file size  
* number of uploaded images

Customer-facing product details display available images.

---

# **77\. PDF Generation**

PDF generation should be server-side or through a reliable PDF library.

Documents:

Cash Memo  
Color Slip

Generated PDFs should use current Shop Settings for:

* Shop Name  
* Phone  
* Address

except where a historical document requires preserving the original shop information; if historical immutability is important later, snapshotting shop information at generation time can be added.

---

# **78\. Date/Time Handling**

The system should store timestamps consistently.

Recommended:

* Store timestamps in UTC internally.  
* Display them in the shop's local timezone.

Dates shown to Admin/customer should be human-readable.

Important dates:

* Customer created  
* Inventory updated  
* Expense created  
* Request submitted  
* Request approved/rejected  
* Order confirmed  
* Order dispatched  
* Order delivered  
* Payment recorded  
* Admin login

---

# **79\. Validation Rules**

### **Customer**

* Name required  
* Phone required  
* Password required  
* Username/email uniqueness as applicable  
* Address required

### **Admin**

* Username required and unique  
* Phone required  
* Password required

### **Inventory**

* Variant required  
* Suta Count required  
* Color required  
* Quantity must be positive when adding stock  
* Prices must be non-negative  
* Maximum two PNG images

### **Order**

* At least one item  
* Quantity \> 0  
* Stock sufficient at confirmation  
* Selling price must be non-negative

### **Payment**

* Amount \> 0  
* Customer payment should not normally exceed outstanding customer due unless an explicit overpayment policy is later introduced.

### **Expense**

* Amount \> 0  
* Expense type required

---

# **80\. Status Transition Rules**

Recommended server-side rules:

PENDING  
├── APPROVED  
└── REJECTED

APPROVED  
├── CONFIRMED  
└── EXPIRED

CONFIRMED  
└── ON\_THE\_WAY

ON\_THE\_WAY  
└── DELIVERED

Admin should not be allowed to make arbitrary invalid transitions.

For example:

PENDING → DELIVERED

must not be allowed.

---

# **81\. Approved 30-Day Rule**

The Approved state has a 30-day confirmation window.

The system should calculate whether the approval is older than 30 days.

However:

> The system does not automatically change the status to Expired.

Admin manually marks the request/order as:

EXPIRED

if appropriate.

---

# **82\. No Stock Reservation at Approval**

Because the customer has only received approval and must still visit/contact the shop:

**Approval does not deduct stock.**

Therefore another customer/order may consume the stock before the original customer confirms.

At confirmation, stock is checked again.

This is intentional.

---

# **83\. Cash Memo and Ledger Independence**

A very important implementation rule:

Order  
 ├── Financial transaction → YES  
 ├── Inventory deduction → YES  
 └── Cash Memo → optional document only

Generating a Cash Memo later does not repeat any of those actions.

---

# **84\. Business Assistant Independence**

Business Assistant recommendations must never automatically:

* purchase inventory,  
* modify inventory,  
* modify selling price,  
* create an order,  
* create an expense.

It only recommends.

Admin decides what to do.

---

# **85\. Recommended Backend Authorization**

Every protected endpoint must check authentication and authorization server-side.

At minimum:

PUBLIC  
CUSTOMER  
ADMIN

A customer token/session must not authorize Admin APIs.

An unauthenticated request must not access protected Customer APIs.

---

# **86\. Recommended Audit Information**

Because multiple Admins are supported, important Admin actions should record:

created\_by\_admin  
updated\_by\_admin

where applicable.

Especially:

* Inventory updates  
* Order status changes  
* Customer creation  
* Customer payment recording  
* Expense creation  
* Payable payments  
* Admin account creation

This will make the system much easier to audit later.

---

# **87\. Complete Feature Map**

## **Public / Customer**

Home  
│  
├── Browse Stock  
│   └── Search  
│  
├── Request Product  
│   ├── Login  
│   ├── New Request  
│   └── Previous Requests  
│  
├── Account Book  
│   ├── Total Purchased  
│   ├── Paid  
│   ├── Due  
│   └── Transaction History  
│  
├── Track Order  
│   └── Order ID  
│  
└── Sign In / Sign Up  
---

## **Admin**

Admin Dashboard  
│  
├── Dashboard  
│  
├── Inventory  
│   ├── Add/Restock  
│   ├── Search  
│   ├── View  
│   ├── Update  
│   ├── Delete  
│   └── Display ON/OFF  
│  
├── Orders  
│   ├── Requests  
│   ├── Create Offline Order  
│   ├── Past Orders  
│   ├── Order Details  
│   └── Create Slip  
│  
├── Customers  
│   ├── Customer List  
│   ├── Create Customer  
│   ├── Customer Details  
│   ├── Financial Standing  
│   └── Record Payment  
│  
├── Ledger Book  
│   ├── Summary  
│   ├── Expenses  
│   ├── Payables  
│   └── Payable Payments  
│  
├── Business Assistant  
│   ├── Top Stock Suggestions  
│   └── Slow-Moving Stock  
│  
├── Color Slips  
│  
└── Settings  
   ├── Shop Details  
   └── Admin Accounts  
---

# **88\. Most Important Business Flow**

The entire system can essentially be understood through these five flows.

### **Customer request**

Browse  
↓  
Select items  
↓  
Login  
↓  
Request  
↓  
Pending  
↓  
Admin Approval  
↓  
Approved  
↓  
Physical confirmation  
↓  
Stock check  
↓  
Confirmed  
↓  
Inventory deducted  
↓  
Customer financial standing updated

### **Offline sale**

Admin  
↓  
Orders  
↓  
Create Offline Order  
↓  
Select/Create Customer  
↓  
Select Items  
↓  
Stock check  
↓  
Confirm  
↓  
Inventory deducted  
↓  
Customer financial standing updated

### **Customer payment**

Customer Due  
↓  
Admin Record Payment  
↓  
Customer Transaction  
↓  
Paid increases  
↓  
Due decreases  
↓  
Status recalculated

### **Inventory purchase**

Admin adds/restocks Inventory  
↓  
Quantity increases  
↓  
Buying/Dying expense generated  
↓  
Paid recorded  
↓  
Due calculated  
↓  
Shop payable tracked

### **Cash Memo**

Existing Order  
↓  
Create Slip  
↓  
Input Due \+ Payment  
↓  
Generate PDF

**No financial/inventory mutation.**

---

# **89\. Implementation Priority**

I recommend AI coding agents build this in the following order rather than attempting the entire application at once:

### **Phase 1 — Foundation**

* Project structure  
* Database  
* Authentication  
* Admin authentication  
* Customer authentication  
* Shop settings  
* Authorization

### **Phase 2 — Inventory**

* Inventory CRUD  
* Unique Variant \+ Suta \+ Color  
* Search  
* Display ON/OFF  
* Image upload  
* Restocking  
* Inventory expenses

### **Phase 3 — Customers**

* Customer creation  
* Customer list  
* Customer details  
* Customer financial records  
* Payment recording

### **Phase 4 — Orders**

* Customer requests  
* Admin request management  
* Offline order creation  
* Order confirmation  
* Stock deduction  
* Online/offline flag  
* Status timeline  
* Status history  
* Track Order

### **Phase 5 — Ledger**

* Expenses  
* Inventory-generated expenses  
* Payables  
* Payable payments  
* Ledger summary

### **Phase 6 — Documents**

* Cash Memo  
* Color Slip

### **Phase 7 — Business Assistant**

* Search event tracking  
* Demand calculation  
* Top 5 variant suggestions  
* Slow-moving detection  
* Discount recommendation

### **Phase 8 — Dashboard**

Build the dashboard after the underlying modules exist so it can display real data rather than creating separate dashboard logic.

### **Phase 9 — Final testing**

Test the complete cross-module workflows.

---

# **90\. Critical End-to-End Tests**

Before considering the application complete, the coding agent should test at least these scenarios.

### **Test 1 — New customer**

Sign Up  
→ Customer created  
→ Customer appears in Admin list  
→ Total Purchased \= 0  
→ Paid \= 0  
→ Due \= 0

### **Test 2 — Online request**

Customer requests item  
→ Request \= Pending  
→ Inventory unchanged  
→ Customer finances unchanged

### **Test 3 — Approve**

Admin approves  
→ Status \= Approved  
→ Inventory unchanged  
→ Customer finances unchanged

### **Test 4 — Confirm**

Confirm  
→ Stock checked  
→ Order created  
→ Inventory deducted  
→ Customer Total Purchased increased  
→ Customer Due/Paid updated  
→ Financial transaction created

### **Test 5 — Insufficient stock**

Approved request  
→ Stock insufficient  
→ Confirmation rejected  
→ No order created  
→ No inventory deduction  
→ No financial update

### **Test 6 — Offline new customer**

Admin creates offline order  
→ Customer doesn't exist  
→ Customer created  
→ Customer ID generated  
→ Order created  
→ Financial standing updated

### **Test 7 — Customer payment**

Due \= ৳30,000  
→ Record ৳10,000 payment  
→ Paid increases  
→ Due \= ৳20,000  
→ Transaction recorded

### **Test 8 — Inventory restock**

Add 10 Than  
Buying \= ৳500/Than  
Dying \= ৳50/Than  
Paid \= ৳4,000

Total \= ৳5,500  
Due \= ৳1,500

Inventory expense records created

### **Test 9 — Cash Memo**

Existing Order  
→ Create Slip  
→ Enter Due/Payment  
→ PDF generated  
→ Inventory unchanged  
→ Customer ledger unchanged

### **Test 10 — Order timeline**

Pending  
→ Approved  
→ Confirmed  
→ On The Way  
→ Delivered

Every transition gets a timestamp.

### **Test 11 — Rejected request**

Pending  
→ Rejected

No actual order.

### **Test 12 — Expired request**

Approved  
→ 30+ days  
→ Admin marks Expired

No automatic status mutation.

---

# **91\. Important Things the AI Agent Must NOT Invent**

Because you specifically want a simple system, coding agents should **not add features without requirement**.

Do not automatically introduce:

* Shopping cart checkout  
* Online payment gateway  
* Shipping system  
* Coupon system  
* Product reviews  
* Wishlist  
* Product ratings  
* Complex employee roles  
* Multi-branch inventory  
* Automated delivery tracking  
* AI/LLM Business Assistant  
* Automatic stock reservation  
* Automatic order expiry  
* Automatic delivery status  
* Inventory valuation dashboard  
* Complex accounting/ERP features

unless explicitly requested later.

---

# **92\. Final Architecture Concept**

The system should ultimately behave like this:

                        ┌─────────────────┐  
                        │  PUBLIC WEBSITE │  
                        └────────┬────────┘  
                                 │  
         ┌───────────────────────┼───────────────────────┐  
         │                       │                       │  
         ▼                       ▼                       ▼  
  Browse Stock             Request Product          Track Order  
         │                       │                       │  
         │                  Customer Auth                │  
         │                       │                       │  
         │                       ▼                       │  
         │                   REQUEST                     │  
         │                       │                       │  
         │                       ▼                       │  
         │                    ADMIN                      │  
         │                       │                       │  
         │                       ▼                       │  
         │                 APPROVE/REJECT                │  
         │                       │                       │  
         │                 APPROVED                     │  
         │                       │                       │  
         │               Physical Confirmation          │  
         │                       │                       │  
         │                       ▼                       │  
         │                  CONFIRMED                    │  
         │                       │                       │  
         │          ┌────────────┼────────────┐          │  
         │          ▼            ▼            ▼          │  
         │      Inventory     Customer      Ledger       │  
         │      Deduction     Finance       Records      │  
         │                       │                       │  
         │                       ▼                       │  
         │                   ON THE WAY                  │  
         │                       │                       │  
         │                       ▼                       │  
         │                   DELIVERED                   │  
         │                                               │  
         └───────────────────────────────────────────────┘

And separately:

Inventory  
  ↓  
Buying/Dying  
  ↓  
Expense  
  ↓  
Shop Payable  
  ↓  
Payable Payment

while:

Order  
  ↓  
Customer Purchase  
  ↓  
Customer Due  
  ↓  
Customer Payment  
  ↓  
Customer Financial Standing  
---

## **Final implementation rule**

The most important instruction for the coding agents should be:

> **Do not treat the modules as isolated CRUD pages. The application is a connected business system. Inventory, Orders, Customers, Customer Financial Standing, Expenses, Payables and Order Status History must remain synchronized according to the business rules above.**

And particularly:

> **Never perform a financial or inventory side effect merely because a screen was opened or a PDF was generated. Side effects occur only at the explicitly defined business events.**

## 

## 

## **Updated Admin Settings**

Settings  
├── Shop Details  
├── Landing Page Images  
└── Admin Accounts

### **1\. Shop Details**

Admin can edit:

* Shop Name  
* Phone Number  
* Address

Current values:

Shop Name: New N Islam  
Phone: 01711280943  
Address: Islampur, Old Dhaka

These centralized details are used throughout the application, including PDFs.

---

### **2\. Landing Page Images**

Admin can upload/manage images specifically for the customer landing page.

The logic should be:

Are Admin landing-page images available?  
       │  
    YES│        NO  
       │         │  
       ▼         ▼  
Show uploaded    Select random  
images            item images  
       │         │  
       └────┬────┘  
            ▼  
      Customer Landing Page

So:

#### **If Admin has uploaded landing-page images**

The landing page uses those images.

These are **promotional/landing-page images**, not necessarily inventory images.

#### **If Admin has not uploaded any**

The system automatically selects images from inventory items.

Preferably, only inventory items that:

display \= ON

and actually have an image should be eligible.

This gives the landing page a useful fallback without requiring Admin to upload anything.

---

### **3\. Admin Account Management**

Admin Settings also contains:

* View Admin accounts  
* Create Admin  
* Edit/manage Admin accounts as appropriate

No public Admin registration.

---

## **One small implementation detail I'd recommend**

Allow Admin to upload **multiple landing-page images**, rather than restricting it to one.

Then the landing page can randomly select/display from the uploaded collection.

For example:

Landing Page Images

\[ image 1 \] \[ image 2 \] \[ image 3 \]  
\[ image 4 \] \[ image 5 \]

Upload Images  
Delete Image

The system doesn't need a complicated image-management system. Just:

* Upload  
* View  
* Delete

is enough.

### **Updated complete Settings structure**

Settings  
│  
├── Shop Details  
│   ├── Shop Name  
│   ├── Phone Number  
│   └── Address  
│  
├── Landing Page Images  
│   ├── Upload Images  
│   ├── View Images  
│   └── Delete Images  
│  
└── Admin Accounts  
   ├── Admin List  
   └── Create Admin

And importantly, **landing-page images have no effect on inventory, orders, ledger, or any financial data**.

