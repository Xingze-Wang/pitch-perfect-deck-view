
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
    console.log('🔍 === ENHANCED PDF PARSING DEBUG ===');
    console.log('📄 File details:', { name: file.name, size: file.size, type: file.type });
    
    try {
      console.log('⏳ Step 1: Converting file to array buffer...');
      const arrayBuffer = await file.arrayBuffer();
      console.log('✅ Array buffer created:', arrayBuffer.byteLength, 'bytes');
      
      console.log('⏳ Step 2: Loading PDF document...');
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 2 // Maximum verbosity for debugging
      }).promise;
      
      console.log('✅ PDF loaded! Pages:', pdf.numPages);
      
      // Get PDF metadata for debugging
      try {
        const metadata = await pdf.getMetadata();
        console.log('📊 PDF Metadata:', metadata);
      } catch (metaError) {
        console.warn('⚠️ Could not get metadata:', metaError);
      }
      
      const slides: SlideData[] = [];

      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 3); pageNum++) { // Limit to first 3 pages for debugging
        console.log(`\n🔄 === PROCESSING PAGE ${pageNum} ===`);
        
        try {
          console.log(`⏳ Loading page ${pageNum}...`);
          const page = await pdf.getPage(pageNum);
          console.log(`✅ Page ${pageNum} loaded successfully`);
          
          // Get page info
          const viewport = page.getViewport({ scale: 1.0 });
          console.log(`📐 Page ${pageNum} viewport:`, { width: viewport.width, height: viewport.height });
          
          // Check if page has content
          console.log(`🔍 Checking page ${pageNum} content...`);
          
          // Try to get text content first
          let textContent = '';
          try {
            const textData = await page.getTextContent();
            console.log(`📝 Text items found on page ${pageNum}:`, textData.items.length);
            textContent = textData.items
              .map((item: any) => item.str || '')
              .filter(str => str.trim().length > 0)
              .join(' ');
            console.log(`📝 Extracted text (${textContent.length} chars):`, textContent.substring(0, 100) + '...');
          } catch (textError) {
            console.warn(`⚠️ Text extraction failed for page ${pageNum}:`, textError);
          }
          
          // Create canvas for rendering
          console.log(`🎨 Creating canvas for page ${pageNum}...`);
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            throw new Error(`❌ Could not get canvas context for page ${pageNum}`);
          }
          
          // Use moderate scale for better performance
          const scale = 1.5;
          const renderViewport = page.getViewport({ scale });
          
          canvas.width = renderViewport.width;
          canvas.height = renderViewport.height;
          console.log(`🎨 Canvas dimensions: ${canvas.width}x${canvas.height}`);
          
          // Clear canvas with white background
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          console.log(`🎨 Canvas prepared with white background`);
          
          // Render the page
          console.log(`⏳ Starting render for page ${pageNum}...`);
          const renderContext = {
            canvasContext: context,
            viewport: renderViewport,
            intent: 'display' as const
          };
          
          const renderTask = page.render(renderContext);
          
          // Add timeout to render task
          const renderPromise = Promise.race([
            renderTask.promise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Render timeout')), 30000)
            )
          ]);
          
          await renderPromise;
          console.log(`✅ Page ${pageNum} rendered successfully!`);
          
          // Convert to image
          console.log(`🖼️ Converting page ${pageNum} to image...`);
          const imageUrl = canvas.toDataURL('image/png', 0.9);
          
          // Validate image
          if (imageUrl.length < 1000) {
            console.error(`❌ Image too small for page ${pageNum}:`, imageUrl.length, 'chars');
            throw new Error('Generated image is too small');
          }
          
          console.log(`✅ Image created for page ${pageNum}:`, imageUrl.length, 'chars');
          console.log(`🖼️ Image preview:`, imageUrl.substring(0, 50) + '...');
          
          const slideData: SlideData = {
            slideNumber: pageNum,
            imageUrl: imageUrl,
            text: textContent
          };
          
          slides.push(slideData);
          console.log(`✅ Slide ${pageNum} added to results. Total slides:`, slides.length);
          
        } catch (pageError) {
          console.error(`❌ CRITICAL ERROR processing page ${pageNum}:`, pageError);
          console.error(`🔍 Error details:`, {
            name: pageError.name,
            message: pageError.message,
            stack: pageError.stack
          });
          // Don't throw here, continue with other pages
        }
      }
      
      console.log('\n🎉 === PDF PARSING COMPLETED ===');
      console.log('📊 Final results:', {
        totalSlides: slides.length,
        slideNumbers: slides.map(s => s.slideNumber),
        imageSizes: slides.map(s => s.imageUrl.length)
      });
      
      if (slides.length === 0) {
        console.error('💥 FATAL: No slides were successfully processed!');
        throw new Error('No slides could be processed from the PDF. The file might be corrupted or empty.');
      }
      
      return slides;
      
    } catch (error) {
      console.error('💥 === COMPLETE PDF PARSING FAILURE ===');
      console.error('🔍 Error details:', {
        type: error.constructor.name,
        message: error.message,
        stack: error.stack
      });
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
