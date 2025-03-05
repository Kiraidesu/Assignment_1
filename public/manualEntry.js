document.addEventListener("DOMContentLoaded", function () {
    function openManualEntry() {
        document.getElementById("entryModal").style.display = "block";
    }

    function closeManualEntry() {
        document.getElementById("entryModal").style.display = "none";
    }

    document.querySelector(".close").addEventListener("click", closeManualEntry);

    document.getElementById("entryForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const entity_name = document.getElementById("entityName").value;
        const criteria = document.getElementById("criteria").value;
        const score = parseFloat(document.getElementById("score").value);
        const weight = parseFloat(document.getElementById("weight").value);

        const entryData = { entity_name, criteria, score, weight };

        try {
            const response = await fetch("http://localhost:3000/score/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entryData)
            });

            if (response.ok) {
                alert("Entry submitted successfully!");
                closeManualEntry();
                document.getElementById("entryForm").reset();
            } else {
                alert("Failed to submit entry.");
            }
        } catch (error) {
            console.error("Error submitting entry:", error);
            alert("An error occurred. Please try again.");
        }
    });

    // Expose functions globally for button onclick events
    window.openManualEntry = openManualEntry;
    window.closeManualEntry = closeManualEntry;
});
