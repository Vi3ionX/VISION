// VISION payment page (demo only: no real gateway, nothing is charged).
// Reads the booking saved by bookNow() in script.js, then shows the confirmed-booking notice.

let booking = null;

function money(n) {
  return "₹" + Number(n).toFixed(2);
}

function niceDate(iso) {            // 2026-12-17 -> 17-12-2026
  const p = iso.split("-");
  return p[2] + "-" + p[1] + "-" + p[0];
}

function loadBooking() {
  try {
    booking = JSON.parse(localStorage.getItem("visionBooking"));
  } catch (e) {
    booking = null;
  }
  if (booking === null) {
    document.getElementById("no-booking").hidden = false;
    return;
  }
  document.getElementById("sum-details").textContent =
    booking.name + " · " + niceDate(booking.startDate) + " to " + niceDate(booking.endDate) +
    " (" + booking.days + " days) · " + booking.collect + " · " + booking.pickup;

  const parts = booking.items.split(", ");
  let html = "";
  for (let i = 0; i < parts.length; i++) { html += "<li>" + parts[i] + "</li>"; }
  document.getElementById("sum-items").innerHTML = html;
  document.getElementById("sum-total").textContent = money(booking.payNow);
  document.getElementById("pay-btn").textContent = "Pay " + money(booking.payNow);
  document.getElementById("pay-area").hidden = false;
  showMethod();
}

// Show only the fields of the chosen method, and only require those fields
function showMethod() {
  const method = document.querySelector("input[name=method]:checked").value;
  const groups = { "UPI": "f-upi", "Card": "f-card", "Net banking": "f-net" };
  for (const key in groups) {
    const box = document.getElementById(groups[key]);
    const active = (key === method);
    box.hidden = !active;
    const fields = box.querySelectorAll("input, select");
    for (let i = 0; i < fields.length; i++) { fields[i].required = active; }
  }
}

function payNow() {
  const bookingId = "TN-" + Math.floor(Math.random() * 9000 + 1000);
  const method = document.querySelector("input[name=method]:checked").value;

  const box = document.getElementById("confirmation");
  box.innerHTML = "<h3>Booking confirmed: " + bookingId + "</h3>" +
    "<p>Thank you, <strong>" + booking.name + "</strong>! Your payment of <strong>" + money(booking.payNow) + "</strong> was received via " + method + ". A confirmation will be sent to " + booking.email + ".</p>" +
    "<p>" + booking.days + " days &middot; " + booking.trek + " &middot; " + niceDate(booking.startDate) + " to " + niceDate(booking.endDate) + "</p>" +
    "<p>" + booking.collect + " &middot; " + booking.pickup + "</p>" +
    "<p>" + booking.items + "</p>" +
    "<p>Your gear will be ready at pick-up. The refundable deposit is returned after inspection. Please carry a photo ID.</p>" +
    '<p><a class="btn" href="index.html">Back to home</a></p>';
  box.hidden = false;
  document.getElementById("pay-area").hidden = true;
  localStorage.removeItem("visionBooking");   // booking is done
  localStorage.removeItem("visionDraft");     // start fresh next time
  box.scrollIntoView();
  return false;   // stay on the page
}

loadBooking();
