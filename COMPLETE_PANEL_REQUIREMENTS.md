# Voice Agent Control Panel - Complete Requirements Document

**Version:** 1.0  
**Date:** 2025-01-XX  
**Document Type:** Technical Requirements Specification

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Section-Wise Requirements](#section-wise-requirements)
4. [API Requirements Summary](#api-requirements-summary)
5. [Complete API Reference](#complete-api-reference)
6. [Working Flow Requirements](#working-flow-requirements)
7. [Data Models](#data-models)
8. [Integration Requirements](#integration-requirements)

---

## Executive Summary

This document outlines the complete technical requirements for the Voice Agent Control Panel, including all API endpoints, data structures, and functional workflows required to support the full UI implementation.

### Key Features
- **Dashboard Overview**: Real-time metrics, analytics, and performance monitoring
- **Project Training**: AI model training with document uploads and call flow configuration
- **Campaign Management**: Create and manage inbound/outbound voice campaigns
- **Call Management**: View logs, details, transcripts, and analytics
- **API Integration**: Webhooks and REST APIs for CRM synchronization
- **Wallet Management**: Credit top-up and billing management

### Technology Stack
- **Frontend**: React.js with Vite
- **Backend**: RESTful API (to be implemented)
- **Authentication**: Bearer Token / API Key
- **Data Format**: JSON

---

## System Overview

### Architecture Flow

```
User Interface (React)
    ↓
API Gateway / Backend Services
    ↓
Database / Storage
    ↓
External Services (Voice AI, Payment Gateway, etc.)
```

### Core Modules

1. **Authentication & Authorization Module**
2. **Dashboard & Analytics Module**
3. **Project Training Module**
4. **Campaign Management Module**
5. **Call Management Module**
6. **API & Webhook Module**
7. **Wallet & Billing Module**

---

## Section-Wise Requirements

### 1. Dashboard Overview

#### 1.1 Functional Requirements

| Requirement ID | Description | Priority |
|---------------|-------------|----------|
| DASH-001 | Display total inbound calls with time range filters (total/weekly/monthly/custom) | High |
| DASH-002 | Display inbound minutes consumed | High |
| DASH-003 | Calculate and display average call time | High |
| DASH-004 | Display total spend in INR with breakdown | High |
| DASH-005 | Show positive dispositions count and percentage | High |
| DASH-006 | Calculate average AI cost per positive disposition | High |
| DASH-007 | Display disposition trends (positive/neutral/negative) with week-over-week comparison | Medium |
| DASH-008 | Show cost allocation breakdown (inbound/outbound minutes, AI training, infrastructure) | Medium |
| DASH-009 | Export dashboard data as report (PDF/Excel) | Low |
| DASH-010 | Apply custom date range filters | Medium |

#### 1.2 API Requirements

| API Endpoint | Method | Purpose | Priority |
|-------------|--------|---------|----------|
| `/api/dashboard/overview` | GET | Fetch dashboard metrics | High |
| `/api/dashboard/metrics` | GET | Get time-range specific metrics | High |
| `/api/dashboard/dispositions` | GET | Get disposition trends | Medium |
| `/api/dashboard/cost-allocation` | GET | Get cost breakdown | Medium |
| `/api/dashboard/export` | POST | Export dashboard report | Low |

#### 1.3 Data Requirements

- Real-time call statistics
- Historical data aggregation
- Cost calculation per call/minute
- Disposition categorization
- Time-series data for trends

---

### 2. Project Training

#### 2.1 Functional Requirements

| Requirement ID | Description | Priority |
|---------------|-------------|----------|
| PROJ-001 | Create new project with name and description | High |
| PROJ-002 | Upload PDF documents for training data | High |
| PROJ-003 | Paste project links (Google Docs, etc.) | High |
| PROJ-004 | Configure inbound call flow (step-by-step) | High |
| PROJ-005 | Configure outbound call flow (step-by-step) | High |
| PROJ-006 | Select and order default languages (max 4) | High |
| PROJ-007 | Define successful disposition types | Medium |
| PROJ-008 | Save project configuration | High |
| PROJ-009 | Edit existing project | High |
| PROJ-010 | Delete project | Medium |
| PROJ-011 | List all saved projects | High |
| PROJ-012 | Generate AI pitch using GPT-5 | Medium |

#### 2.2 API Requirements

| API Endpoint | Method | Purpose | Priority |
|-------------|--------|---------|----------|
| `/api/projects` | POST | Create new project | High |
| `/api/projects` | GET | List all projects | High |
| `/api/projects/:id` | GET | Get project details | High |
| `/api/projects/:id` | PUT | Update project | High |
| `/api/projects/:id` | DELETE | Delete project | Medium |
| `/api/projects/:id/upload` | POST | Upload training documents | High |
| `/api/projects/:id/generate-pitch` | POST | Generate AI pitch | Medium |

#### 2.3 Data Requirements

- Project metadata (name, description, created date)
- Training documents (PDFs, links)
- Call flow configurations (inbound/outbound)
- Language preferences with ordering
- Disposition definitions
- AI-generated pitch content

---

### 3. Campaign Management

#### 3.1 Functional Requirements

| Requirement ID | Description | Priority |
|---------------|-------------|----------|
| CAMP-001 | Create incoming campaign | High |
| CAMP-002 | Create outgoing campaign | High |
| CAMP-003 | List campaigns by type (incoming/outgoing) | High |
| CAMP-004 | View campaign details | High |
| CAMP-005 | Update campaign configuration | High |
| CAMP-006 | Toggle campaign status (active/paused) | High |
| CAMP-007 | Delete campaign | Medium |
| CAMP-008 | Assign DID number to incoming campaign | High |
| CAMP-009 | Configure call schedule (time, days) | Medium |
| CAMP-010 | Set maximum calls per day | Medium |
| CAMP-011 | Configure voice agent settings | High |
| CAMP-012 | Set lead qualification criteria | Medium |
| CAMP-013 | Configure CRM integration and webhooks | Medium |
| CAMP-014 | View campaign statistics | High |

#### 3.2 API Requirements

| API Endpoint | Method | Purpose | Priority |
|-------------|--------|---------|----------|
| `/api/campaigns` | POST | Create campaign | High |
| `/api/campaigns` | GET | List campaigns (with filters) | High |
| `/api/campaigns/:id` | GET | Get campaign details | High |
| `/api/campaigns/:id` | PUT | Update campaign | High |
| `/api/campaigns/:id` | DELETE | Delete campaign | Medium |
| `/api/campaigns/:id/status` | PATCH | Update campaign status | High |
| `/api/campaigns/:id/statistics` | GET | Get campaign stats | High |
| `/api/campaigns/:id/did` | POST | Assign DID number | High |

#### 3.3 Data Requirements

- Campaign basic info (name, category, description, type, status)
- Call settings (schedule, timezone, max calls)
- Voice agent configuration
- Lead qualification settings
- Integration settings (webhooks, CRM)
- Campaign statistics (calls, success rate, duration)

---

### 4. Call Logs

#### 4.1 Functional Requirements

| Requirement ID | Description | Priority |
|---------------|-------------|----------|
| CALL-001 | View call logs for a campaign | High |
| CALL-002 | Filter calls by date range (today/yesterday/last 7/15/30 days/custom) | High |
| CALL-003 | Filter calls by status (completed/no-answer/busy) | Medium |
| CALL-004 | View call details (phone, date, time, duration, spend) | High |
| CALL-005 | View call disposition type | High |
| CALL-006 | View recommended action | Medium |
| CALL-007 | Download call logs as XLSX | Medium |
| CALL-008 | Paginate call logs | High |
| CALL-009 | View allocated DID number for campaign | High |

#### 4.2 API Requirements

| API Endpoint | Method | Purpose | Priority |
|-------------|--------|---------|----------|
| `/api/campaigns/:id/calls` | GET | Get call logs with filters | High |
| `/api/calls/:id` | GET | Get call details | High |
| `/api/campaigns/:id/calls/export` | GET | Export call logs | Medium |

#### 4.3 Data Requirements

- Call ID, phone number, date, time
- Call duration, status, spend
- Disposition type, lead qualification
- Recommended action
- Pagination metadata

---

### 5. Call Details

#### 5.1 Functional Requirements

| Requirement ID | Description | Priority |
|---------------|-------------|----------|
| CDET-001 | View complete call overview | High |
| CDET-002 | Play call recording | High |
| CDET-003 | View full call transcript | High |
| CDET-004 | Download transcript as PDF | Medium |
| CDET-005 | View conversation summary | High |
| CDET-006 | View extracted keywords (budget, location, bedrooms, property type, move-in date, intent) | High |
| CDET-007 | View amenities mentioned | Medium |
| CDET-008 | View lead qualification result | High |
| CDET-009 | View sentiment analysis | Medium |
| CDET-010 | View next action recommendation | Medium |
| CDET-011 | View campaign context | Low |

#### 5.2 API Requirements

| API Endpoint | Method | Purpose | Priority |
|-------------|--------|---------|----------|
| `/api/calls/:id` | GET | Get complete call details | High |
| `/api/calls/:id/transcript` | GET | Get call transcript | High |
| `/api/calls/:id/transcript/pdf` | GET | Download transcript PDF | Medium |
| `/api/calls/:id/recording` | GET | Get call recording URL | High |
| `/api/calls/:id/keywords` | GET | Get extracted keywords | High |
| `/api/calls/:id/summary` | GET | Get conversation summary | High |

#### 5.3 Data Requirements

- Complete call metadata
- Full transcript text
- Recording file URL (signed URL)
- Extracted keywords object
- Conversation summary
- Lead qualification data
- Sentiment analysis result
- Next action recommendation

---

### 6. API Documentation

#### 6.1 Functional Requirements

| Requirement ID | Description | Priority |
|---------------|-------------|----------|
| API-001 | Display API authentication methods | High |
| API-002 | Show API key management | High |
| API-003 | Display webhook endpoints (inbound/outbound/events) | High |
| API-004 | Show REST API endpoints | High |
| API-005 | Display request/response examples | Medium |
| API-006 | Copy API key functionality | Medium |
| API-007 | Show security features (HMAC, IP allowlisting) | Medium |
| API-008 | Display regional endpoints | Low |

#### 6.2 API Requirements

| API Endpoint | Method | Purpose | Priority |
|-------------|--------|---------|----------|
| `/api/auth/keys` | GET | List API keys | High |
| `/api/auth/keys` | POST | Generate new API key | High |
| `/api/auth/keys/:id` | DELETE | Revoke API key | High |
| `/api/webhooks` | GET | List webhook configurations | Medium |
| `/api/webhooks` | POST | Create webhook | Medium |

#### 6.3 Data Requirements

- API key information (masked)
- Webhook configurations
- Endpoint documentation
- Authentication methods
- Security settings

---

### 7. Wallet Top-Up

#### 7.1 Functional Requirements

| Requirement ID | Description | Priority |
|---------------|-------------|----------|
| WALL-001 | View current wallet balance | High |
| WALL-002 | View average daily spend | High |
| WALL-003 | View auto-top-up settings | Medium |
| WALL-004 | Select preset top-up amounts | High |
| WALL-005 | Enter custom top-up amount | High |
| WALL-006 | Select payment method | High |
| WALL-007 | Process payment and add credits | High |
| WALL-008 | View bonus minutes eligibility | Low |
| WALL-009 | Enable/disable auto-top-up | Medium |
| WALL-010 | View transaction history | Medium |

#### 7.2 API Requirements

| API Endpoint | Method | Purpose | Priority |
|-------------|--------|---------|----------|
| `/api/wallet/balance` | GET | Get current balance | High |
| `/api/wallet/spend` | GET | Get spending statistics | High |
| `/api/wallet/topup` | POST | Initiate top-up | High |
| `/api/wallet/payment-methods` | GET | List payment methods | High |
| `/api/wallet/payment-methods` | POST | Add payment method | High |
| `/api/wallet/auto-topup` | GET | Get auto-topup settings | Medium |
| `/api/wallet/auto-topup` | PUT | Update auto-topup settings | Medium |
| `/api/wallet/transactions` | GET | Get transaction history | Medium |

#### 7.3 Data Requirements

- Current wallet balance
- Daily/weekly/monthly spend
- Auto-topup configuration
- Payment method details
- Transaction history
- Bonus credits information

---

## API Requirements Summary

### Complete API List

| Category | Endpoint | Method | Priority | Section |
|----------|----------|--------|----------|---------|
| **Authentication** | `/api/auth/login` | POST | High | All |
| | `/api/auth/refresh` | POST | High | All |
| | `/api/auth/keys` | GET | High | API Docs |
| | `/api/auth/keys` | POST | High | API Docs |
| | `/api/auth/keys/:id` | DELETE | High | API Docs |
| **Dashboard** | `/api/dashboard/overview` | GET | High | Dashboard |
| | `/api/dashboard/metrics` | GET | High | Dashboard |
| | `/api/dashboard/dispositions` | GET | Medium | Dashboard |
| | `/api/dashboard/cost-allocation` | GET | Medium | Dashboard |
| | `/api/dashboard/export` | POST | Low | Dashboard |
| **Projects** | `/api/projects` | GET | High | Training |
| | `/api/projects` | POST | High | Training |
| | `/api/projects/:id` | GET | High | Training |
| | `/api/projects/:id` | PUT | High | Training |
| | `/api/projects/:id` | DELETE | Medium | Training |
| | `/api/projects/:id/upload` | POST | High | Training |
| | `/api/projects/:id/generate-pitch` | POST | Medium | Training |
| **Campaigns** | `/api/campaigns` | GET | High | Campaigns |
| | `/api/campaigns` | POST | High | Campaigns |
| | `/api/campaigns/:id` | GET | High | Campaigns |
| | `/api/campaigns/:id` | PUT | High | Campaigns |
| | `/api/campaigns/:id` | DELETE | Medium | Campaigns |
| | `/api/campaigns/:id/status` | PATCH | High | Campaigns |
| | `/api/campaigns/:id/statistics` | GET | High | Campaigns |
| | `/api/campaigns/:id/did` | POST | High | Campaigns |
| **Calls** | `/api/campaigns/:id/calls` | GET | High | Call Logs |
| | `/api/calls/:id` | GET | High | Call Details |
| | `/api/calls/:id/transcript` | GET | High | Call Details |
| | `/api/calls/:id/transcript/pdf` | GET | Medium | Call Details |
| | `/api/calls/:id/recording` | GET | High | Call Details |
| | `/api/calls/:id/keywords` | GET | High | Call Details |
| | `/api/calls/:id/summary` | GET | High | Call Details |
| | `/api/campaigns/:id/calls/export` | GET | Medium | Call Logs |
| **Wallet** | `/api/wallet/balance` | GET | High | Wallet |
| | `/api/wallet/spend` | GET | High | Wallet |
| | `/api/wallet/topup` | POST | High | Wallet |
| | `/api/wallet/payment-methods` | GET | High | Wallet |
| | `/api/wallet/payment-methods` | POST | High | Wallet |
| | `/api/wallet/auto-topup` | GET | Medium | Wallet |
| | `/api/wallet/auto-topup` | PUT | Medium | Wallet |
| | `/api/wallet/transactions` | GET | Medium | Wallet |
| **Webhooks** | `/api/webhooks` | GET | Medium | API Docs |
| | `/api/webhooks` | POST | Medium | API Docs |
| | `/api/webhooks/:id` | PUT | Medium | API Docs |
| | `/api/webhooks/:id` | DELETE | Medium | API Docs |

**Total APIs: 42 endpoints**

---

## Complete API Reference

### Authentication APIs

#### POST `/api/auth/login`
**Purpose:** User authentication  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST `/api/auth/refresh`
**Purpose:** Refresh access token  
**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

---

### Dashboard APIs

#### GET `/api/dashboard/overview`
**Purpose:** Get dashboard overview metrics  
**Query Parameters:**
- `range`: `total` | `weekly` | `monthly` | `custom`
- `startDate`: ISO date (required if range=custom)
- `endDate`: ISO date (required if range=custom)

**Response:**
```json
{
  "inboundCalls": "4,215",
  "inboundMinutes": "11,420",
  "avgCallTime": "03:05",
  "totalSpend": "₹ 2,48,900",
  "positiveDispositions": "2,890",
  "avgCostPerDisposition": "₹ 86"
}
```

#### GET `/api/dashboard/dispositions`
**Purpose:** Get disposition trends  
**Response:**
```json
{
  "positive": {
    "percentage": 62,
    "trend": "+4.1%"
  },
  "neutral": {
    "percentage": 21,
    "trend": "-1.8%"
  },
  "negative": {
    "percentage": 17,
    "trend": "-0.6%"
  }
}
```

#### GET `/api/dashboard/cost-allocation`
**Purpose:** Get cost breakdown  
**Response:**
```json
{
  "inboundMinutes": {
    "amount": "₹ 1,02,400",
    "share": "41%"
  },
  "outboundMinutes": {
    "amount": "₹ 88,500",
    "share": "35%"
  },
  "aiTraining": {
    "amount": "₹ 33,250",
    "share": "13%"
  },
  "infrastructure": {
    "amount": "₹ 24,750",
    "share": "11%"
  }
}
```

---

### Project Training APIs

#### POST `/api/projects`
**Purpose:** Create new project  
**Request Body:**
```json
{
  "name": "Premium Properties",
  "link": "https://docs.google.com/...",
  "callFlowInbound": "Step 1: Greeting\nStep 2: Qualify...",
  "callFlowOutbound": "Step 1: Warm intro\nStep 2: Reference...",
  "defaultLanguages": [
    {"value": "hinglish", "order": 1},
    {"value": "english", "order": 2}
  ],
  "successfulDisposition": ["Exchange Number", "Connect Sales"],
  "notes": "Training data notes..."
}
```

#### POST `/api/projects/:id/upload`
**Purpose:** Upload training documents  
**Request:** Multipart form data with PDF file  
**Response:**
```json
{
  "fileId": "file123",
  "fileName": "training.pdf",
  "uploadedAt": "2025-01-15T10:30:00Z"
}
```

---

### Campaign APIs

#### POST `/api/campaigns`
**Purpose:** Create campaign  
**Request Body:** (See BACKEND_API_REQUIREMENTS.txt for complete structure)

**Key Fields:**
- `name`, `category`, `description`, `campaignType`, `status`
- `startDate`, `endDate`, `maxCallsPerDay`, `timeZone`
- `callSchedule`: `{enabled, startTime, endTime, daysOfWeek}`
- `voiceAgentSettings`: `{agentName, language, voiceType, greetingMessage, fallbackMessage}`
- `leadQualification`: `{enabled, requiredFields, qualificationCriteria}`
- `integrationSettings`: `{crmIntegration, webhookUrl, autoAssign}`

#### PATCH `/api/campaigns/:id/status`
**Purpose:** Update campaign status  
**Request Body:**
```json
{
  "status": "active" | "paused"
}
```

#### POST `/api/campaigns/:id/did`
**Purpose:** Assign DID number to incoming campaign  
**Request Body:**
```json
{
  "didNumber": "+15551234567"
}
```

---

### Call APIs

#### GET `/api/campaigns/:id/calls`
**Purpose:** Get call logs with filters  
**Query Parameters:**
- `page`: integer (default: 1)
- `limit`: integer (default: 20)
- `status`: `completed` | `no-answer` | `busy` | `failed`
- `dateFrom`: ISO date
- `dateTo`: ISO date
- `filter`: `today` | `yesterday` | `last7` | `last15` | `last30` | `custom`

**Response:**
```json
{
  "calls": [
    {
      "id": "CALL001",
      "phoneNumber": "+15551234567",
      "date": "2025-01-15",
      "time": "09:15 AM",
      "duration": "5:23",
      "status": "completed",
      "spendInr": 7.26,
      "dispositionType": "Successful",
      "recommendedAction": "Schedule viewing",
      "leadQualification": "show-project"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### GET `/api/calls/:id`
**Purpose:** Get complete call details  
**Response:**
```json
{
  "id": "CALL001",
  "phoneNumber": "+15551234567",
  "date": "2025-01-15",
  "time": "09:15 AM",
  "duration": "5:23",
  "status": "completed",
  "recordingUrl": "https://storage.example.com/recordings/call001.mp3",
  "transcript": "Full transcript text...",
  "transcriptionSummary": "Customer interested in 3BHK property...",
  "keywords": {
    "budget": "$800,000 - $1,000,000",
    "location": "Downtown Manhattan",
    "bedrooms": "3 BHK",
    "propertyType": "Apartment",
    "moveInDate": "Within 3 months",
    "intent": "High - Ready to view",
    "amenities": "Parking, Gym, Pool"
  },
  "leadQualification": "show-project",
  "sentiment": "positive",
  "nextAction": "Schedule viewing this weekend",
  "campaign": {
    "id": "INC001",
    "name": "Property Inquiry - Premium"
  }
}
```

#### GET `/api/calls/:id/transcript/pdf`
**Purpose:** Download transcript as PDF  
**Response:** PDF file download

---

### Wallet APIs

#### GET `/api/wallet/balance`
**Purpose:** Get wallet balance and stats  
**Response:**
```json
{
  "currentBalance": 18900,
  "estimatedMinutes": 5400,
  "avgDailySpend": 6200,
  "autoTopup": {
    "enabled": true,
    "threshold": 10000
  }
}
```

#### POST `/api/wallet/topup`
**Purpose:** Initiate wallet top-up  
**Request Body:**
```json
{
  "amount": 10000,
  "paymentMethodId": "pm_123456"
}
```
**Response:**
```json
{
  "transactionId": "txn_123456",
  "amount": 10000,
  "status": "processing",
  "paymentUrl": "https://payment.example.com/checkout/..."
}
```

---

## Working Flow Requirements

### Flow 1: Create and Manage Campaign

```
1. User navigates to Campaigns section
2. Selects campaign type (Incoming/Outgoing)
3. Clicks "Create Campaign"
4. Fills form:
   - Basic Information (name, category, description)
   - Call Settings (schedule, timezone, max calls)
   - Voice Agent Settings (name, language, voice type)
   - Lead Qualification Settings
   - Integration Settings (webhooks, CRM)
5. Submits form → POST /api/campaigns
6. Backend validates and creates campaign
7. For incoming campaigns: Assign DID number → POST /api/campaigns/:id/did
8. Campaign appears in list → GET /api/campaigns?type=incoming
9. User can toggle status → PATCH /api/campaigns/:id/status
10. View statistics → GET /api/campaigns/:id/statistics
```

### Flow 2: View Call Logs and Details

```
1. User selects campaign from list
2. System loads call logs → GET /api/campaigns/:id/calls
3. User applies filters (date range, status)
4. System fetches filtered calls → GET /api/campaigns/:id/calls?filter=today
5. User clicks on a call
6. System loads call details → GET /api/calls/:id
7. System loads transcript → GET /api/calls/:id/transcript
8. System loads keywords → GET /api/calls/:id/keywords
9. System loads summary → GET /api/calls/:id/summary
10. User can download transcript → GET /api/calls/:id/transcript/pdf
11. User can play recording → GET /api/calls/:id/recording
```

### Flow 3: Project Training Setup

```
1. User navigates to Project Training
2. Creates new project → POST /api/projects
3. Uploads training PDF → POST /api/projects/:id/upload
4. Pastes project link
5. Configures inbound call flow
6. Configures outbound call flow
7. Selects languages (max 4) with ordering
8. Defines successful dispositions
9. Saves project → PUT /api/projects/:id
10. Optionally generates AI pitch → POST /api/projects/:id/generate-pitch
11. Project is available for campaign creation
```

### Flow 4: Dashboard Monitoring

```
1. User navigates to Dashboard Overview
2. System loads overview → GET /api/dashboard/overview?range=total
3. User selects time range (weekly/monthly/custom)
4. System fetches metrics → GET /api/dashboard/metrics?range=weekly
5. System loads disposition trends → GET /api/dashboard/dispositions
6. System loads cost allocation → GET /api/dashboard/cost-allocation
7. User exports report → POST /api/dashboard/export
```

### Flow 5: Wallet Top-Up

```
1. User navigates to Wallet Top-Up
2. System loads balance → GET /api/wallet/balance
3. System loads spend stats → GET /api/wallet/spend
4. User selects preset amount or enters custom
5. System loads payment methods → GET /api/wallet/payment-methods
6. User initiates top-up → POST /api/wallet/topup
7. System redirects to payment gateway
8. Payment processed
9. Wallet balance updated
10. Transaction recorded → GET /api/wallet/transactions
```

### Flow 6: Webhook Integration

```
1. User configures webhook in campaign → PUT /api/campaigns/:id
2. Backend validates webhook URL
3. When call event occurs:
   - Call started → POST to webhook (call.started)
   - Call completed → POST to webhook (call.completed)
   - Lead qualified → POST to webhook (lead.qualified)
   - Status changed → POST to webhook (campaign.status.changed)
4. Webhook includes HMAC signature for security
5. External system processes webhook
```

---

## Data Models

### Campaign Model

```json
{
  "id": "INC001",
  "name": "Property Inquiry - Premium",
  "category": "Property Inquiry",
  "description": "Handle incoming property inquiries",
  "campaignType": "incoming",
  "status": "active",
  "createdDate": "2025-01-15",
  "totalCalls": 150,
  "successfulCalls": 95,
  "avgDuration": "5:23",
  "allocatedDid": "+15551234567",
  "config": {
    "startDate": "2025-01-15",
    "endDate": "2025-12-31",
    "timeZone": "America/New_York",
    "maxCallsPerDay": 100,
    "callSchedule": {
      "enabled": true,
      "startTime": "09:00",
      "endTime": "17:00",
      "daysOfWeek": ["monday", "tuesday", "wednesday", "thursday", "friday"]
    },
    "voiceAgentSettings": {
      "agentName": "Sarah",
      "language": "en-US",
      "voiceType": "neural",
      "greetingMessage": "Hello, thank you for calling...",
      "fallbackMessage": "I'm sorry, I didn't catch that..."
    },
    "leadQualification": {
      "enabled": true,
      "requiredFields": ["budget", "location"],
      "qualificationCriteria": "Budget over $500K"
    },
    "integrationSettings": {
      "crmIntegration": true,
      "webhookUrl": "https://crm.example.com/webhook",
      "autoAssign": false
    }
  }
}
```

### Call Model

```json
{
  "id": "CALL001",
  "campaignId": "INC001",
  "phoneNumber": "+15551234567",
  "date": "2025-01-15",
  "time": "09:15 AM",
  "duration": "5:23",
  "status": "completed",
  "spendInr": 7.26,
  "recordingUrl": "https://storage.example.com/recordings/call001.mp3",
  "transcript": "Full conversation transcript...",
  "transcriptionSummary": "Customer interested in 3BHK property...",
  "keywords": {
    "budget": "$800,000 - $1,000,000",
    "location": "Downtown Manhattan",
    "bedrooms": "3 BHK",
    "propertyType": "Apartment",
    "moveInDate": "Within 3 months",
    "intent": "High - Ready to view",
    "amenities": "Parking, Gym, Pool"
  },
  "leadQualification": "show-project",
  "dispositionType": "Successful",
  "sentiment": "positive",
  "nextAction": "Schedule viewing this weekend",
  "recommendedAction": "Schedule viewing",
  "createdAt": "2025-01-15T09:15:00Z"
}
```

### Project Model

```json
{
  "id": "proj_123",
  "name": "Premium Properties",
  "link": "https://docs.google.com/...",
  "callFlowInbound": "Step 1: Greeting\nStep 2: Qualify...",
  "callFlowOutbound": "Step 1: Warm intro\nStep 2: Reference...",
  "defaultLanguages": [
    {"value": "hinglish", "order": 1, "label": "Hinglish"},
    {"value": "english", "order": 2, "label": "English"}
  ],
  "successfulDisposition": ["Exchange Number", "Connect Sales"],
  "notes": "Training data notes...",
  "files": [
    {
      "fileId": "file123",
      "fileName": "training.pdf",
      "uploadedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

---

## Integration Requirements

### Webhook Events

#### Event: `call.started`
**Trigger:** When a call is initiated  
**Payload:**
```json
{
  "event": "call.started",
  "campaignId": "INC001",
  "callId": "CALL001",
  "phoneNumber": "+15551234567",
  "timestamp": "2025-01-15T09:15:00Z"
}
```

#### Event: `call.completed`
**Trigger:** When a call ends  
**Payload:**
```json
{
  "event": "call.completed",
  "campaignId": "INC001",
  "callId": "CALL001",
  "phoneNumber": "+15551234567",
  "duration": "5:23",
  "status": "completed",
  "transcript": "Full transcript...",
  "spendInr": 7.26,
  "timestamp": "2025-01-15T09:20:23Z"
}
```

#### Event: `lead.qualified`
**Trigger:** When a lead is qualified  
**Payload:**
```json
{
  "event": "lead.qualified",
  "campaignId": "INC001",
  "callId": "CALL001",
  "phoneNumber": "+15551234567",
  "qualification": "show-project",
  "keywords": {
    "budget": "$800,000 - $1,000,000",
    "location": "Downtown Manhattan"
  },
  "timestamp": "2025-01-15T09:20:23Z"
}
```

#### Event: `campaign.status.changed`
**Trigger:** When campaign status changes  
**Payload:**
```json
{
  "event": "campaign.status.changed",
  "campaignId": "INC001",
  "oldStatus": "active",
  "newStatus": "paused",
  "timestamp": "2025-01-15T10:00:00Z"
}
```

### Webhook Security

- **HMAC Signature:** SHA-256 HMAC of payload with secret key
- **Timestamp:** Include timestamp in payload to prevent replay attacks
- **IP Allowlisting:** Optional IP-based access control
- **HTTPS Only:** All webhook URLs must use HTTPS

### External API Integration

#### Outbound Lead Injection
**Endpoint:** `POST /api/campaigns/:id/calls`  
**Purpose:** Inject leads for outbound dialer  
**Request:**
```json
{
  "phoneNumbers": [
    "+15551234567",
    "+15551234568"
  ],
  "metadata": {
    "source": "CRM",
    "batchId": "batch123"
  }
}
```

---

## Summary Requirements by Category

### Authentication & Security
- Bearer token authentication
- API key management
- HMAC webhook signatures
- IP allowlisting
- Role-based access control

### Dashboard & Analytics
- Real-time metrics aggregation
- Time-range filtering
- Cost allocation tracking
- Disposition trend analysis
- Export functionality

### Project Training
- Document upload (PDF)
- Link-based training data
- Call flow configuration
- Multi-language support (max 4)
- AI pitch generation

### Campaign Management
- Full CRUD operations
- Status management (active/paused)
- DID number assignment
- Schedule configuration
- Voice agent settings
- Lead qualification rules
- CRM integration

### Call Management
- Call log listing with filters
- Detailed call information
- Transcript storage and retrieval
- Recording playback
- Keyword extraction
- Sentiment analysis
- Lead qualification tracking

### Wallet & Billing
- Balance tracking
- Top-up processing
- Payment method management
- Auto-topup configuration
- Transaction history
- Spend analytics

### API & Webhooks
- RESTful API endpoints
- Webhook event system
- API documentation
- Authentication management
- Security features

---

## Technical Specifications

### API Standards
- **Base URL:** `https://api.voice-agent.ai`
- **Version:** `/v1`
- **Content-Type:** `application/json`
- **Authentication:** `Authorization: Bearer <token>`
- **Rate Limiting:** 1000 requests/hour per API key

### Response Format
**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  }
}
```

### Pagination
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Date/Time Format
- **Dates:** ISO 8601 (YYYY-MM-DD)
- **Timestamps:** ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
- **Time:** HH:MM (24-hour) or HH:MM AM/PM (12-hour)

---

## Non-Functional Requirements

### Performance
- API response time: < 200ms (p95)
- Dashboard load time: < 2 seconds
- File upload: Support up to 50MB PDFs
- Pagination: Default 20 items, max 100

### Scalability
- Support 10,000+ concurrent campaigns
- Handle 1M+ calls per month
- Real-time webhook delivery (< 5 seconds)

### Security
- HTTPS only
- Token expiration: 1 hour (access), 30 days (refresh)
- Password requirements: Min 8 chars, alphanumeric + special
- Webhook HMAC validation mandatory

### Availability
- Uptime: 99.9%
- Database backup: Daily
- Disaster recovery: RTO < 4 hours

---

## Appendix

### A. Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_REQUIRED` | Authentication required | 401 |
| `AUTH_INVALID` | Invalid credentials | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Request validation failed | 400 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `SERVER_ERROR` | Internal server error | 500 |

### B. Status Values

**Campaign Status:**
- `active` - Campaign is running
- `paused` - Campaign is paused

**Call Status:**
- `completed` - Call completed successfully
- `no-answer` - No answer from recipient
- `busy` - Line was busy
- `failed` - Call failed

**Lead Qualification:**
- `show-project` - Qualified for project showing
- `callback` - Requires callback
- `not-interested` - Not interested
- `follow-up` - Needs follow-up

### C. Supported Languages

- Hinglish
- English
- Gujarati
- Marathi
- Kannada
- Tamil
- Telugu
- Bangla

---

**Document End**

