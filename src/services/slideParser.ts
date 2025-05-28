import * as pdfjsLib from 'pdfjs-dist';

// Use local worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.min.js';

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
        verbosity: 0,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true
      }).promise;
      
      console.log('PDF document loaded successfully, pages:', pdf.numPages);
      const slides: SlideData[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          console.log(`Processing page ${pageNum}...`);
          
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            throw new Error('Could not get canvas context');
          }
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          // Render with white background
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          
          await page.render(renderContext).promise;
          console.log(`Page ${pageNum} rendered successfully`);
          
          // Convert to high-quality image
          const imageUrl = canvas.toDataURL('image/png', 1.0);
          
          // Extract text
          let extractedText = '';
          try {
            const textContent = await page.getTextContent();
            extractedText = textContent.items
              .map((item: any) => item.str || '')
              .filter(str => str.trim().length > 0)
              .join(' ');
          } catch (textError) {
            console.warn(`Text extraction failed for page ${pageNum}:`, textError);
          }
          
          slides.push({
            slideNumber: pageNum,
            imageUrl: imageUrl,
            text: extractedText
          });
          
          console.log(`Slide ${pageNum} processed successfully`);
          
        } catch (pageError) {
          console.error(`Error processing page ${pageNum}:`, pageError);
          slides.push({
            slideNumber: pageNum,
            imageUrl: this.createFallbackSlide(pageNum),
            text: `Error loading slide ${pageNum}`
          });
        }
      }
      
      console.log('PDF parsing completed. Total slides:', slides.length);
      return slides;
      
    } catch (error) {
      console.error('PDF parsing failed:', error);
      return this.createFallbackSlides(5);
    }
  }

  static createFallbackSlide(slideNumber: number): string {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 800;
    canvas.height = 600;
    
    // White background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    context.strokeStyle = '#e5e7eb';
    context.lineWidth = 2;
    context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Content
    context.fillStyle = '#374151';
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.fillText(`Slide ${slideNumber}`, canvas.width / 2, canvas.height / 2 - 50);
    
    context.font = '24px Arial';
    context.fillStyle = '#6b7280';
    context.fillText('Content unavailable', canvas.width / 2, canvas.height / 2 + 20);
    
    return canvas.toDataURL('image/png', 1.0);
  }

  static createFallbackSlides(count: number): SlideData[] {
    const slides: SlideData[] = [];
    for (let i = 1; i <= count; i++) {
      slides.push({
        slideNumber: i,
        imageUrl: this.createFallbackSlide(i),
        text: `Fallback content for slide ${i}`
      });
    }
    return slides;
  }

  static async parsePowerPoint(file: File): Promise<SlideData[]> {
    try {
      const PizZip = (await import('pizzip')).default;
      
      const arrayBuffer = await file.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const slides: SlideData[] = [];

      const relsData = zip.file('ppt/_rels/presentation.xml.rels')?.asText();
      if (!relsData) {
        throw new Error('Invalid PowerPoint file structure');
      }

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

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          canvas.width = 800;
          canvas.height = 600;
          
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          context.strokeStyle = '#e5e7eb';
          context.lineWidth = 2;
          context.strokeRect(0, 0, canvas.width, canvas.height);
          
          context.fillStyle = '#1f2937';
          context.font = 'bold 32px Arial';
          context.textAlign = 'center';
          context.fillText(`Slide ${i + 1}`, canvas.width / 2, 80);
          
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
      return this.createFallbackSlides(5);
    }
  }

  static async parseFile(file: File): Promise<SlideData[]> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    console.log('Parsing file:', fileName, 'type:', fileType);

    try {
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
    } catch (error) {
      console.error('File parsing failed:', error);
      return this.createFallbackSlides(5);
    }
  }
}
