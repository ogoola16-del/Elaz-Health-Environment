const { exec } = require("child_process");

function backupDatabase() {

    const now = new Date();

    const timestamp =
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0") + "_" +
        String(now.getHours()).padStart(2, "0") + "-" +
        String(now.getMinutes()).padStart(2, "0");


    const command =
        `C:\\xampp\\mysql\\bin\\mysqldump.exe -u root ecg_db > backups\\ecg_db_${timestamp}.sql`;


    exec(command, (err) => {

        if (err) {

            console.error(
                "Backup failed:",
                err.message
            );

            return;
        }


        console.log(
            "Database backup created successfully."
        );

    });

}


module.exports = backupDatabase;