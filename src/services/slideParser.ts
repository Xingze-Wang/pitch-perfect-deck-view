import * as pdfjsLib from 'pdfjs-dist';

// Use local worker or disable worker entirely
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

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
      console.log('Parsing PDF with canvas rendering (no worker)...');
      
      // Create blob URL for native PDF viewing
      const pdfUrl = URL.createObjectURL(file);
      
      // Load PDF without worker
      const arrayBuffer = await file.arrayBuffer();
      
      // Disable worker to avoid CORS issues
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true
      });
      
      const pdf = await loadingTask.promise;
      const slides: SlideData[] = [];
      
      // Generate screenshots for each page using canvas
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        console.log(`Rendering page ${pageNumber} of ${pdf.numPages}`);
        
        try {
          const page = await pdf.getPage(pageNumber);
          const scale = 1.5; // Good balance between quality and performance
          const viewport = page.getViewport({ scale });
          
          // Create canvas for rendering
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            throw new Error('Could not get canvas context');
          }
          
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          // Render PDF page to canvas with white background
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          
          await page.render(renderContext).promise;
          
          // Convert canvas to image URL with high quality
          const imageUrl = canvas.toDataURL('image/png', 0.95);
          
          slides.push({
            slideNumber: pageNumber,
            imageUrl: imageUrl,
            pdfUrl: pageNumber === 1 ? pdfUrl : undefined, // Only include pdfUrl for first slide
            text: `PDF Page ${pageNumber}`
          });
          
          // Clean up page resources
          page.cleanup();
          
        } catch (pageError) {
          console.error(`Error rendering page ${pageNumber}:`, pageError);
          // Create fallback slide
          slides.push({
            slideNumber: pageNumber,
            pdfUrl: pageNumber === 1 ? pdfUrl : undefined,
            text: `PDF Page ${pageNumber} (Preview unavailable)`
          });
        }
      }
      
      console.log(`Generated ${slides.length} page screenshots`);
      return slides;
      
    } catch (error) {
      console.error('Error parsing PDF:', error);
      
      // Fallback: create a single slide with just the PDF URL for native viewing
      const pdfUrl = URL.createObjectURL(file);
      return [{
        slideNumber: 1,
        pdfUrl: pdfUrl,
        text: 'PDF Document (Native viewer only)'
      }];
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
