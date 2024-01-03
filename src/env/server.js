const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mysql = require('mysql')

const app = express()
app.use(bodyParser.json())
app.use(cors())

const db = mysql.createConnection({
  host: 'db',
  user: 'root',
  password: 'exemple',
  database: 'JournalDB'
})

db.connect(err => {
  if (err) throw err
  console.log('Connecté à la base de données')
})

// Fonction pour insérer des données dans une table spécifiée
function insererDonnees (table, data) {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO ${table} SET ?`
    db.query(query, data, (err, result) => {
      if (err) reject(err)
      resolve(result)
    })
  })
}

// Route générique pour insérer dans n'importe quelle table de la base de données.
// Cette route accepte une requête POST avec un objet JSON contenant deux clés :
// __'table'___ qui spécifie le nom de la table cible, et __'data'___ qui contient les données à insérer.
// Une validation est effectuée pour s'assurer que le nom de la table est valide et que les données ne sont pas vides.
app.post('/insert', async (req, res) => {
  const table = req.body.table
  const data = req.body.data

  // Liste des tables valides pour prévenir les injections SQL
  const validTables = [
    'utilisateurs',
    'journaux',
    'entrees_journal',
    'planifications'
  ]

  // Vérifier si le nom de la table est valide et que les données ne sont pas vides
  if (!validTables.includes(table) || !data || Object.keys(data).length === 0) {
    return res
      .status(400)
      .json({ message: 'Nom de table invalide ou données manquantes' })
  }

  try {
    await insererDonnees(table, data)
    res.json({ message: `Données insérées avec succès dans la table ${table}` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Erreur lors de l'insertion des données" })
  }
})

// Fonction pour récupérer l'ID d'un utilisateur basé sur son pseudo
function getUserId (pseudo) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id FROM utilisateurs WHERE pseudo = ?'
    db.query(query, [pseudo], (err, results) => {
      if (err) {
        reject(err)
      } else if (results.length > 0) {
        resolve(results[0].id)
      } else {
        resolve(null)
      }
    })
  })
}

// Route pour récupérer l'ID d'un utilisateur
app.get('/get-user-id/:pseudo', async (req, res) => {
  try {
    const userId = await getUserId(req.params.pseudo)
    if (userId !== null) {
      res.json({ id: userId })
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000')
})
