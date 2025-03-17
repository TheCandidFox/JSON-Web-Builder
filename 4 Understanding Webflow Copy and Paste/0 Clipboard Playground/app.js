document.addEventListener("DOMContentLoaded", function () {
    const pasteBox = document.getElementById("pasteBox");
    const testClipboardButton = document.getElementById("testClipboard");
    const resetButton = document.getElementById("reset");
    const banner = document.getElementById("banner");
    const payloadType = document.getElementById("payloadType");
    const payloadOutput = document.getElementById("payloadOutput");
    const imageContainer = document.getElementById("imageContainer");

    function updateBanner(type, message) {
        banner.className = `banner ${type}`;
        banner.textContent = message;
    }

    function resetUI() {
        updateBanner("green", "Ready for the next test!");
        pasteBox.value = "";
        payloadType.textContent = "None";
        payloadOutput.textContent = "None";
        imageContainer.innerHTML = "";
    }

    pasteBox.addEventListener("paste", function (event) {
        event.preventDefault();
        navigator.clipboard.readText().then(text => {
            if (!text.trim()) {
                updateBanner("red", "Error: Clipboard has data, but it's not plain text. Please click 'Test Clipboard'.");
            } else {
                payloadType.textContent = "text/plain";
                payloadOutput.textContent = text.length > 750 ? text.substring(0, 750) + "… [truncated]" : text;
                updateBanner("amber", "Payload Analysis");
            }
        }).catch(() => {
            updateBanner("red", "Error: Unable to access clipboard. Check permissions.");
        });
    });

    testClipboardButton.addEventListener("click", async function () {
        try {
            const clipboardItems = await navigator.clipboard.read();
            if (!clipboardItems.length) {
                updateBanner("red", "Error: Clipboard is empty.");
                return;
            }

            let foundData = false;

            for (const item of clipboardItems) {
                for (const type of item.types) {
                    
                    // ✅ Check for Raw Images (File System Copies)
                    if (type.startsWith("image/")) {
                        const blob = await item.getType(type);
                        const imgURL = URL.createObjectURL(blob);
                        imageContainer.innerHTML = `<img src="${imgURL}" alt="Clipboard Image">`;
                        payloadType.textContent = type;
                        payloadOutput.textContent = "Image detected.";
                        updateBanner("amber", "Payload Analysis");
                        foundData = true;
                        return; // Stop further processing
                    }

                    // ✅ Check for File References (Application Octet-Stream or Unknown)
                    if (type === "application/octet-stream" || type === "application/x-moz-file") {
                        updateBanner("red", "Error: Copied file from system is not accessible due to clipboard restrictions.");
                        payloadType.textContent = "File reference";
                        payloadOutput.textContent = "OS clipboard does not allow direct file access.";
                        foundData = true;
                        return;
                    }

                    // ✅ Check for Text/HTML (Google Image Copy Case)
                    if (type === "text/html") {
                        const blob = await item.getType(type);
                        const text = await blob.text();
                        const base64Match = text.match(/<img.*?src=["'](data:image\/.*?;base64,.*?)["']/);
                        if (base64Match) {
                            imageContainer.innerHTML = `<img src="${base64Match[1]}" alt="Extracted Image">`;
                            payloadType.textContent = "Image (extracted from text/html)";
                            payloadOutput.textContent = "Image detected via text/html.";
                            updateBanner("amber", "Payload Analysis");
                            foundData = true;
                            return;
                        }
                    }

                    // ✅ Fallback: If it's text-based, process as text
                    const blob = await item.getType(type);
                    const text = await blob.text();
                    payloadType.textContent = type;
                    payloadOutput.textContent = text.length > 750 ? text.substring(0, 750) + "… [truncated]" : text;
                    updateBanner("amber", "Payload Analysis");
                    foundData = true;
                }
            }

            // ✅ If No Recognized Data Found
            if (!foundData) {
                updateBanner("red", "Error: No valid clipboard data detected.");
            }

        } catch (error) {
            updateBanner("red", `Error: ${error.message}`);
        }
    });

    resetButton.addEventListener("click", resetUI);
});
