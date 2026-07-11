function activateNavHighlight() {
  const pageToClassMap = {
    "index.html": "nav-link-home",
    "sport.html": "nav-link-sport",
    "live.html": "nav-link-live",
    "dz.html": "nav-link-dz",
    "card.html": "nav-link-card",
    "fish.html": "nav-link-fish",
    "dj.html": "nav-link-dj",
  };

  const path = window.location.pathname.toLowerCase();
  console.log("当前路径：", path);

  for (const route in pageToClassMap) {
    if (path.endsWith(route)) {
      const className = pageToClassMap[route];
      const activeLink = document.querySelector(`.${className}`);
      if (activeLink) {
        activeLink.classList.add("active");
      }
      break;
    }
  }
}