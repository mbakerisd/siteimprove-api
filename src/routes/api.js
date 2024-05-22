const Router = require("express").Router();
const pool = require('./dbpool');


Router.get('/', async (req, res) => {
  try {
    // Execute a query to fetch all data (or adjust as necessary)
    const queryResult = await pool.query('SELECT sid, name, url, ada_a, ada_aa, ada_aaa, ada_aria, ada_score_total, date FROM ada_scores');
    
    const sites = queryResult.rows; // Assuming 'rows' contains your fetched data
    
    // Respond with the fetched data
    res.json(sites);
  } catch (error) {
    console.error('Error fetching data from the database:', error);
    res.status(500).send('Error fetching data');
  }
});

module.exports = Router;
