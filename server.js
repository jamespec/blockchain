const express = require('express');
const app = express();

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

const users = require('./routes/users')
app.use('/users', users )

const box = require('./routes/box')
app.use('/box', box )

app.listen(3000)
