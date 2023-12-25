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
    parseInt(document.getElementById('precision').value),
    projectType,
    8, // defaultSequences
    baseDuration
  )

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
    journalEntries: [], // Array to store journal entries
    planningEntries: [], // Array to store planning entries
    config: {
      timePrecision: timePrecision, // Time precision (3, 6, 9 lines per hour)
      projectType: projectType, // Project type (short, medium, long, TPI)
      defaultSequences: defaultSequences || 8, // Default number of sequences, default is 8
      baseDuration: baseDuration // Base duration (60 or 45 minutes)
    }
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

function addCustomTask (id, name, category, description) {
  defaultTasks.push({ id, name, category, description })
  updateTaskTable() // Met à jour le tableau affiché
}

function updateTaskTable() {
  var taskTableBody = document.getElementById('taskTable').querySelector('tbody');
  taskTableBody.innerHTML = ''; // Efface le tableau actuel

  defaultTasks.forEach(function(task) {
      var tr = document.createElement('tr');
      tr.innerHTML = `
          <td>${task.name}</td>
          <td class="tooltip" title="${task.description}">${task.category}
              <span class="tooltiptext">${task.description}</span>
          </td>
          <td class="hidden">${task.description}</td>
      `;

      taskTableBody.appendChild(tr);
  });
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
