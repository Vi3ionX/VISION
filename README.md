# VISION: Outdoor Camping Gear & Hiking Equipment Rental Catalog

CSE326 Internet Programming project. Frontend only (no backend, no libraries): HTML + CSS, with basic JavaScript for the catalog filters, cart and price calculator.

**Live site:** `<paste GitHub Pages link here>`
**Repository:** `<paste GitHub repository link here>`

## Run locally
Open `index.html` in a browser.

## Deploy on GitHub Pages
1. Create a new public repository on GitHub and upload the contents of this folder (`index.html`, `css/`, `js/`, `README.md`).
2. Repository **Settings > Pages > Build and deployment > Deploy from a branch**.
3. Choose branch `main`, folder `/ (root)`, press **Save**.
4. After a minute the site is live at `https://<username>.github.io/<repository>/`. Open it and test every link before submitting.

## Files
| File | Purpose |
|---|---|
| `index.html` | Semantic structure, catalog cards, filter form, bundles, comparison table, booking form, sizing table, FAQ, iframe map, SVG sprite (Units 1-2) |
| `css/style.css` | Variables, grid, flexbox, sticky header, pseudo-classes and pseudo-elements, animations, media queries (Unit 3) |
| `payment.html` + `js/payment.js` | Demo payment page (UPI / card / net banking fields, no real gateway) and the booking-confirmed notice |
| `images/trek.jpg` | Hero photo |
| `js/script.js` | Basic JS only: variables, constants, arrays, an object, if/else, loops, functions (catalog filters, cart, price + deposit calculator, size finder, confirmation) |

## Requirement map
| Requirement | Where |
|---|---|
| Catalog: Tents (2-Person / 4-Person / Dome), Sleeping Bags, Rucksacks, Stoves, Trekking Poles | `#catalog`: category buttons, search, tent-type, sort and price slider |
| Temperature filter (10°C / 0°C / -10°C) | Temperature rating dropdown (`applyFilters()` in `script.js`) |
| Starter bundles (Weekend vs Himalayan) | `#bundles`: two bundle cards + comparison table, `addBundle()` |
| Date duration, daily pricing, refundable deposit | `#planner`: date inputs, `showBill()` |
| Sizing guide | `#size-guide`: reference table + `findSize()` |
| Sanitation guarantee | `#sanitation`: cards + FAQ (`<details>`) |
| Responsive UI | CSS grid/flexbox + media queries |

## Course topics used
- **Unit 1:** headings, lists, links, images/SVG icons, iframe, favicon, SEO meta tags, tables
- **Unit 2:** semantic elements (`header`, `nav`, `main`, `section`, `article`, `aside`, `figure`, `footer`, `address`, `time`, `details`), forms (`fieldset`, `legend`, `label`, `datalist`, `textarea`, `radio`, `select`), validation (`required`, `pattern`, `minlength`, `maxlength`), accessible tables (`caption`, `scope`)
- **Unit 3:** selectors, `:hover`/`:focus`/`:checked`/`:has()`/`:nth-child`, `::before`/`::after`, custom properties, box model, sticky positioning, flexbox, grid, media queries, transitions, `@keyframes`

## Team
| Name | Registration No. | Contribution |
|---|---|---|
| | | |
