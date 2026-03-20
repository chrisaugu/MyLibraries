import { Router } from 'express';
import tesseract from 'tesseract';

const router = Router();

// Tesseract configuration
const config = {
  lang: 'eng', // Language of OCR
  oem: 1, // OCR Engine mode
  psm: 3 // Page segmentation mode
};

// Route to fetch and convert the image
router.get('/', async (req, res) => {
  const imageUrl = req.query.imageurl as string;
  console.log(imageUrl);

  try {
    // Use Tesseract to recognize text from the image
    tesseract
      .recognize(imageUrl, config)
      .then((text: string) => {
        console.log('OCR Result:', text);
        res.send(text);
      })
      .catch((error: Error) => {
        console.error('OCR Error:', error.message);
        res.status(500).send('Error processing the image.');
      });
  } catch (error: any) {
    console.error('Error:', error.message);
    res.status(500).send('An error occurred while processing the image.');
  }
});

export default router;
