const sql = require("mssql");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

// Database configuration
const config = {
  server: "SABBIR",
  database: "APISQL",
  user: "sabbir",
  password: "12345",
  options: {
    trustedConnection: false, // Change to false if using SQL Server authentication
    enableArithAbort: true,
    encrypt: false,
  },
};

async function storeAPIData() {
  try {
    // Connect to the SQL Server database
    await sql.connect(config);

    // Check if the table exists
    const tableCheckResult = await sql.query(`
      SELECT *
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_NAME = 'API_Data'
    `);

    if (tableCheckResult.recordset.length === 0) {
      // Create the database table
      await sql.query(`
        CREATE TABLE API_Data (
            id VARCHAR(50) PRIMARY KEY,
            typicode_id INT,
            userId INT,
            title VARCHAR(100),
            description VARCHAR(MAX)
        )
      `);
    }

    // Retrieve API data
    const apiURL = "https://jsonplaceholder.typicode.com/posts";
    // const apiURL = "https://api.example.com/data";
    const response = await axios.get(apiURL);
    const data = response.data;

    // Transform and insert data into the table
    for (const item of data) {
      const { id, userId, title, body } = item;
      console.log({ id, userId, title, body });
      await sql.query(`
          INSERT INTO API_Data (id, typicode_id, userId, title, description)
          VALUES ('${uuidv4()}', ${id}, ${userId}, '${title}', '${body}')
        `);
    }

    console.log("Data stored successfully.");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Call the function initially
// storeAPIData();

// Set the time interval
setInterval(storeAPIData, 2000); // 2000 milliseconds = 2 seconds
