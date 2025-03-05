const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "scorecard_db",
    password: "0000",
    port: 5432,
});

app.use(express.json()); // Middleware to parse JSON requests

const multer = require("multer");
const csvParser = require("csv-parser");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const upload = multer({ dest: "uploads/" });


// 1️⃣ Add a new score
app.post("/score/add", async (req, res) => {
    try {
        const { entity_name, criteria, score, weight } = req.body;
		
		console.log("Received data:", req.body);


        const result = await pool.query(
            "INSERT INTO scores (entity_name, criteria, score, weight) VALUES ($1, $2, $3, $4) RETURNING *",
            [entity_name, criteria, score, weight]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2️⃣ Get scores for an entity
app.get("/score/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM scores WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Score not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3️⃣ Set weights dynamically (Improved)
app.post("/weights/set", async (req, res) => {
    try {
        const { criteria, weight } = req.body;
        const result = await pool.query(
            "UPDATE scores SET weight = $1 WHERE criteria = $2 RETURNING *",
            [weight, criteria]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Criteria not found" });
        }

        res.status(200).json({ message: "Weight updated successfully", updated_rows: result.rowCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4️⃣ Calculate final weighted score
app.get("/score/calculate/:entity_name", async (req, res) => {
    try {
        const { entity_name } = req.params;
        const result = await pool.query(
            "SELECT score, weight FROM scores WHERE entity_name = $1",
            [entity_name]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No scores found for this entity" });
        }

        let totalWeightedScore = 0;
        let totalWeight = 0;

        result.rows.forEach(row => {
            totalWeightedScore += row.score * row.weight;
            totalWeight += row.weight;
        });

        const finalScore = totalWeight ? totalWeightedScore / totalWeight : 0;
        res.json({ entity_name, final_score: finalScore });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// server run 
/*
app.get("/", (req, res) => {
    res.send("Server is running! API is ready.");
});
*/



// previous server start point (version_1)



// 5️⃣ Upload CSV/Excel file
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const fileExt = path.extname(req.file.originalname).toLowerCase();

        let results = [];

        if (fileExt === ".csv") {
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on("data", (row) => results.push(row))
                .on("end", async () => {
                    const { validData, invalidEntries } = validateData(results);
                    await insertData(validData);
                    res.status(200).json({ message: "CSV file processed successfully", valid_entries: validData.length, invalid_entries:invalidEntries.length });
                });
        } else if (fileExt === ".xlsx") {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);
            const worksheet = workbook.worksheets[0];
            
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    let rowData = {
                        entity_name: row.getCell(1).value,
                        criteria: row.getCell(2).value,
                        score: parseFloat(row.getCell(3).value),
                        weight: parseFloat(row.getCell(4).value)
                    };
                    results.push(rowData);
                }
            });
            
            const { validData, invalidEntries } = validateData(results);
            await insertData(validData);
            res.status(200).json({ message: "Excel file processed successfully", valid_entries: validData.length, invalid_entries : invalidEntries.length });
        } else {
            return res.status(400).json({ error: "Invalid file type. Upload a CSV or Excel file." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function validateData(data) {
    let validData = [];
    let invalidEntries = [];

    data.forEach(row => {
        if (!row.entity_name || !row.criteria || !row.score || !row.weight) {
            invalidEntries.push(row);
            return;
        }
        row.score = parseFloat(row.score);
        row.weight = parseFloat(row.weight);
        if (isNaN(row.score) || isNaN(row.weight)) {
            invalidEntries.push(row);
            return;
        }
        validData.push(row);
    });

    return { validData, invalidEntries };
}

async function insertData(data) {
    for (let row of data) {
        await pool.query(
            "INSERT INTO scores (entity_name, criteria, score, weight) VALUES ($1, $2, $3, $4)",
            [row.entity_name, row.criteria, row.score, row.weight]
        );
    }
}

// default run, path added
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve static files (HTML, CSS, JS) from 'public' directory
app.use(express.static(path.join(__dirname, "public")));

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
