document.addEventListener("DOMContentLoaded", main);

function main() {
    // Grab DOM elements
    const elements = getElements();

    // Register event handlers
    setupPasteHandler(elements);
    setupTestClipboardButton(elements);
    setupResetButton(elements);
    setupJSONButton(elements);
    setupTestJSONButton(elements);


    // Initial UI State
    resetUI(elements);
}

// ---------------------------
// DOM ELEMENTS & UI HANDLERS
// ---------------------------

function getElements() {
    return {
        pasteBox: document.getElementById("pasteBox"),
        testClipboardButton: document.getElementById("testClipboard"),
        resetButton: document.getElementById("reset"),
        JSONButton: document.getElementById("JSON"),
        banner: document.getElementById("banner"),
        payloadType: document.getElementById("payloadType"),
        payloadOutput: document.getElementById("payloadOutput"),
        imageContainer: document.getElementById("imageContainer"),
        testJSONButton: document.getElementById("testJSON"),

    };
}

function setupPasteHandler({ pasteBox, banner, payloadType, payloadOutput, imageContainer }) {
    pasteBox.addEventListener("paste", async function (event) {
        event.preventDefault();
        imageContainer.innerHTML = "";

        try {
            const clipboardItems = await navigator.clipboard.read();
            const totalItems = clipboardItems.length;

            if (totalItems === 0) {
                updateBanner(banner, "red", "Error: Clipboard is empty.");
                return;
            }

            let totalVariations = 0;
            let foundText = false;
            let nonTextDetected = false;

            // First, check for disallowed types
            for (const item of clipboardItems) {
                for (const type of item.types) {
                    totalVariations++;
                    if (!type.startsWith("text/")) {
                        nonTextDetected = true;
                    }
                }
            }

            if (nonTextDetected) {
                updateBanner(
                    banner,
                    "red",
                    "Error: Clipboard contains non-text content. Please click 'Test Clipboard' to analyze."
                );
                payloadType.textContent = "Unsupported type";
                payloadOutput.textContent = "Use Test Clipboard to inspect non-text data.";
                return;
            }

            // Only render if all variations are text/*
            for (const item of clipboardItems) {
                for (const type of item.types) {
                    const blob = await item.getType(type);
                    const text = await blob.text();
                    displayClipboardItem({ type, content: text }, imageContainer);
                    foundText = true;
                }
            }

            if (foundText) {
                updateBanner(
                    banner,
                    "amber",
                    `Payload Analysis (${totalItems} item${totalItems !== 1 ? 's' : ''} – ${totalVariations} variation${totalVariations !== 1 ? 's' : ''})`
                );
                payloadType.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
                payloadOutput.textContent = "See items below ↓";
            }

        } catch (err) {
            updateBanner(banner, "red", `Error: ${err.message}`);
        }
    });
}



function setupTestClipboardButton(elements) {
    elements.testClipboardButton.addEventListener("click", () => analyzeClipboardPayload(elements));
}

function setupResetButton({ resetButton }) {
    resetButton.addEventListener("click", () => resetUI(getElements()));
}

function setupJSONButton({ JSONButton }) {
    JSONButton.addEventListener("click", pasteJSON);
}

function setupTestJSONButton({ testJSONButton, imageContainer }) {
    testJSONButton.addEventListener("click", async () => {
        imageContainer.innerHTML = ""; // Clear previous output
        alert("✅ JSON Testing In-Progres!");


        try {
            const clipboardItems = await navigator.clipboard.read();

            if (!clipboardItems.length) {
                alert("Clipboard is empty.");
                return;
            }

            for (const item of clipboardItems) {
                for (const type of item.types) {
                    const blob = await item.getType(type);
                    const text = await blob.text();

                    console.log(`📋 MIME: ${type}`);
                    console.log(text);

                    const block = document.createElement("div");
                    block.classList.add("clipboard-item");
                    block.innerHTML = `
                        <strong>Type:</strong> ${type}<br>
                        <pre>${text}</pre>
                        <hr>
                    `;
                    imageContainer.appendChild(block);
                }
            }
        } catch (err) {
            alert("Error reading clipboard: " + err.message);
        }
    });
}

// ---------------------------
// UI LOGIC
// ---------------------------

function updateBanner(banner, type, message) {
    banner.className = `banner ${type}`;
    banner.textContent = message;
}

function updatePayload(payloadType, payloadOutput, type, content) {
    payloadType.textContent = type;
    payloadOutput.textContent = content.length > 750 ? content.substring(0, 750) + "… [truncated]" : content;
}

function resetUI({ pasteBox, banner, payloadType, payloadOutput, imageContainer }) {
    updateBanner(banner, "green", "Ready for the next test!");
    pasteBox.value = "";
    payloadType.textContent = "None";
    payloadOutput.textContent = "None";
    imageContainer.innerHTML = "";
}

/*
// Modern version of copying JSON, will test to see if more than one variation appears on the clipboard
function pasteJSON() {
    const jsonObject = { message: "Hello" };
    const jsonString = JSON.stringify(jsonObject, null, 2);

    const blobJSON = new Blob([jsonString], { type: "application/json" });
    const blobPlain = new Blob([jsonString], { type: "text/plain" });

    navigator.clipboard.write([
        new ClipboardItem({
            "application/json": blobJSON,
            "text/plain": blobPlain // fallback
        })
    ]).then(() => {
        alert("✅ JSON copied to clipboard as application/json!");
    }).catch(err => {
        alert("❌ Failed to write to clipboard: " + err.message);
    });
} */

///* Mirrors webflow and flowbase JSON but not detectable via the "Test Clipboard" button in app
function pasteJSON() {
    const jsonObject = { message: "Hello" };
    const jsonString = JSON.stringify(jsonObject, null, 2);

    function onCopy(e) {
        e.preventDefault();
        e.clipboardData.setData("application/json", jsonString);
        //e.clipboardData.setData("text/plain", jsonString); // optional fallback
        document.removeEventListener("copy", onCopy); // clean up
        alert("✅ JSON copied to clipboard as application/json!");
    }

    document.addEventListener("copy", onCopy);
    document.execCommand("copy");
}
//*/

// ---------------------------
// CLIPBOARD ANALYSIS LOGIC
// ---------------------------

function displayImageItem({ type, blob }, container) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("clipboard-item");

    const label = document.createElement("strong");
    label.textContent = `Type: ${type}`;
    wrapper.appendChild(label);

    const img = document.createElement("img");
    const imgURL = URL.createObjectURL(blob);
    img.src = imgURL;
    img.alt = "Clipboard Image";
    
    img.style.maxWidth = "300px";
    img.style.display = "block";
    img.style.marginTop = "0.5em";

    wrapper.appendChild(img);
    wrapper.appendChild(document.createElement("hr"));

    container.appendChild(wrapper);
}

function displayClipboardItem({ type, content }, container) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("clipboard-item");

    if (type === "application/json") {
        const jsonContainer = document.createElement("div");
        jsonContainer.style.height = "300px";
        jsonContainer.style.border = "1px solid #ddd";
        jsonContainer.style.marginBottom = "1em";

        // ✅ Fix: include status line *inside* the string
        wrapper.innerHTML = `
            <strong>Type: ${type}</strong><br>
            <em>JSONEditor status: ${typeof JSONEditor}</em>
        `;
        wrapper.appendChild(jsonContainer);

        try {
            const parsedJSON = JSON.parse(content);
            const editor = new JSONEditor(jsonContainer, {
                mode: 'view',
                mainMenuBar: false
            });
            editor.set(parsedJSON);
        } catch (err) {
            wrapper.innerHTML += `<div style="color:red;">Error parsing JSON: ${err.message}</div>`;
        }

        container.appendChild(wrapper);
        return;
    }

    // fallback for all other types
    wrapper.innerHTML = `
        <strong>Type:</strong> ${type}<br>
        <pre>${content}</pre>
        <hr>
    `;
    container.appendChild(wrapper);
}



async function analyzeClipboardPayload({ banner, payloadType, payloadOutput, imageContainer }) {
    imageContainer.innerHTML = ""; // Clear previous

    try {
        const clipboardItems = await navigator.clipboard.read();
        const totalItems = clipboardItems.length;

        if (totalItems === 0) {
            updateBanner(banner, "red", "Error: Clipboard is empty.");
            return;
        }

        let totalVariations = 0;
        for (const item of clipboardItems) {
            totalVariations += item.types.length;
        }

        updateBanner(
            banner,
            "amber",
            `Payload Analysis (${totalItems} item${totalItems !== 1 ? 's' : ''} – ${totalVariations} variation${totalVariations !== 1 ? 's' : ''})`
        );

        payloadType.textContent = `${totalItems} item${totalItems > 1 ? 's' : ''}`;
        payloadOutput.textContent = "See items below ↓";

        for (const item of clipboardItems) {
            for (const type of item.types) {
                console.log("Detected MIME type:", type);

                const blob = await item.getType(type);
                const text = await blob.text();

                // Try to parse anything as JSON
                try {
                    const parsed = JSON.parse(text);
                    const pretty = JSON.stringify(parsed, null, 2);
                    displayClipboardItem({ type: "application/json", content: pretty }, imageContainer);
                    continue; // ✅ skip further fallback if JSON worked
                } catch (e) {
                    // Not JSON — proceed to handle as image or text
                }

                if (type.startsWith("image/")) {
                    displayImageItem({ type, blob }, imageContainer);
                } else {
                    displayClipboardItem({ type, content: text }, imageContainer);
                }
            }
        }

    } catch (error) {
        updateBanner(banner, "red", `Error: ${error.message}`);
    }
}
