require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const cron = require('node-cron');

const app = express();
const port = 3000;

const username = process.env.SITEIMPROVE_USERNAME;
const apiKey = process.env.SITEIMPROVE_API_KEY;
const authHeader = `Basic ${Buffer.from(`${username}:${apiKey}`).toString('base64')}`;

// db connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect().then(() => {
  console.log('Connected to postgres');
});

// Scheduled job to run every day at 5 PM New York time
cron.schedule('* * * * *', async () => {
  console.log('Running a job at 05:00 at America/New_York timezone');
  try {
    // Fetch data from the main API endpoint
    const response = await axios.get('https://api.eu.siteimprove.com/v2/sites?group_id=1183842&page_size=1', {
      headers: {
        'Authorization': authHeader
      }
    });

    const sites = response.data.items; // Adjust based on actual response structure

    // Fetch additional data for each site asynchronously
    const siteDetailsPromises = sites.map(async site => {
      if (site.product.includes('accessibility')) {
        try {
          const accessibilityResponse = await axios.get(`https://api.eu.siteimprove.com/v2/sites/${site.id}/dci/overview`, {
            headers: {
              'Authorization': authHeader
            }
          });

          let totalAccessibilityScore = accessibilityResponse.data.a11y.total;
          let a = accessibilityResponse.data.a11y.a;
          let aa = accessibilityResponse.data.a11y.aa;
          let aaa = accessibilityResponse.data.a11y.aaa;
          let aria = accessibilityResponse.data.a11y.aria;

          await pool.query('INSERT INTO ada_scores (sid,name,url,ada_a,ada_aa,ada_aaa,ada_aria,ada_score_total,date)  VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)', [
            site.id,
            site.site_name,
            site.url,
            parseInt(a),
            parseInt(aa),
            parseInt(aaa),
            parseInt(aria),
            parseInt(totalAccessibilityScore),
            new Date().toISOString()
          ]);

          console.log('Record added');

          return {
            id: site.id,
            site_name: site.site_name,
            url: site.url,
            accessibilityScore: totalAccessibilityScore,
            a: a,
            aa: aa,
            aaa: aaa,
            aria: aria
          };
        } catch (error) {
          console.error(`Error fetching accessibility data for site ID ${site.id}:`, error);
          return {
            id: site.id,
            site_name: site.site_name,
            url: site.url,
            accessibilityScore: 'Error fetching score'
          };
        }
      } else {
        return {
          id: site.id,
          site_name: site.site_name,
          url: site.url,
          accessibilityScore: 'Not applicable'
        };
      }
    });

    const processedSites = await Promise.all(siteDetailsPromises);
    console.log(processedSites); // Or handle this data as needed

  } catch (error) {
    console.error('Error making API request:', error);
  }
}, {
  scheduled: true,
  timezone: "America/New_York"
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
