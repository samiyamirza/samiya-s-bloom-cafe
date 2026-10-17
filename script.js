/* ============================================================
   SAMIYA'S LITTLE BLOOM CAFE — script.js
   Everything interactive lives here:
   1) Shopping cart (add / remove / quantity / checkout)
   2) Navigation bar (mobile menu, active link, header effect)
   3) Best-seller category filter (All / Flowers / Bakery)
   4) Fun animations (falling petals, scroll reveal, counting stats)
   5) Forms (contact + newsletter) with friendly toast messages
   6) Image fallback: if an internet photo fails, a pretty drawn
      flower / cupcake / cookie appears instead.
   All commented in simple English — happy learning! 🌸🧁
   ============================================================ */

/* ---------- Small helpers ---------- */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const money = (n) => "₹" + n.toLocaleString("en-IN");
const DELIVERY_FEE = 49;
const FREE_DELIVERY_OVER = 999;
const STORAGE_KEY = "samiyaBloomCafeCart";

/* ============================================================
   1. SHOPPING CART 🛒
   ============================================================ */
let cart = [];

/* Load saved cart from the browser (so it survives refresh) */
function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    cart = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(cart)) cart = [];
  } catch (e) {
    cart = [];
  }
}

/* Save cart to the browser */
function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

/* Add a product (buttons carry the product info in data- attributes) */
function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast(`🌷 ${product.name} added to your cart!`);
}

/* Change quantity with + and − buttons */
function changeQty(id, amount) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += amount;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
}

/* Remove one product completely */
function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
  showToast("🗑️ Item removed from your cart");
}

/* Empty the whole cart */
function clearCart() {
  if (cart.length === 0) return showToast("Your cart is already empty 🌱");
  cart = [];
  saveCart();
  renderCart();
  showToast("🧺 Your cart has been emptied");
}

/* Draw the cart on screen */
function renderCart() {
  const itemsBox = $("#cartItems");
  const countBadge = $("#cartCount");

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  countBadge.textContent = totalItems;
  countBadge.classList.remove("bump");
  void countBadge.offsetWidth; /* restart the little bounce animation */
  countBadge.classList.add("bump");

  /* Empty state */
  if (cart.length === 0) {
    itemsBox.innerHTML = `
      <div class="cart-empty">
        <span class="big">🌱</span>
        <strong>Your cart is blooming empty!</strong>
        <p>Add some flowers or treats to make it beautiful.</p>
      </div>`;
  } else {
    itemsBox.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}" onerror="this.style.visibility='hidden'">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${money(item.price)}</div>
          <div class="qty-row">
            <button class="qty-btn" data-action="minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" data-action="plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="remove-item" data-action="remove" data-id="${item.id}" aria-label="Remove item">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>`
      )
      .join("");
  }

  /* Prices */
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const delivery = subtotal === 0 ? 0 : subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;

  $("#cartSubtotal").textContent = money(subtotal);

  const deliveryEl = $("#cartDelivery");
  if (subtotal === 0) {
    deliveryEl.textContent = "—";
    deliveryEl.classList.remove("free");
  } else if (delivery === 0) {
    deliveryEl.textContent = "FREE 🎉";
    deliveryEl.classList.add("free");
  } else {
    deliveryEl.textContent = money(DELIVERY_FEE);
    deliveryEl.classList.remove("free");
  }

  $("#cartTotal").textContent = money(subtotal + delivery);
}

/* Clicks inside the cart list (qty buttons, remove) */
$("#cartItems").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === "plus") changeQty(id, 1);
  if (action === "minus") changeQty(id, -1);
  if (action === "remove") removeFromCart(id);
});

/* "Add to Cart" buttons on the product cards */
$$(".add-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    addToCart({
      id: btn.dataset.id,
      name: btn.dataset.name,
      price: Number(btn.dataset.price),
      img: btn.dataset.img,
    });

    /* Friendly button feedback: "Added ✓" for a moment */
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
    btn.classList.add("added");
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove("added");
    }, 1200);
  });
});

/* Open / close the cart drawer */
function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#overlay").classList.add("show");
  document.body.classList.add("no-scroll");
}
function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#overlay").classList.remove("show");
  document.body.classList.remove("no-scroll");
}

$("#cartBtn").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", () => {
  closeCart();
  closeMenu();
});
$("#clearCart").addEventListener("click", clearCart);

/* Checkout — celebration! 🎉 */
$("#checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) return showToast("🌱 Your cart is empty — add some flowers or treats first!");
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const delivery = total >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
  cart = [];
  saveCart();
  renderCart();
  closeCart();
  showToast(`💐 Order placed! ${money(total + delivery)} — your blooms & bakes are on the way!`);
});

/* ============================================================
   2. NOTIFICATIONS (toast) 🔔
   ============================================================ */
let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

/* ============================================================
   3. NAVIGATION BAR 🧭
   ============================================================ */
const navLinks  = $("#navLinks");
const hamburger = $("#hamburger");
const header    = $(".header");

function closeMenu() {
  navLinks.classList.remove("open");
  hamburger.classList.remove("active");
  hamburger.setAttribute("aria-expanded", "false");
}

hamburger.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  hamburger.classList.toggle("active", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));
});

/* Close the mobile menu after tapping a link */
$$(".nav-link").forEach((link) => link.addEventListener("click", closeMenu));

/* Header shadow + "back to top" button + active link while scrolling */
const sections = [
  { id: "home",        el: $(".hero") },
  { id: "flowers",     el: $("#flowers") },
  { id: "bakery",      el: $("#bakery") },
  { id: "handmade",    el: $("#handmade") },
  { id: "gifts",       el: $("#gifts") },
  { id: "about",       el: $("#about") },
  { id: "contact",     el: $("#contact") },
];

function handleScroll() {
  const scrollY = window.scrollY;

  header.classList.toggle("scrolled", scrollY > 30);
  $("#toTop").classList.toggle("show", scrollY > 500);

  /* Highlight the link of the section currently on screen.
     Best sellers sits between handmade and gifts, so it keeps
     its own highlight only when no other section matches. */
  let current = "home";
  sections.forEach(({ id, el }) => {
    if (el && scrollY >= el.offsetTop - 160) current = id;
  });
  const best = $("#bestsellers");
  if (best && scrollY >= best.offsetTop - 160 && current === "gifts") current = "bestsellers";

  $$(".nav-link").forEach((link) =>
    link.classList.toggle("active", link.getAttribute("href") === "#" + current)
  );
}

window.addEventListener("scroll", handleScroll, { passive: true });
$("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* Close cart/menu with the Escape key */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeCart(); closeMenu(); }
});

/* ============================================================
   4. BEST-SELLER CATEGORY FILTER 🌸 vs 🧁
   ============================================================ */
function setupFilters() {
  const chips = $$(".chip");
  if (chips.length === 0) return;

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");

      const filter = chip.dataset.filter;
      $$(".best-card").forEach((card) => {
        const show = filter === "all" || card.dataset.cat === filter;
        card.classList.toggle("hidden-card", !show);
        if (show) {
          card.classList.remove("visible");
          requestAnimationFrame(() => card.classList.add("visible"));
        }
      });
    });
  });
}

/* ============================================================
   5. ANIMATIONS ✨
   ============================================================ */

/* 5a. Falling petals & sprinkles in the hero banner */
function createPetals() {
  const box = $("#petals");
  if (!box) return;
  const treats = ["🌸", "🌷", "🌹", "🧁", "🍪", "💮", "✿", "🍰"];
  const count = window.innerWidth < 700 ? 9 : 18;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.textContent = treats[Math.floor(Math.random() * treats.length)];
    petal.style.left = Math.random() * 100 + "%";
    petal.style.fontSize = 12 + Math.random() * 20 + "px";
    petal.style.animationDuration = 9 + Math.random() * 12 + "s";
    petal.style.animationDelay = -Math.random() * 18 + "s";
    box.appendChild(petal);
  }
}

/* 5b. Reveal elements when they scroll into view */
function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => observer.observe(el));
}

/* 5c. Count-up numbers in the About section */
function setupCounters() {
  const nums = $$(".stat-num");
  if (nums.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);

        const target = Number(el.dataset.target || 0);
        const suffix = el.dataset.suffix || "";
        const duration = 1600;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); /* smooth ease-out */
          el.textContent = Math.round(target * eased).toLocaleString("en-IN") + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.4 }
  );
  nums.forEach((n) => observer.observe(n));
}

/* ============================================================
   6. FORMS 📨
   ============================================================ */
$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name  = $("#cName").value.trim();
  const email = $("#cEmail").value.trim();
  const msg   = $("#cMsg").value.trim();

  if (!name || !email || !msg) return showToast("🌸 Please fill in all the fields");
  if (!/^\S+@\S+\.\S+$/.test(email)) return showToast("✉️ Please enter a valid email address");

  e.target.reset();
  showToast(`💌 Thank you, ${name}! Samiya will reply very soon.`);
});

$("#newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("#nlEmail").value.trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) return showToast("✉️ Please enter a valid email address");
  e.target.reset();
  showToast("🌼 You're subscribed! Sweet news is on the way.");
});

/* ============================================================
   7. IMAGE FALLBACK — drawn treats & flowers 🎨
   If an online photo ever fails to load, we draw a pretty
   rose / cupcake / cookie / keychain instead using SVG.
   ============================================================ */
function shade(hex, percent) {
  /* percent > 0 makes it lighter, < 0 darker */
  const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  r = Math.round((t - r) * p + r);
  g = Math.round((t - g) * p + g);
  b = Math.round((t - b) * p + b);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function flowerArt(type, color) {
  const defs = `
    <defs>
      <radialGradient id="bg" cx="50%" cy="30%" r="90%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fff3ea"/>
      </radialGradient>
      <radialGradient id="bloom" cx="38%" cy="32%" r="80%">
        <stop offset="0%" stop-color="${shade(color, 55)}"/>
        <stop offset="55%" stop-color="${color}"/>
        <stop offset="100%" stop-color="${shade(color, -28)}"/>
      </radialGradient>
    </defs>`;

  let art = "";

  if (type === "cupcake") {
    art = `
      <path d="M138 210 L152 330 Q200 348 248 330 L262 210 Z" fill="#e8c9a8"/>
      <path d="M138 210 L152 330 Q200 348 248 330 L262 210 Z" fill="none" stroke="#d3ae87" stroke-width="4"/>
      <path d="M130 210 Q122 150 160 128 Q158 92 200 88 Q242 92 240 128 Q278 150 270 210 Q236 228 200 220 Q164 228 130 210 Z" fill="url(#bloom)"/>
      <circle cx="200" cy="86" r="14" fill="${shade(color, -30)}"/>
      <circle cx="182" cy="160" r="4" fill="#fff" opacity=".8"/>
      <circle cx="220" cy="180" r="4" fill="#fff" opacity=".8"/>
      <circle cx="205" cy="140" r="4" fill="#fff" opacity=".8"/>`;
  } else if (type === "cake") {
    art = `
      <rect x="110" y="230" width="180" height="70" rx="14" fill="#f3ddc2"/>
      <rect x="110" y="196" width="180" height="44" rx="14" fill="url(#bloom)"/>
      <rect x="110" y="150" width="180" height="52" rx="16" fill="#fdf1e2"/>
      <path d="M110 176 Q130 196 150 176 Q170 196 190 176 Q210 196 230 176 Q250 196 270 176 Q282 190 290 176 L290 156 Q290 146 278 146 L122 146 Q110 146 110 158 Z" fill="#fff" opacity=".9"/>
      <circle cx="200" cy="126" r="13" fill="#e0245e"/>
      <path d="M200 116 q6 -12 14 -14 q-2 10 -12 16" fill="#5aa06e"/>`;
  } else if (type === "cookie") {
    art = `
      <circle cx="200" cy="200" r="92" fill="#e3b578"/>
      <circle cx="200" cy="200" r="92" fill="none" stroke="#cf9a58" stroke-width="6"/>
      <circle cx="165" cy="170" r="13" fill="#5e3d2c"/>
      <circle cx="232" cy="160" r="11" fill="#5e3d2c"/>
      <circle cx="245" cy="222" r="13" fill="#5e3d2c"/>
      <circle cx="188" cy="238" r="11" fill="#5e3d2c"/>
      <circle cx="152" cy="212" r="9" fill="#5e3d2c"/>
      <circle cx="212" cy="196" r="9" fill="#5e3d2c"/>`;
  } else if (type === "brownie") {
    art = `
      <rect x="112" y="150" width="176" height="118" rx="20" fill="#5e3d2c"/>
      <rect x="126" y="164" width="148" height="90" rx="14" fill="#7a5240"/>
      <circle cx="168" cy="196" r="10" fill="#3f2718"/>
      <circle cx="222" cy="216" r="12" fill="#3f2718"/>
      <circle cx="240" cy="182" r="8" fill="#3f2718"/>
      <circle cx="196" cy="238" r="7" fill="#3f2718"/>
      <rect x="112" y="150" width="176" height="24" rx="12" fill="#8f6349"/>`;
  } else if (type === "keychain") {
    art = `
      <circle cx="200" cy="120" r="34" fill="none" stroke="#c9a227" stroke-width="9"/>
      <rect x="193" y="150" width="14" height="26" rx="6" fill="#c9a227"/>
      <g>
        <ellipse cx="200" cy="216" rx="26" ry="40" fill="url(#bloom)" transform="rotate(0 200 246)"/>
        <ellipse cx="200" cy="216" rx="26" ry="40" fill="url(#bloom)" transform="rotate(72 200 246)"/>
        <ellipse cx="200" cy="216" rx="26" ry="40" fill="url(#bloom)" transform="rotate(144 200 246)"/>
        <ellipse cx="200" cy="216" rx="26" ry="40" fill="url(#bloom)" transform="rotate(216 200 246)"/>
        <ellipse cx="200" cy="216" rx="26" ry="40" fill="url(#bloom)" transform="rotate(288 200 246)"/>
        <circle cx="200" cy="246" r="18" fill="${shade(color, 40)}"/>
      </g>`;
  } else if (type === "tulip") {
    art = `
      <path d="M200 250 C 196 300 202 340 200 380" stroke="#5aa06e" stroke-width="11" fill="none" stroke-linecap="round"/>
      <ellipse cx="152" cy="320" rx="34" ry="15" fill="#6cb47f" transform="rotate(-25 152 320)"/>
      <ellipse cx="250" cy="345" rx="30" ry="13" fill="#6cb47f" transform="rotate(22 250 345)"/>
      <path d="M200 95 C 240 130 250 190 240 232 C 232 265 168 265 160 232 C 150 190 160 130 200 95 Z" fill="url(#bloom)" transform="rotate(-26 200 240)"/>
      <path d="M200 95 C 240 130 250 190 240 232 C 232 265 168 265 160 232 C 150 190 160 130 200 95 Z" fill="url(#bloom)" transform="rotate(26 200 240)"/>
      <path d="M200 85 C 242 125 252 190 242 235 C 234 270 166 270 158 235 C 148 190 158 125 200 85 Z" fill="url(#bloom)"/>`;
  } else if (type === "sunflower") {
    let petals = "";
    for (let i = 0; i < 14; i++) {
      petals += `<ellipse cx="200" cy="112" rx="17" ry="58" fill="url(#bloom)" stroke="${shade(color, -20)}" stroke-width="1.5" transform="rotate(${(i * 360) / 14} 200 180)"/>`;
    }
    art = `
      <path d="M200 250 C 196 300 202 340 200 380" stroke="#5aa06e" stroke-width="11" fill="none" stroke-linecap="round"/>
      <ellipse cx="152" cy="320" rx="34" ry="15" fill="#6cb47f" transform="rotate(-25 152 320)"/>
      ${petals}
      <circle cx="200" cy="180" r="52" fill="#6b4226"/>
      <circle cx="200" cy="180" r="36" fill="#8a5a33"/>
      <circle cx="200" cy="180" r="18" fill="#5b3520"/>`;
  } else {
    /* rose (default) */
    let outer = "", inner = "";
    for (let i = 0; i < 8; i++) outer += `<ellipse cx="200" cy="128" rx="46" ry="66" fill="url(#bloom)" opacity="0.95" transform="rotate(${i * 45} 200 178)"/>`;
    for (let i = 0; i < 6; i++) inner += `<ellipse cx="200" cy="145" rx="30" ry="46" fill="${shade(color, i % 2 ? 14 : -10)}" opacity="0.95" transform="rotate(${i * 60 + 30} 200 178)"/>`;
    art = `
      <path d="M200 250 C 196 300 202 340 200 380" stroke="#5aa06e" stroke-width="11" fill="none" stroke-linecap="round"/>
      <ellipse cx="152" cy="320" rx="34" ry="15" fill="#6cb47f" transform="rotate(-25 152 320)"/>
      ${outer}
      ${inner}
      <circle cx="200" cy="178" r="26" fill="${shade(color, -32)}"/>
      <circle cx="200" cy="178" r="14" fill="${shade(color, 30)}"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">${defs}<rect width="400" height="400" fill="url(#bg)"/>${art}<ellipse cx="200" cy="384" rx="85" ry="9" fill="#6b4f45" opacity="0.08"/></svg>`;

  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function setupImageFallbacks() {
  $$("img[data-type]").forEach((img) => {
    const applyFallback = () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = "1";
      img.src = flowerArt(img.dataset.type, img.dataset.color || "#f6b4c9");
    };
    img.addEventListener("error", applyFallback);
    /* In case the image was already broken before we attached the listener */
    if (img.complete && img.naturalWidth === 0) applyFallback();
  });
}

/* ============================================================
   8. START EVERYTHING 🚀
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  renderCart();
  createPetals();
  setupReveal();
  setupCounters();
  setupFilters();
  setupImageFallbacks();
  handleScroll();
  $("#year").textContent = new Date().getFullYear();
});
