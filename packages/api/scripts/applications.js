import { processFile, saveUserQuery, surveyFilePath, verifyImportFilesExist, saveReefQuery } from './import-utils'
import { runSqlQuery, connectToPostgres } from './db-utils'

/**
 * Runs survey import functions.
 */
async function run() {
    await verifyImportFilesExist();
    const client = connectToPostgres();
    await processFile(surveyFilePath, async (application) => {
        const { name: full_name, email, org: organization, lat, lon, depth } = application
        const { text: userText, values: userValues } = saveUserQuery({ full_name, organization, email });
        console.log(userText)
        const { rows: userRows } = await runSqlQuery(userText, userValues, client);
        console.log(userRows)

        const { text: reefText, values: reefValues } = saveReefQuery({ lat, lon, depth });
        const { reefRows } = await runSqlQuery(reefText, reefValues, client);

        console.log(reefRows)

        /**
         *  TODO
         *  Add user -> user_id
         *      add contraint no dups on email
         *      firebase_uid can be null
         *  Add reef -> reef_id
         *      use postgis geometry type for polygon so that we can have points?
         *      add constraint no dups on polygon (or lat/lon pair)
         *  Add application_info (user_id, reef_id)
         */

    });
}

run()
