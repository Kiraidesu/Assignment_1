document.addEventListener("DOMContentLoaded", function () {
    const comparisonTable = document.getElementById("comparison-table");
    const showButton = document.getElementById("show-comparison");

    showButton.addEventListener("click", async function () {
        try {
            const response = await fetch("http://localhost:3000/comparative-analysis");
            const data = await response.json();
            
            if (data.length === 0) {
                comparisonTable.innerHTML = "<p>No data available for comparison.</p>";
                return;
            }
            
            let tableHTML = "<table border='1'><tr><th>Rank</th><th>Entity Name</th><th>Criteria</th><th>Score</th><th>Weight</th></tr>";
            data.forEach((row, index) => {
                tableHTML += `<tr><td>${index + 1}</td><td>${row.entity_name}</td><td>${row.criteria}</td><td>${row.score}</td><td>${row.weight}</td></tr>`;
            });
            tableHTML += "</table>";
            
            comparisonTable.innerHTML = tableHTML;
        } catch (error) {
            console.error("Error fetching comparative analysis:", error);
            comparisonTable.innerHTML = "<p>Error loading data.</p>";
        }
    });
});
