/**
 * AI Service — CareConnect AI
 * OpenAI/Gemini integration for smart features
 */

import OpenAI from 'openai';
import { logger } from '../config/logger.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Smart Search & Classification ────────────────────────────────────────────

/**
 * Classify a user's service request using AI
 * Input: "My washing machine makes loud noise"
 * Output: Category, skills needed, urgency, cost estimate, etc.
 */
export const classifyServiceRequest = async (userQuery, location = null) => {
  try {
    const prompt = `
You are a home services expert AI for CareConnect AI marketplace in India.
Analyze this customer request and extract structured information.

Customer query: "${userQuery}"
${location ? `Location: ${location}` : ''}

Return a JSON object (no markdown, raw JSON only) with these exact fields:
{
  "category": "string (e.g., 'Appliance Repair', 'Plumbing', 'Electrical', 'Cleaning', 'Painting', 'AC Service', 'Pest Control', 'Carpentry')",
  "subcategory": "string (more specific)",
  "requiredSkills": ["skill1", "skill2"],
  "urgencyLevel": "low|medium|high|critical",
  "estimatedCostMin": number (INR),
  "estimatedCostMax": number (INR),
  "estimatedDuration": number (minutes),
  "requiredTools": ["tool1", "tool2"],
  "predictedProblems": ["problem1", "problem2"],
  "confidenceScore": number (0-100),
  "suggestedQuestions": ["question to ask customer"],
  "safetyWarnings": ["warning if applicable"],
  "professionalRequired": boolean,
  "diyPossible": boolean,
  "diyTips": "string if diy is possible"
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content);
    logger.info(`AI classified service request: ${result.category} (confidence: ${result.confidenceScore}%)`);
    return result;
  } catch (err) {
    logger.error('AI service classification failed:', err.message);
    // Return smart fallback
    return {
      category: 'General Service',
      subcategory: 'Other',
      requiredSkills: ['General Technician'],
      urgencyLevel: 'medium',
      estimatedCostMin: 300,
      estimatedCostMax: 2000,
      estimatedDuration: 60,
      requiredTools: [],
      predictedProblems: [],
      confidenceScore: 30,
      suggestedQuestions: ['What is the exact issue you are facing?'],
      safetyWarnings: [],
      professionalRequired: true,
      diyPossible: false,
      diyTips: null,
    };
  }
};

// ─── AI Matching Engine ────────────────────────────────────────────────────────

/**
 * Score and rank providers for a booking
 * Factors: distance, rating, experience, availability, price, trust score
 */
export const rankProviders = async (providers, booking, customerPreferences = {}) => {
  const scored = providers.map((provider) => {
    let score = 0;
    const reasons = [];

    // Distance score (30%) — closer = higher
    const maxRadius = 30; // km
    const distance = provider._distance || 10;
    const distanceScore = Math.max(0, (maxRadius - distance) / maxRadius) * 30;
    score += distanceScore;
    if (distance < 3) reasons.push('Within 3km of your location');

    // Rating score (25%)
    const ratingScore = (provider.averageRating / 5) * 25;
    score += ratingScore;
    if (provider.averageRating >= 4.5) reasons.push('Highly rated (4.5+)');

    // Trust score (20%)
    const trustScore = (provider.trustScore / 100) * 20;
    score += trustScore;
    if (provider.trustScore >= 80) reasons.push('Verified & trusted provider');

    // Completion rate (15%)
    const completionRate = provider.stats?.completionRate || 0;
    score += (completionRate / 100) * 15;
    if (completionRate >= 95) reasons.push('95%+ job completion rate');

    // Response time (10%)
    const avgResponse = provider.stats?.avgResponseTime || 60;
    const responseScore = Math.max(0, (60 - avgResponse) / 60) * 10;
    score += responseScore;
    if (avgResponse <= 10) reasons.push('Responds within 10 minutes');

    // Badges & special status
    if (provider.isSuperPro) { score += 5; reasons.push('Super Pro provider'); }
    if (provider.isTopProvider) { score += 3; reasons.push('Top provider in your area'); }
    if (provider.ecoScore?.greenCertified) reasons.push('Eco-friendly provider');

    return {
      provider: provider._id,
      score: Math.round(Math.min(100, score)),
      reasons,
      distance,
    };
  });

  return scored.sort((a, b) => b.score - a.score);
};

// ─── AI Price Estimation ──────────────────────────────────────────────────────

/**
 * Smart pricing engine with AI adjustments
 */
export const estimateServicePrice = async ({
  category,
  subcategory,
  description,
  location,
  urgency,
  scheduledDate,
  providerCount,
}) => {
  try {
    const now = new Date(scheduledDate);
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const isPeakHour = (hour >= 9 && hour <= 11) || (hour >= 17 && hour <= 20);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const prompt = `
You are a pricing expert for a home services marketplace in India (${location || 'major city'}).
Estimate service cost in INR.

Service: ${category} - ${subcategory}
Description: ${description}
Urgency: ${urgency}
Peak hour: ${isPeakHour}
Weekend: ${isWeekend}
Available providers: ${providerCount}

Return raw JSON only:
{
  "baseMin": number,
  "baseMax": number,
  "recommended": number,
  "travelCharge": number,
  "urgencyPremium": number (percentage if urgent),
  "peakHourPremium": number (percentage),
  "weekendPremium": number (percentage),
  "finalMin": number,
  "finalMax": number,
  "breakdown": {
    "labor": number,
    "materials": number,
    "travel": number,
    "platform": number
  },
  "currency": "INR",
  "confidence": number (0-100)
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    logger.error('AI price estimation failed:', err.message);
    return {
      baseMin: 300, baseMax: 1500, recommended: 800,
      travelCharge: 100, urgencyPremium: urgency === 'critical' ? 50 : 0,
      peakHourPremium: 10, weekendPremium: 15,
      finalMin: 300, finalMax: 2000,
      breakdown: { labor: 600, materials: 100, travel: 100, platform: 80 },
      currency: 'INR', confidence: 50,
    };
  }
};

// ─── AI Image Analysis ────────────────────────────────────────────────────────

/**
 * Analyze an uploaded image of a damaged appliance/area
 */
export const analyzeServiceImage = async (imageUrl) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are a home services expert. Analyze this image and identify any issues, damages, or required services.
Return raw JSON only:
{
  "identifiedIssues": ["issue1", "issue2"],
  "severity": "minor|moderate|severe|critical",
  "estimatedRepairDifficulty": "easy|medium|hard|expert_only",
  "estimatedCostMin": number (INR),
  "estimatedCostMax": number (INR),
  "recommendedServices": ["service1", "service2"],
  "urgency": "low|medium|high|critical",
  "safetyHazards": ["hazard if any"],
  "diyPossible": boolean,
  "diyWarnings": "string",
  "confidenceScore": number (0-100),
  "additionalNotes": "string"
}`,
          },
          { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
        ],
      }],
      max_tokens: 600,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    logger.error('AI image analysis failed:', err.message);
    throw err;
  }
};

// ─── AI Home Health Report ────────────────────────────────────────────────────

/**
 * Generate comprehensive home health report
 */
export const generateHomeHealthReport = async (homeData) => {
  const { serviceHistory, address, homeType, age, lastServices } = homeData;

  try {
    const prompt = `
You are an AI home maintenance advisor. Analyze this home's service history and generate a comprehensive health report.

Home type: ${homeType || 'Apartment'}
Home age: ${age || 'Unknown'} years
Location: ${address?.city || 'India'}
Recent services: ${JSON.stringify(lastServices || [])}
Service history summary: ${JSON.stringify(serviceHistory || [])}

Return raw JSON only:
{
  "overallScore": number (0-100),
  "breakdown": {
    "plumbing": number,
    "electrical": number,
    "appliances": number,
    "structural": number,
    "hvac": number,
    "pest": number
  },
  "riskLevel": "low|medium|high|critical",
  "upcomingMaintenance": [
    {
      "service": "string",
      "dueIn": "string (e.g., '2 weeks', '3 months')",
      "priority": "low|medium|high",
      "estimatedCost": number,
      "reason": "string"
    }
  ],
  "alerts": ["urgent alert if any"],
  "recommendations": ["recommendation1", "recommendation2"],
  "estimatedYearlyCost": number,
  "savingsOpportunity": number,
  "tips": ["money saving tip"]
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    logger.error('AI home health report failed:', err.message);
    return {
      overallScore: 72,
      breakdown: { plumbing: 70, electrical: 75, appliances: 68, structural: 80, hvac: 65, pest: 85 },
      riskLevel: 'medium',
      upcomingMaintenance: [
        { service: 'AC Service', dueIn: '1 month', priority: 'high', estimatedCost: 500, reason: 'Seasonal maintenance' },
        { service: 'Water Purifier', dueIn: '2 months', priority: 'medium', estimatedCost: 800, reason: 'Filter replacement due' },
      ],
      alerts: [],
      recommendations: ['Schedule AC service before summer', 'Check water purifier filter'],
      estimatedYearlyCost: 12000,
      savingsOpportunity: 2000,
      tips: ['Book services in advance to save 15%', 'Subscribe for priority access'],
    };
  }
};

// ─── AI Sentiment Analysis for Reviews ───────────────────────────────────────

export const analyzeReviewSentiment = async (reviewText) => {
  try {
    const prompt = `
Analyze the sentiment of this service review. Return raw JSON only:
{
  "score": number (-1.0 to 1.0),
  "label": "very_negative|negative|neutral|positive|very_positive",
  "keywords": ["keyword1", "keyword2"],
  "isFake": boolean,
  "fakeIndicators": ["reason if fake"]
}

Review: "${reviewText}"
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    logger.error('AI sentiment analysis failed:', err.message);
    return { score: 0, label: 'neutral', keywords: [], isFake: false, fakeIndicators: [] };
  }
};

// ─── AI Chatbot ───────────────────────────────────────────────────────────────

export const getAIChatbotResponse = async (userMessage, conversationHistory = [], userContext = {}) => {
  try {
    const systemPrompt = `You are CareBot, the AI assistant for CareConnect AI — a premium home services marketplace in India. 
You help customers: book services, troubleshoot issues, understand pricing, track bookings, and resolve concerns.
Customer context: ${JSON.stringify(userContext)}
Be helpful, concise, friendly, and professional. Use Indian context (₹ for prices, Indian cities, etc.).
If the user needs a specific service, guide them to book it. Never make up booking details.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Last 10 messages for context
      { role: 'user', content: userMessage },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  } catch (err) {
    logger.error('AI chatbot response failed:', err.message);
    return "I'm having trouble processing your request right now. Please try again or contact our support team.";
  }
};

// ─── AI Voice Booking Parser ──────────────────────────────────────────────────

export const parseVoiceBookingRequest = async (transcribedText) => {
  try {
    const prompt = `
Parse this voice booking request for a home services app in India.
Voice input: "${transcribedText}"

Return raw JSON only:
{
  "service": "string",
  "category": "string",
  "date": "string (ISO date or relative like 'tomorrow morning')",
  "time": "string",
  "location": "string",
  "notes": "string",
  "isEmergency": boolean,
  "confidence": number (0-100),
  "missingInfo": ["what info is missing"]
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    logger.error('AI voice booking parse failed:', err.message);
    return { service: null, confidence: 0, missingInfo: ['Could not parse voice input'] };
  }
};
