const axios = require('axios');

class AIService {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.openai.com/v1',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async generateSegmentRules(prompt) {
    try {
      const response = await this.client.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a CRM assistant that converts natural language into structured segment rules. 
            Respond with valid JSON array of rules where each rule has:
            - field (customer attribute)
            - operator (>, <, ==, contains, etc.)
            - value
            Example: [{"field":"totalSpent","operator":">","value":1000}]`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const content = response.data.choices[0].message.content;
      return JSON.parse(content).rules;
    } catch (err) {
      console.error('AI API Error:', err.response?.data || err.message);
      throw new Error('Failed to generate segment rules');
    }
  }

  async generateMessageSuggestions(objective, audienceDescription) {
    try {
      const response = await this.client.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a marketing assistant that generates 3 email message variations based on:
            1. Campaign objective
            2. Audience description
            Each variation should have different tone and approach.
            Respond with JSON format: {suggestions: [{text: "", tone: ""}]}`
          },
          {
            role: 'user',
            content: `Objective: ${objective}\nAudience: ${audienceDescription}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const content = response.data.choices[0].message.content;
      return JSON.parse(content).suggestions;
    } catch (err) {
      console.error('AI API Error:', err.response?.data || err.message);
      throw new Error('Failed to generate message suggestions');
    }
  }

  async analyzeCampaignPerformance(campaignData) {
    // Implementation for performance analysis
  }
}

module.exports = new AIService();