const validator = (schema) => {
  return (req, res, next) => {
    const isValidPayload = schema(req.body);
    if (isValidPayload === true) {
      next();
    } else {
      return res.status(400).json({ error: isValidPayload[0].message });
    }
  };
};

module.exports = validator;
