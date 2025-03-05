document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("export-pdf").addEventListener("click", async function () {
        window.location.href = "http://localhost:3000/export/pdf";
    });

    document.getElementById("export-excel").addEventListener("click", async function () {
        window.location.href = "http://localhost:3000/export/excel";
    });

    document.getElementById("share-report").addEventListener("click", function () {
        alert("Sharing feature coming soon!");
    });
});
