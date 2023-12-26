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
let sequenceNumber = 0
let sequenceCalDate = 0
let dataJournal = null
let defaultTasks = [
  {
    id: 'absence',
    name: 'Absences/Maladie',
    category: 'Administratif',
    description: "Jours d'absence pour maladie ou autres raisons"
  },
  {
    id: 'etude',
    name: 'Etude/Analyse',
    category: 'Recherche',
    description: "Activités liées à l'étude et à l'analyse de projet"
  },
  {
    id: 'developpement',
    name: 'Développement',
    category: 'Travail',
    description: 'Tâches de développement et de programmation'
  },
  {
    id: 'test',
    name: 'Test',
    category: 'Validation',
    description: 'Activités de test et de validation de fonctionnalités'
  },
  {
    id: 'reunion',
    name: 'Réunion',
    category: 'Communication',
    description: 'Séances de réunion et de discussion'
  }
]

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
    baseDuration,
    defaultTasks
  )

  activateTab(onglets.PLANIFICATION)

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
  baseDuration
) {
  // Initialize the dataJournal object with additional configuration
  dataJournal = {
    title: title, // The title of the journal
    author: author, // The author of the journal
    responsible: responsible, // The person responsible for the journal
    firstSeq: firstDate,
    journalEntries: [], // Array to store journal entries
    planningEntries: [], // Array to store planning entries
    joursSelectionnes: [],
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

  // Collecte des jours sélectionnés
  var checkboxes = document.querySelectorAll(
    '#frequenceParSemaine input[type=checkbox]:checked'
  )
  for (var checkbox of checkboxes) {
    dataJournal.joursSelectionnes.push(checkbox.value)
  }

  console.log(dataJournal)
  return dataJournal
}

function createJournalEntry (duration, task, description, ref, status, tag) {
  return {
    duration: duration, // Durée de l'activité
    task: task, // Nom de la tâche
    description: description, // Description et réflexion
    ref: ref, // Référence ou source
    status: status, // Statut de l'activité
    tag: tag // Tag (optionnel)
  }
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

// Saves journal data locally using localStorage
function saveLocally (journalData) {
  // Implementation
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
    typeProjet === 'tpi' ? 0.75 : dataJournal.config.projectDuration / 8

  // Récupérer les jours sélectionnés depuis les checkbox
  var frequence = dataJournal.joursSelectionnes || []
  var nombreJours = frequence.length

  let parentElement = getParentElement(onglet)
  if (!parentElement) {
    showAlert("L'élément parent pour les séquences n'existe pas.", 'error')
    return
  }

  sequenceDiv = creerDivSequence()

  // Pour chaque jour
  for (let i = 0; i < nombreJours; i++) {
    let jour = frequence[i]
    sequenceDiv.appendChild(creerDivJour(jour, dureeProjet, precision))
  }

  parentElement.prepend(sequenceDiv)
}

// fonctions pour ajouter une nouvelle séquence

function creerDivSequence () {
  // Obtenir la prochaine date de la séquence et vérifier les jours fériés/vacances

  let resultNextDate = getNextDate(dataJournal.firstSeq)
  sequenceNumber++
  sequenceCalDate++

  let sequenceDiv = document.createElement('div')
  sequenceDiv.classList = 'sequence_' + sequenceNumber

  // Créer et ajouter un élément pour afficher les informations de la séquence
  let infoDiv = document.createElement('div')
  infoDiv.innerHTML =
    'Séquence n° ' +
    sequenceNumber +
    '<div> Date : '+
    resultNextDate.date.toLocaleDateString() + '</div>'

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

  divJour.innerHTML = '<h3>' + CJours[jour] + '<h3/>'

  for (let p = 0; p < dureeProjet; p++) {
    divJour.appendChild(creerDivPeriode(p, precision))
  }

  return divJour
}

function creerDivPeriode (periode, precision) {
  let periodesDiv = document.createElement('div')
  periodesDiv.className = 'periode_' + periode

  for (let e = 0; e < precision; e++) {
    periodesDiv.appendChild(creerDivEntree())
  }

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

function getNextDate (firstDate) {
  // Réinitialiser VResult
  VResult.date = null
  VResult.divSpecial = null

  let nextDate = new Date(firstDate)
  nextDate.setDate(nextDate.getDate() + 7 * sequenceCalDate)

  while (isVacances(nextDate) || isJourFerie(nextDate)) {
    if (isVacances(nextDate)) {
      let nomVacances = getVacationName(nextDate) // Trouver le nom des vacances
      let finVacances = trouverFinVacances(nextDate)
      VResult.divSpecial = createDivSpecial('Vacances: ' + nomVacances)
      let nbSemanesVacances = Math.ceil(
        (finVacances - nextDate) / (7 * 24 * 60 * 60 * 1000)
      ) // Calculer le nombre de semaines de vacances
      sequenceCalDate += nbSemanesVacances // Incrémenter sequenceNumber en fonction de la durée des vacances
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

function sauvegarderJournal () {
  // Logique pour sauvegarder le journal
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
