/**
 * Corals start to become stressed when the SST is 1°C warmer than the maxiumum monthly mean temperature (MMM).
 * The MMM is the highest temperature out of the monthly mean temperatures over the year (warmest summer month)
 * 1°C above the MMM is called the "bleaching threshhold"
 * When the SST is warmer than the bleaching threshold temperature, the corals will experience heat stress. This heat stress is the main cause of mass coral bleaching.
 * The HotSpot highlights the areas where the SST is above the MMM.
 * The DHW shows how much heat stress has accumulated in an area over the past 12 weeks (3 months). The units for DHW are "degree C-weeks"
 * The DHW adds up the Coral Bleaching HotSpot values whenever the temperature exceeds the bleaching threshold.
 * Bleaching Alerts:
 *      No Stress (no heat stress or bleaching is present): HotSpot of less than or equal to 0.
 *      Bleaching Watch (low-level heat stress is present): HotSpot greater than 0 but less than 1; SST below bleaching threshhold.
 *      Bleaching Warning (heat stress is accumulating, possible coral bleaching): HotSpot of 1 or greater; SST above bleaching threshold; DHW greater than 0 but less than 4.
 *      Bleaching Alert Level 1 (significant bleaching likely): HotSpot of 1 or greater; SST above bleaching threshold; DHW greater than or equal to 4 but less than 8.
 *       Bleaching Alert Level 2 (severe bleaching and significant mortality likely): HotSpot of 1 or greater; SST above bleaching threshold; DHW greater than or equal to 8.
 *
 * DHW = (1/7)*sum[1->84](HS(i) if HS(i) >= 1C)
**/
function getDHD(reefID) {
    /**
     * Calculates the Degree Heating Days of a reef location.
     *
     * HS = SST(daily) - MMM if SST(daily) > MMM
     * HS = 0                if SST(daily) <= MMM
     * HS > 1C               bleaching threshold
     *
     * @param {int}    reefID        ID of the Reef
     *
     * @return {float} DHD           Degree Heating Days
     */
    var SST = getSST(reefID);
    var MMM = getMMM(reefID);
    var HS = SST.map(function (value) {
        return (value - MMM > 0 ? value - MMM : 0);
    });
    var DHD = 0;
    HS.forEach(function (HSday) {
        if (HSday >= 1) {
            DHD += HSday;
        }
    });
    return DHD;
}
// Test functions
function getSST(reefID) {
    var SST = [27, 28, 29, 28];
    return SST;
}
function getMMM(reefID) {
    var MMM = 27.5;
    return MMM;
}
// Test calc
// let DHD = getDHD(0);
// console.log('Degree heating days are: ', DHD);
