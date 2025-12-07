const { createWorker } = require('tesseract.js');
const transactionModel = require('../models/transactionModel');

let worker;

// Simple fallback category prediction based on keywords
const predictCategoryFallback = (text) => {
  const lines = text.toLowerCase().split('\n');
  const scores = {
    Food: 0,
    Transport: 0,
    Entertainment: 0,
    Business: 0,
    Shopping: 0,
    Clothing: 0,
  };

  lines.forEach((line) => {
    if (/food|grocery|restaurant|cafe|dining|candy|meal|kitchen|bakery/i.test(line)) scores.Food += 1;
    if (/transport|travel|fuel|taxi|bus|train|car|vehicle|gas|petrol|uber/i.test(line)) scores.Transport += 1;
    if (/entertainment|movie|cinema|concert|game|ticket|show|event/i.test(line)) scores.Entertainment += 1;
    if (/brand|consultation|design|social media|website|logo|photography|marketing|invoice|subtotal|tax|service|professional|account|bank|payment/i.test(line)) scores.Business += 1;
    if (/shopping|store|purchase|retail|market|supermarket/i.test(line)) scores.Shopping += 1;
    if (/clothing|shirt|dress|top|jeans|pants|shoes|footwear|fashion|boutique/i.test(line)) scores.Clothing += 1;
  });

  let predictedCategory = 'Entertainment';
  let highestScore = 0;
  Object.entries(scores).forEach(([category, score]) => {
    if (score > highestScore) {
      highestScore = score;
      predictedCategory = category;
    }
  });

  return predictedCategory;
};

const initializeWorker = async () => {
  if (!worker) {
    worker = await createWorker('eng', 1, {
      logger: (m) => console.log(m),
    });
    console.log('Tesseract worker initialized');
  }
  return worker;
};

const parseReceiptText = (text, user_id, callback) => {
  const lines = text.split('\n').map(line => line.trim().replace(/["']/g, '')).filter(line => line.length > 0);
  let amount = 0;
  let category = '';
  let date = new Date().toISOString().split('T')[0]; // Default to current date
  let note = 'Added via OCR';
  let items = [];

  console.log('Lines from OCR:', lines);

  // Enhanced amount extraction
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    // Prioritize lines with currency symbols and multiple numbers (assume last number is total)
    if (/(?:\$|USD|uso|rs\.?|₹|£)\s*[\d,.]+/.test(lowerLine)) {
      const numbers = line.match(/[\d,]+(?:\.\d{1,2})?/g) || [];
      if (numbers.length > 0) {
        const lastNumber = parseFloat(numbers[numbers.length - 1].replace(/,/g, ''));
        if (lastNumber > 0 && lastNumber <= 100000 && lastNumber > amount) {
          amount = lastNumber;
          console.log('Extracted amount from line (last number):', line, 'Value:', amount);
        }
      }
    }
    // Fallback for amount-related keywords
    else if (/subtotal|balance due|paid|amount/i.test(lowerLine)) {
      const match = lowerLine.match(/[\d,]+(?:\.\d{1,2})?/);
      if (match && match[0]) {
        const numericValue = parseFloat(match[0].replace(/,/g, ''));
        if (numericValue > 0 && numericValue <= 100000 && numericValue > amount) {
          amount = numericValue;
          console.log('Extracted amount from keyword line:', line, 'Value:', amount);
        }
      }
    }
  }

  // Fallback: Extract standalone numbers if no amount found
  if (amount === 0) {
    for (const line of lines) {
      const match = line.match(/\b\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?\b/);
      if (match && match[0]) {
        const numericValue = parseFloat(match[0].replace(/,/g, ''));
        if (numericValue > 10 && numericValue <= 100000 && numericValue > amount) {
          amount = numericValue;
          console.log('Fallback amount from line:', line, 'Value:', amount);
        }
      }
    }
  }

  // Enhanced date parsing
  for (const line of lines) {
    if (/\d{2}\s+[a-zA-Z]{3,}\s*,\s*\d{4}/.test(line)) { // e.g., 02 June, 2030
      const dateMatch = line.match(/(\d{2})\s+([a-zA-Z]{3,})\s*,\s*(\d{4})/i);
      if (dateMatch && dateMatch[0]) {
        const [_, day, monthStr, year] = dateMatch;
        const month = new Date(`${monthStr} 1, 2020`).getMonth() + 1;
        date = `${year}-${month.toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
        console.log('Extracted date:', date);
        break;
      }
    } else if (/\d{2}\/\d{2}\/\d{4}/.test(line)) {
      const dateMatch = line.match(/\d{2}\/\d{2}\/\d{4}/);
      if (dateMatch && dateMatch[0]) {
        const [day, month, year] = dateMatch[0].split('/');
        date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        console.log('Extracted date:', date);
        break;
      }
    } else if (/\d{2}\.\d{2}\.\d{4}/.test(line)) {
      const dateMatch = line.match(/\d{2}\.\d{2}\.\d{4}/);
      if (dateMatch && dateMatch[0]) {
        const [day, month, year] = dateMatch[0].split('.');
        date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        console.log('Extracted date:', date);
        break;
      }
    } else if (/\d{4}-\d{2}-\d{2}/.test(line)) {
      const dateMatch = line.match(/\d{4}-\d{2}-\d{2}/);
      if (dateMatch && dateMatch[0]) {
        date = dateMatch[0];
        console.log('Extracted date:', date);
        break;
      }
    }
  }

  // Refined item extraction for note
  lines.forEach((line) => {
    if (/[a-zA-Z]+/.test(line) && // Ensure it contains letters (potential item name)
        !/change|items|date|inv|time/i.test(line.toLowerCase()) && // Exclude metadata
        !/^\d+\s/.test(line)) { // Exclude lines starting with numbers (e.g., quantities)
      items.push(line.trim());
    }
  });

  if (items.length > 0) {
    note = `Items: ${items.join(', ')}`;
  }

  // Use simple keyword-based category prediction
  category = predictCategoryFallback(text);
  console.log('Parsed Receipt:', { amount, category, date, note });
  callback(null, { amount, category, date, note });
};

const processReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    if (!worker) await initializeWorker();
    const { data: { text } } = await worker.recognize(imagePath);
    console.log('Raw OCR Text:', text);

    const user_id = req.body.user_id || req.user?.id;
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    parseReceiptText(text, user_id, (err, parsedData) => {
      if (err) {
        console.error('Error parsing receipt:', err);
        return res.status(500).json({ error: 'Failed to parse receipt' });
      }

      const { amount, category, date, note } = parsedData;
      console.log('Returning parsed data for UI:', { amount, category, date, note });
      res.status(200).json({ amount, category, date, note }); // Return data without saving
    });
  } catch (error) {
    console.error('Error processing receipt:', error);
    res.status(500).json({ error: 'Failed to process receipt' });
  }
};

module.exports = { processReceipt };