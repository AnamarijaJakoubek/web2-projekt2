function setSDECheckbox() {
    console.log("setSDECheckbox pozvana");
     fetch('/getSDEStatus')
        .then(response => response.json())
        .then(data => {
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

function loadCards() {
    fetch('/cards')
        .then(response => response.json())
        .then(data => {

            const cardsDiv = document.getElementById('cards');
            const delAllButton = document.getElementById('delAllButton');
            let cardsBody = document.getElementById('cardsBody');
            let cardsHeader = document.getElementById('cardsHeader');

            if(!cardsBody) {
                cardsBody = document.createElement("div");
                cardsDiv.appendChild(cardsBody);
                cardsHeader = document.createElement("div");
                cardsHeader.innerHTML = `<div class="card">
                    <div class="card-header">Broj kartice</div>
                    <div class="card-header">Datum isteka</div>
                    <div class="card-header">CVV</div>
                </div>`;
                cardsDiv.appendChild(cardsHeader);
            }

            if (data.cards.length > 0) {
                delAllButton.style.display = "block";
                cardsDiv.style.display = "block";
                cardsBody.style.display = "block";
                cardsHeader.style.display = "block";

                cardsBody.innerHTML = ''; 

                data.cards.forEach(card => {
                    const cardDiv = document.createElement("div");
                    cardDiv.classList.add('card');
                    cardDiv.innerHTML = `
                            <div>${card.cardnum}</div>
                            <div>${card.expdate}</div>
                            <div>${card.cvv}</div>
                        `;
                    cardsBody.appendChild(cardDiv);
                })
            } else {
                delAllButton.style.display = "none";
                cardsDiv.style.display = "none";
            }

           
        })
        .catch(error => console.error('Greska pri dohvacanju komentara: ', error));
}

function addCard(event) {
    event.preventDefault(); 

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
        if (data.success) {
            document.getElementById('sdeCheckbox').checked = data.SDEVulnerable;
            loadCards();  
            event.target.reset();
        }
    })
    .catch(error => console.error('Error adding comment:', error));
}



async function deleteAllCards() {
    const confirmation = confirm("Jeste li sigurni da želite obrisati sve kartice?");
    if (!confirmation) return;

    try {
        const response = await fetch('/deleteAllCards', {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert("Sve kartice su uspješno obrisane.");
            document.getElementById("cards").innerHTML = '';
            const delAllButton = document.getElementById('delAllButton');
            document.getElementById("cards").style.display = "none";
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