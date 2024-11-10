function setSDECheckbox() {
    console.log("setSDECheckbox pozvana");
     fetch('/getSDEStatus')
        .then(response => response.json())
        .then(data => {
            console.log("Ispis u script.js:", data.SDEVulnerable);
            document.getElementById('sdeCheckbox').checked = data.SDEVulnerable;
        })
        .catch(error => console.error('Greška prilikom dohvaćanja SDE stanja:', error));
};


function toggleSDE() {
    fetch('/toggleSDE', {
        method: 'POST'
    })
    .then(() => {
        setSDECheckbox();
    })
    .catch(error => console.error('Greška prilikom promjene SDE postavke:', error));
}

function addCard(event) {
    event.preventDefault(); // Sprječava zadani submit obrazca
    console.log("Funckija addCard");

    const formData = new FormData(event.target);
    const cardNumber = formData.get("cardNumber");
    const expiryDate = formData.get("expiryDate");
    const cvv = formData.get("cvv");    

    fetch('/addCard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber, expiryDate, cvv })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.success) {
            console.log("tttt");

            // Ažurira checkbox stanje prema odgovoru poslužitelja
            document.getElementById('sdeCheckbox').checked = data.SDEVulnerableVulnerable;
            loadCards();  
            event.target.reset();
        }
    })
    .catch(error => console.error('Error adding comment:', error));
}

function loadCards() {
    console.log("pozvanaa loadComments");
    fetch('/cards')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const cardsBody = document.getElementById('cardsBody');
            cardsBody.innerHTML = '';

            data.cards.forEach(card => {
                const row = document.createElement("div");
                    row.innerHTML = `
                        <div>${card.cardnum}</div>
                        <div>${card.expdate}</div>
                        <div>${card.cvv}</div>
                    `;
                    cardsBody.appendChild(row);
            })
        })
        .catch(error => console.error('Greska pri dohvacanju komentara: ', error));
}

async function deleteAllCards() {
    const confirmation = confirm("Jeste li sigurni da želite obrisati sve komentare?");
    if (!confirmation) return;

    try {
        const response = await fetch('/deleteAllCards', {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert("Sve kartice su uspješno obrisane.");
            document.getElementById("comments").innerHTML = '';
            const delAllButton = document.getElementById('delAllCards');
            document.getElementById("comments").style.display = "none";
            delAllButton.style.display = "none";
        } else {
            alert("Došlo je do pogreške prilikom brisanja komentara.");
        }
    } catch (error) {
        console.error("Greška:", error);
        alert("Došlo je do pogreške prilikom povezivanja s poslužiteljem.");
    }
}

window.onload = function() {
    setSDECheckbox();
    loadCards();
};