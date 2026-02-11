# Mithra - Data Safety Declaration for Google Play

## Overview
This document helps you fill out the Data Safety section in Google Play Console.
Google requires all apps to declare what data they collect and how it's used.

---

## Data Collection Declaration

### Does your app collect or share any of the required user data types?
**YES** — The app collects some data locally.

---

## Data Types Collected

### 1. Personal Info
| Data Type | Collected | Shared | Purpose | Optional |
|-----------|-----------|--------|---------|----------|
| Name | Yes | No | App functionality (greeting) | No |
| Email | Yes | No | Account management | No |

### 2. App Activity  
| Data Type | Collected | Shared | Purpose | Optional |
|-----------|-----------|--------|---------|----------|
| App interactions | Yes | No | Analytics, App functionality | No |
| In-app search history | No | No | — | — |

### 3. App Info & Performance
| Data Type | Collected | Shared | Purpose | Optional |
|-----------|-----------|--------|---------|----------|
| Crash logs | No | No | — | — |
| Diagnostics | No | No | — | — |

---

## Data Handling Practices

### Is data encrypted in transit?
**YES** — All network communication uses HTTPS.

### Can users request data deletion?
**YES** — Users can delete their account and all associated data from the Settings page.

### Data retention
Data is stored locally on the device and on our servers. Users can delete their data at any time.

---

## Security Practices

| Practice | Status |
|----------|--------|
| Data encrypted in transit | ✅ Yes (HTTPS) |
| Data encrypted at rest | ✅ Yes (device encryption) |
| Users can request deletion | ✅ Yes |
| Committed to Play Families Policy | ❌ Not applicable |

---

## Filling Out Play Console

1. Go to **Play Console > App Content > Data Safety**
2. Click **Start** or **Manage**
3. Answer: "Does your app collect or share user data?" → **Yes**
4. Walk through each data type using the table above
5. For encryption: Select **Yes, all data is encrypted in transit**
6. For deletion: Select **Yes, users can request deletion**
7. Review and submit

---

## Privacy Policy

You MUST have a privacy policy URL. Create one at:
- https://app-privacy-policy-generator.firebaseapp.com/
- Or host your own at your domain

The privacy policy must cover:
- What data you collect
- How you use the data  
- How users can delete their data
- Contact information
