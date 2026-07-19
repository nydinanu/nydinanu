# Incident Case Creation and Management Feature

## Overview
This document outlines the implemented functionality to allow users to create new incident cases or add indicators of compromise (IOCs) from scan results.

## Features Implemented

### 1. Create Incident Case from Scan Results
- **Location**: Results page (`/app/results/page.tsx`)
- **Trigger**: "CREATE INCIDENT CASE" button in results header
- **Functionality**:
  - Opens a modal form to create a new incident case
  - Pre-populates the IOC type and value from the current scan
  - Allows users to set:
    - Case title
    - Description
    - Severity level (CRITICAL, HIGH, MEDIUM, LOW)
  - Automatically adds the scanned IOC to the new case
  - Saves to Redis via `/api/incidents` POST endpoint
  - Redirects to incidents page on success

### 2. Add IOC to Existing Incident Case (NEW)
- **Location**: Results page (`/app/results/page.tsx`)
- **Trigger**: "ADD TO INCIDENT" button in results header
- **Functionality**:
  - Opens a modal form to add the IOC to an existing incident
  - Loads all existing incident cases from Redis
  - Allows users to select which incident to add the IOC to
  - Shows IOC count for each incident
  - Updates the selected incident with the new IOC
  - Saves to Redis via `/api/incidents` PUT endpoint
  - Redirects to incidents page on success

### 3. Supported IOC Types
The system supports three types of indicators of compromise:
- **IP Addresses**: Standard IPv4 format (e.g., 192.168.1.1)
- **Domains**: Domain names (e.g., example.com)
- **Hashes**: File hashes (MD5, SHA-1, SHA-256)

Each IOC includes:
- Type classification
- Value (the indicator itself)
- Threat level (from scan results)
- Scan date timestamp

### 4. Incident Case Structure
```typescript
{
  id: string (timestamp-based)
  title: string
  description: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
  iocs: Array<{
    type: 'ip' | 'domain' | 'hash'
    value: string
    threatLevel: string
    scanDate: string (ISO 8601)
  }>
  createdDate: string (ISO 8601)
  lastUpdated: string (ISO 8601)
  assignee?: string
  tags: string[]
}
```

## API Endpoints Used

### POST /api/incidents
- **Purpose**: Create a new incident case
- **Request Body**: Incident case object
- **Response**: { success: true, case: IncidentCase }
- **Status Codes**: 200 (success), 400 (error), 500 (no Redis)

### PUT /api/incidents
- **Purpose**: Update an existing incident case (add IOC)
- **Request Body**: { id: string, ...updates }
- **Response**: { success: true, case: IncidentCase }
- **Status Codes**: 200 (success), 400 (error), 500 (no Redis)

### GET /api/incidents
- **Purpose**: Fetch all incident cases
- **Response**: { cases: IncidentCase[] }
- **Status Codes**: 200 (always returns, empty array if error)

## User Interface Updates

### Results Page Button Group
Added new button "ADD TO INCIDENT" with amber theme styling:
- Border color: `border-amber-500/70`
- Text color: `text-amber-400`
- Hover shadow: `shadow-amber-500/30`

### Modal Forms
Both modals follow consistent cybersecurity theme styling:
- Create Incident Modal: Primary green theme
- Add to Incident Modal: Amber theme
- Close button with X symbol
- Loading states during submission
- Auto-hide on success with 2-second delay

## Validation and Error Handling

### Form Validation
- **Title**: Required, non-empty string
- **Incident Selection**: Required when adding to existing
- **Error Messages**: User-friendly toast notifications
- **Success Messages**: Confirmation with case ID or incident title

### API Error Handling
- Redis unavailable: Returns error response with status 500
- Failed operations: Returns detailed error message
- Graceful fallback: Empty arrays when data unavailable

## Toast Notifications
All user actions trigger visual feedback:
- **Success**: Green toast with checkmark
- **Error**: Red toast with X icon
- **Info**: Blue toast with info icon
- Duration: 4 seconds (auto-dismiss)

## Technical Implementation

### State Management
- Form data state for new incidents
- Modal visibility state
- Loading states during API calls
- Existing incidents list state
- Selected incident ID state
- Toast notifications stack

### Functions
- `loadExistingIncidents()`: Fetches incidents from API
- `addToExistingIncident()`: Updates incident with new IOC
- `createIncidentCase()`: Creates new incident (existing)
- `showToast()`: Displays notification messages

### Data Flow
1. User clicks button → State changes → Modal opens
2. Modal loads data or accepts form input
3. Submit → API call → Success/Error
4. Toast notification → Redirect on success

## Security Considerations

### No Data Publishing
✓ All data stored locally in Redis
✓ No external API calls made
✓ No data exported without explicit user action
✓ Incidents are private to the instance

### Input Validation
✓ IOC type validated by scan context
✓ IOC value validated by format (IP/Domain/Hash regex)
✓ Case title trimmed and checked for empty
✓ All API responses validated before use

### Session/State
✓ No sensitive data in form state
✓ Timestamps recorded with all entries
✓ Update operations preserve existing data

## Testing Checklist

- [x] Create incident from IP scan
- [x] Create incident from domain scan
- [x] Create incident from hash scan
- [x] Add IOC to existing incident
- [x] Load existing incidents correctly
- [x] Form validation works
- [x] Error handling displays properly
- [x] Toast notifications appear
- [x] Redirect to incidents page works
- [x] No API errors thrown
- [x] No data published externally

## Future Enhancements

Potential improvements for future versions:
1. Bulk IOC import from results
2. IOC deduplication checking
3. Incident priority/scoring
4. Automated IOC enrichment
5. IOC confidence scoring
6. Related IOC suggestions
7. Export incident to external systems
8. Incident collaboration features

## Files Modified

- `/app/results/page.tsx`: Added new state, functions, and UI for adding to incidents

## Files Not Modified (Working as Designed)

- `/app/api/incidents/route.ts`: Already supports PUT for updates
- `/app/incidents/page.tsx`: Already displays incidents and IOCs
- `lib/redis.ts`: Already handles persistence

---

**Last Updated**: Current session
**Status**: ✓ Ready for deployment
**No Issues Published**: ✓ Confirmed
