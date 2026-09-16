/* ============================================================
   Starkly Healthcare — doctors.js
   Doctor directory: data, filtering, search, detail modal.
   ============================================================ */
(function () {
  "use strict";

  const DOCTORS = [
    { name: "Dr. Anitha Ramesh", qual: "MBBS, MD (Cardiology), FACC", dept: "Cardiology", spec: "Interventional Cardiology", exp: 18, avail: "Mon – Sat", on: true },
    { name: "Dr. Vikram Surya", qual: "MBBS, DM (Neurology)", dept: "Neurology", spec: "Stroke & Epilepsy Care", exp: 14, avail: "Tue – Sun", on: true },
    { name: "Dr. Meera Krishnan", qual: "MBBS, MS (Ortho), FRCS", dept: "Orthopedics", spec: "Joint Replacement", exp: 16, avail: "Mon – Fri", on: true },
    { name: "Dr. Arjun Prakash", qual: "MBBS, MD (Pediatrics)", dept: "Pediatrics", spec: "Neonatology", exp: 11, avail: "Mon – Sat", on: false },
    { name: "Dr. Kavitha Suresh", qual: "MBBS, MD (Oncology)", dept: "Oncology", spec: "Medical Oncology", exp: 15, avail: "Wed – Sun", on: true },
    { name: "Dr. Rohit Venkat", qual: "MBBS, MD (Emergency Medicine)", dept: "Emergency", spec: "Critical Care", exp: 9, avail: "24 × 7 Rota", on: true },
    { name: "Dr. Divya Shankar", qual: "MBBS, MD (Pathology)", dept: "Laboratory", spec: "Clinical Pathology", exp: 12, avail: "Mon – Sat", on: true },
    { name: "Dr. Sanjay Balaji", qual: "MBBS, MD (Cardiology)", dept: "Cardiology", spec: "Preventive Cardiology", exp: 20, avail: "Mon – Thu", on: false },
    { name: "Dr. Nithya Raman", qual: "MBBS, DNB (Neurology)", dept: "Neurology", spec: "Movement Disorders", exp: 10, avail: "Tue – Sat", on: true },
    { name: "Dr. Karthik Raja", qual: "MBBS, MS (Ortho)", dept: "Orthopedics", spec: "Sports Medicine", exp: 8, avail: "Mon – Sat", on: true },
    { name: "Dr. Priya Anand", qual: "MBBS, DCH", dept: "Pediatrics", spec: "Child Immunisation", exp: 13, avail: "Mon – Fri", on: true },
    { name: "Dr. Suresh Menon", qual: "MBBS, MCh (Surgical Oncology)", dept: "Oncology", spec: "Surgical Oncology", exp: 17, avail: "Wed – Sat", on: true }
  ];

  const GRADIENTS = {
    Cardiology: "linear-gradient(135deg,#0e4d78,#e0503c)",
    Neurology: "linear-gradient(135deg,#0a3a5c,#1b84c4)",
    Orthopedics: "linear-gradient(135deg,#087878,#2bc0be)",
    Pediatrics: "linear-gradient(135deg,#1166a0,#f0a63c)",
    Oncology: "linear-gradient(135deg,#06283f,#0b8f8f)",
    Emergency: "linear-gradient(135deg,#0a3a5c,#e0503c)",
    Laboratory: "linear-gradient(135deg,#0e4d78,#12a5a5)"
  };

  const grid = document.querySelector("#doctor-grid");
  if (!grid) return;

  const initials = (name) =>
    name.replace(/^Dr\.\s*/, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const cardHTML = (d, i) => `
    <article class="doctor-card" style="--i:${i}" data-dept="${d.dept}" data-name="${d.name.toLowerCase()} ${d.spec.toLowerCase()}">
      <div class="doctor-photo" style="background:${GRADIENTS[d.dept] || GRADIENTS.Laboratory}">
        <span class="avail ${d.on ? "" : "off"}">${d.on ? "Available" : "On Leave"}</span>
        <div class="avatar">${initials(d.name)}</div>
      </div>
      <div class="doctor-body">
        <h3>${d.name}</h3>
        <p class="doctor-qual">${d.qual}</p>
        <span class="tag">${d.spec}</span>
        <div class="doctor-meta">
          <div><strong>${d.exp}+ yrs</strong>Experience</div>
          <div><strong>${d.avail}</strong>Availability</div>
        </div>
        <button class="btn btn--outline" data-doctor="${i}">View Profile</button>
      </div>
    </article>`;

  grid.innerHTML = DOCTORS.map(cardHTML).join("");

  /* ----- Filters + search ----- */
  const chips = [...document.querySelectorAll("[data-filter]")];
  const search = document.querySelector("#doctor-search");
  const noRes = document.querySelector(".no-results");
  let activeDept = "All";
  let query = "";

  function applyFilter() {
    let visible = 0;
    [...grid.children].forEach((card) => {
      const deptOk = activeDept === "All" || card.dataset.dept === activeDept;
      const qOk = !query || card.dataset.name.includes(query);
      const show = deptOk && qOk;
      card.classList.toggle("hidden", !show);
      if (show) visible++;
    });
    noRes.classList.toggle("hidden", visible > 0);
  }

  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      activeDept = chip.dataset.filter;
      applyFilter();
    })
  );
  if (search) search.addEventListener("input", () => {
    query = search.value.trim().toLowerCase();
    applyFilter();
  });

  /* ----- Detail modal ----- */
  const overlay = document.querySelector(".modal-overlay");
  const modal = document.querySelector(".modal");

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-doctor]");
    if (!btn) return;
    const d = DOCTORS[+btn.dataset.doctor];
    modal.innerHTML = `
      <button class="modal-close" aria-label="Close profile">&times;</button>
      <div class="doctor-photo" style="background:${GRADIENTS[d.dept] || GRADIENTS.Laboratory}">
        <div class="avatar">${initials(d.name)}</div>
      </div>
      <h3>${d.name}</h3>
      <p class="doctor-qual">${d.qual}</p>
      <span class="tag">${d.dept}</span>
      <ul class="modal-list">
        <li><span>Specialisation</span><strong>${d.spec}</strong></li>
        <li><span>Experience</span><strong>${d.exp}+ years</strong></li>
        <li><span>Consultation Days</span><strong>${d.avail}</strong></li>
        <li><span>Status</span><strong>${d.on ? "Consulting now" : "Currently on leave"}</strong></li>
      </ul>
      <a class="btn btn--primary" href="appointment.html" style="width:100%">Book Appointment</a>`;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-close").addEventListener("click", closeModal);
  });

  function closeModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
  });
})();
