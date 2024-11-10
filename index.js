const express = require('express');
const bodyparser = require('body-parser');
const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const crypto = require('crypto');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT;
let XSSVulnerable = false; //ranjivost iskljucena
let SDEVulnerable = false;


const algorithm = 'aes-256-cbc';
const secretKey = process.env.SECRET_KEY;  // Use environment variables for better security
const iv = crypto.randomBytes(16);

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

// app.get('/', async (req, res) => {
//    // res.render('index');
//    const { rows: comments } = await pool.query('SELECT comment FROM comments');
//    console.log("Komentari iz baze: ", comments);
   
//    // Prosljeđivanje komentara u EJS
//    res.render('index', { comments });
// });

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views','index.html')));
app.get('/xss', (req, res) => res.sendFile(path.join(__dirname, 'views', 'xss.html')));
app.get('/sde', (req, res) => res.sendFile(path.join(__dirname, 'views', 'sde.html')));


function sanitize(input) {
    console.log("sanitize");
    return input
        .replace(/&/g, "&amp;")      // Zamjenjuje '&' sa '&amp;'
        .replace(/</g, "&lt;")       // Zamjenjuje '<' sa '&lt;'
        .replace(/>/g, "&gt;")       // Zamjenjuje '>' sa '&gt;'
        .replace(/"/g, "&quot;")     // Zamjenjuje '"' sa '&quot;'
        .replace(/'/g, "&#x27;")     // Zamjenjuje "'" sa '&#x27;'
        .replace(/\//g, "&#x2F;")   // Zamjenjuje '/' sa '&#x2F;'
        .replace(/`/g, "&#x60;");     // Zamjenjuje '`' sa '&#x60;'
}

function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
}


app.post('/addComment', async(req, res) => {
    let comment = req.body.comment;
    console.log("/addComment: ", XSSVulnerable);
    console.log(req.body);

    try {
        if(!XSSVulnerable) { //ranjivost iskljucena
            comment = sanitize(comment);
        }
        console.log(comment);
        //!!upisat komentar u bazu
        await pool.query('INSERT INTO comments (comment) VALUES ($1)', 
                    [comment]);
        //res.redirect('/');
       // res.json({ success: true, XSSVulnerable });
       res.json({ success: true, XSSVulnerable, comment });

    } catch (err) {
        console.error("Greska pri unosi komentara: ", err);
        res.status(500).json({ success: false, message: 'Došlo je do pogreške pri pohranjivanju podataka.' });

    }
   

});

app.post('/addCard', async (req, res) => {
    const { cardNumber, expiryDate, cvv } = req.body;
    console.log( cardNumber, expiryDate, cvv);

    try {

        console.log(crypto.randomBytes(32));
        if(!SDEVulnerable) {
            const encryptedCardNumber = encrypt(cardNumber);
            const encryptedExpirationDate = encrypt(expiryDate);
            const encryptedCVV = encrypt(cvv);

            await pool.query('INSERT INTO cards (cardNum, expDate, cvv, iv) VALUES ($1, $2, $3, $4)', 
                [encryptedCardNumber.encryptedData, encryptedExpirationDate.encryptedData, encryptedCVV.encryptedData, encryptedCardNumber.iv]);
        } else {
            await pool.query('INSERT INTO cards (cardNum, expDate, cvv) VALUES ($1, $2, $3)', [cardNumber, expiryDate, cvv]);

        }

        res.json({success: true, SDEVulnerable});
    } catch (err) {
        console.error("Greska pri unosi kartice: ", err);
        res.status(500).json({ success: false, message: 'Došlo je do pogreške pri pohranjivanju podataka.' });
    }
});

app.post('/toggleXSS', (req, res) => {
    XSSVulnerable = !XSSVulnerable;
    console.log("Is website XSS vulnerable? ", XSSVulnerable);
    res.redirect('/');
});

app.post('/toggleSDE', (req, res) => {
    SDEVulnerable = !SDEVulnerable;
    console.log("Is website SDE vulnerable? ", SDEVulnerable);
    res.redirect('/');
});

app.get('/getXSSStatus', (req, res) => {
    res.json({XSSVulnerable});
});

app.get('/getSDEStatus', (req, res) => {
    res.json({SDEVulnerable});
});

app.get('/comments', async(req, res) => {
    const { rows: comments } = await pool.query('SELECT comment FROM comments');
    console.log("Komentari iz baze: ", comments);
    res.json( {comments});
});

app.get('/cards', async(req, res) => {
    const { rows: cards } = await pool.query('SELECT cardNum, expDate, cvv FROM cards');
    console.log("Komentari iz baze: ", cards);
    res.json({cards});
});

app.delete('/deleteAllComments', async (req, res) => {
    try {
        await pool.query('DELETE FROM comments'); 
        res.status(200).send({ message: "Svi komentari su obrisani." });
    } catch (error) {
        console.error("Greška prilikom brisanja komentara:", error);
        res.status(500).send({ message: "Došlo je do greške prilikom brisanja komentara." });
    }
});

app.delete('/deleteAllCards', async (req, res) => {
    try {
        await pool.query('DELETE FROM cards');
        res.status(200).send({ message: "Sve kartice su obrisane." });
    } catch (error) {
        console.error("Greška prilikom brisanja kartica:", error);
        res.status(500).send({ message: "Došlo je do greške prilikom brisanja kartica." });
    }
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})

//<script>alert('Stored XSS attack!')</script>
