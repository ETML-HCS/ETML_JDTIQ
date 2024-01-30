// Configurations de dataJournal
// Ce booléen contrôle le chargement du script de débogage
const modeDebug = true

// Configurations de journal
const configurations = {
  homerSimpson: {
    user: {
      pseudo: 'HomerSimpson',
      class: 'TestClass',
      boss: 'Mr. Burns'
    },
    journal: {
      id: '111111_HomerSimpson',
      title: 'Journal de Homer',
      author: 'Homer Simpson',
      responsible: 'Marge Simpson',
      date: ['2024-01-29'],
      workOfDays: [1],
      journalEntries: [],
      planningEntries: [],
      config: {
        timePrecision: 6,
        projectType: 'moyen',
        defaultSequences: 8,
        baseDuration: 60,
        taskList: [],
        projectDuration: 32,
        preparatoryWork: 0,
        journalEntries: [],
        planningEntries: []
      }
    }
  },
  margeSimpson: {
    user: {
      pseudo: 'MargeSimpson',
      class: 'TestClass',
      boss: 'Homer Simpson'
    },
    journal: {
      id: '222222_MargeSimpson',
      title: 'Journal de Marge',
      author: 'Marge Simpson',
      responsible: 'Bart Simpson',
      date: ['2024-02-15'],
      workOfDays: [2],
      journalEntries: [],
      planningEntries: [],
      config: {
        timePrecision: 7,
        projectType: 'court',
        defaultSequences: 6,
        baseDuration: 45,
        taskList: [],
        projectDuration: 28,
        preparatoryWork: 1,
        journalEntries: [],
        planningEntries: []
      }
    }
  },
  bartSimpson: {
    user: {
      pseudo: 'BartSimpson',
      class: 'TestClass',
      boss: 'Marge Simpson'
    },
    journal: {
      id: '333333_BartSimpson',
      title: 'Journal de Bart',
      author: 'Bart Simpson',
      responsible: 'Lisa Simpson',
      date: ['2024-03-10'],
      workOfDays: [3],
      journalEntries: [],
      planningEntries: [],
      config: {
        timePrecision: 8,
        projectType: 'tpi',
        defaultSequences: 10,
        baseDuration: 55,
        taskList: [],
        projectDuration: 35,
        preparatoryWork: 2,
        journalEntries: [],
        planningEntries: []
      }
    }
  },
  withData: {
    user: {
      pseudo: 'Daniel',
      class: 'CIN1b',
      boss: 'HCS'
    },
    journal: {
      id: '936864_Daniel',
      title: 'hardware',
      date: [
        '2024-01-29',
        '2024-01-29',
        '2024-02-05'
      ],
      workOfDays: [1, 4],
      config: {
        timePrecision: 3,
        projectType: 'long',
        defaultSequences: 8,
        baseDuration: 45,
        taskList: [
          {
            id: 'analyse',
            name: 'Analyse',
            category: 'Initiation',
            description:
              'Comprendre les exigences à partir du cahier des charges.'
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
        ],
        projectDuration: 40,
        preparatoryWork: 0
      }
    },
    journalEntries: [],
    planningEntries: [
      {
        entryId: '1-1-0-1',
        duration: '45',
        task: 'Exécution',
        description: 'Test de la solution ',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-1-1-0',
        duration: '35',
        task: 'Analyse',
        description: 'lecture du cahier des charges ',
        reference: '',
        status: 'Terminé',
        tag: ''
      },
      {
        entryId: '1-1-1-2',
        duration: '10',
        task: 'Analyse',
        description: 'Recherche du périmètre ',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-1-2-0',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-1-2-1',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-1-2-2',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-1-3-0',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-1-3-1',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-1-3-2',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-1-4-0',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-1-4-1',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-1-4-2',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-4-0-0',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-4-0-1',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-4-0-2',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-4-1-0',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-4-1-1',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-4-1-2',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-4-2-0',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-4-2-1',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-4-2-2',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-4-3-0',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-4-3-1',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-4-3-2',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-4-4-0',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-4-4-1',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      },
      {
        entryId: '1-4-4-2',
        duration: '',
        task: 'Analyse',
        description: '',
        reference: '',
        status: 'En cours',
        tag: ''
      }
    ]
  }
}

function getCharacterNames (configs) {
  return Object.keys(configs)
}

function initDebugMode () {
  creerInterfaceDebug()
  // Toute autre initialisation nécessaire pour le mode débogage
}

// Fonction pour charger une configuration
function chargerConfigurationDebug (configName) {
  console.log('Chargement des dataJournal')
  const config = configurations[configName]
  if (config) {
    console.log('Configuration chargée :', config)
    createJournal(
      config.journal.title,
      config.user.pseudo,
      config.user.boss,
      config.user.class,
      config.journal.date,
      config.journal.config.timePrecision,
      config.journal.config.projectType,
      config.journal.config.defaultSequences,
      config.journal.config.baseDuration,
      config.journal.id,
      config.journal.workOfDays
    )
  } else {
    console.error('Configuration non trouvée :', configName)
  }
}

function creerInterfaceDebug () {
  // Créer le sélecteur
  const select = document.createElement('select')
  select.id = 'testConfigSelector'

  const nameConfig = getCharacterNames(configurations)

  // Créez un tableau d'options à partir des noms de configurations
  const options = nameConfig.map(element => ({
    value: element,
    text: configurations[element].journal.config.projectType
  }))

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

// Appelez initDebugMode après la définition de configurations
if (modeDebug) {
  console.log('Mode débug activé')
  initDebugMode()
}
