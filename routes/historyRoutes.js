const express = require("express");
const router = express.Router();

const db = require("../db");


// ============================================================
// SENSOR CONFIGURATION
// ============================================================

const sensorConfig = {

    ecg: {
        table: "ecgdata",
        column: "ecg_value"
    },

    spo2: {
        table: "vitals_data",
        column: "spo2"
    },

    bpm: {
        table: "vitals_data",
        column: "bpm"
    },

    aq: {
        table: "vitals_data",
        column: "Air_Quality"
    },

    hum: {
        table: "vitals_data",
        column: "humidity"
    },

    roomTemp: {
        table: "vitals_data",
        column: "temperature"
    },

    body_temp: {
        table: "vitals_data",
        column: "bodyTemp"
    }

};


// ============================================================
// GET SENSOR HISTORY
// ============================================================

router.get("/:type", (req, res) => {

    const { type } = req.params;

    const date = req.query.date;

    const patientId = req.query.patientId;

    const limit =
        parseInt(req.query.limit) || 500;


    if (!date) {

        return res.status(400).json({
            error: "Date is required"
        });

    }


    const config = sensorConfig[type];


    if (!config) {

        return res.status(400).json({
            error: "Invalid sensor type"
        });

    }


    const sql = `
        SELECT *
        FROM (
            SELECT
                \`${config.column}\` AS value,
                created_at
            FROM \`${config.table}\`
            WHERE patient_id = ?
            AND DATE(created_at) = ?
            AND \`${config.column}\` IS NOT NULL
            ORDER BY created_at DESC
            LIMIT ?
        ) AS recent
        ORDER BY created_at ASC
    `;


    db.query(
        sql,
        [patientId, date, limit],

        (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    error: "Database error"
                });

            }


            res.json(results);

        }
    );

});


module.exports = router;