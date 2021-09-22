(() => {
    $$(".navbarItem").forEach(n => n.addEventListener("click", (e) => {
        window.location.pathname = e.target.attributes.target.value.toLowerCase();
    }));
})();