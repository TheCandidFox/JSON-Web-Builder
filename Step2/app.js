const jsonFiles = ["output1.json", "output2.json", "output3.json"];
let currentIndex = -1;
let originalContent = "";

document.addEventListener("DOMContentLoaded", () => {
    originalContent = document.getElementById("dynamic-section").outerHTML;
});

document.getElementById("view-original").addEventListener("click", () => {
    document.getElementById("dynamic-section").outerHTML = originalContent;
    currentIndex = -1;
});

document.getElementById("next-btn").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % jsonFiles.length;
    loadJson(jsonFiles[currentIndex]);
});

document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentIndex <= 0) {
        document.getElementById("dynamic-section").outerHTML = originalContent;
        currentIndex = -1;
    } else {
        currentIndex--;
        loadJson(jsonFiles[currentIndex]);
    }
});

function loadJson(filename) {
    fetch(filename)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("dynamic-section").innerHTML = `
                <header style="background-color: ${data.header.backgroundColor}; color: ${data.header.textColor};">
                    <nav>
                        ${data.header.navLinks.map(link => `<a href="#">${link}</a>`).join(" ")}
                    </nav>
                </header>
                <section style="background-color: ${data.hero.backgroundColor}; color: ${data.hero.textColor};">
                    <h1>${data.hero.title}</h1>
                    <p>${data.hero.subtitle}</p>
                    <img src="${data.hero.image}" alt="Hero Image">
                </section>
            `;
        })
        .catch(error => console.error("Error loading JSON:", error));
}
