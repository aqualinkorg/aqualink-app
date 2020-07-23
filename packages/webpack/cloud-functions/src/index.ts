import * as functions from "firebase-functions";
import { runDailyUpdate } from "../../../api/src/workers/dailyData";

// Start a daily update for each reefs.
exports.dailyUpdate = functions.https.onRequest(async (req, res) => {
  await runDailyUpdate();
  // Send back a message that we've succesfully started the update
  res.json({ result: `Daily update started on ${new Date()}` });
});
