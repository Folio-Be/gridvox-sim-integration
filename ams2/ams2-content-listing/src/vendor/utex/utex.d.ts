/**
 * TypeScript definitions for UTEX.js and UTEX.DDS.js
 * Library for working with compressed textures (DDS files)
 * Source: https://github.com/photopea/UTEX.js/
 */

declare namespace UTEX {
  /**
   * DDS file format utilities
   */
  namespace DDS {
    /**
     * Decoded image data from DDS file
     */
    interface ImageData {
      /** Image width in pixels */
      width: number;
      /** Image height in pixels */
      height: number;
      /** RGBA8 pixel data (4 bytes per pixel) */
      image: ArrayBuffer;
    }

    /**
     * Decode a DDS file to RGBA8 pixel data
     * @param buff ArrayBuffer containing DDS file data
     * @returns Array of images (mipmaps), index 0 is the main image
     */
    function decode(buff: ArrayBuffer): ImageData[];

    /**
     * Encode RGBA8 pixel data to DDS file
     * @param img ArrayBuffer containing RGBA8 pixel data
     * @param w Image width
     * @param h Image height
     * @returns ArrayBuffer containing DDS file data
     */
    function encode(img: ArrayBuffer, w: number, h: number): ArrayBuffer;
  }

  /**
   * Low-level BC1 (DXT1) decompression
   */
  function readBC1(
    data: Uint8Array,
    offset: number,
    img: Uint8Array,
    w: number,
    h: number
  ): number;

  /**
   * Low-level BC2 (DXT3) decompression
   */
  function readBC2(
    data: Uint8Array,
    offset: number,
    img: Uint8Array,
    w: number,
    h: number
  ): number;

  /**
   * Low-level BC3 (DXT5) decompression
   */
  function readBC3(
    data: Uint8Array,
    offset: number,
    img: Uint8Array,
    w: number,
    h: number
  ): number;

  /**
   * Low-level BC7 decompression
   */
  function readBC7(
    data: Uint8Array,
    offset: number,
    img: Uint8Array,
    w: number,
    h: number
  ): number;

  /**
   * Low-level ATC (ATI Texture Compression) decompression
   */
  function readATC(
    data: Uint8Array,
    offset: number,
    img: Uint8Array,
    w: number,
    h: number
  ): number;

  /**
   * Low-level BC1 (DXT1) compression
   */
  function writeBC1(
    img: Uint8Array,
    w: number,
    h: number,
    data: Uint8Array,
    offset: number
  ): number;

  /**
   * Low-level BC3 (DXT5) compression
   */
  function writeBC3(
    img: Uint8Array,
    w: number,
    h: number,
    data: Uint8Array,
    offset: number
  ): number;
}

declare module 'utex' {
  export = UTEX;
}
