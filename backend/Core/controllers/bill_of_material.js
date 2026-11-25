'use strict';

import { ValidationError } from '../functions/bill_of_material.js';
import * as formulaFunctions from '../functions/bill_of_material.js';

function sendError(res, error) {
  if (error instanceof ValidationError) {
    return res.json({
      statusCode: 0,
      message: error.message
    });
  }

  console.error('Unexpected error:', error);

  return res.json({
    statusCode: 0,
    message: 'Internal server error'
  });
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

async function createFormula(req, res) {
  try {
    const body = req.body || {};
    if (!isNonEmptyString(body.company_id)) throw new Error('Company ID is required');
    if (!isNonEmptyString(body.site)) throw new Error('Site is required');
    if (!isNonEmptyString(body.description)) throw new Error('Description is required');

    const formula = await formulaFunctions.createFormula(body);
    res.json({
      statusCode: 1,
      formula_number: formula.formula_number,
      message: `Formula ${formula.formula_number} created!`,
    });
  } catch (error) {
    sendError(res, error);
  }
}

async function getFormulaList(req, res) {
  try {
    const body = req.body || {};
    const condition = body.condition || {};
    if (!isNonEmptyString(condition.company_id)) throw new Error('Company ID is required');
    if (!isNonEmptyString(condition.site)) throw new Error('Site is required');

    const skip = body.skip === undefined ? 0 : Number(body.skip);
    const limit = body.limit === undefined ? 10 : Number(body.limit);
    if (!Number.isInteger(skip) || skip < 0) throw new Error('Skip must be a non-negative integer');
    if (!Number.isInteger(limit) || limit < 1) throw new Error('Limit must be a positive integer');

    const result = await formulaFunctions.getFormulaList({
      condition,
      skip,
      limit: Math.min(limit, 100),
    });
    res.json({ statusCode: 1, message: 'Formula list loaded', ...result });
  } catch (error) {
    sendError(res, error);
  }
}

async function getFormulaDetail(req, res) {
  try {
    const body = req.body || {};
    if (!isNonEmptyString(body.company_id)) throw new Error('Company ID is required');
    if (!isNonEmptyString(body.site)) throw new Error('Site is required');
    if (!isNonEmptyString(body.formula_number)) throw new Error('Formula number is required');

    const formula = await formulaFunctions.getFormulaDetail(body);
    if (!formula) throw new Error('Formula not found');
    res.json({ statusCode: 1, message: 'Formula detail loaded', data: formula });
  } catch (error) {
    sendError(res, error);
  }
}

async function updateFormula(req, res) {
  try {
    const body = req.body || {};
    const condition = body.condition || {};
    const update = body.update || {};
    if (!isNonEmptyString(condition.company_id)) throw new Error('Company ID is required');
    if (!isNonEmptyString(condition.site)) throw new Error('Site is required');
    if (!isNonEmptyString(condition.formula_number)) throw new Error('Formula number is required');
    if (!update || typeof update !== 'object' || Array.isArray(update)) throw new Error('Update must be an object');

    const formula = await formulaFunctions.updateFormula({ condition, update });
    if (!formula) throw new Error('Formula not found');
    const action = update.status === 0 ? 'deleted' : 'updated';
    res.json({
      statusCode: 1,
      formula_number: formula.formula_number,
      message: `Formula ${formula.formula_number} ${action}!`,
    });
  } catch (error) {
    sendError(res, error);
  }
}

export {
  createFormula,
  getFormulaList,
  getFormulaDetail,
  updateFormula
};
