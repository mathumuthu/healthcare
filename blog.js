/* ============================================================
   Starkly Healthcare — blog.js
   Blog grid: category filters + live search.
   ============================================================ */
(function () {
  "use strict";

  const grid = document.querySelector("#blog-grid");
  if (!grid) return;

  const chips = [...document.querySelectorAll("[data-filter]")];
  const search = document.querySelector("#blog-search");
  const noRes = document.querySelector(".no-results");
  let activeCat = "All";
  let query = "";

  function applyFilter() {
    let visible = 0;
    [...grid.children].forEach((card) => {
      const catOk = activeCat === "All" || card.dataset.cat === activeCat;
      const qOk = !query || card.dataset.search.includes(query);
      const show = catOk && qOk;
      card.classList.toggle("hidden", !show);
      if (show) visible++;
    });
    noRes.classList.toggle("hidden", visible > 0);
  }

  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      activeCat = chip.dataset.filter;
      applyFilter();
    })
  );
  if (search) search.addEventListener("input", () => {
    query = search.value.trim().toLowerCase();
    applyFilter();
  });
})();
