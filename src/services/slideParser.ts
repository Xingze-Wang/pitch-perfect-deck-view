import * as pdfjsLib from 'pdfjs-dist';

// Set worker source to match the API version 5.2.133
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.2.133/pdf.worker.min.js';

export interface SlideData {
  slideNumber: number;
  imageUrl: string;
  text?: string;
}

export class SlideParser {
  static async parsePDF(file: File): Promise<SlideData[]> {
    console.log('🚀 ===== PDF PARSING START =====');
    console.log('📁 File received:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    });
    
    try {
      console.log('🔄 STEP 1: Converting file to ArrayBuffer...');
      const arrayBuffer = await file.arrayBuffer();
      console.log('✅ ArrayBuffer created successfully:', {
        byteLength: arrayBuffer.byteLength,
        isValid: arrayBuffer.byteLength > 0
      });
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error('File is empty or corrupted');
      }
      
      console.log('🔄 STEP 2: Initializing PDF.js worker...');
      console.log('🔧 Worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
      
      console.log('🔄 STEP 3: Loading PDF document...');
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 2,
        enableXfa: false
      });
      
      console.log('📋 Loading task created:', {
        docId: loadingTask.docId,
        destroyed: loadingTask.destroyed
      });
      
      const pdf = await loadingTask.promise;
      console.log('✅ PDF loaded successfully!', {
        numPages: pdf.numPages,
        fingerprints: (pdf as any).fingerprints || 'N/A'
      });
      
      // Get and log PDF metadata
      try {
        console.log('🔄 Getting PDF metadata...');
        const metadata = await pdf.getMetadata();
        const info = metadata.info as any;
        console.log('📊 PDF Metadata:', {
          title: info?.Title || 'N/A',
          creator: info?.Creator || 'N/A',
          producer: info?.Producer || 'N/A',
          creationDate: info?.CreationDate || 'N/A'
        });
      } catch (metaError) {
        console.warn('⚠️ Metadata extraction failed:', metaError);
      }
      
      const slides: SlideData[] = [];
      const maxPages = Math.min(pdf.numPages, 5); // Process max 5 pages for debugging
      
      console.log(`🔄 Will process ${maxPages} pages out of ${pdf.numPages} total pages`);

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        console.log(`\n📄 ===== PROCESSING PAGE ${pageNum}/${maxPages} =====`);
        
        try {
          console.log(`🔄 Loading page ${pageNum}...`);
          const page = await pdf.getPage(pageNum);
          console.log(`✅ Page ${pageNum} loaded`, {
            pageIndex: (page as any)._pageIndex || 'N/A',
            pageNumber: page.pageNumber
          });
          
          // Get viewport information
          console.log(`🔄 Getting viewport for page ${pageNum}...`);
          const viewport = page.getViewport({ scale: 1.0 });
          console.log(`📐 Viewport for page ${pageNum}:`, {
            width: viewport.width,
            height: viewport.height,
            rotation: viewport.rotation,
            transform: viewport.transform
          });
          
          // Extract text content
          console.log(`🔄 Extracting text from page ${pageNum}...`);
          let textContent = '';
          try {
            const textData = await page.getTextContent();
            console.log(`📝 Text extraction for page ${pageNum}:`, {
              itemsCount: textData.items.length,
              stylesCount: Object.keys(textData.styles || {}).length
            });
            
            textContent = textData.items
              .map((item: any) => {
                console.log(`📝 Text item:`, {
                  str: item.str?.substring(0, 50) + '...',
                  x: item.transform?.[4],
                  y: item.transform?.[5]
                });
                return item.str || '';
              })
              .filter(str => str.trim().length > 0)
              .join(' ');
            
            console.log(`📝 Final text for page ${pageNum}:`, {
              length: textContent.length,
              preview: textContent.substring(0, 100) + '...'
            });
          } catch (textError) {
            console.error(`❌ Text extraction failed for page ${pageNum}:`, textError);
          }
          
          // Create canvas
          console.log(`🎨 Creating canvas for page ${pageNum}...`);
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            throw new Error(`Canvas context is null for page ${pageNum}`);
          }
          
          console.log(`✅ Canvas context created for page ${pageNum}`);
          
          // Set canvas dimensions
          const scale = 1.5;
          const renderViewport = page.getViewport({ scale });
          
          canvas.width = renderViewport.width;
          canvas.height = renderViewport.height;
          
          console.log(`🎨 Canvas configured for page ${pageNum}:`, {
            width: canvas.width,
            height: canvas.height,
            scale: scale
          });
          
          // Clear canvas
          console.log(`🎨 Clearing canvas for page ${pageNum}...`);
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          console.log(`✅ Canvas cleared for page ${pageNum}`);
          
          // Render page
          console.log(`🖼️ Starting render for page ${pageNum}...`);
          const renderContext = {
            canvasContext: context,
            viewport: renderViewport,
            intent: 'display' as const
          };
          
          const renderTask = page.render(renderContext);
          console.log(`🖼️ Render task created for page ${pageNum}`);
          
          // Add timeout and detailed error handling
          const renderPromise = Promise.race([
            renderTask.promise.then(() => {
              console.log(`✅ Render completed successfully for page ${pageNum}`);
              return true;
            }).catch((renderError) => {
              console.error(`❌ Render promise failed for page ${pageNum}:`, renderError);
              throw renderError;
            }),
            new Promise((_, reject) => 
              setTimeout(() => {
                console.error(`⏰ Render timeout for page ${pageNum}`);
                reject(new Error(`Render timeout for page ${pageNum}`));
              }, 30000)
            )
          ]);
          
          await renderPromise;
          console.log(`✅ Page ${pageNum} rendered to canvas successfully`);
          
          // Convert to image
          console.log(`🖼️ Converting page ${pageNum} to data URL...`);
          const imageUrl = canvas.toDataURL('image/png', 0.9);
          
          console.log(`🖼️ Image conversion for page ${pageNum}:`, {
            dataUrlLength: imageUrl.length,
            startsWithPng: imageUrl.startsWith('data:image/png'),
            preview: imageUrl.substring(0, 50) + '...'
          });
          
          // Validate image
          if (imageUrl.length < 1000) {
            console.error(`❌ Generated image too small for page ${pageNum}:`, imageUrl.length);
            throw new Error(`Generated image is too small for page ${pageNum}`);
          }
          
          const slideData: SlideData = {
            slideNumber: pageNum,
            imageUrl: imageUrl,
            text: textContent
          };
          
          slides.push(slideData);
          console.log(`✅ Slide ${pageNum} added to results. Current slides count:`, slides.length);
          
        } catch (pageError) {
          console.error(`💥 CRITICAL ERROR processing page ${pageNum}:`, {
            errorName: pageError.name,
            errorMessage: pageError.message,
            errorStack: pageError.stack,
            errorConstructor: pageError.constructor.name
          });
          
          // Continue with other pages instead of stopping
          console.log(`⏭️ Continuing to next page after error on page ${pageNum}`);
        }
      }
      
      console.log('\n🎉 ===== PDF PARSING COMPLETED =====');
      console.log('📊 Final results:', {
        totalSlides: slides.length,
        slideNumbers: slides.map(s => s.slideNumber),
        imageSizes: slides.map(s => s.imageUrl.length),
        hasAnySlides: slides.length > 0
      });
      
      if (slides.length === 0) {
        console.error('💥 FATAL: No slides were successfully processed!');
        throw new Error('No slides could be processed from the PDF. Check console for detailed error logs.');
      }
      
      return slides;
      
    } catch (error) {
      console.error('💥 ===== COMPLETE PDF PARSING FAILURE =====');
      console.error('🔍 Error details:', {
        errorType: error.constructor.name,
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString()
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
