function setXSSCheckbox() {
    console.log("setXSSCheckbox pozvana");
     fetch('/getXSSStatus')
        .then(response => response.json())
        .then(data => {
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

function loadComments() {
    console.log("pozvanaa loadComments");
    fetch('/comments')
        .then(response => response.json())
        .then(data => {
            const commentsDiv = document.getElementById('comments');
            const delAllButton = document.getElementById('delAllButton');

            if (data.comments.length > 0) {
                delAllButton.style.display = "block";
                commentsDiv.style.display = "block";

                commentsDiv.innerHTML = '';
                data.comments.forEach(comment => {
                    comment = comment.comment;
                    const commentDiv = document.createElement('div');
                    commentDiv.classList.add('comment'); 
                    commentDiv.innerHTML = comment;
                    document.getElementById('comments').appendChild(commentDiv);
                })
            } else {
                delAllButton.style.display = "none";
                commentsDiv.style.display = "none";
            }
           
           
        })
        .catch(error => console.error('Greska pri dohvacanju komentara: ', error));
}

function addComment(event) {
    event.preventDefault(); 

    const formData = new FormData(event.target);
    const comment = formData.get("comment");

    fetch('/addComment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('xssCheckbox').checked = data.XSSVulnerable;
            loadComments();
            event.target.reset();
        }
    })
    .catch(error => console.error('Error adding comment:', error));
}

async function deleteAllComments() {
    const confirmation = confirm("Jeste li sigurni da želite obrisati sve komentare?");
    if (!confirmation) return;

    try {
        const response = await fetch('/deleteAllComments', {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert("Svi komentari su uspješno obrisani.");
            document.getElementById("comments").innerHTML = '';
            const delAllButton = document.getElementById('delAllButton');
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
    setXSSCheckbox();
    loadComments();
};

