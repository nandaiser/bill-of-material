'use strict';

import mongoose from 'mongoose';
import Formula from '../models/formula.js';

const ALLOWED_UPDATE_FIELDS = new Set([
  'description',
  'remark',
  'pic',
  'products',
  'materials',
  'status',
]);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

//custom error (added for duplicate)
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function validateRows(rows, fieldName) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`${fieldName} must contain at least one row`);
  }

  const seenSkus = new Set();

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];

    if (!row || !String(row.sku || '').trim()) {
      throw new Error(`${fieldName}[${index + 1}]: SKU is required`);
    }

    const normalizedSku = String(row.sku).trim().toUpperCase();

    if (seenSkus.has(normalizedSku)) {
      throw new ValidationError(
        `${fieldName}[${index + 1}]: duplicate SKU "${normalizedSku}"`
      );
    }

    seenSkus.add(normalizedSku);

    if (!String(row.description || '').trim()) {
      throw new Error(`${fieldName}[${index + 1}]: description is required`);
    }

    if (!String(row.uom || '').trim()) {
      throw new Error(`${fieldName}[${index + 1}]: UOM is required`);
    }

    if (!Number.isFinite(Number(row.qty)) || Number(row.qty) <= 0) {
      throw new Error(`${fieldName}[${index + 1}]: quantity must be greater than 0`);
    }
  }
}

function buildCondition(condition) {
  return {
    company_id: condition.company_id,
    site: condition.site,
    formula_number: condition.formula_number,
  };
}

async function generateFormulaNumber({ company_id, site }) {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const counterId = `${company_id}:${site}:${yearMonth}`;
  const counters = mongoose.connection.collection('formula_counters');

  const counter = await counters.findOneAndUpdate(
    { _id: counterId },
    { $inc: { sequence: 1 } },
    { upsert: true, returnDocument: 'after' }
  );

  return `FRM-${yearMonth}-${String(counter.sequence).padStart(4, '0')}`;
}

async function createFormula(data) {
  if (!String(data.description || '').trim()) throw new Error('Description is required');
  validateRows(data.products, 'Products');
  validateRows(data.materials, 'Materials');

  const formula_number = await generateFormulaNumber(data);
  const formula = new Formula({
    company_id: data.company_id,
    site: data.site,
    formula_number,
    formula_type: 0,
    description: String(data.description).trim(),
    remark: data.remark || '',
    pic: data.pic || '',
    status: 1,
    created_time: new Date(),
    products: data.products,
    materials: data.materials,
  });

  await formula.save();
  return formula;
}

async function getFormulaList({ condition, skip = 0, limit = 10 }) {
  const filter = {
    company_id: condition.company_id,
    site: condition.site,
    status: 1,
  };

  if (condition.formula_number) {
    filter.formula_number = { $regex: escapeRegex(String(condition.formula_number)), $options: 'i' };
  }
  if (condition.description) {
    filter.description = { $regex: escapeRegex(String(condition.description)), $options: 'i' };
  }

  const [data, total] = await Promise.all([
    Formula.find(filter).sort({ created_time: -1, _id: -1 }).skip(skip).limit(limit).lean(),
    Formula.countDocuments(filter),
  ]);

  return { data, total };
}

async function getFormulaDetail({ company_id, site, formula_number }) {
  return Formula.findOne({ company_id, site, formula_number, status: 1 }).lean();
}

async function updateFormula({ condition, update }) {
  const invalidFields = Object.keys(update).filter((key) => !ALLOWED_UPDATE_FIELDS.has(key));
  if (invalidFields.length) {
    throw new Error(`Fields cannot be updated: ${invalidFields.join(', ')}`);
  }
  if (Object.keys(update).length === 0) throw new Error('No update fields provided');

  if (Object.prototype.hasOwnProperty.call(update, 'description') && !String(update.description || '').trim()) {
    throw new Error('Description is required');
  }
  if (Object.prototype.hasOwnProperty.call(update, 'products')) validateRows(update.products, 'Products');
  if (Object.prototype.hasOwnProperty.call(update, 'materials')) validateRows(update.materials, 'Materials');
  if (Object.prototype.hasOwnProperty.call(update, 'status') && ![0, 1].includes(update.status)) {
    throw new Error('Status must be 0 or 1');
  }

  const updated = await Formula.findOneAndUpdate(
    { ...buildCondition(condition), status: 1 },
    { $set: update },
    { new: true, runValidators: true }
  );

  return updated;
}

export {
  escapeRegex,
  validateRows,
  buildCondition,
  generateFormulaNumber,
  createFormula,
  getFormulaList,
  getFormulaDetail,
  updateFormula
};