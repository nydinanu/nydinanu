# Bulk IP & Domain Scanner Feature

## Overview
Added comprehensive bulk scanning capability to the OSINT platform, allowing users to scan multiple IP addresses or domains simultaneously with quick result summaries and direct incident case integration.

## Features Implemented

### 1. Bulk Mode Toggle
- **Location**: Scanner page header
- **Toggle Button**: Maximize/Minimize icon in top-right
- **Functionality**: Switches between single-item and bulk-item scanning modes
- **Visual Feedback**: Button highlights when bulk mode is active

### 2. Bulk Input System
The BulkScanInput component provides two methods for adding items:

#### Manual Entry
- Type IP addresses or domains one at a time
- Press Enter or click "Add" button to add each item
- Supports adding up to 100 items

#### File Upload
- Upload `.txt`, `.csv` files with multiple items
- CSV parsing supports multiple formats:
  - Single column: one item per line
  - Multi-column: comma-separated values
  - Quoted fields: automatic quote removal
- Automatic deduplication
- File truncation if exceeding 100-item limit with user notification

### 3. Quick Result Display
Results page shows a professional results table with:
- **Summary Statistics**: Total scanned, Critical, High risk, Clean counts
- **Filterable Results Table** with columns:
  - Item (IP/Domain)
  - Type (IP or Domain)
  - Status (Success/Failed)
  - Threat Level (Critical/High/Medium/Low/Clean)
  - Threat Count
  - Email Leaks
  - View Details button

### 4. Incident Case Integration
Users can create incident cases directly from bulk scan results:

#### Create Incident Modal
- Modal prompts for incident title
- Shows scan summary (item count, type)
- One-click incident creation with all IOCs
- Success notification with redirect to incidents page

#### Incident Data Structure
Each incident includes:
- Title: User-provided
- Description: Auto-generated summary
- Severity: Medium (default for bulk scans)
- IOCs: All successful scan results as IOCs with:
  - Type (IP or Domain)
  - Value (the scanned item)
  - Threat Level (from scan)
  - Scan Date (ISO 8601)
- Tags: scantype + "bulk-scan"

### 5. Scanner Page Enhancements
- **Type Selector**: Two buttons (IP ADDRESSES / DOMAINS) in bulk mode
- **Items Counter**: Shows "X items selected (max 100)"
- **Start Bulk Scan Button**: Only enabled when items present
- Tabs hidden in bulk mode for clean interface
- Smooth transition between modes

## User Workflow

### Workflow 1: Manual Entry
1. Click bulk mode toggle (Maximize icon)
2. Select IP ADDRESSES or DOMAINS
3. Enter first item in text field
4. Press Enter or click "Add"
5. Repeat steps 3-4 for additional items
6. Click "START BULK SCAN"
7. View results table with summaries
8. (Optional) Click "CREATE INCIDENT" to save as case

### Workflow 2: File Upload
1. Click bulk mode toggle
2. Select IP ADDRESSES or DOMAINS
3. Click "Upload File" area
4. Select .txt or .csv file with items
5. System automatically parses and adds items
6. Items appear in list below upload area
7. Click "START BULK SCAN"
8. Proceed with results review

### Workflow 3: Create Incident from Results
1. Complete bulk scan
2. Click "CREATE INCIDENT" button in header
3. Enter incident title (e.g., "Suspicious IP Addresses - Week 1")
4. Click "CREATE INCIDENT"
5. System adds all successful IOCs to incident
6. Redirected to incidents page after 2 seconds
7. Incident now appears in incident case list

## Technical Details

### API Integration
- **Endpoint**: `/api/bulk-scan` (POST)
- **Payload**: `{ items: string[], type: "ip" | "domain" }`
- **Response**: `{ results: [...], summary: { total, critical, high, clean } }`

### Incident API
- **Endpoint**: `/api/incidents` (POST)
- **Payload**: `{ title, description, severity, iocs, tags }`
- **Auto-redirect**: 2-second delay before navigating to incidents page

### URL Parameters
- `type`: "ip" or "domain"
- `items`: JSON-encoded array of items to scan

## UI/UX Highlights
- **Color Coding**: Amber accent for bulk operations (distinct from standard primary)
- **Clear Status**: Visual indicators for success/failure
- **Professional Table**: Clean, sortable results display
- **Modal Design**: Follows existing incident creation pattern
- **Accessibility**: Disabled states, clear labels, keyboard support

## Maximum Limits
- Items per scan: 100
- Supported item types: IP addresses, Domains
- File formats: .txt, .csv
- File upload size: System default

## Error Handling
- Duplicate item detection in manual entry
- File parsing validation for CSV/text
- Item limit enforcement with clear messaging
- API error handling with user-friendly alerts
- Failed scan item indicators in results

## Future Enhancements
- Scheduled bulk scans
- Bulk scan templates
- Export scan history
- Integration with threat feeds
- Batch operations on results (tag, categorize)
- Webhook notifications for bulk scan completion
