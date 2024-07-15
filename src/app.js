require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const cron = require('node-cron');

const app = express();
const port = 3000;

// Retrieve Siteimprove API credentials from environment variables
const username = process.env.SITEIMPROVE_USERNAME;
const apiKey = process.env.SITEIMPROVE_API_KEY;
const authHeader = `Basic ${Buffer.from(`${username}:${apiKey}`).toString('base64')}`;

// Configure PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // For development only; in production, consider setting to true or removing
  },
  connectionTimeoutMillis: 10000, // 10 seconds
  idleTimeoutMillis: 10000, // Close idle connections after 10 seconds
  query_timeout: 60000, // 60 seconds
  max: 20, // Max number of clients in the pool
  min: 2 // Min number of clients in the pool
});

// Connect to PostgreSQL database
pool.connect().then(() => {
  console.log('Connected to postgres');
}).catch(err => {
  console.error('Error connecting to postgres:', err);
});

// Function to fetch data with exponential backoff retry logic
const fetchWithExponentialBackoff = async (url, options, retries = 5, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, options);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Handle rate limiting specifically
        const retryAfter = error.response.headers['retry-after'];
        if (retryAfter) {
          console.warn(`Rate limit hit. Retrying after ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        } else {
          console.warn(`Rate limit hit. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } else if (attempt < retries) {
        // Exponential backoff
        const exponentialDelay = delay * Math.pow(2, attempt - 1);
        console.warn(`Attempt ${attempt} failed. Retrying in ${exponentialDelay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, exponentialDelay));
      } else {
        console.error(`Failed after ${retries} attempts:`, error);
        throw error;
      }
    }
  }
};

// Function to insert data into the database with retry logic
const insertDataWithRetry = async (query, values, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query(query, values);
      console.log('Record added successfully');
      return;
    } catch (error) {
      console.error(`Database insert attempt ${attempt} failed:`, error);
      if (attempt === retries) {
        throw error;
      }
    }
  }
};

// Function to validate data before insertion
const validateData = (data) => {
  const errors = [];

  if (!data.sid || typeof data.sid !== 'number') {
    errors.push('Invalid site ID');
  }
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('Invalid site name');
  }
  if (!data.url || typeof data.url !== 'string' || !data.url.startsWith('http')) {
    errors.push('Invalid URL');
  }
  if (typeof data.ada_a !== 'number' || data.ada_a < 0 || data.ada_a > 100) {
    errors.push('Invalid ADA A score');
  }
  if (typeof data.ada_aa !== 'number' || data.ada_aa < 0 || data.ada_aa > 100) {
    errors.push('Invalid ADA AA score');
  }
  if (typeof data.ada_aaa !== 'number' || data.ada_aaa < 0 || data.ada_aaa > 100) {
    errors.push('Invalid ADA AAA score');
  }
  if (typeof data.ada_aria !== 'number' || data.ada_aria < 0 || data.ada_aria > 100) {
    errors.push('Invalid ADA ARIA score');
  }
  if (typeof data.ada_score_total !== 'number' || data.ada_score_total < 0 || data.ada_score_total > 100) {
    errors.push('Invalid total ADA score');
  }
  if (!data.date || isNaN(Date.parse(data.date))) {
    errors.push('Invalid date');
  }

  if (errors.length > 0) {
    const error = new Error('Validation failed');
    error.details = errors;
    throw error; // Throw validation error if any field is invalid
  }

  return data; // Return validated data
};

// Scheduled job to run every day at 3 PM Los Angeles time
cron.schedule('*/3 * * * *', async () => {
  console.log('Running a job at 03:00 PM at America/Los_Angeles timezone');
  try {
    // Fetch the list of sites from the Siteimprove API
    const response = await axios.get('https://api.eu.siteimprove.com/v2/sites?group_id=1183842&page_size=200', {
      headers: { 'Authorization': authHeader }
    });

    const sites = response.data.items;

    // Fetch additional data for each site asynchronously
    const siteDetailsPromises = sites.map(async site => {
      if (site.product.includes('accessibility') && !site.url.includes('-qa.wppro.lacounty.gov') && !site.url.includes('-dev.wppro.lacounty.gov')) {
        try {
          // Fetch accessibility data for the site
          const accessibilityResponse = await fetchWithExponentialBackoff(`https://api.eu.siteimprove.com/v2/sites/${site.id}/dci/overview`, {
            headers: { 'Authorization': authHeader }
          });

          const { a, aa, aaa, aria, total: totalAccessibilityScore } = accessibilityResponse.data.a11y;

          // Validate data before inserting into the database
          const validatedData = validateData({
            sid: site.id,
            name: site.site_name,
            url: site.url,
            ada_a: parseInt(a),
            ada_aa: parseInt(aa),
            ada_aaa: parseInt(aaa),
            ada_aria: parseInt(aria),
            ada_score_total: parseInt(totalAccessibilityScore),
            date: new Date().toISOString()
          });

          // Insert validated data into the database
          await insertDataWithRetry('INSERT INTO ada_scores (sid, name, url, ada_a, ada_aa, ada_aaa, ada_aria, ada_score_total, date) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)', [
            validatedData.sid,
            validatedData.name,
            validatedData.url,
            validatedData.ada_a,
            validatedData.ada_aa,
            validatedData.ada_aaa,
            validatedData.ada_aria,
            validatedData.ada_score_total,
            validatedData.date
          ]);

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

    // Wait for all site details to be processed
    const processedSites = await Promise.allSettled(siteDetailsPromises);
    processedSites.forEach(result => {
      if (result.status === 'rejected') {
        console.error('A site failed to process:', result.reason);
      }
    });
    console.log(processedSites.map(result => result.value || result.reason));

  } catch (error) {
    console.error('Error making API request:', error);
  }
}, {
  scheduled: true,
  timezone: "America/Los_Angeles"
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
