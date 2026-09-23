// ---------------------------------------------------------------------------
// Pure TypeScript GIF89a Animated GIF Encoder (Client-side, Zero-dependency)
// ---------------------------------------------------------------------------

export interface GifFrameOptions {
  /** Delay time in milliseconds for this frame (default: 100ms = 10fps) */
  delay?: number;
  /** Transparent color index if applicable (default: null) */
  transparentIndex?: number | null;
}

export interface GifEncoderOptions {
  width: number;
  height: number;
  /** Number of loops: 0 = infinite (default: 0) */
  repeat?: number;
}

/**
 * GIF89a Animated GIF Encoder
 * Encodes sequential RGBA ImageData frames into an animated GIF Blob.
 */
export class GifEncoder {
  private width: number;
  private height: number;
  private repeat: number;
  private frames: { data: Uint8ClampedArray; delay: number }[] = [];

  constructor(options: GifEncoderOptions) {
    this.width = Math.round(options.width);
    this.height = Math.round(options.height);
    this.repeat = options.repeat ?? 0;
  }

  /**
   * Add a frame from ImageData or Canvas context
   */
  public addFrame(imageData: ImageData, options: GifFrameOptions = {}): void {
    const delay = options.delay ?? 100; // in ms
    this.frames.push({
      data: new Uint8ClampedArray(imageData.data),
      delay,
    });
  }

  /**
   * Render all added frames into an animated GIF Blob
   */
  public render(): Blob {
    const buffer: number[] = [];

    // 1. Header: "GIF89a"
    this.writeString(buffer, "GIF89a");

    // 2. Logical Screen Descriptor
    this.writeLittleEndian16(buffer, this.width);
    this.writeLittleEndian16(buffer, this.height);
    // Packed field: Global Color Table Flag = 0 (we use Local Color Tables per frame for highest quality)
    // Color resolution = 7 (8 bits), Sort flag = 0, Size of global color table = 0
    buffer.push(0x70);
    buffer.push(0x00); // Background Color Index
    buffer.push(0x00); // Pixel Aspect Ratio

    // 3. Netscape 2.0 Loop Extension (for looping animation)
    if (this.repeat >= 0) {
      buffer.push(0x21); // Extension Introducer
      buffer.push(0xff); // Application Extension Label
      buffer.push(0x0b); // Block Size (11 bytes)
      this.writeString(buffer, "NETSCAPE2.0");
      buffer.push(0x03); // Sub-block Size (3 bytes)
      buffer.push(0x01); // Sub-block ID
      this.writeLittleEndian16(buffer, this.repeat); // Loop count (0 = infinite)
      buffer.push(0x00); // Block Terminator
    }

    // 4. Encode each frame
    for (const frame of this.frames) {
      this.encodeFrame(buffer, frame.data, frame.delay);
    }

    // 5. Trailer
    buffer.push(0x3b); // Trailer byte ';'

    return new Blob([new Uint8Array(buffer)], { type: "image/gif" });
  }

  /**
   * Quantizes frame to 256 colors, writes Graphic Control Extension,
   * Local Color Table, Image Descriptor, and LZW compressed data.
   */
  private encodeFrame(buffer: number[], rgba: Uint8ClampedArray, delayMs: number): void {
    const { palette, indexedPixels } = this.quantizeFrame(rgba);

    // Graphic Control Extension
    buffer.push(0x21); // Extension Introducer
    buffer.push(0xf9); // Graphic Control Label
    buffer.push(0x04); // Block Size (4 bytes)

    // Packed field: Disposal Method (2 = restore to background), User Input = 0, Transparent Color = 0
    buffer.push(0x08);
    // Delay time in 1/100ths of a second
    const delayHundredths = Math.max(2, Math.round(delayMs / 10));
    this.writeLittleEndian16(buffer, delayHundredths);
    buffer.push(0x00); // Transparent Color Index
    buffer.push(0x00); // Block Terminator

    // Image Descriptor
    buffer.push(0x2c); // Image Separator
    this.writeLittleEndian16(buffer, 0); // Image Left
    this.writeLittleEndian16(buffer, 0); // Image Top
    this.writeLittleEndian16(buffer, this.width); // Image Width
    this.writeLittleEndian16(buffer, this.height); // Image Height

    // Packed fields: Local Color Table Flag (1), Interlace (0), Sort (0), Size (7 = 2^(7+1) = 256 colors)
    buffer.push(0x87);

    // Write 256 RGB colors (768 bytes)
    for (let i = 0; i < 256; i++) {
      if (i < palette.length) {
        buffer.push(palette[i][0]);
        buffer.push(palette[i][1]);
        buffer.push(palette[i][2]);
      } else {
        buffer.push(0, 0, 0);
      }
    }

    // LZW compression
    const minCodeSize = 8; // 256 colors = 8 bits
    buffer.push(minCodeSize);
    this.lzwCompress(buffer, indexedPixels, minCodeSize);
    buffer.push(0x00); // Block Terminator
  }

  /**
   * Color quantization: builds a 256-color palette from the RGBA frame using
   * uniform/median-cut buckets and maps every pixel to the closest palette index.
   */
  private quantizeFrame(rgba: Uint8ClampedArray): {
    palette: [number, number, number][];
    indexedPixels: Uint8Array;
  } {
    const pixelCount = this.width * this.height;
    const indexedPixels = new Uint8Array(pixelCount);

    // Sample pixels to build histogram / color bins
    const step = Math.max(1, Math.floor(pixelCount / 10000));
    const samples: [number, number, number][] = [];
    for (let i = 0; i < pixelCount; i += step) {
      const idx = i * 4;
      samples.push([rgba[idx], rgba[idx + 1], rgba[idx + 2]]);
    }

    // Median-cut algorithm to extract 256 colors
    const palette = this.medianCut(samples, 256);

    // Pre-cache palette lookup with color indexing
    for (let i = 0; i < pixelCount; i++) {
      const r = rgba[i * 4];
      const g = rgba[i * 4 + 1];
      const b = rgba[i * 4 + 2];
      indexedPixels[i] = this.findNearestColor(r, g, b, palette);
    }

    return { palette, indexedPixels };
  }

  private medianCut(colors: [number, number, number][], targetCount: number): [number, number, number][] {
    if (colors.length === 0) return [[0, 0, 0]];
    let boxes: [number, number, number][][] = [colors];

    while (boxes.length < targetCount) {
      let maxRange = -1;
      let boxToSplit = -1;
      let splitChannel = 0;

      for (let b = 0; b < boxes.length; b++) {
        const box = boxes[b];
        if (box.length <= 1) continue;

        let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
        for (const c of box) {
          if (c[0] < minR) minR = c[0];
          if (c[0] > maxR) maxR = c[0];
          if (c[1] < minG) minG = c[1];
          if (c[1] > maxG) maxG = c[1];
          if (c[2] < minB) minB = c[2];
          if (c[2] > maxB) maxB = c[2];
        }

        const rangeR = maxR - minR;
        const rangeG = maxG - minG;
        const rangeB = maxB - minB;
        const range = Math.max(rangeR, rangeG, rangeB);

        if (range > maxRange) {
          maxRange = range;
          boxToSplit = b;
          splitChannel = rangeR >= rangeG && rangeR >= rangeB ? 0 : rangeG >= rangeB ? 1 : 2;
        }
      }

      if (boxToSplit === -1) break;

      const target = boxes[boxToSplit];
      target.sort((a, b) => a[splitChannel] - b[splitChannel]);
      const median = Math.floor(target.length / 2);
      const left = target.slice(0, median);
      const right = target.slice(median);

      boxes.splice(boxToSplit, 1, left, right);
    }

    return boxes.map((box) => {
      let sumR = 0, sumG = 0, sumB = 0;
      for (const c of box) {
        sumR += c[0];
        sumG += c[1];
        sumB += c[2];
      }
      const count = box.length || 1;
      return [
        Math.round(sumR / count),
        Math.round(sumG / count),
        Math.round(sumB / count),
      ] as [number, number, number];
    });
  }

  private findNearestColor(
    r: number,
    g: number,
    b: number,
    palette: [number, number, number][]
  ): number {
    let bestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < palette.length; i++) {
      const p = palette[i];
      // Euclidean squared distance with perceptual weighting
      const dr = r - p[0];
      const dg = g - p[1];
      const db = b - p[2];
      const distance = dr * dr * 0.299 + dg * dg * 0.587 + db * db * 0.114;

      if (distance < minDistance) {
        minDistance = distance;
        bestIdx = i;
        if (distance === 0) break;
      }
    }

    return bestIdx;
  }

  /**
   * LZW compression for GIF
   */
  private lzwCompress(buffer: number[], pixels: Uint8Array, minCodeSize: number): void {
    const clearCode = 1 << minCodeSize;
    const eoiCode = clearCode + 1;

    let codeSize = minCodeSize + 1;
    let nextCode = eoiCode + 1;
    const maxCode = 4096;

    // Fast hash table for LZW string table
    const table = new Map<number, number>();

    const subBlock: number[] = [];
    let curBits = 0;
    let curVal = 0;

    const emitBits = (code: number, bits: number) => {
      curVal |= code << curBits;
      curBits += bits;
      while (curBits >= 8) {
        subBlock.push(curVal & 0xff);
        curVal >>= 8;
        curBits -= 8;
        if (subBlock.length === 255) {
          buffer.push(255);
          for (let b = 0; b < 255; b++) buffer.push(subBlock[b]);
          subBlock.length = 0;
        }
      }
    };

    const flushBits = () => {
      if (curBits > 0) {
        subBlock.push(curVal & 0xff);
      }
      if (subBlock.length > 0) {
        buffer.push(subBlock.length);
        for (let b = 0; b < subBlock.length; b++) buffer.push(subBlock[b]);
        subBlock.length = 0;
      }
    };

    // Emit initial Clear Code
    emitBits(clearCode, codeSize);

    if (pixels.length === 0) {
      emitBits(eoiCode, codeSize);
      flushBits();
      return;
    }

    let prefix = pixels[0];

    for (let i = 1; i < pixels.length; i++) {
      const suffix = pixels[i];
      const key = (prefix << 8) | suffix;
      const code = table.get(key);

      if (code !== undefined) {
        prefix = code;
      } else {
        emitBits(prefix, codeSize);

        if (nextCode < maxCode) {
          table.set(key, nextCode++);
          if (nextCode > (1 << codeSize) && codeSize < 12) {
            codeSize++;
          }
        } else {
          // Table full: clear table
          emitBits(clearCode, codeSize);
          table.clear();
          codeSize = minCodeSize + 1;
          nextCode = eoiCode + 1;
        }

        prefix = suffix;
      }
    }

    emitBits(prefix, codeSize);
    emitBits(eoiCode, codeSize);
    flushBits();
  }

  private writeString(buffer: number[], str: string): void {
    for (let i = 0; i < str.length; i++) {
      buffer.push(str.charCodeAt(i));
    }
  }

  private writeLittleEndian16(buffer: number[], value: number): void {
    buffer.push(value & 0xff);
    buffer.push((value >> 8) & 0xff);
  }
}

/**
 * Convenience helper to convert an array of ImageData frames into an animated GIF Blob.
 */
export function encodeGif(
  frames: ImageData[],
  options: { width: number; height: number; fps?: number; repeat?: number }
): Blob {
  const encoder = new GifEncoder({
    width: options.width,
    height: options.height,
    repeat: options.repeat ?? 0,
  });

  const delay = Math.round(1000 / (options.fps ?? 10));
  for (const frame of frames) {
    encoder.addFrame(frame, { delay });
  }

  return encoder.render();
}
