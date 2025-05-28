
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source to CDN for better reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export interface SlideData {
  slideNumber: number;
  imageUrl: string;
  text?: string;
}

export class SlideParser {
  static async parsePDF(file: File): Promise<SlideData[]> {
    try {
      console.log('Starting PDF parsing for:', file.name);
      
      const arrayBuffer = await file.arrayBuffer();
      console.log('File loaded, size:', arrayBuffer.byteLength, 'bytes');
      
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0
      }).promise;
      
      console.log('PDF document loaded successfully, pages:', pdf.numPages);
      const slides: SlideData[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          console.log(`Processing page ${pageNum}...`);
          
          const page = await pdf.getPage(pageNum);
          
          // Use a higher scale for better quality
          const viewport = page.getViewport({ scale: 2.0 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            throw new Error('Could not get canvas context');
          }
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          // Set white background
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            intent: 'display'
          };
          
          // Wait for the page to render completely
          await page.render(renderContext).promise;
          console.log(`Page ${pageNum} rendered successfully`);
          
          // Convert to base64 data URL with high quality
          const imageUrl = canvas.toDataURL('image/jpeg', 0.95);
          
          // Extract text content
          let extractedText = '';
          try {
            const textContent = await page.getTextContent();
            extractedText = textContent.items
              .map((item: any) => item.str || '')
              .filter(str => str.trim().length > 0)
              .join(' ');
            console.log(`Extracted text from page ${pageNum}:`, extractedText.substring(0, 100) + '...');
          } catch (textError) {
            console.warn(`Text extraction failed for page ${pageNum}:`, textError);
          }
          
          slides.push({
            slideNumber: pageNum,
            imageUrl: imageUrl,
            text: extractedText
          });
          
          console.log(`Slide ${pageNum} processed successfully with image data length:`, imageUrl.length);
          
        } catch (pageError) {
          console.error(`Error processing page ${pageNum}:`, pageError);
          // Skip this page instead of adding placeholder
          continue;
        }
      }
      
      console.log('PDF parsing completed. Total slides:', slides.length);
      return slides;
      
    } catch (error) {
      console.error('PDF parsing failed completely:', error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  static async parsePowerPoint(file: File): Promise<SlideData[]> {
    try {
      const PizZip = (await import('pizzip')).default;
      
      const arrayBuffer = await file.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const slides: SlideData[] = [];

      const slideFiles = Object.keys(zip.files).filter(name => 
        name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
      );

      for (let i = 0; i < slideFiles.length; i++) {
        const slideFile = slideFiles[i];
        const slideData = zip.file(slideFile)?.asText();
        
        if (slideData) {
          const textMatches = slideData.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
          const text = textMatches
            .map(match => match.replace(/<\/?[^>]+(>|$)/g, ''))
            .join(' ');

          // Create a clean white slide without any placeholder text
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          canvas.width = 1024;
          canvas.height = 768;
          
          // Only white background, no text overlays
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          context.strokeStyle = '#e5e7eb';
          context.lineWidth = 1;
          context.strokeRect(0, 0, canvas.width, canvas.height);

          slides.push({
            slideNumber: i + 1,
            imageUrl: canvas.toDataURL('image/jpeg', 0.95),
            text
          });
        }
      }

      return slides;
    } catch (error) {
      console.error('Error parsing PowerPoint:', error);
      throw new Error(`Failed to parse PowerPoint: ${error.message}`);
    }
  }

  static async parseFile(file: File): Promise<SlideData[]> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    console.log('Parsing file:', fileName, 'type:', fileType);

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await this.parsePDF(file);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      fileType === 'application/vnd.ms-powerpoint' ||
      fileName.endsWith('.pptx') ||
      fileName.endsWith('.ppt')
    ) {
      return await this.parsePowerPoint(file);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  }
}
