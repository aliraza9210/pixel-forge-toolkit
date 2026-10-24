'use strict';

const MAX_DOCUMENT_CHARS = 50000;

/**
 * Sanitize untrusted document text to mitigate prompt injection
 */
function sanitizeDocumentText(rawText) {
  if (!rawText) return '';
  let text = String(rawText).slice(0, MAX_DOCUMENT_CHARS);

  // Neutralize common adversarial prompt injection patterns
  const patterns = [
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
    /you\s+are\s+now\s+in\s+developer\s+mode/gi,
    /disregard\s+(the\s+)?(above|system)\s+rules/gi,
    /reveal\s+(your\s+)?(system\s+prompt|api\s+key|credentials)/gi,
  ];

  for (const pattern of patterns) {
    text = text.replace(pattern, '[REDACTED_INJECTION_PATTERN]');
  }

  return text;
}

/**
 * Identify active AI provider
 */
function getActiveProvider() {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'placeholder') {
    return { name: 'openai', key: process.env.OPENAI_API_KEY };
  }
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'placeholder') {
    return { name: 'gemini', key: process.env.GEMINI_API_KEY };
  }
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'placeholder') {
    return { name: 'anthropic', key: process.env.ANTHROPIC_API_KEY };
  }
  return { name: 'local-heuristic', key: null };
}

/**
 * Built-in local heuristic NLP analyzer (runs without external API keys)
 */
function runLocalHeuristicAnalysis(text, task, extra = {}) {
  const clean = text.trim();
  const sentences = clean
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const paragraphs = clean
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 30);

  const words = clean.split(/\s+/).filter(Boolean);

  const notice =
    'Running on PixelForge Local Intelligence Engine. To connect cloud LLMs, add OPENAI_API_KEY or GEMINI_API_KEY to your server/.env file.';

  switch (task) {
    case 'summarize': {
      // Pick leading topic sentences from top paragraphs
      const topSentences = paragraphs.slice(0, 4).map((p) => {
        const firstPeriod = p.indexOf('.');
        return firstPeriod > 15 ? p.substring(0, firstPeriod + 1) : p.slice(0, 150) + '...';
      });

      const summary = topSentences.join(' ');
      return {
        summary: summary || 'The document contains general textual information with ' + words.length + ' words.',
        keyTakeaways: sentences.slice(0, 5),
        wordCount: words.length,
        readingTimeMinutes: Math.max(1, Math.ceil(words.length / 200)),
        provider: 'local-heuristic',
        notice,
      };
    }

    case 'ask': {
      const q = String(extra.question || '').toLowerCase();
      const qWords = q.split(/\s+/).filter((w) => w.length > 3);

      // Score sentences by matching query words
      let bestSentence = '';
      let maxScore = -1;

      for (const sentence of sentences) {
        const sLower = sentence.toLowerCase();
        let score = 0;
        for (const word of qWords) {
          if (sLower.includes(word)) score++;
        }
        if (score > maxScore) {
          maxScore = score;
          bestSentence = sentence;
        }
      }

      const answer =
        maxScore > 0
          ? `Based on the document: "${bestSentence}"`
          : `The query terms were not directly found in the document text. The document discusses: ${sentences.slice(0, 2).join(' ')}`;

      return {
        question: extra.question,
        answer,
        confidence: maxScore > 0 ? 'medium' : 'low',
        relevantExcerpt: bestSentence || null,
        provider: 'local-heuristic',
        notice,
      };
    }

    case 'key-points': {
      // Filter sentences that sound like definitions, findings, or main points
      const keyPoints = sentences
        .filter((s) => /is|are|provides|allows|designed|important|must|should|results/i.test(s))
        .slice(0, 6);

      return {
        keyPoints: keyPoints.length > 0 ? keyPoints : sentences.slice(0, 5),
        totalAnalyzed: sentences.length,
        provider: 'local-heuristic',
        notice,
      };
    }

    case 'study-questions': {
      const questions = [];
      const count = Math.min(10, parseInt(extra.count, 10) || 5);

      for (let i = 0; i < Math.min(sentences.length, count); i++) {
        const s = sentences[i];
        questions.push({
          id: i + 1,
          question: `According to the document, what is stated regarding: "${s.slice(0, 50)}..."?`,
          answer: s,
        });
      }

      return {
        questions,
        provider: 'local-heuristic',
        notice,
      };
    }

    case 'outline': {
      const outline = paragraphs.slice(0, 8).map((p, idx) => {
        const firstLine = p.split('\n')[0].replace(/[#*]/g, '').trim();
        return {
          sectionNumber: idx + 1,
          title: firstLine.length > 60 ? firstLine.slice(0, 57) + '...' : firstLine,
          summary: p.slice(0, 120) + '...',
        };
      });

      return {
        outline,
        provider: 'local-heuristic',
        notice,
      };
    }

    case 'translate': {
      const lang = extra.targetLanguage || 'es';
      return {
        originalTextPreview: clean.slice(0, 300),
        targetLanguage: lang,
        translatedText: `[Translation to ${lang.toUpperCase()} requires an external provider key (e.g., OPENAI_API_KEY) in server/.env] Original text preview: ${clean.slice(0, 300)}`,
        provider: 'local-heuristic',
        notice,
      };
    }

    default:
      return { error: 'Unknown AI task requested.', provider: 'local-heuristic', notice };
  }
}

/**
/**
 * Call external OpenAI API if configured
 */
async function callOpenAI(apiKey, systemPrompt, userPrompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Call Google Gemini API if configured
 */
async function callGemini(apiKey, systemPrompt, userPrompt) {
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API returned an empty response.');
  }
  return text;
}

/**
 * Public AI Service Interface
 */
async function processDocumentAi(text, task, options = {}) {
  const sanitized = sanitizeDocumentText(text);
  if (!sanitized) {
    throw new Error('No readable text content provided for AI processing.');
  }

  const provider = getActiveProvider();

  // If using OpenAI
  if (provider.name === 'openai') {
    try {
      const systemPrompt = 'You are an objective document analysis assistant. Adhere strictly to facts presented in the user text.';
      let userPrompt = '';

      if (task === 'summarize') {
        userPrompt = `Please summarize the following document:\n\n"""\n${sanitized}\n"""`;
      } else if (task === 'ask') {
        userPrompt = `Document:\n"""\n${sanitized}\n"""\n\nQuestion: ${options.question}\nAnswer solely based on the document.`;
      } else if (task === 'key-points') {
        userPrompt = `Extract 5-8 bullet key points from this document:\n\n"""\n${sanitized}\n"""`;
      } else if (task === 'study-questions') {
        userPrompt = `Generate 5 study questions and answers based on this document:\n\n"""\n${sanitized}\n"""`;
      } else if (task === 'outline') {
        userPrompt = `Generate a structured outline for this document:\n\n"""\n${sanitized}\n"""`;
      } else if (task === 'translate') {
        const lang = options.targetLanguage || 'Spanish';
        userPrompt = `Translate the following text into ${lang}:\n\n"""\n${sanitized}\n"""`;
      }

      const result = await callOpenAI(provider.key, systemPrompt, userPrompt);
      return {
        summary: result,
        result,
        provider: `OpenAI (${process.env.OPENAI_MODEL || 'gpt-4o-mini'})`,
        notice: 'Processed securely via OpenAI API. Document text was transmitted for inference only.',
      };
    } catch (err) {
      console.warn('[AI Service] OpenAI call failed, falling back to local engine:', err.message);
      // Fallback cleanly to local heuristic engine
    }
  }

  // If using Google Gemini
  if (provider.name === 'gemini') {
    try {
      const systemPrompt = 'You are an objective document analysis assistant. Adhere strictly to facts presented in the user text.';
      let userPrompt = '';

      if (task === 'summarize') {
        userPrompt = `Please summarize the following document concisely with key findings:\n\n"""\n${sanitized}\n"""`;
      } else if (task === 'ask') {
        userPrompt = `Document:\n"""\n${sanitized}\n"""\n\nQuestion: ${options.question}\nAnswer solely based on the document.`;
      } else if (task === 'key-points') {
        userPrompt = `Extract 5-8 bullet key points from this document:\n\n"""\n${sanitized}\n"""`;
      } else if (task === 'study-questions') {
        userPrompt = `Generate 5 study questions and answers based on this document:\n\n"""\n${sanitized}\n"""`;
      } else if (task === 'outline') {
        userPrompt = `Generate a structured outline for this document:\n\n"""\n${sanitized}\n"""`;
      } else if (task === 'translate') {
        const lang = options.targetLanguage || 'Spanish';
        userPrompt = `Translate the following text into ${lang}:\n\n"""\n${sanitized}\n"""`;
      }

      const result = await callGemini(provider.key, systemPrompt, userPrompt);
      return {
        summary: result,
        result,
        provider: `Google Gemini (${process.env.GEMINI_MODEL || 'gemini-1.5-flash'})`,
        notice: 'Processed securely via Google Gemini API. Document text was transmitted for inference only.',
      };
    } catch (err) {
      console.warn('[AI Service] Gemini call failed, falling back to local engine:', err.message);
      // Fallback cleanly to local heuristic engine
    }
  }

  // Local engine fallback
  return runLocalHeuristicAnalysis(sanitized, task, options);
}

module.exports = {
  sanitizeDocumentText,
  getActiveProvider,
  processDocumentAi,
};
