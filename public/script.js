console.log("tu samm");

function setXSSCheckbox() {
    console.log("setXSSCheckbox pozvana");
     fetch('/getXSSStatus')
        .then(response => response.json())
        .then(data => {
            console.log("Ispis u script.js:", data.XSSVulnerable);
            document.getElementById('xssCheckbox').checked = data.XSSVulnerable;
        })
        .catch(error => console.error('Greška prilikom dohvaćanja XSS stanja:', error));
};


function toggleXSS() {
    fetch('/toggleXSS', {
        method: 'POST'
    })
    .then(() => {
        setXSSCheckbox();
    })
    .catch(error => console.error('Greška prilikom promjene XSS postavke:', error));
}

function addComment(event) {
    console.log("Funckija addComment");
    event.preventDefault(); // Sprječava zadani submit obrazca

    const formData = new FormData(event.target);
    const comment = formData.get("comment");
    console.log("Komentar na frontendu: ", comment);

    fetch('/addComment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
    })
    .then(response => response.json())
    .then(data => {
        console.log("tttt");
        if (data.success) {
            // Ažurira checkbox stanje prema odgovoru poslužitelja
            document.getElementById('xssCheckbox').checked = data.XSSVulnerable;
            const commentDiv = document.createElement('div');

            // Koristimo textContent za dodavanje komentara u div
            commentDiv.textContent = comment;

            // Dodajemo novi div u postojeći container za komentare
            document.getElementById('comments').appendChild(commentDiv);
            // Preusmjerava na glavnu stranicu nakon uspjeha
            //window.location.href = '/';
        }
    })
    .catch(error => console.error('Error adding comment:', error));
}

function loadComments() {
    console.log("pozvanaa loadComments");
    fetch('/comments')
        .then(response => response.json())
        .then(data => {
            const commentsDiv = document.getElementById('comments');
            commentsDiv.innerHTML = '';

            data.comments.forEach(comment => {
                comment = comment.comment;
                console.log("bb", comment);
                const commentElement = document.createElement('div');
                commentElement.innerHTML = comment;
                commentsDiv.appendChild(commentElement);
            })
        })
        .catch(error => console.error('Greska pri dohvacanju komentara: ', error));
}

window.onload = function() {
    setXSSCheckbox();
    //loadComments();
};

