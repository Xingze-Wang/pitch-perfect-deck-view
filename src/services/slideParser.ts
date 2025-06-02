
export interface SlideData {
  slideNumber: number;
  imageUrl?: string;
  text?: string;
  pdfUrl?: string; // For native PDF viewing
}

export class SlideParser {
  static async parseFile(file: File): Promise<SlideData[]> {
    console.log('🔍 SlideParser.parseFile - Starting to parse file:', file.name);
    
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
      console.log('🔍 SlideParser.parsePDF - Starting PDF parsing for:', file.name);
      
      // Import PDF.js dynamically
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source to match the installed pdfjs-dist version (5.3.31)
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);
      
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      const totalPages = pdf.numPages;
      const slides: SlideData[] = [];
      
      console.log('🔍 SlideParser.parsePDF - PDF loaded successfully');
      console.log('🔍 SlideParser.parsePDF - Total pages detected:', totalPages);
      console.log('🔍 SlideParser.parsePDF - About to loop through pages...');
      
      // Render each page to canvas and extract as image
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        console.log(`🔍 SlideParser.parsePDF - Processing page ${pageNumber} of ${totalPages}`);
        
        const page = await pdf.getPage(pageNumber);
        
        // Extract text content from the page
        const textContent = await page.getTextContent();
        const text = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .trim();
        
        // Create canvas and render the page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        const viewport = page.getViewport({ scale: 1.5 });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        // Render the page to canvas
        await page.render(renderContext).promise;
        
        // Convert canvas to image URL
        const imageUrl = canvas.toDataURL('image/jpeg', 0.95);
        
        const slideData = {
          slideNumber: pageNumber,
          imageUrl: imageUrl,
          text: text || `Page ${pageNumber} content`
        };
        
        slides.push(slideData);
        console.log(`🔍 SlideParser.parsePDF - Added slide ${pageNumber}, slides array length now:`, slides.length);
      }
      
      console.log('🔍 SlideParser.parsePDF - FINAL RESULT:');
      console.log('🔍 SlideParser.parsePDF - Total slides created:', slides.length);
      console.log('🔍 SlideParser.parsePDF - PDF pages detected:', totalPages);
      console.log('🔍 SlideParser.parsePDF - Slides array:', slides.map(s => `Slide ${s.slideNumber}`));
      
      return slides;
    } catch (error) {
      console.error('❌ SlideParser.parsePDF - Error parsing PDF:', error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  static async parsePowerPoint(file: File): Promise<SlideData[]> {
    try {
      console.log('🔍 SlideParser.parsePowerPoint - Starting PowerPoint parsing for:', file.name);
      
      const PizZip = (await import('pizzip')).default;
      
      const arrayBuffer = await file.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const slides: SlideData[] = [];

      const slideFiles = Object.keys(zip.files)
        .filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
        .sort((a, b) => {
          const aNum = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
          const bNum = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
          return aNum - bNum;
        });

      console.log('🔍 SlideParser.parsePowerPoint - Found slide files:', slideFiles.length);

      for (let i = 0; i < slideFiles.length; i++) {
        const slideFile = slideFiles[i];
        const slideData = zip.file(slideFile)?.asText();
        
        if (slideData) {
          const textMatches = slideData.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
          const text = textMatches
            .map(match => match.replace(/<\/?[^>]+(>|$)/g, ''))
            .join(' ')
            .trim();

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
            text: text || `Slide ${i + 1} content`
          });
        }
      }

      console.log('🔍 SlideParser.parsePowerPoint - FINAL RESULT:');
      console.log('🔍 SlideParser.parsePowerPoint - Total slides created:', slides.length);
      
      return slides;
    } catch (error) {
      console.error('❌ SlideParser.parsePowerPoint - Error parsing PowerPoint:', error);
      throw new Error(`Failed to parse PowerPoint: ${error.message}`);
    }
  }
}
