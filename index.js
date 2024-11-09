const express = require('express');
const bodyparser = require('body-parser');
const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.set('view engine', 'ejs'); 
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT;
let XSSVulnerable = false; //ranjivost iskljucena

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, 
  });
  console.log(process.env.DATABASE_URL);

  pool.connect()
  .then(client => {
    console.log("Uspješno povezano na PostgreSQL bazu!");
  })
  .catch(err => {
    console.error('Greška pri povezivanju s bazom:', err.stack);
  });

//await pool.query('INSERT INTO tickets (ticketId, vatin, firstName, lastName) VALUES ($1, $2, $3, $4)', [ticketId, vatin, firstName, lastName]);

app.get('/', async (req, res) => {
   // res.render('index');
   const { rows: comments } = await pool.query('SELECT comment FROM comments');
   console.log("Komentari iz baze: ", comments);
   
   // Prosljeđivanje komentara u EJS
   res.render('index', { comments });
});
app.get('/comments', async(req, res) => {
    const { rows: comments } = await pool.query('SELECT comment FROM comments');
    console.log("Komentari iz baze: ", comments);
    res.json( {comments});
})

function sanitize(input) {
    console.log("sanitize");
    return input
        .replace(/&/g, "&amp;")      // Zamjenjuje '&' sa '&amp;'
        .replace(/</g, "&lt;")       // Zamjenjuje '<' sa '&lt;'
        .replace(/>/g, "&gt;")       // Zamjenjuje '>' sa '&gt;'
        .replace(/"/g, "&quot;")     // Zamjenjuje '"' sa '&quot;'
        .replace(/'/g, "&#x27;")     // Zamjenjuje "'" sa '&#x27;'
        .replace(/\//g, "&#x2F;");   // Zamjenjuje '/' sa '&#x2F;'
}


app.post('/addComment', async(req, res) => {
    let comment = req.body.comment;
    console.log("/addComment: ", XSSVulnerable);
    console.log(req.body);

    if(!XSSVulnerable) { //ranjivost ukljucena
        comment = sanitize(comment);
    }
    console.log(comment);
    //!!upisat komentar u bazu
    await pool.query('INSERT INTO comments (comment) VALUES ($1)', 
                [comment]);
    //res.redirect('/');
   // res.json({ success: true, XSSVulnerable });
   res.json({ success: true, XSSVulnerable, comment });

});

app.post('/toggleXSS', (req, res) => {
    XSSVulnerable = !XSSVulnerable;
    console.log("Is website XSS vulnerable? ", XSSVulnerable);
    res.redirect('/');
});

app.get('/getXSSStatus', (req, res) => {
    res.json({XSSVulnerable});
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})

//<script>alert('Stored XSS attack!')</script>
