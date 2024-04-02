const axios = require('axios');
const Router = require("express").Router();
require('dotenv').config();

const username = process.env.SITEIMPROVE_USERNAME;
const apiKey = process.env.SITEIMPROVE_API_KEY;
const authHeader = `Basic ${Buffer.from(`${username}:${apiKey}`).toString('base64')}`;

Router.get('/', async (req, res) => {
  try {
    // Fetch data from the main API endpoint
    const response = await axios.get('https://api.eu.siteimprove.com/v2/sites?group_id=1183842&page_size=150', {
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
          let a = accessibilityResponse.data.a11y.a; // Assuming these values exist in the response
          let aa = accessibilityResponse.data.a11y.aa;
          let aaa = accessibilityResponse.data.a11y.aaa;
          let aria = accessibilityResponse.data.a11y.aria;

          return {
            id: site.id,
            site_name: site.site_name,
            url: site.url,
            accessibilityScore: totalAccessibilityScore, // Include the total accessibility score
            a: a,
            aa: aa,
            aaa: aaa,
            aria: aria
          };
        } catch (error) {
          console.error(`Error fetching accessibility data for site ID ${site.id}:`, error);
          // Return site details without accessibility score in case of an error
          return {
            id: site.id,
            site_name: site.site_name,
            url: site.url,
            accessibilityScore: 'Error fetching score'
          };
        }
      } else {
        // Return site details directly if 'accessibility' product is not included
        return {
          id: site.id,
          site_name: site.site_name,
          url: site.url,
          accessibilityScore: 'Not applicable' 
        };
      }
    });

    // Wait for all promises to resolve
    const processedSites = await Promise.all(siteDetailsPromises);

    // Respond with the combined data
    res.json(processedSites);

  } catch (error) {
    console.error('Error making API request:', error);
    res.status(500).send('Error fetching data');
  }
});

module.exports = Router;