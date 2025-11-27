// wire Get Started buttons to scroll to Featured Recipes
(function () {
  const scrollToRecipes = () => {
    const target = document.getElementById("recipes");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  ["getStartedBtn", "getStartedMobile", "getStartedMobileMenu"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (el)
        el.addEventListener("click", (e) => {
          e.preventDefault();
          scrollToRecipes();
          // close mobile menu if open
          const mobileMenu = document.getElementById("mobileMenu");
          const mobileBtn = document.getElementById("mobileMenuBtn");
          if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
            mobileMenu.classList.add("hidden");
            if (mobileBtn) {
              document
                .getElementById("hamburgerOpen")
                ?.classList.remove("hidden");
              document
                .getElementById("hamburgerClose")
                ?.classList.add("hidden");
              mobileBtn.setAttribute("aria-expanded", "false");
            }
          }
        });
    }
  );
})();

// --------------------- UTILS & DOM READY ---------------------
document.addEventListener("DOMContentLoaded", () => {
  const recipeGrid = document.getElementById("recipeGrid");
  const heroSearch = document.getElementById("heroSearch");
  const modalRoot = document.getElementById("modal");
  const categoriesSection = document.getElementById("categories");

  if (!recipeGrid) {
    console.error("render error: #recipeGrid not found");
    return;
  }

  // Mobile menu toggle (already inlined in HTML too - safe to keep)
  (function () {
    const btn = document.getElementById("mobileMenuBtn");
    const menu = document.getElementById("mobileMenu");
    const open = document.getElementById("hamburgerOpen");
    const close = document.getElementById("hamburgerClose");
    if (btn && menu) {
      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));
        menu.classList.toggle("hidden");
        open.classList.toggle("hidden");
        close.classList.toggle("hidden");
      });
    }
  })();

  // Modal handlers
  (function () {
    const modal = document.getElementById("modal");
    const close = document.getElementById("closeModal");
    if (close && modal) {
      close.addEventListener("click", () => modal.classList.add("hidden"));
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.add("hidden");
      });
    }

    window.openRecipeModal = function ({
      title = "",
      category = "",
      image = "",
      ingredients = [],
      instructions = [],
    }) {
      document.getElementById("modalTitle").textContent = title;
      document.getElementById("modalCategory").textContent = category;
      document.getElementById("modalImage").src = image || "";
      const ingEl = document.getElementById("modalIngredients");
      const insEl = document.getElementById("modalInstructions");
      ingEl.innerHTML = ingredients
        .map((i) => `<li>• ${escapeHtml(i)}</li>`)
        .join("");
      insEl.innerHTML = instructions
        .map((s, i) => `<li>${i + 1}. ${escapeHtml(s)}</li>`)
        .join("");
      modal.classList.remove("hidden");
    };
  })();

  // find search button robustly
  let searchButton = null;
  if (heroSearch && heroSearch.parentElement) {
    searchButton = heroSearch.parentElement.querySelector("button");
  }
  searchButton = searchButton || document.querySelector("#home button");

  // create a small "Show All" button next to the main search button (only if not already present)
  let showAllBtn = document.getElementById("showAllBtn");
  if (!showAllBtn && searchButton && searchButton.parentElement) {
    showAllBtn = document.createElement("button");
    showAllBtn.id = "showAllBtn";
    showAllBtn.type = "button";
    showAllBtn.title = "Show all recipes";
    showAllBtn.className =
      "ml-3 px-4 py-2 rounded-xl border border-gray-200 text-sm hover:shadow-sm transition";
    showAllBtn.textContent = "Show All";
    searchButton.parentElement.appendChild(showAllBtn);
  }

  // create suggestions container under the search input if not present
  let suggestionsBox = document.getElementById("searchSuggestions");
  if (!suggestionsBox && heroSearch && heroSearch.parentElement) {
    suggestionsBox = document.createElement("ul");
    suggestionsBox.id = "searchSuggestions";
    suggestionsBox.setAttribute("role", "listbox");
    suggestionsBox.setAttribute("aria-label", "Search suggestions");
    suggestionsBox.style.position = "absolute";
    suggestionsBox.style.zIndex = "999";
    suggestionsBox.style.listStyle = "none";
    suggestionsBox.style.margin = "6px 0 0 0";
    suggestionsBox.style.padding = "6px";
    suggestionsBox.style.width = heroSearch.offsetWidth
      ? heroSearch.offsetWidth + "px"
      : "320px";
    suggestionsBox.style.background = "white";
    suggestionsBox.style.border = "1px solid #e5e7eb";
    suggestionsBox.style.borderRadius = "8px";
    suggestionsBox.style.boxShadow = "0 6px 18px rgba(0,0,0,0.08)";
    suggestionsBox.style.maxHeight = "220px";
    suggestionsBox.style.overflowY = "auto";
    const parent = heroSearch.parentElement;
    if (getComputedStyle(parent).position === "static")
      parent.style.position = "relative";
    parent.appendChild(suggestionsBox);
  }

  let currentQuery = "";

  // --------------------- RENDER & HIGHLIGHT ---------------------
  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function highlightText(text, q) {
    if (!q) return escapeHtml(text);
    const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQ, "ig");
    return escapeHtml(text).replace(
      regex,
      (match) => `<mark class="bg-yellow-200 rounded-sm px-1">${match}</mark>`
    );
  }

  function renderRecipes(list = recipes) {
    recipeGrid.innerHTML = "";
    if (!list || list.length === 0) {
      const empty = document.createElement("div");
      empty.className = "col-span-full text-center py-20 text-gray-500";
      empty.innerHTML = `<p class="text-xl">No recipes found. Try different keywords or click "Show All".</p>`;
      recipeGrid.appendChild(empty);
      return;
    }

    list.forEach((recipe) => {
      const card = document.createElement("div");
      card.className =
        "bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition";

      const titleHtml = highlightText(recipe.title, currentQuery);

      card.innerHTML = `
        <img src="${
          recipe.image
        }" class="w-full h-56 object-cover" alt="${escapeHtml(recipe.title)}">
        <div class="p-6">
          <h3 class="text-xl font-bold recipe-title">${titleHtml}</h3>
          <p class="text-gray-600 text-sm recipe-category">${escapeHtml(
            recipe.category
          )}</p>
          <button class="mt-4 px-4 py-2 bg-orange-500 text-white rounded-full view-btn">View</button>
        </div>
      `;

      // click card to show modal
      card.addEventListener("click", () => showModal(recipe));

      // safe: also make the small "View" button open modal
      const btn = card.querySelector(".view-btn");
      if (btn)
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          showModal(recipe);
        });

      recipeGrid.appendChild(card);
    });
  }

  // --------------------- MODAL ---------------------
  function showModal(recipe) {
    const titleEl = document.getElementById("modalTitle");
    const catEl = document.getElementById("modalCategory");
    const imgEl = document.getElementById("modalImage");
    const ingrEl = document.getElementById("modalIngredients");
    const instrEl = document.getElementById("modalInstructions");

    if (titleEl) titleEl.textContent = recipe.title;
    if (catEl) catEl.textContent = recipe.category.toUpperCase();
    if (imgEl) imgEl.src = recipe.image;
    if (ingrEl)
      ingrEl.innerHTML = recipe.ingredients
        .map((i) => `<li>• ${escapeHtml(i)}</li>`)
        .join("");
    if (instrEl)
      instrEl.innerHTML = recipe.instructions
        .map((s, i) => `<li>${i + 1}. ${escapeHtml(s)}</li>`)
        .join("");

    if (modalRoot) modalRoot.classList.remove("hidden");
  }

  const closeModalBtn = document.getElementById("closeModal");
  if (closeModalBtn)
    closeModalBtn.onclick = () => {
      if (modalRoot) modalRoot.classList.add("hidden");
    };
  if (modalRoot)
    modalRoot.onclick = (e) => {
      if (e.target === modalRoot) modalRoot.classList.add("hidden");
    };

  // --------------------- SEARCH ---------------------
  const categoryList = [
    "breakfast",
    "lunch",
    "dinner",
    "dessert",
    "snack",
    "drinks",
    "beverage",
  ];

  function normalize(s = "") {
    return String(s).toLowerCase().trim();
  }

  function searchRecipes(query) {
    if (!query || !query.trim()) return recipes;
    const q = normalize(query);
    return recipes.filter((r) => {
      const t = normalize(r.title);
      const c = normalize(r.category);
      return (
        t.includes(q) || c.includes(q) || (categoryList.includes(q) && c === q)
      );
    });
  }

  // --------------------- SUGGESTIONS (with keyboard nav) ---------------------
  let suggestionItems = [];
  let activeSuggestion = -1;

  function setActiveSuggestion(idx) {
    if (!suggestionItems || suggestionItems.length === 0) return;
    if (activeSuggestion >= 0 && suggestionItems[activeSuggestion])
      suggestionItems[activeSuggestion].style.background = "transparent";
    activeSuggestion = idx;
    if (activeSuggestion >= 0 && suggestionItems[activeSuggestion]) {
      suggestionItems[activeSuggestion].style.background = "#f1f5f9";
      const el = suggestionItems[activeSuggestion];
      if (el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
    }
  }

  function clearSuggestions() {
    if (!suggestionsBox) return;
    suggestionsBox.innerHTML = "";
    suggestionItems = [];
    activeSuggestion = -1;
    suggestionsBox.style.display = "none";
  }

  function buildSuggestions(query) {
    if (!suggestionsBox) return;
    suggestionsBox.innerHTML = "";
    suggestionItems = [];
    activeSuggestion = -1;

    if (!query || !query.trim()) {
      suggestionsBox.style.display = "none";
      return;
    }
    const q = normalize(query);

    const titleMatches = [];
    const catMatches = new Set();

    for (let r of recipes) {
      const t = normalize(r.title);
      const c = normalize(r.category);

      if (t.startsWith(q) || t.includes(q)) {
        if (!titleMatches.find((x) => x.title === r.title))
          titleMatches.push({ type: "title", title: r.title });
      }
      if (c.startsWith(q) || c === q) catMatches.add(c);
      if (titleMatches.length >= 6) break;
    }

    const suggestions = titleMatches
      .slice(0, 6)
      .map((x) => ({ label: x.title, kind: "title" }))
      .concat(
        Array.from(catMatches)
          .slice(0, 4)
          .map((c) => ({ label: c, kind: "category" }))
      );

    if (!suggestions.length) {
      suggestionsBox.style.display = "none";
      return;
    }

    suggestions.forEach((s, i) => {
      const li = document.createElement("li");
      li.style.padding = "8px";
      li.style.cursor = "pointer";
      li.style.borderRadius = "6px";
      li.style.fontSize = "14px";
      li.tabIndex = 0;
      li.setAttribute("role", "option");
      li.dataset.index = String(i);

      li.innerHTML =
        s.kind === "category"
          ? `<strong>${escapeHtml(
              s.label
            )}</strong> <span style="color:#6b7280"> (category)</span>`
          : escapeHtml(s.label);

      li.addEventListener("mouseenter", () => setActiveSuggestion(i));
      li.addEventListener("mouseleave", () => {
        if (suggestionItems[i])
          suggestionItems[i].style.background = "transparent";
        activeSuggestion = -1;
      });

      li.addEventListener("click", () => {
        if (heroSearch) heroSearch.value = s.label;
        currentQuery = s.label;
        const results = searchRecipes(s.label);
        renderRecipes(results);
        suggestionsBox.style.display = "none";
        requestAnimationFrame(() =>
          setTimeout(() => {
            const section = document.getElementById("recipes");
            if (section)
              section.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 10)
        );
      });

      suggestionsBox.appendChild(li);
      suggestionItems.push(li);
    });

    suggestionsBox.style.display = "block";
  }

  // --------------------- DEBOUNCE HELPER ---------------------
  function debounce(fn, wait = 180) {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  // handle typed input: show suggestions + render filtered list but DO NOT scroll
  const handleTyped = () => {
    const q = heroSearch ? heroSearch.value : "";
    currentQuery = q;
    const results = searchRecipes(q);
    renderRecipes(results);
    buildSuggestions(q);
  };
  const debouncedHandleTyped = debounce(handleTyped, 160);

  // robust search+scroll (Enter / button / suggestion click / show all / category)
  function runSearchAndScroll(q) {
    currentQuery = q;
    const results = searchRecipes(q);
    renderRecipes(results);
    requestAnimationFrame(() =>
      setTimeout(() => {
        const section = document.getElementById("recipes");
        if (section)
          section.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 10)
    );
    if (suggestionsBox) suggestionsBox.style.display = "none";
  }

  // --------------------- EVENTS: input, keyboard, buttons ---------------------
  if (heroSearch) {
    heroSearch.addEventListener("input", debouncedHandleTyped);

    heroSearch.addEventListener("keydown", (e) => {
      const isSuggestionsVisible =
        suggestionsBox && suggestionsBox.style.display !== "none";

      if (e.key === "ArrowDown") {
        if (!isSuggestionsVisible) buildSuggestions(heroSearch.value);
        e.preventDefault();
        if (suggestionItems.length > 0) {
          const next =
            activeSuggestion + 1 < suggestionItems.length
              ? activeSuggestion + 1
              : 0;
          setActiveSuggestion(next);
        }
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (suggestionItems.length > 0) {
          const prev =
            activeSuggestion - 1 >= 0
              ? activeSuggestion - 1
              : suggestionItems.length - 1;
          setActiveSuggestion(prev);
        }
        return;
      }

      if (e.key === "Escape") {
        clearSuggestions();
        return;
      }

      if (e.key === "Enter") {
        if (
          isSuggestionsVisible &&
          activeSuggestion >= 0 &&
          suggestionItems[activeSuggestion]
        ) {
          e.preventDefault();
          suggestionItems[activeSuggestion].click();
          return;
        }
        e.preventDefault();
        const q = heroSearch.value;
        runSearchAndScroll(q);
        setTimeout(() => heroSearch.blur(), 50);
      }
    });

    heroSearch.addEventListener("focus", () => {
      const q = heroSearch.value || "";
      if (q.trim()) buildSuggestions(q);
    });

    heroSearch.addEventListener("blur", () => {
      setTimeout(() => {
        if (suggestionsBox) suggestionsBox.style.display = "none";
        activeSuggestion = -1;
      }, 150);
    });
  }

  if (searchButton) {
    searchButton.addEventListener("click", (e) => {
      e.preventDefault();
      const q = heroSearch ? heroSearch.value : "";
      runSearchAndScroll(q);
    });
  }

  if (showAllBtn) {
    showAllBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (heroSearch) heroSearch.value = "";
      currentQuery = "";
      renderRecipes(recipes);
      requestAnimationFrame(() =>
        setTimeout(() => {
          const section = document.getElementById("recipes");
          if (section)
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 10)
      );
      if (suggestionsBox) suggestionsBox.style.display = "none";
    });
  }

  // --------------------- CATEGORY CARD CLICK (filter + scroll) ---------------------
  if (categoriesSection) {
    const catCards = categoriesSection.querySelectorAll(".cat-card");
    catCards.forEach((card) => {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        let catText = "";
        const h3 = card.querySelector("h3");
        if (h3) catText = h3.textContent;
        else catText = card.textContent;
        const normalized = normalize(catText);
        currentQuery = normalized;
        if (heroSearch) heroSearch.value = normalized;
        const results = searchRecipes(normalized);
        renderRecipes(results);
        requestAnimationFrame(() =>
          setTimeout(() => {
            const section = document.getElementById("recipes");
            if (section)
              section.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 10)
        );
        if (suggestionsBox) suggestionsBox.style.display = "none";
      });
    });
  }

  // --------------------- INITIAL LOAD ---------------------
  renderRecipes(recipes);

  // expose for debug
  try {
    window.__recipes__ = recipes;
    window.__runSearch__ = runSearchAndScroll;
  } catch (e) {}
});
