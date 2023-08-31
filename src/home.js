// Déclaration des variables
let buttons;
let journal;
let cartouche;
let btnNewJournal;

// Attend que le DOM soit prêt
document.addEventListener("DOMContentLoaded", function () {
    // Sélection des éléments
    buttons = document.querySelectorAll('.areaButtons button');
    journal = document.querySelector('.journal');
    cartouche = document.querySelector('.cartouche');

    // Au départ, afficher seulement le bouton "Nouveau journal"
    buttons.forEach(button => {
        if (button.classList.contains('btn-nouveau-journal')) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }

        // Ajoute un événement de clic pour chaque bouton
        button.addEventListener('click', () => {
            let evenementButton; // Déclaration de la variable
            const buttonType = button.getAttribute('data-button-type');

            // Utilise un switch pour appeler la fonction appropriée en fonction du type de bouton
            switch (buttonType) {
                case 'nouveau-journal':
                    nouvelleJournalFunction();
                    evenementButton = document.querySelector('[data-button-type="evenement"]');
                    evenementButton.style.display = 'block';
                    button.style.display = 'none';
                    break;
                case 'evenement':
                    evenementFunction();
                    button.style.display = 'none';
                    evenementButton = document.querySelector('[data-button-type="fermer-journal"]');
                    evenementButton.style.display = 'block';
                    break;
                case 'fermer-journal':
                    fermerJournalFunction();
                    button.style.display = 'none';
                    evenementButton = document.querySelector('[data-button-type="nouveau-journal"]');
                    evenementButton.style.display = 'block';
                    break;
                default:
                    // Code à exécuter si le type du bouton n'est pas reconnu
            }
        });
    });

    btnNewJournal = document.querySelector(".btn-newJournal");
    submitButton.addEventListener("click", function(event) {
        event.preventDefault(); // Empêcher l'envoi du formulaire
    
        // Récupération des valeurs
        const precision = document.querySelector("#precision").value;
        const periodeParJour = document.querySelector("#periodeParJour").value;
        const frequenceParSemaine = document.querySelector("#frequenceParSemaine").value;
        const dateDebut = document.querySelector("#dateDebut").value;
        const dateFin = document.querySelector("#dateFin").value;
        const titreJournal = document.querySelector("#titreJournal").value;
        const chefProjet = document.querySelector("#chefProjet").value;
        const classe = document.querySelector("#classe").value;
        const proprietaire = document.querySelector("#proprietaire").value;
    
        // Création d'un objet avec toutes ces données 
        const journalData = {
          precision,
          periodeParJour,
          frequenceParSemaine,
          dateDebut,
          dateFin,
          titreJournal,
          chefProjet,
          classe,
          proprietaire,
        };

});

// Fonction pour le bouton 'Nouveau journal'
function nouvelleJournalFunction() {
    cartouche.style.display = 'block';
}

// Fonction pour le bouton 'Evenement'
function evenementFunction() {
    console.log("Fonction pour le bouton 'Evenement'");
    // Ajoute ici le code que tu veux exécuter
}

// Fonction pour le bouton 'Fermer le journal'
function fermerJournalFunction() {
    console.log("Fonction pour le bouton 'Fermer le journal'");
    // Ajoute ici le code que tu veux exécuter
}
