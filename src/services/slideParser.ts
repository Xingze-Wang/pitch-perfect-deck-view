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
    console.log('=== STARTING PDF PARSING DEBUG ===');
    console.log('File name:', file.name);
    console.log('File size:', file.size, 'bytes');
    console.log('File type:', file.type);
    
    try {
      console.log('Step 1: Converting file to array buffer...');
      const arrayBuffer = await file.arrayBuffer();
      console.log('Array buffer created, size:', arrayBuffer.byteLength, 'bytes');
      
      console.log('Step 2: Loading PDF document...');
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 1 // Increase verbosity for debugging
      }).promise;
      
      console.log('PDF document loaded successfully!');
      console.log('Number of pages:', pdf.numPages);
      console.log('PDF info:', await pdf.getMetadata());
      
      const slides: SlideData[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`\n--- Processing page ${pageNum} ---`);
        
        try {
          console.log(`Loading page ${pageNum}...`);
          const page = await pdf.getPage(pageNum);
          console.log(`Page ${pageNum} loaded successfully`);
          
          // Get page dimensions
          const viewport = page.getViewport({ scale: 1.0 });
          console.log(`Page ${pageNum} dimensions:`, viewport.width, 'x', viewport.height);
          
          // Use higher scale for better quality
          const renderViewport = page.getViewport({ scale: 2.0 });
          console.log(`Render viewport for page ${pageNum}:`, renderViewport.width, 'x', renderViewport.height);
          
          console.log(`Creating canvas for page ${pageNum}...`);
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            throw new Error(`Could not get canvas context for page ${pageNum}`);
          }
          
          canvas.height = renderViewport.height;
          canvas.width = renderViewport.width;
          console.log(`Canvas created: ${canvas.width}x${canvas.height}`);
          
          // Set white background
          console.log(`Setting white background for page ${pageNum}...`);
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          const renderContext = {
            canvasContext: context,
            viewport: renderViewport,
            intent: 'display'
          };
          
          console.log(`Starting render for page ${pageNum}...`);
          const renderTask = page.render(renderContext);
          
          // Wait for the page to render completely
          await renderTask.promise;
          console.log(`Page ${pageNum} rendered successfully!`);
          
          // Convert to base64 data URL
          console.log(`Converting page ${pageNum} to image...`);
          const imageUrl = canvas.toDataURL('image/jpeg', 0.95);
          console.log(`Image created for page ${pageNum}, data URL length:`, imageUrl.length);
          console.log(`Image URL preview for page ${pageNum}:`, imageUrl.substring(0, 100) + '...');
          
          // Extract text content
          console.log(`Extracting text from page ${pageNum}...`);
          let extractedText = '';
          try {
            const textContent = await page.getTextContent();
            console.log(`Text content items for page ${pageNum}:`, textContent.items.length);
            
            extractedText = textContent.items
              .map((item: any) => {
                console.log('Text item:', item.str);
                return item.str || '';
              })
              .filter(str => str.trim().length > 0)
              .join(' ');
            
            console.log(`Extracted text from page ${pageNum} (${extractedText.length} chars):`, extractedText.substring(0, 200) + '...');
          } catch (textError) {
            console.warn(`Text extraction failed for page ${pageNum}:`, textError);
          }
          
          const slideData = {
            slideNumber: pageNum,
            imageUrl: imageUrl,
            text: extractedText
          };
          
          slides.push(slideData);
          console.log(`Slide ${pageNum} processed successfully and added to array`);
          console.log(`Current slides array length:`, slides.length);
          
        } catch (pageError) {
          console.error(`ERROR processing page ${pageNum}:`, pageError);
          console.error(`Page error stack:`, pageError.stack);
          // Continue with next page instead of failing completely
          continue;
        }
      }
      
      console.log('\n=== PDF PARSING COMPLETED ===');
      console.log('Total slides processed:', slides.length);
      console.log('Slides summary:', slides.map(s => ({ slideNumber: s.slideNumber, hasImage: s.imageUrl.length > 100, textLength: s.text?.length || 0 })));
      
      if (slides.length === 0) {
        console.error('NO SLIDES WERE SUCCESSFULLY PROCESSED!');
        throw new Error('No slides could be processed from the PDF');
      }
      
      return slides;
      
    } catch (error) {
      console.error('=== PDF PARSING FAILED COMPLETELY ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
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
