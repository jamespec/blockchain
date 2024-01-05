// Import required modules
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const fs = require('node:fs');

// Open or create the sqlite3 database.
// Create the funds table if it doesn't exist.
const db = new sqlite3.Database('transfer_agent.db');

// Create an Express router
const router = express.Router();

// Save all records
router.get('/', (req, res) => {
  db.all('SELECT * FROM accounts', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    try {
      fs.writeFileSync('./accounts.json', JSON.stringify(rows) + "\n");
    } catch (err) {
      console.error(err);
    }
  })

  // Retrieve all data from the table
  db.all('SELECT * FROM funds', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    try {
      fs.writeFileSync('./funds.json', JSON.stringify(rows) + "\n");
    } catch (err) {
      console.error(err);
    }
  })

  db.all('SELECT * FROM instructions', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    try {
      fs.writeFileSync('./instructions.json', JSON.stringify(rows) + "\n");
    } catch (err) {
      console.error(err);
    }
  })

  res.json({ message: "Save Successful" })
})

router.get('/:f', (req, res) => {
  const f = req.params.f
  let filename = ''

  switch (f) {
    case "accounts":
      filename = "accounts.json"
      break;
    case "funds":
      filename = "funds.json"
      break;
    case "instructions":
      filename = "instructions.json"
      break;
  }

  let x = ''
  try {
    x = JSON.parse(fs.readFileSync(filename));
  } catch (err) {
    console.error(err);
  }

  res.json(x)
})

router.get('/load/funds', (req, res) => {
  try {
    let x = JSON.parse(fs.readFileSync('./funds.json'));
  } catch (err) {
    console.error(err);
  }

  res.json(x)
})

router.get('/load/instructions', (req, res) => {
  try {
    let x = JSON.parse(fs.readFileSync('./instructions.json'));
  } catch (err) {
    console.error(err);
  }

  res.json(x)
})

// Close the database connection on server shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message)
    }
    console.log('Closed the database connection.')
    process.exit()
  })
})

// Export the router
module.exports = router
