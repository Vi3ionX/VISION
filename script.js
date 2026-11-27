// VISION script: only the basic JavaScript (variables, if/else, loops, arrays, objects, functions)
// Catalog filters, search and sorting use simple DOM code below; FAQ, form validation and layout are HTML and CSS.

// ===== Constants and variables =====
const GST_RATE = 18;          // percent
const DISCOUNT_5_DAYS = 5;    // percent for 5+ day rentals
const DISCOUNT_10_DAYS = 10;  // percent for 10+ day rentals
const MAX_DAYS = 30;

let cart = [];                // array of objects: { name, price, deposit, stock, qty }
let bundleDiscount = 0;       // percent, set when a bundle is chosen
let currentBundle = "";       // key of the bundle in the bag ("" = none)
let toastTimer = null;

// The bag and the form are saved in localStorage so nothing is lost when the user leaves and comes back
const DRAFT_KEY = "visionDraft";
const TEXT_FIELDS = ["name", "email", "phone", "trek", "pickup", "start-date", "end-date", "notes"];

// An object that stores the starter bundles
const bundles = {
  weekend: {
    name: "Weekend Campout Kit",
    discount: 10,
    // each item: [name, price, deposit, stock, quantity]
    items: [
      ["TrailLite 2-Person Tent", 349, 2500, 6, 1],
      ["Valley Light Sleeping Bag", 129, 1000, 10, 2],
      ["TrekLite 40L Rucksack", 149, 1200, 8, 2],
      ["Pocket Canister Stove", 99, 800, 10, 1],
      ["Aluminium Trekking Poles (pair)", 79, 600, 12, 2]
    ]
  },
  himalayan: {
    name: "High-Altitude Himalayan Trek Kit",
    discount: 15,
    // each item: [name, price, deposit, stock, quantity]
    items: [
      ["Summit 4-Season Dome Tent", 799, 6000, 3, 1],
      ["Glacier High-Altitude Bag", 349, 3000, 6, 2],
      ["Expedition 70L Rucksack", 299, 2500, 5, 2],
      ["Multi-Fuel Altitude Stove", 249, 2000, 5, 1],
      ["Carbon Fibre Poles (pair)", 129, 1200, 8, 2]
    ]
  }
};

// ===== Add / remove items =====
function addToCart(name, price, deposit, stock) {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].name === name) {
      if (cart[i].qty >= stock) {
        document.getElementById("cart-msg").textContent = "Only " + stock + " x " + name + " available.";
        return;
      }
      cart[i].qty = cart[i].qty + 1;
      document.getElementById("cart-msg").textContent = name + " added.";
      showCart();
      showToast(name + " added (x" + cart[i].qty + ")");
      return;
    }
  }
  cart.push({ name: name, price: price, deposit: deposit, stock: stock, qty: 1 });
  document.getElementById("cart-msg").textContent = name + " added.";
  showCart();
  showToast(name + " added to your rental bag");
}

function addBundle(key) {
  const chosen = bundles[key];
  cart = [];                       // start a fresh bag
  for (let i = 0; i < chosen.items.length; i++) {
    const it = chosen.items[i];
    cart.push({ name: it[0], price: it[1], deposit: it[2], stock: it[3], qty: it[4] });
  }
  bundleDiscount = chosen.discount;
  currentBundle = key;
  document.getElementById("cart-msg").textContent = chosen.name + " added. Now choose your dates.";
  showCart();
  showToast(chosen.name + " added to your rental bag");
}

function changeQty(index, change) {
  const newQty = cart[index].qty + change;
  if (newQty > cart[index].stock) {
    document.getElementById("cart-msg").textContent = "Only " + cart[index].stock + " available.";
    return;
  }
  if (change < 0) { bundleDiscount = 0; }   // bundle is no longer complete
  if (newQty <= 0) { cart.splice(index, 1); }
  else { cart[index].qty = newQty; }
  showCart();
}

// used by the +/- buttons on the catalog cards
function changeQtyByName(name, change) {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].name === name) { changeQty(i, change); return; }
  }
}

function removeItem(index) {
  cart.splice(index, 1);
  bundleDiscount = 0;
  showCart();
}

// ===== Show the bag =====
function showCart() {
  let html = "";
  let count = 0;
  for (let i = 0; i < cart.length; i++) {
    count = count + cart[i].qty;
    html += '<div class="cart-row">' +
      "<span>" + cart[i].name + "</span>" +
      '<span><button type="button" onclick="changeQty(' + i + ', -1)">-</button> ' + cart[i].qty +
      ' <button type="button" onclick="changeQty(' + i + ', 1)">+</button></span>' +
      "<span>₹" + cart[i].price * cart[i].qty + "/day</span>" +
      '<button type="button" onclick="removeItem(' + i + ')">Remove</button>' +
      "</div>";
  }
  if (cart.length === 0) {
    html = '<p class="empty">Your rental bag is empty. Add gear from the catalog or choose a bundle.</p>';
  }
  document.getElementById("cart-list").innerHTML = html;
  document.getElementById("cart-count").textContent = count;
  if (bundleDiscount === 0) { currentBundle = ""; }   // bundle changed, so it is no longer "selected"
  showBill();
  syncCatalog();
  saveDraft();
}

// Turn each catalog card's "Add to rental" button into a - qty + stepper once the item is in the bag
function syncCatalog() {
  for (let i = 0; i < gearCards.length; i++) {
    const card = gearCards[i];
    let qty = 0;
    for (let k = 0; k < cart.length; k++) {
      if (cart[k].name === card.dataset.name) { qty = cart[k].qty; }
    }
    card.querySelector(".add-btn").hidden = (qty > 0);
    card.querySelector(".stepper").hidden = (qty === 0);
    card.querySelector(".qty").textContent = qty;
    card.querySelector(".plus").disabled = (qty >= Number(card.dataset.stock));
    card.classList.toggle("in-bag", qty > 0);
  }
  const bundleButtons = document.querySelectorAll(".bundle-btn");
  for (let i = 0; i < bundleButtons.length; i++) {
    const selected = (bundleButtons[i].dataset.bundle === currentBundle);
    bundleButtons[i].textContent = selected ? "Added to bag \u2713" : "Choose this kit";
    bundleButtons[i].classList.toggle("selected", selected);
  }
}

// Small message at the bottom of the screen so the user sees that the click worked
function showToast(text) {
  const toast = document.getElementById("toast");
  toast.innerHTML = text + ' <a href="#planner">View bag</a>';
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toast.hidden = true; }, 2500);
}

// ===== Keep the user's information (bag + form) =====
function saveDraft() {
  const draft = { cart: cart, bundleDiscount: bundleDiscount, currentBundle: currentBundle, fields: {} };
  for (let i = 0; i < TEXT_FIELDS.length; i++) {
    draft.fields[TEXT_FIELDS[i]] = document.getElementById(TEXT_FIELDS[i]).value;
  }
  draft.collect = document.querySelector("input[name=collect]:checked").value;
  draft.agree = document.getElementById("agree").checked;
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch (e) { /* storage blocked: ignore */ }
}

function loadDraft() {
  let draft = null;
  try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch (e) { draft = null; }
  if (draft === null || !Array.isArray(draft.cart)) { return; }
  cart = draft.cart;
  bundleDiscount = draft.bundleDiscount || 0;
  currentBundle = draft.currentBundle || "";
  for (let i = 0; i < TEXT_FIELDS.length; i++) {
    const value = draft.fields[TEXT_FIELDS[i]];
    if (value !== undefined) { document.getElementById(TEXT_FIELDS[i]).value = value; }
  }
  if (draft.collect === "Home delivery") { document.getElementById("col-home").checked = true; }
  document.getElementById("agree").checked = (draft.agree === true);
}

// ===== Dates, price and deposit calculator =====
function getDays() {
  const start = document.getElementById("start-date").value;
  const end = document.getElementById("end-date").value;
  if (start === "" || end === "") { return 0; }
  return (new Date(end) - new Date(start)) / 86400000;   // milliseconds in one day
}

function dateMessage(days) {
  if (days === 0 && (document.getElementById("start-date").value === "" || document.getElementById("end-date").value === "")) {
    return "Choose pick-up and return dates.";
  }
  if (days < 1) { return "Return date must be after the pick-up date."; }
  if (days > MAX_DAYS) { return "Maximum rental is " + MAX_DAYS + " days."; }
  return "";
}

function money(n) {
  return "₹" + n.toFixed(2);
}

function showBill() {
  let days = getDays();
  const message = dateMessage(days);
  document.getElementById("date-msg").textContent = message;
  if (message !== "") { days = 0; }

  let daily = 0;
  let deposit = 0;
  for (let i = 0; i < cart.length; i++) {
    daily += cart[i].price * cart[i].qty;
    deposit += cart[i].deposit * cart[i].qty;
  }

  let longDiscount = 0;
  if (days >= 10) { longDiscount = DISCOUNT_10_DAYS; }
  else if (days >= 5) { longDiscount = DISCOUNT_5_DAYS; }

  const subtotal = daily * days;
  const discount = subtotal * (bundleDiscount + longDiscount) / 100;
  const gst = (subtotal - discount) * GST_RATE / 100;
  const rental = subtotal - discount + gst;
  const payNow = rental + deposit;

  let html = "<tr><td>Daily rate (all items)</td><td>" + money(daily) + "</td></tr>";
  html += "<tr><td>Rental days</td><td>" + days + "</td></tr>";
  html += "<tr><td>Rental subtotal</td><td>" + money(subtotal) + "</td></tr>";
  html += "<tr><td>Discount (bundle " + bundleDiscount + "% + long rental " + longDiscount + "%)</td><td>- " + money(discount) + "</td></tr>";
  html += "<tr><td>GST (" + GST_RATE + "%)</td><td>" + money(gst) + "</td></tr>";
  html += "<tr><td>Rental charge</td><td>" + money(rental) + "</td></tr>";
  html += '<tr class="deposit"><td>Refundable deposit</td><td>' + money(deposit) + "</td></tr>";
  html += '<tr class="total"><td>Payable at pick-up</td><td>' + money(payNow) + "</td></tr>";
  html += '<tr class="deposit"><td>Deposit returned after inspection</td><td>' + money(deposit) + "</td></tr>";
  document.getElementById("bill-body").innerHTML = html;
  return payNow;
}

// ===== Size finder =====
function findSize() {
  const height = Number(document.getElementById("height").value);
  const trip = document.getElementById("trip").value;

  const pole = Math.round(height * 0.68);
  let bag;
  if (height > 180) { bag = "Long (fits up to 200 cm)"; }
  else { bag = "Regular (fits up to 180 cm)"; }

  let pack;
  if (trip === "day") { pack = "20-30 L day pack"; }
  else if (trip === "weekend") { pack = "40-50 L (try our 40L)"; }
  else if (trip === "week") { pack = "55-65 L (try our 55L)"; }
  else { pack = "65-80 L (try our 70L)"; }

  document.getElementById("size-result").innerHTML =
    "<h3>Your recommended sizes</h3><ul>" +
    "<li>Trekking pole length: about <strong>" + pole + " cm</strong></li>" +
    "<li>Sleeping bag: <strong>" + bag + "</strong></li>" +
    "<li>Rucksack: <strong>" + pack + "</strong></li></ul>";
  return false;   // stop the page from reloading
}

// ===== Booking form =====
// The "Confirm reservation" button under the calculator submits the form on the left.
// HTML already checks required, email, pattern and minlength before this runs.
// If everything is fine, the booking is saved and the user goes to the payment page.
function bookNow() {
  const msg = document.getElementById("form-msg");
  const days = getDays();

  if (cart.length === 0) {
    msg.textContent = "Add at least one item to your rental bag first.";
    return false;
  }
  if (dateMessage(days) !== "") {
    msg.textContent = "Please fix the rental dates: " + dateMessage(days);
    return false;
  }
  msg.textContent = "";

  let items = "";
  for (let i = 0; i < cart.length; i++) {
    items += cart[i].qty + " x " + cart[i].name + ", ";
  }
  items = items.slice(0, items.length - 2);   // remove the last ", "

  // an object holding everything the payment page needs
  const booking = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    trek: document.getElementById("trek").value,
    pickup: document.getElementById("pickup").value,
    collect: document.querySelector("input[name=collect]:checked").value,
    startDate: document.getElementById("start-date").value,
    endDate: document.getElementById("end-date").value,
    notes: document.getElementById("notes").value,
    days: days,
    items: items,
    payNow: showBill()
  };

  try {
    localStorage.setItem("visionBooking", JSON.stringify(booking));
  } catch (e) {
    msg.textContent = "Your browser blocked saving the booking. Please allow site storage and try again.";
    return false;
  }
  window.location.href = "payment.html";
  return false;
}

// ===== Catalog filters =====
let currentCategory = "All";                                   // which category button is active
const catalogGrid = document.getElementById("catalog-grid");
const gearCards = Array.from(catalogGrid.querySelectorAll(".gear"));
const featuredOrder = gearCards.slice();                       // remember the original order for "Featured"

function setCategory(name) {
  currentCategory = name;
  const buttons = document.querySelectorAll("[data-cat].chip");
  for (let i = 0; i < buttons.length; i++) {
    const isActive = buttons[i].getAttribute("data-cat") === name;
    buttons[i].classList.toggle("active", isActive);
    buttons[i].setAttribute("aria-pressed", isActive);
  }
  // the tent type filter only makes sense for tents
  document.getElementById("tent-wrap").hidden = (name !== "Tents");
  if (name !== "Tents") { document.getElementById("f-tent").value = ""; }
  applyFilters();
}

function applyFilters() {
  const search = document.getElementById("f-search").value.trim().toLowerCase();
  const tent = document.getElementById("f-tent").value;
  const temp = document.getElementById("f-temp").value;
  const maxPrice = Number(document.getElementById("f-price").value);
  const sort = document.getElementById("f-sort").value;
  document.getElementById("f-price-out").textContent = "₹" + maxPrice;

  // 1. show or hide every card
  let shown = 0;
  for (let i = 0; i < gearCards.length; i++) {
    const card = gearCards[i];
    let show = true;
    if (currentCategory !== "All" && card.dataset.cat !== currentCategory) { show = false; }
    if (tent !== "" && card.dataset.type !== tent) { show = false; }
    if (temp !== "" && card.dataset.temp !== temp) { show = false; }
    if (Number(card.dataset.price) > maxPrice) { show = false; }
    if (search !== "" && card.textContent.toLowerCase().indexOf(search) === -1) { show = false; }
    card.hidden = !show;
    if (show) { shown++; }
  }

  // 2. sort the cards
  const sorted = featuredOrder.slice();
  if (sort === "price-low") {
    sorted.sort(function (a, b) { return Number(a.dataset.price) - Number(b.dataset.price); });
  } else if (sort === "price-high") {
    sorted.sort(function (a, b) { return Number(b.dataset.price) - Number(a.dataset.price); });
  } else if (sort === "name") {
    sorted.sort(function (a, b) {
      return a.querySelector("h3").textContent.localeCompare(b.querySelector("h3").textContent);
    });
  }
  for (let i = 0; i < sorted.length; i++) { catalogGrid.appendChild(sorted[i]); }

  // 3. update the counter and the empty message
  document.getElementById("result-count").textContent = "Showing " + shown + " of " + gearCards.length + " items";
  document.getElementById("no-results").hidden = (shown !== 0);
}

function resetFilters() {
  document.getElementById("f-search").value = "";
  document.getElementById("f-temp").value = "";
  document.getElementById("f-price").value = document.getElementById("f-price").max;
  document.getElementById("f-sort").value = "featured";
  setCategory("All");              // also clears the tent type and re-applies the filters
}

// Build the - qty + stepper inside every catalog card (hidden until the item is in the bag)
function buildSteppers() {
  for (let i = 0; i < gearCards.length; i++) {
    const name = gearCards[i].dataset.name;
    const box = document.createElement("div");
    box.className = "stepper";
    box.hidden = true;
    box.innerHTML = '<button type="button" class="minus" aria-label="Remove one">\u2212</button>' +
      '<span class="qty" aria-live="polite">0</span>' +
      '<button type="button" class="plus" aria-label="Add one">+</button>';
    box.querySelector(".minus").onclick = function () { changeQtyByName(name, -1); };
    box.querySelector(".plus").onclick = function () { changeQtyByName(name, 1); };
    gearCards[i].appendChild(box);
  }
}

// ===== Start-up =====
buildSteppers();
loadDraft();                                   // bring back the bag and form after returning to the page
showCart();
setCategory("All");
document.getElementById("booking-form").addEventListener("input", saveDraft);
document.getElementById("booking-form").addEventListener("change", saveDraft);
