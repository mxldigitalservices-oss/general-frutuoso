const slugify = require('../utils/slug');

// Genera un slug único a partir del título la primera vez que se guarda.
module.exports = function slugPlugin(schema) {
  schema.add({ slug: { type: String, unique: true, index: true } });
  schema.pre('validate', async function () {
    if (this.slug) return;
    const base = slugify(this.titulo) || 'item';
    let candidato = base;
    let i = 2;
    while (await this.constructor.exists({ slug: candidato, _id: { $ne: this._id } })) candidato = `${base}-${i++}`;
    this.slug = candidato;
  });
};
