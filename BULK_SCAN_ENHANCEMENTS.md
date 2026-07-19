# Bulk Scan Enhancements - Feature Documentation

## Overview

The Advanced OSINT Platform now includes enhanced bulk scanning capabilities with support for manual IP address input, CSV/Excel file uploads, and comprehensive CSV export functionality for scan results.

## New Features

### 1. Manual IP Address & Domain Input

**Location**: Scanner Page → Bulk Scan Tab

Users can now manually add individual IP addresses, domains, or hashes to their bulk scan queue:

- **Add Items**: Input field with "Add" button to manually add targets one at a time
- **Real-time Validation**: Automatically detects and validates IP addresses, domains, and hashes
- **Duplicate Prevention**: System prevents duplicate items from being added
- **Visual Feedback**: Current count displayed (X/100 items)
- **Quick Add with Enter**: Press Enter key to quickly add items

#### Supported Formats:
- IPv4 addresses: `192.168.1.1`, `8.8.8.8`
- IPv6 addresses: `2001:4860:4860::8888`
- Domain names: `example.com`, `google.com`
- Subdomains: `api.example.com`, `mail.google.com`
- URLs: `https://example.com/path`
- File hashes: MD5, SHA1, SHA256

### 2. File Upload Support

**Location**: Scanner Page → Bulk Scan Tab → Upload File Section

Users can upload CSV, TXT, or Excel files containing lists of targets:

#### CSV File Format
```csv
IP Address,Domain
192.168.1.1,example.com
10.0.0.1,google.com
8.8.8.8,cloudflare.com
```

Or simple list format:
```csv
192.168.1.1
example.com
10.0.0.1
google.com
```

#### TXT File Format
```
192.168.1.1
example.com
10.0.0.1
google.com
```

#### Excel File Format
- Export from Excel to CSV first
- One item per cell or row
- Supports both columnar and linear formats

#### Features:
- **Drag & Drop Support**: Click or drag files to upload area
- **Duplicate Handling**: Automatically removes duplicates from uploads
- **Size Validation**: Enforces 100-item maximum limit
- **Format Validation**: Supports CSV, TXT, XLS, XLSX files
- **Error Handling**: Clear error messages for unsupported formats

### 3. Comprehensive CSV Export

**Location**: Bulk Scan Results Page → Header Buttons

After scanning completes, users can export results in two formats:

#### Basic CSV Export
- **Format**: Simple spreadsheet with essential columns
- **Columns**:
  - Item (IP, domain, or hash)
  - Type (ip, domain, hash)
  - Status (success, error, pending)
  - Threat Level (critical, high, medium, low, clean)
  - Threats Detected (count)
  - Error Message (if any)

**Use Case**: Quick summary for management or basic reporting

#### Detailed CSV Export
- **Format**: Extended spreadsheet with timestamps for audit trails
- **Additional Columns**:
  - All basic export columns
  - Scan Timestamp (ISO 8601 format)

**Use Case**: Compliance reporting, incident response documentation, audit logs

#### Export Features:
- **Automatic Formatting**: Proper CSV escaping for commas, quotes, newlines
- **Date Stamping**: File automatically named with scan date
- **Full Dataset**: Includes all 100 items (if scanned)
- **Error Preservation**: Maintains error messages for failed scans
- **Browser Download**: Files downloaded directly to user's Downloads folder

### 4. User Interface Enhancements

#### Bulk Scan Input Component (`components/bulk-scan-input.tsx`)

New dedicated component for bulk scan input with:
- Manual item input field
- File upload drag-and-drop area
- Items list with remove button for each item
- Real-time item count display (X/100)
- Error messages and validation feedback
- Support for both manual and file-based input

#### Scanner Tab Updates

- **Tab Grid**: Expanded from 5 to 6 columns to accommodate new BULK SCAN tab
- **Tab Features**:
  - Dedicated BULK SCAN tab in main scanner interface
  - Uses new BulkScanInput component
  - Inline "START BULK SCAN" button with item count
  - Helpful text about supported formats

## Technical Implementation

### New Files Created

1. **`/components/bulk-scan-input.tsx`** (191 lines)
   - Reusable component for bulk scan input
   - Handles manual input and file uploads
   - CSV parsing and validation
   - Duplicate detection

2. **`/lib/csv-export.ts`** (139 lines)
   - CSV generation utilities
   - Field escaping for proper CSV format
   - Two export modes (basic and detailed)
   - Browser download handling

### Modified Files

1. **`/app/scanner/page.tsx`**
   - Added `bulkItems` state management
   - Imported BulkScanInput component
   - Updated searchType to include "bulk"
   - Added new BULK SCAN tab with 6-column grid
   - Updated TabsList grid from grid-cols-5 to grid-cols-6

2. **`/app/bulk-results/page.tsx`**
   - Imported CSV export utilities
   - Added `exportDetailedResults` function
   - Updated `exportResults` to use new CSV utility
   - Added second export button for detailed CSV
   - Imported FileText icon

## Usage Guide

### Scanning Multiple Targets - Manual Method

1. Navigate to Scanner page
2. Click on "BULK SCAN" tab
3. Enter first IP/domain in input field
4. Click "Add" button or press Enter
5. Repeat steps 3-4 for additional targets
6. Click "START BULK SCAN" when done

### Scanning Multiple Targets - File Upload Method

1. Navigate to Scanner page
2. Click on "BULK SCAN" tab
3. Prepare CSV or TXT file with one target per line
4. Click upload area or drag file to drop zone
5. Select file from computer
6. System automatically parses and adds items
7. Verify items in list
8. Click "START BULK SCAN" when ready

### Exporting Results

1. After bulk scan completes, view results page
2. In header, find export buttons:
   - **EXPORT CSV**: Basic format with key metrics
   - **EXPORT DETAILED**: Extended format with timestamps
3. Click desired export button
4. File downloads to your computer as `bulk-scan-[scanId]-[date].csv`

## Limitations & Constraints

- **Maximum Items**: 100 per bulk scan (system enforces this limit)
- **File Size**: Reasonable file sizes (CSV files typically < 10KB for 100 items)
- **Format Support**: CSV, TXT, XLS, XLSX (Excel must be converted to CSV)
- **Duplicate Handling**: Automatically removed from same batch
- **Error Handling**: Graceful error messages for unsupported formats

## Error Handling

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Please enter an IP address or domain" | Empty input field | Type target and click Add |
| "This item is already in the list" | Duplicate item | Remove existing item or use different target |
| "Maximum 100 items allowed" | Exceeding item limit | Remove items or split into multiple scans |
| "No new items found in file" | All items were duplicates | Check file for unique targets |
| "File truncated to fit 100-item limit" | File had too many items | Remaining items added, excess removed |
| "Failed to read file" | Invalid file format | Ensure CSV/TXT format, try another file |
| "Excel files require additional parsing" | Direct XLSX upload | Convert to CSV in Excel first |

## Performance Considerations

- **Scan Speed**: Depends on API response times for each target
- **Network**: Multiple concurrent requests (typically 5-10 parallel scans)
- **Storage**: Results cached in Redis during active scan
- **Export Speed**: Instant - CSV generation is fast for 100 items

## Security Notes

- **Input Validation**: All inputs validated before sending to API
- **File Upload**: Only CSV/TXT/Excel formats accepted
- **CSV Escaping**: Proper escaping of special characters
- **Data Privacy**: Results only stored for session duration
- **No Server Storage**: CSV exports generated client-side

## Future Enhancement Ideas

1. **Scheduled Scans**: Set bulk scans to run on schedule
2. **Results Comparison**: Compare results from previous scans
3. **Custom Columns**: User-selectable columns in CSV export
4. **JSON Export**: Add JSON format export option
5. **Database Results**: Store results in database for historical comparison
6. **Email Reports**: Automatically email results to specified address
7. **Webhook Integration**: Send results to external systems
8. **Result Templates**: Pre-defined export templates for different use cases

## Support & Troubleshooting

### File Upload Issues

**Issue**: "Cannot read file"
- Ensure file is saved as CSV or TXT
- Check file isn't corrupted
- Try smaller file first

**Issue**: "Items not being recognized"
- Verify one item per line
- Check for extra spaces or special characters
- Ensure IP addresses are properly formatted

### Scan Issues

**Issue**: "Scan taking too long"
- Expected for 100 items (2-5 minutes typical)
- Check internet connection
- Reduce number of items and retry

**Issue**: "Export button not working"
- Ensure scan completed successfully
- Try browser refresh
- Check browser download settings

## Conclusion

The enhanced bulk scan capabilities provide powerful tools for security analysts to efficiently scan multiple targets and export results for reporting and compliance purposes. The combination of manual input and file upload flexibility makes it suitable for both ad-hoc and large-scale security assessments.
