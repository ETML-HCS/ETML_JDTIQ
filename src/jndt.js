/*
Développement d'une application pour la gestion des temps. Cette application offre les fonctionnalités suivantes :

1. Création de journal avec titre, auteur, responsable.
2. Saisie des activités pour un suivi détaillé.
3. Planification et gestion des tâches.
4. Création de diagrammes de Gantt.
5. Graphiques temporels avec granularité ajustable (3, 6, 12 lignes par heure).
6. Configuration flexible du journal.
7. Gestion de projets de différentes durées (court : 24 périodes, moyen : 32 périodes, long : 40 périodes), 
   ajustable pour jours fériés.
8. Prise en compte des interruptions et vacances.
9. Sauvegarde locale via 'localStorage'.
10. Exportation des données vers une base de données.
*/

// Déclaration globale
let isLocalLoad = false

// sequenceNumber : Ce tableau stocke le nombre de séquences effectives pour deux activités distinctes :
// [0] représente le nombre de séquences de planification réalisées,
// [1] indique le nombre d'entrées enregistrées dans le journal de projet.
let sequenceNumber = [0, 0]
const seqPlanification = 0
const seqJournal = 1

// sequenceCalDate : Ce tableau suit le nombre total de séquences pour les mêmes deux activités,
// mais en incluant les jours non ouvrables comme les vacances et les absences :
// [0] compte les jours de planification, y compris les jours non ouvrables,
// [1] compte les entrées de journal, y compris les jours non ouvrables.
let sequenceCalDate = [0, 0]

// dataJournal est utilisée pour stocker les données du journal en cours.
// Elle est initialisée à 'null' et sera assignée avec les données du journal (titre, auteur, activités, etc.)
// lorsqu'elles seront disponibles.
let dataJournal = null

let defaultTasks = [
  {
    id: 'analyse',
    name: 'Analyse',
    category: 'Initiation',
    description: 'Comprendre les exigences à partir du cahier des charges.'
  },
  {
    id: 'planification',
    name: 'Planification',
    category: 'Planification',
    description: 'Préparer les tâches et ressources nécessaires.'
  },
  {
    id: 'execution',
    name: 'Exécution',
    category: 'Exécution',
    description: 'Réaliser les activités du projet.'
  },
  {
    id: 'suivi',
    name: 'Suivi',
    category: 'Contrôle',
    description: 'Suivre l’avancement et résoudre les problèmes.'
  },
  {
    id: 'qualite',
    name: 'Qualité',
    category: 'Contrôle',
    description: 'Contrôler la qualité des livrables.'
  },
  {
    id: 'rapport',
    name: 'Rapport',
    category: 'Clôture',
    description: 'Documenter les activités et résultats.'
  },
  {
    id: 'retour',
    name: 'Retour',
    category: 'Clôture',
    description: 'Analyser les succès et difficultés.'
  },
  {
    id: 'preparation-tpi',
    name: 'Préparation TPI',
    category: 'Travail avant TPI',
    description: 'Préparer et planifier le travail avant le TPI.'
  },
  {
    id: 'recherche-tpi',
    name: 'Recherche pour TPI',
    category: 'Travail avant TPI',
    description:
      'Recherche de ressources et de connaissances nécessaires pour le TPI.'
  },
  {
    id: 'ferie',
    name: 'Férié/Congé',
    category: 'RH',
    description: 'Gestion des jours fériés.'
  },
  {
    id: 'absence',
    name: 'Absence/Maladie',
    category: 'RH',
    description: 'Gérer les maladies et absences.'
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

  var baseDuration =
    projectType === 'tpi'
      ? (showAlert('Veuillez remplir tous les champs obligatoires.', 'info'),
        60)
      : document.getElementById('typeJournal').value === 'heures'
      ? 60
      : 45

  // Appel à createJournal
  createJournal(
    document.getElementById('titreJournal').value,
    document.getElementById('auteur').value,
    document.getElementById('responsable').value,
    document.getElementById('classe').value,
    document.getElementById('dateDebut').value,
    parseInt(document.getElementById('precision').value),
    projectType,
    8, // defaultSequences,
    baseDuration
  )

  activateTab(onglets.PLANIFICATION)
  dataJournal.journal.id = generateUniqueId(dataJournal.user.pseudo)

  showAlert(
    'Tous les champs obligatoires sont correctement remplis.',
    'success'
  )
  return true
}

function configureDataJournal (d) {
  // Vérification de la validité de l'objet dJournal
  if (!d || !d.journal.config) {
    throw new Error('Objet dJournal invalide')
  }

  // Déstructuration pour une meilleure lisibilité
  const {
    config: { projectType },
    workOfDays
  } = d.journal

  // Durées de projet définies
  const PROJECT_DURATIONS = { court: 24, moyen: 32, long: 40, tpi: 80 }

  // Configuration de la durée du projet
  d.journal.config.projectDuration = PROJECT_DURATIONS[projectType] || 0
  d.journal.config.preparatoryWork = projectType === 'tpi' ? 5 : 0

  // Configuration de workOfDays
  if (projectType === 'tpi') {
    d.journal.workOfDays = [1, 2, 3, 4, 5]
  } else if (!workOfDays || workOfDays.length === 0) {
    let checkboxes = document.querySelectorAll(
      '#frequenceParSemaine input[type=checkbox]:checked'
    )
    d.journal.workOfDays = Array.from(checkboxes, checkbox =>
      parseInt(checkbox.value, 10)
    )
  }

  return d
}

function createJournal (
  title,
  author,
  boss,
  ClassGroup,
  firstDate,
  timePrecision,
  projectType,
  defaultSequences,
  baseDuration,
  id = null,
  jWork = []
) {
  // Assurez-vous que firstSeq est défini comme un tableau vide si non fourni
  let firstSeq = firstDate ? [firstDate] : []

  let data = {
    user: {
      pseudo: author,
      class: ClassGroup,
      boss: boss
    },
    journal: {
      id: id,
      title: title,
      date: firstSeq,
      workOfDays: jWork,
      config: {
        timePrecision: timePrecision,
        projectType: projectType,
        defaultSequences: defaultSequences || 8,
        baseDuration: baseDuration,
        taskList: defaultTasks,
        projectDuration: null
      }
    },
    journalEntries: [],
    planningEntries: []
  }

  dataJournal = configureDataJournal(data)
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
    messageElement.textContent = ''
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

      // Supprimer le préfixe de la clé et l'ajouter comme une propriété data-save-key
      const keyWithoutPrefix = key.substring(journalPrefix.length)
      journalDiv.setAttribute('data-save-key', keyWithoutPrefix)

      // Ajouter un écouteur d'événements pour le clic
      journalDiv.addEventListener('click', () => {
        const saveKey = journalDiv.getAttribute('data-save-key')
        showAlert(`Chargement du journal ${saveKey}`, 'info') // pas de popup, information de debug
        loadJournalByKey(saveKey) // Charger le journal en utilisant la clé de sauvegarde
      })

      // Ajouter l'icône ou l'image du journal
      const journalIcon = document.createElement('img')
      journalIcon.src = 'src/img/Journaux.png'
      journalIcon.alt = 'Icône de journal'
      journalIcon.className = 'journal-icon'

      // Ajouter le titre du journal
      const journalTitle = document.createElement('h3')
      const titleText = journalData.journal.title
        ? journalData.journal.title + ' - ' + journalData.user.boss
        : 'Journal sans titre'
      const dateString = journalData.journal.date[0]
        ? new Date(journalData.journal.date[0]).toLocaleDateString()
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
  if (!dataJournal || !dataJournal.journal.id) {
    showAlert(
      'Données du journal ou identifiant manquant pour la sauvegarde locale.',
      'error'
    )
    return
  }

  try {
    const dataToSave = JSON.stringify(dataJournal)
    const journalKey = `dataJournal_${dataJournal.journal.id}`
    localStorage.setItem(journalKey, dataToSave)
    showAlert(
      `Journal ${dataJournal.journal.id} sauvegardé localement sous la clé ${journalKey}.`,
      'info'
    )
  } catch (error) {
    showAlert(`Erreur lors de la sauvegarde du journal : ${error}`, 'error')
  }
}

function loadJournalByKey (journalId) {
  const journalKey = `dataJournal_${journalId}`
  try {
    const data = localStorage.getItem(journalKey)
    if (data) {
      console.info(`Journal ${journalId} chargé depuis la clé ${journalKey}.`)
      loadJournalDataToDom(JSON.parse(data))
      isLocalLoad = false;  
      return
    } else {
      console.info(`Aucun journal trouvé avec l'identifiant ${journalId}.`)
      
      return null
    }
  } catch (error) {
    console.error(`Erreur lors du chargement du journal: ${error}`)
    return null
  }

}

function loadJournalDataToDom (data) {
  if (!data) {
    showAlert('Données de journal non valides', 'error')
    return
  }

  isLocalLoad = true

  // Fonction pour obtenir le plus grand numéro de séquence
  const getPlusGrandeSequenceNumber = entries =>
    entries.reduce(
      (max, entree) =>
        Math.max(max, parseInt(entree.entryId.split('-')[0], 10)),
      0
    )

  const plusGrandeSequenceNumberP = getPlusGrandeSequenceNumber(
    data.planningEntries
  )
  const plusGrandeSequenceNumberJ = getPlusGrandeSequenceNumber(
    data.journalEntries
  )

  dataJournal = configureDataJournal(data)
  dataJournal.planningEntries = data.planningEntries
  dataJournal.journalEntries = data.journalEntries

  // Fonction pour activer l'onglet et ajouter des séquences
  const processEntries = (entries, onglet, plusGrandeSequenceNumber) => {
    if (entries.length > 0) {
      activateTab(onglet)
      for (let index = 0; index < plusGrandeSequenceNumber; index++) {
        ajouterNouvelleSequence(onglet)
      }
      injectToEntries(entries, onglet)
    }
  }

  /*
    idéalement, le chargement dois se faire depuis les deux objets....
   */

  processEntries(
    dataJournal.planningEntries,
    onglets.PLANIFICATION,
    plusGrandeSequenceNumberP
  )
  processEntries(
    dataJournal.journalEntries,
    onglets.JOURNAL,
    plusGrandeSequenceNumberJ
  )
}

function injectToEntries (entries, onglet) {
  let parent = null

  switch (onglet) {
    case onglets.PLANIFICATION:
      parent = document.getElementById('parentSequencePlannification')
      break
    case onglets.JOURNAL:
      parent = document.getElementById('parentSequenceJournal')
      break
  }

  entries.forEach(entry => {
    // Utiliser un sélecteur d'attributs pour contourner la limitation des ID commençant par un chiffre
    const entryElement = parent.querySelector(`[id="${entry.entryId}"]`)
    if (!entryElement) {
      console.error(
        `Élément non trouvé pour l'entryId ${entry.entryId} dans l'onglet ${onglet}`
      )
      return
    }

    // Mettre à jour les informations de l'entrée
    updateEntryInformation(entryElement, entry)
  })
  // Appeler cette fonction après avoir chargé ou mis à jour les entrées dans le DOM
  updateTotalDurationForEachPeriode()
}

function updateEntryInformation (entryElement, entryData) {
  // Mettre à jour le champ 'duration'
  const durationInput = entryElement.querySelector('.input-duration')
  if (durationInput) durationInput.value = entryData.duration

  // Mettre à jour le champ 'task'
  const taskSelect = entryElement.querySelector('.select-task')
  if (taskSelect) taskSelect.value = entryData.task

  // Mettre à jour le champ 'description'
  const descriptionInput = entryElement.querySelector('.input-description')
  if (descriptionInput) descriptionInput.value = entryData.description

  // Mettre à jour le champ 'reference'
  const referenceInput = entryElement.querySelector('.input-ref')
  if (referenceInput) referenceInput.value = entryData.reference

  // Mettre à jour le champ 'status'
  const statusSelect = entryElement.querySelector('.select-status')
  if (statusSelect) statusSelect.value = entryData.status

  // Mettre à jour le champ 'tag'
  const tagInput = entryElement.querySelector('.input-tag')
  if (tagInput) tagInput.value = entryData.tag
}

function updateTotalDurationForEachPeriode () {
  // Sélectionne toutes les divs avec une classe commençant par 'periode_'
  const periodeDivs = document.querySelectorAll('[class^="periode_"]')
  periodeDivs.forEach(periodeDiv => {
    let totalDuration = 0
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

    // Mettre à jour le total
    const totalDisplay = periodeDiv.querySelector('.totalDuration')
    const maxDurationDisplay = periodeDiv.querySelector('.objectifTime')
    if (totalDisplay && maxDurationDisplay) {
      const maxDuration = parseFloat(maxDurationDisplay.textContent)
      totalDisplay.textContent = totalDuration
      totalDisplay.style.color =
        totalDuration > maxDuration ? 'red' : 'var(--couleur-texte)'
    }
  })
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
      field.max = dataJournal.journal.config.baseDuration
      field.min = 0
    }
  }

  field.name = name
  field.className = className // Appliquer la classe

  return field
}

function ajouterNouvelleSequence (onglet) {
  if (!dataJournal || !dataJournal.journal.config) {
    showAlert("dataJournal n'est pas correctement initialisé.", 'error')
    return
  }

  var typeProjet = dataJournal.journal.config.projectType // 'court', 'moyen', 'long', ou 'tpi'
  var precision = dataJournal.journal.config.timePrecision // 3, 6, ou 9 lignes par heure
  var dureeProjet =
    typeProjet === 'tpi' ? 7 : dataJournal.journal.config.projectDuration / 8

  // Récupérer les jours sélectionnés depuis les checkbox
  var frequence = dataJournal.journal.workOfDays || []
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
    sequenceDiv.appendChild(creerDivJour(jour, dureeProjet, precision, onglet))
  }
  parentElement.prepend(sequenceDiv)
}

function updateTotalDurationForSequence (onglet) {
  const sequenceContainers = document.querySelectorAll(
    '#parentSequencePlannification'
  ) // Remplacez '.sequence-container' par la classe appropriée

  sequenceContainers.forEach(sequenceContainer => {
    let totalDurationForSequence = 0

    const periodeDivs = sequenceContainer.querySelectorAll(
      '[class^="periode_"]'
    )
    periodeDivs.forEach(periodeDiv => {
      const totalDurationDisplay = periodeDiv.querySelector('.totalDuration')
      if (totalDurationDisplay) {
        totalDurationForSequence += parseFloat(totalDurationDisplay.textContent)
      }
    })

    // Mettre à jour le div 'titleSequence' avec le total
    const titleSequenceDiv = sequenceContainer.querySelector('.titleSequence')
    if (titleSequenceDiv) {
      let totalSpan = document.querySelector('.totalSpan')

      if (!totalSpan) {
        totalSpan = document.createElement('span')
        totalSpan.className = 'totalSpan'
        totalSpan.style.textAlign = 'center'
        titleSequenceDiv.appendChild(totalSpan)
      }

      totalSpan.textContent = `Total journal: ${totalDurationForSequence} min`
      totalSpan.style.display = 'block' // Pour centrer le texte
    }
  })
}

function creerDivCheckTimes (periodeDiv, periode) {
  // Crée une nouvelle div pour afficher la durée
  const checkTimesDiv = document.createElement('div')
  checkTimesDiv.className =
    'totalDurationDisplay totalDurationDisplay_' + (periode % 2)

  // Définit le contenu HTML de la div avec le temps maximum
  const maxDuration = dataJournal.journal.config.baseDuration
  checkTimesDiv.innerHTML =
    "Total : <span class='totalDuration'>0</span> / Max : <span class='objectifTime'>" +
    maxDuration +
    '</span>'

  // Met à jour la durée totale en fonction des changements dans periodeDiv
  updateCheckTimesForThisDiv(periodeDiv, checkTimesDiv)

  return checkTimesDiv
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
    const maxDuration = dataJournal.journal.config.baseDuration
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

  // Ajouter une nouvelle date à dataJournal.dateSeq
  dataJournal.journal.date.push(
    getNextDate(dataJournal.journal.date[0], onglet)
  )

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
      dataJournal.journal.date[
        dataJournal.journal.date.length - 1
      ].toLocaleDateString() +
      '</div>'
  } else if (onglets.PLANIFICATION == onglet) {
    sequenceCalDate[1]++
    sequenceNumber[1]++
    sequenceDiv.classList = 'sequence_' + sequenceNumber[1]
    infoDiv.innerHTML =
      'Séquence n° ' +
      sequenceNumber[1] +
      '<div> Date : ' +
      dataJournal.journal.date[
        dataJournal.journal.date.length - 1
      ].toLocaleDateString() +
      '</div>'
  }

  infoDiv.className = 'titleSequence'

  sequenceDiv.appendChild(infoDiv)

  // Ajouter la div spéciale pour les jours fériés ou les vacances
  if (VResult.divSpecial) {
    sequenceDiv.appendChild(VResult.divSpecial)
  }

  return sequenceDiv
}

function creerDivJour (jour, dureeProjet, precision, onglet) {
  let divJour = document.createElement('div')
  divJour.id = 'jour_' + jour
  divJour.className = 'jour'

  // Convertir VResult.date en un objet Date s'il ne l'est pas déjà
  let dateDebut = new Date(VResult.date)

  // Calculer la date pour le jour actuel
  let dateJour = new Date(dateDebut)
  dateJour.setDate(dateDebut.getDate() + jour - 1)

  // Formatage de la date
  let options = { year: 'numeric', month: 'long', day: 'numeric' }
  let dateFormatee = dateJour.toLocaleDateString('fr-FR', options)

  divJour.innerHTML = '<h3>' + CJours[jour] + ' le ' + dateFormatee + '</h3>'

  for (let p = 0; p < dureeProjet; p++) {
    divJour.appendChild(creerDivPeriode(jour, p, precision, onglet))
  }

  return divJour
}

function creerDivPeriode (jour, periode, precision, onglet) {
  let periodesDiv = document.createElement('div')
  periodesDiv.className = 'periode_' + periode

  if (isLocalLoad) {
    // la fonction efface à la mauvaise séquence
    // entryId = séquence-jour-periode-entrée
    const rows = getRowsForThis(jour, periode, onglet)
    for (let e = 0; e < rows; e++) {
      periodesDiv.appendChild(creerDivEntree(jour, periode, e, onglet))
    }
  } else {
    for (let e = 0; e < precision; e++) {
      periodesDiv.appendChild(creerDivEntree(jour, periode, e, onglet))
    }
  }

  periodesDiv.appendChild(creerDivCheckTimes(periodesDiv, periode))
  return periodesDiv
}

function getRowsForThis (jour, periode, onglet) {
  // Créer le motif de recherche sous forme de chaîne de caractères
  let correspondances
  let motifRecherche

  switch (onglet) {
    case onglets.PLANIFICATION:
      motifRecherche = `${sequenceNumber[1]}-${jour}-${periode}-\\d+`

      // Compter le nombre d'éléments correspondant au motif
      correspondances = dataJournal.planningEntries.filter(entry => {
        return entry.entryId.match(new RegExp(motifRecherche, 'g'))
      })
      break

    case onglets.JOURNAL:
      motifRecherche = `${sequenceNumber[0]}-${jour}-${periode}-\\d+`

      // Compter le nombre d'éléments correspondant au motif
      correspondances = dataJournal.journalEntries.filter(entry => {
        return entry.entryId.match(new RegExp(motifRecherche, 'g'))
      })
      break

    default:
      break
  }

  // Le nombre d'éléments correspondant au motif est la longueur du tableau de correspondances
  const compteur = correspondances ? correspondances.length : 0

  console.log('occurrence pour la période', periode, ':', compteur)
  return compteur
}

function creerDivEntree (jours, periode, ligne, onglet) {
  let entreeDiv = document.createElement('div')
  entreeDiv.className = 'entree'
  entreeDiv.id = `${
    sequenceNumber[onglet == onglets.JOURNAL ? 0 : 1]
  }-${jours}-${periode}-${ligne}`

  // Ajout des champs de saisie avec une classe spécifique pour chaque champ
  entreeDiv.appendChild(
    createInputField('number', 'duration', '[min]', null, 'input-duration')
  )

  createInputField()
  entreeDiv.appendChild(
    createInputField(
      'select',
      'task',
      '',
      dataJournal.journal.config.taskList,
      'select-task'
    )
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
  let btnDelete = document.createElement('button')
  btnDelete.innerText = 'X'
  btnDelete.className = 'btnDelete'

  btnDelete.onclick = function (event) {
    const [seq, jour, periode, entree] = getInfoDivEntree(event.target)
    const countEntries = countDivEntree(event.target.parentNode)

    if (countEntries > 1) {
      entreeDiv.remove()
      showAlert(
        `Entrée suivante a été supprimée de ${event.target.parentNode.id}`,
        'success'
      )
    } else {
      showAlert(
        `Vous ne pouvez pas supprimer toutes les entrées de cette période.`,
        'info'
      )
    }
  }

  entreeDiv.appendChild(btnDelete)

  let btnAdd = document.createElement('button')
  btnAdd.innerHTML = '&#9660;' // Utilisez le caractère Unicode de la flèche vers le bas
  btnAdd.className = 'btnAdd'
  btnAdd.onclick = function (event) {
    const parentDiv = event.target.parentNode
    const idSource = parentDiv.id

    const [seq, jour, periode, entree] = getInfoDivEntree(parentDiv)
    const countEntries = countDivEntree(parentDiv)

    if (countEntries < dataJournal.journal.config.timePrecision) {
      const newEntree = creerDivEntree(jour, periode, entree, onglet)
      parentDiv.insertAdjacentElement('afterend', newEntree)
      renameIdDivEntree(parentDiv)
    } else {
      showAlert(
        "Vous avez atteint le nombre maximum d'entrées pour cette période.",
        'info'
      )
    }
  }

  entreeDiv.appendChild(btnAdd)

  return entreeDiv
}

function renameIdDivEntree (parentDiv) {
  // Sélectionnez toutes les divs entree sous le parentDiv
  const divsEntree = parentDiv.parentNode.querySelectorAll('.entree')

  // Parcourez chaque div entree
  divsEntree.forEach((divEntree, index) => {
    // Obtenez les informations actuelles de l'ID de la div entree
    const [seq, jour, periode, entree] = getInfoDivEntree(divEntree)

    // Créez le nouvel ID en ajoutant 1 à l'index (en commençant par 0)
    const newID = `${seq}-${jour}-${periode}-${index}`

    // Mettez à jour l'ID de la div entree
    divEntree.id = newID
  })
}

function getInfoDivEntree (current) {
  const parentID = current.id
  const [seq, jour, periode, entree] = parentID.split('-')
  console.log('Séquence :', seq)
  console.log('Jour :', jour)
  console.log('Période :', periode)
  console.log('Entrée :', entree)

  return [seq, jour, periode, entree]
}

function countDivEntree (parent) {
  const nDivsEntree = parent.parentNode.getElementsByClassName('entree').length
  console.log(nDivsEntree)
  return nDivsEntree
}

function getParentElement (onglet) {
  if (onglet === onglets.JOURNAL) {
    return document.getElementById('parentSequenceJournal')
  } else if (onglet === onglets.PLANIFICATION) {
    return document.getElementById('parentSequencePlannification')
  }
  showAlert('le paramètre onglet contient une valeur incorrecte', 'error')
  return null
}

function getNextDate (firstDate, onglet) {
  // Réinitialiser VResult
  VResult.date = null
  VResult.divSpecial = null
  let nextDate = null

  if (Array.isArray(firstDate)) {
    nextDate = new Date(firstDate[0])
  } else {
    nextDate = new Date(firstDate)
  }

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

  return nextDate
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

  // Appeler cette fonction après avoir chargé ou mis à jour les entrées dans le DOM
  updateTotalDurationForSequence()
}

function saveEntriesForContainer (containerId, targetArray) {
  const container = document.getElementById(containerId)

  if (!container) {
    showAlert(`Le conteneur ${containerId} n'existe pas.`, 'error')
    return
  }

  const entryDivs = container.querySelectorAll('.entree')
  const entries = []

  function validateEntry (entry) {
    return (
      entry.task === 'Absences/Maladie' ||
      entry.description.trim() !== '' ||
      entry.reference.trim() !== ''
    )
  }

  entryDivs.forEach(entryDiv => {
    const entryId = entryDiv.id
    const task = entryDiv.querySelector('.select-task').value
    const duration = entryDiv.querySelector('.input-duration').value
    const description = entryDiv.querySelector('.input-description').value
    const reference = entryDiv.querySelector('.input-ref').value
    const status = entryDiv.querySelector('.select-status').value
    const tag = entryDiv.querySelector('.input-tag').value

    const entry = {
      entryId,
      duration,
      task,
      description,
      reference,
      status,
      tag
    }

    if (validateEntry(entry)) {
      entries.push(entry)
    }
  })

  // Mettre à jour le tableau cible avec les nouvelles entrées
  targetArray.length = 0 // Efface le tableau actuel
  targetArray.push(...entries) // Ajoute les nouvelles entrées
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

function imprimer (elementId, modePaysage = false) {
  const contenuElement = document.getElementById(elementId)
  const tempDiv = document.createElement('div')

  // Créer et ajouter l'en-tête du tableau
  const enTete = `
    <table>
      <tr>
        <th>Durée</th>
        <th>Tâche</th>
        <th>Description</th>
        <th>Source/Référence</th>
        <th>Status</th>
        <th>Tag</th>
      </tr>`

  let tableContent = enTete

  // Parcourir chaque ligne dans le contenu original
  const lignes = contenuElement.querySelectorAll('.entree')
  lignes.forEach(ligne => {
    const inputDescription = ligne.querySelector('input[name="description"]')
    const inputRef = ligne.querySelector('input[name="ref"]')

    // Vérifier si les champs description et ref sont vides
    if (
      (!inputDescription || inputDescription.value.trim() === '') &&
      (!inputRef || inputRef.value.trim() === '')
    ) {
      return // Ignorer cette ligne
    }

    // Début de la ligne du tableau
    let tempLigne = '<tr>'

    // Traiter chaque input et select
    ligne
      .querySelectorAll('input[type="text"], input[type="number"], select')
      .forEach(input => {
        let value =
          input.type === 'select-one'
            ? input.options[input.selectedIndex].text
            : input.value

        // Ajouter "MIN" à la fin si l'input est de type number
        if (input.type === 'number' && value.trim() !== '') {
          value += ' [min]'
        }

        tempLigne += `<td>${value}</td>`
      })

    // Fin de la ligne du tableau
    tempLigne += '</tr>'

    // Ajouter la ligne traitée au contenu du tableau
    tableContent += tempLigne
  })

  // Fermer le tableau
  tableContent += '</table>'

  tempDiv.innerHTML = tableContent

  // Ouvrir une nouvelle fenêtre pour l'impression
  const fenetreImpression = window.open('', '_blank')

  // Styles CSS pour l'impression et la mise en page A4
  const stylesPourImpression = `
  <style>
    @page {
      size: A4 landscape; /* Forcer le mode paysage */
      margin: 0;
    }
    @media print {
      body {
        width: 297mm; /* Largeur de la page A4 en mode paysage */
        height: 210mm; /* Hauteur de la page A4 en mode paysage */
        margin: 0;
        margin-top: 20px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        align-content: space-between;
        font-size: 10pt; /* Ajuster la taille de la police pour économiser de l'espace */
      }
      table {
        width: 96%; /* Ajuster la largeur du tableau */
        margin-left: auto;
        margin-right: auto;
        border-collapse: collapse;
        page-break-inside: auto; /* Permettre au tableau de s'étendre sur plusieurs pages */
      }
      th, td {
        border: 1px solid black;
        padding: 5px;
        text-align: left;
        max-width: 100px; /* Ajuster en fonction de votre contenu */
        word-wrap: break-word; /* Permettre la coupure des mots si nécessaire */
      }
      th {
        background-color: #f2f2f2;
      }
      button, .btnSuppression {
        display: none !important;
      }
    }
  </style>
`

  // Ajouter le contenu modifié, les styles et le script à la fenêtre d'impression
  fenetreImpression.document.write(`
    <html>
      <head>
        <title>Impression</title>
        ${stylesPourImpression}
      </head>
      <body>
        ${tempDiv.innerHTML}
      </body>
    </html>
  `)

  fenetreImpression.document.close()
  fenetreImpression.focus()

  // Lancer l'impression et fermer la fenêtre après un court délai
  fenetreImpression.print()
  setTimeout(() => fenetreImpression.close(), 5000)
}

const baseURL = 'http://localhost:3000'

async function exportToDatabase () {
  if (!dataJournal || !dataJournal.user || !dataJournal.journal) {
    showAlert('DataJournal manquant ou incomplet', 'error')
    return
  }

  // Fonction pour récupérer l'ID de l'utilisateur depuis le serveur
  async function getUserId (pseudo) {
    try {
      const response = await fetch(
        `http://localhost:3000/get-user-id/${pseudo}`
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.id
    } catch (error) {
      showAlert(
        `Erreur lors de la récupération de l'ID de l'utilisateur: ${error}`,
        'error'
      )
      return null
    }
  }

  // Fonction pour envoyer des requêtes POST
  async function postData (table, data) {
    let requestBody = {
      table: table,
      data: data
    }

    try {
      let response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`)
      let result = await response.json()
      console.log('Success:', result)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  async function verifyAndGetUserId (pseudo, role) {
    let userId = await getUserId(pseudo)

    if (userId === null) {
      await postData('utilisateurs', { pseudo, role })
      userId = await getUserId(pseudo) // Récupère le nouvel ID
    }

    return userId
  }

  async function exportEntries (entries, tableName) {
    for (const entry of entries) {
      if (!entry.duration) {
        showAlert(
          `Entrée ignorée en raison de l'absence de durée:${entry}`,
          'error'
        )
        continue
      }

      try {
        await postData(tableName, {
          ...entry,
          journal_id: dataJournal.journal.id
        })
      } catch (error) {
        console.error(
          `Erreur lors de la publication de l'entrée (${tableName}):`,
          error
        )
      }
    }
  }

  const auteurId = await verifyAndGetUserId(dataJournal.user.pseudo, 'auteur')
  const responsableId = await verifyAndGetUserId(
    dataJournal.user.boss,
    'responsable'
  )

  const journalData = {
    id: dataJournal.journal.id,
    titre: dataJournal.journal.title,
    auteur_id: auteurId,
    responsable_id: responsableId
  }

  await postData('journaux', journalData)

  await exportEntries(dataJournal.journalEntries, 'entrees_journal')
  await exportEntries(dataJournal.planningEntries, 'planifications')
}

function showAlert (message, type) {
  var alertPopup = document.getElementById('alertPopup')
  alertPopup.textContent = message
  alertPopup.style.display = 'block'

  // Couleurs pour différents types de messages
  const colors = {
    error: '#f44336', // Rouge pour les erreurs
    success: '#4CAF50', // Vert pour le succès
    info: '#FFA500' // Orange pour l'information
  }

  // Appliquer la couleur correspondante ou une couleur par défaut
  alertPopup.style.backgroundColor = colors[type] || '#DDDDDD' // Gris pour les types non spécifiés

  // Transition douce pour la disparition
  alertPopup.style.transition = 'opacity 0.5s ease-in-out'
  alertPopup.style.opacity = '1'

  // Annuler le timeout précédent si nécessaire
  if (window.alertTimeout) {
    clearTimeout(window.alertTimeout)
  }

  // Faire disparaître le popup après 3 secondes avec transition
  window.alertTimeout = setTimeout(function () {
    alertPopup.style.opacity = '0'
    setTimeout(function () {
      alertPopup.style.display = 'none'
    }, 500) // Attendre la fin de la transition pour cacher l'élément
  }, 3000)
}
