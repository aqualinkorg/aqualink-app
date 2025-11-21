/**
 * SURVEY & MONITORING PROTOCOLS
 *
 * Instructions for conducting reef surveys and documentation.
 * Guides users through the survey upload process.
 *
 * Edit this file to:
 * - Update survey protocols
 * - Change monitoring recommendations
 * - Modify survey upload instructions
 */

export const SURVEY_GUIDE = `
## AQUALINK SURVEY METHODS

### WHY CONDUCT SURVEYS?
Aqualink surveys combine satellite data with on-the-ground observations to:
- Document bleaching events and recovery
- Build historical baselines for your site
- Contribute to global reef health database
- Validate satellite predictions with real observations
- Track changes over time

### SURVEY TYPES:

#### 1. AQUALINK IMAGE SURVEYS (Most Common)
**What they are**: Photo-based surveys with comments and observations at specific Survey Points

**Cool feature**: Automatically linked to satellite temperature data and show up as clickable circles in temperature graphs!

**When to use**: 
- Quick status checks
- Frequent monitoring
- Building time-lapse records of specific spots
- Emergency bleaching response
- Flexible documentation

**Time required**: 15-60 minutes depending on scope

**How they work**:
- Each image is assigned to a Survey Point (specific location within your site)
- Quick, flexible, easy to conduct - no certification needed
- Build time-lapse records showing how specific spots change over time

#### 2. REEF CHECK SURVEYS
**What they are**: Comprehensive, standardized formal monitoring

**When to use**: Formal assessments, scientific studies, standardized global comparisons

**Time required**: 2-4 hours

**Special requirement**: Must be a certified Reef Check diver
- Become a Reef Check diver: https://www.reefcheck.org/tropical-program/courses-products/

**What Aqualink supports**:
- Upload existing Reef Check survey data
- Integrates with global Reef Check database
- Provides standardized comparison across sites
- Includes fish counts, invertebrate surveys, substrate composition, biodiversity, coral health, anthropogenic impact

**Reef Check vs Aqualink Surveys**:
- **Reef Check**: Comprehensive, standardized, formal monitoring (requires certification)
- **Aqualink Surveys**: Quick status checks, flexible, easy to conduct (no certification needed)
- **Both are valuable**: Use Reef Check for formal assessments, Aqualink for frequent updates

#### 3. RAPID VISUAL ASSESSMENT (Field Method)
**When to use**: Quick status checks in the field
**Time required**: 15-30 minutes
**What to record**:
- Overall reef condition (excellent/good/fair/poor)
- Bleaching extent (% of corals affected)
- Bleaching severity (pale/partially bleached/fully bleached)
- Species most affected
- Any notable changes since last visit

#### 4. PHOTO POINT MONITORING (Field Method)
**When to use**: Tracking specific locations over time
**Time required**: 30-60 minutes
**Method**:
1. Establish 3-15 permanent reference points on the reef
2. Mark locations with GPS coordinates or use landmarks to identify the exact spot
3. Come back to this exact location multiple times for best survey record
4. Take photos from same angle/distance each visit
5. Record depth, compass bearing, and visible landmarks
6. Upload photos to Aqualink with descriptive notes

**Best Practices**:
- Use consistent camera settings
- Include scale reference (ruler/measuring tape)
- Take photos in similar lighting conditions
- Document any changes in species composition

### CONDUCTING BLEACHING SURVEYS:

**BEFORE the survey:**
1. Check Aqualink's Heat Stress Analysis to understand current DHW and alert level
2. Review previous surveys to note changes
3. Prepare underwater slate/paper for notes
4. Charge camera and check memory card
5. Plan survey route hitting representative areas

**DURING the survey:**
Document these key observations:
- **Bleaching extent**: What % of corals show bleaching?
  - 0-10%: Minimal
  - 10-30%: Moderate
  - 30-60%: Significant
  - 60%+: Severe

- **Bleaching severity** for affected corals:
  - Pale: Some color loss but still pigmented
  - Partially bleached: White patches with some color remaining
  - Fully bleached: Completely white, no pigmentation
  - Recently dead: White skeleton with algae film

- **Species-specific responses**:
  - Note which species bleach first (often Acropora, Pocillopora)
  - Identify any resistant species
  - Record unusual patterns

- **Depth variation**:
  - Note if bleaching differs by depth
  - Document temperature stratification effects

**AFTER the survey:**
1. Upload photos to Aqualink immediately while fresh
2. Enter observation notes in survey form
3. Share findings with local stakeholders
4. Review data on Aqualink dashboard
5. Compare with satellite data and previous surveys

### SURVEY FREQUENCY GUIDELINES:

**Normal conditions (DHW 0-4)**:
- Monthly surveys sufficient
- Focus on baseline documentation
- Track seasonal patterns

**Watch Level (DHW 4-8)**:
- Weekly visual assessments
- Increase photo documentation
- Watch for early bleaching signs

**Warning Level (DHW 8-12)**:
- Every 3-5 days if possible
- Intensive photo documentation
- Track bleaching progression

**Alert Level 2 (DHW 12+)**:
- Daily monitoring of critical areas
- Document mortality vs recovery
- Identify resilient individuals

### UPLOADING TO AQUALINK: STEP-BY-STEP GUIDE

#### PREREQUISITES

**You must have**:
1. ✅ **Logged in account** - You must be logged in to upload surveys
2. ✅ **Admin access** - You need admin access to the site dashboard
   - Don't have admin access? Email: admin@aqualink.org
   - All contact with Aqualink is through this email address
3. ✅ **Access to your site** - Find it by:
   - Searching the site name on the map
   - Using the dropdown menu in top-right corner (shows all sites you have admin access to)
   - Browsing the map

#### STEP-BY-STEP UPLOAD PROCESS

**Step 1: Access Site Dashboard**
- Navigate to your site's dashboard page
- You should see: site map, temperature graphs, alert levels, Survey History section

**Step 2: Navigate to Survey Upload Tool**
1. Scroll down to the "SURVEY HISTORY" section at the bottom
2. Click "ADD NEW SURVEY" button

**Step 3: Enter Survey Details (Page 1)**
- **Date and time** of the survey
- **Weather conditions** (dropdown menu)
- **Comment** about the entire survey (overall observations, conditions, etc.)
- **Click "Next"** to proceed

**Step 4: Upload Images and Assign Survey Points (Page 2)**

For each image:
1. **Upload the image** (drag & drop or click to browse)
   - Format: JPG or PNG, max 10MB each
   - Can upload multiple images in one survey

2. **Select a Survey Point** (dropdown menu)
   - Survey Points identify the specific location within your site
   - Think of it as creating a "photo point" that you return to repeatedly
   - This builds a time-lapse showing how that spot changes over time
   - **Troubleshooting**: If Survey Point doesn't show, try reloading the page

3. **Select Observation** (health of corals in the image)

4. **Add Comment** about this specific image
   - Describe what you see
   - Note changes from previous visits
   - Record species, bleaching extent, etc.

**Step 5: Submit Survey**
- Review your entries
- Click "Submit"
- Your survey is now live and automatically linked to temperature data!

#### Data Format
- Photos: JPG or PNG, max 10MB each
- Include underwater AND surface conditions
- Add descriptive filenames (date_location_description.jpg)

### UNDERSTANDING SURVEY POINTS

#### What is a Survey Point?

A **Survey Point** is a specific location within your survey site where you take repeated observations. Think of it as your "photo station" or "monitoring point."

**Key concept**:
- **Survey Site** = Overall location (e.g., "North Reef")
- **Survey Point** = Specific spot within that site (e.g., "North Reef - Boulder A")

**Why Survey Points matter**:
- ✅ Build time-lapse records of specific locations
- ✅ Track changes in the same corals over time
- ✅ Compare how different areas respond to stress
- ✅ Create before/after documentation
- ✅ Show resilience or degradation patterns
- ✅ Automatically linked to satellite temperature data
- ✅ Show up as clickable circles in temperature graphs

#### Creating Effective Survey Points

**Best practices**:
1. **Choose easily identifiable spots** you can return to repeatedly
2. **Use natural landmarks** (distinctive coral formations, rocks, etc.)
3. **Take photos from same angle and distance** each time
4. **Record GPS coordinates** for precision
5. **Give descriptive names** (e.g., "East Table Coral Cluster" not "Point 1")

**Example Survey Point setup**:
- Site: Cayo Rosario Reef
- Survey Point 1: "North Boulder - Staghorn Colony"
- Survey Point 2: "West Wall - Brain Coral Patch"
- Survey Point 3: "Central Flat - Mixed Species Area"

#### Managing Survey Points

**To view a Survey Point**:
1. Go to "SURVEY HISTORY" section
2. Click dropdown list called "Survey Point"
3. Click the **square icon with arrow** to view all surveys at that point chronologically
4. This shows the time-lapse of changes at that specific location

**To edit a Survey Point location**:
1. Click "EDIT SURVEY POINT"
2. Option A: **Enter coordinates** manually
3. Option B: **Drag the orange pin** on the map to the exact location
4. Save changes

**Viewing Survey Point data over time**:
- Click on any Survey Point name to see all surveys at that point
- Compare photos side-by-side
- Track changes in coral health
- Note responses to temperature stress events

### DASHBOARD FEATURES & TOOLS

#### Top-Right Corner Buttons

**1. EDIT SITE DETAILS**
**What you can do**:
- Change site name, coordinates, depth
- Modify site information
- **Connect Sofar Spotter** (Smart Buoy) if you have one:
  - Check box "Add a custom API token"
  - Enter Spotter ID (format: SPOT-xxxxxx)
  - Enter Sofar API Token
  - Find these at: https://spotter.sofarocean.com/

**Important note**: Most sites do not have Sofar Spotters deployed. Only mention Smart Buoy/Spotter data if it's specifically available for the site.

**2. ADD EXCLUSION DATES**
**When to use**: If you have a Sofar Spotter deployed
**Purpose**: Hide faulty data from specific time periods
**Example use case**: Spotter was temporarily on land, out of water, or malfunctioning
**Effect**: Excluded data won't show in:
- Dashboard visualizations
- Downloaded CSV files
- Data analysis

**3. UPLOAD DATA**
**What this is for**: Uploading sensor data (not surveys)

**Data types you can upload**:
- **HOBO data**: Temperature data from HOBO loggers
- **Sonde data**: Water quality data (dissolved oxygen, pH, salinity, turbidity, chlorophyll)
- **HUI data**: Water quality with alert thresholds
- **Meteorological data**: Weather station data
- **Other sensor data**: Contact admin@aqualink.org for unique data types

**Note**: This is different from survey uploads. Surveys = "ADD NEW SURVEY". Sensor data = "UPLOAD DATA".

#### Downloading Data from Dashboard

**How to download**:
1. **Select date range** using the date picker
2. **Choose data type**:
   - **"ADDITIONAL DATA"**: All data points
   - **"HOURLY DATA"**: Hourly averages only (smaller file size)
3. **Click "DOWNLOAD CSV"**
4. Data includes:
   - Satellite temperature (SST)
   - DHW (Degree Heating Weeks)
   - Spotter data (if deployed)
   - Survey records
   - Uploaded sensor data

**Note**: Excluded dates will not appear in downloaded CSV files.

### SURVEY TIPS & BEST PRACTICES:

**Photography**:
- Shoot in RAW if possible (better for later analysis)
- Use natural light when possible
- Avoid flash that washes out colors
- Include scale reference (dive slate, ruler)
- Take wide shots AND close-ups

**Safety**:
- Never survey alone
- Check conditions before diving
- Don't touch or disturb corals
- Follow safe diving practices
- Inform someone of your survey plan

**Data Quality**:
- Be consistent with methods
- Record even "no change" observations (valuable!)
- Include negative findings (e.g., "no bleaching observed")
- Note any unusual conditions (storms, runoff, etc.)

**Community Engagement**:
- Train local volunteers in survey methods
- Share findings at community meetings
- Post updates on local channels
- Celebrate recovery observations

### INTEGRATING WITH REEF CHECK:

**Aqualink supports Reef Check protocols**:
- Use standard Reef Check survey forms
- Upload completed surveys to Aqualink
- Data automatically synced with Reef Check database
- Access global comparison data

**How to add Reef Check surveys**:
1. To conduct Reef Check surveys, you have to become a Reef Check diver. Become a Reef Check diver here: https://www.reefcheck.org/tropical-program/courses-products/
2. Conduct your survey following Reef Check protocols
3. Submit your survey data to Reef Check HQ
4. Reef Check HQ will process and share the data with Aqualink during their quarterly data transfers

**Reef Check vs Aqualink Surveys**:
- **Reef Check**: Comprehensive, standardized, formal monitoring
- **Aqualink Surveys**: Quick status checks, flexible, emergency response, easy to conduct
- **Both are valuable**: Use Reef Check for formal assessments, Aqualink for frequent updates

### TROUBLESHOOTING:

**"I don't have admin access to upload surveys"**:
- Email admin@aqualink.org with:
  - Site name or ID
  - Your name and affiliation
  - Why you need access
  - Any current site managers you know

**"Survey Points don't show in dropdown"**:
- Reload the page
- Clear browser cache
- Check that Survey Points exist for your site
- Contact admin@aqualink.org if persistent

**"I can't find my site on the map"**:
- Try searching site name in search bar
- Use dropdown menu in top-right corner (shows your admin sites)
- Check that you have admin access
- Verify site is published and active
- Contact admin@aqualink.org if site is missing

[Keep all existing troubleshooting items below these]

**"Photos aren't uploading"**:
- Check file size (compress if needed)
- Try different browser
- Contact admin@aqualink.org for tech support
- Save photos locally and upload later

**"I'm not sure what I'm seeing"**:
- Take photos anyway
- Describe what you observe
- Compare to previous survey photos
- Ask Aqualink AI assistant for interpretation guidance (No image uploads are allowed, but you can describe what you're seeing)

**"No visible bleaching despite high DHW"**:
- Document this! (Resilience is valuable data)
- Document reef helth. Fish density, water quality, etc.
- Check bottom temperature (may be cooler than surface)
- Note any local factors (currents, shading)
- Continue monitoring (bleaching may develop later)

### SURVEY VALIDATION:

Your surveys help validate Aqualink's satellite predictions:
- High DHW + bleaching observed → Confirms satellite accuracy
- High DHW + no bleaching → Identifies resilient sites
- Low DHW + bleaching → May indicate local stressors

### KEY REMINDERS

✅ **You need admin access** to upload surveys - email admin@aqualink.org
✅ **Survey Points are powerful** - they build time-lapse records automatically linked to temperature data
✅ **Most sites don't have Spotters** - satellite data is the norm
✅ **Consistency matters** - same Survey Points, same angles, same methods
✅ **Every survey counts** - even "no change" is valuable data
✅ **Surveys link to temperature graphs** - they show up as clickable circles!
✅ **Upload promptly** - while observations are fresh
✅ **Two types of surveys** - Aqualink (easy, no certification) and Reef Check (formal, requires certification)

**Questions or need help?** Contact: admin@aqualink.org

---

**Remember**: Every survey matters. Even during "nothing to report" periods, your observations build the baseline that makes future change detection possible. You're contributing to a global understanding of reef resilience.
`;
