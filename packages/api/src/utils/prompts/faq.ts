/**
 * FREQUENTLY ASKED QUESTIONS
 *
 * Common questions and answers about Aqualink and reef monitoring.
 * Pre-written responses for consistent, accurate answers. Most are taken from the published FAQ page on Aqualink.
 *
 * Edit this file to:
 * - Add new FAQs
 * - Update existing answers
 * - Remove outdated questions
 */

// Get backend base URL from environment variable
const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL ||
  (process.env.NODE_ENV === 'test'
    ? 'https://ocean-systems.uc.r.appspot.com/api'
    : undefined);
if (!BACKEND_BASE_URL) {
  throw new Error('BACKEND_BASE_URL environment variable is required');
}

// Ensure the URL ends with /api
const API_BASE_URL = BACKEND_BASE_URL.endsWith('/api')
  ? BACKEND_BASE_URL
  : `${BACKEND_BASE_URL}/api`;

export const FAQ_KNOWLEDGE = `
## AQUALINK FREQUENTLY ASKED QUESTIONS

### PLATFORM OVERVIEW

**Q: What is Aqualink?**
A: Aqualink is a philanthropic engineering organization building ocean conservation technology. Our web platform provides free, real-time reef monitoring tools combining satellite data, in-situ sensors, and community science. We democratize access to marine monitoring technology so everyone - from local communities to scientists - can protect coral reefs.

Learn more: https://aqualink.org/about

**Q: What are the two main parts of Aqualink's platform?**
A: Aqualink's platform consists of two main components:

### 1. Interactive Map (https://aqualink.org)
- **Global reef monitoring** at your fingertips
- Search and explore thousands of reef sites worldwide
- View real-time heat stress data
- Filter by alert levels to find reefs under stress
- Bookmark sites to create your personal dashboard
- Color-coded heat stress visualization
- Free and open to everyone

### 2. Site Dashboards (https://aqualink.org/sites/{siteId})
- **Detailed view** of individual reef sites
- Combines satellite data, sensor data, and surveys (three-part foundation)
- Real-time temperature and alert levels
- Historical data and trends
- Upload surveys and sensor data
- Download data as CSV
- Share with stakeholders
- Free to create and manage

**How they work together**: Use the interactive map to discover and monitor reefs globally, then dive deep into specific sites with comprehensive dashboards.

**Q: Does Aqualink have underwater live streams?**
A: Yes! Aqualink's **Live Stream Collection** features 14 underwater live streams from around the world, bringing real-time views of coral reefs directly to your screen.

**Locations include**:
- 🌺 Hawai'i
- 🏝️ Maldives
- 🌴 Caribbean Netherlands
- 🦀 US East Coast
- 🐠 French Polynesia
- 🌊 Miami
- 🐢 Honduras

**Watch for free**: https://highlights.aqualink.org/

**Features**:
- Live underwater views 24/7 (when operational)
- Highlights and recorded footage
- Watch coral reefs in real-time
- Educational and engaging
- Perfect for classrooms, presentations, or reef enthusiasts
- No account needed

**Use cases**:
- Public awareness and education
- Virtual reef visits for students
- Background monitoring of reef activity
- Engaging stakeholders and donors
- Showcasing healthy (or stressed) reefs

The live streams complement the monitoring data on dashboards by providing a visual window into reef ecosystems.

**Q: What can you do with Aqualink?**
A: Aqualink is designed to support your monitoring efforts and provides an instant view of your reef with free, publicly available data. This opens up access to valuable information for everyone, from enthusiasts to scientists, anywhere in the world. The platform combines satellite data, Smart Buoy sensors, and community surveys to help you monitor coral reef health, track heat stress, and respond to bleaching events.

Watch this overview video: https://www.youtube.com/watch?v=EQZ3HiPevTY

**Q: Overview of the Aqualink system and Survey guide**
A: We have created an animated field guide that describes the best practices for conducting a survey and using the Aqualink system. This guide covers survey methods, photo documentation, data upload, and how to use the dashboard features.

Watch the field guide video: https://www.youtube.com/watch?v=E_nXCl612lg

**Q: Is the platform open source?**
A: Aqualink is committed to open science and data access at https://github.com/aqualinkorg/aqualink-app. Contact us for information about code, data, and collaboration opportunities.

**Q: What data does Aqualink provide?**
A:
A platform where you can monitor oceans worldwide and local reefs accessing or uploading: 
- Integrated satellite sea surface temperature (SST) from NOAA
- Integrated degree Heating Weeks (DHW) for heat stress tracking
- Integrated wind and wave satellite data
- Smart Buoy data (water temperature, waves, wind) where it’s deployed
- Integrated historical temperature patterns
- Reef Check survey integration (Biodiversity, coral health, site details, reef composition, and anthropogenic impact)
- Aqualink image surveys with comments and observations. (Normal surveys)
- Underwater livestreams
- 3D models
- Water quality data (real-time or in periodic batches)
- Temperature logger data (e.g. HOBO)

### TEMPERATURE MEASUREMENTS

**Q: How are you measuring temperature?**
A: We collect temperature through two methods:

1. **Satellite observations**: Collect temperature from the very top layer of the surface (skin temperature) based on a 5km grid. NOAA publishes observed temperatures daily through their "Daily Global 5km Satellite Coral Bleaching Heat Stress Monitoring". Sofar Ocean imports this data and Aqualink renders it in our web application.

2. **Spotter (Smart Buoy)**: When deployed, we collect temperature information every hour from:
   - 1 meter depth
   - Moored depth (at the sea floor. Depth is listed in meters in this link ${API_BASE_URL}/sites/{siteId} in this section: {"type":"Point","coordinates":[114.6,22.55]},"depth":5,"iframe":null,"status":"in_review","maxMonthlyMean":28.3,"timezone":"Asia/Shanghai","display":true,"createdAt":"2025-01-29T22:53:29.572Z","updatedAt":"2025-02-17T22:52:12.457Z","region":{"id":1039,"name":"China","polygon":{"type":"Point","coordinates":[121.9419,36.5171]})

**Priority**: Smart Buoy data is always more accurate when available, as it measures actual underwater temperature where corals live.

**Q: What data does Aqualink provide?**
A:
A platform where you can monitor oceans worldwide and local reefs accessing or uploading: 
- Integrated satellite sea surface temperature (SST) from NOAA
- Integrated degree Heating Weeks (DHW) for heat stress tracking
- Integrated wind and wave satellite data
- Smart Buoy data (water temperature, waves, wind) where it’s deployed
- Integrated historical temperature patterns
- Reef Check survey integration (Biodiversity, coral health, site details, reef composition, and anthropogenic impact)
- Aqualink image surveys with comments and observations. (Normal surveys)
- Underwater livestreams
- 3D models
- Water quality data (real-time or in periodic batches)
- Temperature logger data (e.g. HOBO)

**Q: What is Aqualink's three-part foundation?**
A: Aqualink dashboards are built on a unique three-part foundation that provides comprehensive reef monitoring:

### 1. Satellite Data: The Big Picture, Automatically
Every dashboard is **automatically equipped** with daily satellite data from NOAA Coral Reef Watch, providing essential context. This includes:
- **Daily Sea Surface Temperature (SST)**
- **Wind and Wave data** (updated every 6 hours)
- **Built-in Heat Stress Analysis**: Automatically calculates and displays:
  - Current heat stress level
  - 7-day temperature trends
  - Historical temperature maximums
  - Bleaching alert levels (weekly and daily)

### 2. In-Water Sensor Data: The On-Site Reality
Connect data from virtually any marine sensor for detailed analysis of site conditions and stressors. The dashboard **automatically produces graphs** when data is uploaded.

**Supports**:
- Continuous, real-time streams (e.g., from Sofar Spotters)
- Periodic batch uploads (e.g., from water quality sensors, HOBO loggers)

**Integrates**:
- Temperature data (surface and depth)
- Water quality parameters (pH, dissolved oxygen, turbidity, salinity, chlorophyll)
- Wind and wave data
- Meteorological data

### 3. Visual Observations: Surveys from the Reef
Document what's actually happening below the surface. Visual observations **bring the sensor and satellite data to life** by confirming how marine life is reacting to conditions.

**Aqualink Surveys**:
- Simple survey feature for quick image and comment uploads from the field
- Automatically linked to temperature data
- Show up as clickable circles in temperature graphs

**Reef Check Surveys**:
- For in-depth standardized analysis
- Includes reef composition, species, bleaching, disease, and human impacts
- Automatically uploaded to your dashboard from Reef Check HQ
- Creates the most comprehensive view possible

**The Power of Three**: By combining satellite context, sensor precision, and visual confirmation, Aqualink provides the most complete picture of reef health available.

**Q: How accurate is the satellite data?**
A: NOAA satellite data has ~5km resolution and measures surface temperature. It's excellent for tracking regional heat stress patterns. For site-specific maximum accuracy, use Smart Buoy data or other in-situ sensors.

### SMART BUOY CONNECTION

**Q: How do I connect my Sofar Spotter to Aqualink?**
A: Easy steps:
1. Go to EDIT SITE DETAILS on your Aqualink dashboard
2. Click on "Add custom API token"
3. Add the Spotter ID and API
4. Click on Status and select "deployed"
5. Press save

You can find your Spotter ID and API at: https://spotter.sofarocean.com/
Your Spotter ID is also printed on your buoy.

Watch this tutorial video: https://www.youtube.com/watch?v=ytIOdhSzddY

**Q: What's the difference between satellite and Smart Buoy data?**
A: 
- **Satellite**: Surface only, 5km resolution, daily updates, covers all sites globally
- **Smart Buoy**: Underwater temperature (1m and bottom depth), site-specific, hourly updates, in-situ accuracy
- **Priority**: Always use Smart Buoy data when available; it's more accurate for coral stress assessment

**Q: Does Aqualink have your own buoys?**
A:
- Yes, Aqualink operates a fleet of over 160 Sofar Smart Mooring Spotters that has been, is, or will be deployed. We've had this buoy program since 2020, and the goal was to develop affordable, effective, monitoring tools that provide real-time data together with Sofar Ocean, which didn't exist at the time. We provided funding, market demand, and a global fleet of buoy managers. The product is today a huge success and available for purchace at Sofar Ocean's website. Aqualink does not receive any monetary gain from the Smart buoys, and we do not donate buoys anymore. 

### HEAT STRESS

**Q: What is heat stress?**
A: Heat stress is a measure of the amount of time above the 20-year historical maximum temperature. The unit of measure for heat stress is **Degree Heating Weeks (DHW)**. Many marine environments, like coral sites, degrade after prolonged heat exposure, which is why this is an important metric.

**DHW Thresholds**:
- 4-8: Watch level (bleaching possible)
- 8-12: Warning level (bleaching likely)
- 12+: Alert Level 2 (severe bleaching expected)

Learn more: https://coralreefwatch.noaa.gov/product/5km/tutorial/crw10a_dhw_product.php

**Q: What is DHW (Degree Heating Weeks)?**
A: DHW measures accumulated heat stress by tracking how much and how long temperatures exceed the bleaching threshold. It's calculated weekly:
- DHW 0: No bleaching alert
- DHW 1: Bleaching possible
- DHW 2: Bleaching likely
- DHW 3: Severe bleaching likely
- DHW 4: Severe bleaching and mortality likely
Learn more: https://coralreefwatch.noaa.gov/product/5km/tutorial/crw10a_dhw_product.php

**Q: What are the alert levels?**
A: Aqualink shows color-coded alerts based on DHW. The dashboard displays the **weekly alert level** (tempWeeklyAlert), which provides a smoothed view over 7 days:
- DHW 0: White/blue
- DHW 1: Yellow
- DHW 2: Orange
- DHW 3: Red
- DHW 4: Dark red

**Data sources**:
- **tempWeeklyAlert**: Found in \`/api/sites/{siteId}\` - this is what the dashboard card shows
- **weeklyAlertLevel**: Found in \`/api/sites/{siteId}/daily_data\`
- **dailyAlertLevel**: Also available but more variable

**Note**: Always reference the weekly alert level by default, as this matches what users see on their dashboard.

**Q: DHW is low, but I see bleaching. What's happening?**
A: Local stressors beyond heat may be causing stress:
- Pollution or freshwater runoff
- Low oxygen events
- Disease outbreak
- Physical damage
- Satellite data gap or inaccuracy
Document and upload survey data to help validate satellite predictions. Deploy in-situ sensors if possible and upload the data to your Aqualink dashboard. 

### SURVEY UPLOAD

**Q: How do I upload surveys?**
A: **Step-by-step process**:

**Prerequisites**:
- You must be **logged in**
- You must have **admin access** to the site dashboard (email admin@aqualink.org if you don't)
- Find your site: Search by name, use the map, or use the dropdown menu in top-right corner showing all your admin sites

**Steps**:
1. Navigate to your site's dashboard
2. Scroll down to the "SURVEY HISTORY" section at the bottom
3. Click "ADD NEW SURVEY"
4. **Page 1**: Select date/time, weather conditions, add comment about entire survey → Click "Next"
5. **Page 2**: Upload images (one or several)
   - For each image: Select a Survey Point, choose observation (coral health), add comment
   - **Survey Points** identify specific locations within your site - build time-lapse records!
   - If Survey Point doesn't show, try reloading the page
6. Submit survey

**Cool feature**: Surveys automatically link to satellite temperature data and show as clickable circles in temperature graphs!

Watch this video on best practices: https://youtu.be/ov64mc2Da_k

**Q: What are Survey Points?**
A: Survey Points are specific locations within your survey site where you take repeated observations. Think of them as "photo stations."

**Key concept**:
- **Survey Site** = Overall location (e.g., "North Reef")
- **Survey Point** = Specific spot within site (e.g., "North Reef - Boulder A")

**Why they matter**: Build time-lapse records showing how specific spots change over time in response to temperature stress and other stressors.

**Managing Survey Points**:
- **View**: Click Survey Point dropdown in "SURVEY HISTORY" section → Click square icon with arrow to view all surveys at that point
- **Edit location**: Click "EDIT SURVEY POINT" → Enter coordinates OR drag orange pin on map
- **Best practice**: Choose easily identifiable spots you can return to repeatedly

**Q: What happens if I upload the same file?**
A: The upload process will update any row that has changed and will also include any new rows inserted. This allows you to add new data without duplicating existing records.

**Q: Can I upload historical survey data?**
A: Yes! Historical data is valuable for establishing baselines. Upload past surveys with the correct dates and any photos or notes you have.

### SURVEY METHODS

**Q: How can I best conduct surveys using Aqualink?**
A: Aqualink allows you to conduct surveys in many different ways depending on your monitoring goals:

**Step 1: Choose your survey site**
This is the overall location you're monitoring.

**Step 2: Select survey points**
These are multiple points within your survey site. Examples of survey methods that work well:
- Photo quadrant in a transect
- Quadrant intercept in a transect
- Point intersect (with quadrant or transect)
- Known locations within your survey site that you continuously monitor

For transects: Each quadrant or point = one survey point. The entire transect = the survey site.

**Step 3: Add detailed comments**
Include all observations and data from that survey session:
- Coral health status (healthy, bleached, diseased)
- Percent coral cover
- Species information
- Additional observations (e.g., Crown of Thorns Starfish culled)

**Photo tip**: For known locations, take images from the exact same angles and distance each time. This provides the best comparison between survey sessions.

Example: https://aqualink.org/sites/2943/points/558

**Q: How are the surveys structured?**
A: Surveys are displayed at the bottom of your dashboard page in chronological order. Each survey includes all the survey points you've added. When clicking on a survey point, you'll see all surveys conducted at that point chronologically. This enables you to monitor a single point in your reef over a longer period.

**Q: What's the difference between Reef Check surveys and Aqualink surveys?**
A: There are two types of surveys on Aqualink:

**Aqualink Image Surveys** (most common):
- Photo-based surveys with comments and observations
- Each image assigned to a Survey Point (specific location)
- Quick, flexible, easy to conduct - no certification needed
- Automatically linked to satellite temperature data
- Show up as clickable circles in temperature graphs
- Perfect for frequent monitoring and emergency response
- Can be uploaded on the Aqualink dashboard

**Reef Check Surveys**:
- Comprehensive, standardized, formal monitoring
- Includes fish counts, invertebrate surveys, substrate composition, biodiversity, coral health, anthropogenic impact
- Requires Reef Check diver certification: https://www.reefcheck.org/tropical-program/courses-products/
- Data syncs with global Reef Check database
- Used for scientific studies and formal assessments
- Has to be sent for processing to Reef Check HQ before it's sent over to the Aqualink platform

**Both are valuable**: Use Reef Check for formal assessments, Aqualink surveys for frequent updates!

### WATER QUALITY DATA

**Q: What water quality data can I upload?**
A: We allow several types:
1. **HOBO data** (HOBO data loggers)
2. **Meteorological data**
3. **Overall water quality data** (from any sonde or method)

We have two dashboard card types:

**Sonde data includes**:
- Dissolved oxygen concentration
- Chlorophyll concentration
- Acidity (pH)
- Salinity
- Turbidity

**HUI data includes**:
- Turbidity
- Nitrate Nitrite Nitrogen (NNN)
- pH
- Salinity
- Watch, warning, and alert levels (once you determine thresholds)

Video tutorials:
- Sonde data upload: [Link to video]
- HUI data upload: [Link to video]

View this document for all parameters and values we currently allow. Note: You can upload extra parameters that won't show on the dashboard card but will be included when you download the CSV file.

**Q: Can I follow a template for uploading water-quality data?**
A: Yes! Please follow these templates:
- HOBO data
- Meteorological data
- Sonde data
- HUI data

Contact admin@aqualink.org for template files.

**Q: How can I upload temperature data to Aqualink?**
A: When uploading temperature data:
1. Use the "HOBO data" sensor type
2. If using HOBO logger: Upload the raw data file
3. If using other logger: Add columns for time/date and temperature

Watch this video tutorial on uploading temperature data: [Link to video]

**Q: I'm collecting water quality data. How can I upload it to my dashboard?**
A: Steps:
1. Go to your dashboard
2. Click "UPLOAD DATA" in the top right corner
3. Select your survey point and sensor type
4. If you have .xls, .csv, or .xlsx file but aren't using the selected sensors, choose "Sonde data" and continue

### TRACKING HEATWAVES

**Q: How can I track a heatwave?**
A: Follow these steps:
1. **Add multiple sites** to your personal dashboard by clicking the bookmark symbol on each site
2. **Change map view to heat stress**: Click the "layer" symbol on the map and select "Heat Stress"
3. Monitor DHW levels across all your sites to see regional patterns

### SITE MANAGEMENT

**Q: Where can a site be placed?**
A: A site can be placed almost anywhere in the world as long as it is in the ocean or sea. This is a requirement for satellite data to work.

**Q: How many sites can I have?**
A: You can have an unlimited amount of sites.

**Q: How do I claim/manage a site?**
A: Contact admin@aqualink.org with:
- Site ID
- Your affiliation/role
- Monitoring plans
- Do you know the current site managers? 
We'll help you get set up!

**Q: Can I add a new site?**
A: Yes! We can add a dashboard in any coastal marine location. Note that the site has to be located in the ocean. Land, lakes, or rivers are not allowed. Go to https://aqualink.org/register to get started. 

**Q: What are the dashboard features and buttons?**
A: **Top-right corner has three important buttons**:

**1. EDIT SITE DETAILS**:
- Change site name, coordinates, depth
- **Connect Sofar Spotter** (if you have one):
  - Check "Add a custom API token"
  - Enter Spotter ID (format: SPOT-xxxxxx)
  - Enter Sofar API Token (find at https://spotter.sofarocean.com/)
- **Note**: Most sites do not have Sofar Spotters deployed

**2. ADD EXCLUSION DATES** (for sites with Spotter):
- Hide faulty data from specific time periods
- Example: Spotter was temporarily on land or malfunctioning
- Excluded data won't show in dashboard or downloaded CSV files

**3. UPLOAD DATA**:
- For uploading **sensor data** (not surveys)
- HOBO data: Temperature data from loggers
- Sonde data: Water quality (dissolved oxygen, pH, salinity, turbidity, chlorophyll)
- Reach out to admin@aqualink.org for unique data types

**Downloading data**:
- Select date range
- Choose "ADDITIONAL DATA" (all data points) or "HOURLY DATA" (hourly averages)
- Click "DOWNLOAD CSV"
- Includes: Satellite temperature, DHW, Spotter data (if deployed), surveys, uploaded sensor data

**Q: How do I change the language on my dashboard?**
A: You can translate the entire Aqualink website (including dashboards, map, and all pages) to your preferred language:

1. **Look for the globe icon** 🌐 in the top-right corner of the page
2. **Click the globe icon** to open the language selector
3. **Select your language** from the available options

This feature uses Google Translate to automatically translate the entire interface. The globe icon is available on all Aqualink pages since it's part of the global header/menu bar.

**Note**: The translation applies to the user interface text. Data values (temperatures, DHW, etc.) remain in their original units (Celsius, etc.).

**Q: Do I need an account?**
A: 
- Browse sites and data: No account needed
- Upload surveys: Yes, free account required
- Manage sites: Yes, account with appropriate permissions. Reach out to admin@aqualink.org to ask for permissions or register a new site.
- Create sites: Yes, free account required

### SMART BUOY AVAILABILITY

**Q: Does Aqualink still give away Smart Buoys?**
A: Aqualink is no longer giving away Smart Mooring buoys worldwide. However:
- ✅ You can still create new Aqualink sites and get dashboards
- ✅ If interested in purchasing Smart Mooring Buoys, visit Sofar Ocean (https://www.sofarocean.com/products/spotter)
- ✅ If you have a particularly threatened reef or interesting coral reef project, email us and we'll try to help
- ✅ If you purchased your own Sofar Smart Mooring buoy, you can connect it to Aqualink. Watch this 1 minute video guide https://www.youtube.com/watch?v=ytIOdhSzddY

**Important note**: Most Aqualink sites do not have Sofar Spotters (Smart Buoys) deployed. Satellite data is the primary data source for the majority of sites. Only mention Spotter/Smart Buoy data when it's specifically available for the site in question.

Read more on our website or contact: admin@aqualink.org

### CONTRIBUTING & PARTNERSHIPS

**Q: How can I contribute to Aqualink?**
A: Many ways:
- Upload regular surveys from your site
- Share Aqualink with other reef managers
- Provide feedback on platform features
- Participate in research studies
- Support Smart Buoy deployments
- Reach out to us!

**Q: Can my organization partner with Aqualink?**
A: Yes! We partner with:
- Marine protected areas
- Research institutions
- NGOs and conservation groups
- Government agencies
- Community organizations
Contact us at admin@aqualink.org to explore partnership opportunities.

### ADDITIONAL RESOURCES & CONTACT

**Q: How do I get help or ask questions?**
A: Contact us at admin@aqualink.org

**Q: I have a technical question not answered here.**
A: Contact our team: admin@aqualink.org
We're happy to help!

We're here to help with:
- Technical support
- Site setup and management
- Data interpretation
- Survey methods
- Partnership opportunities
- Smart Buoy deployment questions

**Key Links**:
- Main website: https://www.aqualink.org
- Sofar Spotter dashboard: https://spotter.sofarocean.com/
- NOAA Coral Reef Watch: https://coralreefwatch.noaa.gov/
- DHW Tutorial: https://coralreefwatch.noaa.gov/product/5km/tutorial/crw10a_dhw_product.php

---

**This FAQ is based on the official Aqualink FAQ page. For the most current information, visit: https://aqualink.org/faq**

> **Maintenance Note**: Update this file whenever the website FAQ changes to keep AI knowledge current.
`;
