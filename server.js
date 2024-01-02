const express = require('express');
const app = express();

const sqlite3 = require('sqlite3').verbose();

app.use(express.static("public"))               // Serve static pages
app.use(express.urlencoded({extended: true}))   // Decodes format to access elements.
app.use(express.json())                         // Parse JSON received from the client.
app.set('view engine', 'ejs')                   // Render pages, dynamic content.

// Create standard logging to be used when accessing all endpoints.
// The app.use ahead of defining the routes makes this "middleware" run.
function logger( req, res, next ) {
    console.log( req.originalUrl )
    next()
}
app.use( logger )

app.get('/', logger, (req, res) => {
    console.log("In get")
    res.render('index', { text: "world" })
})

const box = require('./routes/box')
app.use('/box', box )

const account = require('./routes/account')
app.use('/api/account', account )

const fund = require('./routes/fund')
app.use('/api/fund', fund )

const instruction = require('./routes/instruction')
app.use('/api/instruction', instruction )

app.listen(3000)
