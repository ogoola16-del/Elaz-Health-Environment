const mqtt = require("mqtt");
const db = require("./db");
const activePatient = require("./activePatient");

// For now, we need a way to know which doctor we're handling data for
// Since MQTT doesn't carry doctor information, we'll use a configured default
// or accept data from any active patient
const client = mqtt.connect(
    "wss://broker.hivemq.com:8884/mqtt"
);


client.on("connect", () => {
    //console.log("Connected to MQTT");

    const topics = [
        "patient/ecg",
        "patient/data"
    ];

    client.subscribe(topics, (err, granted) => {
        if (err) {
            console.error("Subscription error:", err);
            return;
        }
        console.log("Subscribed to:", granted.map(g => g.topic).join(', '));
    });
});

client.on("message", (topic, message) => {

    const data = JSON.parse(message.toString());
    
    // NOTE: Since MQTT doesn't include doctorId, we need to handle this differently.
    // For now, we'll check if there are any active patients and use the first one.
    // In a production environment, you would need to include doctorId in the MQTT payload
    // or use a different mechanism to route data to the correct doctor.
    
    const allActive = activePatient.getAllActivePatients();
    const doctorIds = Object.keys(allActive);
    
    //console.log(`Received on ${topic}:`, data);

    switch (topic) {

        case "patient/ecg": {
            
            // Use the first active patient if available
            const patient = doctorIds.length > 0 ? allActive[doctorIds[0]] : null;
            //console.log("Active patient:", patient);
            
            if (!patient) {
                //console.warn("No active patient found for ECG data");
                // Still process the data but without patient_id
                data.samples.forEach(sample => {
                    db.query(
                        "INSERT INTO ecgdata (patient_id, ecg_value) VALUES (?, ?)",
                        [null, sample],
                        (err) => {
                            if (err) return console.log(err);
                        }
                    );
                });
            } else {
                data.samples.forEach(sample => {
                    db.query(
                        "INSERT INTO ecgdata (patient_id, ecg_value) VALUES (?, ?)",
                        [patient.patientId, sample],
                        (err) => {
                            if (err) return console.log(err);
                        }
                    );
                });
            }
            //console.log("ECG packet saved");
            break;
        }

        case "patient/data": {

            const patient = doctorIds.length > 0 ? allActive[doctorIds[0]] : null;
            
            if (!patient) {
                //console.warn("No active patient found for vitals data");
                // Still process but without patient_id
                db.query(
                    `INSERT INTO vitals_data
                    (patient_id, temperature, humidity, Air_Quality, bpm, spo2, bodyTemp)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        null,
                        data.temperature,
                        data.humidity,
                        data.aqi,
                        data.bpm,
                        data.spo2,
                        data.body_temp
                    ],
                    err => {
                        if (err) console.log(err);
                    }
                );
            } else {
                db.query(
                    `INSERT INTO vitals_data
                    (patient_id, temperature, humidity, Air_Quality, bpm, spo2, bodyTemp)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        patient.patientId,
                        data.temperature,
                        data.humidity,
                        data.aqi,
                        data.bpm,
                        data.spo2,
                        data.body_temp
                    ],
                    err => {
                        if (err) console.log(err);
                    }
                );
            }

            //console.log("Patient data saved");
            break;
        }
        
        default:
            //console.log("Unhandled topic:", topic);
    }

}); 