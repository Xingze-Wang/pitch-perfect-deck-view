
export interface SlideData {
  slideNumber: number;
  imageUrl?: string;
  text?: string;
  pdfUrl?: string; // For native PDF viewing
}

export class SlideParser {
  static async parseFile(file: File): Promise<SlideData[]> {
    console.log('🔍 SlideParser.parseFile - Starting to parse file:', file.name);
    console.log('🔍 SlideParser.parseFile - File type:', file.type);
    console.log('🔍 SlideParser.parseFile - File size:', file.size);
    
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      console.log('🔍 SlideParser.parseFile - Identified as PDF, calling parsePDF');
      return await this.parsePDF(file);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      fileType === 'application/vnd.ms-powerpoint' ||
      fileName.endsWith('.pptx') ||
      fileName.endsWith('.ppt')
    ) {
      console.log('🔍 SlideParser.parseFile - Identified as PowerPoint, calling parsePowerPoint');
      return await this.parsePowerPoint(file);
    } else {
      console.error('❌ SlideParser.parseFile - Unsupported file type:', fileType);
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  static async parsePDF(file: File): Promise<SlideData[]> {
    console.log('🚀 SlideParser.parsePDF - ENTRY POINT - Starting PDF parsing for:', file.name);
    console.log('🚀 SlideParser.parsePDF - File size:', file.size, 'bytes');
    
    try {
      console.log('🔍 SlideParser.parsePDF - Step 1: Importing PDF.js...');
      
      // Import PDF.js dynamically
      const pdfjsLib = await import('pdfjs-dist');
      console.log('✅ SlideParser.parsePDF - Step 1: PDF.js imported successfully');
      console.log('🔍 SlideParser.parsePDF - PDF.js version:', pdfjsLib.version);
      
      console.log('🔍 SlideParser.parsePDF - Step 2: Setting worker source...');
      // Set worker source to match the installed pdfjs-dist version (5.3.31)
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.js`;
      console.log('✅ SlideParser.parsePDF - Step 2: Worker source set to:', pdfjsLib.GlobalWorkerOptions.workerSrc);
      
      console.log('🔍 SlideParser.parsePDF - Step 3: Converting file to ArrayBuffer...');
      const arrayBuffer = await file.arrayBuffer();
      console.log('✅ SlideParser.parsePDF - Step 3: ArrayBuffer created, size:', arrayBuffer.byteLength);
      
      console.log('🔍 SlideParser.parsePDF - Step 4: Creating Uint8Array...');
      const typedArray = new Uint8Array(arrayBuffer);
      console.log('✅ SlideParser.parsePDF - Step 4: Uint8Array created, length:', typedArray.length);
      
      console.log('🔍 SlideParser.parsePDF - Step 5: Loading PDF document...');
      const loadingTask = pdfjsLib.getDocument(typedArray);
      console.log('🔍 SlideParser.parsePDF - Loading task created:', !!loadingTask);
      
      const pdf = await loadingTask.promise;
      console.log('✅ SlideParser.parsePDF - Step 5: PDF document loaded successfully!');
      
      const totalPages = pdf.numPages;
      console.log('🎯 SlideParser.parsePDF - CRITICAL: Total pages detected:', totalPages);
      console.log('🎯 SlideParser.parsePDF - CRITICAL: PDF fingerprint:', pdf.fingerprints);
      
      const slides: SlideData[] = [];
      console.log('🔍 SlideParser.parsePDF - Step 6: Starting page processing loop...');
      
      // Render each page to canvas and extract as image
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        console.log(`🔄 SlideParser.parsePDF - Processing page ${pageNumber}/${totalPages}`);
        
        try {
          console.log(`🔍 SlideParser.parsePDF - Page ${pageNumber}: Getting page object...`);
          const page = await pdf.getPage(pageNumber);
          console.log(`✅ SlideParser.parsePDF - Page ${pageNumber}: Page object retrieved`);
          
          console.log(`🔍 SlideParser.parsePDF - Page ${pageNumber}: Extracting text content...`);
          // Extract text content from the page
          const textContent = await page.getTextContent();
          const text = textContent.items
            .map((item: any) => item.str)
            .join(' ')
            .trim();
          console.log(`✅ SlideParser.parsePDF - Page ${pageNumber}: Text extracted (${text.length} chars)`);
          
          console.log(`🔍 SlideParser.parsePDF - Page ${pageNumber}: Creating canvas...`);
          // Create canvas and render the page
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          const viewport = page.getViewport({ scale: 1.5 });
          console.log(`✅ SlideParser.parsePDF - Page ${pageNumber}: Canvas created, viewport: ${viewport.width}x${viewport.height}`);
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          
          console.log(`🔍 SlideParser.parsePDF - Page ${pageNumber}: Rendering to canvas...`);
          // Render the page to canvas
          await page.render(renderContext).promise;
          console.log(`✅ SlideParser.parsePDF - Page ${pageNumber}: Rendered to canvas successfully`);
          
          console.log(`🔍 SlideParser.parsePDF - Page ${pageNumber}: Converting to image...`);
          // Convert canvas to image URL
          const imageUrl = canvas.toDataURL('image/jpeg', 0.95);
          console.log(`✅ SlideParser.parsePDF - Page ${pageNumber}: Image URL created (${imageUrl.length} chars)`);
          
          const slideData = {
            slideNumber: pageNumber,
            imageUrl: imageUrl,
            text: text || `Page ${pageNumber} content`
          };
          
          slides.push(slideData);
          console.log(`🎯 SlideParser.parsePDF - Page ${pageNumber}: Added to slides array! Total slides now: ${slides.length}`);
          
        } catch (pageError) {
          console.error(`❌ SlideParser.parsePDF - Page ${pageNumber}: Error processing page:`, pageError);
          // Continue with next page instead of failing completely
        }
      }
      
      console.log('🎉 SlideParser.parsePDF - FINAL RESULT:');
      console.log('🎉 SlideParser.parsePDF - Total slides created:', slides.length);
      console.log('🎉 SlideParser.parsePDF - PDF pages detected:', totalPages);
      console.log('🎉 SlideParser.parsePDF - First slide preview:', slides[0] ? {
        slideNumber: slides[0].slideNumber,
        hasImage: !!slides[0].imageUrl,
        imageLength: slides[0].imageUrl?.length || 0,
        textLength: slides[0].text?.length || 0
      } : 'No slides created');
      
      return slides;
    } catch (error) {
      console.error('💥 SlideParser.parsePDF - CATASTROPHIC ERROR:', error);
      console.error('💥 SlideParser.parsePDF - Error name:', error.name);
      console.error('💥 SlideParser.parsePDF - Error message:', error.message);
      console.error('💥 SlideParser.parsePDF - Error stack:', error.stack);
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
