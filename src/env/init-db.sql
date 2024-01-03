-- Créer la base de données
CREATE DATABASE IF NOT EXISTS JournalDB;
USE JournalDB;

-- Créer la table utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pseudo VARCHAR(255) NOT NULL,
  role VARCHAR(255)
);

-- Créer la table journaux
CREATE TABLE IF NOT EXISTS journaux (
  id VARCHAR(255) PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  auteur_id INT,
  responsable_id INT,
  FOREIGN KEY (auteur_id) REFERENCES utilisateurs(id),
  FOREIGN KEY (responsable_id) REFERENCES utilisateurs(id)
);

-- Créer la table entrées_journal
CREATE TABLE IF NOT EXISTS entrees_journal (
  entreeId VARCHAR(255) PRIMARY KEY ,
  journal_id VARCHAR(255),
  date_planification DATE NOT NULL,
  duration INT,
  task VARCHAR(255),
  description TEXT,
  reference VARCHAR(255),
  status VARCHAR(255),
  tag VARCHAR(255),
  FOREIGN KEY (journal_id) REFERENCES journaux(id)
);

-- Créer ou Recréer la table planifications
CREATE TABLE IF NOT EXISTS planifications (
  entreeId VARCHAR(255) PRIMARY KEY,
  journal_id VARCHAR(255),
  date_planification DATE,
  duration INT,
  task VARCHAR(255),
  description TEXT,
  reference VARCHAR(255),
  status VARCHAR(255),
  tag VARCHAR(255),
  FOREIGN KEY (journal_id) REFERENCES journaux(id)
);
