document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded and parsed. Script is running.");

    const button = document.getElementById("injectButton");

    if (!button) {
        console.error("Button element not found!");
        return;
    }

    button.addEventListener("click", function () {
        console.log("Button clicked. Fetching JSON...");

        fetch('output.json')
            .then(response => {
                console.log("Received response from JSON fetch.");
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("JSON successfully parsed:", data);

                // Update Navigation
                const nav = document.querySelector("nav");
                if (nav) {
                    console.log("Updating navigation...");
                    nav.innerHTML = data.navLinks.map(link => `<a href="${link.href}">${link.text}</a>`).join(" ");
                } else {
                    console.error("Navigation element not found!");
                }

                // Update Hero Section
                const hero = document.querySelector(".hero");
                if (hero) {
                    console.log("Updating hero section...");
                    hero.style.backgroundColor = data.heroSection.styles.backgroundColor;
                    hero.innerHTML = `
                        <h1 style="color: ${data.heroSection.styles.headingColor}; font-size: ${data.heroSection.styles.headingSize};">${data.heroSection.title}</h1>
                        <p style="color: ${data.heroSection.styles.textColor}; font-size: ${data.heroSection.styles.textSize};">${data.heroSection.text}</p>
                        <img src="${data.heroSection.image}" alt="Hero Image">
                    `;
                    console.log("Hero section successfully updated.");
                } else {
                    console.error("Hero section element not found!");
                }

            })
            .catch(err => {
                console.error("Error processing JSON:", err);
            });
    });

    console.log("Event listener added to button.");
});
