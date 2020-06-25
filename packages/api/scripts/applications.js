import {
    addApplicationInfo,
    getUserQuery,
    processFile,
    saveReefQuery,
    saveUserQuery,
    surveyFilePath,
    verifyImportFilesExist,
} from './import-utils'
import { runSqlQuery, connectToPostgres } from './db-utils'


function getDepth(depthRange) {
    const depthArray = depthRange.replace('-', ' ')
        .match(/\d+/g) || []
            .map((d) => (Math.abs(parseFloat(d))))
    return Math.max(...depthArray, 0)
}

/**
 * Runs survey import functions.
 */
async function run() {
    await verifyImportFilesExist();
    const client = connectToPostgres();
    await processFile(surveyFilePath, async (application) => {
        const { name: full_name, email, org: organization, lat, lng, depth: depthRange } = application || {}

        // Process User
        const { text: userText, values: userValues } = saveUserQuery({ full_name, organization, email });
        const { rows: userRows } = await runSqlQuery(userText, userValues, client);

        let userId
        if (userRows.length === 0) {
            const { text: existintgUserText, values: existintgUserValues } = getUserQuery({ email });
            const { rows: existingUserRows } = await runSqlQuery(existintgUserText, existintgUserValues, client);
            userId = existingUserRows[0].id
        } else {
            userId = userRows[0].id
        }

        // Process Reef
        // Parse depth string from the application form and use the max.
        const depth = getDepth(depthRange)

        // Convert lat, lon to POINT geometry.
        const polygon = `POINT(${(parseFloat(lng) + 360) % 360} ${lat})`;

        const { text: reefText, values: reefValues } = saveReefQuery({ polygon, depth });
        const { rows: reefRows } = await runSqlQuery(reefText, reefValues, client);

        const reefId = reefRows[0].id

        // Create application
        // TODO - make reef_id unique in reef_application
        // uid should be of type UUID and have a default
        // CREATE EXTENSION IF NOT EXISTS "pgcrypto";
        // Then use gen_random_uuid() as default function
        const appId = await addApplicationInfo(client, userId, reefId)
        console.log(appId)

    });
}

run()
