const Customer = require('../models/Customer');

const getCustomersByRules = async (rules) => {
  try {
    const query = buildMongoQuery(rules);
    return await Customer.find(query);
  } catch (err) {
    throw new Error('Error fetching customers by rules');
  }
};

const buildMongoQuery = (rules) => {
  if (!rules || rules.length === 0) return {};
  
  const query = { $and: [] };
  
  rules.forEach(rule => {
    if (rule.operator === 'contains') {
      query.$and.push({ [rule.field]: { $regex: rule.value, $options: 'i' } });
    } else {
      const operator = getMongoOperator(rule.operator);
      query.$and.push({ [rule.field]: { [operator]: rule.value } });
    }
  });
  
  return query;
};

const getMongoOperator = (operator) => {
  const operators = {
    '>': '$gt',
    '<': '$lt',
    '>=': '$gte',
    '<=': '$lte',
    '==': '$eq',
    '!=': '$ne'
  };
  return operators[operator] || '$eq';
};
const validateRules = (rules) => {
    const errors = [];
    const validFields = [
      'name', 'email', 'totalSpent', 'purchaseCount', 
      'lastPurchaseDate', 'tags'
    ];
    const validOperators = ['>', '<', '==', '>=', '<=', '!=', 'contains'];
  
    if (!Array.isArray(rules)) {
      return { valid: false, errors: ['Rules must be an array'] };
    }
  
    rules.forEach((rule, index) => {
      if (!rule.field || !validFields.includes(rule.field)) {
        errors.push(`Rule ${index}: Invalid field '${rule.field}'`);
      }
      if (!rule.operator || !validOperators.includes(rule.operator)) {
        errors.push(`Rule ${index}: Invalid operator '${rule.operator}'`);
      }
      if (rule.value === undefined || rule.value === null || rule.value === '') {
        errors.push(`Rule ${index}: Value is required`);
      }
    });
  
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : null
    };
  };
  
  const getSegmentSize = async (rules) => {
    try {
      const query = buildMongoQuery(rules);
      return await Customer.countDocuments(query);
    } catch (err) {
      throw new Error('Error calculating segment size');
    }
  };
  
  module.exports = {
    getCustomersByRules,
    buildMongoQuery,
    validateRules,
    getSegmentSize
  };
