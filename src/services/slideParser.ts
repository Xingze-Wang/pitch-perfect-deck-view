
import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.js';

export interface SlideData {
  slideNumber: number;
  imageUrl?: string;
  text?: string;
  pdfUrl?: string; // For native PDF viewing
}

export class SlideParser {
  static async parseFile(file: File): Promise<SlideData[]> {
    console.log('Processing file:', file.name);
    
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

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

  static async parsePDF(file: File): Promise<SlideData[]> {
    try {
      console.log('Parsing PDF with screenshots...');
      
      // Create blob URL for native PDF viewing
      const pdfUrl = URL.createObjectURL(file);
      
      // Load PDF for page rendering
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const slides: SlideData[] = [];
      
      // Generate screenshots for each page
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        console.log(`Rendering page ${pageNumber} of ${pdf.numPages}`);
        
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
        
        // Create canvas for rendering
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Render PDF page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        await page.render(renderContext).promise;
        
        // Convert canvas to image URL
        const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        slides.push({
          slideNumber: pageNumber,
          imageUrl: imageUrl,
          pdfUrl: pageNumber === 1 ? pdfUrl : undefined, // Only include pdfUrl for first slide
          text: `PDF Page ${pageNumber}`
        });
      }
      
      console.log(`Generated ${slides.length} page screenshots`);
      return slides;
      
    } catch (error) {
      console.error('Error parsing PDF:', error);
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
}
