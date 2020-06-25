import { runSqlQuery, connectToPostgres } from './db-utils'
import {
    addApplicationInfo,
    getReefQuery,
    getUserQuery,
    linksFilePath,
    processFile,
    saveReefQuery,
    saveUserQuery,
    surveyFilePath,
    verifyImportFilesExist,
} from './import-utils'
import ObjectsToCsv from 'objects-to-csv';

function getDepth(depthRange) {
    const depthArray = depthRange.replace('-', ' ')
        .match(/\d+/g) || []
            .map((d) => (Math.abs(parseFloat(d))))
    return Math.max(...depthArray, 0)
}

/**
 * Runs survey import functions.
 */
async function runDataImport() {
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

        // Convert lat, lon to POINT geometry, avoiding under/overfloats
        const polygon = `POINT(${(parseFloat(lng) + 360) % 360} ${lat})`;

        const { text: reefText, values: reefValues } = saveReefQuery({ polygon, depth });
        const { rows: reefRows } = await runSqlQuery(reefText, reefValues, client);

        let reefId
        if (reefRows.length === 0) {
            const { text: existintgReefText, values: existintgReefValues } = getReefQuery({ polygon });
            const { rows: existingReefRows } = await runSqlQuery(existintgReefText, existintgReefValues, client);
            reefId = existingReefRows[0].id
        } else {
            reefId = reefRows[0].id
        }

        // Create application
        await addApplicationInfo(client, userId, reefId)
    });
}

async function getLinks(createdAfterdateString) {
    // Date must be of type "2020-07-03"
    const linkRequest = `SELECT u.email, a.uid, ST_Y(r.polygon) as lat, ST_X(r.polygon) AS lon
        FROM users u, reef_application a, reef r
        WHERE u.id = a.user_id and r.id = a.reef_id and r.created_at > '${createdAfterdateString}';`

    const { rows: links } = await runSqlQuery(linkRequest);
    console.log(`Exporting ${links.length} links to file`)
    const csv = new ObjectsToCsv(links);
    await csv.toDisk(linksFilePath);
}


runDataImport()
// getLinks('2020-06-01')
