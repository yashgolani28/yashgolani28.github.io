(function(){
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const label = document.getElementById("themeLabel");
  const year = document.getElementById("year");
  const copyEmail = document.getElementById("copyEmailBtn");

  const saved = localStorage.getItem("theme") || "dark";
  root.setAttribute("data-theme", saved);

  if (toggle){
    toggle.checked = saved === "light";
    if (label) label.textContent = toggle.checked ? "Light" : "Dark";

    toggle.addEventListener("change", () => {
      const next = toggle.checked ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      if (label) label.textContent = toggle.checked ? "Light" : "Dark";
    });
  }

  if (year) year.textContent = new Date().getFullYear();

  if (copyEmail){
    copyEmail.addEventListener("click", async () => {
      try{
        await navigator.clipboard.writeText("yashgolani287@gmail.com");
        alert("Email copied");
      }catch(e){
        alert("Copy failed");
      }
    });
  }

  // Highlight current nav item
  const path = location.pathname.split("/").pop() || "index.html";
  const current = document.querySelector(`.navLinks a[href="${path}"]`);
  if (current) current.setAttribute("aria-current", "page");
})();
