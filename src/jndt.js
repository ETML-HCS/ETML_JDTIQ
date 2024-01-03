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
// sequenceNumber : Ce tableau stocke le nombre de séquences effectives pour deux activités distinctes :
// [0] représente le nombre de séquences de planification réalisées,
// [1] indique le nombre d'entrées enregistrées dans le journal de projet.
let sequenceNumber = [0, 0]

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
        loadJournalByKey(saveKey) // Charger le journal en utilisant la clé de sauvegarde
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
  if (!dataJournal || !dataJournal.journal.id) {
    console.warn(
      'Données du journal ou identifiant manquant pour la sauvegarde locale.'
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
    console.error('Erreur lors de la sauvegarde du journal : ', error)
  }
}

function loadJournalByKey (journalId) {
  const journalKey = `dataJournal_${journalId}`
  try {
    const data = localStorage.getItem(journalKey)
    if (data) {
      console.log(`Journal ${journalId} chargé depuis la clé ${journalKey}.`)
      loadJournalDataToDom(JSON.parse(data))
      return
    } else {
      console.warn(`Aucun journal trouvé avec l'identifiant ${journalId}.`)
      return null
    }
  } catch (error) {
    console.error('Erreur lors du chargement du journal : ', error)
    return null
  }
}

function loadJournalDataToDom (data) {
  if (!data) {
    console.error('Données de journal non valides')
    return
  }

  // Fonction pour obtenir le plus grand numéro de séquence
  const getPlusGrandeSequenceNumber = entries =>
    entries.reduce(
      (max, entree) =>
        Math.max(max, parseInt(entree.entreeId.split('-')[0], 10)),
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
    const entryElement = parent.querySelector(`[id="${entry.entreeId}"]`)
    if (!entryElement) {
      console.error(
        `Élément non trouvé pour l'entreeId ${entry.entreeId} dans l'onglet ${onglet}`
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

  // // Ajouter un bouton pour ajouter une nouvelle entrée à la fin de la séquence
  // let btnAjouterEntree = document.createElement('button');
  // btnAjouterEntree.innerText = 'Ajouter une nouvelle entrée';
  // btnAjouterEntree.onclick = function() {
  //   sequenceDiv.appendChild(creerDivEntree());
  // };
  // sequenceDiv.appendChild(btnAjouterEntree);

  parentElement.prepend(sequenceDiv)
}

function updateTotalDurationForSequence (onglet) {
  // Supposons que toutes les périodes d'une séquence soient contenues dans un conteneur de séquence
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
      // Création d'un élément span pour afficher le total
      const totalSpan = document.createElement('span')
      totalSpan.textContent = `Total journal: ${totalDurationForSequence} min`
      totalSpan.style.display = 'block' // Pour centrer le texte
      totalSpan.style.textAlign = 'center'

      // Insérer le total dans la div 'titleSequence'
      titleSequenceDiv.appendChild(totalSpan)
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

  for (let e = 0; e < precision; e++) {
    periodesDiv.appendChild(creerDivEntree(jour, periode, e, onglet))
  }

  periodesDiv.appendChild(creerDivCheckTimes(periodesDiv, periode))

  return periodesDiv
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

  const entreeDivs = container.querySelectorAll('.entree')
  const entries = []

  entreeDivs.forEach(div => {
    const entreeId = div.id // Utilisation de l'ID de la div d'entrée
    const task = div.querySelector('.select-task').value
    const duration = div.querySelector('.input-duration').value
    const description = div.querySelector('.input-description').value
    const reference = div.querySelector('.input-ref').value
    const status = div.querySelector('.select-status').value
    const tag = div.querySelector('.input-tag').value

    // Ajouter l'entrée si la tâche n'est pas "Absences/Maladie" ou si les champs description et reference sont remplis
    if (
      task !== 'Absences/Maladie' ||
      description.trim() !== '' ||
      reference.trim() !== ''
    ) {
      entries.push({
        entreeId,
        duration,
        task,
        description,
        reference,
        status,
        tag
      })
    }
  })

  // Copie les entrées dans le tableau cible
  targetArray.push(...entries)
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

function imprimer () {
  // Logique pour imprimer le journal
}

// donnée de connexion en clair (à supprimer pour la version def)
const dbConnectionInfo = {
  host: 'mariadb', // Nom du service MariaDB dans docker-compose.yml
  user: 'root', // Nom d'utilisateur pour la base de données
  password: 'exemple', // Mot de passe pour l'utilisateur
  database: 'JournalDB', // Nom de la base de données à utiliser
  port: 3306 // Port par défaut pour MariaDB
}

async function exportToDatabase () {
  const url = 'http://localhost:3000/insert'

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
      console.error(
        "Erreur lors de la récupération de l'ID de l'utilisateur:",
        error
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

  // Fonction pour vérifier l'existence d'un utilisateur et récupérer son ID
  async function verifyAndGetUserId (pseudo, role) {
    let userId = await getUserId(pseudo)

    if (userId === null) {
      // L'utilisateur n'existe pas, donc on l'ajoute
      await postData('utilisateurs', { pseudo: pseudo, role: role })
      userId = await getUserId(pseudo) // Récupère le nouvel ID
    }
    return userId
  }

  // Validation des données de base
  if (!dataJournal || !dataJournal.user || !dataJournal.journal) {
    console.error('DataJournal manquant ou incomplet')
    return
  }

  // Récupération des IDs
  let auteurId = await verifyAndGetUserId(dataJournal.user.pseudo, 'auteur')

  let responsableId = await verifyAndGetUserId(dataJournal.user.boss,'responsable')

  // Données du journal avec les IDs récupérés
  let journalData = {
    id: dataJournal.journal.id,
    titre: dataJournal.journal.title,
    auteur_id: auteurId,
    responsable_id: responsableId
  }

  await postData('journaux', journalData)

  // Exportation des entrées de journal et de planification
  for (const entry of dataJournal.journalEntries) {
    await postData('entrees_journal', {
      ...entry,
      journal_id: dataJournal.journal.id
    })
  }

  // Exportation des entrées de planification, en ignorant celles sans durée
  for (const plan of dataJournal.planningEntries) {
    if (plan.duration === '' || plan.duration == null) {
      console.log(
        "Entrée de planification ignorée en raison de l'absence de durée:",
        plan
      )
      continue // Ignore l'entrée actuelle et passe à la suivante
    }

    try {
      await postData('planifications', {
        ...plan,
        journal_id: dataJournal.journal.id
      })
    } catch (error) {
      console.error(
        "Erreur lors de la publication de l'entrée de planification:",
        error
      )
    }
  }
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
