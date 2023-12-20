// Import required modules
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

// Open or create the sqlite3 database.
// Create the funds table if it doesn't exist.
const db = new sqlite3.Database('transfer_agent.db');
db.run('CREATE TABLE IF NOT EXISTS funds ( CUSIP TEXT PRIMARY KEY, description TEXT, deployAddress TEXT );', [], (err) => {
  if (err) {
    console.log("Unable to to open sqlite3 database: 'transfer_agent.db'")
  }
});

// Create an Express router
const router = express.Router();

// Create a new record
router.post('/', (req, res) => {
  const { CUSIP, description, deployAddress } = req.body

  if( CUSIP && description && deployAddress ) {
    let query = 'INSERT INTO funds (CUSIP, description, deployAddress) VALUES (?, ?, ?)'
    db.run(query, [CUSIP, description, deployAddress], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }

      res.json({ message: 'Record created successfully' })
    })
  }
  else
    return res.status(400).json({ error: "Invalid or missing parameter" })
})

// Read all records
router.get('/', (req, res) => {
  // Retrieve all data from the table
  db.all('SELECT * FROM funds', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    res.json({ data: rows })
  })
})

// Read a specific record by ID
router.get('/:id', (req, res) => {
  const CUSIP = req.params.id;

  if( CUSIP ) {
    db.get('SELECT * FROM funds WHERE CUSIP = ?', [CUSIP], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!row) {
        return res.status(404).json({ message: 'Record not found' });
      }

      res.json({ data: row });
    })
  }
  else
    return res.status(400).json({ error: "Invalid or missing parameter" })
})

// Update a record by ID
router.put('/:id', (req, res) => {
  const CUSIP = req.params.id
  const { description, deployAddress } = req.body

  if( CUSIP && description && deployAddress ) {
    // NOTE: the async function is require to retrieve the updated row count!
    let query = 'UPDATE funds SET description = ?, deployAddress = ? WHERE CUSIP = ?'
    db.run(query, [description, deployAddress, CUSIP], async function (err) {
      if (err) {
        return res.status(500).json({ error: err.message })
      }

      res.json({ message: `Records updated: ${this.changes}` })
    })
  }
  else
    return res.status(400).json({ error: "Invalid or missing parameter" })
})

// Delete a record by ID
router.delete('/:id', (req, res) => {
  const CUSIP = req.params.id

  if( CUSIP ) {
    // NOTE: the async function is required to retrieve the deleted row count!
    db.run('DELETE FROM funds WHERE CUSIP = ?', [CUSIP], async function (err) {
      if (err) {
        return res.status(500).json({ error: err.message })
      }

      res.json({ message: `Records deleted: ${this.changes}` })
    })
  }
  else
    return res.status(400).json({ error: "Invalid or missing parameter" })
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
