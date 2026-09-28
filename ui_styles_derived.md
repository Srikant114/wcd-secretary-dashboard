# Derived UI Styles from Design File

Based on the provided design reference (`wcd_n_ui.zip`), here is the derived styling system. This list details the exact values we need to apply across our application.

## 1. Typography & Fonts
- **Base/Sans Font:** `"Inter", -apple-system, sans-serif`
- **Heading Font:** `"Outfit", sans-serif`
- **Public Portal Font:** `"Nunito Sans", "Nunito", sans-serif`
- **Text Colors:**
  - Base Light Mode: `#111827` (Foreground: `#0f172a`)
  - Base Dark Mode: `#f8fafc` (Foreground: `#f8fafc`)
  - Muted Text: `#64748b` (Light) / `#94a3b8` (Dark)

## 2. Core Color Palette
- **Primary:** `#023DC9`
- **Primary Hover:** `#0234ac`
- **Secondary:** `#64748b`
- **Success:** `#10b981`
- **Danger:** `#ef4444`
- **Warning:** `#f59e0b`
- **Background:** `#F8FAFC`
- **Border Color:** `#e5e7eb`

### Gradients
- **Primary Gradient:** `linear-gradient(231.7deg, #013ecd 30.62%, #fe1c06 96.67%)`
- **Page Background Gradient:** `linear-gradient(206.67deg, #ffe9e9 19.08%, #d3daff 81.82%)`
- **Header Background (New):** `linear-gradient(113deg, rgb(225 223 248) 10%, rgb(245 230 239) 50%, rgb(255 177 98) 100%)`

## 3. Layout Elements
### Sidebar
- **Background & Header:** `#023DC9` (Uses Primary color)
- **Border:** `#023DC9` (Uses Primary color)
- **Text:** `#ffffff` (Muted: `rgba(255, 255, 255, 0.7)`)
- **Hover/Active State:** `rgba(255, 255, 255, 0.08)` / `rgba(255, 255, 255, 0.12)`

### Header (Admin)
- **Text:** `#111827`
- **Border:** `#e5e7eb`
- **Avatar:** `#023DC9` (Primary)

## 4. Components

### Action Buttons
| State | Background Color | Text Color |
| :--- | :--- | :--- |
| **Primary** | `#dbeafe` | `#2563eb` |
| **Success** | `#dcfce7` | `#16a34a` |
| **Danger** | `#fee2e2` | `#dc2626` |
| **Warning** | `#FAF6E8` | `#D4AF37` |
| **Info** | `#F3F4F6` | `#4B5563` |

### Cards (Preview / Layout)
- **Background:** `rgba(255, 255, 255, 0.55)` (Glassmorphism effect)
- **Border:** `#e5e7eb` (Uses global border color)
- **Border Radius:** `0.75rem`
- **Padding:** `1.25rem`
- **Icon Color:** `#023DC9` (Primary)

### Inputs & Forms
- **Background:** `#ffffff`
- **Border:** `#e2e8f0`
- **Text:** `#0f172a`

### Tables
- **Header Background:** `#f8fafc`
- **Border:** `#e2e8f0`
- **Row Hover:** `#f1f5f9`
- **Striped Row:** `#f8fafc`

### Tabs
- **Background:** `#f1f5f9`
- **Active Tab Background:** `#ffffff`
- **Active Text:** `#023DC9` (Primary)
- **Inactive Text:** `#64748b` (Secondary)

### Modals
- **Header Background:** `#023DC9` (Primary)
- **Footer Background:** `#f8fafc`

---
*Note: Dark mode variants are also extracted and ready to be mapped in the CSS variables as needed.*
