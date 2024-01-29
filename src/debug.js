// Configurations de dataJournal
// Ce booléen contrôle le chargement du script de débogage
const modeDebug = true;

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
  }
};


function getCharacterNames (configs) {
  return Object.keys(configs)
}

function initDebugMode () {
  creerInterfaceDebug();
  // Toute autre initialisation nécessaire pour le mode débogage
}

// Fonction pour charger une configuration
function chargerConfigurationDebug (configName) {
  console.log('Chargement des dataJournal');
  const config = configurations[configName];
  if (config) {
    console.log('Configuration chargée :', config);
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
    );
  } else {
    console.error('Configuration non trouvée :', configName);
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
  console.log('Mode débug activé');
  initDebugMode();
}
