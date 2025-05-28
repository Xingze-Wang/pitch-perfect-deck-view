import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker - use the built-in worker instead of CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

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
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('PDF loaded, number of pages:', pdf.numPages);
      
      const slides: SlideData[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        console.log('Processing page:', i);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        const imageUrl = canvas.toDataURL();
        
        // Extract text content
        try {
          const textContent = await page.getTextContent();
          const text = textContent.items.map((item: any) => item.str).join(' ');
          console.log('Extracted text length for page', i, ':', text.length);

          slides.push({
            slideNumber: i,
            imageUrl,
            text
          });
        } catch (textError) {
          console.warn('Failed to extract text from page', i, ':', textError);
          slides.push({
            slideNumber: i,
            imageUrl,
            text: ''
          });
        }
      }

      console.log('Successfully parsed', slides.length, 'slides');
      return slides;
    } catch (error) {
      console.error('Error parsing PDF:', error);
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
