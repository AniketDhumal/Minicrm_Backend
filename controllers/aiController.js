const AIService = require('../services/aiService');
const { validateRules } = require('../services/segmentService');

const generateSegmentRules = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const rules = await AIService.generateSegmentRules(prompt);
    const validation = validateRules(rules);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        message: 'AI generated invalid rules',
        details: validation.errors
      });
    }

    res.json({ rules });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const generateMessageSuggestions = async (req, res) => {
  try {
    const { objective, audienceDescription } = req.body;
    if (!objective || !audienceDescription) {
      return res.status(400).json({ 
        message: 'Objective and audience description are required' 
      });
    }

    const suggestions = await AIService.generateMessageSuggestions(
      objective, 
      audienceDescription
    );
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { generateSegmentRules, generateMessageSuggestions };