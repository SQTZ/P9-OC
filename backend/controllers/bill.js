const { Bill } = require('../models');

/**
 * Génère l'URL complète d'un fichier à partir de son chemin
 * @param {string} filePath - Chemin du fichier
 * @returns {string|null} - URL complète ou null si le chemin est invalide
 */
const getFileURL = (filePath) => {
  if (!filePath || filePath === 'null') return null;
  if (filePath.startsWith('http')) return filePath;
  return `http://localhost:5678/${filePath}`;
};

/**
 * Vérifie si le type MIME correspond à une image
 * @param {string} mimeType - Type MIME du fichier
 * @returns {boolean} - true si c'est une image, false sinon
 */
const isPicture = (mimeType) => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(mimeType);

/**
 * Crée une nouvelle note de frais
 */
const create = async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).send({ message: 'user must be authenticated' });
  try {
    const {
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      amount,
      fileUrl,
      fileName,
    } = req.body;
    const { file } = req;

    // Préparation des données de base de la note de frais
    const billData = {
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      amount,
    };
    // Cas 1: Traitement avec un fichier joint
    if (file) {
      billData.fileName = isPicture(file.mimetype) ? file.originalname : 'null';
      billData.filePath = isPicture(file.mimetype) ? file.path : 'null';
      const bill = await Bill.create(billData);
      return res.status(201).json({
        fileUrl: getFileURL(billData.filePath),
        key: bill.key,
      });
    }
    // Cas 2: Traitement avec une URL de fichier existante
    if (fileName && fileUrl) {
      billData.fileName = fileName;
      billData.filePath = fileUrl;
      const bill = await Bill.create(billData);
      return res.status(201).json(bill);
    }
    // Cas 3: Création sans fichier
    const bill = await Bill.create(billData);
    return res.status(201).json(bill);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

/**
 * Récupère une note de frais par son ID
 */
const get = async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).send({ message: 'user must be authenticated' });
  try {
    const bill = user.type === 'Admin'
      ? await Bill.findOne({ where: { key: req.params.id } })
      : await Bill.findOne({
        where: { key: req.params.id, email: user.email },
      });
    if (!bill) return res.status(401).send({ message: 'unauthorized action' });
    const {
      key: id,
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      fileName,
      amount,
      filePath,
    } = bill;
    return res.json({
      id,
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      fileName,
      fileUrl: getFileURL(filePath),
      amount,
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

/**
 * Liste toutes les notes de frais de l'utilisateur
 */
const list = async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).send({ message: 'user must be authenticated' });
  try {
    const bills = user.type === 'Admin'
      ? await Bill.findAll()
      : await Bill.findAll({ where: { email: user.email } });
    return res.json(
      bills.map(
        ({
          key: id,
          name,
          type,
          email,
          date,
          vat,
          pct,
          commentary,
          status,
          commentAdmin,
          fileName,
          amount,
          filePath,
        }) => ({
          id,
          name,
          type,
          email,
          date,
          vat,
          pct,
          commentary,
          status,
          commentAdmin,
          fileName,
          amount,
          fileUrl: getFileURL(filePath),
        }),
      ),
    );
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

/**
 * Met à jour une note de frais existante
 */
const update = async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).send({ message: 'user must be authenticated' });
  try {
    const {
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      amount,
    } = req.body;
    const toUpdate = {
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      amount,
    };
    const bill = user.type === 'Admin'
      ? await Bill.findOne({ where: { key: req.params.id } })
      : await Bill.findOne({
        where: { key: req.params.id, email: user.email },
      });
    if (!bill) return res.status(401).send({ message: 'unauthorized action' });
    const updated = await bill.update(toUpdate);
    return res.json(updated);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

/**
 * Supprime une note de frais
 */
const remove = async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).send({ message: 'user must be authenticated' });
  try {
    const bill = user.type === 'Admin'
      ? await Bill.findOne({ where: { key: req.params.id } })
      : await Bill.findOne({
        where: { key: req.params.id, email: user.email },
      });
    if (!bill) return res.status(401).send({ message: 'unauthorized action' });
    await Bill.destroy({ where: { id: bill.id } });
    return res.send('Bill removed');
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

module.exports = {
  list,
  get,
  create,
  update,
  remove,
};
