# Voice Agent Panel - Usage Guide

## 🚀 Quick Start

```bash
npm install
npm run dev
```

The application will be available at: **http://localhost:3000**

## 📋 Features Overview

### 1. **Dashboard** (Home Screen)
- Overview statistics: Total campaigns, calls, success rate, average duration
- Two main campaign types:
  - **Incoming Campaigns** (Green theme)
  - **Outgoing Campaigns** (Blue theme)
- Click on any campaign type to view its campaigns

### 2. **Campaign List**
- View all campaigns for the selected type
- Each campaign shows:
  - Campaign name and status (Active/Paused)
  - Campaign ID and creation date
  - Total calls, successful calls, success rate, average duration
- Click on any campaign to view its call logs

### 3. **Call Logs**
- Detailed table view of all calls in the campaign
- Information displayed:
  - Call ID
  - Phone number
  - Date & time
  - Duration
  - Status (Completed, No Answer, Busy)
  - Lead qualification (Show Project, Callback Required)
  - Location
- Summary cards showing campaign statistics
- Click on any call to view detailed information

### 4. **Call Details** (Most Detailed View)
Contains three main sections:

#### Main Content (Left Side):
1. **Call Overview**
   - Phone number
   - Date & time
   - Duration
   - Status badge
   - Voice recording player interface

2. **Lead Information & Keywords**
   - Budget
   - Location
   - Number of bedrooms
   - Property type
   - Move-in date
   - Intent level
   - Additional amenities

3. **Call Transcript**
   - Complete conversation between agent and customer

#### Sidebar (Right Side):
1. **Lead Qualification**
   - Type (Show Project / Arrange Callback)
   - Sentiment (Positive / Neutral / Negative)

2. **Next Action**
   - Recommended follow-up action

3. **Campaign Information**
   - Campaign name, ID, and type

4. **Quick Stats**
   - Call duration vs campaign average
   - Performance indicator

## 🎨 Design Features

- **Professional Color Scheme**: Blue and gray tones with accent colors
- **Small Font Sizes**: Professional, compact design
- **No UI Bugs**: Clean alignment and spacing
- **Responsive Layout**: Works on different screen sizes
- **Icon System**: Lucide React icons throughout
- **Badge System**: Color-coded status indicators
- **Hover Effects**: Interactive feedback on clickable elements

## 🔄 Navigation

- **Back Button** (←): Go to previous view
- **Home Button** (🏠): Return to dashboard
- **Breadcrumbs**: Shows current location (e.g., "Campaign Name • Call ID")

## 📊 Dummy Data Included

The application includes realistic dummy data:
- 2 Incoming campaigns with 3+ call logs
- 2 Outgoing campaigns with 2+ call logs
- Various call statuses (Completed, No Answer)
- Different lead qualifications
- Detailed transcripts
- Comprehensive keyword extraction

## 🔧 Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Professional icon library

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx       # Main landing page
│   ├── CampaignList.jsx    # List of campaigns
│   ├── CallLogs.jsx        # Call logs table
│   └── CallDetails.jsx     # Detailed call view
├── data/
│   └── dummyData.js        # Sample data
├── App.jsx                 # Main app with routing logic
├── main.jsx                # Entry point
└── index.css               # Global styles + Tailwind
```

## 🎯 Future Backend Integration

When ready to connect to your backend:

1. Replace dummy data in `src/data/dummyData.js` with API calls
2. The voice recording URL (`recordingUrl`) will come from Cybonix webhook
3. Add authentication and user management
4. Implement real-time updates for live call monitoring
5. Add export functionality for reports

## 💡 Tips

- All views are fully navigable without any bugs
- The design follows CRM best practices
- Small, readable fonts for professional appearance
- Color-coded badges for quick status recognition
- Hover states provide visual feedback
- Responsive design adapts to screen sizes

---

**Need Help?** All components are well-structured and documented in the code.

