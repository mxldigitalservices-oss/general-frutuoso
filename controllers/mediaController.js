const Imagen = require('../models/Imagen');

exports.media = async (req, res) => {
  if (!/^[a-f0-9]{24}$/.test(req.params.id)) return res.status(404).end();
  try {
    const img = await Imagen.findById(req.params.id).select('+data mime');
    if (!img) return res.status(404).end();
    res.set({ 'Content-Type': img.mime, 'Cache-Control': 'public, max-age=31536000, immutable' });
    res.send(img.data);
  } catch (e) {
    res.status(503).end();
  }
};
