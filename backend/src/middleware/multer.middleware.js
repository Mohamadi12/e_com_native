import multer from "multer";
import path from "path";


// Définir comment et sous quel nom les fichiers seront enregistrés
const storage = multer.diskStorage({
  // Fonction qui génère le nom du fichier
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = [".jpeg", ".jpg", ".png", ".webp"].includes(ext) ? ext : "";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${safeExt}`);
  },
});

// Fonction pour vérifier le type de fichier envoyé
const fileFilter = (req, file, cb) => {
  // Types d’images autorisés
  const allowedTypes = /jpeg|jpg|png|webp/;
  // Vérifier l’extension du fichier
  const extname = allowedTypes.test(path.extname(file.originalname).toLocaleLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extname && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg,jpg,png,webp)"));
  }
};

export const upload = multer({
  storage, // Utiliser notre configuration de stockage
  fileFilter,  // Utiliser notre filtre de fichiers
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});