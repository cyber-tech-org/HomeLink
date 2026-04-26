<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

### Deploying this backend on Vercel

1. Import `homelink-backend` as a Vercel project.
2. Set the project root directory to `homelink-backend`.
3. Add environment variables from `.env.example` in Vercel Project Settings.
4. For production, update callback URLs to your deployed domain:
   - `GOOGLE_CALLBACK_URL=https://backendhomelink.vercel.app//auth/google/callback`
   - `FACEBOOK_CALLBACK_URL=https://backendhomelink.vercel.app//auth/facebook/callback`
5. Set `CORS_ORIGIN` to your frontend domain (or comma-separated domains).
6. Deploy and share the generated Vercel URL with the frontend app.

## Frontend Auth Integration (Phone + Password only)

Base URL examples:

- Local: `http://localhost:3000`
- Vercel: `https://backendhomelink.vercel.app/`

All auth endpoints are under: `{{BASE_URL}}/auth`

## API Endpoint Index

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/signup/request-otp`
- `POST /auth/signup/verify-otp`
- `POST /auth/signup/complete`
- `POST /auth/forgot-password`
- `POST /auth/reset-password/request`
- `POST /auth/reset-password/verify`
- `POST /auth/reset-password/complete`
- `GET /auth/google` (optional OAuth)
- `GET /auth/google/callback` (optional OAuth)
- `GET /auth/facebook` (optional OAuth)
- `GET /auth/facebook/callback` (optional OAuth)

### Profile / Users

- `GET /users/options`
- `GET /users/me`
- `GET /users/:userId/profile` (public profile; works for both landlord and renter)
- `PATCH /users/me/profile-intent`
- `PATCH /users/me/basic`
- `PATCH /users/me/details`
- `PATCH /users/me/preferences`
- `POST /users/me/complete-profile`
- `GET /users/location/search?query=...`

### Explore

- `GET /explore?tab=...&page=...&limit=...&search=...&view=list|map`

### Wishlist

- `GET /wishlist/folders`
- `POST /wishlist/folders`
- `PATCH /wishlist/folders/:folderId`
- `DELETE /wishlist/folders/:folderId`
- `GET /wishlist/folders/:folderId/listings?page=...&limit=...`
- `POST /wishlist/folders/:folderId/listings`
- `DELETE /wishlist/folders/:folderId/listings/:listingId`
- `GET /wishlist/listings/:listingId/folders`

### Chat / Inbox

- `POST /chat/conversations`
- `GET /chat/conversations?page=...&limit=...`
- `GET /chat/conversations/:conversationId/messages?page=...&limit=...`
- `POST /chat/messages`
- `PATCH /chat/conversations/:conversationId/read`

### Booking

- `POST /bookings`
- `GET /bookings?status=...&page=...&limit=...`
- `GET /bookings/:bookingId`
- `GET /bookings/:bookingId/cancel-preview`
- `POST /bookings/:bookingId/cancel`
- `POST /bookings/:bookingId/check-in/confirm`
- `POST /bookings/:bookingId/review`

### Uploads

- `POST /uploads/signature`

Signup flow endpoints available:

- `POST /auth/signup/request-otp`
- `POST /auth/signup/verify-otp`
- `POST /auth/signup/complete`
- `POST /auth/register` (direct signup without OTP)

## Endpoint Request/Response Reference

Base URL: `{{BASE_URL}}`  
Auth for protected routes: `Authorization: Bearer <access_token>`

### Auth Endpoints

- `POST /auth/register`  
  - Purpose: Direct phone/password signup (without OTP flow).
  - Request:
    ```json
    { "phoneNumber": "+2348012345678", "password": "secret123", "confirmPassword": "secret123" }
    ```
  - Response:
    ```json
    { "access_token": "<jwt>", "user": { "id": "<id>", "phoneNumber": "+2348012345678", "displayName": null } }
    ```

- `POST /auth/login`  
  - Purpose: Sign in existing user with phone/password.
  - Request:
    ```json
    { "phoneNumber": "+2348012345678", "password": "secret123" }
    ```
  - Response:
    ```json
    { "access_token": "<jwt>", "user": { "id": "<id>", "phoneNumber": "+2348012345678", "displayName": null } }
    ```

- `POST /auth/signup/request-otp`  
  - Purpose: Start OTP signup flow.
  - Request:
    ```json
    { "phoneNumber": "+2348012345678" }
    ```
  - Response:
    ```json
    { "message": "OTP sent" }
    ```

- `POST /auth/signup/verify-otp`  
  - Purpose: Verify signup OTP and get short-lived setup token.
  - Request:
    ```json
    { "phoneNumber": "+2348012345678", "code": "123456" }
    ```
  - Response:
    ```json
    { "setupToken": "<jwt>" }
    ```

- `POST /auth/signup/complete`  
  - Purpose: Complete OTP signup and return access token.
  - Request:
    ```json
    { "setupToken": "<jwt>", "password": "secret123", "confirmPassword": "secret123" }
    ```
  - Response:
    ```json
    { "access_token": "<jwt>", "user": { "id": "<id>", "phoneNumber": "+2348012345678", "displayName": null } }
    ```

- `POST /auth/forgot-password` and `POST /auth/reset-password/request`  
  - Purpose: Request OTP for password reset (same behavior).
  - Request:
    ```json
    { "phoneNumber": "+2348012345678" }
    ```
  - Response:
    ```json
    { "message": "OTP sent" }
    ```

- `POST /auth/reset-password/verify`  
  - Purpose: Verify reset OTP and return reset token.
  - Request:
    ```json
    { "phoneNumber": "+2348012345678", "code": "123456" }
    ```
  - Response:
    ```json
    { "resetToken": "<jwt>" }
    ```

- `POST /auth/reset-password/complete`  
  - Purpose: Set new password and sign user in.
  - Request:
    ```json
    { "resetToken": "<jwt>", "password": "newsecret123", "confirmPassword": "newsecret123" }
    ```
  - Response:
    ```json
    { "access_token": "<jwt>", "user": { "id": "<id>", "phoneNumber": "+2348012345678", "displayName": null } }
    ```

- `GET /auth/google`, `GET /auth/google/callback`, `GET /auth/facebook`, `GET /auth/facebook/callback`  
  - Purpose: Optional OAuth login routes.
  - Request: Browser redirect flow.
  - Response: Provider redirect/callback auth response.

### Users/Profile Endpoints

- `GET /users/options`  
  - Purpose: Return dropdown/select options for onboarding.
  - Request: none
  - Response:
    ```json
    { "useCases": [], "languages": [], "maritalStatuses": [], "petChoices": [] }
    ```

- `GET /users/me`  
  - Purpose: Get authenticated user full profile state.
  - Request: none
  - Response:
    ```json
    { "id": "<id>", "phoneNumber": "+234...", "useCase": "rent", "firstName": "Dickson", "location": { "city": "Lagos" }, "preferences": { "notificationsEnabled": true, "locationPermissionGranted": true } }
    ```

- `GET /users/:userId/profile`  
  - Purpose: Public profile endpoint for both renters and landlords.
  - Request: URL param `userId`
  - Response:
    ```json
    { "id": "<id>", "role": "renter", "displayName": "Dickson Emmanuel", "verifiedInformation": { "identity": true, "email": true, "phoneNumber": true }, "listings": [] }
    ```

- `PATCH /users/me/profile-intent`  
  - Purpose: Save whether user is renter or landlord flow.
  - Request:
    ```json
    { "useCase": "rent" }
    ```
  - Response: updated profile object.

- `PATCH /users/me/basic`  
  - Purpose: Save first/last name and email.
  - Request:
    ```json
    { "firstName": "Dickson", "lastName": "Emmanuel", "email": "emmanuel12@gmail.com" }
    ```
  - Response: updated profile object.

- `PATCH /users/me/details`  
  - Purpose: Save bio, occupation, languages, location, marital/pets, profile photo URL.
  - Request:
    ```json
    { "bio": "Loving and caring...", "occupation": "Graphic Designer", "languages": ["English"], "address": "Lekki", "city": "Lagos", "state": "Lagos", "country": "Nigeria", "latitude": 6.4474, "longitude": 3.4723, "isMarried": true, "hasPets": false, "profilePhotoUrl": "https://..." }
    ```
  - Response: updated profile object.

- `PATCH /users/me/profile-photo`  
  - Purpose: Save uploaded Cloudinary profile photo URL/publicId.
  - Request:
    ```json
    { "url": "https://res.cloudinary.com/.../image/upload/v123/profile.jpg", "publicId": "homelink/profile/<userId>/abc123" }
    ```
  - Response: updated profile object.

- `PATCH /users/me/preferences`  
  - Purpose: Save notifications and location permission flags.
  - Request:
    ```json
    { "notificationsEnabled": true, "locationPermissionGranted": true }
    ```
  - Response: updated profile object.

- `POST /users/me/complete-profile`  
  - Purpose: Mark onboarding profile as completed.
  - Request: none
  - Response: updated profile object with `profileCompleted: true`.

- `GET /users/location/search?query=lekki`  
  - Purpose: Return location suggestions from configured provider.
  - Request: query param `query`
  - Response:
    ```json
    [{ "address": "Lekki Phase 1, Lagos", "city": "Lagos", "state": "Lagos", "country": "Nigeria", "latitude": 6.4474, "longitude": 3.4723 }]
    ```

### Explore Endpoints

- `GET /explore?tab=popular&page=1&limit=10&search=lekki&view=list`  
  - Purpose: Fetch explore feed for active tab, optional search, paginated.
  - Request: query params `tab`, `page`, `limit`, `search`, `view`
  - Response:
    ```json
    { "user": { "id": "<id>", "displayName": "Dickson" }, "activeTab": "popular", "activeView": "list", "search": "lekki", "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3, "hasNextPage": true, "hasPrevPage": false }, "listings": [], "mapMarkers": [] }
    ```

### Wishlist Endpoints

- `GET /wishlist/folders`  
  - Purpose: List wishlist folders for current user.
  - Response:
    ```json
    [{ "id": "<folder-id>", "name": "Lagos Homes", "listingsCount": 2, "createdAt": "<date>", "updatedAt": "<date>" }]
    ```

- `POST /wishlist/folders`  
  - Purpose: Create new folder.
  - Request:
    ```json
    { "name": "Lagos Homes" }
    ```
  - Response:
    ```json
    { "id": "<folder-id>", "name": "Lagos Homes", "listingsCount": 0, "createdAt": "<date>", "updatedAt": "<date>" }
    ```

- `PATCH /wishlist/folders/:folderId`  
  - Purpose: Rename existing folder.
  - Request:
    ```json
    { "name": "Abuja Homes" }
    ```
  - Response:
    ```json
    { "id": "<folder-id>", "name": "Abuja Homes", "updatedAt": "<date>" }
    ```

- `DELETE /wishlist/folders/:folderId`  
  - Purpose: Delete folder and all items in it.
  - Response:
    ```json
    { "message": "Folder deleted" }
    ```

- `GET /wishlist/folders/:folderId/listings?page=1&limit=10`  
  - Purpose: Get paginated listings in folder.
  - Response:
    ```json
    { "folder": { "id": "<folder-id>", "name": "Lagos Homes" }, "pagination": { "page": 1, "limit": 10, "total": 2, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false }, "listings": [] }
    ```

- `POST /wishlist/folders/:folderId/listings`  
  - Purpose: Save listing into folder.
  - Request:
    ```json
    { "listingId": "<listing-id>" }
    ```
  - Response:
    ```json
    { "message": "Listing saved to folder", "listingId": "<listing-id>", "folderId": "<folder-id>" }
    ```

- `DELETE /wishlist/folders/:folderId/listings/:listingId`  
  - Purpose: Remove saved listing from folder.
  - Response:
    ```json
    { "message": "Listing removed from folder", "listingId": "<listing-id>", "folderId": "<folder-id>" }
    ```

- `GET /wishlist/listings/:listingId/folders`  
  - Purpose: Return all folders with selected-state for save modal.
  - Response:
    ```json
    [{ "id": "<folder-id>", "name": "Lagos Homes", "selected": true }]
    ```

### Chat / Inbox Endpoints

- `POST /chat/conversations`  
  - Purpose: Create (or reuse) conversation between two users.
  - Request:
    ```json
    { "participantId": "<other-user-id>", "listingId": "<optional-listing-id>" }
    ```
  - Response:
    ```json
    { "id": "<conversation-id>", "otherParticipantId": "<user-id>", "participantIds": ["<me>", "<other>"], "listingId": "<listing-id>", "lastMessageText": "", "lastMessageSenderId": null, "lastMessageAt": null, "updatedAt": "<date>" }
    ```

- `GET /chat/conversations?page=1&limit=20`  
  - Purpose: Fetch inbox list with unread counts.
  - Response:
    ```json
    { "pagination": { "page": 1, "limit": 20, "total": 4, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false }, "conversations": [{ "id": "<conversation-id>", "otherParticipant": { "id": "<user-id>", "displayName": "Dickson Emmanuel" }, "unreadCount": 2 }] }
    ```

- `GET /chat/conversations/:conversationId/messages?page=1&limit=30`  
  - Purpose: Fetch paginated message history for conversation.
  - Response:
    ```json
    { "conversation": { "id": "<conversation-id>" }, "pagination": { "page": 1, "limit": 30, "total": 100, "totalPages": 4, "hasNextPage": true, "hasPrevPage": false }, "messages": [{ "id": "<message-id>", "conversationId": "<conversation-id>", "senderId": "<user-id>", "text": "Hello", "attachments": [], "readByUserIds": ["<user-id>"], "createdAt": "<date>" }] }
    ```

- `POST /chat/messages`  
  - Purpose: Send message (REST fallback) with text and/or attachment URLs (e.g. Cloudinary links).
  - Request:
    ```json
    { "conversationId": "<optional>", "recipientId": "<required if conversationId missing>", "listingId": "<optional>", "text": "Hello, I will like to visit today", "attachments": ["https://..."] }
    ```
  - Response:
    ```json
    { "conversation": { "id": "<conversation-id>" }, "message": { "id": "<message-id>", "text": "Hello, I will like to visit today" }, "participantIds": ["<me>", "<other-user-id>"] }
    ```

- `PATCH /chat/conversations/:conversationId/read`  
  - Purpose: Mark all unread incoming messages in conversation as read.
  - Response:
    ```json
    { "conversationId": "<conversation-id>", "participantIds": ["<me>", "<other-user-id>"] }
    ```

### Booking Endpoints

- `POST /bookings`  
  - Purpose: Create booking request for renter on a listing.
  - Request:
    ```json
    { "listingId": "<listing-id>", "landlordId": "<landlord-user-id>", "stayYears": 2 }
    ```
  - Response:
    ```json
    { "id": "<booking-id>", "status": "pending", "listing": { "id": "<listing-id>", "title": "Single self contain, Lekki", "city": "Lagos", "state": "Lagos", "address": "Lekki Phase 1", "image": "https://..." }, "rentAmount": 20000, "priceUnit": "year", "checkInBeforeAt": "<date>", "checkedInAt": null, "createdAt": "<date>" }
    ```

- `GET /bookings?status=upcoming|pending|active|cancelled&page=1&limit=10`  
  - Purpose: Fetch renter bookings by tab with pagination.
  - Response:
    ```json
    { "pagination": { "page": 1, "limit": 10, "total": 4, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false }, "bookings": [] }
    ```

- `GET /bookings/:bookingId`  
  - Purpose: Fetch detailed booking page data (map coordinates, landlord card, rules, policy, timelines).
  - Response:
    ```json
    { "id": "<booking-id>", "status": "upcoming", "bookingId": "<booking-id>", "stayYears": 2, "rentAmount": 20000, "serviceFee": 600, "amountPaid": 20600, "checkInBeforeAt": "<date>", "directionsFromLandlord": "Please call me when you arrive at the estate.", "apartmentRules": "Respect neighbors...", "cancellationPolicy": "moderate", "map": { "latitude": 6.4474, "longitude": 3.4723, "city": "Lagos", "state": "Lagos", "address": "Lekki Phase 1" }, "landlord": { "id": "<landlord-id>", "displayName": "Dickson Emmanuel", "profilePhotoUrl": "https://..." } }
    ```

- `GET /bookings/:bookingId/cancel-preview`  
  - Purpose: Show refund preview before cancellation submit.
  - Response:
    ```json
    { "bookingId": "<booking-id>", "totalPaid": 20600, "refundAmount": 20600, "deductedPenalty": 0, "serviceFeeRefund": 600, "estimatedRefundTime": "1-3 business days", "cancellationPolicyApplied": "moderate" }
    ```

- `POST /bookings/:bookingId/cancel`  
  - Purpose: Cancel booking and trigger refund workflow.
  - Request:
    ```json
    { "reason": "I no longer need accommodation", "details": "My plans changed", "attachments": ["https://res.cloudinary.com/.../evidence.png"] }
    ```
  - Response:
    ```json
    { "message": "Booking cancelled successfully", "bookingId": "<booking-id>", "status": "cancelled", "refundAmount": 20600, "refundStatus": "pending" }
    ```

- `POST /bookings/:bookingId/check-in/confirm`  
  - Purpose: Confirm apartment check-in and move booking to active status.
  - Request: none
  - Response:
    ```json
    { "message": "Check-in confirmed", "bookingId": "<booking-id>", "status": "active", "checkedInAt": "<date>" }
    ```

- `POST /bookings/:bookingId/review`  
  - Purpose: Submit post check-in apartment review.
  - Request:
    ```json
    { "rating": 5, "comment": "Smooth check-in and clean apartment." }
    ```
  - Response:
    ```json
    { "message": "Review submitted", "bookingId": "<booking-id>", "review": { "rating": 5, "comment": "Smooth check-in and clean apartment.", "submittedAt": "<date>" } }
    ```

### Realtime Socket Events (Chat)

- Namespace: `/chat`
- Auth: JWT in `auth.token` or `Authorization` header
- Events:
  - client -> `chat:send` (same payload as `POST /chat/messages`)
  - server -> `chat:new_message`
  - client -> `chat:typing` `{ "conversationId": "...", "recipientId": "...", "isTyping": true }`
  - server -> `chat:typing` `{ "conversationId": "...", "senderId": "...", "isTyping": true }`
  - client -> `chat:read` `{ "conversationId": "..." }`
  - server -> `chat:read` `{ "conversationId": "...", "readerId": "..." }`

### Uploads (Cloudinary Signed Upload)

- `POST /uploads/signature`  
  - Purpose: Generate signed Cloudinary upload params for direct client upload.
  - Request:
    ```json
    { "folderType": "profile", "resourceType": "image" }
    ```
    or
    ```json
    { "folderType": "chat", "resourceType": "video", "conversationId": "<conversation-id>" }
    ```
  - Response:
    ```json
    { "cloudName": "<cloud-name>", "apiKey": "<api-key>", "timestamp": 1714232243, "signature": "<signature>", "folder": "homelink/profile/<user-id>", "resourceType": "image" }
    ```
  - Notes:
    - `folderType` values: `profile`, `chat`, `listing`, `misc`
    - `conversationId` is required for `chat`
    - `listingId` is required for `listing`

### Payload rules

- `phoneNumber` must be Nigerian E.164 format: `+234` + 10 digits (example: `+2348012345678`)
- `password` minimum length: 8
- `confirmPassword` must exactly match `password`
- OTP code is exactly 6 digits

### 1) Direct register (no OTP)

`POST /auth/register`

Request:

```json
{
  "phoneNumber": "+2348012345678",
  "password": "secret123",
  "confirmPassword": "secret123"
}
```

Success response:

```json
{
  "access_token": "<jwt>",
  "user": {
    "id": "<user-id>",
    "phoneNumber": "+2348012345678",
    "displayName": null
  }
}
```

Common errors:

- `409` -> `Phone number already registered`
- `400` -> validation errors (invalid phone, weak password, password mismatch)

### 2) Login

`POST /auth/login`

Request:

```json
{
  "phoneNumber": "+2348012345678",
  "password": "secret123"
}
```

Success response:

```json
{
  "access_token": "<jwt>",
  "user": {
    "id": "<user-id>",
    "phoneNumber": "+2348012345678",
    "displayName": null
  }
}
```

Common errors:

- `401` -> `Incorrect phone/password!`
- `400` -> validation errors

### 3) OTP signup flow (recommended production flow)

Step A: request OTP  
`POST /auth/signup/request-otp`

```json
{
  "phoneNumber": "+2348012345678"
}
```

Response:

```json
{
  "message": "OTP sent"
}
```

Step B: verify OTP  
`POST /auth/signup/verify-otp`

```json
{
  "phoneNumber": "+2348012345678",
  "code": "123456"
}
```

Response:

```json
{
  "setupToken": "<jwt>"
}
```

Step C: complete signup  
`POST /auth/signup/complete`

```json
{
  "setupToken": "<jwt>",
  "password": "secret123",
  "confirmPassword": "secret123"
}
```

Response:

```json
{
  "access_token": "<jwt>",
  "user": {
    "id": "<user-id>",
    "phoneNumber": "+2348012345678",
    "displayName": null
  }
}
```

Common errors in OTP signup flow:

- `409` -> phone already registered
- `400` -> `Invalid OTP`
- `400` -> `Invalid or expired setup token`

### 4) Password reset flow

Step A: request reset OTP  
`POST /auth/reset-password/request`  
(`POST /auth/forgot-password` is also available and does the same thing.)

```json
{
  "phoneNumber": "+2348012345678"
}
```

Response:

```json
{
  "message": "OTP sent"
}
```

Step B: verify reset OTP  
`POST /auth/reset-password/verify`

```json
{
  "phoneNumber": "+2348012345678",
  "code": "123456"
}
```

Response:

```json
{
  "resetToken": "<jwt>"
}
```

Step C: complete reset  
`POST /auth/reset-password/complete`

```json
{
  "resetToken": "<jwt>",
  "password": "newsecret123",
  "confirmPassword": "newsecret123"
}
```

Response:

```json
{
  "access_token": "<jwt>",
  "user": {
    "id": "<user-id>",
    "phoneNumber": "+2348012345678",
    "displayName": null
  }
}
```

Common reset errors:

- `404` -> `Phone not registered`
- `400` -> `Invalid OTP`
- `400` -> `Invalid or expired reset token`

### Frontend storage and auth header

- Store `access_token` securely on the client (or in app auth state).
- Send token on protected routes with:
  - `Authorization: Bearer <access_token>`
- On `401`, clear auth state and redirect user to login.

## Profile onboarding endpoints (from mobile flow)

All endpoints below require:

- `Authorization: Bearer <access_token>`

Base route: `{{BASE_URL}}/users`

### Public profile endpoint (landlord + renter)

`GET /users/:userId/profile`

This endpoint automatically returns either a landlord or renter profile based on `profileUseCase`:

- `list` -> `role: "landlord"`
- `rent` -> `role: "renter"`

For landlords, `listings` includes up to 6 latest owned listings (`ownerId`-linked).  
For renters, `listings` is empty by default.

### 1) Fetch profile options for dropdowns/selectors

`GET /users/options`

Returns static options used in the onboarding UI:

- use cases (`rent`, `list`)
- language list
- married / pets choices

### 2) Fetch current profile state

`GET /users/me`

Use this to prefill form state if onboarding is resumed.

### 3) Save selected user intent

`PATCH /users/me/profile-intent`

```json
{
  "useCase": "rent"
}
```

`useCase` values: `rent` | `list`

### 4) Save basic identity section

`PATCH /users/me/basic`

```json
{
  "firstName": "Dickson",
  "lastName": "Emmanuel",
  "email": "emmanuel12@gmail.com"
}
```

### 5) Save profile details section

`PATCH /users/me/details`

```json
{
  "bio": "Loving and caring husband...",
  "occupation": "Graphic Designer",
  "languages": ["English", "Igbo"],
  "address": "Ladipo Phase 1, Lagos State",
  "city": "Lagos",
  "state": "Lagos",
  "country": "Nigeria",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "isMarried": true,
  "hasPets": false,
  "profilePhotoUrl": "https://cdn.example.com/user-photo.jpg"
}
```

You can send partial payloads to update only changed fields.

### 6) Save device/app permission preferences

`PATCH /users/me/preferences`

```json
{
  "notificationsEnabled": true,
  "locationPermissionGranted": true
}
```

### 7) Mark onboarding as completed

`POST /users/me/complete-profile`

Marks `profileCompleted` as `true`.

### 8) Search location suggestions (external geocoding provider)

`GET /users/location/search?query=lekki`

Response items include:

- `address`
- `city`
- `state`
- `country`
- `latitude`
- `longitude`

Provider configuration:

- `LOCATION_PROVIDER=nominatim` (default) or `LOCATION_PROVIDER=google`

When `LOCATION_PROVIDER=nominatim`:

- `LOCATION_SEARCH_API` (defaults to `https://nominatim.openstreetmap.org/search`)

When `LOCATION_PROVIDER=google`:

- `GOOGLE_MAPS_API_KEY` (required)
- `GOOGLE_PLACES_COUNTRY` (default `ng`)
- `GOOGLE_PLACES_LANGUAGE` (default `en`)
- `GOOGLE_PLACES_LIMIT` (default `8`)

If provider is unavailable, API returns an empty array so frontend can gracefully fallback to manual input.

## Explore feed endpoint (after signup/login)

Use this endpoint when renter enters the Explore screen:

- `GET /explore?tab=popular|duplex|self_contain|short_let|shared_space&page=1&limit=10&search=lekki&view=list`
- Requires `Authorization: Bearer <access_token>`

Response includes:

- logged in user context (`displayName`, `firstName`, `city`, `state`)
- current tab (`activeTab`)
- tab-filtered listings near user profile location
- computed `distanceKm` when user latitude/longitude is available
- pagination metadata (`page`, `limit`, `total`, `totalPages`, `hasNextPage`, `hasPrevPage`)
- optional `search` filter (title/address/city/state/type)
- `mapMarkers` output for map view rendering (same query logic, no duplicated endpoint logic)

## Wishlist endpoints

All wishlist endpoints require `Authorization: Bearer <access_token>`.

### Folder operations

- `GET /wishlist/folders` -> list folders with `listingsCount`
- `POST /wishlist/folders` -> create folder
  - body: `{ "name": "Lagos Homes" }`
- `PATCH /wishlist/folders/:folderId` -> rename folder
  - body: `{ "name": "New Name" }`
- `DELETE /wishlist/folders/:folderId` -> delete folder and all folder items

### Folder listings operations

- `GET /wishlist/folders/:folderId/listings?page=1&limit=10` -> paginated listings in a folder
- `POST /wishlist/folders/:folderId/listings` -> save listing into folder
  - body: `{ "listingId": "<listing-id>" }`
- `DELETE /wishlist/folders/:folderId/listings/:listingId` -> remove listing from folder

### Save modal helper

- `GET /wishlist/listings/:listingId/folders`
  - returns all folders with `selected: boolean` so frontend can pre-check folders where the listing is already saved.

## Chat / Inbox (Realtime)

This implementation uses:

- REST API for inbox list + chat history + fallback send
- Socket.IO for realtime delivery (new message, typing, read receipts)

### REST endpoints

All require `Authorization: Bearer <access_token>`.

- `POST /chat/conversations`
  - body: `{ "participantId": "<user-id>", "listingId": "<optional-listing-id>" }`
- `GET /chat/conversations?page=1&limit=20`
- `GET /chat/conversations/:conversationId/messages?page=1&limit=30`
- `POST /chat/messages`
  - body: `{ "conversationId": "<optional>", "recipientId": "<required if no conversationId>", "listingId": "<optional>", "text": "Hello", "attachments": [] }`
- `PATCH /chat/conversations/:conversationId/read`

### Realtime Socket.IO

Socket namespace:

- `/chat`

Connection auth:

- pass JWT as `auth.token` OR `Authorization: Bearer <token>` header.

Socket events:

- client -> `chat:send` (same payload as `POST /chat/messages`)
- server -> `chat:new_message`
- client -> `chat:typing` `{ conversationId, recipientId, isTyping }`
- server -> `chat:typing` `{ conversationId, senderId, isTyping }`
- client -> `chat:read` `{ conversationId }`
- server -> `chat:read` `{ conversationId, readerId }`

Recommended frontend flow:

1. Load inbox with `GET /chat/conversations`
2. Open a thread with `GET /chat/conversations/:id/messages`
3. Connect socket to `/chat` once user is authenticated
4. Send messages using `chat:send` (REST fallback available)
5. Emit `chat:read` when thread opens/focuses

## End-to-end manual test guide (signup -> profile)

Use this flow to test everything from account creation to completed profile.

### 0) Setup

Set local variables:

```bash
BASE_URL="http://localhost:3000"
PHONE="+2348012345678"
PASSWORD="secret123"
```

Start backend:

```bash
yarn start:dev
```

### 1) Signup (OTP flow)

Request OTP:

```bash
curl -X POST "$BASE_URL/auth/signup/request-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"$PHONE\"}"
```

Verify OTP:

```bash
curl -X POST "$BASE_URL/auth/signup/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"$PHONE\",\"code\":\"123456\"}"
```

In development, replace `123456` with the OTP printed in backend logs (`[DEV] Signup OTP ...`).

Copy `setupToken` from response, then complete signup:

```bash
SETUP_TOKEN="<paste-setup-token>"
curl -X POST "$BASE_URL/auth/signup/complete" \
  -H "Content-Type: application/json" \
  -d "{\"setupToken\":\"$SETUP_TOKEN\",\"password\":\"$PASSWORD\",\"confirmPassword\":\"$PASSWORD\"}"
```

Copy `access_token` from response.

### 2) Login

```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"$PHONE\",\"password\":\"$PASSWORD\"}"
```

Copy `access_token`:

```bash
TOKEN="<paste-access-token>"
```

### 3) Profile onboarding APIs

Fetch options:

```bash
curl "$BASE_URL/users/options" \
  -H "Authorization: Bearer $TOKEN"
```

Save profile intent:

```bash
curl -X PATCH "$BASE_URL/users/me/profile-intent" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"useCase":"rent"}'
```

Save basic profile:

```bash
curl -X PATCH "$BASE_URL/users/me/basic" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Dickson","lastName":"Emmanuel","email":"emmanuel12@gmail.com"}'
```

Search location:

```bash
curl "$BASE_URL/users/location/search?query=lekki" \
  -H "Authorization: Bearer $TOKEN"
```

Save profile details:

```bash
curl -X PATCH "$BASE_URL/users/me/details" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio":"Loving and caring","occupation":"Graphic Designer","languages":["English","Igbo"],"address":"Lekki, Lagos","city":"Lagos","state":"Lagos","country":"Nigeria","latitude":6.4474,"longitude":3.4723,"isMarried":true,"hasPets":false,"profilePhotoUrl":"https://cdn.example.com/user.jpg"}'
```

Save preferences:

```bash
curl -X PATCH "$BASE_URL/users/me/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notificationsEnabled":true,"locationPermissionGranted":true}'
```

Complete onboarding:

```bash
curl -X POST "$BASE_URL/users/me/complete-profile" \
  -H "Authorization: Bearer $TOKEN"
```

Final profile check:

```bash
curl "$BASE_URL/users/me" \
  -H "Authorization: Bearer $TOKEN"
```

Expected final checks:

- `profileCompleted` is `true`
- `useCase`, `firstName`, `lastName`, `email` are set
- `location` and `preferences` reflect submitted values
- endpoint returns `401` when token is missing/invalid

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
