document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("fileInput");
    const uploadButton = document.getElementById("upload-btn");

    uploadButton.addEventListener("click", async function () {
        if (!fileInput.files.length) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        try {
            const response = await fetch("http://localhost:3000/upload", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                alert("File uploaded successfully!" + (result.message ? "\n" + result.message : ""));
            } else {
                alert("Failed to upload file.");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("An error occurred. Please try again.");
        }
    });
});
