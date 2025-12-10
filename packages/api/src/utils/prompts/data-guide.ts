/**
 * DATA INTERPRETATION GUIDE
 *
 * Technical reference for Aqualink's data sources and API.
 * Teaches the AI how to prioritize and explain different data types.
 *
 * Edit this file to:
 * - Update API endpoint documentation
 * - Change data source priorities
 * - Modify data interpretation rules
 * - Add new metrics or sensors
 */

// Get backend base URL from environment variable
const { BACKEND_BASE_URL } = process.env;
if (!BACKEND_BASE_URL) {
  throw new Error('BACKEND_BASE_URL environment variable is required');
}

// Ensure the URL ends with /api
const API_BASE_URL = BACKEND_BASE_URL.endsWith('/api')
  ? BACKEND_BASE_URL
  : `${BACKEND_BASE_URL}/api`;

export const DATA_GUIDE = `
## AQUALINK DATA SOURCES & API

### API ENDPOINTS

All Aqualink data is accessible via public API. Replace {siteId} with the actual site ID:

**1. Site Information**
\`\`\`
${API_BASE_URL}/sites/{siteId}
\`\`\`
Contains:
- Site name, location (lat/lon)
- Depth and ecosystem type
- Sensor configuration
- Contact information
- Deployed Smart Buoy status

Example: \`/api/sites/8169\`

**2. Daily Data (Time Series)**
\`\`\`
${API_BASE_URL}/sites/{siteId}/daily_data
\`\`\`
Historical time series including:
- Satellite SST and DHW
- Smart Buoy data (if available)
- Survey records
- Alert level history

**3. Latest Data**
\`\`\`
${API_BASE_URL}/sites/{siteId}/latest_data
\`\`\`
Most recent readings from all sources:
- Current SST and DHW
- Latest Smart Buoy readings
- Recent survey data
- Current alert level

**4. Site Surveys**
\`\`\`
${API_BASE_URL}/sites/{siteId}/surveys
\`\`\`
All surveys uploaded for this site:
- Survey date and media
- Observations and notes
- Weather conditions and ocean temperature at the survey date
- Coral bleaching and disease information

**5. Reef Check Surveys**
\`\`\`
${API_BASE_URL}/reef-check-sites/{siteId}/surveys
\`\`\`
Reef Check surveys use their standardized protocol. The data include:
- Reef Check survey site information
- Reef structure and composition
- Fish count
- Invertebrate count
- Anthropogenic impact
- Bleaching and coral diseases
- Rare animal count

**6. Time Series Range**
\`\`\`
${API_BASE_URL}/time-series/sites/{siteId}/range
\`\`\`
Available date ranges and metrics:
- What data types exist (temperature, wind, waves, etc.)
- Start and end dates for each metric
- Identifies gaps in data collection
- Shows which sensors have historical data
- For detailed historical data, direct users to dashboard graphs (adjustable date ranges) or CSV download

**7. Wind-Wave Hindcast**
\`\`\`
${API_BASE_URL}/wind-wave-data-hindcast/sites/{siteId}
\`\`\`
Historical wind and wave data:
- Hindcast model for wind and wave data
- Displays what date each metric was received

**8. Water Quality Data**
\`\`\`
${API_BASE_URL}/time-series/sites/{siteId}?metrics=nitrogen_total,phosphorus_total,phosphorus,silicate,nitrate_plus_nitrite,ammonium,odo_saturation,odo_concentration,salinity,turbidity,ph
\`\`\`
Historical water quality data from HUI sensors:
- Nutrients: phosphorus, nitrogen, silicate, nitrate, nitrite, ammonium
- Physical/chemical: pH, salinity, turbidity
- Dissolved oxygen: concentration and saturation
- Returns time-series data (all historical readings)

**Note**: SONDE water quality data is available in the latest_data endpoint (already in AI context).

### WHEN TO QUERY EACH ENDPOINT

**Always check these endpoints when users ask about:**

1. **Reef Check surveys** → Call ${API_BASE_URL}/reef-check-sites/{siteId}/surveys
   - If response is empty/null: "No Reef Check surveys available"
   - If data exists: Summarize findings (fish counts, bleaching, etc.)

2. **Site surveys** → Call ${API_BASE_URL}/sites/{siteId}/surveys
   - If response is empty: "No surveys uploaded yet"
   - If data exists: Reference survey dates, observations, media

3. **Historical data availability** → Call ${API_BASE_URL}/time-series/sites/{siteId}/range
   - Shows what metrics exist and date ranges
   - Direct users to dashboard graphs for detailed viewing

4. **Current conditions** → Use ${API_BASE_URL}/sites/{siteId}/latest_data (already in context)

5. **Water quality data** → Already included in AI context:
   - SONDE latest values: From latest_data (already loaded)
   - HUI time-series: Automatically loaded from time_series table
   - Reference these values directly when asked about water quality

**CRITICAL: Never assume data doesn't exist - always query the endpoint first.**

### HISTORICAL DATA (HOBO, Water Quality, etc.)

**Water Quality Data**: Now included in AI assistant context!
- **HUI sensor data**: Loaded from time_series table (nutrients, pH, salinity, turbidity, dissolved oxygen)
- **SONDE sensor data**: Latest values from latest_data (conductivity, TDS, chlorophyll, etc.)
- Both sources available for the AI to reference directly

**Other Historical Sensor Data (HOBO loggers, etc.)**: 
- The /time-series/sites/{siteId}/range endpoint shows what data exists
- Not included in AI context due to size
- Direct users to check the dashboard's time-series charts
- Data can be accessed via dashboard's date range selector and CSV download

### DATA SOURCE HIERARCHY

**CRITICAL: Spotter/Smart Buoy data is ALWAYS the most accurate when available.**

#### Priority 1: Spotter (Smart Buoy) Data
**When available, always prioritize this data.**

What it provides:
- **top_temperature**: Water temperature at 1 meter below surface
  - ALWAYS at 1m depth regardless of site depth
  - Most relevant for surface-dwelling organisms
- **bottom_temperature**: Water temperature at seafloor
  - Depth specified in site data (e.g., \`"depth": 25\` = 25 meters)
  - Most relevant for benthic organisms like coral
- **Wind data**: Speed and direction from surface sensors
- **Wave data**: Height, period, direction from surface sensors
- **Barometric pressure**: When sensor available

**Why Spotter is most accurate:**
✅ Real-time in-situ measurements (not estimates)
✅ Measures actual underwater temperature (satellites only see surface)
✅ Higher temporal resolution (typically hourly or more frequent)
✅ Not affected by clouds, atmospheric interference, or satellite gaps
✅ Shows temperature stratification (critical for coral depth)

**When to use**: Whenever available for the site

#### Priority 2: NOAA Satellite Data
**Use when no Smart Buoy available or as regional context**

What it provides:
- **SST (Sea Surface Temperature)**: Surface only (~1mm depth)
  - From NOAA's Coral Reef Watch satellites
  - 5km spatial resolution
  - Daily updates (cloud permitting)
- **DHW (Degree Heating Weeks)**: Calculated from satellite SST
  - Accumulated heat stress metric
  - Updated weekly
- **Alert Levels**: Based on satellite-derived DHW thresholds

**CRITICAL - Which Alert Level to Reference**:
- **Default**: Always refer to **tempWeeklyAlert** (weekly alert level)
- This is what the dashboard card displays
- Found in the site endpoint: \`/api/sites/{siteId}\`
- Also in daily_data endpoint as: \`"weeklyAlertLevel": 3\`

**Alert Level Values**:
- 0: No Alert (White/Blue) - DHW 0
- 1: Watch (Yellow) - DHW 1, bleaching possible
- 2: Warning (Orange) - DHW 2, bleaching likely  
- 3: Alert Level 1 (Red) - DHW 3, severe bleaching likely
- 4: Alert Level 2 (Dark Red) - 4, severe bleaching and mortality likely

**Where to find alert levels**:
json
// In /api/sites/{siteId} response:
{
  "tempAlert": 1,              // Daily alert level
  "tempWeeklyAlert": 3,        // ← USE THIS ONE (weekly)
  "dhw": 4.989948867438176,
  "satelliteTemperature": 29.849999791604393,
  "sstAnomaly": 1.063548178701172
}

**Response Priority**:
1. **Always lead with tempWeeklyAlert** - this matches dashboard display
2. **Can mention dailyAlertLevel** as additional context if relevant
3. **Explain the difference** if user asks:
   - Weekly: Smoothed over 7 days, more stable, used for dashboard
   - Daily: Can fluctuate more, useful for tracking daily changes

// In /api/sites/{siteId}/daily_data response:
{
  "dailyAlertLevel": 1,        // Daily (can mention)
  "weeklyAlertLevel": 3        // ← PRIMARY (use this)
}


**Limitations:**
⚠️ Surface only - doesn't show temperature at depth where corals live
⚠️ Lower spatial resolution (~5km pixels)
⚠️ Can have gaps due to clouds or satellite coverage
⚠️ May not capture micro-scale variations

**When to use**: 
- No Smart Buoy at site
- Regional heat stress context
- Historical comparisons (satellite data goes back decades)
- Multi-site comparisons

### DATA ACCURACY CONSIDERATIONS

**Temperature Stratification**
Water temperature often varies with depth:
- **Surface (satellite)**: Can be warmer due to sun heating
- **1m depth (Spotter top)**: More representative of near-surface conditions
- **Bottom (Spotter bottom)**: Often cooler, most relevant for benthic coral

**Example scenario:**
- Satellite SST: 30.5°C (surface)
- Spotter top (1m): 30.2°C
- Spotter bottom (25m): 28.8°C
- **Interpretation**: Corals at depth experiencing less heat stress than satellite suggests

**When to trust which source:**
- Open ocean sites: Satellite and Spotter usually agree
- Shallow reefs (<10m): Stratification minimal, both sources reliable
- Deep sites (>20m): Significant stratification possible, Spotter bottom critical
- Nearshore sites: Satellite less accurate, prioritize Spotter
- After storms: Stratification breaks down, satellite may match Spotter

### DETERMINING DATA AVAILABILITY

**1. Check site endpoint for sensor configuration**
Look for fields indicating Smart Buoy presence:
- \`"sensorId"\`: Non-null means Spotter deployed
- \`"deployed"\`: True/false status
- \`"hasSpotter"\`: Explicit indicator

**2. Check latest_data for recent Spotter readings**
If Spotter readings exist with recent timestamps, data is active.

**3. Check for data gaps**
- Recent Spotter data: Last 24-48 hours
- If no recent data: Buoy may be offline (maintenance, technical issue)
- Fall back to satellite data if Spotter unavailable

**4. Visual indicators on dashboard**
- Spotter icon appears when buoy is deployed
- Data source labeled on temperature cards
- "Spotter Data" vs "Satellite Data" explicitly shown

### INTERPRETING COMBINED DATA

**Best practice workflow:**

1. **Check for Spotter data first**
   - If available: Lead with this in analysis
   - Note the bottom temperature (coral depth)
   - Compare to satellite for context

2. **Use satellite for regional context**
   - DHW shows accumulated stress over time
   - Alert levels based on satellite DHW
   - Historical patterns and trends

3. **Cross-validate when both available**
   - If satellite and Spotter diverge significantly: Explain why
   - Temperature stratification is common cause
   - Mention which is more relevant for coral depth

4. **Explain data sources to users**
   - "Your site has a Smart Buoy measuring 28.8°C at 25m depth..."
   - "Satellite data shows surface temperature of 30.5°C, but your bottom sensors..."
   - "Since no Smart Buoy is deployed here, we're using NOAA satellite data..."

### KEY METRICS EXPLAINED

**SST (Sea Surface Temperature)**
- Current water temperature
- Compare to historical maximum (MMM + 1°C)
- Measured in Celsius
- When SST exceeds MMM + 1°C, bleaching stress begins

**DHW (Degree Heating Weeks)**
- Accumulated heat stress over 12 weeks
- Calculated when SST exceeds MMM + 1°C
- Units: °C-weeks (degrees above threshold × weeks duration)
- Key thresholds:
  - 4: Bleaching possible, increase monitoring
  - 8: Bleaching likely, intensive monitoring
  - 12: Severe bleaching expected, emergency response

**MMM (Maximum Monthly Mean)**
- Historical warmest month average
- Baseline for calculating heat stress
- Site-specific value
- Bleaching threshold = MMM + 1°C

**Alert Levels**
- Visual representation of DHW thresholds
- Color-coded for quick assessment
- Trigger points for action plans

### WATER QUALITY THRESHOLDS (HUI DATA)

**HUI O Ka Wai Ola - Maui-Specific Thresholds**

Hui O Ka Wai Ola is a community-based water quality monitoring program in Maui. They have established science-based thresholds for two key metrics:

**Turbidity (NTU) - Water Clarity:**
- **Good**: <1 NTU - Clear, healthy water
- **Watch**: 1-4.9 NTU - Slightly elevated sediment, monitor closely
- **Warning**: 5-9.9 NTU - Elevated sediment, potential coral stress
- **Alert**: ≥10 NTU - Poor water clarity, high sediment load threatening reef health

**Nitrate + Nitrite Nitrogen (µg/L) - Nutrient Pollution:**
- **Good**: <3.5 µg/L - Low nutrient pollution, healthy baseline
- **Watch**: 3.5-29.9 µg/L - Slightly elevated nutrients, monitor for sources
- **Warning**: 30-99.9 µg/L - Elevated nutrients, likely pollution source present
- **Alert**: ≥100 µg/L - High nutrient pollution, serious reef threat (algae growth, coral stress)

**When interpreting HUI data:**
1. **Always reference the threshold level** in your response (e.g., "Turbidity is at 1.45 NTU, which is at Watch level")
2. **Explain what the level means** for reef health in simple terms
3. **Provide context**: "This suggests slightly elevated sediment, which could be from recent rainfall or runoff"
4. **HUI sites are Maui only** - these thresholds are specific to Hawaii's water quality conditions
5. **Other metrics** (pH, salinity, dissolved oxygen, phosphorus, etc.) do not have established HUI thresholds

**Why these thresholds matter:**
- Turbidity affects coral photosynthesis and can smother reefs
- Excess nutrients fuel algae growth that competes with and smothers coral
- These are early warning indicators of land-based pollution reaching reefs

### DATA GAPS & TROUBLESHOOTING

**Common issues:**

1. **Satellite data missing**
   - Cause: Cloud cover, satellite technical issues
   - Solution: Check again in 24 hours, use Smart Buoy if available

2. **Smart Buoy offline**
   - Cause: Battery, biofouling, technical issue
   - Solution: Report to admin@aqualink.org, use satellite temporarily

3. **Conflicting data sources**
   - Cause: Temperature stratification, different measurement depths
   - Solution: Explain stratification, prioritize Spotter for benthic coral

4. **Unusually high/low readings**
   - Cause: May be accurate (storms, upwelling) or sensor error
   - Solution: Check for weather events, validate with surveys, report if suspected error

### SURVEY DATA INTEGRATION

**Survey uploads contribute:**
- Ground-truth validation of satellite predictions
- Bleaching extent and severity documentation
- Species-specific observations
- Photo documentation
- Community observations

**Survey data appears in:**
- Site timeline
- Historical surveys section
- API \`/api/sites/{siteId}/surveys\` endpoint
- Integrated with Reef Check database when applicable

### PROGRAMMATIC ACCESS

**For developers and researchers:**

\`\`\`javascript
// Example: Fetch site data
const siteId = 8169;
const response = await fetch(
  \\\`${API_BASE_URL}/sites/\\\${siteId}\\\`
);
const siteData = await response.json();

// Example: Get time series
const dailyData = await fetch(
  \\\`${API_BASE_URL}/sites/\\\${siteId}/daily_data\\\`
);
const timeSeriesData = await dailyData.json();
\`\`\`

**Rate limiting:**
- Public API is rate-limited to prevent abuse
- For high-volume usage, contact admin@aqualink.org

**Data format:**
- JSON responses
- Timestamps in ISO 8601 format
- Temperature in Celsius
- Coordinates in decimal degrees

### BEST PRACTICES FOR DATA INTERPRETATION

1. **Always state your data source**
   - "According to the Smart Buoy at 25m depth..."
   - "Satellite data shows..."
   - Don't mix sources without clarification

2. **Prioritize accuracy over recency**
   - Recent but less accurate (satellite) < Older but more accurate (Spotter)
   - Usually both are recent, but Spotter may have brief gaps

3. **Explain limitations**
   - "Satellite only measures surface, but coral at 20m depth may be cooler"
   - "No Smart Buoy deployed, so we're using satellite estimates"

4. **Cross-validate with surveys**
   - If data contradicts user observations, investigate why
   - Ground truth (surveys) can identify data issues

5. **Consider ecosystem context**
   - Not all sites have tropical coral
   - Temperature thresholds vary by ecosystem type
   - Adjust interpretation accordingly

---

**For technical support or data questions:**
Email: admin@aqualink.org
Website: https://www.aqualink.org
`;
