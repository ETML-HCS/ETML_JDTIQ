// Configurations de dataJournal
const modeDebug = true // Ce booléen contrôle le chargement du script de débogage

if (modeDebug) {
  console.log('Mode débug activé')
  initDebugMode()
}

function initDebugMode () {
  creerInterfaceDebug()
  // Toute autre initialisation nécessaire pour le mode débogage
}

// Configurations de journal
const configurations = {
  journalStandard: {
    // 1. **Mock-up pour un Journal Standard**
    title: 'Journal de Projet',
    author: 'Jean Dupont',
    responsible: 'Marie Curie',
    firstSeq: "2023-12-28", // Date actuelle
    journalEntries: [],
    planningEntries: [],
    joursSelectionnes: [1],
    config: {
      timePrecision: 6,
      projectType: 'moyen',
      defaultSequences: 8,
      baseDuration: 60
    },
    taskList: [] // Liste des tâches par défaut
  },
  journalProjetCourt: {
    // 2. **Mock-up pour un Journal de Projet Court avec Durée de Base Modifiée**
    title: 'Planification Rapide',
    author: 'Paul Martin',
    responsible: 'Lucas Renaud',
    firstSeq: "2023-01-01", // Date spécifique
    journalEntries: [],
    planningEntries: [],
    joursSelectionnes: [1, 4],
    config: {
      timePrecision: 9,
      projectType: 'court',
      // defaultSequences non spécifié, donc prendra la valeur par défaut
      baseDuration: 45
    },
    taskList: []
  },
  journalTPI: {
    // 3. **Mock-up pour un Journal de Type TPI avec Précision Temporelle Élevée**
    title: 'TPI Analyse et Développement',
    author: 'Sophie Leroy',
    responsible: 'Alex Durand',
    firstSeq: "2023-06-01",
    journalEntries: [],
    planningEntries: [],
    joursSelectionnes: [4],
    config: {
      timePrecision: 12, // Précision temporelle élevée
      projectType: 'tpi',
      defaultSequences: 10, // Nombre de séquences personnalisé
      baseDuration: 60
    },
    taskList: []
  }
}

// Fonction pour charger une configuration
function chargerConfigurationDebug (configName) {
  console.log('Chargement des dataJournal')
  const config = configurations[configName]
  if (config) {
    dataJournal = config
    console.log('Configuration chargée :', dataJournal)
    createJournal(
      dataJournal.title,
      dataJournal.author,
      dataJournal.responsible,
      dataJournal.firstSeq  ,
      dataJournal.config.timePrecision,
      dataJournal.config.projectType,
      dataJournal.config.defaultSequences,
      dataJournal.config.baseDuration, 
      dataJournal.joursSelectionnes
    );
  } else {
    console.error('Configuration non trouvée :', configName)
  }
}

function creerInterfaceDebug () {
  // Créer le sélecteur
  const select = document.createElement('select')
  select.id = 'testConfigSelector'
  const options = [
    { value: 'journalStandard', text: 'Journal Standard' },
    { value: 'journalProjetCourt', text: 'Projet Court' },
    { value: 'journalTPI', text: 'TPI' }
  ]
  options.forEach(opt => {
    const option = document.createElement('option')
    option.value = opt.value
    option.textContent = opt.text
    select.appendChild(option)
  })

  // Créer le bouton
  const button = document.createElement('button')
  button.id = 'loadTestConfigButton'
  button.textContent = 'Charger Configuration de Test'
  button.addEventListener('click', () => {
    const selectedConfig = document.getElementById('testConfigSelector').value
    chargerConfigurationDebug(selectedConfig)
  })

  // Ajouter le sélecteur et le bouton au document
  document.body.prepend(select)
  document.body.prepend(button)
}

// // Dans debug.js
// window.initDebugMode = function() {
//   // ... implémentation de la fonction ...
// };
