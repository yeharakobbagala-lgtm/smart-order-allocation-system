Smart Order Allocation System
Overview

The Smart Order Allocation System is a web-based e-commerce system designed to automatically select the most suitable branch to fulfill a customer order.

The system considers:

Product stock availability
Customer location
Road distance and travel time
Branch workload
Stock waiting time
Estimated delivery time

It also includes a 10-minute temporary stock reservation during checkout to prevent stock conflicts.

Project Links
Frontend: https://the-shoply.vercel.app
Backend API: https://smart-order-allocation-system-production.up.railway.app
GitHub: https://github.com/yeharakobbagala-lgtm/smart-order-allocation-system
Admin Access

An admin account is available for assessment evaluation.

Email: admin@gmail.com
Password: Provided separately for assessment evaluation

Used Technologies
Frontend
Next.js
React
TypeScript
Tailwind CSS
Backend
Python
FastAPI
SQLAlchemy
Pydantic
Alembic
Database
PostgreSQL
Supabase
Authentication & Security
JWT Authentication
Argon2 Password Hashing
Role-Based Access Control
API Validation
Environment Variables
AI/ML
Python
Scikit-learn
TF-IDF
Logistic Regression
Pandas
Joblib
CSV Dataset
Other Technologies
Git & GitHub
Swagger UI
Postman
OSRM Routing API
Vercel
Railway
Main Features
Customer
User registration and login
Browse products
Add products to cart
Manage cart quantities
Checkout
Automatic branch allocation
Temporary stock reservation
Order confirmation
Order status
Estimated delivery information
Admin
Admin authentication
Dashboard
Product management
Branch management
Branch stock management
Order management
User management
View allocation details and scoring
Smart Branch Allocation

When a customer places an order, the system automatically evaluates available branches.

1. Stock Eligibility

Branches are first checked for sufficient stock.

Branches that cannot fulfill the order are excluded.

2. Distance & Travel Time

The system calculates road distance and estimated travel time using the OSRM Routing API.

3. Processing Time

Processing time depends on the branch distance:

Distance ≤ 40 km: 1 processing day
Distance > 40 km: 2 processing days
4. Expected ETA

The expected delivery time is calculated using:

Expected ETA = Stock Wait + Processing Time + Travel Time

5. Workload

Branch workload is calculated using:

Workload % = (Active Orders / Branch Capacity) × 100

6. Final Score

The system combines ETA and workload:

Final Score = (ETA Score × 60%) + (Workload Score × 40%)

The branch with the highest final score is selected.

If scores are equal, the system considers:

Lower ETA
Lower workload
Lower branch ID
Stock & Reservation System

The system uses three reservation types:

Temporary Reservation

Created during checkout for 10 minutes.

It temporarily blocks stock while the customer completes the order.

Current Reservation

Created when an order is confirmed and fulfilled using available stock.

Future Reservation

Used when stock requires future restocking before fulfillment.

The system also prevents expired temporary reservations from blocking available stock.

Two-Step Checkout

The checkout process uses two stages:

Step 1 — Allocate & Reserve

The system:

Checks stock
Finds eligible branches
Calculates allocation scores
Selects the best branch
Creates a 10-minute temporary reservation
Step 2 — Confirm Order

The customer confirms the order before the reservation expires.

On confirmation:

The order is created
Stock is updated
The temporary reservation becomes a confirmed reservation
The cart is cleared

If the reservation expires, the customer cannot confirm the order.

AI/ML Customer Message Classification

An optional AI/ML feature is included to classify customer messages.

The model categorizes messages into:

Payment Issue
Delivery Issue
Refund/Cancellation
Product Inquiry
General Inquiry
Approach

The model uses:

TF-IDF → Logistic Regression → Prediction + Confidence

A confidence score is used to identify uncertain predictions.

The model is trained using a small CSV-based customer message dataset.

Security

The system includes:

JWT-based authentication
Secure password hashing using Argon2
Role-based authorization
Protected admin endpoints
Request validation using Pydantic
Environment variables for sensitive configuration
CORS configuration
HTTPS through deployed services

Admin-only functionality is protected on the backend and is not dependent only on frontend access control.

Edge Cases

The system handles scenarios such as:

Insufficient stock
Multiple eligible branches
No eligible branch
Expired reservations
Stale cart items
Concurrent stock reservations
Order cancellation
Future restocking
Branch workload capacity
Invalid authentication
Unauthorized admin access
Database

The main database entities include:

Users
Products
Branches
Branch Stock
Carts
Cart Items
Checkout Holds
Stock Reservations
Orders
Order Items

PostgreSQL is hosted using Supabase.

Deployment
Frontend

Vercel

Backend

Railway

Database

Supabase PostgreSQL

The frontend communicates with the deployed FastAPI backend through REST APIs.

Project Structure
smart-order-allocation-system/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── main.py
│   │
│   ├── alembic/
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── lib/
│   │   └── ...
│   └── package.json
│
└── README.md
API Documentation

The FastAPI backend provides interactive API documentation through Swagger UI.

After opening the backend URL, add:

/docs

This allows the API endpoints to be viewed and tested.

Key Design Decisions
Allocation is performed automatically rather than manually selecting a branch.
One branch fulfills an order; split fulfillment is not used.
ETA has a higher weight than workload.
A 10-minute temporary reservation protects stock during checkout.
Confirmed purchases update actual physical stock.
Allocation results are stored with the order as a snapshot for transparency.
Historical orders are not automatically used to rewrite existing stock records.
Assumptions & Limitations
Road travel time depends on the OSRM routing service.
The project is designed as an assessment solution rather than a production-scale e-commerce platform.
Payment processing is not implemented.
The AI/ML classifier uses a relatively small sample dataset.
Advanced warehouse optimization and real-time courier tracking are outside the current scope.
Conclusion

The Smart Order Allocation System demonstrates a complete order allocation workflow combining:

Customer → Cart → Stock Check → Branch Allocation → Temporary Reservation → Order Confirmation → Stock Update

The project focuses on backend logic, database consistency, secure authentication, branch allocation, reservation handling, and a practical AI/ML extension.