const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();

const backupDatabase = require("./backup");

// =========================
// MIDDLEWARE
// =========================

app.use(express.json());
app.use(cors());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// =========================
// ROUTES
// =========================

const organizationRoutes =
    require("./routes/organizationRoutes");

const patientRoutes =
    require("./routes/patientRoutes");

const patientsRoutes =
    require("./routes/patientsRoutes");

const historyRoutes =
    require("./routes/historyRoutes");

const doctorRoutes =
    require("./routes/doctorRoutes");

const commentRoutes =
    require("./routes/commentRoutes");

app.use(
    "/api/organization",
    organizationRoutes
);

app.use(
    "/api/doctor",
    doctorRoutes
);

app.use(
    "/api/patient",
    patientRoutes
);

app.use(
    "/api/patients",
    patientsRoutes
);

app.use(
    "/api/history",
    historyRoutes
);

app.use(
    "/api",
    commentRoutes
);

// =========================
// HOME PAGE
// =========================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});


//HEALTH CHECK
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// =========================
// MQTT
// =========================

require("./mqtt");

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// =========================
// DATABASE BACKUP
// =========================

process.on("SIGINT", () => {

    console.log(
        "\nCreating database backup..."
    );

    backupDatabase();

    setTimeout(() => {

        console.log("Goodbye.");

        process.exit();

    }, 2000);

});