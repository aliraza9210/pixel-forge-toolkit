'use strict';

const { sendSuccess } = require('../utils/response');
const TOOLS_REGISTRY = require('../data/toolsRegistry');

function getAllTools(req, res) {
  const { category, status, q } = req.query;

  let tools = [...TOOLS_REGISTRY];

  if (category) {
    tools = tools.filter((t) => t.category.toLowerCase() === category.toLowerCase());
  }
  if (status) {
    tools = tools.filter((t) => t.implementationStatus === status);
  }
  if (q) {
    const query = q.toLowerCase();
    tools = tools.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    );
  }

  return sendSuccess(res, {
    tools,
    total: tools.length,
  });
}

function getToolById(req, res) {
  const tool = TOOLS_REGISTRY.find((t) => t.id === req.params.id);
  if (!tool) {
    return res.status(404).json({ success: false, message: 'Tool not found' });
  }
  return sendSuccess(res, { tool });
}

function getCategories(req, res) {
  const categories = [...new Set(TOOLS_REGISTRY.map((t) => t.category))];
  const counts = categories.reduce((acc, cat) => {
    acc[cat] = TOOLS_REGISTRY.filter((t) => t.category === cat).length;
    return acc;
  }, {});
  return sendSuccess(res, { categories, counts });
}

module.exports = { getAllTools, getToolById, getCategories };
