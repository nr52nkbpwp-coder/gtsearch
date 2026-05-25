const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const loading = document.getElementById("loading");

let timeout = null;

function normalize(text){
  return text.toLowerCase().trim();
}

async function searchItem(query){

  if(!query){
    results.innerHTML = `
      <div class="empty">
        Search Growtopia item...
      </div>
    `;
    return;
  }

  loading.classList.remove("hidden");

  try{

    const searchUrl =
      `https://corsproxy.io/?https://growtopia.fandom.com/api/v1/SearchSuggestions/List?query=${encodeURIComponent(query)}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if(!data.items || data.items.length === 0){

      results.innerHTML = `
        <div class="empty">
          Item not found.
        </div>
      `;

      loading.classList.add("hidden");
      return;
    }

    results.innerHTML = "";

    const sliced = data.items.slice(0, 12);

    for(const item of sliced){

      const title = item.title;

      try{

        const pageUrl =
          `https://corsproxy.io/?https://growtopia.fandom.com/wiki/${encodeURIComponent(title.replace(/ /g,"_"))}`;

        const html = await fetch(pageUrl).then(res => res.text());

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const img =
          doc.querySelector(".card-header img")?.src ||
          "";

        const rarityText =
          doc.querySelector('small')?.textContent ||
          "Rarity: Unknown";

        const description =
          doc.querySelector(".card-text")?.textContent?.trim() ||
          "No description.";

        const rarityMatch = rarityText.match(/\d+/);

        const rarity = rarityMatch
          ? rarityMatch[0]
          : "Unknown";

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `
          <img src="${img}" alt="${title}">
          <h2>${title}</h2>
          <div class="rarity">
            Rarity: ${rarity}
          </div>
          <div class="description">
            ${description}
          </div>
        `;

        results.appendChild(card);

      }catch(err){
        console.log(err);
      }

    }

  }catch(err){

    console.log(err);

    results.innerHTML = `
      <div class="empty">
        Failed to fetch data.
      </div>
    `;

  }

  loading.classList.add("hidden");
}

searchInput.addEventListener("input", () => {

  clearTimeout(timeout);

  timeout = setTimeout(() => {
    searchItem(normalize(searchInput.value));
  }, 400);

});

searchItem("");
