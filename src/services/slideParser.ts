import * as pdfjsLib from 'pdfjs-dist';

// Use a more reliable worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js';

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
      console.log('File size:', arrayBuffer.byteLength, 'bytes');
      
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0 // Reduce console noise
      }).promise;
      
      console.log('PDF loaded, pages:', pdf.numPages);
      const slides: SlideData[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`Processing page ${pageNum}/${pdf.numPages}`);
        
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          console.error('Could not get canvas context for page', pageNum);
          continue;
        }
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // White background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Render the page
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        console.log(`Page ${pageNum} rendered successfully`);
        
        // Convert to image
        const imageUrl = canvas.toDataURL('image/png', 0.9);
        
        // Extract text
        let extractedText = '';
        try {
          const textContent = await page.getTextContent();
          extractedText = textContent.items
            .map((item: any) => item.str || '')
            .filter(str => str.trim().length > 0)
            .join(' ');
          console.log(`Page ${pageNum} text extracted:`, extractedText.substring(0, 100) + '...');
        } catch (textError) {
          console.warn(`Failed to extract text from page ${pageNum}:`, textError);
        }
        
        slides.push({
          slideNumber: pageNum,
          imageUrl: imageUrl,
          text: extractedText
        });
      }
      
      console.log('Successfully parsed', slides.length, 'slides');
      return slides;
      
    } catch (error) {
      console.error('PDF parsing failed:', error);
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
