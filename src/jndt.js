/*
Développement d'une application pour la gestion des journaux dans une école technique. elle offre :
1. création de journal avec titre, auteur, responsable.
2. saisie des activités pour un suivi détaillé.
3. planification et gestion des tâches.
4. création de diagrammes de Gantt.
5. graphiques temporels avec granularité ajustable (3, 6, 12 lignes par heure).
6. configuration flexible du journal.
7. gestion de projets de différentes durées (court : 24 périodes, moyen : 32 périodes, long : 40 périodes), ajustable pour jours fériés.
8. prise en compte des interruptions et vacances.
9. sauvegarde locale via 'localStorage'.
10. exportation des données vers une base de données.
*/

// Déclaration globale
let sequenceNumber = [0, 0]
let sequenceCalDate = [0, 0]
let dataJournal = null
let defaultTasks = [
  {
    id: 'etude',
    name: 'Etude/Analyse',
    category: 'Initiation',
    description: 'Identifier les besoins et établir une base pour le projet.'
  },
  {
    id: 'reunion',
    name: 'Réunion',
    category: 'Planification',
    description:
      'Planifier le projet, définir les objectifs et les ressources nécessaires.'
  },
  {
    id: 'redaction',
    name: 'Rédaction',
    category: 'Documentation',
    description:
      'Rédaction de documents de planification comme le cahier des charges.'
  },
  {
    id: 'developpement',
    name: 'Développement',
    category: 'Exécution',
    description: 'Exécuter les tâches de développement conformément au plan.'
  },
  {
    id: 'test',
    name: 'Test',
    category: 'Contrôle de Qualité',
    description: 'Tester les fonctionnalités pour assurer la qualité.'
  },
  {
    id: 'evaluationCompetences',
    name: 'Évaluation des Compétences',
    category: 'Évaluation',
    description: "Évaluer les compétences et la performance de l'équipe."
  },
  {
    id: 'autoFormation',
    name: 'Autoformation',
    category: 'Amélioration Continue',
    description:
      "Promouvoir l'auto-apprentissage pour améliorer les compétences."
  },
  {
    id: 'absence',
    name: 'Absences/Maladie',
    category: 'Ressources Humaines',
    description: 'Gérer les absences et les ressources humaines.'
  }
]
// provisoir normalement json ....
const CVacances = {
  hiver: { debut: new Date('2023-12-23'), fin: new Date('2024-01-07') },
  relaches: { debut: new Date('2024-02-10'), fin: new Date('2024-02-18') },
  paques: { debut: new Date('2024-03-29'), fin: new Date('2024-04-14') },
  ascension: { debut: new Date('2024-05-09'), fin: new Date('2024-05-12') },
  pentecote: { debut: new Date('2024-05-20'), fin: new Date('2024-05-20') }, // Un seul jour
  ete: { debut: new Date('2024-06-29'), fin: new Date('2024-08-18') },
  jeuneFederal: { debut: new Date('2024-09-16'), fin: new Date('2024-09-16') }, // Un seul jour
  automne: { debut: new Date('2024-10-12'), fin: new Date('2024-10-27') },
  hiverSuivant: { debut: new Date('2024-12-21'), fin: new Date('2025-01-05') }
}

const CJoursFeries = {
  nouvelAn: new Date('2024-01-01'),
  lendemainNouvelAn: new Date('2024-01-02'),
  vendrediSaint: new Date('2024-03-29'),
  lundiPaques: new Date('2024-04-01'),
  jeudiAscension: new Date('2024-05-09'),
  lundiPentecote: new Date('2024-05-20'),
  feteNationale: new Date('2024-08-01'),
  lundiJeune: new Date('2024-09-16'),
  noel: new Date('2024-12-25')
}

const CJours = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi'
]

let VResult = {
  date: null,
  divSpecial: null
}

const onglets = {
  JOURNAUX: 'Journaux',
  NOUVEAU_JOURNAL: 'NouveauJournal',
  BILAN_GRAPHIQUE: 'BilanGraphique',
  GANTT: 'Gantt',
  PLANIFICATION: 'Planification',
  JOURNAL: 'Journal'
}

function initJndt () {
  updateTaskTable()
  activateTab(onglets.NOUVEAU_JOURNAL)
}

function validateJournal () {
  var requiredFields = [
    'titreJournal',
    'responsable',
    'auteur',
    'typeProjet',
    'precision',
    'dateDebut',
    'typeJournal'
  ]

  for (var i = 0; i < requiredFields.length; i++) {
    var field = document.getElementById(requiredFields[i])
    if (!field.value) {
      showAlert('Veuillez remplir tous les champs obligatoires.', 'error')
      return false
    }
  }

  var projectType = document.getElementById('typeProjet').value
  var baseDuration

  // Si le type de projet est TPI, fixer la baseDuration à 60 minutes
  if (projectType === 'tpi') {
    baseDuration = 60
    showAlert('Veuillez remplir tous les champs obligatoires.', 'info')
  } else {
    // Sinon, déterminer la baseDuration en fonction du type de journal
    baseDuration =
      document.getElementById('typeJournal').value === 'heures' ? 60 : 45
  }

  // Appel à createJournal
  createJournal(
    document.getElementById('titreJournal').value,
    document.getElementById('auteur').value,
    document.getElementById('responsable').value,
    document.getElementById('dateDebut').value,
    parseInt(document.getElementById('precision').value),
    projectType,
    8, // defaultSequences
    baseDuration
  )

  activateTab(onglets.PLANIFICATION)
  dataJournal.id = generateUniqueId(dataJournal.author)

  showAlert(
    'Tous les champs obligatoires sont correctement remplis.',
    'success'
  )
  return true
}

// Creates a new journal and returns an object containing journal information
function createJournal (
  title,
  author,
  responsible,
  firstDate,
  timePrecision,
  projectType,
  defaultSequences,
  baseDuration,
  jWork = []
) {
  // Initialize the dataJournal object with additional configuration
  dataJournal = {
    title: title, // The title of the journal
    author: author, // The author of the journal
    responsible: responsible, // The person responsible for the journal
    firstSeq: firstDate,
    journalEntries: [], // Array to store journal entries
    planningEntries: [], // Array to store planning entries
    joursSelectionnes: jWork,
    config: {
      timePrecision: timePrecision, // Time precision (3, 6, 9 lines per hour)
      projectType: projectType, // Project type (short, medium, long, TPI)
      defaultSequences: defaultSequences || 8, // Default number of sequences, default is 8
      baseDuration: baseDuration // Base duration (60 or 45 minutes)
    },
    taskList: defaultTasks
  }

  // Setting default values and duration for projectType
  switch (projectType) {
    case 'court':
      dataJournal.config.projectDuration = 24 // Short project duration in periods
      break
    case 'moyen':
      dataJournal.config.projectDuration = 32 // Medium project duration in periods
      break
    case 'long':
      dataJournal.config.projectDuration = 40 // Long project duration in periods
      break
    case 'tpi':
      // Define the duration for TPI project type
      dataJournal.config.projectDuration = 80 // TPI project duration in hours
      dataJournal.config.preparatoryWork = 5 // Preparatory work allowed, in days
      break
    default:
      // Handle unknown project type if necessary
      break
  }

  // Exécuter si joursSelectionnes est null, non défini, ou vide
  // Collecte des jours sélectionnés
  var checkboxes = document.querySelectorAll(
    '#frequenceParSemaine input[type=checkbox]:checked'
  )

  if (dataJournal.config.projectType === 'tpi') {
    dataJournal.joursSelectionnes = [1, 2, 3, 4, 5]
  } else if (
    !dataJournal.joursSelectionnes ||
    dataJournal.joursSelectionnes.length === 0
  ) {
    for (var checkbox of checkboxes) {
      dataJournal.joursSelectionnes.push(checkbox.value)
    }
  }

  return dataJournal
}

function addJournalEntry (entry) {
  if (dataJournal) {
    dataJournal.journalEntries.push(entry)
  } else {
    console.error("Le journal n'a pas été créé.")
  }
}

function openTab (event, tabName) {
  // Cache tous les contenus des onglets
  var tabcontents = document.getElementsByClassName('tabcontent')
  for (var i = 0; i < tabcontents.length; i++) {
    tabcontents[i].style.display = 'none'
  }

  // Enlève la classe 'active' de tous les onglets
  var tablinks = document.getElementsByClassName('tablinks')
  for (var i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(' active', '')
  }

  // Affiche le contenu de l'onglet actuel et ajoute une classe 'active' à l'onglet
  document.getElementById(tabName).style.display = 'block'
  event.currentTarget.className += ' active'

  // Sélectionner l'élément de message dans l'onglet actuel
  var messageElement = document.getElementById('message' + tabName)

  if (tabName === onglets.JOURNAUX) {
    displayJournalsFromLocalStorage()
  }

  // Vérifiez si un journal est ouvert ou créé et mettez à jour le message
  if (isJournalCreated()) {
    messageElement.textContent =
      'Un journal est actuellement ouvert ou a été créé.'
  } else {
    messageElement.textContent =
      "Aucun journal n'est actuellement ouvert ou créé."
  }
}

function isJournalCreated () {
  return dataJournal !== null && dataJournal !== undefined
}

function activateTab (tabId) {
  // Trouver tous les onglets et enlever la classe 'active'
  var tablinks = document.getElementsByClassName('tablinks')
  for (var i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(' active', '')
  }

  // Cacher tous les contenus des onglets
  var tabcontents = document.getElementsByClassName('tabcontent')
  for (var i = 0; i < tabcontents.length; i++) {
    tabcontents[i].style.display = 'none'
  }

  // Activer l'onglet spécifié et afficher son contenu
  var tab = document.getElementById(tabId)
  if (tab) {
    tab.style.display = 'block'
    // Trouver le bouton qui correspond à cet onglet
    var tabButton = document.querySelector(
      `.tablinks[aria-controls="${tabId}"]`
    )
    if (tabButton) {
      tabButton.className += ' active'
    }
  }
}

function addCustomTask (id, name, category, description) {
  defaultTasks.push({ id, name, category, description })
  updateTaskTable() // Met à jour le tableau affiché
}

function updateTaskTable () {
  var taskTableBody = document
    .getElementById('taskTable')
    .querySelector('tbody')
  taskTableBody.innerHTML = '' // Efface le tableau actuel

  defaultTasks.forEach(function (task) {
    var tr = document.createElement('tr')
    tr.innerHTML = `
          <td>${task.name}</td>
          <td class="tooltip" title="${task.description}">${task.category}
              <span class="tooltiptext">${task.description}</span>
          </td>
          <td class="hidden">${task.description}</td>
      `
    taskTableBody.appendChild(tr)
  })
}

// Adds an activity to the journal
function recordActivity (activityDescription, date, duration) {
  // Implementation
}

// Schedules a task with start and end dates
function scheduleTask (taskName, startDate, endDate) {
  // Implementation
}

// Generates a Gantt chart from the list of tasks
function generateGanttChart (tasksList) {
  // Implementation
}

// Creates a time-based graph for tasks
function createTimeGraph (tasksList, timeGranularity) {
  // Implementation
}

// Sets up journal configurations
function configureJournal (title, author, responsible, timeSettings) {
  // Implementation
}

// Manages and tracks projects based on their duration
function manageProject (projectType, duration, sequences) {
  // Implementation
}

// Adjusts the planning for holidays and vacation days
function adjustForHolidays (holidayDates) {
  // Implementation
}

function generateUniqueId (authorName) {
  // Prendre les 6 derniers chiffres de l'horodatage actuel
  const timestamp = Date.now().toString()
  const lastSixDigits = timestamp.substring(timestamp.length - 6)

  // Nettoyer le nom de l'auteur pour le rendre adapté à une clé (retirer les espaces, caractères spéciaux, etc.)
  const cleanAuthorName = authorName.replace(/[^a-zA-Z0-9]/g, '')

  // Combinaison des deux pour l'ID
  return `${lastSixDigits}_${cleanAuthorName}`
}

function displayJournalsFromLocalStorage () {
  const keys = Object.keys(localStorage)
  const journalPrefix = 'dataJournal_'
  const journalsContainer = document.getElementById('journalGridSection')

  // Vider le conteneur existant
  journalsContainer.innerHTML = ''

  keys.forEach(key => {
    if (key.startsWith(journalPrefix)) {
      const journalData = JSON.parse(localStorage.getItem(key))

      // Créer un élément pour le journal
      const journalDiv = document.createElement('div')
      journalDiv.className = 'journal-entry'
      journalDiv.style.cursor = 'pointer' // Style pour montrer que l'élément est cliquable

      // Ajouter un écouteur d'événements pour le clic
      journalDiv.addEventListener('click', () => {
        loadSave(journalData) // Remplacer 'loadSave' par le nom de votre fonction de chargement
      })

      // Ajouter l'icône ou l'image du journal
      const journalIcon = document.createElement('img')
      journalIcon.src = 'src/img/Journaux.png'
      journalIcon.alt = 'Icône de journal'
      journalIcon.className = 'journal-icon'

      // Ajouter le titre du journal
      const journalTitle = document.createElement('h3')
      const titleText = journalData.title
        ? journalData.title + ' - ' + journalData.responsible
        : 'Journal sans titre'
      const dateString = journalData.firstSeq
        ? new Date(journalData.firstSeq).toLocaleDateString()
        : 'pas de date'
      journalTitle.innerHTML = `${titleText}<br>${dateString}`

      // Assembler l'élément du journal
      journalDiv.appendChild(journalIcon)
      journalDiv.appendChild(journalTitle)

      // Ajouter l'élément du journal au conteneur
      journalsContainer.appendChild(journalDiv)
    }
  })
}

function saveJournalLocally () {
  if (!dataJournal || !dataJournal.id) {
    console.warn(
      'Données du journal ou identifiant manquant pour la sauvegarde locale.'
    )
    return
  }

  try {
    const dataToSave = JSON.stringify(dataJournal)
    const journalKey = `dataJournal_${dataJournal.id}`
    localStorage.setItem(journalKey, dataToSave)
    console.log(
      `Journal ${dataJournal.id} sauvegardé localement sous la clé ${journalKey}.`
    )
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du journal : ', error)
  }
}

function loadJournalLocally (journalId) {
  const journalKey = `dataJournal_${journalId}`
  try {
    const data = localStorage.getItem(journalKey)
    if (data) {
      console.log(`Journal ${journalId} chargé depuis la clé ${journalKey}.`)
      return JSON.parse(data)
    } else {
      console.warn(`Aucun journal trouvé avec l'identifiant ${journalId}.`)
      return null
    }
  } catch (error) {
    console.error('Erreur lors du chargement du journal : ', error)
    return null
  }
}

// Exports journal data to a database
function exportToDatabase (journalData, dbConnectionInfo) {
  // Implementation
}

function createInputField (type, name, placeholder, options, className) {
  let field

  if (type === 'select') {
    field = document.createElement('select')
    options.forEach(optionObject => {
      let option = document.createElement('option')
      option.value = optionObject.name
      option.textContent = optionObject.name
      field.appendChild(option)
    })
  } else {
    field = document.createElement('input')
    field.type = type
    field.placeholder = placeholder
    if (type === 'number') {
      field.step = 5
      field.max = dataJournal.config.baseDuration
      field.min = 0
    }
  }

  field.name = name
  field.className = className // Appliquer la classe

  return field
}

function ajouterNouvelleSequence (onglet) {
  if (!dataJournal || !dataJournal.config) {
    showAlert("dataJournal n'est pas correctement initialisé.", 'error')
    return
  }

  var typeProjet = dataJournal.config.projectType // 'court', 'moyen', 'long', ou 'tpi'
  var precision = dataJournal.config.timePrecision // 3, 6, ou 9 lignes par heure
  var dureeProjet =
    typeProjet === 'tpi' ? 7 : dataJournal.config.projectDuration / 8

  // Récupérer les jours sélectionnés depuis les checkbox
  var frequence = dataJournal.joursSelectionnes || []
  var nombreJours = frequence.length

  let parentElement = getParentElement(onglet)

  if (!parentElement) {
    showAlert("L'élément parent pour les séquences n'existe pas.", 'error')
    return
  }

  sequenceDiv = creerDivSequence(onglet)

  // affiche l'entete des entrées
  // addEntriesHeader()

  // Pour chaque jour
  for (let i = 0; i < nombreJours; i++) {
    let jour = frequence[i]
    sequenceDiv.appendChild(creerDivJour(jour, dureeProjet, precision))
  }

  // // Ajouter un bouton pour ajouter une nouvelle entrée à la fin de la séquence
  // let btnAjouterEntree = document.createElement('button');
  // btnAjouterEntree.innerText = 'Ajouter une nouvelle entrée';
  // btnAjouterEntree.onclick = function() {
  //   sequenceDiv.appendChild(creerDivEntree());
  // };
  // sequenceDiv.appendChild(btnAjouterEntree);

  parentElement.prepend(sequenceDiv)
}

function creerDivCheckTimes(periodeDiv) {
  // Crée une nouvelle div pour afficher la durée
  const checkTimesDiv = document.createElement('div');
  checkTimesDiv.className = 'totalDurationDisplay';

  // Définit le contenu HTML de la div avec le temps maximum
  const maxDuration = dataJournal.config.baseDuration;
  checkTimesDiv.innerHTML = "Total : <span class='totalDuration'>0</span> / Max : <span class='objectifTime'>" + maxDuration + "</span>";

  // Met à jour la durée totale en fonction des changements dans periodeDiv
  updateCheckTimesForThisDiv(periodeDiv, checkTimesDiv);

  return checkTimesDiv;
}



function updateCheckTimesForThisDiv (periodeDiv, checkTimesDiv) {
  if (!periodeDiv) {
    console.error('Période introuvable.')
    return
  }

  const updateTotalDuration = () => {
    let totalDuration = 0

    // Trouve tous les éléments de classe 'entree' dans periodeDiv
    const entrees = periodeDiv.getElementsByClassName('entree')
    Array.from(entrees).forEach(entree => {
      const inputDuration = entree.querySelector('input[name="duration"]')
      if (
        inputDuration &&
        inputDuration.value !== '' &&
        !isNaN(inputDuration.value)
      ) {
        totalDuration += parseFloat(inputDuration.value)
      }
    })

    // Vérifie le total par rapport au temps maximum
    const maxDuration = dataJournal.config.baseDuration
    let displayColor

    if (totalDuration === maxDuration) {
      // Vert si parfait
      displayColor = 'var(--couleur-principale)'
    } else if (totalDuration > maxDuration) {
      // Rouge en cas de dépassement
      displayColor = 'red'
    } else {
      // Couleur standard pour les autres cas
      displayColor = 'var(--couleur-texte)'
    }

    // Met à jour le contenu de checkTimesDiv
    if (checkTimesDiv) {
      const totalDisplay = checkTimesDiv.querySelector('.totalDuration')
      if (totalDisplay) {
        totalDisplay.textContent = totalDuration
        totalDisplay.style.color = displayColor
      }
    }

    // Affichage console pour le débogage
    console.log('Total duration:', totalDuration)
  }

  // Attache les écouteurs d'événements aux inputs 'duration'
  const entrees = periodeDiv.getElementsByClassName('entree')
  Array.from(entrees).forEach(entree => {
    const inputDuration = entree.querySelector('input[name="duration"]')
    if (inputDuration) {
      inputDuration.addEventListener('input', updateTotalDuration)
    }
  })

  updateTotalDuration() // Initialisation du total
}

function addEntriesHeader () {
  let entreesHeader = document.getElementById('entreesHeader')
  entreesHeader.style.cssText = `
      display: grid;
      grid-template-columns: 7ch 18ch auto 20ch 12ch 5ch 2ch 2ch;
      gap: 3px;
      position: fixed;
      top: 264px; /* Positionne l'en-tête à 266px du haut */
      background: white;
      padding-left: 80px; /* Ajouter du padding à l'intérieur de l'en-tête */
      padding-right:80px;
      box-shadow: 0px 2px 4px rgba(0,0,0,0.1); /* Optionnel, pour une meilleure visibilité */
      left: 0;
      right: 0;
      box-sizing: border-box; /* Inclut padding et border dans la largeur */
      font-size: 1.1em;
  `
}

// fonctions pour ajouter une nouvelle séquence

function creerDivSequence (onglet) {
  // Obtenir la prochaine date de la séquence et vérifier les jours fériés/vacances
  let sequenceDiv = document.createElement('div')
  let resultNextDate = getNextDate(dataJournal.firstSeq, onglet)
  // Créer et ajouter un élément pour afficher les informations de la séquence
  let infoDiv = document.createElement('div')

  if (onglets.JOURNAL == onglet) {
    sequenceCalDate[0]++
    sequenceNumber[0]++
    sequenceDiv.classList = 'sequence_' + sequenceNumber[0]
    infoDiv.innerHTML =
      'Séquence n° ' +
      sequenceNumber[0] +
      '<div> Date : ' +
      resultNextDate.date.toLocaleDateString() +
      '</div>'
  } else if (onglets.PLANIFICATION == onglet) {
    sequenceCalDate[1]++
    sequenceNumber[1]++
    sequenceDiv.classList = 'sequence_' + sequenceNumber[1]
    infoDiv.innerHTML =
      'Séquence n° ' +
      sequenceNumber[1] +
      '<div> Date : ' +
      resultNextDate.date.toLocaleDateString() +
      '</div>'
  }

  infoDiv.className = 'titleSequence'

  sequenceDiv.appendChild(infoDiv)

  // Ajouter la div spéciale pour les jours fériés ou les vacances
  if (resultNextDate.divSpecial) {
    sequenceDiv.appendChild(resultNextDate.divSpecial)
  }

  return sequenceDiv
}

function creerDivJour (jour, dureeProjet, precision) {
  let divJour = document.createElement('div')
  divJour.id = 'jour_' + jour
  divJour.className = 'jour'

  divJour.innerHTML = '<h3>' + CJours[jour] + '</h3>'

  for (let p = 0; p < dureeProjet; p++) {
    divJour.appendChild(creerDivPeriode(p, precision))
  }

  return divJour
}

function creerDivPeriode (periode, precision, onglet) {
  let periodesDiv = document.createElement('div')
  periodesDiv.className = 'periode_' + periode

  for (let e = 0; e < precision; e++) {
    periodesDiv.appendChild(creerDivEntree(onglet))
  }

  periodesDiv.appendChild(creerDivCheckTimes(periodesDiv))

  return periodesDiv
}

function creerDivEntree () {
  let entreeDiv = document.createElement('div')
  entreeDiv.className = 'entree'

  // Ajout des champs de saisie avec une classe spécifique pour chaque champ
  entreeDiv.appendChild(
    createInputField('number', 'duration', '[min]', null, 'input-duration')
  )
  entreeDiv.appendChild(
    createInputField('select', 'task', '', dataJournal.taskList, 'select-task')
  )
  entreeDiv.appendChild(
    createInputField(
      'text',
      'description',
      'Description',
      null,
      'input-description'
    )
  )
  entreeDiv.appendChild(
    createInputField('text', 'ref', 'Référence', null, 'input-ref')
  )
  entreeDiv.appendChild(
    createInputField(
      'select',
      'status',
      '',
      [
        { name: 'En cours' },
        { name: 'Terminé' },
        { name: 'Abandonné' },
        { name: 'Confier' }
      ],
      'select-status'
    )
  )
  entreeDiv.appendChild(
    createInputField('text', 'tag', 'Tag', null, 'input-tag')
  )

  // Bouton de suppression
  let btnSupprimer = document.createElement('button')
  btnSupprimer.innerText = 'X'
  btnSupprimer.className = 'btnSuppression'
  btnSupprimer.onclick = function () {
    entreeDiv.remove()
  }
  entreeDiv.appendChild(btnSupprimer)

  return entreeDiv
}

function getParentElement (onglet) {
  if (onglet === onglets.JOURNAL) {
    return document.getElementById('parentSequenceJournal')
  } else if (onglet === onglets.PLANIFICATION) {
    return document.getElementById('parentSequencePlannification')
  }
  console.log('le paramètre onglet contient une valeur incorrecte')
  return null
}

function getNextDate (firstDate, onglet) {
  // Réinitialiser VResult
  VResult.date = null
  VResult.divSpecial = null

  let nextDate = new Date(firstDate)
  nextDate.setDate(
    nextDate.getDate() + 7 * sequenceCalDate[onglets.JOURNAL == onglet ? 0 : 1]
  )

  while (isVacances(nextDate) || isJourFerie(nextDate)) {
    if (isVacances(nextDate)) {
      let nomVacances = getVacationName(nextDate) // Trouver le nom des vacances
      let finVacances = trouverFinVacances(nextDate)
      VResult.divSpecial = createDivSpecial('Vacances: ' + nomVacances)
      let nbSemanesVacances = Math.ceil(
        (finVacances - nextDate) / (7 * 24 * 60 * 60 * 1000)
      ) // Calculer le nombre de semaines de vacances
      sequenceCalDate[onglets.JOURNAL == onglet ? 0 : 1] += nbSemanesVacances // Incrémenter sequenceNumber en fonction de la durée des vacances
      nextDate = new Date(finVacances.setDate(finVacances.getDate() + 1))
    } else if (isJourFerie(nextDate)) {
      VResult.divSpecial = createDivSpecial('Jour Férié')
      nextDate.setDate(nextDate.getDate() + 1)
    }
  }

  VResult.date = nextDate
  return VResult
}

function getVacationName (date) {
  for (let [nom, periode] of Object.entries(CVacances)) {
    if (date >= periode.debut && date <= periode.fin) {
      return (
        nom +
        ' Du ' +
        periode.debut.toLocaleDateString() +
        ' Au ' +
        periode.fin.toLocaleDateString()
      ) // Retourne le nom de la période de vacances
    }
  }
  return 'Inconnu'
}

function trouverFinVacances (date) {
  for (let periode of Object.values(CVacances)) {
    if (date >= periode.debut && date <= periode.fin) {
      return new Date(periode.fin) // Retourne la fin de la période de vacances actuelle
    }
  }
  return null // Aucune période de vacances trouvée pour la date donnée
}

function createDivSpecial (text) {
  let div = document.createElement('div')
  div.textContent = text
  div.className = 'div-special'
  return div
}

// Vérifie si une date donnée est un jour férié.
// Paramètres:
// - date: L'objet Date à vérifier.
// - joursFeries: Objet contenant les jours fériés, où chaque clé est un nom de jour férié et la valeur est l'objet Date correspondant.
// La fonction transforme l'objet joursFeries en tableau d'objets Date, puis compare chaque jour férié avec la date donnée.
// Retourne true si la date correspond à un jour férié, sinon false.
function isJourFerie (date) {
  let formattedDate = date.toISOString().split('T')[0] // Format YYYY-MM-DD
  return Object.values(CJoursFeries).some(
    jourFerie => jourFerie.toISOString().split('T')[0] === formattedDate
  )
}

// Vérifie si une date donnée tombe pendant une période de vacances.
// Paramètres:
// - date: L'objet Date à vérifier.
// - vacances: Objet contenant les périodes de vacances, chaque période est un objet avec des propriétés 'debut' et 'fin'.
// La fonction transforme l'objet vacances en tableau de périodes, puis vérifie si la date est comprise entre le début et la fin de l'une des périodes.
// Retourne true si la date est pendant les vacances, sinon false.
function isVacances (date) {
  return Object.values(CVacances).some(
    vacance => date >= vacance.debut && date <= vacance.fin
  )
}

function saveEntries (onglet) {
  let containerId, targetArray

  if (onglet === onglets.JOURNAL) {
    containerId = 'parentSequenceJournal'
    targetArray = dataJournal.journalEntries
  } else if (onglet === onglets.PLANIFICATION) {
    containerId = 'parentSequencePlannification'
    targetArray = dataJournal.planningEntries
  }

  saveEntriesForContainer(containerId, targetArray)
  saveJournalLocally()
}

// attention supprimer les entrées malades ...
function saveEntriesForContainer (containerId, targetArray) {
  const container = document.getElementById(containerId)
  if (!container) {
    showAlert(`Le conteneur ${containerId} n'existe pas.`, 'error')
    return
  }

  // Sélection des divs de séquence qui ont une classe commençant par 'sequence_'
  const sequenceDivs = container.querySelectorAll("[class^='sequence_']")
  const entries = []

  sequenceDivs.forEach(sequenceDiv => {
    const sequenceNumber = sequenceDiv.className.match(/sequence_(\d+)/)[1] // Récupération du numéro de la séquence

    // Sélection des divs de jour qui ont un ID au format 'jour_1', 'jour_2', etc.
    const jourDivs = sequenceDiv.querySelectorAll("[id^='jour_']")

    jourDivs.forEach(jourDiv => {
      const jourNumber = jourDiv.id.match(/jour_(\d+)/)[1] // Récupération du numéro du jour à partir de l'ID
      const entreeDivs = jourDiv.querySelectorAll('.entree')

      entreeDivs.forEach(div => {
        const description = div.querySelector('.input-description').value
        const reference = div.querySelector('.input-ref').value

        // Vérifiez si les champs description et ref sont remplis
        if (description.trim() !== '' && reference.trim() !== '') {
          const duration = div.querySelector('.input-duration').value
          const task = div.querySelector('.select-task').value
          const status = div.querySelector('.select-status').value
          const tag = div.querySelector('.input-tag').value

          entries.push({
            sequenceNumber,
            jourNumber,
            duration,
            task,
            description,
            reference,
            status,
            tag
          })
        } else {
          div.remove()
        }
      })
    })
  })

  targetArray.splice(0, targetArray.length, ...entries)
}

function updateDOMWithEntries (tabType) {
  let entries, parentContainerId

  // Exemple d'appel de la fonction
  //  // updateDOMWithEntries('PLANIFICATION');

  // Déterminer le type d'onglet et définir les entrées et le conteneur parent appropriés
  if (tabType === 'PLANIFICATION') {
    entries = dataJournal.planningEntries
    parentContainerId = 'parentSequencePlannification'
  } else if (tabType === 'JOURNAL') {
    entries = dataJournal.journalEntries
    parentContainerId = 'parentSequenceJournal'
  } else {
    console.warn("Type d'onglet non reconnu.")
    return
  }

  // Vérifier si les entrées sont valides
  if (!entries || entries.length === 0) {
    console.warn(`Aucune entrée trouvée pour ${tabType}.`)
    return
  }

  entries.forEach(entry => {
    // Sélectionner le conteneur pour la séquence et le jour dans le conteneur parent approprié
    const container = document.querySelector(
      `#${parentContainerId} .sequence_${entry.sequenceNumber} #jour_${entry.jourNumber}`
    )
    if (!container) {
      console.warn(
        `Aucun conteneur trouvé pour la séquence ${entry.sequenceNumber} et le jour ${entry.jourNumber} dans ${tabType}.`
      )
      return
    }

    // Mettre à jour les entrées du DOM
    const domEntry = container.querySelector('.entree')
    if (domEntry) {
      domEntry.querySelector('.input-duration').value = entry.duration
      domEntry.querySelector('.select-task').value = entry.task
      domEntry.querySelector('.input-description').value = entry.description
      domEntry.querySelector('.input-ref').value = entry.reference
      domEntry.querySelector('.select-status').value = entry.status
      domEntry.querySelector('.input-tag').value = entry.tag
    }
  })
}

function imprimerJournal () {
  // Logique pour imprimer le journal
}

function exporterJournal () {
  // Logique pour exporter le journal (par exemple, en PDF ou autre format)
}

function showAlert (message, type) {
  var alertPopup = document.getElementById('alertPopup')
  alertPopup.textContent = message
  alertPopup.style.display = 'block'

  // Définir la couleur en fonction du type de message
  if (type === 'error') {
    alertPopup.style.backgroundColor = '#f44336' // Rouge pour les erreurs
  } else if (type === 'success') {
    alertPopup.style.backgroundColor = '#4CAF50' // Vert pour le succès
  } else if (type === 'info') {
    alertPopup.style.backgroundColor = '#FFA500' // Orange pour l'information
  }

  // Faire disparaître le popup après 3 secondes
  setTimeout(function () {
    alertPopup.style.display = 'none'
  }, 3000)
}
