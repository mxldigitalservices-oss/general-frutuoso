const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
exports.escapeHtml = (s = '') => String(s).replace(/[&<>"']/g, (c) => MAP[c]);
