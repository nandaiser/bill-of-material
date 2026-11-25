'use strict';

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, validate: { validator: (value) => value > 0, message: 'Quantity must be greater than 0' } },
    uom: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const formulaSchema = new mongoose.Schema(
  {
    company_id: { type: String, required: true, trim: true },
    site: { type: String, required: true, trim: true },
    formula_number: { type: String, required: true, trim: true },
    formula_type: { type: Number, default: 0 },
    description: { type: String, required: true, trim: true },
    remark: { type: String, default: '' },
    pic: { type: String, default: '' },
    status: { type: Number, default: 1, enum: [0, 1] },
    created_time: { type: Date, default: Date.now },
    products: { type: [itemSchema], required: true },
    materials: { type: [itemSchema], required: true },
  },
  { collection: 'formula', versionKey: false }
);

formulaSchema.index(
  { company_id: 1, site: 1, formula_type: 1, formula_number: 1 },
  { unique: true }
);

module.exports = mongoose.models.formula || mongoose.model('formula', formulaSchema);
