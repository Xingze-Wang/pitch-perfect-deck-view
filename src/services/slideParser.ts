
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker with a more reliable method
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

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
      console.log('PDF ArrayBuffer size:', arrayBuffer.byteLength);
      
      // Load PDF with more robust options
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
      });
      
      const pdf = await loadingTask.promise;
      console.log('PDF loaded successfully, number of pages:', pdf.numPages);
      
      const slides: SlideData[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          console.log('Processing page:', i);
          const page = await pdf.getPage(i);
          
          // Use higher scale for better quality
          const viewport = page.getViewport({ scale: 2.0 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d', { alpha: false });
          
          if (!context) {
            throw new Error('Could not get canvas context');
          }
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Set white background
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);

          console.log('Rendering page', i, 'with dimensions:', canvas.width, 'x', canvas.height);
          
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            background: 'white'
          };

          await page.render(renderContext).promise;
          console.log('Page', i, 'rendered successfully');

          const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          // Extract text content
          let text = '';
          try {
            const textContent = await page.getTextContent();
            text = textContent.items
              .map((item: any) => {
                if (item.str && typeof item.str === 'string') {
                  return item.str.trim();
                }
                return '';
              })
              .filter(str => str.length > 0)
              .join(' ');
            console.log('Extracted text length for page', i, ':', text.length);
          } catch (textError) {
            console.warn('Failed to extract text from page', i, ':', textError);
          }

          slides.push({
            slideNumber: i,
            imageUrl,
            text
          });
          
          console.log('Successfully processed slide', i);

        } catch (pageError) {
          console.error('Error processing page', i, ':', pageError);
          
          // Create fallback slide
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (context) {
            canvas.width = 800;
            canvas.height = 600;
            
            context.fillStyle = '#f8f9fa';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            context.fillStyle = '#6b7280';
            context.font = 'bold 24px Arial';
            context.textAlign = 'center';
            context.fillText(`Slide ${i}`, canvas.width / 2, canvas.height / 2);
            context.fillText('(Processing Error)', canvas.width / 2, canvas.height / 2 + 40);
            
            slides.push({
              slideNumber: i,
              imageUrl: canvas.toDataURL(),
              text: `Slide ${i} - Processing Error`
            });
          }
        }
      }

      console.log('Successfully parsed', slides.length, 'slides from PDF');
      return slides;
      
    } catch (error) {
      console.error('Critical error parsing PDF:', error);
      
      // Return fallback slides if PDF parsing completely fails
      const fallbackSlides: SlideData[] = [];
      for (let i = 1; i <= 5; i++) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          canvas.width = 800;
          canvas.height = 600;
          
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          context.strokeStyle = '#e5e7eb';
          context.lineWidth = 2;
          context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
          
          context.fillStyle = '#1f2937';
          context.font = 'bold 32px Arial';
          context.textAlign = 'center';
          context.fillText(`Slide ${i}`, canvas.width / 2, canvas.height / 2);
          
          fallbackSlides.push({
            slideNumber: i,
            imageUrl: canvas.toDataURL(),
            text: `Slide ${i} content`
          });
        }
      }
      
      if (fallbackSlides.length > 0) {
        console.log('Returning fallback slides due to parsing error');
        return fallbackSlides;
      }
      
      throw new Error(`Failed to parse PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async parsePowerPoint(file: File): Promise<SlideData[]> {
    try {
      // Dynamic import to handle potential module loading issues
      const PizZip = (await import('pizzip')).default;
      
      const arrayBuffer = await file.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const slides: SlideData[] = [];

      // Extract slide relationships
      const relsData = zip.file('ppt/_rels/presentation.xml.rels')?.asText();
      if (!relsData) {
        throw new Error('Invalid PowerPoint file structure');
      }

      // Parse slide files
      const slideFiles = Object.keys(zip.files).filter(name => 
        name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
      );

      for (let i = 0; i < slideFiles.length; i++) {
        const slideFile = slideFiles[i];
        const slideData = zip.file(slideFile)?.asText();
        
        if (slideData) {
          // Extract text content from slide XML
          const textMatches = slideData.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
          const text = textMatches
            .map(match => match.replace(/<\/?[^>]+(>|$)/g, ''))
            .join(' ');

          // Create a visual representation of the slide
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          canvas.width = 800;
          canvas.height = 600;
          
          // Create a slide representation
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          // Add border
          context.strokeStyle = '#e5e7eb';
          context.lineWidth = 2;
          context.strokeRect(0, 0, canvas.width, canvas.height);
          
          context.fillStyle = '#1f2937';
          context.font = 'bold 32px Arial';
          context.textAlign = 'center';
          context.fillText(`Slide ${i + 1}`, canvas.width / 2, 80);
          
          // Add extracted text content
          if (text && text.trim()) {
            context.font = '18px Arial';
            context.textAlign = 'left';
            const words = text.substring(0, 300).split(' ');
            let line = '';
            let y = 140;
            const lineHeight = 28;
            const maxWidth = canvas.width - 80;
            
            for (const word of words) {
              const testLine = line + word + ' ';
              const metrics = context.measureText(testLine);
              if (metrics.width > maxWidth && line !== '') {
                context.fillText(line.trim(), 40, y);
                line = word + ' ';
                y += lineHeight;
                if (y > canvas.height - 60) break;
              } else {
                line = testLine;
              }
            }
            if (line.trim() && y <= canvas.height - 60) {
              context.fillText(line.trim(), 40, y);
            }
          }

          slides.push({
            slideNumber: i + 1,
            imageUrl: canvas.toDataURL(),
            text
          });
        }
      }

      return slides;
    } catch (error) {
      console.error('Error parsing PowerPoint:', error);
      throw new Error('Failed to parse PowerPoint file');
    }
  }

  static async parseFile(file: File): Promise<SlideData[]> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    console.log('Parsing file:', fileName, 'type:', fileType);

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return this.parsePDF(file);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      fileType === 'application/vnd.ms-powerpoint' ||
      fileName.endsWith('.pptx') ||
      fileName.endsWith('.ppt')
    ) {
      return this.parsePowerPoint(file);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  }
}
