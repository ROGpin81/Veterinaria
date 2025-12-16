const bcrypt = require("bcryptjs");

exports.getHash = async (req, res, next) => {
  try {
    const plainText = req.params.plainText;
    const saltRound = 10;
    const hash = await bcrypt.hash(plainText, saltRound);
    res.send(hash);
  } catch (err) {
    next(err);
  }
};

exports.test = async (req, res) => {
  res.json({ message: "Acceso autorizado", user: req.user });
};
